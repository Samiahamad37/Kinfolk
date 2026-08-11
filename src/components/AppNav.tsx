import Link from "next/link";
import { logoutAction } from "@/actions/auth";

type Props = {
  userName: string;
};

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/people", label: "People" },
  { href: "/tree", label: "Tree" },
  { href: "/records", label: "Records" },
];

export function AppNav({ userName }: Props) {
  return (
    <header className="border-b border-[var(--line)] bg-[var(--panel)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/dashboard" className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[var(--ink)]">
          Kinfolk
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-[var(--ink)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-[var(--muted)] sm:inline">{userName}</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[var(--accent-deep)]"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-4 overflow-x-auto px-4 pb-3 text-sm text-[var(--muted)] md:hidden sm:px-6">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="whitespace-nowrap hover:text-[var(--ink)]">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
