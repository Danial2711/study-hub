/** Elementary number theory on BigInt, with step traces for teaching. */

export const big = (x: number | bigint | string): bigint => BigInt(x);

export const mod = (a: bigint, n: bigint): bigint => ((a % n) + n) % n;

export function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
}

export interface EgcdRow {
  q: bigint | null;
  r: bigint;
  s: bigint;
  t: bigint;
}

/** Extended Euclid: rows (r_i, s_i, t_i) with r_i = s_i·a + t_i·b. Last nonzero r is gcd. */
export function egcd(a: bigint, b: bigint): { g: bigint; x: bigint; y: bigint; rows: EgcdRow[] } {
  const rows: EgcdRow[] = [
    { q: null, r: a, s: 1n, t: 0n },
    { q: null, r: b, s: 0n, t: 1n },
  ];
  while (rows[rows.length - 1].r !== 0n) {
    const p = rows[rows.length - 2];
    const c = rows[rows.length - 1];
    const q = p.r / c.r;
    rows.push({ q, r: p.r - q * c.r, s: p.s - q * c.s, t: p.t - q * c.t });
  }
  const last = rows[rows.length - 2];
  return { g: last.r, x: last.s, y: last.t, rows };
}

export function modInv(a: bigint, n: bigint): bigint | null {
  const { g, x } = egcd(mod(a, n), n);
  return g === 1n ? mod(x, n) : null;
}

export interface PowStep {
  bit: 0 | 1;
  /** Value after squaring (and multiplying if the bit is 1). */
  acc: bigint;
}

/** Left-to-right square-and-multiply with a trace. */
export function modPowSteps(b: bigint, e: bigint, n: bigint): { result: bigint; steps: PowStep[] } {
  if (n === 1n) return { result: 0n, steps: [] };
  const bits = e.toString(2);
  let acc = 1n;
  const base = mod(b, n);
  const steps: PowStep[] = [];
  for (const ch of bits) {
    acc = (acc * acc) % n;
    if (ch === '1') acc = (acc * base) % n;
    steps.push({ bit: ch === '1' ? 1 : 0, acc });
  }
  return { result: e === 0n ? 1n % n : acc, steps };
}

export const modPow = (b: bigint, e: bigint, n: bigint): bigint => {
  if (n === 1n) return 0n;
  let r = 1n;
  let x = mod(b, n);
  while (e > 0n) {
    if (e & 1n) r = (r * x) % n;
    x = (x * x) % n;
    e >>= 1n;
  }
  return r;
};

/** Chinese remainder theorem for pairwise coprime moduli; returns x mod Πn_i, or null. */
export function crt(residues: bigint[], moduli: bigint[]): { x: bigint; N: bigint; terms: { Ni: bigint; inv: bigint; term: bigint }[] } | null {
  const N = moduli.reduce((p, m) => p * m, 1n);
  const terms: { Ni: bigint; inv: bigint; term: bigint }[] = [];
  let x = 0n;
  for (let i = 0; i < moduli.length; i++) {
    const Ni = N / moduli[i];
    const inv = modInv(Ni, moduli[i]);
    if (inv === null) return null;
    const term = mod(residues[i], moduli[i]) * Ni * inv;
    terms.push({ Ni, inv, term });
    x += term;
  }
  return { x: mod(x, N), N, terms };
}

/** Deterministic Miller–Rabin for n < 3.3·10^24 (enough for every demo). */
export function isPrime(n: bigint): boolean {
  if (n < 2n) return false;
  const small = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n];
  for (const p of small) {
    if (n === p) return true;
    if (n % p === 0n) return false;
  }
  let d = n - 1n;
  let s = 0;
  while (d % 2n === 0n) {
    d /= 2n;
    s++;
  }
  outer: for (const a of small) {
    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    for (let i = 1; i < s; i++) {
      x = (x * x) % n;
      if (x === n - 1n) continue outer;
    }
    return false;
  }
  return true;
}

/** Trial-division factorisation (small n only): [[p, e], …]. */
export function factor(n: number): [number, number][] {
  const out: [number, number][] = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    let e = 0;
    while (m % p === 0) {
      m /= p;
      e++;
    }
    if (e) out.push([p, e]);
  }
  if (m > 1) out.push([m, 1]);
  return out;
}

export function phi(n: number): number {
  return factor(n).reduce((acc, [p, e]) => acc * (p - 1) * p ** (e - 1), 1);
}

export const gcdN = (a: number, b: number): number => Number(gcd(BigInt(a), BigInt(b)));
export const modPowN = (b: number, e: number, n: number): number => Number(modPow(BigInt(b), BigInt(e), BigInt(n)));
export const modInvN = (a: number, n: number): number | null => {
  const r = modInv(BigInt(a), BigInt(n));
  return r === null ? null : Number(r);
};
export const isPrimeN = (n: number): boolean => isPrime(BigInt(n));

/** Integer k-th root (floor) by Newton / binary search. */
export function iroot(x: bigint, k: number): bigint {
  if (x < 0n) throw new Error('negative');
  if (x < 2n) return x;
  let lo = 0n;
  let hi = 1n << BigInt(Math.ceil(x.toString(2).length / k) + 1);
  while (lo < hi) {
    const mid = (lo + hi + 1n) / 2n;
    if (mid ** BigInt(k) <= x) lo = mid;
    else hi = mid - 1n;
  }
  return lo;
}

/** Primes in [lo, hi]. */
export function primesBetween(lo: number, hi: number): number[] {
  const out: number[] = [];
  for (let n = Math.max(2, lo); n <= hi; n++) if (isPrimeN(n)) out.push(n);
  return out;
}
