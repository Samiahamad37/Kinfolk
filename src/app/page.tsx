import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-[var(--background)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 20% 10%, rgba(193,126,74,0.18), transparent 50%), radial-gradient(ellipse at 90% 80%, rgba(110,72,40,0.12), transparent 45%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%238B5E3C%22 fill-opacity=%220.04%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <p className="font-display text-2xl text-[var(--ink)]">
          Roots &amp; <span className="text-[var(--accent)]">Relations</span>
        </p>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-deep)]"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 pt-10 pb-20 sm:px-6">
        <p className="text-sm font-semibold tracking-[0.22em] text-[var(--accent)] uppercase">
          Family Tree Management
        </p>
        <h1 className="font-display mt-4 max-w-3xl text-5xl leading-[1.05] text-[var(--ink)] sm:text-6xl">
          Preserve your family story
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--muted)]">
          Build an interactive tree, gather photos and documents, and keep generations of memories
          in one warm genealogy workspace.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent-deep)]"
          >
            Start your tree
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-[var(--line)] bg-[var(--panel)]/80 px-5 py-3 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--panel)]"
          >
            Sign in
          </Link>
        </div>
        <p className="mt-6 text-sm text-[var(--muted)]">
          Try the demo:{" "}
          <span className="font-medium text-[var(--ink)]">demo@kinfolk.app</span> /{" "}
          <span className="font-medium text-[var(--ink)]">demo1234</span>
        </p>
      </section>
    </main>
  );
}
