/** Parametrised question generators: every call produces a fresh variant. */
import type { QuestionGenerator, QuizQuestion } from '../../platform/types';
import type { Rng } from '../../shared/math/random';
import { binomial, choose } from '../../shared/math/distributions';
import { stationary, expectedHittingTimes } from '../../shared/math/markov';
import { entropy, binaryEntropy } from '../../shared/math/info';
import { huffman, kraftSum } from '../../shared/math/codes';
import { repetitionErrorRate } from '../../shared/math/channel';
import { fmt } from '../../shared/math/linalg';

const md = String.raw;
const r2 = (x: number) => Math.round(x * 100) / 100;
const pick = <T,>(rng: Rng, xs: readonly T[]) => rng.pick(xs);

function numeric(id: string, prompt: string, answer: number, explanation: string, tolerance?: number): QuizQuestion {
  return { id, type: 'numeric', prompt, answer, explanation, tolerance };
}

export const generators: QuestionGenerator[] = [
  {
    id: 'bayes-test',
    title: 'Bayes: diagnostic test',
    examGroup: 'Q1',
    topicId: 'l01',
    generate(rng) {
      const prev = pick(rng, [0.005, 0.01, 0.02, 0.05, 0.1]);
      const sens = pick(rng, [0.9, 0.95, 0.98, 0.99]);
      const fp = pick(rng, [0.01, 0.02, 0.05, 0.1]);
      const pPos = sens * prev + fp * (1 - prev);
      const ans = (sens * prev) / pPos;
      return numeric(
        'gen',
        md`A disease has prevalence ${prev * 100}%. A test detects it with probability ${sens} and gives a false positive with probability ${fp}. You test positive. What is the probability that you have the disease? (3 decimals)`,
        ans,
        md`Total probability: $P(+)=${sens}\cdot${prev}+${fp}\cdot${r2(1 - prev)}=${fmt(pPos, 5)}$. Bayes: $P(D\mid+)=\frac{${fmt(sens * prev, 5)}}{${fmt(pPos, 5)}}\approx${fmt(ans, 4)}$.`,
        0.002,
      );
    },
  },
  {
    id: 'binomial-pmf',
    title: 'Binomial probability',
    examGroup: 'Q1',
    topicId: 'l02',
    generate(rng) {
      const n = rng.int(5, 12);
      const p = pick(rng, [0.1, 0.2, 0.25, 0.3, 0.4, 0.5]);
      const k = rng.int(0, Math.min(n, 4));
      const ans = binomial(n, p).pmf(k);
      return numeric(
        'gen',
        md`$X\sim\mathrm{Bin}(${n},${p})$. Compute $P(X=${k})$ (4 decimals).`,
        ans,
        md`$\binom{${n}}{${k}}${p}^{${k}}(1-${p})^{${n - k}}=${choose(n, k)}\cdot${fmt(p ** k, 6)}\cdot${fmt((1 - p) ** (n - k), 6)}\approx${fmt(ans, 5)}$.`,
        0.0005,
      );
    },
  },
  {
    id: 'geom-memoryless',
    title: 'Geometric & memorylessness',
    examGroup: 'Q1',
    topicId: 'l02',
    generate(rng) {
      const p = pick(rng, [0.1, 0.2, 0.25, 0.4]);
      const l = rng.int(2, 6);
      const t = rng.int(1, 4);
      const ans = (1 - p) ** t;
      return numeric(
        'gen',
        md`$X\sim\mathrm{Geom}(${p})$ counts trials until the first success. Compute $P(X>${l + t}\mid X>${l})$ (4 decimals).`,
        ans,
        md`Memorylessness: $P(X>${l + t}\mid X>${l})=P(X>${t})=(1-${p})^{${t}}\approx${fmt(ans, 5)}$.`,
        0.0005,
      );
    },
  },
  {
    id: 'markov-cheb',
    title: 'Markov vs Chebyshev',
    examGroup: 'Q2',
    topicId: 'l04',
    generate(rng) {
      const mu = rng.int(10, 40);
      const sd = rng.int(2, 6);
      const k = rng.int(2, 4);
      const a = mu + k * sd;
      const useCheb = rng.next() < 0.6;
      if (useCheb)
        return numeric(
          'gen',
          md`$X$ has mean ${mu} and standard deviation ${sd}. What upper bound does **Chebyshev** give for $P(|X-${mu}|\ge${k * sd})$?`,
          1 / (k * k),
          md`$${k * sd}=${k}\sigma$, so $P\le\frac1{${k}^2}=${fmt(1 / (k * k), 4)}$.`,
        );
      return numeric(
        'gen',
        md`$X\ge0$ has mean ${mu}. What upper bound does **Markov** give for $P(X\ge${a})$?`,
        mu / a,
        md`$P(X\ge${a})\le\frac{${mu}}{${a}}\approx${fmt(mu / a, 4)}$.`,
      );
    },
  },
  {
    id: 'var-linear',
    title: 'Variance of linear combinations',
    examGroup: 'Q2',
    topicId: 'l04',
    generate(rng) {
      const a = rng.int(-3, 3) || 2;
      const b = rng.int(-3, 3) || -1;
      const vx = rng.int(1, 5);
      const vy = rng.int(1, 5);
      const ans = a * a * vx + b * b * vy;
      return numeric(
        'gen',
        md`$X,Y$ are independent with $\mathrm{Var}(X)=${vx}$ and $\mathrm{Var}(Y)=${vy}$. Compute $\mathrm{Var}(${a}X ${b < 0 ? '-' : '+'} ${Math.abs(b)}Y + 7)$.`,
        ans,
        md`Constants vanish and coefficients square: $${a}^2\cdot${vx}+${b}^2\cdot${vy}=${ans}$.`,
      );
    },
  },
  {
    id: 'hoeffding-n',
    title: 'Sample size (Hoeffding)',
    examGroup: 'Q3',
    topicId: 'l05',
    generate(rng) {
      const eps = pick(rng, [0.01, 0.02, 0.05, 0.1]);
      const delta = pick(rng, [0.01, 0.05, 0.1]);
      const n = Math.ceil(Math.log(2 / delta) / (2 * eps * eps));
      return numeric(
        'gen',
        md`Using Hoeffding $P(|A_n-\mu|\ge\varepsilon)\le2e^{-2n\varepsilon^2}$ for $[0,1]$-valued samples, what is the smallest $n$ guaranteeing error $<${eps}$ with probability $\ge${1 - delta}$?`,
        n,
        md`$2e^{-2n\varepsilon^2}\le${delta}\iff n\ge\frac{\ln(2/${delta})}{2\cdot${eps}^2}\approx${fmt(Math.log(2 / delta) / (2 * eps * eps), 2)}$, so $n=${n}$.`,
        0.5,
      );
    },
  },
  {
    id: 'chernoff-upper',
    title: 'Chernoff bound',
    examGroup: 'Q3',
    topicId: 'l05',
    generate(rng) {
      const mu = pick(rng, [20, 30, 50, 60, 100]);
      const d = pick(rng, [0.2, 0.25, 0.5, 1]);
      const ans = Math.exp((-mu * d * d) / 3);
      return numeric(
        'gen',
        md`$X$ is a sum of independent Poisson trials with $E(X)=${mu}$. Using $P(X\ge(1+\delta)\mu)\le e^{-\mu\delta^2/3}$, bound $P(X\ge${mu * (1 + d)})$ (4 decimals).`,
        ans,
        md`$(1+\delta)\mu=${mu * (1 + d)}$ gives $\delta=${d}$, so the bound is $e^{-${mu}\cdot${d}^2/3}\approx${fmt(ans, 5)}$.`,
        Math.max(0.0005, ans * 0.01),
      );
    },
  },
  {
    id: 'two-state-pi',
    title: 'Stationary distribution (2 states)',
    examGroup: 'Q4',
    topicId: 'l07',
    generate(rng) {
      const p = pick(rng, [0.1, 0.2, 0.3, 0.4, 0.5]);
      const q = pick(rng, [0.1, 0.2, 0.3, 0.6, 0.7]);
      const ans = q / (p + q);
      return numeric(
        'gen',
        md`A chain on $\{1,2\}$ has $p_{1,2}=${p}$ and $p_{2,1}=${q}$. Compute $\pi_1$ (4 decimals).`,
        ans,
        md`Cut between the states: $\pi_1\cdot${p}=\pi_2\cdot${q}$, so $\pi_1=\frac{${q}}{${p}+${q}}\approx${fmt(ans, 4)}$.`,
        0.0005,
      );
    },
  },
  {
    id: 'birth-death',
    title: 'Birth–death chain',
    examGroup: 'Q4',
    topicId: 'l07',
    generate(rng) {
      const up = pick(rng, [0.1, 0.2, 0.3]);
      const down = pick(rng, [0.3, 0.4, 0.5, 0.6]);
      const P = [
        [1 - up, up, 0],
        [down, 1 - up - down, up],
        [0, down, 1 - down],
      ];
      const pi = stationary(P)!;
      return numeric(
        'gen',
        md`A buffer has states $0,1,2$. Each step it moves up with probability ${up} (if not full) and down with probability ${down} (if not empty); otherwise it stays. Compute $\pi_0$ (4 decimals).`,
        pi[0],
        md`Cuts: $\pi_{k+1}=\frac{${up}}{${down}}\pi_k=r\pi_k$ with $r=${fmt(up / down, 4)}$. Then $\pi_0=\frac1{1+r+r^2}\approx${fmt(pi[0], 4)}$.`,
        0.0005,
      );
    },
  },
  {
    id: 'ruin-time',
    title: "Gambler's ruin",
    examGroup: 'Q4',
    topicId: 'l06',
    generate(rng) {
      const N = rng.int(4, 9);
      const i = rng.int(1, N - 1);
      const askTime = rng.next() < 0.5;
      if (askTime) {
        const P = Array.from({ length: N + 1 }, (_, s) => Array.from({ length: N + 1 }, (_, t) => (s === 0 || s === N ? +(s === t) : t === s - 1 || t === s + 1 ? 0.5 : 0)));
        const k = expectedHittingTimes(P, [0, N])[i];
        return numeric('gen', md`Fair random walk on $\{0,\dots,${N}\}$ with absorbing ends, starting at ${i}. Expected number of steps until absorption?`, k, md`$k_i=i(N-i)=${i}\cdot${N - i}=${i * (N - i)}$ solves $k_j=1+\frac12(k_{j-1}+k_{j+1})$ with $k_0=k_N=0$.`);
      }
      return numeric('gen', md`Fair gambler's ruin: you have ${i} and your opponent ${N - i}. Probability that you win everything?`, i / N, md`$h_i=\frac iN=\frac{${i}}{${N}}\approx${fmt(i / N, 4)}$.`, 0.001);
    },
  },
  {
    id: 'discount-threshold',
    title: 'Discounting trade-off',
    examGroup: 'Q5',
    topicId: 'l08',
    generate(rng) {
      const r1 = rng.int(1, 3);
      const r2v = r1 + rng.int(1, 3);
      const g = pick(rng, [0.5, 0.6, 0.75, 0.8, 0.9]);
      const stay = r1 / (1 - g);
      const go = (g * r2v) / (1 - g);
      const ans = Math.max(stay, go);
      return numeric(
        'gen',
        md`In state $s$, action *stay* gives reward ${r1} and remains in $s$; action *go* gives 0 and moves to an absorbing state paying ${r2v} per step. With $\gamma=${g}$, what is $V^*(s)$?`,
        ans,
        md`Stay forever: $\frac{${r1}}{1-${g}}=${fmt(stay, 3)}$. Go: $\gamma\frac{${r2v}}{1-\gamma}=${fmt(go, 3)}$. So $V^*(s)=${fmt(ans, 3)}$ (action *${go > stay ? 'go' : 'stay'}*).`,
        0.01,
      );
    },
  },
  {
    id: 'mc-discounted',
    title: 'Discounted value of a chain',
    examGroup: 'Q5',
    topicId: 'l08',
    generate(rng) {
      const p = pick(rng, [0.3, 0.5, 0.6, 0.8]);
      const g = pick(rng, [0.5, 0.8, 0.9]);
      const r = rng.int(1, 5);
      // a: reward r, stays w.p. p, else to absorbing 0-reward state
      const v = r / (1 - g * p);
      return numeric(
        'gen',
        md`State $a$ has reward ${r}; from $a$ the chain stays in $a$ with probability ${p}, otherwise it moves to an absorbing state with reward 0. With $\gamma=${g}$, compute $V(a)$.`,
        v,
        md`$V(a)=${r}+${g}\cdot${p}\,V(a)$, so $V(a)=\frac{${r}}{1-${fmt(g * p, 3)}}\approx${fmt(v, 4)}$.`,
        0.01,
      );
    },
  },
  {
    id: 'entropy-dist',
    title: 'Entropy of a distribution',
    examGroup: 'Q6',
    topicId: 'l09',
    generate(rng) {
      const options = [
        [0.5, 0.25, 0.125, 0.125],
        [0.25, 0.25, 0.25, 0.125, 0.125],
        [0.5, 0.5],
        [0.5, 0.25, 0.25],
        [0.4, 0.3, 0.2, 0.1],
        [0.7, 0.1, 0.1, 0.1],
        [0.6, 0.2, 0.2],
      ];
      const p = pick(rng, options);
      const H = entropy(p);
      return numeric('gen', md`Compute $H(${p.join(',\\,')})$ in bits (3 decimals).`, H, md`$-\sum p_i\log_2p_i=${p.map((x) => `${x}\\cdot${fmt(-Math.log2(x), 3)}`).join('+')}\approx${fmt(H, 4)}$.`, 0.002);
    },
  },
  {
    id: 'huffman-L',
    title: 'Huffman expected length',
    examGroup: 'Q6',
    topicId: 'l11',
    generate(rng) {
      // random 5-symbol distribution in multiples of 0.05
      let parts: number[];
      do {
        const cuts = [0, ...Array.from({ length: 4 }, () => rng.int(1, 19)).sort((a, b) => a - b), 20];
        parts = cuts.slice(1).map((c, i) => c - cuts[i]);
      } while (parts.some((x) => x === 0));
      const p = parts.map((x) => x / 20).sort((a, b) => b - a);
      const h = huffman(p);
      return numeric(
        'gen',
        md`Find the expected length of a binary Huffman code for $(${p.join(',\\,')})$.`,
        h.L,
        md`The merged nodes have probabilities ${h.steps.map((s) => fmt(s.result.p, 2)).join(', ')}; their sum is $L=${fmt(h.L, 3)}$ (lengths ${h.lengths.join(', ')}). Compare $H\approx${fmt(h.H, 3)}$.`,
        0.001,
      );
    },
  },
  {
    id: 'kraft-exists',
    title: 'Kraft: does a prefix code exist?',
    examGroup: 'Q6',
    topicId: 'l10',
    generate(rng) {
      const m = rng.int(4, 6);
      const ls = Array.from({ length: m }, () => rng.int(1, 4)).sort((a, b) => a - b);
      const K = kraftSum(ls);
      return {
        id: 'gen',
        type: 'truefalse',
        prompt: md`Does a binary prefix code with codeword lengths $${ls.join(',')}$ exist?`,
        answer: K <= 1 + 1e-12,
        explanation: md`Kraft sum $\sum2^{-l_i}=${fmt(K, 4)}$ ${K <= 1 ? '$\\le1$, so yes' : '$>1$, so no (not even a uniquely decodable code, by McMillan)'}.`,
      };
    },
  },
  {
    id: 'bsc-capacity',
    title: 'BSC capacity',
    examGroup: 'Q7',
    topicId: 'l12',
    generate(rng) {
      const p = pick(rng, [0.01, 0.05, 0.1, 0.11, 0.2, 0.25, 0.3, 0.4, 0.9]);
      const C = 1 - binaryEntropy(p);
      return numeric('gen', md`Capacity of a binary symmetric channel with crossover probability ${p} (bits, 3 decimals)?`, C, md`$C=1-H(${p})=1-${fmt(binaryEntropy(p), 4)}\approx${fmt(C, 4)}$.`, 0.002);
    },
  },
  {
    id: 'repetition',
    title: 'Repetition code error',
    examGroup: 'Q7',
    topicId: 'l12',
    generate(rng) {
      const n = pick(rng, [3, 5]);
      const p = pick(rng, [0.05, 0.1, 0.2]);
      const e = repetitionErrorRate(n, p);
      return numeric(
        'gen',
        md`Each bit is sent ${n}× over a BSC($${p}$) and decoded by majority vote. What is the probability of a decoding error (4 decimals)? What is the rate?`,
        e,
        md`An error needs at least ${(n + 1) / 2} flips: $\sum_{k\ge${(n + 1) / 2}}\binom{${n}}{k}${p}^k(1-${p})^{${n}-k}\approx${fmt(e, 5)}$. Rate $1/${n}$, while $C=${fmt(1 - binaryEntropy(p), 3)}$.`,
        Math.max(0.0002, e * 0.01),
      );
    },
  },
];
