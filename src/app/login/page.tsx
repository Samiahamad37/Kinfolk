import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/actions/auth";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-16">
      <Link href="/" className="font-display mb-8 text-2xl text-[var(--ink)]">
        Roots &amp; <span className="text-[var(--accent)]">Relations</span>
      </Link>
      <h1 className="font-display text-3xl text-[var(--ink)]">Welcome back</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Demo: <span className="font-medium text-[var(--ink)]">demo@kinfolk.app</span> /{" "}
        <span className="font-medium text-[var(--ink)]">demo1234</span>
      </p>
      <div className="mt-8 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[0_18px_50px_rgba(44,24,16,0.08)]">
        <AuthForm action={loginAction} mode="login" />
      </div>
      <p className="mt-4 text-sm text-[var(--muted)]">
        New here?{" "}
        <Link href="/register" className="font-medium text-[var(--accent-deep)] hover:underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}
