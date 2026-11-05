import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l05: Topic = {
  id: 'l05',
  lecture: 5,
  examGroup: 'Q3',
  title: 'Chernoff bounds & laws of large numbers',
  summary: md`Moment generating functions, Chernoff bounds for sums of Poisson trials, Hoeffding's inequality, the weak and strong laws of large numbers, and the central limit theorem.`,
  sections: [
    {
      id: 'motivation',
      title: 'Motivation: estimating an unknown coin',
      kind: 'concept',
      body: md`We flip a coin with unknown head probability $p$ and estimate it by the empirical mean $A_n=\frac1n\sum_{i=1}^nX_i$. How many flips $n$ make us 99.9% sure that the first $k$ bits of $A_n$ are correct, i.e. $P(|A_n-p|\ge 2^{-k})\le0.001$?

- **Markov** bounds only one side, and $n$ disappears from the bound, so it is useless.
- **Chebyshev**, with $\mathrm{Var}(A_n)=\frac{p(1-p)}n\le\frac1{4n}$, gives $P\le\frac{2^{2k}}{4n}$, so $n\ge 250\cdot 2^{2k}$.
- **Hoeffding** gives $2e^{-2n/2^{2k}}\le0.001$, so $n\ge\frac{\ln 2000}{2}2^{2k}\approx3.8\cdot2^{2k}$. That is about 65 times fewer flips, and the bound does not depend on the unknown $p$.

For *relative* precision (first $k$ significant bits, $|A_n-p|\ge p/2^k$), even Chebyshev and Chernoff need a **lower bound on $p$**: if no head has appeared yet, we know nothing about how small $p$ is.`,
      viz: [{ id: 'lln' }],
    },
    {
      id: 'mgf',
      title: 'Moment generating functions',
      kind: 'definition',
      body: md`Markov uses $E(X)$ and Chebyshev uses $\mathrm{Var}(X)$. Chernoff uses the whole **moment generating function**, which encodes all the moments.`,
      formulas: [
        {
          id: 'mgf-def',
          name: 'Moment generating function',
          tex: md`M_X(t)=E\big(e^{tX}\big),\qquad E(X^n)=M_X^{(n)}(0)`,
          intuition: md`Expand $e^{tX}=1+tX+\frac{(tX)^2}{2!}+\dots$; the $n$-th derivative at 0 extracts $E(X^n)$.`,
          conditions: md`Exchanging expectation and differentiation is legitimate when $M_X$ is finite in a neighbourhood of 0. If $M_X=M_Y<\infty$ on some $(-\delta,\delta)$, then $X$ and $Y$ have the same distribution.`,
        },
        {
          id: 'mgf-sum',
          name: 'MGF of a sum of independent variables',
          tex: md`X\perp Y\ \Rightarrow\ M_{X+Y}(t)=M_X(t)\,M_Y(t)`,
          intuition: md`$E(e^{t(X+Y)})=E(e^{tX}e^{tY})=E(e^{tX})E(e^{tY})$ by independence. Products of MGFs are much easier to handle than convolutions of PMFs.`,
        },
      ],
    },
    {
      id: 'chernoff',
      title: 'Chernoff bounds',
      kind: 'theorem',
      body: md`**Idea.** Apply Markov to $e^{tX}$ for a well-chosen $t$:
$$P(X\ge a)=P(e^{tX}\ge e^{ta})\le\frac{E(e^{tX})}{e^{ta}}\quad(t>0),\qquad P(X\le a)\le\frac{E(e^{tX})}{e^{ta}}\quad(t<0).$$

**Poisson trials** are independent 0/1 variables with possibly different $P(X_i=1)=p_i$. (Do not confuse them with Poisson random variables! Bernoulli trials are the special case of equal $p_i$.) For $X=\sum X_i$ and $\mu=E(X)=\sum p_i$:
$$M_{X_i}(t)=1+p_i(e^t-1)\le e^{p_i(e^t-1)}\quad\Rightarrow\quad M_X(t)\le e^{(e^t-1)\mu},$$
using $1+y\le e^y$.`,
      formulas: [
        {
          id: 'chernoff-upper',
          name: 'Chernoff bound, upper tail',
          tex: md`P\big(X\ge(1+\delta)\mu\big)\le\left(\frac{e^\delta}{(1+\delta)^{1+\delta}}\right)^{\!\mu}\ (\delta>0),\qquad P\big(X\ge(1+\delta)\mu\big)\le e^{-\mu\delta^2/3}\ (0<\delta\le1)`,
          symbols: [
            { sym: md`X=\sum X_i`, meaning: 'sum of independent Poisson trials (0/1 variables)' },
            { sym: md`\mu`, meaning: md`$E(X)=\sum p_i$` },
            { sym: md`\delta`, meaning: 'relative deviation from the mean' },
          ],
          intuition: 'The probability of exceeding the mean by a constant fraction decays exponentially in μ.',
          conditions: md`The first form uses $t=\ln(1+\delta)$; the simpler form uses $\delta-(1+\delta)\ln(1+\delta)\le-\delta^2/3$ on $[0,1]$.`,
        },
        {
          id: 'chernoff-lower',
          name: 'Chernoff bound, lower tail',
          tex: md`P\big(X\le(1-\delta)\mu\big)\le\left(\frac{e^{-\delta}}{(1-\delta)^{1-\delta}}\right)^{\!\mu}\le e^{-\mu\delta^2/2}\qquad(0<\delta<1)`,
          conditions: md`Proof is analogous with $t<0$.`,
        },
        {
          id: 'chernoff-two',
          name: 'Two-sided Chernoff bound',
          tex: md`P\big(|X-\mu|\ge\delta\mu\big)\le 2e^{-\mu\delta^2/3}\qquad(0<\delta\le1)`,
          conditions: 'Union of the two simplified one-sided bounds (using the weaker constant 3 for both).',
        },
      ],
      proof: md`For $t>0$: $P(X\ge(1+\delta)\mu)\le\frac{E(e^{tX})}{e^{t(1+\delta)\mu}}\le\left(\frac{e^{e^t-1}}{e^{t(1+\delta)}}\right)^{\mu}$. Setting $t=\ln(1+\delta)$ gives the first form. For the second, let $f(\delta)=\delta-(1+\delta)\ln(1+\delta)+\delta^2/3$. Then $f(0)=0$, $f'(\delta)=-\ln(1+\delta)+\frac23\delta$ with $f'(0)=0$ and $f'(1)<0$, and $f''$ changes sign once at $\frac12$, so $f'\le0$ on $[0,1]$. Hence $f\le0$.`,
      examples: [
        {
          title: 'Coin flipping re-re-visited',
          problem: md`Bound $P(X\ge\frac34n)$ for $n$ fair coin flips using Chernoff.`,
          solution: md`$\mu=n/2$, and $\frac34n=(1+\frac12)\mu$. The two-sided bound with $\delta=\frac12$ gives $P\le2e^{-\frac n2\cdot\frac14\cdot\frac13}=2e^{-n/24}$.
Compare with Chebyshev's $4/n$: Chernoff is better for $n>92$, and exponentially better as $n$ grows.`,
        },
      ],
      viz: [{ id: 'tailBounds', caption: 'On the log scale the Chernoff curve (pink) bends down like the true tail, while Markov and Chebyshev decay only polynomially.' }],
    },
    {
      id: 'hoeffding',
      title: "Hoeffding's inequality",
      kind: 'theorem',
      body: md`Chernoff bounds as stated need $X_i\in\{0,1\}$, and their strength depends on $\mu$. Hoeffding works for any **bounded** independent variables, and the bound depends only on the ranges.`,
      formulas: [
        {
          id: 'hoeffding-f',
          name: "Hoeffding's inequality",
          tex: md`a_i\le X_i\le b_i:\quad P\big(|X-E X|\ge t\big)\le2\exp\!\left(-\frac{2t^2}{\sum_{i=1}^n(b_i-a_i)^2}\right)`,
          intuition: 'A sum of many small bounded independent pieces rarely strays far from its mean; the bound has a Gaussian-like shape.',
          conditions: 'The one-sided bound P(X − EX ≥ t) holds without the factor 2. The proof applies Markov to e^{sX} and uses Hoeffding\'s lemma E(e^{s(X_i−EX_i)}) ≤ e^{s²(b_i−a_i)²/8}.',
        },
        {
          id: 'hoeffding-mean',
          name: 'Hoeffding for the sample mean',
          tex: md`X_i\in[a,b]\ \text{i.i.d.}:\quad P\big(|A_n-E X_1|\ge\varepsilon\big)\le2\exp\!\left(-\frac{2n\varepsilon^2}{(b-a)^2}\right)`,
          conditions: md`For $[0,1]$-valued variables, $n\ge\frac{\ln(2/\delta)}{2\varepsilon^2}$ samples suffice for error $\le\varepsilon$ with confidence $1-\delta$.`,
        },
      ],
      examples: [
        {
          title: 'Fair coin with Hoeffding',
          problem: md`Bound $P(X\ge\frac34n)$ for $n$ fair coin flips.`,
          solution: md`One-sided Hoeffding with $t=n/4$ and $b_i-a_i=1$: $e^{-2(n/4)^2/n}=e^{-n/8}$. This beats Chernoff's $2e^{-n/24}$.`,
        },
      ],
    },
    {
      id: 'lln',
      title: 'Laws of large numbers',
      kind: 'theorem',
      body: md`The laws of large numbers justify the *frequentist* intuition: the probability we defined mathematically really is the limit of relative frequencies, and the expected value really is the long-run average.`,
      formulas: [
        {
          id: 'wlln',
          name: 'Weak law of large numbers',
          tex: md`\forall\varepsilon>0:\quad\lim_{n\to\infty}P\left(\left|\frac{X_1+\dots+X_n}{n}-\mu\right|>\varepsilon\right)=0`,
          conditions: md`$X_1,X_2,\ldots$ i.i.d. with mean $\mu$ (convergence **in probability**).`,
          intuition: 'For large n it is unlikely that the average is far from μ at that particular n.',
        },
        {
          id: 'slln',
          name: 'Strong law of large numbers',
          tex: md`P\left(\lim_{n\to\infty}\frac{X_1+\dots+X_n}{n}=\mu\right)=1`,
          conditions: md`i.i.d. with mean $\mu$ (convergence **almost surely**).`,
          intuition: 'Almost every infinite run has averages converging to μ; once n is large, the error stays small forever.',
        },
      ],
      proof: md`**Weak law, assuming finite variance $\sigma^2$.** $E(A_n)=\mu$ and $\mathrm{Var}(A_n)=\sigma^2/n$ by independence. Chebyshev gives
$$P(|A_n-\mu|>\varepsilon)\le\frac{\sigma^2}{n\varepsilon^2}\xrightarrow{n\to\infty}0.$$`,
      examples: [
        {
          title: 'Weak vs strong, quantifiers',
          problem: md`State precisely how the weak and the strong law differ.`,
          solution: md`**Weak:** $\forall\varepsilon,\delta\ \exists N\ \forall n\ge N:\ P(|A_n-\mu|\le\varepsilon)\ge1-\delta$.
**Strong:** $\forall\varepsilon,\delta\ \exists N:\ P(\forall n\ge N:\ |A_n-\mu|\le\varepsilon)\ge1-\delta$.
In the strong law the "for all $n$" sits **inside** the probability.

Example separating them: independent $Y_n$ with $P(Y_n=1)=\frac1n$. Then $Y_n\to0$ in probability, but $P(\forall n\ge N: Y_n=0)=\prod_{n\ge N}(1-\frac1n)=\frac{N-1}{N}\cdot\frac N{N+1}\cdots=0$. So $Y_n$ does **not** converge to 0 almost surely.`,
        },
      ],
    },
    {
      id: 'clt',
      title: 'Central limit theorem',
      kind: 'theorem',
      body: md`The LLN says $A_n\to\mu$. The CLT describes the **shape** of the fluctuations around $\mu$: they are approximately normal, of size $\sigma/\sqrt n$, whatever the distribution of the $X_i$.`,
      formulas: [
        {
          id: 'clt-f',
          name: 'Central limit theorem',
          tex: md`\lim_{n\to\infty}P\big(\sqrt n(A_n-\mu)\le b\big)=\frac1{\sqrt{2\pi\sigma^2}}\int_{-\infty}^b e^{-\frac{x^2}{2\sigma^2}}dx`,
          conditions: md`$X_i$ mutually independent, identically distributed, with mean $\mu$ and finite positive variance $\sigma^2$.`,
          intuition: md`For large $n$, $A_n\approx N(\mu,\sigma^2/n)$ and $S_n\approx N(n\mu,n\sigma^2)$.`,
          pitfalls: 'The CLT is an asymptotic approximation, not a bound. For guaranteed error probabilities use Chebyshev, Chernoff or Hoeffding.',
        },
      ],
      viz: [{ id: 'clt' }],
    },
  ],
  flashcards: [
    { id: 'l05-c1', front: 'Moment generating function and how it yields moments', back: md`$M_X(t)=E(e^{tX})$; $E(X^n)=M_X^{(n)}(0)$.` },
    { id: 'l05-c2', front: 'MGF of a sum of independent variables', back: md`$M_{X+Y}(t)=M_X(t)M_Y(t)$.` },
    { id: 'l05-c3', front: 'General Chernoff technique', back: md`For $t>0$: $P(X\ge a)=P(e^{tX}\ge e^{ta})\le E(e^{tX})/e^{ta}$ (Markov on $e^{tX}$), then optimise or pick a convenient $t$.` },
    { id: 'l05-c4', front: 'Poisson trials', back: md`Independent 0/1 variables with possibly different success probabilities $p_i$ (not Poisson random variables!).` },
    { id: 'l05-c5', front: 'Chernoff upper bound (both forms)', back: md`$P(X\ge(1+\delta)\mu)\le\big(e^\delta/(1+\delta)^{1+\delta}\big)^\mu$; for $0<\delta\le1$: $\le e^{-\mu\delta^2/3}$.` },
    { id: 'l05-c6', front: 'Chernoff lower bound', back: md`$P(X\le(1-\delta)\mu)\le\big(e^{-\delta}/(1-\delta)^{1-\delta}\big)^\mu\le e^{-\mu\delta^2/2}$.` },
    { id: 'l05-c7', front: 'Two-sided Chernoff bound', back: md`$P(|X-\mu|\ge\delta\mu)\le2e^{-\mu\delta^2/3}$, $0<\delta\le1$.` },
    { id: 'l05-c8', front: "Hoeffding's inequality", back: md`$a_i\le X_i\le b_i$ independent: $P(|X-EX|\ge t)\le2\exp(-2t^2/\sum(b_i-a_i)^2)$.` },
    { id: 'l05-c9', front: 'Hoeffding for the mean of $[0,1]$ variables', back: md`$P(|A_n-\mu|\ge\varepsilon)\le2e^{-2n\varepsilon^2}$.` },
    { id: 'l05-c10', front: 'Weak law of large numbers', back: md`i.i.d., mean $\mu$: $\forall\varepsilon>0$, $P(|A_n-\mu|>\varepsilon)\to0$ (convergence in probability).` },
    { id: 'l05-c11', front: 'Strong law of large numbers', back: md`i.i.d., mean $\mu$: $P(\lim A_n=\mu)=1$ (almost-sure convergence).` },
    { id: 'l05-c12', front: 'Proof of the weak LLN with finite variance', back: md`$\mathrm{Var}(A_n)=\sigma^2/n$; Chebyshev: $P(|A_n-\mu|>\varepsilon)\le\sigma^2/(n\varepsilon^2)\to0$.` },
    { id: 'l05-c13', front: 'Central limit theorem', back: md`i.i.d., mean $\mu$, variance $\sigma^2\in(0,\infty)$: $\sqrt n(A_n-\mu)$ converges in distribution to $N(0,\sigma^2)$.` },
    { id: 'l05-c14', front: 'Example: convergence in probability but not almost surely', back: md`Independent $Y_n$ with $P(Y_n=1)=1/n$: $Y_n\to0$ in probability, but $P(\forall n\ge N:Y_n=0)=\prod(1-1/n)=0$.` },
    { id: 'l05-c15', front: 'Fair coin: P(X ≥ 3n/4) by Markov / Chebyshev / Chernoff / Hoeffding', back: md`$2/3$; $4/n$; $2e^{-n/24}$; $e^{-n/8}$.` },
  ],
  quiz: [
    {
      id: 'l05-q1',
      type: 'numeric',
      prompt: md`$X$ is the number of heads in $n=200$ fair coin flips. Using the simplified two-sided Chernoff bound $2e^{-\mu\delta^2/3}$, bound $P(|X-100|\ge 20)$.`,
      answer: 2 * Math.exp((-100 * 0.04) / 3),
      explanation: md`$\mu=100$, $\delta=0.2$: $2e^{-100\cdot0.04/3}=2e^{-4/3}\approx0.527$. (Chebyshev: $50/400=0.125$. For small deviations Chebyshev can be better; Chernoff wins as the deviation or $n$ grows.)`,
    },
    {
      id: 'l05-q2',
      type: 'numeric',
      prompt: md`Using Hoeffding, how many samples of a $[0,1]$-valued variable are needed so that $P(|A_n-\mu|\ge0.05)\le0.05$? (smallest integer $n$ with $2e^{-2n\varepsilon^2}\le\delta$)`,
      answer: 738,
      tolerance: 0.5,
      explanation: md`$n\ge\frac{\ln(2/0.05)}{2\cdot0.05^2}=\frac{\ln40}{0.005}\approx737.8$, so $n=738$.`,
    },
    {
      id: 'l05-q3',
      type: 'numeric',
      prompt: md`Using Chebyshev with $\mathrm{Var}(X_i)\le\frac14$, how many coin flips guarantee $P(|A_n-p|\ge0.05)\le0.05$? (smallest integer)`,
      answer: 2000,
      tolerance: 0.5,
      explanation: md`$\frac{1}{4n\varepsilon^2}\le\delta\iff n\ge\frac{1}{4\cdot0.0025\cdot0.05}=2000$, almost 3× worse than Hoeffding's 738.`,
    },
    {
      id: 'l05-q4',
      type: 'mcq',
      prompt: md`What is the key difference between the weak and the strong law of large numbers?`,
      options: [
        'The weak law needs finite variance, the strong one does not',
        'The weak law gives convergence in probability; the strong law gives convergence with probability 1 (the "for all n ≥ N" is inside the probability)',
        'The strong law gives the rate of convergence',
        'The weak law is about sums, the strong one about averages',
      ],
      answer: 1,
      explanation: 'Weak: for each large n separately, a large deviation is unlikely. Strong: almost every run eventually stays close forever.',
    },
    {
      id: 'l05-q5',
      type: 'truefalse',
      prompt: md`The Chernoff bounds from the lecture apply to sums of independent 0/1 variables even if they have **different** success probabilities.`,
      answer: true,
      explanation: md`Yes. They are stated for Poisson trials, where only $\mu=\sum p_i$ matters.`,
    },
    {
      id: 'l05-q6',
      type: 'numeric',
      prompt: md`$X\sim\mathrm{Bernoulli}(p)$. Compute $M_X'(0)$ for $p=0.3$.`,
      answer: 0.3,
      explanation: md`$M_X(t)=1-p+pe^t$, so $M_X'(t)=pe^t$ and $M_X'(0)=p=E(X)=0.3$.`,
    },
    {
      id: 'l05-q7',
      type: 'mcq',
      prompt: md`For $n$ fair coin flips, from which $n$ does the lecture's Chernoff bound $2e^{-n/24}$ on $P(X\ge\frac34n)$ beat the Chebyshev bound $4/n$?`,
      options: ['n > 12', 'n > 50', 'n > 92', 'never'],
      answer: 2,
      explanation: md`Solving $2e^{-n/24}<4/n$ numerically gives $n>92$.`,
    },
    {
      id: 'l05-q8',
      type: 'truefalse',
      prompt: md`The central limit theorem gives a guaranteed upper bound on $P(|A_n-\mu|\ge\varepsilon)$ for every finite $n$.`,
      answer: false,
      explanation: 'The CLT is a limit statement (an approximation for large n), not a bound. Use Chebyshev, Chernoff or Hoeffding for guarantees.',
    },
    {
      id: 'l05-q9',
      type: 'numeric',
      prompt: md`$X$ is a sum of independent Poisson trials with $\mu=E(X)=50$. Using $e^{-\mu\delta^2/3}$, bound $P(X\ge 75)$.`,
      answer: Math.exp((-50 * 0.25) / 3),
      explanation: md`$75=(1+0.5)\cdot50$, so $\delta=0.5$. The bound is $e^{-50\cdot0.25/3}=e^{-25/6}\approx0.0155$.`,
    },
  ],
};
