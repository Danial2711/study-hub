import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l09: Topic = {
  id: 'l09',
  lecture: 9,
  examGroup: 'Q6',
  title: 'Entropy & mutual information',
  summary: md`Axioms of uncertainty and Shannon entropy, joint and conditional entropy with the chain rule, cross-entropy, relative entropy (KL divergence), mutual information, and the information inequality with its consequences.`,
  sections: [
    {
      id: 'uncertainty',
      title: 'Measuring uncertainty',
      kind: 'concept',
      body: md`How uncertain are we about the outcome of an experiment? A die is more uncertain than a coin; a fair coin and a random bit are equally uncertain. Uncertainty should therefore depend **only on the distribution** $(p_1,\dots,p_n)$, not on what the outcomes are. We write it as $H(p_1,\dots,p_n)$.

Natural requirements:

1. maximal for the uniform distribution;
2. invariant under permutations;
3. $\ge0$, and $=0$ iff the outcome is certain;
4. adding a zero-probability outcome changes nothing;
5. $H(\text{uniform}_n)\le H(\text{uniform}_{n+1})$;
6. continuous;
7. additive for independent experiments: $H(U_{mn})=H(U_m)+H(U_n)$;
8. **grouping**: choosing a ball = choosing its colour, then a ball within that colour:
$$H(p_1..p_{m+n})=H(p,q)+pH\big(\tfrac{p_1}p..\tfrac{p_m}p\big)+qH\big(\tfrac{p_{m+1}}q..\tfrac{p_{m+n}}q\big).$$

**Theorem.** Up to a constant factor (the base of the logarithm), the only such function is Shannon entropy. With $\log_2$ the unit is the **bit**.`,
    },
    {
      id: 'entropy',
      title: 'Shannon entropy',
      kind: 'definition',
      body: md`Logarithms are base 2 unless stated otherwise, and $0\log0=0$.`,
      formulas: [
        {
          id: 'entropy-f',
          name: 'Entropy',
          tex: md`H(X)=-\sum_{x}p(x)\log p(x)=E_p\Big[\log\frac1{p(X)}\Big]`,
          symbols: [
            { sym: md`p(x)`, meaning: md`$P(X=x)$` },
            { sym: md`\log\frac1{p(x)}`, meaning: md`**surprisal** of seeing $x$ (rare outcomes are more surprising)` },
          ],
          intuition: 'The expected surprise, or the average number of yes/no questions (bits) needed to learn the outcome with an optimal strategy.',
          conditions: md`$0\le H(X)\le\log|\mathrm{Im}(X)|$, with equality on the left iff $X$ is constant and on the right iff $X$ is uniform.`,
        },
      ],
      viz: [{ id: 'entropy' }],
      examples: [
        {
          title: 'Coins, dice and horses',
          problem: md`Find the entropy of (1) a fair coin, (2) a fair 8-sided die, (3) a horse race with winning probabilities $(\frac12,\frac18,\frac18,\frac18,\frac18)$. How would you encode the winner of (3)?`,
          solution: md`(1) $1$ bit. (2) $8\cdot\frac18\log8=3$ bits. (3) $\frac12\cdot1+4\cdot\frac18\cdot3=2$ bits.
Encoding: give the favourite a short codeword, e.g. $1,000,001,010,011$. Expected length $\frac12\cdot1+\frac12\cdot3=2$ bits, exactly the entropy. Lectures 10–11 make this precise.`,
        },
      ],
    },
    {
      id: 'joint-cond',
      title: 'Joint and conditional entropy',
      kind: 'definition',
      body: md`For a pair of (possibly correlated) variables with joint distribution $p(x,y)$:

**Conditional entropy given a value.** $H(X\mid Y=y)=-\sum_x p(x\mid y)\log p(x\mid y)$ is the entropy of the distribution of $X$ in the world where $Y=y$.

**Conditional entropy.** $H(X\mid Y)$ averages these over $y$:
$$H(X\mid Y)=\sum_yp(y)H(X\mid Y=y)=-\sum_{x,y}p(x,y)\log p(x\mid y)=-E_p[\log p(X\mid Y)].$$
The expectation is over the **joint** distribution.

Note $H(X\mid Y)\ne H(Y\mid X)$ in general.`,
      formulas: [
        {
          id: 'joint-H',
          name: 'Joint entropy',
          tex: md`H(X,Y)=-\sum_{x,y}p(x,y)\log p(x,y)=E\Big[\log\frac{1}{p(X,Y)}\Big]`,
        },
        {
          id: 'chain-H',
          name: 'Chain rule',
          tex: md`H(X,Y)=H(Y)+H(X\mid Y)=H(X)+H(Y\mid X),\qquad H(X_1,\dots,X_n)=\sum_{i=1}^nH(X_i\mid X_{i-1},\dots,X_1)`,
          intuition: 'Learn Y first, then whatever is still unknown about X.',
          conditions: md`Proof: take the expectation of $\log p(X,Y)=\log p(Y)+\log p(X\mid Y)$. Conditioned version: $H(X,Y\mid Z)=H(Y\mid Z)+H(X\mid Y,Z)$.`,
        },
      ],
    },
    {
      id: 'kl',
      title: 'Cross-entropy & relative entropy',
      kind: 'definition',
      body: md`How much do we lose by assuming a distribution $q$ when the truth is $p$? Careful: the expectation must be taken with respect to the **true** distribution $p$.`,
      formulas: [
        {
          id: 'cross-entropy',
          name: 'Cross-entropy',
          tex: md`H(p\|q)=-\sum_xp(x)\log q(x)=-E_p[\log q(X)]`,
          intuition: 'Average code length when you design an optimal code for q but the data come from p (made precise in Lecture 10).',
        },
        {
          id: 'kl-f',
          name: 'Relative entropy (Kullback–Leibler divergence)',
          tex: md`D(p\|q)=\sum_xp(x)\log\frac{p(x)}{q(x)}=E_p\Big[\log\frac{p(X)}{q(X)}\Big]=H(p\|q)-H(p)`,
          intuition: 'Extra bits wasted by assuming q instead of p.',
          conditions: md`Conventions: $0\log\frac0q=0$ and $p\log\frac p0=\infty$.`,
          pitfalls: md`Not a metric: $D(p\|q)\ne D(q\|p)$ in general, and the triangle inequality fails.`,
        },
      ],
    },
    {
      id: 'mi',
      title: 'Mutual information',
      kind: 'definition',
      body: md`Mutual information is the information shared by $X$ and $Y$: how much knowing one reduces the uncertainty about the other.`,
      formulas: [
        {
          id: 'mi-f',
          name: 'Mutual information',
          tex: md`I(X;Y)=D\big(p(x,y)\,\|\,p(x)p(y)\big)=E\Big[\log\frac{p(X,Y)}{p(X)p(Y)}\Big]`,
          intuition: 'How far the joint distribution is from the independent one. It is 0 for independent variables.',
        },
        {
          id: 'mi-H',
          name: 'Mutual information via entropies',
          tex: md`I(X;Y)=H(X)-H(X\mid Y)=H(Y)-H(Y\mid X)=H(X)+H(Y)-H(X,Y),\qquad I(X;X)=H(X)`,
          intuition: 'Symmetric: X tells you as much about Y as Y tells you about X. The third form is an inclusion–exclusion, as in a Venn diagram of entropies.',
        },
        {
          id: 'cond-mi',
          name: 'Conditional mutual information & chain rules',
          tex: md`I(X;Y\mid Z)=H(X\mid Z)-H(X\mid Y,Z),\quad I(X_1..X_n;Y)=\sum_iI(X_i;Y\mid X_{i-1}..X_1),\quad D(p_{XY}\|q_{XY})=D(p_X\|q_X)+D(p_{Y|X}\|q_{Y|X})`,
        },
      ],
      viz: [{ id: 'mutualInfo' }],
    },
    {
      id: 'inequalities',
      title: 'Information inequality and consequences',
      kind: 'theorem',
      body: md`Everything below follows from a single inequality, proved using Jensen's inequality for the concave $\log$.`,
      formulas: [
        {
          id: 'info-ineq',
          name: 'Information inequality (Gibbs)',
          tex: md`D(p\|q)\ge0,\quad\text{with equality iff } p=q`,
          intuition: 'No code can beat the one designed for the true distribution.',
        },
        {
          id: 'consequences',
          name: 'Consequences',
          tex: md`I(X;Y)\ge0,\qquad H(X)\le\log|\mathrm{Im}X|,\qquad H(X\mid Y)\le H(X),\qquad H(X_1,\dots,X_n)\le\sum_iH(X_i)`,
          intuition: md`Mutual information is non-negative (0 iff independent); the uniform distribution maximises entropy; **conditioning reduces entropy on average**; joint entropy is at most the sum of the individual entropies (equality iff independent).`,
          pitfalls: md`"Conditioning reduces entropy" holds **on average**. A particular observation $Y=y$ can increase uncertainty: $H(X\mid Y=y)>H(X)$ is possible.`,
        },
      ],
      proof: md`$-D(p\|q)=E_p\log\frac{q(X)}{p(X)}\overset{\text{Jensen}}{\le}\log E_p\frac{q(X)}{p(X)}=\log\sum_{x:p(x)>0}q(x)\le\log1=0.$ Since $\log$ is strictly concave, equality holds iff $q/p$ is constant, i.e. $p=q$.

For $H(X)\le\log n$: with $u$ uniform, $0\le D(p\|u)=\log n-H(X)$. For conditioning: $0\le I(X;Y)=H(X)-H(X\mid Y)$.`,
      examples: [
        {
          title: 'Observation increasing uncertainty',
          problem: md`$Y\in\{0,1\}$ with $P(Y=0)=0.9$. If $Y=0$ then $X=0$; if $Y=1$ then $X$ is uniform on $\{0,1\}$. Compare $H(X)$, $H(X\mid Y=1)$ and $H(X\mid Y)$.`,
          solution: md`$P(X=1)=0.1\cdot0.5=0.05$, so $H(X)=H(0.05)\approx0.286$. But $H(X\mid Y=1)=1>H(X)$, while on average $H(X\mid Y)=0.9\cdot0+0.1\cdot1=0.1\le H(X)$ ✓.`,
        },
      ],
    },
  ],
  flashcards: [
    { id: 'l09-c1', front: 'Shannon entropy $H(X)$', back: md`$-\sum_xp(x)\log p(x)=E[\log\frac1{p(X)}]$.` },
    { id: 'l09-c2', front: 'Bounds on entropy', back: md`$0\le H(X)\le\log|\mathrm{Im}X|$: 0 iff deterministic, maximal iff uniform.` },
    { id: 'l09-c3', front: 'Grouping axiom', back: md`$H(p_1..p_{m+n})=H(p,q)+pH(\frac{p_i}{p})+qH(\frac{p_j}{q})$ with $p,q$ the masses of the two groups.` },
    { id: 'l09-c4', front: 'Conditional entropy $H(X\\mid Y)$', back: md`$\sum_yp(y)H(X\mid Y=y)=-\sum_{x,y}p(x,y)\log p(x\mid y)$.` },
    { id: 'l09-c5', front: 'Chain rule for entropy', back: md`$H(X,Y)=H(Y)+H(X\mid Y)$; in general $H(X_1..X_n)=\sum_iH(X_i\mid X_{<i})$.` },
    { id: 'l09-c6', front: 'Cross-entropy $H(p\\|q)$', back: md`$-\sum_xp(x)\log q(x)=H(p)+D(p\|q)$.` },
    { id: 'l09-c7', front: 'KL divergence $D(p\\|q)$', back: md`$\sum_xp(x)\log\frac{p(x)}{q(x)}$: non-negative, 0 iff $p=q$, not symmetric, not a metric.` },
    { id: 'l09-c8', front: 'Mutual information — three formulas', back: md`$D(p_{XY}\|p_Xp_Y)$; $H(X)-H(X\mid Y)$; $H(X)+H(Y)-H(X,Y)$.` },
    { id: 'l09-c9', front: 'When is $I(X;Y)=0$?', back: 'Exactly when X and Y are independent.' },
    { id: 'l09-c10', front: 'Information inequality and its proof idea', back: md`$D(p\|q)\ge0$. Jensen on the concave log: $-D=E\log\frac qp\le\log E\frac qp\le\log1=0$.` },
    { id: 'l09-c11', front: '"Conditioning reduces entropy"', back: md`$H(X\mid Y)\le H(X)$, with equality iff independent. It holds on average only: a specific $y$ can have $H(X\mid Y=y)>H(X)$.` },
    { id: 'l09-c12', front: 'Independence bound on entropy', back: md`$H(X_1,\dots,X_n)\le\sum H(X_i)$, with equality iff mutually independent.` },
    { id: 'l09-c13', front: '$I(X;X)$ = ?', back: md`$H(X)$ (self-information).` },
    { id: 'l09-c14', front: 'Entropy of the horse race $(\\frac12,\\frac18,\\frac18,\\frac18,\\frac18)$', back: '2 bits, achieved by the code 1, 000, 001, 010, 011.' },
  ],
  quiz: [
    {
      id: 'l09-q1',
      type: 'numeric',
      prompt: md`Compute $H(\frac12,\frac14,\frac18,\frac18)$ in bits.`,
      answer: 1.75,
      explanation: md`$\frac12\cdot1+\frac14\cdot2+2\cdot\frac18\cdot3=0.5+0.5+0.75=1.75$.`,
    },
    {
      id: 'l09-q2',
      type: 'numeric',
      prompt: md`$X$ is uniform on 10 values. What is $H(X)$ in bits?`,
      answer: Math.log2(10),
      explanation: md`$\log_2 10\approx3.3219$.`,
    },
    {
      id: 'l09-q3',
      type: 'numeric',
      prompt: md`$H(X)=2$, $H(Y)=1.5$, $H(X,Y)=3$. Compute $I(X;Y)$.`,
      answer: 0.5,
      explanation: md`$I=H(X)+H(Y)-H(X,Y)=0.5$.`,
    },
    {
      id: 'l09-q4',
      type: 'numeric',
      prompt: md`Using the numbers above ($H(X)=2$, $H(Y)=1.5$, $H(X,Y)=3$), compute $H(X\mid Y)$.`,
      answer: 1.5,
      explanation: md`Chain rule: $H(X\mid Y)=H(X,Y)-H(Y)=1.5$.`,
    },
    {
      id: 'l09-q5',
      type: 'numeric',
      prompt: md`Compute $D(p\|q)$ in bits for $p=(\frac12,\frac12)$ and $q=(\frac14,\frac34)$.`,
      answer: 0.5 * Math.log2(2) + 0.5 * Math.log2(0.5 / 0.75),
      explanation: md`$\frac12\log\frac{1/2}{1/4}+\frac12\log\frac{1/2}{3/4}=\frac12\cdot1+\frac12\log_2\frac23\approx0.5-0.2925=0.2075$.`,
    },
    {
      id: 'l09-q6',
      type: 'truefalse',
      prompt: md`For all random variables $X,Y$ and every value $y$, $H(X\mid Y=y)\le H(X)$.`,
      answer: false,
      explanation: md`Only the average $H(X\mid Y)$ is $\le H(X)$. A single observation may make $X$ more uncertain.`,
    },
    {
      id: 'l09-q7',
      type: 'multi',
      prompt: md`Which properties does the KL divergence $D(p\|q)$ have?`,
      options: ['D(p‖q) ≥ 0', 'D(p‖q) = 0 iff p = q', 'D(p‖q) = D(q‖p)', 'it satisfies the triangle inequality'],
      answer: [0, 1],
      explanation: 'KL is non-negative and zero exactly when p = q (information inequality), but it is neither symmetric nor a metric.',
    },
    {
      id: 'l09-q8',
      type: 'numeric',
      prompt: md`$X$ is a fair bit and $Y=X$ with probability $0.9$, otherwise $Y=1-X$ (independently). Compute $I(X;Y)$ in bits.`,
      answer: 1 - (-(0.9 * Math.log2(0.9)) - 0.1 * Math.log2(0.1)),
      explanation: md`$Y$ is also a fair bit and $H(Y\mid X)=H(0.1)\approx0.469$, so $I=1-0.469=0.531$.`,
    },
    {
      id: 'l09-q9',
      type: 'mcq',
      prompt: md`Which identity is the chain rule for entropy?`,
      options: [md`$H(X,Y)=H(X)+H(Y)$`, md`$H(X,Y)=H(X)+H(Y\mid X)$`, md`$H(X\mid Y)=H(Y\mid X)$`, md`$H(X,Y)=H(X)H(Y)$`],
      answer: 1,
      explanation: md`$H(X,Y)=H(X)+H(Y\mid X)$. The first option holds only for independent variables.`,
    },
  ],
};
