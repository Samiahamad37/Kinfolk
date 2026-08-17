"use client";

import { useMemo, useState, useActionState } from "react";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import type { ActionState } from "@/actions/auth";
import { createEventAction } from "@/actions/family";
import { SubmitButton } from "@/components/SubmitButton";
import { fullName } from "@/lib/person-utils";

type PersonLite = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
};

type EventLite = {
  id: string;
  type: string;
  title: string;
  date: string;
  year: number | null;
  month: number | null;
  location: string | null;
  description: string | null;
  people: { person: PersonLite }[];
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  birth: { icon: "👶", color: "#5E8050", bg: "#E0EAD8", label: "Birth" },
  death: { icon: "🕯️", color: "#7A6352", bg: "#EAE0D5", label: "Death" },
  marriage: { icon: "💍", color: "#8B5E3C", bg: "#F5EDE4", label: "Marriage" },
  graduation: { icon: "🎓", color: "#A67B52", bg: "#FAE3C0", label: "Graduation" },
  reunion: { icon: "🎉", color: "#C17E4A", bg: "#FDF4E7", label: "Reunion" },
  memorial: { icon: "🌿", color: "#6E8050", bg: "#EAF0E4", label: "Memorial" },
  move: { icon: "🏠", color: "#8B7052", bg: "#F0EAE0", label: "Move" },
  other: { icon: "📌", color: "#A89882", bg: "#F7F3ED", label: "Other" },
};

const EVENT_TYPES = [
  "birth",
  "death",
  "marriage",
  "graduation",
  "reunion",
  "memorial",
  "move",
  "other",
] as const;

const initialState: ActionState = {};
const inputClass =
  "w-full rounded-md border border-[var(--line)] bg-[var(--cream-100)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2";

export function EventsBrowser({ events }: { events: EventLite[] }) {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [state, formAction] = useActionState(createEventAction, initialState);

  const sorted = useMemo(
    () =>
      [...events].sort(
        (a, b) =>
          (b.year ?? 0) - (a.year ?? 0) ||
          (b.month ?? 0) - (a.month ?? 0) ||
          b.date.localeCompare(a.date),
      ),
    [events],
  );

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of events) {
      counts[e.type] = (counts[e.type] ?? 0) + 1;
    }
    return counts;
  }, [events]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-[var(--ink)]">Family Events</h1>
          <p className="mt-0.5 text-[13px] text-[var(--muted)]">
            {events.length} events recorded across all generations
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex overflow-hidden rounded-lg border border-[var(--line)]">
            {(["list", "calendar"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`px-4 py-2 text-sm font-medium capitalize ${
                  view === v
                    ? "bg-[var(--accent-deep)] text-[#FDFAF6]"
                    : "bg-[var(--panel)] text-[var(--muted)]"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-deep)] px-4 py-2 text-sm font-medium text-[#FDFAF6]"
          >
            <Plus size={14} />
            Add Event
          </button>
        </div>
      </div>

      {showForm && (
        <form
          action={formAction}
          className="grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:grid-cols-2"
        >
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--muted)]">Type</span>
            <select name="type" required className={inputClass} defaultValue="other">
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPE_CONFIG[t].label}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--muted)]">Title</span>
            <input name="title" required className={inputClass} />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--muted)]">Date</span>
            <input name="date" required placeholder="YYYY-MM-DD or June 12, 1980" className={inputClass} />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--muted)]">Location</span>
            <input name="location" className={inputClass} />
          </label>
          <label className="block space-y-1.5 text-sm sm:col-span-2">
            <span className="text-[var(--muted)]">Description</span>
            <textarea name="description" rows={2} className={inputClass} />
          </label>
          <label className="block space-y-1.5 text-sm sm:col-span-2">
            <span className="text-[var(--muted)]">Person IDs (comma-separated)</span>
            <input name="personIds" placeholder="cuid1, cuid2" className={inputClass} />
          </label>
          {state.error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">
              {state.error}
            </p>
          )}
          {state.success && (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 sm:col-span-2">
              {state.success}
            </p>
          )}
          <div className="sm:col-span-2">
            <SubmitButton label="Create event" />
          </div>
        </form>
      )}

      {view === "list" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <div className="mb-1 text-sm font-semibold text-[var(--muted)]">All Events</div>
            {sorted.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--panel)] p-10 text-center text-sm text-[var(--muted)]">
                No family events yet. Add your first celebration or milestone.
              </div>
            ) : (
              sorted.map((event) => {
                const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.other;
                return (
                  <div
                    key={event.id}
                    className="flex gap-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4"
                  >
                    <div
                      className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] text-xl"
                      style={{ background: cfg.bg }}
                    >
                      {cfg.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-sm font-semibold text-[var(--ink)]">
                        {event.title}
                      </div>
                      <div className="mt-1 text-xs text-[var(--muted)]">{event.date}</div>
                      {event.location && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-[var(--muted)]">
                          <MapPin size={10} /> {event.location}
                        </div>
                      )}
                      {event.description && (
                        <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                          {event.description}
                        </p>
                      )}
                      {event.people.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {event.people.map(({ person }) => (
                            <Link
                              key={person.id}
                              href={`/events?person=${person.id}`}
                              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                              style={{ background: cfg.bg, color: cfg.color }}
                            >
                              {fullName(person)}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                    <span
                      className="shrink-0 self-start rounded-full px-2 py-0.5 text-[11px] font-bold"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {event.year ?? cfg.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
              <div className="mb-3 text-[13px] font-semibold text-[var(--ink)]">Event Summary</div>
              <div className="space-y-3">
                {EVENT_TYPES.map((type) => {
                  const cfg = TYPE_CONFIG[type];
                  const count = typeCounts[type] ?? 0;
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <span className="text-base">{cfg.icon}</span>
                      <div className="flex-1 text-[13px] capitalize text-[var(--muted)]">{type}s</div>
                      <div className="text-[13px] font-semibold text-[var(--ink)]">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {view === "calendar" && (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {FULL_MONTHS.map((month, idx) => {
              const monthEvents = events.filter((e) => e.month === idx + 1);
              const selected = selectedMonth === idx;
              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => setSelectedMonth((prev) => (prev === idx ? null : idx))}
                  className="rounded-xl p-3 text-left transition-all hover:shadow-sm"
                  style={{
                    border: `1px solid ${selected ? "#C17E4A" : "var(--line)"}`,
                    background: selected ? "#FDF4E7" : "transparent",
                  }}
                >
                  <div
                    className="mb-1 text-xs font-bold"
                    style={{ color: selected ? "#8B5E3C" : "var(--muted)" }}
                  >
                    {MONTHS[idx]}
                  </div>
                  {monthEvents.length > 0 ? (
                    <>
                      <div className="text-lg font-bold text-[var(--ink)]">{monthEvents.length}</div>
                      <div className="text-[10px] text-[var(--muted)]">
                        event{monthEvents.length !== 1 ? "s" : ""}
                      </div>
                    </>
                  ) : (
                    <div className="text-[11px] text-[var(--line)]">—</div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedMonth !== null && (
            <div className="mt-6 space-y-3">
              <div className="text-sm font-semibold text-[var(--ink)]">
                {FULL_MONTHS[selectedMonth]} events
              </div>
              {events
                .filter((e) => e.month === selectedMonth + 1)
                .map((event) => {
                  const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.other;
                  return (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3"
                    >
                      <span className="text-lg">{cfg.icon}</span>
                      <div>
                        <div className="text-[13px] font-medium text-[var(--ink)]">{event.title}</div>
                        <div className="text-xs text-[var(--muted)]">{event.date}</div>
                      </div>
                    </div>
                  );
                })}
              {events.filter((e) => e.month === selectedMonth + 1).length === 0 && (
                <p className="text-sm text-[var(--muted)]">No events in this month.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
