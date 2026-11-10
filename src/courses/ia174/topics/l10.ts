import type { Topic } from '../../../platform/types';

const md = String.raw;

export const l10: Topic = {
  id: 'l10',
  lecture: 11,
  tag: 'L10',
  examGroup: 'DL',
  title: 'Elliptic-curve cryptography',
  summary: md`Fields and finite fields, elliptic curves in Weierstrass form, the group law (algebraically and geometrically), the point at infinity, the elliptic-curve discrete log, singular curves and the discriminant, group order and the Hasse–Weil bound, weak curves (anomalous, supersingular), implementation pitfalls and curve standardisation.`,
  sections: [
    {
      id: 'fields',
      title: 'Fields and finite fields',
      kind: 'definition',
      importance: 'must',
      body: md`**Field** $(F,+,\cdot)$: $(F,+)$ is an abelian group with neutral 0, $(F\setminus\{0\},\cdot)$ is an abelian group with neutral 1, and multiplication distributes over addition. Examples: $\mathbb Q,\mathbb R,\mathbb C$.

**Finite fields:** GF($q$) exists exactly for prime powers $q=p^k$ (built from polynomials, like GF($2^8$) in AES). For elliptic curves in this course we only need $\mathbb F_p=(\mathbb Z_p,+,\cdot)$ for a prime $p\ge5$.`,
    },
    {
      id: 'curve',
      title: 'Elliptic curves and the group law',
      kind: 'definition',
      importance: 'must',
      body: md`**Definition.** For a field $F$ and $a,b\in F$ with $4a^3+27b^2\ne0$, the elliptic curve $E$ is the set of points $(x,y)\in F^2$ with
$$y^2=x^3+ax+b$$
together with a special **point at infinity** $\mathcal O$. In crypto: $F=\mathbb F_p$.

**Group law** (additive notation), for $P=(x_1,y_1)$, $Q=(x_2,y_2)$:
- if $x_1\ne x_2$: $m=\frac{y_2-y_1}{x_2-x_1}$;
- if $P=Q$ and $y_1\ne0$ (doubling): $m=\frac{3x_1^2+a}{2y_1}$;
- then $x_3=m^2-x_1-x_2$, $y_3=-m(x_3-x_1)-y_1$ and $P+Q=(x_3,y_3)$;
- if $x_1=x_2$ and ($y_1\ne y_2$ or $y_1=y_2=0$): $P+Q=\mathcal O$.

$\mathcal O$ is the **neutral element**: $P+\mathcal O=P$; the inverse of $(x,y)$ is $(x,-y)$. The group is abelian; it is always cyclic or a product of two cyclic groups. (Exact formulas need not be memorised, the geometric intuition and $\mathcal O$ as neutral element must be known.)

**Geometry over ℝ:** a line meeting the curve in two points meets it in exactly three (counted properly). $P+Q$ = **reflection** across the x-axis of the third intersection of line $PQ$; for $P=Q$ use the **tangent**; a **vertical** line gives $\mathcal O$ ("the vertical direction").`,
      formulas: [
        {
          id: 'ec-curve',
          name: 'Short Weierstrass equation',
          tex: md`E:\ y^2=x^3+ax+b,\qquad 4a^3+27b^2\ne0`,
          intuition: 'The condition rules out singular curves (cusps and self-intersections).',
        },
        {
          id: 'ec-add',
          name: 'Point addition',
          tex: md`m=\frac{y_2-y_1}{x_2-x_1}\ \Bigl(\text{or }\frac{3x_1^2+a}{2y_1}\text{ if }P=Q\Bigr),\quad x_3=m^2-x_1-x_2,\quad y_3=m(x_1-x_3)-y_1`,
          intuition: 'Slope of the secant (or tangent), third intersection, then reflect.',
          conditions: 'Division is in the field F (modular inverse in 𝔽ₚ).',
        },
      ],
      viz: [{ id: 'ellipticCurve', props: { tab: 'real' } }],
    },
    {
      id: 'ecdlp',
      title: 'Discrete log on elliptic curves',
      kind: 'definition',
      importance: 'must',
      body: md`In additive notation $k\cdot P=P+\dots+P$ ($k$ times), computed by **double-and-add** (the additive square-and-multiply).

**ECDLP:** given the curve group $(E,+)$, a point $G$ (generator of a cyclic subgroup $\langle G\rangle$) and $P=k\cdot G$, find $k$.

ECDH and ECDSA are DH and DSA in this group. Because no sub-exponential algorithm is known for good curves, much shorter keys suffice: a 256-bit curve ≈ 128-bit security ≈ 3072-bit RSA/DH.`,
      viz: [{ id: 'ellipticCurve', props: { tab: 'fp' } }],
    },
    {
      id: 'choice',
      title: 'Choosing a good curve',
      kind: 'concept',
      importance: 'must',
      body: md`**Discriminant.** For $f(x)=x^3+ax+b$, $\Delta(f)=-(4a^3+27b^2)$ (up to a constant factor). Over ℝ the sign decides whether the curve has 1 or 2 components. $\Delta=0$ iff $f$ has a repeated root: the curve is **singular** (a cusp, e.g. $y^2=x^3$, or a node, e.g. $y^2=x^3+x^2$); tangents are not defined at the singular point and the group law fails. Removing that point gives a group isomorphic to $(\mathbb F_p,+)$ (DLP trivial) or to $(\mathbb F_p^\times,\cdot)$ (classical finite-field DLP). **Singular curves must not be used.**

**Group size.** $|\langle G\rangle|$ must satisfy the usual DL requirements: large and **not smooth** (Pohlig–Hellman, Pollard ρ), ideally prime.
- **Hasse–Weil bound:** $p+1-2\sqrt p\le|E(\mathbb F_p)|\le p+1+2\sqrt p$ — the number of points is close to $p$.
- **Schoof's algorithm** computes $|E|$ in **polynomial time**.

**Two special insecure cases** (know them, not the attack details):
- **anomalous** curves, $|E|=p$: **Smart's attack** transfers the ECDLP to $(\mathbb Z_p,+)$ — easy;
- **supersingular** curves, $|E|=p+1$ (more generally low *embedding degree*): the **MOV attack** transfers it to $\mathbb F_{p^r}^\times$, where sub-exponential algorithms apply.

No other sub-exponential ECDLP attacks are known — but ECC security in practice is more than ECDLP security.`,
      formulas: [
        {
          id: 'hasse',
          name: 'Hasse–Weil bound',
          tex: md`\bigl|\,|E(\mathbb F_p)|-(p+1)\,\bigr|\le2\sqrt p`,
          intuition: 'Roughly half of the x-values give a square (two points), so about p points in total.',
        },
        {
          id: 'disc',
          name: 'Discriminant (non-singularity)',
          tex: md`\Delta=-(4a^3+27b^2)\ne0`,
          intuition: md`$\Delta=0$ exactly when $x^3+ax+b$ has a repeated root.`,
        },
      ],
    },
    {
      id: 'impl',
      title: 'Implementation pitfalls and standardisation',
      kind: 'concept',
      importance: 'context',
      body: md`An implementation chooses the curve, scalar-multiplication algorithm, addition formulas, point representation, field arithmetic, the RNG (recall the PlayStation 3 ECDSA nonce failure) and which validations to run. Getting them all right is hard. Attacks against missing validations:
- **small-subgroup attack:** applies when the curve has a composite order; mitigated by **cofactor validation**;
- **invalid-curve attack:** the attacker sends a point on a *different* curve (other $b$) with weak structure; mitigated by checking the point lies on the curve;
- **CurveBall** (2020): crafted generator in certificates; mitigated by generator validation.

Plus side channels (timing, power, EM, caches, exceptional cases).

**Trust:** most Internet ECC used NIST **P-256**, whose generation seed was never explained. **Curve25519/Ed25519** (Bernstein) have a transparent design, better performance and misuse resistance.

**Takeaways:** ECC turns deep algebra into efficient crypto with short keys; implementations are full of pitfalls; standard curves raise trust questions.`,
    },
  ],
  flashcards: [
    { id: 'l10-c1', front: 'Elliptic curve (short Weierstrass form)', back: md`Points with $y^2=x^3+ax+b$ over a field, $4a^3+27b^2\ne0$, plus the point at infinity $\mathcal O$.` },
    { id: 'l10-c2', front: 'Neutral element of an EC group', back: md`The point at infinity $\mathcal O$.` },
    { id: 'l10-c3', front: 'Inverse of P = (x, y)', back: md`$-P=(x,-y)$.` },
    { id: 'l10-c4', front: 'Geometric rule for P + Q', back: 'Draw the line PQ (tangent if P = Q), take the third intersection, reflect it across the x-axis. Vertical line ⇒ O.' },
    { id: 'l10-c5', front: 'ECDLP', back: md`Given $G$ and $P=k\cdot G$, find $k$.` },
    { id: 'l10-c6', front: 'Singular curves', back: '4a³ + 27b² = 0: repeated root, cusp or node; the group law breaks and DL reduces to (𝔽ₚ, +) or 𝔽ₚ^× — never use them.' },
    { id: 'l10-c7', front: 'Hasse–Weil bound', back: md`$p+1-2\sqrt p\le|E(\mathbb F_p)|\le p+1+2\sqrt p$.` },
    { id: 'l10-c8', front: "Schoof's algorithm", back: 'Computes the number of points |E(𝔽ₚ)| in polynomial time.' },
    { id: 'l10-c9', front: 'Two insecure curve classes', back: 'Anomalous (|E| = p, Smart’s attack) and supersingular / low embedding degree (|E| = p + 1, MOV attack).' },
    { id: 'l10-c11', front: 'Why ECC instead of ℤₚ^×?', back: 'No sub-exponential DL algorithm for good curves ⇒ much shorter keys and faster operations for the same security.' },
    { id: 'l10-c12', front: 'Which fields does the course use for ECC?', back: '𝔽ₚ = ℤₚ for a prime p ≥ 5.' },
    { id: 'l10-c13', front: 'Field definition', back: '(F, +) abelian group, (F ∖ {0}, ·) abelian group, multiplication distributes over addition.' },
  ],
  quiz: [
    {
      id: 'l10-q1',
      type: 'mcq',
      difficulty: 1,
      prompt: 'What is the neutral element of the group of points of an elliptic curve?',
      options: ['(0, 0)', 'the point at infinity O', '(0, √b)', 'the generator G'],
      answer: 1,
      explanation: md`$P+\mathcal O=P$; $(0,0)$ need not even be on the curve.`,
    },
    {
      id: 'l10-q2',
      type: 'mcq',
      difficulty: 1,
      prompt: md`Which curve over $\mathbb F_p$ is singular?`,
      options: [md`$y^2=x^3+x+1$`, md`$y^2=x^3$`, md`$y^2=x^3+2x+2$`, md`$y^2=x^3-x$`],
      answer: 1,
      explanation: md`$a=b=0$ gives $4a^3+27b^2=0$ (a cusp at the origin).`,
    },
    {
      id: 'l10-q3',
      type: 'mcq',
      difficulty: 2,
      prompt: md`An elliptic curve over $\mathbb F_{101}$ can have how many points (including $\mathcal O$)?`,
      options: ['any number between 1 and 202', 'between about 82 and 122', 'exactly 102', 'exactly 101'],
      answer: 1,
      explanation: md`Hasse: $102\pm2\sqrt{101}\approx102\pm20.1$.`,
    },
    {
      id: 'l10-q4',
      type: 'mcq',
      difficulty: 2,
      prompt: md`$P=(x,y)$ with $y=0$ on a curve. What is $2P$?`,
      options: [md`$\mathcal O$`, md`$(2x,0)$`, md`$P$`, md`$(x,0)$ reflected`],
      answer: 0,
      explanation: md`The tangent is vertical; $P=-P$, so $P$ has order 2.`,
    },
    {
      id: 'l10-q5',
      type: 'mcq',
      difficulty: 2,
      prompt: md`A curve over $\mathbb F_p$ has exactly $p$ points. It is`,
      options: ['ideal for cryptography', 'anomalous — the ECDLP is easy (Smart’s attack)', 'supersingular', 'singular'],
      answer: 1,
      explanation: 'Anomalous curves admit an additive transfer to (ℤₚ, +).',
    },
    {
      id: 'l10-q6',
      type: 'mcq',
      difficulty: 3,
      prompt: md`On $y^2=x^3+2x+2$ over $\mathbb F_{17}$, compute $2P$ for $P=(5,1)$.`,
      options: ['(6, 3)', '(10, 6)', '(3, 1)', '(5, 16)'],
      answer: 0,
      explanation: md`$m=(3\cdot25+2)/(2\cdot1)=77/2$. $77\equiv9$, $2^{-1}\equiv9$, $m=81\equiv13$. $x_3=169-10=159\equiv6$, $y_3=13(5-6)-1=-14\equiv3$.`,
    },
    {
      id: 'l10-q8',
      type: 'mcq',
      difficulty: 3,
      prompt: md`Why is the ECDLP on a singular curve $y^2=x^3$ (cusp) easy?`,
      options: ['Because the curve has no points', 'Removing the cusp leaves a group isomorphic to (𝔽ₚ, +), where "discrete log" is just division', 'Because Schoof’s algorithm fails', 'Because the group is not abelian'],
      answer: 1,
      explanation: 'Additive reduction: kP corresponds to k·t in (𝔽ₚ, +), solved by one modular inverse.',
    },
  ],
};
