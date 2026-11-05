import type { Exercise } from '../../../platform/types';

const md = String.raw;

export const t09: Exercise[] = [
  {
    id: '9.1',
    title: 'Entropies from a joint table',
    tutorial: 9,
    examGroup: 'Q6',
    topicId: 'l09',
    ref: 'cf. Tutorial 9.1',
    tier: 'core',
    prompt: md`$(X,Y)$ has joint PMF $p(1,1)=\frac12$, $p(1,2)=\frac14$, $p(2,1)=0$, $p(2,2)=\frac14$. Compute $H(X)$, $H(Y)$, $H(X\mid Y=1)$, $H(X\mid Y=2)$, $H(X\mid Y)$, $H(X,Y)$ and $I(X;Y)$.`,
    solution: md`Marginals: $P(X=1)=\frac34$, $P(Y=1)=\frac12$.
- $H(X)=H(\frac34,\frac14)=\frac34\log\frac43+\frac14\log4\approx0.811$; $H(Y)=1$.
- $X\mid Y=1$ is always 1, so $H(X\mid Y=1)=0$. $X\mid Y=2$ is uniform, so $H(X\mid Y=2)=1$.
- $H(X\mid Y)=\frac12\cdot0+\frac12\cdot1=0.5$.
- $H(X,Y)=H(\frac12,\frac14,\frac14)=1.5$. Check: $H(Y)+H(X\mid Y)=1.5$ ✓.
- $I(X;Y)=H(X)-H(X\mid Y)\approx0.311$.`,
    rubric: ['Marginals', 'Conditional entropies', 'Joint entropy + chain-rule check', 'Mutual information'],
  },
  {
    id: '9.2',
    title: 'Which experiment is more random?',
    tutorial: 9,
    examGroup: 'Q6',
    topicId: 'l09',
    ref: 'cf. Tutorials 9.2, 9.11',
    tier: 'core',
    prompt: md`Compute the entropy of: a. one 6-sided die; b. two distinguishable 6-sided dice; c. two **indistinguishable** 6-sided dice (only the unordered pair is seen); d. the sum of two 6-sided dice; e. one 8-sided die.`,
    solution: md`a. $\log6\approx2.585$. b. $\log36\approx5.170$.
c. 6 doubles with probability $\frac1{36}$ and 15 unordered pairs with probability $\frac2{36}$: $\frac6{36}\log36+\frac{30}{36}\log18\approx4.337$.
d. The sum has probabilities $\frac{1,2,\dots,6,\dots,1}{36}$, giving $H\approx3.274$. e. $3$.
Coarser observations (unordered pairs, sums) lose information: $H(f(X))\le H(X)$. The sum of two dice (11 non-uniform outcomes, $\approx3.27$ bits) is still "more random" than an 8-sided die (3 bits): what counts is the number of outcomes **and** how uniform they are.`,
  },
  {
    id: '9.3',
    title: 'Functions of a random variable',
    tutorial: 9,
    examGroup: 'Q6',
    topicId: 'l09',
    ref: 'cf. Tutorial 9.3',
    tier: 'core',
    prompt: md`For a random variable $X$ and a function $f$: compute $H(f(X)\mid X)$, compare $H(X)$ with $H(f(X))$, and compute $I(X;f(X))$.`,
    solution: md`$H(f(X)\mid X)=0$: given $X$, $f(X)$ is determined.
By the chain rule, $H(X,f(X))=H(X)+0=H(f(X))+H(X\mid f(X))$, so $H(f(X))=H(X)-H(X\mid f(X))\le H(X)$, with equality iff $f$ is injective on $\mathrm{Im}(X)$.
$I(X;f(X))=H(f(X))-H(f(X)\mid X)=H(f(X))$.`,
  },
  {
    id: '9.4',
    title: 'Parity information',
    tutorial: 9,
    examGroup: 'Q6',
    topicId: 'l09',
    ref: 'cf. Tutorial 9.4',
    tier: 'core',
    prompt: md`$X$ is a fair 8-sided die and $Y$ an independent fair 6-sided die.
a. Find $H(X)$, $H(Y)$, $H(X,Y)$ and $I(X;Y)$.
b. How much does learning $\mathrm{Even}(X)$ reduce $H(X)$? Is it halved?
c. Find $H(X,Y\mid\mathrm{Even}(X+Y))$.`,
    solution: md`a. $3$, $\log6\approx2.585$, $\log48\approx5.585$ (independent), and $I=0$.
b. $H(X\mid\mathrm{Even}(X))=\log4=2$: a reduction of exactly 1 bit, so $I(X;\mathrm{Even}(X))=1$. It is not halved: one bit out of three.
c. $\mathrm{Even}(X+Y)$ is a fair bit, because $X$'s parity is uniform and independent of $Y$. It is a function of $(X,Y)$, so $H(X,Y\mid E)=H(X,Y)-H(E)=\log48-1=\log24\approx4.585$.`,
  },
  {
    id: '9.5',
    title: 'Password leaks',
    tutorial: 9,
    examGroup: 'Q6',
    topicId: 'l09',
    ref: 'cf. Tutorial 9.5',
    tier: 'core',
    prompt: md`A password is $n\ge2$ uniformly random bits. How much information (in bits) leaks when you learn: a. the first bit; b. the XOR of all bits; c. that the password contains **at most one** 1?`,
    solution: md`The leaked information is $I(X;f(X))=H(f(X))$.
a. A fair bit: 1 bit.
b. The parity of uniform bits is a fair bit: 1 bit.
c. Here we learn the event $A$ = "at most one 1", which has probability $q=\frac{n+1}{2^n}$. On average over the indicator, $H(I_A)=h(q)$ bits leak, which is tiny for large $n$. But when $A$ actually happens, the remaining uncertainty drops from $n$ to $\log(n+1)$ bits: a huge leak in that case.`,
  },
  {
    id: '9.6',
    title: 'Finding a light coin',
    tutorial: 9,
    examGroup: 'Q6',
    topicId: 'l09',
    ref: 'cf. Tutorial 9.10',
    tier: 'core',
    prompt: md`Among 27 coins one is lighter. A balance weighing has 3 outcomes (left, right, equal). Give an information-theoretic lower bound on the number of weighings and show that it is tight.`,
    solution: md`There are 27 equally likely possibilities, so $H=\log27$ bits. Each weighing yields at most $\log3$ bits, hence $k\ge\log_327=3$.
Tight: split into thirds of 9 and weigh 9 vs 9. Equal means the coin is in the third pile; otherwise it is on the lighter side. Repeat with 3 vs 3, then 1 vs 1: 3 weighings.`,
  },
  {
    id: '9.7',
    title: 'Can an observation increase uncertainty?',
    tutorial: 9,
    examGroup: 'Q6',
    topicId: 'l09',
    ref: 'cf. Tutorial 9.6',
    tier: 'core',
    prompt: md`Prove or disprove: $H(X\mid Y=y)\le H(X)$ for every $y$.`,
    solution: md`**False.** Let $Y=0$ w.p. $0.9$, in which case $X=0$; and $Y=1$ w.p. $0.1$, in which case $X$ is a fair bit. Then $P(X=1)=0.05$, so $H(X)\approx0.286$, but $H(X\mid Y=1)=1$. Only the **average** satisfies $H(X\mid Y)=0.1\le H(X)$.`,
  },
  {
    id: '9.8',
    title: 'Negative interaction information',
    tutorial: 9,
    examGroup: 'Q6',
    topicId: 'l09',
    ref: 'cf. Tutorial 9.8',
    tier: 'star',
    prompt: md`Define $I(X;Y;Z)=I(X;Y)-I(X;Y\mid Z)$. Find $X,Y,Z$ with $I(X;Y;Z)<0$.`,
    solution: md`$X,Y$ independent fair bits and $Z=X\oplus Y$. Then $I(X;Y)=0$, but given $Z$, $Y$ determines $X$, so $I(X;Y\mid Z)=H(X\mid Z)=1$. Hence $I(X;Y;Z)=-1$. The three-set "Venn diagram" of entropies cannot be taken literally.`,
  },
];

export const t10: Exercise[] = [
  {
    id: '10.1',
    title: 'Building prefix codes from lengths',
    tutorial: 10,
    examGroup: 'Q6',
    topicId: 'l10',
    ref: 'cf. Tutorial 10.1',
    tier: 'core',
    prompt: md`Construct a binary prefix code with codeword lengths $2,2,2,3,3$. Is there one with lengths $1,2,2,3$?`,
    solution: md`Kraft: $3\cdot\frac14+2\cdot\frac18=1\le1$ ✓. Canonical construction: $00,01,10,110,111$.
For $1,2,2,3$: $\frac12+\frac14+\frac14+\frac18=\frac98>1$, so **no** (not even a uniquely decodable code, by McMillan).`,
    rubric: ['Kraft sums', 'Explicit code', 'Impossibility argument'],
  },
  {
    id: '10.2',
    title: 'Complete prefix codes',
    tutorial: 10,
    examGroup: 'Q6',
    topicId: 'l10',
    ref: 'cf. Tutorials 10.2–10.3',
    tier: 'core',
    prompt: md`Let $C$ be a $d$-ary prefix code. Show that every string over $D$ can be extended to a concatenation of codewords **iff** $\sum_id^{-l_i}=1$.`,
    solution: md`View the codewords as leaves of the $d$-ary tree.
(⇐) If $\sum d^{-l_i}=1$, the codeword subtrees cover all nodes at depth $l_{\mathrm{max}}$, so every node lies on a path to some codeword. Decode greedily: whenever you reach a codeword, restart at the root. Any string is a prefix of a path through codewords, so it can be extended.
(⇒) If $\sum<1$, some node $w$ at depth $l_{\mathrm{max}}$ is neither a codeword nor below one. The string $w$ cannot be decoded, since no codeword is a prefix of $w$ and $w$ is not a prefix of any codeword, so no extension helps.`,
  },
  {
    id: '10.3',
    title: 'Suffix codes',
    tutorial: 10,
    examGroup: 'Q6',
    topicId: 'l10',
    ref: 'cf. Tutorial 10.4',
    tier: 'core',
    prompt: md`A code is a **suffix code** if no codeword is a suffix of another. Show $L_C(X)\ge H_d(X)$ for every suffix code.`,
    solution: md`Reverse every codeword. The reversed code is a prefix code with the same lengths, so Kraft gives $\sum d^{-l_i}\le1$, and the entropy bound $L\ge H_d(X)$ (which only uses Kraft) applies. (Alternatively, a suffix code is uniquely decodable when read right to left, so McMillan applies.)`,
  },
  {
    id: '10.4',
    title: 'Gold coins in boxes',
    tutorial: 10,
    examGroup: 'Q1',
    topicId: 'l01',
    ref: 'cf. Tutorial 10.6',
    tier: 'core',
    prompt: md`Four boxes contain GG, GG, SS and GS (gold/silver coins). A box is chosen uniformly and a random coin drawn from it is gold. What is the probability that the other coin in the box is also gold?`,
    solution: md`$P(\text{gold})=\frac14(1+1+0+\frac12)=\frac58$. $P(\text{GG box}\wedge\text{gold})=\frac24$. Hence $P=\frac{1/2}{5/8}=\frac45$. (Intuition: of the 5 gold coins, 4 sit in a GG box.)`,
  },
  {
    id: '10.5',
    title: 'Fix-free codes',
    tutorial: 10,
    examGroup: 'Q6',
    topicId: 'l10',
    ref: 'cf. Tutorial 10.5',
    tier: 'star',
    prompt: md`Show that if $\sum_k2^{-l_k}\le\frac12$ then there is a binary code with these lengths that is both prefix-free and suffix-free.`,
    solution: md`**Greedy construction.** Sort $l_1\le\dots\le l_m$ and choose the codewords one by one. When choosing $c_k$ (length $l_k$), a string is forbidden if some earlier $c_j$ is its prefix or its suffix. Earlier codewords are not longer, so this also covers the case "$c_k$ is a prefix or suffix of $c_j$". Each earlier $c_j$ forbids at most $2^{l_k-l_j}$ strings as a prefix and $2^{l_k-l_j}$ as a suffix. A free string exists if
$$2\sum_{j<k}2^{l_k-l_j}<2^{l_k}\iff\sum_{j<k}2^{-l_j}<\tfrac12,$$
which holds because $\sum_{j<k}2^{-l_j}\le\frac12-2^{-l_k}<\frac12$.
**The converse is false:** $\{0,1\}$ is fix-free with Kraft sum $1>\frac12$.`,
  },
];

export const t11: Exercise[] = [
  {
    id: '11.1',
    title: 'Shannon–Fano, Huffman and ternary Huffman',
    tutorial: 11,
    examGroup: 'Q6',
    topicId: 'l11',
    ref: 'cf. Tutorial 11.1',
    tier: 'core',
    prompt: md`$X$ takes 7 values with probabilities $(0.40,0.20,0.15,0.10,0.08,0.04,0.03)$.
a. Find a binary Shannon–Fano code. b. Find a binary Huffman code. c. Compare their expected lengths with $H(X)$ and with the Shannon lengths $\lceil\log1/p\rceil$. d. Find a ternary Huffman code.`,
    solution: md`a. Splits: $\{0.4\}\,|\,\text{rest}$, then $\{0.2,0.15\}\,|\,\{0.1,0.08,0.04,0.03\}$, and so on. One result is $0,100,101,110,1110,11110,11111$ with $L=2.42$.
b. Huffman merges: $0.03+0.04=0.07$; $0.07+0.08=0.15$; $0.1+0.15=0.25$; $0.15+0.2=0.35$; $0.25+0.35=0.6$; $0.4+0.6=1$. Lengths $1,3,3,3,4,5,5$, e.g. $1,000,010,011,0010,00110,00111$, with $L=0.07+0.15+0.25+0.35+0.6+1=2.42$.
c. $H(X)\approx2.365\le2.42<3.365$ ✓. Shannon lengths $2,3,3,4,4,5,6$ give $L=2.95$, much worse.
d. 7 symbols $=1+2\cdot3$, so no dummy is needed. Merge $0.03+0.04+0.08=0.15$, then $0.1+0.15+0.15=0.4$, then $0.2+0.4+0.4=1$. Code: $0,2,11,12,100,101,102$ (lengths $1,1,2,2,3,3,3$) with $L=1.55$; $H_3\approx1.492$.`,
    rubric: ['Shannon–Fano code', 'Huffman merges and code', 'Expected lengths vs entropy', 'Ternary Huffman'],
  },
  {
    id: '11.2',
    title: 'One code, two sources',
    tutorial: 11,
    examGroup: 'Q6',
    topicId: 'l11',
    ref: 'cf. Tutorial 11.2',
    tier: 'core',
    prompt: md`Find a binary Huffman code for $(0.3,0.25,0.2,0.15,0.1)$. Is the same code also optimal for the uniform distribution on 5 symbols?`,
    solution: md`Merges: $0.1+0.15=0.25$; $0.2+0.25=0.45$; $0.25+0.3=0.55$; $1$. Lengths $2,2,2,3,3$, e.g. $00,10,11,010,011$, with $L=2.25$ ($H\approx2.228$).
For the uniform distribution Huffman also produces lengths $\{2,2,2,3,3\}$, giving $L=2.4$. The same code is optimal there too.`,
  },
  {
    id: '11.3',
    title: 'Impossible Huffman codes',
    tutorial: 11,
    examGroup: 'Q6',
    topicId: 'l11',
    ref: 'cf. Tutorial 11.3',
    tier: 'core',
    prompt: md`Which of these cannot be binary Huffman codes for any distribution? a. $(0,10,110)$ b. $(1,01,00)$ c. $(00,01,10,11)$ d. $(01,10)$`,
    solution: md`A Huffman tree is **full**: every internal node has 2 children, so the Kraft sum is exactly 1, and every longest codeword has a sibling.
a. Kraft sum $\frac78$; $110$ has no sibling, so **impossible**.
b. Possible (sum 1).
c. Possible (sum 1).
d. Kraft sum $\frac12$, and $0$ could be shortened, so **impossible**.`,
  },
  {
    id: '11.4',
    title: 'Huffman and extensions',
    tutorial: 11,
    examGroup: 'Q6',
    topicId: 'l11',
    ref: 'cf. Tutorial 11.5',
    tier: 'core',
    prompt: md`A source emits A, B, C, D with probabilities $0.7,0.15,0.1,0.05$.
a. Compute $H$. b. Find a Huffman code and its $L$. c. How can coding pairs of symbols help?`,
    solution: md`a. $H\approx1.319$ bits.
b. Merges: $0.05+0.1=0.15$; $0.15+0.15=0.3$; $0.3+0.7=1$. Code $A{:}0$, $B{:}11$, $C{:}100$, $D{:}101$ with $L=0.7+0.6+0.3+0.15=1.45$.
c. Huffman-code the 16 pairs (probabilities $p_ip_j$): about $1.329$ bits/symbol. Block coding gives $H\le L_n<H+\frac1n$, approaching the entropy.`,
  },
  {
    id: '11.5',
    title: 'A fair 3-sided die from coin flips',
    tutorial: 11,
    examGroup: 'Q6',
    topicId: 'l11',
    ref: 'cf. Tutorial 12.1',
    tier: 'core',
    prompt: md`Using fair coin flips, generate a uniform value in $\{1,2,3\}$. Give an algorithm, its expected number of flips, and compare it with $H$.`,
    solution: md`Flip two coins: $00\mapsto1$, $01\mapsto2$, $10\mapsto3$, $11\mapsto$ repeat. Each round succeeds with probability $\frac34$, so $E(T)=2\cdot\frac43=\frac83\approx2.67$.
The same tree arises from the binary expansion $\frac13=0.0101\ldots_2$. Bounds: $H=\log3\approx1.585\le E(T)<H+2$ ✓. No algorithm can beat $\log3$; the gap exists because the distribution is not dyadic.`,
  },
  {
    id: '11.6',
    title: 'When is the top codeword one bit?',
    tutorial: 11,
    examGroup: 'Q6',
    topicId: 'l11',
    ref: 'cf. Tutorial 11.4',
    tier: 'star',
    prompt: md`Show that in a binary Huffman code, if $p_1>\frac25$ then the most likely symbol gets a 1-bit codeword.`,
    solution: md`(Assume $p_1>p_2\ge\dots$.) Look at the step where exactly three nodes $A,B,c$ remain. Huffman merges the two smallest, and the third becomes a child of the root.
Suppose leaf 1 does **not** get length 1. Then its node $A\ni p_1$ is among the two merged, so $A\le c$, giving $c\ge A\ge p_1>\frac25$ and $B=1-A-c<\frac15$.
- If $c$ is a leaf, then $c\le p_2<p_1\le A$, contradicting $A\le c$.
- If $c$ is internal, it was created earlier by merging two nodes $c_1,c_2$ that were then the two smallest. At that time some node contained part of $B$, with value $\le B<\frac15$. So $c_1,c_2<\frac15$ and $c<\frac25$, a contradiction.

Hence leaf 1 is a child of the root (a 1-bit codeword). Conversely, if $p_1<\frac13$ had length 1, it would be the unmerged third node at the 3-node stage, so it would be $\ge$ both merged nodes and the total would be $\le3p_1<1$, a contradiction. So the length is $\ge2$.`,
  },
];

export const t12: Exercise[] = [
  {
    id: '12.1',
    title: 'Channel matrices',
    tutorial: 12,
    examGroup: 'Q7',
    topicId: 'l12',
    ref: 'cf. Tutorial 12.2',
    tier: 'core',
    prompt: md`Write the transition matrices $p(y\mid x)$ of: a. a BSC with crossover $p$; b. a BEC with erasure probability $\alpha$; c. a noisy typewriter on 4 letters; d. a channel with non-overlapping outputs (input 0 gives $a$ or $b$, input 1 gives $c$ or $d$).`,
    solution: md`a. $\begin{pmatrix}1-p&p\\p&1-p\end{pmatrix}$. b. $\begin{pmatrix}1-\alpha&\alpha&0\\0&\alpha&1-\alpha\end{pmatrix}$ (columns $0,e,1$).
c. $\begin{pmatrix}\frac12&\frac12&0&0\\0&\frac12&\frac12&0\\0&0&\frac12&\frac12\\\frac12&0&0&\frac12\end{pmatrix}$. d. $\begin{pmatrix}q&1-q&0&0\\0&0&r&1-r\end{pmatrix}$.
Capacities: $1-H(p)$; $1-\alpha$; $\log4-1=1$; $1$.`,
  },
  {
    id: '12.2',
    title: 'Additive noise modulo 7',
    tutorial: 12,
    examGroup: 'Q7',
    topicId: 'l12',
    ref: 'cf. Tutorial 12.3',
    tier: 'core',
    prompt: md`$Y=X+Z\bmod7$ with $X\in\{0,\dots,6\}$ and $Z$ uniform on $\{0,1,2\}$, independent of $X$. Compute the capacity.`,
    solution: md`This is a symmetric channel: every row is a cyclic shift of $Z$'s distribution. $I(X;Y)=H(Y)-H(Z)\le\log7-\log3$, with equality for a uniform $X$, which makes $Y$ uniform. So
$C=\log\frac73\approx1.222$ bits.`,
    rubric: ['H(Y|X) = H(Z)', 'Uniform input → uniform output', 'C = log(7/3)'],
  },
  {
    id: '12.3',
    title: 'The Z-channel',
    tutorial: 12,
    examGroup: 'Q7',
    topicId: 'l12',
    ref: 'cf. Tutorial 12.4',
    tier: 'core',
    prompt: md`Input 1 is always received correctly. Input 0 is received as 0 or 1 with probability $\frac12$ each. Find the capacity and the optimal input distribution, and compare with a BSC($\frac12$).`,
    hints: [md`With $q=P(X=0)$: $P(Y=0)=q/2$ and $H(Y\mid X)=q\cdot1$.`],
    solution: md`$I(q)=H(\frac q2)-q$. Setting the derivative to zero: $\frac12\log\frac{1-q/2}{q/2}=1$, so $\frac{2-q}{q}=4$ and $q=\frac25$.
$C=H(\frac15)-\frac25\approx0.7219-0.4=0.3219=\log\frac54$ bits. The noisy input is used less often (40%).
A BSC with $p=\frac12$ has capacity $0$, so the Z-channel is much better: one input is perfectly reliable.`,
    rubric: ['I(X;Y) as a function of q', 'Optimisation q = 2/5', 'C ≈ 0.322', 'Comparison with BSC'],
  },
  {
    id: '12.4',
    title: 'Channel with two confusable inputs',
    tutorial: 12,
    examGroup: 'Q7',
    topicId: 'l12',
    ref: 'cf. Tutorial 12.5',
    tier: 'core',
    prompt: md`$Q=\begin{pmatrix}1&0&0\\0&\frac12&\frac12\\0&\frac12&\frac12\end{pmatrix}$. Find the capacity and an optimal input distribution.`,
    solution: md`Inputs 2 and 3 produce identical output distributions, so they act as a single "super-input" whose output lies in $\{2,3\}$. Input 1 always gives output 1. The distinguishable groups are $\{1\}$ and $\{2,3\}$: a noiseless binary channel between the groups. Hence $C=1$ bit, with $P(X=1)=\frac12$ and $P(X\in\{2,3\})=\frac12$ split arbitrarily.
Check: $H(Y)=1+\frac12H(Y\mid\text{group }2)=1+\frac12$ and $H(Y\mid X)=\frac12$, so $I=1$.`,
  },
  {
    id: '12.5',
    title: 'Parallel channels',
    tutorial: 12,
    examGroup: 'Q7',
    topicId: 'l12',
    ref: 'cf. Tutorial 12.6',
    tier: 'core',
    prompt: md`Two DMCs with independent noise are used in parallel. Show $H(Y_1,Y_2\mid X_1,X_2)=H(Y_1\mid X_1)+H(Y_2\mid X_2)$ and that the capacity is $C_1+C_2$.`,
    solution: md`By the product form, $p(y_1,y_2\mid x_1,x_2)=p(y_1\mid x_1)p(y_2\mid x_2)$, so $H(Y_1,Y_2\mid X_1,X_2)=H(Y_1\mid X_1)+H(Y_2\mid X_2)$. In general $H(Y_1,Y_2)\le H(Y_1)+H(Y_2)$, hence
$I\le I(X_1;Y_1)+I(X_2;Y_2)\le C_1+C_2$. Choosing $X_1,X_2$ **independent** with the respective optimal distributions makes $Y_1\perp Y_2$ and attains equality, so $C=C_1+C_2$.`,
  },
  {
    id: '12.6',
    title: 'Five-fold repetition',
    tutorial: 12,
    examGroup: 'Q7',
    topicId: 'l12',
    ref: 'cf. Tutorial 12.7',
    tier: 'core',
    prompt: md`Each bit is sent 5 times over a BSC with $p=0.1$ and decoded by majority.
a. What is the error probability? b. What is the rate? c. Can repetition codes reach error $<\varepsilon$ at a positive rate? What does the channel coding theorem say?`,
    solution: md`a. Error iff $\ge3$ flips: $\binom53p^3q^2+\binom54p^4q+p^5=0.0081+0.00045+0.00001\approx0.00856$.
b. $R=\frac15$.
c. With $n$ repetitions the error goes to 0, but the rate $\frac1n$ goes to 0 too. The theorem guarantees codes with **any** rate $R<C=1-H(0.1)\approx0.531$ and error below any $\varepsilon$ for large block lengths. So far better codes exist.`,
    rubric: ['Error formula', 'Numeric value', 'Rate', 'Link to the channel coding theorem'],
  },
  {
    id: '12.7',
    title: 'Which rates are achievable?',
    tutorial: 12,
    examGroup: 'Q7',
    topicId: 'l12',
    ref: 'cf. Tutorial 12 (theorem)',
    tier: 'core',
    prompt: md`A BSC has crossover probability $0.05$. Can we transmit reliably (error → 0) at rate $0.7$? At rate $0.8$?`,
    solution: md`$C=1-H(0.05)\approx1-0.286=0.714$. Rate $0.7<C$: **yes**, for sufficiently long block codes. Rate $0.8>C$: **no**, since $\lambda_{\mathrm{max}}$ is bounded away from 0 for every code.`,
  },
];

export const t13: Exercise[] = [
  {
    id: '13.1',
    title: 'Queue diagrams and exit rates',
    tutorial: 13,
    examGroup: 'NX',
    topicId: 'l13',
    ref: 'cf. Tutorial 13.1',
    tier: 'core',
    prompt: md`Draw the CTMC and give exit rates and exit probabilities for an M/M/2/3 queue with arrival rate $\lambda$ and service rate $\mu$ per server.`,
    solution: md`States $0,1,2,3$ (jobs in the system). Arrivals $i\to i+1$ at rate $\lambda$ for $i<3$. Services $i\to i-1$ at rate $\min(i,2)\mu$.
Exit rates: $\lambda$, $\lambda+\mu$, $\lambda+2\mu$, $2\mu$.
Exit probabilities from 1: up $\frac\lambda{\lambda+\mu}$, down $\frac\mu{\lambda+\mu}$; from 2: up $\frac\lambda{\lambda+2\mu}$, down $\frac{2\mu}{\lambda+2\mu}$; from 0 and 3 the move is forced.`,
  },
  {
    id: '13.2',
    title: 'Steady state of a finite queue',
    tutorial: 13,
    examGroup: 'NX',
    topicId: 'l13',
    ref: 'cf. Tutorials 13.3–13.4',
    tier: 'core',
    prompt: md`An M/M/1/3 queue has $\lambda=2$ and $\mu=3$. Find the steady-state distribution, the utilisation and the mean number of jobs.`,
    solution: md`Cut equations: $\pi_{k+1}=\frac23\pi_k$, so $\pi\propto(1,\frac23,\frac49,\frac8{27})$ and $\pi=\frac{(27,18,12,8)}{65}$.
Utilisation $1-\pi_0=\frac{38}{65}\approx0.585$. Mean number $\frac{18+24+24}{65}=\frac{66}{65}\approx1.015$.`,
  },
  {
    id: '13.3',
    title: 'Printer with paper jams',
    tutorial: 13,
    examGroup: 'NX',
    topicId: 'l13',
    ref: 'cf. Tutorial 13.5',
    tier: 'extra',
    prompt: md`A printer receives on average 24 jobs per 8-hour day; a job takes 3 minutes on average. A jam occurs on average twice per day of printing time and takes 15 minutes to fix. Model it as a CTMC (exponential times, unit = minutes) and find the long-run fraction of time spent printing.`,
    solution: md`States: Idle, Print, Jam. Rates per minute:
- Idle→Print: $\frac{24}{480}=0.05$
- Print→Idle: $\frac13$
- Print→Jam: $\frac2{480}=\frac1{240}$
- Jam→Print: $\frac1{15}$ (the job resumes)

Balance:
- Idle: $0.05\pi_I=\frac13\pi_P$, so $\pi_I=\frac{20}3\pi_P$.
- Jam: $\frac1{15}\pi_J=\frac1{240}\pi_P$, so $\pi_J=\frac1{16}\pi_P$.

Normalising: $\pi_P(\frac{20}3+1+\frac1{16})=1$, so $\pi_P\approx0.129$, $\pi_I\approx0.862$, $\pi_J\approx0.008$.`,
  },
];
