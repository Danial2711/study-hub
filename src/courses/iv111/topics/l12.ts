import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l12: Topic = {
  id: 'l12',
  lecture: 12,
  examGroup: 'Q7',
  title: 'Channel capacity & the channel coding theorem',
  summary: md`Discrete memoryless channels, $(M,n)$ codes, error probabilities and code rate, channel capacity $C=\max_{p_X}I(X;Y)$ for the noiseless, binary symmetric, erasure, noisy-typewriter and symmetric channels, and Shannon's channel coding theorem.`,
  sections: [
    {
      id: 'system',
      title: 'Communication system',
      kind: 'concept',
      body: md`$$W\ \xrightarrow{\text{encoder}}\ X^n\ \xrightarrow{\text{channel } p(y\mid x)}\ Y^n\ \xrightarrow{\text{decoder}}\ \hat W$$

A message $W$ is encoded into $n$ channel input symbols, the channel distorts them, and the decoder produces an estimate $\hat W$.

Transmission is **dual to compression**. Compression *removes* redundancy; transmission *adds* redundancy in a controlled way to fight channel errors. We use **block codes**: all codewords have the same length $n$.`,
    },
    {
      id: 'channel',
      title: 'Discrete memoryless channels',
      kind: 'definition',
      body: md`A **discrete channel** $(\mathcal X,p(y\mid x),\mathcal Y)$ consists of an input alphabet, an output alphabet and a **transition matrix** $p(y\mid x)$: row $x$ is the output distribution when $x$ is sent.

- **Without feedback:** $p(y_k\mid x^k,y^{k-1})=p(y_k\mid x^k)$.
- **Memoryless:** $p(y_k\mid x^k,y^{k-1})=p(y_k\mid x_k)$; each output depends only on the current input.

The **$n$-th extension** of a discrete memoryless channel (DMC) models $n$ uses: $p(y^n\mid x^n)=\prod_{i=1}^np(y_i\mid x_i)$.`,
    },
    {
      id: 'codes',
      title: '(M, n) codes, errors and rate',
      kind: 'definition',
      body: md`An **$(M,n)$ code** consists of:
1. a message set $\{1,\dots,M\}$;
2. an encoder $f:\{1..M\}\to\mathcal X^n$, whose values are the codewords $f(1),\dots,f(M)$;
3. a deterministic decoder $g:\mathcal Y^n\to\{1..M\}$.`,
      formulas: [
        {
          id: 'err',
          name: 'Error probabilities',
          tex: md`\lambda_i=P\big(g(Y^n)\ne i\mid X^n=f(i)\big),\qquad\lambda_{\mathrm{max}}=\max_i\lambda_i,\qquad P_e^{(n)}=\frac1M\sum_{i=1}^M\lambda_i\le\lambda_{\mathrm{max}}`,
          intuition: md`$\lambda_i$ is the error when message $i$ is sent, $\lambda_{\mathrm{max}}$ the worst case, and $P_e^{(n)}$ the average (the error for a uniformly random message).`,
        },
        {
          id: 'rate',
          name: 'Code rate',
          tex: md`R=\frac{\log_2M}{n}\ \text{bits per channel use}`,
          intuition: 'Number of non-redundant message bits per transmitted symbol.',
          conditions: md`The triple-repetition code $f(1)=000$, $f(2)=111$ is a $(2,3)$ code with $R=\frac13$. An $(8,3)$ code has $R=1$.`,
        },
      ],
      examples: [
        {
          title: 'Repetition code on a BSC',
          problem: md`BSC with crossover $p$, code $f(1)=000$, $f(2)=111$, majority decoding. What is the error probability, and when does it beat sending 1 bit uncoded?`,
          solution: md`By symmetry $\lambda_1=\lambda_2$, so $P_e=P(\text{at least 2 of 3 bits flip})=3p^2(1-p)+p^3=3p^2-2p^3$.
It beats $p$ iff $3p^2-2p^3<p\iff p(2p-1)(p-1)>0\iff 0<p<\frac12$. The price is rate $\frac13$.`,
        },
      ],
    },
    {
      id: 'capacity',
      title: 'Channel capacity',
      kind: 'definition',
      body: md`Intuitively, capacity is the **noiseless throughput** of the channel: the highest rate at which information can be sent with arbitrarily low error.`,
      formulas: [
        {
          id: 'cap-def',
          name: 'Channel capacity',
          tex: md`C=\max_{p_X}I(X;Y)=\max_{p_X}\big[H(Y)-H(Y\mid X)\big]`,
          symbols: [
            { sym: md`p_X`, meaning: 'input distribution, the only thing we can choose' },
            { sym: md`I(X;Y)`, meaning: 'information about the input that survives the channel' },
          ],
          intuition: 'Choose how often to use each input symbol so that the output reveals as much as possible about the input.',
          conditions: md`$0\le C\le\min(\log|\mathcal X|,\log|\mathcal Y|)$.`,
        },
      ],
      viz: [{ id: 'channel' }],
    },
    {
      id: 'examples',
      title: 'Capacities of standard channels',
      kind: 'theorem',
      body: md`| channel | capacity | achieved by |
|---|---|---|
| noiseless binary | $1$ | uniform input |
| noisy with non-overlapping outputs | $1$ | uniform; every output reveals its input |
| noiseless quaternary | $2$ | uniform |
| **binary symmetric** BSC($p$) | $1-H(p)$ | uniform |
| **binary erasure** BEC($\alpha$) | $1-\alpha$ | uniform |
| noisy typewriter (26 letters, stay or shift w.p. $\frac12$) | $\log26-1=\log13$ | uniform; or use every other letter error-free |
| **symmetric** ($c$ outputs) | $\log c-H(\text{row})$ | uniform |`,
      formulas: [
        {
          id: 'bsc',
          name: 'Binary symmetric channel',
          tex: md`I(X;Y)=H(Y)-\sum_xp(x)H(Y\mid X=x)=H(Y)-H(p)\le1-H(p)\quad\Rightarrow\quad C_{\mathrm{BSC}}=1-H(p)`,
          intuition: md`Every input suffers the same noise $H(p)$, so maximise $H(Y)$; a uniform input gives a uniform output. $C=1$ for $p\in\{0,1\}$ (for $p=1$, just flip every bit back) and $C=0$ for $p=\frac12$.`,
        },
        {
          id: 'bec',
          name: 'Binary erasure channel',
          tex: md`H(Y)=H(\alpha)+(1-\alpha)H(X)\ \Rightarrow\ C_{\mathrm{BEC}}=\max_{p_X}(1-\alpha)H(X)=1-\alpha`,
          intuition: 'A fraction α of the symbols is visibly lost, so only 1 − α of them get through.',
          conditions: md`Uses the indicator $E$ of "not erased": $H(Y)=H(E)+H(Y\mid E)$.`,
        },
        {
          id: 'sym',
          name: 'Symmetric channels',
          tex: md`Y=X+Z\bmod c:\quad I(X;Y)=H(Y)-H(Z)\le\log c-H(Z)\ \Rightarrow\ C=\log c-H(\text{row of the matrix})`,
          intuition: 'All rows are permutations of each other and so are all columns. A uniform input then gives a uniform output, because columns sum to the same value.',
          conditions: md`Example: $\begin{pmatrix}.3&.2&.5\\.5&.3&.2\\.2&.5&.3\end{pmatrix}$ gives $C=\log3-H(.3,.2,.5)\approx1.585-1.485=0.0995$ bits.`,
        },
      ],
      examples: [
        {
          title: 'BSC capacity',
          problem: md`Compute the capacity of a BSC with $p=0.11$.`,
          solution: md`$H(0.11)=-0.11\log0.11-0.89\log0.89\approx0.350+0.150=0.500$, so $C\approx0.5$ bits per use. Reliable communication is possible at any rate below one half.`,
        },
      ],
    },
    {
      id: 'theorem',
      title: 'The channel coding theorem',
      kind: 'theorem',
      body: md`Shannon (1948) gave only a proof outline; Feinstein (1954) gave the first rigorous proof. No *construction* of capacity-achieving codes was known until **polar codes** (Arıkan, 2009), sixty years later.

**Idea.** Use only a subset of the $n$-symbol sequences as codewords, chosen so that the sets of likely outputs of different codewords are (almost) **disjoint**, as in the noisy typewriter where every other letter is used. For large $n$ there are about $2^{nC}$ such distinguishable codewords.`,
      formulas: [
        {
          id: 'cct',
          name: 'Channel coding theorem',
          tex: md`R<C\ \Rightarrow\ \forall\varepsilon>0\ \exists\ \text{codes of rate } R\text{ (large } n)\text{ with } \lambda_{\mathrm{max}}<\varepsilon;\qquad R>C\ \Rightarrow\ \lambda_{\mathrm{max}}\ \text{bounded away from } 0`,
          intuition: 'Capacity is a sharp threshold. Below it, error can be made as small as you like (with long codes); above it, errors are unavoidable.',
          pitfalls: 'Repetition codes only drive the error down by sending the rate to 0. The theorem promises vanishing error at a positive rate.',
        },
      ],
      viz: [{ id: 'channel', props: { kind: 'bsc' }, caption: 'The lower panel plots repetition codes in the rate–error plane against the capacity threshold.' }],
    },
  ],
  flashcards: [
    { id: 'l12-c1', front: 'Discrete channel', back: md`$(\mathcal X,p(y\mid x),\mathcal Y)$: input alphabet, transition matrix, output alphabet.` },
    { id: 'l12-c2', front: 'Memoryless channel', back: md`$p(y_k\mid x^k,y^{k-1})=p(y_k\mid x_k)$; the $n$-th extension has $p(y^n\mid x^n)=\prod p(y_i\mid x_i)$.` },
    { id: 'l12-c3', front: '(M, n) code', back: md`Messages $1..M$, an encoder $f:\{1..M\}\to\mathcal X^n$, and a decoder $g:\mathcal Y^n\to\{1..M\}$.` },
    { id: 'l12-c4', front: '$\\lambda_i$, $\\lambda_{\\max}$, $P_e^{(n)}$', back: md`$\lambda_i=P(g(Y^n)\ne i\mid X^n=f(i))$; the max over $i$; the average $\frac1M\sum\lambda_i\le\lambda_{\mathrm{max}}$.` },
    { id: 'l12-c5', front: 'Code rate', back: md`$R=\frac{\log_2M}{n}$ bits per channel use.` },
    { id: 'l12-c6', front: 'Channel capacity', back: md`$C=\max_{p_X}I(X;Y)$.` },
    { id: 'l12-c7', front: 'Capacity of BSC(p)', back: md`$1-H(p)$, achieved by a uniform input.` },
    { id: 'l12-c8', front: 'Capacity of BEC(α)', back: md`$1-\alpha$.` },
    { id: 'l12-c9', front: 'Capacity of a symmetric channel', back: md`$\log|\mathcal Y|-H(\text{row})$, achieved by a uniform input.` },
    { id: 'l12-c10', front: 'Noisy typewriter (26 letters) capacity', back: md`$\log26-1=\log13$; use every other letter for error-free transmission.` },
    { id: 'l12-c11', front: 'Channel coding theorem', back: md`$R<C$: codes with arbitrarily small $\lambda_{\mathrm{max}}$ exist. $R>C$: $\lambda_{\mathrm{max}}$ is bounded away from 0.` },
    { id: 'l12-c12', front: 'Error of the 3-fold repetition code on BSC(p)', back: md`$3p^2-2p^3$, better than $p$ iff $p<\frac12$.` },
    { id: 'l12-c13', front: 'General bounds on capacity', back: md`$0\le C\le\min(\log|\mathcal X|,\log|\mathcal Y|)$.` },
    { id: 'l12-c14', front: 'Who proved the channel coding theorem, and who gave a construction?', back: 'Shannon 1948 (outline), Feinstein 1954 (rigorous proof), Arıkan 2009 (polar codes, an explicit construction).' },
  ],
  quiz: [
    {
      id: 'l12-q1',
      type: 'numeric',
      prompt: md`Capacity of a BSC with crossover probability $p=0.1$ (bits)?`,
      answer: 1 - (-(0.1 * Math.log2(0.1)) - 0.9 * Math.log2(0.9)),
      explanation: md`$H(0.1)\approx0.469$, so $C\approx0.531$.`,
    },
    {
      id: 'l12-q2',
      type: 'numeric',
      prompt: md`Capacity of a binary erasure channel with $\alpha=0.25$?`,
      answer: 0.75,
      explanation: md`$C=1-\alpha=0.75$.`,
    },
    {
      id: 'l12-q3',
      type: 'numeric',
      prompt: md`Rate of a $(16,8)$ code?`,
      answer: 0.5,
      explanation: md`$\log_216/8=4/8=0.5$.`,
    },
    {
      id: 'l12-q4',
      type: 'mcq',
      prompt: md`A BSC has $p=0.9$. Its capacity is…`,
      options: ['≈ 0', '≈ 0.531', '1', 'undefined'],
      answer: 1,
      explanation: md`$1-H(0.9)=1-H(0.1)\approx0.531$. The receiver can simply invert every bit.`,
    },
    {
      id: 'l12-q5',
      type: 'numeric',
      prompt: md`Error probability of the 3-fold repetition code with majority decoding on a BSC with $p=0.1$?`,
      answer: 0.028,
      explanation: md`$3p^2-2p^3=0.03-0.002=0.028$.`,
    },
    {
      id: 'l12-q6',
      type: 'truefalse',
      prompt: md`For any rate $R<C$, a fixed short block length (e.g. $n=3$) suffices to achieve arbitrarily small error probability.`,
      answer: false,
      explanation: md`The theorem needs a **large enough** block length $n$; the error goes to 0 as $n\to\infty$ at a fixed rate $R<C$.`,
    },
    {
      id: 'l12-q7',
      type: 'numeric',
      prompt: md`Capacity (bits) of a noisy typewriter with 8 letters, each received correctly or as the next letter with probability $\frac12$?`,
      answer: 2,
      explanation: md`$\log8-1=2$; use every other letter (4 letters, error-free).`,
    },
    {
      id: 'l12-q8',
      type: 'numeric',
      prompt: md`Symmetric channel on $\{0,1,2\}$ with rows that are permutations of $(0.5,0.25,0.25)$. Capacity in bits?`,
      answer: Math.log2(3) - 1.5,
      explanation: md`$\log_23-H(0.5,0.25,0.25)=1.585-1.5=0.085$.`,
    },
    {
      id: 'l12-q9',
      type: 'mcq',
      prompt: md`Which input distribution achieves the capacity of a BSC?`,
      options: ['the one maximising H(X|Y)', 'uniform', 'deterministic X = 0', 'it depends on p'],
      answer: 1,
      explanation: 'H(Y|X) = H(p) does not depend on the input, so we maximise H(Y), which a uniform input achieves.',
    },
  ],
};
