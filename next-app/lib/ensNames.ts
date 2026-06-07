const DEFAULT_BASE = process.env.GRIDZ_ENS_BASE ?? process.env.NEXT_PUBLIC_GRIDZ_ENS_BASE ?? "gridz.eth";

/** Map an entity alias to its ENS subname, e.g. "bot" → "bot.gridz.eth". */
export function toEnsSubname(alias: string, base: string = DEFAULT_BASE): string {
  const clean = alias.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!clean) throw new Error("alias must contain at least one letter, digit, or hyphen");
  return `${clean}.${base}`;
}

export function isEnsSubject(subject: string): boolean {
  return subject.includes(".") && !subject.startsWith("did:");
}
