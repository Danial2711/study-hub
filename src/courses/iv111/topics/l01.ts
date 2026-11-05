import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l01: Topic = {
  id: 'l01',
  lecture: 1,
  examGroup: 'Q1',
  title: 'Probability spaces, events & conditional probability',
  summary: md`Sample spaces, events as sets, the axioms of a probability space $(S,\mathcal F,P)$, conditional probability, independence, the law of total probability and Bayes' rule.`,
  sections: [
    {
      id: 'sample-space',
      title: 'Random experiments and sample spaces',
      kind: 'definition',
      body: md`A **random experiment** models a situation whose outcome is uncertain, whether because of real chance or because we don't know enough. One execution of it is a **trial**.

The **sample space** $S$ is the (non-empty) set of possible outcomes. Its elements are **sample points**. Every outcome you consider must be described by **exactly one** sample point.

| experiment | sample space | size |
|---|---|---|
| coin flip | $\{H,T\}$ | finite |
| roll of a die | $\{1,\dots,6\}$ | finite |
| flips until the first head | $\{H, TH, TTH, \dots\}\cup\{\bot\}$ | countable |
| spam/ham sequence of a day | $\{S,H\}^*$ | countable |
| fraction of a day spent on social media | $(0,1)$ | uncountable |

Finite and countable spaces are **discrete**; uncountable ones are **continuous**.

> The sample space is not determined by the experiment alone. It also depends on the *purpose*: for two coins you may record the ordered pair $(H,T)$ or only the number of heads.`,
    },
    {
      id: 'events',
      title: 'Events and the algebra of events',
      kind: 'definition',
      body: md`An **event** is a subset $A \subseteq S$. Since events are sets, set operations build new events:

- $\overline{A}$ (also $A^c$) is the complement: "$A$ does not occur";
- $A\cap B$: both occur; $A\cup B$: at least one occurs; $A\subseteq B$: $A$ implies $B$;
- $\emptyset$ is the *null* (impossible) event, $S$ the *universal* (certain) event, and $\{s\}$ an *elementary* event.

The laws of the algebra of events are **commutativity**, **associativity**, **distributivity**, **identity** ($A\cup\emptyset=A$, $A\cap S=A$) and **complement** ($A\cup\overline A=S$, $A\cap\overline A=\emptyset$). Everything else follows from them, including **De Morgan's laws** $\overline{A\cup B}=\overline A\cap\overline B$ and $\overline{A\cap B}=\overline A\cup\overline B$.

Two kinds of collections of events matter:

- **Mutually exclusive** (disjoint) events: $A_i\cap A_j=\emptyset$ for all $i\ne j$.
- **Collectively exhaustive** events: $A_1\cup\dots\cup A_n=S$.

A collection that is both is a **partition** of $S$. Every partition can serve as an alternative (coarser) sample space.`,
      viz: [{ id: 'venn' }],
    },
    {
      id: 'probability-space',
      title: 'Probability space',
      kind: 'definition',
      body: md`It is tempting to give a probability to *every* subset of $S$. For uncountable $S$ (e.g. the uniform distribution on $[0,1]$) this is impossible: using the axiom of choice one can build a **non-measurable** set $H$ whose shifted copies $H\oplus r$, $r\in\mathbb Q\cap[0,1)$, partition $[0,1)$. Countable additivity would then force $1=\sum_r P(H)$, which no value of $P(H)$ satisfies.

So we only measure the sets in a **σ-field** $\mathcal F\subseteq 2^S$, a family that:

1. contains $\emptyset$,
2. is closed under complement ($A\in\mathcal F\Rightarrow \overline A\in\mathcal F$),
3. is closed under **countable** unions.

The largest σ-field is $2^S$ and the smallest is $\{\emptyset,S\}$.`,
      formulas: [
        {
          id: 'prob-space',
          name: 'Probability space (Kolmogorov axioms)',
          tex: md`(S,\mathcal F,P):\quad P:\mathcal F\to[0,1],\quad P(S)=1,\quad P\Big(\bigcup_{i=1}^\infty A_i\Big)=\sum_{i=1}^\infty P(A_i)\ \text{for pairwise disjoint } A_i`,
          symbols: [
            { sym: 'S', meaning: 'sample space: all possible outcomes' },
            { sym: md`\mathcal F`, meaning: 'σ-field: the events we are allowed to measure' },
            { sym: 'P', meaning: 'probability function on events' },
          ],
          intuition: 'Probability behaves like mass: the total mass is 1, and the mass of a disjoint union is the sum of the masses. Countable (not only finite) additivity is what makes limits, infinite sequences of coin flips, etc. work.',
          conditions: md`For a **discrete** $S$ you can take $\mathcal F=2^S$ and just assign $P(\{s\})$ to every sample point, with $\sum_s P(\{s\})=1$. Then $P(A)=\sum_{s\in A}P(\{s\})$.`,
          pitfalls: md`Finite additivity alone is **not** enough. And for continuous spaces the σ-field cannot be all of $2^S$.`,
        },
      ],
      examples: [
        {
          title: 'Is there such a space?',
          problem: md`Can we have $S=\mathbb N$ with $P(\{n\})=0$ for all $n$?`,
          solution: md`No. By countable additivity, $1=P(S)=\sum_{n\in\mathbb N}P(\{n\})=0$, a contradiction. (On $S=\mathbb R$, however, $P(\{r\})=0$ for every $r$ is fine, e.g. the uniform distribution on $[0,1]$: there are uncountably many points, and countable additivity says nothing about uncountable unions.)`,
        },
      ],
    },
    {
      id: 'properties',
      title: 'Basic properties of probability',
      kind: 'theorem',
      body: md`Everything below follows from the axioms alone.`,
      formulas: [
        {
          id: 'complement',
          name: 'Empty set and complement',
          tex: md`P(\emptyset)=0,\qquad P(\overline A)=1-P(A)`,
          intuition: md`$S=S\cup\emptyset$ is a disjoint union, so $1=1+P(\emptyset)$. Likewise $S=A\cup\overline A$ gives $1=P(A)+P(\overline A)$.`,
          conditions: 'Use the complement whenever "at least one" is asked: P(at least one) = 1 − P(none).',
        },
        {
          id: 'union',
          name: 'Union of two events',
          tex: md`P(A\cup B)=P(A)+P(B)-P(A\cap B)`,
          intuition: md`Adding $P(A)+P(B)$ counts the overlap twice, so we subtract it once.`,
          pitfalls: md`$P(A\cup B)=P(A)+P(B)$ holds **only** for disjoint events.`,
        },
        {
          id: 'inclusion-exclusion',
          name: 'Inclusion–exclusion',
          tex: md`P\Big(\bigcup_{i=1}^n A_i\Big)=\sum_i P(A_i)-\sum_{i<j}P(A_i\cap A_j)+\sum_{i<j<k}P(A_i\cap A_j\cap A_k)-\dots+(-1)^{n-1}P(A_1\cap\dots\cap A_n)`,
          intuition: 'Alternately add and subtract the intersections of 1, 2, 3, … events so that every outcome is counted exactly once.',
          conditions: 'Useful for "at least one of several overlapping events", e.g. derangements (nobody gets their own card back).',
        },
      ],
      proof: md`Write $A\cup B = A \cup (B\setminus A)$ as a disjoint union, so $P(A\cup B)=P(A)+P(B\setminus A)$. Also $B=(B\setminus A)\cup(A\cap B)$ is disjoint, so $P(B\setminus A)=P(B)-P(A\cap B)$. Substituting gives the formula. Inclusion–exclusion follows by induction on $n$.`,
      examples: [
        {
          title: 'Derangements (shuffled ID cards)',
          problem: md`$n$ students hand in their ID cards, which are returned in a uniformly random order. What is the probability that **nobody** gets their own card, for large $n$?`,
          solution: md`Let $A_i$ be the event "student $i$ gets their own card". Then $P(A_{i_1}\cap\dots\cap A_{i_k})=\frac{(n-k)!}{n!}$, and there are $\binom nk$ such intersections. By inclusion–exclusion
$$P\Big(\bigcup A_i\Big)=\sum_{k=1}^n(-1)^{k-1}\binom nk\frac{(n-k)!}{n!}=\sum_{k=1}^n\frac{(-1)^{k-1}}{k!}.$$
So $P(\text{nobody})=\sum_{k=0}^n\frac{(-1)^k}{k!}\to e^{-1}\approx 0.368$.`,
        },
      ],
    },
    {
      id: 'designing',
      title: 'Designing a discrete random experiment',
      kind: 'concept',
      body: md`A recipe that works for most word problems:

1. **Identify the sample space.** Choose mutually exclusive, collectively exhaustive outcomes that cannot be subdivided further. Aggregate events can always be defined later.
2. **Assign probabilities** to the sample points, from symmetry, from the problem statement, or from past data.
3. **Identify the events of interest**: rewrite the verbal statements as subsets of $S$.
4. **Compute** each probability as a sum over the sample points in the event.

**Relative frequency.** If an outcome occurs $k$ times in $n$ trials, $k/n$ approximates its probability. The laws of large numbers (Lecture 5) make this precise.`,
      examples: [
        {
          title: 'Two children (a classic trap)',
          problem: md`A family has two children. What is the probability that both are boys (a) given that at least one is a boy, and (b) given that the older one is a boy?`,
          solution: md`Take $S=\{BB,BG,GB,GG\}$ (older first), uniform.
(a) "At least one boy" $=\{BB,BG,GB\}$, so $P=\frac{1/4}{3/4}=\frac13$.
(b) "Older is a boy" $=\{BB,BG\}$, so $P=\frac{1/4}{1/2}=\frac12$.
The information you are given changes the conditioning event, and with it the answer.`,
        },
      ],
    },
    {
      id: 'conditional',
      title: 'Conditional probability',
      kind: 'definition',
      body: md`Learning that $B$ occurred rules out every outcome outside $B$. We set their probabilities to $0$ and rescale the rest by $1/P(B)$ so that they again sum to 1. In effect, $B$ becomes the new sample space:
$$P(s\mid B)=\begin{cases}P(s)/P(B) & s\in B\\ 0 & s\notin B.\end{cases}$$`,
      formulas: [
        {
          id: 'cond-prob',
          name: 'Conditional probability',
          tex: md`P(A\mid B)=\frac{P(A\cap B)}{P(B)}\qquad (P(B)>0)`,
          symbols: [
            { sym: md`P(A\mid B)`, meaning: md`probability of $A$ once we know that $B$ happened` },
            { sym: md`P(A\cap B)`, meaning: 'probability that both happen' },
          ],
          intuition: md`Zoom in on $B$: what fraction of $B$'s probability mass lies inside $A$?`,
          pitfalls: md`It is **undefined** when $P(B)=0$. Also, $P(A\mid B)\neq P(B\mid A)$ in general (the "prosecutor's fallacy").`,
        },
        {
          id: 'multiplication',
          name: 'Multiplication rule / chain rule',
          tex: md`P(A\cap B)=P(A\mid B)\,P(B),\qquad P(A_1\cap\dots\cap A_n)=P(A_1)\,P(A_2\mid A_1)\cdots P(A_n\mid A_1\cap\dots\cap A_{n-1})`,
          intuition: 'Reveal the events one after another: first B happens, then, knowing B, A happens. Multiply along the path, as in a probability tree.',
        },
      ],
      examples: [
        {
          title: 'A distant die',
          problem: md`A fair die is thrown so far away that we can only see that the result is $\ge 4$. What is the probability that it is a 6?`,
          solution: md`$P(\{6\}\mid\{4,5,6\})=\frac{1/6}{3/6}=\frac13$.`,
        },
      ],
    },
    {
      id: 'independence',
      title: 'Independence of events',
      kind: 'definition',
      body: md`Events $A$ and $B$ are **independent** if
$$P(A\cap B)=P(A)\,P(B).$$
If $P(B)>0$, this is equivalent to $P(A\mid B)=P(A)$: knowing $B$ does not change the probability of $A$.

**Facts worth remembering:**

- Independence is symmetric.
- If $A,B$ are independent, so are $A,\overline B$; $\overline A,B$; and $\overline A,\overline B$.
- Mutually **exclusive** events are independent only if one of them has probability $0$. Disjoint is very different from independent!
- An event is independent of itself iff its probability is $0$ or $1$. $\emptyset$ and $S$ are independent of everything.
- Independence is **not transitive**.

**Mutual independence** of $A_1,\dots,A_n$ requires $P(A_{i_1}\cap\dots\cap A_{i_k})=\prod_j P(A_{i_j})$ for **every** sub-collection with $k\ge2$ events. **Pairwise** independence only requires it for pairs, and is strictly weaker.`,
      viz: [{ id: 'independence' }],
      examples: [
        {
          title: 'Pairwise but not mutually independent',
          problem: md`$S=\{s_1,s_2,s_3,s_4\}$ is uniform, with $A=\{s_1,s_2\}$, $B=\{s_2,s_3\}$, $C=\{s_2,s_4\}$. Are $A,B,C$ independent?`,
          solution: md`Each event has probability $\frac12$, and each pairwise intersection is $\{s_2\}$ with probability $\frac14=\frac12\cdot\frac12$, so the events are pairwise independent. But $P(A\cap B\cap C)=P(\{s_2\})=\frac14\neq\frac18$, so they are **not** mutually independent.`,
        },
      ],
    },
    {
      id: 'bayes',
      title: "Law of total probability & Bayes' rule",
      kind: 'theorem',
      body: md`Let $\{B_1,\dots,B_n\}$ be a **partition** of $S$ with $P(B_i)>0$. A partition splits the problem into exhaustive sub-cases: compute the probability in each case and average with weights $P(B_i)$.

Bayes' rule **inverts** a conditional probability. We typically know $P(\text{evidence}\mid\text{cause})$ (the *likelihood*) and want $P(\text{cause}\mid\text{evidence})$ (the *posterior*).`,
      formulas: [
        {
          id: 'total-prob',
          name: 'Law of total probability',
          tex: md`P(A)=\sum_{i=1}^n P(A\mid B_i)\,P(B_i)`,
          symbols: [
            { sym: md`\{B_i\}`, meaning: 'a partition: mutually exclusive and collectively exhaustive' },
            { sym: md`P(A\mid B_i)`, meaning: md`probability of $A$ in sub-case $i$` },
          ],
          intuition: 'A weighted average of the conditional probabilities. In a tree diagram, add up all paths that end in A.',
          conditions: 'Use it when the probability of A is easy to compute in each case but not overall (e.g. the defect rate of a factory with several machines).',
        },
        {
          id: 'bayes-rule',
          name: "Bayes' rule",
          tex: md`P(B_j\mid A)=\frac{P(A\mid B_j)\,P(B_j)}{\sum_{i=1}^n P(A\mid B_i)\,P(B_i)}`,
          symbols: [
            { sym: md`P(B_j)`, meaning: 'prior: belief before seeing the evidence' },
            { sym: md`P(A\mid B_j)`, meaning: 'likelihood of the evidence under hypothesis j' },
            { sym: md`P(B_j\mid A)`, meaning: 'posterior: updated belief' },
            { sym: md`P(A)`, meaning: 'evidence (normalising constant, from total probability)' },
          ],
          intuition: 'Posterior ∝ likelihood × prior. Evidence that is much more likely under one hypothesis shifts belief toward it, but a tiny prior can still win (base-rate effect).',
          pitfalls: md`The **base-rate fallacy**: with a rare disease, even an accurate test yields mostly false positives. Always include the prior.`,
        },
      ],
      viz: [{ id: 'bayes', caption: 'Change the prior (prevalence) of the medical test and watch the posterior. With prevalence 1% and a 95%/5% test, a positive result means only ≈16% chance of illness.' }],
      examples: [
        {
          title: 'Rare disease test',
          problem: md`A disease affects 0.5% of people. A test detects it with probability 0.98 (sensitivity), and gives a false positive with probability 0.03. You test positive. What is the probability that you are ill?`,
          solution: md`Let $I$ = ill and $+$ = positive. By total probability,
$$P(+)=0.98\cdot0.005+0.03\cdot0.995=0.0049+0.02985=0.03475.$$
Then Bayes gives $P(I\mid +)=\frac{0.0049}{0.03475}\approx 0.141$. Despite the accurate test, a positive result means only about 14%, because healthy people vastly outnumber ill ones.`,
        },
      ],
    },
  ],
  flashcards: [
    { id: 'l01-c1', front: 'What is a **sample space**?', back: md`The non-empty set $S$ of all possible outcomes of a random experiment. Each considered outcome corresponds to exactly one sample point.` },
    { id: 'l01-c2', front: 'What is an **event**?', back: md`A subset $A\subseteq S$ (in general: a member of the σ-field $\mathcal F$).` },
    { id: 'l01-c3', front: 'Define a **σ-field** on $S$.', back: md`$\mathcal F\subseteq 2^S$ with (1) $\emptyset\in\mathcal F$; (2) $A\in\mathcal F\Rightarrow\overline A\in\mathcal F$; (3) $A_1,A_2,\ldots\in\mathcal F\Rightarrow\bigcup_i A_i\in\mathcal F$.` },
    { id: 'l01-c4', front: 'Define a **probability space**.', back: md`A triple $(S,\mathcal F,P)$: sample space $S$, σ-field $\mathcal F$, and $P:\mathcal F\to[0,1]$ with $P(S)=1$ and **countable additivity** for pairwise disjoint events.` },
    { id: 'l01-c5', front: 'Why can we not always take $\mathcal F = 2^S$?', back: md`For uncountable $S$ (e.g. uniform on $[0,1]$) there are non-measurable sets (Vitali set, built with the axiom of choice): countable additivity together with shift invariance would force $1=\sum_{r\in\mathbb Q'}P(H)$, which is impossible.` },
    { id: 'l01-c6', front: 'Smallest and largest σ-field on $S$?', back: md`Smallest $\{\emptyset,S\}$, largest $2^S$.` },
    { id: 'l01-c7', front: 'Inclusion–exclusion for two and three events', back: md`$P(A\cup B)=P(A)+P(B)-P(A\cap B)$;
$P(A\cup B\cup C)=\sum P(A)-\sum P(A\cap B)+P(A\cap B\cap C)$.` },
    { id: 'l01-c8', front: 'When are events a **partition** of $S$?', back: 'When they are mutually exclusive (pairwise disjoint) and collectively exhaustive (their union is S).' },
    { id: 'l01-c9', front: 'Definition of **conditional probability** $P(A\mid B)$', back: md`$P(A\mid B)=\dfrac{P(A\cap B)}{P(B)}$ for $P(B)>0$, otherwise undefined.` },
    { id: 'l01-c10', front: 'Definition of **independent events** $A$, $B$', back: md`$P(A\cap B)=P(A)P(B)$. If $P(B)>0$, this is equivalent to $P(A\mid B)=P(A)$.` },
    { id: 'l01-c11', front: 'Are mutually exclusive events independent?', back: md`Only if $P(A)=0$ or $P(B)=0$: then $P(A\cap B)=0=P(A)P(B)$. Otherwise disjointness makes them strongly *dependent* (one excludes the other).` },
    { id: 'l01-c12', front: 'Mutual vs pairwise independence', back: md`Mutual: the product rule holds for **every** sub-collection of $\ge2$ events. Pairwise: only for pairs. Mutual ⇒ pairwise, not conversely (e.g. $A=\{s_1,s_2\}, B=\{s_2,s_3\}, C=\{s_2,s_4\}$ on a uniform 4-point space).` },
    { id: 'l01-c13', front: 'If $A$, $B$ are independent, what about $A$ and $\overline B$?', back: md`Also independent: $P(A\cap\overline B)=P(A)-P(A\cap B)=P(A)(1-P(B))=P(A)P(\overline B)$.` },
    { id: 'l01-c14', front: 'Law of total probability', back: md`For a partition $\{B_i\}$: $P(A)=\sum_i P(A\mid B_i)P(B_i)$.` },
    { id: 'l01-c15', front: "Bayes' rule", back: md`$P(B_j\mid A)=\dfrac{P(A\mid B_j)P(B_j)}{\sum_i P(A\mid B_i)P(B_i)}$: posterior ∝ likelihood × prior.` },
    { id: 'l01-c16', front: 'Is independence transitive?', back: md`No. $A\perp B$ and $B\perp C$ do not imply $A\perp C$ (take $C=A$ with $0<P(A)<1$ and $B=S$).` },
    { id: 'l01-c17', front: 'When is an event independent of itself?', back: md`$P(A)=P(A)^2 \iff P(A)\in\{0,1\}$.` },
    { id: 'l01-c18', front: 'De Morgan laws for events', back: md`$\overline{A\cup B}=\overline A\cap\overline B$, $\overline{A\cap B}=\overline A\cup\overline B$.` },
    { id: 'l01-c19', front: 'Chain rule for events', back: md`$P(A_1\cap\cdots\cap A_n)=P(A_1)P(A_2\mid A_1)\cdots P(A_n\mid A_1\cap\cdots\cap A_{n-1})$.` },
    { id: 'l01-c20', front: 'Discrete vs continuous sample space', back: 'Discrete: finite or countable (probability given by point masses). Continuous: uncountable (single points typically have probability 0; probability is assigned to intervals/regions via a σ-field).' },
  ],
  quiz: [
    {
      id: 'l01-q1',
      type: 'mcq',
      prompt: md`Which of the following is **not** required of a σ-field $\mathcal F$ on $S$?`,
      options: [md`$\emptyset\in\mathcal F$`, md`closed under complements`, md`closed under countable unions`, md`closed under arbitrary (uncountable) unions`],
      answer: 3,
      explanation: md`A σ-field needs only **countable** unions; together with complements this also gives countable intersections. Arbitrary unions are not required, and that is exactly what allows a σ-field to exclude non-measurable sets.`,
    },
    {
      id: 'l01-q2',
      type: 'numeric',
      prompt: md`Two fair dice are thrown. What is the probability that the sum is 7 **given** that at least one die shows 6?`,
      answer: 2 / 11,
      explanation: md`Condition: "at least one 6" has $36-25=11$ outcomes. Among them, sum 7 means $(1,6),(6,1)$, i.e. 2 outcomes. So $P=\frac{2/36}{11/36}=\frac{2}{11}\approx0.182$.`,
    },
    {
      id: 'l01-q3',
      type: 'truefalse',
      prompt: md`If $A\subseteq B$, $0<P(A)$ and $P(B)<1$, then $A$ and $B$ are dependent.`,
      answer: true,
      explanation: md`$P(A\cap B)=P(A)$. Independence would need $P(A)=P(A)P(B)$, i.e. $P(B)=1$ (since $P(A)>0$). As $P(B)<1$, they are dependent. (Without these extra assumptions the claim can fail: e.g. $B=S$ is independent of everything.)`,
    },
    {
      id: 'l01-q4',
      type: 'numeric',
      prompt: md`$P(A)=0.5$, $P(B)=0.4$, and $A,B$ are independent. Compute $P(A\cup B)$.`,
      answer: 0.7,
      explanation: md`$P(A\cup B)=P(A)+P(B)-P(A)P(B)=0.5+0.4-0.2=0.7$. Alternatively $1-P(\overline A)P(\overline B)=1-0.5\cdot0.6=0.7$.`,
    },
    {
      id: 'l01-q5',
      type: 'numeric',
      prompt: md`Machines M1, M2, M3 produce 50%, 30% and 20% of the items, with defect rates 1%, 2% and 5%. Given that an item is defective, what is the probability it was made by M3?`,
      answer: 0.01 / 0.021,
      explanation: md`Total probability: $P(D)=0.5\cdot0.01+0.3\cdot0.02+0.2\cdot0.05=0.005+0.006+0.01=0.021$. Bayes: $P(M_3\mid D)=\frac{0.01}{0.021}\approx0.476$.`,
    },
    {
      id: 'l01-q6',
      type: 'mcq',
      prompt: md`On a uniform four-point space $\{s_1,\dots,s_4\}$ let $A=\{s_1,s_2\}$, $B=\{s_1,s_3\}$, $C=\{s_1,s_4\}$. Which statement is true?`,
      options: ['A, B, C are mutually independent', 'A, B, C are pairwise independent but not mutually independent', 'A and B are dependent', 'A, B, C are mutually exclusive'],
      answer: 1,
      explanation: md`Every pair intersects in $\{s_1\}$: $\frac14=\frac12\cdot\frac12$, so they are pairwise independent. But $P(A\cap B\cap C)=\frac14\ne\frac18$, so they are not mutually independent.`,
    },
    {
      id: 'l01-q7',
      type: 'multi',
      prompt: md`Which statements hold for **every** pair of events $A,B$ on any probability space?`,
      options: [md`$P(A\cup B)\le P(A)+P(B)$`, md`$P(A\cap B)\ge P(A)+P(B)-1$`, md`$P(A\mid B)\le P(A)$`, md`$P(A\setminus B)=P(A)-P(A\cap B)$`],
      answer: [0, 1, 3],
      explanation: md`(1) the union bound; (2) follows from $P(A\cup B)\le1$; (4) because $A$ is the disjoint union of $A\setminus B$ and $A\cap B$. (3) is false: conditioning can increase a probability, e.g. $P(A\mid A)=1$.`,
    },
    {
      id: 'l01-q8',
      type: 'numeric',
      prompt: md`A fair coin is tossed until the first head. Using the sample space $\{H,TH,TTH,\dots\}$, what is the probability that an **even** number of tosses is needed?`,
      answer: 1 / 3,
      explanation: md`$P(\text{first head at toss }k)=2^{-k}$. Even $k$: $\sum_{j\ge1}4^{-j}=\frac{1/4}{1-1/4}=\frac13$.`,
    },
    {
      id: 'l01-q9',
      type: 'truefalse',
      prompt: md`There is a probability space with $S=\mathbb N$ and $P(\{n\})>0$ for every $n$.`,
      answer: true,
      explanation: md`Yes, e.g. $P(\{n\})=2^{-n}$, which sums to $1$ over $n\ge1$. What is impossible is a *uniform* distribution on $\mathbb N$.`,
    },
    {
      id: 'l01-q10',
      type: 'numeric',
      prompt: md`A test has false positive rate 2% and false negative rate 3%. The prevalence of the disease is 10%. If you test positive, what is the probability you are ill?`,
      answer: (0.97 * 0.1) / (0.97 * 0.1 + 0.02 * 0.9),
      explanation: md`$P(+)=0.97\cdot0.1+0.02\cdot0.9=0.097+0.018=0.115$. $P(\text{ill}\mid+)=\frac{0.097}{0.115}\approx0.843$.`,
    },
    {
      id: 'l01-q11',
      type: 'mcq',
      prompt: md`Five people check their hats; the hats are returned uniformly at random. What is the probability that **nobody** gets their own hat?`,
      options: [md`$\frac{11}{30}$`, md`$\frac{1}{e}$ exactly`, md`$\frac{44}{125}$`, md`$\frac{1}{5}$`],
      answer: 0,
      explanation: md`By inclusion–exclusion, $P=\sum_{k=0}^5\frac{(-1)^k}{k!}=1-1+\frac12-\frac16+\frac1{24}-\frac1{120}=\frac{44}{120}=\frac{11}{30}\approx0.367$. That is close to $1/e$, but not equal.`,
    },
    {
      id: 'l01-q12',
      type: 'truefalse',
      prompt: md`If $A$ is independent of $B$ and $B$ is independent of $C$, then $A$ is independent of $C$.`,
      answer: false,
      explanation: md`Independence is not transitive. Take $B=S$ (independent of everything) and $C=A$ with $0<P(A)<1$. Then $A$ is not independent of itself.`,
    },
  ],
};
