import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l06: Topic = {
  id: 'l06',
  lecture: 6,
  tag: 'L06',
  examGroup: 'M',
  title: 'Message authentication codes',
  summary: md`MACs and the existential-forgery game; MACs from hash functions (why h(k‖m) fails, HMAC, KMAC); MACs from block ciphers (raw CBC-MAC and prefix-freeness, ECBC-MAC, CMAC); one-time MACs and Carter–Wegman MACs.`,
  sections: [
    {
      id: 'def',
      title: 'MACs and their security',
      kind: 'definition',
      importance: 'must',
      body: md`Problem: Bob wants to be sure a message really comes from Alice and was not modified (**integrity and authenticity**). Encryption does not give this (recall OTP malleability).

**Definition.** A MAC over $(\mathcal K,\mathcal M,\mathcal H)$ is a pair $(S,V)$:
- $S:\mathcal K\times\mathcal M\to\mathcal D(\mathcal H)$ — a (possibly randomized) **signing** algorithm producing a **tag**;
- $V:\mathcal K\times\mathcal M\times\mathcal H\to\{\mathit{true},\mathit{false}\}$ — a deterministic **verification** algorithm;

with $V(k,m,S(k,m))=\mathit{true}$ with probability 1.

**Existential-forgery (EF) game:**
1. Challenger samples $k\leftarrow\mathcal K$.
2. Adversary chooses $N$; in each round $i$ it sends $m_i$ and receives $t_i=S(k,m_i)$ (**chosen-message attack**).
3. Adversary outputs $(m_{N+1},t_{N+1})\notin\{(m_1,t_1),\dots,(m_N,t_N)\}$ and **wins** iff $V(k,m_{N+1},t_{N+1})=\mathit{true}$.

$\mathrm{ADV}_{\mathrm{EF}}(\mathcal{MAC},A)=P(A\text{ wins})$ (no "−½": there is no bit to guess). The MAC is ε-secure if every efficient adversary has advantage ≤ ε.

"Existential": the adversary wins with a forgery on **any** new pair — even a meaningless message, or a new tag for an already-queried message.`,
      formulas: [
        {
          id: 'adv-ef',
          name: 'MAC (existential forgery) advantage',
          tex: md`\mathrm{ADV}_{\mathrm{EF}}(\mathcal{MAC},A)=P\bigl(V(k,m_{N+1},t_{N+1})=\mathit{true}\ \wedge\ (m_{N+1},t_{N+1})\text{ new}\bigr)`,
          intuition: 'Probability of producing any valid message/tag pair that was not returned by the signing oracle.',
          pitfalls: 'Unlike indistinguishability games, there is no ½ to subtract.',
        },
      ],
      viz: [{ id: 'attackGame', props: { preset: 'ef-cbcmac', presets: ['ef-cbcmac', 'ef-ecbc'] } }],
    },
    {
      id: 'hash-macs',
      title: 'MACs from hash functions: h(k‖m), h(m‖k), HMAC',
      kind: 'concept',
      importance: 'must',
      body: md`Idea: tag = hash of some combination of $k$ and $m$.
- $S(k,m)=h(k\|m)$: **insecure for Merkle–Damgård hashes** because of **length extension**: from $t=h(k\|m)$ one computes $h(k\|m\|\mathrm{pad}\|m')$ — a valid tag on a new message. (Secure for sponge hashes: **KMAC**, Keccak-based.)
- $S(k,m)=h(m\|k)$: avoids extension but breaks as soon as $h$ has a known collision $h(m)=h(m')$ of equal-length blocks: then $h(m\|k)=h(m'\|k)$ by the MD structure.

**HMAC** (used in TLS, SSH, IPsec) — a nested construction with two derived keys. Let $j$ be the block length of the compression function:
1. if $\mathrm{len}(k)>j$: $k\leftarrow h(k)$; pad $k$ with zero bytes to length $j$;
2. $k_i=k\oplus\mathit{ipad}$, $k_o=k\oplus\mathit{opad}$ ($\mathit{ipad}$ = byte 0x36 repeated, $\mathit{opad}$ = 0x5c repeated);
3. $\mathrm{HMAC}(k,m)=h\bigl(k_o\,\|\,h(k_i\,\|\,m)\bigr)$.

The inner hash may be length-extended, but its result is hidden inside the outer hash, whose input the attacker cannot extend meaningfully.

**Notes:** security proof assumes the compression function is a PRF even under related keys — it does **not** need collision resistance (HMAC-MD5 was not broken by MD5 collisions). HMAC is deterministic: verification recomputes the tag and compares.`,
      formulas: [
        {
          id: 'hmac',
          name: 'HMAC',
          tex: md`\mathrm{HMAC}(k,m)=h\bigl((k\oplus\mathit{opad})\,\|\,h((k\oplus\mathit{ipad})\,\|\,m)\bigr)`,
          symbols: [
            { sym: md`\mathit{ipad},\mathit{opad}`, meaning: 'the constant bytes 0x36 and 0x5c repeated to the block length' },
            { sym: 'h', meaning: 'Merkle–Damgård hash such as SHA-256' },
          ],
          intuition: 'Two nested hashes with two different keys; the outer one hides the inner state, stopping length extension.',
        },
      ],
      viz: [{ id: 'macLab', props: { tab: 'hmac' } }],
    },
    {
      id: 'cbcmac',
      title: 'CBC-MAC and ECBC-MAC',
      kind: 'theorem',
      importance: 'must',
      body: md`**Raw ("vanilla") CBC-MAC:** CBC encryption with $IV=0$; the tag is only the **last** chaining block. Deterministic.

**Prefix-free adversaries:** no query is a proper prefix of another query (including the final forgery).
**Theorem.** If the block cipher is ε-secure (negligible ε), raw CBC-MAC is δ-secure for negligible δ **against prefix-free adversaries** — e.g. when all messages have the same fixed length.

**For variable-length messages it is insecure.** Query one-block $m$, get $t=E(k,m)$. Then $m\,\|\,(m\oplus t)$ has tag $E(k,E(k,m)\oplus m\oplus t)=E(k,m)=t$: a forgery without further queries.

**ECBC-MAC (encrypted CBC-MAC):** two keys $(k_1,k_2)$; always pad (injective padding, adding a new block if the message is already aligned); compute the raw CBC-MAC under $k_1$ and **encrypt the result once more under $k_2$**: $t=E(k_2,y_j)$.

**Theorem.** For an ε-secure block cipher on $\mathcal X$, messages of ≤ $n$ blocks and adversaries with ≤ $N$ queries, ECBC-MAC is δ-secure with
$$\delta=2\varepsilon+O\!\left(\frac{(Nn)^2}{|\mathcal X|}\right).$$
**The bound is essentially optimal:** if two block-aligned messages collide, $S(m)=S(m')$, then $S(m\|x)=S(m'\|x)$ for every $x$ (the internal states agree). A birthday search finds such a collision after about $\sqrt{|\mathcal X|}$ queries, giving a forgery. So with 128-bit blocks, change keys long before $2^{64}$ tags.

Padding note: the padding must be injective; with 10* padding an extra block is added if the length is already a multiple of the block size. (Zero padding is not injective: $m$ and $m\|0$ would share a tag.)`,
      formulas: [
        {
          id: 'ecbc',
          name: 'ECBC-MAC',
          tex: md`y_1=E(k_1,x_1),\ \ y_i=E(k_1,y_{i-1}\oplus x_i),\qquad t=E(k_2,y_j)`,
          intuition: 'Raw CBC-MAC followed by one more encryption under an independent key, which hides the chaining value.',
        },
        {
          id: 'ecbc-bound',
          name: 'ECBC-MAC security bound',
          tex: md`\delta=2\varepsilon+O\!\left(\frac{(Nn)^2}{|\mathcal X|}\right)`,
          intuition: 'Secure until the total number of processed blocks approaches the birthday bound √|X|.',
        },
      ],
      viz: [{ id: 'macLab', props: { tab: 'cbc' } }],
    },
    {
      id: 'cmac',
      title: 'Prefix-free encoding and CMAC',
      kind: 'concept',
      importance: 'understand',
      body: md`Raw CBC-MAC is secure against prefix-free adversaries. **Principled fix:** encode messages *prefix-freely* before MACing, so no encoded message is a prefix of another (e.g. prepend the length, or mark the last block specially).

**CMAC** (NIST standard, one key) uses this idea:
- derive sub-keys from $k$: $L=E(k,0^\ell)$, $k_1=x\cdot L$, $k_2=x^2\cdot L$ in GF($2^{128}$) (a shift plus a conditional XOR of a constant);
- if $m$ is block-aligned, XOR $k_1$ into the last block; otherwise pad with $10^*$ and XOR $k_2$ into the last block;
- run raw CBC-MAC with $k$.

XORing a secret value into the last block makes it impossible to use a tag as an intermediate chaining value, which kills the extension attack. And because **different** sub-keys mark padded and unpadded messages, CMAC needs **no extra padding block** for aligned messages: $m$ and $m\|10\cdots0$ can no longer collide, since one gets $k_1$ and the other $k_2$. Details of sub-key generation need not be memorised. CMAC comes with a security theorem.`,
    },
    {
      id: 'otmac',
      title: 'One-time MACs and Carter–Wegman MACs',
      kind: 'concept',
      importance: 'context',
      body: md`**One-time EF game:** like the EF game but with a single signing query; then the adversary must forge for $m'\ne m$. One-time MACs can be **unconditionally** secure and very fast.

**Polynomial one-time MAC:** prime $p>2^\ell$, key $(a,b)\in\mathbb Z_p^2$, message blocks $m_1,\dots,m_j\in\mathbb Z_p$:
$$P_m(y)=y^{j+1}+m_jy^j+\dots+m_1y,\qquad S((a,b),m)=P_m(a)+b\bmod p.$$
After one tag, every $a$ is still possible (with a matching $b$); a forgery for $m'$ succeeds only if $a$ is a root of $P_m-P_{m'}$ (degree ≤ $j+1$), probability ≤ $(j+1)/p$. Working modulo a **prime** is essential (modulo $2^{128}$ it breaks: multiplication by 2 loses information). Reusing the key breaks it.

**Carter–Wegman:** turn a one-time MAC into a many-time MAC with a block cipher: pick a fresh random $r$, tag $=(r,\ E(k_1,r)\oplus S_{ot}(k_2,m))$; verify by removing $E(k_1,r)$. The random $r$ must never repeat — with a broken RNG giving the same $r$ twice, the one-time key is effectively reused. GCM (GHASH) and Poly1305 are CW-style MACs.`,
      formulas: [
        {
          id: 'polymac',
          name: 'Polynomial one-time MAC',
          tex: md`S((a,b),m)=a^{j+1}+m_ja^j+\dots+m_1a+b\pmod p`,
          intuition: 'Evaluate a message-dependent polynomial at a secret point and mask with a secret b.',
          conditions: 'One message per key; p prime.',
        },
        {
          id: 'cw',
          name: 'Carter–Wegman MAC',
          tex: md`S((k_1,k_2),m)=\bigl(r,\ E(k_1,r)\oplus S_{ot}(k_2,m)\bigr),\quad r\text{ fresh random}`,
          intuition: 'A pseudorandom one-time pad E(k₁, r) hides the one-time MAC value, so the one-time key can be reused safely.',
        },
      ],
      viz: [{ id: 'macLab', props: { tab: 'poly' } }],
    },
  ],
  flashcards: [
    { id: 'l06-c1', front: 'MAC: syntax and correctness', back: md`$(S,V)$, $S$ possibly randomized signing, $V$ deterministic verification, $V(k,m,S(k,m))=\mathit{true}$ always.` },
    { id: 'l06-c2', front: 'Existential-forgery game for MACs', back: md`$k$ random; adversary queries tags of $m_1..m_N$; outputs a new pair $(m,t)$; wins iff $V(k,m,t)=\mathit{true}$. ADV = P(win).` },
    { id: 'l06-c3', front: 'Why is h(k‖m) insecure with SHA-256?', back: 'Length extension: from h(k‖m) and |k‖m| compute h(k‖m‖pad‖m′).' },
    { id: 'l06-c4', front: 'Weakness of h(m‖k)', back: md`A collision $h(m)=h(m')$ (aligned) gives $h(m\|k)=h(m'\|k)$: the tag of $m$ is valid for $m'$.` },
    { id: 'l06-c5', front: 'HMAC formula', back: md`$h((k\oplus\mathit{opad})\|h((k\oplus\mathit{ipad})\|m))$, ipad = 0x36…, opad = 0x5c….` },
    { id: 'l06-c6', front: 'What does the HMAC proof assume?', back: 'The compression function is a PRF (even under related keys) — not collision resistance.' },
    { id: 'l06-c7', front: 'Raw CBC-MAC', back: 'CBC with IV = 0, output only the last block. Secure only for prefix-free message sets (e.g. fixed length).' },
    { id: 'l06-c8', front: 'Forgery on raw CBC-MAC', back: md`Query $m$ (one block) → $t$. Then $(m\,\|\,m\oplus t,\ t)$ verifies.` },
    { id: 'l06-c9', front: 'ECBC-MAC', back: md`Raw CBC-MAC under $k_1$, then encrypt the result under $k_2$; always pad injectively.` },
    { id: 'l06-c10', front: 'ECBC security bound and why it is tight', back: md`$2\varepsilon+O((Nn)^2/|\mathcal X|)$. A tag collision of aligned $m,m'$ gives $S(m\|x)=S(m'\|x)$, findable by birthday search.` },
    { id: 'l06-c11', front: 'Prefix-free encoding idea', back: 'Encode messages so that none is a prefix of another; raw CBC-MAC on prefix-free inputs is secure.' },
    { id: 'l06-c12', front: 'How does CMAC avoid an extra padding block?', back: 'Aligned messages get sub-key k₁ XORed into the last block, padded ones k₂ — the sub-keys distinguish them, so padding need not be injective on its own.' },
    { id: 'l06-c13', front: 'One-time MAC', back: 'Secure when the key signs only one message; can be unconditionally secure (e.g. polynomial MAC mod p).' },
    { id: 'l06-c14', front: 'Carter–Wegman MAC', back: md`$(r,E(k_1,r)\oplus S_{ot}(k_2,m))$ with fresh random $r$; breaks if $r$ repeats.` },
    { id: 'l06-c15', front: 'Why must the polynomial MAC work modulo a prime?', back: 'ℤₚ is a field, so a non-zero polynomial of degree d has ≤ d roots; modulo 2^128 multiplication by even numbers loses information and forgeries become easy.' },
  ],
  quiz: [
    {
      id: 'l06-q1',
      type: 'mcq',
      difficulty: 1,
      prompt: 'In the existential-forgery game, the adversary wins if it outputs',
      options: ['the key', 'a valid tag for a message of the challenger’s choice', 'any valid (message, tag) pair that it did not receive from the signing oracle', 'two messages with the same tag'],
      answer: 2,
      explanation: 'Existential forgery: any new valid pair counts.',
    },
    {
      id: 'l06-q2',
      type: 'mcq',
      difficulty: 1,
      prompt: 'Which MAC construction is vulnerable to length extension when instantiated with SHA-256?',
      options: ['HMAC-SHA-256', 'SHA-256(k ‖ m)', 'SHA3-256(k ‖ m)', 'CMAC'],
      answer: 1,
      explanation: 'SHA-256 is Merkle–Damgård; SHA-3 is a sponge (KMAC is fine).',
    },
    {
      id: 'l06-q3',
      type: 'mcq',
      difficulty: 2,
      prompt: 'Raw CBC-MAC is secure (for a secure block cipher) if',
      options: ['messages have arbitrary lengths', 'all messages have the same fixed number of blocks', 'the IV is random', 'the tag is truncated'],
      answer: 1,
      explanation: 'A fixed-length message space is prefix-free.',
    },
    {
      id: 'l06-q4',
      type: 'mcq',
      difficulty: 2,
      prompt: 'What is the role of the second key in ECBC-MAC?',
      options: ['It encrypts the final CBC value so the tag is not a usable chaining value', 'It encrypts the message for confidentiality', 'It is used as the IV', 'It authenticates the length'],
      answer: 0,
      explanation: 'Without it, the tag equals the internal state and can be extended (the m ‖ m⊕t forgery).',
    },
    {
      id: 'l06-q5',
      type: 'mcq',
      difficulty: 1,
      prompt: 'What does the advantage of an adversary in the MAC forgery game equal?',
      options: ['|P(win) − ½|', 'P(win)', '2·P(win) − 1', 'P(win)²'],
      answer: 1,
      explanation: 'There is no secret bit; any success is advantage.',
    },
    {
      id: 'l06-q6',
      type: 'mcq',
      difficulty: 2,
      prompt: 'Roughly after how many tags under one key can a generic forgery against ECBC-MAC with AES be expected?',
      options: ['2^32', '2^64', '2^128', 'never'],
      answer: 1,
      explanation: 'A birthday collision of 128-bit internal values after ≈ 2^64 queries, then S(m‖x) = S(m′‖x).',
    },
    {
      id: 'l06-q7',
      type: 'mcq',
      difficulty: 3,
      prompt: md`A MAC is defined as $S(k,m_1\|m_2)=E(k,m_1)\oplus E(k,m_2)$ for two-block messages. Which forgery works with one query?`,
      options: [md`Query $m_1\|m_2$, output $(m_2\|m_1,\ t)$`, md`Query $m_1\|m_2$, output $(m_1\|m_1,\ t)$`, 'No forgery is possible without the key', md`Query $m_1\|m_2$, output $(m_1\|m_2,\ t\oplus1)$`],
      answer: 0,
      explanation: md`XOR is commutative: swapping the blocks gives the same tag. (Also $m\|m$ always has tag $0$ — a forgery with no query at all.)`,
    },
    {
      id: 'l06-q8',
      type: 'mcq',
      difficulty: 3,
      prompt: md`A Carter–Wegman MAC is implemented with a broken RNG that always returns the same $r$. What can an adversary do?`,
      options: ['Nothing; the block cipher still protects the tag', md`From two tags, $t_1\oplus t_2=S_{ot}(k_2,m_1)\oplus S_{ot}(k_2,m_2)$, i.e. the one-time MAC is used twice with the same mask — it can solve for the one-time key and forge`, 'Recover the block-cipher key', 'Only replay old tags'],
      answer: 1,
      explanation: md`$E(k_1,r)$ cancels, so the attacker sees two evaluations of the one-time MAC under one key. For the polynomial MAC this reveals $(a,b)$, and every message can then be signed.`,
    },
    {
      id: 'l06-q9',
      type: 'mcq',
      difficulty: 3,
      prompt: md`ECBC-MAC is used with **zero padding** (append zeros to the next block boundary, no extra block). Which pair has equal tags?`,
      options: [md`$m$ and $m\|0$ when $\mathrm{len}(m)$ is not a multiple of the block size`, md`$m$ and $m\oplus1$`, 'no pair, the second encryption prevents this', 'only messages of different block counts'],
      answer: 0,
      explanation: md`Both pad to the same string: zero padding is not injective. Then a tag for $m$ is also a valid tag for $m\|0$.`,
    },
    {
      id: 'l06-q10',
      type: 'mcq',
      difficulty: 2,
      prompt: 'HMAC remained secure even after MD5 collisions were found because',
      options: ['HMAC uses two hashes, so collisions cancel', 'its security proof relies on PRF-like behaviour of the compression function, not on collision resistance', 'collisions of MD5 require knowledge of the key', 'HMAC never used MD5'],
      answer: 1,
      explanation: 'Collision resistance is not needed for HMAC’s security.',
    },
  ],
};
