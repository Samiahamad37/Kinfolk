import Link from "next/link";
import type { TreeNode } from "@/lib/tree";

export function TreeView({ root }: { root: TreeNode }) {
  return (
    <div className="space-y-10">
      {root.parents.length > 0 && (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Parents
          </h3>
          <div className="flex flex-wrap gap-3">
            {root.parents.map((parent) => (
              <PersonChip key={parent.id} node={parent} />
            ))}
          </div>
        </section>
      )}

      <section className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[0_18px_50px_rgba(27,42,51,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Focus person
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          {root.name}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {[root.birthDate, root.deathDate].filter(Boolean).join(" — ") || "Dates unknown"}
        </p>
        {root.spouses.length > 0 && (
          <p className="mt-3 text-sm text-[var(--muted)]">
            Spouse{root.spouses.length > 1 ? "s" : ""}:{" "}
            {root.spouses.map((s, i) => (
              <span key={s.id}>
                {i > 0 && ", "}
                <Link href={`/people/${s.id}`} className="text-[var(--accent-deep)] underline-offset-2 hover:underline">
                  {s.name}
                </Link>
              </span>
            ))}
          </p>
        )}
        <Link
          href={`/people/${root.id}`}
          className="mt-4 inline-block text-sm font-medium text-[var(--accent-deep)] hover:underline"
        >
          Open profile →
        </Link>
      </section>

      {root.children.length > 0 && (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Children
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {root.children.map((child) => (
              <div
                key={child.id}
                className="rounded-xl border border-[var(--line)] bg-white/70 p-4"
              >
                <PersonChip node={child} />
                {child.children.length > 0 && (
                  <div className="mt-3 border-t border-[var(--line)] pt-3">
                    <p className="mb-2 text-xs uppercase tracking-wider text-[var(--muted)]">
                      Grandchildren
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {child.children.map((gc) => (
                        <PersonChip key={gc.id} node={gc} compact />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PersonChip({ node, compact = false }: { node: TreeNode; compact?: boolean }) {
  return (
    <Link
      href={`/people/${node.id}`}
      className={`inline-flex flex-col rounded-lg border border-[var(--line)] bg-[var(--panel)] transition hover:border-[var(--accent)] hover:shadow-sm ${
        compact ? "px-2.5 py-1.5" : "px-3 py-2"
      }`}
    >
      <span className={`font-medium text-[var(--ink)] ${compact ? "text-sm" : "text-base"}`}>
        {node.name}
      </span>
      {!compact && (
        <span className="text-xs text-[var(--muted)]">
          {[node.birthDate, node.deathDate].filter(Boolean).join(" — ") || "—"}
        </span>
      )}
    </Link>
  );
}
