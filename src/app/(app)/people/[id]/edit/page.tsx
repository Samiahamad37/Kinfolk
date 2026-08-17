import { notFound } from "next/navigation";
import { updatePersonAction } from "@/actions/people";
import { PersonForm } from "@/components/PersonForm";
import { displayName, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPersonPage({ params }: Props) {
  const user = await requireUser();
  const { id } = await params;

  const person = await prisma.person.findFirst({
    where: { id, ownerId: user.id },
  });

  if (!person) notFound();

  const action = updatePersonAction.bind(null, person.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="font-display text-4xl text-[var(--ink)]">Edit {displayName(person)}</h1>
        <p className="mt-2 text-[var(--muted)]">Update personal details and biography.</p>
      </div>
      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
        <PersonForm action={action} initial={person} submitLabel="Save changes" />
      </div>
    </div>
  );
}
