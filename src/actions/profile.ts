"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fullName, initials, isLiving, age, parseYear, avatarColor } from "@/lib/person-utils";

export async function getPersonProfile(personId: string) {
  const user = await requireUser();
  const person = await prisma.person.findFirst({
    where: { id: personId, ownerId: user.accountOwnerId },
    include: {
      photoLinks: { include: { photo: true }, take: 6 },
      eventLinks: { include: { event: true }, take: 8 },
      records: { orderBy: { eventDate: "asc" }, take: 8 },
    },
  });
  if (!person) return null;

  const relationships = await prisma.relationship.findMany({
    where: { ownerId: user.accountOwnerId },
  });
  const people = await prisma.person.findMany({ where: { ownerId: user.accountOwnerId } });
  const byId = new Map(people.map((p) => [p.id, p]));

  const parentIds = relationships
    .filter((r) => r.type === "PARENT" && r.toPersonId === personId)
    .map((r) => r.fromPersonId);
  const childIds = relationships
    .filter((r) => r.type === "PARENT" && r.fromPersonId === personId)
    .map((r) => r.toPersonId);
  const spouseIds = relationships
    .filter(
      (r) =>
        r.type === "SPOUSE" && (r.fromPersonId === personId || r.toPersonId === personId),
    )
    .map((r) => (r.fromPersonId === personId ? r.toPersonId : r.fromPersonId));

  const siblingIds = new Set<string>();
  for (const pid of parentIds) {
    for (const r of relationships) {
      if (r.type === "PARENT" && r.fromPersonId === pid && r.toPersonId !== personId) {
        siblingIds.add(r.toPersonId);
      }
    }
  }

  function mini(id: string) {
    const p = byId.get(id);
    if (!p) return null;
    return {
      id: p.id,
      name: fullName(p),
      initials: initials(p),
      color: avatarColor(0),
    };
  }

  return {
    id: person.id,
    name: fullName(person),
    initials: initials(person),
    color: avatarColor(0),
    firstName: person.firstName,
    lastName: person.lastName,
    gender: person.gender,
    birthDate: person.birthDate,
    deathDate: person.deathDate,
    birthPlace: person.birthPlace,
    deathPlace: person.deathPlace,
    occupation: person.occupation,
    education: person.education,
    biography: person.biography,
    email: person.email,
    phone: person.phone,
    privacy: person.privacy,
    living: isLiving(person),
    age: age(person),
    birthYear: parseYear(person.birthDate),
    deathYear: parseYear(person.deathDate),
    parents: parentIds.map(mini).filter(Boolean),
    spouses: spouseIds.map(mini).filter(Boolean),
    children: childIds.map(mini).filter(Boolean),
    siblings: [...siblingIds].map(mini).filter(Boolean),
    photos: person.photoLinks.map((l) => ({
      id: l.photo.id,
      url: l.photo.url,
      title: l.photo.title,
    })),
    events: [
      ...person.eventLinks.map((l) => ({
        id: l.event.id,
        title: l.event.title,
        date: l.event.date,
        type: l.event.type,
      })),
      ...person.records.map((r) => ({
        id: r.id,
        title: r.title,
        date: r.eventDate ?? "",
        type: r.recordType,
      })),
    ],
  };
}
