/** Original exam-style problems for IA174: groups (G), RSA (PK), DL/ECC (DL), signatures (DS), zero knowledge (ZK). */
import type { Exercise } from '../../../platform/types';

const md = String.raw;

const R_DESCRIBE = ['Correct definitions / setting', 'Precise description of the algorithm or protocol', 'Key properties or theorem stated correctly', 'Worked computation or intuition', 'Clear, structured answer'];
const R_FLAW = ['Identifies the flaw', 'Describes the concrete attack step by step', 'Correct computation / success probability', 'Explains why it works', 'Fix or countermeasure'];
const R_PROOF = ['Goal and proof strategy stated', 'Key construction (reduction / simulator / algebra)', 'Correctness of each step argued', 'Probability / efficiency analysis where needed', 'Clear conclusion'];

export const grp: Exercise[] = [
  {
    id: 'G.1',
    title: 'Groups, orders and exponent reduction',
    tutorial: 8,
    examGroup: 'G',
    topicId: 'groups',
    category: 'describe',
    ref: 'cf. Groups lecture notes',
    tier: 'core',
    prompt: md`Define a group and an abelian group, and give $\mathbb Z_n^\times$ with its size. Define the order of an element, state Lagrange's theorem and its consequence for exponents. Using these, compute $7^{2026}\bmod 15$ and find all elements of order 2 in $\mathbb Z_{15}^\times$.`,
    solution: md`**Group** $(M,\odot)$: closed, associative, neutral element, inverses; **abelian** if commutative. $\mathbb Z_n^\times=\{i<n\mid\gcd(i,n)=1\}$ with multiplication mod $n$, $|\mathbb Z_n^\times|=\varphi(n)$.

**Order** of $g$: least $k\ge1$ with $g^k=1$, equal to $|\langle g\rangle|$. **Lagrange:** subgroup sizes divide $|G|$, hence $g^{|G|}=1$ and $g^a=g^{a\bmod|G|}$ (and even mod $\mathrm{ord}(g)$).

$\varphi(15)=8$. Order of 7: $7^2=49\equiv4$, $7^4\equiv16\equiv1$ → order 4. $2026\bmod4=2$, so $7^{2026}\equiv7^2\equiv4\pmod{15}$.

$\mathbb Z_{15}^\times=\{1,2,4,7,8,11,13,14\}$. Squares: $4^2=16\equiv1$, $11^2=121\equiv1$, $14^2=196\equiv1$; others: $2^2=4$, $7^2=4$, $8^2=4$, $13^2=4$. Elements of order 2: **4, 11, 14**.`,
    rubric: R_DESCRIBE,
  },
  {
    id: 'G.2',
    title: 'Two small group-theory proofs',
    tutorial: 8,
    examGroup: 'G',
    topicId: 'groups',
    category: 'proof',
    ref: 'cf. Worksheet 7',
    tier: 'core',
    prompt: md`Let $G$ be a group (multiplicative notation).
a. Prove $(xy)^{-1}=y^{-1}x^{-1}$.
b. Prove that if $x^2=1$ for every $x\in G$, then $G$ is abelian.
c. Rewrite the identity from (a) in additive notation.`,
    solution: md`a. $(xy)(y^{-1}x^{-1})=x(yy^{-1})x^{-1}=x\,1\,x^{-1}=1$ by associativity, and similarly $(y^{-1}x^{-1})(xy)=1$. Inverses are unique, so $(xy)^{-1}=y^{-1}x^{-1}$.

b. $x^2=1$ means $x=x^{-1}$ for all $x$. Then $xy=(xy)^{-1}=y^{-1}x^{-1}=yx$ using (a).

c. $-(x+y)=(-y)+(-x)$ (which in an abelian group is $-x-y$).`,
    rubric: R_PROOF,
  },
  {
    id: 'G.3',
    title: 'Extended Euclid and CRT by hand',
    tutorial: 8,
    examGroup: 'G',
    topicId: 'groups',
    category: 'describe',
    ref: 'cf. Groups lecture notes / Lecture 08',
    tier: 'core',
    prompt: md`a. Describe the extended Euclidean algorithm and use it to compute $7^{-1}\bmod160$.
b. State the Chinese remainder theorem and solve $x\equiv3\pmod5$, $x\equiv4\pmod7$, $x\equiv1\pmod9$.`,
    solution: md`a. Euclid on $(160,7)$ while tracking $r_i=s_i\cdot160+t_i\cdot7$:

| q | r | s | t |
|---|---|---|---|
| | 160 | 1 | 0 |
| | 7 | 0 | 1 |
| 22 | 6 | 1 | −22 |
| 1 | 1 | −1 | 23 |

$1=-1\cdot160+23\cdot7$, so $7^{-1}\equiv23\pmod{160}$ (check $161=160+1$).

b. **CRT:** for pairwise coprime $n_i$ there is a unique $x\bmod N=\prod n_i$; $x=\sum a_ib_i(b_i^{-1}\bmod n_i)$ with $b_i=N/n_i$. Here $N=315$, $b=(63,45,35)$. $63\equiv3\pmod5$, inverse 2; $45\equiv3\pmod7$, inverse 5; $35\equiv8\pmod9$, inverse 8. $x=3\cdot63\cdot2+4\cdot45\cdot5+1\cdot35\cdot8=378+900+280=1558\equiv1558-4\cdot315=298$. Check: $298=59\cdot5+3=42\cdot7+4=33\cdot9+1$.`,
    rubric: ['Algorithm described', 'Correct table and inverse 23', 'CRT statement', 'Correct construction', 'Correct answer 298 with check'],
  },
  {
    id: 'G.4',
    title: 'Orders divide',
    tutorial: 8,
    examGroup: 'G',
    topicId: 'groups',
    category: 'proof',
    ref: 'cf. Worksheet 8, assignment 1',
    tier: 'extra',
    prompt: md`Let $g$ have order $k$ in a group $G$.
a. Prove that $g^m=1$ if and only if $k\mid m$.
b. Prove that $\mathrm{ord}(g^j)=k/\gcd(j,k)$.
c. Deduce: in a cyclic group of order $m$ with generator $b$, $b^j$ is a generator iff $\gcd(j,m)=1$.`,
    solution: md`a. If $m=qk$ then $g^m=(g^k)^q=1$. Conversely write $m=qk+r$, $0\le r<k$: $1=g^m=(g^k)^qg^r=g^r$; minimality of $k$ forces $r=0$.

b. Let $d=\gcd(j,k)$. $(g^j)^t=1\iff k\mid jt\iff\frac kd\mid\frac jd t\iff\frac kd\mid t$ (as $\frac jd,\frac kd$ are coprime). The least such $t>0$ is $k/d$.

c. $b$ has order $m$; $b^j$ has order $m/\gcd(j,m)$, which equals $m=|G|$ iff $\gcd(j,m)=1$. (Hence there are $\varphi(m)$ generators.)`,
    rubric: R_PROOF,
  },
];

export const rsa: Exercise[] = [
  {
    id: 'PK.1',
    title: 'Textbook RSA with small numbers',
    tutorial: 9,
    examGroup: 'PK',
    topicId: 'l08',
    category: 'describe',
    ref: 'cf. Lecture 08',
    tier: 'core',
    prompt: md`Describe RSA key generation, encryption and decryption and prove correctness. Then for $p=11$, $q=17$, $e=7$ compute $d$, encrypt $m=88$ and verify by decrypting. Why must textbook RSA not be used directly for encryption?`,
    solution: md`**Keygen:** random primes $p,q$, $N=pq$, $\varphi(N)=(p-1)(q-1)$, $e$ coprime to $\varphi(N)$, $d=e^{-1}\bmod\varphi(N)$; public $(N,e)$, secret $d$. **Enc:** $c=m^e\bmod N$. **Dec:** $m=c^d\bmod N$.

**Correctness:** $ed=1+k\varphi(N)$; in $\mathbb Z_N^\times$, $m^{\varphi(N)}=1$ (Euler/Lagrange), so $c^d=m^{ed}=m\,(m^{\varphi(N)})^k=m$.

**Numbers:** $N=187$, $\varphi=160$, $d=7^{-1}\bmod160=23$ ($7\cdot23=161$). $c=88^7\bmod187=11$ (square-and-multiply: $88^2\equiv77$, $88^4\equiv77^2\equiv132$, $88^7=88^4\cdot88^2\cdot88\equiv132\cdot77\cdot88\equiv11$). Decrypt: $11^{23}\bmod187=88$ ✓.

**Not directly:** deterministic (not semantically secure — anyone can encrypt guesses), malleable ($c\cdot x^e$ decrypts to $xm$), small messages and broadcast leak $m$. Use randomized padding (PKCS#1 v1.5 carefully, OAEP) or hybrid encryption (ISO-RSA).`,
    rubric: R_DESCRIBE,
  },
  {
    id: 'PK.2',
    title: 'Broadcasting a session key with e = 3',
    tutorial: 9,
    examGroup: 'PK',
    topicId: 'l08',
    category: 'flaw',
    ref: 'cf. Lecture 08 (CRT attack)',
    tier: 'core',
    prompt: md`A server sends the same 256-bit session key $K$ to three clients using textbook RSA with $e=3$ and their (pairwise coprime, 2048-bit) moduli $N_1,N_2,N_3$. Show how an eavesdropper recovers $K$, and justify every step. Would it help if the key were sent to only **one** client?`,
    solution: md`Eavesdropper sees $c_i=K^3\bmod N_i$.
1. Solve $x\equiv c_i\pmod{N_i}$ with the CRT; unique $x\in[0,N_1N_2N_3)$ (moduli coprime).
2. $K^3$ satisfies the same congruences and $K^3<N_1N_2N_3$ because $K<N_i$ for each $i$. By uniqueness $x=K^3$ as integers.
3. $K=\sqrt[3]{x}$ over the integers (efficient, e.g. binary search).

**One client:** even then $K^3<2^{768}<N_1$: no modular reduction occurs at all, so $K=\sqrt[3]{c_1}$ directly (small-message attack).

**Fix:** randomized padding (OAEP), or hybrid encryption ISO-RSA where RSA encrypts a uniformly random $x\in\mathbb Z_N^\times$ and $K=h(x)$.`,
    rubric: R_FLAW,
  },
  {
    id: 'PK.3',
    title: 'Encrypted PINs',
    tutorial: 9,
    examGroup: 'PK',
    topicId: 'l08',
    category: 'flaw',
    ref: 'cf. Lecture 08 (semantic security)',
    tier: 'core',
    prompt: md`A bank's app encrypts a 4-digit PIN with the bank's RSA public key as $c=\mathrm{PIN}^e\bmod N$ (2048-bit $N$, $e=65537$, no padding) and sends $c$. Show how an eavesdropper recovers the PIN, and relate the attack to the semantic-security definition for public-key encryption.`,
    solution: md`The public key is public: compute $x^e\bmod N$ for all $x\in\{0000,\dots,9999\}$ and compare with $c$ — at most $10^4$ encryptions. Deterministic encryption + small message space = dictionary attack.

In the PK semantic-security game the adversary gets $k_p$, sends $m_0,m_1$, receives $E(k_p,m_b)$; with deterministic $E$ it encrypts $m_0$ itself and compares: advantage ½. Public-key encryption **must be randomized** to be semantically secure. Fix: randomized padding (OAEP) or hybrid encryption.`,
    rubric: R_FLAW,
  },
  {
    id: 'PK.4',
    title: 'Two users sharing a modulus',
    tutorial: 9,
    examGroup: 'PK',
    topicId: 'l08',
    category: 'flaw',
    ref: 'cf. Lecture 08 (group theory in RSA)',
    tier: 'star',
    prompt: md`To simplify key management, a company gives all employees the **same** modulus $N$ but different public exponents; Alice has $e_1=3$, Bob $e_2=5$. A message $m\in\mathbb Z_N^\times$ is encrypted to both: $c_1=m^3$, $c_2=m^5\bmod N$. Recover $m$ without factoring $N$. (A second, worse problem: what can Alice do with her own key pair?)`,
    hints: ['Find integers a, b with 3a + 5b = 1.'],
    solution: md`$\gcd(3,5)=1$: $3\cdot2+5\cdot(-1)=1$. Compute $c_1^2\cdot c_2^{-1}=m^{6}\cdot m^{-5}=m\pmod N$ (the inverse of $c_2$ exists because $m\in\mathbb Z_N^\times$). Exponents behave as integers in the group, so the attack needs only Euclid and two exponentiations.

**Worse:** Alice knows $e_1$ and $d_1$; then $e_1d_1-1$ is a multiple of $\varphi(N)$, which lets her factor $N$ (randomized algorithm) and compute everyone's secret exponent. Moduli must never be shared.`,
    rubric: R_FLAW,
  },
  {
    id: 'PK.5',
    title: 'φ(N) reveals the factorisation',
    tutorial: 9,
    examGroup: 'PK',
    topicId: 'l08',
    category: 'proof',
    ref: 'cf. Lecture 08',
    tier: 'core',
    prompt: md`Let $N=pq$ with distinct primes $p,q$. Show that from $N$ and $\varphi(N)$ one can compute $p$ and $q$ efficiently. Apply it to $N=3233$, $\varphi(N)=3120$. Why does this mean that computing $\varphi(N)$ is at least as hard as factoring $N$?`,
    solution: md`$\varphi(N)=(p-1)(q-1)=N-(p+q)+1$, so $s=p+q=N-\varphi(N)+1$ and $pq=N$. Then $p,q$ are the roots of $z^2-sz+N=0$: $p,q=\frac{s\pm\sqrt{s^2-4N}}2$ — integer arithmetic and one integer square root, polynomial time.

$s=3233-3120+1=114$, $s^2-4N=12996-12932=64$, roots $\frac{114\pm8}2=61,53$.

**Reduction:** any efficient algorithm computing $\varphi(N)$ from $N$ yields an efficient factoring algorithm (run it, then the formula). If factoring is hard, computing $\varphi(N)$ — and hence $d$ the obvious way — is hard too.`,
    rubric: R_PROOF,
  },
  {
    id: 'PK.6',
    title: 'Security notions for public-key encryption',
    tutorial: 9,
    examGroup: 'PK',
    topicId: 'l08',
    category: 'describe',
    ref: 'cf. Lecture 08',
    tier: 'core',
    prompt: md`Define a public-key encryption system and its semantic-security game. Explain why for public-key systems semantic security implies CPA security (and why this fails for symmetric ciphers). Describe hybrid encryption with ISO-RSA.`,
    solution: md`**PKE** $(\mathrm{Gen},E,D)$ with $D(k_s,E(k_p,m))=m$ for valid keys.

**Semantic game:** challenger runs Gen, gives $k_p$ to the adversary; adversary sends $m_0,m_1$ (equal length); gets $E(k_p,m_b)$; guesses $b$. Advantage $|P(\text{win})-\tfrac12|$.

**Sem ⇒ CPA:** with $k_p$ the adversary can encrypt anything itself; a CPA adversary with $N$ challenge queries is handled by a hybrid argument switching one challenge at a time from $m_0$ to $m_1$, each step bounded by ε: total $N\varepsilon$. For symmetric ciphers the adversary cannot encrypt without the key, so extra encryption queries give real new power (e.g. deterministic ciphers can be semantically but not CPA secure).

**ISO-RSA:** $x\leftarrow\mathbb Z_N^\times$, send $(x^e\bmod N,\ E_S(h(x),m))$ with an AE cipher $E_S$; decryption recomputes $x=y^d$, $k=h(x)$ and rejects if $D_S$ returns ⊥. RSA only ever encrypts a random value; the AE cipher handles long messages and gives CCA security.`,
    rubric: R_DESCRIBE,
  },
];

export const dl: Exercise[] = [
  {
    id: 'DL.1',
    title: 'Diffie–Hellman and choosing the group',
    tutorial: 10,
    examGroup: 'DL',
    topicId: 'l09',
    category: 'describe',
    ref: 'cf. Lecture 09',
    tier: 'core',
    prompt: md`Describe the Diffie–Hellman key exchange, run it in $\mathbb Z_{29}^\times$ with generator 2, $\alpha=5$, $\beta=9$, and describe the man-in-the-middle attack. Which requirements should the group satisfy, and why?`,
    solution: md`Public: cyclic group $G$, generator $b$. Alice sends $b^\alpha$, Bob sends $b^\beta$ (secrets random); both compute $b^{\alpha\beta}$.

**Numbers:** $2^5=32\equiv3$, $2^9=512\equiv19$. Alice: $19^5\bmod29$, Bob: $3^9\bmod29$; both equal $2^{45}=2^{45\bmod28}=2^{17}\equiv21$.

**MITM:** Mallory intercepts and sends $b^\mu$ to both; shares $b^{\alpha\mu}$ with Alice and $b^{\beta\mu}$ with Bob, relays and reads everything. DH has no authentication; fix with signatures (station-to-station, TLS).

**Group requirements:** large order (brute force, baby-step giant-step $\sim\sqrt{|G|}$); efficient operation; order not smooth (Pohlig–Hellman / Pollard ρ depend on the largest prime factor); for $\mathbb Z_p^\times$ larger parameters because of index calculus — or elliptic curves.`,
    rubric: R_DESCRIBE,
  },
  {
    id: 'DL.4',
    title: 'Random self-reducibility of discrete log',
    tutorial: 10,
    examGroup: 'DL',
    topicId: 'l09',
    category: 'proof',
    ref: 'cf. Lecture 09',
    tier: 'core',
    prompt: md`Let $G=\langle b\rangle$ have known order $q$. Suppose an efficient algorithm $\mathcal A$ outputs $\mathrm{dlog}_b(x)$ correctly for a fraction $\delta$ of all $x\in G$ (and arbitrary output otherwise). Construct an algorithm that computes $\mathrm{dlog}_b(y)$ for **every** $y$ with expected $1/\delta$ calls to $\mathcal A$, and prove it correct.`,
    solution: md`**Algorithm:** repeat: pick $r\leftarrow\mathbb Z_q$ uniformly, set $x=y\cdot b^r$, run $t=\mathcal A(x)$; if $b^t=x$ (checkable!) return $t-r\bmod q$.

**Correctness:** if $b^t=x=y\,b^r$ then $y=b^{t-r}$, so $t-r=\mathrm{dlog}_b(y)$.

**Distribution:** for fixed $y=b^k$, $x=b^{k+r}$ with $r$ uniform is **uniform on $G$** (the map $r\mapsto k+r$ is a bijection of $\mathbb Z_q$). So each iteration succeeds independently with probability $\delta$ — the fraction of good inputs — regardless of $y$. The number of iterations is geometric with expectation $1/\delta$; each costs one call and a few exponentiations. For non-negligible δ this is efficient.

Hence the average-case DL is as hard as the worst case.`,
    rubric: R_PROOF,
  },
  {
    id: 'DL.5',
    title: 'Elliptic curves: group law and curve choice',
    tutorial: 11,
    examGroup: 'DL',
    topicId: 'l10',
    category: 'describe',
    ref: 'cf. Lecture 10',
    tier: 'core',
    prompt: md`Define an elliptic curve over $\mathbb F_p$ and describe the group operation geometrically and algebraically, including the neutral element. On $E:y^2=x^3+x+6$ over $\mathbb F_{11}$ compute $2P$ for $P=(2,7)$. State the Hasse–Weil bound and name the curve properties that must be avoided.`,
    solution: md`**Curve:** points $(x,y)\in\mathbb F_p^2$ with $y^2=x^3+ax+b$, $4a^3+27b^2\ne0$, plus $\mathcal O$. **Group law:** line through $P,Q$ (tangent if $P=Q$) meets the curve in a third point; $P+Q$ is its reflection. $\mathcal O$ is neutral; $-(x,y)=(x,-y)$; vertical line ⇒ $\mathcal O$. Algebra: $m=\frac{y_2-y_1}{x_2-x_1}$ or $\frac{3x_1^2+a}{2y_1}$, $x_3=m^2-x_1-x_2$, $y_3=m(x_1-x_3)-y_1$.

**Example:** $m=\frac{3\cdot4+1}{14}=\frac{13}{14}\equiv\frac{2}{3}\pmod{11}$; $3^{-1}=4$, $m=8$. $x_3=64-4=60\equiv5$, $y_3=8(2-5)-7=-31\equiv2$. So $2P=(5,2)$. (Check: $2^2=4$ and $125+5+6=136\equiv4$ ✓.)

**Hasse–Weil:** $||E|-(p+1)|\le2\sqrt p$ (here $|E|=13$ within $12\pm6.6$); Schoof computes $|E|$ in polynomial time.

**Avoid:** singular curves ($\Delta=0$), group orders without a large prime factor (Pohlig–Hellman), anomalous curves $|E|=p$ (Smart), supersingular / low embedding degree (MOV). In implementations: validate points (invalid-curve, small-subgroup attacks).`,
    rubric: R_DESCRIBE,
  },
  {
    id: 'DL.6',
    title: 'Prime-order groups',
    tutorial: 10,
    examGroup: 'DL',
    topicId: 'l09',
    category: 'proof',
    ref: 'cf. Worksheet 8, assignments 1–2',
    tier: 'core',
    prompt: md`a. Prove that in a group of prime order $q$ every element other than 1 is a generator.
b. Let $p=2q+1$ with $p,q$ prime. Prove that the squares in $\mathbb Z_p^\times$ form a subgroup of order $q$ and that $g^2$ generates it for any $g\ne\pm1$.
c. Why are such groups convenient for DL-based cryptography?`,
    solution: md`a. By Lagrange $\mathrm{ord}(g)\mid q$, so it is 1 or $q$. Only the neutral element has order 1; everything else has order $q$ and generates the group.

b. $\mathbb Z_p^\times$ is cyclic of order $2q$ with generator $b$. Squares are $\{b^{2j}\}=\langle b^2\rangle$, a subgroup of order $\mathrm{ord}(b^2)=2q/\gcd(2,2q)=q$. For $g\ne\pm1$: $g^2\ne1$ (the only square roots of 1 in a field are $\pm1$), and $g^2$ lies in the subgroup of prime order $q$, so by (a) it generates it.

c. A prime-order group has no small subgroups (no Pohlig–Hellman, no small-subgroup leaks), every non-identity element is a generator (easy to pick), and membership of a received element can be checked by $y^q=1$.`,
    rubric: R_PROOF,
  },
];

export const sig: Exercise[] = [
  {
    id: 'DS.1',
    title: 'Signatures, FDH and RSA signatures',
    tutorial: 12,
    examGroup: 'DS',
    topicId: 'l11',
    category: 'describe',
    ref: 'cf. Lecture 11',
    tier: 'core',
    prompt: md`Define a digital signature scheme and its existential-forgery game; explain non-repudiation and how the game differs from the MAC game. Describe the full-domain-hash construction and RSA signatures, and explain why the hash is essential.`,
    solution: md`**Scheme** $(\mathrm{Gen},S,V)$ with $V(k_p,m,S(k_s,m))=\mathit{true}$. **EF game:** challenger gives $k_p$; adversary gets signatures on chosen $m_i$; outputs $(m,\sigma)$ with new $m$; wins iff valid. ADV = P(win). **Non-repudiation:** anyone can verify with the public key, so the signer cannot deny — a MAC tag could have been produced by the verifier too. Differences to MACs: public verification key given to the adversary; forged message must be new.

**FDH:** trapdoor permutation $(\mathrm{Fwd},\mathrm{Inv})$, hash $h$: $\sigma=\mathrm{Inv}(k_s,h(m))$; verify $\mathrm{Fwd}(k_p,\sigma)=h(m)$. Secure if $f$ is a trapdoor function and $h$ collision resistant (random oracle). **RSA:** $\sigma=h(m)^d$, check $\sigma^e=h(m)$.

**Hash essential:** without it, any $\sigma$ signs $\sigma^e$ (no-message forgery) and $\sigma_1\sigma_2$ signs $m_1m_2$. With $h$ these only produce signatures on hash values; using them needs preimages. Collision resistance prevents moving a signature from $m$ to $m'$.`,
    rubric: R_DESCRIBE,
  },
  {
    id: 'DS.2',
    title: 'Schnorr signatures with a repeated nonce',
    tutorial: 12,
    examGroup: 'DS',
    topicId: 'l11',
    category: 'flaw',
    ref: 'cf. Lecture 11',
    tier: 'core',
    prompt: md`Schnorr signatures in the subgroup of order $q=11$ of $\mathbb Z_{23}^\times$ generated by $b=2$; public key $\kappa=13$. Two signatures on different messages share $\rho=9$: $(\rho,z_1)=(9,4)$ with $h(m_1\|\rho)=3$ and $(\rho,z_2)=(9,6)$ with $h(m_2\|\rho)=8$. Recover the secret key and verify it. Then sign a message of your choice whose hash is $h=5$, using $r=1$.`,
    solution: md`Same $\rho$ ⇒ same $r$. $z_1-z_2=k(h_1-h_2)\pmod{11}$: $-2\equiv k\cdot(-5)$, so $k=2\cdot5^{-1}\bmod11$. $5^{-1}=9$ ($45=44+1$), $k=18\equiv7$. **Check:** $2^7=128=5\cdot23+13$ ✓ $=\kappa$. Also $r=z_1-kh_1=4-21\equiv5$ and $2^5=32\equiv9=\rho$ ✓.

**Forged signature** (now a real signature) on a message with $h=5$ and $r=1$: $\rho=2$, $z=7\cdot5+1=36\equiv3$. Verify: $b^z\kappa^{-h}=2^3\cdot13^{-5}$. $13^{-1}\bmod23=16$ ($208=9\cdot23+1$); $16^5\bmod23$: $16^2=256\equiv3$, $16^4\equiv9$, $16^5\equiv144\equiv6$. $8\cdot6=48\equiv2=\rho$ ✓.

Lesson: the ephemeral key must be fresh, random and secret for every signature (PS3 ECDSA failure).`,
    rubric: ['Recognises the repeated nonce from equal ρ', 'Derives k = (z₁ − z₂)/(h₁ − h₂) mod q', 'Correct modular arithmetic (k = 7)', 'Verification of the result', 'Signs a new message correctly'],
  },
  {
    id: 'DS.3',
    title: 'RSA signatures without hashing',
    tutorial: 12,
    examGroup: 'DS',
    topicId: 'l11',
    category: 'flaw',
    ref: 'cf. Lecture 11',
    tier: 'core',
    prompt: md`A system signs integers $m\in\mathbb Z_N^\times$ (e.g. amounts) as $\sigma=m^d\bmod N$ and verifies $\sigma^e\equiv m$. Give (a) an existential forgery without any signing query and (b) a signature on **any chosen** message $m^*$ using one signing query on a different message. Then explain why signing $h(m)$ stops both.`,
    solution: md`a. Pick any $\sigma$ and set $m=\sigma^e\bmod N$: $(m,\sigma)$ verifies. The message is random-looking, but existential forgery counts any new message.

b. **Blinding.** Pick a random $r\ne1$ in $\mathbb Z_N^\times$ and ask for a signature on $m_0=m^*\cdot r^e\bmod N$ (a different message). The answer is $\sigma_0=m_0^d=(m^*)^d\,r^{ed}=(m^*)^d\,r$. Output $\sigma^*=\sigma_0\,r^{-1}=(m^*)^d$, a valid signature on $m^*$, which was never queried.

**With a hash** ($\sigma=h(m)^d$): (a) gives a signature on the *hash value* $\sigma^e$, and blinding gives a signature on $h(m^*)$ only if the attacker queries a message $m_0$ with $h(m_0)=h(m^*)\,r^e$ — finding such an $m_0$ requires a preimage of $h$. Multiplicative relations between messages no longer carry over to their hashes.`,
    rubric: R_FLAW,
  },
  {
    id: 'DS.4',
    title: 'Hash-then-sign is secure',
    tutorial: 12,
    examGroup: 'DS',
    topicId: 'l11',
    category: 'proof',
    ref: 'cf. Worksheet 8, assignment 3',
    tier: 'core',
    prompt: md`Let $\mathcal D_s=(\mathrm{Gen},S,V)$ be a signature scheme over a message space $\mathcal H$, ε-secure, and $h:\mathcal M\to\mathcal H$ a hash function for which every efficient adversary finds a collision with probability ≤ γ. Define $\mathcal D_s^h$ with $S^h(k_s,m)=S(k_s,h(m))$, $V^h(k_p,m,\sigma)=V(k_p,h(m),\sigma)$. Prove that $\mathcal D_s^h$ is $(\varepsilon+\gamma)$-secure.`,
    solution: md`Let $A$ forge against $\mathcal D_s^h$: it queries $m_1,\dots,m_N$ and outputs $(m,\sigma)$ with $m\notin\{m_i\}$ and $V(k_p,h(m),\sigma)$. Consider two events:
- $C$: $h(m)=h(m_i)$ for some $i$ (then $m\ne m_i$ is a **collision**);
- $\bar C$: $h(m)\notin\{h(m_i)\}$.

**Forger $B$ against $\mathcal D_s$:** gets $k_p$, runs $A$; on query $m_i$ asks its challenger for a signature on $h(m_i)$ and forwards it; outputs $(h(m),\sigma)$. Simulation is perfect. On $\bar C$ and $A$'s success, $h(m)$ is a new message for $B$ with a valid signature: $P(A\text{ wins}\wedge\bar C)\le\mathrm{ADV}(B)\le\varepsilon$.

**Collision finder $C'$:** generates its own key pair, answers $A$'s queries itself, and on output checks whether $h(m)=h(m_i)$ for some $i$; if so outputs $(m,m_i)$: $P(A\text{ wins}\wedge C)\le\gamma$.

Total: $\mathrm{ADV}(A)\le\varepsilon+\gamma$; $B$ and $C'$ are efficient. ∎`,
    rubric: R_PROOF,
  },
  {
    id: 'DS.5',
    title: "Schnorr's signature",
    tutorial: 12,
    examGroup: 'DS',
    topicId: 'l11',
    category: 'describe',
    ref: 'cf. Lecture 11',
    tier: 'core',
    prompt: md`Describe Schnorr's signature scheme (parameters, key generation, signing, verification), prove correctness, and explain its relation to Schnorr's identification protocol. Briefly compare with DSA/ECDSA and state the critical implementation requirement shared by all of them.`,
    solution: md`**Parameters:** group with element $b$ of prime order $q$; hash $h$ into $\mathbb Z_q$. **Keys:** $k\leftarrow\mathbb Z_q$, $\kappa=b^k$. **Sign:** fresh random $r$, $\rho=b^r$, $z=k\,h(m\|\rho)+r\bmod q$, $\sigma=(\rho,z)$. **Verify:** $b^z\kappa^{-h(m\|\rho)}=\rho$.

**Correctness:** $b^{kh+r}\cdot b^{-kh}=b^r=\rho$.

**Relation:** it is Schnorr's Σ-protocol (commitment $b^r$, challenge $c$, response $kc+r$) with the challenge replaced by $h(m\|\rho)$ — the Fiat–Shamir trick.

**DSA/ECDSA:** same structure ($\rho$ derived from $b^r$ or $r\cdot G$, $z=r^{-1}(h(m)+k\rho)$), standardised by NIST because Schnorr was patented.

**Requirement:** the ephemeral $r$ must be unique, unpredictable and secret for every signature; a repeated or predictable $r$ reveals $k$ (PlayStation 3).`,
    rubric: R_DESCRIBE,
  },
];

export const zk: Exercise[] = [
  {
    id: 'ZK.1',
    title: 'Interactive proofs and zero knowledge',
    tutorial: 13,
    examGroup: 'ZK',
    topicId: 'l12',
    category: 'describe',
    ref: 'cf. Lecture 12',
    tier: 'core',
    prompt: md`Define interactive proof systems in the cryptographic setting with soundness and completeness. Define honest-verifier zero knowledge and perfect zero knowledge. Why is a simulator a convincing argument that "nothing leaks"?`,
    solution: md`**IPS:** protocol between prover and verifier (including their private computations); common input = public key $k_p$; verifier outputs accept/reject; parties may deviate. For fixed $p<\tfrac12$: **soundness** — some capable verifier $V_c$ rejects every prover not knowing the secret w.p. ≥ $1-p$; **completeness** — some honest prover $P_h$ is accepted by $V_c$ w.p. ≥ $1-p$.

**HVZK:** a poly-time $\mathrm{Sim}(k_p)$ outputs transcripts with exactly the distribution of real transcripts between the honest prover and honest verifier. **Perfect ZK:** for **every** verifier $V$ there is such a simulator (it may use $V$ as a black box), matching $I[P,V]$.

**Why convincing:** anything the verifier could compute from a transcript it could also compute from a simulated one, which it can produce itself from $k_p$ alone — so the interaction adds no knowledge about $k_s$.`,
    rubric: R_DESCRIBE,
  },
  {
    id: 'ZK.2',
    title: 'Fiat–Shamir identification by hand',
    tutorial: 13,
    examGroup: 'ZK',
    topicId: 'l12',
    category: 'describe',
    ref: 'cf. Lecture 12',
    tier: 'core',
    prompt: md`$N=77$, Peggy's secret $k_s=10$. a. Compute her public key. b. Run one round with $r=4$ and challenge $c=1$ and check the verifier's equation. c. Explain soundness: what would a cheater do, and with what success per round? d. Produce one simulated transcript with $c=1$ without using $k_s$.`,
    solution: md`a. $k_p=k_s^2=100\equiv23\pmod{77}$.

b. $y=r^2=16$; $c=1$; $z=r\,k_s=40$. Check: $z^2=1600\equiv1600-20\cdot77=60$ and $y\,k_p=16\cdot23=368\equiv368-4\cdot77=60$ ✓.

c. A cheater not knowing a square root of 23 can prepare for one challenge: for $c=0$ send $y=r^2$ and answer $r$; for $c=1$ pick $z$, send $y=z^2k_p^{-1}$ and answer $z$. It cannot answer both for the same $y$, otherwise $z_1/z_0$ would be a square root of $k_p$. Success ½ per round, $2^{-t}$ after $t$ rounds.

d. Choose $z=5$, $c=1$: $y=z^2k_p^{-1}=25\cdot23^{-1}$. $23^{-1}\bmod77=67$ ($23\cdot67=1541=20\cdot77+1$), $y=25\cdot67=1675\equiv1675-21\cdot77=58$. Transcript $(58,1,5)$: check $5^2=25$ and $58\cdot23=1334\equiv1334-17\cdot77=25$ ✓.`,
    rubric: ['Public key correct', 'Round computed and verified', 'Cheating strategy and ½ per round', 'Explains why answering both challenges reveals a root', 'Valid simulated transcript'],
  },
  {
    id: 'ZK.3',
    title: "HVZK of Schnorr's protocol",
    tutorial: 13,
    examGroup: 'ZK',
    topicId: 'l12',
    category: 'proof',
    ref: 'cf. Lecture 12',
    tier: 'core',
    prompt: md`Prove that Schnorr's identification protocol (commitment $y=b^r$, challenge $c$ uniform in a set $\mathcal C\subseteq\mathbb Z_q$, response $z=k_sc+r\bmod q$) is honest-verifier zero knowledge: give the simulator and show the distributions are identical.`,
    solution: md`**Real transcripts** with the honest verifier: $r$ uniform in $\mathbb Z_q$, $c$ uniform in $\mathcal C$ independent of $r$, $z=k_sc+r$, $y=b^r$. For each fixed $c$, $z$ is uniform in $\mathbb Z_q$ (shift of a uniform $r$), and $y$ is determined by $(c,z)$: $y=b^{z-k_sc}=b^zk_p^{-c}$. So real transcripts are: $c$ uniform, $z$ uniform independent of $c$, $y=b^zk_p^{-c}$.

**Simulator** $\mathrm{Sim}(k_p)$: sample $c\leftarrow\mathcal C$, $z\leftarrow\mathbb Z_q$ independently; set $y=b^zk_p^{-c}$; output $(y,c,z)$. It uses only $k_p$ and runs in polynomial time, and it produces exactly the distribution above. Hence the protocol is HVZK. ∎

(Against a cheating verifier that chooses $c$ depending on $y$, the simulator guesses $c$, asks the verifier for its challenge on $y$ and rewinds if wrong — efficient only for small $\mathcal C$, which is why binary challenges and many rounds are used for full ZK.)`,
    rubric: R_PROOF,
  },
  {
    id: 'ZK.4',
    title: 'Two broken variants of Schnorr identification',
    tutorial: 13,
    examGroup: 'ZK',
    topicId: 'l12',
    category: 'flaw',
    ref: 'cf. Lecture 12',
    tier: 'core',
    prompt: md`Explain what goes wrong in each variant of Schnorr's protocol:
a. To save a round trip, the verifier sends the challenge $c$ **before** the prover's commitment.
b. A smart card uses a fixed $r$ for all sessions (stored in ROM).`,
    solution: md`a. **Soundness breaks.** Knowing $c$ in advance, an impostor picks any $z$, sets $y=b^zk_p^{-c}$ and sends $(y,z)$; the check $b^zk_p^{-c}=y$ holds. Success probability 1 without $k_s$ — the simulator's trick becomes an attack. The commitment must be fixed before the challenge is known.

b. **The secret leaks.** An eavesdropper (or verifier) sees two sessions with the same $y=b^r$ and different challenges $c_1\ne c_2$: $z_1-z_2=k_s(c_1-c_2)$, so $k_s=(z_1-z_2)(c_1-c_2)^{-1}\bmod q$ (special soundness used as an attack). Fresh random $r$ per session is essential — the same failure as nonce reuse in Schnorr/ECDSA signatures.`,
    rubric: R_FLAW,
  },
  {
    id: 'ZK.5',
    title: 'Special soundness of Fiat–Shamir identification',
    tutorial: 13,
    examGroup: 'ZK',
    topicId: 'l12',
    category: 'proof',
    ref: 'cf. Lecture 12',
    tier: 'core',
    prompt: md`In the Fiat–Shamir identification protocol ($k_p=k_s^2\bmod N$), suppose a prover can answer both challenges for the same commitment: $(y,0,z_0)$ and $(y,1,z_1)$ are both accepting. Show how to compute a square root of $k_p$ from them, and conclude that a prover who passes $t$ rounds with probability $>2^{-t}$ must essentially know a square root.`,
    solution: md`Accepting means $z_0^2\equiv y$ and $z_1^2\equiv y\,k_p\pmod N$. ($z_0$ is invertible since $y\in\mathbb Z_N^\times$.) Then
$$\Bigl(\frac{z_1}{z_0}\Bigr)^2=\frac{y\,k_p}{y}=k_p\pmod N,$$
so $s=z_1z_0^{-1}\bmod N$ is a square root of $k_p$.

**Consequence:** if for a commitment the prover could answer only one challenge, it passes each round with probability ≤ ½, hence $t$ rounds with ≤ $2^{-t}$. A prover with higher success must, for some commitments, be able to answer both challenges; rewinding it (asking both) yields a square root of $k_p$ by the formula above. Computing square roots modulo $N=pq$ is as hard as factoring, so a prover without the secret (and unable to factor) passes with at most $\approx2^{-t}$. ∎`,
    rubric: R_PROOF,
  },
];
