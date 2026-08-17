"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { getPersonProfile } from "@/actions/profile";

type Profile = NonNullable<Awaited<ReturnType<typeof getPersonProfile>>>;

type Props = {
  personId: string;
  onClose: () => void;
  onSelectPerson: (id: string) => void;
};

export function PersonProfilePanel({ personId, onClose, onSelectPerson }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    start(async () => {
      const data = await getPersonProfile(personId);
      setProfile(data);
    });
  }, [personId]);

  return (
    <>
      <button
        type="button"
        aria-label="Close profile"
        className="fixed inset-0 z-40 bg-[rgba(44,24,16,0.35)] backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-[420px] max-w-[95vw] flex-col overflow-hidden border-l border-[var(--line)] bg-[var(--panel)] shadow-[-8px_0_40px_rgba(44,24,16,0.15)]">
        {pending && !profile ? (
          <div className="p-8 text-sm text-[var(--muted)]">Loading profile…</div>
        ) : !profile ? (
          <div className="p-8 text-sm text-[var(--muted)]">Person not found.</div>
        ) : (
          <>
            <div
              className="relative px-6 pt-7 pb-5"
              style={{
                background: `linear-gradient(135deg, ${profile.color} 0%, ${profile.color}cc 100%)`,
              }}
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <X size={16} color="#fff" />
              </button>
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[2.5px] border-white/40 bg-white/20 text-[22px] font-bold text-white">
                  {profile.initials}
                </div>
                <div className="min-w-0 pt-1">
                  <h2 className="font-display text-xl font-semibold leading-tight text-white">
                    {profile.name}
                  </h2>
                  <p className="mt-1 text-[13px] text-white/75">
                    {profile.occupation ?? "Family member"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{
                        background: profile.living ? "rgba(94,128,80,0.35)" : "rgba(196,174,152,0.35)",
                        color: profile.living ? "#C8F0B8" : "#E8D8C0",
                      }}
                    >
                      {profile.living ? "Living" : "Deceased"}
                    </span>
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white/80">
                      {profile.privacy}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <Section title="Life Details">
                {profile.birthDate && (
                  <Row
                    label="Born"
                    value={`${profile.birthDate}${profile.age != null ? ` · ${profile.age} years` : ""}`}
                  />
                )}
                {profile.birthPlace && <Row label="Birthplace" value={profile.birthPlace} />}
                {profile.deathDate && <Row label="Died" value={profile.deathDate} />}
                {profile.deathPlace && <Row label="Death place" value={profile.deathPlace} />}
                {profile.occupation && <Row label="Occupation" value={profile.occupation} />}
                {profile.education && <Row label="Education" value={profile.education} />}
              </Section>

              {(profile.email || profile.phone) && (
                <Section title="Contact">
                  {profile.email && <Row label="Email" value={profile.email} />}
                  {profile.phone && <Row label="Phone" value={profile.phone} />}
                </Section>
              )}

              {profile.biography && (
                <Section title="Biography">
                  <p className="font-display text-[13.5px] leading-7 text-[var(--muted)]">
                    {profile.biography}
                  </p>
                </Section>
              )}

              <Section title="Family Connections">
                <RelGroup label="Parents" people={profile.parents} onSelect={onSelectPerson} />
                <RelGroup label="Spouse / Partner" people={profile.spouses} onSelect={onSelectPerson} />
                <RelGroup label="Children" people={profile.children} onSelect={onSelectPerson} />
                <RelGroup label="Siblings" people={profile.siblings} onSelect={onSelectPerson} />
              </Section>

              {profile.photos.length > 0 && (
                <Section title={`Photos (${profile.photos.length})`}>
                  <div className="grid grid-cols-3 gap-2">
                    {profile.photos.map((photo) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={photo.id}
                        src={photo.url}
                        alt={photo.title}
                        className="aspect-square rounded-lg object-cover"
                      />
                    ))}
                  </div>
                </Section>
              )}

              {profile.events.length > 0 && (
                <Section title="Life Events">
                  <div className="space-y-2">
                    {profile.events.map((event) => (
                      <div key={event.id} className="rounded-lg border border-[var(--line)] px-3 py-2">
                        <div className="text-sm font-medium text-[var(--ink)]">{event.title}</div>
                        <div className="text-xs text-[var(--muted)]">
                          {event.date} · {event.type}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>

            <div className="flex gap-2 border-t border-[var(--line)] p-4">
              <Link
                href={`/people/${profile.id}/edit`}
                className="flex-1 rounded-lg bg-[var(--accent)] px-3 py-2 text-center text-sm font-medium text-white"
              >
                Edit Profile
              </Link>
              <Link
                href={`/people/new`}
                className="flex-1 rounded-lg border border-[var(--line)] px-3 py-2 text-center text-sm font-medium text-[var(--ink)]"
              >
                Add Relative
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="w-24 shrink-0 text-[var(--muted)]">{label}</span>
      <span className="text-[var(--ink)]">{value}</span>
    </div>
  );
}

function RelGroup({
  label,
  people,
  onSelect,
}: {
  label: string;
  people: Array<{ id: string; name: string; initials: string; color: string } | null>;
  onSelect: (id: string) => void;
}) {
  const list = people.filter(Boolean) as Array<{
    id: string;
    name: string;
    initials: string;
    color: string;
  }>;
  if (!list.length) return null;
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-medium text-[var(--muted)]">{label}</div>
      <div className="flex flex-wrap gap-2">
        {list.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--cream-100)] px-2.5 py-1 text-left text-sm hover:border-[var(--accent)]"
          >
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
              style={{ background: p.color }}
            >
              {p.initials}
            </span>
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
