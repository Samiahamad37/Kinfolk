import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildTreeLayout } from "@/lib/tree-layout";
import { MembersBrowser } from "@/components/MembersBrowser";

export default async function PeoplePage() {
  const user = await requireUser();
  const [people, relationships] = await Promise.all([
    prisma.person.findMany({ where: { ownerId: user.id } }),
    prisma.relationship.findMany({ where: { ownerId: user.id } }),
  ]);
  const layout = people.length ? buildTreeLayout(people, relationships) : null;

  return (
    <MembersBrowser
      people={people.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        middleName: p.middleName,
        lastName: p.lastName,
        birthDate: p.birthDate,
        deathDate: p.deathDate,
        birthPlace: p.birthPlace,
        occupation: p.occupation,
        generation: layout?.generationOf[p.id] ?? 0,
      }))}
    />
  );
}
