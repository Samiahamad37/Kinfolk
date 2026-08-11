import Link from "next/link";
import { displayName, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function PeoplePage({ searchParams }: Props) {
  const user = await requireUser();
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const people = await prisma.person.findMany({
    where: {
      ownerId: user.id,
      ...(query
        ? {
            OR: [
              { firstName: { contains: query } },
              { lastName: { contains: query } },
              { middleName: { contains: query } },
              { birthPlace: { contains: query } },
            ],
          }
        : {}),
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">People</h1>
          <p className="mt-2 text-[var(--muted)]">Every person in your family archive.</p>
        </div>
        <Link
          href="/people/new"
          className="rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-deep)]"
        >
          Add person
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search by name or place"
          className="w-full max-w-md rounded-md border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--accent)] focus:ring-2"
        />
        <button
          type="submit"
          className="rounded-md border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-medium hover:bg-[var(--panel)]"
        >
          Search
        </button>
      </form>

      {people.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--line)] bg-white/50 p-8 text-center text-[var(--muted)]">
          No people found. Add someone to start building the tree.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((person) => (
            <Link
              key={person.id}
              href={`/people/${person.id}`}
              className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 transition hover:border-[var(--accent)] hover:shadow-sm"
            >
              <h2 className="font-semibold text-[var(--ink)]">{displayName(person)}</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {[person.birthDate, person.deathDate].filter(Boolean).join(" — ") || "Dates unknown"}
              </p>
              {person.birthPlace && (
                <p className="mt-2 text-sm text-[var(--muted)]">{person.birthPlace}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
