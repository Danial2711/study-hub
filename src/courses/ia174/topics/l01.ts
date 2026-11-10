import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l01: Topic = {
  id: 'l01',
  lecture: 1,
  tag: 'L01',
  examGroup: 'S1',
  title: 'Ciphers, perfect security, one-time pad',
  summary: md`What a symmetric cipher is, Shannon's definition of perfect secrecy, the one-time pad, why perfect secrecy needs keys as long as messages, and the equivalent formulation as an attack game.`,
  sections: [
    {
      id: 'setup',
      title: 'Problem setup and the definition of a cipher',
      kind: 'definition',
      importance: 'must',
      body: md`Alice wants to send Bob a message over a channel that Eve can read ("sending" may also mean *storing*). **Secrecy** informally: Eve must not learn anything about the content. This needs a secret — the **key**. In *symmetric* cryptography Alice and Bob share the same key; in *asymmetric* (public-key) cryptography they do not.

**Definition (cipher).** Let $\mathcal K$ (keys), $\mathcal M$ (messages) and $\mathcal C$ (ciphertexts) be finite sets. A *symmetric cipher* over $(\mathcal K,\mathcal M,\mathcal C)$ is a pair $(E,D)$ of computable functions
- $E:\mathcal K\times\mathcal M\to\mathcal C$ (encryption),
- $D:\mathcal K\times\mathcal C\to\mathcal M$ (decryption),

such that **correctness** holds: $\forall k\in\mathcal K\;\forall m\in\mathcal M:\ D(k,E(k,m))=m$. Equivalently, $D(k,\cdot)$ inverts $E(k,\cdot)$ for every key, so each $E(k,\cdot)$ is injective.

Remarks:
- We additionally want $E$ and $D$ to be **efficient** (polynomial time). The definition itself says nothing about being a *good* cipher.
- Finite $\mathcal M$ means a bounded message length — a formality, the bound can be astronomically large.
- Historical example: **Caesar's cipher** shifts each letter by $k\in\{0,\dots,25\}$; $\mathcal M=\mathcal C=\{a,\dots,z\}^\ell$. With 26 keys it is trivially brute-forced, and letter frequencies survive.`,
      formulas: [
        {
          id: 'cipher-correct',
          name: 'Correctness of a cipher',
          tex: md`\forall k\in\mathcal K\ \forall m\in\mathcal M:\quad D\bigl(k,E(k,m)\bigr)=m`,
          symbols: [
            { sym: md`\mathcal K,\mathcal M,\mathcal C`, meaning: 'key space, message space, ciphertext space (finite sets)' },
            { sym: 'E, D', meaning: 'encryption and decryption algorithms' },
          ],
          intuition: 'Decrypting with the right key always returns the original message.',
          pitfalls: 'Correctness says nothing about security: E(k, m) = m is a correct (and useless) cipher.',
        },
      ],
    },
    {
      id: 'bitvectors',
      title: 'Bit-vectors and their operations',
      kind: 'concept',
      importance: 'must',
      body: md`Real ciphers work on bit-strings. Notation used throughout the course:
- $\{0,1\}^\ell$ — bit-strings of length exactly $\ell$; $\{0,1\}^{\le\ell}=\bigcup_{j\le\ell}\{0,1\}^j$.
- Typically $\mathcal M=\mathcal C=\{0,1\}^{\le L}$ for a huge $L$, and $\mathcal K=\{0,1\}^j$ with $j\ll L$.
- $x\,\|\,y$ — concatenation; $x[i]$ — the $i$-th bit (from the left); $x[..i]$ — the prefix of length $i$.
- $\oplus$ — bitwise XOR: $0\oplus0=1\oplus1=0$, $0\oplus1=1\oplus0=1$. It is associative, commutative, $x\oplus x=0$, $x\oplus0=x$, so $x\oplus k\oplus k=x$.
- $x\boxplus_\ell y$ — addition modulo $2^\ell$ (like unsigned C integers that wrap around).
- $\mathrm{ROTL}(x,n)$ / $x\lll n$ and $\mathrm{ROTR}(x,n)$ / $x\ggg n$ — **rotations** (bits that fall off re-enter on the other side).
- $\mathrm{SHIFTL}(x,n)$ / $x\ll n$, $\mathrm{SHIFTR}(x,n)$ / $x\gg n$ — **shifts** (bits fall off, zeros come in). Do not confuse the two!`,
      examples: [
        {
          title: 'Rotation vs shift',
          problem: md`Let $x=1011\,0001$ (8 bits). Compute $\mathrm{ROTL}(x,3)$, $\mathrm{SHIFTL}(x,3)$ and $x\boxplus_8 1111\,0000$.`,
          solution: md`$\mathrm{ROTL}(x,3)=1000\,1101$ (the leading $101$ moves to the end), $\mathrm{SHIFTL}(x,3)=1000\,1000$ (the leading $101$ is lost, zeros enter). $x\boxplus_8 11110000=177+240 \bmod 256=161=1010\,0001$.`,
        },
      ],
    },
    {
      id: 'probability',
      title: 'Primer on discrete probability',
      kind: 'concept',
      importance: 'understand',
      body: md`Cryptography is probabilistic: keys are random, adversaries guess, attacks succeed with some probability.
- A **probability space** has a finite sample space $\Omega$ and a distribution $d:\Omega\to[0,1]$ with $\sum_{\omega}d(\omega)=1$. An **event** is $E\subseteq\Omega$, $P(E)=\sum_{\omega\in E}d(\omega)$.
- **Independence:** $P(E_1\cap E_2)=P(E_1)P(E_2)$.
- **Conditional probability:** $P(E\mid F)=P(E\cap F)/P(F)$ for $P(F)>0$.
- **Law of total probability:** if $F_1,\dots,F_k$ partition $F$ (each with positive probability), $P(E\mid F)=\sum_i P(F_i\mid F)\,P(E\mid F_i)$. With $F=\Omega$ and two parts: $P(A)=P(B)P(A\mid B)+P(C)P(A\mid C)$.

The last formula is the workhorse of every security reduction: "the adversary wins = it wins in case *rand* or in case *fake*".`,
      formulas: [
        {
          id: 'total-prob',
          name: 'Law of total probability',
          tex: md`P(A)=P(B)\,P(A\mid B)+P(C)\,P(A\mid C)\qquad (B,C\text{ a partition of }\Omega)`,
          intuition: 'Split the experiment into cases, compute the probability in each case and average with the case probabilities.',
          conditions: md`$P(B),P(C)>0$ and $B\cup C=\Omega$, $B\cap C=\emptyset$.`,
        },
      ],
    },
    {
      id: 'perfect',
      title: 'Perfect secrecy (Shannon)',
      kind: 'definition',
      importance: 'must',
      body: md`*Informally:* given $E(k,m)$, Eve can extract no statistical information about $m$ without $k$.

**Definition (Shannon).** Sample $k\in\mathcal K$ **uniformly**. For $m\in\mathcal M$, $c\in\mathcal C$ let
$$K(m,c)=\{k\in\mathcal K\mid E(k,m)=c\}.$$
$(E,D)$ is **perfectly secure** if for all $m,m'\in\mathcal M$ and all $c\in\mathcal C$:
$$P(K(m,c))=P(K(m',c)),\quad\text{i.e. } |K(m,c)|=|K(m',c)|.$$
Whatever ciphertext Eve sees, every message was equally likely to produce it. Note that the definition holds no matter how the messages themselves are distributed — the probability is only over the key.

Examples (try them in the checker below):
- Caesar's cipher on **one letter** with a uniform key is perfectly secure: each $(m,c)$ pair has exactly one key.
- Caesar on two or more letters is not: "aa" can encrypt to "dd" but never to "de".`,
      formulas: [
        {
          id: 'shannon-def',
          name: 'Perfect security (Shannon)',
          tex: md`\forall m,m'\in\mathcal M\ \forall c\in\mathcal C:\quad P_{k\leftarrow\mathcal K}\bigl[E(k,m)=c\bigr]=P_{k\leftarrow\mathcal K}\bigl[E(k,m')=c\bigr]`,
          symbols: [
            { sym: md`k\leftarrow\mathcal K`, meaning: 'key sampled uniformly at random' },
            { sym: md`K(m,c)`, meaning: md`the set of keys mapping $m$ to $c$` },
          ],
          intuition: 'The distribution of the ciphertext does not depend on the message.',
          conditions: 'Probability over a uniformly random key only.',
          pitfalls: md`To show a cipher is **not** perfectly secure, it suffices to find one triple $m,m',c$ with different counts — often a $c$ reachable from $m$ but not from $m'$.`,
        },
      ],
      viz: [{ id: 'cipherTable', props: { preset: 'otp' }, caption: 'Pick a toy cipher and a ciphertext: perfect secrecy holds iff every column has the same count of keys.' }],
    },
    {
      id: 'otp',
      title: 'The one-time pad',
      kind: 'theorem',
      importance: 'must',
      body: md`**Definition.** $\mathcal M=\mathcal C=\mathcal K=\{0,1\}^\ell$, $E(k,m)=m\oplus k$, $D(k,c)=c\oplus k$. Correct because $m\oplus k\oplus k=m$.

**Theorem.** The one-time pad is perfectly secure.

**Notes — the price of perfection:**
- **Malleable:** flipping bit $i$ of $c$ flips bit $i$ of the decrypted message. OTP gives secrecy, *not integrity*.
- **Never reuse a key:** $c_1\oplus c_2=(m_1\oplus k)\oplus(m_2\oplus k)=m_1\oplus m_2$. The "two-time pad" leaks the XOR of the messages, which is easy to unravel for natural language (Project Venona).
- The key must be as long as the message and truly random — impractical (see Shannon's theorem below).`,
      proof: md`Fix $m$ and $c$. $E(k,m)=c\iff k=m\oplus c$, so $K(m,c)=\{m\oplus c\}$ has exactly one element for **every** $m$ and $c$. Hence $P(K(m,c))=2^{-\ell}$ for all $m$, which is independent of $m$.`,
      formulas: [
        {
          id: 'otp',
          name: 'One-time pad',
          tex: md`E(k,m)=m\oplus k,\qquad D(k,c)=c\oplus k,\qquad k\in\{0,1\}^\ell\text{ uniform}`,
          intuition: 'XOR with a uniformly random string produces a uniformly random string, whatever the message.',
          pitfalls: 'A key used twice leaks m₁ ⊕ m₂; any known plaintext reveals the key.',
        },
      ],
      viz: [{ id: 'xorPad', caption: 'Two messages under the same key: the key cancels out.' }],
    },
    {
      id: 'shannon-thm',
      title: "Shannon's theorem: keys must be long",
      kind: 'theorem',
      importance: 'must',
      body: md`**Theorem (Shannon).** If $(E,D)$ over $(\mathcal K,\mathcal M,\mathcal C)$ is perfectly secure then $|\mathcal K|\ge|\mathcal M|$.

So perfect secrecy is only possible with keys at least as long as the messages, which have to be exchanged securely in advance — at which point you could have sent the message itself. This is why practical cryptography relaxes perfect secrecy to *computational* (semantic) security.`,
      proof: md`Contraposition. Suppose $|\mathcal K|<|\mathcal M|$. Fix any $k_0$, $m_0$ and let $c=E(k_0,m_0)$. The set of messages that can encrypt to $c$ is $S=\{D(k,c)\mid k\in\mathcal K\}$ (by correctness, if $E(k,m)=c$ then $m=D(k,c)$), so $|S|\le|\mathcal K|<|\mathcal M|$. Pick $m'\notin S$: then $K(m',c)=\emptyset$, while $k_0\in K(m_0,c)$. So $P(K(m_0,c))>0=P(K(m',c))$ — not perfectly secure.`,
    },
    {
      id: 'game',
      title: 'Perfect security as an attack game',
      kind: 'definition',
      importance: 'must',
      body: md`Modern definitions are phrased as **games** between a *challenger* (playing the user of the cipher) and an *adversary*.

**Perfect-security attack game against $(E,D)$:**
1. The challenger samples $k\leftarrow\mathcal K$ and a bit $b\leftarrow\{0,1\}$ uniformly, keeps both secret.
2. The adversary chooses two messages $m_0,m_1$ of **the same length** and sends them.
3. The challenger sends back $c=E(k,m_b)$.
4. The adversary analyses $c$ and outputs a guess $g\in\{0,1\}$. It **wins** iff $g=b$.

Guessing at random wins with probability $\tfrac12$. **Definition:** $(E,D)$ is perfectly secure if *every* adversary (no efficiency restriction) wins with probability $\le\tfrac12$.

**Theorem (equivalence).** A cipher is perfectly secure in Shannon's sense **iff** it is perfectly secure in the attack-game sense.

Why equal lengths? A ciphertext usually reveals the message length; the definition deliberately ignores that leak.`,
      proof: md`*Shannon ⇒ game.* **Lemma:** for a perfectly secure cipher and a fixed $m^*$, $\delta(c)=P(K(m^*,c))$ is a probability distribution on $\mathcal C$ and, by perfect secrecy, it is the distribution of $E(k,m)$ for **every** $m$. Compare with a *cheating game* in which the challenger ignores $b$ and sends $c\sim\delta$: there $c$ is independent of $b$, so no adversary wins with probability above $\tfrac12$. But both games produce identically distributed transcripts, so the adversary's winning probability is the same.

*Game ⇒ Shannon* (contraposition, cf. worksheet 1): if $P(K(m_0,c))>P(K(m_1,c))$ for some $m_0,m_1,c$, the adversary sends $(m_0,m_1)$ and answers $0$ if it receives exactly $c$ and a random bit otherwise. It wins with probability $\tfrac12+\tfrac12\bigl(P(K(m_0,c))-P(K(m_1,c))\bigr)>\tfrac12$.`,
    },
  ],
  flashcards: [
    { id: 'l01-c1', front: 'Definition of a symmetric cipher', back: md`A pair $(E,D)$ of efficient functions $E:\mathcal K\times\mathcal M\to\mathcal C$, $D:\mathcal K\times\mathcal C\to\mathcal M$ with $D(k,E(k,m))=m$ for all $k,m$.` },
    { id: 'l01-c2', front: 'Shannon perfect secrecy (formal)', back: md`For uniform $k$: $P(K(m,c))=P(K(m',c))$ for all $m,m',c$, where $K(m,c)=\{k\mid E(k,m)=c\}$.` },
    { id: 'l01-c3', front: 'One-time pad: E, D and spaces', back: md`$\mathcal K=\mathcal M=\mathcal C=\{0,1\}^\ell$, $E(k,m)=m\oplus k$, $D(k,c)=c\oplus k$.` },
    { id: 'l01-c4', front: 'Why is OTP perfectly secure?', back: md`For every $m,c$ exactly one key $k=m\oplus c$ maps $m$ to $c$, so $|K(m,c)|=1$ for all pairs.` },
    { id: 'l01-c5', front: "Shannon's theorem", back: md`Perfect secrecy implies $|\mathcal K|\ge|\mathcal M|$.` },
    { id: 'l01-c6', front: 'Proof idea of |K| ≥ |M|', back: md`A fixed $c$ can only decrypt to the $\le|\mathcal K|$ messages $D(k,c)$; if $|\mathcal K|<|\mathcal M|$ some $m'$ never maps to $c$, while some other message does.` },
    { id: 'l01-c7', front: 'Two weaknesses of OTP (shared by every stream cipher)', back: '1) Malleability: flipping ciphertext bits flips plaintext bits. 2) Key reuse: c₁ ⊕ c₂ = m₁ ⊕ m₂ (two-time pad).' },
    { id: 'l01-c8', front: 'Perfect-security attack game', back: md`Challenger samples $k$, $b$; adversary sends $m_0,m_1$ of equal length; gets $E(k,m_b)$; outputs $g$; wins iff $g=b$. Perfectly secure ⟺ every adversary wins w.p. $\le\tfrac12$.` },
    { id: 'l01-c9', front: 'Why must m₀ and m₁ have the same length?', back: 'Ciphertexts normally reveal the message length; requiring equal lengths stops the definition from being broken by this unavoidable leak.' },
    { id: 'l01-c10', front: 'Rotation vs shift', back: md`ROTL/ROTR ($\lll,\ggg$): bits wrap around. SHIFTL/SHIFTR ($\ll,\gg$): bits fall off and zeros come in.` },
    { id: 'l01-c11', front: md`What is $x\boxplus_\ell y$?`, back: md`Addition modulo $2^\ell$ of the two $\ell$-bit numbers (wrap-around addition).` },
    { id: 'l01-c12', front: 'Is a one-letter Caesar cipher perfectly secure? Two letters?', back: 'One letter: yes (each (m, c) has exactly one shift). Two letters: no — "aa" can never become "ab", so some ciphertexts exclude some messages.' },
    { id: 'l01-c13', front: 'Law of total probability (two cases)', back: md`$P(A)=P(B)P(A\mid B)+P(C)P(A\mid C)$ for a partition $B,C$ of $\Omega$.` },
    { id: 'l01-c14', front: 'The "cheating game" in the equivalence proof', back: md`The challenger ignores $b$ and sends $c\sim\delta$ with $\delta(c)=P(K(m^*,c))$. In it no adversary beats ½; for a perfectly secure cipher it is indistinguishable from the real game.` },
    { id: 'l01-c15', front: 'Is correctness enough for security?', back: 'No: E(k, m) = m is a correct cipher. Security is a separate requirement.' },
  ],
  quiz: [
    {
      id: 'l01-q1',
      type: 'mcq',
      difficulty: 1,
      prompt: md`Which property must every cipher $(E,D)$ satisfy by definition?`,
      options: [md`$E(k,\cdot)$ is surjective for every $k$`, md`$D(k,E(k,m))=m$ for all $k,m$`, md`$|\mathcal K|\ge|\mathcal M|$`, md`$E(k,m)\neq m$ for all $k,m$`],
      answer: 1,
      explanation: md`Correctness is the only requirement in the definition. $|\mathcal K|\ge|\mathcal M|$ is a consequence of *perfect secrecy*, not of being a cipher.`,
    },
    {
      id: 'l01-q2',
      type: 'mcq',
      difficulty: 1,
      prompt: md`Two messages were encrypted with the one-time pad under the **same** key. What does an eavesdropper learn immediately?`,
      options: ['Nothing — OTP is perfectly secure', 'The key', md`$m_1\oplus m_2$`, md`$m_1\wedge m_2$`],
      answer: 2,
      explanation: md`$c_1\oplus c_2=m_1\oplus k\oplus m_2\oplus k=m_1\oplus m_2$. Perfect secrecy only holds for one message per key.`,
    },
    {
      id: 'l01-q3',
      type: 'mcq',
      difficulty: 1,
      prompt: md`A perfectly secure cipher encrypts 128-bit messages. What is the minimum number of keys?`,
      options: [md`$2^{64}$`, md`$128$`, md`$2^{128}$`, md`$2^{256}$`],
      answer: 2,
      explanation: md`Shannon: $|\mathcal K|\ge|\mathcal M|=2^{128}$.`,
    },
    {
      id: 'l01-q4',
      type: 'mcq',
      difficulty: 2,
      prompt: md`Let $\mathcal K=\mathcal M=\mathcal C=\{0,1\}^n$ and $E(k,m)=m\oplus(k\wedge 1^{n-1}0)$ (the last key bit is ignored). Is it perfectly secure?`,
      options: ['Yes, it is just OTP', 'No: the last bit of the message is sent in the clear', 'No: it is not a valid cipher (not invertible)', 'Yes, because |K| = |M|'],
      answer: 1,
      explanation: md`The last bit of $c$ equals the last bit of $m$, so a ciphertext ending in 0 can never come from a message ending in 1. $|\mathcal K|\ge|\mathcal M|$ is necessary, not sufficient.`,
    },
    {
      id: 'l01-q5',
      type: 'mcq',
      difficulty: 2,
      prompt: md`In the perfect-security attack game, the adversary outputs a uniformly random bit $g$ regardless of $c$. Its winning probability is`,
      options: ['0', md`$\tfrac12$`, '1', 'depends on the cipher'],
      answer: 1,
      explanation: md`$g$ is independent of $b$, so $P(g=b)=\tfrac12$ against any cipher.`,
    },
    {
      id: 'l01-q6',
      type: 'mcq',
      difficulty: 1,
      prompt: md`$\mathrm{ROTR}(0110\,1001,\,2)=\ ?$`,
      options: ['0101 1010', '1010 0100', '0001 1010', '1001 0110'],
      answer: 0,
      explanation: md`Rotate right by 2: the last two bits $01$ move to the front: $01\,011010=0101\,1010$. (A right *shift* would give $0001\,1010$.)`,
    },
    {
      id: 'l01-q7',
      type: 'mcq',
      difficulty: 2,
      prompt: md`For $m=1100$, $c=0110$ under the 4-bit one-time pad, $|K(m,c)|$ equals`,
      options: ['0', '1', '4', '16'],
      answer: 1,
      explanation: md`Only $k=m\oplus c=1010$ works.`,
    },
    {
      id: 'l01-q8',
      type: 'mcq',
      difficulty: 3,
      prompt: md`$\mathcal M=\mathcal C=\{0,1\}^n$, $\mathcal K=\{0,1\}^n\times\{0,1\}^n$, $E((k_1,k_2),m)=m\oplus k_1\oplus k_2$. Which statement is true?`,
      options: ['Not perfectly secure: two keys can cancel each other', md`Perfectly secure: for each $m,c$ exactly $2^n$ key pairs satisfy $k_1\oplus k_2=m\oplus c$`, 'Not a cipher, since decryption is ambiguous', md`Perfectly secure only if $k_1\neq k_2$`],
      answer: 1,
      explanation: md`$E((k_1,k_2),m)=c\iff k_1\oplus k_2=m\oplus c$; for each of the $2^n$ choices of $k_1$ exactly one $k_2$ fits. So $|K(m,c)|=2^n$ for all $m,c$. Decryption $D((k_1,k_2),c)=c\oplus k_1\oplus k_2$ is well defined.`,
    },
    {
      id: 'l01-q9',
      type: 'mcq',
      difficulty: 3,
      prompt: md`$\mathcal M=\mathcal C=\{0,1\}^n$ ($n\ge2$), $\mathcal K$ = all permutations of the bit **positions**; $E(\pi,m)$ permutes the bits of $m$ by $\pi$. The best adversary in the perfect-security game wins with probability`,
      options: [md`$\tfrac12$`, md`$\tfrac12+2^{-n}$`, '1', md`$\tfrac34$`],
      answer: 2,
      explanation: md`Permuting bits preserves the number of ones. Send $m_0=0^n$, $m_1=1^n$: the ciphertext equals the message, so $b$ is read off with certainty.`,
    },
    {
      id: 'l01-q10',
      type: 'mcq',
      difficulty: 3,
      prompt: md`Which of the following ciphers on $\mathbb Z_{26}$ (single letters) with uniform key is **not** perfectly secure?`,
      options: [md`$E(k,m)=m+k$, $k\in\mathbb Z_{26}$`, md`$E(k,m)=m-k$, $k\in\mathbb Z_{26}$`, md`$E(k,m)=m+2k$, $k\in\mathbb Z_{26}$`, md`$E(k,m)=m+k+5$, $k\in\mathbb Z_{26}$`],
      answer: 2,
      explanation: md`$2k$ only takes even values mod 26, so $m+2k$ always has the parity of $m$: a ciphertext reveals the parity of the message. The other three are bijective shifts by a uniform amount.`,
    },
  ],
};
