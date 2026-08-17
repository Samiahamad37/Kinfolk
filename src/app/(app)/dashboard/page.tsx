import Link from "next/link";
import { Plus, TreePine, Users, Heart, Calendar } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fullName, initials, avatarColor, isLiving, parseYear } from "@/lib/person-utils";
import { buildTreeLayout } from "@/lib/tree-layout";

export default async function DashboardPage() {
  const user = await requireUser();

  const [people, relationships, events, stories, photos, recentPeople] = await Promise.all([
    prisma.person.findMany({ where: { ownerId: user.id } }),
    prisma.relationship.findMany({ where: { ownerId: user.id } }),
    prisma.familyEvent.findMany({ where: { ownerId: user.id } }),
    prisma.story.findMany({ where: { ownerId: user.id }, take: 3, orderBy: { createdAt: "desc" } }),
    prisma.photo.findMany({ where: { ownerId: user.id }, take: 4, orderBy: { createdAt: "desc" } }),
    prisma.person.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const layout = people.length ? buildTreeLayout(people, relationships) : null;
  const generations = layout ? layout.generations.length : 0;
  const living = people.filter((p) => isLiving(p)).length;
  const firstName = user.name.split(" ")[0];

  const now = new Date();
  const upcomingBirthdays = people
    .filter((p) => isLiving(p) && p.birthDate)
    .map((p) => {
      const parts = p.birthDate!.match(/(\d{4})-(\d{2})-(\d{2})/) ?? p.birthDate!.match(/(\w+)\s+(\d+)/);
      let month = 0;
      let day = 1;
      if (p.birthDate!.includes("-")) {
        const d = new Date(p.birthDate!);
        month = d.getMonth();
        day = d.getDate();
      } else if (parts && parts.length >= 3) {
        const months = [
          "January","February","March","April","May","June",
          "July","August","September","October","November","December",
        ];
        month = months.findIndex((m) => m.startsWith(parts[1]));
        day = Number(parts[2]);
      }
      const upcoming = new Date(now.getFullYear(), month, day);
      if (upcoming < now) upcoming.setFullYear(now.getFullYear() + 1);
      const daysAway = Math.ceil((upcoming.getTime() - now.getTime()) / 86400000);
      return { person: p, daysAway, month, day };
    })
    .sort((a, b) => a.daysAway - b.daysAway)
    .slice(0, 4);

  const stats = [
    { label: "Family Members", value: people.length, icon: Users, color: "#8B5E3C" },
    { label: "Living Members", value: living, icon: Heart, color: "#C17E4A" },
    { label: "Generations", value: generations, icon: TreePine, color: "#5E8050" },
    { label: "Family Events", value: events.length, icon: Calendar, color: "#A67B52" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: "linear-gradient(135deg, #2C1810 0%, #52341A 60%, #6E4828 100%)",
          minHeight: 180,
        }}
      >
        <div className="relative p-8">
          <div className="font-display text-2xl font-semibold text-white">
            Welcome back, {firstName}.
          </div>
          <div className="mt-1 mb-6 text-[15px] text-[#C4AE98]">
            Your family tree has {people.length} members
            {generations ? ` across ${generations} generations` : ""}.
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/tree"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[#FDFAF6]"
            >
              <TreePine size={15} />
              Explore Family Tree
            </Link>
            <Link
              href="/people/new"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-[#F0E8DC]"
            >
              <Plus size={15} />
              Add Family Member
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5"
            >
              <div
                className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ background: `${stat.color}18` }}
              >
                <Icon size={17} style={{ color: stat.color }} />
              </div>
              <div className="font-display text-2xl font-semibold text-[var(--ink)]">{stat.value}</div>
              <div className="mt-0.5 text-[13px] text-[var(--muted)]">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]">
          <div className="border-b border-[var(--line)] px-5 py-4 text-sm font-semibold text-[var(--ink)]">
            Upcoming Birthdays
          </div>
          <div className="divide-y divide-[var(--line)]">
            {upcomingBirthdays.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[var(--muted)]">No upcoming birthdays yet.</p>
            ) : (
              upcomingBirthdays.map(({ person, daysAway }) => (
                <Link
                  key={person.id}
                  href={`/dashboard?person=${person.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--cream-100)]"
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ background: avatarColor(layout?.generationOf[person.id] ?? 0) }}
                  >
                    {initials(person)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-[var(--ink)]">
                      {fullName(person)}
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {daysAway === 0 ? "Today" : `In ${daysAway} days`}
                      {parseYear(person.birthDate) ? ` · born ${parseYear(person.birthDate)}` : ""}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
            <span className="text-sm font-semibold text-[var(--ink)]">Recently added</span>
            <Link href="/people" className="text-xs text-[var(--accent)]">
              View all
            </Link>
          </div>
          <div className="divide-y divide-[var(--line)]">
            {recentPeople.map((person) => (
              <Link
                key={person.id}
                href={`/people?person=${person.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--cream-100)]"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ background: avatarColor(layout?.generationOf[person.id] ?? 1) }}
                >
                  {initials(person)}
                </span>
                <div>
                  <div className="text-sm font-medium text-[var(--ink)]">{fullName(person)}</div>
                  <div className="text-xs text-[var(--muted)]">{person.occupation ?? "Family member"}</div>
                </div>
              </Link>
            ))}
            {recentPeople.length === 0 && (
              <p className="px-5 py-6 text-sm text-[var(--muted)]">Add your first ancestor to begin.</p>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
            <span className="text-sm font-semibold text-[var(--ink)]">Recent stories</span>
            <Link href="/stories" className="text-xs text-[var(--accent)]">
              View all
            </Link>
          </div>
          <div className="space-y-3 p-5">
            {stories.length === 0 && photos.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">Stories and photos will appear here.</p>
            ) : (
              <>
                {stories.map((story) => (
                  <Link key={story.id} href={`/stories/${story.id}`} className="block">
                    <div className="text-sm font-medium text-[var(--ink)]">{story.title}</div>
                    <div className="line-clamp-2 text-xs text-[var(--muted)]">{story.excerpt}</div>
                  </Link>
                ))}
                {photos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {photos.map((photo) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={photo.id}
                        src={photo.url}
                        alt={photo.title}
                        className="aspect-square rounded-md object-cover"
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
