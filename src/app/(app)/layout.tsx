import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <AppShell userName={user.name} userInitials={initials}>
        {children}
      </AppShell>
    </Suspense>
  );
}
