import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fullName, initials, avatarColor } from "@/lib/person-utils";

type Props = {
  params: Promise<{ id: string }>;
};

function parseTags(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
}

export default async function StoryDetailPage({ params }: Props) {
  const user = await requireUser();
  const { id } = await params;

  const story = await prisma.story.findFirst({
    where: { id, ownerId: user.accountOwnerId },
    include: {
      author: true,
      people: { include: { person: true } },
    },
  });

  if (!story) notFound();

  const tags = parseTags(story.tags);
  const paragraphs = story.content.split(/\n\n+/).filter(Boolean);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link href="/stories" className="mb-6 inline-block text-[13px] text-[var(--accent)]">
        ← Back to Stories
      </Link>

      <div className="space-y-6">
        <div>
          {tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#F5EDE4] px-2 py-0.5 text-[11px] font-medium text-[var(--accent-deep)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="font-display mb-4 text-3xl leading-snug font-semibold text-[var(--ink)]">
            {story.title}
          </h1>
          <div className="flex items-center gap-3">
            {story.author && (
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-[#FDFAF6]"
                style={{ background: avatarColor(0) }}
              >
                {initials(story.author)}
              </span>
            )}
            <div>
              {story.author && (
                <Link
                  href={`/stories/${story.id}?person=${story.author.id}`}
                  className="text-[13px] font-medium text-[var(--ink)] hover:text-[var(--accent)]"
                >
                  {fullName(story.author)}
                </Link>
              )}
              <div className="text-xs text-[var(--muted)]">
                {[story.date, `${story.readTime} min read`].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--line)] pt-6 font-display text-base leading-[1.85] text-[var(--ink)]">
          {paragraphs.map((para, i) => (
            <p key={i} className="mb-5">
              {para}
            </p>
          ))}
        </div>

        {story.people.length > 0 && (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
            <div className="mb-3 text-[13px] font-semibold text-[var(--ink)]">People in this story</div>
            <div className="flex flex-wrap gap-3">
              {story.people.map(({ person }) => (
                <Link
                  key={person.id}
                  href={`/stories/${story.id}?person=${person.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-3 py-1.5 transition-colors hover:bg-[var(--cream-100)]"
                >
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold text-[#FDFAF6]"
                    style={{ background: avatarColor(1) }}
                  >
                    {initials(person)}
                  </span>
                  <span className="text-xs text-[var(--ink)]">{fullName(person)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
