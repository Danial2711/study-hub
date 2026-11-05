/** Information theory: entropy, mutual information, Huffman, Kraft. */
import { useMemo, useState } from 'react';
import { binaryEntropy, entropy, infoSummary, normalize, surprisal } from '../math/info';
import { classifyCode, huffman, kraftSum, prefixCodeFromLengths, shannonFano, shannonLengths, expectedLength, type HuffmanNode } from '../math/codes';
import { fmt } from '../math/linalg';
import { Chart, KV, Legend, Seg, Slider, VizFrame, linePath, SERIES } from './kit';
import { Tex } from '../../platform/components/Markdown';

/* ------------------------------------------------------------------ Entropy */

export function EntropyViz() {
  const [p, setP] = useState(0.2);
  const [w, setW] = useState([0.5, 0.25, 0.125, 0.125]);
  const probs = normalize(w);
  const H = entropy(probs);
  const xs = Array.from({ length: 201 }, (_, i) => i / 200);
  return (
    <VizFrame title="Entropy: average surprise" caption="Binary entropy H(p) is maximal (1 bit) for a fair coin and 0 for a deterministic one. For n outcomes, 0 ≤ H(X) ≤ log₂ n with equality on the right iff X is uniform.">
      <div className="grid cols-2">
        <div>
          <Slider label="p = P(X = 1)" value={p} min={0} max={1} step={0.01} onChange={setP} />
          <Chart x={[0, 1]} y={[0, 1.08]} height={220} xLabel="p" yLabel="H(p) [bits]">
            {(sx, sy) => (
              <>
                <path d={linePath(xs.map((x) => [x, binaryEntropy(x)]), sx, sy)} fill="none" stroke="var(--c1)" strokeWidth={2.5} />
                <circle cx={sx(p)} cy={sy(binaryEntropy(p))} r={5} fill="var(--c2)" />
                <line x1={sx(p)} x2={sx(p)} y1={sy(0)} y2={sy(binaryEntropy(p))} stroke="var(--c2)" strokeDasharray="4 3" />
              </>
            )}
          </Chart>
          <div className="small center">
            <Tex>{`H(${fmt(p, 2)}) = -p\\log_2 p-(1-p)\\log_2(1-p) = ${fmt(binaryEntropy(p), 4)}`}</Tex>
          </div>
        </div>
        <div>
          <div className="row" style={{ gap: 6, marginBottom: 6 }}>
            {w.map((x, i) => (
              <label key={i} className="field" style={{ width: 84 }}>
                w{i + 1}
                <input type="number" min={0} step={0.05} value={x} onChange={(e) => setW(w.map((y, j) => (j === i ? Math.max(0, +e.target.value) : y)))} />
              </label>
            ))}
            <button className="btn sm" onClick={() => w.length < 8 && setW([...w, 0.1])}>
              +
            </button>
            <button className="btn sm" onClick={() => w.length > 2 && setW(w.slice(0, -1))}>
              −
            </button>
          </div>
          <Chart x={[-0.5, probs.length - 0.5]} y={[0, Math.max(4, ...probs.map((q) => (q > 0 ? surprisal(q) : 0))) * 1.1]} height={200} xTicks={probs.map((_, i) => i)} xFormat={(v) => `x${v + 1}`} yLabel="bits">
            {(sx, sy) =>
              probs.map((q, i) => {
                const s = q > 0 ? surprisal(q) : 0;
                const bw = Math.min(46, sx(1) - sx(0) - 8);
                return (
                  <g key={i}>
                    <rect x={sx(i) - bw / 2} width={bw} y={sy(s)} height={sy(0) - sy(s)} fill="color-mix(in srgb, var(--c3) 45%, transparent)" rx={3} />
                    <rect x={sx(i) - bw / 2} width={bw} y={sy(q * s)} height={sy(0) - sy(q * s)} fill="var(--c3)" rx={3} />
                    <text x={sx(i)} y={sy(s) - 4} textAnchor="middle" fontSize={10}>
                      p={fmt(q, 3)}
                    </text>
                  </g>
                );
              })
            }
          </Chart>
          <Legend
            items={[
              { label: 'surprisal −log₂ pᵢ', color: 'color-mix(in srgb, var(--c3) 45%, transparent)', box: true },
              { label: 'contribution −pᵢ log₂ pᵢ', color: 'var(--c3)', box: true },
            ]}
          />
          <KV
            items={[
              { k: 'H(X)', v: `${fmt(H, 4)} bits` },
              { k: 'log₂ n (max)', v: fmt(Math.log2(probs.length), 4) },
              { k: 'redundancy', v: fmt(Math.log2(probs.length) - H, 4) },
            ]}
          />
        </div>
      </div>
    </VizFrame>
  );
}

/* ------------------------------------------------------------------ Mutual information */

const JOINT_PRESETS: Record<string, { title: string; J: number[][] }> = {
  dep: {
    title: 'dependent',
    J: [
      [0.4, 0.1],
      [0.1, 0.4],
    ],
  },
  indep: {
    title: 'independent',
    J: [
      [0.3, 0.2],
      [0.3, 0.2],
    ],
  },
  copy: {
    title: 'Y = X',
    J: [
      [0.5, 0],
      [0, 0.5],
    ],
  },
  ct: {
    title: '4×4 example',
    J: [
      [1 / 8, 1 / 16, 1 / 32, 1 / 32],
      [1 / 16, 1 / 8, 1 / 32, 1 / 32],
      [1 / 16, 1 / 16, 1 / 16, 1 / 16],
      [1 / 4, 0, 0, 0],
    ],
  },
};

export function MutualInfoVenn() {
  const [key, setKey] = useState('dep');
  const [J, setJ] = useState(JOINT_PRESETS.dep.J);
  const total = J.flat().reduce((a, b) => a + b, 0);
  const Jn = J.map((r) => r.map((x) => (total > 0 ? x / total : 0)));
  const s = infoSummary(Jn);
  // Venn geometry: circle areas ∝ H(X), H(Y); overlap shown proportional by centre distance (approximate).
  const W = 520,
    Hh = 220;
  const scale = 60 / Math.sqrt(Math.max(s.HX, s.HY, 0.5));
  const rX = Math.max(14, Math.sqrt(Math.max(s.HX, 0.01)) * scale);
  const rY = Math.max(14, Math.sqrt(Math.max(s.HY, 0.01)) * scale);
  const frac = Math.min(s.HX, s.HY) > 0 ? s.I / Math.min(s.HX, s.HY) : 0;
  const dist = (rX + rY) * (1 - frac) + Math.abs(rX - rY) * frac;
  const cx = W / 2 - dist / 2,
    cy = W / 2 + dist / 2;
  return (
    <VizFrame title="Entropy Venn diagram & mutual information" caption="Edit the joint table P(X = x, Y = y) (rows = x). The diagram is schematic: the overlap is I(X;Y), the parts outside it are the conditional entropies.">
      <div className="row" style={{ marginBottom: 8 }}>
        <Seg
          value={key}
          onChange={(k) => {
            setKey(k);
            setJ(JOINT_PRESETS[k].J);
          }}
          options={Object.entries(JOINT_PRESETS).map(([k, v]) => ({ v: k, label: v.title }))}
        />
      </div>
      <div className="grid cols-2" style={{ alignItems: 'center' }}>
        <div className="scroll-x">
          <table className="matrix-input">
            <thead>
              <tr>
                <th>X \ Y</th>
                {J[0].map((_, j) => (
                  <th key={j}>y{j + 1}</th>
                ))}
                <th>P(x)</th>
              </tr>
            </thead>
            <tbody>
              {J.map((row, i) => (
                <tr key={i}>
                  <th>x{i + 1}</th>
                  {row.map((v, j) => (
                    <td key={j}>
                      <input type="number" min={0} step={0.01} value={+v.toFixed(4)} onChange={(e) => setJ(J.map((r, a) => r.map((x, b) => (a === i && b === j ? Math.max(0, +e.target.value) : x))))} />
                    </td>
                  ))}
                  <td className="small mono">{fmt(Jn[i].reduce((a, b) => a + b, 0), 3)}</td>
                </tr>
              ))}
              <tr>
                <th>P(y)</th>
                {J[0].map((_, j) => (
                  <td key={j} className="small mono center">
                    {fmt(Jn.reduce((a, r) => a + r[j], 0), 3)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          {Math.abs(total - 1) > 1e-6 && <div className="small faint">Entries are normalised (sum = {fmt(total, 3)}).</div>}
        </div>
        <svg viewBox={`0 0 ${W} ${Hh}`} width="100%" style={{ maxWidth: W }}>
          <circle cx={cx} cy={Hh / 2} r={rX} fill="color-mix(in srgb, var(--c1) 22%, transparent)" stroke="var(--c1)" strokeWidth={2} />
          <circle cx={cy} cy={Hh / 2} r={rY} fill="color-mix(in srgb, var(--c2) 22%, transparent)" stroke="var(--c2)" strokeWidth={2} />
          <text x={cx - rX * 0.45} y={Hh / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={600} style={{ fill: 'var(--fg)' }}>
            H(X|Y)
          </text>
          <text x={cx - rX * 0.45} y={Hh / 2 + 18} textAnchor="middle" fontSize={11}>
            {fmt(s.HXgY, 3)}
          </text>
          <text x={cy + rY * 0.45} y={Hh / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={600} style={{ fill: 'var(--fg)' }}>
            H(Y|X)
          </text>
          <text x={cy + rY * 0.45} y={Hh / 2 + 18} textAnchor="middle" fontSize={11}>
            {fmt(s.HYgX, 3)}
          </text>
          {s.I > 1e-6 && (
            <>
              <text x={(cx + rX + cy - rY) / 2} y={Hh / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={700} style={{ fill: 'var(--fg)' }}>
                I
              </text>
              <text x={(cx + rX + cy - rY) / 2} y={Hh / 2 + 18} textAnchor="middle" fontSize={11}>
                {fmt(s.I, 3)}
              </text>
            </>
          )}
          <text x={cx} y={Hh / 2 - rX - 6} textAnchor="middle" fontSize={12} fontWeight={700} style={{ fill: 'var(--c1)' }}>
            H(X) = {fmt(s.HX, 3)}
          </text>
          <text x={cy} y={Hh / 2 + rY + 16} textAnchor="middle" fontSize={12} fontWeight={700} style={{ fill: 'var(--c2)' }}>
            H(Y) = {fmt(s.HY, 3)}
          </text>
        </svg>
      </div>
      <KV
        items={[
          { k: 'H(X,Y)', v: fmt(s.HXY, 4) },
          { k: 'H(X)+H(Y|X)', v: fmt(s.HX + s.HYgX, 4) },
          { k: 'I(X;Y) = H(X) − H(X|Y)', v: fmt(s.I, 4) },
          { k: 'H(X)+H(Y)−H(X,Y)', v: fmt(s.HX + s.HY - s.HXY, 4) },
          { k: 'independent?', v: s.I < 1e-9 ? 'yes (I = 0)' : 'no (I > 0)' },
        ]}
      />
    </VizFrame>
  );
}

/* ------------------------------------------------------------------ Huffman */

const HUFF_PRESETS: Record<string, number[]> = {
  'dyadic': [0.5, 0.25, 0.125, 0.125],
  'five': [0.25, 0.25, 0.2, 0.15, 0.15],
  'skewed': [0.4, 0.3, 0.1, 0.1, 0.06, 0.04],
  'uniform 6': [1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6],
};

export function HuffmanBuilder() {
  const [w, setW] = useState(HUFF_PRESETS.skewed);
  const [d, setD] = useState(2);
  const [stepIdx, setStepIdx] = useState(Infinity);
  const p = normalize(w);
  const res = useMemo(() => huffman(p, d), [p.join(','), d]); // eslint-disable-line react-hooks/exhaustive-deps
  const sf = d === 2 ? shannonFano(p) : null;
  const sh = shannonLengths(p, d);
  const shownSteps = Math.min(stepIdx, res.steps.length);
  // Forest after `shownSteps` merges:
  const forest = useMemo(() => {
    if (shownSteps >= res.steps.length) return [res.root];
    return res.steps[shownSteps].queue;
  }, [shownSteps, res]);
  const sym = (i: number) => String.fromCharCode(65 + i);
  return (
    <VizFrame title="Huffman code builder" caption="Huffman repeatedly merges the d least probable nodes. The result is an optimal prefix code: H_d(X) ≤ L < H_d(X) + 1.">
      <div className="row" style={{ marginBottom: 8 }}>
        <select
          onChange={(e) => {
            setW(HUFF_PRESETS[e.target.value]);
            setStepIdx(Infinity);
          }}
          defaultValue="skewed"
        >
          {Object.keys(HUFF_PRESETS).map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
        <Seg value={d} onChange={(v) => { setD(v); setStepIdx(Infinity); }} options={[{ v: 2, label: 'binary' }, { v: 3, label: 'ternary' }]} />
        <button className="btn sm" onClick={() => w.length < 10 && setW([...w, 0.05])}>
          + symbol
        </button>
        <button className="btn sm" onClick={() => w.length > 2 && setW(w.slice(0, -1))}>
          − symbol
        </button>
      </div>
      <div className="row" style={{ gap: 6, marginBottom: 8 }}>
        {w.map((x, i) => (
          <label key={i} className="field" style={{ width: 72 }}>
            {sym(i)}
            <input type="number" min={0} step={0.01} value={+x.toFixed(4)} onChange={(e) => { setW(w.map((y, j) => (j === i ? Math.max(0, +e.target.value) : y))); setStepIdx(Infinity); }} />
          </label>
        ))}
      </div>
      <div className="row" style={{ marginBottom: 6 }}>
        <button className="btn sm" onClick={() => setStepIdx(0)}>
          ⏮ Start
        </button>
        <button className="btn sm" onClick={() => setStepIdx(Math.max(0, shownSteps - 1))} disabled={shownSteps === 0}>
          ◀ Step
        </button>
        <button className="btn sm primary" onClick={() => setStepIdx(Math.min(res.steps.length, shownSteps + 1))} disabled={shownSteps >= res.steps.length}>
          Merge ▶
        </button>
        <button className="btn sm" onClick={() => setStepIdx(Infinity)}>
          ⏭ Finish
        </button>
        <span className="small muted">
          merge {shownSteps} / {res.steps.length}
          {shownSteps < res.steps.length && ` — next: merge ${res.steps[shownSteps].merged.map((m) => fmt(m.p, 3)).join(' + ')}`}
        </span>
      </div>
      <Forest roots={forest} sym={sym} d={d} highlight={shownSteps < res.steps.length ? new Set(res.steps[shownSteps].merged.map((m) => m.id)) : new Set()} />
      <div className="scroll-x">
        <table className="data-table">
          <thead>
            <tr>
              <th>symbol</th>
              <th className="num">pᵢ</th>
              <th>Huffman</th>
              <th className="num">lᵢ</th>
              {sf && <th>Shannon–Fano</th>}
              <th className="num">⌈log 1/pᵢ⌉</th>
            </tr>
          </thead>
          <tbody>
            {p.map((q, i) => (
              <tr key={i}>
                <td>{sym(i)}</td>
                <td className="num">{fmt(q, 4)}</td>
                <td className="mono">{res.codewords[i]}</td>
                <td className="num">{res.lengths[i]}</td>
                {sf && <td className="mono">{sf[i]}</td>}
                <td className="num">{sh[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <KV
        items={[
          { k: `H_${d}(X)`, v: fmt(res.H, 4) },
          { k: 'L(Huffman)', v: fmt(res.L, 4), color: SERIES[0] },
          ...(sf ? [{ k: 'L(Shannon–Fano)', v: fmt(expectedLength(p, sf.map((c) => c.length)), 4), color: SERIES[1] }] : []),
          { k: 'L(Shannon ⌈log 1/p⌉)', v: fmt(expectedLength(p, sh), 4), color: SERIES[2] },
          { k: 'Kraft sum (Huffman)', v: fmt(kraftSum(res.lengths, d), 4) },
        ]}
      />
    </VizFrame>
  );
}

function Forest({ roots, sym, d, highlight }: { roots: HuffmanNode[]; sym: (i: number) => string; d: number; highlight: Set<number> }) {
  // Layout: leaves in-order, internal nodes centred over children; depth → y.
  type Placed = { n: HuffmanNode; x: number; y: number; edge?: string };
  const placed: Placed[] = [];
  const lines: { x1: number; y1: number; x2: number; y2: number; label: string }[] = [];
  let leafX = 0;
  const depth = (n: HuffmanNode): number => (n.children ? 1 + Math.max(...n.children.map(depth)) : 0);
  const maxD = Math.max(...roots.map(depth));
  const place = (n: HuffmanNode, level: number): { x: number; y: number } => {
    const y = 26 + level * 54;
    if (!n.children) {
      const x = leafX++;
      placed.push({ n, x, y });
      return { x, y };
    }
    const kids = [...n.children].sort((a, b) => b.p - a.p || a.id - b.id);
    const pts = kids.map((c) => place(c, level + 1));
    const x = (pts[0].x + pts[pts.length - 1].x) / 2;
    pts.forEach((pt, i) => lines.push({ x1: x, y1: y, x2: pt.x, y2: pt.y, label: i.toString(d) }));
    placed.push({ n, x, y });
    return { x, y };
  };
  roots.forEach((r) => {
    place(r, maxD - depth(r));
    leafX += 0.4;
  });
  const span = Math.max(1, leafX - 0.4);
  const W = Math.max(360, span * 64);
  const H = 26 + maxD * 54 + 40;
  const X = (x: number) => 30 + (x / Math.max(1, span - 1)) * (W - 60);
  return (
    <div className="scroll-x">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} style={{ maxWidth: '100%' }}>
        {lines.map((l, i) => (
          <g key={i}>
            <line x1={X(l.x1)} y1={l.y1} x2={X(l.x2)} y2={l.y2} stroke="var(--border-strong)" strokeWidth={1.5} />
            <text x={(X(l.x1) + X(l.x2)) / 2 + (l.x2 < l.x1 ? -8 : 8)} y={(l.y1 + l.y2) / 2} fontSize={11} fontWeight={700} textAnchor="middle" style={{ fill: 'var(--accent)' }}>
              {l.label}
            </text>
          </g>
        ))}
        {placed.map(({ n, x, y }) => {
          const leaf = !n.children;
          const dummy = leaf && n.symbol === -1;
          return (
            <g key={n.id} transform={`translate(${X(x)},${y})`}>
              {leaf ? (
                <rect x={-22} y={-13} width={44} height={26} rx={6} fill={highlight.has(n.id) ? 'var(--warn-soft)' : 'var(--bg-sunk)'} stroke={highlight.has(n.id) ? 'var(--warn)' : 'var(--border-strong)'} strokeDasharray={dummy ? '3 3' : undefined} />
              ) : (
                <circle r={16} fill={highlight.has(n.id) ? 'var(--warn-soft)' : 'var(--bg-elev)'} stroke={highlight.has(n.id) ? 'var(--warn)' : 'var(--accent)'} strokeWidth={1.5} />
              )}
              <text textAnchor="middle" y={leaf ? -1 : 4} fontSize={leaf ? 11 : 10} fontWeight={700} style={{ fill: 'var(--fg)' }}>
                {leaf ? (dummy ? '∅' : sym(n.symbol!)) : fmt(n.p, 2)}
              </text>
              {leaf && (
                <text textAnchor="middle" y={10} fontSize={9}>
                  {fmt(n.p, 3)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ Kraft */

export function KraftChecker() {
  const [mode, setMode] = useState<'lengths' | 'words'>('lengths');
  const [lengthsText, setLengthsText] = useState('1, 2, 3, 3');
  const [wordsText, setWordsText] = useState('0, 10, 110, 111');
  const [d, setD] = useState(2);
  const lengths = lengthsText.split(/[\s,;]+/).filter(Boolean).map(Number).filter((x) => Number.isInteger(x) && x > 0 && x <= 12);
  const words = wordsText.split(/[\s,;]+/).filter(Boolean);
  const effLengths = mode === 'lengths' ? lengths : words.map((w) => w.length);
  const K = kraftSum(effLengths, d);
  const built = mode === 'lengths' ? prefixCodeFromLengths(lengths, d) : null;
  const cls = mode === 'words' && words.length ? classifyCode(words) : null;
  const maxL = Math.max(1, ...effLengths);
  const code = mode === 'words' ? words : built ?? [];
  return (
    <VizFrame title="Kraft–McMillan inequality" caption="Every codeword of length l 'uses up' d^{−l} of the code tree. A prefix code with these lengths exists iff Σ d^{−lᵢ} ≤ 1 (Kraft); every uniquely decodable code satisfies the same inequality (McMillan).">
      <div className="row" style={{ marginBottom: 8 }}>
        <Seg value={mode} onChange={setMode} options={[{ v: 'lengths', label: 'codeword lengths' }, { v: 'words', label: 'codewords' }]} />
        <Seg value={d} onChange={setD} options={[{ v: 2, label: 'd = 2' }, { v: 3, label: 'd = 3' }]} />
      </div>
      {mode === 'lengths' ? (
        <label className="field">
          lengths l₁, l₂, … (comma separated)
          <input type="text" value={lengthsText} onChange={(e) => setLengthsText(e.target.value)} />
        </label>
      ) : (
        <label className="field">
          codewords (comma separated, digits 0…{d - 1})
          <input type="text" value={wordsText} onChange={(e) => setWordsText(e.target.value)} />
        </label>
      )}
      <div className="row" style={{ marginTop: 10, gap: 4 }}>
        <span className="small muted" style={{ width: 130 }}>
          Kraft budget used:
        </span>
        <div style={{ flex: 1, display: 'flex', height: 26, border: '1px solid var(--border-strong)', borderRadius: 6, overflow: 'hidden', minWidth: 200 }}>
          {effLengths.map((l, i) => (
            <div key={i} title={`l=${l}: ${fmt(d ** -l, 4)}`} style={{ width: `${Math.min(100, (100 * d ** -l) / Math.max(1, K))}%`, background: SERIES[i % SERIES.length], borderRight: '1px solid var(--bg-elev)', opacity: 0.85 }} />
          ))}
        </div>
      </div>
      <TreeBudget code={code} d={d} maxL={Math.min(maxL, 6)} />
      <KV
        items={[
          { k: 'Σ d^{−lᵢ}', v: fmt(K, 5) },
          { k: 'Kraft satisfied?', v: K <= 1 + 1e-12 ? <span style={{ color: 'var(--good)' }}>yes</span> : <span style={{ color: 'var(--bad)' }}>no → no UD code</span> },
          ...(built ? [{ k: 'canonical prefix code', v: <span className="mono">{built.join(', ')}</span> }] : mode === 'lengths' ? [{ k: 'prefix code', v: 'impossible' }] : []),
          ...(cls ? [{ k: 'class of the given code', v: cls }] : []),
        ]}
      />
      <div className="small muted">
        <Tex>{'\\text{singular} \\supset \\text{non-singular} \\supset \\text{uniquely decodable} \\supset \\text{prefix (instantaneous)}'}</Tex>
      </div>
    </VizFrame>
  );
}

function TreeBudget({ code, d, maxL }: { code: string[]; d: number; maxL: number }) {
  // Draw full d-ary tree up to depth maxL, highlight codeword nodes and the subtrees they block.
  const W = 620,
    H = 40 + maxL * 46;
  const leaves = d ** maxL;
  const nodes: { path: string; x: number; y: number }[] = [];
  const rec = (path: string, depth: number, lo: number, hi: number) => {
    nodes.push({ path, x: (lo + hi) / 2, y: 20 + depth * 46 });
    if (depth === maxL) return;
    for (let i = 0; i < d; i++) rec(path + i, depth + 1, lo + ((hi - lo) * i) / d, lo + ((hi - lo) * (i + 1)) / d);
  };
  rec('', 0, 0, leaves);
  const X = (x: number) => 16 + (x / leaves) * (W - 32);
  const isWord = new Set(code);
  const blocked = (p: string) => code.some((c) => p.length > c.length && p.startsWith(c));
  if (leaves > 729) return null;
  return (
    <div className="scroll-x">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }}>
        {nodes
          .filter((n) => n.path.length > 0)
          .map((n) => {
            const parent = nodes.find((m) => m.path === n.path.slice(0, -1))!;
            return <line key={`l${n.path}`} x1={X(parent.x)} y1={parent.y} x2={X(n.x)} y2={n.y} stroke={blocked(n.path) || isWord.has(n.path) ? 'var(--border)' : 'var(--border-strong)'} strokeWidth={1} />;
          })}
        {nodes.map((n) => {
          const w = isWord.has(n.path);
          const b = blocked(n.path);
          return (
            <g key={n.path || 'root'}>
              <circle cx={X(n.x)} cy={n.y} r={w ? 9 : 4} fill={w ? 'var(--c1)' : b ? 'color-mix(in srgb, var(--c1) 25%, transparent)' : 'var(--bg-sunk)'} stroke={w ? 'none' : 'var(--border-strong)'} />
              {w && (
                <text x={X(n.x)} y={n.y + 22} textAnchor="middle" fontSize={10} className="mono">
                  {n.path}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
