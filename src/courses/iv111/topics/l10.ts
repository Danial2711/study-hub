import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l10: Topic = {
  id: 'l10',
  lecture: 10,
  examGroup: 'Q6',
  title: 'Codes, Kraft & McMillan inequalities',
  summary: md`Memoryless sources, codes and expected length, the hierarchy singular / non-singular / uniquely decodable / prefix, the Kraft inequality, the McMillan inequality, the entropy lower bound $L\ge H_d(X)$, Shannon code lengths with $H\le L^*<H+1$, block coding, and the cost of a wrong model ($H(p\|q)$).`,
  sections: [
    {
      id: 'source',
      title: 'Sources and codes',
      kind: 'definition',
      body: md`A **memoryless source** is a random variable $X$ emitting i.i.d. messages $X_1,X_2,\dots$ from $\mathrm{Im}(X)$. Sources with memory (dependent or non-identical $X_i$) exist but are not covered in this course.

A **$d$-ary code** is a mapping $C:\mathrm{Im}(X)\to D^*$ with $D=\{0,\dots,d-1\}$. $C(x)$ is the **codeword** of $x$ and $l_C(x)$ is its length. The length of the message is a random variable; we minimise its expectation.`,
      formulas: [
        {
          id: 'exp-len',
          name: 'Expected code length',
          tex: md`L_C(X)=\sum_{x}P(X=x)\,l_C(x)=E\big[l_C(X)\big]`,
        },
      ],
      examples: [
        {
          title: 'Dyadic vs non-dyadic',
          problem: md`(a) $p=(\frac12,\frac14,\frac18,\frac18)$ with $C=0,10,110,111$. (b) $p=(\frac13,\frac13,\frac13)$ with $C=0,10,11$. Compare $L$ with $H$.`,
          solution: md`(a) $H=1.75=L$: every $p_i=2^{-l_i}$, so the code is perfect. Decoding $0110111100110$ gives $1,3,4,2,1,3$.
(b) $H=\log_23\approx1.585$, but $L=\frac53\approx1.667>H$. Since $p_i$ is not a power of 2, no code reaches $H$ exactly.`,
        },
      ],
    },
    {
      id: 'classes',
      title: 'Non-singular, uniquely decodable and prefix codes',
      kind: 'definition',
      body: md`- **Non-singular:** injective, $x\ne y\Rightarrow C(x)\ne C(y)$. A single codeword can be decoded, but we send *sequences*.
- The **extension** $C^*(x_1\dots x_n)=C(x_1)\cdots C(x_n)$ concatenates codewords.
- **Uniquely decodable (UD):** $C^*$ is non-singular, so every encoded string has exactly one source string.
- **Prefix (instantaneous):** no codeword is a prefix of another. Each codeword is recognised as soon as its last symbol arrives.

$$\text{prefix}\subsetneq\text{UD}\subsetneq\text{non-singular}\subsetneq\text{all codes}$$

| $x$ | singular | non-singular, not UD | UD, not prefix | prefix |
|---|---|---|---|---|
| 1 | 0 | 0 | 10 | 0 |
| 2 | 0 | 010 | 00 | 10 |
| 3 | 0 | 01 | 11 | 110 |
| 4 | 0 | 10 | 110 | 111 |

In the second column, $010$ decodes as "2", as "1 4" and as "3 1". The third column is UD (it is decodable from the right; in general use the Sardinas–Patterson test) but not instantaneous: after reading $11$ you must look ahead.`,
      viz: [{ id: 'kraft', caption: 'Switch to "codewords" mode and type the columns of the table above to see their classification.' }],
    },
    {
      id: 'kraft',
      title: 'Kraft inequality',
      kind: 'theorem',
      body: md`Kraft gives an exact criterion for which codeword lengths are possible for a prefix code.`,
      formulas: [
        {
          id: 'kraft-f',
          name: 'Kraft inequality',
          tex: md`\text{prefix code with lengths } l_1,\dots,l_m\ \text{exists}\iff\sum_{i=1}^m d^{-l_i}\le1`,
          intuition: md`A codeword of length $l$ occupies a node of the $d$-ary tree and blocks its whole subtree, which is a fraction $d^{-l}$ of the leaves at any deeper level. Disjoint subtrees can use at most the whole tree.`,
          conditions: 'Holds for d-ary alphabets, including multiplicities, and also for countably infinite codes.',
        },
      ],
      proof: md`(⇒) Let $l_{\mathrm{max}}=\max l_i$. A codeword at depth $l_i$ has $d^{l_{\mathrm{max}}-l_i}$ descendants at depth $l_{\mathrm{max}}$. By the prefix property these sets are disjoint, so $\sum_i d^{l_{\mathrm{max}}-l_i}\le d^{l_{\mathrm{max}}}$.
(⇐) Sort $l_1\le\dots\le l_m$. Repeatedly take the first free node at depth $l_i$ as codeword $i$ and delete its subtree. If no node at depth $l_i$ were free, all of them would be covered: $\sum_{j<i}d^{l_i-l_j}=d^{l_i}$, giving $\sum_{j\le i}d^{-l_j}>1$, a contradiction.`,
    },
    {
      id: 'mcmillan',
      title: 'McMillan inequality',
      kind: 'theorem',
      body: md`Can uniquely decodable codes do better than prefix codes? **No.** McMillan shows that their lengths satisfy the same Kraft inequality. So when searching for optimal codes, restricting to prefix codes loses nothing.`,
      formulas: [
        {
          id: 'mcmillan-f',
          name: 'McMillan inequality',
          tex: md`C\ \text{uniquely decodable}\ \Rightarrow\ \sum_i d^{-l_i}\le1`,
          conditions: 'Conversely, lengths satisfying the inequality admit a UD code (in fact a prefix one, by Kraft).',
        },
      ],
      proof: md`Consider the $k$-th extension $C^k$, which is non-singular by unique decodability. Then
$$\Big(\sum_xd^{-l(x)}\Big)^k=\sum_{x_1..x_k}d^{-l(x_1)-\dots-l(x_k)}=\sum_{m=1}^{kl_{\mathrm{max}}}a(m)d^{-m},$$
where $a(m)$ counts source strings with code length $m$. Unique decodability gives $a(m)\le d^m$, so the sum is at most $kl_{\mathrm{max}}$. Hence $\sum_xd^{-l(x)}\le(kl_{\mathrm{max}})^{1/k}\to1$ as $k\to\infty$.`,
    },
    {
      id: 'lower-bound',
      title: 'Entropy is a lower bound',
      kind: 'theorem',
      body: md`To find an optimal code, find the $d$-adic distribution $r_i=d^{-l_i}/\sum_jd^{-l_j}$ closest in relative entropy to $p$, then build the code as in the proof of Kraft. This is not easy directly; Huffman (Lecture 11) solves it.`,
      formulas: [
        {
          id: 'L-ge-H',
          name: 'Entropy lower bound',
          tex: md`L_C(X)\ge H_d(X)\quad\text{for every prefix (or UD) } d\text{-ary code, with equality iff } p_i=d^{-l_i}\ \forall i`,
          intuition: 'You cannot compress below the entropy on average.',
        },
      ],
      proof: md`$L-H_d=\sum_ip_il_i+\sum_ip_i\log_dp_i=\sum_ip_i\log_d\frac{p_i}{d^{-l_i}}$. Normalise $r_i=d^{-l_i}/c$ with $c=\sum_jd^{-l_j}\le1$ (Kraft). Then
$$L-H_d=D(p\|r)+\log_d\tfrac1c\ge0,$$
with equality iff $p=r$ and $c=1$.`,
    },
    {
      id: 'shannon-code',
      title: 'Shannon code lengths and the upper bound',
      kind: 'theorem',
      body: md`**Shannon code lengths:** $l_i=\lceil\log_d\frac1{p_i}\rceil$ (the lecture calls this naive Shannon–Fano coding). They satisfy Kraft, since $\sum d^{-\lceil\log_d1/p_i\rceil}\le\sum p_i=1$, and $\log_d\frac1{p_i}\le l_i<\log_d\frac1{p_i}+1$. Taking expectations: $H_d\le L<H_d+1$.`,
      formulas: [
        {
          id: 'opt-bounds',
          name: 'Bounds on the optimal expected length',
          tex: md`H_d(X)\le L^*<H_d(X)+1`,
          intuition: 'Rounding the ideal lengths log(1/p_i) up costs less than 1 symbol per message.',
        },
        {
          id: 'block',
          name: 'Block coding',
          tex: md`H(X)\le L_n<H(X)+\frac1n,\qquad L_n=\frac1nE\big[l(X_1\dots X_n)\big]`,
          intuition: md`Encode blocks of $n$ i.i.d. symbols as super-symbols. Since $H(X_1..X_n)=nH(X)$, the 1-bit overhead is spread over $n$ symbols, and we approach the entropy arbitrarily closely.`,
        },
        {
          id: 'wrong-code',
          name: 'Cost of a wrong model',
          tex: md`l(x)=\Big\lceil\log\frac1{q(x)}\Big\rceil:\qquad H(p)+D(p\|q)\le E_p[l(X)]<H(p)+D(p\|q)+1,\ \text{i.e. } H(p\|q)\le E_p[l]<H(p\|q)+1`,
          intuition: md`A code designed for $q$ used on data from $p$ costs the **cross-entropy**, which is $D(p\|q)$ bits more than necessary. This is the operational meaning of the KL divergence.`,
        },
      ],
      viz: [{ id: 'huffman', caption: 'The last column of the table shows the Shannon lengths ⌈log 1/pᵢ⌉; compare their expected length with Huffman.' }],
    },
  ],
  flashcards: [
    { id: 'l10-c1', front: 'Memoryless source', back: md`Messages $X_1,X_2,\dots$ are i.i.d. copies of a random variable $X$.` },
    { id: 'l10-c2', front: 'Non-singular code', back: 'Injective: distinct symbols get distinct codewords.' },
    { id: 'l10-c3', front: 'Uniquely decodable code', back: md`Its extension $C^*$ (concatenation) is non-singular: every encoded string has a unique source string.` },
    { id: 'l10-c4', front: 'Prefix (instantaneous) code', back: 'No codeword is a prefix of another; each codeword can be decoded as soon as its last symbol is read.' },
    { id: 'l10-c5', front: 'Kraft inequality', back: md`A $d$-ary prefix code with lengths $l_i$ exists iff $\sum_id^{-l_i}\le1$.` },
    { id: 'l10-c6', front: 'Proof idea of Kraft (⇒)', back: md`A codeword of length $l_i$ blocks $d^{l_{\mathrm{max}}-l_i}$ leaves at depth $l_{\mathrm{max}}$; the blocked sets are disjoint, so the total is $\le d^{l_{\mathrm{max}}}$.` },
    { id: 'l10-c7', front: 'McMillan inequality', back: md`Every uniquely decodable code satisfies $\sum d^{-l_i}\le1$, so UD codes offer no better lengths than prefix codes.` },
    { id: 'l10-c8', front: 'Proof idea of McMillan', back: md`$(\sum d^{-l})^k=\sum_m a(m)d^{-m}\le kl_{\mathrm{max}}$ since $a(m)\le d^m$ by unique decodability; take the $k$-th root and let $k\to\infty$.` },
    { id: 'l10-c9', front: 'Lower bound on the expected length', back: md`$L\ge H_d(X)$, with equality iff all $p_i=d^{-l_i}$ (dyadic for $d=2$).` },
    { id: 'l10-c10', front: 'Shannon code lengths and their guarantee', back: md`$l_i=\lceil\log_d1/p_i\rceil$: they satisfy Kraft and give $H\le L<H+1$.` },
    { id: 'l10-c11', front: 'Bounds on the optimal code length $L^*$', back: md`$H_d(X)\le L^*<H_d(X)+1$.` },
    { id: 'l10-c12', front: 'Block coding of n symbols', back: md`$H(X)\le L_n<H(X)+1/n$ per symbol.` },
    { id: 'l10-c13', front: 'Expected length when coding for q but data come from p', back: md`$H(p\|q)\le E_p[l]<H(p\|q)+1$, where $H(p\|q)=H(p)+D(p\|q)$.` },
    { id: 'l10-c14', front: 'Example: non-singular but not UD', back: md`$\{0,010,01,10\}$: "010" = 2 = 1·4 = 3·1.` },
  ],
  quiz: [
    {
      id: 'l10-q1',
      type: 'mcq',
      prompt: md`Can a binary prefix code have codeword lengths $1,2,3,3,3$?`,
      options: ['Yes, Kraft sum = 1', 'No, Kraft sum = 9/8 > 1', 'Yes, but it is not uniquely decodable', 'Only as a ternary code'],
      answer: 1,
      explanation: md`$\frac12+\frac14+3\cdot\frac18=\frac98>1$. By McMillan, not even a UD code exists.`,
    },
    {
      id: 'l10-q2',
      type: 'numeric',
      prompt: md`Compute the Kraft sum for binary lengths $2,2,3,3,3$.`,
      answer: 7 / 8,
      explanation: md`$2\cdot\frac14+3\cdot\frac18=\frac78\le1$. A prefix code exists, with room for one more codeword of length 3.`,
    },
    {
      id: 'l10-q3',
      type: 'mcq',
      prompt: md`The code $\{0, 01, 11\}$ is…`,
      options: ['singular', 'non-singular but not UD', 'UD but not prefix', 'prefix'],
      answer: 2,
      explanation: md`0 is a prefix of 01, so it is not a prefix code. It is UD: reading from the right, every codeword ends uniquely (Sardinas–Patterson confirms).`,
    },
    {
      id: 'l10-q4',
      type: 'numeric',
      prompt: md`$p=(0.4,0.3,0.2,0.1)$. What is the expected length of the Shannon code $l_i=\lceil\log_2\frac1{p_i}\rceil$?`,
      answer: 0.4 * 2 + 0.3 * 2 + 0.2 * 3 + 0.1 * 4,
      explanation: md`Lengths: $\lceil1.32\rceil=2$, $\lceil1.74\rceil=2$, $\lceil2.32\rceil=3$, $\lceil3.32\rceil=4$. $L=0.8+0.6+0.6+0.4=2.4$. ($H\approx1.846$, Huffman gets $1.9$.)`,
    },
    {
      id: 'l10-q5',
      type: 'truefalse',
      prompt: md`There are distributions for which a uniquely decodable (non-prefix) code has strictly smaller expected length than every prefix code.`,
      answer: false,
      explanation: 'McMillan: UD lengths satisfy Kraft, and Kraft guarantees a prefix code with exactly those lengths.',
    },
    {
      id: 'l10-q6',
      type: 'numeric',
      prompt: md`For a dyadic distribution $(\frac12,\frac14,\frac18,\frac1{16},\frac1{16})$, what is the optimal expected length $L^*$ (bits)?`,
      answer: 1.875,
      explanation: md`Dyadic, so $L^*=H=\frac12+\frac24+\frac38+\frac4{16}+\frac4{16}=1.875$.`,
    },
    {
      id: 'l10-q7',
      type: 'mcq',
      prompt: md`Coding blocks of $n$ i.i.d. symbols with an optimal code, the expected length per symbol $L_n$ satisfies…`,
      options: [md`$H\le L_n<H+1$`, md`$H\le L_n<H+\frac1n$`, md`$L_n=H$ exactly`, md`$H-\frac1n<L_n\le H$`],
      answer: 1,
      explanation: md`$nH\le E[l]<nH+1$; divide by $n$.`,
    },
    {
      id: 'l10-q8',
      type: 'numeric',
      prompt: md`The true distribution is $p=(\frac12,\frac12)$, but you use the code built for $q=(\frac14,\frac34)$ with lengths $\lceil\log\frac1q\rceil=(2,1)$. What is the expected length under $p$?`,
      answer: 1.5,
      explanation: md`$\frac12\cdot2+\frac12\cdot1=1.5$. This lies in $[H(p\|q),H(p\|q)+1)=[1.2075,2.2075)$.`,
    },
  ],
};
