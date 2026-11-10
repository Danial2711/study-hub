import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l07: Topic = {
  id: 'l07',
  lecture: 7,
  tag: 'L07',
  examGroup: 'AE',
  title: 'Authenticated encryption',
  summary: md`AE-enabled ciphers, ciphertext integrity, AE security, the CCA game and why AE implies CCA security, MAC-then-Encrypt vs Encrypt-then-MAC, practical AE modes (GCM, CCM, EAX, ChaCha20-Poly1305) and AEAD.`,
  sections: [
    {
      id: 'purpose',
      title: 'Purpose of AE and the three compositions',
      kind: 'concept',
      importance: 'must',
      body: md`Goal: **secrecy** (like a CPA-secure cipher) **and authenticity** (like a MAC) in one primitive, so that users do not have to combine them by hand — and get it wrong.

Three ways to combine a cipher $E$ (key $k_E$) and a MAC $S$ (key $k_M$):
- **Encrypt-then-MAC (EtM):** $c\leftarrow E(k_E,m)$, send $(c,\ S(k_M,c))$.
- **MAC-then-Encrypt (MtE):** $t\leftarrow S(k_M,m)$, send $E(k_E,(m,t))$.
- **Encrypt-and-MAC (E&M):** send $(E(k_E,m),\ S(k_M,m))$.

Always use **independent keys** for the two components.`,
      viz: [{ id: 'aeLab' }],
    },
    {
      id: 'ae-def',
      title: 'AE-enabled ciphers, ciphertext integrity, AE security',
      kind: 'definition',
      importance: 'must',
      body: md`**AE-enabled cipher** over $(\mathcal K,\mathcal M,\mathcal C)$: $E:\mathcal K\times\mathcal M\to\mathcal D(\mathcal C)$ (possibly randomized) and $D:\mathcal K\times\mathcal C\to\mathcal M\cup\{\bot\}$ — decryption may **reject** with $\bot$ — and $D(k,E(k,m))=m$.

**Ciphertext-integrity (CI) game:**
1. Challenger samples $k$.
2. Adversary chooses $N$; in each round sends $m_i$ and receives $c_i=E(k,m_i)$.
3. Adversary outputs a ciphertext $c\notin\{c_1,\dots,c_N\}$; it **wins** iff $D(k,c)\ne\bot$.

$\mathrm{ADV}_{\mathrm{CI}}=P(\text{win})$; δ-ciphertext integrity if every efficient adversary has advantage ≤ δ.

**Definition.** $\mathcal E$ is **(ε, δ)-AE secure** if it is ε-CPA secure **and** has δ-ciphertext integrity.`,
      formulas: [
        {
          id: 'adv-ci',
          name: 'Ciphertext-integrity advantage',
          tex: md`\mathrm{ADV}_{\mathrm{CI}}(\mathcal E,A)=P\bigl(D(k,c)\ne\bot\ \wedge\ c\notin\{c_1,\dots,c_N\}\bigr)`,
          intuition: 'The probability of creating any new ciphertext that the receiver accepts.',
        },
      ],
    },
    {
      id: 'cca',
      title: 'Chosen-ciphertext attacks and the CCA game',
      kind: 'definition',
      importance: 'must',
      body: md`Real attackers can often make the receiver decrypt ciphertexts of their choice and observe the reaction (error messages, timing, behaviour).

**CCA game** against $(E,D)$:
1. Challenger samples $k$ and $b$; adversary announces $q$.
2. In each round the adversary makes **either**
   - a **plaintext query** $(m_0^j,m_1^j)$ of equal length → receives $c^j=E(k,m_b^j)$, **or**
   - a **ciphertext query** $C^j$ that is **not** one of the earlier challenge ciphertexts $c^\ell$ → receives $M^j=D(k,C^j)$.
3. Adversary outputs $g$; wins iff $g=b$.

$\mathrm{ADV}_{\mathrm{CCA}}=|P(\text{win})-\tfrac12|$; ε-CCA secure if every efficient adversary has advantage ≤ ε.

**Every malleable cipher is CCA-insecure.** Example with randomized CTR: plaintext query $(0^n,1^n)$ → $c=(IV,e)$. Ciphertext query $(IV,e\oplus0\cdots01)$ — a new ciphertext — returns $m_b$ with the last bit flipped, revealing $b$. Real-world cases: padding-oracle attacks such as **POODLE** (2014), which completely broke SSL 3.0 (MAC-then-encrypt with CBC).`,
      formulas: [
        {
          id: 'adv-cca',
          name: 'CCA advantage',
          tex: md`\mathrm{ADV}_{\mathrm{CCA}}(\mathcal E,A)=\Bigl|P\bigl(A\text{ wins the CCA game}\bigr)-\tfrac12\Bigr|`,
          intuition: 'Like CPA, but the adversary may also ask for decryptions of any ciphertext other than the challenge ciphertexts.',
        },
      ],
      viz: [{ id: 'attackGame', props: { preset: 'cca-ctr', presets: ['cca-ctr', 'cca-etm'] } }],
    },
    {
      id: 'ae-cca',
      title: 'AE security implies CCA security',
      kind: 'theorem',
      importance: 'understand',
      body: md`**Theorem.** If $\mathcal E$ is (ε, δ)-AE secure, then for every efficient adversary making at most $q$ queries
$$\mathrm{ADV}_{\mathrm{CCA}}(\mathcal E,A)\le\varepsilon+2q\delta.$$

Rough idea: by ciphertext integrity, every ciphertext query on a *new* ciphertext is answered with $\bot$ except with probability δ — so the adversary can predict the answer itself, and the decryption oracle is useless. What remains is a CPA game. (Rough idea "AE ⇒ CCA" is enough for the exam.)`,
      formulas: [
        {
          id: 'ae-cca',
          name: 'AE ⇒ CCA',
          tex: md`\mathrm{ADV}_{\mathrm{CCA}}(\mathcal E,A)\le\varepsilon+2q\delta`,
          intuition: 'Decryption queries only ever return ⊥ unless the adversary breaks ciphertext integrity.',
        },
      ],
    },
    {
      id: 'mte',
      title: 'MAC-then-Encrypt',
      kind: 'definition',
      importance: 'must',
      body: md`**MtE system** from a MAC $(S,V)$ and a cipher $(E,D)$ over $\mathcal M\times\mathcal H$:
- $E_{MtE}((k_M,k_E),m)=E(k_E,(m,S(k_M,m)))$;
- $D_{MtE}$: decrypt to $(m,t)$ (⊥ if malformed), output $m$ if $V(k_M,m,t)$, else ⊥.

**MtE is not AE-secure in general.** The receiver must decrypt (and e.g. check padding) *before* it can check the tag, and the different reactions leak information: padding oracles (POODLE on SSL 3.0, Lucky 13).

It can be secured for special cases: **Theorem:** with randomized CTR and an α-**one-time** secure MAC, MtE is (ε, δ)-AE secure for negligible δ (against q-bounded adversaries). For randomized CBC a similar result needs that $m\|t$ is never padded. Takeaway: remember that **MtE does not always provide AE**.`,
    },
    {
      id: 'etm',
      title: 'Encrypt-then-MAC',
      kind: 'theorem',
      importance: 'must',
      body: md`**EtM system** from a cipher $(E,D)$ and a MAC $(S,V)$ over $\mathcal C$:
- $E_{EtM}((k_E,k_M),m)=(c,\ S(k_M,c))$ with $c\leftarrow E(k_E,m)$;
- $D_{EtM}((k_E,k_M),(c,t))$: if $V(k_M,c,t)$ output $D(k_E,c)$, else ⊥.

**Theorem.** If $\mathcal E$ is ε-CPA secure and the MAC is δ-secure, then EtM is **(ε, δ)-AE secure**.

Why it works: any modified ciphertext needs a new valid tag (a MAC forgery), and the tag is computed on the ciphertext, so it reveals nothing about the plaintext. The receiver rejects forgeries **before** decrypting. **EtM is the theoretically sound way to go.** (The keys must be independent; and the MAC must cover everything that is sent, including the IV.)

**Encrypt-and-MAC** is not recommended: a deterministic MAC on the plaintext reveals whether two messages are equal (not CPA-secure), and a MAC need not hide its input at all.`,
      proof: md`*CPA part:* a CPA adversary against EtM is turned into one against $\mathcal E$ by computing the tags itself with its own MAC key. *CI part:* a new valid $(c,t)$ is either a new $c$ with a valid tag, or an old $c$ with a different tag — both are existential forgeries against the MAC, whose key is independent.`,
    },
    {
      id: 'practice',
      title: 'Practical AE ciphers and AEAD',
      kind: 'concept',
      importance: 'context',
      body: md`Dedicated block-cipher modes:
- **EAX:** nonce-based CTR, then CMAC (EtM).
- **CCM:** CBC-MAC then nonce-based CTR (MtE; Wi-Fi WPA2).
- **GCM (Galois/Counter Mode):** nonce-based CTR, then a Carter–Wegman MAC built from the GHASH one-time MAC — a polynomial MAC over GF($2^{128}$). Fastest, especially with the PCLMULQDQ carry-less multiplication instruction.
- **ChaCha20-Poly1305:** ChaCha20 stream cipher, then Poly1305 (a CW-style polynomial MAC modulo $2^{130}-5$).

**AEAD — authenticated encryption with associated data:** all modern modes support it. The *message* is encrypted and authenticated, the *associated data* (e.g. packet headers that routers must read) is only authenticated.`,
    },
  ],
  flashcards: [
    { id: 'l07-c1', front: 'AE-enabled cipher', back: md`$E$ possibly randomized, $D:\mathcal K\times\mathcal C\to\mathcal M\cup\{\bot\}$, with $D(k,E(k,m))=m$.` },
    { id: 'l07-c2', front: 'Ciphertext-integrity game', back: md`Adversary gets encryptions of chosen $m_i$; outputs a new $c\notin\{c_i\}$; wins iff $D(k,c)\ne\bot$.` },
    { id: 'l07-c3', front: 'AE security', back: 'ε-CPA security + δ-ciphertext integrity.' },
    { id: 'l07-c4', front: 'CCA game', back: 'CPA game plus ciphertext queries: the adversary may ask for D(k, C) for any C that is not a previous challenge ciphertext.' },
    { id: 'l07-c5', front: 'AE ⇒ CCA bound', back: md`$\mathrm{ADV}_{\mathrm{CCA}}\le\varepsilon+2q\delta$.` },
    { id: 'l07-c6', front: 'Why is randomized CTR not CCA-secure?', back: 'It is malleable: flip a bit of the challenge ciphertext and ask for its decryption — the answer is m_b with that bit flipped.' },
    { id: 'l07-c7', front: 'Encrypt-then-MAC', back: md`$(c,S(k_M,c))$ with $c=E(k_E,m)$; verify the tag before decrypting.` },
    { id: 'l07-c8', front: 'EtM theorem', back: 'ε-CPA-secure cipher + δ-secure MAC ⇒ (ε, δ)-AE secure.' },
    { id: 'l07-c9', front: 'MAC-then-Encrypt and its problem', back: md`$E(k_E,(m,S(k_M,m)))$. Not AE-secure in general: the receiver decrypts/unpads before verifying, enabling padding-oracle attacks (POODLE).` },
    { id: 'l07-c10', front: 'When is MtE provably secure?', back: 'With randomized CTR and a one-time secure MAC (or CBC when m‖t is never padded).' },
    { id: 'l07-c11', front: 'Problem with Encrypt-and-MAC', back: 'The tag is computed on the plaintext and sent in the clear: a deterministic MAC reveals equal messages, and MACs need not hide their input.' },
    { id: 'l07-c12', front: 'GCM in one sentence', back: 'Nonce-based CTR encryption plus a Carter–Wegman MAC using the GHASH polynomial MAC over GF(2¹²⁸).' },
    { id: 'l07-c13', front: 'AEAD', back: 'Authenticated encryption with associated data: message encrypted and authenticated, associated data (headers) only authenticated.' },
    { id: 'l07-c14', front: 'What was POODLE?', back: 'A padding-oracle chosen-ciphertext attack that broke SSL 3.0 (MAC-then-encrypt with CBC).' },
  ],
  quiz: [
    {
      id: 'l07-q1',
      type: 'mcq',
      difficulty: 1,
      prompt: 'Which composition is generically AE-secure (CPA-secure cipher + secure MAC, independent keys)?',
      options: ['MAC-then-Encrypt', 'Encrypt-then-MAC', 'Encrypt-and-MAC', 'all three'],
      answer: 1,
      explanation: 'The EtM theorem; MtE and E&M are not secure in general.',
    },
    {
      id: 'l07-q2',
      type: 'mcq',
      difficulty: 1,
      prompt: 'AE security consists of',
      options: ['CPA security and ciphertext integrity', 'CCA security and collision resistance', 'semantic security and non-repudiation', 'perfect secrecy and MAC security'],
      answer: 0,
      explanation: 'By definition; CCA security then follows.',
    },
    {
      id: 'l07-q3',
      type: 'mcq',
      difficulty: 1,
      prompt: 'In the CCA game, which ciphertext queries are forbidden?',
      options: ['all of them', 'ciphertexts previously returned by plaintext queries', 'ciphertexts longer than the challenge', 'none'],
      answer: 1,
      explanation: 'Otherwise the adversary would trivially decrypt the challenge.',
    },
    {
      id: 'l07-q4',
      type: 'mcq',
      difficulty: 2,
      prompt: 'Which statement about Encrypt-and-MAC with a deterministic MAC (e.g. HMAC) is correct?',
      options: ['It is AE-secure', 'It is not CPA-secure: equal plaintexts produce equal tags', 'It is CCA-secure but not CPA-secure', 'It is used by TLS 1.3'],
      answer: 1,
      explanation: 'The tag of the plaintext is visible and deterministic.',
    },
    {
      id: 'l07-q5',
      type: 'mcq',
      difficulty: 2,
      prompt: 'Which practical AE mode is MAC-then-Encrypt in structure?',
      options: ['GCM', 'EAX', 'CCM', 'ChaCha20-Poly1305'],
      answer: 2,
      explanation: 'CCM computes CBC-MAC on the plaintext and then CTR-encrypts. GCM, EAX and ChaCha20-Poly1305 encrypt first.',
    },
    {
      id: 'l07-q6',
      type: 'mcq',
      difficulty: 2,
      prompt: md`For an (ε, δ)-AE secure cipher and a CCA adversary making $q$ queries, the CCA advantage is at most`,
      options: [md`$\varepsilon$`, md`$\varepsilon+2q\delta$`, md`$q\varepsilon+\delta$`, md`$2\varepsilon$`],
      answer: 1,
      explanation: 'The AE ⇒ CCA theorem.',
    },
    {
      id: 'l07-q7',
      type: 'mcq',
      difficulty: 3,
      prompt: md`A system uses EtM but the MAC covers only the encrypted payload $e$ and **not** the random IV that is sent with it. With CTR mode, what breaks?`,
      options: ['nothing, the payload is authenticated', md`Ciphertext integrity: the attacker changes the IV, which changes the keystream, and the tag still verifies`, 'only CPA security', 'decryption correctness'],
      answer: 1,
      explanation: md`$(IV',e,t)$ is a new ciphertext with a valid tag that decrypts to garbage (and for CBC, changing the IV flips chosen bits of the first block). The MAC must cover everything the decryptor uses.`,
    },
    {
      id: 'l07-q8',
      type: 'mcq',
      difficulty: 3,
      prompt: md`An EtM system uses the **same key** for the CTR encryption and for a CBC-MAC with the same block cipher. Why is this a bad idea?`,
      options: ['It is not a problem — EtM is always secure', 'The theorem assumes independent keys; with shared keys outputs of one component can be used inside the other, and security is no longer guaranteed', 'Because CBC-MAC needs two keys anyway', 'Because CTR needs no key'],
      answer: 1,
      explanation: 'The EtM proof uses the independence of k_E and k_M; key reuse across primitives creates interactions (e.g. CTR keystream blocks equal CBC-MAC block-cipher outputs on chosen inputs).',
    },
    {
      id: 'l07-q9',
      type: 'mcq',
      difficulty: 3,
      prompt: 'Why can MAC-then-Encrypt with CBC and padding leak information in a chosen-ciphertext setting?',
      options: ['The MAC key is encrypted', 'The receiver must decrypt and remove padding before checking the tag, and reacts differently to bad padding and bad tags (a padding oracle)', 'CBC is deterministic', 'The tag is too short'],
      answer: 1,
      explanation: 'Distinguishable failures let an attacker decrypt byte by byte (POODLE, Lucky 13).',
    },
    {
      id: 'l07-q10',
      type: 'mcq',
      difficulty: 2,
      prompt: 'In AEAD, the associated data is',
      options: ['encrypted but not authenticated', 'authenticated but not encrypted', 'neither', 'both encrypted and authenticated'],
      answer: 1,
      explanation: 'E.g. headers that must stay readable but must not be modified.',
    },
  ],
};
