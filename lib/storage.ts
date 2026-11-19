const SAVED_KEY = "internbd_saved";

export function getSavedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isSaved(id: string): boolean {
  return getSavedIds().includes(id);
}

export function toggleSaved(id: string): boolean {
  if (typeof window === "undefined") return false;
  const saved = getSavedIds();
  const next = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
  localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  return !saved.includes(id);
}

export function getSavedCount(): number {
  return getSavedIds().length;
}