/** Elliptic curves y² = x³ + ax + b over F_p (small p, plain numbers) and over the reals. */
import { modInvN } from './numberTheory';

export type Point = { x: number; y: number } | null; // null = point at infinity O

export interface Curve {
  a: number;
  b: number;
  p: number;
}

const m = (x: number, p: number) => ((x % p) + p) % p;

export const discriminant = (a: number, b: number) => -16 * (4 * a ** 3 + 27 * b ** 2);
export const isSingularModP = (c: Curve) => m(4 * c.a ** 3 + 27 * c.b ** 2, c.p) === 0;

export const onCurve = (c: Curve, P: Point) => P === null || m(P.y * P.y - (P.x ** 3 + c.a * P.x + c.b), c.p) === 0;

export const eqPoint = (P: Point, Q: Point) => (P === null || Q === null ? P === Q : P.x === Q.x && P.y === Q.y);

export const neg = (c: Curve, P: Point): Point => (P === null ? null : { x: P.x, y: m(-P.y, c.p) });

/** Group law; also returns the slope used (null for vertical lines). */
export function addWithSlope(c: Curve, P: Point, Q: Point): { R: Point; slope: number | null } {
  if (P === null) return { R: Q, slope: null };
  if (Q === null) return { R: P, slope: null };
  const { p } = c;
  if (P.x === Q.x && m(P.y + Q.y, p) === 0) return { R: null, slope: null };
  let lam: number;
  if (P.x === Q.x) {
    const inv = modInvN(m(2 * P.y, p), p)!;
    lam = m((3 * P.x * P.x + c.a) * inv, p);
  } else {
    const inv = modInvN(m(Q.x - P.x, p), p)!;
    lam = m((Q.y - P.y) * inv, p);
  }
  const x3 = m(lam * lam - P.x - Q.x, p);
  const y3 = m(lam * (P.x - x3) - P.y, p);
  return { R: { x: x3, y: y3 }, slope: lam };
}

export const add = (c: Curve, P: Point, Q: Point): Point => addWithSlope(c, P, Q).R;

export interface MulStep {
  bit: 0 | 1;
  acc: Point;
}

/** Double-and-add (left to right) with a trace. */
export function mulSteps(c: Curve, k: number, P: Point): { R: Point; steps: MulStep[] } {
  if (k < 0) return mulSteps(c, -k, neg(c, P));
  let acc: Point = null;
  const steps: MulStep[] = [];
  for (const ch of k.toString(2)) {
    acc = add(c, acc, acc);
    if (ch === '1') acc = add(c, acc, P);
    steps.push({ bit: ch === '1' ? 1 : 0, acc });
  }
  return { R: k === 0 ? null : acc, steps };
}

export const mul = (c: Curve, k: number, P: Point) => mulSteps(c, k, P).R;

/** All affine points (O is not included). */
export function points(c: Curve): { x: number; y: number }[] {
  const sq = new Map<number, number[]>();
  for (let y = 0; y < c.p; y++) {
    const v = (y * y) % c.p;
    sq.set(v, [...(sq.get(v) ?? []), y]);
  }
  const out: { x: number; y: number }[] = [];
  for (let x = 0; x < c.p; x++) {
    const r = m(x ** 3 + c.a * x + c.b, c.p);
    for (const y of sq.get(r) ?? []) out.push({ x, y });
  }
  return out;
}

/** #E(F_p) including O. */
export const groupOrder = (c: Curve) => points(c).length + 1;

export function pointOrder(c: Curve, P: Point): number {
  let k = 1;
  let Q = P;
  while (Q !== null && k <= 4 * c.p + 10) {
    Q = add(c, Q, P);
    k++;
  }
  return k;
}

/** Hasse–Weil: |#E − (p + 1)| ≤ 2√p. */
export const hasse = (p: number) => ({ lo: p + 1 - 2 * Math.sqrt(p), hi: p + 1 + 2 * Math.sqrt(p) });

// ---------- over the reals (for geometric intuition)

export const realY = (a: number, b: number, x: number): number | null => {
  const v = x ** 3 + a * x + b;
  return v < 0 ? null : Math.sqrt(v);
};

export type RPoint = { x: number; y: number } | null;

export function addReal(a: number, P: RPoint, Q: RPoint): { R: RPoint; slope: number | null; third: RPoint } {
  if (P === null) return { R: Q, slope: null, third: Q === null ? null : { x: Q.x, y: -Q.y } };
  if (Q === null) return { R: P, slope: null, third: { x: P.x, y: -P.y } };
  const same = Math.abs(P.x - Q.x) < 1e-9;
  if (same && Math.abs(P.y + Q.y) < 1e-9) return { R: null, slope: null, third: null };
  const lam = same ? (3 * P.x * P.x + a) / (2 * P.y) : (Q.y - P.y) / (Q.x - P.x);
  const x3 = lam * lam - P.x - Q.x;
  const y3 = lam * (P.x - x3) - P.y;
  return { R: { x: x3, y: y3 }, slope: lam, third: { x: x3, y: -y3 } };
}
