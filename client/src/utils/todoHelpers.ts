import type { ChecklistItem } from "../type";

export function parseChecklist(taskStr: string): ChecklistItem[] | null {
  if (!taskStr) return null;

  try {
    const parsed = JSON.parse(taskStr);
    if (Array.isArray(parsed)) return parsed;
  } catch (error) {
    return null;
  }

  return [];
}
