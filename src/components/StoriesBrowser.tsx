"use client";

import { useMemo, useState, useActionState } from "react";
import Link from "next/link";
import { Clock, Plus, Tag } from "lucide-react";
import type { ActionState } from "@/actions/auth";
import { createStoryAction } from "@/actions/family";
import { SubmitButton } from "@/components/SubmitButton";
import { fullName, initials, avatarColor } from "@/lib/person-utils";

type PersonLite = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
};

type StoryLite = {
  id: string;
  title: string;
  excerpt: string;
  tags: string;
  readTime: number;
  date: string | null;
  author: PersonLite | null;
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

const initialState: ActionState = {};
const inputClass =
  "w-full rounded-md border border-[var(--line)] bg-[var(--cream-100)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2";

export function StoriesBrowser({ stories }: { stories: StoryLite[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [state, formAction] = useActionState(createStoryAction, initialState);

  const storiesWithTags = useMemo(
    () => stories.map((s) => ({ ...s, tagList: parseTags(s.tags) })),
    [stories],
  );

  const allTags = useMemo(
    () => Array.from(new Set(storiesWithTags.flatMap((s) => s.tagList))),
    [storiesWithTags],
  );

  const filtered = activeTag
    ? storiesWithTags.filter((s) => s.tagList.includes(activeTag))
    : storiesWithTags;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-[var(--ink)]">Family Stories</h1>
          <p className="mt-0.5 text-[13px] text-[var(--muted)]">
            {stories.length} stories written by family members
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-deep)] px-4 py-2 text-sm font-medium text-[#FDFAF6]"
        >
          <Plus size={14} />
          Write a Story
        </button>
      </div>

      {showForm && (
        <form
          action={formAction}
          className="grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:grid-cols-2"
        >
          <label className="block space-y-1.5 text-sm sm:col-span-2">
            <span className="text-[var(--muted)]">Title</span>
            <input name="title" required className={inputClass} />
          </label>
          <label className="block space-y-1.5 text-sm sm:col-span-2">
            <span className="text-[var(--muted)]">Excerpt</span>
            <textarea name="excerpt" required rows={2} className={inputClass} />
          </label>
          <label className="block space-y-1.5 text-sm sm:col-span-2">
            <span className="text-[var(--muted)]">Content</span>
            <textarea
              name="content"
              required
              rows={8}
              placeholder="Separate paragraphs with a blank line…"
              className={inputClass}
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--muted)]">Date</span>
            <input name="date" placeholder="e.g. Summer 1962" className={inputClass} />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--muted)]">Read time (minutes)</span>
            <input name="readTime" type="number" min={1} defaultValue={3} className={inputClass} />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--muted)]">Tags (comma-separated)</span>
            <input name="tags" placeholder="heritage, travel" className={inputClass} />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--muted)]">Author person ID</span>
            <input name="authorId" className={inputClass} />
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
            <SubmitButton label="Publish story" pendingLabel="Publishing…" />
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTag(null)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
            !activeTag
              ? "border-[var(--accent-deep)] bg-[var(--accent-deep)] text-[#FDFAF6]"
              : "border-[var(--line)] bg-[var(--panel)] text-[var(--muted)]"
          }`}
        >
          All stories
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag((prev) => (prev === tag ? null : tag))}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
              activeTag === tag
                ? "border-[var(--accent-deep)] bg-[#F5EDE4] text-[var(--accent-deep)]"
                : "border-[var(--line)] bg-[var(--panel)] text-[var(--muted)]"
            }`}
          >
            <Tag size={10} />
            {tag}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {filtered.map((story) => (
          <Link
            key={story.id}
            href={`/stories/${story.id}`}
            className="group rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 transition-all hover:shadow-md"
          >
            <div className="mb-3 flex flex-wrap gap-2">
              {story.tagList.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#F5EDE4] px-2 py-0.5 text-[10px] font-medium text-[var(--accent-deep)]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="font-display text-lg leading-snug font-semibold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
              {story.title}
            </h2>
            <p className="mt-3 mb-4 line-clamp-3 text-[13.5px] leading-relaxed text-[var(--muted)]">
              {story.excerpt}
            </p>
            <div className="flex items-center gap-3 border-t border-[var(--line)] pt-3">
              {story.author ? (
                <>
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-[#FDFAF6]"
                    style={{ background: avatarColor(0) }}
                  >
                    {initials(story.author)}
                  </span>
                  <span className="flex-1 text-xs text-[var(--muted)]">
                    {fullName(story.author)}
                  </span>
                </>
              ) : (
                <span className="flex-1 text-xs text-[var(--muted)]">Family archive</span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)]">
                <Clock size={11} />
                {story.readTime} min
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] py-16 text-center">
          <p className="font-medium text-[var(--ink)]">No stories found</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Be the first to write a family story.</p>
        </div>
      )}
    </div>
  );
}
