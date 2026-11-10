/** MAC constructions and attacks; authenticated encryption compositions. */
import { useMemo, useState } from 'react';
import { KV, Seg, Slider, VizFrame } from '../kit';
import { aesCipher, ctr, type BlockCipher } from '../../math/crypto/aes';
import { concat, toHex, utf8, xor } from '../../math/crypto/bytes';
import { mdHash, MD_BLOCK, hex32 } from '../../math/crypto/toyHash';
import { Bytes, randomBytes } from './ckit';

const toyH = (b: Uint8Array) => mdHash(b).chain.at(-1)!;
const u32 = (x: number) => new Uint8Array([(x >>> 24) & 0xff, (x >>> 16) & 0xff, (x >>> 8) & 0xff, x & 0xff]);

/** HMAC over the toy MD hash (block size 16 bytes). */
export function toyHmac(key: Uint8Array, m: Uint8Array): number {
  let k = key.length > MD_BLOCK ? u32(toyH(key)) : key;
  const kk = new Uint8Array(MD_BLOCK);
  kk.set(k);
  k = kk;
  const ki = k.map((x) => x ^ 0x36);
  const ko = k.map((x) => x ^ 0x5c);
  return toyH(concat(ko, u32(toyH(concat(ki, m)))));
}

// ---- CBC-MAC family with AES (16-byte blocks)
const chain = (E: BlockCipher, data: Uint8Array) => {
  let y: Uint8Array = new Uint8Array(16);
  for (let i = 0; i < data.length; i += 16) y = E.enc(xor(y, data.slice(i, i + 16)));
  return y;
};
const pad10 = (m: Uint8Array) => {
  const n = 16 - (m.length % 16);
  const p = new Uint8Array(n);
  p[0] = 0x80;
  return concat(m, p);
};
/** Multiplication by x in GF(2^128) (the CMAC "dbl"). */
const dbl = (b: Uint8Array) => {
  const out = new Uint8Array(16);
  for (let i = 0; i < 16; i++) out[i] = ((b[i] << 1) | (i < 15 ? b[i + 1] >> 7 : 0)) & 0xff;
  if (b[0] & 0x80) out[15] ^= 0x87;
  return out;
};
const rawCbcMac = (E: BlockCipher, m: Uint8Array) => chain(E, m.length % 16 ? pad10(m) : m);
const ecbcMac = (E1: BlockCipher, E2: BlockCipher, m: Uint8Array) => E2.enc(chain(E1, pad10(m)));
function cmac(E: BlockCipher, m: Uint8Array) {
  const L = E.enc(new Uint8Array(16));
  const k1 = dbl(L);
  const k2 = dbl(k1);
  const aligned = m.length > 0 && m.length % 16 === 0;
  const mm = aligned ? m.slice() : pad10(m);
  const last = mm.length - 16;
  const kx = aligned ? k1 : k2;
  for (let i = 0; i < 16; i++) mm[last + i] ^= kx[i];
  return chain(E, mm);
}

export function MacLab({ tab: initial = 'hmac' }: Record<string, unknown>) {
  const [tab, setTab] = useState<'hmac' | 'cbc' | 'poly'>((['hmac', 'cbc', 'poly'].includes(String(initial)) ? initial : 'hmac') as 'hmac' | 'cbc' | 'poly');
  return (
    <VizFrame title="MAC lab: constructions and the attacks they stop" caption="A MAC is secure if no efficient adversary, after seeing tags of messages of its choice, can produce a valid tag for any new message (existential forgery).">
      <Seg
        value={tab}
        onChange={setTab}
        options={[
          { v: 'hmac', label: 'h(k‖m) vs HMAC' },
          { v: 'cbc', label: 'CBC-MAC, ECBC, CMAC' },
          { v: 'poly', label: 'One-time polynomial MAC' },
        ]}
      />
      <div style={{ marginTop: 10 }}>{tab === 'hmac' ? <HmacTab /> : tab === 'cbc' ? <CbcTab /> : <PolyTab />}</div>
    </VizFrame>
  );
}

function HmacTab() {
  const [key] = useState(() => randomBytes(8, 99));
  const [msg, setMsg] = useState('amount=10&to=alice');
  const m = utf8(msg);
  const naive = toyH(concat(key, m));
  const hm = toyHmac(key, m);
  return (
    <>
      <svg viewBox="0 0 520 120" width="100%" style={{ maxWidth: 520 }}>
        <rect x={4} y={20} width={90} height={26} rx={4} className="diagram-box" />
        <text x={49} y={37} fontSize={11} textAnchor="middle">
          k ⊕ ipad
        </text>
        <rect x={98} y={20} width={60} height={26} rx={4} className="diagram-box" />
        <text x={128} y={37} fontSize={11} textAnchor="middle">
          m
        </text>
        <line x1={160} y1={33} x2={190} y2={33} className="diagram-line" />
        <rect x={190} y={20} width={40} height={26} rx={4} className="diagram-op" />
        <text x={210} y={37} fontSize={12} textAnchor="middle" fontWeight={700}>
          h
        </text>
        <line x1={230} y1={33} x2={250} y2={33} className="diagram-line" />
        <line x1={250} y1={33} x2={250} y2={85} className="diagram-line" />
        <rect x={130} y={72} width={90} height={26} rx={4} className="diagram-box" />
        <text x={175} y={89} fontSize={11} textAnchor="middle">
          k ⊕ opad
        </text>
        <rect x={224} y={72} width={60} height={26} rx={4} className="diagram-box" />
        <text x={254} y={89} fontSize={10} textAnchor="middle">
          inner
        </text>
        <line x1={286} y1={85} x2={316} y2={85} className="diagram-line" />
        <rect x={316} y={72} width={40} height={26} rx={4} className="diagram-op" />
        <text x={336} y={89} fontSize={12} textAnchor="middle" fontWeight={700}>
          h
        </text>
        <line x1={356} y1={85} x2={390} y2={85} className="diagram-line" />
        <text x={396} y={89} fontSize={12} fontWeight={700}>
          tag
        </text>
        <text x={300} y={20} fontSize={10}>
          ipad = 0x36…, opad = 0x5c… (key padded to a block)
        </text>
      </svg>
      <div className="viz-controls">
        <label className="field">
          message m
          <input type="text" value={msg} onChange={(e) => setMsg(e.target.value)} />
        </label>
      </div>
      <div className="scroll-x">
        <table className="data-table">
          <thead>
            <tr>
              <th>MAC</th>
              <th>tag of m</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>h(k ‖ m)</td>
              <td className="mono">{hex32(naive)}</td>
            </tr>
            <tr>
              <td>HMAC</td>
              <td className="mono">{hex32(hm)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="small">
        With a Merkle–Damgård hash, h(k‖m) is insecure because of length extension (lecture 05): the tag is the full internal state after the padded message. In HMAC the visible tag is the output of the <i>outer</i> hash, which
        hides the inner state. h(m‖k) avoids length extension but fails as soon as h has a collision: h(m) = h(m′) ⇒ the tags of m and m′ agree.
      </p>
    </>
  );
}

function CbcTab() {
  const [seed, setSeed] = useState(5);
  const [msg, setMsg] = useState('PAY 0010 EUR->BO');
  const E = useMemo(() => aesCipher(randomBytes(16, seed)), [seed]);
  const E2 = useMemo(() => aesCipher(randomBytes(16, seed + 77)), [seed]);
  const m = utf8(msg.padEnd(16, ' ').slice(0, 16));
  const t = rawCbcMac(E, m);
  const forged = concat(m, xor(m, t));
  const tEcbc = ecbcMac(E, E2, m);
  const forgedE = concat(m, xor(m, tEcbc));
  const tC = cmac(E, m);
  const forgedC = concat(m, xor(m, tC));
  const rows = [
    { name: 'raw CBC-MAC', tag: t, forged, ok: toHex(rawCbcMac(E, forged)) === toHex(t) },
    { name: 'ECBC-MAC', tag: tEcbc, forged: forgedE, ok: toHex(ecbcMac(E, E2, forgedE)) === toHex(tEcbc) },
    { name: 'CMAC', tag: tC, forged: forgedC, ok: toHex(cmac(E, forgedC)) === toHex(tC) },
  ];
  return (
    <>
      <p className="small">
        Raw CBC-MAC tags the last block of the CBC chain (IV = 0). It is secure only for prefix-free message sets. Query a one-block message m to get t = E(k, m). Then the two-block message m ‖ (m ⊕ t) has chain E(k, E(k, m) ⊕ m ⊕ t) =
        E(k, m) = t: a valid tag for a new message without any further query.
      </p>
      <div className="viz-controls">
        <label className="field">
          one-block message m (16 chars)
          <input type="text" value={msg} maxLength={16} onChange={(e) => setMsg(e.target.value)} />
        </label>
        <div>
          <button className="btn sm" onClick={() => setSeed(seed + 1)}>
            New key
          </button>
        </div>
      </div>
      <div className="scroll-x">
        <table className="data-table">
          <thead>
            <tr>
              <th>MAC</th>
              <th>t = tag(m)</th>
              <th>forgery (m ‖ m⊕t, t)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td className="mono small">{toHex(r.tag).slice(0, 16)}…</td>
                <td>
                  <span className={`verdict ${r.ok ? 'bad' : 'good'}`}>{r.ok ? 'accepted — forged' : 'rejected'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Bytes label="forged message" data={forged} />
      <p className="small">
        <b>ECBC</b> encrypts the chain output once more under an independent key k₂, so the tag no longer equals an intermediate chain value. <b>CMAC</b> instead XORs a key-derived block (k₁ if the message is block-aligned, k₂ after 10*
        padding otherwise) into the last block: a cheap prefix-free encoding. It also avoids adding a whole padding block to aligned messages, since the choice between k₁ and k₂ already tells padded and unpadded messages apart.
      </p>
    </>
  );
}

function PolyTab() {
  const p = 101;
  const [msg, setMsg] = useState('12 7 33');
  const [msg2, setMsg2] = useState('12 7 34');
  const [a, setA] = useState(17);
  const [b, setB] = useState(58);
  const parse = (s: string) => s.split(/[\s,]+/).filter(Boolean).map((x) => ((+x % p) + p) % p);
  const P = (m: number[], y: number) => {
    // y^{j+1} + m_j y^j + … + m_1 y   (Horner)
    let acc = 1;
    for (let i = m.length - 1; i >= 0; i--) acc = (acc * y + m[i]) % p;
    return (acc * y) % p;
  };
  const m1 = parse(msg);
  const m2 = parse(msg2);
  const t = (P(m1, a) + b) % p;
  // keys consistent with the observed pair: for each a', b' = t − P(m1, a')
  const hist = new Array(p).fill(0);
  for (let aa = 0; aa < p; aa++) {
    const bb = (((t - P(m1, aa)) % p) + p) % p;
    hist[(P(m2, aa) + bb) % p]++;
  }
  const maxCount = Math.max(...hist);
  return (
    <>
      <p className="small">
        Key (a, b) ∈ ℤₚ², message blocks m₁…mⱼ ∈ ℤₚ, tag = Pₘ(a) + b with Pₘ(y) = y^(j+1) + mⱼyʲ + … + m₁y (mod p). After seeing one tag, each of the p values of a is still possible (with a matching b). For a different message m′ the
        attacker’s best guess of the tag is right for at most deg/p of those keys.
      </p>
      <div className="viz-controls">
        <label className="field">
          m (blocks mod {p})
          <input type="text" value={msg} onChange={(e) => setMsg(e.target.value)} />
        </label>
        <label className="field">
          m′ to forge
          <input type="text" value={msg2} onChange={(e) => setMsg2(e.target.value)} />
        </label>
        <Slider label="a" value={a} min={0} max={p - 1} step={1} onChange={setA} />
        <Slider label="b" value={b} min={0} max={p - 1} step={1} onChange={setB} />
      </div>
      <KV
        items={[
          { k: 'observed tag of m', v: t },
          { k: 'true tag of m′', v: (P(m2, a) + b) % p },
          { k: 'best forgery success', v: `${maxCount}/${p} = ${(maxCount / p).toFixed(3)}` },
          { k: 'bound (j+1)/p', v: `${Math.max(m1.length, m2.length) + 1}/${p}` },
        ]}
      />
      <svg viewBox="0 0 520 90" width="100%" style={{ maxWidth: 520 }}>
        {hist.map((c, i) => (
          <rect key={i} x={10 + i * 5} y={80 - (c / Math.max(1, maxCount)) * 70} width={4} height={(c / Math.max(1, maxCount)) * 70} fill="var(--c1)" />
        ))}
      </svg>
      <div className="small muted">
        Histogram: how many keys consistent with (m, t) give each possible tag of m′. It is flat, so a single observed tag reveals (almost) nothing. A second tag under the same key would let the attacker solve for (a, b): this MAC is
        only one-time secure. Carter–Wegman makes it many-time: tag = (r, E(k₁, r) ⊕ Sₒₜ(k₂, m)) with fresh random r — and breaks completely if r repeats.
      </div>
    </>
  );
}

// ------------------------------------------------------------------ authenticated encryption

type Combo = 'none' | 'EtM' | 'MtE' | 'E&M';

export function AeLab() {
  const [combo, setCombo] = useState<Combo>('none');
  const [seed, setSeed] = useState(1);
  const [from, setFrom] = useState('100');
  const [to, setTo] = useState('900');
  const kE = useMemo(() => randomBytes(16, seed), [seed]);
  const kM = useMemo(() => randomBytes(8, seed + 5), [seed]);
  const iv = useMemo(() => randomBytes(16, seed + 9), [seed]);
  const E = useMemo(() => aesCipher(kE), [kE]);
  const msg = utf8(`PAY ${from} EUR TO BOB`);
  const tagOf = (x: Uint8Array) => u32(toyHmac(kM, x));
  // encryption per combination
  const enc = (() => {
    if (combo === 'none') return { c: ctr(E, iv, msg), t: null as Uint8Array | null };
    if (combo === 'EtM') {
      const c = ctr(E, iv, msg);
      return { c, t: tagOf(concat(iv, c)) };
    }
    if (combo === 'MtE') return { c: ctr(E, iv, concat(msg, tagOf(msg))), t: null };
    return { c: ctr(E, iv, msg), t: tagOf(msg) };
  })();
  // attacker: XOR the known digits with the wanted ones at position 4
  const delta = new Uint8Array(enc.c.length);
  const fb = utf8(from);
  const tb = utf8(to.padEnd(fb.length).slice(0, fb.length));
  for (let i = 0; i < fb.length; i++) delta[4 + i] = fb[i] ^ tb[i];
  const c2 = xor(enc.c, delta);
  const result = (() => {
    if (combo === 'none') return { ok: true, m: ctr(E, iv, c2) };
    if (combo === 'EtM') {
      const ok = toHex(tagOf(concat(iv, c2))) === toHex(enc.t!);
      return { ok, m: ok ? ctr(E, iv, c2) : null };
    }
    if (combo === 'MtE') {
      const d = ctr(E, iv, c2);
      const m = d.slice(0, d.length - 4);
      const ok = toHex(tagOf(m)) === toHex(d.slice(d.length - 4));
      return { ok, m: ok ? m : null };
    }
    const m = ctr(E, iv, c2);
    const ok = toHex(tagOf(m)) === toHex(enc.t!);
    return { ok, m: ok ? m : null };
  })();
  const NOTES: Record<Combo, string> = {
    none: 'CTR alone is CPA-secure but malleable: XORing (“100” ⊕ “900”) into the right ciphertext bytes changes the amount and decryption happily accepts it. In the CCA game this is a winning chosen-ciphertext query.',
    EtM: 'Encrypt-then-MAC: the tag covers the ciphertext (and IV), so any modified ciphertext is rejected before decryption. With a CPA-secure cipher and a secure MAC this is AE-secure — the theoretically sound choice (used in IPsec, and the idea behind GCM/ChaCha20-Poly1305).',
    MtE: 'MAC-then-Encrypt: the tag is inside the encryption. Here (randomized CTR) the modification breaks the tag and is rejected, and MtE with randomized CTR is provably AE-secure. With CBC and padding, however, the receiver checks the padding before the MAC, which created padding-oracle attacks (POODLE, Lucky 13). MtE is not AE-secure in general.',
    'E&M': 'Encrypt-and-MAC: the tag is computed on the plaintext and sent in the clear. The forgery is rejected here, but a deterministic MAC leaks whether two messages are equal (not CPA-secure), and the MAC need not hide the message at all (SSH used this; fragile).',
  };
  return (
    <VizFrame title="Authenticated encryption: combining a cipher and a MAC" caption="AE security = CPA security + ciphertext integrity. Ciphertext integrity means the adversary cannot create a new ciphertext that decrypts to anything other than ⊥; together they imply CCA security.">
      <div className="viz-controls">
        <Seg
          value={combo}
          onChange={setCombo}
          options={[
            { v: 'none', label: 'CTR only' },
            { v: 'EtM', label: 'Encrypt-then-MAC' },
            { v: 'MtE', label: 'MAC-then-Encrypt' },
            { v: 'E&M', label: 'Encrypt-and-MAC' },
          ]}
        />
        <label className="field">
          original amount
          <input type="text" value={from} maxLength={3} onChange={(e) => setFrom(e.target.value.slice(0, 3))} />
        </label>
        <label className="field">
          attacker wants
          <input type="text" value={to} maxLength={3} onChange={(e) => setTo(e.target.value.slice(0, 3))} />
        </label>
        <div>
          <button className="btn sm" onClick={() => setSeed(seed + 1)}>
            New keys
          </button>
        </div>
      </div>
      <Bytes label="plaintext" data={msg} ascii />
      <Bytes label="ciphertext c" data={enc.c} />
      {enc.t && <Bytes label="tag t" data={enc.t} />}
      <Bytes label="tampered c′" data={c2} highlight={(i) => c2[i] !== enc.c[i]} />
      <div className="row" style={{ gap: 10, marginTop: 6 }}>
        <span className={`verdict ${result.ok ? 'bad' : 'good'}`}>{result.ok ? 'receiver accepts' : 'receiver outputs ⊥'}</span>
        {result.m && <span className="mono">“{String.fromCharCode(...Array.from(result.m))}”</span>}
      </div>
      <p className="small" style={{ marginTop: 8 }}>
        {NOTES[combo]}
      </p>
    </VizFrame>
  );
}
