"use client";

import { useMemo, useState, useActionState } from "react";
import Link from "next/link";
import { Download, Search, Upload, FileText, Heart, HeartOff, Ship, ClipboardList } from "lucide-react";
import type { ActionState } from "@/actions/auth";
import { createDocumentAction } from "@/actions/family";
import { SubmitButton } from "@/components/SubmitButton";
import { fullName } from "@/lib/person-utils";

type PersonLite = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
};

type DocLite = {
  id: string;
  title: string;
  type: string;
  year: number | null;
  fileSize: string | null;
  url: string | null;
  description: string | null;
  people: { person: PersonLite }[];
};

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  "birth-cert": { icon: FileText, color: "#5E8050", bg: "#E0EAD8", label: "Birth Certificate" },
  "marriage-cert": { icon: Heart, color: "#8B5E3C", bg: "#F5EDE4", label: "Marriage Certificate" },
  "death-cert": { icon: HeartOff, color: "#7A6352", bg: "#EAE0D5", label: "Death Certificate" },
  immigration: { icon: Ship, color: "#6050A0", bg: "#E8E4F5", label: "Immigration Record" },
  other: { icon: ClipboardList, color: "#7A7058", bg: "#F0EDE4", label: "Document" },
};

const CATEGORIES = [
  { id: "all", label: "All Documents" },
  { id: "birth-cert", label: "Birth Certificates" },
  { id: "marriage-cert", label: "Marriage Certificates" },
  { id: "death-cert", label: "Death Certificates" },
  { id: "immigration", label: "Immigration" },
  { id: "other", label: "Other Records" },
] as const;

const initialState: ActionState = {};
const inputClass =
  "w-full rounded-md border border-[var(--line)] bg-[var(--cream-100)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2";

export function DocumentsBrowser({ documents }: { documents: DocLite[] }) {
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [state, formAction] = useActionState(createDocumentAction, initialState);

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const matchCat = category === "all" || d.type === category;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [documents, category, search]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-[var(--ink)]">Documents</h1>
          <p className="mt-0.5 text-[13px] text-[var(--muted)]">
            {documents.length} documents preserved in your family archive
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-deep)] px-4 py-2 text-sm font-medium text-[#FDFAF6]"
        >
          <Upload size={14} />
          Add Document
        </button>
      </div>

      {showForm && (
        <form
          action={formAction}
          className="grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:grid-cols-2"
        >
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--muted)]">Title</span>
            <input name="title" required className={inputClass} />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--muted)]">Type</span>
            <select name="type" required className={inputClass} defaultValue="other">
              {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--muted)]">Year</span>
            <input name="year" placeholder="e.g. 1942" className={inputClass} />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--muted)]">File size</span>
            <input name="fileSize" placeholder="e.g. 2.4 MB" className={inputClass} />
          </label>
          <label className="block space-y-1.5 text-sm sm:col-span-2">
            <span className="text-[var(--muted)]">URL</span>
            <input name="url" type="url" placeholder="https://…" className={inputClass} />
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
            <SubmitButton label="Add document" />
          </div>
        </form>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="shrink-0 lg:w-48">
          <nav className="space-y-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  category === cat.id
                    ? "bg-[#F5EDE4] font-semibold text-[var(--accent-deep)]"
                    : "text-[var(--muted)] hover:bg-[var(--cream-100)]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="relative">
            <Search
              size={14}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents…"
              className="w-full rounded-lg border border-[var(--line)] bg-[var(--panel)] py-2 pr-3 pl-9 text-sm outline-none"
            />
          </div>

          <div className="text-xs text-[var(--muted)]">
            {filtered.length} document{filtered.length !== 1 ? "s" : ""}
          </div>

          <div className="space-y-3">
            {filtered.map((doc) => {
              const cfg = TYPE_CONFIG[doc.type] ?? TYPE_CONFIG.other;
              return (
                <div
                  key={doc.id}
                  className="flex items-start gap-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 transition-all hover:shadow-sm"
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px]"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    <cfg.icon size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-display text-sm font-semibold text-[var(--ink)]">
                        {doc.title}
                      </h2>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    {doc.description && (
                      <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--muted)]">
                        {doc.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {doc.year && <span className="text-[11px] text-[var(--muted)]">{doc.year}</span>}
                      {doc.fileSize && (
                        <span className="text-[11px] text-[var(--muted)]">{doc.fileSize}</span>
                      )}
                      {doc.people.map(({ person }) => (
                        <Link
                          key={person.id}
                          href={`/documents?person=${person.id}`}
                          className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          {fullName(person)}
                        </Link>
                      ))}
                    </div>
                  </div>
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--line)]"
                      aria-label="Open document"
                    >
                      <Download size={12} className="text-[var(--muted)]" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] py-16 text-center">
              <p className="font-medium text-[var(--ink)]">No documents found</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Upload important family records to preserve them.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
