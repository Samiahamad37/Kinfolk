import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fullName } from "@/lib/person-utils";

const TYPE_META: Record<string, { label: string; color: string }> = {
  birth: { label: "Birth", color: "#5E8050" },
  death: { label: "Death", color: "#7A6352" },
  marriage: { label: "Marriage", color: "#C17E4A" },
  graduation: { label: "Graduation", color: "#8B5E3C" },
  reunion: { label: "Reunion", color: "#A67B52" },
  memorial: { label: "Memorial", color: "#6E4828" },
  move: { label: "Move", color: "#A89882" },
  other: { label: "Other", color: "#A89882" },
  Birth: { label: "Birth", color: "#5E8050" },
  Marriage: { label: "Marriage", color: "#C17E4A" },
  Migration: { label: "Migration", color: "#A89882" },
  Other: { label: "Other", color: "#A89882" },
};

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const user = await requireUser();
  const { type } = await searchParams;

  const [events, records, people] = await Promise.all([
    prisma.familyEvent.findMany({
      where: { ownerId: user.accountOwnerId },
      include: { people: { include: { person: true } } },
    }),
    prisma.historicalRecord.findMany({
      where: { ownerId: user.accountOwnerId },
      include: { person: true },
    }),
    prisma.person.findMany({ where: { ownerId: user.accountOwnerId } }),
  ]);

  type Item = {
    id: string;
    title: string;
    date: string;
    year: number;
    type: string;
    location?: string | null;
    description?: string | null;
    people: { id: string; name: string }[];
  };

  const items: Item[] = [
    ...events.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      year: e.year ?? Number(e.date.match(/\d{4}/)?.[0] ?? 0),
      type: e.type,
      location: e.location,
      description: e.description,
      people: e.people.map((p) => ({ id: p.person.id, name: fullName(p.person) })),
    })),
    ...records.map((r) => ({
      id: r.id,
      title: r.title,
      date: r.eventDate ?? "",
      year: Number(r.eventDate?.match(/\d{4}/)?.[0] ?? 0),
      type: r.recordType,
      location: r.location,
      description: r.description,
      people: [{ id: r.person.id, name: fullName(r.person) }],
    })),
    ...people
      .filter((p) => p.birthDate)
      .map((p) => ({
        id: `birth-${p.id}`,
        title: `Birth of ${fullName(p)}`,
        date: p.birthDate!,
        year: Number(p.birthDate!.match(/\d{4}/)?.[0] ?? 0),
        type: "birth",
        location: p.birthPlace,
        description: null,
        people: [{ id: p.id, name: fullName(p) }],
      })),
    ...people
      .filter((p) => p.deathDate)
      .map((p) => ({
        id: `death-${p.id}`,
        title: `Passing of ${fullName(p)}`,
        date: p.deathDate!,
        year: Number(p.deathDate!.match(/\d{4}/)?.[0] ?? 0),
        type: "death",
        location: p.deathPlace,
        description: null,
        people: [{ id: p.id, name: fullName(p) }],
      })),
  ]
    .filter((i) => i.year > 0)
    .sort((a, b) => a.year - b.year || a.date.localeCompare(b.date));

  const filtered = type && type !== "all" ? items.filter((i) => i.type.toLowerCase() === type.toLowerCase()) : items;

  const filters = ["all", "birth", "death", "marriage", "graduation", "reunion", "other"];

  const byYear = filtered.reduce<Record<number, Item[]>>((acc, item) => {
    (acc[item.year] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/timeline" : `/timeline?type=${f}`}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
              (type ?? "all") === f
                ? "bg-[var(--accent)] text-white"
                : "border border-[var(--line)] bg-[var(--panel)] text-[var(--muted)]"
            }`}
          >
            {f}
          </Link>
        ))}
      </div>

      {Object.keys(byYear).length === 0 ? (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-10 text-center text-sm text-[var(--muted)]">
          No timeline events yet. Add people, records, or family events.
        </div>
      ) : (
        <div className="relative space-y-8 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-px before:bg-[var(--line)]">
          {Object.entries(byYear)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([year, yearItems]) => (
              <section key={year} className="relative pl-8">
                <div className="absolute top-1.5 left-0 h-3.5 w-3.5 rounded-full border-2 border-[var(--accent)] bg-[var(--panel)]" />
                <h2 className="font-display text-xl font-semibold text-[var(--ink)]">{year}</h2>
                <div className="mt-3 space-y-3">
                  {yearItems.map((item) => {
                    const meta = TYPE_META[item.type] ?? TYPE_META.other;
                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-[var(--ink)]">{item.title}</div>
                            <div className="mt-1 text-xs text-[var(--muted)]">
                              {[item.date, item.location].filter(Boolean).join(" · ")}
                            </div>
                          </div>
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                            style={{ background: meta.color }}
                          >
                            {meta.label}
                          </span>
                        </div>
                        {item.description && (
                          <p className="mt-2 text-sm text-[var(--muted)]">{item.description}</p>
                        )}
                        {item.people.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.people.map((p) => (
                              <Link
                                key={p.id}
                                href={`/timeline?person=${p.id}`}
                                className="rounded-full border border-[var(--line)] px-2.5 py-0.5 text-xs text-[var(--accent-deep)]"
                              >
                                {p.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}
