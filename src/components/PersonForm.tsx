"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

type PersonValues = {
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  gender?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  birthPlace?: string | null;
  deathPlace?: string | null;
  occupation?: string | null;
  education?: string | null;
  biography?: string | null;
  email?: string | null;
  phone?: string | null;
  privacy?: string | null;
};

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  initial?: PersonValues;
  submitLabel: string;
};

const initialState: ActionState = {};

export function PersonForm({ action, initial, submitLabel }: Props) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <Field label="First name" name="firstName" required defaultValue={initial?.firstName} />
      <Field label="Middle name" name="middleName" defaultValue={initial?.middleName ?? ""} />
      <Field label="Last name" name="lastName" required defaultValue={initial?.lastName} />
      <label className="block space-y-1.5 text-sm">
        <span className="text-[var(--muted)]">Gender</span>
        <select
          name="gender"
          defaultValue={initial?.gender ?? ""}
          className="w-full rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          <option value="">Prefer not to say</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
        </select>
      </label>
      <Field label="Birth date" name="birthDate" type="date" defaultValue={initial?.birthDate ?? ""} />
      <Field label="Death date" name="deathDate" type="date" defaultValue={initial?.deathDate ?? ""} />
      <Field label="Birth place" name="birthPlace" defaultValue={initial?.birthPlace ?? ""} />
      <Field label="Death place" name="deathPlace" defaultValue={initial?.deathPlace ?? ""} />
      <Field label="Occupation" name="occupation" defaultValue={initial?.occupation ?? ""} />
      <Field label="Education" name="education" defaultValue={initial?.education ?? ""} />
      <Field label="Email" name="email" type="email" defaultValue={initial?.email ?? ""} />
      <Field label="Phone" name="phone" defaultValue={initial?.phone ?? ""} />
      <label className="block space-y-1.5 text-sm">
        <span className="text-[var(--muted)]">Privacy</span>
        <select
          name="privacy"
          defaultValue={initial?.privacy ?? "family"}
          className="w-full rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          <option value="public">Public</option>
          <option value="family">Family only</option>
          <option value="close-family">Close family</option>
          <option value="private">Private</option>
        </select>
      </label>
      <label className="block space-y-1.5 text-sm sm:col-span-2">
        <span className="text-[var(--muted)]">Biography</span>
        <textarea
          name="biography"
          rows={4}
          defaultValue={initial?.biography ?? ""}
          className="w-full rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      </label>
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{state.error}</p>
      )}
      <div className="sm:col-span-2">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  className = "",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`block space-y-1.5 text-sm ${className}`}>
      <span className="text-[var(--muted)]">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--accent)]"
      />
    </label>
  );
}
