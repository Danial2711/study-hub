import type { Exercise } from '../../../platform/types';

const md = String.raw;

export const t05: Exercise[] = [
  {
    id: '5.1',
    title: 'First die and minimum',
    tutorial: 5,
    examGroup: 'Q2',
    topicId: 'l04',
    ref: 'cf. Tutorial 5.1',
    tier: 'core',
    prompt: md`Two fair dice are thrown; $X$ is the first die and $m$ the **minimum** of the two. Compute $E(X)$, $E(m)$, $\mathrm{Var}(X)$ and $\mathrm{Cov}(X,m)$.`,
    hints: [md`$E(m)=\sum_{k=1}^6P(m\ge k)$ and $P(m\ge k)=(\frac{7-k}6)^2$.`, md`For $E(Xm)$, fix $X=x$ and sum $\min(x,y)$ over $y$.`],
    solution: md`$E(X)=3.5$ and $\mathrm{Var}(X)=\frac{35}{12}$.
$E(m)=\frac{36+25+16+9+4+1}{36}=\frac{91}{36}\approx2.528$.
For fixed $x$, $\sum_y\min(x,y)=\frac{x(x-1)}2+x(7-x)$, so $\sum_x x\sum_y\min(x,y)=6+22+45+72+100+126=371$ and $E(Xm)=\frac{371}{36}$.
$\mathrm{Cov}(X,m)=\frac{371}{36}-\frac72\cdot\frac{91}{36}=\frac{52.5}{36}=\frac{35}{24}\approx1.458$.
Positive, as expected: a large first die tends to raise the minimum. Notice that $\mathrm{Cov}=\frac12\mathrm{Var}(X)$.`,
    rubric: ['E(X), Var(X)', 'E(m) via tail sum', 'E(Xm) computation', 'Cov = 35/24'],
  },
  {
    id: '5.2',
    title: 'Variance of a difference',
    tutorial: 5,
    examGroup: 'Q2',
    topicId: 'l04',
    ref: 'cf. Tutorial 5.2',
    tier: 'core',
    prompt: md`Prove $\mathrm{Var}(X-Y)=\mathrm{Var}(X)+\mathrm{Var}(Y)$ for independent $X,Y$. What is $\mathrm{Var}(X-Y)$ in general?`,
    solution: md`$\mathrm{Var}(X-Y)=\mathrm{Var}(X)+\mathrm{Var}(-Y)+2\mathrm{Cov}(X,-Y)=\mathrm{Var}(X)+\mathrm{Var}(Y)-2\mathrm{Cov}(X,Y)$, using $\mathrm{Var}(-Y)=(-1)^2\mathrm{Var}(Y)$. Independence gives $\mathrm{Cov}=0$.`,
  },
  {
    id: '5.3',
    title: 'Goalkeeper streak',
    tutorial: 5,
    examGroup: 'Q2',
    topicId: 'l04',
    ref: 'cf. Tutorial 5.3',
    tier: 'core',
    prompt: md`A goalkeeper saves 80% of shots, independently. Use Chebyshev to bound the probability that the first goal comes only after at least 10 saves, and compare with the exact value.`,
    solution: md`Let $G\sim\mathrm{Geom}(0.2)$ be the shot on which the first goal is scored. The event is $G\ge11$.
$E(G)=5$ and $\mathrm{Var}(G)=\frac{0.8}{0.04}=20$, so $P(G\ge11)\le P(|G-5|\ge6)\le\frac{20}{36}\approx0.556$.
Exact: $P(G\ge11)=0.8^{10}\approx0.107$. Chebyshev is valid but loose; it also "wastes" the lower tail.`,
    rubric: ['Geometric model and the event G ≥ 11', 'Mean 5 and variance 20', 'Chebyshev ≈ 0.556', 'Exact 0.8¹⁰'],
  },
  {
    id: '5.4',
    title: 'Favourite in a tournament (Chernoff)',
    tutorial: 5,
    examGroup: 'Q3',
    topicId: 'l05',
    ref: 'cf. Tutorial 5.4',
    tier: 'core',
    prompt: md`Alice wins each game with probability 0.7, independently. In a tournament of $2n+1$ games, bound the probability that she **does not** win the majority, using the Chernoff bound $P(X\le(1-\delta)\mu)\le e^{-\mu\delta^2/2}$.`,
    solution: md`$X\sim\mathrm{Bin}(2n+1,0.7)$ with $\mu=0.7(2n+1)$. Alice loses iff $X\le n<\frac{2n+1}2$.
Set $(1-\delta)\mu=\frac{2n+1}2$, which gives $1-\delta=\frac57$ and $\delta=\frac27$. Then
$$P(X\le n)\le e^{-0.7(2n+1)\cdot\frac{4}{49}\cdot\frac12}=e^{-\frac{2(2n+1)}{35}}.$$
This decays exponentially in $n$, e.g. $\approx0.30$ for $n=10$ and $\approx0.0031$ for $n=50$.`,
    rubric: ['Correct μ and event', 'Choice of δ = 2/7', 'Final exponential bound'],
  },
  {
    id: '5.5',
    title: 'Non-transitive dice',
    tutorial: 5,
    examGroup: 'Q1',
    topicId: 'l01',
    ref: 'cf. Tutorial 5.5',
    tier: 'core',
    prompt: md`Three fair dice have faces A = (3,3,3,3,3,3), B = (2,2,2,2,6,6), C = (1,1,5,5,5,5). Two players each pick a die and roll; the higher number wins. You let your opponent choose first. Is that a good idea?`,
    solution: md`$P(A>B)=\frac46=\frac23$ (A beats B unless B rolls 6).
$P(B>C)$: if B shows 2 (prob. $\frac23$) it beats only C's 1 (prob. $\frac13$); if B shows 6 it always wins. So $\frac23\cdot\frac13+\frac13=\frac59$.
$P(C>A)=\frac46=\frac23$.
So A beats B, B beats C and C beats A: the relation is **non-transitive**. Whatever your opponent picks, you can choose a die that wins with probability $\ge\frac59$. Letting them choose first is a good idea **for you**.`,
  },
  {
    id: '5.6',
    title: 'When to stop rolling',
    tutorial: 5,
    examGroup: 'Q2',
    topicId: 'l03',
    ref: 'cf. Tutorial 5.6',
    tier: 'core',
    prompt: md`You roll a fair **8-sided** die repeatedly. If it shows 1 you must stop (score 1); otherwise you may stop and score the number shown. Which stopping rule maximises the expected score?`,
    hints: [md`Consider threshold rules "stop as soon as the value is $\ge t$" and compute their value $V_t$.`],
    solution: md`For threshold $t$, the game ends at the first roll that is $1$ or $\ge t$, and the final value is uniform over $\{1\}\cup\{t,\dots,8\}$. So
$$V_t=\frac{1+\sum_{v=t}^8v}{1+(9-t)}.$$
$V_4=\frac{31}6\approx5.17$, $V_5=\frac{27}5=5.4$, $V_6=\frac{22}4=5.5$, $V_7=\frac{16}3\approx5.33$.
**Stop on 6, 7 or 8**, giving expected score 5.5. Consistency check: stopping on 6 is right since $6\ge5.5$, and continuing on 5 is right since $5<5.5$.`,
    rubric: ['Threshold strategy idea', 'Correct value formula', 'Optimum t = 6 with V = 5.5', 'Consistency argument'],
  },
  {
    id: '5.7',
    title: 'Collecting toy cars',
    tutorial: 5,
    examGroup: 'Q2',
    topicId: 'l03',
    ref: 'cf. Tutorial 5.7',
    tier: 'core',
    prompt: md`Each fuel purchase of at least 40 litres gives one of 8 toy cars, uniformly at random. How much fuel do you expect to buy to get (a) all 8 cars, (b) at least 4 different cars?`,
    solution: md`a. Coupon collector: $8H_8=8\left(1+\frac12+\dots+\frac18\right)\approx21.74$ purchases, about $870$ litres.
b. $8\left(\frac18+\frac17+\frac16+\frac15\right)\approx5.08$ purchases, about $203$ litres. The last few cars are the expensive ones.`,
  },
  {
    id: '5.8',
    title: 'Comparing bounds',
    tutorial: 5,
    examGroup: 'Q3',
    topicId: 'l05',
    ref: 'cf. Tutorial 5.8',
    tier: 'core',
    prompt: md`$X$ is the number of sixes in $n$ throws of a fair die. Bound $p=P(X\ge n/3)$ using Markov, Chebyshev and Chernoff.`,
    solution: md`$\mu=\frac n6$ and $\mathrm{Var}=\frac{5n}{36}$.
- Markov: $p\le\frac{n/6}{n/3}=\frac12$.
- Chebyshev: $p\le P(|X-\mu|\ge\frac n6)\le\frac{5n/36}{n^2/36}=\frac5n$.
- Chernoff with $\delta=1$: $p\le e^{-\mu/3}=e^{-n/18}$ (or $(e/4)^{n/6}\approx e^{-0.064n}$ with the stronger form).

Markov is constant, Chebyshev polynomial, Chernoff exponential.`,
    rubric: ['Mean and variance', 'Three bounds correct', 'Comparison of decay rates'],
  },
  {
    id: '5.9',
    title: 'Opinion poll sample size',
    tutorial: 5,
    examGroup: 'Q3',
    topicId: 'l05',
    ref: 'cf. Tutorial 5.9',
    tier: 'extra',
    prompt: md`How many people must we poll so that the sample fraction is within $\pm0.01$ of the true fraction with probability $\ge95\%$? Answer with Chebyshev and with Hoeffding.`,
    solution: md`- Chebyshev with $\mathrm{Var}\le\frac1{4n}$: $\frac1{4n\cdot0.01^2}\le0.05$ gives $n\ge50\,000$.
- Hoeffding: $2e^{-2n\cdot0.0001}\le0.05$ gives $n\ge\frac{\ln40}{0.0002}\approx18\,445$.

(The CLT suggests about $9\,604$, but that is an approximation, not a guarantee.)`,
  },
  {
    id: '5.10',
    title: 'Chebyshev is tight',
    tutorial: 5,
    examGroup: 'Q2',
    topicId: 'l04',
    ref: 'cf. Tutorial 5.10',
    tier: 'extra',
    prompt: md`Find a random variable on $\{-b,0,b\}$ for which Chebyshev's bound $P(|X-EX|\ge b)\le\mathrm{Var}(X)/b^2$ holds with equality.`,
    solution: md`$P(X=b)=P(X=-b)=\frac q2$ and $P(X=0)=1-q$ for any $q\in(0,1]$. Then $E(X)=0$, $\mathrm{Var}(X)=qb^2$, and $P(|X|\ge b)=q=\frac{qb^2}{b^2}$.`,
  },
];

export const t06: Exercise[] = [
  {
    id: '6.1',
    title: 'Mutating virus',
    tutorial: 6,
    examGroup: 'Q4',
    topicId: 'l06',
    ref: 'cf. Tutorial 6.2',
    tier: 'core',
    prompt: md`A virus exists in $N=4$ strains. Each generation it mutates with probability $\alpha=0.2$ to one of the other 3 strains (uniformly). What is the probability that generation 5 has the same strain as generation 0?`,
    hints: [md`Lump the states into "same as the start" vs "different" to get a 2-state chain.`, md`From "same": stay w.p. $1-\alpha$. From "different": move back w.p. $\alpha/(N-1)$.`],
    solution: md`2-state chain: $s\to s$ with probability $0.8$; $d\to s$ with probability $\frac{0.2}3$.
With $p_n=P(\text{same at }n)$: $p_{n+1}=0.8p_n+\frac{0.2}3(1-p_n)$. The fixed point is $\frac14$, so
$$p_n=\tfrac14+\tfrac34\lambda^n,\qquad\lambda=1-\tfrac{\alpha N}{N-1}=1-\tfrac{0.8}3=\tfrac{11}{15}.$$
$p_5=0.25+0.75\cdot(11/15)^5\approx0.25+0.75\cdot0.2121\approx0.409$.`,
    rubric: ['Reduction to 2 states', 'Recurrence', 'Closed form', 'Value ≈ 0.409'],
  },
  {
    id: '6.2',
    title: 'Which processes are Markov chains?',
    tutorial: 6,
    examGroup: 'Q4',
    topicId: 'l06',
    ref: 'cf. Tutorial 6.4',
    tier: 'core',
    prompt: md`$Z_1,Z_2,\dots$ are i.i.d. Bernoulli($p$) and $S_n=Z_1+\dots+Z_n$ ($S_0=0$). Is $(X_n)$ a Markov chain?
a. $X_n=S_n$; b. $X_n=S_n\bmod2$; c. $X_n=Z_{n-1}+Z_n$ (with $Z_0=0$); d. $X_n=(Z_{n-1},Z_n)$.`,
    solution: md`a. **Yes**: $S_{n+1}=S_n+Z_{n+1}$ with $Z_{n+1}$ independent of the past. Moves $+1$ w.p. $p$, stays w.p. $1-p$.
b. **Yes**: it flips w.p. $p$ and stays w.p. $1-p$.
c. **No**: $P(X_{n+1}=2\mid X_n=1,X_{n-1}=2)=0$ (because $X_{n-1}=2$ and $X_n=1$ force $Z_n=0$), but $P(X_{n+1}=2\mid X_n=1,X_{n-1}=0)=p$ (because then $Z_n=1$). The history matters.
d. **Yes**: the pair carries exactly the needed memory. $(a,b)\to(b,c)$ with probability $p^c(1-p)^{1-c}$.`,
    rubric: ['(a), (b) Markov with transitions', 'Counterexample for (c)', '(d) Markov via enlarged state'],
  },
  {
    id: '6.3',
    title: 'Two sixes in a row',
    tutorial: 6,
    examGroup: 'Q4',
    topicId: 'l06',
    ref: 'cf. Tutorial 6.5',
    tier: 'core',
    prompt: md`A fair die is thrown until two consecutive sixes appear. Model this as a DTMC and compute the expected number of throws.`,
    solution: md`States: 0 (last throw not a 6, or start), 1 (last throw was a 6), 2 (done). Mean hitting times of 2:
$k_1=1+\frac56k_0$ and $k_0=1+\frac56k_0+\frac16k_1$.
Substituting, $k_0=1+\frac56k_0+\frac16+\frac5{36}k_0$, so $\frac1{36}k_0=\frac76$ and $k_0=42$.`,
    rubric: ['State space with memory of the last throw', 'Hitting-time equations', 'k₀ = 42'],
  },
  {
    id: '6.4',
    title: 'A die that never repeats',
    tutorial: 6,
    examGroup: 'Q4',
    topicId: 'l07',
    ref: 'cf. Tutorial 6.6',
    tier: 'core',
    prompt: md`A rigged 4-sided die never shows the same number twice in a row; each of the 3 other values has probability $\frac13$. The first roll is 4. What is the expected number of further rolls until 4 shows again?`,
    solution: md`The chain on $\{1,2,3,4\}$ is the random walk on the complete graph $K_4$. It is irreducible and doubly stochastic, so its stationary distribution is uniform, $\pi_4=\frac14$, and the mean return time is $m_4=1/\pi_4=4$.
Directly: from a non-4 state the probability of hitting 4 next is $\frac13$, so $k=3$, and $m_4=1+k=4$.`,
  },
  {
    id: '6.5',
    title: 'Flea on four dogs',
    tutorial: 6,
    examGroup: 'Q4',
    topicId: 'l06',
    ref: 'cf. Tutorial 6.8',
    tier: 'extra',
    prompt: md`A flea jumps each time to one of the **other three** of four dogs, uniformly. Find the probability that it is on its starting dog after $n$ jumps.`,
    solution: md`Let $p_n$ be that probability. Then $p_{n+1}=\frac13(1-p_n)$ with $p_0=1$. The fixed point is $\frac14$, so $p_n-\frac14=(-\frac13)^n\frac34$ and
$$p_n=\tfrac14+\tfrac34\left(-\tfrac13\right)^n.$$
E.g. $p_1=0$, $p_2=\frac13$, and $p_n\to\frac14$.`,
  },
  {
    id: '6.6',
    title: 'Sub-sampling a chain',
    tutorial: 6,
    examGroup: 'Q4',
    topicId: 'l06',
    ref: 'cf. Tutorial 6.9',
    tier: 'extra',
    prompt: md`$(X_n)$ is a DTMC with matrix $P$. Is $Y_n=X_{kn}$ a Markov chain? With which matrix?`,
    solution: md`Yes. By the Markov property of $X$, $P(Y_{n+1}=j\mid Y_n=i,\text{past})=P(X_{k(n+1)}=j\mid X_{kn}=i)=(P^k)_{ij}$, so $(Y_n)$ is a DTMC with matrix $P^k$.`,
  },
];

export const t07: Exercise[] = [
  {
    id: '7.1',
    title: 'Mouse in a house',
    tutorial: 7,
    examGroup: 'Q4',
    topicId: 'l07',
    ref: 'cf. Tutorial 7.1',
    tier: 'core',
    prompt: md`A house has rooms 1–4 with doors 1–2, 1–3, 2–3 and 3–4. At every bell the mouse walks through a uniformly random door of its current room. In the long run, what fraction of time does it spend in each room?`,
    solution: md`Random walk on a graph: $p_{ij}=\frac1{\deg(i)}$ for adjacent rooms. The distribution $\pi_i=\frac{\deg(i)}{2|E|}$ is stationary, because $\sum_i\pi_ip_{ij}=\sum_{i\sim j}\frac1{2|E|}=\pi_j$.
Degrees are $2,2,3,1$ and $|E|=4$, so $\vec\pi=(\frac28,\frac28,\frac38,\frac18)$. The chain is irreducible, so by the ergodic theorem these are the long-run fractions (periodicity does not matter for frequencies).`,
    rubric: ['Transition matrix', 'Stationary distribution (degree formula or solving)', 'Ergodic theorem justification'],
  },
  {
    id: '7.2',
    title: 'Ball-swapping bet',
    tutorial: 7,
    examGroup: 'Q4',
    topicId: 'l07',
    ref: 'cf. Tutorial 7.2',
    tier: 'core',
    prompt: md`Urn A holds 2 white balls and urn B 2 black balls. Each step, one random ball from each urn is swapped. At each step the bank wins 5 if urn A has two white balls and pays 1 otherwise. Is the game fair in the long run?`,
    solution: md`State = number of white balls in A $\in\{0,1,2\}$.
- From 2 or 0 we always move to 1.
- From 1 (A = {W,B}, B = {W,B}): move to 0 w.p. $\frac12\cdot\frac12=\frac14$, to 2 w.p. $\frac14$, stay w.p. $\frac12$.

Cut equations: $\pi_2\cdot1=\pi_1\cdot\frac14$ and $\pi_0=\pi_1\cdot\frac14$, so $\vec\pi=(\frac16,\frac23,\frac16)$.
Mean payoff per step: $5\cdot\frac16-1\cdot\frac56=0$, so the game is **fair** in the long run.`,
    rubric: ['States and transitions', 'Stationary distribution', 'Mean payoff = 0 → fair'],
  },
  {
    id: '7.3',
    title: 'CPU and I/O devices',
    tutorial: 7,
    examGroup: 'Q4',
    topicId: 'l07',
    ref: 'cf. Tutorial 7.3',
    tier: 'core',
    prompt: md`A program is in state 0 (CPU) or state $i\in\{1,2\}$ (I/O on device $i$). From 0 it requests device 1 w.p. $0.3$, device 2 w.p. $0.2$, and otherwise stays (0.5). An I/O state always returns to 0 next. Find the stationary distribution.`,
    solution: md`Cuts around each I/O state: $\pi_i\cdot1=\pi_0q_i$. Normalising: $\pi_0(1+0.3+0.2)=1$, so $\pi_0=\frac23$, $\pi_1=0.2$, $\pi_2=\frac2{15}\approx0.133$.
In general $\pi_0=\frac1{1+\sum_{i\ge1}q_i}=\frac1{2-q_0}$ and $\pi_i=q_i\pi_0$.`,
  },
  {
    id: '7.4',
    title: 'Doubly stochastic matrices',
    tutorial: 7,
    examGroup: 'Q4',
    topicId: 'l07',
    ref: 'cf. Tutorial 7.4',
    tier: 'core',
    prompt: md`$P$ is doubly stochastic (rows **and** columns sum to 1) on $n$ states, and the chain is irreducible. Find its stationary distribution.`,
    solution: md`Try the uniform distribution: $(\frac1n\mathbf 1^TP)_j=\frac1n\sum_iP_{ij}=\frac1n$. It is stationary, and by irreducibility it is the **unique** one.`,
  },
  {
    id: '7.5',
    title: 'Sums modulo 7',
    tutorial: 7,
    examGroup: 'Q4',
    topicId: 'l07',
    ref: 'cf. Tutorial 7.5',
    tier: 'core',
    prompt: md`A fair die is thrown repeatedly; $S_n$ is the running sum. Find $\lim_{n\to\infty}P(S_n\text{ is divisible by }7)$.`,
    solution: md`$S_n\bmod7$ is a DTMC on $\mathbb Z_7$: from $r$ it goes to $r+1,\dots,r+6$, each w.p. $\frac16$.
- Each column also sums to 1, so the matrix is doubly stochastic and $\pi$ is uniform.
- It is irreducible.
- It is aperiodic: there are cycles of length 7 (seven 1s) and 8 (one 2 and six 1s), and $\gcd(7,8)=1$.

So $P(S_n\equiv0)\to\frac17$.`,
    rubric: ['Chain on residues', 'Doubly stochastic → uniform', 'Aperiodicity argument', 'Limit 1/7'],
  },
  {
    id: '7.6',
    title: 'Snakes and ladders',
    tutorial: 7,
    examGroup: 'Q4',
    topicId: 'l06',
    ref: 'cf. Tutorial 7.6',
    tier: 'core',
    prompt: md`A board has squares 0–6; you start on 0 and win on reaching (or passing) 6. Each turn a fair coin moves you 1 (heads) or 2 (tails) squares. Square 4 has a snake back down to 1.
a. What is the expected number of tosses to win?
b. From square 3, what is the probability of winning without hitting the snake?`,
    solution: md`a. States 0,1,2,3,5 (4 redirects to 1). Hitting times: $k_5=1$; $k_3=1+\frac12k_1+\frac12k_5$; $k_2=1+\frac12k_3+\frac12k_1$; $k_1=1+\frac12k_2+\frac12k_3$; $k_0=1+\frac12k_1+\frac12k_2$.
Solving: $k_3=1.5+0.5k_1$ and $k_2=1.75+0.75k_1$, so $k_1=1+0.875+0.375k_1+0.75+0.25k_1$, which gives $k_1=7$. Then $k_2=7$, $k_3=5$, and $k_0=1+3.5+3.5=$ **8**.
b. From 3: heads lands on the snake, tails reaches 5 (from which you surely win). So $\frac12$.`,
    rubric: ['Model with snake redirect', 'Hitting-time equations', 'Correct solution k₀ = 8', '(b) = 1/2'],
  },
  {
    id: '7.7',
    title: 'Bold play',
    tutorial: 7,
    examGroup: 'Q4',
    topicId: 'l06',
    ref: 'cf. Tutorial 7.8',
    tier: 'core',
    prompt: md`A gambler with 3 EUR wants 8 EUR. Each bet on a fair coin doubles the stake or loses it. Strategy: stake everything when holding $\le4$, otherwise stake exactly what is missing to reach 8.
a. What is the probability of reaching 8?
b. What is the expected number of bets?`,
    solution: md`Reachable states: $3\to\{6,0\}$, $6\to\{8,4\}$ (stake 2), $4\to\{8,0\}$.
a. $h_4=\frac12$, $h_6=\frac12+\frac12h_4=\frac34$, $h_3=\frac12h_6=\frac38$. (A fair game keeps the expected wealth constant: $8h_3=3$ ✓.)
b. $k_4=1$, $k_6=1+\frac12k_4=1.5$, $k_3=1+\frac12k_6=1.75$.`,
  },
  {
    id: '7.8',
    title: 'Hitting probabilities and self-loops',
    tutorial: 7,
    examGroup: 'Q4',
    topicId: 'l06',
    ref: 'cf. Tutorial 7.7',
    tier: 'extra',
    prompt: md`States 1–4: from 1 go to 2 or 3 (½ each); from 2 go to 1 (½) or stay at 2 (½); 3 is absorbing; from 4 go to 4 (½) or 1 (½). Compute $h_i=P(\text{reach }3)$. Then remove the self-loop at 2 (redirecting its mass to 1). How do $P$ and $h$ change?`,
    solution: md`$h_3=1$. $h_2=\frac12h_1+\frac12h_2$ gives $h_2=h_1$. $h_1=\frac12h_2+\frac12$, so $h_1=1$, and then $h_2=h_4=1$. Every state reaches 3 almost surely, since 3 is the only BSCC.
Removing the self-loop changes $P$ (now $p_{21}=1$) but **not** $h$: self-loops only change *how long* it takes, not *where* you end up. The hitting **times** do change ($k_2$ decreases).`,
  },
];

export const t08: Exercise[] = [
  {
    id: '8.1',
    title: 'All memoryless policies, two steps',
    tutorial: 8,
    examGroup: 'Q5',
    topicId: 'l08',
    ref: 'cf. Tutorial 8.1',
    tier: 'core',
    prompt: md`MDP with states $s,t$ and actions $a,b$ (rewards on transitions):
- $s$, $a$: $\to s$ (0.6, reward 1), $\to t$ (0.4, reward 3)
- $s$, $b$: $\to s$ (0.9, reward 2), $\to t$ (0.1, reward 6)
- $t$, $a$: $\to s$ (1.0, reward 0)
- $t$, $b$: $\to s$ (0.5, reward 1), $\to t$ (0.5, reward 4)

a. List all deterministic memoryless policies.
b. For each, compute the expected total reward of the first two steps from $s$.`,
    hints: ['First compute the expected one-step reward r(x, act) for every state–action pair.'],
    solution: md`a. There are $2\times2=4$ policies $(\sigma(s),\sigma(t))$: $(a,a),(a,b),(b,a),(b,b)$.
b. Expected one-step rewards: $r(s,a)=0.6+1.2=1.8$, $r(s,b)=1.8+0.6=2.4$, $r(t,a)=0$, $r(t,b)=0.5+2=2.5$. Two-step value $=r(s,\sigma(s))+\sum_{x}P(s,\sigma(s),x)\,r(x,\sigma(x))$:
- $(a,a)$: $1.8+0.6\cdot1.8+0.4\cdot0=2.88$
- $(a,b)$: $1.8+1.08+0.4\cdot2.5=3.88$
- $(b,a)$: $2.4+0.9\cdot2.4+0=4.56$
- $(b,b)$: $2.4+2.16+0.1\cdot2.5=$ **4.81** (best)`,
    rubric: ['Four policies listed', 'Expected immediate rewards', 'Two-step values', 'Best policy (b, b)'],
  },
  {
    id: '8.2',
    title: 'Discounted value and Bellman check',
    tutorial: 8,
    examGroup: 'Q5',
    topicId: 'l08',
    ref: 'cf. Tutorial 8.2',
    tier: 'core',
    prompt: md`For the MDP of 8.1 with $\gamma=0.5$, compute the discounted value of policy $(b,b)$ and verify via the Bellman optimality equations that it is optimal.`,
    solution: md`Policy evaluation:
$V_s=2.4+0.5(0.9V_s+0.1V_t)$ and $V_t=2.5+0.5(0.5V_s+0.5V_t)$, i.e.
$0.55V_s-0.05V_t=2.4$ and $-0.25V_s+0.75V_t=2.5$. Hence $V_s=4.8125$, $V_t=4.9375$.

Bellman check, alternative actions:
- $Q(s,a)=1.8+0.5(0.6\cdot4.8125+0.4\cdot4.9375)\approx4.231<4.8125$
- $Q(t,a)=0+0.5\cdot4.8125\approx2.406<4.9375$

No action improves, so $(b,b)$ is optimal and $V^*=(4.8125,4.9375)$.`,
    rubric: ['Linear Bellman system', 'Correct values', 'Q-values of the alternative actions', 'Optimality conclusion'],
  },
  {
    id: '8.3',
    title: 'Skiing down a triangle',
    tutorial: 8,
    examGroup: 'Q5',
    topicId: 'l08',
    ref: 'cf. Tutorial 8.3',
    tier: 'core',
    prompt: md`A skier descends the triangle below, choosing left-down or right-down at every step, and collects the numbers passed (top included). Formulate this as an MDP and find the best route.
\`\`\`
        5
       3 8
      6 2 4
     1 7 3 9
    4 2 6 1 5
\`\`\``,
    solution: md`**MDP:** states are the cells; actions are L/R (deterministic transitions); the reward is the value of the cell entered; bottom cells are terminal. It is a finite-horizon MDP, so use **backward induction** (dynamic programming), working up from the bottom:
- row 4: $4,2,6,1,5$
- row 3: $1+4=5$, $7+6=13$, $3+6=9$, $9+5=14$
- row 2: $6+13=19$, $2+13=15$, $4+14=18$
- row 1: $3+19=22$, $8+18=26$
- row 0: $5+26=$ **31**

Best route: $5\to8\to4\to9\to5$. Here the greedy choice happens to find the optimum, but in general it does not (a small number may lead to a large one), which is why we use backward induction.`,
    rubric: ['MDP formulation', 'Backward induction table', 'Optimal value 31 and path'],
  },
  {
    id: '8.4',
    title: 'When is patience worth it?',
    tutorial: 8,
    examGroup: 'Q5',
    topicId: 'l08',
    ref: 'cf. Tutorial 8.2b',
    tier: 'core',
    prompt: md`In state $s$, action *stay* gives reward 1 and stays in $s$; action *go* gives reward 0 and moves to an absorbing state $t$ that pays 2 per step. For which discount factors $\gamma$ is *go* optimal?`,
    solution: md`Staying forever is worth $\frac1{1-\gamma}$; going is worth $0+\gamma\frac2{1-\gamma}$. So *go* is better iff $2\gamma>1$, i.e. $\gamma>\frac12$. At $\gamma=\frac12$ both are optimal. Patience pays only when the future is weighted enough.`,
  },
  {
    id: '8.5',
    title: 'Policy improvement theorem',
    tutorial: 8,
    examGroup: 'Q5',
    topicId: 'l08',
    ref: 'cf. Tutorial 8.4',
    tier: 'star',
    prompt: md`Let $\pi'$ be greedy with respect to $V^\pi$. Show $V^{\pi'}(s)\ge V^\pi(s)$ for all $s$.`,
    solution: md`By greediness, $T_{\pi'}V^\pi=\max_aQ^\pi(\cdot,a)\ge Q^\pi(\cdot,\pi(\cdot))=V^\pi$, where $T_{\pi'}V=r_{\pi'}+\gamma P_{\pi'}V$.
$T_{\pi'}$ is monotone ($V\le W\Rightarrow T_{\pi'}V\le T_{\pi'}W$, as $P_{\pi'}\ge0$), so applying it repeatedly gives $V^\pi\le T_{\pi'}V^\pi\le T_{\pi'}^2V^\pi\le\dots$.
$T_{\pi'}$ is a γ-contraction with fixed point $V^{\pi'}$, so $T_{\pi'}^kV^\pi\to V^{\pi'}$. Hence $V^\pi\le V^{\pi'}$.`,
  },
];
