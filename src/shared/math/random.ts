/** Small seeded PRNG (mulberry32) so simulations and generated questions are reproducible. */
export interface Rng {
  /** Uniform in [0, 1). */
  next(): number;
  /** Integer in [lo, hi] inclusive. */
  int(lo: number, hi: number): number;
  pick<T>(xs: readonly T[]): T;
  shuffle<T>(xs: readonly T[]): T[];
  seed: number;
}

export function makeRng(seed: number = (Math.random() * 2 ** 32) >>> 0): Rng {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1));
  return {
    seed,
    next,
    int,
    pick: (xs) => xs[Math.floor(next() * xs.length)],
    shuffle: (xs) => {
      const out = xs.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
  };
}

/** Standard normal via Box–Muller. */
export function normalSample(rng: Rng): number {
  let u = 0;
  while (u === 0) u = rng.next();
  const v = rng.next();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function expSample(rng: Rng, rate: number): number {
  let u = 0;
  while (u === 0) u = rng.next();
  return -Math.log(u) / rate;
}

/** Sample an index from a discrete distribution. */
export function sampleIndex(rng: Rng, probs: readonly number[]): number {
  let u = rng.next();
  for (let i = 0; i < probs.length; i++) {
    u -= probs[i];
    if (u < 0) return i;
  }
  return probs.length - 1;
}
