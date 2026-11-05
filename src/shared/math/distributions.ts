/** Probability distributions used by visualizations, generators and tests. */

export function logGamma(z: number): number {
  // Lanczos approximation (g = 7, n = 9)
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  z -= 1;
  let x = c[0];
  for (let i = 1; i < 9; i++) x += c[i] / (z + i);
  const t = z + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

export function logChoose(n: number, k: number): number {
  if (k < 0 || k > n) return -Infinity;
  return logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1);
}

/** Exact binomial coefficient for moderate n (falls back to float). */
export function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r) === r || r > 2 ** 52 ? Math.round(r) : r;
}

export function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

/** Error function (Abramowitz–Stegun 7.1.26, |err| < 1.5e-7). */
export function erf(x: number): number {
  const s = Math.sign(x);
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return s * y;
}

export const normalCdf = (x: number, mu = 0, sigma = 1) => 0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2)));
export const normalPdf = (x: number, mu = 0, sigma = 1) =>
  Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI));

export interface DiscreteDist {
  kind: 'discrete';
  name: string;
  pmf(k: number): number;
  mean: number;
  variance: number;
  /** Window of the support worth plotting. */
  lo: number;
  hi: number;
  /** P(X ≥ a) */
  tail(a: number): number;
}

export interface ContinuousDist {
  kind: 'continuous';
  name: string;
  pdf(x: number): number;
  cdf(x: number): number;
  mean: number;
  variance: number;
  lo: number;
  hi: number;
  tail(a: number): number;
}

export type Dist = DiscreteDist | ContinuousDist;

function discrete(name: string, pmf: (k: number) => number, mean: number, variance: number, lo: number, hi: number, exactHi = hi): DiscreteDist {
  return {
    kind: 'discrete',
    name,
    pmf,
    mean,
    variance,
    lo,
    hi,
    tail(a) {
      const start = Math.max(lo, Math.ceil(a - 1e-12));
      let s = 0;
      for (let k = start; k <= exactHi; k++) s += pmf(k);
      return Math.min(1, s);
    },
  };
}

export const bernoulli = (p: number) => discrete(`Bernoulli(${p})`, (k) => (k === 1 ? p : k === 0 ? 1 - p : 0), p, p * (1 - p), 0, 1);

export const binomial = (n: number, p: number) =>
  discrete(
    `Bin(${n}, ${p})`,
    (k) => (k < 0 || k > n || !Number.isInteger(k) ? 0 : p === 0 ? +(k === 0) : p === 1 ? +(k === n) : Math.exp(logChoose(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p))),
    n * p,
    n * p * (1 - p),
    0,
    n,
  );

/** Number of trials up to and including the first success (support 1, 2, …). */
export const geometric = (p: number) => {
  const hi = Math.max(10, Math.ceil(Math.log(1e-4) / Math.log(1 - Math.min(p, 0.999))));
  return discrete(
    `Geom(${p})`,
    (k) => (k >= 1 && Number.isInteger(k) ? p * (1 - p) ** (k - 1) : 0),
    1 / p,
    (1 - p) / (p * p),
    1,
    Math.min(hi, 200),
    2000,
  );
};

/** Number of trials until the r-th success (support r, r+1, …). */
export const negBinomial = (r: number, p: number) => {
  const mean = r / p;
  const sd = Math.sqrt((r * (1 - p)) / (p * p));
  return discrete(
    `NegBin(${r}, ${p})`,
    (k) => (k >= r && Number.isInteger(k) ? Math.exp(logChoose(k - 1, r - 1) + r * Math.log(p) + (k - r) * Math.log(1 - p)) : 0),
    mean,
    (r * (1 - p)) / (p * p),
    r,
    Math.min(400, Math.ceil(mean + 5 * sd)),
    3000,
  );
};

export const poisson = (lambda: number) =>
  discrete(
    `Poisson(${lambda})`,
    (k) => (k >= 0 && Number.isInteger(k) ? Math.exp(-lambda + k * Math.log(lambda) - logGamma(k + 1)) : 0),
    lambda,
    lambda,
    0,
    Math.ceil(lambda + 5 * Math.sqrt(lambda) + 5),
    Math.ceil(lambda + 40 * Math.sqrt(lambda) + 50),
  );

export const uniformDiscrete = (a: number, b: number) =>
  discrete(`U{${a},…,${b}}`, (k) => (k >= a && k <= b && Number.isInteger(k) ? 1 / (b - a + 1) : 0), (a + b) / 2, ((b - a + 1) ** 2 - 1) / 12, a, b);

function continuous(name: string, pdf: (x: number) => number, cdf: (x: number) => number, mean: number, variance: number, lo: number, hi: number): ContinuousDist {
  return { kind: 'continuous', name, pdf, cdf, mean, variance, lo, hi, tail: (a) => 1 - cdf(a) };
}

export const uniform = (a: number, b: number) =>
  continuous(
    `U(${a}, ${b})`,
    (x) => (x >= a && x <= b ? 1 / (b - a) : 0),
    (x) => (x <= a ? 0 : x >= b ? 1 : (x - a) / (b - a)),
    (a + b) / 2,
    (b - a) ** 2 / 12,
    a - (b - a) * 0.15,
    b + (b - a) * 0.15,
  );

export const normal = (mu: number, sigma: number) =>
  continuous(`N(${mu}, ${sigma}²)`, (x) => normalPdf(x, mu, sigma), (x) => normalCdf(x, mu, sigma), mu, sigma * sigma, mu - 4 * sigma, mu + 4 * sigma);

export const exponential = (lambda: number) =>
  continuous(
    `Exp(${lambda})`,
    (x) => (x < 0 ? 0 : lambda * Math.exp(-lambda * x)),
    (x) => (x < 0 ? 0 : 1 - Math.exp(-lambda * x)),
    1 / lambda,
    1 / (lambda * lambda),
    0,
    6 / lambda,
  );

export type DistKind = 'bernoulli' | 'binomial' | 'geometric' | 'negbinomial' | 'poisson' | 'udiscrete' | 'uniform' | 'normal' | 'exponential';

export interface DistParamSpec {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
}

export const DIST_SPECS: Record<DistKind, { title: string; params: DistParamSpec[]; make: (p: Record<string, number>) => Dist }> = {
  bernoulli: { title: 'Bernoulli', params: [{ key: 'p', label: 'p', min: 0.01, max: 0.99, step: 0.01, value: 0.3 }], make: (p) => bernoulli(p.p) },
  binomial: {
    title: 'Binomial',
    params: [
      { key: 'n', label: 'n', min: 1, max: 100, step: 1, value: 20 },
      { key: 'p', label: 'p', min: 0.01, max: 0.99, step: 0.01, value: 0.3 },
    ],
    make: (p) => binomial(p.n, p.p),
  },
  geometric: { title: 'Geometric', params: [{ key: 'p', label: 'p', min: 0.02, max: 0.99, step: 0.01, value: 0.25 }], make: (p) => geometric(p.p) },
  negbinomial: {
    title: 'Negative binomial',
    params: [
      { key: 'r', label: 'r', min: 1, max: 20, step: 1, value: 3 },
      { key: 'p', label: 'p', min: 0.05, max: 0.95, step: 0.01, value: 0.4 },
    ],
    make: (p) => negBinomial(p.r, p.p),
  },
  poisson: { title: 'Poisson', params: [{ key: 'lambda', label: 'λ', min: 0.2, max: 40, step: 0.1, value: 4 }], make: (p) => poisson(p.lambda) },
  udiscrete: {
    title: 'Uniform (discrete)',
    params: [
      { key: 'a', label: 'a', min: 0, max: 10, step: 1, value: 1 },
      { key: 'b', label: 'b', min: 1, max: 30, step: 1, value: 6 },
    ],
    make: (p) => uniformDiscrete(Math.min(p.a, p.b), Math.max(p.a, p.b)),
  },
  uniform: {
    title: 'Uniform (continuous)',
    params: [
      { key: 'a', label: 'a', min: -5, max: 5, step: 0.1, value: 0 },
      { key: 'b', label: 'b', min: -4, max: 10, step: 0.1, value: 1 },
    ],
    make: (p) => uniform(Math.min(p.a, p.b - 0.1), Math.max(p.b, p.a + 0.1)),
  },
  normal: {
    title: 'Normal',
    params: [
      { key: 'mu', label: 'μ', min: -5, max: 5, step: 0.1, value: 0 },
      { key: 'sigma', label: 'σ', min: 0.2, max: 4, step: 0.1, value: 1 },
    ],
    make: (p) => normal(p.mu, p.sigma),
  },
  exponential: { title: 'Exponential', params: [{ key: 'lambda', label: 'λ', min: 0.1, max: 5, step: 0.05, value: 1 }], make: (p) => exponential(p.lambda) },
};
