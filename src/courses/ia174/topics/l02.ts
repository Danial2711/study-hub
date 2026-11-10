import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l02: Topic = {
  id: 'l02',
  lecture: 2,
  tag: 'L02',
  examGroup: 'S2',
  title: 'Semantic security, PRGs, stream ciphers',
  summary: md`Efficient adversaries and negligible advantage; the semantic-security game; pseudorandom generators and their attack game; stream ciphers and the first security reduction (secure PRG ⇒ semantically secure stream cipher); the ChaCha PRG.`,
  sections: [
    {
      id: 'adversary',
      title: 'Adversaries in attack games',
      kind: 'concept',
      importance: 'understand',
      body: md`An **adversary** is an *interactive (possibly randomized) algorithm*: it can ask the environment for inputs, send strings out, compute internally, in any order prescribed by the game. In the perfect-security game it first outputs two messages, then receives a ciphertext, then outputs one bit.

**Efficient adversary:**
- simplified view: runs in reasonable time in practice;
- proper view: runs in time **polynomial** in the security parameter (key length).

You should be able to *write down a concrete adversary* for a given game: what it sends, what it computes, what it outputs.`,
    },
    {
      id: 'semantic',
      title: 'Semantic security',
      kind: 'definition',
      importance: 'must',
      body: md`Perfect security asks too much (Shannon). We only demand that **efficient** adversaries gain **negligible** advantage.

**Semantic-security attack game** against $(E,D)$:
1. Challenger samples $k\leftarrow\mathcal K$ and $b\leftarrow\{0,1\}$ uniformly; both secret.
2. Adversary sends $m_0,m_1$ of the same length.
3. Challenger returns $c=E(k,m_b)$.
4. Adversary outputs $g$; wins iff $g=b$.

(The same game as for perfect security — what changes is *who* may play and *how much* they may win.)

**Semantic advantage:** $\mathrm{ADV}_{\mathrm{Sem}}(\mathcal E,A)=\left|P(A\text{ wins})-\tfrac12\right|$.

$\mathcal E$ is **ε-semantically secure** if $\mathrm{ADV}_{\mathrm{Sem}}(\mathcal E,A)\le\varepsilon$ for every efficient $A$; **semantically secure** if this holds for a negligible $\varepsilon$.`,
      formulas: [
        {
          id: 'adv-sem',
          name: 'Semantic advantage',
          tex: md`\mathrm{ADV}_{\mathrm{Sem}}(\mathcal E,A)=\Bigl|P\bigl(A\text{ wins the semantic game against }\mathcal E\bigr)-\tfrac12\Bigr|`,
          intuition: 'How much better than a coin flip the adversary distinguishes encryptions of m₀ from encryptions of m₁.',
          pitfalls: 'An adversary that always guesses wrong also has advantage ½ — flip its answer and it always wins. Hence the absolute value.',
        },
      ],
    },
    {
      id: 'negligible',
      title: 'Negligible values',
      kind: 'definition',
      importance: 'must',
      body: md`- **Scalar view:** a probability so small that the event is never observed in practice, e.g. $\varepsilon\le2^{-128}$.
- **Functional view:** $\varepsilon(n)$ is negligible if it decreases faster than the inverse of **every** polynomial: for every polynomial $p$ there is $n_0$ with $\varepsilon(n)<1/p(n)$ for all $n\ge n_0$.

The notions fit together: efficient = polynomial time, negligible = below every inverse polynomial. An efficient adversary repeating a negligible-advantage attack polynomially many times still has negligible success — it cannot amplify its way out.

Examples: $2^{-n}$, $2^{-\sqrt n}$, $n^{-\log n}$ are negligible; $1/n^{10}$ and $1/2^{\log_2 n}=1/n$ are not.`,
      formulas: [
        {
          id: 'negl',
          name: 'Negligible function',
          tex: md`\forall\text{ polynomial }p\ \exists n_0\ \forall n\ge n_0:\quad \varepsilon(n)<\frac1{p(n)}`,
          intuition: 'Eventually smaller than 1/n, 1/n², 1/n¹⁰⁰, … — smaller than any inverse polynomial.',
        },
      ],
      viz: [{ id: 'negligible' }],
    },
    {
      id: 'prg',
      title: 'Pseudorandom generators and their security',
      kind: 'definition',
      importance: 'must',
      body: md`Idea: instead of a key as long as the message, use a short **seed** and *deterministically expand* it into a long, random-looking string. Programming-language PRNGs are **not** suitable — we need *cryptographically secure* generators.

A **PRG** is a function $G:\mathcal S\to\mathcal R$, typically $\mathcal S=\{0,1\}^\ell$ and $\mathcal R=\{0,1\}^L$ with $\ell\ll L$. Its outputs are **keystreams**.

**PRG attack game:**
1. Challenger samples $i\in\{\mathit{rand},\mathit{fake}\}$ uniformly. If *rand*: $r\leftarrow\mathcal R$ uniformly. If *fake*: $s\leftarrow\mathcal S$ uniformly and $r=G(s)$.
2. The adversary receives $r$, analyses it and outputs $g\in\{\mathit{rand},\mathit{fake}\}$; wins iff $g=i$.

$\mathrm{ADV}_{\mathrm{PRG}}(G,A)=|P(A\text{ wins})-\tfrac12|$; $G$ is **ε-secure** if every efficient $A$ has advantage $\le\varepsilon$, **secure** if ε is negligible.

**Insecure PRG example:** if the last output bit is the XOR of the others, the adversary that says *fake* iff the parity check holds wins with probability $\tfrac12\cdot1+\tfrac12\cdot\tfrac12=\tfrac34$ — advantage $\tfrac14$. More generally, any efficiently checkable property of the output that random strings satisfy with a different probability breaks the PRG.`,
      formulas: [
        {
          id: 'adv-prg',
          name: 'PRG advantage',
          tex: md`\mathrm{ADV}_{\mathrm{PRG}}(G,A)=\Bigl|P\bigl(A\text{ wins the PRG game}\bigr)-\tfrac12\Bigr|`,
          intuition: 'How well A tells G(s) for a random seed from a truly random string.',
        },
      ],
      viz: [{ id: 'attackGame', props: { preset: 'prg-weak', presets: ['prg-weak', 'ss-weakprg', 'ss-otp'] } }],
    },
    {
      id: 'stream',
      title: 'Stream ciphers from PRGs',
      kind: 'theorem',
      importance: 'must',
      body: md`**Stream cipher defined by $G:\{0,1\}^\ell\to\{0,1\}^L$:** a cipher over $(\{0,1\}^\ell,\{0,1\}^{\le L},\{0,1\}^{\le L})$ with
$$E_G(k,m)=m\oplus G(k)[..\mathrm{len}(m)],\qquad D_G(k,c)=c\oplus G(k)[..\mathrm{len}(c)].$$
It is the one-time pad with the pad replaced by a pseudorandom keystream.

**Theorem.** If $G$ is an ε-secure PRG, then $\mathcal E_G$ is **2ε-semantically secure**.

**Limitations (same as OTP, even with a secure $G$):** malleable (needs a MAC, later), and **key reuse is insecure** (keystream reuse = two-time pad; solved with nonces).`,
      proof: md`**Security reduction (contraposition).** Let $B$ be a semantic adversary against $\mathcal E_G$ with advantage $\varepsilon'$. Build a PRG adversary $A$ using $B$ as a black box:
1. $A$ receives $r$ from its PRG challenger.
2. $A$ asks $B$ for $m_0,m_1$ (length $i$), samples its own bit $b$ and gives $B$ the ciphertext $c=r[..i]\oplus m_b$.
3. If $B$ guesses $b$ correctly, $A$ answers *fake*, otherwise *rand*.

If $r=G(s)$, $B$ sees a real encryption, so it wins w.p. $\tfrac12\pm\varepsilon'$. If $r$ is uniform, $c$ is an OTP encryption and $B$ wins w.p. exactly $\tfrac12$. Hence
$$P(A\text{ wins})=\tfrac12\bigl(\tfrac12\pm\varepsilon'\bigr)+\tfrac12\cdot\tfrac12=\tfrac12\pm\tfrac{\varepsilon'}2,$$
so $\mathrm{ADV}_{\mathrm{PRG}}(G,A)=\varepsilon'/2$. If every efficient PRG adversary has advantage $\le\varepsilon$, then $\varepsilon'\le2\varepsilon$. $A$ is efficient because $B$ is.`,
      formulas: [
        {
          id: 'stream-def',
          name: 'Stream cipher from a PRG',
          tex: md`E_G(k,m)=m\oplus G(k)[..\,\mathrm{len}(m)]`,
          symbols: [
            { sym: 'G', meaning: 'pseudorandom generator, seed = key' },
            { sym: md`x[..i]`, meaning: md`first $i$ bits of $x$` },
          ],
          intuition: 'One-time pad with a pseudorandom pad.',
        },
        {
          id: 'stream-thm',
          name: 'PRG ⇒ stream cipher (reduction bound)',
          tex: md`\mathrm{ADV}_{\mathrm{Sem}}(\mathcal E_G,B)=2\,\mathrm{ADV}_{\mathrm{PRG}}(G,A_B)\le2\varepsilon`,
          intuition: 'Any distinguisher for the cipher becomes a distinguisher for the PRG with half the advantage.',
        },
      ],
    },
    {
      id: 'prg-existence',
      title: 'Do secure PRGs exist?',
      kind: 'concept',
      importance: 'context',
      body: md`- Nobody has proven any PRG secure: existence of a secure PRG would imply $P\neq NP$.
- There are *conditionally* secure PRGs (secure if, e.g., factoring is hard), but they are too slow and not used in practice.
- Practical PRGs are trusted because no efficient attack with non-negligible advantage is known; they use **iterated round** constructions, e.g. Salsa20 (2005) and ChaCha (2008), both by D. J. Bernstein.`,
    },
    {
      id: 'chacha',
      title: 'ChaCha',
      kind: 'concept',
      importance: 'understand',
      body: md`**Interface.** ChaCha maps a 256-bit seed (plus a nonce; set it to 0 for now) to a keystream produced in **512-bit blocks** $G(s)=b_0\|b_1\|b_2\|\cdots$, where block $b_i=B_{CH}(i,s,n)$ depends only on the counter $i$, the seed and the nonce — easy to parallelise and to seek. Although ChaCha is a stream cipher, its core is a *block function*: essentially a block cipher in counter mode.

**Block function** $B_{CH}(i,s,n)$:
1. $a\leftarrow$ pad $(i,s,n)$ to a 512-bit state, viewed as a $4\times4$ matrix of 32-bit words: row 1 holds four **constants** (ASCII "expand 32-byte k"), rows 2–3 the key, row 4 the counter and nonce.
2. $b\leftarrow\mathrm{Permute}(a)$: 20 rounds alternating **column** rounds (QuarterRound on each column) and **diagonal** rounds (on each diagonal).
3. return $a\boxplus_{32}b$ word-wise.

**QuarterRound(a, b, c, d)** — only **ARX** operations (Add mod $2^{32}$, Rotate, XOR):
$$\begin{aligned}a&\mathrel{+}=b;\ d\mathrel{\oplus}=a;\ d\lll16\\ c&\mathrel{+}=d;\ b\mathrel{\oplus}=c;\ b\lll12\\ a&\mathrel{+}=b;\ d\mathrel{\oplus}=a;\ d\lll8\\ c&\mathrel{+}=d;\ b\mathrel{\oplus}=c;\ b\lll7\end{aligned}$$

**Why the final word-wise addition?** Every step of Permute is invertible and public. Without the addition, the output block *is* the permuted state: anyone could run the rounds backwards and read the key from rows 2–3. Adding the input back destroys invertibility, since inverting would require the very input you are looking for.

**Nothing-up-my-sleeve constants:** the constants are an obviously innocent value (an ASCII string), so the designer could not have hidden a trapdoor in them; they break symmetries of the all-zero state.

**Facts:** single rounds can be attacked statistically, iterating them gives diffusion; the best public attack breaks 8 of 20 rounds. ChaCha is usually faster than AES on hardware **without** AES/Galois-field acceleration. ChaCha20-Poly1305 adds authentication (AEAD).`,
      viz: [{ id: 'chacha' }],
    },
  ],
  flashcards: [
    { id: 'l02-c1', front: 'Semantic-security game', back: md`Challenger: $k,b$ random. Adversary: $m_0,m_1$ of equal length. Challenger: $c=E(k,m_b)$. Adversary outputs $g$; wins iff $g=b$.` },
    { id: 'l02-c2', front: 'Semantic advantage and semantic security', back: md`$\mathrm{ADV}=|P(\text{win})-\tfrac12|$. ε-secure: ADV ≤ ε for every efficient adversary; secure: for negligible ε.` },
    { id: 'l02-c3', front: 'Negligible function (formal)', back: md`For every polynomial $p$ there is $n_0$ such that $\varepsilon(n)<1/p(n)$ for all $n\ge n_0$.` },
    { id: 'l02-c4', front: 'Efficient adversary (formal)', back: 'Runs in time polynomial in the security parameter (e.g. key length).' },
    { id: 'l02-c5', front: 'PRG attack game', back: md`Challenger picks rand/fake; rand: $r$ uniform in $\mathcal R$; fake: $r=G(s)$ for uniform seed $s$. Adversary sees $r$ and guesses rand/fake.` },
    { id: 'l02-c6', front: 'Stream cipher defined by PRG G', back: md`$E_G(k,m)=m\oplus G(k)[..\mathrm{len}(m)]$, same for decryption.` },
    { id: 'l02-c7', front: 'Theorem: secure PRG ⇒ ?', back: 'ε-secure PRG ⇒ the stream cipher is 2ε-semantically secure.' },
    { id: 'l02-c8', front: 'Reduction PRG ← stream cipher: what does A do?', back: md`Gets $r$, asks $B$ for $m_0,m_1$, picks $b$, gives $c=r[..i]\oplus m_b$; answers *fake* iff $B$ guesses $b$.` },
    { id: 'l02-c9', front: 'Why is ADV_PRG = ADV_Sem / 2 in that reduction?', back: 'If r is random, B sees an OTP encryption and wins w.p. exactly ½; only the fake case contributes B’s advantage, and it happens with probability ½.' },
    { id: 'l02-c10', front: 'Do provably secure PRGs exist?', back: 'Unknown — it would imply P ≠ NP. Conditionally secure ones exist (e.g. from factoring) but are slow; practice uses unbroken iterated designs.' },
    { id: 'l02-c11', front: 'ChaCha: what is ARX?', back: 'Add (mod 2³²), Rotate, XOR — the only operations ChaCha uses. Cheap in hardware and software, constant time.' },
    { id: 'l02-c12', front: 'ChaCha: why add the input to the permuted state?', back: 'The permutation is publicly invertible; without the addition anyone could invert an output block and recover the key.' },
    { id: 'l02-c13', front: 'Nothing-up-my-sleeve constants', back: 'Constants chosen in an obviously innocent way (ChaCha: ASCII "expand 32-byte k"), so the designer cannot hide a backdoor in them.' },
    { id: 'l02-c14', front: 'Why is ChaCha a stream cipher but "essentially a block cipher"?', back: 'It outputs the keystream in 512-bit blocks bᵢ = B(i, s, n), each computed independently from the counter: a block function used in counter mode.' },
    { id: 'l02-c15', front: 'When is ChaCha faster than AES?', back: 'On hardware without AES / Galois-field instructions (e.g. many phones, embedded CPUs).' },
    { id: 'l02-c16', front: 'Limitations of every stream cipher', back: 'Malleable, and the key (keystream) must never be reused — the same weaknesses as OTP.' },
  ],
  quiz: [
    {
      id: 'l02-q1',
      type: 'mcq',
      difficulty: 1,
      prompt: md`Which function is **not** negligible in $n$?`,
      options: [md`$2^{-n}$`, md`$n^{-\log n}$`, md`$n^{-100}$`, md`$2^{-\sqrt n}$`],
      answer: 2,
      explanation: md`$n^{-100}$ is an inverse polynomial; a negligible function must eventually be below $n^{-101}$, which $n^{-100}$ never is.`,
    },
    {
      id: 'l02-q2',
      type: 'mcq',
      difficulty: 1,
      prompt: md`An adversary wins the semantic-security game with probability $0.1$. Its advantage is`,
      options: ['0.1', '0.4', '0.9', '−0.4'],
      answer: 1,
      explanation: md`$|0.1-0.5|=0.4$ — flipping its output would win with probability $0.9$.`,
    },
    {
      id: 'l02-q3',
      type: 'mcq',
      difficulty: 1,
      prompt: md`What happens in the PRG attack game when the challenger picks *fake*?`,
      options: [md`$r$ is chosen uniformly from $\mathcal R$`, md`$r=G(s)$ for a uniformly random seed $s$`, md`$r=G(0)$`, md`the adversary chooses the seed`],
      answer: 1,
      explanation: 'Fake = output of the generator on a random secret seed.',
    },
    {
      id: 'l02-q4',
      type: 'mcq',
      difficulty: 2,
      prompt: md`$G:\{0,1\}^{127}\to\{0,1\}^{128}$, $G(s)=s\|1$. The best PRG advantage is about`,
      options: ['0', md`$2^{-127}$`, md`$\tfrac14$`, md`$\tfrac12$`],
      answer: 2,
      explanation: md`Say *fake* iff the last bit is 1. If the challenger chose fake, the last bit is always 1: correct. If rand, the last bit is 1 only w.p. ½: correct w.p. ½. So $P(\text{win})=\tfrac12\cdot1+\tfrac12\cdot\tfrac12=\tfrac34$ and the advantage is $\tfrac14$. It cannot be higher: random strings ending in 1 look exactly like outputs of $G$.`,
    },
    {
      id: 'l02-q5',
      type: 'mcq',
      difficulty: 2,
      prompt: md`If $G$ is a $2^{-80}$-secure PRG, the stream cipher $\mathcal E_G$ is guaranteed to be`,
      options: [md`$2^{-80}$-semantically secure`, md`$2^{-79}$-semantically secure`, md`$2^{-160}$-semantically secure`, 'perfectly secure'],
      answer: 1,
      explanation: md`The theorem gives $2\varepsilon=2^{-79}$.`,
    },
    {
      id: 'l02-q6',
      type: 'mcq',
      difficulty: 1,
      prompt: md`Which operations does a ChaCha quarter round use?`,
      options: ['S-box lookups and XOR', 'Addition mod 2³², rotation and XOR', 'Multiplication in GF(2⁸)', 'Modular exponentiation'],
      answer: 1,
      explanation: 'ChaCha is an ARX design.',
    },
    {
      id: 'l02-q7',
      type: 'mcq',
      difficulty: 2,
      prompt: md`Why does ChaCha add the input state to the output of its permutation?`,
      options: ['To make the keystream longer', 'To make the block function non-invertible without knowing the input (otherwise the key could be recovered)', 'To provide authentication', 'To make it faster'],
      answer: 1,
      explanation: 'The permutation alone is publicly invertible; feed-forward prevents recovering the input (which contains the key) from an output block.',
    },
    {
      id: 'l02-q8',
      type: 'mcq',
      difficulty: 3,
      prompt: md`$G:\{0,1\}^{127}\to\{0,1\}^{128}$, $G(s)=s\,\|\,\bigoplus_i s[i]$ (seed plus its parity). Which adversary achieves the largest PRG advantage, and what is it?`,
      options: [md`Say *fake* iff the total parity of $r$ is 0; advantage $\tfrac14$`, md`Say *fake* iff the last bit is 1; advantage $\tfrac12$`, md`No efficient adversary has non-negligible advantage`, md`Say *fake* iff the total parity is 1; advantage $\tfrac12$`],
      answer: 0,
      explanation: md`Every output of $G$ has even total parity (the last bit cancels the others). Fake: always parity 0 → correct. Rand: parity 0 w.p. ½ → correct w.p. ½. $P(\text{win})=\tfrac34$, advantage $\tfrac14$.`,
    },
    {
      id: 'l02-q9',
      type: 'mcq',
      difficulty: 3,
      prompt: md`In the reduction "PRG adversary $A$ from semantic adversary $B$", suppose $B$ wins with probability $0.7$ against the real stream cipher. What is $A$'s winning probability?`,
      options: ['0.7', '0.6', '0.35', '0.85'],
      answer: 1,
      explanation: md`$P=\tfrac12\cdot0.7+\tfrac12\cdot\tfrac12=0.6$: advantage $0.1$, half of $B$'s $0.2$.`,
    },
    {
      id: 'l02-q10',
      type: 'mcq',
      difficulty: 3,
      prompt: md`A cipher is ε-semantically secure with $\varepsilon=2^{-40}$. An adversary repeats an attack $2^{30}$ times. Which statement best captures the lecture's view?`,
      options: ['The adversary can amplify its advantage to nearly 1', md`Its success is at most about $2^{30}\cdot2^{-40}=2^{-10}$ — not negligible in the scalar sense; $2^{-40}$ is too large a bound for practice`, 'Repetition does not help at all', 'Semantic security forbids repeated attacks'],
      answer: 1,
      explanation: md`Repetition multiplies success by at most the number of repetitions. Functionally, poly × negligible stays negligible; but in the scalar sense $2^{-40}$ is not "never happens" — practical bounds aim at $2^{-128}$.`,
    },
  ],
};
