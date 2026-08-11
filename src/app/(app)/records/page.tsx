import Link from "next/link";
import { displayName, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function RecordsPage() {
  const user = await requireUser();

  const records = await prisma.historicalRecord.findMany({
    where: { ownerId: user.id },
    include: { person: true },
    orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
          Historical records
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Births, marriages, migrations, and other events across your archive.
        </p>
      </div>

      {records.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--line)] bg-white/50 p-8 text-center text-[var(--muted)]">
          No historical records yet. Open a person profile to add one.
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <article
              key={record.id}
              className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                    {record.recordType}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-[var(--ink)]">{record.title}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    <Link
                      href={`/people/${record.personId}`}
                      className="font-medium text-[var(--accent-deep)] hover:underline"
                    >
                      {displayName(record.person)}
                    </Link>
                    {record.eventDate ? ` · ${record.eventDate}` : ""}
                    {record.location ? ` · ${record.location}` : ""}
                  </p>
                </div>
              </div>
              {record.description && (
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{record.description}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
