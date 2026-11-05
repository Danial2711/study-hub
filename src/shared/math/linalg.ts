export type Matrix = number[][];
export type Vector = number[];

/** Solve A x = b by Gaussian elimination with partial pivoting. Returns null if singular. */
export function solve(A: Matrix, b: Vector): Vector | null {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    if (Math.abs(M[piv][c]) < 1e-12) return null;
    [M[c], M[piv]] = [M[piv], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      if (f === 0) continue;
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}

export const vecMat = (v: Vector, P: Matrix): Vector => P[0].map((_, j) => v.reduce((s, vi, i) => s + vi * P[i][j], 0));
export const matVec = (P: Matrix, v: Vector): Vector => P.map((row) => row.reduce((s, pij, j) => s + pij * v[j], 0));
export const matMul = (A: Matrix, B: Matrix): Matrix => A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
export const identity = (n: number): Matrix => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => +(i === j)));
export function matPow(P: Matrix, k: number): Matrix {
  let R = identity(P.length);
  let B = P;
  while (k > 0) {
    if (k & 1) R = matMul(R, B);
    B = matMul(B, B);
    k >>= 1;
  }
  return R;
}

export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** Pretty-print a number as a short fraction when it is (close to) a simple one. */
export function toFraction(x: number, maxDen = 200): string {
  if (!Number.isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : 'NaN';
  if (Number.isInteger(x)) return String(x);
  for (let d = 2; d <= maxDen; d++) {
    const n = Math.round(x * d);
    if (Math.abs(n / d - x) < 1e-9) return `${n}/${d}`;
  }
  return fmt(x);
}

export function fmt(x: number, digits = 4): string {
  if (!Number.isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : '—';
  if (x !== 0 && Math.abs(x) < 1e-3) return x.toExponential(2);
  return String(+x.toFixed(digits));
}
