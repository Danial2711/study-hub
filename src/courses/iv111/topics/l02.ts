import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l02: Topic = {
  id: 'l02',
  lecture: 2,
  examGroup: 'Q1',
  title: 'Random variables & distributions',
  summary: md`Chain rule, conditional variants of Bayes and total probability, conditional independence; random variables, PMF and CDF, the standard discrete and continuous distributions, random vectors and independence of random variables.`,
  sections: [
    {
      id: 'chain-rule',
      title: 'Chain rule and conditional variants',
      kind: 'theorem',
      body: md`Conditioning is a parameter that *changes the probability function*. $P(\cdot\mid X)$ is itself a probability function, so every theorem holds inside it.

> **Do not mix apples and oranges:** $P(A\mid B)+P(C)$ is meaningless. Rescale first: $P(A\mid B)P(B)+P(C)$.

Inside the space conditioned on $X$, the complement rule reads $P(\overline A\mid X)=1-P(A\mid X)$, and "$P(A\mid B)$ given $X$" is $P(A\mid B\cap X)$.`,
      formulas: [
        {
          id: 'chain',
          name: 'Chain rule',
          tex: md`P(A\cap B\cap C\cap D)=P(D\mid A\cap B\cap C)\,P(C\mid A\cap B)\,P(B\mid A)\,P(A)`,
          intuition: 'Observe the results one by one; each factor is the probability of the next observation given everything seen so far.',
          conditions: 'All conditioning events must have positive probability.',
        },
        {
          id: 'bayes-cond',
          name: "Bayes' rule, conditional variant",
          tex: md`P(A\mid B\cap C)=\frac{P(B\cap C\mid A)P(A)}{P(B\cap C)}=\frac{P(B\mid A\cap C)\,P(A\mid C)}{P(B\mid C)}`,
          intuition: md`The second form is simply Bayes' rule applied in the world where $C$ is already known.`,
        },
        {
          id: 'total-cond',
          name: 'Total probability, conditional variant',
          tex: md`P(A\mid X)=\sum_{i=1}^n P(A\mid B_i\cap X)\,P(B_i\mid X)`,
          conditions: md`$\{B_1,\dots,B_n\}$ is a partition of $S$ (hence also a partition with respect to $P(\cdot\mid X)$).`,
        },
      ],
    },
    {
      id: 'cond-indep',
      title: 'Conditional independence',
      kind: 'definition',
      body: md`$A$ and $B$ are **independent given $X$** if
$$P(A\cap B\mid X)=P(A\mid X)\,P(B\mid X).$$
Conditional independence and (unconditional) independence **do not imply each other**.`,
      examples: [
        {
          title: 'A fair die',
          problem: md`$S=\{1,\dots,6\}$ uniform, with $A=\{1,2,5\}$, $B=\{2,4,6\}$, $X=\{1,2,3,4\}$. Are $A,B$ independent? Are they independent given $X$? Given $\overline X$?`,
          solution: md`- **Unconditionally:** $P(A\cap B)=P(\{2\})=\frac16\ne\frac12\cdot\frac12$, so they are dependent.
- **Given $X$:** $P(A\cap B\mid X)=\frac14$ and $P(A\mid X)P(B\mid X)=\frac24\cdot\frac24=\frac14$, so they are independent.
- **Given $\overline X=\{5,6\}$:** $P(A\cap B\mid\overline X)=0\ne\frac12\cdot\frac12$, so they are dependent.`,
        },
      ],
    },
    {
      id: 'rv',
      title: 'Random variables',
      kind: 'definition',
      body: md`A **random variable** assigns a number to every outcome. Formally, given $(S,\mathcal F,P)$, it is a function $X:S\to\mathbb R$ that is *measurable*:
$$\{s\mid X(s)\le r\}\in\mathcal F\quad\text{for every } r\in\mathbb R.$$

- The **image** is $\mathrm{Im}(X)=\{X(s)\mid s\in S\}$.
- The **inverse image** of $x$ is the event $[X=x]=\{s\in S\mid X(s)=x\}$. The events $[X=x]$ for $x\in\mathrm{Im}(X)$ form a **partition** of $S$.
- $X$ is **discrete** if there is a countable set $R$ with $P(X\in R)=1$.
- Notation: $P(X\in A)=P(\{s\mid X(s)\in A\})$, and $P(a<X\le b)$ etc. for intervals.`,
      formulas: [
        {
          id: 'pmf',
          name: 'Probability mass function (PMF)',
          tex: md`p_X(x)=P(X=x)=\sum_{s:\,X(s)=x}P(s),\qquad 0\le p_X(x)\le 1,\quad\sum_x p_X(x)=1`,
          intuition: 'How much probability mass sits exactly at the value x.',
          conditions: '(p1) and (p2) characterise PMFs: any function satisfying them is the PMF of some discrete random variable.',
          pitfalls: 'Do not confuse the probability distribution (PMF) with the distribution function (CDF).',
        },
        {
          id: 'cdf',
          name: 'Cumulative distribution function (CDF)',
          tex: md`F_X(x)=P(X\le x),\qquad P(a<X\le b)=F_X(b)-F_X(a),\qquad P(X>x)=1-F_X(x)`,
          intuition: 'Accumulated probability up to x. It always exists, whether X is discrete, continuous or mixed.',
          conditions: md`Properties: (F1) $0\le F\le1$; (F2) non-decreasing; (F3) $F(-\infty)=0$, $F(+\infty)=1$; (F4) right-continuous. Any function with (F1)–(F4) is the CDF of some random variable.`,
        },
      ],
      viz: [{ id: 'distribution', props: { kind: 'binomial' } }],
    },
    {
      id: 'discrete-dists',
      title: 'Common discrete distributions',
      kind: 'definition',
      body: md`| distribution | PMF | support | models |
|---|---|---|---|
| constant $c$ | $p(c)=1$ | $\{c\}$ | no randomness |
| uniform | $p(x)=1/n$ | $n$ values | fair die (no uniform distribution on $\mathbb N$!) |
| indicator $I_A$ | $I_A(s)=1$ iff $s\in A$ | $\{0,1\}$ | whether event $A$ occurs |
| Bernoulli$(p)$ | $p(1)=p,\ p(0)=1-p$ | $\{0,1\}$ | one trial with success probability $p$ |
| geometric$(p)$ | $p(i)=(1-p)^{i-1}p$ | $1,2,\dots$ | trials up to **and including** the first success |
| binomial$(n,p)$ | $\binom nk p^k(1-p)^{n-k}$ | $0..n$ | number of successes in $n$ i.i.d. trials |

The geometric PMF sums to 1 by the geometric series: $\sum_{i\ge1}p(1-p)^{i-1}=\frac{p}{1-(1-p)}=1$ (this needs $p\ne0$). The binomial sums to 1 by the binomial theorem: $\sum_k\binom nk p^k(1-p)^{n-k}=(p+1-p)^n=1$.`,
      formulas: [
        {
          id: 'geom-memoryless',
          name: 'Memorylessness of the geometric distribution',
          tex: md`P(X>t+l\mid X>l)=P(X>t),\qquad P(X>t)=(1-p)^{t}`,
          intuition: 'However long you have already waited, the remaining waiting time has the same distribution. The coin has no memory of past failures.',
          conditions: md`$t,l\in\mathbb N$. The geometric distribution is the **only** memoryless discrete distribution on $\mathbb N$, and the exponential is the only continuous one.`,
        },
      ],
      viz: [{ id: 'distribution', props: { kind: 'geometric', kinds: ['geometric', 'bernoulli', 'binomial', 'udiscrete', 'negbinomial', 'poisson'] }, caption: 'Tick "show memorylessness" to compare the distribution of X − s given X > s with the original.' }],
    },
    {
      id: 'continuous',
      title: 'Continuous random variables',
      kind: 'definition',
      body: md`$X$ is **continuous** iff its CDF $F_X$ is continuous. Then $P(X=r)=0$ for every $r$, but some regions are "more probable" than others. This is captured by the **density** $f_X$, a function whose integral gives the CDF (wherever $F$ is differentiable, $f=F'$):
$$F_X(x)=\int_{-\infty}^x f_X(t)\,dt,\qquad P(a<X\le b)=\int_a^b f_X(t)\,dt.$$
Density values are **not probabilities**: they can exceed 1.

| distribution | density | mean | variance |
|---|---|---|---|
| uniform $U(a,b)$ | $\frac1{b-a}$ on $[a,b]$ | $\frac{a+b}2$ | $\frac{(b-a)^2}{12}$ |
| normal $N(\mu,\sigma^2)$ | $\frac1{\sqrt{2\pi\sigma^2}}e^{-\frac{(x-\mu)^2}{2\sigma^2}}$ | $\mu$ | $\sigma^2$ |
| exponential $\mathrm{Exp}(\lambda)$ | $\lambda e^{-\lambda x}$, $x\ge0$ | $\frac1\lambda$ | $\frac1{\lambda^2}$ |

**Why we need CDFs:** a **mixed** variable, e.g. $P(X=1)=\frac12$ with the remaining mass uniform on $(a,b)$, has neither a PMF nor a density. Only the CDF describes it.`,
      viz: [{ id: 'distribution', props: { kind: 'normal', kinds: ['normal', 'uniform', 'exponential'] } }],
    },
    {
      id: 'vectors',
      title: 'Random vectors, marginals, independence',
      kind: 'definition',
      body: md`A **random vector** $(X_1,\dots,X_r)$ studies several variables on the same space together, with **joint PMF**
$$p_{X,Y}(x,y)=P(X=x\wedge Y=y)=P([X=x]\cap[Y=y]).$$
**Marginals** are obtained by summing out the other variables: $p_X(x)=\sum_y p_{X,Y}(x,y)$.
In general, the joint distribution **cannot** be reconstructed from the marginals. It can when the variables are independent.

$X_1,\dots,X_r$ are **mutually independent** iff for every sub-collection and all values the joint PMF factorises:
$$p_{X_{i_1},\dots,X_{i_k}}(x_{i_1},\dots,x_{i_k})=\prod_j p_{X_{i_j}}(x_{i_j}).$$
Equivalently, the events $[X_1=x_1],\dots,[X_r=x_r]$ are independent for all choices of values. *Pairwise* independence only requires this for pairs.`,
      formulas: [
        {
          id: 'marginal',
          name: 'Marginal distribution',
          tex: md`p_X(x)=\sum_{y\in\mathrm{Im}(Y)}p_{X,Y}(x,y)`,
          intuition: 'Collapse the joint table: row sums give the distribution of X, column sums that of Y.',
        },
        {
          id: 'rv-indep',
          name: 'Independent random variables',
          tex: md`X\perp Y\iff p_{X,Y}(x,y)=p_X(x)\,p_Y(y)\ \ \forall x,y`,
          pitfalls: 'Checking the factorisation for one pair (x, y) is not enough: it has to hold for all of them.',
        },
      ],
      examples: [
        {
          title: 'Joint table',
          problem: md`$X,Y\in\{0,1\}$ with $p(0,0)=0.3$, $p(0,1)=0.2$, $p(1,0)=0.3$, $p(1,1)=0.2$. Are they independent?`,
          solution: md`The marginals are $p_X=(0.5,0.5)$ and $p_Y=(0.6,0.4)$. Checking every cell: $0.5\cdot0.6=0.3$, $0.5\cdot0.4=0.2$, $0.5\cdot0.6=0.3$, $0.5\cdot0.4=0.2$. All match, so $X\perp Y$.`,
        },
      ],
    },
  ],
  flashcards: [
    { id: 'l02-c1', front: 'Formal definition of a **random variable**', back: md`A function $X:S\to\mathbb R$ such that $\{s\mid X(s)\le r\}\in\mathcal F$ for every $r\in\mathbb R$ (measurable).` },
    { id: 'l02-c2', front: 'When is a random variable **discrete**?', back: md`When there is a countable $R\subseteq\mathbb R$ with $P(X\in R)=1$.` },
    { id: 'l02-c3', front: 'The four properties of a CDF', back: md`(F1) $0\le F\le1$; (F2) non-decreasing; (F3) limits 0 at $-\infty$ and 1 at $+\infty$; (F4) right-continuous.` },
    { id: 'l02-c4', front: 'When is a random variable **continuous**?', back: 'When its cumulative distribution function is continuous (then P(X = r) = 0 for all r).' },
    { id: 'l02-c5', front: 'What is a probability **density**?', back: md`A function $f$ with $F_X(x)=\int_{-\infty}^x f(t)dt$ (the derivative of the CDF). Its values are not probabilities and can exceed 1.` },
    { id: 'l02-c6', front: 'Why is the CDF needed and not only PMF/density?', back: 'Mixed variables (e.g. an atom P(X = 1) = 1/2 plus a uniform part) have neither a PMF nor a density; only the CDF describes them.' },
    { id: 'l02-c7', front: 'Geometric distribution: PMF and meaning', back: md`$p(i)=(1-p)^{i-1}p$, $i\ge1$: the number of Bernoulli trials up to and including the first success.` },
    { id: 'l02-c8', front: 'Memoryless property (geometric)', back: md`$P(X>t+l\mid X>l)=P(X>t)$, since $P(X>t)=(1-p)^t$.` },
    { id: 'l02-c9', front: 'Binomial distribution PMF', back: md`$P(X=k)=\binom nk p^k(1-p)^{n-k}$, $k=0,\dots,n$: the number of successes in $n$ independent trials.` },
    { id: 'l02-c10', front: 'Is there a uniform distribution on $\mathbb N$?', back: md`No: equal masses $c$ would give $\sum c\in\{0,\infty\}\ne1$.` },
    { id: 'l02-c11', front: 'Conditional independence of $A$ and $B$ given $X$', back: md`$P(A\cap B\mid X)=P(A\mid X)P(B\mid X)$. It neither implies nor is implied by unconditional independence.` },
    { id: 'l02-c12', front: 'Marginal PMF from a joint PMF', back: md`$p_X(x)=\sum_y p_{X,Y}(x,y)$.` },
    { id: 'l02-c13', front: 'Independence of random variables $X,Y$', back: md`$p_{X,Y}(x,y)=p_X(x)p_Y(y)$ for **all** $x,y$, i.e. the events $[X=x]$ and $[Y=y]$ are independent for all values.` },
    { id: 'l02-c14', front: 'Indicator random variable $I_A$', back: md`$I_A(s)=1$ if $s\in A$, else $0$. It is Bernoulli with parameter $P(A)$, and $E(I_A)=P(A)$.` },
    { id: 'l02-c15', front: 'Density of the normal distribution $N(\mu,\sigma^2)$', back: md`$f(x)=\frac1{\sqrt{2\pi\sigma^2}}e^{-(x-\mu)^2/(2\sigma^2)}$.` },
    { id: 'l02-c16', front: 'Exponential distribution: density and CDF', back: md`$f(t)=\lambda e^{-\lambda t}$, $F(t)=1-e^{-\lambda t}$ for $t\ge0$; mean $1/\lambda$. Memoryless.` },
    { id: 'l02-c17', front: 'Conditional total probability', back: md`$P(A\mid X)=\sum_i P(A\mid B_i\cap X)P(B_i\mid X)$ for a partition $\{B_i\}$.` },
  ],
  quiz: [
    {
      id: 'l02-q1',
      type: 'numeric',
      prompt: md`$X\sim\mathrm{Geom}(p=0.2)$ (trials until the first success). Compute $P(X>3)$.`,
      answer: 0.8 ** 3,
      explanation: md`$P(X>3)$ means the first three trials all fail: $(1-p)^3=0.8^3=0.512$.`,
    },
    {
      id: 'l02-q2',
      type: 'numeric',
      prompt: md`$X\sim\mathrm{Geom}(1/6)$ counts die throws until the first 6. Given that no 6 appeared in the first 4 throws, what is the probability that more than 6 throws are needed in total?`,
      answer: (5 / 6) ** 2,
      explanation: md`By memorylessness, $P(X>6\mid X>4)=P(X>2)=(5/6)^2\approx0.694$.`,
    },
    {
      id: 'l02-q3',
      type: 'numeric',
      prompt: md`$X\sim\mathrm{Bin}(5,0.5)$. Compute $P(X\ge4)$.`,
      answer: 6 / 32,
      explanation: md`$P(X=4)+P(X=5)=\binom54 2^{-5}+\binom55 2^{-5}=\frac{5+1}{32}=\frac{3}{16}=0.1875$.`,
    },
    {
      id: 'l02-q4',
      type: 'mcq',
      prompt: md`Which function **cannot** be a CDF?`,
      options: [md`$F(x)=0$ for $x<0$, $1-e^{-x}$ for $x\ge0$`, md`$F(x)=\frac12+\frac1\pi\arctan x$`, md`$F(x)=0$ for $x<0$, $x/2$ on $[0,1)$, $1$ for $x\ge1$`, md`$F(x)=e^{-x^2}$`],
      answer: 3,
      explanation: md`$e^{-x^2}$ is not monotone (it rises and then falls) and tends to $0$ at $+\infty$, violating (F2) and (F3). Option 3 has a jump at 1, which is allowed: it is a mixed distribution.`,
    },
    {
      id: 'l02-q5',
      type: 'truefalse',
      prompt: md`If $A$ and $B$ are independent, they are also independent given any event $X$ with $P(X)>0$.`,
      answer: false,
      explanation: md`Counterexample: two fair coin flips, $A$ = first is H, $B$ = second is H, $X$ = exactly one H. Then $P(A\cap B\mid X)=0$ but $P(A\mid X)P(B\mid X)=\frac14$.`,
    },
    {
      id: 'l02-q6',
      type: 'numeric',
      prompt: md`$X$ has density $f(x)=2x$ on $[0,1]$ (and 0 elsewhere). Compute $P(X\le 0.5)$.`,
      answer: 0.25,
      explanation: md`$F(x)=\int_0^x 2t\,dt=x^2$, so $P(X\le 0.5)=0.25$.`,
    },
    {
      id: 'l02-q7',
      type: 'mcq',
      prompt: md`For a continuous random variable $X$ with density $f$, which statement is true?`,
      options: [md`$f(x)\le1$ for all $x$`, md`$P(X=x)=f(x)$`, md`$P(X=x)=0$ for every $x$`, md`$F$ need not be continuous`],
      answer: 2,
      explanation: md`A continuous CDF has no jumps, so every single point has probability 0. Densities can exceed 1 (e.g. $U(0,\frac12)$ has density 2).`,
    },
    {
      id: 'l02-q8',
      type: 'truefalse',
      prompt: md`The joint distribution of $(X,Y)$ is always determined by the marginal distributions of $X$ and $Y$.`,
      answer: false,
      explanation: md`Different joint distributions can share the same marginals: $Y=X$ and $Y$ an independent copy of $X$ have identical marginals. Marginals determine the joint only under independence.`,
    },
    {
      id: 'l02-q9',
      type: 'numeric',
      prompt: md`Two fair dice: $X$ is the maximum of the two faces. Compute $P(X=4)$.`,
      answer: 7 / 36,
      explanation: md`$P(X\le 4)-P(X\le3)=\frac{16}{36}-\frac9{36}=\frac7{36}\approx0.194$.`,
    },
    {
      id: 'l02-q10',
      type: 'numeric',
      prompt: md`$T\sim\mathrm{Exp}(\lambda=0.5)$. Compute $P(T>4)$.`,
      answer: Math.exp(-2),
      explanation: md`$P(T>t)=e^{-\lambda t}=e^{-2}\approx0.1353$.`,
    },
  ],
};
