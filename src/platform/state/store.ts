import { useSyncExternalStore } from 'react';
import {
  defaultState,
  emptyCourse,
  mergeState,
  normalizeState,
  stripLocal,
  todayKey,
  type AppState,
  type CourseProgress,
  type Settings,
} from './model';

const KEY = 'studyhub.state';

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? normalizeState(JSON.parse(raw)) : defaultState();
  } catch {
    return defaultState();
  }
}

let state: AppState = typeof localStorage === 'undefined' ? defaultState() : load();
const listeners = new Set<() => void>();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked: keep working in memory */
  }
}

function emit() {
  for (const l of listeners) l();
}

export function getState(): AppState {
  return state;
}

export function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Replace the whole state (used by import and sync). */
export function replaceState(next: AppState, opts: { push?: boolean } = {}) {
  state = next;
  save();
  emit();
  if (opts.push !== false) schedulePush();
}

export function updateSettings(patch: Partial<Settings>) {
  replaceState({ ...state, settings: { ...state.settings, ...patch, updatedAt: Date.now() } });
}

/** Immutable-ish update of one course's progress. `fn` may mutate the copy. */
export function updateCourse(courseId: string, fn: (c: CourseProgress) => void) {
  const prev = state.courses[courseId] ?? emptyCourse();
  const copy: CourseProgress = structuredClone(prev);
  fn(copy);
  replaceState({ ...state, courses: { ...state.courses, [courseId]: copy } });
}

export function bumpActivity(c: CourseProgress, n = 1) {
  const k = todayKey();
  c.activity[k] = { n: (c.activity[k]?.n ?? 0) + n, updatedAt: Date.now() };
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function useCourseProgress(courseId: string): CourseProgress {
  const s = useAppState();
  return s.courses[courseId] ?? EMPTY;
}
const EMPTY = emptyCourse();

/* ------------------------------------------------------------------ sync */

export type SyncStatus = 'off' | 'pending' | 'syncing' | 'synced' | 'offline' | 'error';
let syncStatus: SyncStatus = 'off';
let lastSyncAt = 0;
const syncListeners = new Set<() => void>();
const setSync = (s: SyncStatus) => {
  syncStatus = s;
  if (s === 'synced') lastSyncAt = Date.now();
  for (const l of syncListeners) l();
};
export function useSyncStatus(): { status: SyncStatus; lastSyncAt: number } {
  const status = useSyncExternalStore(
    (l) => {
      syncListeners.add(l);
      return () => syncListeners.delete(l);
    },
    () => syncStatus,
    () => syncStatus,
  );
  return { status, lastSyncAt };
}

const apiUrl = (code: string) => `/api/sync/${code}`;
let pushTimer: ReturnType<typeof setTimeout> | undefined;

function schedulePush() {
  if (!state.settings.syncCode) return;
  setSync('pending');
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => void push(), 2500);
}

export async function pull(): Promise<void> {
  const code = state.settings.syncCode;
  if (!code) return setSync('off');
  if (typeof navigator !== 'undefined' && !navigator.onLine) return setSync('offline');
  setSync('syncing');
  try {
    const res = await fetch(apiUrl(code), { cache: 'no-store' });
    if (res.status === 404) {
      await push();
      return;
    }
    if (!res.ok) throw new Error(String(res.status));
    const remote = normalizeState(await res.json());
    const merged = mergeState(state, remote);
    replaceState(merged, { push: false });
    await push();
  } catch {
    setSync('error');
  }
}

export async function push(keepalive = false): Promise<void> {
  const code = state.settings.syncCode;
  if (!code) return setSync('off');
  if (typeof navigator !== 'undefined' && !navigator.onLine) return setSync('offline');
  clearTimeout(pushTimer);
  try {
    const body = JSON.stringify(stripLocal(state));
    setSync('syncing');
    const res = await fetch(apiUrl(code), {
      method: 'PUT',
      body,
      headers: { 'content-type': 'application/json' },
      keepalive: keepalive && body.length < 60_000,
    });
    if (!res.ok) throw new Error(String(res.status));
    setSync('synced');
  } catch {
    setSync('error');
  }
}

export function newSyncCode(): string {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, '0')).join('');
}

let syncInit = false;
export function initSync() {
  if (syncInit || typeof window === 'undefined') return;
  syncInit = true;
  void pull();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && syncStatus === 'pending') void push(true);
    if (document.visibilityState === 'visible') void pull();
  });
  window.addEventListener('online', () => void pull());
  window.addEventListener('offline', () => state.settings.syncCode && setSync('offline'));
  // Another tab changed storage → reload our copy.
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = load();
      emit();
    }
  });
}
