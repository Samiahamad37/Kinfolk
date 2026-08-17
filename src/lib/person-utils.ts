export type PersonLike = {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  birthDate?: string | null;
  deathDate?: string | null;
  occupation?: string | null;
  gender?: string | null;
};

export function fullName(person: PersonLike) {
  return [person.firstName, person.middleName, person.lastName].filter(Boolean).join(" ");
}

export function initials(person: PersonLike) {
  return `${person.firstName[0] ?? ""}${person.lastName[0] ?? ""}`.toUpperCase();
}

export function parseYear(date?: string | null): number | undefined {
  if (!date) return undefined;
  const match = date.match(/(\d{4})/);
  return match ? Number(match[1]) : undefined;
}

export function isLiving(person: Pick<PersonLike, "deathDate">) {
  return !person.deathDate;
}

export function age(person: Pick<PersonLike, "birthDate" | "deathDate">) {
  const birth = parseYear(person.birthDate);
  if (!birth) return undefined;
  const end = parseYear(person.deathDate) ?? new Date().getFullYear();
  return end - birth;
}

const GEN_COLORS = ["#6E4828", "#8B5E3C", "#A67B52", "#C49A78"];

export function avatarColor(generation = 0) {
  return GEN_COLORS[Math.min(Math.max(generation, 0), GEN_COLORS.length - 1)];
}

export function generationLabel(generation: number) {
  return ["Grandparents", "Parents", "Our Generation", "Children"][generation] ?? `Gen ${generation + 1}`;
}
