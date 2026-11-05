import type { CardState } from './model';

/** Simplified SM-2 spaced repetition. Grades: 0 again, 1 hard, 2 good, 3 easy. */
export type Grade = 0 | 1 | 2 | 3;

const DAY = 86_400_000;
const MIN = 60_000;

export const newCard = (now: number): CardState => ({ ease: 2.5, interval: 0, due: now, reps: 0, lapses: 0, updatedAt: now });

export function review(card: CardState | undefined, grade: Grade, now = Date.now()): CardState {
  const c = card ? { ...card } : newCard(now);
  c.reps += 1;
  c.updatedAt = now;
  switch (grade) {
    case 0:
      c.lapses += 1;
      c.ease = Math.max(1.3, c.ease - 0.2);
      c.interval = 0;
      c.due = now + 5 * MIN;
      return c;
    case 1:
      c.ease = Math.max(1.3, c.ease - 0.15);
      c.interval = c.interval === 0 ? 0.5 : Math.max(1, c.interval * 1.2);
      break;
    case 2:
      c.interval = c.interval === 0 ? 1 : c.interval < 1.5 ? 3 : c.interval * c.ease;
      break;
    case 3:
      c.ease += 0.15;
      c.interval = c.interval === 0 ? 3 : c.interval * c.ease * 1.3;
      break;
  }
  c.interval = Math.round(c.interval * 10) / 10;
  c.due = now + c.interval * DAY;
  return c;
}

export const isDue = (c: CardState | undefined, now = Date.now()) => !c || c.due <= now;
/** A card counts as "learned" once it has an interval of at least 3 days. */
export const isLearned = (c: CardState | undefined) => !!c && c.interval >= 3;

export function describeInterval(card: CardState | undefined, grade: Grade, now = Date.now()): string {
  const next = review(card, grade, now);
  const ms = next.due - now;
  if (ms < 60 * MIN) return `${Math.round(ms / MIN)}m`;
  if (ms < DAY) return `${Math.round(ms / (60 * MIN))}h`;
  const d = ms / DAY;
  if (d < 30) return `${Math.round(d)}d`;
  return `${Math.round(d / 30)}mo`;
}
