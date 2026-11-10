/** Birthday attacks, Merkle–Damgård, sponge and Merkle trees. */
import { useMemo, useState } from 'react';
import { Chart, KV, Seg, Slider, VizFrame, linePath } from '../kit';
import { sha256, truncHash } from '../../math/crypto/sha256';
import { toHex, utf8 } from '../../math/crypto/bytes';
import { mdHash, mdPad, hex32 } from '../../math/crypto/toyHash';
import { Bytes } from './ckit';

// ------------------------------------------------------------------ birthday

const pColl = (q: number, N: number) => 1 - Math.exp((-q * (q - 1)) / (2 * N));

export function Birthday() {
  const [bits, setBits] = useState(16);
  const [runs, setRuns] = useState<number[]>([]);
  const [rhoBits, setRhoBits] = useState(10);
  const [rhoSeed, setRhoSeed] = useState(1);
  const N = 2 ** bits;
  const xs = Array.from({ length: 121 }, (_, i) => (i / 120) * bits);
  const search = () => {
    const seen = new Map<number, number>();
    const salt = Math.floor(Math.random() * 1e9);
    for (let i = 0; ; i++) {
      const h = truncHash(`msg-${salt}-${i}`, bits);
      if (seen.has(h)) return i + 1;
      seen.set(h, i);
    }
  };
  const mean = runs.length ? runs.reduce((s, x) => s + x, 0) / runs.length : 0;

  // Floyd / rho on f(x) = H_n(x)
  const rho = useMemo(() => {
    const f = (x: number) => truncHash(`rho-${x}`, rhoBits);
    const x0 = (rhoSeed * 2654435761) % 2 ** rhoBits;
    const seq: number[] = [x0];
    const idx = new Map<number, number>([[x0, 0]]);
    while (true) {
      const nx = f(seq[seq.length - 1]);
      if (idx.has(nx)) {
        const mu = idx.get(nx)!;
        return { seq, mu, lam: seq.length - mu, entry: nx };
      }
      idx.set(nx, seq.length);
      seq.push(nx);
    }
  }, [rhoBits, rhoSeed]);
  const { seq, mu, lam } = rho;
  const collision = mu > 0 ? [seq[mu - 1], seq[mu + lam - 1]] : null;
  // floyd iterations: first n ≥ 1 with x_n = x_{2n}
  const floydN = (() => {
    for (let n = 1; ; n++) {
      const a = n < seq.length ? n : mu + ((n - mu) % lam);
      const b = 2 * n < seq.length ? 2 * n : mu + ((2 * n - mu) % lam);
      if (seq[a] === seq[b]) return n;
    }
  })();
  // rho drawing
  const W = 420;
  const H = 230;
  const cx = 300;
  const cy = 115;
  const R = Math.min(90, 12 + lam * 4);
  const pos = (i: number): [number, number] => {
    if (i < mu) {
      const t = mu === 1 ? 0 : i / (mu - 1);
      return [20 + t * (cx - R - 40), cy + 60 - t * 60];
    }
    const a = Math.PI + ((i - mu) / lam) * 2 * Math.PI;
    return [cx + R * Math.cos(a), cy + R * Math.sin(a)];
  };
  return (
    <VizFrame title="Birthday paradox and the generic collision attack" caption="Among q random values from a set of size N, a repeat appears with probability ≈ 1 − e^(−q²/2N), so about √N ≈ 2^(n/2) hash evaluations find a collision of an n-bit hash. That is why a 256-bit hash gives only 128-bit collision resistance.">
      <Slider label="hash length n (bits)" value={bits} min={8} max={64} step={1} onChange={(v) => { setBits(v); setRuns([]); }} />
      <Chart x={[0, bits]} y={[0, 1]} height={220} xLabel="log₂ q (number of hashes tried)" yLabel="P(collision)" xFormat={(v) => String(Math.round(v))} yFormat={(v) => v.toFixed(1)}>
        {(sx, sy) => (
          <>
            <line x1={sx(bits / 2)} x2={sx(bits / 2)} y1={sy(0)} y2={sy(1)} stroke="var(--c2)" strokeDasharray="4 3" />
            <text x={sx(bits / 2) + 4} y={sy(0.95)} fontSize={11}>
              q = 2^{bits / 2} = √N
            </text>
            <line x1={sx(0)} x2={sx(bits)} y1={sy(0.5)} y2={sy(0.5)} stroke="var(--border-strong)" strokeDasharray="2 3" />
            <path d={linePath(xs.map((l) => [l, pColl(2 ** l, N)]), sx, sy)} stroke="var(--c1)" strokeWidth={2.5} fill="none" />
          </>
        )}
      </Chart>
      <KV
        items={[
          { k: '50 % at q ≈ 1.18·√N', v: `≈ 2^${Math.log2(1.1774 * Math.sqrt(N)).toFixed(2)}` },
          { k: 'birthdays: 23 people', v: `${(100 * (1 - Array.from({ length: 23 }, (_, i) => 1 - i / 365).reduce((p, x) => p * x, 1))).toFixed(1)} %` },
          { k: '2nd preimage by guessing', v: `≈ 2^${bits} tries` },
        ]}
      />
      {bits <= 28 ? (
        <div className="row" style={{ gap: 10 }}>
          <button className="btn sm" onClick={() => setRuns([...runs, search()])}>
            Search a real collision (first {bits} bits of SHA-256)
          </button>
          {runs.length > 0 && (
            <span className="small">
              last: {runs[runs.length - 1]} hashes · mean of {runs.length}: {mean.toFixed(0)} · √N = {Math.sqrt(N).toFixed(0)} · ratio {(mean / Math.sqrt(N)).toFixed(2)} (theory √(π/2) ≈ 1.25)
            </span>
          )}
        </div>
      ) : (
        <div className="small muted">Pick n ≤ 28 to run a live collision search in your browser.</div>
      )}

      <h4 style={{ margin: '14px 0 4px' }}>Memory-free version: Floyd’s cycle detection (ρ)</h4>
      <p className="small">
        Iterate x → H(x) from a random start. The sequence must eventually repeat, so it has the shape of the letter ρ: a tail of length μ and a cycle of length λ. The two different points that lead into the cycle entry are a
        collision. Floyd’s tortoise (one step) and hare (two steps) meet after n steps with xₙ = x₂ₙ, using constant memory.
      </p>
      <div className="viz-controls">
        <Slider label="hash bits" value={rhoBits} min={6} max={14} step={1} onChange={setRhoBits} />
        <div>
          <button className="btn sm" onClick={() => setRhoSeed(rhoSeed + 1)}>
            New starting point
          </button>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }}>
        {seq.map((_, i) => {
          const [x1, y1] = pos(i);
          const [x2, y2] = pos(i + 1 < seq.length ? i + 1 : mu);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i === mu - 1 || i === seq.length - 1 ? 'var(--c2)' : 'var(--border-strong)'} strokeWidth={i === mu - 1 || i === seq.length - 1 ? 2.5 : 1.2} />;
        })}
        {seq.map((v, i) => {
          const [x, y] = pos(i);
          const special = i === mu || (collision && (v === collision[0] || v === collision[1]));
          return <circle key={i} cx={x} cy={y} r={special ? 5 : 3} fill={i === mu ? 'var(--c2)' : special ? 'var(--c4)' : i < mu ? 'var(--c1)' : 'var(--c3)'} />;
        })}
      </svg>
      <KV
        items={[
          { k: 'tail μ', v: mu },
          { k: 'cycle λ', v: lam },
          { k: 'Floyd meets at n', v: floydN },
          { k: 'collision', v: collision ? `H(${collision[0]}) = H(${collision[1]}) = ${rho.entry}` : 'start was on the cycle — try another start' },
        ]}
      />
    </VizFrame>
  );
}

// ------------------------------------------------------------------ Merkle–Damgård + sponge

export function MerkleDamgard({ part = 'md' }: Record<string, unknown>) {
  const [tab, setTab] = useState<'md' | 'sponge'>(part === 'sponge' ? 'sponge' : 'md');
  return (
    <VizFrame title="Building hash functions: Merkle–Damgård and sponge" caption="A toy MD hash with a 32-bit state, 16-byte blocks and MD-compliant padding (0x80, zeros, 8-byte length). Real SHA-256 has the same structure with a 256-bit state and 64-byte blocks.">
      <Seg
        value={tab}
        onChange={setTab}
        options={[
          { v: 'md', label: 'MD chain' },
          { v: 'sponge', label: 'Sponge' },
        ]}
      />
      <div style={{ marginTop: 10 }}>{tab === 'md' ? <MdChain /> : <Sponge />}</div>
    </VizFrame>
  );
}

function MdChain() {
  const [msg, setMsg] = useState('Hello, Merkle and Damgard!');
  const m = utf8(msg);
  const t = mdHash(m);
  const n = t.blocks.length;
  const bw = 112;
  const W = 40 + n * (bw + 20);
  return (
    <>
      <label className="field">
        message ({m.length} bytes)
        <input type="text" value={msg} onChange={(e) => setMsg(e.target.value)} />
      </label>
      <div className="scroll-x">
        <svg viewBox={`0 0 ${W} 150`} width={W} style={{ maxWidth: 'none' }}>
          <text x={6} y={96} fontSize={10}>
            IV
          </text>
          {t.blocks.map((b, i) => {
            const x = 40 + i * (bw + 20);
            return (
              <g key={i}>
                <rect x={x} y={8} width={bw} height={30} rx={4} className="diagram-box" />
                <text x={x + bw / 2} y={20} fontSize={9} textAnchor="middle" className="mono">
                  {toHex(b.slice(0, 8))}
                </text>
                <text x={x + bw / 2} y={32} fontSize={9} textAnchor="middle" className="mono">
                  {toHex(b.slice(8))}
                </text>
                <line x1={x + bw / 2} y1={38} x2={x + bw / 2} y2={74} className="diagram-line" />
                <rect x={x + bw / 2 - 18} y={74} width={36} height={30} rx={4} className="diagram-op" />
                <text x={x + bw / 2} y={94} fontSize={13} textAnchor="middle" fontWeight={700}>
                  f
                </text>
                <line x1={x - 20} y1={89} x2={x + bw / 2 - 18} y2={89} className="diagram-line" />
                <text x={x - 14} y={124} fontSize={9} className="mono">
                  {hex32(t.chain[i])}
                </text>
              </g>
            );
          })}
          <line x1={40 + (n - 1) * (bw + 20) + bw / 2 + 18} y1={89} x2={W - 4} y2={89} className="diagram-line" />
          <text x={W - 70} y={124} fontSize={10} fontWeight={700} className="mono">
            {hex32(t.chain[n])}
          </text>
        </svg>
      </div>
      <Bytes label="pad(m)" data={t.padded} highlight={(i) => i >= m.length} />
      <div className="small muted">
        Highlighted: the padding. Because the length is encoded in the last block, messages of different lengths always differ in their last block — the property the MD collision proof needs (“a collision of h gives a collision of
        f”).
      </div>
      <KV items={[{ k: 'h(m)', v: <span className="mono">{hex32(t.chain[n])}</span> }, { k: 'blocks', v: n }, { k: 'padding bytes', v: mdPad(m.length).length }]} />
    </>
  );
}

function Sponge() {
  const [r, setR] = useState(1088);
  const [blocksN, setBlocksN] = useState(3);
  const c = 1600 - r;
  const W = 120 + blocksN * 90 + 2 * 90;
  return (
    <>
      <div className="viz-controls">
        <Slider label="rate r (bits)" value={r} min={576} max={1344} step={64} onChange={setR} />
        <Slider label="message blocks" value={blocksN} min={1} max={5} step={1} onChange={setBlocksN} />
      </div>
      <div className="scroll-x">
        <svg viewBox={`0 0 ${W} 170`} width={W} style={{ maxWidth: 'none' }}>
          <rect x={4} y={30} width={60} height={40} className="diagram-box" />
          <text x={34} y={54} fontSize={10} textAnchor="middle">
            0^r
          </text>
          <rect x={4} y={74} width={60} height={60} className="diagram-box" />
          <text x={34} y={108} fontSize={10} textAnchor="middle">
            0^c
          </text>
          {Array.from({ length: blocksN + 2 }, (_, i) => {
            const x = 90 + i * 90;
            const absorb = i < blocksN;
            return (
              <g key={i}>
                {absorb && (
                  <>
                    <text x={x - 14} y={14} fontSize={10} textAnchor="middle">
                      m{i + 1}
                    </text>
                    <line x1={x - 14} y1={18} x2={x - 14} y2={42} className="diagram-line" />
                    <circle cx={x - 14} cy={50} r={7} className="diagram-op" />
                  </>
                )}
                {!absorb && (
                  <>
                    <line x1={x - 14} y1={50} x2={x - 14} y2={18} className="diagram-line" />
                    <text x={x - 14} y={14} fontSize={10} textAnchor="middle" fontWeight={700}>
                      z{i - blocksN + 1}
                    </text>
                  </>
                )}
                <rect x={x} y={30} width={44} height={104} rx={4} className="diagram-op" />
                <text x={x + 22} y={86} fontSize={13} textAnchor="middle" fontWeight={700}>
                  π
                </text>
                <line x1={x - 26} y1={50} x2={x} y2={50} className="diagram-line" />
                <line x1={x - 26} y1={104} x2={x} y2={104} className="diagram-line" />
              </g>
            );
          })}
          <text x={W / 2} y={160} fontSize={10} textAnchor="middle">
            absorbing (XOR into the rate part) → squeezing (read the rate part)
          </text>
        </svg>
      </div>
      <KV
        items={[
          { k: 'state n = r + c', v: '1600 bits (Keccak)' },
          { k: 'capacity c', v: `${c} bits` },
          { k: 'generic security', v: `≈ 2^${c / 2}` },
          { k: 'matches SHA-3', v: { 1152: 'SHA3-224', 1088: 'SHA3-256', 832: 'SHA3-384', 576: 'SHA3-512' }[r] ?? '—' },
        ]}
      />
      <p className="small">
        The capacity part is never output and never directly touched by the message, so the attacker cannot control or observe the whole state. Larger capacity = more security, smaller rate = slower. If c were tiny, an attacker could
        invert π and meet in the middle on the c hidden bits.
      </p>
    </>
  );
}

// ------------------------------------------------------------------ Merkle tree

const h8 = (s: string) => toHex(sha256(s)).slice(0, 8);

export function MerkleTree() {
  const [items, setItems] = useState(['tx: A→B 5', 'tx: C→D 2', 'tx: B→E 1', 'tx: E→A 7', 'tx: D→C 3', 'tx: A→C 4', 'tx: F→B 9', 'tx: C→F 6']);
  const [sel, setSel] = useState(2);
  const levels = useMemo(() => {
    const L: string[][] = [items.map((x) => h8(x))];
    while (L[L.length - 1].length > 1) {
      const prev = L[L.length - 1];
      const next: string[] = [];
      for (let i = 0; i < prev.length; i += 2) next.push(h8(prev[i] + prev[i + 1]));
      L.push(next);
    }
    return L;
  }, [items]);
  const [published, setPublished] = useState(() => levels[levels.length - 1][0]);
  const root = levels[levels.length - 1][0];
  const path: { level: number; idx: number }[] = [];
  const siblings: { level: number; idx: number }[] = [];
  let idx = sel;
  for (let l = 0; l < levels.length; l++) {
    path.push({ level: l, idx });
    if (l < levels.length - 1) siblings.push({ level: l, idx: idx ^ 1 });
    idx >>= 1;
  }
  const W = 640;
  const nodeX = (level: number, i: number) => ((i + 0.5) * W) / levels[level].length;
  const nodeY = (level: number) => 200 - level * 50;
  const isPath = (l: number, i: number) => path.some((p) => p.level === l && p.idx === i);
  const isSib = (l: number, i: number) => siblings.some((p) => p.level === l && p.idx === i);
  return (
    <VizFrame title="Merkle tree: proving one item with log₂ n hashes" caption="To prove that item i is in the list, send the item plus the sibling hash at every level (orange). The verifier recomputes the path (blue) and compares it with the published root. 8 items → 3 hashes; a million items → 20 hashes.">
      <div className="scroll-x">
        <svg viewBox={`0 0 ${W} 240`} width="100%" style={{ minWidth: 520 }}>
          {levels.map((lv, l) =>
            lv.map((_, i) =>
              l > 0 ? (
                <g key={`e${l}-${i}`}>
                  <line x1={nodeX(l, i)} y1={nodeY(l) + 10} x2={nodeX(l - 1, 2 * i)} y2={nodeY(l - 1) - 10} className="diagram-line" />
                  <line x1={nodeX(l, i)} y1={nodeY(l) + 10} x2={nodeX(l - 1, 2 * i + 1)} y2={nodeY(l - 1) - 10} className="diagram-line" />
                </g>
              ) : null,
            ),
          )}
          {levels.map((lv, l) =>
            lv.map((v, i) => (
              <g key={`n${l}-${i}`} onClick={() => l === 0 && setSel(i)} style={{ cursor: l === 0 ? 'pointer' : 'default' }}>
                <rect x={nodeX(l, i) - 34} y={nodeY(l) - 10} width={68} height={20} rx={4} fill={isPath(l, i) ? 'color-mix(in srgb, var(--c1) 30%, transparent)' : isSib(l, i) ? 'color-mix(in srgb, var(--c2) 35%, transparent)' : 'var(--bg-sunk)'} stroke="var(--border-strong)" />
                <text x={nodeX(l, i)} y={nodeY(l) + 4} fontSize={10} textAnchor="middle" className="mono">
                  {v}
                </text>
              </g>
            )),
          )}
          {items.map((_, i) => (
            <text key={i} x={nodeX(0, i)} y={232} fontSize={9} textAnchor="middle" fill={i === sel ? 'var(--c1)' : undefined}>
              x{i + 1}
            </text>
          ))}
        </svg>
      </div>
      <div className="grid cols-4" style={{ gap: 6 }}>
        {items.map((it, i) => (
          <input key={i} type="text" value={it} onChange={(e) => setItems(items.map((x, j) => (j === i ? e.target.value : x)))} style={{ borderColor: i === sel ? 'var(--c1)' : undefined }} onFocus={() => setSel(i)} />
        ))}
      </div>
      <KV
        items={[
          { k: 'proof for x' + (sel + 1), v: <span className="mono small">{siblings.map((s) => levels[s.level][s.idx]).join(', ')}</span> },
          { k: 'published root', v: <span className="mono">{published}</span> },
          { k: 'root of current list', v: <span className="mono">{root}</span> },
        ]}
      />
      <div className="row" style={{ gap: 10 }}>
        <span className={`verdict ${root === published ? 'good' : 'bad'}`}>{root === published ? 'list matches the published root' : 'list was modified: root differs'}</span>
        <button className="btn sm" onClick={() => setPublished(root)}>
          Publish current root
        </button>
      </div>
      <div className="small muted">Edit any item: every hash on its path changes, up to the root. (Hashes are SHA-256 truncated to 32 bits for display; nodes hash the concatenation left ‖ right.)</div>
    </VizFrame>
  );
}

