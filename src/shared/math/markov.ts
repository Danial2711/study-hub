/** Finite discrete-time Markov chain analysis. P is row-stochastic: P[i][j] = P(X_{n+1}=j | X_n=i). */
import { gcd, solve, vecMat, type Matrix, type Vector } from './linalg';
import type { Rng } from './random';
import { sampleIndex } from './random';

export function validateStochastic(P: Matrix, eps = 1e-6): { ok: boolean; badRows: number[] } {
  const badRows: number[] = [];
  P.forEach((row, i) => {
    const s = row.reduce((a, b) => a + b, 0);
    if (Math.abs(s - 1) > eps || row.some((x) => x < -eps)) badRows.push(i);
  });
  return { ok: badRows.length === 0, badRows };
}

export function step(pi: Vector, P: Matrix): Vector {
  return vecMat(pi, P);
}

export function distributionAfter(pi0: Vector, P: Matrix, n: number): Vector[] {
  const out = [pi0];
  let cur = pi0;
  for (let k = 0; k < n; k++) {
    cur = step(cur, P);
    out.push(cur);
  }
  return out;
}

/** Tarjan SCC. Returns component index per state and the list of components. */
export function scc(P: Matrix): { comp: number[]; comps: number[][] } {
  const n = P.length;
  const index = new Array<number>(n).fill(-1);
  const low = new Array<number>(n).fill(0);
  const onStack = new Array<boolean>(n).fill(false);
  const comp = new Array<number>(n).fill(-1);
  const comps: number[][] = [];
  const stack: number[] = [];
  let idx = 0;
  const strong = (v: number) => {
    index[v] = low[v] = idx++;
    stack.push(v);
    onStack[v] = true;
    for (let w = 0; w < n; w++) {
      if (P[v][w] <= 0) continue;
      if (index[w] === -1) {
        strong(w);
        low[v] = Math.min(low[v], low[w]);
      } else if (onStack[w]) low[v] = Math.min(low[v], index[w]);
    }
    if (low[v] === index[v]) {
      const c: number[] = [];
      let w: number;
      do {
        w = stack.pop()!;
        onStack[w] = false;
        comp[w] = comps.length;
        c.push(w);
      } while (w !== v);
      comps.push(c.sort((a, b) => a - b));
    }
  };
  for (let v = 0; v < n; v++) if (index[v] === -1) strong(v);
  return { comp, comps };
}

export interface StateClass {
  comp: number;
  /** In a bottom SCC (closed communicating class) → recurrent; otherwise transient. */
  recurrent: boolean;
  absorbing: boolean;
  period: number;
}

export interface ChainAnalysis {
  comps: number[][];
  bottom: number[]; // indices into comps
  states: StateClass[];
  irreducible: boolean;
  aperiodic: boolean;
  /** Irreducible & aperiodic (finite chains: ergodic). */
  ergodic: boolean;
}

function periodOf(P: Matrix, members: number[]): number {
  const set = new Set(members);
  const level = new Map<number, number>();
  const start = members[0];
  level.set(start, 0);
  const q = [start];
  let g = 0;
  while (q.length) {
    const u = q.shift()!;
    for (const v of members) {
      if (P[u][v] <= 0 || !set.has(v)) continue;
      if (!level.has(v)) {
        level.set(v, level.get(u)! + 1);
        q.push(v);
      } else g = gcd(g, level.get(u)! + 1 - level.get(v)!);
    }
  }
  return g === 0 ? 0 : g; // 0 = no cycle (single transient state without self-loop)
}

export function analyze(P: Matrix): ChainAnalysis {
  const { comp, comps } = scc(P);
  const isBottom = comps.map((c) => c.every((u) => P[u].every((p, v) => p <= 0 || comp[v] === comp[u])));
  const periods = comps.map((c) => periodOf(P, c));
  const states = P.map((_, i) => ({
    comp: comp[i],
    recurrent: isBottom[comp[i]],
    absorbing: P[i][i] >= 1 - 1e-12,
    period: periods[comp[i]],
  }));
  const irreducible = comps.length === 1;
  const aperiodic = states.every((s) => !s.recurrent || s.period === 1);
  return {
    comps,
    bottom: comps.map((_, i) => i).filter((i) => isBottom[i]),
    states,
    irreducible,
    aperiodic,
    ergodic: irreducible && periods[0] === 1,
  };
}

/** Stationary distribution of the sub-chain restricted to a closed class (or the whole chain if irreducible). */
export function stationaryOn(P: Matrix, members: number[]): Vector | null {
  const m = members.length;
  // Solve π (P_C − I) = 0, Σπ = 1: replace last equation with normalisation.
  const A: Matrix = Array.from({ length: m }, () => new Array<number>(m).fill(0));
  const b = new Array<number>(m).fill(0);
  for (let j = 0; j < m; j++) for (let i = 0; i < m; i++) A[j][i] = P[members[i]][members[j]] - (i === j ? 1 : 0);
  for (let i = 0; i < m; i++) A[m - 1][i] = 1;
  b[m - 1] = 1;
  const x = solve(A, b);
  if (!x) return null;
  const full = new Array<number>(P.length).fill(0);
  members.forEach((s, i) => (full[s] = Math.abs(x[i]) < 1e-14 ? 0 : x[i]));
  return full;
}

/** Unique stationary distribution if the chain has exactly one closed class, else null. */
export function stationary(P: Matrix): Vector | null {
  const a = analyze(P);
  if (a.bottom.length !== 1) return null;
  return stationaryOn(P, a.comps[a.bottom[0]]);
}

/** Probability of ever reaching `target` from each state (minimal non-negative solution). */
export function hittingProbabilities(P: Matrix, target: number[]): Vector {
  const n = P.length;
  const T = new Set(target);
  // States that can reach target (backward reachability).
  const canReach = new Set(target);
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < n; i++) {
      if (canReach.has(i)) continue;
      if (P[i].some((p, j) => p > 0 && canReach.has(j))) {
        canReach.add(i);
        changed = true;
      }
    }
  }
  const unknown = [...Array(n).keys()].filter((i) => canReach.has(i) && !T.has(i));
  const h = new Array<number>(n).fill(0);
  target.forEach((t) => (h[t] = 1));
  if (unknown.length) {
    const pos = new Map(unknown.map((s, k) => [s, k]));
    const A = unknown.map((i) => unknown.map((j) => (i === j ? 1 : 0) - P[i][j]));
    const b = unknown.map((i) => target.reduce((s, t) => s + P[i][t], 0));
    const x = solve(A, b);
    if (x) unknown.forEach((s) => (h[s] = Math.min(1, Math.max(0, x[pos.get(s)!]))));
  }
  return h;
}

/** Expected number of steps to reach `target` (∞ where the hitting probability < 1). */
export function expectedHittingTimes(P: Matrix, target: number[]): Vector {
  const n = P.length;
  const h = hittingProbabilities(P, target);
  const T = new Set(target);
  const k = new Array<number>(n).fill(Infinity);
  target.forEach((t) => (k[t] = 0));
  const fin = [...Array(n).keys()].filter((i) => !T.has(i) && h[i] > 1 - 1e-9);
  // A state with h=1 can only move to states with h=1 (else h<1), so the system is closed.
  if (fin.length) {
    const pos = new Map(fin.map((s, i) => [s, i]));
    const A = fin.map((i) => fin.map((j) => (i === j ? 1 : 0) - P[i][j]));
    const b = fin.map(() => 1);
    const x = solve(A, b);
    if (x) fin.forEach((s) => (k[s] = x[pos.get(s)!]));
  }
  return k;
}

/** P(reach target within ≤ n steps) from each state. */
export function boundedReachability(P: Matrix, target: number[], n: number): Vector {
  const T = new Set(target);
  let h = P.map((_, i) => +T.has(i));
  for (let k = 0; k < n; k++) h = P.map((row, i) => (T.has(i) ? 1 : row.reduce((s, p, j) => s + p * h[j], 0)));
  return h;
}

/** Long-run (Cesàro) distribution from an initial distribution: Σ_B P(reach B) · π_B. */
export function limitingFrom(P: Matrix, pi0: Vector): Vector {
  const a = analyze(P);
  const out = new Array<number>(P.length).fill(0);
  for (const b of a.bottom) {
    const members = a.comps[b];
    const pi = stationaryOn(P, members);
    if (!pi) continue;
    const h = hittingProbabilities(P, members);
    const reach = pi0.reduce((s, p, i) => s + p * h[i], 0);
    pi.forEach((v, i) => (out[i] += reach * v));
  }
  return out;
}

/** Simulate a run of length `steps` starting from `start`. */
export function simulate(P: Matrix, start: number, steps: number, rng: Rng): number[] {
  const run = [start];
  let s = start;
  for (let i = 0; i < steps; i++) {
    s = sampleIndex(rng, P[s]);
    run.push(s);
  }
  return run;
}

/** PageRank-style transition matrix from an adjacency list with damping d. */
export function pageRankMatrix(adj: number[][], d = 0.85): Matrix {
  const n = adj.length;
  return adj.map((out) => {
    const row = new Array<number>(n).fill((1 - d) / n);
    if (out.length === 0) return row.map(() => 1 / n);
    for (const j of out) row[j] += d / out.length;
    return row;
  });
}
