import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l11: Topic = {
  id: 'l11',
  lecture: 11,
  examGroup: 'Q6',
  title: 'Huffman codes & data compression',
  summary: md`Why Shannon lengths are not optimal, the Shannon–Fano algorithm, binary and d-ary Huffman codes with dummy symbols, properties of optimal prefix codes and the optimality proof of Huffman, compression in practice (Lempel–Ziv), and generating distributions from fair coin flips.`,
  sections: [
    {
      id: 'shannon-not-opt',
      title: 'Shannon lengths are not optimal',
      kind: 'concept',
      body: md`Lengths $\lceil\log\frac1{p_i}\rceil$ guarantee $L<H+1$, but they can be far from optimal:

- $p=(0.9999,0.0001)$: Shannon gives lengths $1$ and $14$, but the obvious optimal code uses 1 bit for each.
- Optimal codes may also use codewords **longer** than $\lceil\log\frac1{p_i}\rceil$. For $p=(\frac13,\frac13,\frac14,\frac1{12})$ both $(2,2,2,2)$ and $(1,2,3,3)$ are optimal with $L=2$. In the second, the symbol with $p=\frac14$ gets length $3>\lceil\log4\rceil=2$.`,
    },
    {
      id: 'shannon-fano',
      title: 'Shannon–Fano coding (top-down)',
      kind: 'definition',
      body: md`**Algorithm (binary).**

1. Divide the symbols into two groups whose total probabilities are as close as possible.
2. Prefix the left group's codewords with 0 and the right group's with 1.
3. Recurse into every group that has more than one symbol.

**Shannon–Fano is not optimal.** For $(0.38,0.18,0.16,0.15,0.13)$ the split $\{0.38,0.13\}\,|\,\{0.18,0.16,0.15\}$ (0.51 vs 0.49) gives the codeword lengths $2,2,3,3,2$ (in the order listed) and $L=2\cdot0.69+3\cdot0.31=2.31$, while Huffman achieves $2.24$.

The split is not unique. The visualizer splits the *sorted* list into contiguous halves, so it may produce a different (but similarly sub-optimal) tree.`,
    },
    {
      id: 'huffman',
      title: 'Huffman codes (bottom-up)',
      kind: 'definition',
      body: md`**$d$-ary Huffman algorithm.**

1. Add dummy symbols of probability $0$ until the number of symbols is $1+k(d-1)$ for some $k$. Every merge removes $d-1$ nodes, and we must end with exactly one.
2. Repeatedly replace the $d$ **smallest** probabilities by their sum.
3. Stop when a single node of probability 1 remains.
4. Read the code top-down: the root gets $\varepsilon$; if a merged node has codeword $w$, its parts get $w0,w1,\dots,w(d-1)$.

**Examples from the lecture:**
- binary, $(0.25,0.25,0.2,0.15,0.15)$: merges $0.15{+}0.15=0.3$, $0.2{+}0.25=0.45$, $0.25{+}0.3=0.55$, then $1$. $L=2.3$ ($H\approx2.285$). Shannon–Fano also gets 2.3 here.
- ternary, same distribution (already $5=1+2\cdot2$ symbols): $0.2{+}0.15{+}0.15=0.5$, then $1$. $L=1.5$ ($H_3\approx1.442$).
- ternary, $(0.25,0.25,0.2,0.1,0.1,0.1)$: 6 symbols, so add one dummy. The code is $1,2,01,02,000,001$ (the dummy would get $002$), with $L=1.7$.`,
      viz: [{ id: 'huffman' }],
      formulas: [
        {
          id: 'huff-len',
          name: 'Expected length via merges',
          tex: md`L_{\text{Huffman}}=\sum_{\text{merges}}(\text{probability of the merged node})`,
          intuition: 'Every merge adds one symbol to the codewords of all leaves below it, so summing the merged probabilities counts each pᵢ·lᵢ exactly once.',
          conditions: md`Check on $(0.25,0.25,0.2,0.15,0.15)$: $0.3+0.45+0.55+1=2.3$ ✓.`,
        },
      ],
    },
    {
      id: 'optimality',
      title: 'Optimality of Huffman codes',
      kind: 'theorem',
      body: md`**Lemma (properties of optimal prefix codes).** Every optimal prefix code satisfies:

1. smaller probability means longer or equal codeword: $p_j>p_k\Rightarrow l_j\le l_k$;
2. the two longest codewords have the same length;
3. every longest codeword has a **sibling** (differing only in the last symbol);
4. the longest codewords belong to the least likely symbols.

**Lemma (least-likely siblings).** Some optimal code with the same lengths has a longest codeword whose siblings are assigned to the least likely symbols. Swapping longest codewords does not change any length.

**Theorem.** Huffman codes are optimal.`,
      proof: md`**Lemma.**
- (1) Swapping the codewords of $j$ and $k$ changes $L$ by $(p_j-p_k)(l_k-l_j)$. This cannot be negative for an optimal code, so $l_k\ge l_j$.
- (2) and (3) If not, deleting the last letter of a longest codeword keeps the prefix property and shortens the code.
- (4) follows from (1).

**Theorem** (induction on $m$). For $m=2$ the lengths $(1,1)$ are optimal. Take an optimal $C_m$ with the least-likely-siblings property. Merge the two siblings (probabilities $p_{m-1},p_m$) into one symbol of probability $p_{m-1}+p_m$ with their common prefix, obtaining $C_{m-1}$. Then
$$L(C_m)=L(C_{m-1})+p_{m-1}+p_m,$$
a constant offset. So $C_m$ is optimal iff $C_{m-1}$ is. By induction $C_{m-1}$ has Huffman lengths, and the merge is exactly one Huffman step.`,
    },
    {
      id: 'practice',
      title: 'Compression in practice: Lempel–Ziv',
      kind: 'concept',
      body: md`**Problems with static codes in practice:**
- The true source distribution is unknown.
- Estimating it from symbol frequencies in the file means the codeword table must be **stored** with the compressed data.
- In the extreme, treating the whole file as one symbol gives a 1-bit message but a table as large as the file.

**Adaptive coding** builds its dictionary on the fly, with no table. **Lempel–Ziv** (asymptotically optimal):

1. Parse the input into phrases that have not appeared before: $1011010100010\ldots\to1,0,11,01,010,00,10,\ldots$
2. Encode each phrase as (index of its longest previously-seen prefix, extra bit), with the empty prefix at index 0: $(000,1)(000,0)(001,1)(010,1)(100,0)(010,0)(001,0)$.
3. Index lengths can grow gradually; no separators are needed.`,
    },
    {
      id: 'coin',
      title: 'Generating distributions from fair coins',
      kind: 'theorem',
      body: md`Any algorithm that turns fair coin flips $Z_1,Z_2,\dots$ into a sample of $X$ is a **full binary tree** (possibly infinite) whose leaves are labelled by outcomes. A leaf at depth $k$ has probability $2^{-k}$, and the expected number of flips $E(T)$ is the expected depth of the tree.

**Lemma.** If $Y$ is the leaf reached, $E(T)=H(Y)$, because $H(Y)=\sum_y2^{-k(y)}k(y)$.

**Examples.**
- $X$: $a$ w.p. $\frac12$, $b,c$ w.p. $\frac14$: flip once (0 gives $a$), otherwise flip again. $E(T)=1.5=H(X)$.
- $X$: $a$ w.p. $\frac23$, $b$ w.p. $\frac13$: use the binary expansion $\frac23=0.101010\ldots_2$, giving the infinite tree $1\to a$, $01\to b$, $001\to a$, … with $E(T)=\sum_i i2^{-i}=2$, while $H(X)\approx0.918$.`,
      formulas: [
        {
          id: 'coin-bounds',
          name: 'Fair bits needed to generate X',
          tex: md`H(X)\le E(T)<H(X)+2,\qquad E(T)=H(X)\ \text{if } X\ \text{is dyadic}`,
          intuition: 'You cannot extract more randomness than you put in. X is a function of the leaf Y, so H(X) ≤ H(Y) = E(T). For dyadic X the Huffman tree attains equality; in general, use the binary expansion of every pᵢ.',
        },
      ],
    },
  ],
  flashcards: [
    { id: 'l11-c1', front: 'Huffman algorithm (binary)', back: 'Repeatedly merge the two least probable nodes into one whose probability is their sum; read codewords from the root (0/1 on the edges).' },
    { id: 'l11-c2', front: 'd-ary Huffman: why add dummy symbols?', back: md`Each merge removes $d-1$ nodes; to end with exactly 1 we need $1+k(d-1)$ symbols, so we pad with probability-0 symbols.` },
    { id: 'l11-c3', front: 'Shannon–Fano algorithm', back: 'Top-down: split the symbols into two groups of nearly equal probability, assign 0/1, recurse. Not optimal in general.' },
    { id: 'l11-c4', front: 'Four properties of optimal prefix codes', back: '(1) p_j > p_k ⇒ l_j ≤ l_k; (2) the two longest codewords have equal length; (3) every longest codeword has a sibling; (4) the longest codewords belong to the least likely symbols.' },
    { id: 'l11-c5', front: 'Key step in the proof of Huffman optimality', back: md`Merging the two least likely sibling leaves gives $L(C_m)=L(C_{m-1})+p_{m-1}+p_m$, so $C_m$ is optimal iff $C_{m-1}$ is; use induction.` },
    { id: 'l11-c6', front: 'Expected length of a Huffman code via merges', back: 'Sum of the probabilities of all merged (internal) nodes, including the root.' },
    { id: 'l11-c7', front: 'Can an optimal code have $l_i>\\lceil\\log 1/p_i\\rceil$?', back: md`Yes: for $(\frac13,\frac13,\frac14,\frac1{12})$ the lengths $(1,2,3,3)$ are optimal and $\frac14$ gets length $3>2$.` },
    { id: 'l11-c8', front: 'Lempel–Ziv idea', back: 'Parse the input into the shortest phrases not seen before; encode each as (index of its prefix phrase, new bit). Adaptive (no stored table) and asymptotically optimal.' },
    { id: 'l11-c9', front: 'Fair coin flips needed to generate X', back: md`$H(X)\le E(T)<H(X)+2$; equality $E(T)=H(X)$ is possible iff $X$ is dyadic (use the Huffman tree).` },
    { id: 'l11-c10', front: 'Why is E(T) = H(Y) for the leaf variable Y?', back: md`A leaf at depth $k$ has probability $2^{-k}$, so $-\log P(y)=k(y)$ and $H(Y)=\sum 2^{-k}k=E(\text{depth})$.` },
  ],
  quiz: [
    {
      id: 'l11-q1',
      type: 'numeric',
      prompt: md`Expected length of a binary Huffman code for $(0.4,0.2,0.2,0.1,0.1)$?`,
      answer: 2.2,
      explanation: md`Merges: $0.1{+}0.1=0.2$, $0.2{+}0.2=0.4$, $0.2{+}0.4=0.6$, $0.4{+}0.6=1$. $L=0.2+0.4+0.6+1=2.2$. (Several optimal trees exist, all with $L=2.2$.)`,
    },
    {
      id: 'l11-q2',
      type: 'numeric',
      prompt: md`Expected length of a binary Huffman code for $(0.38,0.18,0.16,0.15,0.13)$?`,
      answer: 2.24,
      explanation: md`Merges: $0.28$, $0.34$, $0.62$, $1$, so $L=0.28+0.34+0.62+1=2.24$ (lengths 1,3,3,3,3).`,
    },
    {
      id: 'l11-q3',
      type: 'numeric',
      prompt: md`How many dummy symbols must be added for a **ternary** Huffman code on 8 symbols?`,
      answer: 1,
      tolerance: 0,
      explanation: md`We need $1+2k$ symbols. $8$ is even, so add 1 to get $9=1+2\cdot4$.`,
    },
    {
      id: 'l11-q4',
      type: 'mcq',
      prompt: md`Which statement about Shannon–Fano coding is true?`,
      options: ['It always produces an optimal prefix code', 'It is a bottom-up merging procedure', 'It can be strictly worse than Huffman', 'It does not produce a prefix code'],
      answer: 2,
      explanation: md`E.g. $(0.38,0.18,0.16,0.15,0.13)$: Shannon–Fano gives $2.31$, Huffman $2.24$.`,
    },
    {
      id: 'l11-q5',
      type: 'numeric',
      prompt: md`Expected length of the **ternary** Huffman code for $(0.25,0.25,0.2,0.15,0.15)$?`,
      answer: 1.5,
      explanation: md`5 symbols $=1+2\cdot2$, so no dummy is needed. Merge $0.2+0.15+0.15=0.5$, then $0.25+0.25+0.5=1$. $L=0.5+1=1.5$.`,
    },
    {
      id: 'l11-q6',
      type: 'numeric',
      prompt: md`We generate $X\in\{a,b,c,d\}$ with probabilities $(\frac12,\frac14,\frac18,\frac18)$ from fair coin flips optimally. Expected number of flips?`,
      answer: 1.75,
      explanation: md`Dyadic, so $E(T)=H(X)=1.75$.`,
    },
    {
      id: 'l11-q7',
      type: 'truefalse',
      prompt: md`In every optimal binary prefix code, each longest codeword has a sibling that is also a codeword.`,
      answer: true,
      explanation: 'Otherwise we could delete the last bit of that codeword, keeping the prefix property and shortening the code.',
    },
    {
      id: 'l11-q8',
      type: 'mcq',
      prompt: md`Lempel–Ziv parsing of $1011010100010$ starts as…`,
      options: ['1, 0, 1, 1, 0, …', '1, 0, 11, 01, 010, 00, 10', '10, 11, 01, 01, …', '101, 101, 010, …'],
      answer: 1,
      explanation: 'Each phrase is the shortest string not seen before as a phrase.',
    },
  ],
};
