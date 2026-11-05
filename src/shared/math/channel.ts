/** Discrete memoryless channels. W[x][y] = P(Y = y | X = x). */
import { binaryEntropy, entropy } from './info';
import { choose } from './distributions';

export const bscCapacity = (p: number) => 1 - binaryEntropy(p);
export const becCapacity = (alpha: number) => 1 - alpha;

export function bscMatrix(p: number): number[][] {
  return [
    [1 - p, p],
    [p, 1 - p],
  ];
}

export function becMatrix(a: number): number[][] {
  return [
    [1 - a, a, 0],
    [0, a, 1 - a],
  ];
}

/** I(X;Y) for input distribution px through channel W. */
export function mutualInfoChannel(px: readonly number[], W: number[][]): number {
  const py = W[0].map((_, y) => px.reduce((s, p, x) => s + p * W[x][y], 0));
  const HYgX = px.reduce((s, p, x) => s + p * entropy(W[x]), 0);
  return Math.max(0, entropy(py) - HYgX);
}

/** Blahut–Arimoto algorithm for channel capacity (bits). */
export function blahutArimoto(W: number[][], iters = 2000, tol = 1e-10): { capacity: number; px: number[] } {
  const nx = W.length;
  const ny = W[0].length;
  let px = new Array<number>(nx).fill(1 / nx);
  let cap = 0;
  for (let it = 0; it < iters; it++) {
    const py = new Array<number>(ny).fill(0);
    for (let x = 0; x < nx; x++) for (let y = 0; y < ny; y++) py[y] += px[x] * W[x][y];
    const c = px.map((_, x) => {
      let s = 0;
      for (let y = 0; y < ny; y++) if (W[x][y] > 0) s += W[x][y] * Math.log2(W[x][y] / py[y]);
      return 2 ** s;
    });
    const z = px.reduce((s, p, x) => s + p * c[x], 0);
    const lower = Math.log2(z);
    const upper = Math.log2(Math.max(...c));
    px = px.map((p, x) => (p * c[x]) / z);
    cap = lower;
    if (upper - lower < tol) break;
  }
  return { capacity: cap, px };
}

/** Is W symmetric (rows are permutations of each other and columns are permutations of each other)? */
export function isSymmetric(W: number[][]): boolean {
  const key = (r: number[]) => [...r].sort((a, b) => a - b).map((x) => x.toFixed(9)).join(',');
  const rows = new Set(W.map(key));
  const cols = new Set(W[0].map((_, y) => key(W.map((r) => r[y]))));
  return rows.size === 1 && cols.size === 1;
}

/** Weakly symmetric: rows are permutations of each other and all column sums equal. */
export function isWeaklySymmetric(W: number[][]): boolean {
  const key = (r: number[]) => [...r].sort((a, b) => a - b).map((x) => x.toFixed(9)).join(',');
  const rows = new Set(W.map(key));
  const sums = W[0].map((_, y) => W.reduce((s, r) => s + r[y], 0).toFixed(9));
  return rows.size === 1 && new Set(sums).size === 1;
}

/** Bit error rate of an n-fold repetition code (n odd) with majority decoding on BSC(p). */
export function repetitionErrorRate(n: number, p: number): number {
  let s = 0;
  for (let k = Math.floor(n / 2) + 1; k <= n; k++) s += choose(n, k) * p ** k * (1 - p) ** (n - k);
  return s;
}
