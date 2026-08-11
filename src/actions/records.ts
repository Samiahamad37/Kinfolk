"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordSchema } from "@/lib/validators";
import type { ActionState } from "@/actions/auth";

function emptyToNull(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function createRecordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = recordSchema.safeParse({
    personId: formData.get("personId"),
    title: formData.get("title"),
    recordType: formData.get("recordType"),
    description: formData.get("description") || undefined,
    eventDate: formData.get("eventDate") || undefined,
    location: formData.get("location") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const person = await prisma.person.findFirst({
    where: { id: parsed.data.personId, ownerId: user.id },
  });
  if (!person) return { error: "Person not found" };

  await prisma.historicalRecord.create({
    data: {
      ownerId: user.id,
      personId: parsed.data.personId,
      title: parsed.data.title,
      recordType: parsed.data.recordType,
      description: emptyToNull(parsed.data.description),
      eventDate: emptyToNull(parsed.data.eventDate),
      location: emptyToNull(parsed.data.location),
    },
  });

  revalidatePath(`/people/${parsed.data.personId}`);
  revalidatePath("/records");
  return { success: "Record added" };
}

export async function deleteRecordAction(recordId: string, personId: string) {
  const user = await requireUser();
  await prisma.historicalRecord.deleteMany({
    where: { id: recordId, ownerId: user.id },
  });
  revalidatePath(`/people/${personId}`);
  revalidatePath("/records");
}
