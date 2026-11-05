import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l07: Topic = {
  id: 'l07',
  lecture: 7,
  examGroup: 'Q4',
  title: 'Long-run analysis of Markov chains',
  summary: md`Transient vs recurrent states and BSCCs, irreducibility, stationary distributions and cut-set equations, expected long-run frequencies, mean inter-visit times, the ergodic theorem, periodicity and convergence to equilibrium, and pitfalls of infinite-state chains.`,
  sections: [
    {
      id: 'classification',
      title: 'Classification of states',
      kind: 'definition',
      body: md`Notation: $i\Rightarrow^*j$ means "starting from $i$ we eventually visit $j$" (in $\ge0$ steps), and $i\Rightarrow^+j$ the same in $\ge1$ steps.

- A state is **absorbing** iff $p_{i,i}=1$.
- A state is **recurrent** iff $P(i\Rightarrow^+i)=1$: we surely return.
- A state is **transient** iff $P(i\Rightarrow^+i)<1$: with positive probability we never come back.

**Theorem.** Every transient state is visited only **finitely often** almost surely. If $p>0$ is the probability of never returning, then $P(\text{finitely many visits})=p\sum_{k\ge0}(1-p)^k=1$. ("The pitcher goes to the well until it breaks.")

**Theorem.** In a finite chain, a recurrent state is almost surely either never visited or visited infinitely often.`,
      formulas: [
        {
          id: 'bscc',
          name: 'Recurrence via the graph (finite chains)',
          tex: md`i\ \text{recurrent}\iff i\ \text{lies in a bottom SCC (BSCC)}`,
          intuition: 'Decompose the graph into strongly connected components. They form a DAG; the leaves (components with no edge leaving them) are the BSCCs. Once you enter a BSCC you can never leave, and you keep revisiting all of its states.',
          conditions: 'Finite-state chains only. All states outside BSCCs are transient.',
        },
      ],
      viz: [{ id: 'markovChain', props: { preset: 'reducible', tab: 'structure' } }],
    },
    {
      id: 'irreducible',
      title: 'Irreducible chains',
      kind: 'definition',
      body: md`A chain is **irreducible** if every state can reach every other: $P(i\Rightarrow^+j)>0$ for all $i,j$. Equivalently, its graph is a **single SCC**.

**Corollary.** All states of a finite irreducible chain are recurrent.

For questions about infinite behaviour we can focus on the BSCCs, each of which is an irreducible chain on its own.`,
    },
    {
      id: 'stationary',
      title: 'Stationary (invariant) distributions',
      kind: 'definition',
      body: md`A distribution $\vec\pi$ is **stationary** (steady-state, invariant, equilibrium) if one step does not change it:
$$\vec\pi P=\vec\pi.$$

- **Existence:** every finite chain has at least one stationary distribution.
- **Uniqueness:** a finite **irreducible** chain has exactly one.
- There can be several: in the drunkard's walk, both $(1,0,0,0)$ and $(0,0,0,1)$ are stationary, and so is any mixture of them.

**How to compute it:** solve $\vec\pi P=\vec\pi$ together with $\sum_i\pi_i=1$ (one balance equation is redundant). Cut-sets are often easier.`,
      formulas: [
        {
          id: 'balance',
          name: 'Global balance at a state',
          tex: md`\sum_{j\ne i}\pi_j\,P_{j,i}=\sum_{j\ne i}\pi_i\,P_{i,j}`,
          intuition: 'In equilibrium the probability flow into state i equals the flow out of i.',
        },
        {
          id: 'cutset',
          name: 'Cut-set equations',
          tex: md`\vec\pi\ \text{stationary}\iff\forall A\subseteq S:\ \sum_{i\in A,\,j\notin A}\pi_iP_{i,j}=\sum_{i\in A,\,j\notin A}\pi_jP_{j,i}`,
          intuition: 'For any cut through the graph, the flow crossing left-to-right equals the flow crossing right-to-left.',
          conditions: md`Most useful for chains shaped like a line (birth–death chains): cutting between $k$ and $k+1$ gives $\pi_k\,p_{k,k+1}=\pi_{k+1}\,p_{k+1,k}$.`,
        },
        {
          id: 'two-state',
          name: 'Two-state chain',
          tex: md`P=\begin{pmatrix}1-p&p\\q&1-q\end{pmatrix}\ \Rightarrow\ \vec\pi=\Big(\frac q{p+q},\ \frac p{p+q}\Big)`,
          intuition: md`Cut between the two states: $\pi_1p=\pi_2q$.`,
        },
      ],
      viz: [{ id: 'markovChain', props: { preset: 'buffer2', tab: 'structure' } }],
      examples: [
        {
          title: 'Finite buffer',
          problem: md`States $s_0,s_1,s_2$ with $p_{0,1}=p_{1,2}=p$ (arrival) and $p_{1,0}=p_{2,1}=q$ (service), remaining mass on self-loops. Find $\vec\pi$.`,
          solution: md`Cuts: $\pi_0p=\pi_1q$ and $\pi_1p=\pi_2q$, so $\pi_1=\frac pq\pi_0$ and $\pi_2=\frac{p^2}{q^2}\pi_0$. Normalising:
$$\vec\pi=\frac{(q^2,\ pq,\ p^2)}{q^2+pq+p^2}.$$
For $p=\frac13$, $q=\frac12$ this is $(\frac9{19},\frac6{19},\frac4{19})$. When $p<q$, the probability decreases geometrically with the queue length.`,
        },
      ],
    },
    {
      id: 'frequencies',
      title: 'Long-run frequencies & mean inter-visit times',
      kind: 'theorem',
      body: md`For a finite **irreducible** chain with stationary distribution $\vec\pi$:`,
      formulas: [
        {
          id: 'exp-freq',
          name: 'Expected long-run frequency',
          tex: md`\pi_i=\lim_{n\to\infty}\frac{E(\text{number of visits of } i \text{ in the first } n \text{ steps})}{n}`,
          intuition: 'π_i is the long-run fraction of time the chain spends in state i, from any start.',
        },
        {
          id: 'intervisit',
          name: 'Mean inter-visit (return) time',
          tex: md`\pi_i=\frac1{m_i},\qquad m_i=E(\text{number of steps of } i\Rightarrow^+ i)`,
          intuition: 'If you return to i every m_i steps on average, you spend a fraction 1/m_i of the time there.',
          pitfalls: md`$m_i\ne k_i^{\{i\}}$: the hitting time of $\{i\}$ from $i$ is $0$. Instead, $m_i=1+\sum_j p_{i,j}k_j^{\{i\}}$.`,
        },
        {
          id: 'ergodic',
          name: 'Ergodic theorem',
          tex: md`P\left(\pi_i=\lim_{n\to\infty}\frac{\text{visits of } i \text{ in the first } n \text{ steps}}{n}\right)=1`,
          intuition: 'Not just on average: almost every single run spends exactly a π_i fraction of its time in i, and the average distance between visits of i equals m_i. Pathological runs (staying forever in a transient part, etc.) have probability 0.',
          conditions: 'Finite irreducible chain. It holds even for periodic chains. The proof uses the strong law of large numbers.',
        },
      ],
      examples: [
        {
          title: 'Return times',
          problem: md`$1\to2$ (prob. 1), $2\to3$ (prob. 1), $3\to1$ and $3\to2$ (prob. $\frac12$ each). Find $\vec\pi$ and $m_1$.`,
          solution: md`Check that $(0.2,0.4,0.4)P=(0.2,0.4,0.4)$: $\pi_1=\frac12\pi_3=0.2$ ✓, $\pi_2=\pi_1+\frac12\pi_3=0.4$ ✓, $\pi_3=\pi_2=0.4$ ✓.
Directly: with $A=\{1\}$, $k_2=1+k_3$ and $k_3=1+\frac12\cdot0+\frac12k_2$, so $k_2=4$, $k_3=3$, and $m_1=1+k_2=5=1/\pi_1$ ✓.`,
        },
      ],
      viz: [{ id: 'markovChain', props: { preset: 'cycle3', tab: 'simulate' } }],
    },
    {
      id: 'periodicity',
      title: 'Periodicity and convergence to equilibrium',
      kind: 'theorem',
      body: md`A state $j$ is **periodic** if there is $\Delta>1$ such that $P(X_{t+s}=j\mid X_t=j)=0$ unless $\Delta\mid s$. The **period** is the gcd of the lengths of all cycles through $j$. A chain is periodic if any state is periodic; otherwise it is **aperiodic**. A self-loop makes a state aperiodic.

In a periodic chain $\vec\lambda P^n$ oscillates. For example, the 3-cycle just rotates the mass forever, yet $(\frac13,\frac13,\frac13)$ is stationary and the long-run frequencies still converge.`,
      formulas: [
        {
          id: 'convergence',
          name: 'Limit of transient distributions',
          tex: md`\text{finite, irreducible, aperiodic}\ \Rightarrow\ \lim_{n\to\infty}\vec\lambda P^n=\vec\pi\quad\text{for every initial }\vec\lambda`,
          intuition: md`$P^n$ converges to a matrix whose rows all equal $\vec\pi$: the chain forgets where it started.`,
          pitfalls: 'Aperiodicity is needed for the limit of the distribution; it is NOT needed for frequencies (ergodic theorem) or for the existence or uniqueness of π.',
        },
      ],
      viz: [{ id: 'markovChain', props: { preset: 'periodic' } }],
    },
    {
      id: 'summary',
      title: 'Overview for finite chains',
      kind: 'summary',
      body: md`- The vector of expected long-run frequencies is a stationary distribution.
- **If irreducible:**
  - all states are recurrent;
  - the stationary distribution $\vec\pi$ is unique;
  - $\pi_i=1/m_i$ (inverse mean inter-visit time);
  - $\vec\pi$ equals the visit frequencies on a run almost surely (ergodic theorem).
- **If also aperiodic:** $\vec\pi=\lim_n\vec\lambda P^n$ for every initial $\vec\lambda$.
- **Methods:** solving equations, cut-sets, matrix powers, simulation.`,
    },
    {
      id: 'infinite',
      title: 'Infinite-state chains: what breaks',
      kind: 'concept',
      body: md`For infinite chains the finite theory can fail:

1. **No stationary distribution.** In $0\to1\to2\to\cdots$ (each with probability 1) the mass drifts to infinity.
2. **Irreducible but transient.** A walk on $\mathbb N$ moving right with probability $\frac23$ and left with $\frac13$ drifts away; every state is visited only finitely often.
3. **Recurrent with infinite mean return time (null recurrence).** The symmetric walk on $\mathbb Z$ returns to 0 with probability 1, but $E(\text{return time})=\infty$, so there is no stationary distribution.

For a walk on $\mathbb N$ with "right" probability $p$: $p<\frac12$ is positive recurrent (with a geometric stationary distribution), $p=\frac12$ is null recurrent, and $p>\frac12$ is transient.`,
    },
  ],
  flashcards: [
    { id: 'l07-c1', front: 'Recurrent vs transient state', back: md`Recurrent: $P(i\Rightarrow^+i)=1$. Transient: $P(i\Rightarrow^+i)<1$.` },
    { id: 'l07-c2', front: 'How often is a transient state visited?', back: 'Finitely many times, almost surely (the number of visits is geometric).' },
    { id: 'l07-c3', front: 'Graph criterion for recurrence (finite chain)', back: 'A state is recurrent iff it lies in a bottom strongly connected component (BSCC).' },
    { id: 'l07-c4', front: 'Irreducible Markov chain', back: md`Every state reaches every other ($P(i\Rightarrow^+j)>0$), i.e. the graph is one SCC.` },
    { id: 'l07-c5', front: 'Stationary distribution — definition', back: md`A distribution $\vec\pi$ with $\vec\pi P=\vec\pi$.` },
    { id: 'l07-c6', front: 'Existence and uniqueness of a stationary distribution (finite chains)', back: 'Every finite chain has at least one. A finite irreducible chain has exactly one.' },
    { id: 'l07-c7', front: 'Cut-set theorem', back: md`$\vec\pi$ is stationary iff for every set $A$: flow out of $A$ = flow into $A$, i.e. $\sum_{i\in A,j\notin A}\pi_iP_{ij}=\sum_{i\in A,j\notin A}\pi_jP_{ji}$.` },
    { id: 'l07-c8', front: 'Stationary distribution of the 2-state chain $\\begin{pmatrix}1-p&p\\\\q&1-q\\end{pmatrix}$', back: md`$(\frac q{p+q},\frac p{p+q})$.` },
    { id: 'l07-c9', front: 'Mean inter-visit time and π', back: md`$\pi_i=1/m_i$ where $m_i=E(\text{steps of }i\Rightarrow^+i)$ (finite irreducible chain).` },
    { id: 'l07-c10', front: 'Ergodic theorem', back: md`Finite irreducible: with probability 1 the fraction of time spent in $i$ converges to $\pi_i$ (and the mean gap between visits to $m_i$).` },
    { id: 'l07-c11', front: 'Periodic state', back: md`There is $\Delta>1$ with $P(X_{t+s}=j\mid X_t=j)=0$ unless $\Delta\mid s$; the period is the gcd of the return times.` },
    { id: 'l07-c12', front: 'When does $\\vec\\lambda P^n\\to\\vec\\pi$ for every start?', back: 'Finite, irreducible and aperiodic chain.' },
    { id: 'l07-c13', front: 'Difference between $m_i$ and $k_i^{\\{i\\}}$', back: md`$k_i^{\{i\}}=0$ (already there). $m_i$ counts $\ge1$ steps until the return: $m_i=1+\sum_jp_{ij}k_j^{\{i\}}$.` },
    { id: 'l07-c14', front: 'Three things that break for infinite chains', back: '(1) a stationary distribution may not exist; (2) irreducible chains may be transient; (3) recurrent states may have infinite mean return time (null recurrence, e.g. the symmetric walk on ℤ).' },
    { id: 'l07-c15', front: 'Google PageRank as a Markov chain', back: 'A random surfer follows a random link, or with some small probability restarts at a uniformly random page (this makes the chain irreducible and aperiodic). PageRank = the stationary distribution.' },
  ],
  quiz: [
    {
      id: 'l07-q1',
      type: 'numeric',
      prompt: md`Two-state chain with $p_{1,2}=0.2$ and $p_{2,1}=0.6$. What is $\pi_1$?`,
      answer: 0.75,
      explanation: md`$\pi_1=\frac q{p+q}=\frac{0.6}{0.8}=0.75$.`,
    },
    {
      id: 'l07-q2',
      type: 'numeric',
      prompt: md`In the chain from the previous question, what is the mean return time $m_2$ to state 2?`,
      answer: 4,
      explanation: md`$m_2=1/\pi_2=1/0.25=4$.`,
    },
    {
      id: 'l07-q3',
      type: 'mcq',
      prompt: md`A finite chain has the transition graph $a\to b$, $b\to c$, $c\to b$ (all with probability 1). Which states are recurrent?`,
      options: ['only a', 'b and c', 'a, b and c', 'none'],
      answer: 1,
      explanation: md`$\{b,c\}$ is the only BSCC; $a$ is left forever after one step, so it is transient.`,
    },
    {
      id: 'l07-q4',
      type: 'truefalse',
      prompt: md`For every finite irreducible chain, $\lim_{n\to\infty}\vec\lambda P^n$ exists for every initial $\vec\lambda$.`,
      answer: false,
      explanation: md`Aperiodicity is also needed. For the 2-cycle $a\leftrightarrow b$ started in $a$, the distribution alternates $(1,0),(0,1),\dots$.`,
    },
    {
      id: 'l07-q5',
      type: 'numeric',
      prompt: md`Birth–death chain on $\{0,1,2,3\}$: from $k$ go up with probability $0.2$ (if $k<3$), down with $0.4$ (if $k>0$), else stay. Compute $\pi_0$.`,
      answer: 8 / 15,
      explanation: md`Cuts: $\pi_{k+1}=\frac{0.2}{0.4}\pi_k=\frac12\pi_k$. So $\vec\pi\propto(1,\frac12,\frac14,\frac18)$ with sum $\frac{15}8$, and $\pi_0=\frac8{15}\approx0.533$.`,
    },
    {
      id: 'l07-q6',
      type: 'multi',
      prompt: md`Which statements hold for **every finite irreducible** Markov chain?`,
      options: ['all states are recurrent', 'the stationary distribution is unique', 'π_i = 1/m_i for every state', 'the chain is aperiodic'],
      answer: [0, 1, 2],
      explanation: 'Irreducible finite chains can still be periodic (e.g. a cycle).',
    },
    {
      id: 'l07-q7',
      type: 'truefalse',
      prompt: md`The symmetric random walk on $\mathbb Z$ is recurrent and has a finite mean return time to 0.`,
      answer: false,
      explanation: 'It is recurrent, but null recurrent: the mean return time is infinite and there is no stationary distribution.',
    },
    {
      id: 'l07-q8',
      type: 'numeric',
      prompt: md`$P=\begin{pmatrix}0&1&0\\0&0&1\\\frac12&\frac12&0\end{pmatrix}$. Compute $\pi_3$.`,
      answer: 0.4,
      explanation: md`$\pi_1=\frac12\pi_3$, $\pi_3=\pi_2$, $\pi_2=\pi_1+\frac12\pi_3=\pi_3$. Then $\frac12\pi_3+\pi_3+\pi_3=1$ gives $\pi_3=0.4$.`,
    },
    {
      id: 'l07-q9',
      type: 'mcq',
      prompt: md`What is the period of state $a$ in the chain $a\to b$, $b\to a$, $b\to c$, $c\to a$ (with positive probabilities)?`,
      options: ['1', '2', '3', '6'],
      answer: 0,
      explanation: md`There are cycles of length 2 ($a\,b\,a$) and 3 ($a\,b\,c\,a$); $\gcd(2,3)=1$, so the state is aperiodic.`,
    },
  ],
};
