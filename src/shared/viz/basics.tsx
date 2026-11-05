/** Probability basics: Venn diagram of events, Bayes tree, independence on two dice. */
import { useId, useMemo, useState } from 'react';
import { fmt, toFraction } from '../math/linalg';
import { KV, Seg, Slider, VizFrame } from './kit';
import { Tex } from '../../platform/components/Markdown';

/* ------------------------------------------------------------------ Venn */

type Region = 'a' | 'ab' | 'b' | 'out';
const EXPRS: { label: string; tex: string; regions: Region[] }[] = [
  { label: 'A ∪ B', tex: 'A \\cup B', regions: ['a', 'ab', 'b'] },
  { label: 'A ∩ B', tex: 'A \\cap B', regions: ['ab'] },
  { label: 'Aᶜ', tex: 'A^c', regions: ['b', 'out'] },
  { label: 'A \\ B', tex: 'A \\setminus B', regions: ['a'] },
  { label: 'A Δ B', tex: 'A \\,\\triangle\\, B', regions: ['a', 'b'] },
  { label: '(A ∪ B)ᶜ', tex: '(A \\cup B)^c = A^c \\cap B^c', regions: ['out'] },
  { label: 'Aᶜ ∪ Bᶜ', tex: 'A^c \\cup B^c = (A\\cap B)^c', regions: ['a', 'b', 'out'] },
];

export function VennEvents() {
  const uid = useId().replace(/:/g, '');
  const [pa, setPa] = useState(0.5);
  const [pb, setPb] = useState(0.4);
  const [pab, setPab] = useState(0.2);
  const [sel, setSel] = useState<Set<Region>>(new Set(['a', 'ab', 'b']));
  const lo = Math.max(0, pa + pb - 1);
  const hi = Math.min(pa, pb);
  const inter = Math.min(hi, Math.max(lo, pab));
  const prob: Record<Region, number> = { a: pa - inter, ab: inter, b: pb - inter, out: 1 - pa - pb + inter };
  const total = [...sel].reduce((s, r) => s + prob[r], 0);
  const toggle = (r: Region) =>
    setSel((s) => {
      const n = new Set(s);
      if (n.has(r)) n.delete(r);
      else n.add(r);
      return n;
    });
  const match = EXPRS.find((e) => e.regions.length === sel.size && e.regions.every((r) => sel.has(r)));
  const fill = (r: Region) => (sel.has(r) ? 'color-mix(in srgb, var(--accent) 45%, transparent)' : 'transparent');
  const W = 420,
    H = 240;
  const ca = { x: 165, y: 120, r: 82 },
    cb = { x: 255, y: 120, r: 82 };
  return (
    <VizFrame title="Events as sets (Venn diagram)" caption="Click regions of the diagram or use a preset. Probabilities of the four atoms are derived from P(A), P(B) and P(A∩B).">
      <div className="viz-controls">
        <Slider label="P(A)" value={pa} min={0} max={1} step={0.01} onChange={setPa} />
        <Slider label="P(B)" value={pb} min={0} max={1} step={0.01} onChange={setPb} />
        <Slider label={`P(A∩B) ∈ [${fmt(lo, 2)}, ${fmt(hi, 2)}]`} value={inter} min={lo} max={hi} step={0.01} onChange={setPab} format={(v) => fmt(v, 2)} />
      </div>
      <div className="row" style={{ gap: 6, marginBottom: 8 }}>
        {EXPRS.map((e) => (
          <button key={e.label} className={`chip ${match === e ? 'on' : ''}`} onClick={() => setSel(new Set(e.regions))}>
            {e.label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }}>
        <defs>
          <clipPath id={`${uid}ca`}>
            <circle cx={ca.x} cy={ca.y} r={ca.r} />
          </clipPath>
          <mask id={`${uid}ma`}>
            <rect width={W} height={H} fill="black" />
            <circle cx={ca.x} cy={ca.y} r={ca.r} fill="white" />
            <circle cx={cb.x} cy={cb.y} r={cb.r} fill="black" />
          </mask>
          <mask id={`${uid}mb`}>
            <rect width={W} height={H} fill="black" />
            <circle cx={cb.x} cy={cb.y} r={cb.r} fill="white" />
            <circle cx={ca.x} cy={ca.y} r={ca.r} fill="black" />
          </mask>
          <mask id={`${uid}mo`}>
            <rect width={W} height={H} fill="white" />
            <circle cx={ca.x} cy={ca.y} r={ca.r} fill="black" />
            <circle cx={cb.x} cy={cb.y} r={cb.r} fill="black" />
          </mask>
        </defs>
        <rect x={10} y={10} width={W - 20} height={H - 20} rx={10} fill={fill('out')} mask={`url(#${uid}mo)`} onClick={() => toggle('out')} style={{ cursor: 'pointer' }} />
        <rect x={10} y={10} width={W - 20} height={H - 20} rx={10} fill="none" stroke="var(--border-strong)" />
        <rect width={W} height={H} fill={fill('a')} mask={`url(#${uid}ma)`} onClick={() => toggle('a')} style={{ cursor: 'pointer' }} />
        <rect width={W} height={H} fill={fill('b')} mask={`url(#${uid}mb)`} onClick={() => toggle('b')} style={{ cursor: 'pointer' }} />
        <circle cx={cb.x} cy={cb.y} r={cb.r} fill={fill('ab')} clipPath={`url(#${uid}ca)`} onClick={() => toggle('ab')} style={{ cursor: 'pointer' }} />
        <circle cx={ca.x} cy={ca.y} r={ca.r} fill="none" stroke="var(--c1)" strokeWidth={2} pointerEvents="none" />
        <circle cx={cb.x} cy={cb.y} r={cb.r} fill="none" stroke="var(--c2)" strokeWidth={2} pointerEvents="none" />
        <text x={ca.x - 60} y={ca.y - 62} fontSize={16} fontWeight={700} style={{ fill: 'var(--c1)' }}>
          A
        </text>
        <text x={cb.x + 52} y={cb.y - 62} fontSize={16} fontWeight={700} style={{ fill: 'var(--c2)' }}>
          B
        </text>
        <text x={22} y={30} fontSize={13} fontWeight={600}>
          S
        </text>
        {(
          [
            ['a', ca.x - 40, ca.y],
            ['ab', (ca.x + cb.x) / 2, ca.y],
            ['b', cb.x + 40, cb.y],
            ['out', W - 50, H - 26],
          ] as const
        ).map(([r, x, y]) => (
          <text key={r} x={x} y={y + 4} textAnchor="middle" fontSize={13} fontWeight={600} pointerEvents="none" style={{ fill: 'var(--fg)' }}>
            {fmt(prob[r], 2)}
          </text>
        ))}
      </svg>
      <KV
        items={[
          { k: 'Selected event', v: match ? <Tex>{match.tex}</Tex> : sel.size ? 'custom union of atoms' : '∅' },
          { k: 'P(selected)', v: fmt(total, 3) },
          { k: 'Inclusion–exclusion P(A∪B)', v: `${fmt(pa, 2)} + ${fmt(pb, 2)} − ${fmt(inter, 2)} = ${fmt(pa + pb - inter, 3)}` },
          {
            k: 'Independent?',
            v: Math.abs(inter - pa * pb) < 0.005 ? <span style={{ color: 'var(--good)' }}>yes: P(A∩B) = P(A)P(B)</span> : `no: P(A)P(B) = ${fmt(pa * pb, 3)}`,
          },
          { k: 'P(A | B)', v: pb > 0 ? fmt(inter / pb, 3) : 'undefined (P(B)=0)' },
        ]}
      />
    </VizFrame>
  );
}

/* ------------------------------------------------------------------ Bayes */

interface Hyp {
  name: string;
  prior: number;
  like: number; // P(E | H)
}

const BAYES_PRESETS: Record<string, { title: string; evidence: string; hyps: Hyp[] }> = {
  test: {
    title: 'Medical test',
    evidence: 'positive test',
    hyps: [
      { name: 'ill', prior: 0.01, like: 0.95 },
      { name: 'healthy', prior: 0.99, like: 0.05 },
    ],
  },
  factory: {
    title: 'Three machines',
    evidence: 'defective item',
    hyps: [
      { name: 'M1', prior: 0.5, like: 0.03 },
      { name: 'M2', prior: 0.3, like: 0.04 },
      { name: 'M3', prior: 0.2, like: 0.06 },
    ],
  },
  spam: {
    title: 'Spam filter',
    evidence: 'contains "winner"',
    hyps: [
      { name: 'spam', prior: 0.3, like: 0.2 },
      { name: 'ham', prior: 0.7, like: 0.005 },
    ],
  },
};

export function BayesTree(props: Record<string, unknown>) {
  const [preset, setPreset] = useState<string>((props.preset as string) ?? 'test');
  const [hyps, setHyps] = useState<Hyp[]>(BAYES_PRESETS[preset].hyps);
  const evidence = BAYES_PRESETS[preset].evidence;
  const priorSum = hyps.reduce((s, h) => s + h.prior, 0);
  const pE = hyps.reduce((s, h) => s + h.prior * h.like, 0);
  const post = hyps.map((h) => (pE > 0 ? (h.prior * h.like) / pE : 0));
  const N = 10000;
  const set = (i: number, k: keyof Hyp, v: number | string) => setHyps((hs) => hs.map((h, j) => (j === i ? { ...h, [k]: v } : h)));
  const W = 640;
  const rowH = 64;
  const H = hyps.length * rowH * 2 + 20;
  return (
    <VizFrame title="Bayes' rule & law of total probability" caption="Each path multiplies probabilities along its edges. P(E) adds the paths that end in E; the posterior is a path's share of that sum.">
      <div className="row" style={{ marginBottom: 10 }}>
        <Seg
          value={preset}
          options={Object.entries(BAYES_PRESETS).map(([k, p]) => ({ v: k, label: p.title }))}
          onChange={(k) => {
            setPreset(k);
            setHyps(BAYES_PRESETS[k].hyps);
          }}
        />
      </div>
      <div className="scroll-x">
        <table className="data-table" style={{ minWidth: 420 }}>
          <thead>
            <tr>
              <th>Hypothesis H</th>
              <th className="num">Prior P(H)</th>
              <th className="num">Likelihood P(E|H)</th>
              <th className="num">P(H)·P(E|H)</th>
              <th className="num">Posterior P(H|E)</th>
            </tr>
          </thead>
          <tbody>
            {hyps.map((h, i) => (
              <tr key={i}>
                <td>{h.name}</td>
                <td className="num">
                  <input type="number" step={0.01} min={0} max={1} value={h.prior} onChange={(e) => set(i, 'prior', +e.target.value)} style={{ width: 80 }} />
                </td>
                <td className="num">
                  <input type="number" step={0.01} min={0} max={1} value={h.like} onChange={(e) => set(i, 'like', +e.target.value)} style={{ width: 80 }} />
                </td>
                <td className="num">{fmt(h.prior * h.like, 5)}</td>
                <td className="num">
                  <b>{fmt(post[i], 4)}</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {Math.abs(priorSum - 1) > 1e-6 && <div className="callout warn small">Priors sum to {fmt(priorSum, 4)}; they must form a partition (sum to 1).</div>}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, marginTop: 8 }}>
        {hyps.map((h, i) => {
          const yH = 10 + (i * 2 + 1) * rowH;
          const yE = yH - rowH / 2.2;
          const yN = yH + rowH / 2.2;
          const rootY = H / 2;
          return (
            <g key={i}>
              <line x1={40} y1={rootY} x2={220} y2={yH} stroke="var(--border-strong)" strokeWidth={1 + 6 * h.prior} />
              <text x={130} y={(rootY + yH) / 2 - 6} fontSize={12} textAnchor="middle">
                {fmt(h.prior, 3)}
              </text>
              <rect x={220} y={yH - 14} width={90} height={28} rx={6} fill="var(--bg-sunk)" stroke="var(--border-strong)" />
              <text x={265} y={yH + 4} fontSize={13} textAnchor="middle" fontWeight={600} style={{ fill: 'var(--fg)' }}>
                {h.name}
              </text>
              <line x1={310} y1={yH} x2={420} y2={yE} stroke="var(--c3)" strokeWidth={1 + 6 * h.like} />
              <line x1={310} y1={yH} x2={420} y2={yN} stroke="var(--border-strong)" strokeWidth={1 + 6 * (1 - h.like)} />
              <text x={370} y={yE - 2} fontSize={11} textAnchor="middle">
                {fmt(h.like, 3)}
              </text>
              <text x={370} y={yN + 12} fontSize={11} textAnchor="middle">
                {fmt(1 - h.like, 3)}
              </text>
              <text x={428} y={yE + 4} fontSize={12} fontWeight={600} style={{ fill: 'var(--c3)' }}>
                E: {fmt(h.prior * h.like, 5)}
              </text>
              <text x={428} y={yN + 4} fontSize={12}>
                Eᶜ: {fmt(h.prior * (1 - h.like), 5)}
              </text>
            </g>
          );
        })}
        <circle cx={40} cy={H / 2} r={6} fill="var(--accent)" />
      </svg>
      <KV
        items={[
          { k: `P(E) = P(${evidence})`, v: fmt(pE, 5) },
          ...hyps.map((h, i) => ({ k: `P(${h.name} | E)`, v: fmt(post[i], 4) })),
        ]}
      />
      <div className="callout small">
        <b>Natural frequencies:</b> out of {N.toLocaleString()} cases,{' '}
        {hyps.map((h, i) => (
          <span key={i}>
            {i > 0 && ', '}
            {Math.round(N * h.prior).toLocaleString()} are <i>{h.name}</i> and {Math.round(N * h.prior * h.like).toLocaleString()} of them show E
          </span>
        ))}
        . So among the {Math.round(N * pE).toLocaleString()} cases showing E, a fraction {fmt(post[0], 3)} is <i>{hyps[0]?.name}</i>.
      </div>
    </VizFrame>
  );
}

/* ------------------------------------------------------------------ Independence on two dice */

type Cell = [number, number];
const DICE_EVENTS: { id: string; label: string; f: (a: number, b: number) => boolean }[] = [
  { id: 'e1', label: 'first die even', f: (a) => a % 2 === 0 },
  { id: 'e2', label: 'second die even', f: (_, b) => b % 2 === 0 },
  { id: 's7', label: 'sum = 7', f: (a, b) => a + b === 7 },
  { id: 's6', label: 'sum = 6', f: (a, b) => a + b === 6 },
  { id: 'f4', label: 'first die = 4', f: (a) => a === 4 },
  { id: 'f1', label: 'first die = 1', f: (a) => a === 1 },
  { id: 'dbl', label: 'doubles', f: (a, b) => a === b },
  { id: 'se', label: 'sum even', f: (a, b) => (a + b) % 2 === 0 },
  { id: 'ge10', label: 'sum ≥ 10', f: (a, b) => a + b >= 10 },
  { id: 'max', label: 'max ≥ 5', f: (a, b) => Math.max(a, b) >= 5 },
];

export function IndependenceChecker() {
  const [ea, setEa] = useState('s7');
  const [eb, setEb] = useState('f4');
  const A = DICE_EVENTS.find((e) => e.id === ea)!;
  const B = DICE_EVENTS.find((e) => e.id === eb)!;
  const cells: Cell[] = useMemo(() => Array.from({ length: 36 }, (_, i) => [Math.floor(i / 6) + 1, (i % 6) + 1]), []);
  const nA = cells.filter(([a, b]) => A.f(a, b)).length;
  const nB = cells.filter(([a, b]) => B.f(a, b)).length;
  const nAB = cells.filter(([a, b]) => A.f(a, b) && B.f(a, b)).length;
  const indep = nAB * 36 === nA * nB;
  const sz = 34;
  return (
    <VizFrame title="Independence on two dice" caption="Uniform probability on 36 outcomes. A and B are independent iff |A∩B|·36 = |A|·|B|, i.e. learning B does not change the probability of A.">
      <div className="row" style={{ marginBottom: 10 }}>
        <label className="field">
          Event A
          <select value={ea} onChange={(e) => setEa(e.target.value)}>
            {DICE_EVENTS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Event B
          <select value={eb} onChange={(e) => setEb(e.target.value)}>
            {DICE_EVENTS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="row" style={{ alignItems: 'flex-start', gap: 24 }}>
        <svg viewBox={`0 0 ${sz * 6 + 30} ${sz * 6 + 30}`} width={sz * 6 + 30} style={{ maxWidth: '100%' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <g key={i}>
              <text x={30 + (i - 0.5) * sz} y={14} textAnchor="middle" fontSize={11}>
                {i}
              </text>
              <text x={12} y={30 + (i - 0.5) * sz + 4} textAnchor="middle" fontSize={11}>
                {i}
              </text>
            </g>
          ))}
          {cells.map(([a, b]) => {
            const inA = A.f(a, b);
            const inB = B.f(a, b);
            const fill = inA && inB ? 'var(--c3)' : inA ? 'color-mix(in srgb, var(--c1) 40%, transparent)' : inB ? 'color-mix(in srgb, var(--c2) 40%, transparent)' : 'var(--bg-sunk)';
            return <rect key={`${a}${b}`} x={30 + (b - 1) * sz + 2} y={30 + (a - 1) * sz + 2} width={sz - 4} height={sz - 4} rx={5} fill={fill} />;
          })}
        </svg>
        <div className="stack" style={{ flex: 1, minWidth: 220 }}>
          <div className="legend">
            <span>
              <i className="box" style={{ background: 'color-mix(in srgb, var(--c1) 40%, transparent)' }} />A only
            </span>
            <span>
              <i className="box" style={{ background: 'color-mix(in srgb, var(--c2) 40%, transparent)' }} />B only
            </span>
            <span>
              <i className="box" style={{ background: 'var(--c3)' }} />A ∩ B
            </span>
          </div>
          <div className="small faint">rows = first die, columns = second die</div>
          <KV
            items={[
              { k: 'P(A)', v: toFraction(nA / 36) },
              { k: 'P(B)', v: toFraction(nB / 36) },
              { k: 'P(A∩B)', v: toFraction(nAB / 36) },
              { k: 'P(A)·P(B)', v: toFraction((nA * nB) / 1296) },
              { k: 'P(A | B)', v: nB ? toFraction(nAB / nB) : '—' },
            ]}
          />
          <div className={`callout ${indep ? 'good' : 'bad'} small`}>{indep ? 'Independent: P(A∩B) = P(A)·P(B).' : 'Dependent: P(A∩B) ≠ P(A)·P(B).'}</div>
        </div>
      </div>
    </VizFrame>
  );
}
