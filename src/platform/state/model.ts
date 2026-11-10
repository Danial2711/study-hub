/**
 * Persisted app state. Pure functions only (no DOM) so they can be unit-tested
 * and reused by the sync layer.
 *
 * Every leaf record carries `updatedAt` (ms). Merging two states keeps, per
 * record, the newer one — that makes sync between devices order-independent.
 */

export const STATE_VERSION = 1;

export type Theme = 'auto' | 'light' | 'dark';

export interface Settings {
  theme: Theme;
  /** 32-hex code shared between devices. Never synced itself. */
  syncCode?: string;
  mockMinutes?: number;
  updatedAt: number;
}

export interface CardState {
  ease: number;
  /** Days. 0 = learning step. */
  interval: number;
  due: number;
  reps: number;
  lapses: number;
  updatedAt: number;
}

export interface QuestionStat {
  seen: number;
  correct: number;
  lastCorrect: boolean;
  updatedAt: number;
}

export interface ExerciseState {
  status: 'solved' | 'review' | 'none';
  updatedAt: number;
}

export interface ExamRecord {
  id: string;
  at: number;
  minutes: number;
  usedSeconds: number;
  auto: { score: number; max: number };
  written: { score: number; max: number };
  byGroup: Record<string, { score: number; max: number }>;
  /** Blueprint exams: score per part. */
  parts?: Record<string, { score: number; max: number }>;
  /** Estimated grade from the course's grade scale. */
  grade?: string;
  updatedAt: number;
}

export interface Stamp {
  at: number;
  updatedAt: number;
}

export interface CourseProgress {
  cards: Record<string, CardState>;
  questions: Record<string, QuestionStat>;
  exercises: Record<string, ExerciseState>;
  visited: Record<string, Stamp>;
  exams: Record<string, ExamRecord>;
  /** Question ids answered wrong and not yet re-answered correctly (value = when). */
  mistakes: Record<string, { active: boolean; updatedAt: number }>;
  /** Daily activity counter, key = yyyy-mm-dd. */
  activity: Record<string, { n: number; updatedAt: number }>;
  lastPath?: { path: string; updatedAt: number };
  /** Records older than this were wiped by "reset course". */
  resetAt: number;
}

export interface AppState {
  v: number;
  settings: Settings;
  courses: Record<string, CourseProgress>;
}

export const emptyCourse = (): CourseProgress => ({
  cards: {},
  questions: {},
  exercises: {},
  visited: {},
  exams: {},
  mistakes: {},
  activity: {},
  resetAt: 0,
});

export const defaultState = (): AppState => ({
  v: STATE_VERSION,
  settings: { theme: 'auto', updatedAt: 0 },
  courses: {},
});

type Stamped = { updatedAt: number };

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function mergeMap<T extends Stamped>(a: Record<string, T> = {}, b: Record<string, T> = {}, resetAt: number): Record<string, T> {
  const out: Record<string, T> = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[k];
    const y = b[k];
    const win = !x ? y : !y ? x : (y.updatedAt ?? 0) > (x.updatedAt ?? 0) ? y : x;
    if (win && (win.updatedAt ?? 0) >= resetAt) out[k] = win;
  }
  return out;
}

const MAP_KEYS = ['cards', 'questions', 'exercises', 'visited', 'exams', 'mistakes', 'activity'] as const;

export function mergeCourse(a: CourseProgress | undefined, b: CourseProgress | undefined): CourseProgress {
  const x = normalizeCourse(a);
  const y = normalizeCourse(b);
  const resetAt = Math.max(x.resetAt, y.resetAt);
  const out = emptyCourse();
  out.resetAt = resetAt;
  for (const k of MAP_KEYS) {
    (out as unknown as Record<string, unknown>)[k] = mergeMap(
      x[k] as Record<string, Stamped>,
      y[k] as Record<string, Stamped>,
      resetAt,
    );
  }
  const lp = [x.lastPath, y.lastPath].filter(Boolean).sort((p, q) => q!.updatedAt - p!.updatedAt)[0];
  if (lp && lp.updatedAt >= resetAt) out.lastPath = lp;
  return out;
}

/** Merge `remote` into `local`. Local sync code always wins (it is device config). */
export function mergeState(local: AppState, remote: AppState): AppState {
  const l = normalizeState(local);
  const r = normalizeState(remote);
  const newer = r.settings.updatedAt > l.settings.updatedAt ? r.settings : l.settings;
  const settings: Settings = { ...newer, syncCode: l.settings.syncCode };
  const courses: Record<string, CourseProgress> = {};
  for (const id of new Set([...Object.keys(l.courses), ...Object.keys(r.courses)])) {
    courses[id] = mergeCourse(l.courses[id], r.courses[id]);
  }
  return { v: STATE_VERSION, settings, courses };
}

export function normalizeCourse(c: unknown): CourseProgress {
  const out = emptyCourse();
  if (!isObj(c)) return out;
  for (const k of MAP_KEYS) if (isObj(c[k])) (out as unknown as Record<string, unknown>)[k] = c[k];
  if (typeof c.resetAt === 'number') out.resetAt = c.resetAt;
  if (isObj(c.lastPath) && typeof c.lastPath.path === 'string') out.lastPath = c.lastPath as CourseProgress['lastPath'];
  return out;
}

export function normalizeState(s: unknown): AppState {
  const out = defaultState();
  if (!isObj(s)) return out;
  if (isObj(s.settings)) {
    const st = s.settings;
    out.settings = {
      theme: st.theme === 'light' || st.theme === 'dark' ? st.theme : 'auto',
      syncCode: typeof st.syncCode === 'string' && /^[0-9a-f]{32}$/.test(st.syncCode) ? st.syncCode : undefined,
      mockMinutes: typeof st.mockMinutes === 'number' ? st.mockMinutes : undefined,
      updatedAt: typeof st.updatedAt === 'number' ? st.updatedAt : 0,
    };
  }
  if (isObj(s.courses)) {
    for (const [id, c] of Object.entries(s.courses)) out.courses[id] = normalizeCourse(c);
  }
  return out;
}

/** State as uploaded / exported: without the device-local sync code. */
export function stripLocal(s: AppState): AppState {
  return { ...s, settings: { ...s.settings, syncCode: undefined } };
}

export function exportJson(s: AppState): string {
  return JSON.stringify(stripLocal(s), null, 1);
}

export function importJson(text: string, local: AppState): AppState {
  const parsed: unknown = JSON.parse(text);
  if (!isObj(parsed) || !isObj(parsed.courses)) throw new Error('Not a Study Hub backup file');
  return mergeState(local, normalizeState(parsed));
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
