"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

type Member = {
  id: string;
  name: string;
  username: string;
  role: string;
};

type Props = {
  members: Member[];
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
};

const initialState: ActionState = {};

export function MembersAdmin({ members, action }: Props) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="font-display text-4xl text-[var(--ink)]">Family access</h1>
        <p className="mt-2 text-[var(--muted)]">
          Create login details for relatives who should share this family tree.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <form action={formAction} className="space-y-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
          <h2 className="font-display text-xl text-[var(--ink)]">Add a family member</h2>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--muted)]">Name</span>
            <input name="name" required className="w-full rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--accent)]" />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--muted)]">Username</span>
            <input name="username" required minLength={3} className="w-full rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--accent)]" />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--muted)]">Temporary password</span>
            <input name="password" type="password" required minLength={6} className="w-full rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--accent)]" />
          </label>
          {state.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
          {state.success && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">{state.success}</p>}
          <SubmitButton label="Create login" pendingLabel="Creating..." />
        </form>

        <section className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]">
          <div className="border-b border-[var(--line)] px-5 py-4 text-sm font-semibold text-[var(--ink)]">
            People with access
          </div>
          <div className="divide-y divide-[var(--line)]">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <div className="text-sm font-medium text-[var(--ink)]">{member.name}</div>
                  <div className="text-xs text-[var(--muted)]">@{member.username}</div>
                </div>
                <span className="rounded-full bg-[var(--cream-100)] px-2.5 py-1 text-xs text-[var(--muted)]">{member.role === "ADMIN" ? "Admin" : "Member"}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
