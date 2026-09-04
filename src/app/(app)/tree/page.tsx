import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildTreeLayout } from "@/lib/tree-layout";
import { InteractiveTree } from "@/components/InteractiveTree";

export default async function TreePage() {
  const user = await requireUser();
  const [people, relationships] = await Promise.all([
    prisma.person.findMany({ where: { ownerId: user.accountOwnerId }, orderBy: { lastName: "asc" } }),
    prisma.relationship.findMany({ where: { ownerId: user.accountOwnerId } }),
  ]);

  if (people.length === 0) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-md rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-10 text-center">
          <div className="font-display text-xl font-semibold text-[var(--ink)]">Your tree is empty</div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Add family members and parent/spouse links to visualize the tree.
          </p>
          <Link
            href="/people/new"
            className="mt-5 inline-block rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
          >
            Add Family Member
          </Link>
        </div>
      </div>
    );
  }

  const layout = buildTreeLayout(people, relationships);

  return (
    <InteractiveTree
      people={people}
      layout={layout}
      currentUserName={user.name}
    />
  );
}
