/**
 * Original practice problems written for this app. They follow the topics and
 * difficulty of the official tutorial sheet (referenced via `ref`) but do not
 * reproduce its text or solutions.
 */
import type { Exercise } from '../../../platform/types';

const md = String.raw;

export const t01: Exercise[] = [
  {
    id: '1.1',
    title: 'Choosing sample spaces',
    tutorial: 1,
    examGroup: 'Q1',
    topicId: 'l01',
    ref: 'cf. Tutorial 1.1',
    tier: 'core',
    prompt: md`Describe a suitable sample space for each experiment and give its size.
a. Three chips are taken from a very large lot and each is tested as **good** or **bad**.
b. A box holds 8 chips, exactly 2 of them defective. Two chips are drawn at once (without replacement) and tested.
c. A loop executes an \`if … else\` statement 3 times; we record which branch was taken each time.`,
    hints: ['Ask whether the order matters and whether the individual items are distinguishable.', 'In (b), what we observe may be just the number of defective chips, or the specific pair drawn.'],
    solution: md`a. $S=\{g,b\}^3$, ordered triples, $|S|=8$. If the lot is huge, the draws are effectively independent.
b. If we care which chips we got: $S=\{\{i,j\}\mid1\le i<j\le8\}$ with $|S|=\binom82=28$, all equally likely. If we only record the number of defective chips: $S'=\{0,1,2\}$, which is not uniform: $P(0)=\frac{\binom62}{28}=\frac{15}{28}$, $P(1)=\frac{2\cdot6}{28}=\frac{12}{28}$, $P(2)=\frac1{28}$.
c. $S=\{T,E\}^3$ (then/else per iteration), $|S|=8$. Without more information about the condition, the points need not be equally likely.`,
    rubric: ['Correct structure of each sample space', 'Correct sizes', 'Notes the uniform vs non-uniform distinction in (b)'],
  },
  {
    id: '1.2',
    title: 'Does such a probability space exist?',
    tutorial: 1,
    examGroup: 'Q1',
    topicId: 'l01',
    ref: 'cf. Tutorial 1.2',
    tier: 'core',
    prompt: md`a. Find $c$ such that $P(\{n\})=c\cdot3^{-n}$, $n\in\mathbb N$, defines a probability space on $S=\mathbb N$.
b. Is there a probability space on $S=\mathbb N$ in which all points have the same probability?
c. Is there one on $S=[0,1]$ in which every single point has probability 0?`,
    solution: md`a. $\sum_{n\ge1}3^{-n}=\frac{1/3}{1-1/3}=\frac12$, so $c=2$.
b. No. Equal values $P(\{n\})=q$ give $\sum_nq=0$ if $q=0$ and $\infty$ if $q>0$, never 1. Countable additivity forbids it.
c. Yes: the uniform distribution (Lebesgue measure) on $[0,1]$ with the Borel σ-field. A single point has length 0. Countable additivity only covers *countable* unions, so the uncountably many zero-probability points do not contradict $P(S)=1$.`,
    rubric: ['c = 2 via the geometric series', 'Countable-additivity argument for (b)', 'Correct example and argument for (c)'],
  },
  {
    id: '1.3',
    title: 'Busy servers',
    tutorial: 1,
    examGroup: 'Q1',
    topicId: 'l01',
    ref: 'cf. Tutorial 1.3',
    tier: 'core',
    prompt: md`A cluster has 5 servers. Each is busy with probability $p$, independently. Let
$A$ = "between 2 and 4 servers (inclusive) are busy", $B$ = "an odd number of servers is busy".
Express $P(A)$, $P(B)$ and $P(A\cup B)$ in terms of $p$, and evaluate them for $p=0.3$.`,
    hints: [md`The number of busy servers is $K\sim\mathrm{Bin}(5,p)$.`, md`$A\cup B$ is "$K\ge1$".`],
    solution: md`$K\sim\mathrm{Bin}(5,p)$ with $P(K=k)=\binom5kp^k(1-p)^{5-k}$.
- $P(A)=\sum_{k=2}^4\binom5kp^k(1-p)^{5-k}$.
- $P(B)=P(K\in\{1,3,5\})$.
- $A\cup B=\{K\ge1\}$, so $P(A\cup B)=1-(1-p)^5$.

For $p=0.3$: $P(K=0..5)=0.16807,\ 0.36015,\ 0.3087,\ 0.1323,\ 0.02835,\ 0.00243$. Hence
$P(A)=0.46935$, $P(B)=0.49488$, $P(A\cup B)=0.83193$.
Check with inclusion–exclusion: $A\cap B=\{K=3\}$, and $0.46935+0.49488-0.1323=0.83193$ ✓.`,
    rubric: ['Binomial model identified', 'Correct expressions for A and B', 'Recognises A ∪ B = {K ≥ 1}', 'Correct numbers for p = 0.3'],
  },
  {
    id: '1.4',
    title: 'Tossing until heads',
    tutorial: 1,
    examGroup: 'Q1',
    topicId: 'l01',
    ref: 'cf. Tutorial 1.4',
    tier: 'core',
    prompt: md`A biased coin shows heads with probability $\frac14$. We toss until the first head.
a. Define the sample space and the probability of each sample point.
b. Find the probability that an **even** number of tosses is needed.
c. Find the probability that more than 3 tosses are needed.`,
    solution: md`a. $S=\{H,TH,TTH,\dots\}\cup\{\bot\}$ with $P(T^{k-1}H)=(\frac34)^{k-1}\frac14$ and $P(\bot)=0$ ("never heads"). The σ-field can be $2^S$.
b. $\sum_{j\ge1}(\frac34)^{2j-1}\frac14=\frac14\cdot\frac34\cdot\frac1{1-9/16}=\frac{3}{16}\cdot\frac{16}{7}=\frac37$.
c. The first 3 tosses are all tails: $(\frac34)^3=\frac{27}{64}\approx0.42$.`,
    rubric: ['Sample space incl. the null outcome', 'Geometric series for (b) = 3/7', 'Correct (c) = 27/64'],
  },
  {
    id: '1.5',
    title: 'Two children, one born in December',
    tutorial: 1,
    examGroup: 'Q1',
    topicId: 'l01',
    ref: 'cf. Tutorial 1.5',
    tier: 'core',
    prompt: md`A family has two children; sexes and birth months are independent and uniform (12 months). Find the probability that both are boys given that
a. at least one is a boy;
b. the older one is a boy;
c. at least one is a **boy born in December**.`,
    hints: ['Each child is a pair (sex, month): 24 equally likely types per child, 576 pairs in total.'],
    solution: md`a. $\frac{1/4}{3/4}=\frac13$. b. $\frac12$.
c. Count ordered pairs of (sex, month). "At least one December boy" has $24+24-1=47$ pairs out of $576$. Among them, both boys: pairs (boy, boy) with at least one December, i.e. $12+12-1=23$. So $P=\frac{23}{47}\approx0.489$.
In general, with a trait of probability $1/k$ the answer is $\frac{2k-1}{4k-1}$, which moves from $\frac13$ toward $\frac12$ as the extra information becomes more specific.`,
    rubric: ['(a) 1/3 and (b) 1/2', 'Correct conditioning event count 47', 'Correct favourable count 23 → 23/47'],
  },
  {
    id: '1.6',
    title: 'Proving independence',
    tutorial: 1,
    examGroup: 'Q1',
    topicId: 'l01',
    ref: 'cf. Tutorial 1.6',
    tier: 'core',
    prompt: md`A fair die is thrown. Let $E=\{2,3,5\}$ and $F=\{1,2,3,4\}$. Prove that $E$ and $F$ are independent. Is $E$ independent of $G=\{1,2,3\}$?`,
    solution: md`$P(E)=\frac12$, $P(F)=\frac23$, and $E\cap F=\{2,3\}$, so $P(E\cap F)=\frac13=\frac12\cdot\frac23$ ✓ independent.
$P(G)=\frac12$ and $E\cap G=\{2,3\}$, so $P(E\cap G)=\frac13\ne\frac14$: dependent.`,
  },
  {
    id: '1.7',
    title: 'Dependencies among dice events',
    tutorial: 1,
    examGroup: 'Q1',
    topicId: 'l01',
    ref: 'cf. Tutorial 1.7',
    tier: 'extra',
    prompt: md`Two fair dice are thrown. $A$ = "sum is 7", $B$ = "first die shows 3", $C$ = "sum is 8". Decide which pairs among $A,B,C$ are independent.`,
    solution: md`$P(A)=\frac16$, $P(B)=\frac16$, $P(C)=\frac5{36}$.
- $A\cap B=\{(3,4)\}$: $\frac1{36}=\frac16\cdot\frac16$, so independent. (A sum of 7 is reachable from every first face.)
- $B\cap C=\{(3,5)\}$: $\frac1{36}\ne\frac16\cdot\frac5{36}$, so dependent.
- $A\cap C=\emptyset$ with positive probabilities: dependent (disjoint events).`,
  },
  {
    id: '1.8',
    title: 'Randomised polynomial identity test',
    tutorial: 1,
    examGroup: 'Q1',
    topicId: 'l01',
    ref: 'cf. Tutorial 1.10',
    tier: 'extra',
    prompt: md`To test whether polynomials $P\equiv Q$ of degree $\le d$, pick $r$ uniformly from $\{1,\dots,50d\}$ and answer YES iff $P(r)=Q(r)$.
a. Bound the probability of a wrong answer.
b. How many independent repetitions guarantee error $\le10^{-6}$?`,
    solution: md`a. If $P\equiv Q$ the answer is always right. Otherwise $P-Q\not\equiv0$ has at most $d$ roots, so $P(\text{wrong})\le\frac{d}{50d}=\frac1{50}$. (One-sided error.)
b. Answer YES only if all $k$ runs say YES: error $\le(\frac1{50})^k\le10^{-6}\iff k\ge\frac{6}{\log_{10}50}\approx3.53$, so $k=4$.`,
  },
  {
    id: '1.9',
    title: 'Union of three events',
    tutorial: 1,
    examGroup: 'Q1',
    topicId: 'l01',
    ref: 'cf. Tutorial 1.14',
    tier: 'extra',
    prompt: md`Using only the axioms and $P(A\cup B)=P(A)+P(B)-P(A\cap B)$, derive inclusion–exclusion for three events.`,
    solution: md`$P(A\cup B\cup C)=P(A\cup B)+P(C)-P((A\cup B)\cap C)$. By distributivity, $(A\cup B)\cap C=(A\cap C)\cup(B\cap C)$, so
$P((A\cup B)\cap C)=P(A\cap C)+P(B\cap C)-P(A\cap B\cap C)$. Substituting:
$$P(A\cup B\cup C)=P(A)+P(B)+P(C)-P(A\cap B)-P(A\cap C)-P(B\cap C)+P(A\cap B\cap C).$$`,
  },
];

export const t02: Exercise[] = [
  {
    id: '2.1',
    title: 'Screening test',
    tutorial: 2,
    examGroup: 'Q1',
    topicId: 'l01',
    ref: 'cf. Tutorial 2.1',
    tier: 'core',
    prompt: md`A screening test has a false positive rate of 4% and a false negative rate of 1%. The prevalence of the condition is 2%. Given a positive result, what is the probability that the person has the condition?`,
    hints: ['Sensitivity = 1 − false negative rate.', 'Use total probability for P(+), then Bayes.'],
    solution: md`$P(+\mid I)=0.99$, $P(+\mid\overline I)=0.04$, $P(I)=0.02$.
$P(+)=0.99\cdot0.02+0.04\cdot0.98=0.0198+0.0392=0.059$.
$P(I\mid+)=\frac{0.0198}{0.059}\approx0.336$. Even after a positive result, the condition is more likely absent: a base-rate effect.`,
    rubric: ['Correct translation of FP/FN rates', 'Total probability P(+) = 0.059', 'Bayes → ≈ 0.336', 'Interpretation (base rate)'],
  },
  {
    id: '2.2',
    title: 'Three suppliers',
    tutorial: 2,
    examGroup: 'Q1',
    topicId: 'l01',
    ref: 'cf. Tutorial 2.2',
    tier: 'core',
    prompt: md`A shop buys 50%, 30% and 20% of its stock from suppliers $S_1,S_2,S_3$, with defect rates 2%, 3% and 6%.
a. What fraction of the stock is defective?
b. Given a defective item, find the probability of each supplier.`,
    solution: md`a. $P(D)=0.5\cdot0.02+0.3\cdot0.03+0.2\cdot0.06=0.01+0.009+0.012=0.031$.
b. $P(S_1\mid D)=\frac{0.01}{0.031}\approx0.323$, $P(S_2\mid D)=\frac{0.009}{0.031}\approx0.290$, $P(S_3\mid D)=\frac{0.012}{0.031}\approx0.387$.
The smallest supplier is the most likely source of a defect.`,
    rubric: ['Total probability 0.031', 'All three posteriors correct', 'Posteriors sum to 1'],
  },
  {
    id: '2.3',
    title: 'Is "independent" an equivalence?',
    tutorial: 2,
    examGroup: 'Q1',
    topicId: 'l01',
    ref: 'cf. Tutorial 2.3',
    tier: 'core',
    prompt: md`Define $A\sim B$ iff $A$ and $B$ are independent. Is $\sim$ reflexive, symmetric, transitive? Prove or give counterexamples.`,
    solution: md`- **Symmetric:** yes, since $P(A\cap B)=P(A)P(B)$ is symmetric in $A,B$.
- **Reflexive:** no. $A\sim A\iff P(A)=P(A)^2\iff P(A)\in\{0,1\}$; e.g. a fair coin's "heads" is not independent of itself.
- **Transitive:** no. Take $B=S$, which is independent of everything, and $A=C$ = "heads": then $A\sim S$ and $S\sim C$, but $A\not\sim C$.`,
    rubric: ['Symmetric proved', 'Reflexivity counterexample', 'Transitivity counterexample'],
  },
  {
    id: '2.4',
    title: 'Independence and complements',
    tutorial: 2,
    examGroup: 'Q1',
    topicId: 'l01',
    ref: 'cf. Tutorial 2.4',
    tier: 'core',
    prompt: md`Prove: if $A$ and $B$ are independent, then so are $A$ and $\overline B$, and also $\overline A$ and $\overline B$.`,
    solution: md`$A$ is the disjoint union of $A\cap B$ and $A\cap\overline B$, so
$$P(A\cap\overline B)=P(A)-P(A\cap B)=P(A)-P(A)P(B)=P(A)(1-P(B))=P(A)P(\overline B).$$
Applying the same step to the independent pair $\overline B, A$ (with the roles swapped) gives $\overline A\perp\overline B$.`,
  },
  {
    id: '2.5',
    title: 'Symptoms, disease and a test',
    tutorial: 2,
    examGroup: 'Q1',
    topicId: 'l02',
    ref: 'cf. Tutorial 2.5',
    tier: 'core',
    prompt: md`10% of a population has a disease. 20% of the ill have **no** symptoms, while 5% of the healthy **do** have symptoms. A test has an 8% false positive rate (regardless of symptoms). Its false negative rate is 4% for symptomatic and 12% for asymptomatic ill people.
A randomly chosen person **has symptoms**.
a. What is the probability that the person is ill?
b. What is the probability that the person tests positive?`,
    hints: ['Condition everything on "symptoms" (S).', md`Use the conditional total probability $P(+\mid S)=P(+\mid I\cap S)P(I\mid S)+P(+\mid\overline I\cap S)P(\overline I\mid S)$.`],
    solution: md`a. $P(S)=0.1\cdot0.8+0.9\cdot0.05=0.08+0.045=0.125$, so $P(I\mid S)=\frac{0.08}{0.125}=0.64$.
b. $P(+\mid I\cap S)=0.96$ and $P(+\mid\overline I\cap S)=0.08$. Hence
$P(+\mid S)=0.96\cdot0.64+0.08\cdot0.36=0.6144+0.0288=0.6432$.
(The asymptomatic false negative rate is irrelevant here, since we condition on symptoms.)`,
    rubric: ['P(S) = 0.125 via total probability', 'P(I | S) = 0.64', 'Conditional total probability for (b)', 'Correct value 0.6432'],
  },
  {
    id: '2.6',
    title: 'What determines a joint distribution?',
    tutorial: 2,
    examGroup: 'Q1',
    topicId: 'l02',
    ref: 'cf. Tutorial 2.6',
    tier: 'core',
    prompt: md`For random variables $X,Y,Z$, which pieces of information are **in general** enough to determine the joint distribution $P(X,Y,Z)$?
a. $P(X)$, $P(Y\mid X)$, $P(Z\mid X,Y)$
b. $P(X)$, $P(Y\mid X)$, $P(Z\mid Y)$
c. $P(X,Y)$ and $P(Z\mid X,Y)$
d. $P(X)$, $P(Y)$, $P(Z)$`,
    solution: md`a. **Yes**, by the chain rule $P(x,y,z)=P(x)P(y\mid x)P(z\mid x,y)$.
b. **No** in general. It works only if $Z$ is conditionally independent of $X$ given $Y$ (a Markov chain $X\to Y\to Z$).
c. **Yes**: $P(x,y,z)=P(x,y)P(z\mid x,y)$.
d. **No.** Marginals only determine the joint distribution under mutual independence.`,
  },
  {
    id: '2.7',
    title: 'Did the student really know?',
    tutorial: 2,
    examGroup: 'Q1',
    topicId: 'l01',
    ref: 'cf. Tutorial 2.9',
    tier: 'extra',
    prompt: md`A test question has 4 options. A student knows the answer with probability 0.6. With probability 0.3 they can eliminate one wrong option and guess among the remaining 3. Otherwise they guess among all 4.
a. What is the probability of a correct answer?
b. Given a correct answer, what is the probability that the student knew it?`,
    solution: md`a. $0.6\cdot1+0.3\cdot\frac13+0.1\cdot\frac14=0.6+0.1+0.025=0.725$.
b. $\frac{0.6}{0.725}\approx0.828$.`,
  },
  {
    id: '2.8',
    title: 'Waiting for a six',
    tutorial: 2,
    examGroup: 'Q1',
    topicId: 'l02',
    ref: 'cf. Tutorials 2.10–2.11',
    tier: 'extra',
    prompt: md`A die is thrown until the first 6; let $X$ be the number of throws.
a. Find $P(X\ge3\mid X\ge2)$.
b. Given that $X$ is even, find $P(X=2)$.`,
    solution: md`a. By memorylessness, $P(X\ge3\mid X\ge2)=P(X\ge2)=\frac56$.
b. $P(X\text{ even})=\sum_{j\ge1}(\frac56)^{2j-1}\frac16=\frac{5/36}{1-25/36}=\frac5{11}$. Then $P(X=2\mid\text{even})=\frac{5/36}{5/11}=\frac{11}{36}\approx0.306$.`,
  },
];

export const t03: Exercise[] = [
  {
    id: '3.1',
    title: 'Working with a joint table',
    tutorial: 3,
    examGroup: 'Q1',
    topicId: 'l02',
    ref: 'cf. Tutorial 3.1',
    tier: 'core',
    prompt: md`The joint PMF of $X\in\{1,2,3\}$ and $Y\in\{1,2\}$ is

| | $Y=1$ | $Y=2$ |
|---|---|---|
| $X=1$ | 0.10 | 0.20 |
| $X=2$ | 0.25 | 0.15 |
| $X=3$ | 0.20 | 0.10 |

Compute: a. $P(X\le2)$; b. $P(X+Y\text{ even})$; c. $E(X)$ and $E(Y)$; d. $E(X\mid Y=2)$; e. are $X,Y$ independent?`,
    solution: md`a. $0.1+0.2+0.25+0.15=0.7$.
b. Even sums: $(1,1),(2,2),(3,1)$, giving $0.1+0.15+0.2=0.45$.
c. $p_X=(0.3,0.4,0.3)$, so $E(X)=0.3+0.8+0.9=2$. $p_Y=(0.55,0.45)$, so $E(Y)=1.45$.
d. $E(X\mid Y=2)=\frac{1\cdot0.2+2\cdot0.15+3\cdot0.1}{0.45}=\frac{0.8}{0.45}\approx1.778$.
e. $P(X=1,Y=1)=0.1\ne0.3\cdot0.55=0.165$, so they are **dependent**.`,
    rubric: ['Marginals correct', 'Probabilities in (a), (b)', 'Expectations incl. conditional', 'Independence decided with a witness cell'],
  },
  {
    id: '3.2',
    title: 'Playing a hard game',
    tutorial: 3,
    examGroup: 'Q2',
    topicId: 'l03',
    ref: 'cf. Tutorial 3.2',
    tier: 'core',
    prompt: md`You win a game with probability $\frac18$, independently each time.
a. Over 8 games, what is the probability of winning at most once?
b. Over 8 games, what is the expected number of wins?
c. What is the expected number of games up to and including the first win?`,
    solution: md`a. $(\frac78)^8+8\cdot\frac18(\frac78)^7=(\frac78)^7(\frac78+1)=(\frac78)^7\cdot\frac{15}8\approx0.736$.
b. Binomial mean $8\cdot\frac18=1$.
c. Geometric mean $1/p=8$.`,
    rubric: ['Binomial model for (a)', 'Correct value ≈ 0.736', 'Means 1 and 8'],
  },
  {
    id: '3.3',
    title: 'CDF of the first success',
    tutorial: 3,
    examGroup: 'Q1',
    topicId: 'l02',
    ref: 'cf. Tutorial 3.3',
    tier: 'core',
    prompt: md`A coin shows heads with probability $p$; $T$ is the toss of the first head. Write $F_T$ and use it to compute the probability that the first head appears at toss 3, 4 or 5, **or** later than toss 8. Evaluate for $p=0.3$.`,
    solution: md`$F_T(k)=1-(1-p)^{\lfloor k\rfloor}$ for $k\ge0$. Then
$$P(3\le T\le5)+P(T>8)=[F(5)-F(2)]+[1-F(8)]=(1-p)^2-(1-p)^5+(1-p)^8.$$
For $p=0.3$: $0.49-0.16807+0.05765\approx0.3796$.`,
  },
  {
    id: '3.4',
    title: 'Markov is tight',
    tutorial: 3,
    examGroup: 'Q2',
    topicId: 'l03',
    ref: 'cf. Tutorial 3.4',
    tier: 'core',
    prompt: md`For a given integer $k\ge1$, construct a non-negative random variable $X$ with $P(X\ge kE(X))=\frac1k$.`,
    solution: md`Let $X=k$ with probability $\frac1k$ and $X=0$ otherwise. Then $E(X)=1$ and $P(X\ge k\cdot1)=\frac1k=\frac{E(X)}{k}$, so Markov holds with equality. All the mass is at either 0 or exactly the threshold, which is the extreme case in the proof ($X=Y_t$).`,
  },
  {
    id: '3.5',
    title: 'Expectation of a ratio',
    tutorial: 3,
    examGroup: 'Q2',
    topicId: 'l03',
    ref: 'cf. Tutorial 3.5',
    tier: 'core',
    prompt: md`Prove or disprove: if $X$ and $Y>0$ are independent, then $E(X/Y)=E(X)/E(Y)$.`,
    solution: md`**False** in general. By independence $E(X/Y)=E(X)E(1/Y)$, and by Jensen ($1/y$ is convex on $(0,\infty)$) $E(1/Y)\ge1/E(Y)$.
Counterexample: $X\equiv1$, $Y$ uniform on $\{1,3\}$. Then $E(X/Y)=\frac12(1+\frac13)=\frac23$ but $E(X)/E(Y)=\frac12$.`,
  },
  {
    id: '3.6',
    title: 'Mean vs median of an investment',
    tutorial: 3,
    examGroup: 'Q2',
    topicId: 'l03',
    ref: 'cf. Tutorial 3.7',
    tier: 'extra',
    prompt: md`Each year, option A multiplies your money by 1.2 or 0.85, and option B by 1.5 or 0.6, each with probability ½, independently across years and options.
a. Expected value and (for even $n$) median of 1 EUR after $n$ years, for each option.
b. If you rebalance to 50/50 every year, what is the typical (median) annual growth factor?`,
    solution: md`a. Means: A $1.025^n$, B $1.05^n$. Medians (half up, half down): A $(1.2\cdot0.85)^{n/2}=1.02^{n/2}\approx1.00995^n$; B $(1.5\cdot0.6)^{n/2}=0.9^{n/2}\approx0.9487^n$. So **B has the higher mean but its median shrinks**: rare huge wins drive the mean.
b. The yearly factor is $\frac{a+b}2\in\{1.35,0.9,1.175,0.725\}$, each with probability ¼. The typical growth is the geometric mean $(1.35\cdot0.9\cdot1.175\cdot0.725)^{1/4}\approx1.0086$. Rebalancing beats either option alone in the median, because mixing reduces variance (a "volatility harvesting" effect).`,
  },
  {
    id: '3.7',
    title: 'Pairwise but not mutually independent bits',
    tutorial: 3,
    examGroup: 'Q1',
    topicId: 'l02',
    ref: 'cf. Tutorial 3.8',
    tier: 'extra',
    prompt: md`$B_1,B_2$ are independent fair bits and $B_3=B_1\oplus B_2$. Show that $B_1,B_2,B_3$ are pairwise independent but not mutually independent.`,
    solution: md`Each $B_i$ is a fair bit. For the pair $(B_1,B_3)$: $P(B_1=a,B_3=c)=P(B_1=a,B_2=a\oplus c)=\frac14$ for all $a,c$, so the pair is independent; the same holds for every pair. But $P(B_1=B_2=B_3=1)=0$ ($1\oplus1=0$), while the product of marginals is $\frac18$.`,
  },
  {
    id: '3.8',
    title: 'Random graphs',
    tutorial: 3,
    examGroup: 'Q2',
    topicId: 'l03',
    ref: 'cf. Tutorial 3.9',
    tier: 'extra',
    prompt: md`In $G(v,p)$ each of the $\binom v2$ edges is present independently with probability $p$. Find the expected number of edges and of triangles. What is the expected number of edges of a uniformly random labelled graph on $v$ vertices?`,
    solution: md`Edges: $p\binom v2$ by linearity over edge indicators. Triangles: $p^3\binom v3$ (each triple needs its 3 edges).
A uniform labelled graph is exactly $G(v,\frac12)$, since every one of the $2^{\binom v2}$ graphs has probability $2^{-\binom v2}$. So the expected number of edges is $\frac12\binom v2$.`,
  },
];

export const t04: Exercise[] = [
  {
    id: '4.1',
    title: 'Guests and rooms',
    tutorial: 4,
    examGroup: 'Q2',
    topicId: 'l03',
    ref: 'cf. Tutorial 4.1',
    tier: 'core',
    prompt: md`6 guests independently and uniformly choose one of 4 rooms.
a. What is the probability that all of them are in one room?
b. What is the probability that exactly two rooms are occupied?
c. What is the expected number of empty rooms?`,
    solution: md`a. $4\cdot4^{-6}=\frac1{1024}$.
b. Choose the 2 rooms ($\binom42=6$ ways); the number of assignments using both is $2^6-2=62$. So $\frac{6\cdot62}{4^6}=\frac{372}{4096}\approx0.0908$.
c. Indicators: room $j$ is empty with probability $(\frac34)^6$, so the expectation is $4(\frac34)^6\approx0.712$.`,
    rubric: ['(a) correct', 'Surjection count 2⁶ − 2 in (b)', 'Indicator + linearity for (c)', 'Correct numeric answers'],
  },
  {
    id: '4.2',
    title: 'Collecting all faces',
    tutorial: 4,
    examGroup: 'Q2',
    topicId: 'l03',
    ref: 'cf. Tutorial 4.2',
    tier: 'core',
    prompt: md`A fair **4-sided** die is rolled until every face has appeared. What is the expected number of rolls?`,
    hints: ['Split the process into phases: the time to see a new face when i faces are already known is geometric.'],
    solution: md`With $i$ faces seen, a new face appears with probability $\frac{4-i}4$, so that phase lasts on average $\frac4{4-i}$ rolls. Summing:
$$4\Big(1+\tfrac12+\tfrac13+\tfrac14\Big)=4\cdot\tfrac{25}{12}=\tfrac{25}3\approx8.33.$$
In general, $n$ faces need $nH_n$ rolls on average (coupon collector).`,
    rubric: ['Decomposition into geometric phases', 'Linearity of expectation', '25/3'],
  },
  {
    id: '4.3',
    title: 'Variance of discrete uniforms',
    tutorial: 4,
    examGroup: 'Q2',
    topicId: 'l04',
    ref: 'cf. Tutorial 4.3',
    tier: 'core',
    prompt: md`a. $X$ is uniform on $\{1,\dots,n\}$; compute $\mathrm{Var}(X)$.
b. $Y$ is uniform on $\{-k,\dots,k\}$; compute $\mathrm{Var}(Y)$.`,
    solution: md`a. $E(X)=\frac{n+1}2$ and $E(X^2)=\frac{(n+1)(2n+1)}6$, so
$\mathrm{Var}(X)=\frac{(n+1)(2n+1)}6-\frac{(n+1)^2}4=\frac{n^2-1}{12}$.
b. $Y$ is $X-(k+1)$ with $n=2k+1$, and shifting does not change the variance: $\frac{(2k+1)^2-1}{12}=\frac{k(k+1)}3$. (Directly: $E(Y)=0$, $E(Y^2)=\frac{2}{2k+1}\cdot\frac{k(k+1)(2k+1)}6$.)`,
  },
  {
    id: '4.4',
    title: 'Sum of 50 dice',
    tutorial: 4,
    examGroup: 'Q2',
    topicId: 'l04',
    ref: 'cf. Tutorial 4.4',
    tier: 'core',
    prompt: md`$X$ is the sum of 50 fair dice. Bound $P(X\ge210)$ using (a) Markov, (b) Chebyshev.`,
    solution: md`$E(X)=175$ and $\mathrm{Var}(X)=50\cdot\frac{35}{12}\approx145.8$.
a. $P(X\ge210)\le\frac{175}{210}\approx0.833$.
b. $P(X-175\ge35)\le P(|X-175|\ge35)\le\frac{145.8}{35^2}\approx0.119$.
(The true value is about 0.002, as the CLT suggests: $35/\sqrt{145.8}\approx2.9\sigma$.)`,
    rubric: ['Mean and variance', 'Markov bound', 'Chebyshev bound with the correct deviation'],
  },
  {
    id: '4.5',
    title: 'Underdog in a tournament',
    tutorial: 4,
    examGroup: 'Q2',
    topicId: 'l03',
    ref: 'cf. Tutorial 4.5',
    tier: 'core',
    prompt: md`Bob wins each game with probability 0.3, independently. In a tournament of $2n+1$ games Bob needs $\ge n+1$ wins. Bound his chance with Markov, evaluate for $n=5$, and compare with the exact value.`,
    solution: md`$W\sim\mathrm{Bin}(2n+1,0.3)$, so $E(W)=0.3(2n+1)$ and Markov gives $P(W\ge n+1)\le\frac{0.3(2n+1)}{n+1}<0.6$.
For $n=5$: bound $\frac{3.3}6=0.55$; exact $P(\mathrm{Bin}(11,0.3)\ge6)\approx0.078$.
Markov never goes below about $0.6$, even though the true probability tends to 0 exponentially.`,
  },
  {
    id: '4.6',
    title: 'Hats by colour',
    tutorial: 4,
    examGroup: 'Q2',
    topicId: 'l03',
    ref: 'cf. Tutorial 4.6',
    tier: 'core',
    prompt: md`60 people drop their hats in a box and later each takes a uniformly random hat (a random permutation). 30 hats are black, 20 white and 10 grey.
a. What is the expected number of people who get their **own** hat?
b. What is the expected number who get a hat of their **own colour**?`,
    solution: md`a. By indicators, each person gets their own hat with probability $\frac1{60}$, giving $1$.
b. A person whose hat has colour $c$ gets colour $c$ with probability $\frac{n_c}{60}$. So
$\sum_cn_c\cdot\frac{n_c}{60}=\frac{900+400+100}{60}=\frac{1400}{60}\approx23.3$.`,
  },
  {
    id: '4.7',
    title: 'Variance of a product',
    tutorial: 4,
    examGroup: 'Q2',
    topicId: 'l04',
    ref: 'cf. Tutorial 4.9',
    tier: 'extra',
    prompt: md`$X,Y$ are independent with $E(X^2)=1$, $E(X^4)=3$, $E(Y)=0$, $E(Y^2)=2$. Compute $\mathrm{Var}(X^2Y)$.`,
    solution: md`$X^2$ and $Y$ are independent. $E(X^2Y)=E(X^2)E(Y)=0$ and $E(X^4Y^2)=E(X^4)E(Y^2)=6$, so $\mathrm{Var}=6-0=6$.`,
  },
  {
    id: '4.8',
    title: 'Functions of independent variables',
    tutorial: 4,
    examGroup: 'Q2',
    topicId: 'l03',
    ref: 'cf. Tutorial 4.8',
    tier: 'extra',
    prompt: md`Prove that if $X\perp Y$ then $f(X)\perp Y$ for every function $f$. Does the converse hold?`,
    solution: md`$P(f(X)=a,Y=b)=P(X\in f^{-1}(a),Y=b)=P(X\in f^{-1}(a))P(Y=b)=P(f(X)=a)P(Y=b)$, using that independent variables give independent events $[X\in A]$, $[Y\in B]$.
The converse is false: a constant $f$ makes $f(X)$ independent of everything, including $Y=X$.`,
  },
];
