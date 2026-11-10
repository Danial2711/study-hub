/** Parametrised IA174 questions: every call produces a fresh variant with plausible distractors. */
import type { McqQuestion, QuestionGenerator } from '../../platform/types';
import type { Rng } from '../../shared/math/random';
import { gfMul } from '../../shared/math/crypto/gf2';
import { modInvN, modPowN, phi, primesBetween, gcdN, factor } from '../../shared/math/crypto/numberTheory';
import { add, points, type Curve } from '../../shared/math/crypto/ec';

const md = String.raw;
const hx = (n: number) => '0x' + n.toString(16).toUpperCase().padStart(2, '0');
const bin = (n: number, w: number) => n.toString(2).padStart(w, '0');

/** Build an MCQ from the correct option and candidate wrong ones (deduplicated, filled up to 4 options). */
function mcq(rng: Rng, id: string, prompt: string, correct: string, wrong: string[], explanation: string, difficulty: 1 | 2 | 3, filler?: () => string): McqQuestion {
  const ws: string[] = [];
  for (const w of wrong) if (w !== correct && !ws.includes(w)) ws.push(w);
  let guard = 0;
  while (ws.length < 3 && filler && guard++ < 50) {
    const w = filler();
    if (w !== correct && !ws.includes(w)) ws.push(w);
  }
  const options = rng.shuffle([correct, ...ws.slice(0, 3)]);
  return { id, type: 'mcq', prompt, options, answer: options.indexOf(correct), explanation, difficulty };
}

const PRIMES_SMALL = primesBetween(11, 60);
const PRIMES_MID = primesBetween(23, 110);

function order(g: number, p: number): number {
  let x = g % p;
  for (let k = 1; k < p; k++) {
    if (x === 1) return k;
    x = (x * g) % p;
  }
  return p - 1;
}

export const generators: QuestionGenerator[] = [
  {
    id: 'otp-xor',
    title: 'One-time pad by hand',
    examGroup: 'S1',
    topicId: 'l01',
    generate(rng) {
      const m = rng.int(0, 255);
      const k = rng.int(0, 255);
      const c = m ^ k;
      return mcq(rng, 'g', md`One-time pad on 8 bits: $m=${bin(m, 8)}$, $k=${bin(k, 8)}$. What is $c=E(k,m)$?`, bin(c, 8), [bin(m & k, 8), bin(m | k, 8), bin((m + k) & 255, 8), bin(~c & 255, 8)], md`$c=m\oplus k$: a bit of $c$ is 1 exactly where $m$ and $k$ differ.`, 1, () => bin(rng.int(0, 255), 8));
    },
  },
  {
    id: 'otp-reuse',
    title: 'Two-time pad',
    examGroup: 'S1',
    topicId: 'l01',
    generate(rng) {
      const m1 = rng.int(0, 255);
      const m2 = rng.int(0, 255);
      const k = rng.int(0, 255);
      const c1 = m1 ^ k;
      const c2 = m2 ^ k;
      return mcq(rng, 'g', md`Two bytes were encrypted with the **same** OTP key: $c_1=${hx(c1)}$, $c_2=${hx(c2)}$. The first plaintext is $m_1=${hx(m1)}$. What is $m_2$?`, hx(m2), [hx(c2), hx(c1 ^ c2), hx(k), hx(m1 ^ c2 ^ 0xff)], md`$m_2=c_2\oplus k=c_2\oplus c_1\oplus m_1$ because the key cancels: $c_1\oplus c_2=m_1\oplus m_2$.`, 2, () => hx(rng.int(0, 255)));
    },
  },
  {
    id: 'advantage',
    title: 'Computing an advantage',
    examGroup: 'S2',
    topicId: 'l02',
    generate(rng) {
      const pf = rng.pick([0.6, 0.7, 0.8, 0.9, 1]);
      const pr = rng.pick([0.5, 0.6, 0.7, 0.8]);
      const win = 0.5 * pf + 0.5 * pr;
      const adv = Math.abs(win - 0.5);
      const f = (x: number) => x.toFixed(2);
      return mcq(
        rng,
        'g',
        md`In the PRG game an adversary answers correctly with probability ${f(pf)} when the challenger chose *fake* and with probability ${f(pr)} when it chose *rand*. What is its PRG advantage?`,
        f(adv),
        [f(win), f(Math.abs(pf - pr)), f(pf - 0.5), f(2 * adv)],
        md`$P(\text{win})=\tfrac12\cdot${f(pf)}+\tfrac12\cdot${f(pr)}=${f(win)}$, so the advantage is $|${f(win)}-\tfrac12|=${f(adv)}$.`,
        2,
        () => f(rng.int(0, 50) / 100),
      );
    },
  },
  {
    id: 'gf-mul',
    title: 'Multiplication in GF(2⁸)',
    examGroup: 'S3',
    topicId: 'l03',
    generate(rng) {
      const a = rng.int(1, 255);
      const b = rng.pick([2, 3]);
      const r = gfMul(a, b);
      const naive = b === 2 ? (a << 1) & 0x1ff : ((a << 1) ^ a) & 0x1ff;
      return mcq(
        rng,
        'g',
        md`In the AES field GF(2⁸) (modulus $x^8+x^4+x^3+x+1$), compute $${hx(a)}\bullet${hx(b)}$.`,
        hx(r),
        [hx(naive & 0xff), hx((a * b) & 0xff), hx(r ^ 0x1b), hx(a ^ b)],
        b === 2
          ? md`Multiply by $x$: shift left${a & 0x80 ? md` — the top bit falls out, so XOR with $\texttt{1B}$` : ''}: result ${hx(r)}.`
          : md`$a\bullet3=(a\bullet2)\oplus a$. $a\bullet2=${hx(gfMul(a, 2))}$${a & 0x80 ? ' (overflow reduced with 0x1B)' : ''}, XOR $a$: ${hx(r)}.`,
        2,
        () => hx(rng.int(0, 255)),
      );
    },
  },
  {
    id: 'mode-blocks',
    title: 'Block counts in CBC and CTR',
    examGroup: 'S4',
    topicId: 'l04',
    generate(rng) {
      const L = rng.int(1, 120);
      const mode = rng.pick(['CBC', 'CTR'] as const);
      const cbc = Math.floor(L / 16) + 1; // PKCS#7 always pads
      const ctr = Math.ceil(L / 16);
      const ans = mode === 'CBC' ? cbc : ctr;
      return mcq(
        rng,
        'g',
        md`A ${L}-byte message is encrypted with AES in **${mode}** mode (${mode === 'CBC' ? 'PKCS#7 padding' : 'no padding'}). How many block-cipher evaluations are needed (not counting the IV)?`,
        String(ans),
        [String(cbc), String(ctr), String(ans + 1), String(Math.max(1, ans - 1))],
        mode === 'CBC' ? md`PKCS#7 always adds 1–16 bytes, so CBC needs $\lfloor ${L}/16\rfloor+1=${cbc}$ blocks.` : md`CTR needs one keystream block per started 16 bytes: $\lceil ${L}/16\rceil=${ctr}$; the last keystream block is truncated.`,
        1,
        () => String(rng.int(1, 9)),
      );
    },
  },
  {
    id: 'birthday',
    title: 'Generic attack costs',
    examGroup: 'H',
    topicId: 'l05',
    generate(rng) {
      const l = rng.pick([64, 128, 160, 224, 256, 384, 512]);
      const kind = rng.pick(['collision', 'second preimage', 'preimage'] as const);
      const e = kind === 'collision' ? l / 2 : l;
      return mcq(
        rng,
        'g',
        md`Roughly how many evaluations does a **generic** ${kind} attack on an ideal ${l}-bit hash need?`,
        md`$2^{${e}}$`,
        [md`$2^{${l / 2}}$`, md`$2^{${l}}$`, md`$2^{${l / 4}}$`, md`$2^{${2 * l}}$`],
        kind === 'collision' ? md`Birthday bound: $\sqrt{2^{${l}}}=2^{${l / 2}}$.` : md`Guessing needs about $2^{${l}}$ tries; the birthday trick only helps for collisions, where the adversary may choose both messages.`,
        1,
      );
    },
  },
  {
    id: 'md-pad',
    title: 'SHA-256 padding',
    examGroup: 'H',
    topicId: 'l05',
    generate(rng) {
      const L = rng.int(1, 200);
      const blocks = Math.ceil((L + 9) / 64);
      return mcq(
        rng,
        'g',
        md`SHA-256 pads a message with one 0x80 byte, zero bytes and an 8-byte length, to a multiple of 64 bytes. How many 64-byte blocks does a ${L}-byte message occupy after padding?`,
        String(blocks),
        [String(Math.ceil(L / 64)), String(blocks + 1), String(Math.max(1, blocks - 1)), String(Math.floor(L / 64) + 1)],
        md`At least $${L}+1+8=${L + 9}$ bytes are needed; rounding up to a multiple of 64 gives ${blocks} block(s).`,
        2,
        () => String(rng.int(1, 6)),
      );
    },
  },
  {
    id: 'merkle-proof',
    title: 'Merkle proof size',
    examGroup: 'H',
    topicId: 'l05',
    generate(rng) {
      const k = rng.int(3, 24);
      return mcq(rng, 'g', md`A Merkle tree commits to $2^{${k}}$ items. How many hash values does a membership proof for one item contain?`, String(k), [String(2 ** k), String(k + 1), String(2 * k), String(k - 1)], md`One sibling hash per level of the binary tree: $\log_2 2^{${k}}=${k}$.`, 1);
    },
  },
  {
    id: 'polymac',
    title: 'Polynomial one-time MAC',
    examGroup: 'M',
    topicId: 'l06',
    generate(rng) {
      const p = rng.pick([11, 13, 17, 19, 23]);
      const a = rng.int(1, p - 1);
      const b = rng.int(0, p - 1);
      const m1 = rng.int(0, p - 1);
      const m2 = rng.int(0, p - 1);
      // P(y) = y^3 + m2 y^2 + m1 y
      const tag = (a ** 3 + m2 * a * a + m1 * a + b) % p;
      const noB = (a ** 3 + m2 * a * a + m1 * a) % p;
      return mcq(
        rng,
        'g',
        md`Polynomial one-time MAC over $\mathbb Z_{${p}}$: key $(a,b)=(${a},${b})$, message blocks $m_1=${m1}$, $m_2=${m2}$, $P_m(y)=y^3+m_2y^2+m_1y$. The tag $P_m(a)+b\bmod ${p}$ is`,
        String(tag),
        [String(noB), String((tag + 1) % p), String((a * a + m2 * a + m1 + b) % p), String((m1 + m2 + b) % p)],
        md`$${a}^3+${m2}\cdot${a}^2+${m1}\cdot${a}=${a ** 3 + m2 * a * a + m1 * a}\equiv${noB}$; adding $b=${b}$ gives ${tag}.`,
        2,
        () => String(rng.int(0, p - 1)),
      );
    },
  },
  {
    id: 'cbcmac-birthday',
    title: 'When does ECBC-MAC break?',
    examGroup: 'M',
    topicId: 'l06',
    generate(rng) {
      const n = rng.pick([64, 128]);
      return mcq(
        rng,
        'g',
        md`ECBC-MAC uses a block cipher with ${n}-bit blocks. After about how many tagged messages does a generic forgery become likely?`,
        md`$2^{${n / 2}}$`,
        [md`$2^{${n}}$`, md`$2^{${n / 4}}$`, md`$2^{${n - 1}}$`],
        md`A birthday collision of internal chaining values $S(m)=S(m')$ appears after $\approx2^{${n / 2}}$ queries; then $S(m\|x)=S(m'\|x)$ gives a forgery.`,
        1,
      );
    },
  },
  {
    id: 'ae-composition',
    title: 'Which composition?',
    examGroup: 'AE',
    topicId: 'l07',
    generate(rng) {
      const variants = [
        { d: md`$c=E(k_E,m)$, send $(c,\ S(k_M,c))$`, a: 'Encrypt-then-MAC: generically AE-secure' },
        { d: md`send $E\bigl(k_E,(m,S(k_M,m))\bigr)$`, a: 'MAC-then-Encrypt: not AE-secure in general' },
        { d: md`send $\bigl(E(k_E,m),\ S(k_M,m)\bigr)$`, a: 'Encrypt-and-MAC: not even CPA-secure with a deterministic MAC' },
      ];
      const v = rng.pick(variants);
      return mcq(rng, 'g', md`A protocol does the following: ${v.d}. Which statement is correct (CPA-secure cipher, secure MAC, independent keys)?`, v.a, variants.map((x) => x.a).concat(['All three compositions are always AE-secure']), md`EtM is AE-secure by the EtM theorem; MtE can fail (padding oracles), E&M leaks equality of plaintexts through the tag.`, 1);
    },
  },
  {
    id: 'mod-inverse',
    title: 'Modular inverse',
    examGroup: 'G',
    topicId: 'groups',
    generate(rng) {
      const n = rng.pick(PRIMES_MID);
      const a = rng.int(2, n - 1);
      const inv = modInvN(a, n)!;
      return mcq(rng, 'g', md`Compute $${a}^{-1}\bmod ${n}$.`, String(inv), [String(n - inv), String(n - a), String((inv + 1) % n), String(modPowN(a, n - 3, n))], md`Extended Euclid (or Fermat: $a^{-1}\equiv a^{p-2}$). Check: $${a}\cdot${inv}=${a * inv}\equiv1\pmod{${n}}$.`, 1, () => String(rng.int(2, n - 1)));
    },
  },
  {
    id: 'fermat',
    title: 'Exponent reduction',
    examGroup: 'G',
    topicId: 'groups',
    generate(rng) {
      const p = rng.pick(PRIMES_SMALL);
      const a = rng.int(2, p - 1);
      const e = rng.int(100, 9999);
      const r = e % (p - 1);
      const ans = modPowN(a, r, p);
      return mcq(rng, 'g', md`Compute $${a}^{${e}}\bmod ${p}$.`, String(ans), [String(modPowN(a, e % p, p)), String(modPowN(a, (r + 1) % (p - 1), p)), String((a * r) % p), String(modPowN(a, r, p) === 1 ? 2 : 1)], md`$|\mathbb Z_{${p}}^\times|=${p - 1}$, so reduce the exponent: $${e}\bmod ${p - 1}=${r}$, and $${a}^{${r}}\equiv${ans}$.`, 2, () => String(rng.int(1, p - 1)));
    },
  },
  {
    id: 'phi',
    title: "Euler's totient",
    examGroup: 'G',
    topicId: 'groups',
    generate(rng) {
      const p = rng.pick(primesBetween(3, 40));
      let q = rng.pick(primesBetween(3, 40));
      while (q === p) q = rng.pick(primesBetween(3, 40));
      const sq = rng.next() < 0.3;
      const n = sq ? p * p * q : p * q;
      const ans = phi(n);
      return mcq(rng, 'g', md`$\varphi(${n})=\ ?$ ${sq ? md`($${n}=${p}^2\cdot${q}$)` : ''}`, String(ans), [String((p - 1) * (q - 1) * (sq ? p - 1 : 1)), String(n - 1), String(sq ? (p - 1) * (q - 1) : (p - 1) * q), String(ans + 2)], md`$\varphi(\prod p_i^{n_i})=\prod p_i^{n_i-1}(p_i-1)$ ⇒ ${ans}.`, 1, () => String(rng.int(10, n)));
    },
  },
  {
    id: 'element-order',
    title: 'Order of an element',
    examGroup: 'G',
    topicId: 'groups',
    generate(rng) {
      const p = rng.pick(primesBetween(7, 41));
      const g = rng.int(2, p - 2);
      const o = order(g, p);
      const divs = Array.from({ length: p - 1 }, (_, i) => i + 1).filter((d) => (p - 1) % d === 0);
      return mcq(rng, 'g', md`What is the order of $${g}$ in $\mathbb Z_{${p}}^\times$?`, String(o), [...rng.shuffle(divs.filter((d) => d !== o)).slice(0, 3).map(String), String(p - 1)], md`The order divides $|G|=${p - 1}$ (Lagrange); the smallest $k$ with $${g}^k\equiv1$ is ${o}.`, 2, () => String(rng.int(1, p - 1)));
    },
  },
  {
    id: 'rsa-d',
    title: 'RSA decryption exponent',
    examGroup: 'PK',
    topicId: 'l08',
    generate(rng) {
      let p = 0,
        q = 0,
        e = 0,
        f = 0;
      do {
        p = rng.pick(primesBetween(5, 30));
        q = rng.pick(primesBetween(5, 30));
        f = (p - 1) * (q - 1);
        e = rng.pick([3, 5, 7, 11, 13, 17]);
      } while (p === q || gcdN(e, f) !== 1);
      const d = modInvN(e, f)!;
      const wrongN = modInvN(e, p * q);
      return mcq(rng, 'g', md`RSA with $p=${p}$, $q=${q}$, $e=${e}$. What is $d$?`, String(d), [wrongN === null ? String(d + 1) : String(wrongN), String(f - d), String((d + e) % f), String(modInvN(e, (p - 1) * q) ?? d + 2)], md`$\varphi(N)=${p - 1}\cdot${q - 1}=${f}$ and $d=e^{-1}\bmod\varphi(N)$: $${e}\cdot${d}=${e * d}=${Math.floor((e * d) / f)}\cdot${f}+1$. (Inverting modulo $N$ is the classic mistake.)`, 2, () => String(rng.int(2, f - 1)));
    },
  },
  {
    id: 'rsa-enc',
    title: 'Textbook RSA encryption',
    examGroup: 'PK',
    topicId: 'l08',
    generate(rng) {
      const [p, q, e] = rng.pick([
        [5, 11, 3],
        [3, 11, 7],
        [7, 11, 7],
        [5, 13, 5],
        [11, 13, 7],
      ]);
      const N = p * q;
      const m = rng.int(2, N - 1);
      const c = modPowN(m, e, N);
      return mcq(rng, 'g', md`Textbook RSA with $N=${N}$, $e=${e}$. Encrypt $m=${m}$.`, String(c), [String((m * e) % N), String(modPowN(m, e - 1, N)), String(modPowN(e, m, N)), String((c + 1) % N)], md`$c=m^e\bmod N=${m}^{${e}}\bmod ${N}=${c}$ (square-and-multiply).`, 2, () => String(rng.int(1, N - 1)));
    },
  },
  {
    id: 'dh',
    title: 'Diffie–Hellman shared key',
    examGroup: 'DL',
    topicId: 'l09',
    generate(rng) {
      const p = rng.pick([23, 29, 31, 37, 41, 43, 47]);
      const fs = factor(p - 1).map(([x]) => x);
      let g = 2;
      while (!fs.every((x) => modPowN(g, (p - 1) / x, p) !== 1)) g++;
      const a = rng.int(2, p - 2);
      const b = rng.int(2, p - 2);
      const A = modPowN(g, a, p);
      const B = modPowN(g, b, p);
      const K = modPowN(g, a * b, p);
      return mcq(rng, 'g', md`Diffie–Hellman in $\mathbb Z_{${p}}^\times$ with generator $${g}$: Alice's secret $\alpha=${a}$, Bob sends $b^\beta=${B}$. What is the shared key?`, String(K), [String((A * B) % p), String(modPowN(g, a + b, p)), String(A), String(modPowN(B, b, p))], md`Alice computes $(b^\beta)^\alpha=${B}^{${a}}\bmod ${p}=${K}$ (= $b^{\alpha\beta}$).`, 2, () => String(rng.int(1, p - 1)));
    },
  },
  {
    id: 'generators',
    title: 'Counting generators',
    examGroup: 'DL',
    topicId: 'l09',
    generate(rng) {
      const p = rng.pick(primesBetween(11, 101));
      const ans = phi(p - 1);
      return mcq(rng, 'g', md`How many generators does the cyclic group $\mathbb Z_{${p}}^\times$ have?`, String(ans), [String(p - 1), String(phi(p)), String(p - 2), String(Math.floor((p - 1) / 2))], md`A cyclic group of order $m=${p - 1}$ has $\varphi(m)=${ans}$ generators.`, 2, () => String(rng.int(2, p)));
    },
  },
  {
    id: 'ec-add',
    title: 'Point addition on a small curve',
    examGroup: 'DL',
    topicId: 'l10',
    generate(rng) {
      const c: Curve = rng.pick([
        { a: 2, b: 2, p: 17 },
        { a: 1, b: 6, p: 11 },
        { a: 1, b: 1, p: 23 },
        { a: 3, b: 8, p: 13 },
      ]);
      const pts = points(c).filter((P) => P.y !== 0);
      const P = rng.pick(pts);
      let Q = rng.pick(pts);
      let tries = 0;
      while ((Q.x === P.x) && tries++ < 20) Q = rng.pick(pts);
      const double = Q.x === P.x || rng.next() < 0.3;
      const R = add(c, P, double ? P : Q)!;
      const fmtP = (X: { x: number; y: number } | null) => (X ? `(${X.x}, ${X.y})` : 'O');
      const wrong = [fmtP({ x: R.x, y: (c.p - R.y) % c.p }), fmtP({ x: (P.x + (double ? P.x : Q.x)) % c.p, y: (P.y + (double ? P.y : Q.y)) % c.p }), ...rng.shuffle(points(c)).slice(0, 3).map(fmtP)];
      return mcq(
        rng,
        'g',
        md`On $y^2=x^3+${c.a}x+${c.b}$ over $\mathbb F_{${c.p}}$, compute ${double ? md`$2P$ for $P=${fmtP(P)}$` : md`$P+Q$ for $P=${fmtP(P)}$, $Q=${fmtP(Q)}$`}.`,
        fmtP(R),
        wrong,
        double
          ? md`$m=\frac{3x_1^2+a}{2y_1}$, $x_3=m^2-2x_1$, $y_3=m(x_1-x_3)-y_1$, all mod ${c.p}: ${fmtP(R)}. (Forgetting the final reflection gives $(x_3,-y_3)$.)`
          : md`$m=\frac{y_2-y_1}{x_2-x_1}$, $x_3=m^2-x_1-x_2$, $y_3=m(x_1-x_3)-y_1$, all mod ${c.p}: ${fmtP(R)}. Adding coordinates is not the group law.`,
        3,
      );
    },
  },
  {
    id: 'schnorr-reuse',
    title: 'Schnorr nonce reuse',
    examGroup: 'DS',
    topicId: 'l11',
    generate(rng) {
      const q = rng.pick([11, 13, 17, 19, 23]);
      const k = rng.int(1, q - 1);
      const r = rng.int(1, q - 1);
      let h1 = rng.int(1, q - 1);
      let h2 = rng.int(1, q - 1);
      while (h2 === h1) h2 = rng.int(1, q - 1);
      const z1 = (k * h1 + r) % q;
      const z2 = (k * h2 + r) % q;
      return mcq(
        rng,
        'g',
        md`Two Schnorr signatures (group order $q=${q}$) share the same commitment $\rho$. Their values are $z_1=${z1}$, $h_1=${h1}$ and $z_2=${z2}$, $h_2=${h2}$ (with $z=k\,h+r\bmod q$). What is the secret key $k$?`,
        String(k),
        [String(r), String((z1 - z2 + q) % q), String((((z1 - z2) % q) + q) % q === 0 ? 1 : ((h1 - h2 + q) % q)), String((k + 1) % q)],
        md`$z_1-z_2=k(h_1-h_2)$, so $k=(${z1}-${z2})\cdot(${h1}-${h2})^{-1}\bmod ${q}=${k}$. The shared nonce $r=${r}$ cancels.`,
        3,
        () => String(rng.int(0, q - 1)),
      );
    },
  },
  {
    id: 'zk-soundness',
    title: 'Cheating in t rounds',
    examGroup: 'ZK',
    topicId: 'l12',
    generate(rng) {
      const bits = rng.pick([1, 1, 2, 4]);
      const t = rng.int(5, 40);
      const e = bits * t;
      return mcq(
        rng,
        'g',
        md`An identification protocol uses challenges of ${bits} bit${bits > 1 ? 's' : ''} per round and special soundness holds. With $t=${t}$ rounds, what is a cheating prover's best success probability?`,
        md`$2^{-${e}}$`,
        [md`$2^{-${t}}$`, md`$${t}\cdot2^{-${bits}}$`, md`$2^{-${bits}}$`, md`$1/${t}$`],
        md`It can answer only one challenge per commitment, so it guesses the challenge: $2^{-${bits}}$ per round, $(2^{-${bits}})^{${t}}=2^{-${e}}$ overall.`,
        1,
      );
    },
  },
  {
    id: 'fs-response',
    title: 'Fiat–Shamir identification response',
    examGroup: 'ZK',
    topicId: 'l12',
    generate(rng) {
      const N = rng.pick([77, 91, 143, 187]);
      let ks = rng.int(2, N - 1);
      while (gcdN(ks, N) !== 1) ks = rng.int(2, N - 1);
      let r = rng.int(2, N - 1);
      while (gcdN(r, N) !== 1) r = rng.int(2, N - 1);
      const c = rng.int(0, 1);
      const z = c ? (r * ks) % N : r;
      return mcq(
        rng,
        'g',
        md`Fiat–Shamir identification with $N=${N}$, secret $k_s=${ks}$. The prover committed $y=r^2$ with $r=${r}$ and received challenge $c=${c}$. Its response $z$ is`,
        String(z),
        [String(c ? r : (r * ks) % N), String((r * r) % N), String((r + ks) % N), String((r * ks * ks) % N)],
        md`$z=r\cdot k_s^{\,c}\bmod N=${z}$; the verifier checks $z^2\equiv y\,k_p^{\,c}$ with $k_p=k_s^2\bmod N=${(ks * ks) % N}$.`,
        2,
        () => String(rng.int(1, N - 1)),
      );
    },
  },
];
