import { createPersonAction } from "@/actions/people";
import { PersonForm } from "@/components/PersonForm";

export default function NewPersonPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="font-display text-4xl text-[var(--ink)]">Add a person</h1>
        <p className="mt-2 text-[var(--muted)]">
          Capture identity details, places, and a short biography.
        </p>
      </div>
      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
        <PersonForm action={createPersonAction} submitLabel="Create person" />
      </div>
    </div>
  );
}
