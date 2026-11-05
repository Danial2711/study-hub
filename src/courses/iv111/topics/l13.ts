import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l13: Topic = {
  id: 'l13',
  lecture: 13,
  examGroup: 'NX',
  title: 'Continuous-time Markov chains (bonus)',
  summary: md`**Not part of the exam.** The memoryless exponential distribution, event-driven systems and CTMCs, races of exponential clocks, queues in Kendall notation, discretisation via the embedded DTMC, uniformisation, transient analysis with the Poisson distribution, tools and non-Markovian models.`,
  sections: [
    {
      id: 'exp',
      title: 'The exponential distribution',
      kind: 'definition',
      body: md`A discrete-time chain needs only a distribution of *where* to go next. In continuous time we also need a distribution of *when* the next step happens.

To keep the process Markovian, the waiting time must not depend on how long we have already waited. So we need a continuous analogue of the geometric distribution: the **exponential distribution** with rate $\lambda$.`,
      formulas: [
        {
          id: 'exp-f',
          name: 'Exponential distribution',
          tex: md`f(t)=\lambda e^{-\lambda t},\qquad F(t)=1-e^{-\lambda t},\qquad E=\frac1\lambda,\qquad P(X>t_0+t\mid X>t_0)=P(X>t)`,
          intuition: 'The only memoryless continuous distribution: an exponential clock never "gets closer" to ringing.',
        },
        {
          id: 'race',
          name: 'Race of exponential clocks',
          tex: md`\min(W_1,W_2)\sim\mathrm{Exp}(\lambda_1+\lambda_2),\qquad P(W_1<W_2)=\frac{\lambda_1}{\lambda_1+\lambda_2}`,
          intuition: 'Competing events: the waiting time until the first one has the summed rate, and each event wins with probability proportional to its rate, independently of when the winner rings.',
        },
      ],
      viz: [{ id: 'distribution', props: { kind: 'exponential', kinds: ['exponential', 'geometric'] } }],
    },
    {
      id: 'ctmc',
      title: 'Continuous-time Markov chains',
      kind: 'definition',
      body: md`A **CTMC** is an event-driven system whose events are exponentially distributed. In each state we wait for several exponential events with arbitrary rates, and the first one to occur decides the next state.

Formally, a CTMC is given by an initial distribution $\lambda(0)$ and a **rate matrix** $Q$, where $Q[i,j]$ is the rate of the event leading from $i$ to $j$.

A distribution $\pi$ is **stationary** iff starting in $\pi$ gives $\lambda(t)=\pi$ for all $t\ge0$.

**Dual view.** Since the winning event and the winning time are independent, a state with outgoing rates $\lambda_1,\lambda_2,\lambda_3$ is equivalent to:
- waiting $\mathrm{Exp}(\lambda)$ with **exit rate** $\lambda=\sum\lambda_i$, then
- jumping according to the **exit probabilities** $p_i=\lambda_i/\lambda$.`,
    },
    {
      id: 'queues',
      title: 'Queues (Kendall notation)',
      kind: 'definition',
      body: md`**A/S/n/B/K** gives, in order: the inter-arrival distribution, the service distribution (M = exponential, D = deterministic, G = general), the number of servers, the buffer size (default $\infty$), and the population size (default $\infty$).

- **M/M/1**: the states $s_0,s_1,\dots$ count requests; arrivals move right with rate $\lambda_1$ and services move left with rate $\lambda_2$.
- **M/M/2/2**: with 2 servers busy, the service rate is $2\lambda_2$.

Typical questions: the distribution at time $t$, convergence, the fraction of time in each state, utilisation ($1-F_0$), and mean queue length ($\sum_ss\,F_s$).`,
      viz: [{ id: 'ctmc' }],
    },
    {
      id: 'analysis',
      title: 'Analysis techniques',
      kind: 'theorem',
      body: md`**Discretisation (embedded DTMC).**
1. The *time-abstract frequency* is the stationary distribution of the DTMC of exit probabilities.
2. The *time frequency* weights it by the mean holding times $1/\lambda_i$ and renormalises.
3. Utilisation and mean queue length follow from the time frequency.

**Uniformisation.** Adding a self-loop does not change a CTMC, by memorylessness. Add self-loops so that every state has the same exit rate $\Lambda$ (the maximum). The uniformised DTMC $P=I+\frac{Q-\mathrm{diag}(\text{exit})}{\Lambda}$ then has the CTMC's stationary distribution directly: no rebalancing is needed.

**Transient distribution.** For a uniformised CTMC, the number of steps in time $t$ is Poisson($\Lambda t$):
$$P(X_t=s)=\sum_{i\ge0}\underbrace{P(X_t=s\mid i\text{ steps})}_{\lambda(0)P^i}\cdot\underbrace{\frac{(\Lambda t)^i}{i!}e^{-\Lambda t}}_{\text{Poisson}}.$$

**Convergence.** A finite CTMC always has a stationary distribution, and $\lambda(t)$ converges to it. Periodicity is not an issue in continuous time.`,
      examples: [
        {
          title: 'M/M/2/2 with arrival rate 5 and service rate 7',
          problem: md`Compute the utilisation and the mean queue length.`,
          solution: md`**Embedded DTMC.** $s_0\to s_1$ (1); $s_1\to s_2$ ($\frac5{12}$), $s_1\to s_0$ ($\frac7{12}$); $s_2\to s_1$ (1). Its stationary distribution is $(\frac7{24},\frac12,\frac5{24})$.

**Holding times.** Exit rates are $5,12,14$, so mean waits are $\frac15,\frac1{12},\frac1{14}$.

**Time frequency.** $\propto\frac7{24}\cdot\frac15:\frac12\cdot\frac1{12}:\frac5{24}\cdot\frac1{14}$, which normalises to $(\frac{98}{193},\frac{70}{193},\frac{25}{193})$.

**Answer.** Utilisation $1-\frac{98}{193}\approx0.49$; mean queue length $\frac{70+50}{193}=\frac{120}{193}\approx0.62$.

Uniformising with $\Lambda=14$ gives the same $\pi$ directly.`,
        },
      ],
    },
    {
      id: 'beyond',
      title: 'Tools and non-Markovian models',
      kind: 'concept',
      body: md`**Tools:** PRISM, Storm, Modest, MRMC, CADP, PROPhESY.

**Semi-Markov processes:** arbitrary event distributions, and the first event restarts all others. **Generalised semi-Markov processes:** events need not restart (full concurrency).

**Phase-type approximation (Neuts 1981):** any distribution on $[0,\infty)$ can be approximated arbitrarily closely by the absorption time of a CTMC. This lets CTMC techniques handle non-exponential delays.`,
    },
  ],
  flashcards: [
    { id: 'l13-c1', front: 'Memoryless property of the exponential distribution', back: md`$P(X>t_0+t\mid X>t_0)=P(X>t)=e^{-\lambda t}$.` },
    { id: 'l13-c2', front: 'Minimum of independent exponentials', back: md`$\min(W_1,W_2)\sim\mathrm{Exp}(\lambda_1+\lambda_2)$.` },
    { id: 'l13-c3', front: 'Probability that exponential clock 1 wins', back: md`$\lambda_1/(\lambda_1+\lambda_2)$, independent of the winning time.` },
    { id: 'l13-c4', front: 'Exit rate and exit probabilities', back: md`Exit rate $\lambda=\sum_j Q[i,j]$; exit probabilities $Q[i,j]/\lambda$ (the embedded DTMC).` },
    { id: 'l13-c5', front: 'Time frequency from the embedded DTMC', back: md`$F_s\propto\pi^{\text{DTMC}}_s\cdot\frac1{\lambda_s}$, normalised.` },
    { id: 'l13-c6', front: 'Uniformisation', back: 'Add self-loops so that all states have the same exit rate Λ; the stationary distribution of the resulting DTMC is the CTMC\'s stationary distribution.' },
    { id: 'l13-c7', front: 'Kendall notation A/S/n/B/K', back: 'Arrival distribution / service distribution / number of servers / buffer size / population size (M = exponential).' },
    { id: 'l13-c8', front: 'Transient distribution of a uniformised CTMC', back: md`$\sum_i\lambda(0)P^i\cdot\mathrm{Poisson}_{\Lambda t}(i)$.` },
  ],
  quiz: [
    {
      id: 'l13-q1',
      type: 'numeric',
      prompt: md`Two independent exponential events with rates 3 and 5 race. What is the probability that the rate-3 event wins?`,
      answer: 3 / 8,
      explanation: md`$\frac{3}{3+5}=0.375$.`,
    },
    {
      id: 'l13-q2',
      type: 'numeric',
      prompt: md`In the same race, what is the expected time until the first event?`,
      answer: 1 / 8,
      explanation: md`The minimum is $\mathrm{Exp}(8)$, with mean $\frac18$.`,
    },
    {
      id: 'l13-q3',
      type: 'numeric',
      prompt: md`M/M/1/1 (one server, no waiting room) with arrival rate 2 and service rate 3. Fraction of time the server is busy?`,
      answer: 0.4,
      explanation: md`Two states with cut equation $2\pi_0=3\pi_1$, so $\pi=(0.6,0.4)$ and utilisation is 0.4.`,
    },
  ],
};
