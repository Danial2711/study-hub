import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l08: Topic = {
  id: 'l08',
  lecture: 9,
  tag: 'L08',
  examGroup: 'PK',
  title: 'Public-key encryption and RSA',
  summary: md`Public-key encryption systems, trapdoor functions, textbook RSA and its correctness, why factoring is the trapdoor, choosing N, attacks on textbook RSA (small messages, CRT broadcast, shared primes), PKCS#1 v1.5 and Bleichenbacher, semantic/CPA/CCA security for public-key systems, OAEP and hybrid encryption.`,
  sections: [
    {
      id: 'pke',
      title: 'Public-key encryption',
      kind: 'definition',
      importance: 'must',
      body: md`Problem: Alice and Bob have **no shared key**. (History: Merkle, Diffie–Hellman 1976, RSA 1977; earlier secretly at GCHQ.)

**Definition.** A public-key encryption system over $(\mathcal K_p,\mathcal K_s,\mathcal M,\mathcal C)$ is $\mathcal E=(\mathrm{Gen},E,D)$:
- $\mathrm{Gen}$: input-less randomized algorithm producing a key pair $(k_p,k_s)$; possible outputs are the **valid keys** $V(\mathcal E)$;
- $E:\mathcal K_p\times\mathcal M\to\mathcal C$ (anyone can encrypt with the public key);
- $D:\mathcal K_s\times\mathcal C\to\mathcal M$ with $D(k_s,E(k_p,m))=m$ for all $m$ and all valid $(k_p,k_s)$.

At its heart is a **trapdoor function** $f:\mathcal K_p\times\mathcal M\to\mathcal C$:
1. efficient algorithms $\mathrm{Fwd}$ (compute $f(k_p,m)$) and $\mathrm{Inv}$ (with $k_s$: $\mathrm{Inv}(k_s,f(k_p,m))=m$);
2. **without** $k_s$ it is intractable to find $m$ with $f(k_p,m)=c$.

Candidates in modular arithmetic: $m\mapsto m^{k_p}\bmod N$ (RSA) and $m\mapsto k_p^m\bmod N$ (discrete log).`,
    },
    {
      id: 'rsa',
      title: 'Textbook RSA and why it is correct',
      kind: 'theorem',
      importance: 'must',
      body: md`**Idea for a prime modulus.** In $\mathbb Z_p^\times$ (size $p-1$) exponents live modulo $p-1$. If $ed\equiv1\pmod{p-1}$ then $(m^e)^d=m^{1+k(p-1)}=m$. But knowing $p$ and $e$, anyone computes $d=e^{-1}\bmod(p-1)$ — so a prime modulus is insecure.

**Composite modulus:** replace $p-1$ by $\varphi(N)$. We need $e\cdot d\equiv1\pmod{\varphi(N)}$; computing $d$ requires $\varphi(N)$, and the straightforward way to get $\varphi(N)$ is to **factor $N$**, believed hard ⇒ trapdoor.

**RSA key generation:**
1. random primes $p,q$ of about the same bit length (with extra conditions), $N=pq$;
2. $e$ coprime to $\varphi(N)=(p-1)(q-1)$, $d=e^{-1}\bmod\varphi(N)$ (extended Euclid);
3. $k_p=(N,e)$, $k_s=(N,d)$.

**Trapdoor:** $\mathrm{Fwd}((N,e),m)=m^e\bmod N$, $\mathrm{Inv}(d,c)=c^d\bmod N$ (square-and-multiply).

**Correctness.** $ed=1+k\varphi(N)$, and by Euler $m^{\varphi(N)}=1$ in $\mathbb Z_N^\times$, so
$$(m^e)^d=m^{1+k\varphi(N)}=m\cdot\bigl(m^{\varphi(N)}\bigr)^k=m.$$
(It holds for all $m\in\mathbb Z_N$ by the CRT, but the course works in $\mathbb Z_N^\times$.)

**Textbook ("vanilla") RSA must never be used directly for encryption** (see attacks below).`,
      formulas: [
        {
          id: 'rsa-keys',
          name: 'RSA key generation',
          tex: md`N=pq,\quad\varphi(N)=(p-1)(q-1),\quad \gcd(e,\varphi(N))=1,\quad d=e^{-1}\bmod\varphi(N)`,
          intuition: 'e and d are inverse exponents modulo the group order φ(N), which only the owner of p, q knows.',
        },
        {
          id: 'rsa-enc',
          name: 'RSA trapdoor and correctness',
          tex: md`c=m^e\bmod N,\qquad c^d=m^{ed}=m^{1+k\varphi(N)}=m\bigl(m^{\varphi(N)}\bigr)^k\equiv m\pmod N`,
          symbols: [
            { sym: '(N, e)', meaning: 'public key' },
            { sym: 'd', meaning: 'secret exponent' },
          ],
          intuition: 'Exponents can be reduced modulo the group order φ(N) (Euler/Lagrange).',
        },
      ],
      viz: [{ id: 'rsaLab', props: { tab: 'basic' } }],
    },
    {
      id: 'trapdoor',
      title: 'Is RSA really a trapdoor function?',
      kind: 'concept',
      importance: 'must',
      body: md`We do not know. Factoring is believed intractable on classical computers but is not known to be NP-hard. Breaking RSA means computing $e$-th roots modulo $N$, which might in principle be possible without factoring. Known facts:
- computing $\varphi(N)$ fast ⇒ factoring $N$ fast (from $N$ and $\varphi(N)=N-p-q+1$ one gets $p+q$ and $pq$, hence $p,q$);
- computing $d$ fast ⇒ factoring $N$ fast.
- **Open:** whether recovering $m$ from $m^e\bmod N$ is as hard as factoring (partial results suggest maybe not).

**Choosing N:**
- large: 2048, 3072, 4096 bits;
- $p,q$ of similar size (some algorithms — Pollard ρ, Lenstra's ECM — are exponential in the size of the **smallest** factor);
- but $|p-q|$ not too small (else search near $\sqrt N$ — Fermat factoring);
- avoid $p\pm1$ **smooth** (Pollard $p-1$, Williams $p+1$).

All of this holds with high probability if $p,q$ are sampled randomly (sample a number, test primality with Miller–Rabin, repeat).

**Bad randomness:** if a key generator produces $N_1=pq_1$ and $N_2=pq_2$ sharing a prime, $\gcd(N_1,N_2)=p$ factors both — in 2012 about 0.3 % of RSA keys on the Internet fell this way.

**Exponents:** small $e$ (3 or $2^{16}+1$) makes encryption fast; $d$ must **not** be small (Wiener: $d<\frac13N^{1/4}$ is recoverable from $(N,e)$).`,
      viz: [{ id: 'rsaLab', props: { tab: 'attacks' } }],
    },
    {
      id: 'attacks',
      title: 'Why textbook RSA is insecure',
      kind: 'concept',
      importance: 'must',
      body: md`Textbook RSA is **deterministic** ⇒ not semantically secure for public-key systems (anyone can encrypt both candidates and compare), let alone CPA/CCA secure.

- **Small message:** if $m^e<N$, no reduction happens and $m=\sqrt[e]{c}$ over the integers.
- **CRT broadcast attack (Håstad):** $e=3$, the same $m$ sent to three recipients with pairwise coprime moduli $N_1,N_2,N_3$: $c_i=m^3\bmod N_i$. CRT gives $x<N_1N_2N_3$ with $x\equiv c_i\pmod{N_i}$. Since $m<N_i$, $m^3<N_1N_2N_3$ and $m^3$ satisfies the same congruences, so by uniqueness $x=m^3$ and $m=\sqrt[3]{x}$ over the integers. (Generalised by Håstad and Coppersmith.)
- **Malleability:** $E(m_1)E(m_2)=E(m_1m_2)$, so $c\cdot x^e$ decrypts to $x\cdot m$.`,
      formulas: [
        {
          id: 'hastad',
          name: 'CRT broadcast attack (e = 3)',
          tex: md`x\equiv c_i\pmod{N_i}\ (i=1,2,3),\ \ x<N_1N_2N_3\ \Rightarrow\ x=m^3,\ \ m=\sqrt[3]{x}`,
          intuition: 'Three ciphertexts pin down m³ modulo a number larger than m³ itself, so the modular cube root becomes an ordinary one.',
        },
      ],
    },
    {
      id: 'padding',
      title: 'PKCS#1 v1.5, Bleichenbacher, OAEP',
      kind: 'concept',
      importance: 'understand',
      body: md`**Salt, then encrypt:** pad the message with randomness before applying RSA.

**PKCS#1 v1.5:** $\bar m=\texttt{00}\,\|\,\texttt{02}\,\|\,r\,\|\,\texttt{00}\,\|\,m$ with $r$ random **non-zero** bytes (at least 8, so $m$ is at most $t-11$ bytes for a $t$-byte modulus); $c=\bar m^e\bmod N$. Decryption checks the format (second byte 02) and strips the padding.

**Bleichenbacher's attack (1998):** if the server reveals whether a decrypted ciphertext is well formed (a *parse error*), the attacker multiplies an intercepted $c$ by $x^e$ (decrypts to $x\cdot\bar m$) and learns whether $x\cdot\bar m$ starts with 00 02. Many such queries (≈ millions) narrow down $\bar m$ — a practical **chosen-ciphertext** attack on SSL's RSA key exchange. Be aware it exists; details not required.

Defences: TLS 1.2 demands no alert on bad padding (continue with a random pre-master secret); TLS 1.3 dropped RSA key transport. **OAEP** (1994) pads with two hash functions in a Feistel-like way and has a CCA-security theorem (under stronger assumptions than RSA being a trapdoor).`,
    },
    {
      id: 'pk-security',
      title: 'Security notions for public-key encryption',
      kind: 'definition',
      importance: 'must',
      body: md`**Semantic-security game (public key):** the challenger samples $i\in\{0,1\}$ and $(k_p,k_s)\leftarrow\mathrm{Gen}$ and sends $k_p$ to the adversary; the adversary sends $m_0,m_1$ of equal length; gets $c=E(k_p,m_i)$; outputs a guess. $\mathrm{ADV}_{\mathrm{Sem}}=|P(\text{win})-\tfrac12|$.

**CPA and CCA** are defined as in the symmetric case (multi-round; CCA adds decryption queries answered with $D(k_s,\cdot)$), but the adversary knows $k_p$.

Properties that **do not hold for symmetric ciphers:**
- **Theorem.** ε-semantically secure ⇒ $(\varepsilon\cdot N)$-CPA secure against adversaries with ≤ $N$ queries. (The adversary can encrypt anything itself — the public key *is* an encryption oracle — so the extra queries only add a hybrid factor.) **Remember: for public-key systems semantic security implies CPA security.**
- **Theorem.** ε-CCA secure against adversaries with one plaintext query ⇒ $\varepsilon N_p$-CCA secure against $N_p$ plaintext queries.

Note that public-key encryption must be **randomized** to be semantically secure at all.`,
      formulas: [
        {
          id: 'pk-sem-cpa',
          name: 'PK: semantic security ⇒ CPA security',
          tex: md`\mathrm{ADV}_{\mathrm{CPA}}(\mathcal E,A)\le N\cdot\varepsilon\quad\text{if }\mathcal E\text{ is }\varepsilon\text{-semantically secure and }A\text{ makes}\le N\text{ queries}`,
          intuition: 'With the public key, anyone can already encrypt; a hybrid argument over the N challenge encryptions loses a factor N.',
        },
      ],
    },
    {
      id: 'hybrid',
      title: 'Hybrid encryption and ISO-RSA',
      kind: 'concept',
      importance: 'must',
      body: md`Public-key operations are slow and messages long, so in practice: encrypt the message with a fast **symmetric AE cipher** under a fresh key, and transport that key with public-key crypto (**hybrid encryption**).

**ISO-RSA** (CCA-secure with a security theorem, works for any trapdoor function), with an AE cipher $(E_S,D_S)$ and a hash $h$ into its key space:
- $E((N,e),m)$: sample $x\leftarrow\mathbb Z_N^\times$, $y=x^e\bmod N$, $k=h(x)$, output $(y,\ E_S(k,m))$;
- $D(d,(y,c))$: $x=y^d\bmod N$, $k=h(x)$, $m=D_S(k,c)$, reject if $m=\bot$.

RSA is applied only to a uniformly random $x$ — none of the structured-message attacks apply.`,
      formulas: [
        {
          id: 'iso-rsa',
          name: 'ISO-RSA (hybrid encryption)',
          tex: md`E((N,e),m)=\bigl(x^e\bmod N,\ E_S(h(x),m)\bigr),\qquad x\leftarrow\mathbb Z_N^\times`,
          intuition: 'RSA transports a random value; its hash keys a symmetric AE cipher that carries the message.',
        },
      ],
    },
  ],
  flashcards: [
    { id: 'l08-c1', front: 'Public-key encryption system', back: md`$(\mathrm{Gen},E,D)$: Gen outputs $(k_p,k_s)$; $E(k_p,\cdot)$; $D(k_s,\cdot)$ with $D(k_s,E(k_p,m))=m$ for valid key pairs.` },
    { id: 'l08-c2', front: 'Trapdoor function', back: md`$f(k_p,\cdot)$ efficiently computable, invertible with $k_s$, but hard to invert without $k_s$.` },
    { id: 'l08-c3', front: 'RSA key generation', back: md`$N=pq$, $e$ coprime to $(p-1)(q-1)$, $d=e^{-1}\bmod\varphi(N)$; $k_p=(N,e)$, $k_s=d$.` },
    { id: 'l08-c4', front: 'RSA correctness proof', back: md`$ed=1+k\varphi(N)$; $(m^e)^d=m\cdot(m^{\varphi(N)})^k=m$ by Euler.` },
    { id: 'l08-c5', front: 'Why not RSA with a prime modulus?', back: 'φ(p) = p − 1 is public, so anyone computes d = e⁻¹ mod (p − 1).' },
    { id: 'l08-c6', front: 'Knowing φ(N) or d — what follows?', back: 'Either one lets you factor N efficiently.' },
    { id: 'l08-c7', front: 'Open question about RSA', back: 'Whether computing e-th roots mod N (decrypting) is as hard as factoring N.' },
    { id: 'l08-c8', front: 'Requirements on p and q', back: 'Large, random, similar bit length, |p − q| not tiny, p ± 1 not smooth; never shared between keys.' },
    { id: 'l08-c9', front: 'Shared-prime attack', back: md`$\gcd(N_1,N_2)=p$ factors both moduli instantly.` },
    { id: 'l08-c10', front: 'CRT (Håstad) broadcast attack', back: md`Same $m$, $e=3$, three moduli: CRT gives $m^3$ exactly (since $m^3<N_1N_2N_3$); take the integer cube root.` },
    { id: 'l08-c11', front: 'Why is textbook RSA not semantically secure?', back: 'It is deterministic: encrypt m₀ and m₁ with the public key and compare with the challenge.' },
    { id: 'l08-c12', front: 'PKCS#1 v1.5 encryption format', back: '00 ‖ 02 ‖ random non-zero bytes ‖ 00 ‖ m, then RSA.' },
    { id: 'l08-c13', front: "Bleichenbacher's attack (idea)", back: 'Chosen-ciphertext attack using a padding oracle: submit c·xᵉ and learn whether x·m̄ is well-formed PKCS#1; millions of queries reveal m.' },
    { id: 'l08-c14', front: 'PK: semantic security vs CPA security', back: 'For public-key systems ε-semantic security implies (N·ε)-CPA security for N queries.' },
    { id: 'l08-c15', front: 'Hybrid encryption', back: 'Encrypt the message with a symmetric (AE) cipher under a fresh key; send the key with public-key encryption.' },
    { id: 'l08-c16', front: 'ISO-RSA', back: md`$(x^e\bmod N,\ E_S(h(x),m))$ for random $x$; CCA-secure with an AE cipher.` },
    { id: 'l08-c17', front: 'Small e vs small d', back: 'Small e (3, 65537) is fine with proper padding; small d is insecure (Wiener’s attack).' },
  ],
  quiz: [
    {
      id: 'l08-q1',
      type: 'mcq',
      difficulty: 1,
      prompt: 'RSA with p = 5, q = 11, e = 3. What is d?',
      options: ['7', '27', '13', '3'],
      answer: 1,
      explanation: md`$\varphi=4\cdot10=40$; $3\cdot27=81=2\cdot40+1$, so $d=27$.`,
    },
    {
      id: 'l08-q2',
      type: 'mcq',
      difficulty: 1,
      prompt: 'Which statement about textbook RSA encryption is correct?',
      options: ['It is CPA-secure', 'It is deterministic and therefore not semantically secure', 'It is CCA-secure', 'It is perfectly secure'],
      answer: 1,
      explanation: 'Anyone can re-encrypt candidate messages with the public key.',
    },
    {
      id: 'l08-q3',
      type: 'mcq',
      difficulty: 1,
      prompt: 'Two RSA moduli N₁ and N₂ were generated with a faulty RNG and share a prime. How are they factored?',
      options: ['Pollard ρ', 'gcd(N₁, N₂)', 'Wiener’s attack', 'It is not possible'],
      answer: 1,
      explanation: 'Euclid’s algorithm finds the shared prime instantly.',
    },
    {
      id: 'l08-q4',
      type: 'mcq',
      difficulty: 2,
      prompt: md`Why does RSA decryption work, i.e. why is $(m^e)^d\equiv m$?`,
      options: [md`Because $ed\equiv1\pmod N$`, md`Because $ed\equiv1\pmod{\varphi(N)}$ and $m^{\varphi(N)}\equiv1$ by Euler's theorem`, md`Because $e$ and $d$ are prime`, md`Because $N$ is the product of two primes`],
      answer: 1,
      explanation: 'Exponents are reduced modulo the group order φ(N).',
    },
    {
      id: 'l08-q5',
      type: 'mcq',
      difficulty: 2,
      prompt: 'For public-key encryption, which implication holds (but not for symmetric ciphers)?',
      options: ['semantic security ⇒ CPA security', 'CPA security ⇒ CCA security', 'one-wayness ⇒ semantic security', 'semantic security ⇒ CCA security'],
      answer: 0,
      explanation: 'The public key lets the adversary encrypt by itself, so extra encryptions add only a factor N.',
    },
    {
      id: 'l08-q6',
      type: 'mcq',
      difficulty: 2,
      prompt: "Bleichenbacher's attack against RSA with PKCS#1 v1.5 is a",
      options: ['chosen-plaintext attack', 'chosen-ciphertext attack exploiting padding-error messages', 'factoring algorithm', 'side-channel attack on key generation'],
      answer: 1,
      explanation: 'It needs a padding oracle — the server’s reaction to malformed decryptions.',
    },
    {
      id: 'l08-q7',
      type: 'mcq',
      difficulty: 3,
      prompt: md`Knowing $N=pq=3233$ and $\varphi(N)=3120$, what are $p$ and $q$?`,
      options: ['53 and 61', '41 and 79', '47 and 69', '31 and 103'],
      answer: 0,
      explanation: md`$p+q=N-\varphi(N)+1=114$, $pq=3233$: roots of $x^2-114x+3233$, i.e. $57\pm4$ → 53 and 61.`,
    },
    {
      id: 'l08-q8',
      type: 'mcq',
      difficulty: 3,
      prompt: md`Textbook RSA with $(N,e)$. An attacker who can ask for decryptions of anything except a target ciphertext $c$ wants $m=c^d$. What should it ask?`,
      options: [md`$D(c+N)$`, md`$D(c\cdot2^e\bmod N)$, then divide the answer by 2 mod $N$`, md`$D(c^2)$, then take the square root`, 'it cannot recover m'],
      answer: 1,
      explanation: md`$c\cdot2^e$ decrypts to $2m\bmod N$ (multiplicativity); multiply by $2^{-1}$. ($c+N\equiv c$ is the same ciphertext.)`,
    },
    {
      id: 'l08-q9',
      type: 'mcq',
      difficulty: 3,
      prompt: md`A scheme encrypts a 128-bit AES key $K$ with RSA as $c=K^3\bmod N$ for a 2048-bit $N$ (no padding). How does an eavesdropper get $K$?`,
      options: [md`$K^3<2^{384}<N$, so $c=K^3$ over the integers and $K=\sqrt[3]{c}$`, 'by factoring N', 'by the shared-prime attack', 'it cannot'],
      answer: 0,
      explanation: 'The small-message attack: no modular reduction occurred.',
    },
    {
      id: 'l08-q10',
      type: 'mcq',
      difficulty: 2,
      prompt: 'Why do p and q need to have roughly the same size?',
      options: ['Otherwise e has no inverse', 'Some factoring algorithms run in time exponential only in the size of the smallest prime factor', 'Otherwise N is not square-free', 'To make decryption faster'],
      answer: 1,
      explanation: 'E.g. Pollard ρ or Lenstra’s ECM find small factors quickly.',
    },
  ],
};
