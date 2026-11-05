/** Interactive DTMC editor & analyser. */
import { useMemo, useState } from 'react';
import { analyze, boundedReachability, distributionAfter, expectedHittingTimes, hittingProbabilities, limitingFrom, pageRankMatrix, simulate, stationary, validateStochastic } from '../math/markov';
import { fmt, toFraction } from '../math/linalg';
import { makeRng } from '../math/random';
import { GraphView, circleLayout, lineLayout, type GEdge, type GNode } from './graph';
import { Chart, KV, Legend, MatrixInput, Seg, Slider, VizFrame, SERIES } from './kit';
import { Tex } from '../../platform/components/Markdown';

export interface ChainPreset {
  title: string;
  states: string[];
  P: number[][];
  layout?: 'circle' | 'line';
  note?: string;
}

const buffer = (cap: number, p: number, q: number): number[][] =>
  Array.from({ length: cap + 1 }, (_, i) => {
    const row = new Array<number>(cap + 1).fill(0);
    const up = i === cap ? 0 : i === 0 ? p : p * (1 - q);
    const down = i === 0 ? 0 : q * (1 - (i === cap ? 0 : p));
    if (i < cap) row[i + 1] = up;
    if (i > 0) row[i - 1] = down;
    row[i] = 1 - up - down;
    return row;
  });

export const CHAIN_PRESETS: Record<string, ChainPreset> = {
  weather: {
    title: 'Weather',
    states: ['sun', 'cloud', 'rain'],
    P: [
      [0.6, 0.3, 0.1],
      [0.3, 0.4, 0.3],
      [0.2, 0.4, 0.4],
    ],
    note: 'Irreducible and aperiodic → unique stationary distribution, and π⁽ⁿ⁾ converges to it from any start.',
  },
  buffer: {
    title: 'Finite buffer',
    states: ['0', '1', '2', '3'],
    P: buffer(3, 0.3, 0.5),
    layout: 'line',
    note: 'Queue with capacity 3: each step a job arrives w.p. 0.3 and the served job leaves w.p. 0.5. A birth–death chain.',
  },
  drunkard: {
    title: "Drunkard's walk",
    states: ['1', '2', '3', '4'],
    P: [
      [1, 0, 0, 0],
      [0.5, 0, 0.5, 0],
      [0, 0.5, 0, 0.5],
      [0, 0, 0, 1],
    ],
    layout: 'line',
    note: 'States 1 and 4 are ditches (absorbing). From 2: hit 4 with probability 1/3; mean time to a ditch is 2. Open the Hitting tab and select target {4} or {1, 4}.',
  },
  fourState: {
    title: '4-state example',
    states: ['1', '2', '3', '4'],
    P: [
      [0, 0.25, 0, 0.75],
      [0.5, 0, 1 / 3, 1 / 6],
      [0, 0, 1, 0],
      [0, 0.5, 0.25, 0.25],
    ],
    note: 'P(X₃ = 4 | X₀ = 1) = (P³)₁,₄ = 41/192: start in 1, set n = 3 in the Evolution tab. State 3 is absorbing, so all mass eventually ends there.',
  },
  cycle3: {
    title: 'Equilibrium example',
    states: ['1', '2', '3'],
    P: [
      [0, 1, 0],
      [0, 0, 1],
      [0.5, 0.5, 0],
    ],
    note: 'Irreducible and aperiodic (cycles of lengths 2 and 3). π = (0.2, 0.4, 0.4) and mean return times m = (5, 2.5, 2.5). Simulate a long run to watch the frequencies converge.',
  },
  buffer2: {
    title: 'Finite buffer (cut-sets)',
    states: ['s0', 's1', 's2'],
    P: [
      [2 / 3, 1 / 3, 0],
      [0.5, 1 / 6, 1 / 3],
      [0, 0.5, 0.5],
    ],
    layout: 'line',
    note: 'Cut-set equations π₀·1/3 = π₁·1/2 and π₁·1/3 = π₂·1/2 give π = (9/19, 6/19, 4/19).',
  },
  ruin: {
    title: "Gambler's ruin",
    states: ['0', '1', '2', '3', '4'],
    P: [
      [1, 0, 0, 0, 0],
      [0.6, 0, 0.4, 0, 0],
      [0, 0.6, 0, 0.4, 0],
      [0, 0, 0.6, 0, 0.4],
      [0, 0, 0, 0, 1],
    ],
    layout: 'line',
    note: 'Win 1 with probability 0.4, lose 1 with 0.6; stop at 0 (ruin) or 4 (goal). Two absorbing states → no unique stationary distribution.',
  },
  periodic: {
    title: 'Periodic cycle',
    states: ['a', 'b', 'c'],
    P: [
      [0, 1, 0],
      [0, 0, 1],
      [1, 0, 0],
    ],
    note: 'Period 3: π⁽ⁿ⁾ rotates forever and does not converge, yet the stationary distribution (1/3,1/3,1/3) exists and equals the long-run frequency of visits.',
  },
  reducible: {
    title: 'Two closed classes',
    states: ['s', 't', 'u', 'v', 'w'],
    P: [
      [0.2, 0.5, 0.3, 0, 0],
      [0.4, 0, 0, 0.6, 0],
      [0, 0, 0.5, 0, 0.5],
      [0, 0, 0, 0.3, 0.7],
      [0, 0, 0, 0.6, 0.4],
    ],
    note: 's and t are transient. Class {v,w} is closed; u leaks into w. The long-run behaviour depends on where you start.',
  },
  pagerank: {
    title: 'PageRank',
    states: ['A', 'B', 'C', 'D'],
    P: pageRankMatrix([[1, 2], [2], [0], [0, 2]], 0.85),
    note: 'Random surfer: follows a random outgoing link w.p. 0.85, otherwise jumps to a uniformly random page. PageRank = stationary distribution.',
  },
};

type Tab = 'evolve' | 'structure' | 'hitting' | 'simulate';

export function MarkovChainEditor(props: Record<string, unknown>) {
  const initialPreset = (props.preset as string) ?? 'weather';
  const [presetKey, setPresetKey] = useState(initialPreset);
  return <ChainEditorInner key={presetKey} preset={CHAIN_PRESETS[presetKey]} presetKey={presetKey} onPreset={setPresetKey} defaultTab={(props.tab as Tab) ?? 'evolve'} />;
}

function ChainEditorInner({ preset, presetKey, onPreset, defaultTab }: { preset: ChainPreset; presetKey: string; onPreset: (k: string) => void; defaultTab: Tab }) {
  const W = 640,
    H = 330;
  const [names, setNames] = useState(preset.states);
  const [P, setP] = useState(preset.P);
  const [pos, setPos] = useState(() => (preset.layout === 'line' ? lineLayout(preset.states.length, W, H) : circleLayout(preset.states.length, W, H)));
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [start, setStart] = useState(0);
  const [nSteps, setNSteps] = useState(0);
  const [target, setTarget] = useState<number[]>([preset.states.length - 1]);
  const [bound, setBound] = useState(5);
  const [simLen, setSimLen] = useState(500);
  const [seed, setSeed] = useState(3);
  const [editing, setEditing] = useState(false);
  const n = P.length;
  const valid = validateStochastic(P);
  const an = useMemo(() => (valid.ok ? analyze(P) : null), [P, valid.ok]);
  const pi = useMemo(() => (valid.ok ? stationary(P) : null), [P, valid.ok]);
  const pi0 = useMemo(() => P.map((_, i) => +(i === start)), [P, start]);
  const evo = useMemo(() => (valid.ok ? distributionAfter(pi0, P, 60) : []), [pi0, P, valid.ok]);
  const lim = useMemo(() => (valid.ok ? limitingFrom(P, pi0) : null), [P, pi0, valid.ok]);
  const h = useMemo(() => (valid.ok && target.length ? hittingProbabilities(P, target) : null), [P, target, valid.ok]);
  const k = useMemo(() => (valid.ok && target.length ? expectedHittingTimes(P, target) : null), [P, target, valid.ok]);
  const br = useMemo(() => (valid.ok && target.length ? boundedReachability(P, target, bound) : null), [P, target, bound, valid.ok]);
  const run = useMemo(() => (valid.ok ? simulate(P, start, simLen, makeRng(seed)) : []), [P, start, simLen, seed, valid.ok]);

  const compColor = (i: number) => {
    if (!an) return undefined;
    const c = an.states[i].comp;
    const bi = an.bottom.indexOf(c);
    return bi >= 0 ? SERIES[bi % SERIES.length] : undefined;
  };
  const nodes: GNode[] = names.map((label, i) => {
    let fill: string | undefined;
    let stroke: string | undefined;
    let sub: string | undefined;
    let level: number | undefined;
    let dashed = false;
    if (tab === 'evolve' && evo[nSteps]) {
      level = evo[nSteps][i];
      sub = fmt(evo[nSteps][i], 3);
      stroke = i === start ? 'var(--accent)' : undefined;
    } else if (tab === 'structure' && an) {
      const c = compColor(i);
      stroke = c ?? 'var(--fg-faint)';
      fill = c ? `color-mix(in srgb, ${c} 18%, var(--bg-elev))` : undefined;
      dashed = !an.states[i].recurrent;
      sub = an.states[i].recurrent ? `rec · d=${an.states[i].period}` : 'transient';
    } else if (tab === 'hitting' && h) {
      stroke = target.includes(i) ? 'var(--c3)' : undefined;
      fill = target.includes(i) ? 'color-mix(in srgb, var(--c3) 22%, var(--bg-elev))' : undefined;
      level = target.includes(i) ? 0 : h[i];
      sub = target.includes(i) ? 'target' : `h=${fmt(h[i], 3)}`;
    } else if (tab === 'simulate' && run.length) {
      const last = run[run.length - 1];
      stroke = i === last ? 'var(--c2)' : undefined;
      sub = `${fmt(run.filter((s) => s === i).length / run.length, 3)}`;
    }
    return { id: i, label, x: pos[i]?.x ?? 0, y: pos[i]?.y ?? 0, fill, stroke, sub, level, dashed };
  });
  const edges: GEdge[] = [];
  P.forEach((row, i) =>
    row.forEach((p, j) => {
      if (p > 1e-9) edges.push({ from: i, to: j, label: toFraction(p, 20), width: 1 + 2.5 * p, color: tab === 'hitting' && target.includes(j) ? 'var(--c3)' : undefined });
    }),
  );

  const resize = (m: number) => {
    if (m < 1 || m > 9) return;
    const nn = names.slice(0, m);
    while (nn.length < m) nn.push(String.fromCharCode(97 + nn.length));
    const nP = Array.from({ length: m }, (_, i) => Array.from({ length: m }, (_, j) => (P[i]?.[j] ?? (i === j ? 1 : 0))));
    nP.forEach((row, i) => {
      const s = row.reduce((a, b) => a + b, 0);
      if (s === 0) row[i] = 1;
    });
    setNames(nn);
    setP(nP);
    setPos(circleLayout(m, W, H));
    setTarget((t) => t.filter((x) => x < m));
    setStart((s) => Math.min(s, m - 1));
  };
  const normalizeRows = () => setP(P.map((row) => {
    const s = row.reduce((a, b) => a + Math.max(0, b), 0);
    return s > 0 ? row.map((x) => Math.max(0, x) / s) : row.map((_, j) => 1 / row.length + 0 * j);
  }));

  return (
    <VizFrame title="Markov chain explorer" caption={preset.note}>
      <div className="row" style={{ marginBottom: 8 }}>
        <select value={presetKey} onChange={(e) => onPreset(e.target.value)}>
          {Object.entries(CHAIN_PRESETS).map(([k2, p]) => (
            <option key={k2} value={k2}>
              {p.title}
            </option>
          ))}
        </select>
        <Seg
          value={tab}
          onChange={setTab}
          options={[
            { v: 'evolve', label: 'Evolution' },
            { v: 'structure', label: 'Structure' },
            { v: 'hitting', label: 'Hitting' },
            { v: 'simulate', label: 'Simulate' },
          ]}
        />
        <button className="btn sm" onClick={() => setEditing((e) => !e)}>
          {editing ? 'Hide matrix' : 'Edit matrix'}
        </button>
      </div>
      {editing && (
        <div className="card flat tight" style={{ marginBottom: 10 }}>
          <div className="row between" style={{ marginBottom: 6 }}>
            <span className="small muted">Transition matrix P (row i = distribution of the next state from i)</span>
            <span className="row" style={{ gap: 6 }}>
              <button className="btn sm" onClick={() => resize(n - 1)}>
                − state
              </button>
              <button className="btn sm" onClick={() => resize(n + 1)}>
                + state
              </button>
              <button className="btn sm" onClick={normalizeRows}>
                Normalise rows
              </button>
            </span>
          </div>
          <MatrixInput value={P} onChange={setP} rowLabels={names} colLabels={names} badRows={valid.badRows} />
          {!valid.ok && <div className="callout bad small">Rows {valid.badRows.map((r) => names[r]).join(', ')} do not sum to 1.</div>}
        </div>
      )}
      <GraphView nodes={nodes} edges={edges} width={W} height={H} onMove={(id, x, y) => setPos((ps) => ps.map((p, i) => (i === id ? { x, y } : p)))} onNodeClick={(id) => (tab === 'hitting' ? setTarget((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id])) : setStart(id))} />
      <div className="small faint">Drag nodes to rearrange. {tab === 'hitting' ? 'Click nodes to toggle the target set A.' : 'Click a node to make it the initial state.'}</div>

      {valid.ok && tab === 'evolve' && (
        <>
          <div className="viz-controls">
            <Slider label="step n" value={nSteps} min={0} max={60} step={1} onChange={setNSteps} />
          </div>
          <Bars labels={names} series={[{ label: `π⁽${nSteps}⁾ (start ${names[start]})`, values: evo[nSteps], color: SERIES[0] }, ...(pi ? [{ label: 'stationary π', values: pi, color: SERIES[1] }] : lim ? [{ label: 'long-run limit from this start', values: lim, color: SERIES[1] }] : [])]} />
          <div className="small muted">
            <Tex>{'\\pi^{(n)} = \\pi^{(0)} P^n'}</Tex>. {pi ? 'This chain has a unique stationary distribution.' : 'More than one closed class: the stationary distribution is not unique; the orange bars show where mass ends up from this start.'}
          </div>
        </>
      )}

      {valid.ok && tab === 'structure' && an && (
        <div className="stack" style={{ marginTop: 8 }}>
          <KV
            items={[
              { k: 'Irreducible', v: an.irreducible ? 'yes' : 'no' },
              { k: 'Aperiodic (recurrent part)', v: an.aperiodic ? 'yes' : 'no' },
              { k: 'Ergodic (irreducible + aperiodic)', v: an.ergodic ? 'yes' : 'no' },
              { k: 'Closed classes (BSCCs)', v: an.bottom.length },
            ]}
          />
          <table className="data-table">
            <thead>
              <tr>
                <th>Communicating class</th>
                <th>Type</th>
                <th>Period</th>
              </tr>
            </thead>
            <tbody>
              {an.comps.map((c, ci) => (
                <tr key={ci}>
                  <td>{'{' + c.map((s) => names[s]).join(', ') + '}'}</td>
                  <td>{an.bottom.includes(ci) ? <span className="chip good">closed → recurrent</span> : <span className="chip">transient</span>}</td>
                  <td>{an.states[c[0]].period || '— (no cycle)'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {pi && (
            <div className="small">
              Stationary π = ({pi.map((v) => toFraction(v, 60)).join(', ')}); mean return times <Tex>{'m_i = 1/\\pi_i'}</Tex>: ({pi.map((v) => (v > 0 ? fmt(1 / v, 3) : '∞')).join(', ')}).
            </div>
          )}
        </div>
      )}

      {valid.ok && tab === 'hitting' && h && k && br && (
        <div className="stack" style={{ marginTop: 8 }}>
          <div className="small">
            Target set A = {'{' + target.map((t) => names[t]).join(', ') + '}'}. The hitting probabilities are the <b>minimal non-negative</b> solution of
            <Tex display>{'h_i = 1 \\;(i\\in A), \\qquad h_i = \\sum_j P_{ij}\\, h_j \\;(i \\notin A)'}</Tex>
            and expected hitting times solve <Tex>{'k_i = 0\\;(i\\in A),\\; k_i = 1 + \\sum_{j\\notin A} P_{ij} k_j'}</Tex> (∞ when <Tex>{'h_i<1'}</Tex>).
          </div>
          <div className="viz-controls">
            <Slider label="bounded reachability: steps ≤" value={bound} min={0} max={30} step={1} onChange={setBound} />
          </div>
          <div className="scroll-x">
            <table className="data-table">
              <thead>
                <tr>
                  <th>state i</th>
                  <th className="num">h_i = P(reach A)</th>
                  <th className="num">k_i = E[steps to A]</th>
                  <th className="num">P(reach A in ≤ {bound})</th>
                </tr>
              </thead>
              <tbody>
                {names.map((nm, i) => (
                  <tr key={i}>
                    <td>{nm}</td>
                    <td className="num">{toFraction(h[i], 100)}</td>
                    <td className="num">{fmt(k[i], 4)}</td>
                    <td className="num">{fmt(br[i], 4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {valid.ok && tab === 'simulate' && (
        <div className="stack" style={{ marginTop: 8 }}>
          <div className="viz-controls">
            <Slider label="run length" value={simLen} min={10} max={20000} step={10} onChange={setSimLen} />
          </div>
          <div className="mono small" style={{ wordBreak: 'break-all' }}>
            {run.slice(0, 60).map((s) => names[s]).join(' → ')}
            {run.length > 60 ? ' → …' : ''}
          </div>
          <Bars
            labels={names}
            series={[
              { label: 'fraction of time in state', values: names.map((_, i) => run.filter((s) => s === i).length / run.length), color: SERIES[2] },
              ...(lim ? [{ label: 'theory (long-run limit)', values: lim, color: SERIES[1] }] : []),
            ]}
          />
          <div className="row between">
            <span className="small muted">Ergodic theorem: the fraction of time spent in i converges to π_i (almost surely), even for periodic chains.</span>
            <button className="btn sm" onClick={() => setSeed((s) => s + 1)}>
              New run
            </button>
          </div>
        </div>
      )}
    </VizFrame>
  );
}

export function Bars({ labels, series, yMax }: { labels: string[]; series: { label: string; values: number[]; color: string }[]; yMax?: number }) {
  const m = series.length;
  const ymax = yMax ?? Math.max(0.05, ...series.flatMap((s) => s.values)) * 1.15;
  return (
    <>
      <Chart x={[-0.5, labels.length - 0.5]} y={[0, Math.min(1.05, ymax)]} height={200} xTicks={labels.map((_, i) => i)} xFormat={(v) => labels[v] ?? ''}>
        {(sx, sy) => {
          const bw = Math.min(40, (sx(1) - sx(0)) / (m + 0.6));
          return series.map((s, si) =>
            s.values.map((v, i) => <rect key={`${si}-${i}`} x={sx(i) - (m * bw) / 2 + si * bw} width={bw - 2} y={sy(v)} height={Math.max(0, sy(0) - sy(v))} fill={s.color} rx={2} />),
          );
        }}
      </Chart>
      <Legend items={series.map((s) => ({ label: s.label, color: s.color, box: true }))} />
    </>
  );
}
