/** Original exam-style problems for IA174: modes (S4), hashes (H), MACs (M), authenticated encryption (AE). */
import type { Exercise } from '../../../platform/types';

const md = String.raw;

const R_DESCRIBE = ['Correct definitions / setting', 'Precise description of the algorithm or game', 'Key properties or theorem stated correctly', 'Intuition / why it works or fails', 'Clear, structured answer'];
const R_FLAW = ['Identifies the flaw', 'Describes a concrete adversary (what it sends / computes / outputs)', 'Computes its success probability or advantage', 'Explains why the advantage is non-negligible', 'Optional fix or remark'];
const R_PROOF = ['Correct direction (contraposition) and goal stated', 'Construction of the reduction adversary', 'Shows the simulated game is faithful', 'Computes the advantage relation', 'Efficiency of the reduction argued'];

export const s4: Exercise[] = [
  {
    id: 'S4.1',
    title: 'CBC, CTR and CPA security',
    tutorial: 4,
    examGroup: 'S4',
    topicId: 'l04',
    category: 'describe',
    ref: 'cf. Lecture 04',
    tier: 'core',
    prompt: md`Describe CBC and CTR mode (encryption and decryption). Define the CPA attack game and explain why no deterministic cipher can be CPA-secure. How do randomized CBC and CTR fix this, and what exactly must hold for their IVs?`,
    solution: md`**CBC:** $y_0=IV$, $y_i=E(k,y_{i-1}\oplus x_i)$; decryption $x_i=D(k,y_i)\oplus y_{i-1}$; needs padding, sequential encryption.
**CTR:** keystream $z_i=E(k,IV\boxplus[i])$, $c=m\oplus z$; decryption identical; parallel, no padding, uses only $E$.

**CPA game:** challenger samples $k,b$; the adversary picks $q$; in each round sends $(m_0^j,m_1^j)$ of equal length and gets $E(k,m_b^j)$ — same $b$ throughout; finally guesses $b$. $\mathrm{ADV}=|P(\text{win})-\tfrac12|$.

**Deterministic ciphers fail:** round 1 $(m,m)$ → $c^1$; round 2 $(m,m')$ → $c^2$; $b=0$ iff $c^1=c^2$. Advantage ½.

**Randomized modes:** sample a fresh IV per message, send $IV\|E_{IV}(k,m)$. For **CBC** the IV must be uniformly random/unpredictable to the adversary before it picks the plaintext (predictable IV ⇒ attack $m\oplus IV_1\oplus IV_2$). For **CTR** randomness only serves to make counter ranges non-overlapping; the nonce-based variant needs only uniqueness. Bounds: CBC $2\varepsilon+q^2n^2/|\mathcal X|$, CTR $2\varepsilon+q^2n/|\mathcal X|+qn^2/|\mathcal X|$.`,
    rubric: R_DESCRIBE,
  },
  {
    id: 'S4.2',
    title: 'CBC with counter IVs',
    tutorial: 4,
    examGroup: 'S4',
    topicId: 'l04',
    category: 'flaw',
    ref: 'cf. Lecture 04 (predictable IV)',
    tier: 'core',
    prompt: md`A library implements "randomized" CBC on 128-bit blocks, but the IV of the $j$-th encryption under a key is $IV_j=IV_0\boxplus j$ for a random $IV_0$ chosen once (all IVs are sent with the ciphertexts). Construct a CPA adversary with two queries of one-block messages and compute its advantage.`,
    hints: ['After the first query you know IV₁, hence IV₂.'],
    solution: md`Round 1: send $(m,m)$ for any block $m$; receive $(IV_1,c_1)$ with $c_1=E(k,m\oplus IV_1)$. Now $IV_2=IV_1\boxplus1$ is known.
Round 2: send $m_0=m\oplus IV_1\oplus IV_2$ and any $m_1\ne m_0$; receive $(IV_2,c_2)$.
- $b=0$: $c_2=E(k,m_0\oplus IV_2)=E(k,m\oplus IV_1)=c_1$.
- $b=1$: $c_2=E(k,m_1\oplus IV_2)\ne c_1$ because $E(k,\cdot)$ is a permutation and $m_1\oplus IV_2\ne m\oplus IV_1$.

Output 0 iff $c_2=c_1$: always correct, advantage ½. Fix: draw every IV uniformly at random (or encrypt a nonce under an independent key).`,
    rubric: R_FLAW,
  },
  {
    id: 'S4.3',
    title: 'CTR nonces from a clock',
    tutorial: 4,
    examGroup: 'S4',
    topicId: 'l04',
    category: 'hw',
    ref: 'cf. Lecture 04 (nonce-based encryption)',
    tier: 'core',
    prompt: md`An encryption service uses AES-CTR with one long-term key; the initial counter block is the current Unix time in seconds (followed by zeros). Users can submit arbitrary plaintexts and see the ciphertext with its nonce. You intercept a victim's ciphertext $c^*$ (with nonce $t^*$) of an unknown 300-byte message.
a. Describe how to decrypt $c^*$, including how you would arrange the timing.
b. Even without access to the service, what can you learn from many intercepted ciphertexts?
c. What does the nonce-based CPA definition require that this design violates, and how should it be fixed?`,
    solution: md`a. Keystream depends only on (key, initial counter). Submit a known plaintext $p$ of ≥ 300 bytes (e.g. all zeros) during the **same second** $t^*$ — or, since you can see nonces, repeat submissions until one carries nonce $t^*$ (if you can submit at a chosen time, do it in that second). Its ciphertext is $c=p\oplus z$, so $z=c\oplus p$ and $m^*=c^*\oplus z$. Note also that counters of different messages overlap: a message with nonce $t$ uses counters $t\|0,t\|1,\dots$ only within its own prefix block, but if the nonce only fills the high bits, messages of the *same* second share the whole keystream.

b. All messages sent in the same second are encrypted with identical keystream: $c_1\oplus c_2=m_1\oplus m_2$ (two-time pad); with known structure (headers, JSON) the plaintexts can be recovered.

c. The definition requires **pairwise distinct nonces** in every encryption under one key (and non-overlapping counter ranges). Timestamps in seconds repeat. Fix: a per-key message counter or random 96-bit nonce with a strict limit on messages per key, or a nonce-misuse-resistant AEAD; never let two encryptions share a (key, nonce) pair.`,
    rubric: ['Observes that same nonce ⇒ same keystream', 'Chosen-plaintext recovery of the keystream', 'Decrypts the target / two-time-pad analysis', 'Names the violated requirement (unique nonces)', 'Correct fix'],
  },
  {
    id: 'S4.4',
    title: 'Encrypting twice',
    tutorial: 4,
    examGroup: 'S4',
    topicId: 'l04',
    category: 'proof',
    ref: 'cf. Worksheet 4, assignment 2',
    tier: 'core',
    prompt: md`Let $\mathcal E=(E,D)$ be an ε-CPA-secure probabilistic cipher (against adversaries making at most $2q$ queries). Define $E'(k,m)=(E(k,m),E(k,m))$ — two independent encryptions of $m$ with fresh randomness — and $D'(k,(c_1,c_2))=D(k,c_1)$. Prove that $\mathcal E'$ is ε-CPA secure against adversaries making at most $q$ queries.`,
    solution: md`Let $A'$ attack $\mathcal E'$ with $q$ queries. Build $A$ against $\mathcal E$:
- for each query $(m_0,m_1)$ of $A'$, $A$ sends the **same pair twice** to its challenger, receiving $c_1=E(k,m_b)$ and $c_2=E(k,m_b)$ (independent randomness, same $b$), and returns $(c_1,c_2)$ to $A'$;
- $A$ outputs $A'$'s guess.

*Faithful:* in $A$'s game the hidden bit $b$ and key $k$ are fixed for all rounds, so $(c_1,c_2)$ is distributed exactly as $E'(k,m_b)$. $A'$'s view is its own CPA game with the same $b$; hence $P(A\text{ wins})=P(A'\text{ wins})$.

$A$ makes $2q$ queries and is efficient. Therefore $\mathrm{ADV}_{\mathrm{CPA}}(\mathcal E',A')=\mathrm{ADV}_{\mathrm{CPA}}(\mathcal E,A)\le\varepsilon$. ∎`,
    rubric: R_PROOF,
  },
  {
    id: 'S4.5',
    title: 'Short random IVs in CTR',
    tutorial: 4,
    examGroup: 'S4',
    topicId: 'l04',
    category: 'flaw',
    ref: 'cf. Lecture 04 (birthday terms)',
    tier: 'extra',
    prompt: md`A protocol uses randomized AES-CTR, but to save bandwidth the IV is a random **32-bit** value $v$, padded with zeros to 128 bits, and messages are at most 16 blocks. Give a CPA adversary and estimate how many queries it needs for advantage close to ½. Which term of the CTR theorem explains this?`,
    hints: ['When two messages get the same v they use the same keystream.'],
    solution: md`Use one-block messages and two kinds of rounds:
- *reference rounds* $(0^{128},0^{128})$: the answer $(v,c)$ reveals the keystream block $z_v=c$ for that IV;
- *challenge rounds* $(0^{128},1^{128})$: the answer is $(v,m_b\oplus z_v)$.

Make $q/2$ rounds of each. As soon as a challenge round and a reference round share the same $v$, XORing their ciphertexts gives $m_b$, hence $b$. Otherwise guess randomly. With $2^{32}$ possible IVs the probability of such a cross-collision is about $1-e^{-(q/2)^2/2^{32}}$: ≈ 0.63 for $q=2^{17}$ and ≈ 0.98 for $q=2^{18}$. The advantage is ½ times this probability — close to ½ after a few hundred thousand queries, which is entirely practical.

The effective block space for IVs is $2^{32}$ instead of $2^{128}$, so the birthday term $q^2n/|\mathcal X|$ of the CTR theorem effectively becomes $q^2n/2^{32}$ and is already ≈ 1 around $q\approx2^{14}$ with $n=16$. Fix: full 128-bit random IVs, or unique 96-bit nonces with a 32-bit block counter.`,
    rubric: R_FLAW,
  },
];

export const hashes: Exercise[] = [
  {
    id: 'H.1',
    title: 'Merkle–Damgård and its security proof',
    tutorial: 5,
    examGroup: 'H',
    topicId: 'l05',
    category: 'describe',
    ref: 'cf. Lecture 05',
    tier: 'core',
    prompt: md`Describe the Merkle–Damgård construction: compression function, initial state, MD-compliant padding (all three conditions) and the Merkle padding. State the security theorem and sketch its proof. Which property of MD hashes makes $h(k\|m)$ a bad MAC?`,
    solution: md`**Compression function** $f:\{0,1\}^\ell\times\{0,1\}^k\to\{0,1\}^\ell$; fixed initial state $s_0$; split $\mathrm{pad}(m)=m_1\|\cdots\|m_n$ into $k$-bit blocks, $s_i=f(s_{i-1},m_i)$, $h(m)=s_n$.

**MD-compliant padding:** injective; equal lengths ⇒ equal padded lengths; different lengths ⇒ different last blocks. **Merkle padding:** $m\|1\|0^d\|\langle\mathrm{len}(m)\rangle$.

**Theorem:** a collision of $h$ gives a collision of $f$ in constant time; so $f$ CR ⇒ $h$ CR. *Proof:* different lengths ⇒ different last blocks, but the last $f$-calls give equal outputs → collision of $f$. Equal lengths ⇒ walk back from the end; the first step where the $f$-inputs differ but the outputs agree is a collision of $f$; if the inputs never differ, $\mathrm{pad}(m)=\mathrm{pad}(m')$, contradicting injectivity.

**Length extension:** $h(m)$ equals the internal state after $\mathrm{pad}(m)$, so from $h(m)$ and $|m|$ anyone computes $h(\mathrm{pad}(m)\|m')$; for $h(k\|m)$ this forges tags.`,
    rubric: R_DESCRIBE,
  },
  {
    id: 'H.2',
    title: 'A compression function keyed by the state',
    tutorial: 5,
    examGroup: 'H',
    topicId: 'l05',
    category: 'flaw',
    ref: 'cf. Worksheet 5, assignment 1',
    tier: 'core',
    prompt: md`Let $(E,D)$ be a secure block cipher with keys and blocks of the same length. Define $f(s,b)=E(s,b)\oplus s$ (the state is the key, the message block the plaintext). Find a collision of $f$ in constant time.`,
    hints: ['Fix s, b, s′ arbitrarily and solve for b′.'],
    solution: md`Pick any $s,b$ and any $s'\ne s$. We need $E(s',b')\oplus s'=E(s,b)\oplus s$, i.e. $E(s',b')=E(s,b)\oplus s\oplus s'$. The attacker knows the key $s'$, so it sets
$$b'=D\bigl(s',\ E(s,b)\oplus s\oplus s'\bigr).$$
Then $(s,b)\ne(s',b')$ and $f(s,b)=f(s',b')$: two encryptions and one decryption. The lesson: in a compression function the adversary controls the "key" input, so PRP security of $E$ says nothing; feed-forward must be arranged as in Davies–Meyer ($E(b,s)\oplus s$, where finding such pairs requires inverting with an unknown relation).`,
    rubric: R_FLAW,
  },
  {
    id: 'H.3',
    title: 'XOR of encrypted blocks as a hash',
    tutorial: 5,
    examGroup: 'H',
    topicId: 'l05',
    category: 'flaw',
    ref: 'cf. Lecture 05',
    tier: 'core',
    prompt: md`A designer hashes a message of 128-bit blocks $m_1\|\cdots\|m_n$ as $h(m)=E(k_0,m_1)\oplus E(k_0,m_2)\oplus\cdots\oplus E(k_0,m_n)$ with AES and a **public** fixed key $k_0$ (plus padding). Give two collisions and a second-preimage attack.`,
    solution: md`- **Reordering:** $h(m_1\|m_2)=h(m_2\|m_1)$ since XOR is commutative.
- **Cancellation:** $h(x\|x)=0$ for every block $x$, so $h(m\|x\|x)=h(m)$ for blocks inserted anywhere (same padding length issues aside — use two different pairs $x\|x$ and $y\|y$ for equal lengths: $h(x\|x)=h(y\|y)$).
- **Second preimage for any $m$:** keep all blocks but the last; choose any new block $m_{n-1}'$ and solve $E(k_0,m_n')=h(m)\oplus\bigoplus_{i<n-1}E(k_0,m_i)\oplus E(k_0,m'_{n-1})$ by **decrypting** with the public key: $m_n'=D(k_0,\cdot)$.

A public key makes the block cipher an easily invertible permutation, and XOR has no order — a sound compression function must chain the state (MD) or use a sponge.`,
    rubric: R_FLAW,
  },
  {
    id: 'H.5',
    title: 'Hashing twice preserves collision resistance',
    tutorial: 5,
    examGroup: 'H',
    topicId: 'l05',
    category: 'proof',
    ref: 'cf. Worksheet 5',
    tier: 'core',
    prompt: md`Let $h:\{0,1\}^{\le L}\to\{0,1\}^\ell$ be collision resistant (with $\ell\le L$). Prove that $h_2(m)=h(h(m))$ is collision resistant by showing how a collision for $h_2$ yields a collision for $h$.`,
    solution: md`Let $A_2$ output $m\ne m'$ with $h(h(m))=h(h(m'))$. Build $A$: run $A_2$, compute $u=h(m)$ and $u'=h(m')$.
- If $u=u'$: output $(m,m')$ — a collision of $h$ because $m\ne m'$.
- If $u\ne u'$: output $(u,u')$ — distinct inputs with $h(u)=h(u')$, a collision of $h$.

In both cases $A$ succeeds whenever $A_2$ does, with two extra hash evaluations. Hence $P(A\text{ finds a collision of }h)\ge P(A_2\text{ finds a collision of }h_2)$, and collision resistance of $h$ implies that of $h_2$. (In the salted formal game the same argument works with the salt passed through.) ∎`,
    rubric: ['Goal: collision of h₂ ⇒ collision of h', 'Case u = u′ handled', 'Case u ≠ u′ handled', 'Success probability relation', 'Efficiency'],
  },
  {
    id: 'H.6',
    title: 'Generic collision search and sponges',
    tutorial: 5,
    examGroup: 'H',
    topicId: 'l05',
    category: 'describe',
    ref: 'cf. Lecture 05',
    tier: 'core',
    prompt: md`State the birthday theorem and describe the generic birthday attack and its memory-free variant via cycle detection. Then describe the sponge construction (parameters, absorbing, squeezing) and explain the role of the capacity and why sponges do not suffer from length extension.`,
    solution: md`**Birthday:** drawing with replacement from $N$ items, a repeat occurs with probability > ½ after $O(\sqrt N)$ draws ($\approx1.18\sqrt N$).

**Generic attack:** hash random messages, store $(m,h(m))$ until a hash repeats for different messages: $\approx2^{\ell/2}$ time **and memory**.

**Cycle detection:** iterate $x\mapsto h(x)$; the sequence is ρ-shaped. Floyd: tortoise one step, hare two, until $x_n=x_{2n}$; then walk from the start and from $x_n$ in lockstep; just before they meet, the two (different) predecessors of the cycle entry collide. Constant memory, $O(2^{\ell/2})$ time; restart if the start lies on the cycle.

**Sponge:** state $r+c$ bits, permutation $\pi$, injective padding. Absorb: XOR each $r$-bit block into the rate part, apply $\pi$. Squeeze: output the rate part, apply $\pi$, repeat. **Capacity** is never output or directly set by inputs; generic security ≈ $2^{c/2}$. The output does not reveal the full state, so one cannot continue hashing from a digest (no length extension).`,
    rubric: R_DESCRIBE,
  },
];

export const macs: Exercise[] = [
  {
    id: 'M.1',
    title: 'MAC security and HMAC',
    tutorial: 6,
    examGroup: 'M',
    topicId: 'l06',
    category: 'describe',
    ref: 'cf. Lecture 06',
    tier: 'core',
    prompt: md`Define a MAC and the existential-forgery game. Explain why $h(k\|m)$ and $h(m\|k)$ are problematic with Merkle–Damgård hashes, and describe HMAC and what its security proof assumes.`,
    solution: md`**MAC** $(S,V)$: $S$ possibly randomized, $V$ deterministic, $V(k,m,S(k,m))=\mathit{true}$.

**EF game:** $k$ random; adversary queries tags of chosen $m_1..m_N$; outputs $(m,t)$ not among the query/answer pairs; wins iff $V(k,m,t)$. ADV = P(win); secure if negligible for efficient adversaries.

**$h(k\|m)$:** length extension gives $h(k\|m\|\mathrm{pad}\|m')$ from $h(k\|m)$ — a forgery after one query. **$h(m\|k)$:** if $h(m)=h(m')$ for block-aligned $m\ne m'$, then $h(m\|k)=h(m'\|k)$ (same internal state before $k$), so any known collision of $h$ becomes a forgery.

**HMAC:** pad $k$ to the block size (hash it first if longer); $k_i=k\oplus$ 0x36…, $k_o=k\oplus$ 0x5c…; $\mathrm{HMAC}(k,m)=h(k_o\|h(k_i\|m))$. Proof assumes the compression function behaves as a PRF (even under related keys) — collision resistance is **not** needed. Deterministic: verify by recomputing.`,
    rubric: R_DESCRIBE,
  },
  {
    id: 'M.2',
    title: 'Encrypting the XOR of the blocks',
    tutorial: 6,
    examGroup: 'M',
    topicId: 'l06',
    category: 'flaw',
    ref: 'cf. Worksheet 6',
    tier: 'core',
    prompt: md`For messages of 128-bit blocks, $S(k,m_1\|\cdots\|m_n)=E(k,\ m_1\oplus m_2\oplus\cdots\oplus m_n)$ with a secure block cipher $E$; $V$ recomputes. Give two different existential forgeries, each using a single signing query.`,
    solution: md`**Forgery 1:** ask for $t=S(k,x\|y)$ with $x\ne y$; output $(y\|x,\ t)$. The XOR of the blocks is the same, so the tag verifies, and $y\|x$ was never queried. Success probability 1.

**Forgery 2:** ask for $t_0=S(k,z)$ for a single block $z$; then $(z\|x\|x,\ t_0)$ is valid for every block $x$, since $x\oplus x=0$.

The tag depends only on the XOR of all blocks, so reordering or inserting equal pairs of blocks keeps it. Fix: chain the blocks (CBC-MAC with prefix-free encoding, i.e. ECBC/CMAC) or use HMAC.`,
    rubric: R_FLAW,
  },
  {
    id: 'M.3',
    title: 'CBC-MAC with a random IV',
    tutorial: 6,
    examGroup: 'M',
    topicId: 'l06',
    category: 'flaw',
    ref: 'cf. Lecture 06',
    tier: 'core',
    prompt: md`To "randomize" CBC-MAC, a designer computes the CBC chain with a fresh random $IV$ and outputs the tag $(IV,y_n)$; verification recomputes the chain with the received $IV$. Messages have a fixed length of $n$ blocks. Show an existential forgery and its success probability.`,
    hints: ['How does the first chain value depend on IV and m₁?'],
    solution: md`The first block enters as $E(k,IV\oplus m_1)$. Query any $m=m_1\|\cdots\|m_n$ and get $(IV,t)$. For any $\Delta\ne0$, output the message $m'=(m_1\oplus\Delta)\|m_2\|\cdots\|m_n$ with tag $(IV\oplus\Delta,t)$: since $(IV\oplus\Delta)\oplus(m_1\oplus\Delta)=IV\oplus m_1$, the whole chain is unchanged and the tag verifies. Success probability 1 even though raw CBC-MAC on fixed-length messages is secure: letting the attacker choose the IV breaks it. CBC-MAC must use a fixed IV (0).`,
    rubric: R_FLAW,
  },
  {
    id: 'M.4',
    title: 'Combining two MACs',
    tutorial: 6,
    examGroup: 'M',
    topicId: 'l06',
    category: 'proof',
    ref: 'cf. Worksheet 6, assignment 1',
    tier: 'core',
    prompt: md`Let $\mathcal{MAC}_1=(S_1,V_1)$ and $\mathcal{MAC}_2=(S_2,V_2)$ be MACs over the same message space with independent keys. Define $S((k_1,k_2),m)=(S_1(k_1,m),S_2(k_2,m))$ and $V$ accepting $(t_1,t_2)$ iff **both** $V_1(k_1,m,t_1)$ and $V_2(k_2,m,t_2)$ accept. Consider forgery games in which the forged **message** must be new (as in the signature game). Prove: if $\mathcal{MAC}_1$ is ε-secure in this sense, the combined MAC is ε-secure — however weak $\mathcal{MAC}_2$ is.`,
    solution: md`Let $A$ forge against the combined MAC. Build $B$ against $\mathcal{MAC}_1$:
1. $B$ samples $k_2$ itself.
2. For every query $m_i$ of $A$, $B$ asks its own challenger for $t_1^i=S_1(k_1,m_i)$, computes $t_2^i=S_2(k_2,m_i)$ and returns $(t_1^i,t_2^i)$.
3. When $A$ outputs $(m,(t_1,t_2))$, $B$ outputs $(m,t_1)$.

*Faithful simulation:* $k_1$ (unknown to $B$) and $k_2$ are independent and uniformly random, so $A$'s view is exactly the combined game.

*Success:* if $A$ wins, $m$ was never queried and $V(\cdot)$ accepts, in particular $V_1(k_1,m,t_1)=\mathit{true}$. Then $B$ outputs a valid tag on a message it never queried: $B$ wins. Hence $\mathrm{ADV}(B)\ge\mathrm{ADV}(A)$, and $B$ is efficient (it adds one $S_2$ evaluation per query). As every efficient $B$ has advantage ≤ ε, so does every efficient $A$. ∎`,
    rubric: R_PROOF,
  },
  {
    id: 'M.6',
    title: 'Raw CBC-MAC, ECBC and CMAC',
    tutorial: 6,
    examGroup: 'M',
    topicId: 'l06',
    category: 'describe',
    ref: 'cf. Lecture 06',
    tier: 'core',
    prompt: md`Describe raw CBC-MAC and the restriction under which it is secure; show the forgery for variable-length messages. Describe ECBC-MAC and its security bound and explain why the bound is essentially tight. What is the idea of prefix-free encoding and how does CMAC use it?`,
    solution: md`**Raw CBC-MAC:** CBC with IV $=0$, tag = last chain block. Secure (for a secure PRP) against **prefix-free** adversaries (no query is a prefix of another), e.g. fixed-length messages. **Forgery:** $t=S(m)$ for one block $m$; then $(m\|(m\oplus t),t)$ is valid.

**ECBC:** pad injectively (extra block if aligned), raw CBC-MAC under $k_1$, then $t=E(k_2,y_n)$. Bound $2\varepsilon+O((Nn)^2/|\mathcal X|)$. **Tight:** a tag collision $S(m)=S(m')$ (aligned) gives $S(m\|x)=S(m'\|x)$, and a birthday search finds collisions after $\approx\sqrt{|\mathcal X|}$ queries.

**Prefix-free encoding:** transform messages so that none is a prefix of another, then raw CBC-MAC is secure. **CMAC** XORs a secret sub-key into the last block — $k_1$ if aligned, $k_2$ (after 10* padding) otherwise — so a tag can never serve as a chaining value, and no extra padding block is needed for aligned messages.`,
    rubric: R_DESCRIBE,
  },
];

export const ae: Exercise[] = [
  {
    id: 'AE.1',
    title: 'Ciphertext integrity, CCA and EtM',
    tutorial: 7,
    examGroup: 'AE',
    topicId: 'l07',
    category: 'describe',
    ref: 'cf. Lecture 07',
    tier: 'core',
    prompt: md`Define AE-enabled ciphers, the ciphertext-integrity game, AE security and the CCA game. State the relation between AE and CCA security. Describe Encrypt-then-MAC and MAC-then-Encrypt and compare their security.`,
    solution: md`**AE-enabled cipher:** $E$ possibly randomized, $D$ may output ⊥, $D(k,E(k,m))=m$.
**CI game:** adversary obtains encryptions of chosen $m_i$, outputs a new ciphertext $c\notin\{c_i\}$, wins iff $D(k,c)\ne\bot$. **AE security:** ε-CPA + δ-CI.
**CCA game:** CPA game plus ciphertext queries $C^j$ (not a previous challenge ciphertext) answered by $D(k,C^j)$; ADV $=|P(\text{win})-\tfrac12|$.
**Relation:** (ε, δ)-AE ⇒ $\mathrm{ADV}_{\mathrm{CCA}}\le\varepsilon+2q\delta$.

**EtM:** $(c,S(k_M,c))$, verify before decrypting. CPA cipher + secure MAC ⇒ AE-secure. **MtE:** $E(k_E,(m,S(k_M,m)))$; not AE in general (decryption/unpadding precedes verification → padding oracles, POODLE); secure in special cases (randomized CTR + one-time MAC). EtM is the sound choice; use independent keys and MAC everything the decryptor uses (IV included).`,
    rubric: R_DESCRIBE,
  },
  {
    id: 'AE.2',
    title: 'Encrypt-and-MAC with HMAC',
    tutorial: 7,
    examGroup: 'AE',
    topicId: 'l07',
    category: 'flaw',
    ref: 'cf. Lecture 07',
    tier: 'core',
    prompt: md`A protocol sends $(E(k_E,m),\ \mathrm{HMAC}(k_M,m))$ with randomized CTR encryption (the ciphertext includes the IV). Show that it is neither CPA-secure nor has ciphertext integrity.`,
    solution: md`**Not CPA-secure.** Round 1: $(m,m)$ → tag $t_1=\mathrm{HMAC}(k_M,m)$. Round 2: $(m,m')$ → tag $t_2$. HMAC is deterministic, so $t_2=t_1$ iff $b=0$ (up to a negligible HMAC collision). Advantage ≈ ½.

**No ciphertext integrity.** Query $m$ and $m'=m\oplus\Delta$ ($\Delta\ne0$), receiving $(IV_1,e_1,t_1)$ and $(IV_2,e_2,t_2)$ with $t_2=\mathrm{HMAC}(k_M,m')$. Output $(IV_1,\ e_1\oplus\Delta,\ t_2)$. It decrypts (CTR is malleable) to $m\oplus\Delta=m'$, whose tag is $t_2$, so it is accepted; and it is a new ciphertext (it differs from the second one unless $IV_1=IV_2$, probability $2^{-128}$). Advantage ≈ 1.

Encrypt-and-MAC binds the tag to the plaintext, not to the ciphertext, and the tag is visible. Encrypt-then-MAC avoids both problems.`,
    rubric: R_FLAW,
  },
  {
    id: 'AE.3',
    title: 'Forgetting to authenticate the IV',
    tutorial: 7,
    examGroup: 'AE',
    topicId: 'l07',
    category: 'flaw',
    ref: 'cf. Lecture 07',
    tier: 'core',
    prompt: md`A system uses randomized CBC and then a MAC on the encrypted blocks only: it sends $(IV,\ y_1\|\cdots\|y_n,\ t=S(k_M,y_1\|\cdots\|y_n))$. Show that ciphertext integrity fails and explain the practical consequence. How does a chosen-ciphertext adversary use this to win the CCA game?`,
    solution: md`**CI forgery:** take any ciphertext $(IV,y,t)$ received from the challenger and output $(IV\oplus\Delta,y,t)$ for $\Delta\ne0$. The tag still verifies (it does not cover the IV), and decryption succeeds with the first block $x_1\oplus\Delta$. Advantage 1.

**Consequence:** the attacker flips **chosen bits** of the first plaintext block (e.g. an amount or a command) undetected.

**CCA:** plaintext query $(m_0,m_1)$ with first blocks differing → $(IV,y,t)$. Ciphertext query $(IV\oplus\Delta,y,t)$ (a different ciphertext, allowed) → $m_b$ with the first block XORed by $\Delta$; undo $\Delta$ and compare with $m_0,m_1$. Advantage ½.

**Fix:** MAC the whole ciphertext including the IV (and associated data).`,
    rubric: R_FLAW,
  },
  {
    id: 'AE.4',
    title: 'Ciphertext integrity of Encrypt-then-MAC',
    tutorial: 7,
    examGroup: 'AE',
    topicId: 'l07',
    category: 'proof',
    ref: 'cf. Lecture 07 (EtM theorem)',
    tier: 'core',
    prompt: md`Let $\mathcal E$ be any cipher and $\mathcal{MAC}$ a δ-secure **deterministic** MAC over the ciphertext space. Prove that the EtM system has δ-ciphertext integrity.`,
    hints: ['Simulate the encryption yourself; use the MAC challenger for tags.'],
    solution: md`Let $A$ play the CI game against EtM. Build a MAC forger $B$: $B$ samples $k_E$ itself. When $A$ asks to encrypt $m_i$, $B$ computes $c_i=E(k_E,m_i)$, queries its MAC challenger for $t_i=S(k_M,c_i)$, and returns $(c_i,t_i)$. When $A$ outputs $(c,t)\notin\{(c_i,t_i)\}$, $B$ outputs $(c,t)$.

*Faithful:* keys are independent, so $A$'s view is exactly the CI game.

*Success:* $A$ wins iff $D_{EtM}((k_E,k_M),(c,t))\ne\bot$, which requires $V(k_M,c,t)=\mathit{true}$. As $(c,t)$ is not among the pairs $B$ obtained, it is an existential forgery. Hence $\mathrm{ADV}_{\mathrm{CI}}(A)\le\mathrm{ADV}_{\mathrm{EF}}(B)\le\delta$; $B$ is efficient (one encryption per query). ∎ (Determinism is not even needed: the EF game already counts new pairs with old messages.)`,
    rubric: R_PROOF,
  },
  {
    id: 'AE.5',
    title: 'Bit flipping against CTR in the CCA game',
    tutorial: 7,
    examGroup: 'AE',
    topicId: 'l07',
    category: 'flaw',
    ref: 'cf. Lecture 07',
    tier: 'core',
    prompt: md`Show that randomized CTR mode (with a secure block cipher) is not CCA-secure: give an adversary with one plaintext and one ciphertext query and its advantage. Would MAC-then-Encrypt with randomized CTR and a secure MAC stop your adversary?`,
    solution: md`Plaintext query $(0^n,1^n)$ (one block) → $(IV,e)$ with $e=m_b\oplus E(k,IV)$. Ciphertext query $(IV,e\oplus0^{n-1}1)$ — differs from the challenge, so allowed — returns $M=m_b\oplus0^{n-1}1$. Output 0 iff $M\oplus0^{n-1}1=0^n$. Always correct: advantage ½ (CTR is malleable).

With **MtE** (randomized CTR over $m\|t$): flipping a ciphertext bit flips a bit of $m$ (or of $t$); the receiver decrypts and checks $V(k_M,m',t)$ — which fails unless the attacker can forge, so the query returns ⊥ and the adversary learns nothing. Indeed the lecture's theorem says MtE with randomized CTR (and even a one-time secure MAC) is AE-secure. The trouble with MtE appears with CBC and padding.`,
    rubric: R_FLAW,
  },
];
