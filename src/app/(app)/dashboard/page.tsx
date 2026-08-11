import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await requireUser();

  const [peopleCount, relationshipCount, recordCount, recentPeople] = await Promise.all([
    prisma.person.count({ where: { ownerId: user.id } }),
    prisma.relationship.count({ where: { ownerId: user.id } }),
    prisma.historicalRecord.count({ where: { ownerId: user.id } }),
    prisma.person.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const stats = [
    { label: "People", value: peopleCount, href: "/people" },
    { label: "Relationships", value: relationshipCount, href: "/tree" },
    { label: "Records", value: recordCount, href: "/records" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
          Hello, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Your genealogy workspace for ancestry, relationships, and historical records.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 transition hover:border-[var(--accent)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              {stat.label}
            </p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      <section className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            Recently updated
          </h2>
          <Link
            href="/people/new"
            className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--accent-deep)]"
          >
            Add person
          </Link>
        </div>
        {recentPeople.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            No people yet. Add your first ancestor to begin the tree.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--line)]">
            {recentPeople.map((person) => (
              <li key={person.id}>
                <Link
                  href={`/people/${person.id}`}
                  className="flex items-center justify-between py-3 transition hover:text-[var(--accent-deep)]"
                >
                  <span className="font-medium">
                    {person.firstName} {person.lastName}
                  </span>
                  <span className="text-sm text-[var(--muted)]">
                    {person.birthDate || "Date unknown"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
