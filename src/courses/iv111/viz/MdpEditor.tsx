/** MDP visualiser: value iteration / policy iteration with a discount slider. */
import { useMemo, useState } from 'react';
import { inducedChain, policyIteration, qValue, valueIteration, type Mdp } from '../../../shared/math/mdp';
import { fmt } from '../../../shared/math/linalg';
import { GraphView, type GEdge, type GNode } from '../../../shared/viz/graph';
import { KV, Seg, Slider, VizFrame } from '../../../shared/viz/kit';
import { Tex } from '../../../platform/components/Markdown';

interface MdpPreset {
  title: string;
  mdp: Mdp;
  pos: { x: number; y: number }[];
  note: string;
}

const PRESETS: Record<string, MdpPreset> = {
  machine: {
    title: 'Machine maintenance',
    note: 'Running a worn machine earns now but risks a costly breakdown. Lower γ → greedy (keep running); higher γ → maintain early.',
    pos: [
      { x: 110, y: 200 },
      { x: 330, y: 80 },
      { x: 550, y: 200 },
    ],
    mdp: {
      states: [
        {
          name: 'new',
          actions: [
            { name: 'run', reward: 2, next: [{ to: 0, p: 0.7 }, { to: 1, p: 0.3 }] },
            { name: 'service', reward: 0.5, next: [{ to: 0, p: 1 }] },
          ],
        },
        {
          name: 'worn',
          actions: [
            { name: 'run', reward: 1.5, next: [{ to: 1, p: 0.5 }, { to: 2, p: 0.5 }] },
            { name: 'repair', reward: -0.5, next: [{ to: 0, p: 1 }] },
          ],
        },
        {
          name: 'broken',
          actions: [
            { name: 'fix', reward: -2, next: [{ to: 0, p: 0.6 }, { to: 2, p: 0.4 }] },
            { name: 'replace', reward: -5, next: [{ to: 0, p: 1 }] },
          ],
        },
      ],
    },
  },
  printer: {
    title: 'Jammed printer',
    note: 'When paper jams you can force it out (fast, but the printer may become degraded "br.") or disassemble (slow maintenance ≈ 10 steps, restores the printer). Rewards: 1 per printing step.',
    pos: [
      { x: 60, y: 70 },
      { x: 240, y: 70 },
      { x: 430, y: 70 },
      { x: 60, y: 290 },
      { x: 240, y: 290 },
      { x: 430, y: 290 },
      { x: 600, y: 180 },
    ],
    mdp: {
      states: [
        { name: 'idle', actions: [{ name: '·', reward: 0, next: [{ to: 0, p: 0.8 }, { to: 1, p: 0.2 }] }] },
        { name: 'print', actions: [{ name: '·', reward: 1, next: [{ to: 1, p: 0.5 }, { to: 0, p: 0.45 }, { to: 2, p: 0.05 }] }] },
        {
          name: 'jam',
          actions: [
            { name: 'force', reward: 0, next: [{ to: 1, p: 0.8 }, { to: 4, p: 0.2 }] },
            { name: 'disas.', reward: 0, next: [{ to: 6, p: 1 }] },
          ],
        },
        { name: 'idle br', actions: [{ name: '·', reward: 0, next: [{ to: 3, p: 0.8 }, { to: 4, p: 0.2 }] }] },
        { name: 'print br', actions: [{ name: '·', reward: 1, next: [{ to: 4, p: 0.5 }, { to: 3, p: 0.25 }, { to: 5, p: 0.25 }] }] },
        {
          name: 'jam br',
          actions: [
            { name: 'force', reward: 0, next: [{ to: 4, p: 0.8 }, { to: 5, p: 0.2 }] },
            { name: 'disas.', reward: 0, next: [{ to: 6, p: 1 }] },
          ],
        },
        { name: 'maint', actions: [{ name: '·', reward: 0, next: [{ to: 6, p: 0.9 }, { to: 0, p: 0.1 }] }] },
      ],
    },
  },
};

export default function MdpEditor(props: Record<string, unknown>) {
  const [key, setKey] = useState<string>((props.preset as string) ?? 'machine');
  const pre = PRESETS[key];
  const m = pre.mdp;
  const [gamma, setGamma] = useState(0.9);
  const [algo, setAlgo] = useState<'vi' | 'pi'>('vi');
  const vi = useMemo(() => valueIteration(m, gamma, 2000, 1e-10), [m, gamma]);
  const pi = useMemo(() => policyIteration(m, gamma), [m, gamma]);
  const [iter, setIter] = useState(1000);
  const maxIter = algo === 'vi' ? vi.length - 1 : pi.length - 1;
  const k = Math.min(iter, maxIter);
  const cur = algo === 'vi' ? vi[k] : pi[k];
  const V = cur.V;
  const policy = cur.policy;
  const [pos, setPos] = useState<Record<string, { x: number; y: number }[]>>({});
  const P = pos[key] ?? pre.pos;

  // Build graph: state nodes + one action node per (state, action) with >1 action or any.
  const GW = 660;
  const GH = pre.pos.length > 4 ? 360 : 300;
  const nodes: GNode[] = m.states.map((s, i) => ({ id: i, label: s.name, x: P[i].x, y: P[i].y, sub: `V=${fmt(V[i], 2)}`, stroke: 'var(--accent)' }));
  const edges: GEdge[] = [];
  let aid = 1000;
  m.states.forEach((s, i) => {
    s.actions.forEach((a, ai) => {
      const chosen = policy[i] === ai;
      if (s.actions.length === 1) {
        a.next.forEach((t) => edges.push({ from: i, to: t.to, label: fmt(t.p, 2), color: 'var(--fg-faint)' }));
        return;
      }
      // fan the action dots out around the state, pointing towards their successors
      const tx = a.next.reduce((acc, t) => acc + t.p * P[t.to].x, 0);
      const ty = a.next.reduce((acc, t) => acc + t.p * P[t.to].y, 0);
      let base = Math.atan2(ty - P[i].y, tx - P[i].x);
      if (Math.hypot(tx - P[i].x, ty - P[i].y) < 25) base = Math.atan2(P[i].y - GH / 2, P[i].x - GW / 2);
      const ang = base + (ai - (s.actions.length - 1) / 2) * 0.9;
      const ax = P[i].x + 74 * Math.cos(ang);
      const ay = P[i].y + 74 * Math.sin(ang);
      const id = aid++;
      nodes.push({ id, label: `${a.name}${a.reward ? ` (${a.reward > 0 ? '+' : ''}${a.reward})` : ''}`, x: ax, y: ay, shape: 'dot', fill: chosen ? 'var(--c2)' : 'var(--bg-sunk)', stroke: chosen ? 'var(--c2)' : 'var(--border-strong)' });
      edges.push({ from: i, to: id, color: chosen ? 'var(--c2)' : 'var(--border-strong)', width: chosen ? 2.4 : 1.2, dashed: !chosen, bend: 0 });
      a.next.forEach((t) => edges.push({ from: id, to: t.to, label: fmt(t.p, 2), color: chosen ? 'var(--c2)' : 'var(--fg-faint)', width: chosen ? 2 : 1, dashed: !chosen }));
    });
  });
  const chain = inducedChain(m, policy);

  return (
    <VizFrame title="Markov decision process: optimal discounted payoff" caption={pre.note}>
      <div className="row" style={{ marginBottom: 8 }}>
        <Seg value={key} onChange={(v) => { setKey(v); setIter(1000); }} options={Object.entries(PRESETS).map(([k2, p]) => ({ v: k2, label: p.title }))} />
        <Seg value={algo} onChange={(v) => { setAlgo(v); setIter(1000); }} options={[{ v: 'vi', label: 'Value iteration' }, { v: 'pi', label: 'Policy iteration' }]} />
      </div>
      <div className="viz-controls">
        <Slider label="discount γ" value={gamma} min={0.05} max={0.99} step={0.01} onChange={setGamma} />
        <Slider label={algo === 'vi' ? 'iteration k' : 'improvement round'} value={k} min={0} max={maxIter} step={1} onChange={setIter} />
      </div>
      <GraphView nodes={nodes} edges={edges} width={GW} height={GH} onMove={(id, x, y) => id < 1000 && setPos((ps) => ({ ...ps, [key]: (ps[key] ?? pre.pos).map((p, i) => (i === id ? { x, y } : p)) }))} />
      <div className="small faint">Orange = action chosen by the current (greedy) policy. Small dots are action nodes; edges out of them carry transition probabilities.</div>
      <div className="scroll-x" style={{ marginTop: 8 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>state s</th>
              <th className="num">{algo === 'vi' ? `V_${k}(s)` : `V^{σ_${k}}(s)`}</th>
              {m.states.some((s) => s.actions.length > 1) && <th>Q(s, a) for each action</th>}
              <th>policy</th>
            </tr>
          </thead>
          <tbody>
            {m.states.map((s, i) => (
              <tr key={i}>
                <td>{s.name}</td>
                <td className="num">{fmt(V[i], 4)}</td>
                {m.states.some((x) => x.actions.length > 1) && (
                  <td className="small">
                    {s.actions.length > 1
                      ? s.actions.map((a, ai) => (
                          <span key={ai} style={{ marginRight: 12, fontWeight: policy[i] === ai ? 700 : 400, color: policy[i] === ai ? 'var(--c2)' : undefined }}>
                            {a.name}: {fmt(qValue(m, V, i, ai, gamma), 3)}
                          </span>
                        ))
                      : '—'}
                  </td>
                )}
                <td>{s.actions[policy[i]].name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <KV
        items={[
          { k: 'converged after', v: algo === 'vi' ? `${vi.length - 1} iterations` : `${pi.length} policy evaluations` },
          { k: 'last change ‖V_k − V_{k−1}‖∞', v: algo === 'vi' ? fmt(vi[k].delta, 4) : '—' },
          { k: 'payoff bound r_max/(1−γ)', v: fmt(Math.max(...m.states.flatMap((s) => s.actions.map((a) => Math.abs(a.reward)))) / (1 - gamma), 3) },
        ]}
      />
      <details className="collapse">
        <summary>Bellman optimality equations & induced Markov chain</summary>
        <div className="collapse-body small">
          <Tex display>{"V^*(s) = \\max_{a \\in A}\\Big( r(s,a) + \\gamma \\sum_{s'} P(s,a,s')\\, V^*(s') \\Big)"}</Tex>
          Value iteration applies the right-hand side repeatedly (a γ-contraction, so it converges from any start). Policy iteration alternates
          exact evaluation (a linear system) with greedy improvement. Fixing the memoryless policy shown gives the Markov chain:
          <table className="matrix-input" style={{ marginTop: 6 }}>
            <tbody>
              {chain.map((row, i) => (
                <tr key={i}>
                  <th>{m.states[i].name}</th>
                  {row.map((x, j) => (
                    <td key={j} className="mono center" style={{ minWidth: 44 }}>
                      {x ? fmt(x, 2) : '·'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </VizFrame>
  );
}
