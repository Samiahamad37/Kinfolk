"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "login" | "register";
};

const initialState: ActionState = {};

export function AuthForm({ action, mode }: Props) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {mode === "register" && (
        <label className="block space-y-1.5 text-sm">
          <span className="text-[var(--muted)]">Name</span>
          <input
            name="name"
            required
            className="w-full rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
      )}
      <label className="block space-y-1.5 text-sm">
        <span className="text-[var(--muted)]">Username or email</span>
        <input
          name="username"
          required
          className="w-full rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 outline-none ring-[var(--accent)] focus:ring-2"
        />
      </label>
      {mode === "register" && (
        <label className="block space-y-1.5 text-sm">
          <span className="text-[var(--muted)]">Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
      )}
      <label className="block space-y-1.5 text-sm">
        <span className="text-[var(--muted)]">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={mode === "register" ? 6 : 1}
          className="w-full rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 outline-none ring-[var(--accent)] focus:ring-2"
        />
      </label>
      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      <SubmitButton
        label={mode === "login" ? "Sign in" : "Create account"}
        pendingLabel={mode === "login" ? "Signing in…" : "Creating…"}
        className="w-full"
      />
    </form>
  );
}
