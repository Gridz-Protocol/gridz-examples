const KEY = "gridz:recent:";
const MAX = 8;

export function listRecentProfiles(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function rememberProfile(ensName: string): void {
  const subject = ensName.toLowerCase();
  const prev = listRecentProfiles().filter((s) => s !== subject);
  localStorage.setItem(KEY, JSON.stringify([subject, ...prev].slice(0, MAX)));
}
