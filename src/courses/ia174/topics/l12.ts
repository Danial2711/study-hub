import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l12: Topic = {
  id: 'l12',
  lecture: 13,
  tag: 'L12',
  examGroup: 'ZK',
  title: 'Interactive proofs and zero knowledge',
  summary: md`The authentication problem and challenge–response protocols, interactive proof systems with soundness and completeness, honest-verifier and perfect zero knowledge via simulators, the Fiat–Shamir identification protocol, Schnorr's protocol, Σ-protocols and the Fiat–Shamir trick that turns them into signatures.`,
  sections: [
    {
      id: 'auth',
      title: 'Authentication and challenge–response',
      kind: 'concept',
      importance: 'context',
      body: md`Peggy wants to prove her identity to Victor. Sending a password lets Victor (or an eavesdropper) impersonate her later. **Challenge–response:** Victor sends a fresh random nonce $r$; Peggy answers with something only the key holder can compute, e.g. with a shared key $x=E(k,r\|r')$, and Victor checks that $r$ is a prefix of $D(k,x)$. Freshness defeats replay. With public keys we would like Peggy to prove she knows $k_s$ **without revealing anything about it** — even to Victor.`,
    },
    {
      id: 'ips',
      title: 'Interactive proof systems',
      kind: 'definition',
      importance: 'must',
      body: md`An **interactive proof system (IPS)** $I$ is a protocol between a **prover** and a **verifier**, including the private computations each should perform; at the end the verifier outputs *accept* or *reject*. $I[P,V](w)$ denotes a run with concrete (randomized) algorithms $P,V$ on common input $w$; the parties may deviate from the protocol (**dishonesty**).

In crypto the input is the prover's **public key** $k_p$, and the verifier checks that the prover knows the matching secret key. For a fixed $p<\tfrac12$ we require:
- **Soundness:** there is a *capable verifier* $V_c$ such that for every prover $P$ that does **not** know the secret key, $I[P,V_c](k_p)=\mathit{reject}$ with probability $\ge1-p$.
- **Completeness:** there is an *honest prover* $P_h$ (knowing the key) with $I[P_h,V_c](k_p)=\mathit{accept}$ with probability $\ge1-p$.

Repeating a protocol $t$ times drives a cheater's success from $p$ to $p^t$.`,
    },
    {
      id: 'zk',
      title: 'Zero knowledge: simulators',
      kind: 'definition',
      importance: 'must',
      body: md`Idea: the interaction must not leak any (efficiently extractable) information about the secret key beyond what follows from the public key. Formalised by a **simulator**: if transcripts can be produced *without* the secret, seeing them cannot teach anything.

**Honest-verifier zero knowledge (HVZK).** An IPS with honest prover $P$ and honest verifier $V_h$ is HVZK if there is a randomized **polynomial-time** algorithm $\mathrm{Sim}$ such that
- on input $k_p$, $\mathrm{Sim}$ outputs a string that can be read as a transcript of $I$, and
- for every $k_p$ the distribution of $\mathrm{Sim}(k_p)$ is **identical** to the distribution of real transcripts of $I[P,V_h](k_p)$.

**Perfect zero knowledge (pZK).** The same, but for **every** verifier $V$ (also cheating ones) there is a simulator $\mathrm{Sim}$ (which may use $V$ as a black box) whose output distribution equals that of real transcripts of $I[P,V](k_p)$.

Proving the ZK property = **constructing the simulator**: typically choose the response first and compute a commitment that fits it.`,
    },
    {
      id: 'fiat-shamir',
      title: 'The Fiat–Shamir identification protocol',
      kind: 'definition',
      importance: 'must',
      body: md`Based on the hardness of computing **square roots modulo $N=pq$** with secret factorisation (as hard as factoring). $N$ is produced by a trusted party. Secret key $k_s\in\mathbb Z_N^\times$, public key $k_p=k_s^2\bmod N$.

One round:
1. Prover picks random $r\in\mathbb Z_N^\times$, sends $y=r^2\bmod N$ (commitment).
2. Verifier sends a random bit $c\in\{0,1\}$ (challenge).
3. Prover sends $z=r\cdot k_s^c\bmod N$ (response).
4. Verifier checks $z^2\equiv y\cdot k_p^c\pmod N$; reject if not.

Repeat $t$ times; accept if all rounds pass.

- **Completeness:** $z^2=r^2k_s^{2c}=y\,k_p^c$.
- **Soundness:** a prover who could answer **both** $c=0$ ($z_0=r$) and $c=1$ ($z_1=rk_s$) for the same $y$ would know $k_s=z_1/z_0$, i.e. a square root of $k_p$. A cheater can prepare for one challenge only: success $\tfrac12$ per round, $2^{-t}$ overall.
- **Zero knowledge (simulator):** pick random $z\in\mathbb Z_N^\times$ and bit $c$; set $y=z^2$ if $c=0$ and $y=z^2k_p^{-1}$ if $c=1$; with access to the verifier $V$, check whether $V$ outputs exactly $c$ on commitment $y$ — if yes, output $(y,c,z)$, otherwise **retry** (rewind). Expected 2 tries per round.`,
      formulas: [
        {
          id: 'fs-check',
          name: 'Fiat–Shamir identification check',
          tex: md`y=r^2,\quad z=r\,k_s^{\,c},\quad z^2\equiv y\,k_p^{\,c}\pmod N,\qquad k_p=k_s^2`,
          intuition: 'For c = 0 the prover shows it knows a root of y; for c = 1 a root of y·k_p. Both together would reveal a root of k_p.',
        },
      ],
    },
    {
      id: 'schnorr-protocol',
      title: "Schnorr's protocol",
      kind: 'definition',
      importance: 'must',
      body: md`Based on discrete log. Public parameters: group $G$, generator $b$ of a subgroup of **prime order $q$**. Secret $k_s\in\mathbb Z_q$, public $k_p=b^{k_s}$.
1. Prover: random $r$, sends commitment $y=b^r$.
2. Verifier: random challenge $c\in\mathbb Z_q^\times$.
3. Prover: response $z=k_s\cdot c+r\bmod q$.
4. Verifier accepts iff $b^z\cdot(k_p^{\,c})^{-1}=y$.

- **Completeness:** $b^{k_sc+r}b^{-k_sc}=b^r$.
- **Soundness (special soundness):** two accepting answers $z_1,z_2$ to challenges $c_1\ne c_2$ for the same $y$ give $k_s=(z_1-z_2)(c_1-c_2)^{-1}\bmod q$. So a prover that convinces with non-negligible probability "knows" $k_s$; a cheater guessing $c$ succeeds w.p. $\approx1/q$.
- **HVZK simulator:** choose $c$ and $z$ uniformly and set $y=b^z k_p^{-c}$: the triple $(y,c,z)$ has the same distribution as an honest transcript.`,
      formulas: [
        {
          id: 'schnorr-id',
          name: "Schnorr's identification protocol",
          tex: md`y=b^r,\quad z=k_s c+r\bmod q,\quad\text{accept iff } b^z\,k_p^{-c}=y`,
          intuition: 'Commit, get challenged, respond with a value that is linear in the secret but masked by r.',
        },
        {
          id: 'special-soundness',
          name: 'Special soundness (extractor)',
          tex: md`k_s=\frac{z_1-z_2}{c_1-c_2}\bmod q`,
          intuition: 'Answering two different challenges for one commitment reveals the secret — the same algebra as the Schnorr nonce-reuse attack.',
        },
      ],
      viz: [{ id: 'zkProof' }],
    },
    {
      id: 'sigma',
      title: 'Σ-protocols and the Fiat–Shamir trick',
      kind: 'concept',
      importance: 'must',
      body: md`**Σ-protocol:** three moves — the prover sends a **commitment** $y$, the verifier a random **challenge** $c$ from a challenge space, the prover a **response** $z=f(k_s,y,c)$; the verifier accepts iff a deterministic predicate $g(k_p,y,c,z)$ holds. Fiat–Shamir identification and Schnorr's protocol are Σ-protocols.

**Fiat–Shamir trick** (turning a Σ-protocol into a **signature**): replace the verifier's random challenge by a hash of the message and the commitment,
$$c=h(m\,\|\,y),\qquad\sigma=(y,z);$$
verification computes $c=h(m\|y)$ and checks $g(k_p,y,c,z)$. The hash acts as an honest verifier whom the signer cannot influence (the commitment is fixed before the challenge is known). Applied to Schnorr's protocol this gives exactly **Schnorr's signature**.`,
      formulas: [
        {
          id: 'fs-trick',
          name: 'Fiat–Shamir trick',
          tex: md`c=h(m\,\|\,y),\qquad\sigma=(y,z),\qquad V:\ g\bigl(k_p,y,h(m\|y),z\bigr)=\mathit{accept}`,
          intuition: 'A hash of the commitment replaces the verifier’s random challenge, making the proof non-interactive and bound to m.',
        },
      ],
    },
  ],
  flashcards: [
    { id: 'l12-c1', front: 'Interactive proof system', back: 'Protocol between prover and verifier ending with accept/reject; in crypto the input is a public key and the prover shows knowledge of the secret key.' },
    { id: 'l12-c2', front: 'Soundness', back: 'There is a capable verifier that rejects every prover not knowing the secret with probability ≥ 1 − p (p < ½).' },
    { id: 'l12-c3', front: 'Completeness', back: 'An honest prover (with the secret) is accepted by the capable verifier with probability ≥ 1 − p.' },
    { id: 'l12-c4', front: 'HVZK definition', back: 'A poly-time simulator Sim(k_p) outputs transcripts distributed identically to real transcripts between the honest prover and honest verifier.' },
    { id: 'l12-c5', front: 'Perfect ZK vs HVZK', back: 'Perfect ZK requires a simulator for every (possibly cheating) verifier, not only the honest one.' },
    { id: 'l12-c6', front: 'Fiat–Shamir identification round', back: md`$y=r^2$; challenge bit $c$; $z=r\,k_s^c$; check $z^2\equiv y\,k_p^c\pmod N$.` },
    { id: 'l12-c7', front: 'Fiat–Shamir identification: cheating probability', back: md`½ per round (a cheater prepares for one challenge); $2^{-t}$ after $t$ rounds.` },
    { id: 'l12-c8', front: 'Simulator for Fiat–Shamir identification', back: md`Random $z$, guess $c$; $y=z^2$ ($c=0$) or $z^2k_p^{-1}$ ($c=1$); keep if the verifier asks exactly $c$, else rewind.` },
    { id: 'l12-c9', front: "Schnorr's protocol", back: md`$y=b^r$; challenge $c$; $z=k_sc+r\bmod q$; accept iff $b^zk_p^{-c}=y$.` },
    { id: 'l12-c10', front: "Special soundness of Schnorr's protocol", back: md`Two answers for one $y$: $k_s=(z_1-z_2)/(c_1-c_2)\bmod q$.` },
    { id: 'l12-c11', front: 'Σ-protocol', back: 'Commitment → random challenge → response; verifier applies a deterministic check g(k_p, y, c, z).' },
    { id: 'l12-c12', front: 'Fiat–Shamir trick', back: md`Set $c=h(m\|y)$; the signature is $(y,z)$. Schnorr's protocol becomes Schnorr's signature.` },
    { id: 'l12-c13', front: 'Hard problem behind Fiat–Shamir identification', back: 'Square roots modulo N = pq with unknown factorisation (equivalent to factoring).' },
  ],
  quiz: [
    {
      id: 'l12-q1',
      type: 'mcq',
      difficulty: 1,
      prompt: 'A cheating prover in the Fiat–Shamir identification protocol passes t rounds with probability',
      options: ['1/t', '2^(−t)', '1/2', '0'],
      answer: 1,
      explanation: 'It can prepare for only one of the two challenges each round.',
    },
    {
      id: 'l12-q2',
      type: 'mcq',
      difficulty: 1,
      prompt: 'What does a simulator demonstrate in a zero-knowledge proof?',
      options: ['That the prover knows the secret', 'That transcripts can be produced without the secret, so they carry no knowledge about it', 'That the verifier is honest', 'That the protocol is fast'],
      answer: 1,
      explanation: 'If you could have generated it yourself, seeing it teaches you nothing.',
    },
    {
      id: 'l12-q3',
      type: 'mcq',
      difficulty: 1,
      prompt: 'Applying the Fiat–Shamir trick to Schnorr’s identification protocol gives',
      options: ['RSA signatures', 'DSA', 'Schnorr signatures', 'Diffie–Hellman'],
      answer: 2,
      explanation: 'The challenge becomes h(m ‖ y).',
    },
    {
      id: 'l12-q4',
      type: 'mcq',
      difficulty: 2,
      prompt: 'Why must the verifier choose the challenge after receiving the commitment?',
      options: ['For efficiency', 'Otherwise a cheating prover could pick z first and compute a commitment that fits the known challenge — exactly what the simulator does', 'Because the commitment contains the secret', 'It does not matter'],
      answer: 1,
      explanation: 'Knowing c in advance makes cheating trivial; soundness rests on the order of moves.',
    },
    {
      id: 'l12-q5',
      type: 'mcq',
      difficulty: 2,
      prompt: md`Schnorr's protocol with $q=11$: honest prover with $r=4$, challenge $c=3$, $k_s=5$. The response is`,
      options: ['19', '8', '4', '7'],
      answer: 1,
      explanation: md`$z=5\cdot3+4=19\equiv8\pmod{11}$.`,
    },
    {
      id: 'l12-q6',
      type: 'mcq',
      difficulty: 3,
      prompt: md`A Schnorr prover reuses the same commitment $y=b^r$ in two sessions and receives challenges $c_1=2$, $c_2=5$ with responses $z_1=9$, $z_2=3$ (mod $q=11$). What is $k_s$?`,
      options: ['2', '9', '5', '3'],
      answer: 1,
      explanation: md`$z_1-z_2=k_s(c_1-c_2)$, so $6\equiv k_s\cdot(-3)\equiv8k_s\pmod{11}$. $8^{-1}\equiv7$ ($8\cdot7=56=5\cdot11+1$), hence $k_s=6\cdot7=42\equiv9$. Check: $9\cdot(-3)=-27\equiv6$.`,
    },
    {
      id: 'l12-q7',
      type: 'mcq',
      difficulty: 3,
      prompt: 'Why is the Fiat–Shamir identification simulator allowed to "retry"?',
      options: ['Because simulators may run in exponential time', 'It rewinds the verifier when its guess of the challenge was wrong; the expected number of retries per round is 2, so it stays polynomial', 'Because the verifier is always honest', 'Retrying is not allowed'],
      answer: 1,
      explanation: 'For a cheating verifier the simulator cannot predict c, but guesses right with probability ½.',
    },
    {
      id: 'l12-q8',
      type: 'mcq',
      difficulty: 2,
      prompt: 'Which statement about HVZK and perfect ZK is correct?',
      options: ['HVZK requires a simulator for every verifier', 'Perfect ZK requires a simulator for every verifier; HVZK only for the honest one', 'They are the same', 'Perfect ZK does not need a simulator'],
      answer: 1,
      explanation: 'Perfect ZK is the stronger notion.',
    },
  ],
};
