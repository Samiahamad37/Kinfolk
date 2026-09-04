"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { memberSchema } from "@/lib/validators";
import type { ActionState } from "@/actions/auth";

export async function createMemberAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = memberSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const username = parsed.data.username.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return { error: "That username is already in use" };

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      username,
      email: `${username}@member.local`,
      passwordHash: await hashPassword(parsed.data.password),
      accountOwnerId: admin.accountOwnerId,
      role: "MEMBER",
    },
  });

  revalidatePath("/admin/members");
  return { success: `Member created. Username: ${username} | Password: ${parsed.data.password}` };
}
