import Link from "next/link";
import { FileText } from "lucide-react";
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
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-[var(--ink)]">Historical records</h1>
          <p className="mt-2 text-[var(--muted)]">
            Births, marriages, migrations, and other events across your archive.
          </p>
        </div>
        <Link
          href="/documents"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--accent-deep)] hover:bg-[var(--cream-100)]"
        >
          <FileText size={14} />
          Open Documents archive
        </Link>
      </div>

      {records.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--panel)] p-8 text-center text-[var(--muted)]">
          No historical records yet. Open a person profile to add one, or use{" "}
          <Link href="/documents" className="font-medium text-[var(--accent-deep)] hover:underline">
            Documents
          </Link>{" "}
          for certificates and files.
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
                  <p className="text-xs font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
                    {record.recordType}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-semibold text-[var(--ink)]">
                    {record.title}
                  </h2>
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
