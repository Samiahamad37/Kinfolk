"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Grid3X3, List, Plus, Search } from "lucide-react";
import { fullName, initials, avatarColor, isLiving, age, parseYear } from "@/lib/person-utils";

type Person = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  birthDate: string | null;
  deathDate: string | null;
  birthPlace: string | null;
  occupation: string | null;
  generation: number;
};

export function MembersBrowser({ people }: { people: Person[] }) {
  const [q, setQ] = useState("");
  const [gen, setGen] = useState<string>("all");
  const [living, setLiving] = useState<string>("all");
  const [sort, setSort] = useState<"name" | "age" | "generation">("name");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    let list = [...people];
    if (q.trim()) {
      const lower = q.toLowerCase();
      list = list.filter(
        (p) =>
          fullName(p).toLowerCase().includes(lower) ||
          p.occupation?.toLowerCase().includes(lower),
      );
    }
    if (gen !== "all") list = list.filter((p) => p.generation === Number(gen));
    if (living === "living") list = list.filter((p) => isLiving(p));
    if (living === "deceased") list = list.filter((p) => !isLiving(p));
    list.sort((a, b) => {
      if (sort === "generation") return a.generation - b.generation;
      if (sort === "age") return (age(b) ?? 0) - (age(a) ?? 0);
      return fullName(a).localeCompare(fullName(b));
    });
    return list;
  }, [people, q, gen, living, sort]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search members…"
            className="w-full rounded-lg border border-[var(--line)] bg-[var(--panel)] py-2 pr-3 pl-9 text-sm outline-none"
          />
        </div>
        <select
          value={gen}
          onChange={(e) => setGen(e.target.value)}
          className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm"
        >
          <option value="all">All generations</option>
          <option value="0">Grandparents</option>
          <option value="1">Parents</option>
          <option value="2">Our Generation</option>
          <option value="3">Children</option>
        </select>
        <select
          value={living}
          onChange={(e) => setLiving(e.target.value)}
          className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm"
        >
          <option value="all">Living & deceased</option>
          <option value="living">Living</option>
          <option value="deceased">Deceased</option>
        </select>
        <button
          type="button"
          onClick={() =>
            setSort((s) => (s === "name" ? "age" : s === "age" ? "generation" : "name"))
          }
          className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm"
        >
          Sort: {sort}
        </button>
        <div className="flex rounded-lg border border-[var(--line)] overflow-hidden">
          <button
            type="button"
            className={`px-2.5 py-2 ${view === "grid" ? "bg-[var(--accent)] text-white" : "bg-[var(--panel)]"}`}
            onClick={() => setView("grid")}
          >
            <Grid3X3 size={15} />
          </button>
          <button
            type="button"
            className={`px-2.5 py-2 ${view === "list" ? "bg-[var(--accent)] text-white" : "bg-[var(--panel)]"}`}
            onClick={() => setView("list")}
          >
            <List size={15} />
          </button>
        </div>
        <Link
          href="/people/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white"
        >
          <Plus size={15} />
          Add member
        </Link>
      </div>

      <p className="text-sm text-[var(--muted)]">{filtered.length} members</p>

      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((person) => (
            <Link
              key={person.id}
              href={`/people?person=${person.id}`}
              className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 transition hover:border-[var(--accent)]"
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ background: avatarColor(person.generation) }}
                  >
                    {initials(person)}
                  </span>
                  <span
                    className={`absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-[var(--panel)] ${
                      isLiving(person) ? "bg-[var(--sage)]" : "bg-[var(--muted)]"
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium text-[var(--ink)]">{fullName(person)}</div>
                  <div className="text-xs text-[var(--muted)]">Generation {person.generation + 1}</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">
                    {parseYear(person.birthDate) ?? "?"}
                    {age(person) != null ? ` · age ${age(person)}` : ""}
                  </div>
                  {person.occupation && (
                    <div className="mt-1 truncate text-xs text-[var(--accent-deep)]">{person.occupation}</div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]">
          {filtered.map((person) => (
            <Link
              key={person.id}
              href={`/people?person=${person.id}`}
              className="flex items-center gap-4 border-b border-[var(--line)] px-4 py-3 last:border-0 hover:bg-[var(--cream-100)]"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ background: avatarColor(person.generation) }}
              >
                {initials(person)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-[var(--ink)]">{fullName(person)}</div>
                <div className="truncate text-xs text-[var(--muted)]">
                  {[person.birthPlace, person.occupation].filter(Boolean).join(" · ")}
                </div>
              </div>
              <div className="text-xs text-[var(--muted)]">Gen {person.generation + 1}</div>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  isLiving(person)
                    ? "bg-[var(--sage)]/15 text-[var(--sage)]"
                    : "bg-[var(--muted)]/15 text-[var(--muted)]"
                }`}
              >
                {isLiving(person) ? "Living" : "Deceased"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
