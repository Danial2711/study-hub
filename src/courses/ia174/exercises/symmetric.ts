/**
 * Original exam-style problems for IA174 (S1–S3). They follow the topics and the four
 * exam question types; `ref` points to related official material, whose text is not reproduced.
 */
import type { Exercise } from '../../../platform/types';

const md = String.raw;

const R_DESCRIBE = ['Correct definitions / setting', 'Precise description of the algorithm or game', 'Key properties or theorem stated correctly', 'Intuition / why it works or fails', 'Clear, structured answer'];
const R_FLAW = ['Identifies the flaw', 'Describes a concrete adversary (what it sends / computes / outputs)', 'Computes its success probability or advantage', 'Explains why the advantage is non-negligible', 'Optional fix or remark'];
const R_PROOF = ['Correct direction (contraposition) and goal stated', 'Construction of the reduction adversary', 'Shows the simulated game is faithful in both cases', 'Computes the advantage relation', 'Efficiency of the reduction argued'];

export const s1: Exercise[] = [
  {
    id: 'S1.1',
    title: 'Two definitions of perfect security',
    tutorial: 1,
    examGroup: 'S1',
    topicId: 'l01',
    category: 'describe',
    ref: 'cf. Lecture 01',
    tier: 'core',
    prompt: md`Define what a symmetric cipher is and give both definitions of perfect security from the lecture (Shannon's and the attack game). State how they are related. Why does the attack game require $|m_0|=|m_1|$, and why is the adversary in this game not required to be efficient?`,
    hints: ['Shannon: compare the number of keys mapping each message to a given ciphertext.', 'The ciphertext length usually reveals the message length.'],
    solution: md`**Cipher** over finite $(\mathcal K,\mathcal M,\mathcal C)$: efficient $E:\mathcal K\times\mathcal M\to\mathcal C$, $D:\mathcal K\times\mathcal C\to\mathcal M$ with $D(k,E(k,m))=m$ for all $k,m$.

**Shannon:** for uniform $k$ and $K(m,c)=\{k\mid E(k,m)=c\}$, the cipher is perfectly secure iff $P(K(m,c))=P(K(m',c))$ for all $m,m'\in\mathcal M$, $c\in\mathcal C$ — the ciphertext distribution does not depend on the message.

**Attack game:** challenger samples $k$ and $b$; adversary sends $m_0,m_1$ of the same length; gets $c=E(k,m_b)$; outputs $g$; wins iff $g=b$. Perfectly secure iff **every** adversary wins with probability ≤ ½.

**Relation:** the two definitions are equivalent (theorem from the lecture).

**Equal lengths:** most ciphers reveal the message length; without the restriction every such cipher would be "insecure" for a trivial reason we choose to ignore.

**No efficiency restriction:** perfect security is information-theoretic — it holds even against unbounded adversaries, which is why it needs $|\mathcal K|\ge|\mathcal M|$. Computational notions (semantic security) restrict to efficient adversaries and allow negligible advantage.`,
    rubric: R_DESCRIBE,
  },
  {
    id: 'S1.2',
    title: 'A pad with a shifted key',
    tutorial: 1,
    examGroup: 'S1',
    topicId: 'l01',
    category: 'flaw',
    ref: 'cf. Worksheet 1, assignment 1',
    tier: 'core',
    prompt: md`Let $\mathcal K=\mathcal M=\mathcal C=\{0,1\}^n$ and $E(k,m)=m\oplus\mathrm{SHIFTL}(k,1)$ (the key is shifted left by one position, a zero enters from the right).
a. Give the decryption algorithm.
b. Is the cipher perfectly secure? If not, describe an adversary in the perfect-security attack game and compute its winning probability.`,
    hints: ['What is the last bit of SHIFTL(k, 1)?'],
    solution: md`a. $D(k,c)=c\oplus\mathrm{SHIFTL}(k,1)$; correct because XOR with the same pad twice cancels.

b. Not perfectly secure. The last bit of $\mathrm{SHIFTL}(k,1)$ is always 0, so the **last bit of $c$ equals the last bit of $m$**.
*Shannon view:* for $c$ ending in 0 and $m'$ ending in 1, $K(m',c)=\emptyset$ while $K(m,c)\ne\emptyset$ for $m$ ending in 0.
*Adversary:* send $m_0=0^n$, $m_1=0^{n-1}1$; output the last bit of $c$. It always outputs $b$: winning probability 1 (advantage ½).

(The cipher effectively uses only $n-1$ key bits, consistent with Shannon's theorem: $2^{n-1}$ distinct pads $<2^n$ messages.)`,
    rubric: R_FLAW,
  },
  {
    id: 'S1.3',
    title: 'Perfect secrecy with minimal key space',
    tutorial: 1,
    examGroup: 'S1',
    topicId: 'l01',
    category: 'proof',
    ref: 'cf. Worksheet 2, assignment 1',
    tier: 'extra',
    prompt: md`Let $(E,D)$ be a perfectly secure cipher with $|\mathcal K|=|\mathcal M|=|\mathcal C|$. Prove that for every $m\in\mathcal M$ and $c\in\mathcal C$ there is **exactly one** key $k$ with $E(k,m)=c$. (So such a cipher is "an OTP in disguise".)`,
    hints: ['For a fixed c, can one key belong to K(m, c) and K(m′, c) for m ≠ m′?', 'Count the pairs (k, m) over all ciphertexts.'],
    solution: md`Fix $c$. By perfect secrecy all $K(m,c)$ have the same size $s_c$.

*Disjointness:* if $k\in K(m,c)\cap K(m',c)$ then $m=D(k,c)=m'$. So the sets $K(m,c)$, $m\in\mathcal M$, are pairwise disjoint subsets of $\mathcal K$, hence $s_c|\mathcal M|\le|\mathcal K|=|\mathcal M|$, i.e. $s_c\le1$.

*Counting:* every pair $(k,m)$ lands in exactly one $K(m,E(k,m))$, so $\sum_c\sum_m|K(m,c)|=|\mathcal K||\mathcal M|$, i.e. $\sum_c s_c|\mathcal M|=|\mathcal K||\mathcal M|$ and $\sum_c s_c=|\mathcal K|=|\mathcal C|$.

With $|\mathcal C|$ terms, each ≤ 1, summing to $|\mathcal C|$, all $s_c=1$: exactly one key for every $(m,c)$. ∎`,
    rubric: ['Uses perfect secrecy: |K(m, c)| independent of m', 'Shows disjointness via correctness', 'Derives s_c ≤ 1', 'Counting argument gives Σ s_c = |C|', 'Concludes s_c = 1 for all c'],
  },
  {
    id: 'S1.4',
    title: 'From a distinguishing ciphertext to an adversary',
    tutorial: 1,
    examGroup: 'S1',
    topicId: 'l01',
    category: 'proof',
    ref: 'cf. Worksheet 1, assignment 2',
    tier: 'core',
    prompt: md`Suppose a cipher is **not** perfectly secure in Shannon's sense, i.e. there are $m_0,m_1,c^*$ with $p_0=P(K(m_0,c^*))>P(K(m_1,c^*))=p_1$. Construct an adversary for the perfect-security attack game and compute its exact winning probability in terms of $p_0,p_1$. Conclude one direction of the equivalence theorem.`,
    hints: ['React specially only when you receive exactly c*.'],
    solution: md`**Adversary $A$:** send $(m_0,m_1)$. On receiving $c$: if $c=c^*$ output 0, otherwise output a uniformly random bit.

**Analysis.** $P(c=c^*\mid b=0)=p_0$ and $P(c=c^*\mid b=1)=p_1$.
$$P(\text{win}\mid b=0)=p_0+\tfrac12(1-p_0)=\tfrac12+\tfrac{p_0}2,\qquad P(\text{win}\mid b=1)=\tfrac12(1-p_1)=\tfrac12-\tfrac{p_1}2.$$
By total probability, $P(\text{win})=\tfrac12\bigl(\tfrac12+\tfrac{p_0}2\bigr)+\tfrac12\bigl(\tfrac12-\tfrac{p_1}2\bigr)=\tfrac12+\tfrac{p_0-p_1}4>\tfrac12.$

So "not Shannon-secure ⇒ not game-secure", which by contraposition is "game-secure ⇒ Shannon-secure". ∎`,
    rubric: ['Adversary chooses m₀, m₁ from the violating triple', 'Decision rule based on c = c*', 'Conditional winning probabilities correct', 'Total probability combined correctly', 'Conclusion: one direction of equivalence'],
  },
  {
    id: 'S1.5',
    title: 'A reused letter pad',
    tutorial: 1,
    examGroup: 'S1',
    topicId: 'l01',
    category: 'flaw',
    ref: 'cf. Lecture 01',
    tier: 'core',
    prompt: md`Letters are numbers in $\mathbb Z_{26}$ (a = 0, …, z = 25). A "letter OTP" encrypts $m=m_1\dots m_\ell$ with a random key $k_1\dots k_\ell$ as $c_i=m_i+k_i\bmod26$.
a. Is it perfectly secure for one message of length $\ell$?
b. The operator encrypted *two* 5-letter messages with the same key: $c=\texttt{HBDXR}$ and $c'=\texttt{WLJXG}$. You learn that the first message is "hello". Recover the second message and explain why this works in general.`,
    hints: ['k_i = c_i − m_i.'],
    solution: md`a. Yes: for every $m,c$ exactly one key ($k_i=c_i-m_i$) maps $m$ to $c$.

b. The key cancels: $c_i-c'_i=m_i-m'_i$, so a known (or guessed) $m$ gives $m'_i=c'_i-c_i+m_i$. Here: H=7, B=1, D=3, X=23, R=17 and h=7, e=4, l=11, l=11, o=14 give $k=(0,23,18,12,3)$. Then $m'=c'-k$: W(22)−0=22 → **w**, L(11)−23=−12 → 14 → **o**, J(9)−18=−9 → 17 → **r**, X(23)−12=11 → **l**, G(6)−3=3 → **d**. So $m'=$ "world".

In general a reused pad leaks $m-m'$; with natural-language messages one guesses probable words ("cribs") and checks whether the other message becomes readable.`,
    rubric: ['Perfect secrecy argument for one message', 'Observes key cancellation c − c′ = m − m′', 'Correct computation of the key', 'Correct recovery of m′', 'General explanation / crib dragging'],
  },
  {
    id: 'S1.6',
    title: 'The one-time pad',
    tutorial: 1,
    examGroup: 'S1',
    topicId: 'l01',
    category: 'describe',
    ref: 'cf. Lecture 01',
    tier: 'core',
    prompt: md`Describe the one-time pad, prove that it is perfectly secure, and state Shannon's theorem about key length with a proof sketch. Name two weaknesses of the OTP that all stream ciphers share.`,
    solution: md`**OTP:** $\mathcal K=\mathcal M=\mathcal C=\{0,1\}^\ell$, $E(k,m)=m\oplus k$, $D(k,c)=c\oplus k$.

**Perfect secrecy:** for any $m,c$, $E(k,m)=c\iff k=m\oplus c$, so $|K(m,c)|=1$ for all pairs and $P(K(m,c))=2^{-\ell}$ independently of $m$.

**Shannon:** perfect security ⇒ $|\mathcal K|\ge|\mathcal M|$. Sketch: fix $c=E(k_0,m_0)$; the messages that can encrypt to $c$ are among $\{D(k,c)\mid k\in\mathcal K\}$, at most $|\mathcal K|$. If $|\mathcal K|<|\mathcal M|$ some $m'$ never encrypts to $c$: $P(K(m',c))=0<P(K(m_0,c))$.

**Weaknesses:** (1) **malleability** — flipping a ciphertext bit flips the plaintext bit, no integrity; (2) **key reuse** — $c_1\oplus c_2=m_1\oplus m_2$ (two-time pad). Plus the practical problem that the key is as long as the message.`,
    rubric: R_DESCRIBE,
  },
];

export const s2: Exercise[] = [
  {
    id: 'S2.1',
    title: 'Semantic security and negligibility',
    tutorial: 2,
    examGroup: 'S2',
    topicId: 'l02',
    category: 'describe',
    ref: 'cf. Lecture 02',
    tier: 'core',
    prompt: md`Describe the semantic-security attack game and the definition of an ε-semantically secure and a semantically secure cipher. Define efficient adversaries and negligible functions (both the scalar and the functional view) and explain why the two functional notions fit together. Why is the advantage defined with an absolute value?`,
    solution: md`**Game:** challenger samples $k\leftarrow\mathcal K$, $b\leftarrow\{0,1\}$; adversary (an interactive randomized algorithm) sends $m_0,m_1$ of equal length; receives $c=E(k,m_b)$; outputs $g$; wins iff $g=b$.

$\mathrm{ADV}_{\mathrm{Sem}}(\mathcal E,A)=|P(A\text{ wins})-\tfrac12|$. **ε-semantically secure:** $\mathrm{ADV}\le\varepsilon$ for every **efficient** $A$; **semantically secure:** for negligible ε.

**Efficient:** practically fast / formally polynomial time in the security parameter. **Negligible:** practically tiny (≤ $2^{-128}$) / formally $\varepsilon(n)<1/p(n)$ for every polynomial $p$ from some $n_0$ on.

**Fit:** a polynomial number of repetitions of an attack with negligible success still has negligible success (poly × negl = negl), so efficient adversaries cannot amplify.

**Absolute value:** an adversary that wins with probability $\tfrac12-\delta$ can be turned into one winning with $\tfrac12+\delta$ by flipping its output; both reveal information.`,
    rubric: R_DESCRIBE,
  },
  {
    id: 'S2.2',
    title: 'A generator that repeats its seed',
    tutorial: 2,
    examGroup: 'S2',
    topicId: 'l02',
    category: 'flaw',
    ref: 'cf. Worksheet 2, assignment 2',
    tier: 'core',
    prompt: md`Let $G:\{0,1\}^{128}\to\{0,1\}^{256}$, $G(s)=s\,\|\,(s\oplus c)$ for a fixed public constant $c$. Show that $G$ is not a secure PRG: describe an adversary in the PRG game and compute its advantage. Then show how to break the stream cipher $\mathcal E_G$ in the semantic-security game.`,
    hints: ['XOR the two halves.'],
    solution: md`**PRG adversary:** on input $r=r_1\|r_2$ (two 128-bit halves) output *fake* iff $r_1\oplus r_2=c$.
- fake: $r_1\oplus r_2=s\oplus s\oplus c=c$ always → correct;
- rand: holds with probability $2^{-128}$ → correct with probability $1-2^{-128}$.

$P(\text{win})=\tfrac12+\tfrac12(1-2^{-128})$, advantage $\tfrac12-2^{-129}\approx\tfrac12$.

**Semantic adversary on $\mathcal E_G$:** send $m_0=0^{256}$ and $m_1=0^{128}\|1^{128}$. For $b=0$ the ciphertext is $G(k)$, whose halves XOR to $c$. For $b=1$ the second half is complemented, so the halves XOR to $\bar c$. Output 0 iff the halves XOR to $c$: the adversary always wins, advantage ½. (Note that $m_1=1^{256}$ would not work: complementing **both** halves leaves their XOR unchanged.)`,
    rubric: R_FLAW,
  },
  {
    id: 'S2.3',
    title: 'Keystream reuse with a known header',
    tutorial: 2,
    examGroup: 'S2',
    topicId: 'l02',
    category: 'hw',
    ref: 'cf. Lectures 01–02 (key reuse)',
    tier: 'core',
    prompt: md`A device encrypts every message with ChaCha20 under the same key **and the same nonce** (a firmware bug). You capture ciphertexts $c_1,c_2,\dots$ of messages that all start with the same 24-byte header, e.g. "POST /api/v1/measure 1.1", followed by secret JSON data.
a. What exactly can you recover from one ciphertext? From many?
b. Explain why the stream cipher's semantic security theorem does not help here.
c. How should the system be fixed?`,
    hints: ['XOR the known plaintext into the ciphertext.', 'Every ciphertext uses the same keystream z.'],
    solution: md`a. All messages are $c_i=m_i\oplus z$ with the **same** keystream $z$. From one ciphertext and the known header, $z[..24]=c_1[..24]\oplus\text{header}$ — the first 24 keystream bytes. Since every message uses the same $z$, these bytes decrypt the header part of all messages (useless) — but **any** known or guessed plaintext anywhere gives the keystream at that position, which decrypts that position in **every other** ciphertext. With many messages: $c_i\oplus c_j=m_i\oplus m_j$; statistics over many ciphertexts (frequent JSON keys, digits, quotes) reveal the keystream byte by byte, and then everything.

b. The theorem is about **one** message per key (semantic security); a stream cipher is deterministic, so encrypting several messages under one key/nonce is exactly the two-time pad, and it is not CPA-secure.

c. Use a fresh nonce for every message under a key (a counter suffices for ChaCha/CTR: nonces must be unique, not secret), or derive per-message keys; better, use an AEAD (ChaCha20-Poly1305) and never repeat (key, nonce).`,
    rubric: ['Identifies identical keystream for all messages', 'Recovers keystream from known plaintext', 'Explains decrypting other ciphertexts / XOR of messages', 'Explains why semantic security does not apply (single message, deterministic)', 'Correct fix (unique nonces / AEAD)'],
  },
  {
    id: 'S2.4',
    title: 'Complementing a secure PRG',
    tutorial: 2,
    examGroup: 'S2',
    topicId: 'l02',
    category: 'proof',
    ref: 'cf. Worksheet 2, assignment 4',
    tier: 'core',
    prompt: md`Let $G:\{0,1\}^\ell\to\{0,1\}^L$ be an ε-secure PRG and $G'(s)=\overline{G(s)}$ (bitwise complement). Prove by a security reduction that $G'$ is ε-secure.`,
    hints: ['Given r from your challenger, what do you give to the adversary against G′?'],
    solution: md`Contraposition: let $A'$ be an efficient PRG adversary against $G'$ with advantage $\delta$. Build $A$ against $G$:

1. $A$ receives $r$ from its challenger;
2. gives $\bar r$ to $A'$;
3. outputs whatever $A'$ outputs.

*Faithful simulation:* if $r=G(s)$ for uniform $s$, then $\bar r=G'(s)$ — exactly the *fake* case of $A'$'s game. If $r$ is uniform in $\{0,1\}^L$, then $\bar r$ is uniform too (complement is a bijection) — the *rand* case. So $A'$ sees a perfectly simulated game with the same hidden bit, and $A$ wins iff $A'$ wins: $\mathrm{ADV}_{\mathrm{PRG}}(G,A)=\mathrm{ADV}_{\mathrm{PRG}}(G',A')=\delta$.

$A$ is efficient (one complement plus $A'$). If $G$ is ε-secure, $\delta\le\varepsilon$ for every efficient $A'$, so $G'$ is ε-secure. ∎`,
    rubric: R_PROOF,
  },
  {
    id: 'S2.5',
    title: 'Truncating a PRG',
    tutorial: 2,
    examGroup: 'S2',
    topicId: 'l02',
    category: 'proof',
    ref: 'cf. Worksheet 2',
    tier: 'extra',
    prompt: md`Let $G:\{0,1\}^\ell\to\{0,1\}^L$ be ε-secure and $L'<L$. Prove that $G_{tr}(s)=G(s)[..L']$ is ε-secure. Does the converse hold — if $G_{tr}$ is secure, must $G$ be?`,
    solution: md`**Reduction.** From an adversary $A'$ against $G_{tr}$ build $A$ against $G$: on input $r\in\{0,1\}^L$, run $A'$ on $r[..L']$ and copy its answer.
- fake: $r[..L']=G(s)[..L']=G_{tr}(s)$;
- rand: a prefix of a uniform string is uniform on $\{0,1\}^{L'}$.

The simulation is perfect, so $A$ has the same advantage as $A'$; $A$ is efficient. Hence $G_{tr}$ is ε-secure.

**Converse: no.** Take a secure $G_{tr}$ and append a bad bit: $G(s)=G_{tr}(s)\,\|\,0$. Its truncation is secure, but $G$ is broken by "say *fake* iff the last bit is 0" (advantage ¼).`,
    rubric: R_PROOF,
  },
  {
    id: 'S2.6',
    title: 'ChaCha as a PRG',
    tutorial: 2,
    examGroup: 'S2',
    topicId: 'l02',
    category: 'describe',
    ref: 'cf. Lecture 02',
    tier: 'core',
    prompt: md`Describe how ChaCha produces its keystream: inputs, the block function, the layout of the initial state, the round structure and the quarter round (operations only, no constants). Explain (a) why ChaCha is a stream cipher whose core behaves like a block cipher, (b) why the final word-wise addition is essential, (c) what nothing-up-my-sleeve constants are.`,
    solution: md`**Interface:** 256-bit key (seed), nonce, block counter $i$; keystream $b_0\|b_1\|\cdots$ of 512-bit blocks with $b_i=B(i,s,n)$, computed independently (parallel, random access).

**Block function:** pad $(i,s,n)$ into a $4\times4$ matrix of 32-bit words — row 1 constants ("expand 32-byte k"), rows 2–3 key, row 4 counter and nonce; permute it with 20 rounds alternating column and diagonal rounds, each made of four quarter rounds; add the input word-wise mod $2^{32}$.

**Quarter round:** ARX steps — $a\mathrel{+}=b$, $d\mathrel{\oplus}=a$, $d\lll16$; $c\mathrel{+}=d$, $b\mathrel{\oplus}=c$, $b\lll12$; then the same with rotations 8 and 7.

(a) The keystream is produced block-wise from a counter: the block function is like a keyed permutation in counter mode.
(b) The permutation is publicly invertible; without the addition an output block could be inverted to the initial state, which contains the key. With it, inversion needs the input.
(c) Constants chosen transparently (an ASCII string) so the designer cannot hide a weakness; they also break symmetries (e.g. of an all-zero input).`,
    rubric: R_DESCRIBE,
  },
];

export const s3: Exercise[] = [
  {
    id: 'S3.1',
    title: 'Block ciphers, PRP game and ECB',
    tutorial: 3,
    examGroup: 'S3',
    topicId: 'l03',
    category: 'describe',
    ref: 'cf. Lecture 03',
    tier: 'core',
    prompt: md`Define a block cipher (PRP), the PRP attack game and a secure PRP. Explain why a block cipher should not be viewed as "a cipher". Describe ECB mode and prove that it is not semantically secure.`,
    solution: md`**PRP:** $E,D:\mathcal K\times\mathcal X\to\mathcal X$, each $E(k,\cdot)$ a permutation with inverse $D(k,\cdot)$.

**PRP game:** challenger picks $i\in\{\mathit{rand},\mathit{fake}\}$; rand: uniform $f\in\Pi(\mathcal X)$; fake: $f=E(k,\cdot)$ for uniform $k$. The adversary picks $N$, adaptively queries $x_j$, receives $f(x_j)$, guesses $i$. $\mathrm{ADV}=|P(\text{win})-\tfrac12|$; secure if negligible for all efficient adversaries.

**Not a cipher:** it handles one short block and is a primitive; a cipher for long messages needs a **mode** (as PRG → stream cipher), and security is about the mode.

**ECB:** pad, split into blocks, encrypt each block independently. **Attack:** $m_0=X\|X$, $m_1=X\|Y$ ($X\ne Y$); output 0 iff the two ciphertext blocks are equal. Since $E(k,\cdot)$ is a permutation, equal blocks ⇔ $b=0$: win probability 1, advantage ½.`,
    rubric: R_DESCRIBE,
  },
  {
    id: 'S3.2',
    title: 'XOR-then-rotate block cipher',
    tutorial: 3,
    examGroup: 'S3',
    topicId: 'l03',
    category: 'flaw',
    ref: 'cf. Worksheet 3, assignment 2',
    tier: 'core',
    prompt: md`$\mathcal K=\mathcal X=\{0,1\}^{128}$, $E(k,x)=\mathrm{ROTL}(x\oplus k,\,3)$.
a. Give $D$.
b. Show that $E$ is not a secure PRP with **two** queries; compute the advantage.
c. Show how a **single** query recovers the key in the *fake* world, and how to turn that into a distinguisher.`,
    hints: ['ROTL distributes over XOR.'],
    solution: md`a. $D(k,y)=\mathrm{ROTR}(y,3)\oplus k$.

b. $E(k,x_1)\oplus E(k,x_2)=\mathrm{ROTL}(x_1\oplus x_2,3)$ — independent of $k$. Query two distinct blocks $x_1,x_2$ (e.g. $0^{128}$ and $0^{127}1$); say *fake* iff $y_1\oplus y_2=\mathrm{ROTL}(x_1\oplus x_2,3)$. Fake: always; rand: with probability $1/(2^{128}-1)$. Advantage $\approx\tfrac12$.

c. Query $x=0$: $y=\mathrm{ROTL}(k,3)$, so $k=\mathrm{ROTR}(y,3)$. Distinguisher with two queries: compute the candidate key from $y_1=f(0)$, predict $f(x_2)=\mathrm{ROTL}(x_2\oplus k,3)$ for some $x_2\ne0$, say *fake* iff the prediction is right. Same advantage ≈ ½.`,
    rubric: R_FLAW,
  },
  {
    id: 'S3.3',
    title: 'A block cipher that preserves parity',
    tutorial: 3,
    examGroup: 'S3',
    topicId: 'l03',
    category: 'flaw',
    ref: 'cf. Worksheet 3, assignment 3',
    tier: 'core',
    prompt: md`A block cipher $E$ on 128-bit blocks has the property that for all $k,x$ the parity (XOR of all bits) of $E(k,x)$ equals the parity of $x$. Show that $E$ is not a secure PRP: give an adversary and its exact advantage.`,
    solution: md`Query any single $x$ (say $0^{128}$, parity 0). Output *fake* iff $f(x)$ has parity equal to that of $x$.
- fake: always correct.
- rand: $f(x)$ is uniform over all blocks, parity matches with probability exactly ½ (half of all 128-bit strings have each parity) → correct w.p. ½.

$P(\text{win})=\tfrac12+\tfrac14=\tfrac34$, advantage $\tfrac14$ — non-negligible. (With more queries, e.g. say *fake* iff all $N$ answers preserve parity, the advantage approaches ½.)`,
    rubric: R_FLAW,
  },
  {
    id: 'S3.4',
    title: 'Whitening with public constants',
    tutorial: 3,
    examGroup: 'S3',
    topicId: 'l03',
    category: 'proof',
    ref: 'cf. Worksheet 3',
    tier: 'core',
    prompt: md`Let $E$ be an ε-secure PRP over $(\mathcal K,\{0,1\}^n)$ and $a,d\in\{0,1\}^n$ public constants. Prove that $E'(k,x)=E(k,x\oplus a)\oplus d$ is an ε-secure PRP.`,
    hints: ['If f is a uniformly random permutation, what is x ↦ f(x ⊕ a) ⊕ d?'],
    solution: md`From an adversary $A'$ against $E'$ build $A$ against $E$: whenever $A'$ queries $x$, $A$ queries $x\oplus a$ to its own challenger, receives $y$ and returns $y\oplus d$ to $A'$; finally $A$ copies $A'$'s guess.

*fake:* $A'$ receives $E(k,x\oplus a)\oplus d=E'(k,x)$ — its real fake world.
*rand:* $A'$ receives $f(x\oplus a)\oplus d$ for a uniform permutation $f$. The map $\phi(f)=(x\mapsto f(x\oplus a)\oplus d)$ is a bijection on $\Pi(\{0,1\}^n)$ (its inverse undoes the XORs), so $\phi(f)$ is again a uniform random permutation — exactly $A'$'s rand world. Adaptivity is preserved since $A$ forwards queries one at a time.

Thus $A$ wins iff $A'$ wins: equal advantages, and $A$ is efficient. So $\mathrm{ADV}(E',A')\le\varepsilon$ for all efficient $A'$. ∎`,
    rubric: R_PROOF,
  },
  {
    id: 'S3.5',
    title: 'AES and GF(2⁸)',
    tutorial: 3,
    examGroup: 'S3',
    topicId: 'l03',
    category: 'describe',
    ref: 'cf. Worksheet 4, assignment 1',
    tier: 'core',
    prompt: md`Describe the high-level structure of AES (versions, block size, rounds, the four round operations and their purpose, how the key is mixed in). Explain how bytes are added and multiplied in GF(2⁸), and compute $\texttt{2A}\bullet\texttt{03}$. Why must one of the round operations be non-linear?`,
    solution: md`**AES:** AES-128/192/256 (key sizes), 128-bit block, 10/12/14 rounds. State = $4\times4$ bytes. Key schedule → round keys. Initial AddRoundKey, then rounds of **SubBytes** (S-box: non-linear byte permutation → confusion), **ShiftRows** (row $r$ rotated by $r$ → spreads bytes across columns), **MixColumns** (GF(2⁸) matrix per column → diffusion; omitted in the last round), **AddRoundKey** (XOR round key — the only key mixing). All steps invertible → decryption.

**GF(2⁸):** byte = polynomial over $\mathbb Z_2$; addition = XOR; multiplication = polynomial product mod $x^8+x^4+x^3+x+1$.

$\texttt{2A}\bullet\texttt{03}=\texttt{2A}\bullet(\texttt{02}\oplus\texttt{01})$. $\texttt{2A}=0010\,1010$, times 2 = shift = $0101\,0100=\texttt{54}$ (no overflow). $\texttt{54}\oplus\texttt{2A}=\texttt{7E}$.

**Non-linearity:** ShiftRows, MixColumns and AddRoundKey are linear/affine over GF(2); with a linear S-box the whole cipher would be affine in plaintext and key, and a few known pairs would give the key by Gaussian elimination.`,
    rubric: ['Versions / block size / rounds correct', 'Four operations and their roles', 'Key mixing explained', 'GF(2⁸) arithmetic explained and 0x7E computed', 'Necessity of non-linearity'],
  },
];
