import { createMemberAction } from "@/actions/members";
import { MembersAdmin } from "@/components/MembersAdmin";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminMembersPage() {
  const admin = await requireAdmin();
  const members = await prisma.user.findMany({
    where: { accountOwnerId: admin.accountOwnerId },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, username: true, role: true },
  });

  return <MembersAdmin members={members} action={createMemberAction} />;
}
