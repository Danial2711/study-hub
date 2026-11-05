import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l04: Topic = {
  id: 'l04',
  lecture: 4,
  examGroup: 'Q2',
  title: 'Variance, covariance & the Chebyshev inequality',
  summary: md`Variance and its properties, variances of standard distributions, covariance and correlation, the variance of sums, conditional moments with the random-sum example, and the Chebyshev inequality.`,
  sections: [
    {
      id: 'variance',
      title: 'Variance',
      kind: 'definition',
      body: md`The **variance** is the second central moment. It measures how far $X$ typically strays from its mean. The **standard deviation** $\sigma_X=\sqrt{\mathrm{Var}(X)}$ has the same units as $X$.

A small variance means $X$ is close to $E(X)$ with high probability; a large one means a more diffused distribution.`,
      formulas: [
        {
          id: 'var-def',
          name: 'Variance',
          tex: md`\mathrm{Var}(X)=E\big[(X-E X)^2\big]=E(X^2)-\big(E X\big)^2`,
          symbols: [
            { sym: md`E(X^2)`, meaning: 'second (raw) moment' },
            { sym: md`(EX)^2`, meaning: 'square of the mean' },
          ],
          intuition: 'Average squared distance from the mean. The second form ("mean of the square minus square of the mean") is usually easier to compute.',
          pitfalls: md`$E(X^2)\ne (EX)^2$ in general, and $\mathrm{Var}(X)\ge0$, with equality iff $X$ is constant almost surely.`,
        },
        {
          id: 'var-affine',
          name: 'Affine transformation',
          tex: md`\mathrm{Var}(aX+b)=a^2\,\mathrm{Var}(X)`,
          intuition: 'Shifting does not change the spread; scaling by a scales the deviations by a, hence the variance by a².',
        },
      ],
    },
    {
      id: 'var-table',
      title: 'Means and variances of standard distributions',
      kind: 'summary',
      body: md`| distribution | $E(X)$ | $\mathrm{Var}(X)$ |
|---|---|---|
| constant $c$ | $c$ | $0$ |
| uniform on $a..b$ ($n=b-a+1$ values) | $\frac{a+b}2$ | $\frac{n^2-1}{12}$ |
| Bernoulli$(p)$ | $p$ | $p(1-p)$ |
| binomial $B(n,p)$ | $np$ | $np(1-p)$ |
| geometric$(p)$ | $\frac1p$ | $\frac{1-p}{p^2}$ |
| negative binomial$(r,p)$ | $\frac rp$ | $\frac{r(1-p)}{p^2}$ |
| Poisson$(\lambda)$ | $\lambda$ | $\lambda$ |
| uniform $U(a,b)$ (continuous) | $\frac{a+b}2$ | $\frac{(b-a)^2}{12}$ |
| exponential$(\lambda)$ | $\frac1\lambda$ | $\frac1{\lambda^2}$ |
| normal $N(\mu,\sigma^2)$ | $\mu$ | $\sigma^2$ |

The binomial and negative binomial rows follow from the Bernoulli and geometric rows by additivity of variance for independent summands.`,
      viz: [{ id: 'distribution' }],
    },
    {
      id: 'covariance',
      title: 'Covariance and correlation',
      kind: 'definition',
      body: md`Is $\mathrm{Var}(X+Y)=\mathrm{Var}(X)+\mathrm{Var}(Y)$? Expanding the square gives an extra cross term:
$$\mathrm{Var}(X+Y)=\mathrm{Var}(X)+\mathrm{Var}(Y)+2\big(E(XY)-E(X)E(Y)\big).$$
The cross term is (twice) the **covariance**. It measures *linear* dependence: positive for correlated variables, negative for anti-correlated ones.`,
      formulas: [
        {
          id: 'cov',
          name: 'Covariance',
          tex: md`\mathrm{Cov}(X,Y)=E\big[(X-EX)(Y-EY)\big]=E(XY)-E(X)E(Y)`,
          intuition: 'Do X and Y tend to be above their means at the same time? Note Cov(X, X) = Var(X) and Cov(X, aX) = a·Var(X).',
        },
        {
          id: 'corr',
          name: 'Correlation coefficient',
          tex: md`\rho(X,Y)=\frac{\mathrm{Cov}(X,Y)}{\sqrt{\mathrm{Var}(X)\mathrm{Var}(Y)}}\in[-1,1]`,
          intuition: md`Normalised covariance. $|\rho|=1$ iff $Y=aX+b$ almost surely; for $Y=aX$, $\rho=\mathrm{sign}(a)$.`,
          conditions: md`Follows from $\mathrm{Cov}(X,Y)^2\le\mathrm{Var}(X)\mathrm{Var}(Y)$ (Cauchy–Schwarz).`,
        },
      ],
      examples: [
        {
          title: 'Zero covariance without independence',
          problem: md`$X$ is uniform on $\{-1,0,1\}$ and $Y=X^2$. Compute $\mathrm{Cov}(X,Y)$.`,
          solution: md`$E(X)=0$, $E(XY)=E(X^3)=0$, so $\mathrm{Cov}=0-0\cdot\frac23=0$. Yet $Y$ is a function of $X$. Hence
independent $\Rightarrow$ $\mathrm{Cov}=0$, but $\mathrm{Cov}=0\not\Rightarrow$ independent.`,
        },
      ],
    },
    {
      id: 'var-sum',
      title: 'Variance of sums',
      kind: 'theorem',
      body: md`For **pairwise** independent variables all covariances vanish, so variances add. Pairwise independence is enough, because only pairs appear in $\mathrm{Var}(\sum X_i)=\sum_{i,j}\mathrm{Cov}(X_i,X_j)$.`,
      formulas: [
        {
          id: 'var-sum-f',
          name: 'Variance of a linear combination',
          tex: md`\mathrm{Var}\Big(\sum_{i=1}^n a_iX_i+b\Big)=\sum_{i=1}^n a_i^2\mathrm{Var}(X_i)+2\sum_{1\le i<j\le n}a_ia_j\,\mathrm{Cov}(X_i,X_j)`,
          conditions: md`If the $X_i$ are **pairwise independent**, the covariance terms are 0: $\mathrm{Var}(\sum a_iX_i+b)=\sum a_i^2\mathrm{Var}(X_i)$.`,
          pitfalls: md`$\mathrm{Var}(X-Y)=\mathrm{Var}(X)+\mathrm{Var}(Y)$ for independent variables (plus, not minus!).`,
        },
      ],
      examples: [
        {
          title: '$X_1+X_1$ vs $X_1+X_2$',
          problem: md`$X_1,X_2$ are i.i.d. Compare $\mathrm{Var}(X_1+X_1)$ with $\mathrm{Var}(X_1+X_2)$.`,
          solution: md`$\mathrm{Var}(2X_1)=4\mathrm{Var}(X_1)$, but $\mathrm{Var}(X_1+X_2)=2\mathrm{Var}(X_1)$.
Doubling one round's gain is riskier than playing two independent rounds, because independent deviations partly cancel. (Alternatively: $\mathrm{Var}(X_1)+\mathrm{Var}(X_1)+2\mathrm{Cov}(X_1,X_1)=4\mathrm{Var}(X_1)$.)`,
        },
      ],
    },
    {
      id: 'cond-moments',
      title: 'Conditional moments & random sums',
      kind: 'theorem',
      body: md`The $k$-th **conditional moment** is $E(Y^k\mid X=x)$, and the **conditional variance** is
$$\mathrm{Var}(Y\mid X=x)=E(Y^2\mid X=x)-E(Y\mid X=x)^2.$$
The theorem of total expectation extends to all **raw** moments, but **not** to central moments like the variance.`,
      formulas: [
        {
          id: 'total-moments',
          name: 'Theorem of total moments',
          tex: md`E(Y^k)=\sum_x E(Y^k\mid X=x)\,p_X(x)`,
          pitfalls: md`$\mathrm{Var}(Y)\ne\sum_x\mathrm{Var}(Y\mid X=x)p_X(x)$ in general. Go through $E(Y^2)$ instead.`,
        },
        {
          id: 'random-sum-var',
          name: 'Variance of a random sum',
          tex: md`T=\sum_{i=1}^N X_i:\qquad E(T)=E(N)E(X),\qquad \mathrm{Var}(T)=E(N)\,\mathrm{Var}(X)+E(X)^2\,\mathrm{Var}(N)`,
          intuition: md`The first term is the variance caused by the summands $X$ (as if $N$ were constant); the second is the variance caused by the random count $N$ (as if $X$ were constant).`,
          conditions: md`$N,X_1,X_2,\dots$ mutually independent, $X_i$ identically distributed.`,
        },
      ],
      proof: md`Condition on $N=n$: $E(T\mid N=n)=nE(X)$ and $\mathrm{Var}(T\mid N=n)=n\mathrm{Var}(X)$, so $E(T^2\mid N=n)=n\mathrm{Var}(X)+n^2E(X)^2$. Total moments give $E(T^2)=\mathrm{Var}(X)E(N)+E(X)^2E(N^2)$. Subtracting $E(T)^2=E(X)^2E(N)^2$ yields the formula.`,
    },
    {
      id: 'chebyshev',
      title: 'Chebyshev inequality',
      kind: 'theorem',
      body: md`Knowing the mean **and** the variance gives a much stronger, **two-sided** bound that needs no sign assumption on $X$.`,
      formulas: [
        {
          id: 'cheb',
          name: 'Chebyshev inequality',
          tex: md`P\big(|X-E X|\ge t\big)\le\frac{\mathrm{Var}(X)}{t^2},\qquad P\big(|X-EX|\ge k\sigma_X\big)\le\frac1{k^2}`,
          symbols: [
            { sym: 't', meaning: 'distance from the mean (t > 0)' },
            { sym: md`\sigma_X`, meaning: 'standard deviation' },
          ],
          intuition: 'At most 1/k² of the mass can lie k or more standard deviations away from the mean. For example, at least 75% is within 2σ for any distribution with finite variance.',
          conditions: 'Any X with finite variance. It bounds the two-sided event, so it also bounds each one-sided tail.',
          pitfalls: 'It decays only polynomially (1/t²). For sums of independent indicators, Chernoff bounds are exponentially better.',
        },
      ],
      proof: md`Apply Markov to the non-negative variable $(X-EX)^2$ with threshold $t^2$: $P((X-EX)^2\ge t^2)\le\frac{E[(X-EX)^2]}{t^2}=\frac{\mathrm{Var}(X)}{t^2}$. The events $[(X-EX)^2\ge t^2]$ and $[|X-EX|\ge t]$ coincide.`,
      examples: [
        {
          title: 'Coin flips revisited',
          problem: md`Bound $P(Y_n\ge\frac34n)$ for $Y_n$ the number of heads in $n$ fair flips.`,
          solution: md`$\mathrm{Var}(X_i)=\frac12-\frac14=\frac14$, so $\mathrm{Var}(Y_n)=\frac n4$ by independence. Then
$$P(Y_n\ge\tfrac34n)\le P(|Y_n-\tfrac n2|\ge\tfrac n4)\le\frac{n/4}{(n/4)^2}=\frac4n.$$
Unlike Markov's constant $\frac23$, this goes to $0$ as $n\to\infty$. For $n=100$ it gives $0.04$.`,
        },
      ],
      viz: [{ id: 'tailBounds', caption: 'Compare the green Chebyshev curve with Markov: it decays like 1/a² instead of 1/a.' }],
    },
  ],
  flashcards: [
    { id: 'l04-c1', front: 'Two formulas for the variance', back: md`$\mathrm{Var}(X)=E[(X-EX)^2]=E(X^2)-(EX)^2$.` },
    { id: 'l04-c2', front: '$\\mathrm{Var}(aX+b)$ = ?', back: md`$a^2\,\mathrm{Var}(X)$.` },
    { id: 'l04-c3', front: 'Variance of the binomial and geometric distributions', back: md`$B(n,p)$: $np(1-p)$. $\mathrm{Geom}(p)$: $(1-p)/p^2$.` },
    { id: 'l04-c4', front: 'Covariance: definition and computational formula', back: md`$\mathrm{Cov}(X,Y)=E[(X-EX)(Y-EY)]=E(XY)-EX\,EY$.` },
    { id: 'l04-c5', front: 'Correlation coefficient and its range', back: md`$\rho=\mathrm{Cov}(X,Y)/\sqrt{\mathrm{Var}X\,\mathrm{Var}Y}\in[-1,1]$.` },
    { id: 'l04-c6', front: 'Does Cov(X,Y) = 0 imply independence?', back: md`No. E.g. $X$ uniform on $\{-1,0,1\}$, $Y=X^2$: covariance 0 but fully dependent. (Independence ⇒ Cov = 0.)` },
    { id: 'l04-c7', front: '$\\mathrm{Var}(X+Y)$ in general', back: md`$\mathrm{Var}X+\mathrm{Var}Y+2\mathrm{Cov}(X,Y)$.` },
    { id: 'l04-c8', front: 'When do variances add?', back: md`For **pairwise** independent (more generally pairwise uncorrelated) variables: $\mathrm{Var}(\sum X_i)=\sum\mathrm{Var}(X_i)$.` },
    { id: 'l04-c9', front: 'Chebyshev inequality', back: md`$P(|X-EX|\ge t)\le\mathrm{Var}(X)/t^2$, equivalently $P(|X-EX|\ge k\sigma)\le 1/k^2$.` },
    { id: 'l04-c10', front: 'Proof idea of Chebyshev', back: md`Markov applied to $(X-EX)^2\ge0$ with threshold $t^2$.` },
    { id: 'l04-c11', front: 'Theorem of total moments', back: md`$E(Y^k)=\sum_x E(Y^k\mid X=x)p_X(x)$. It does not hold for central moments such as the variance.` },
    { id: 'l04-c12', front: 'Variance of a random sum $T=X_1+\\dots+X_N$', back: md`$\mathrm{Var}(T)=E(N)\mathrm{Var}(X)+E(X)^2\mathrm{Var}(N)$.` },
    { id: 'l04-c13', front: 'Conditional variance', back: md`$\mathrm{Var}(Y\mid X=x)=E(Y^2\mid X=x)-E(Y\mid X=x)^2$.` },
    { id: 'l04-c14', front: 'Var(X₁+X₁) vs Var(X₁+X₂) for i.i.d. $X_i$', back: md`$4\mathrm{Var}(X_1)$ vs $2\mathrm{Var}(X_1)$.` },
  ],
  quiz: [
    {
      id: 'l04-q1',
      type: 'numeric',
      prompt: md`A fair six-sided die: compute $\mathrm{Var}(X)$.`,
      answer: 35 / 12,
      explanation: md`$E(X)=3.5$, $E(X^2)=\frac{91}{6}$, so $\mathrm{Var}=\frac{91}6-\frac{49}4=\frac{35}{12}\approx2.917$. This matches $(n^2-1)/12$ with $n=6$.`,
    },
    {
      id: 'l04-q2',
      type: 'numeric',
      prompt: md`$\mathrm{Var}(X)=4$. Compute $\mathrm{Var}(3-2X)$.`,
      answer: 16,
      explanation: md`$\mathrm{Var}(aX+b)=a^2\mathrm{Var}(X)=4\cdot4=16$.`,
    },
    {
      id: 'l04-q3',
      type: 'numeric',
      prompt: md`$X,Y$ are independent with $\mathrm{Var}(X)=2$, $\mathrm{Var}(Y)=3$. Compute $\mathrm{Var}(X-2Y)$.`,
      answer: 14,
      explanation: md`$1^2\cdot2+(-2)^2\cdot3=2+12=14$.`,
    },
    {
      id: 'l04-q4',
      type: 'numeric',
      prompt: md`$X$ has mean 50 and standard deviation 5. What upper bound does Chebyshev give for $P(|X-50|\ge 15)$?`,
      answer: 1 / 9,
      explanation: md`$15=3\sigma$, so the bound is $1/3^2=1/9\approx0.111$.`,
    },
    {
      id: 'l04-q5',
      type: 'numeric',
      prompt: md`Using Chebyshev, bound $P(Y\ge 60)$ for $Y$ the number of heads in $100$ fair coin flips.`,
      answer: 0.25,
      explanation: md`$E=50$, $\mathrm{Var}=25$. $P(Y\ge60)\le P(|Y-50|\ge10)\le\frac{25}{100}=0.25$.`,
    },
    {
      id: 'l04-q6',
      type: 'mcq',
      prompt: md`Which statement about covariance is **false**?`,
      options: [md`$\mathrm{Cov}(X,X)=\mathrm{Var}(X)$`, md`independent $\Rightarrow\mathrm{Cov}(X,Y)=0$`, md`$\mathrm{Cov}(X,Y)=0\Rightarrow$ independent`, md`$\mathrm{Cov}(aX,Y)=a\,\mathrm{Cov}(X,Y)$`],
      answer: 2,
      explanation: md`Zero covariance means only *uncorrelated*. Example: $X\in\{-1,0,1\}$ uniform, $Y=X^2$.`,
    },
    {
      id: 'l04-q7',
      type: 'numeric',
      prompt: md`The number of claims $N$ has $E(N)=10$, $\mathrm{Var}(N)=10$. Each claim size $X$ has $E(X)=2$, $\mathrm{Var}(X)=1$, and everything is independent. Compute $\mathrm{Var}$ of the total $T=\sum_{i=1}^N X_i$.`,
      answer: 50,
      explanation: md`$\mathrm{Var}(T)=E(N)\mathrm{Var}(X)+E(X)^2\mathrm{Var}(N)=10\cdot1+4\cdot10=50$.`,
    },
    {
      id: 'l04-q8',
      type: 'truefalse',
      prompt: md`For Chebyshev's inequality to hold, $X$ must be non-negative.`,
      answer: false,
      explanation: md`Chebyshev applies Markov to $(X-EX)^2$, which is always non-negative. Any $X$ with finite variance works.`,
    },
    {
      id: 'l04-q9',
      type: 'numeric',
      prompt: md`$X\sim\mathrm{Geom}(0.25)$. Compute $\mathrm{Var}(X)$.`,
      answer: 12,
      explanation: md`$(1-p)/p^2=0.75/0.0625=12$.`,
    },
    {
      id: 'l04-q10',
      type: 'multi',
      prompt: md`Which conditions guarantee $\mathrm{Var}(X_1+X_2+X_3)=\mathrm{Var}(X_1)+\mathrm{Var}(X_2)+\mathrm{Var}(X_3)$?`,
      options: ['mutual independence', 'pairwise independence', 'pairwise uncorrelated (all covariances 0)', 'identically distributed'],
      answer: [0, 1, 2],
      explanation: 'Only the covariance terms must vanish. Identical distribution is irrelevant.',
    },
  ],
};
