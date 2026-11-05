import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l06: Topic = {
  id: 'l06',
  lecture: 6,
  examGroup: 'Q4',
  title: 'Stochastic processes & Markov chains',
  summary: md`Stochastic processes, the Markov property, transition matrices, probabilities of runs, transient distributions $\vec\lambda(t)=\vec\lambda(0)P^t$, hitting probabilities and mean hitting times, and the gambler's ruin.`,
  sections: [
    {
      id: 'stoch-proc',
      title: 'Stochastic processes',
      kind: 'definition',
      body: md`A **stochastic process** is a collection of random variables $\mathcal X=\{X_t\mid t\in T\}$ on one probability space. The index $t$ usually represents time, and $X_t$ is the **state** at time $t$.

- **Time domain $T$:** countable means *discrete-time*; uncountable means *continuous-time*.
- **State space:** finite, countable (*discrete-state*) or uncountable (*continuous-state*).

Examples: queue length, memory consumption, a program counter, printer status, a gambler's money.

The sample space consists of whole **runs** (infinite sequences of states), and the $X_t$ are in general **not independent**. Typical questions: what is the probability of reaching a value, the expected time to reach it, the fraction of time spent in a set of values?`,
    },
    {
      id: 'markov-property',
      title: 'Markov chains and the transition matrix',
      kind: 'definition',
      body: md`A discrete-time process $X_0,X_1,\dots$ is a **(time-homogeneous) Markov chain** if the next state depends only on the current one, not on the history and not on the time:
$$P(X_t=a\mid X_{t-1}=b,X_{t-2}=a_{t-2},\dots,X_0=a_0)=P(X_t=a\mid X_{t-1}=b)=p_{b,a}.$$
This is the **Markov (memoryless) property**. Such a chain can be drawn as an automaton: an edge $b\to a$ labelled $p_{b,a}$ for every non-zero probability.

For finitely many states $1..n$, the **transition matrix** $P=[p_{i,j}]$ is **stochastic**: entries are non-negative and every row sums to 1. Row $i$ is the distribution of the next state from $i$.

**Theorem.** Every discrete-time finite-state Markov chain is uniquely given by an initial distribution $\vec\lambda(0)$ and a transition matrix $P$.`,
      formulas: [
        {
          id: 'run-prob',
          name: 'Probability of a run (prefix)',
          tex: md`P(X_0=a_0,X_1=a_1,\dots,X_t=a_t)=\lambda_{a_0}(0)\,p_{a_0,a_1}\,p_{a_1,a_2}\cdots p_{a_{t-1},a_t}`,
          intuition: 'Chain rule plus the Markov property: multiply the probabilities along the path.',
        },
        {
          id: 'transient',
          name: 'Transient distribution',
          tex: md`\vec\lambda(t+m)=\vec\lambda(t)\,P^m,\qquad p^{(m)}_{i,j}=P(X_{t+m}=j\mid X_t=i)=(P^m)_{i,j}`,
          symbols: [
            { sym: md`\lambda_i(t)`, meaning: md`$P(X_t=i)$, the probability of being in state $i$ at time $t$` },
            { sym: md`P^m`, meaning: md`$m$-step transition matrix` },
          ],
          intuition: md`One step: $\lambda_i(1)=\sum_j\lambda_j(0)p_{j,i}$ (law of total probability), i.e. a **row vector times a matrix**.`,
          pitfalls: md`Multiply from the left with a **row** vector: $\vec\lambda P$, not $P\vec\lambda$.`,
        },
      ],
      viz: [{ id: 'markovChain', props: { preset: 'fourState' } }],
      examples: [
        {
          title: 'Bounded reachability',
          problem: md`With
$$P=\begin{pmatrix}0&\frac14&0&\frac34\\ \frac12&0&\frac13&\frac16\\0&0&1&0\\0&\frac12&\frac14&\frac14\end{pmatrix},$$
what is the probability of being in state 4 after exactly 3 steps from state 1?`,
          solution: md`The paths of length 3 from 1 to 4 are $1\text{-}2\text{-}1\text{-}4$, $1\text{-}2\text{-}4\text{-}4$, $1\text{-}4\text{-}2\text{-}4$, $1\text{-}4\text{-}4\text{-}4$:
$$\tfrac14\tfrac12\tfrac34+\tfrac14\tfrac16\tfrac14+\tfrac34\tfrac12\tfrac16+\tfrac34\tfrac14\tfrac14=\tfrac3{32}+\tfrac1{96}+\tfrac1{16}+\tfrac3{64}=\tfrac{41}{192}.$$
Equivalently, it is the entry $(P^3)_{1,4}$.`,
        },
      ],
    },
    {
      id: 'hitting',
      title: 'Hitting probabilities and mean hitting times',
      kind: 'theorem',
      body: md`The **hitting time** of a set of states $A$ is the random variable
$$H^A=\inf\{n\ge0\mid X_n\in A\}\in\{0,1,2,\dots\}\cup\{\infty\}\qquad(\inf\emptyset=\infty).$$
From state $i$, the **hitting probability** is $h_i^A=P(H^A<\infty\mid X_0=i)$ and the **mean hitting time** is $k_i^A=E(H^A\mid X_0=i)$. The latter includes $\infty\cdot P(H^A=\infty)$, with the convention $0\cdot\infty=0$, so $k_i^A=\infty$ whenever $h_i^A<1$.

Both are computed by **first-step analysis**: condition on the first move (total probability or total expectation).`,
      formulas: [
        {
          id: 'hit-eq',
          name: 'Equations for hitting probabilities',
          tex: md`h_i^A=\begin{cases}1 & i\in A\\ \sum_j p_{i,j}\,h_j^A & i\notin A\end{cases}`,
          intuition: 'From i you jump to j with probability p_{ij} and then need to hit A from j.',
          conditions: md`$h^A$ is the **minimal non-negative** solution. Equivalently, set $h_i=0$ for states that cannot reach $A$ and solve the rest.`,
          pitfalls: 'Without minimality the system may have several solutions (e.g. h ≡ 1 always satisfies the equations of a closed class).',
        },
        {
          id: 'hit-time-eq',
          name: 'Equations for mean hitting times',
          tex: md`k_i^A=\begin{cases}0 & i\in A\\ 1+\sum_{j\notin A} p_{i,j}\,k_j^A & i\notin A\end{cases}`,
          intuition: 'One step is spent, then you continue from the successor (states in A contribute 0).',
          conditions: md`$k^A$ is the **minimal non-negative** solution (possibly with $\infty$ entries).`,
        },
      ],
      viz: [{ id: 'markovChain', props: { preset: 'drunkard', tab: 'hitting' } }],
      examples: [
        {
          title: "Drunkard's walk",
          problem: md`States $1,2,3,4$; 1 and 4 are absorbing ditches; from 2 and 3 move left or right with probability $\frac12$. Find $h_2$ = P(reach 4 from 2) and $k_2$ = mean time to reach a ditch from 2.`,
          solution: md`**Hitting probability.** $h_1=0$, $h_4=1$, $h_2=\frac12h_1+\frac12h_3$, $h_3=\frac12h_2+\frac12h_4$. Then $h_2=\frac12(\frac12h_2+\frac12)$, which gives $h_2=\frac13$.

**Hitting time.** $k_1=k_4=0$, $k_2=1+\frac12k_3$, $k_3=1+\frac12k_2$. Then $k_2=\frac32+\frac14k_2$, which gives $k_2=2$.`,
        },
      ],
    },
    {
      id: 'ruin',
      title: "Gambler's ruin",
      kind: 'example',
      body: md`Player 1 has $L_1$ dollars and player 2 has $L_2$. A fair coin decides who pays whom \$1, until someone is bankrupt. The states are Player 1's net winnings $-L_1,\dots,L_2$, and both ends are absorbing.

**Solution 1 (hitting equations).** With $h_j$ = P(reach $L_2$): $h_{-L_1}=0$, $h_{L_2}=1$, and $h_j=\frac12h_{j-1}+\frac12h_{j+1}$. The solution is linear, $h_j=(j+L_1)r$ with $r=\frac1{L_1+L_2}$, so
$$h_0=\frac{L_1}{L_1+L_2}.$$

**Solution 2 (martingale argument).** Let $W_t$ be the winnings after $t$ steps. Each step has mean 0, so $E(W_t)=0$ for every $t$. In the limit all mass sits at $-L_1$ (with probability $1-q$) and $L_2$ (with probability $q$), so $0=-L_1(1-q)+L_2q$, again giving $q=\frac{L_1}{L_1+L_2}$.

The probability of winning is proportional to how much you are willing to lose. For a biased game ($p\ne\frac12$) the same equations give $h_j$ as a ratio of geometric terms: try the "Gambler's ruin" preset (with $p=0.4$) in the explorer.`,
      viz: [{ id: 'markovChain', props: { preset: 'ruin', tab: 'hitting' } }],
    },
    {
      id: 'overview',
      title: 'Overview: kinds of Markov chain analysis',
      kind: 'summary',
      body: md`- **Transient analysis** (this lecture):
  - distribution after $k$ steps: $\vec\lambda(0)P^k$
  - reachability / hitting probabilities: the $h_i$ equations
  - mean hitting times: the $k_i$ equations
- **Long-run analysis** (next lecture):
  - probability of visiting a state infinitely often
  - mean inter-visit time
  - long-run limit distribution
  - stationary (invariant) distribution and the ergodic theorem`,
    },
  ],
  flashcards: [
    { id: 'l06-c1', front: 'Definition of a stochastic process', back: md`A collection of random variables $\{X_t\mid t\in T\}$; $t$ is time and $X_t$ the state at time $t$.` },
    { id: 'l06-c2', front: 'Markov property (time-homogeneous)', back: md`$P(X_t=a\mid X_{t-1}=b,\dots,X_0=a_0)=P(X_t=a\mid X_{t-1}=b)=p_{b,a}$, independent of history and time.` },
    { id: 'l06-c3', front: 'Stochastic matrix', back: 'A square matrix with non-negative entries whose every row sums to 1 (each row is a distribution of the next state).' },
    { id: 'l06-c4', front: 'How do you compute the distribution after t steps?', back: md`$\vec\lambda(t)=\vec\lambda(0)P^t$ (a row vector times a matrix power).` },
    { id: 'l06-c5', front: 'Probability of the run prefix $a_0a_1\\dots a_t$', back: md`$\lambda_{a_0}(0)\prod_{k=1}^t p_{a_{k-1},a_k}$.` },
    { id: 'l06-c6', front: 'What uniquely determines a finite DTMC?', back: md`An initial distribution $\vec\lambda(0)$ and a transition matrix $P$.` },
    { id: 'l06-c7', front: 'Definition of the hitting time $H^A$', back: md`$H^A=\inf\{n\ge0\mid X_n\in A\}$, with $\inf\emptyset=\infty$.` },
    { id: 'l06-c8', front: 'Equations for hitting probabilities $h_i^A$', back: md`$h_i=1$ for $i\in A$; $h_i=\sum_j p_{ij}h_j$ for $i\notin A$. Take the **minimal non-negative** solution.` },
    { id: 'l06-c9', front: 'Equations for mean hitting times $k_i^A$', back: md`$k_i=0$ for $i\in A$; $k_i=1+\sum_{j\notin A}p_{ij}k_j$ for $i\notin A$. Minimal non-negative solution.` },
    { id: 'l06-c10', front: "Gambler's ruin (fair) — P(player with $L_1$ wins $L_2$)", back: md`$\frac{L_1}{L_1+L_2}$.` },
    { id: 'l06-c11', front: 'Why is $k_i^A=\\infty$ whenever $h_i^A<1$?', back: md`With positive probability $H^A=\infty$, and that event contributes $\infty\cdot P(H^A=\infty)=\infty$ to the expectation.` },
    { id: 'l06-c12', front: 'Drunkard’s walk on 1..4 (ditches 1, 4): $h_2$ to reach 4 and $k_2$', back: md`$h_2=1/3$, $k_2=2$.` },
  ],
  quiz: [
    {
      id: 'l06-q1',
      type: 'numeric',
      prompt: md`$P=\begin{pmatrix}0.9&0.1\\0.5&0.5\end{pmatrix}$ and the chain starts in state 1. Compute $P(X_2=1)$.`,
      answer: 0.86,
      explanation: md`$\vec\lambda(1)=(0.9,0.1)$, so $\lambda_1(2)=0.9\cdot0.9+0.1\cdot0.5=0.81+0.05=0.86$.`,
    },
    {
      id: 'l06-q2',
      type: 'numeric',
      prompt: md`Fair gambler's ruin: you have \$3 and play against an opponent with \$7. What is the probability that **you** end up with all \$10?`,
      answer: 0.3,
      explanation: md`$\frac{L_1}{L_1+L_2}=\frac{3}{10}$.`,
    },
    {
      id: 'l06-q3',
      type: 'numeric',
      prompt: md`Symmetric random walk on $\{0,1,2,3,4,5\}$ with absorbing 0 and 5, starting at 2. Expected number of steps until absorption?`,
      answer: 6,
      explanation: md`For a fair walk on $0..N$, $k_i=i(N-i)$, so $k_2=2\cdot3=6$. Check: $k_i=1+\frac12(k_{i-1}+k_{i+1})$ holds with $k_0=k_5=0$.`,
    },
    {
      id: 'l06-q4',
      type: 'mcq',
      prompt: md`Which matrix is a valid transition matrix of a DTMC?`,
      options: [md`$\begin{pmatrix}0.5&0.5\\0.5&0.6\end{pmatrix}$`, md`$\begin{pmatrix}1&0\\0.3&0.7\end{pmatrix}$`, md`$\begin{pmatrix}0.2&0.3\\0.8&0.7\end{pmatrix}$`, md`$\begin{pmatrix}1.2&-0.2\\0&1\end{pmatrix}$`],
      answer: 1,
      explanation: 'Rows must be non-negative and sum to 1. Option 3 has columns summing to 1 (a column-stochastic matrix), which is the wrong convention.',
    },
    {
      id: 'l06-q5',
      type: 'numeric',
      prompt: md`A die is thrown until a 6 appears; model it as a 2-state chain. What is the mean hitting time of "6 seen" from the start?`,
      answer: 6,
      explanation: md`$k=1+\frac56k$ gives $k=6$. This is just the geometric mean $1/p$.`,
    },
    {
      id: 'l06-q6',
      type: 'truefalse',
      prompt: md`The hitting probabilities $h^A$ are always the **unique** solution of the system $h_i=1$ ($i\in A$), $h_i=\sum_jp_{ij}h_j$ ($i\notin A$).`,
      answer: false,
      explanation: md`Not necessarily unique: states that cannot reach $A$ (e.g. in a closed class) also satisfy the equations with $h\equiv1$. We need the *minimal non-negative* solution.`,
    },
    {
      id: 'l06-q7',
      type: 'numeric',
      prompt: md`States 0,1,2 with $p_{0,1}=1$, $p_{1,0}=0.5$, $p_{1,2}=0.5$, and 2 absorbing. Expected number of steps from 0 to reach 2?`,
      answer: 4,
      explanation: md`$k_0=1+k_1$ and $k_1=1+\frac12k_0$. Then $k_1=1+\frac12(1+k_1)$, so $k_1=3$ and $k_0=4$.`,
    },
    {
      id: 'l06-q8',
      type: 'mcq',
      prompt: md`$\vec\lambda(t)$ is the distribution at time $t$ (a row vector). Which formula is correct?`,
      options: [md`$\vec\lambda(t)=P^t\vec\lambda(0)$`, md`$\vec\lambda(t)=\vec\lambda(0)P^t$`, md`$\vec\lambda(t)=\vec\lambda(0)tP$`, md`$\vec\lambda(t)=(P^T)\vec\lambda(0)$`],
      answer: 1,
      explanation: md`$\lambda_i(t+1)=\sum_j\lambda_j(t)p_{j,i}$, i.e. a row vector times $P$.`,
    },
  ],
};
