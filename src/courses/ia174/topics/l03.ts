import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l03: Topic = {
  id: 'l03',
  lecture: 3,
  tag: 'L03',
  examGroup: 'S3',
  title: 'Block ciphers: PRPs, DES and AES',
  summary: md`Block ciphers as pseudorandom permutations, why ECB is insecure, the PRP attack game, design by iterated rounds (confusion and diffusion), DES and 3-DES, the structure of AES and the Galois field GF(2⁸).`,
  sections: [
    {
      id: 'def',
      title: 'Block ciphers = pseudorandom permutations',
      kind: 'definition',
      importance: 'must',
      body: md`**Definition 1 (the "standard confusing" one).** A block cipher is a cipher with $\mathcal M=\mathcal C=:\mathcal X$, typically $\mathcal X=\{0,1\}^\ell$ with a *small* $\ell$ (hundreds of bits).

**Definition 2 (better).** A block cipher, or **pseudorandom permutation (PRP)**, over key space $\mathcal K$ and block space $\mathcal X$ is a pair $(E,D)$ with $E,D:\mathcal K\times\mathcal X\to\mathcal X$ such that for every $k$, $E(k,\cdot)$ is a **permutation** of $\mathcal X$ whose inverse is $D(k,\cdot)$.

**Do not think of a block cipher as a cipher.** It is a *primitive* from which real ciphers are built, just as a PRG is turned into a stream cipher:

| primitive | real cipher |
|---|---|
| PRG | stream cipher |
| block cipher (PRP) | block-cipher **mode of operation** |

A cipher must handle messages of many blocks, and it must be secure when used that way.`,
    },
    {
      id: 'ecb',
      title: 'Naive idea: ECB mode (insecure)',
      kind: 'concept',
      importance: 'must',
      body: md`**Electronic codebook (ECB):** pad $m$ to a multiple of $\ell$, split $m=m_1\|\cdots\|m_j$ and output $E(k,m_1)\|\cdots\|E(k,m_j)$; decrypt block by block.

**ECB is not semantically secure.** Adversary: $m_0=X\|X$ (two equal blocks), $m_1=X\|Y$ with $X\ne Y$. Output $0$ iff the two ciphertext blocks are equal. It wins with probability 1 — advantage $\tfrac12$. Equal plaintext blocks give equal ciphertext blocks, which is why the famous "ECB penguin" stays visible.

(It *is* semantically secure if messages never contain a repeated block — but that restriction is useless in practice. Zoom used AES-128 in ECB mode in 2020.)`,
      viz: [{ id: 'blockModes', props: { mode: 'ECB' }, caption: 'Watch the repeated blocks and the picture: ECB preserves patterns.' }],
    },
    {
      id: 'prp-game',
      title: 'Security of block ciphers: the PRP game',
      kind: 'definition',
      importance: 'must',
      body: md`Semantic security is not the right requirement: a block cipher is used to permute many blocks under the same key. A first attempt — "let the adversary query encryptions of $x_1,\dots,x_N$ first, then play the semantic game" — fails, because the adversary just queries $m_0$ and compares. The fix (forbid $m_0,m_1$ among the queries) leads to the standard definition: **a secure block cipher is indistinguishable from a truly random permutation**.

**PRP attack game** against $(E,D)$; $\Pi(\mathcal X)$ = set of all permutations of $\mathcal X$:
1. Challenger samples $i\in\{\mathit{rand},\mathit{fake}\}$. *rand*: $f\leftarrow\Pi(\mathcal X)$ uniformly. *fake*: $k\leftarrow\mathcal K$, $f=E(k,\cdot)$. Nothing is revealed.
2. Adversary chooses the number of rounds $N$. In each round it sends $x_j$ (**adaptively**, depending on earlier answers) and receives $y_j=f(x_j)$.
3. Adversary outputs $g\in\{\mathit{rand},\mathit{fake}\}$; wins iff $g=i$.

$\mathrm{ADV}_{\mathrm{PRP}}=|P(\text{win})-\tfrac12|$; ε-secure / secure as before.

**Example: "OTP" is a terrible PRP.** $E(k,x)=x\oplus k$. Query $x_1,x_2$ and say *fake* iff $y_1\oplus y_2=x_1\oplus x_2$. Fake: always true. Rand: true only w.p. $1/(|\mathcal X|-1)$. Advantage ≈ ½. Any **linear** relation between inputs and outputs is fatal in the same way.`,
      formulas: [
        {
          id: 'adv-prp',
          name: 'PRP advantage',
          tex: md`\mathrm{ADV}_{\mathrm{PRP}}(\mathcal E,A)=\Bigl|P\bigl(A\text{ wins the PRP game}\bigr)-\tfrac12\Bigr|`,
          intuition: 'How well A distinguishes E(k, ·) for a random key from a uniformly random permutation, using adaptive queries.',
        },
      ],
      viz: [{ id: 'attackGame', props: { preset: 'prp-otp', presets: ['prp-otp', 'cpa-det'] } }],
    },
    {
      id: 'design',
      title: 'Designing block ciphers: rounds, confusion, diffusion',
      kind: 'concept',
      importance: 'understand',
      body: md`- **Theory:** secure PRG → (tree construction) secure PRF → (Luby–Rackoff / Feistel) secure PRP. So provably secure block ciphers exist *if* certain problems are hard — but they are too slow.
- **Practice:** **iterated (round) ciphers**: a key schedule derives round keys $k_1,\dots,k_n$ from $k$, and a simple, invertible **round function** $R(k_i,\cdot)$ is applied $n$ times: $E(k,x)=R(k_n,R(k_{n-1},\dots R(k_1,x)))$.

Shannon's design principles:
- **Confusion:** the relation between plaintext, ciphertext and key should be as complex as possible — in particular **non-linear** (otherwise linear algebra breaks it).
- **Diffusion:** statistical structure of the plaintext is spread over the whole ciphertext: changing one input bit should change about half of the output bits (*avalanche*).`,
    },
    {
      id: 'des',
      title: 'DES and 3-DES',
      kind: 'concept',
      importance: 'context',
      body: md`- **DES** (IBM, 1975, for the US NBS – today NIST): a 16-round **Feistel network**, 56-bit key, 64-bit block. Parts of the design were secret; published later, it turned out to resist differential cryptanalysis, which became public only in the 1990s.
- Its fatal weakness is the **small key space**: brute-forced by special hardware in 1998 (≈ \$250k), much cheaper later.
- **3-DES:** $E_3(k_1k_2k_3,m)=E(k_3,D(k_2,E(k_1,m)))$ with a 168-bit key; costs about $2^{112}$ to break (meet-in-the-middle), respected but slow.
- In 1997 NIST opened the **AES competition**; finalists MARS, RC6, Rijndael, Serpent, Twofish; **Rijndael** (Daemen & Rijmen) won in 2000.`,
    },
    {
      id: 'aes',
      title: 'AES',
      kind: 'concept',
      importance: 'must',
      body: md`| version | key | block | rounds |
|---|---|---|---|
| AES-128 | 128 | **128** | 10 |
| AES-192 | 192 | **128** | 12 |
| AES-256 | 256 | **128** | 14 |

The number in the name is the **key size**; the block size is always 128 bits.

**Structure:** the 128-bit block is a $4\times4$ matrix of bytes (the *state*). A key schedule produces round keys. Each round applies three invertible operations and mixes in the key:
1. **SubBytes** — each byte goes through the S-box $S_{AES}$, a fixed **non-linear** permutation of bytes (computed as inversion in GF(2⁸) followed by an affine map). It has no fixed points and no "opposite fixed points" ($S(b)\ne b$, $S(b)\ne\lnot b$). **Main source of confusion** — without it AES would be linear and breakable by solving linear equations.
2. **ShiftRows** — row $r$ is rotated left by $r$ positions: just moving bytes around (linear).
3. **MixColumns** — each column is multiplied by a fixed invertible matrix over **GF(2⁸)**; linear, provides **diffusion** (every output byte depends on all four input bytes of the column).
4. **AddRoundKey** — XOR with the round key; the only key-dependent step.

The last round omits MixColumns. All steps are invertible given the round keys, which gives decryption. (Exact order and constants need not be memorised.)

**Security:** best key-recovery attacks are only marginally better than brute force (AES-128: $2^{126.1}$ instead of $2^{128}$). Practical attacks target **implementations** (side channels: timing, power, caches). Modern CPUs accelerate AES in hardware.`,
      viz: [{ id: 'aesRound' }],
    },
    {
      id: 'gf',
      title: 'Galois field GF(2⁸)',
      kind: 'concept',
      importance: 'understand',
      body: md`MixColumns needs a way to **add and multiply bytes** with the usual algebraic laws (a *field*).

- A byte $a_7a_6\dots a_0$ is identified with the polynomial $a_7x^7+\dots+a_1x+a_0$ with coefficients in $\mathbb Z_2$ (add = XOR, multiply = AND).
- **Addition** of polynomials over $\mathbb Z_2$ = bitwise **XOR** of bytes.
- **Multiplication:** multiply the polynomials and take the **remainder modulo an irreducible polynomial of degree 8**; AES uses $m(x)=x^8+x^4+x^3+x+1$ (0x11B). Plain polynomial multiplication would overflow a byte; the remainder brings it back to degree ≤ 7.
- Because $m$ is irreducible, every non-zero byte has a multiplicative inverse: bytes with ⊕ and • form the **Galois field GF(2⁸)**.
- Multiplying by $x$ ("by 2") is a left shift, plus XOR with 0x1B if the top bit fell out — so the MixColumns constants 2 and 3 cost only shifts and XORs. Division of polynomials over $\mathbb Z_2$: for $p,q$ there are unique $h,r$ with $p=qh+r$, $\deg r<\deg q$.`,
      formulas: [
        {
          id: 'gf-mul',
          name: 'Multiplication in GF(2⁸)',
          tex: md`a\bullet b=\bigl(a(x)\cdot b(x)\bigr)\bmod\bigl(x^8+x^4+x^3+x+1\bigr)`,
          symbols: [
            { sym: md`a(x),b(x)`, meaning: 'the bytes read as polynomials over ℤ₂' },
            { sym: md`x^8+x^4+x^3+x+1`, meaning: 'the irreducible AES modulus (0x11B)' },
          ],
          intuition: 'Polynomial multiplication with XOR instead of addition, then reduce back into 8 bits.',
          pitfalls: 'Addition is XOR, so in GF(2⁸) every element is its own additive inverse: a + a = 0.',
        },
      ],
      examples: [
        {
          title: 'Multiply 0x57 by 0x13',
          problem: md`Compute $\texttt{57}\bullet\texttt{13}$ in GF(2⁸).`,
          solution: md`$\texttt{13}=x^4+x+1$. Repeated xtime: $\texttt{57}\cdot x=\texttt{ae}$, $\cdot x^2=\texttt{47}$ (overflow: XOR 1B), $\cdot x^3=\texttt{8e}$, $\cdot x^4=\texttt{07}$. Sum the terms for bits 0, 1, 4: $\texttt{57}\oplus\texttt{ae}\oplus\texttt{07}=\texttt{fe}$.`,
        },
      ],
      viz: [{ id: 'gf256' }],
    },
  ],
  flashcards: [
    { id: 'l03-c1', front: 'Block cipher (PRP) definition', back: md`$(E,D)$ with $E,D:\mathcal K\times\mathcal X\to\mathcal X$ such that every $E(k,\cdot)$ is a permutation of $\mathcal X$ with inverse $D(k,\cdot)$.` },
    { id: 'l03-c2', front: 'Why is a block cipher not "a cipher"?', back: 'It only handles single blocks and is a building block; turning it into a secure cipher needs a mode of operation (like PRG → stream cipher).' },
    { id: 'l03-c3', front: 'ECB mode', back: md`$E_{ECB}(k,m_1\|\cdots\|m_j)=E(k,m_1)\|\cdots\|E(k,m_j)$. Insecure: equal plaintext blocks → equal ciphertext blocks.` },
    { id: 'l03-c4', front: 'Adversary against ECB (semantic game)', back: md`$m_0=X\|X$, $m_1=X\|Y$; guess 0 iff both ciphertext blocks are equal. Advantage ½.` },
    { id: 'l03-c5', front: 'PRP attack game', back: md`rand: $f$ random permutation; fake: $f=E(k,\cdot)$. Adversary adaptively queries $x_j$, gets $f(x_j)$, guesses rand/fake.` },
    { id: 'l03-c6', front: 'Why is E(k, x) = x ⊕ k an insecure PRP?', back: md`$E(x_1)\oplus E(x_2)=x_1\oplus x_2$ always; for a random permutation this holds rarely. Two queries give advantage ≈ ½.` },
    { id: 'l03-c7', front: 'Confusion vs diffusion', back: 'Confusion: complex, non-linear relation between key, plaintext and ciphertext. Diffusion: each input bit affects ≈ half of the output bits.' },
    { id: 'l03-c8', front: 'DES parameters and its main weakness', back: '16-round Feistel network, 64-bit block, 56-bit key — the small key space (brute-forced since 1998).' },
    { id: 'l03-c9', front: '3-DES', back: md`$E(k_3,D(k_2,E(k_1,m)))$, 168-bit key, ≈ $2^{112}$ security, slow.` },
    { id: 'l03-c10', front: 'AES versions: what do 128/192/256 refer to?', back: 'Key size. The block is 128 bits in all versions (10, 12, 14 rounds).' },
    { id: 'l03-c11', front: 'The AES round operations', back: 'SubBytes (non-linear S-box), ShiftRows (rotate rows), MixColumns (GF(2⁸) matrix, skipped in last round), AddRoundKey (XOR round key).' },
    { id: 'l03-c12', front: 'Which AES step is non-linear, and why is it needed?', back: 'SubBytes. Without a non-linear step the whole cipher would be linear (affine) over GF(2) and could be broken by solving linear equations.' },
    { id: 'l03-c13', front: 'Which AES step uses GF(2⁸) multiplication?', back: 'MixColumns (matrix with entries 1, 2, 3 over GF(2⁸)); the S-box is also built from GF(2⁸) inversion.' },
    { id: 'l03-c14', front: 'How is the key mixed into AES?', back: 'AddRoundKey: XOR with a round key derived by the key schedule (also before the first round).' },
    { id: 'l03-c15', front: 'GF(2⁸): addition and multiplication', back: 'Bytes = polynomials over ℤ₂. Addition = XOR. Multiplication = polynomial product mod x⁸ + x⁴ + x³ + x + 1.' },
    { id: 'l03-c16', front: 'Why must the GF(2⁸) modulus be irreducible?', back: 'So that every non-zero element has a multiplicative inverse, i.e. the structure is a field.' },
    { id: 'l03-c17', front: 'How do practical attacks on AES usually work?', back: 'Not on the mathematics (best: 2^126.1 for AES-128) but on implementations: side channels such as timing, power, cache behaviour.' },
  ],
  quiz: [
    {
      id: 'l03-q1',
      type: 'mcq',
      difficulty: 1,
      prompt: 'What is the block size of AES-256?',
      options: ['64 bits', '128 bits', '192 bits', '256 bits'],
      answer: 1,
      explanation: 'All AES versions use 128-bit blocks; 256 is the key size.',
    },
    {
      id: 'l03-q2',
      type: 'mcq',
      difficulty: 1,
      prompt: 'Which AES operation provides most of the confusion (non-linearity)?',
      options: ['ShiftRows', 'MixColumns', 'SubBytes', 'AddRoundKey'],
      answer: 2,
      explanation: 'The S-box is the only non-linear component.',
    },
    {
      id: 'l03-q3',
      type: 'mcq',
      difficulty: 1,
      prompt: md`In GF(2⁸), $\texttt{53}+\texttt{CA}=\ ?$`,
      options: ['0x11D', '0x99', '0x1D', '0x42'],
      answer: 1,
      explanation: md`Addition is XOR: $0101\,0011\oplus1100\,1010=1001\,1001=\texttt{99}$.`,
    },
    {
      id: 'l03-q4',
      type: 'mcq',
      difficulty: 2,
      prompt: md`$\texttt{80}\bullet\texttt{02}$ in the AES field equals`,
      options: ['0x100', '0x00', '0x1B', '0x01'],
      answer: 2,
      explanation: md`$x^7\cdot x=x^8\equiv x^4+x^3+x+1=\texttt{1B}\pmod{m(x)}$.`,
    },
    {
      id: 'l03-q5',
      type: 'mcq',
      difficulty: 2,
      prompt: 'Why does the naive "semantic security with block queries" definition fail for block ciphers?',
      options: ['Because block ciphers are deterministic, the adversary can query E(k, m₀) beforehand and compare', 'Because queries reveal the key', 'Because blocks are too short', 'Because the adversary cannot choose messages'],
      answer: 0,
      explanation: 'With m₀ among the queries the adversary always wins; the corrected version forbids it, and the standard PRP game captures the same idea.',
    },
    {
      id: 'l03-q6',
      type: 'mcq',
      difficulty: 1,
      prompt: 'ECB mode leaks',
      options: ['the key', 'which plaintext blocks are equal', 'nothing beyond the length', 'the last plaintext block'],
      answer: 1,
      explanation: 'Deterministic block-wise encryption maps equal blocks to equal blocks.',
    },
    {
      id: 'l03-q7',
      type: 'mcq',
      difficulty: 2,
      prompt: 'DES was broken in practice mainly because',
      options: ['its S-boxes contained a backdoor', 'its 56-bit key could be brute-forced', 'differential cryptanalysis recovers the key with few plaintexts', 'its 64-bit block leaks equal blocks'],
      answer: 1,
      explanation: 'Exhaustive key search on special hardware (1998); the design itself resisted differential cryptanalysis.',
    },
    {
      id: 'l03-q8',
      type: 'mcq',
      difficulty: 3,
      prompt: md`A PRP $E$ on $\{0,1\}^{128}$ satisfies $E(k,x\oplus y)=E(k,x)\oplus E(k,y)$ for all $k,x,y$. What is the most efficient distinguisher?`,
      options: [md`Query $0^{128}$; say *fake* iff the answer is $0^{128}$ (linearity forces $E(k,0)=0$)`, 'Brute-force the key', 'No efficient distinguisher exists', md`Query $1^{128}$ and check the first bit`],
      answer: 0,
      explanation: md`Linearity gives $E(k,0)=E(k,0\oplus0)=E(k,0)\oplus E(k,0)=0$. One query: fake → always $0$; rand → $0$ w.p. $2^{-128}$. Advantage ≈ ½.`,
    },
    {
      id: 'l03-q9',
      type: 'mcq',
      difficulty: 3,
      prompt: md`$E(k,x)=x\boxplus_{128}k$. Which pair of queries distinguishes it from a random permutation?`,
      options: [md`$x_1=0$, $x_2=1$: say *fake* iff $y_2-y_1\equiv1\pmod{2^{128}}$`, md`$x_1=x_2$`, md`one query $x=0$, say *fake* iff $y=0$`, 'none: addition is non-linear over GF(2)'],
      answer: 0,
      explanation: md`For this cipher $y_2-y_1=(1+k)-(0+k)=1$ always; for a random permutation w.p. about $2^{-128}$. Note option C fails: $E(k,0)=k$ is random.`,
    },
    {
      id: 'l03-q10',
      type: 'mcq',
      difficulty: 3,
      prompt: 'Suppose the AES S-box were replaced by an affine map over GF(2). What would happen?',
      options: ['Nothing — security comes from the number of rounds', 'Every ciphertext bit would be an affine function of plaintext and key bits, so the key could be found by solving linear equations from a few plaintext/ciphertext pairs', 'Only decryption would become impossible', 'Diffusion would disappear but confusion would remain'],
      answer: 1,
      explanation: 'ShiftRows, MixColumns and AddRoundKey are linear/affine; with a linear S-box the whole cipher is affine and falls to Gaussian elimination.',
    },
  ],
};
