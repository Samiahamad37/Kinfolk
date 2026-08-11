import { prisma } from "@/lib/prisma";
import { displayName } from "@/lib/auth";

export type TreeNode = {
  id: string;
  name: string;
  birthDate: string | null;
  deathDate: string | null;
  gender: string | null;
  parents: TreeNode[];
  children: TreeNode[];
  spouses: { id: string; name: string }[];
};

export async function buildFamilyTree(ownerId: string, rootId: string, depth = 3) {
  const people = await prisma.person.findMany({ where: { ownerId } });
  const relationships = await prisma.relationship.findMany({ where: { ownerId } });

  const byId = new Map(people.map((p) => [p.id, p]));
  if (!byId.has(rootId)) return null;

  const parentsOf = new Map<string, string[]>();
  const childrenOf = new Map<string, string[]>();
  const spousesOf = new Map<string, string[]>();

  for (const rel of relationships) {
    if (rel.type === "PARENT") {
      parentsOf.set(rel.toPersonId, [
        ...(parentsOf.get(rel.toPersonId) ?? []),
        rel.fromPersonId,
      ]);
      childrenOf.set(rel.fromPersonId, [
        ...(childrenOf.get(rel.fromPersonId) ?? []),
        rel.toPersonId,
      ]);
    }
    if (rel.type === "SPOUSE") {
      spousesOf.set(rel.fromPersonId, [
        ...(spousesOf.get(rel.fromPersonId) ?? []),
        rel.toPersonId,
      ]);
      spousesOf.set(rel.toPersonId, [
        ...(spousesOf.get(rel.toPersonId) ?? []),
        rel.fromPersonId,
      ]);
    }
  }

  function nodeFor(id: string, remaining: number, visiting: Set<string>): TreeNode {
    const person = byId.get(id)!;
    const nextVisiting = new Set(visiting);
    nextVisiting.add(id);

    const spouses = (spousesOf.get(id) ?? [])
      .map((sid) => byId.get(sid))
      .filter(Boolean)
      .map((p) => ({ id: p!.id, name: displayName(p!) }));

    if (remaining <= 0) {
      return {
        id: person.id,
        name: displayName(person),
        birthDate: person.birthDate,
        deathDate: person.deathDate,
        gender: person.gender,
        parents: [],
        children: [],
        spouses,
      };
    }

    const parents = (parentsOf.get(id) ?? [])
      .filter((pid) => !nextVisiting.has(pid))
      .map((pid) => nodeFor(pid, remaining - 1, nextVisiting));

    const children = (childrenOf.get(id) ?? [])
      .filter((cid) => !nextVisiting.has(cid))
      .map((cid) => nodeFor(cid, remaining - 1, nextVisiting));

    return {
      id: person.id,
      name: displayName(person),
      birthDate: person.birthDate,
      deathDate: person.deathDate,
      gender: person.gender,
      parents,
      children,
      spouses,
    };
  }

  return nodeFor(rootId, depth, new Set());
}
