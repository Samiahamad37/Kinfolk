"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/auth";
import { createRecordAction } from "@/actions/records";
import { SubmitButton } from "@/components/SubmitButton";

type Props = {
  personId: string;
};

const initialState: ActionState = {};

export function RecordForm({ personId }: Props) {
  const [state, formAction] = useActionState(createRecordAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="personId" value={personId} />
      <label className="block space-y-1.5 text-sm">
        <span className="text-[var(--muted)]">Title</span>
        <input
          name="title"
          required
          className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--accent)] focus:ring-2"
        />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="text-[var(--muted)]">Record type</span>
        <select
          name="recordType"
          required
          className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--accent)] focus:ring-2"
        >
          <option value="Birth">Birth</option>
          <option value="Marriage">Marriage</option>
          <option value="Death">Death</option>
          <option value="Census">Census</option>
          <option value="Migration">Migration</option>
          <option value="Military">Military</option>
          <option value="Other">Other</option>
        </select>
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="text-[var(--muted)]">Event date</span>
        <input
          name="eventDate"
          type="date"
          className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--accent)] focus:ring-2"
        />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="text-[var(--muted)]">Location</span>
        <input
          name="location"
          className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--accent)] focus:ring-2"
        />
      </label>
      <label className="block space-y-1.5 text-sm sm:col-span-2">
        <span className="text-[var(--muted)]">Description</span>
        <textarea
          name="description"
          rows={3}
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
        <SubmitButton label="Add record" />
      </div>
    </form>
  );
}
