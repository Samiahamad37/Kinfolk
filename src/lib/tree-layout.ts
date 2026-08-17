import type { Person, Relationship } from "@/generated/prisma/client";

export type LayoutPerson = Pick<
  Person,
  "id" | "firstName" | "middleName" | "lastName" | "birthDate" | "deathDate" | "occupation" | "gender"
>;

export type TreeLayout = {
  positions: Record<string, { cx: number; y: number }>;
  couples: Array<{ id: string; p1: string; p2: string | null; children: string[] }>;
  canvasWidth: number;
  canvasHeight: number;
  generations: number[];
  generationOf: Record<string, number>;
};

const CARD_W = 148;
const CARD_H = 84;
const GEN_GAP = 210;
const COL_GAP = 170;

export function buildTreeLayout(
  people: LayoutPerson[],
  relationships: Pick<Relationship, "fromPersonId" | "toPersonId" | "type">[],
): TreeLayout {
  const byId = new Map(people.map((p) => [p.id, p]));
  const parentsOf = new Map<string, string[]>();
  const childrenOf = new Map<string, string[]>();
  const spousesOf = new Map<string, string[]>();

  for (const r of relationships) {
    if (r.type === "PARENT") {
      parentsOf.set(r.toPersonId, [...(parentsOf.get(r.toPersonId) ?? []), r.fromPersonId]);
      childrenOf.set(r.fromPersonId, [...(childrenOf.get(r.fromPersonId) ?? []), r.toPersonId]);
    } else if (r.type === "SPOUSE") {
      spousesOf.set(r.fromPersonId, [...(spousesOf.get(r.fromPersonId) ?? []), r.toPersonId]);
      spousesOf.set(r.toPersonId, [...(spousesOf.get(r.toPersonId) ?? []), r.fromPersonId]);
    }
  }

  // Assign generations from roots (no parents)
  const generationOf: Record<string, number> = {};
  const roots = people.filter((p) => !(parentsOf.get(p.id)?.length));
  const queue = roots.map((p) => ({ id: p.id, gen: 0 }));
  const seen = new Set<string>();

  while (queue.length) {
    const { id, gen } = queue.shift()!;
    if (seen.has(id)) {
      generationOf[id] = Math.min(generationOf[id] ?? gen, gen);
      continue;
    }
    seen.add(id);
    generationOf[id] = gen;
    for (const childId of childrenOf.get(id) ?? []) {
      queue.push({ id: childId, gen: gen + 1 });
    }
    for (const spouseId of spousesOf.get(id) ?? []) {
      if (!seen.has(spouseId)) queue.push({ id: spouseId, gen });
    }
  }

  for (const p of people) {
    if (generationOf[p.id] === undefined) generationOf[p.id] = 0;
  }

  const maxGen = Math.max(0, ...Object.values(generationOf));
  const byGen: string[][] = Array.from({ length: maxGen + 1 }, () => []);
  for (const p of people) {
    byGen[generationOf[p.id]].push(p.id);
  }

  // Build unique couples per generation
  const couples: TreeLayout["couples"] = [];
  const placedInCouple = new Set<string>();

  for (let g = 0; g <= maxGen; g++) {
    for (const id of byGen[g]) {
      if (placedInCouple.has(id)) continue;
      const spouse = (spousesOf.get(id) ?? []).find((s) => generationOf[s] === g && byId.has(s));
      if (spouse && !placedInCouple.has(spouse)) {
        const kids = Array.from(
          new Set([...(childrenOf.get(id) ?? []), ...(childrenOf.get(spouse) ?? [])]),
        ).filter((cid) => byId.has(cid));
        couples.push({ id: `${id}-${spouse}`, p1: id, p2: spouse, children: kids });
        placedInCouple.add(id);
        placedInCouple.add(spouse);
      } else {
        const kids = (childrenOf.get(id) ?? []).filter((cid) => byId.has(cid));
        couples.push({ id, p1: id, p2: null, children: kids });
        placedInCouple.add(id);
      }
    }
  }

  // Position couples left-to-right within each generation
  const positions: Record<string, { cx: number; y: number }> = {};
  let maxX = 400;

  for (let g = 0; g <= maxGen; g++) {
    const genCouples = couples.filter((c) => generationOf[c.p1] === g);
    let x = 120;
    const y = 40 + g * GEN_GAP;

    for (const couple of genCouples) {
      if (couple.p2) {
        positions[couple.p1] = { cx: x, y };
        positions[couple.p2] = { cx: x + COL_GAP, y };
        x += COL_GAP + CARD_W + 40;
      } else {
        positions[couple.p1] = { cx: x, y };
        x += CARD_W + 60;
      }
    }
    maxX = Math.max(maxX, x);
  }

  // Reposition children under parents when possible
  for (const couple of couples) {
    if (!couple.children.length) continue;
    const p1 = positions[couple.p1];
    const p2 = couple.p2 ? positions[couple.p2] : null;
    if (!p1) continue;
    const mid = p2 ? (p1.cx + p2.cx) / 2 : p1.cx;
    const childGen = generationOf[couple.children[0]];
    const childY = 40 + childGen * GEN_GAP;
    const start = mid - ((couple.children.length - 1) * COL_GAP) / 2;
    couple.children.forEach((cid, i) => {
      if (!positions[cid]) return;
      // Only nudge if child isn't part of a spouse pair already carefully placed — keep y, adjust x lightly
      positions[cid] = {
        cx: start + i * COL_GAP,
        y: childY,
      };
      maxX = Math.max(maxX, positions[cid].cx + CARD_W);
    });
  }

  return {
    positions,
    couples,
    canvasWidth: Math.max(1020, maxX + 120),
    canvasHeight: Math.max(780, 40 + (maxGen + 1) * GEN_GAP + CARD_H),
    generations: Array.from({ length: maxGen + 1 }, (_, i) => i),
    generationOf,
  };
}

export { CARD_W, CARD_H };
