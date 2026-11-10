/** ChaCha, AES internals, GF(2^8) arithmetic and block-cipher modes. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { KV, Seg, Slider, VizFrame } from '../kit';
import { block as chachaBlock, initialState, invPermute, permute, quarterRoundSteps, SIGMA } from '../../math/crypto/chacha';
import { aesCipher, cbcDecrypt, cbcEncrypt, ctr, encryptBlockTrace, type BlockCipher } from '../../math/crypto/aes';
import { blocks, fromHex, hamming, hex32, pkcs7, popcount, toHex, utf8, xor } from '../../math/crypto/bytes';
import { gfInv, gfMulSteps, polyString, AES_POLY } from '../../math/crypto/gf2';
import { Bits, Bytes, StateGrid, hex, randomBytes } from './ckit';

const parseHex = (s: string, n: number) => {
  const b = fromHex(s);
  const out = new Uint8Array(n);
  out.set(b.slice(0, n));
  return out;
};

// ------------------------------------------------------------------ ChaCha

const QR_DEFAULT = ['11111111', '01020304', '9b8d6f43', '01234567'];

export function ChaChaViz() {
  const [words, setWords] = useState(QR_DEFAULT);
  const [step, setStep] = useState(12);
  const [bit, setBit] = useState(0);
  const [rounds, setRounds] = useState(10);
  const [ff, setFf] = useState(true);
  const w = words.map((x) => parseInt(x || '0', 16) >>> 0);
  const steps = quarterRoundSteps(w[0], w[1], w[2], w[3]);
  const cur = step === 0 ? { op: 'input', changed: -1, words: w as [number, number, number, number] } : steps[step - 1];

  const key = useMemo(() => Uint8Array.from({ length: 32 }, (_, i) => i), []);
  const nonce = useMemo(() => fromHex('000000090000004a00000000'), []);
  const key2 = useMemo(() => {
    const k = key.slice();
    k[bit >> 3] ^= 0x80 >> (bit & 7);
    return k;
  }, [key, bit]);
  const out1 = chachaBlock(key, 1, nonce, { doubleRounds: rounds, feedForward: ff });
  const out2 = chachaBlock(key2, 1, nonce, { doubleRounds: rounds, feedForward: ff });
  const dist = Array.from(out1).reduce((s, x, i) => s + popcount(x ^ out2[i]), 0);
  const perRound = Array.from({ length: 11 }, (_, r) => {
    const a = permute(initialState(key, 1, nonce), r);
    const b = permute(initialState(key2, 1, nonce), r);
    return Array.from(a).reduce((s, x, i) => s + popcount(x ^ b[i]), 0);
  });
  const recovered = invPermute(chachaBlock(key, 1, nonce, { feedForward: false }));
  return (
    <VizFrame title="ChaCha: ARX quarter round, diffusion and the final addition" caption="ChaCha only uses Add (mod 2³²), Rotate and XOR. One quarter round mixes four words; 20 rounds (10 column + diagonal double rounds) make every output bit depend on every input bit. The permutation itself is easy to invert, which is why the input is added back at the end.">
      <h4 style={{ margin: '4px 0' }}>1 · Quarter round, step by step</h4>
      <div className="viz-controls">
        {['a', 'b', 'c', 'd'].map((n, i) => (
          <label key={n} className="field">
            {n} (hex)
            <input type="text" value={words[i]} onChange={(e) => setWords(words.map((x, j) => (j === i ? e.target.value.replace(/[^0-9a-f]/gi, '').slice(0, 8) : x)))} />
          </label>
        ))}
      </div>
      <Slider label={`step ${step}/12: ${cur.op}`} value={step} min={0} max={12} step={1} onChange={setStep} />
      <div className="row" style={{ gap: 8, margin: '8px 0', flexWrap: 'wrap' }}>
        {cur.words.map((x, i) => (
          <div key={i} className="card tight" style={{ minWidth: 0, borderColor: i === cur.changed ? 'var(--c2)' : undefined }}>
            <div className="small muted">{'abcd'[i]}</div>
            <div className="mono">{hex32(x)}</div>
            <Bits bits={(x >>> 0).toString(2).padStart(32, '0')} group={8} highlight={(k) => step > 0 && i === cur.changed && ((((step === 1 ? w : steps[step - 2].words)[i] >>> (31 - k)) ^ (x >>> (31 - k))) & 1) === 1} />
          </div>
        ))}
      </div>
      <div className="small muted">The default input is the RFC 8439 test vector; after all 12 steps the result is ea2a92f4 cb1cf8ce 4581472e 5881c4bb.</div>

      <h4 style={{ margin: '14px 0 4px' }}>2 · Avalanche over the full block</h4>
      <div className="viz-controls">
        <Slider label="flip key bit #" value={bit} min={0} max={255} step={1} onChange={setBit} />
        <Slider label="double rounds" value={rounds} min={0} max={10} step={1} onChange={setRounds} format={(v) => `${v} (${2 * v} rounds)`} />
        <label className="row small" style={{ gap: 6 }}>
          <input type="checkbox" checked={ff} onChange={(e) => setFf(e.target.checked)} /> add input at the end (word-wise ⊞)
        </label>
      </div>
      <div className="row" style={{ gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <StateGrid state={out1} words colMajor={false} title="output, original key" />
        <StateGrid state={out2} words colMajor={false} changed={(i) => out1[i] !== out2[i]} title="output, one key bit flipped" />
        <div>
          <div className="small muted">differing bits after r double rounds (out of 512)</div>
          <svg viewBox="0 0 230 120" width={230}>
            {perRound.map((d, r) => (
              <g key={r}>
                <rect x={8 + r * 20} y={100 - (d / 512) * 180} width={14} height={(d / 512) * 180} fill={r === rounds ? 'var(--c2)' : 'var(--c1)'} rx={2} />
                <text x={15 + r * 20} y={114} fontSize={9} textAnchor="middle">
                  {r}
                </text>
              </g>
            ))}
            <line x1={4} x2={226} y1={100 - (256 / 512) * 180} y2={100 - (256 / 512) * 180} stroke="var(--fg-faint)" strokeDasharray="3 3" />
          </svg>
        </div>
      </div>
      <KV
        items={[
          { k: 'Hamming distance of outputs', v: `${dist} / 512 bits` },
          { k: 'ideal (random)', v: '≈ 256' },
        ]}
      />

      <h4 style={{ margin: '14px 0 4px' }}>3 · Why the final addition matters</h4>
      <p className="small">
        Without the word-wise addition the keystream block <i>is</i> the permuted state. Anyone can run the rounds backwards and read the key from rows 2–3 of the recovered state:
      </p>
      <StateGrid state={recovered} words colMajor={false} changed={(i) => i >= 4 && i < 12} title="inverse permutation of an output block computed without the addition" />
      <div className="small muted">
        Row 1 is the constant “expand 32-byte k” ({SIGMA.map((s) => hex32(s)).join(' ')}): a nothing-up-my-sleeve value. The highlighted words are the 256-bit key (here 00 01 02 … 1f, little-endian). With the addition, inverting
        needs the input you are trying to find.
      </div>
    </VizFrame>
  );
}

// ------------------------------------------------------------------ AES rounds

export function AesRound() {
  const [keyHex, setKeyHex] = useState('000102030405060708090a0b0c0d0e0f');
  const [ptHex, setPtHex] = useState('00112233445566778899aabbccddeeff');
  const [i, setI] = useState(1);
  const [flip, setFlip] = useState(0);
  const key = parseHex(keyHex, 16);
  const pt = parseHex(ptHex, 16);
  const { trace, out } = encryptBlockTrace(pt, key);
  const cur = trace[Math.min(i, trace.length - 1)];
  const prev = trace[Math.max(0, Math.min(i, trace.length - 1) - 1)];
  const pt2 = pt.slice();
  pt2[flip >> 3] ^= 0x80 >> (flip & 7);
  const t2 = encryptBlockTrace(pt2, key).trace;
  const roundEnds = trace.map((s, j) => ({ s, j })).filter(({ s }) => s.step === 'AddRoundKey');
  const DESC: Record<string, string> = {
    input: 'The 16 plaintext bytes fill the 4×4 state column by column.',
    AddRoundKey: 'XOR the round key into the state: the only step that uses the key.',
    SubBytes: 'Replace every byte by S(byte): inversion in GF(2⁸) followed by an affine map. The only non-linear step (confusion).',
    ShiftRows: 'Rotate row r left by r positions: bytes of one column spread over four columns.',
    MixColumns: 'Multiply each column by a fixed invertible matrix over GF(2⁸): every output byte depends on all four input bytes (diffusion). Skipped in the last round.',
  };
  return (
    <VizFrame title="AES-128 round by round" caption="10 rounds of SubBytes → ShiftRows → MixColumns → AddRoundKey after an initial AddRoundKey. Every step is invertible, so decryption just runs the inverses backwards with the round keys in reverse order.">
      <div className="viz-controls">
        <label className="field">
          key (hex)
          <input type="text" value={keyHex} onChange={(e) => setKeyHex(e.target.value)} />
        </label>
        <label className="field">
          plaintext (hex)
          <input type="text" value={ptHex} onChange={(e) => setPtHex(e.target.value)} />
        </label>
      </div>
      <Slider label={`step ${i}/${trace.length - 1}: round ${cur.round} · ${cur.step}`} value={i} min={0} max={trace.length - 1} step={1} onChange={setI} />
      <div className="row" style={{ gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', marginTop: 8 }}>
        <StateGrid state={prev.state} title="before" />
        <StateGrid state={cur.state} changed={(k) => i > 0 && cur.state[k] !== prev.state[k]} title={`after ${cur.step}`} />
        <p className="small" style={{ flex: 1, minWidth: 200 }}>
          {DESC[cur.step]}
        </p>
      </div>
      <Bytes label="ciphertext" data={out} />
      <h4 style={{ margin: '14px 0 4px' }}>Diffusion: flip one plaintext bit</h4>
      <Slider label="plaintext bit #" value={flip} min={0} max={127} step={1} onChange={setFlip} />
      <table className="heat" style={{ borderSpacing: 2, borderCollapse: 'separate' }}>
        <tbody>
          {roundEnds.map(({ s, j }) => {
            const d = Array.from(s.state).map((x, k) => x !== t2[j].state[k]);
            return (
              <tr key={j}>
                <td className="small muted" style={{ width: 70, paddingRight: 6 }}>
                  round {s.round}
                </td>
                {d.map((x, k) => (
                  <td key={k} style={{ background: x ? 'var(--c2)' : 'var(--bg-sunk)' }} title={`byte ${k}`} />
                ))}
                <td className="small muted" style={{ paddingLeft: 8 }}>
                  {d.filter(Boolean).length}/16 bytes, {hamming(s.state, t2[j].state)}/128 bits
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="small muted">After two rounds every byte has changed: ShiftRows spreads a byte to 4 columns, MixColumns spreads it within each column.</div>
    </VizFrame>
  );
}

// ------------------------------------------------------------------ GF(2^8)

export function Gf256() {
  const [a, setA] = useState(0x57);
  const [b, setB] = useState(0x83);
  const { result, steps } = gfMulSteps(a, b);
  const inv = gfInv(a);
  const small = 0b1011; // x^3 + x + 1
  const els = Array.from({ length: 8 }, (_, i) => i);
  return (
    <VizFrame title="Galois field GF(2⁸): bytes as polynomials" caption="A byte b₇…b₀ is the polynomial b₇x⁷ + … + b₀ over ℤ₂. Addition is XOR. Multiplication multiplies the polynomials and takes the remainder modulo the irreducible m(x) = x⁸ + x⁴ + x³ + x + 1 (0x11B), so the result is again a byte and every non-zero byte has an inverse.">
      <div className="viz-controls">
        <label className="field">
          a (hex)
          <input type="text" value={hex(a)} onChange={(e) => setA(parseInt(e.target.value || '0', 16) & 0xff)} />
        </label>
        <label className="field">
          b (hex)
          <input type="text" value={hex(b)} onChange={(e) => setB(parseInt(e.target.value || '0', 16) & 0xff)} />
        </label>
      </div>
      <KV
        items={[
          { k: 'a(x)', v: <span className="mono small">{polyString(a)}</span> },
          { k: 'b(x)', v: <span className="mono small">{polyString(b)}</span> },
          { k: 'a + b = a ⊕ b', v: <span className="mono">{hex(a ^ b)}</span> },
          { k: 'a • b', v: <span className="mono">{hex(result)}</span> },
          { k: 'a⁻¹', v: <span className="mono">{a ? hex(inv) : '— (0 has none)'}</span> },
        ]}
      />
      <div className="scroll-x">
        <table className="data-table">
          <thead>
            <tr>
              <th>i</th>
              <th>bit i of b</th>
              <th>a · xⁱ mod m(x)</th>
              <th>note</th>
              <th>running sum</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s, i) => (
              <tr key={i} style={{ opacity: s.used ? 1 : 0.55 }}>
                <td>{i}</td>
                <td>{s.used ? 1 : 0}</td>
                <td className="mono">
                  {hex(s.shifted)} = {s.shifted.toString(2).padStart(8, '0')}
                </td>
                <td className="small">{i === 0 ? 'a itself' : s.reduced ? 'shift left overflowed: XOR 0x1B' : 'shift left'}</td>
                <td className="mono">{s.used ? hex(s.acc) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="small muted">
        “Multiply by x” (xtime) is a left shift plus, if bit 7 fell out, an XOR with 0x1B — the low byte of m(x) = 0x{AES_POLY.toString(16)}. Multiplication by 2 and 3 in MixColumns is therefore just shifts and XORs.
      </div>
      <h4 style={{ margin: '14px 0 4px' }}>A small field you can check by hand: GF(2³) mod x³ + x + 1</h4>
      <div className="scroll-x">
        <table className="cipher-table">
          <thead>
            <tr>
              <th>•</th>
              {els.map((x) => (
                <th key={x}>{x.toString(2).padStart(3, '0')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {els.map((x) => (
              <tr key={x}>
                <th>{x.toString(2).padStart(3, '0')}</th>
                {els.map((y) => {
                  const p = gfMulSteps(x, y, small).result;
                  return (
                    <td key={y} className={p === 1 ? 'sel' : ''}>
                      {p.toString(2).padStart(3, '0')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="small muted">Highlighted cells equal 1: every non-zero row contains exactly one, i.e. every non-zero element has an inverse.</div>
    </VizFrame>
  );
}

// ------------------------------------------------------------------ block modes

type Mode = 'ECB' | 'CBC' | 'CTR';

function encryptMode(mode: Mode, E: BlockCipher, iv: Uint8Array, data: Uint8Array): Uint8Array {
  if (mode === 'CTR') return ctr(E, iv, data);
  const padded = data.length % 16 === 0 ? data : pkcs7(data, 16);
  const cts = mode === 'ECB' ? blocks(padded, 16).map((x) => E.enc(x)) : cbcEncrypt(E, iv, padded);
  return Uint8Array.from(cts.flatMap((c) => Array.from(c)));
}

function decryptMode(mode: Mode, E: BlockCipher, iv: Uint8Array, data: Uint8Array): Uint8Array {
  if (mode === 'CTR') return ctr(E, iv, data);
  const bl = blocks(data, 16);
  const pts = mode === 'ECB' ? bl.map((x) => E.dec(x)) : cbcDecrypt(E, iv, bl);
  return Uint8Array.from(pts.flatMap((c) => Array.from(c)));
}

function drawPicture(): Uint8Array {
  // 64×64 picture with large flat areas: a padlock on a light background.
  const W = 64;
  const img = new Uint8Array(W * W).fill(230);
  for (let y = 0; y < W; y++)
    for (let x = 0; x < W; x++) {
      const inBody = x >= 14 && x < 50 && y >= 28 && y < 58;
      const dx = x - 32;
      const dy = y - 28;
      const r = Math.sqrt(dx * dx + dy * dy);
      const inShackle = y < 30 && r >= 11 && r < 17;
      const hole = Math.abs(x - 32) < 3 && y >= 38 && y < 50;
      if (inShackle) img[y * W + x] = 90;
      if (inBody) img[y * W + x] = hole ? 230 : 30;
    }
  return img;
}

function ModeDiagram({ mode }: { mode: Mode }) {
  const xs = [70, 200, 330];
  return (
    <svg viewBox="0 0 440 170" width="100%" style={{ maxWidth: 440 }}>
      {mode !== 'ECB' && (
        <g>
          <rect x={4} y={mode === 'CBC' ? 64 : 10} width={44} height={24} rx={4} className="diagram-box" />
          <text x={26} y={mode === 'CBC' ? 80 : 26} fontSize={11} textAnchor="middle">
            IV
          </text>
        </g>
      )}
      {xs.map((x, i) => (
        <g key={i}>
          {mode === 'CTR' ? (
            <>
              <rect x={x - 30} y={10} width={60} height={24} rx={4} className="diagram-box" />
              <text x={x} y={26} fontSize={10} textAnchor="middle">
                IV ⊞ {i}
              </text>
              <line x1={x} y1={34} x2={x} y2={56} className="diagram-line" />
              <rect x={x - 22} y={56} width={44} height={26} rx={4} className="diagram-op" />
              <text x={x} y={73} fontSize={12} textAnchor="middle" fontWeight={700}>
                E(k,·)
              </text>
              <line x1={x} y1={82} x2={x} y2={106} className="diagram-line" />
              <rect x={x + 30} y={100} width={36} height={22} rx={4} className="diagram-box" />
              <text x={x + 48} y={115} fontSize={11} textAnchor="middle">
                m{i + 1}
              </text>
              <line x1={x + 30} y1={112} x2={x + 9} y2={112} className="diagram-line" />
              <circle cx={x} cy={112} r={8} className="diagram-op" />
              <text x={x} y={116} fontSize={12} textAnchor="middle">
                ⊕
              </text>
              <line x1={x} y1={120} x2={x} y2={140} className="diagram-line" />
              <text x={x} y={156} fontSize={12} textAnchor="middle" fontWeight={700}>
                c{i + 1}
              </text>
            </>
          ) : (
            <>
              <rect x={x - 18} y={6} width={36} height={22} rx={4} className="diagram-box" />
              <text x={x} y={21} fontSize={11} textAnchor="middle">
                m{i + 1}
              </text>
              <line x1={x} y1={28} x2={x} y2={mode === 'CBC' ? 68 : 56} className="diagram-line" />
              {mode === 'CBC' && (
                <>
                  <circle cx={x} cy={76} r={8} className="diagram-op" />
                  <text x={x} y={80} fontSize={12} textAnchor="middle">
                    ⊕
                  </text>
                  <line x1={i === 0 ? 48 : xs[i - 1]} y1={i === 0 ? 76 : 136} x2={x - 8} y2={76} className="diagram-line" />
                  <line x1={x} y1={84} x2={x} y2={96} className="diagram-line" />
                </>
              )}
              <rect x={x - 22} y={mode === 'CBC' ? 96 : 56} width={44} height={26} rx={4} className="diagram-op" />
              <text x={x} y={mode === 'CBC' ? 113 : 73} fontSize={12} textAnchor="middle" fontWeight={700}>
                E(k,·)
              </text>
              <line x1={x} y1={mode === 'CBC' ? 122 : 82} x2={x} y2={mode === 'CBC' ? 142 : 120} className="diagram-line" />
              <text x={x} y={mode === 'CBC' ? 158 : 136} fontSize={12} textAnchor="middle" fontWeight={700}>
                c{i + 1}
              </text>
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

function Picture({ data, label }: { data: Uint8Array; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    const im = ctx.createImageData(64, 64);
    for (let i = 0; i < 64 * 64; i++) {
      const v = data[i] ?? 0;
      im.data[4 * i] = v;
      im.data[4 * i + 1] = v;
      im.data[4 * i + 2] = v;
      im.data[4 * i + 3] = 255;
    }
    ctx.putImageData(im, 0, 0);
  }, [data]);
  return (
    <figure style={{ margin: 0, textAlign: 'center' }}>
      <canvas ref={ref} width={64} height={64} style={{ width: 128, height: 128, imageRendering: 'pixelated', borderRadius: 6, border: '1px solid var(--border)' }} />
      <figcaption className="small muted">{label}</figcaption>
    </figure>
  );
}

const blockColor = (b: Uint8Array) => {
  const h = (b[0] * 31 + b[1] * 7 + b[2]) % 360;
  return `hsl(${h} 70% 55% / 0.35)`;
};

export function BlockModes({ mode: initial = 'ECB' }: Record<string, unknown>) {
  const [mode, setMode] = useState<Mode>((['ECB', 'CBC', 'CTR'].includes(String(initial)) ? initial : 'ECB') as Mode);
  const [text, setText] = useState('YELLOW SUBMARINEYELLOW SUBMARINEhello world!');
  const [seed, setSeed] = useState(3);
  const [flipBlock, setFlipBlock] = useState(0);
  const key = useMemo(() => randomBytes(16, seed), [seed]);
  const iv = useMemo(() => randomBytes(16, seed + 1000), [seed]);
  const E = useMemo(() => aesCipher(key), [key]);
  const pt = utf8(text);
  const ct = encryptMode(mode, E, iv, pt);
  const ctBlocks = blocks(ct, 16);
  const ptBlocks = blocks(mode === 'CTR' ? pt : pt.length % 16 === 0 ? pt : pkcs7(pt, 16), 16);
  const fb = Math.min(flipBlock, Math.max(0, ctBlocks.length - 1));
  const tampered = ct.slice();
  if (tampered.length) tampered[16 * fb] ^= 0x01;
  const dec = decryptMode(mode, E, iv, tampered);
  const decBlocks = blocks(dec, 16);
  const pic = useMemo(() => drawPicture(), []);
  const encPic = useMemo(() => encryptMode(mode, E, iv, pic), [mode, E, iv, pic]);
  const counts = new Map<string, number>();
  ctBlocks.forEach((b) => counts.set(toHex(b), (counts.get(toHex(b)) ?? 0) + 1));
  return (
    <VizFrame title="Block-cipher modes: ECB vs CBC vs CTR (with AES-128)" caption="ECB encrypts equal blocks to equal ciphertext blocks, so patterns survive. CBC chains each block into the next through XOR with the previous ciphertext; CTR turns the block cipher into a stream cipher by encrypting a counter. Both need a fresh IV for every message.">
      <div className="viz-controls">
        <Seg value={mode} onChange={setMode} options={(['ECB', 'CBC', 'CTR'] as Mode[]).map((m) => ({ v: m, label: m }))} />
        <div>
          <button className="btn sm" onClick={() => setSeed(seed + 2)}>
            New key and IV
          </button>
        </div>
      </div>
      <ModeDiagram mode={mode} />
      <label className="field">
        plaintext
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <div className="stack" style={{ gap: 2, marginTop: 6 }}>
        {mode !== 'ECB' && <Bytes label="IV" data={iv} />}
        {ctBlocks.map((b, i) => (
          <div key={i} className="bytes-row">
            <span className="bytes-label">
              block {i + 1}: <span className="mono">“{String.fromCharCode(...Array.from(ptBlocks[i] ?? []).map((x) => (x >= 32 && x < 127 ? x : 183)))}”</span>
            </span>
            <span className="mono small" style={{ background: (counts.get(toHex(b)) ?? 0) > 1 ? blockColor(b) : undefined, padding: '1px 4px', borderRadius: 4 }}>
              {toHex(b)}
            </span>
            {(counts.get(toHex(b)) ?? 0) > 1 && <span className="chip bad">repeats</span>}
          </div>
        ))}
      </div>
      <h4 style={{ margin: '14px 0 4px' }}>A picture encrypted with {mode}</h4>
      <div className="row" style={{ gap: 18 }}>
        <Picture data={pic} label="plaintext" />
        <Picture data={encPic} label={`${mode} ciphertext`} />
      </div>
      <h4 style={{ margin: '14px 0 4px' }}>Error propagation</h4>
      <Slider label="flip the lowest bit of the first byte of ciphertext block" value={fb + 1} min={1} max={Math.max(1, ctBlocks.length)} step={1} onChange={(v) => setFlipBlock(v - 1)} />
      {decBlocks.map((b, i) => {
        const orig = ptBlocks[i] ?? new Uint8Array(16);
        return <Bytes key={i} label={`decrypted ${i + 1}`} data={b} ascii highlight={(k) => b[k] !== orig[k]} />;
      })}
      <div className="small muted">
        {mode === 'ECB' && 'ECB: only the tampered block decrypts to garbage.'}
        {mode === 'CBC' && 'CBC: the tampered block becomes garbage and the same bit flips in the next plaintext block (that is how CBC padding-oracle and bit-flipping attacks work).'}
        {mode === 'CTR' && 'CTR: exactly the flipped bit flips in the plaintext: perfect malleability, nothing else changes.'}
      </div>
      {mode === 'CTR' && (
        <div className="callout warn small">
          Reusing the IV/nonce with the same key reuses the keystream: c₁ ⊕ c₂ = m₁ ⊕ m₂, exactly the two-time pad. Example with this key and IV: {toHex(xor(ctr(E, iv, utf8('meet me at 9pm.')), ctr(E, iv, utf8('bring the cash!'))))} = m₁ ⊕ m₂ ={' '}
          {toHex(xor(utf8('meet me at 9pm.'), utf8('bring the cash!')))}.
        </div>
      )}
    </VizFrame>
  );
}
