"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { personSchema } from "@/lib/validators";
import type { ActionState } from "@/actions/auth";

function emptyToNull(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function createPersonAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = personSchema.safeParse({
    firstName: formData.get("firstName"),
    middleName: formData.get("middleName") || undefined,
    lastName: formData.get("lastName"),
    gender: formData.get("gender") || undefined,
    birthDate: formData.get("birthDate") || undefined,
    deathDate: formData.get("deathDate") || undefined,
    birthPlace: formData.get("birthPlace") || undefined,
    deathPlace: formData.get("deathPlace") || undefined,
    occupation: formData.get("occupation") || undefined,
    biography: formData.get("biography") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const person = await prisma.person.create({
    data: {
      ownerId: user.id,
      firstName: parsed.data.firstName,
      middleName: emptyToNull(parsed.data.middleName),
      lastName: parsed.data.lastName,
      gender: emptyToNull(parsed.data.gender),
      birthDate: emptyToNull(parsed.data.birthDate),
      deathDate: emptyToNull(parsed.data.deathDate),
      birthPlace: emptyToNull(parsed.data.birthPlace),
      deathPlace: emptyToNull(parsed.data.deathPlace),
      occupation: emptyToNull(parsed.data.occupation),
      biography: emptyToNull(parsed.data.biography),
    },
  });

  revalidatePath("/people");
  revalidatePath("/dashboard");
  redirect(`/people/${person.id}`);
}

export async function updatePersonAction(
  personId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = personSchema.safeParse({
    firstName: formData.get("firstName"),
    middleName: formData.get("middleName") || undefined,
    lastName: formData.get("lastName"),
    gender: formData.get("gender") || undefined,
    birthDate: formData.get("birthDate") || undefined,
    deathDate: formData.get("deathDate") || undefined,
    birthPlace: formData.get("birthPlace") || undefined,
    deathPlace: formData.get("deathPlace") || undefined,
    occupation: formData.get("occupation") || undefined,
    biography: formData.get("biography") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.person.findFirst({
    where: { id: personId, ownerId: user.id },
  });
  if (!existing) return { error: "Person not found" };

  await prisma.person.update({
    where: { id: personId },
    data: {
      firstName: parsed.data.firstName,
      middleName: emptyToNull(parsed.data.middleName),
      lastName: parsed.data.lastName,
      gender: emptyToNull(parsed.data.gender),
      birthDate: emptyToNull(parsed.data.birthDate),
      deathDate: emptyToNull(parsed.data.deathDate),
      birthPlace: emptyToNull(parsed.data.birthPlace),
      deathPlace: emptyToNull(parsed.data.deathPlace),
      occupation: emptyToNull(parsed.data.occupation),
      biography: emptyToNull(parsed.data.biography),
    },
  });

  revalidatePath(`/people/${personId}`);
  revalidatePath("/people");
  revalidatePath("/tree");
  redirect(`/people/${personId}`);
}

export async function deletePersonAction(personId: string) {
  const user = await requireUser();
  await prisma.person.deleteMany({
    where: { id: personId, ownerId: user.id },
  });
  revalidatePath("/people");
  revalidatePath("/dashboard");
  revalidatePath("/tree");
  redirect("/people");
}
