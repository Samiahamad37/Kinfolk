import { TreeView } from "@/components/TreeView";
import { displayName, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildFamilyTree } from "@/lib/tree";

type Props = {
  searchParams: Promise<{ root?: string }>;
};

export default async function TreePage({ searchParams }: Props) {
  const user = await requireUser();
  const { root } = await searchParams;

  const people = await prisma.person.findMany({
    where: { ownerId: user.id },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  if (people.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--line)] bg-white/50 p-10 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          Family tree
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          Add people and relationships first, then visualize the generations here.
        </p>
      </div>
    );
  }

  const rootId = root && people.some((p) => p.id === root) ? root : people[0].id;
  const tree = await buildFamilyTree(user.id, rootId, 2);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
            Family tree
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            Choose a focus person to explore parents, spouses, and descendants.
          </p>
        </div>
        <form className="flex items-center gap-2">
          <label className="text-sm text-[var(--muted)]" htmlFor="root">
            Focus
          </label>
          <select
            id="root"
            name="root"
            defaultValue={rootId}
            className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          >
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {displayName(person)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--accent-deep)]"
          >
            View
          </button>
        </form>
      </div>

      {tree ? <TreeView root={tree} /> : null}
    </div>
  );
}
