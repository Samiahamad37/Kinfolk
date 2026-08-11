"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/auth";
import { createRelationshipAction } from "@/actions/relationships";
import { SubmitButton } from "@/components/SubmitButton";

type PersonOption = { id: string; name: string };

type Props = {
  currentPersonId: string;
  people: PersonOption[];
};

const initialState: ActionState = {};

export function RelationshipForm({ currentPersonId, people }: Props) {
  const [state, formAction] = useActionState(createRelationshipAction, initialState);
  const others = people.filter((p) => p.id !== currentPersonId);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="fromPersonId" value={currentPersonId} />
      <label className="block space-y-1.5 text-sm">
        <span className="text-[var(--muted)]">Relationship</span>
        <select
          name="type"
          required
          className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--accent)] focus:ring-2"
        >
          <option value="PARENT">Parent of…</option>
          <option value="SPOUSE">Spouse of…</option>
        </select>
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="text-[var(--muted)]">Related person</span>
        <select
          name="toPersonId"
          required
          className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--accent)] focus:ring-2"
        >
          <option value="">Select person</option>
          {others.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1.5 text-sm sm:col-span-2">
        <span className="text-[var(--muted)]">Notes</span>
        <input
          name="notes"
          className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--accent)] focus:ring-2"
        />
      </label>
      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 sm:col-span-2">
          {state.success}
        </p>
      )}
      <div className="sm:col-span-2">
        <SubmitButton label="Add relationship" />
      </div>
    </form>
  );
}
