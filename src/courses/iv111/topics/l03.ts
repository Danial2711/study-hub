import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l03: Topic = {
  id: 'l03',
  lecture: 3,
  examGroup: 'Q2',
  title: 'Expectation & the Markov inequality',
  summary: md`Expectation and its linearity, expectations of the standard distributions, sums of independent variables, Jensen's inequality, conditional expectation and the theorem of total expectation, the Markov inequality, and why the expectation alone is not enough.`,
  sections: [
    {
      id: 'expectation',
      title: 'Expectation',
      kind: 'definition',
      body: md`The **expectation** (mean value) compresses a distribution into a single number: a weighted average, or the *centre of gravity* of the probability mass. It always lies in the convex hull of the values of $X$.

It exists only if the sum is **absolutely** convergent. If it converges but not absolutely, there is no finite expectation; if it diverges, the expectation has no meaning (or is $\infty$).`,
      formulas: [
        {
          id: 'exp-def',
          name: 'Expectation',
          tex: md`E(X)=\sum_{x\in\mathrm{Im}(X)}x\,P(X=x)=\sum_{s\in S}X(s)\,P(s)\qquad\Big(\text{continuous: }E(X)=\int_{-\infty}^{\infty}x f_X(x)\,dx\Big)`,
          intuition: 'Long-run average value over many independent repetitions (made precise by the law of large numbers).',
          pitfalls: md`$E(X)$ need not be a possible value of $X$ (a die has $E=3.5$). And $E(f(X))\ne f(E(X))$ in general (Jensen).`,
        },
        {
          id: 'exp-tail',
          name: 'Tail-sum formula',
          tex: md`\mathrm{Im}(X)\subseteq\mathbb N\ \Rightarrow\ E(X)=\sum_{i=1}^\infty P(X\ge i)`,
          intuition: md`Write $x=\sum_{i=1}^x 1$ and swap the sums (allowed by Tonelli, since all terms are non-negative).`,
          conditions: md`For non-negative continuous variables: $E(X)=\int_0^\infty P(X\ge t)\,dt$.`,
        },
      ],
      examples: [
        {
          title: 'Mean of the geometric distribution',
          problem: md`Show that $X\sim\mathrm{Geom}(p)$ has $E(X)=1/p$.`,
          solution: md`By the tail-sum formula, $P(X\ge i)=(1-p)^{i-1}$, so
$$E(X)=\sum_{i\ge1}(1-p)^{i-1}=\frac{1}{1-(1-p)}=\frac1p.$$
(The lecture gets the same result by subtracting $(1-p)E(X)$ from $E(X)$.)`,
        },
      ],
    },
    {
      id: 'dist-means',
      title: 'Expectations of standard distributions',
      kind: 'summary',
      body: md`| distribution | $E(X)$ | short reason |
|---|---|---|
| constant $c$ | $c$ | |
| uniform on $\{x_1..x_n\}$ | $\frac1n\sum x_i$ | |
| Bernoulli$(p)$, indicator $I_A$ | $p$, $P(A)$ | $0\cdot(1-p)+1\cdot p$ |
| binomial $B(n,p)$ | $np$ | sum of $n$ Bernoullis + linearity |
| geometric$(p)$ | $1/p$ | tail sum |
| negative binomial$(r,p)$ | $r/p$ | sum of $r$ geometrics |
| Poisson$(\lambda)$ | $\lambda$ | |
| exponential$(\lambda)$ | $1/\lambda$ | |

**Sums of independent variables.** For independent non-negative integer variables, the PMF of the sum is the **convolution**
$$p_{X+Y}(t)=\sum_{x=0}^t p_X(x)\,p_Y(t-x).$$
Bernoulli + Bernoulli is binomial; $B(n_1,p)+B(n_2,p)=B(n_1+n_2,p)$; geometric + geometric is negative binomial; Poisson + Poisson is Poisson; exponential + exponential is Erlang.`,
      formulas: [
        {
          id: 'negbin',
          name: 'Negative binomial distribution',
          tex: md`P(X=x)=\binom{x-1}{r-1}p^r(1-p)^{x-r},\quad x\ge r,\qquad E(X)=\frac rp`,
          intuition: md`Trials until the $r$-th success. The last trial is a success, and the other $r-1$ successes are placed among the first $x-1$ trials.`,
        },
      ],
    },
    {
      id: 'linearity',
      title: 'Linearity of expectation',
      kind: 'theorem',
      body: md`The most useful tool for computing expectations. It holds **without any independence assumption**.

**Indicator trick:** to compute the expected number of *something*, write the count as a sum of indicators $X=\sum_i I_{A_i}$. Then $E(X)=\sum_i P(A_i)$.`,
      formulas: [
        {
          id: 'linearity-f',
          name: 'Linearity of expectation',
          tex: md`E\Big(\sum_{i=1}^n c_iX_i\Big)=\sum_{i=1}^n c_i\,E(X_i)`,
          intuition: md`$E(X+Y)=\sum_s (X(s)+Y(s))P(s)$ splits into two sums.`,
          conditions: md`**Any** random variables with finite expectations, dependent or not.`,
        },
        {
          id: 'exp-product',
          name: 'Expectation of a product',
          tex: md`X,Y\ \text{independent}\ \Rightarrow\ E(XY)=E(X)\,E(Y)`,
          pitfalls: md`This **needs** independence (or at least uncorrelatedness). The converse fails: $E(XY)=E(X)E(Y)$ does not imply independence.`,
        },
      ],
      examples: [
        {
          title: 'Fixed points of a random permutation',
          problem: md`$n$ ID cards are returned in a uniformly random order. What is the expected number of people who get their own card back?`,
          solution: md`Let $I_i$ indicate that person $i$ gets their own card, so $P(I_i=1)=\frac1n$. Then $E\big(\sum_i I_i\big)=n\cdot\frac1n=1$, for every $n$, even though the $I_i$ are dependent.`,
        },
        {
          title: 'Binomial mean in one line',
          problem: md`Show $E(B(n,p))=np$.`,
          solution: md`$X=X_1+\dots+X_n$ with $X_i\sim\mathrm{Bernoulli}(p)$, so $E(X)=\sum E(X_i)=np$. No binomial-coefficient algebra needed.`,
        },
      ],
    },
    {
      id: 'jensen',
      title: "Jensen's inequality",
      kind: 'theorem',
      body: md`Linearity covers linear functions. For convex or concave $f$ we only get an inequality.`,
      formulas: [
        {
          id: 'jensen-f',
          name: "Jensen's inequality",
          tex: md`f\ \text{convex}\Rightarrow E[f(X)]\ge f(E(X)),\qquad f\ \text{concave}\Rightarrow E[f(X)]\le f(E(X))`,
          intuition: 'For a two-point distribution, E[f(X)] is a point on the chord between (x₁, f(x₁)) and (x₂, f(x₂)), and a convex function lies below its chords.',
          conditions: md`Examples: $E(X^2)\ge E(X)^2$ (so variance $\ge0$); $E(\log X)\le\log E(X)$, which is used throughout information theory (Lecture 9).`,
        },
      ],
      viz: [{ id: 'jensen' }],
    },
    {
      id: 'cond-exp',
      title: 'Conditional expectation',
      kind: 'definition',
      body: md`The **conditional distribution** of $X$ given $Y=y$ is $p_{X\mid Y}(x\mid y)=\frac{p_{X,Y}(x,y)}{p_Y(y)}$ (for $p_Y(y)\ne0$). For independent variables it equals $p_X(x)$.

$Y\mid(X=x)$ is itself a random variable, so it has a mean: the **conditional expectation**.`,
      formulas: [
        {
          id: 'cond-exp-f',
          name: 'Conditional expectation',
          tex: md`E(Y\mid X=x)=\sum_y y\,P(Y=y\mid X=x)`,
        },
        {
          id: 'total-exp',
          name: 'Theorem of total expectation',
          tex: md`E(Y)=\sum_x E(Y\mid X=x)\,p_X(x)`,
          intuition: 'Split into cases by the value of X, compute the mean in each case, then average with weights P(X = x). It is the expectation analogue of total probability.',
          conditions: 'Typical use: random sums, first-step analysis of Markov chains and games.',
        },
      ],
      examples: [
        {
          title: 'Random sums (Wald)',
          problem: md`$N,X_1,X_2,\dots$ are mutually independent, and the $X_i$ are identically distributed with mean $E(X)$. Find $E(T)$ for $T=X_1+\dots+X_N$.`,
          solution: md`For fixed $N=n$: $E(T\mid N=n)=\sum_{i=1}^n E(X_i)=nE(X)$. By total expectation,
$$E(T)=\sum_n nE(X)\,p_N(n)=E(X)\,E(N).$$`,
        },
      ],
    },
    {
      id: 'markov',
      title: 'Markov inequality',
      kind: 'theorem',
      body: md`Knowing only the mean of a **non-negative** variable already limits how much mass can sit far out in the tail.`,
      formulas: [
        {
          id: 'markov-ineq',
          name: 'Markov inequality',
          tex: md`X\ge0,\ t>0:\qquad P(X\ge t)\le\frac{E(X)}{t}`,
          symbols: [
            { sym: 'X', meaning: 'non-negative random variable with finite mean' },
            { sym: 't', meaning: 'threshold' },
          ],
          intuition: md`If more than a fraction $E(X)/t$ of the mass were at values $\ge t$, those values alone would push the mean above $E(X)$.`,
          conditions: md`Only meaningful for $t>E(X)$ (otherwise the bound is $\ge1$). Equivalent form: $P(X\ge kE(X))\le 1/k$.`,
          pitfalls: md`It requires $X\ge0$. The bound is often weak (it decays only like $1/t$) but it is tight: for $X\in\{0,t\}$ with $P(X=t)=E(X)/t$ it holds with equality.`,
        },
      ],
      proof: md`Fix $t>0$ and let $Y_t=t$ if $X\ge t$, and $0$ otherwise. Then $X\ge Y_t$ pointwise, so
$$E(X)\ge E(Y_t)=t\,P(X\ge t).$$`,
      examples: [
        {
          title: 'Coin flips',
          problem: md`Bound the probability of at least 75 heads in 100 fair coin flips.`,
          solution: md`$E(X)=50$, so $P(X\ge75)\le\frac{50}{75}=\frac23$. This holds for any $n$: $P(X\ge\frac34 n)\le\frac23$, so the bound **does not improve with $n$**. Chebyshev and Chernoff (next lectures) do far better.`,
        },
      ],
      viz: [{ id: 'tailBounds', caption: 'The orange Markov curve is the weakest of the bounds; the next lectures add the others.' }],
    },
    {
      id: 'not-everything',
      title: 'Expectation is not everything',
      kind: 'concept',
      body: md`**St. Petersburg lottery.** The pot starts at \$1 and doubles with each head; the first tail ends the game. Then
$$E(X)=\sum_{i\ge1}2^{-i}2^{i-1}=\sum\tfrac12=\infty,$$
yet $P(X\ge32)=2^{-5}\approx3\%$. With a finite bankroll (say a billion dollars) the fair price is only about \$16.

**Two programs.** A runs 1 h on 99% of inputs and 1000 h on 1%. B always runs 10.99 h. Both have mean 10.99 h, but they differ hugely in their **deviation** from that mean. This is what **moments** and the **variance** measure.

The $k$-th **moment** is $E(X^k)$, and the $k$-th **central moment** is $\mu_k=E[(X-E X)^k]$. If all moments of $X$ and $Y$ agree, they have the same distribution.`,
    },
  ],
  flashcards: [
    { id: 'l03-c1', front: 'Definition of expectation (discrete)', back: md`$E(X)=\sum_x x\,P(X=x)$, provided the sum converges **absolutely**.` },
    { id: 'l03-c2', front: 'Linearity of expectation — conditions?', back: md`$E(\sum c_iX_i)=\sum c_iE(X_i)$ holds for **any** random variables (no independence needed).` },
    { id: 'l03-c3', front: 'When is $E(XY)=E(X)E(Y)$?', back: 'When X and Y are independent (sufficient, but not necessary).' },
    { id: 'l03-c4', front: "Jensen's inequality", back: md`Convex $f$: $E f(X)\ge f(EX)$. Concave $f$: $E f(X)\le f(EX)$.` },
    { id: 'l03-c5', front: 'Tail-sum formula for $\\mathbb N$-valued $X$', back: md`$E(X)=\sum_{i\ge1}P(X\ge i)$.` },
    { id: 'l03-c6', front: 'Mean of geometric, binomial, negative binomial', back: md`$1/p$, $np$, $r/p$.` },
    { id: 'l03-c7', front: 'Theorem of total expectation', back: md`$E(Y)=\sum_x E(Y\mid X=x)\,p_X(x)$.` },
    { id: 'l03-c8', front: 'Expected value of a random sum $T=X_1+\\dots+X_N$', back: md`$E(T)=E(N)E(X)$ (for $N,X_i$ independent and $X_i$ identically distributed).` },
    { id: 'l03-c9', front: 'Markov inequality (statement and assumptions)', back: md`For $X\ge0$ with finite mean and $t>0$: $P(X\ge t)\le E(X)/t$.` },
    { id: 'l03-c10', front: 'Proof idea of the Markov inequality', back: md`$Y_t=t\cdot I[X\ge t]\le X$, so $E(X)\ge E(Y_t)=tP(X\ge t)$.` },
    { id: 'l03-c11', front: 'PMF of a sum of independent $\\mathbb N_0$-valued variables', back: md`Convolution: $p_{X+Y}(t)=\sum_{x=0}^t p_X(x)p_Y(t-x)$.` },
    { id: 'l03-c12', front: 'Geometric + geometric (independent, same p) = ?', back: 'Negative binomial with r = 2. More generally, a sum of r geometrics is NegBin(r, p).' },
    { id: 'l03-c13', front: 'St. Petersburg paradox: what does it show?', back: 'A game can have infinite expectation while large wins are very unlikely. The mean alone is a poor description; we also need deviations (variance) and tail bounds.' },
    { id: 'l03-c14', front: 'k-th moment and k-th central moment', back: md`$E(X^k)$ and $\mu_k=E[(X-EX)^k]$.` },
    { id: 'l03-c15', front: 'Expected number of fixed points of a random permutation of n', back: md`$1$ (indicators: $n\cdot\frac1n$).` },
  ],
  quiz: [
    {
      id: 'l03-q1',
      type: 'numeric',
      prompt: md`A fair die is rolled until the first 6. What is the expected number of rolls?`,
      answer: 6,
      explanation: md`$X\sim\mathrm{Geom}(1/6)$, so $E(X)=1/p=6$.`,
    },
    {
      id: 'l03-q2',
      type: 'numeric',
      prompt: md`Ten balls are placed independently and uniformly at random into 5 bins. What is the expected number of **empty** bins?`,
      answer: 5 * 0.8 ** 10,
      explanation: md`Indicator $I_j$ for "bin $j$ is empty": $P=(4/5)^{10}$. Linearity gives $5\cdot0.8^{10}\approx0.537$.`,
    },
    {
      id: 'l03-q3',
      type: 'numeric',
      prompt: md`$X\ge0$ has $E(X)=4$. What is the best upper bound on $P(X\ge 10)$ that the Markov inequality gives?`,
      answer: 0.4,
      explanation: md`$P(X\ge10)\le 4/10=0.4$.`,
    },
    {
      id: 'l03-q4',
      type: 'mcq',
      prompt: md`Which statement about linearity of expectation is correct?`,
      options: ['It holds only for independent variables', 'It holds for any variables with finite expectations', 'It holds only for discrete variables', 'It holds only for non-negative variables'],
      answer: 1,
      explanation: 'Linearity holds in full generality; independence is needed only for E(XY) = E(X)E(Y) (and Var of sums).',
    },
    {
      id: 'l03-q5',
      type: 'numeric',
      prompt: md`The number of customers $N$ per day has $E(N)=40$, and each spends on average 12.5 (independently of $N$ and of each other). What is the expected daily revenue?`,
      answer: 500,
      explanation: md`Random sum: $E(T)=E(N)E(X)=40\cdot12.5=500$.`,
    },
    {
      id: 'l03-q6',
      type: 'truefalse',
      prompt: md`For every random variable $X$ with finite second moment, $E(X^2)\ge (E X)^2$.`,
      answer: true,
      explanation: md`Jensen with the convex $f(x)=x^2$; equivalently $\mathrm{Var}(X)=E(X^2)-(EX)^2\ge0$.`,
    },
    {
      id: 'l03-q7',
      type: 'numeric',
      prompt: md`$X\sim\mathrm{NegBin}(r=3,p=0.25)$ counts trials until the 3rd success. Compute $E(X)$.`,
      answer: 12,
      explanation: md`$E(X)=r/p=3/0.25=12$: three independent geometric waiting times of mean 4 each.`,
    },
    {
      id: 'l03-q8',
      type: 'mcq',
      prompt: md`For 100 fair coin flips, Markov gives $P(X\ge75)\le\frac23$. How does the Markov bound on $P(X\ge \frac34 n)$ change as $n$ grows?`,
      options: ['It goes to 0 exponentially', 'It decreases like 1/n', 'It stays 2/3 for all n', 'It increases'],
      answer: 2,
      explanation: md`$\frac{n/2}{3n/4}=\frac23$ regardless of $n$. Markov ignores concentration, which is why we need Chebyshev and Chernoff.`,
    },
    {
      id: 'l03-q9',
      type: 'numeric',
      prompt: md`$X$ takes values $1,2,3$ with probabilities $0.2,0.5,0.3$. Compute $E(X^2)$.`,
      answer: 0.2 + 2 + 2.7,
      explanation: md`$1\cdot0.2+4\cdot0.5+9\cdot0.3=0.2+2+2.7=4.9$.`,
    },
    {
      id: 'l03-q10',
      type: 'truefalse',
      prompt: md`If $E(XY)=E(X)E(Y)$ then $X$ and $Y$ are independent.`,
      answer: false,
      explanation: md`Counterexample: $X$ uniform on $\{-1,0,1\}$ and $Y=X^2$. Then $E(XY)=E(X^3)=0=E(X)E(Y)$, but $Y$ is a function of $X$.`,
    },
  ],
};
