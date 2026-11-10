import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l11: Topic = {
  id: 'l11',
  lecture: 12,
  tag: 'L11',
  examGroup: 'DS',
  title: 'Digital signatures',
  summary: md`Non-repudiation, digital signature schemes and the existential-forgery game, hash-then-sign, full-domain hash from trapdoor permutations, RSA signatures, Schnorr signatures, DSA and ECDSA, and why the signing nonce must be random and never reused.`,
  sections: [
    {
      id: 'def',
      title: 'Signature schemes and their security',
      kind: 'definition',
      importance: 'must',
      body: md`A signature should convince the recipient **and any third party, at any later time**, that a given entity produced (agrees with) a document. A MAC convinces only the key holder, who could have produced the tag itself. The extra property is **non-repudiation**: the signer cannot deny having signed.

**Definition.** A digital signature scheme over $(\mathcal K_p,\mathcal K_s,\mathcal M,\mathcal{S}g)$ is $\mathcal D_s=(\mathrm{Gen},S,V)$:
- $\mathrm{Gen}$: randomized, outputs a key pair $(k_p,k_s)$ (valid keys $V(\mathrm{Gen})$);
- $S:\mathcal K_s\times\mathcal M\to\mathcal Sg$ — (possibly randomized) signing;
- $V:\mathcal K_p\times\mathcal M\times\mathcal Sg\to\{\mathit{true},\mathit{false}\}$ — deterministic verification,

with $V(k_p,m,S(k_s,m))=\mathit{true}$ with probability 1 for all valid key pairs.

**Existential-forgery game:**
1. Challenger runs $\mathrm{Gen}$, **reveals $k_p$**, keeps $k_s$.
2. Adversary chooses $N$; in each round sends $m_i$ and gets $\sigma_i=S(k_s,m_i)$.
3. Adversary outputs $(m,\sigma)$ with $m\notin\{m_1,\dots,m_N\}$; wins iff $V(k_p,m,\sigma)=\mathit{true}$.

$\mathrm{ADV}_{\mathrm{Sig}}=P(\text{win})$; ε-secure if ≤ ε for all efficient adversaries. (Compare with MACs: here the adversary has the verification key, and the forged **message** must be new.)`,
      formulas: [
        {
          id: 'adv-sig',
          name: 'Signature forgery advantage',
          tex: md`\mathrm{ADV}_{\mathrm{Sig}}(\mathcal D_s,A)=P\bigl(V(k_p,m,\sigma)=\mathit{true}\ \wedge\ m\notin\{m_1,\dots,m_N\}\bigr)`,
          intuition: 'Probability of a valid signature on a message never submitted to the signing oracle — with the public key known.',
        },
      ],
    },
    {
      id: 'hash',
      title: 'Hash-then-sign',
      kind: 'concept',
      importance: 'must',
      body: md`Public-key operations are slow and work on short inputs, so practical schemes sign $h(m)$ for a **collision-resistant** hash $h$ (sometimes the description simply assumes $\mathcal M$ is the hash space). One can show: if $\mathcal D_s$ is secure on the hash space and $h$ is collision resistant, the scheme $\mathcal D_s^h$ that hashes first is secure. A collision $h(m)=h(m')$ would make a signature on $m$ valid on $m'$.`,
    },
    {
      id: 'fdh',
      title: 'Full-domain hash and RSA signatures',
      kind: 'theorem',
      importance: 'must',
      body: md`**Full-domain hash (FDH)** from a trapdoor permutation $(\mathrm{Fwd},\mathrm{Inv})$ and a hash $h$ onto its domain:
- $S(k_s,m)=\mathrm{Inv}(k_s,h(m))$ — sign with the **secret** operation;
- $V(k_p,m,\sigma)$: accept iff $\mathrm{Fwd}(k_p,\sigma)=h(m)$ — verify with the **public** one.

**Theorem (informal).** If $f$ is a trapdoor function and $h$ a collision-resistant hash (modelled as a random oracle), FDH is secure.

**The hash is essential.** With RSA and no hash ($\sigma=m^d$):
- *no-message forgery:* pick any $\sigma$; it is a valid signature of $m=\sigma^e\bmod N$;
- *multiplicativity:* from $\sigma_1,\sigma_2$ for $m_1,m_2$, $\sigma_1\sigma_2$ is valid for $m_1m_2$.
With $h$, these give signatures on hash *values*; turning them into messages would need preimages.

**RSA signatures** = FDH with $\mathrm{Fwd}(m)=m^e$, $\mathrm{Inv}(c)=c^d\bmod N$ — the first widely used signature scheme. In practice the PKCS#1 encoding is used; badly implemented verification is vulnerable to Bleichenbacher-style attacks.`,
      formulas: [
        {
          id: 'fdh',
          name: 'Full-domain hash (RSA)',
          tex: md`\sigma=h(m)^d\bmod N,\qquad V:\ \sigma^e\equiv h(m)\pmod N`,
          intuition: 'Only the owner of the trapdoor can invert the permutation on the hash value; anyone can check it forward.',
        },
      ],
      viz: [{ id: 'signatureLab', props: { tab: 'rsa' } }],
    },
    {
      id: 'schnorr',
      title: "Schnorr's signature",
      kind: 'definition',
      importance: 'must',
      body: md`Obtained from Schnorr's identification protocol by the Fiat–Shamir trick (next lecture). Strong security guarantees and efficient, but long patented, so DSA was standardised instead. Works in any group: $b$ generates a subgroup of **prime order $q$**; secret key $k\in\{0,\dots,q-1\}$, public key $\kappa=b^k$.

**Sign** $m$:
1. sample a fresh random **ephemeral key** $r\leftarrow\mathbb Z_q^\times$;
2. $z\leftarrow k\cdot h(m\,\|\,b^r)+r\bmod q$;
3. output $\sigma=(b^r,z)$.

**Verify** $(m,(\rho,z))$: accept iff $b^z\cdot\kappa^{-h(m\|\rho)}=\rho$.

**Correctness:** $b^z\kappa^{-h}=b^{kh+r}b^{-kh}=b^r=\rho$.

**The ephemeral key must be unique, random and secret.** If the same $r$ signs $m_1\ne m_2$: $z_1-z_2=k(h_1-h_2)\pmod q$, so $k=(z_1-z_2)(h_1-h_2)^{-1}\bmod q$ — the secret key leaks from two public signatures. A predictable $r$ leaks $k=(z-r)h^{-1}$ from a single signature.`,
      formulas: [
        {
          id: 'schnorr',
          name: 'Schnorr signature',
          tex: md`\sigma=(\rho,z)=\bigl(b^r,\ k\,h(m\|b^r)+r\bmod q\bigr),\qquad V:\ b^z\,\kappa^{-h(m\|\rho)}=\rho`,
          symbols: [
            { sym: 'k, κ = b^k', meaning: 'secret and public key' },
            { sym: 'r', meaning: 'fresh random ephemeral key (nonce)' },
            { sym: 'q', meaning: 'prime order of ⟨b⟩' },
          ],
          intuition: 'The response z hides k behind the random r; the hash plays the role of the verifier’s challenge.',
          pitfalls: 'Reused or predictable r reveals the secret key.',
        },
      ],
      viz: [{ id: 'signatureLab', props: { tab: 'schnorr' } }],
    },
    {
      id: 'dsa',
      title: 'DSA and ECDSA',
      kind: 'concept',
      importance: 'context',
      body: md`**DSS/DSA** (NIST, 1994; revised up to 2013), DL in $\mathbb Z_p^\times$:
- keys: $L$-bit prime $q$, $M$-bit prime $p$ with $q\mid p-1$ (e.g. $M=3072$, $L=256$), $b=g^{(p-1)/q}$ generates the order-$q$ subgroup, secret $k$, public $\kappa=b^k\bmod p$;
- sign: random $r$, $\rho=(b^r\bmod p)\bmod q$, $z=r^{-1}(h(m)+k\rho)\bmod q$, output $(\rho,z)$;
- verify: $v=\bigl(b^{h(m)z^{-1}}\kappa^{\rho z^{-1}}\bmod p\bigr)\bmod q$, accept iff $v=\rho$.

**ECDSA:** the same with an elliptic-curve group; $\rho$ is the x-coordinate of $r\cdot G$ modulo the group order (resample if 0).

Structure similar to Schnorr's, and the same catastrophic failure on reused/predictable $r$ (Sony PlayStation 3). In an exam task involving (EC)DSA the algorithm would be given.`,
    },
  ],
  flashcards: [
    { id: 'l11-c1', front: 'Non-repudiation', back: 'Anyone (third parties, later) can verify the signature, so the signer cannot deny signing — unlike a MAC.' },
    { id: 'l11-c2', front: 'Digital signature scheme', back: md`$(\mathrm{Gen},S,V)$; $V(k_p,m,S(k_s,m))=\mathit{true}$ for valid key pairs.` },
    { id: 'l11-c3', front: 'EF game for signatures vs MACs', back: 'Adversary gets the public key; must produce a valid signature on a message never queried (MAC game: any new pair, no verification key).' },
    { id: 'l11-c4', front: 'Why hash before signing?', back: 'Efficiency (short inputs) and security (FDH); needs collision resistance, else σ(m) is valid for m′.' },
    { id: 'l11-c5', front: 'Full-domain hash', back: md`$S=\mathrm{Inv}(k_s,h(m))$, $V$: $\mathrm{Fwd}(k_p,\sigma)=h(m)$.` },
    { id: 'l11-c6', front: 'Forgeries on unhashed RSA signatures', back: md`Any $\sigma$ signs $\sigma^e$; $\sigma_1\sigma_2$ signs $m_1m_2$.` },
    { id: 'l11-c7', front: 'Schnorr signing', back: md`random $r$; $z=k\,h(m\|b^r)+r\bmod q$; $\sigma=(b^r,z)$.` },
    { id: 'l11-c8', front: 'Schnorr verification', back: md`$b^z\kappa^{-h(m\|\rho)}=\rho$.` },
    { id: 'l11-c9', front: 'Schnorr: nonce reused for m₁, m₂', back: md`$k=(z_1-z_2)(h_1-h_2)^{-1}\bmod q$.` },
    { id: 'l11-c10', front: 'DSA signature components', back: md`$\rho=(b^r\bmod p)\bmod q$, $z=r^{-1}(h(m)+k\rho)\bmod q$.` },
    { id: 'l11-c11', front: 'ECDSA difference from DSA', back: 'Uses an EC group; ρ = x-coordinate of r·G modulo the group order.' },
    { id: 'l11-c12', front: 'PlayStation 3 failure', back: 'ECDSA signatures with a constant ephemeral key r — the private signing key was computed from two signatures.' },
  ],
  quiz: [
    {
      id: 'l11-q1',
      type: 'mcq',
      difficulty: 1,
      prompt: 'Which property do digital signatures provide that MACs do not?',
      options: ['integrity', 'non-repudiation (public verifiability)', 'confidentiality', 'speed'],
      answer: 1,
      explanation: 'MAC verification needs the secret key, so the verifier could have produced the tag itself.',
    },
    {
      id: 'l11-q2',
      type: 'mcq',
      difficulty: 1,
      prompt: 'In RSA full-domain hash, signing uses',
      options: ['the public exponent e', 'the secret exponent d applied to h(m)', 'the secret exponent applied to m', 'a symmetric key'],
      answer: 1,
      explanation: md`$\sigma=h(m)^d\bmod N$.`,
    },
    {
      id: 'l11-q3',
      type: 'mcq',
      difficulty: 2,
      prompt: 'Without hashing, textbook RSA signatures are insecure because',
      options: ['d can be computed from e', 'σ₁·σ₂ is a valid signature of m₁·m₂, and any σ signs σᵉ', 'they are randomized', 'verification is slow'],
      answer: 1,
      explanation: 'Multiplicativity and the no-message forgery.',
    },
    {
      id: 'l11-q4',
      type: 'mcq',
      difficulty: 2,
      prompt: 'In the signature EF game, which output does NOT count as a win?',
      options: ['a valid signature on a message never queried', 'a second, different valid signature on a message that was queried', 'a valid signature on a meaningless message', 'a valid signature produced using the public key only'],
      answer: 1,
      explanation: 'The lecture’s definition requires a new message (m ∉ {m₁, …, m_N}).',
    },
    {
      id: 'l11-q5',
      type: 'mcq',
      difficulty: 3,
      prompt: md`Schnorr, $q=101$: two signatures with the same $\rho$ have $z_1=50$, $z_2=20$, $h_1=13$, $h_2=3$. The secret key is`,
      options: ['3', '30', '10', '7'],
      answer: 0,
      explanation: md`$k=(50-20)(13-3)^{-1}=30\cdot10^{-1}\bmod101$. $10^{-1}\equiv91$ ($910=9\cdot101+1$), $30\cdot91=2730=27\cdot101+3$ → $k=3$. Check: $3\cdot10=30$.`,
    },
    {
      id: 'l11-q6',
      type: 'mcq',
      difficulty: 3,
      prompt: md`A Schnorr implementation derives the nonce as $r=h(\text{counter})$ with a public counter. What breaks?`,
      options: ['nothing, r is unique', md`$r$ is predictable, so from one signature $k=(z-r)\,h(m\|\rho)^{-1}\bmod q$`, 'only performance', 'verification'],
      answer: 1,
      explanation: 'The nonce must be secret and unpredictable, not merely unique.',
    },
    {
      id: 'l11-q7',
      type: 'mcq',
      difficulty: 2,
      prompt: md`In Schnorr verification, why does $b^z\kappa^{-h}=b^r$ hold for honest signatures?`,
      options: [md`$b^z=b^{kh+r}$ and $\kappa^{-h}=b^{-kh}$`, md`because $z=r$`, md`because $\kappa=b^r$`, 'because q is prime'],
      answer: 0,
      explanation: md`Exponents add: $b^{kh+r}\cdot b^{-kh}=b^r$ (computed mod $q$ since $b$ has order $q$).`,
    },
    {
      id: 'l11-q8',
      type: 'mcq',
      difficulty: 3,
      prompt: md`A hash used for signatures has a known collision $h(m)=h(m')$ where $m$ is harmless and $m'$ harmful. How is that exploited?`,
      options: [md`Ask the signer to sign $m$; the signature is also valid on $m'$`, 'Recover the secret key', 'Verify faster', 'It cannot be exploited if the signature scheme is secure'],
      answer: 0,
      explanation: 'Hash-then-sign only signs h(m).',
    },
  ],
};
