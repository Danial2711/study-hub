import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l05: Topic = {
  id: 'l05',
  lecture: 5,
  tag: 'L05',
  examGroup: 'H',
  title: 'Cryptographic hash functions',
  summary: md`One-wayness, second-preimage and collision resistance; generic attacks and the birthday theorem; random oracles; Floyd cycle detection; the Merkle–Damgård construction and its proof; compression functions from block ciphers (Davies–Meyer); MD5, SHA-1, SHA-2; length extension; the sponge construction and SHA-3; Merkle trees.`,
  sections: [
    {
      id: 'props',
      title: 'Security properties',
      kind: 'definition',
      importance: 'must',
      body: md`A hash function maps long strings to short ones: $h:\mathcal M\to\mathcal H$ with $\mathcal M=\{0,1\}^{\le L}$, $\mathcal H=\{0,1\}^\ell$, $\ell\ll L$. **Unkeyed** hashes (integrity, password storage, signatures) vs **keyed** hashes = MACs (next lecture). The attacker always knows every detail of $h$.

- **One-way / first-preimage resistant:** given $h(m)$, it is hard to find **any** $m'$ with $h(m')=h(m)$.
- **Second-preimage resistant:** given $m$ (and $h(m)$), hard to find $m'\ne m$ with $h(m')=h(m)$.
- **Collision resistant:** hard to find **any** pair $m\ne m'$ with $h(m)=h(m')$.

Collision resistance ⇒ second-preimage resistance (a second preimage *is* a collision). Collisions always **exist** (pigeonhole: $|\mathcal M|\gg|\mathcal H|$) — we only require that they are hard to **find**.

**Why is the collision game more complex?** For a fixed $h$ there *is* an adversary that just prints a hard-coded collision — it exists even if nobody knows it. The formal game therefore salts the function: the challenger samples a random salt $s$ and the adversary must find $m\ne m'$ with $h(s\|m)=h(s\|m')$. In practice a single known collision already makes a hash function considered broken, because one collision usually helps to find more of a specific form.

Existence of one-way functions would imply $P\ne NP$. No practical hash has been broken for one-wayness, but MD5 and SHA-1 are broken for collision resistance.

Why do signatures need collision resistance? We sign $h(m)$. If an attacker finds $m\ne m'$ with $h(m)=h(m')$ — say a harmless and a harmful contract — a signature on $m$ is also valid for $m'$.`,
    },
    {
      id: 'baselines',
      title: 'Generic attacks and the birthday theorem',
      kind: 'theorem',
      importance: 'must',
      body: md`Baseline cost of the trivial guessing adversaries for an $\ell$-bit hash:

| property | generic cost |
|---|---|
| first preimage | $2^\ell$ |
| second preimage | $2^\ell$ |
| collision | $\sqrt{2^\ell}=2^{\ell/2}$ |

**Birthday paradox:** among 23 people two share a birthday with probability 50.7 % (≥ 99 % for 60 people).

**Theorem (birthday).** Draw uniformly with replacement from a set of size $N$; let $col(N)$ be the number of draws after which a repeat has probability > ½. Then $col(N)\in O(\sqrt N)$.

**Generic birthday attack:** hash random messages, store $(m,h(m))$, stop at the first repeated hash with different messages. After about $2^{\ell/2}$ hashes it succeeds with constant probability $p$, expected time $\le\frac1p2^{\ell/2}$. The speed depends **only on the output length** — so a 256-bit hash offers 128-bit collision security, and a 128-bit hash (MD5) at most 64-bit.

**Random oracle model:** in such arguments the hash is modelled as a *random oracle*: a black box returning a fresh uniformly random value for every new input and the same value for repeated inputs.`,
      proof: md`Probability of **no** repeat in $k$ draws: $\prod_{i=1}^{k-1}\bigl(1-\frac iN\bigr)\le\prod_i e^{-i/N}=e^{-k(k-1)/2N}$ (using $1-x\le e^{-x}$). For $k\approx\sqrt{2\ln2\,N}\approx1.18\sqrt N$ this is ≤ ½.`,
      formulas: [
        {
          id: 'birthday',
          name: 'Birthday bound',
          tex: md`P(\text{collision among }q\text{ samples})\approx1-e^{-q(q-1)/(2N)},\qquad q_{1/2}\approx1.18\sqrt N`,
          symbols: [
            { sym: 'N', meaning: md`size of the output set, $2^\ell$` },
            { sym: 'q', meaning: 'number of hashed messages' },
          ],
          intuition: 'q values form about q²/2 pairs, each colliding with probability 1/N.',
          pitfalls: 'This halves the effective security in bits: collisions of an ℓ-bit hash cost 2^(ℓ/2), not 2^ℓ.',
        },
      ],
      viz: [{ id: 'birthday' }],
    },
    {
      id: 'floyd',
      title: 'Birthday attack without memory: cycle detection',
      kind: 'concept',
      importance: 'must',
      body: md`The table-based attack needs $2^{\ell/2}$ memory. Instead iterate $v\mapsto h(v)$ from a random start: the sequence $x_1,x_2,\dots$ is eventually periodic (**lasso / ρ-shaped**), because the set is finite.

**Theorem.** A sequence is lasso-shaped iff there is $n\ge1$ with $x_n=x_{2n}$.

**Floyd's algorithm:** tortoise $v_1\leftarrow h(v_1)$, hare $v_2\leftarrow h(h(v_2))$ until they meet ($x_n=x_{2n}$). Then restart one pointer from the start $v$ and move both one step at a time; the step **before** they meet gives two different inputs $m_1\ne m_2$ with $h(m_1)=h(m_2)$ — the two arrows entering the cycle start. If the start already lies on the cycle (tail length 0), no collision results: restart with another $v$.

Expected running time is still $O(2^{\ell/2})$, memory is constant.`,
    },
    {
      id: 'md',
      title: 'The Merkle–Damgård construction',
      kind: 'definition',
      importance: 'must',
      body: md`Idea: build a hash for long messages from a **compression function** $f:\{0,1\}^\ell\times\{0,1\}^k\to\{0,1\}^\ell$ (state × message block → state), $k\approx\ell$.

An MD hash is specified by $f$, an initial state $s_0$ (a constant) and an **MD-compliant padding** $\mathrm{pad}$. To hash $m$: split $\mathrm{pad}(m)=m_1\|\cdots\|m_n$ into $k$-bit blocks and compute
$$s_i=f(s_{i-1},m_i),\qquad h(m)=s_n.$$

**MD-compliant padding:** for all $m,m'$
1. $m\ne m'\Rightarrow\mathrm{pad}(m)\ne\mathrm{pad}(m')$;
2. equal lengths ⇒ equal padded lengths;
3. different lengths ⇒ the **last blocks** of $\mathrm{pad}(m)$ and $\mathrm{pad}(m')$ differ.

**Merkle padding:** $\mathrm{pad}(m)=m\|1\|0^d\|\langle\mathrm{len}(m)\rangle$, with the smallest $d\ge0$ making the length a multiple of $k$ and the length written as a fixed-size (64- or 128-bit) number.

**Theorem.** Given a collision $m\ne m'$ of $h$ one can efficiently (a constant number of evaluations of $h$) compute a collision of $f$. Hence **$f$ collision resistant ⇒ $h$ collision resistant.**`,
      proof: md`*Case 1: $\mathrm{len}(m)\ne\mathrm{len}(m')$.* By compliance the last blocks $b_n\ne b'_{n'}$, and $f(s_{n-1},b_n)=h(m)=h(m')=f(s'_{n'-1},b'_{n'})$: a collision of $f$ on different inputs.

*Case 2: equal lengths*, so $n=n'$. Walk backwards from the end. If at some step $(s_{i-1},b_i)\ne(s'_{i-1},b'_i)$ while $f$ maps them to the same $s_i=s'_i$, that is a collision of $f$. If the inputs agree at every step, then all blocks agree, so $\mathrm{pad}(m)=\mathrm{pad}(m')$ and $m=m'$ by injectivity of the padding — contradiction.`,
      formulas: [
        {
          id: 'md',
          name: 'Merkle–Damgård iteration',
          tex: md`s_0=IV,\qquad s_i=f(s_{i-1},m_i),\qquad h(m)=s_n,\quad m_1\|\cdots\|m_n=\mathrm{pad}(m)`,
          intuition: 'Feed the message block by block into a fixed-size state; the final state is the hash.',
        },
        {
          id: 'merkle-pad',
          name: 'Merkle padding',
          tex: md`\mathrm{pad}(m)=m\,\|\,1\,\|\,0^d\,\|\,\langle\mathrm{len}(m)\rangle`,
          intuition: 'Encoding the length in the last block makes messages of different lengths end differently.',
        },
      ],
      viz: [{ id: 'merkleDamgard', props: { part: 'md' } }],
    },
    {
      id: 'compression',
      title: 'Compression functions from block ciphers',
      kind: 'concept',
      importance: 'must',
      body: md`A block cipher combines two short strings (key, block) into one — like a compression function, but it is not designed to be collision resistant: $f(s,b)=E(b,s)$ has trivial collisions (pick any $s',b'$ and set $s=D(b,E(b',s'))$).

Standard constructions:
- **Davies–Meyer:** $f(s,b)=E(b,s)\oplus s$ (the message block is the **key**). *Must know.*
- Matyas–Meyer–Oseas: $f(s,b)=E(g(s),b)\oplus b$.
- Miyaguchi–Preneel: $f(s,b)=E(g(s),b)\oplus b\oplus s$.

Security theorems need the strong **ideal cipher** assumption, because in hashing the adversary controls the key — standard PRP security says nothing about that (cf. the complementation property of DES). Also, encryption ciphers are optimized for many blocks per key, while hashing changes the key every block. Therefore practical hashes use **tailor-made** block ciphers:
- MD5 (128-bit, Davies–Meyer, 4 rounds of 16 operations) and SHA-1 (160-bit): **broken** for collisions — practical SHA-1 collision ("SHAttered", 2017); main weakness of SHA-1 is its small state.
- **SHA-2** (SHA-256, SHA-512): modified Davies–Meyer with word-wise addition mod $2^{32}$ instead of XOR; block cipher SHACAL-2 with 64 (80) rounds. **State of the art**, considered secure; used in Bitcoin.`,
      formulas: [
        {
          id: 'dm',
          name: 'Davies–Meyer compression function',
          tex: md`f(s,b)=E(b,s)\oplus s`,
          symbols: [
            { sym: 's', meaning: 'chaining state (encrypted as the plaintext block)' },
            { sym: 'b', meaning: 'message block (used as the key)' },
          ],
          intuition: 'Encrypt the state under the message block, then XOR the state back in so that f is not invertible.',
          pitfalls: 'Without the feed-forward ⊕ s, collisions are trivial because E(b, ·) can be inverted.',
        },
      ],
    },
    {
      id: 'lea',
      title: 'A property of MD you must know: length extension',
      kind: 'theorem',
      importance: 'must',
      body: md`**Theorem.** Let $h$ be an MD hash whose padding keeps $m$ as a prefix of $\mathrm{pad}(m)$ and adds a suffix depending only on $\mathrm{len}(m)$. Given $h(m)$ and $\mathrm{len}(m)$ — **but not $m$** — anyone can compute $h(\mathrm{pad}(m)\,\|\,m')$ for any $m'$.

*Why:* $h(m)$ is exactly the chaining state after processing $\mathrm{pad}(m)$. Start the iteration from $s=h(m)$ and continue hashing $m'$ with the final padding computed for total length $\mathrm{len}(\mathrm{pad}(m))+\mathrm{len}(m')$.

This is harmless for collision resistance but fatal for the naive MAC $S(k,m)=h(k\|m)$: from a tag of $m$ an attacker forges a tag of $m\|\mathrm{pad}\|m'$. Defences: HMAC, or a sponge hash (SHA-3/KMAC).`,
    },
    {
      id: 'sponge',
      title: 'Sponge construction and SHA-3',
      kind: 'concept',
      importance: 'must',
      body: md`After concerns that all standards were MD-based, NIST ran the SHA-3 competition; **Keccak** won (Bertoni, Daemen, Peeters, Van Assche).

**Sponge:** state of $n=r+c$ bits — **rate** $r$ and **capacity** $c$ — and a public permutation $\pi$ of $\{0,1\}^n$ (complex, no structural weaknesses), padding to a multiple of $r$ (any injective padding).
- **Absorbing:** start with $0^r\|0^c$; for every $r$-bit block: XOR it into the rate part, apply $\pi$.
- **Squeezing:** output the rate part, apply $\pi$, repeat as long as output is needed (arbitrary output length: hash, PRG, …).

**Role of the parameters:** the capacity is never output and never directly controlled by the input. Generic attacks cost about $2^{c/2}$: higher capacity = more security, smaller rate = slower. Because the output reveals only the rate part, not the full state, **length extension does not work** — $h(k\|m)$ is a secure MAC with a sponge (KMAC).

**SHA-3:** Keccak with $r+c=1600$, padding $1\,0^*\,1$, 24 rounds of the Keccak-f permutation; SHA3-256 = Keccak with $c=512$, output 256 bits (SHA3-224/256/384/512 use $c=448/512/768/1024$).`,
      formulas: [
        {
          id: 'sponge',
          name: 'Sponge absorbing step',
          tex: md`(\text{rate}\,\|\,\text{cap})\leftarrow\pi\bigl((\text{rate}\oplus m_i)\,\|\,\text{cap}\bigr)`,
          symbols: [
            { sym: 'r', meaning: 'rate: bits absorbed/squeezed per call' },
            { sym: 'c', meaning: 'capacity: hidden part of the state, security ≈ 2^(c/2)' },
          ],
          intuition: 'Only the rate part touches inputs and outputs; the hidden capacity protects the state.',
        },
      ],
      viz: [{ id: 'merkleDamgard', props: { part: 'sponge' } }],
    },
    {
      id: 'merkle-tree',
      title: 'Merkle trees',
      kind: 'concept',
      importance: 'understand',
      body: md`Goal: commit to a list $(x_1,\dots,x_k)$ ($k$ a power of 2) so that (a) its integrity can be checked and (b) one can prove "$x_i=x$" **without revealing the other items**.

- Leaves: the items; next level: $h(x_i)$; every internal node: $h(\text{left}\,\|\,\text{right})$; the top is the **Merkle root**.
- The root must be public and its integrity guaranteed (in Bitcoin every block header contains the Merkle root of its transactions and the hash of the previous header).
- **Proof that $x_i=x$:** the sibling hashes along the path from leaf $i$ to the root — $\log_2k$ hashes. The verifier recomputes the path and compares with the root. Forging a proof requires a hash collision.`,
      viz: [{ id: 'merkleTree' }],
    },
  ],
  flashcards: [
    { id: 'l05-c1', front: 'First-preimage resistance (one-wayness)', back: md`Given $h(m)$ it is hard to find any $m'$ with $h(m')=h(m)$.` },
    { id: 'l05-c2', front: 'Second-preimage resistance', back: md`Given $m$, hard to find $m'\ne m$ with $h(m')=h(m)$.` },
    { id: 'l05-c3', front: 'Collision resistance', back: md`Hard to find any $m\ne m'$ with $h(m)=h(m')$.` },
    { id: 'l05-c4', front: 'Generic attack costs for an ℓ-bit hash', back: md`Preimage $2^\ell$, second preimage $2^\ell$, collision $2^{\ell/2}$.` },
    { id: 'l05-c5', front: 'Birthday theorem', back: md`Drawing from $N$ items, a repeat appears after $O(\sqrt N)$ draws with probability > ½ (≈ $1.18\sqrt N$).` },
    { id: 'l05-c6', front: 'Why is the formal collision game salted?', back: 'For a fixed function an adversary with a hard-coded collision always exists; a random salt chosen by the challenger makes the definition meaningful.' },
    { id: 'l05-c7', front: 'Random oracle', back: 'Idealised hash: a black box returning a fresh uniformly random output for each new input and the same output for repeated inputs.' },
    { id: 'l05-c8', front: 'Floyd cycle detection: idea', back: md`Iterate $x\mapsto h(x)$; tortoise one step, hare two steps until $x_n=x_{2n}$; then find the cycle entry — its two predecessors collide. Constant memory, $O(2^{\ell/2})$ time.` },
    { id: 'l05-c9', front: 'Merkle–Damgård: components', back: md`Compression function $f:\{0,1\}^\ell\times\{0,1\}^k\to\{0,1\}^\ell$, initial state, MD-compliant padding; $s_i=f(s_{i-1},m_i)$.` },
    { id: 'l05-c10', front: 'MD-compliant padding: 3 conditions', back: 'Injective; equal lengths → equal padded lengths; different lengths → different last blocks.' },
    { id: 'l05-c11', front: 'MD security theorem', back: 'A collision of h yields a collision of f efficiently ⇒ f collision resistant implies h collision resistant.' },
    { id: 'l05-c12', front: 'Davies–Meyer', back: md`$f(s,b)=E(b,s)\oplus s$ — message block as key, state as plaintext, feed-forward XOR.` },
    { id: 'l05-c13', front: 'Why do hash functions use custom block ciphers?', back: 'Proofs need the ideal-cipher assumption (adversary controls the key), and encryption ciphers are slow when the key changes every block.' },
    { id: 'l05-c14', front: 'Status of MD5, SHA-1, SHA-2', back: 'MD5: collisions in seconds. SHA-1: practical collision (2017), small state. SHA-2: state of the art, considered secure.' },
    { id: 'l05-c15', front: 'Length-extension property', back: md`For MD hashes, from $h(m)$ and $\mathrm{len}(m)$ one computes $h(\mathrm{pad}(m)\|m')$ without knowing $m$.` },
    { id: 'l05-c16', front: 'Sponge parameters', back: md`State $n=r+c$; rate $r$ absorbed/squeezed; capacity $c$ hidden; generic security ≈ $2^{c/2}$.` },
    { id: 'l05-c17', front: 'Why does a sponge resist length extension?', back: 'The output shows only (part of) the rate; the capacity part of the state is never revealed, so hashing cannot be resumed.' },
    { id: 'l05-c18', front: 'SHA-3 parameters', back: md`Keccak, $r+c=1600$, padding $10^*1$; SHA3-256 uses $c=512$.` },
    { id: 'l05-c19', front: 'Merkle tree membership proof', back: 'The sibling hashes on the path from the leaf to the root (log₂ k hashes); the verifier recomputes the root.' },
  ],
  quiz: [
    {
      id: 'l05-q1',
      type: 'mcq',
      difficulty: 1,
      prompt: 'How many evaluations does a generic collision attack on a 160-bit hash need, roughly?',
      options: ['2^40', '2^80', '2^120', '2^160'],
      answer: 1,
      explanation: 'Birthday bound: 2^(ℓ/2) = 2^80.',
    },
    {
      id: 'l05-q2',
      type: 'mcq',
      difficulty: 1,
      prompt: 'Which implication always holds?',
      options: ['one-way ⇒ collision resistant', 'collision resistant ⇒ second-preimage resistant', 'second-preimage resistant ⇒ collision resistant', 'one-way ⇒ second-preimage resistant'],
      answer: 1,
      explanation: 'A second preimage together with the given message is a collision.',
    },
    {
      id: 'l05-q3',
      type: 'mcq',
      difficulty: 1,
      prompt: 'In Davies–Meyer, the message block is used as',
      options: ['the plaintext of the block cipher', 'the key of the block cipher', 'the IV', 'the output'],
      answer: 1,
      explanation: md`$f(s,b)=E(b,s)\oplus s$.`,
    },
    {
      id: 'l05-q4',
      type: 'mcq',
      difficulty: 2,
      prompt: 'Why does Merkle padding include the message length?',
      options: ['To make hashing faster', 'So that messages of different lengths have different last blocks, which the collision proof needs', 'To prevent length-extension attacks', 'To make the hash output longer'],
      answer: 1,
      explanation: 'It is the third MD-compliance condition; it does not prevent length extension.',
    },
    {
      id: 'l05-q5',
      type: 'mcq',
      difficulty: 2,
      prompt: 'A sponge with capacity c = 256 bits offers generic security of about',
      options: ['2^64', '2^128', '2^256', '2^512'],
      answer: 1,
      explanation: '≈ 2^(c/2).',
    },
    {
      id: 'l05-q6',
      type: 'mcq',
      difficulty: 1,
      prompt: 'How many hashes does a Merkle-tree membership proof contain for a list of 1024 items?',
      options: ['1', '10', '32', '1024'],
      answer: 1,
      explanation: 'One sibling per level: log₂ 1024 = 10.',
    },
    {
      id: 'l05-q7',
      type: 'mcq',
      difficulty: 2,
      prompt: 'Which statement about SHA-2 is correct?',
      options: ['It is a sponge construction', 'It uses a Merkle–Damgård structure with a Davies–Meyer-like compression function and is considered secure', 'Practical collisions are known', 'It is the same as SHA-3'],
      answer: 1,
      explanation: 'SHA-2 is MD-based (with word-wise addition as feed-forward); SHA-3 is the sponge.',
    },
    {
      id: 'l05-q8',
      type: 'mcq',
      difficulty: 3,
      prompt: md`A compression function is defined as $f(s,b)=E(b,s)$ (Davies–Meyer without the XOR). How can one find a collision?`,
      options: [md`Pick any $(s',b')$ and any $b\ne b'$; set $s=D(b,E(b',s'))$. Then $f(s,b)=f(s',b')$`, 'Use the birthday attack, nothing better exists', 'It is impossible, E is a permutation', md`Pick $s=b$`],
      answer: 0,
      explanation: md`The adversary knows the key $b$, so it can invert $E(b,\cdot)$ and hit any desired output. The feed-forward $\oplus s$ stops this.`,
    },
    {
      id: 'l05-q9',
      type: 'mcq',
      difficulty: 3,
      prompt: md`A server uses $t=\text{SHA-256}(k\|m)$ as a MAC. Given $(m,t)$ and $|k|$, what can an attacker do without knowing $k$?`,
      options: [md`Nothing, SHA-256 is collision resistant`, md`Compute a valid tag for $m\|\mathrm{pad}(|k\|m|)\|m'$ for any $m'$`, md`Recover $k$`, md`Compute a tag for any prefix of $m$`],
      answer: 1,
      explanation: md`Length extension: $t$ is the internal state after $k\|m\|\mathrm{pad}$; continue hashing $m'$.`,
    },
    {
      id: 'l05-q10',
      type: 'mcq',
      difficulty: 3,
      prompt: md`An MD hash uses padding $\mathrm{pad}(m)=m\|0^d$ (only zeros, no length). Which collision is immediate?`,
      options: [md`$m$ and $m\|0$, if $\mathrm{len}(m)$ is not a multiple of $k$`, 'none, the compression function is collision resistant', md`$m$ and its reverse`, md`$m$ and $m\oplus1$`],
      answer: 0,
      explanation: md`Both pad to the same string, so they hash identically: the padding is not injective, violating the first MD-compliance condition.`,
    },
  ],
};
