/** Information-theoretic quantities. Logs base 2 unless stated. 0·log 0 = 0. */

const lg = (x: number, base = 2) => Math.log(x) / Math.log(base);

export function entropy(p: readonly number[], base = 2): number {
  return p.reduce((s, x) => (x > 0 ? s - x * lg(x, base) : s), 0);
}

export const binaryEntropy = (p: number) => entropy([p, 1 - p]);

export const surprisal = (p: number, base = 2) => (p > 0 ? -lg(p, base) : Infinity);

/** Joint table J[x][y] = P(X=x, Y=y). */
export type Joint = number[][];

export const marginalX = (J: Joint) => J.map((row) => row.reduce((a, b) => a + b, 0));
export const marginalY = (J: Joint) => J[0].map((_, y) => J.reduce((s, row) => s + row[y], 0));

export const jointEntropy = (J: Joint) => entropy(J.flat());

/** H(Y | X) = H(X, Y) − H(X). */
export const condEntropyYgivenX = (J: Joint) => jointEntropy(J) - entropy(marginalX(J));
/** H(X | Y) = H(X, Y) − H(Y). */
export const condEntropyXgivenY = (J: Joint) => jointEntropy(J) - entropy(marginalY(J));

export function mutualInformation(J: Joint): number {
  const px = marginalX(J);
  const py = marginalY(J);
  let s = 0;
  J.forEach((row, x) =>
    row.forEach((pxy, y) => {
      if (pxy > 0) s += pxy * lg(pxy / (px[x] * py[y]));
    }),
  );
  return Math.max(0, s);
}

/** Relative entropy D(p‖q); ∞ if p has mass where q has none. */
export function klDivergence(p: readonly number[], q: readonly number[]): number {
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    if (p[i] === 0) continue;
    if (q[i] === 0) return Infinity;
    s += p[i] * lg(p[i] / q[i]);
  }
  return s;
}

export const crossEntropy = (p: readonly number[], q: readonly number[]) => entropy(p) + klDivergence(p, q);

export function infoSummary(J: Joint) {
  const HX = entropy(marginalX(J));
  const HY = entropy(marginalY(J));
  const HXY = jointEntropy(J);
  return {
    HX,
    HY,
    HXY,
    HXgY: HXY - HY,
    HYgX: HXY - HX,
    I: Math.max(0, HX + HY - HXY),
  };
}

export function normalize(p: readonly number[]): number[] {
  const s = p.reduce((a, b) => a + b, 0);
  return s > 0 ? p.map((x) => x / s) : p.map(() => 1 / p.length);
}
