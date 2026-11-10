/** Perfect secrecy, one-time pad, attack games and negligible functions. */
import { useMemo, useState } from 'react';
import { Chart, KV, Legend, Slider, VizFrame, linePath } from '../kit';
import { makeRng, type Rng } from '../../math/random';
import { fromUtf8, utf8, xor } from '../../math/crypto/bytes';
import { Bytes, hex, randomBytes, toyPrp } from './ckit';

// ------------------------------------------------------------------ cipher table

interface ToyCipher {
  name: string;
  note: string;
  keys: string[];
  msgs: string[];
  enc: (k: number, m: number) => string;
}

const bin = (x: number, w: number) => x.toString(2).padStart(w, '0');

const TOY_CIPHERS: Record<string, ToyCipher> = {
  otp: {
    name: 'One-time pad, 2 bits',
    note: 'E(k, m) = m ⊕ k with K = M = C = {0,1}². Every ciphertext is reachable from every message by exactly one key.',
    keys: [0, 1, 2, 3].map((k) => bin(k, 2)),
    msgs: [0, 1, 2, 3].map((m) => bin(m, 2)),
    enc: (k, m) => bin(k ^ m, 2),
  },
  affine: {
    name: 'Affine cipher on ℤ₅',
    note: 'E((a, b), m) = a·m + b mod 5 with a ∈ {1,…,4}, b ∈ ℤ₅ (20 keys). For each a exactly one b works, so every (m, c) pair has 4 keys.',
    keys: [1, 2, 3, 4].flatMap((a) => [0, 1, 2, 3, 4].map((b) => `${a},${b}`)),
    msgs: ['0', '1', '2', '3', '4'],
    enc: (k, m) => String((Math.floor(k / 5 + 1) * m + (k % 5)) % 5),
  },
  short: {
    name: 'Key shorter than message',
    note: 'E(k, m) = m ⊕ (k‖k) with a 1-bit key and 2-bit messages. Only 2 keys for 4 messages: Shannon says this cannot be perfectly secure.',
    keys: ['0', '1'],
    msgs: [0, 1, 2, 3].map((m) => bin(m, 2)),
    enc: (k, m) => bin(m ^ (k ? 3 : 0), 2),
  },
  mult: {
    name: 'Multiplication mod 5',
    note: 'E(k, m) = k·m mod 5 with k ∈ {1,…,4}. Invertible, but m = 0 always encrypts to 0.',
    keys: ['1', '2', '3', '4'],
    msgs: ['0', '1', '2', '3', '4'],
    enc: (k, m) => String(((k + 1) * m) % 5),
  },
  halfkey: {
    name: 'OTP that ignores a key bit',
    note: 'E(k, m) = m ⊕ (k ∧ 01): 4 keys, but the high key bit is never used, so the high message bit is sent in the clear.',
    keys: [0, 1, 2, 3].map((k) => bin(k, 2)),
    msgs: [0, 1, 2, 3].map((m) => bin(m, 2)),
    enc: (k, m) => bin(m ^ (k & 1), 2),
  },
};

export function CipherTable({ preset = 'otp' }: Record<string, unknown>) {
  const [id, setId] = useState(String(preset));
  const C = TOY_CIPHERS[id] ?? TOY_CIPHERS.otp;
  const table = C.keys.map((_, k) => C.msgs.map((_, m) => C.enc(k, m)));
  const cts = [...new Set(table.flat())].sort();
  const [selC, setSelC] = useState<string | null>(null);
  const c = selC && cts.includes(selC) ? selC : cts[0];
  // P(K(m, c)) for every m and c
  const P = (m: number, cc: string) => table.filter((row) => row[m] === cc).length / C.keys.length;
  const perfect = cts.every((cc) => C.msgs.every((_, m) => Math.abs(P(m, cc) - P(0, cc)) < 1e-12));
  // best distinguisher: maximal statistical distance between the ciphertext distributions of two messages
  let best = { m0: 0, m1: 0, sd: 0 };
  for (let a = 0; a < C.msgs.length; a++)
    for (let b = a + 1; b < C.msgs.length; b++) {
      const sd = cts.reduce((s, cc) => s + Math.abs(P(a, cc) - P(b, cc)), 0) / 2;
      if (sd > best.sd + 1e-12) best = { m0: a, m1: b, sd };
    }
  return (
    <VizFrame
      title="Perfect secrecy, checked by brute force"
      caption={
        <>
          Shannon: the cipher is perfectly secure iff for every ciphertext c, the probability P(K(m, c)) that a uniformly random key maps m to c is the same for all m. The best adversary in the attack game sends the two
          messages whose ciphertext distributions differ most and wins with probability ½ + ½·(statistical distance).
        </>
      }
    >
      <div className="viz-controls">
        <label className="field">
          Cipher
          <select value={id} onChange={(e) => setId(e.target.value)}>
            {Object.entries(TOY_CIPHERS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="small muted">{C.note}</p>
      <div className="row" style={{ alignItems: 'flex-start', gap: 24 }}>
        <div className="scroll-x">
          <table className="cipher-table">
            <thead>
              <tr>
                <th>k \ m</th>
                {C.msgs.map((m) => (
                  <th key={m}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {C.keys.map((k, ki) => (
                <tr key={k}>
                  <th>{k}</th>
                  {table[ki].map((v, mi) => (
                    <td key={mi} className={v === c ? 'sel' : ''} onClick={() => setSelC(v)} style={{ cursor: 'pointer' }}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ minWidth: 220, flex: 1 }}>
          <div className="small muted">
            Ciphertext c ={' '}
            <select value={c} onChange={(e) => setSelC(e.target.value)}>
              {cts.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>{' '}
            (or click a cell)
          </div>
          {C.msgs.map((m, mi) => (
            <div key={m} className="row" style={{ gap: 8, margin: '4px 0' }}>
              <span className="mono small" style={{ width: 48 }}>
                m={m}
              </span>
              <div className="progress" style={{ flex: 1 }}>
                <div style={{ width: `${100 * P(mi, c)}%` }} />
              </div>
              <span className="mono small" style={{ width: 52, textAlign: 'right' }}>
                {P(mi, c).toFixed(3)}
              </span>
            </div>
          ))}
          <div style={{ marginTop: 10 }}>
            <span className={`verdict ${perfect ? 'good' : 'bad'}`}>{perfect ? 'perfectly secure' : 'NOT perfectly secure'}</span>
          </div>
          <KV
            items={[
              { k: '|K| vs |M|', v: `${C.keys.length} vs ${C.msgs.length}` },
              { k: 'best pair (m₀, m₁)', v: best.sd > 0 ? `${C.msgs[best.m0]}, ${C.msgs[best.m1]}` : '—' },
              { k: 'best win probability', v: (0.5 + best.sd / 2).toFixed(3) },
            ]}
          />
        </div>
      </div>
    </VizFrame>
  );
}

// ------------------------------------------------------------------ XOR / two-time pad

export function XorPad() {
  const [m1, setM1] = useState('attack at dawn!');
  const [m2, setM2] = useState('retreat at noon');
  const [seed, setSeed] = useState(7);
  const [crib, setCrib] = useState(' at ');
  const [pos, setPos] = useState(6);
  const [target, setTarget] = useState('attack at dusk!');
  const b1 = utf8(m1);
  const b2 = utf8(m2);
  const n = Math.max(b1.length, b2.length);
  const key = randomBytes(n, seed);
  const c1 = xor(b1, key);
  const c2 = xor(b2, key);
  const x = xor(c1, c2);
  const cb = utf8(crib);
  const p = Math.min(Math.max(0, pos), Math.max(0, x.length - cb.length));
  const revealed = xor(x.slice(p, p + cb.length), cb);
  const tb = utf8(target.padEnd(b1.length).slice(0, b1.length));
  const forged = xor(xor(c1, b1), tb);
  return (
    <VizFrame title="One-time pad: bits, two-time pad and malleability" caption="The key is random and as long as the message. Reusing it (two-time pad) leaks m₁ ⊕ m₂, which a guessed word (a 'crib') turns into plaintext. Flipping ciphertext bits flips exactly the same plaintext bits: the OTP gives secrecy, not integrity.">
      <div className="viz-controls">
        <label className="field">
          m₁
          <input type="text" value={m1} onChange={(e) => setM1(e.target.value)} />
        </label>
        <label className="field">
          m₂ (same key!)
          <input type="text" value={m2} onChange={(e) => setM2(e.target.value)} />
        </label>
        <div>
          <button className="btn sm" onClick={() => setSeed(seed + 1)}>
            New random key
          </button>
        </div>
      </div>
      <Bytes label="key k" data={key} />
      <Bytes label="c₁ = m₁ ⊕ k" data={c1} />
      <Bytes label="c₂ = m₂ ⊕ k" data={c2} />
      <Bytes label="c₁ ⊕ c₂" data={x} highlight={(i) => i >= p && i < p + cb.length} />
      <Bytes label="m₁ ⊕ m₂" data={xor(b1, b2)} />
      <div className="callout small" style={{ marginTop: 10 }}>
        <b>Two-time pad.</b> The key cancels: c₁ ⊕ c₂ = m₁ ⊕ m₂. Guess that m₁ contains{' '}
        <input type="text" value={crib} onChange={(e) => setCrib(e.target.value)} style={{ width: 90 }} /> at position{' '}
        <input type="number" min={0} max={Math.max(0, x.length - 1)} value={pos} onChange={(e) => setPos(+e.target.value)} style={{ width: 64 }} /> → m₂ there reads{' '}
        <b className="mono">“{fromUtf8(revealed)}”</b>. Readable text means the guess was right.
      </div>
      <div className="callout small">
        <b>Malleability.</b> Knowing m₁ (or just part of it), anyone can turn c₁ into an encryption of{' '}
        <input type="text" value={target} onChange={(e) => setTarget(e.target.value)} style={{ width: 160 }} /> without the key: c′ = c₁ ⊕ m₁ ⊕ m′.
        <Bytes label="c′" data={forged} highlight={(i) => forged[i] !== c1[i]} />
        <Bytes label="D(k, c′)" data={xor(forged, key)} ascii />
      </div>
    </VizFrame>
  );
}

// ------------------------------------------------------------------ attack games

type GameKind = 'ss' | 'prg' | 'prp' | 'cpa' | 'cca' | 'ef' | 'ci';

interface GamePreset {
  game: GameKind;
  title: string;
  scheme: string;
  adversary: string;
  /** Exact winning probability of this adversary. */
  theory: number;
  trial: (rng: Rng) => { win: boolean; log: string[] };
}

const GAME_NAME: Record<GameKind, string> = {
  ss: 'Semantic security',
  prg: 'PRG game',
  prp: 'PRP game',
  cpa: 'CPA game',
  cca: 'CCA game',
  ef: 'Existential forgery',
  ci: 'Ciphertext integrity',
};

const parity = (x: number) => {
  let p = 0;
  while (x) {
    p ^= x & 1;
    x >>>= 1;
  }
  return p;
};

/** 8-bit toy block cipher: a random permutation per key. */
const BLOCK = 256;

const PRESETS: Record<string, GamePreset> = {
  'ss-otp': {
    game: 'ss',
    title: 'OTP (8-bit) under semantic security',
    scheme: 'E(k, m) = m ⊕ k with a fresh uniform 8-bit key.',
    adversary: 'Send m₀ = 00000000, m₁ = 11111111; guess 1 iff c has more ones than zeros.',
    theory: 0.5,
    trial: (r) => {
      const b = r.int(0, 1);
      const k = r.int(0, 255);
      const c = (b ? 255 : 0) ^ k;
      const ones = c.toString(2).split('1').length - 1;
      const g = ones > 4 ? 1 : ones < 4 ? 0 : r.int(0, 1);
      return { win: g === b, log: [`b = ${b}, k = ${hex(k)}`, `c = ${hex(c)} (${ones} ones)`, `guess ${g}`] };
    },
  },
  'ss-weakprg': {
    game: 'ss',
    title: 'Stream cipher with a parity-bit PRG',
    scheme: 'G(s) = s ‖ parity(s) for a 7-bit seed s; E(s, m) = m ⊕ G(s) on 8-bit messages.',
    adversary: 'Send m₀ = 00000000, m₁ = 00000001. Guess 0 iff the last bit of c equals the parity of the first 7 bits.',
    theory: 1,
    trial: (r) => {
      const b = r.int(0, 1);
      const s = r.int(0, 127);
      const ks = (s << 1) | parity(s);
      const c = ks ^ b;
      const g = (c & 1) === parity(c >>> 1) ? 0 : 1;
      return { win: g === b, log: [`b = ${b}, seed = ${hex(s)}, keystream = ${hex(ks)}`, `c = ${hex(c)}`, `guess ${g}`] };
    },
  },
  'prg-weak': {
    game: 'prg',
    title: 'Parity-bit PRG in the PRG game',
    scheme: 'G(s) = s ‖ parity(s), s ∈ {0,1}⁷.',
    adversary: 'Output “fake” iff the last bit of r equals the parity of the first 7 bits.',
    theory: 0.75,
    trial: (r) => {
      const fake = r.int(0, 1) === 1;
      const s = r.int(0, 127);
      const v = fake ? (s << 1) | parity(s) : r.int(0, 255);
      const say = (v & 1) === parity(v >>> 1);
      return { win: say === fake, log: [`challenger: ${fake ? 'fake' : 'rand'}`, `r = ${v.toString(2).padStart(8, '0')}`, `adversary: ${say ? 'fake' : 'rand'}`] };
    },
  },
  'prp-otp': {
    game: 'prp',
    title: '“OTP” as a block cipher in the PRP game',
    scheme: 'E(k, x) = x ⊕ k on 8-bit blocks.',
    adversary: 'Query x₁ = 00, x₂ = 01 (hex). Output “fake” iff y₁ ⊕ y₂ = x₁ ⊕ x₂.',
    theory: 0.5 + 0.5 * (1 - 1 / (BLOCK - 1)),
    trial: (r) => {
      const fake = r.int(0, 1) === 1;
      const k = r.int(0, 255);
      const perm = toyPrp(r.int(0, 2 ** 31), BLOCK).enc;
      const f = (x: number) => (fake ? x ^ k : perm[x]);
      const y1 = f(0);
      const y2 = f(1);
      const say = (y1 ^ y2) === 1;
      return { win: say === fake, log: [`challenger: ${fake ? 'fake (k = ' + hex(k) + ')' : 'rand permutation'}`, `y₁ = ${hex(y1)}, y₂ = ${hex(y2)}, y₁⊕y₂ = ${hex(y1 ^ y2)}`, `adversary: ${say ? 'fake' : 'rand'}`] };
    },
  },
  'cpa-det': {
    game: 'cpa',
    title: 'Deterministic encryption under CPA',
    scheme: 'Any deterministic cipher, here an 8-bit block cipher with a fixed key.',
    adversary: 'Round 1: (m, m). Round 2: (m, m′). Guess 0 iff the two ciphertexts are equal.',
    theory: 1,
    trial: (r) => {
      const b = r.int(0, 1);
      const E = toyPrp(r.int(0, 2 ** 31)).enc;
      const m = r.int(0, 255);
      const m2 = (m + 1 + r.int(0, 254)) % 256;
      const c1 = E[m];
      const c2 = E[b ? m2 : m];
      const g = c1 === c2 ? 0 : 1;
      return { win: g === b, log: [`round 1: (${hex(m)}, ${hex(m)}) → ${hex(c1)}`, `round 2: (${hex(m)}, ${hex(m2)}) → ${hex(c2)}`, `guess ${g}`] };
    },
  },
  'cpa-randctr': {
    game: 'cpa',
    title: 'Randomized CTR mode under CPA',
    scheme: 'c = (IV, m ⊕ E(k, IV)) with a fresh random 8-bit IV (toy block size: IVs repeat with probability 1/256).',
    adversary: 'Same as for deterministic encryption: (m, m) then (m, m′); guess 0 iff the payloads match.',
    theory: 0.5 + 0.5 / BLOCK,
    trial: (r) => {
      const b = r.int(0, 1);
      const E = toyPrp(r.int(0, 2 ** 31)).enc;
      const m = r.int(0, 255);
      const m2 = (m + 1 + r.int(0, 254)) % 256;
      const iv1 = r.int(0, 255);
      const iv2 = r.int(0, 255);
      const c1 = m ^ E[iv1];
      const c2 = (b ? m2 : m) ^ E[iv2];
      const g = iv1 === iv2 ? (c1 === c2 ? 0 : 1) : r.int(0, 1);
      return { win: g === b, log: [`round 1 → (IV ${hex(iv1)}, ${hex(c1)})`, `round 2 → (IV ${hex(iv2)}, ${hex(c2)})`, iv1 === iv2 ? `IV repeated! guess ${g}` : `different IVs, ciphertexts unrelated: random guess ${g}`] };
    },
  },
  'cpa-predcbc': {
    game: 'cpa',
    title: 'CBC with a predictable IV',
    scheme: 'CBC on one 8-bit block, but IVᵢ₊₁ = IVᵢ + 1 (a counter) instead of a random IV.',
    adversary: 'Round 1: (m, m) → (IV₁, c₁). Round 2: m₀ = m ⊕ IV₁ ⊕ IV₂ and m₁ = anything else. If b = 0, E(k, m₀ ⊕ IV₂) = E(k, m ⊕ IV₁) = c₁.',
    theory: 1,
    trial: (r) => {
      const b = r.int(0, 1);
      const E = toyPrp(r.int(0, 2 ** 31)).enc;
      const iv1 = r.int(0, 255);
      const iv2 = (iv1 + 1) % 256;
      const m = r.int(0, 255);
      const c1 = E[m ^ iv1];
      const m0 = m ^ iv1 ^ iv2;
      const m1 = m0 ^ 0x80;
      const c2 = E[(b ? m1 : m0) ^ iv2];
      const g = c2 === c1 ? 0 : 1;
      return { win: g === b, log: [`round 1: IV₁ = ${hex(iv1)}, c₁ = ${hex(c1)}`, `predict IV₂ = ${hex(iv2)}, send m₀ = ${hex(m0)}, m₁ = ${hex(m1)}`, `c₂ = ${hex(c2)} → guess ${g}`] };
    },
  },
  'cca-ctr': {
    game: 'cca',
    title: 'Randomized CTR under CCA (no MAC)',
    scheme: 'c = (IV, m ⊕ E(k, IV)); decryption accepts anything.',
    adversary: 'Plaintext query (00, FF) → (IV, e). Ciphertext query (IV, e ⊕ 01) ≠ c → get m_b ⊕ 01. Read off b.',
    theory: 1,
    trial: (r) => {
      const b = r.int(0, 1);
      const E = toyPrp(r.int(0, 2 ** 31)).enc;
      const iv = r.int(0, 255);
      const e = (b ? 0xff : 0) ^ E[iv];
      const M = (e ^ 1) ^ E[iv];
      const g = (M ^ 1) === 0xff ? 1 : 0;
      return { win: g === b, log: [`plaintext query → (IV ${hex(iv)}, ${hex(e)})`, `ciphertext query (IV ${hex(iv)}, ${hex(e ^ 1)}) → ${hex(M)}`, `M ⊕ 01 = ${hex(M ^ 1)} → guess ${g}`] };
    },
  },
  'cca-etm': {
    game: 'cca',
    title: 'Encrypt-then-MAC under CCA',
    scheme: 'Randomized CTR, then a MAC on (IV, e); decryption returns ⊥ unless the tag verifies (8-bit toy tag).',
    adversary: 'The same bit-flipping attack. The modified ciphertext has an invalid tag, so the challenger answers ⊥ (unless the 8-bit tag is guessed, probability 1/256).',
    theory: 0.5 + 0.5 / BLOCK,
    trial: (r) => {
      const b = r.int(0, 1);
      const E = toyPrp(r.int(0, 2 ** 31)).enc;
      const iv = r.int(0, 255);
      const e = (b ? 0xff : 0) ^ E[iv];
      const tagOk = r.int(0, 255) === 0; // forging the tag of a new ciphertext = guessing
      if (tagOk) {
        const M = (e ^ 1) ^ E[iv];
        const g = (M ^ 1) === 0xff ? 1 : 0;
        return { win: g === b, log: ['ciphertext query with a lucky tag guess', `→ ${hex(M)}`, `guess ${g}`] };
      }
      const g = r.int(0, 1);
      return { win: g === b, log: [`plaintext query → (IV ${hex(iv)}, ${hex(e)}, t)`, `ciphertext query (IV ${hex(iv)}, ${hex(e ^ 1)}, t) → ⊥`, `nothing learnt: random guess ${g}`] };
    },
  },
  'ef-cbcmac': {
    game: 'ef',
    title: 'Raw CBC-MAC on variable-length messages',
    scheme: 'S(k, x₁‖…‖xⱼ) = last CBC block with IV = 0 (8-bit toy blocks).',
    adversary: 'Query a one-block message m → t = E(k, m). Output the forgery (m ‖ (m ⊕ t), t): its CBC chain is E(k, t ⊕ m ⊕ t) = E(k, m) = t.',
    theory: 1,
    trial: (r) => {
      const E = toyPrp(r.int(0, 2 ** 31)).enc;
      const m = r.int(0, 255);
      const t = E[m];
      const x2 = m ^ t;
      const t2 = E[E[m] ^ x2];
      return { win: t2 === t, log: [`query ${hex(m)} → t = ${hex(t)}`, `forge (${hex(m)} ‖ ${hex(x2)}, ${hex(t)})`, `verifier computes ${hex(t2)}: ${t2 === t ? 'accept' : 'reject'}`] };
    },
  },
  'ef-ecbc': {
    game: 'ef',
    title: 'ECBC-MAC (encrypted last block)',
    scheme: 'Tag = E(k₂, CBC(k₁, m)): the extra encryption under an independent key.',
    adversary: 'The same two-block forgery (m ‖ (m ⊕ t), t). Now the chain value is E(k₁, m) ≠ t, so it fails except by luck (1/256).',
    theory: 1 / BLOCK,
    trial: (r) => {
      const E1 = toyPrp(r.int(0, 2 ** 31)).enc;
      const E2 = toyPrp(r.int(0, 2 ** 31)).enc;
      const m = r.int(0, 255);
      const t = E2[E1[m]];
      const x2 = m ^ t;
      const t2 = E2[E1[E1[m] ^ x2]];
      return { win: t2 === t, log: [`query ${hex(m)} → t = ${hex(t)}`, `forge (${hex(m)} ‖ ${hex(x2)}, ${hex(t)})`, `verifier computes ${hex(t2)}: ${t2 === t ? 'accept' : 'reject'}`] };
    },
  },
};

export function AttackGame({ preset = 'ss-weakprg', presets }: Record<string, unknown>) {
  const allowed = Array.isArray(presets) ? (presets as string[]).filter((p) => p in PRESETS) : Object.keys(PRESETS);
  const [id, setId] = useState(allowed.includes(String(preset)) ? String(preset) : allowed[0]);
  const [n, setN] = useState(400);
  const [seed, setSeed] = useState(1);
  const P = PRESETS[id];
  const ef = P.game === 'ef' || P.game === 'ci';
  const run = useMemo(() => {
    const rng = makeRng(seed * 7919 + id.length);
    let wins = 0;
    const pts: [number, number][] = [];
    let last: string[] = [];
    for (let i = 1; i <= n; i++) {
      const t = P.trial(rng);
      if (t.win) wins++;
      if (i === n) last = t.log;
      if (i % Math.max(1, Math.floor(n / 200)) === 0 || i === n) pts.push([i, ef ? wins / i : Math.abs(wins / i - 0.5)]);
    }
    return { wins, pts, last };
  }, [P, n, seed, ef, id]);
  const theoryAdv = ef ? P.theory : Math.abs(P.theory - 0.5);
  const empAdv = ef ? run.wins / n : Math.abs(run.wins / n - 0.5);
  const ymax = ef ? 1 : 0.5;
  return (
    <VizFrame
      title="Attack game simulator"
      caption={
        ef
          ? 'In forgery games there is no coin to guess: the advantage is simply the probability of producing a valid new (message, tag) pair.'
          : 'Advantage = |P(adversary wins) − ½|. The empirical value converges to the exact one; a secure scheme keeps it negligible for every efficient adversary.'
      }
    >
      <div className="viz-controls">
        <label className="field">
          Scenario
          <select value={id} onChange={(e) => setId(e.target.value)}>
            {allowed.map((k) => (
              <option key={k} value={k}>
                {GAME_NAME[PRESETS[k].game]}: {PRESETS[k].title}
              </option>
            ))}
          </select>
        </label>
        <Slider label="trials" value={n} min={20} max={3000} step={20} onChange={setN} />
        <div>
          <button className="btn sm" onClick={() => setSeed(seed + 1)}>
            Re-run
          </button>
        </div>
      </div>
      <div className="small">
        <div>
          <b>Scheme.</b> {P.scheme}
        </div>
        <div>
          <b>Adversary.</b> {P.adversary}
        </div>
      </div>
      <Chart x={[0, n]} y={[0, ymax]} height={220} xLabel="trials" yLabel={ef ? 'P(win)' : 'advantage'} xFormat={(v) => String(Math.round(v))} yFormat={(v) => v.toFixed(2)}>
        {(sx, sy) => (
          <>
            <line x1={sx(0)} x2={sx(n)} y1={sy(theoryAdv)} y2={sy(theoryAdv)} stroke="var(--c2)" strokeDasharray="5 4" strokeWidth={2} />
            <path d={linePath(run.pts, sx, sy)} stroke="var(--c1)" strokeWidth={2} fill="none" />
          </>
        )}
      </Chart>
      <Legend
        items={[
          { label: 'empirical', color: 'var(--c1)' },
          { label: 'exact', color: 'var(--c2)', dash: true },
        ]}
      />
      <KV
        items={[
          { k: 'wins', v: `${run.wins} / ${n}` },
          { k: ef ? 'empirical P(win)' : 'empirical advantage', v: empAdv.toFixed(3) },
          { k: ef ? 'exact P(win)' : 'exact advantage', v: theoryAdv.toFixed(3) },
        ]}
      />
      <div className="small muted">
        Last game: {run.last.map((l, i) => (
          <span key={i} className="mono">
            {i > 0 ? ' → ' : ''}
            {l}
          </span>
        ))}
      </div>
    </VizFrame>
  );
}

// ------------------------------------------------------------------ negligible

const FUNCS: { id: string; label: string; f: (l: number) => number; color: string; negl: boolean }[] = [
  { id: 'p2', label: '1/λ²', f: (l) => -2 * Math.log2(l), color: 'var(--c1)', negl: false },
  { id: 'p10', label: '1/λ¹⁰', f: (l) => -10 * Math.log2(l), color: 'var(--c5)', negl: false },
  { id: 'llog', label: 'λ^(−log λ)', f: (l) => -Math.log2(l) * Math.log2(l), color: 'var(--c3)', negl: true },
  { id: 'sqrt', label: '2^(−√λ)', f: (l) => -Math.sqrt(l), color: 'var(--c4)', negl: true },
  { id: 'exp', label: '2^(−λ)', f: (l) => -l, color: 'var(--c2)', negl: true },
];

export function Negligible() {
  const [lam, setLam] = useState(128);
  const [q, setQ] = useState(40);
  const xs = Array.from({ length: 255 }, (_, i) => i + 2);
  return (
    <VizFrame
      title="Negligible vs. non-negligible"
      caption="On a log scale an inverse polynomial is a slowly falling curve, a negligible function eventually falls below all of them. An efficient adversary repeating its attack poly(λ) times multiplies its success by at most a polynomial: the product of a polynomial and a negligible function is still negligible."
    >
      <div className="viz-controls">
        <Slider label="security parameter λ" value={lam} min={8} max={256} step={1} onChange={setLam} />
        <Slider label="repetitions 2^q of the attack" value={q} min={0} max={80} step={1} onChange={setQ} format={(v) => `2^${v}`} />
      </div>
      <Chart x={[2, 256]} y={[-200, 0]} height={240} xLabel="λ" yLabel="log₂ ε(λ)" xFormat={(v) => String(v)} yFormat={(v) => String(v)}>
        {(sx, sy) => (
          <>
            <line x1={sx(lam)} x2={sx(lam)} y1={sy(-200)} y2={sy(0)} stroke="var(--border-strong)" strokeDasharray="3 3" />
            <line x1={sx(2)} x2={sx(256)} y1={sy(-128)} y2={sy(-128)} stroke="var(--fg-faint)" strokeDasharray="2 4" />
            {FUNCS.map((F) => (
              <path key={F.id} d={linePath(xs.map((l) => [l, Math.max(-210, F.f(l))]), sx, sy)} stroke={F.color} strokeWidth={2} fill="none" />
            ))}
          </>
        )}
      </Chart>
      <Legend items={FUNCS.map((F) => ({ label: `${F.label}${F.negl ? ' (negligible)' : ''}`, color: F.color }))} />
      <div className="scroll-x">
        <table className="data-table" style={{ marginTop: 8 }}>
          <thead>
            <tr>
              <th>ε(λ) at λ = {lam}</th>
              <th className="num">log₂ ε</th>
              <th className="num">after 2^{q} tries (log₂)</th>
            </tr>
          </thead>
          <tbody>
            {FUNCS.map((F) => (
              <tr key={F.id}>
                <td>{F.label}</td>
                <td className="num">{F.f(lam).toFixed(1)}</td>
                <td className="num">{Math.min(0, F.f(lam) + q).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="small muted">Dotted line: 2⁻¹²⁸, the usual practical threshold for “never happens”.</div>
    </VizFrame>
  );
}

