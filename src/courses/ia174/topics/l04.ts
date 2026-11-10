import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l04: Topic = {
  id: 'l04',
  lecture: 4,
  tag: 'L04',
  examGroup: 'S4',
  title: 'Modes of operation, CPA security, nonces',
  summary: md`CBC and CTR modes, their semantic security, chosen-plaintext attacks and the CPA game, why deterministic encryption cannot be CPA-secure, randomized and nonce-based encryption, and the CPA-security theorems.`,
  sections: [
    {
      id: 'cbc',
      title: 'CBC mode',
      kind: 'definition',
      importance: 'must',
      body: md`**Cipher block chaining** with block cipher $E$ over $(\mathcal K,\mathcal X)$ and an $IV\in\mathcal X$:
$$y_0=IV,\qquad y_i=E(k,\,y_{i-1}\oplus x_i)\quad(i=1..j),$$
output $y_1\|\cdots\|y_j$ (after padding $m$ to whole blocks, typically PKCS#7).
Decryption: $x_i=D(k,y_i)\oplus y_{i-1}$.

- Encryption is **sequential** (each block needs the previous ciphertext), decryption can be parallel.
- Needs padding.
- A flipped ciphertext bit garbles its own block and flips the same bit in the **next** plaintext block.`,
      formulas: [
        {
          id: 'cbc',
          name: 'CBC encryption / decryption',
          tex: md`y_0=IV,\quad y_i=E(k,\,y_{i-1}\oplus x_i);\qquad x_i=D(k,y_i)\oplus y_{i-1}`,
          symbols: [
            { sym: md`x_i`, meaning: 'i-th plaintext block' },
            { sym: md`y_i`, meaning: 'i-th ciphertext block' },
          ],
          intuition: 'Each block is randomized by the previous ciphertext block before encryption.',
        },
      ],
    },
    {
      id: 'ctr',
      title: 'CTR mode',
      kind: 'definition',
      importance: 'must',
      body: md`**Counter mode** turns the block cipher into a **PRG**, hence a stream cipher. Keystream of $n$ blocks:
$$z_i=E\bigl(k,\ IV\boxplus_\ell[i]_{\mathcal X}\bigr),\quad i=0..n-1,\qquad c=m\oplus(z_0\|z_1\|\cdots)[..\mathrm{len}(m)].$$
- Fully **parallel**, random access, **no padding** needed, decryption = encryption (only $E$ is used, never $D$).
- Less stringent IV requirement than CBC for CPA security (see below).
- Malleable like every stream cipher; a flipped ciphertext bit flips exactly one plaintext bit.

*"CTR is all you should be doing with AES"* (attributed to D. J. Bernstein) — as long as you only need confidentiality. All else being equal, CTR has somewhat better properties than CBC.`,
      formulas: [
        {
          id: 'ctr',
          name: 'CTR keystream',
          tex: md`z_i=E\bigl(k,\ IV\boxplus_\ell[i]\bigr),\qquad c_i=m_i\oplus z_i`,
          intuition: 'Encrypt a counter to get a pseudorandom pad; the block cipher is used as a PRF/PRG.',
          pitfalls: 'The (IV, counter) blocks must never repeat under one key — otherwise keystream is reused (two-time pad).',
        },
      ],
      viz: [{ id: 'blockModes', props: { mode: 'CTR' } }],
    },
    {
      id: 'sem-thm',
      title: 'Semantic security of CBC and CTR',
      kind: 'theorem',
      importance: 'understand',
      body: md`For a **fixed** IV:
- **Theorem (CBC).** If $E$ is an ε-secure block cipher with ε negligible, $\mathcal E_{CBC}$ is δ-semantically secure for a negligible δ.
- **Theorem (CTR).** If $E$ is ε-secure, $\mathcal E_{CTR}$ is δ-semantically secure with
$$\delta=2\varepsilon+\frac{n^2}{2|\mathcal X|},$$
where $n$ is the maximal number of blocks per message.

Message: start from a secure block cipher ⇒ the mode is secure. The $n^2/|\mathcal X|$ term comes from the difference between a random **permutation** and a random **function**: a permutation never repeats an output, a function does with birthday probability.

But semantic security is a **one-message** notion — real keys encrypt many messages.`,
      formulas: [
        {
          id: 'ctr-sem',
          name: 'CTR semantic-security bound',
          tex: md`\delta=2\varepsilon+\frac{n^2}{2|\mathcal X|}`,
          symbols: [
            { sym: md`\varepsilon`, meaning: 'PRP advantage bound of the block cipher' },
            { sym: 'n', meaning: 'maximal number of blocks per message' },
            { sym: md`|\mathcal X|`, meaning: md`number of blocks, $2^\ell$` },
          ],
          intuition: 'Factor 2 from the reduction (as for PRG → stream cipher), plus a birthday term for "random permutation vs random function".',
        },
      ],
    },
    {
      id: 'cpa',
      title: 'Chosen-plaintext attacks and the CPA game',
      kind: 'definition',
      importance: 'must',
      body: md`In practice one key encrypts many messages, and the attacker can often obtain encryptions of plaintexts of its choice (planted messages in WWII, sending someone an e-mail, buying ads to observe encrypted search traffic).

**CPA attack game** against $(E,D)$:
1. Challenger samples $k$ and $b\in\{0,1\}$; adversary announces a number of rounds $q$.
2. In each round $j$ the adversary sends $m_0^j,m_1^j$ of equal length and receives $c^j=E(k,m_b^j)$ — **the same $b$ in every round**.
3. Adversary outputs $g$; wins iff $g=b$.

$\mathrm{ADV}_{\mathrm{CPA}}=|P(\text{win})-\tfrac12|$; ε-CPA secure / CPA secure as usual. Encrypting a message of its choice is just a round with $m_0^j=m_1^j$.

**Fact: no deterministic cipher is CPA-secure.** Round 1: $(m,m)$ → $c^1=E(k,m)$. Round 2: $(m,m')$ with $m'\ne m$ of the same length → $c^2$. Then $b=0\iff c^1=c^2$. Advantage ½.

Two ways out: **probabilistic** encryption and **nonce-based** encryption.`,
      formulas: [
        {
          id: 'adv-cpa',
          name: 'CPA advantage',
          tex: md`\mathrm{ADV}_{\mathrm{CPA}}(\mathcal E,A)=\Bigl|P\bigl(A\text{ wins the }q\text{-round CPA game}\bigr)-\tfrac12\Bigr|`,
          intuition: 'Semantic security, but the adversary sees encryptions of many (adaptively chosen) message pairs under the same key and bit.',
        },
      ],
      viz: [{ id: 'attackGame', props: { preset: 'cpa-det', presets: ['cpa-det', 'cpa-randctr', 'cpa-predcbc'] } }],
    },
    {
      id: 'random',
      title: 'Probabilistic CBC and CTR',
      kind: 'definition',
      importance: 'must',
      body: md`A **probabilistic cipher**: $E:\mathcal K\times\mathcal M\to\mathcal D(\mathcal C)$ is a randomized algorithm (output is a distribution); correctness as before.

**Randomized CBC/CTR:** $E^P(k,m)$ samples a fresh uniformly random $IV\in\mathcal X$, computes $e=E_{M(IV)}(k,m)$ and outputs $c=IV\|e$. Decryption reads the IV from the first block.

**For CBC the IV must be unpredictable** (high-quality randomness) at the time the adversary chooses its plaintext. *Attack on predictable IV* (e.g. IV = previous IV + 1, or the last ciphertext block as in SSL 3.0/TLS 1.0 – BEAST): after seeing $(IV_1,c_1)$ for $m$ and predicting $IV_2$, query $m_0=m\oplus IV_1\oplus IV_2$; if $b=0$ the challenger computes $E(k,m_0\oplus IV_2)=E(k,m\oplus IV_1)=c_1$ again.

**Theorems** (q-bounded adversaries: at most $q$ queries; $n$ = max blocks per message):
$$\text{CBC}^P:\ \delta=2\varepsilon+\frac{q^2n^2}{|\mathcal X|},\qquad \text{CTR}^P:\ \delta=2\varepsilon+\frac{q^2n}{|\mathcal X|}+\frac{qn^2}{|\mathcal X|}.$$
The quadratic terms are birthday bounds: with too many blocks under one key, IVs/counter ranges collide. For AES ($|\mathcal X|=2^{128}$) keys must be changed long before $q\cdot n$ approaches $2^{64}$ blocks.`,
      formulas: [
        {
          id: 'cbc-cpa',
          name: 'CPA security of randomized CBC',
          tex: md`\delta=2\varepsilon+\frac{q^2n^2}{|\mathcal X|}`,
          intuition: 'Secure block cipher + random IVs ⇒ CPA-secure, up to a birthday term in the total number of encrypted blocks.',
        },
        {
          id: 'ctr-cpa',
          name: 'CPA security of randomized CTR',
          tex: md`\delta=2\varepsilon+\frac{q^2n}{|\mathcal X|}+\frac{qn^2}{|\mathcal X|}`,
          intuition: 'Slightly better than CBC (q²n instead of q²n²): only overlapping counter ranges matter.',
        },
      ],
    },
    {
      id: 'nonce',
      title: 'Nonce-based encryption',
      kind: 'definition',
      importance: 'must',
      body: md`**Nonce** = *number used only once* (during the lifetime of a key). It may be random, or come from a public counter that both parties track (then it need not be sent) — it may be **predictable**, but must never repeat.

A **nonce-based cipher** over $(\mathcal K,\mathcal N,\mathcal M,\mathcal C)$: $E:\mathcal K\times\mathcal N\times\mathcal M\to\mathcal C$, $D:\mathcal K\times\mathcal N\times\mathcal C\to\mathcal M$, with $D(k,\nu,E(k,\nu,m))=m$. Encryption itself is deterministic.

**Nonce-based CPA game:** as the CPA game, but in round $i$ the adversary also picks the nonce $\nu_i$, which must differ from all earlier nonces $\nu_1,\dots,\nu_{i-1}$; the challenger returns $E(k,\nu_i,m_b^i)$.

- **Nonce-based CTR:** vanilla CTR with the nonce as IV; nonces are taken from $\{0,n,2n,\dots\}$ so the counter ranges of different messages never overlap. It is CPA-secure with a bound of the form ε plus a term that is negligible for large $|\mathcal X|$ — **no** $q^2$ birthday term.
- **Nonce-based CBC:** a nonce may be predictable, which is fatal for CBC. Fix: derive the IV by encrypting the nonce under a second, independent key: $y_0=E(k',\nu)$. Secure with $\delta=4\bigl(\varepsilon+\frac{q^2n^2}{|\mathcal X|}\bigr)$ (up to constants).

**Reusing a nonce** with CTR (or ChaCha) reuses the keystream: two-time pad. This is the classic real-world failure.`,
      formulas: [
        {
          id: 'ncbc',
          name: 'Nonce-based CBC',
          tex: md`y_0=E(k',\nu),\qquad y_i=E(k,\,y_{i-1}\oplus x_i)`,
          intuition: md`An unpredictable IV is derived from a possibly predictable nonce with an independent key $k'$.`,
        },
      ],
    },
  ],
  flashcards: [
    { id: 'l04-c1', front: 'CBC encryption formula', back: md`$y_0=IV$, $y_i=E(k,y_{i-1}\oplus x_i)$.` },
    { id: 'l04-c2', front: 'CBC decryption formula', back: md`$x_i=D(k,y_i)\oplus y_{i-1}$.` },
    { id: 'l04-c3', front: 'CTR keystream', back: md`$z_i=E(k,IV\boxplus[i])$; ciphertext $=m\oplus z$.` },
    { id: 'l04-c4', front: 'Advantages of CTR over CBC', back: 'Parallel, random access, no padding, only E needed, weaker IV requirement (nonce suffices), slightly better security bound.' },
    { id: 'l04-c5', front: 'CPA game', back: md`$k,b$ random; for $j=1..q$ adversary sends $(m_0^j,m_1^j)$, gets $E(k,m_b^j)$ (same $b$); outputs $g$.` },
    { id: 'l04-c6', front: 'Why can no deterministic cipher be CPA-secure?', back: md`Query $(m,m)$ then $(m,m')$: $b=0$ iff both ciphertexts are equal.` },
    { id: 'l04-c7', front: 'Probabilistic (randomized) CBC/CTR', back: md`Sample a fresh random IV for each message, output $IV\|E_{IV}(k,m)$.` },
    { id: 'l04-c8', front: 'Attack on CBC with a predictable IV', back: md`Having $c_1=E(k,m\oplus IV_1)$ and knowing $IV_2$, query $m_0=m\oplus IV_1\oplus IV_2$; if $b=0$ the ciphertext equals $c_1$.` },
    { id: 'l04-c9', front: 'Nonce', back: 'A value used at most once per key; may be predictable (e.g. a counter); need not be random or secret.' },
    { id: 'l04-c10', front: 'Nonce-based CPA game: the difference', back: 'The adversary chooses the nonce in each round, but nonces must be pairwise distinct.' },
    { id: 'l04-c11', front: 'Nonce-based CBC: how is the IV derived?', back: md`$IV=E(k',\nu)$ with an independent key $k'$, so a predictable nonce yields an unpredictable IV.` },
    { id: 'l04-c12', front: 'What happens if a CTR nonce is reused?', back: 'The keystream repeats: c₁ ⊕ c₂ = m₁ ⊕ m₂ (two-time pad); knowing one plaintext reveals the other.' },
    { id: 'l04-c13', front: 'CTR semantic bound (fixed IV)', back: md`$\delta=2\varepsilon+n^2/(2|\mathcal X|)$.` },
    { id: 'l04-c14', front: 'Randomized CBC CPA bound', back: md`$\delta=2\varepsilon+q^2n^2/|\mathcal X|$.` },
    { id: 'l04-c15', front: 'Error propagation in CBC vs CTR', back: 'CBC: flipped ciphertext bit garbles its block and flips the same bit in the next block. CTR: flips exactly that plaintext bit.' },
  ],
  quiz: [
    {
      id: 'l04-q1',
      type: 'mcq',
      difficulty: 1,
      prompt: 'Which mode does not require padding the message to a multiple of the block length?',
      options: ['ECB', 'CBC', 'CTR', 'all of them require padding'],
      answer: 2,
      explanation: 'CTR XORs a keystream, which can be truncated to any length.',
    },
    {
      id: 'l04-q2',
      type: 'mcq',
      difficulty: 1,
      prompt: 'Which mode allows parallel encryption of all blocks?',
      options: ['CBC', 'CTR', 'both', 'neither'],
      answer: 1,
      explanation: 'CBC encryption needs the previous ciphertext block; CTR blocks are independent.',
    },
    {
      id: 'l04-q3',
      type: 'mcq',
      difficulty: 1,
      prompt: 'Why can no deterministic cipher be CPA-secure?',
      options: ['Because its key is too short', 'Because encrypting the same message twice gives the same ciphertext, which the adversary can detect', 'Because it is malleable', 'Because it requires padding'],
      answer: 1,
      explanation: 'Query (m, m) and then (m, m′): equality of ciphertexts reveals b.',
    },
    {
      id: 'l04-q4',
      type: 'mcq',
      difficulty: 2,
      prompt: 'For CPA security, the IV of randomized CBC must be',
      options: ['secret', 'unpredictable (random) for the adversary at the time it chooses the plaintext', 'equal to the last ciphertext block of the previous message', 'a counter'],
      answer: 1,
      explanation: 'A predictable IV allows the attack m₀ = m ⊕ IV₁ ⊕ IV₂. The IV is sent in the clear, so it need not be secret.',
    },
    {
      id: 'l04-q5',
      type: 'mcq',
      difficulty: 2,
      prompt: 'In CBC, one bit of ciphertext block yᵢ is flipped in transit. Which plaintext blocks are affected after decryption?',
      options: ['only xᵢ (garbled)', 'xᵢ garbled and the same bit flipped in xᵢ₊₁', 'all blocks from xᵢ on', 'only xᵢ₊₁'],
      answer: 1,
      explanation: md`$x_i=D(k,y_i)\oplus y_{i-1}$ is garbled; $x_{i+1}=D(k,y_{i+1})\oplus y_i$ gets the flipped bit.`,
    },
    {
      id: 'l04-q6',
      type: 'mcq',
      difficulty: 2,
      prompt: 'Which requirement on the nonce is sufficient for nonce-based CTR?',
      options: ['random and secret', 'unpredictable', 'never repeated under the same key (and counter ranges must not overlap)', 'equal to the key'],
      answer: 2,
      explanation: 'Nonces may be public and predictable; uniqueness is what matters.',
    },
    {
      id: 'l04-q7',
      type: 'mcq',
      difficulty: 3,
      prompt: md`A system encrypts with randomized CBC but takes the IV of message $j+1$ to be the last ciphertext block of message $j$. Is it CPA-secure?`,
      options: ['Yes, the IV is random-looking', 'No: the adversary knows the next IV before choosing the next plaintext pair', 'Yes, as long as the block cipher is secure', 'No, because CBC is never CPA-secure'],
      answer: 1,
      explanation: md`The next IV is known in advance, so the predictable-IV attack applies (this was the BEAST attack on TLS 1.0).`,
    },
    {
      id: 'l04-q8',
      type: 'mcq',
      difficulty: 3,
      prompt: md`An adversary in the CPA game against randomized CTR with 128-bit blocks makes $q=2^{40}$ queries of $n=2^{20}$ blocks each. Which term of the bound $2\varepsilon+\frac{q^2n}{|\mathcal X|}+\frac{qn^2}{|\mathcal X|}$ dominates (assuming tiny ε)?`,
      options: [md`$q^2n/|\mathcal X|=2^{-28}$`, md`$qn^2/|\mathcal X|=2^{-48}$`, md`$2\varepsilon$`, 'they are equal'],
      answer: 0,
      explanation: md`$q^2n=2^{100}$, so $2^{100-128}=2^{-28}$; $qn^2=2^{80}$ gives $2^{-48}$. Many messages, not long ones, make CTR's bound grow.`,
    },
    {
      id: 'l04-q9',
      type: 'mcq',
      difficulty: 3,
      prompt: md`Someone proposes nonce-based CBC with $IV=\nu$ directly (nonce = message counter). What breaks?`,
      options: ['Nothing, nonces never repeat', 'CPA security: the adversary knows the next IV and can apply the predictable-IV attack', 'Correctness of decryption', 'Only performance'],
      answer: 1,
      explanation: md`Nonces may be predictable, CBC needs unpredictable IVs. That is why the nonce is first encrypted under an independent key $k'$.`,
    },
    {
      id: 'l04-q10',
      type: 'mcq',
      difficulty: 2,
      prompt: 'What is the difference between semantic security and CPA security?',
      options: ['CPA security allows the adversary to see encryptions of many chosen message pairs under the same key', 'CPA security requires perfect secrecy', 'Semantic security is stronger', 'They only differ in the definition of advantage'],
      answer: 0,
      explanation: 'Semantic security covers a single encryption; CPA security covers many-time keys and chosen plaintexts.',
    },
  ],
};
