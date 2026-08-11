import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction } from "@/actions/auth";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-16">
      <Link href="/" className="mb-8 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
        Kinfolk
      </Link>
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
        Create your workspace
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Start documenting people, relationships, and historical records.
      </p>
      <div className="mt-8 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[0_18px_50px_rgba(27,42,51,0.06)]">
        <AuthForm action={registerAction} mode="register" />
      </div>
      <p className="mt-4 text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[var(--accent-deep)] hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
