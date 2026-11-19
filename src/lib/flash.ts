// One-shot messages from a sheet to the screen underneath, e.g. the join sheet (08)
// telling the task detail to show «انضممت للمهمة، بالتوفيق!» (09).
// In memory only: a reload or leaving the screen drops them.
import { useEffect, useSyncExternalStore } from 'react';

type Flash = 'joined';

const flashes = new Map<number, Flash>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function setTaskFlash(taskId: number, flash: Flash) {
  flashes.set(taskId, flash);
  emit();
}

/** The flash for a task. Cleared when the screen showing it unmounts. */
export function useTaskFlash(taskId: number): Flash | undefined {
  const flash = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => flashes.get(taskId),
  );
  useEffect(
    () => () => {
      if (flashes.delete(taskId)) emit();
    },
    [taskId],
  );
  return flash;
}

/** Drop a task's flash (e.g. after leaving the task). */
export function clearTaskFlash(taskId: number) {
  if (flashes.delete(taskId)) emit();
}
