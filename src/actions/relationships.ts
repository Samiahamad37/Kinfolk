"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { relationshipSchema } from "@/lib/validators";
import type { ActionState } from "@/actions/auth";

export async function createRelationshipAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = relationshipSchema.safeParse({
    fromPersonId: formData.get("fromPersonId"),
    toPersonId: formData.get("toPersonId"),
    type: formData.get("type"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (parsed.data.fromPersonId === parsed.data.toPersonId) {
    return { error: "A person cannot be related to themselves" };
  }

  const people = await prisma.person.findMany({
    where: {
      ownerId: user.accountOwnerId,
      id: { in: [parsed.data.fromPersonId, parsed.data.toPersonId] },
    },
  });

  if (people.length !== 2) {
    return { error: "Both people must belong to your family tree" };
  }

  try {
    await prisma.relationship.create({
      data: {
        ownerId: user.accountOwnerId,
        fromPersonId: parsed.data.fromPersonId,
        toPersonId: parsed.data.toPersonId,
        type: parsed.data.type,
        notes: parsed.data.notes?.trim() || null,
      },
    });
  } catch {
    return { error: "That relationship already exists" };
  }

  revalidatePath(`/people/${parsed.data.fromPersonId}`);
  revalidatePath(`/people/${parsed.data.toPersonId}`);
  revalidatePath("/tree");
  return { success: "Relationship added" };
}

export async function deleteRelationshipAction(relationshipId: string, personId: string) {
  const user = await requireUser();
  await prisma.relationship.deleteMany({
    where: { id: relationshipId, ownerId: user.accountOwnerId },
  });
  revalidatePath(`/people/${personId}`);
  revalidatePath("/tree");
}
