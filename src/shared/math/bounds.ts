/** Tail bounds (all return min(1, bound)). */

const cap = (x: number) => Math.min(1, Math.max(0, x));

/** Markov: P(X ≥ a) ≤ E(X)/a for X ≥ 0, a > 0. */
export const markovBound = (mean: number, a: number) => (a <= 0 ? 1 : cap(mean / a));

/** Chebyshev: P(|X − E X| ≥ a) ≤ Var(X)/a². */
export const chebyshevBound = (variance: number, a: number) => (a <= 0 ? 1 : cap(variance / (a * a)));

/** One-sided Chebyshev–Cantelli: P(X − E X ≥ a) ≤ σ²/(σ² + a²). */
export const cantelliBound = (variance: number, a: number) => (a <= 0 ? 1 : cap(variance / (variance + a * a)));

/** Chernoff upper tail for a sum of independent Poisson trials with mean μ: P(X ≥ (1+δ)μ). */
export const chernoffUpper = (mu: number, delta: number) =>
  delta <= 0 ? 1 : cap(Math.exp(mu * (delta - (1 + delta) * Math.log(1 + delta))));

/** Simplified Chernoff upper tail (valid for 0 < δ ≤ 1): e^{−μδ²/3}. */
export const chernoffUpperSimple = (mu: number, delta: number) => (delta <= 0 ? 1 : cap(Math.exp((-mu * delta * delta) / 3)));

/** Chernoff lower tail: P(X ≤ (1−δ)μ) ≤ (e^{−δ}/(1−δ)^{1−δ})^μ, 0 < δ < 1. */
export const chernoffLower = (mu: number, delta: number) =>
  delta <= 0 ? 1 : delta >= 1 ? cap(Math.exp(-mu)) : cap(Math.exp(mu * (-delta - (1 - delta) * Math.log(1 - delta))));

/** Simplified lower tail: e^{−μδ²/2}. */
export const chernoffLowerSimple = (mu: number, delta: number) => (delta <= 0 ? 1 : cap(Math.exp((-mu * delta * delta) / 2)));

/** Two-sided: P(|X − μ| ≥ δμ) ≤ 2e^{−μδ²/3}, 0 < δ ≤ 1. */
export const chernoffTwoSided = (mu: number, delta: number) => cap(2 * Math.exp((-mu * delta * delta) / 3));

/** Hoeffding for the mean of n i.i.d. variables in [0,1]: P(|Ā − μ| ≥ ε) ≤ 2e^{−2nε²}. */
export const hoeffdingBound = (n: number, eps: number) => cap(2 * Math.exp(-2 * n * eps * eps));

/** Smallest n with 2e^{−2nε²} ≤ δ. */
export const hoeffdingSampleSize = (eps: number, delta: number) => Math.ceil(Math.log(2 / delta) / (2 * eps * eps));

/** Smallest n with Chebyshev bound p(1−p)/(nε²) ≤ δ using p(1−p) ≤ 1/4. */
export const chebyshevSampleSize = (eps: number, delta: number) => Math.ceil(1 / (4 * eps * eps * delta));
