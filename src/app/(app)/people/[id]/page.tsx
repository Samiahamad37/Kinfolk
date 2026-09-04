import Link from "next/link";
import { notFound } from "next/navigation";
import { deletePersonAction } from "@/actions/people";
import { deleteRecordAction } from "@/actions/records";
import { deleteRelationshipAction } from "@/actions/relationships";
import { RecordForm } from "@/components/RecordForm";
import { RelationshipForm } from "@/components/RelationshipForm";
import { displayName, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PersonDetailPage({ params }: Props) {
  const user = await requireUser();
  const { id } = await params;

  const person = await prisma.person.findFirst({
    where: { id, ownerId: user.accountOwnerId },
    include: {
      fromRelations: { include: { toPerson: true } },
      toRelations: { include: { fromPerson: true } },
      records: { orderBy: { eventDate: "asc" } },
    },
  });

  if (!person) notFound();

  const allPeople = await prisma.person.findMany({
    where: { ownerId: user.accountOwnerId },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const peopleOptions = allPeople.map((p) => ({ id: p.id, name: displayName(p) }));

  const parents = person.toRelations
    .filter((r) => r.type === "PARENT")
    .map((r) => ({ relId: r.id, person: r.fromPerson }));
  const children = person.fromRelations
    .filter((r) => r.type === "PARENT")
    .map((r) => ({ relId: r.id, person: r.toPerson }));
  const spouses = [
    ...person.fromRelations
      .filter((r) => r.type === "SPOUSE")
      .map((r) => ({ relId: r.id, person: r.toPerson })),
    ...person.toRelations
      .filter((r) => r.type === "SPOUSE")
      .map((r) => ({ relId: r.id, person: r.fromPerson })),
  ];

  const managedRelations = [
    ...parents.map((item) => ({
      id: item.relId,
      label: `Child of ${displayName(item.person)}`,
    })),
    ...children.map((item) => ({
      id: item.relId,
      label: `Parent of ${displayName(item.person)}`,
    })),
    ...spouses.map((item) => ({
      id: item.relId,
      label: `Spouse of ${displayName(item.person)}`,
    })),
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Person profile
          </p>
          <h1 className="mt-2 font-display text-4xl text-[var(--ink)]">
            {displayName(person)}
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            {[person.birthDate, person.deathDate].filter(Boolean).join(" — ") || "Dates unknown"}
            {person.birthPlace ? ` · ${person.birthPlace}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/people/${person.id}/edit`}
            className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
          >
            Edit
          </Link>
          <form action={deletePersonAction.bind(null, person.id)}>
            <button
              type="submit"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCard title="Occupation" value={person.occupation} />
        <InfoCard title="Education" value={person.education} />
        <InfoCard title="Gender" value={person.gender} />
        <InfoCard title="Email" value={person.email} />
        <InfoCard title="Phone" value={person.phone} />
        <InfoCard title="Death place" value={person.deathPlace} />
      </section>

      {person.biography && (
        <section className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
          <h2 className="font-display text-2xl">Biography</h2>
          <p className="mt-3 whitespace-pre-wrap leading-7 text-[var(--muted)]">{person.biography}</p>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-3">
        <RelationList title="Parents" items={parents.map((p) => p.person)} />
        <RelationList title="Spouses" items={spouses.map((p) => p.person)} />
        <RelationList title="Children" items={children.map((p) => p.person)} />
      </section>

      <section className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">Add relationship</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          “Parent of” means this person is the parent of the selected relative.
        </p>
        <div className="mt-4">
          <RelationshipForm currentPersonId={person.id} people={peopleOptions} />
        </div>
        {managedRelations.length > 0 && (
          <ul className="mt-6 divide-y divide-[var(--line)] border-t border-[var(--line)]">
            {managedRelations.map((rel) => (
              <li key={rel.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span>{rel.label}</span>
                <form action={deleteRelationshipAction.bind(null, rel.id, person.id)}>
                  <button type="submit" className="text-red-600 hover:underline">
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">Historical records</h2>
        <div className="mt-4">
          <RecordForm personId={person.id} />
        </div>
        {person.records.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">No records yet for this person.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {person.records.map((record) => (
              <li
                key={record.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-[var(--line)] bg-white/70 p-4"
              >
                <div>
                  <p className="font-medium">{record.title}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {record.recordType}
                    {record.eventDate ? ` · ${record.eventDate}` : ""}
                    {record.location ? ` · ${record.location}` : ""}
                  </p>
                  {record.description && (
                    <p className="mt-2 text-sm text-[var(--muted)]">{record.description}</p>
                  )}
                </div>
                <form action={deleteRecordAction.bind(null, record.id, person.id)}>
                  <button type="submit" className="text-sm text-red-600 hover:underline">
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{title}</p>
      <p className="mt-2 font-medium text-[var(--ink)]">{value || "—"}</p>
    </div>
  );
}

function RelationList({
  title,
  items,
}: {
  title: string;
  items: { id: string; firstName: string; middleName?: string | null; lastName: string }[];
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">None linked</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((person) => (
            <li key={person.id}>
              <Link href={`/people/${person.id}`} className="font-medium hover:text-[var(--accent-deep)]">
                {displayName(person)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
