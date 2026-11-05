import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l08: Topic = {
  id: 'l08',
  lecture: 8,
  examGroup: 'Q5',
  title: 'Rewards & Markov decision processes',
  summary: md`Instant rewards on Markov chains, run payoffs (cumulative, time-bounded, discounted, mean payoff), Bellman equations, MDPs, strategies and their induced chains, optimal memoryless deterministic strategies, Bellman optimality equations, and solution techniques (value iteration, policy iteration, linear programming).`,
  sections: [
    {
      id: 'rewards',
      title: 'Rewards and payoffs on Markov chains',
      kind: 'definition',
      body: md`An **instant reward** is a function $r:S\to\mathbb R$ giving a value to every visit of a state. Rewards are maximised; *costs* are minimised. Multiplying by $-1$ converts one into the other.

A run yields a sequence of rewards $r(X_0),r(X_1),\dots$. A **run payoff** (return) turns it into a single number. The payoff is a *random variable*, a value assigned to each run. The **Markov-chain payoff** is its expected value.

**Why several payoffs?**
- *Finite runs*: just sum the rewards.
- *Infinite runs*: sums are often $\infty$, so compare averages per step (mean payoff).
- Two runs can have the same average while one earns earlier. To put more weight on earlier rewards, **discount**.`,
      formulas: [
        {
          id: 'payoffs',
          name: 'Run payoffs',
          tex: md`\underbrace{\sum_{i=0}^{\infty}r(X_i)}_{\text{unbounded}}\qquad\underbrace{\sum_{i=0}^{T}r(X_i)}_{\text{time-bounded}}\qquad\underbrace{\sum_{i=0}^{\infty}\gamma^i\,r(X_i)}_{\text{discounted},\ 0<\gamma<1}\qquad\underbrace{\lim_{n\to\infty}\frac1n\sum_{i=0}^{n}r(X_i)}_{\text{mean payoff}}`,
          intuition: 'Different ways of collapsing an infinite stream of rewards into one number. Discounting values earlier rewards more; the mean payoff only cares about long-run behaviour.',
          pitfalls: 'The unbounded cumulative reward diverges as soon as a reachable recurrent state has a positive reward, so it is rarely used.',
        },
        {
          id: 'mean-payoff',
          name: 'Expected mean payoff via the stationary distribution',
          tex: md`E\Big[\lim_{n\to\infty}\frac1n\sum_{i=0}^n r(X_i)\Big]=\sum_{s}\pi(s)\,r(s)`,
          conditions: 'Irreducible chain (ergodic theorem). For reducible chains, weight each BSCC\'s value Σπ_B(s)r(s) by the probability of reaching that BSCC.',
        },
        {
          id: 'bounded-reward',
          name: 'Time-bounded cumulative reward',
          tex: md`E\Big[\sum_{i=0}^T r(X_i)\Big]=\sum_{i=0}^{T} r\big(\vec\pi P^i\big),\qquad r(\vec\pi')=\sum_s\pi'(s)\,r(s)`,
          intuition: 'Expected reward at each step is the reward averaged over the distribution at that step; then add up the steps.',
        },
      ],
      examples: [
        {
          title: 'Mean payoff with two closed classes',
          problem: md`From $a$ (reward 0) the chain moves with probability $0.3$ into BSCC $L=\{c,b\}$ (rewards $-1,2$) and with $0.7$ into BSCC $R=\{d,e\}$ (rewards $3,2$). Suppose the stationary distributions are $\pi_L=(c{:}\,0.4,\ b{:}\,0.6)$ and $\pi_R=(d{:}\,0.25,\ e{:}\,0.75)$. Find the expected mean payoff.`,
          solution: md`$0.3\cdot(0.4\cdot(-1)+0.6\cdot2)+0.7\cdot(0.25\cdot3+0.75\cdot2)=0.3\cdot0.8+0.7\cdot2.25=0.24+1.575=1.815$.`,
        },
      ],
    },
    {
      id: 'discounted',
      title: 'Discounted payoff & Bellman equations',
      kind: 'theorem',
      body: md`**Lemma.** With $r_{\mathrm{max}}=\max_s|r(s)|$, every run's discounted payoff lies in $\big[-\frac{r_{\mathrm{max}}}{1-\gamma},\frac{r_{\mathrm{max}}}{1-\gamma}\big]$ (a geometric series).

**Intuition.** The discounted payoff is the total reward of a *mortal* agent who dies with probability $1-\gamma$ in each step.

The **value function** $V(s)$ is the expected discounted payoff when the chain starts in $s$.`,
      formulas: [
        {
          id: 'bellman-mc',
          name: 'Bellman equations (Markov chain)',
          tex: md`V(s)=r(s)+\gamma\sum_{s'}P[s,s']\,V(s')\qquad\Longleftrightarrow\qquad V=r+\gamma PV`,
          intuition: 'Collect the reward now, then continue from the next state, which is worth γ times its value.',
          conditions: md`For a finite chain this linear system has a **unique** solution, $V=(I-\gamma P)^{-1}r$.`,
        },
      ],
      examples: [
        {
          title: 'Two states',
          problem: md`States $a$ ($r=1$) and $b$ ($r=0$), with $P(a\to a)=0.5$, $P(a\to b)=0.5$, $b$ absorbing, $\gamma=0.9$. Compute $V(a)$.`,
          solution: md`$V(b)=0+0.9V(b)$, so $V(b)=0$. Then $V(a)=1+0.9(0.5V(a)+0.5\cdot0)$, so $V(a)(1-0.45)=1$ and $V(a)=\frac1{0.55}\approx1.818$.`,
        },
      ],
    },
    {
      id: 'mdp',
      title: 'Markov decision processes',
      kind: 'definition',
      body: md`A Markov chain has fully specified behaviour. Real systems often include **decisions** by an agent (controller, robot, software). Until the agent's behaviour is fixed, there is no well-defined probability space.

**Example (jammed printer).** When paper jams you can *force* it out (quick, but the printer may become degraded) or *disassemble* and repair (a slow maintenance phase, after which the printer is fine). Which is better depends on how much you value the future.`,
      formulas: [
        {
          id: 'mdp-def',
          name: 'Markov decision process',
          tex: md`\mathcal M=(S,A,P,r),\qquad P:S\times A\times S\to[0,1],\ \ \sum_{s'}P(s,a,s')=1,\qquad r:S\times A\to\mathbb R`,
          symbols: [
            { sym: 'S', meaning: 'finite set of states' },
            { sym: 'A', meaning: 'finite set of actions' },
            { sym: md`P(s,a,s')`, meaning: md`probability of moving to $s'$ when action $a$ is taken in $s$` },
            { sym: md`r(s,a)`, meaning: 'reward for taking action a in state s' },
          ],
          conditions: md`Variants: rewards $r(s,a,s')$ may also depend on the target; in game-theoretic settings the graph need not be bipartite (state/action).`,
        },
      ],
      viz: [{ id: 'mdp', props: { preset: 'printer' } }],
    },
    {
      id: 'strategies',
      title: 'Strategies (policies)',
      kind: 'definition',
      body: md`A **strategy** (policy) is $\sigma:S^*\to\mathcal D(A)$: it maps each finite history to a distribution over actions.

- **Deterministic (pure)**: no randomisation, $\sigma:S^*\to A$.
- **Memoryless (stationary)**: depends only on the last state, $\sigma:S\to\mathcal D(A)$.

**MDP + memoryless strategy = Markov chain.** A memoryless $\sigma$ induces the chain $\mathcal M_\sigma$ with
$$P_\sigma(s,s')=\sum_{a\in A}\sigma(s)(a)\,P(s,a,s').$$
All the Markov-chain techniques then apply. History-dependent strategies induce an (infinite) chain on histories.

The goal is to **optimise**: find a strategy maximising a chosen payoff.`,
      formulas: [
        {
          id: 'optimal-md',
          name: 'Optimal strategies exist (discounted payoff)',
          tex: md`\text{finite MDP}\ \Rightarrow\ \exists\ \text{memoryless deterministic }\sigma^*\ \text{maximising the discounted payoff from every state}`,
          intuition: 'Neither memory nor randomisation helps for discounted payoffs. You only need to pick one action per state, so there are finitely many candidate strategies.',
        },
      ],
    },
    {
      id: 'bellman-opt',
      title: 'Bellman optimality & solution techniques',
      kind: 'theorem',
      body: md`**Idea.** If a policy is optimal, no single action can improve the value.`,
      formulas: [
        {
          id: 'bellman-opt-f',
          name: 'Bellman optimality equations',
          tex: md`V^*(s)=\max_{a\in A}\Big(r(s,a)+\gamma\sum_{s'}P(s,a,s')\,V^*(s')\Big)=\max_a Q(s,a)`,
          intuition: md`$Q(s,a)$ is the value of taking $a$ now and acting optimally afterwards. The optimal policy picks $\arg\max_a Q(s,a)$.`,
          conditions: md`$V^*$ is the **unique** solution. The equations are not linear because of the $\max$.`,
        },
        {
          id: 'lp',
          name: 'Linear program',
          tex: md`\min\sum_{s\in S}V(s)\quad\text{s.t.}\quad V(s)\ge r(s,a)+\gamma\sum_{s'}P(s,a,s')V(s')\quad\forall s,a`,
          intuition: md`Replace $a=\max B$ by the constraints $a\ge b$ for all $b\in B$, and minimise. The smallest $V$ satisfying all constraints is $V^*$. LPs are solvable in polynomial time.`,
        },
        {
          id: 'vi',
          name: 'Value iteration',
          tex: md`V_{k+1}(s)=\max_a\Big(r(s,a)+\gamma\sum_{s'}P(s,a,s')V_k(s')\Big),\qquad V_0\equiv0`,
          intuition: md`The Bellman operator is a $\gamma$-contraction in the max-norm, so $V_k\to V^*$ geometrically from any start. $V_k$ is the optimal $k$-step discounted payoff.`,
        },
        {
          id: 'pi',
          name: 'Policy iteration',
          tex: md`\text{evaluate: } V^{\sigma}=r_\sigma+\gamma P_\sigma V^\sigma\quad\to\quad\text{improve: }\sigma'(s)=\arg\max_a Q^{\sigma}(s,a)`,
          intuition: 'Alternate exact evaluation (a linear system) with greedy improvement. Each round strictly improves until nothing changes; there are finitely many policies, so it terminates.',
        },
      ],
      viz: [{ id: 'mdp', props: { preset: 'machine' }, caption: 'Move γ from 0.5 to 0.95: the optimal action in the "worn" state switches from **run** (greedy) to **repair** (invest in the future).' }],
      examples: [
        {
          title: 'One step of value iteration',
          problem: md`State $s$ has actions $a$ (reward 2, stay in $s$) and $b$ (reward 0, go to $t$). State $t$ has a single action with reward 3 that stays in $t$. With $\gamma=0.5$ and $V_0\equiv0$, compute $V_1$, $V_2$ and $V^*$.`,
          solution: md`$V_1(s)=\max(2,0)=2$, $V_1(t)=3$.
$V_2(s)=\max(2+0.5\cdot2,\ 0+0.5\cdot3)=\max(3,1.5)=3$, $V_2(t)=3+1.5=4.5$.
Exactly: $V^*(t)=\frac3{1-0.5}=6$; staying gives $\frac2{0.5}=4$; moving gives $0+0.5\cdot6=3$. So $V^*(s)=4$ and the optimal action is $a$. With $\gamma=0.9$: staying gives $20$, moving gives $0.9\cdot30=27$, so moving becomes optimal.`,
        },
      ],
    },
  ],
  flashcards: [
    { id: 'l08-c1', front: 'Instant reward on a Markov chain', back: md`A function $r:S\to\mathbb R$ collected at every visit of a state.` },
    { id: 'l08-c2', front: 'List the run payoffs from the lecture', back: 'Cumulative: unbounded Σr(X_i), time-bounded Σ_{i≤T} r(X_i), discounted Σγ^i r(X_i); mean payoff lim (1/n)Σr(X_i).' },
    { id: 'l08-c3', front: 'Expected mean payoff of an irreducible chain', back: md`$\sum_s\pi(s)r(s)$ (ergodic theorem).` },
    { id: 'l08-c4', front: 'Bounds on the discounted payoff of a run', back: md`$[-r_{\mathrm{max}}/(1-\gamma),\ r_{\mathrm{max}}/(1-\gamma)]$.` },
    { id: 'l08-c5', front: 'Bellman equations for a Markov chain (discounted)', back: md`$V(s)=r(s)+\gamma\sum_{s'}P[s,s']V(s')$, i.e. $V=r+\gamma PV$, with a unique solution for finite chains.` },
    { id: 'l08-c6', front: 'Definition of an MDP', back: md`$(S,A,P,r)$: finite states and actions, $P(s,a,\cdot)$ a distribution for each $(s,a)$, reward $r:S\times A\to\mathbb R$.` },
    { id: 'l08-c7', front: 'Strategy types', back: 'Randomised vs deterministic (pure); history-dependent vs memoryless (stationary).' },
    { id: 'l08-c8', front: 'Chain induced by a memoryless strategy σ', back: md`$P_\sigma(s,s')=\sum_a\sigma(s)(a)P(s,a,s')$.` },
    { id: 'l08-c9', front: 'Existence of optimal strategies for the discounted payoff', back: 'Every finite MDP has a memoryless deterministic optimal strategy.' },
    { id: 'l08-c10', front: 'Bellman optimality equations', back: md`$V^*(s)=\max_a\big(r(s,a)+\gamma\sum_{s'}P(s,a,s')V^*(s')\big)$, with a unique solution (non-linear because of the max).` },
    { id: 'l08-c11', front: 'Linear program for an optimal MDP value', back: md`Minimise $\sum_sV(s)$ subject to $V(s)\ge r(s,a)+\gamma\sum_{s'}P(s,a,s')V(s')$ for all $s,a$.` },
    { id: 'l08-c12', front: 'Value iteration', back: md`$V_{k+1}=\max_a(r+\gamma PV_k)$ from $V_0=0$; converges to $V^*$ because the operator is a γ-contraction.` },
    { id: 'l08-c13', front: 'Policy iteration', back: 'Evaluate the current policy (solve a linear system), improve greedily by Q-values, repeat until stable.' },
    { id: 'l08-c14', front: 'Interpretation of the discount factor γ', back: 'Weight of future rewards; equivalently the total reward of a mortal agent who dies with probability 1 − γ each step. Small γ means short-sighted, γ → 1 means far-sighted.' },
  ],
  quiz: [
    {
      id: 'l08-q1',
      type: 'numeric',
      prompt: md`A single absorbing state with reward $r=2$ and $\gamma=0.8$. What is its discounted value $V$?`,
      answer: 10,
      explanation: md`$V=2+0.8V$, so $V=2/0.2=10$, the geometric series $\sum 0.8^i\cdot2$.`,
    },
    {
      id: 'l08-q2',
      type: 'numeric',
      prompt: md`Irreducible chain with $\vec\pi=(0.5,0.3,0.2)$ and rewards $r=(4,-2,10)$. What is the expected mean payoff?`,
      answer: 3.4,
      explanation: md`$0.5\cdot4+0.3\cdot(-2)+0.2\cdot10=2-0.6+2=3.4$.`,
    },
    {
      id: 'l08-q3',
      type: 'truefalse',
      prompt: md`For the discounted payoff in a finite MDP, randomised strategies can achieve a strictly higher value than any deterministic one.`,
      answer: false,
      explanation: 'A memoryless deterministic optimal strategy always exists for the discounted payoff.',
    },
    {
      id: 'l08-q4',
      type: 'mcq',
      prompt: md`Why can the Bellman optimality equations not be solved directly as a linear system?`,
      options: ['They have no solution', 'They contain a max over actions, which is non-linear', 'The discount factor makes them singular', 'They require knowing the stationary distribution'],
      answer: 1,
      explanation: 'The max makes them non-linear. Use value iteration, policy iteration, or a linear program that replaces max by ≥ constraints.',
    },
    {
      id: 'l08-q5',
      type: 'numeric',
      prompt: md`State $s$: action $a$ gives reward 1 and stays in $s$; action $b$ gives reward 0 and moves to absorbing state $t$ with reward 2 per step. For $\gamma=0.9$, what is $V^*(s)$?`,
      answer: 18,
      explanation: md`$V^*(t)=2/(1-0.9)=20$. Staying forever gives $1/0.1=10$; moving gives $0+0.9\cdot20=18$. So $V^*(s)=18$ (action $b$).`,
    },
    {
      id: 'l08-q6',
      type: 'numeric',
      prompt: md`Rewards are bounded by $|r|\le5$ and $\gamma=0.95$. What is the largest possible absolute discounted payoff of a run?`,
      answer: 100,
      explanation: md`$r_{\mathrm{max}}/(1-\gamma)=5/0.05=100$.`,
    },
    {
      id: 'l08-q7',
      type: 'mcq',
      prompt: md`Given an MDP and a memoryless strategy $\sigma$, what do we get?`,
      options: ['another MDP with fewer actions', 'a Markov chain', 'a stochastic game', 'nothing well-defined'],
      answer: 1,
      explanation: md`$P_\sigma(s,s')=\sum_a\sigma(s)(a)P(s,a,s')$ defines a Markov chain, to which all MC payoff techniques apply.`,
    },
    {
      id: 'l08-q8',
      type: 'numeric',
      prompt: md`Two-state chain $a\leftrightarrow b$ (deterministic alternation), $r(a)=1$, $r(b)=0$, $\gamma=0.5$. Compute $V(a)$.`,
      answer: 4 / 3,
      explanation: md`$V(a)=1+0.5V(b)$ and $V(b)=0+0.5V(a)$, so $V(a)=1+0.25V(a)$ and $V(a)=4/3$.`,
    },
  ],
};
