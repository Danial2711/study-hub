/** Arithmetic in GF(2^k): polynomials over Z2 represented as bit vectors. */

/** AES modulus x^8 + x^4 + x^3 + x + 1. */
export const AES_POLY = 0x11b;

export function polyString(x: number, v = 'x'): string {
  if (x === 0) return '0';
  const terms: string[] = [];
  for (let i = 31; i >= 0; i--) {
    if ((x >>> i) & 1) terms.push(i === 0 ? '1' : i === 1 ? v : `${v}^{${i}}`);
  }
  return terms.join(' + ');
}

export const degree = (x: number): number => (x === 0 ? -Infinity : 31 - Math.clz32(x));

/** Multiply by x and reduce (the AES "xtime"). */
export const xtime = (a: number, poly = AES_POLY): number => {
  const k = degree(poly);
  const r = a << 1;
  return r & (1 << k) ? r ^ poly : r;
};

export interface MulStep {
  /** a·x^i (reduced). */
  shifted: number;
  /** Whether bit i of b is set (so this term is added). */
  used: boolean;
  /** Whether reducing by the modulus was needed for this shift. */
  reduced: boolean;
  acc: number;
}

/** Shift-and-add multiplication with a trace of every step. */
export function gfMulSteps(a: number, b: number, poly = AES_POLY): { result: number; steps: MulStep[] } {
  const k = degree(poly);
  let cur = a;
  let acc = 0;
  let reduced = false;
  const steps: MulStep[] = [];
  for (let i = 0; i < k; i++) {
    const used = ((b >>> i) & 1) === 1;
    if (used) acc ^= cur;
    steps.push({ shifted: cur, used, reduced, acc });
    const next = cur << 1;
    reduced = (next & (1 << k)) !== 0;
    cur = reduced ? next ^ poly : next;
  }
  return { result: acc, steps };
}

export const gfMul = (a: number, b: number, poly = AES_POLY): number => gfMulSteps(a, b, poly).result;

export function gfPow(a: number, e: number, poly = AES_POLY): number {
  let r = 1;
  let x = a;
  while (e > 0) {
    if (e & 1) r = gfMul(r, x, poly);
    x = gfMul(x, x, poly);
    e >>= 1;
  }
  return r;
}

/** Multiplicative inverse (0 ↦ 0 by convention, as in AES). */
export function gfInv(a: number, poly = AES_POLY): number {
  if (a === 0) return 0;
  const order = (1 << degree(poly)) - 1;
  return gfPow(a, order - 1, poly);
}

/** Plain polynomial multiplication over Z2 without reduction. */
export function clmul(a: number, b: number): number {
  let r = 0;
  for (let i = 0; i < 16; i++) if ((b >>> i) & 1) r ^= a << i;
  return r;
}

/** Remainder of polynomial division over Z2. */
export function polyMod(a: number, m: number): number {
  const dm = degree(m);
  while (a && degree(a) >= dm) a ^= m << (degree(a) - dm);
  return a;
}
