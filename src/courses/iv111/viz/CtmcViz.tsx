/** CTMC / queue visualiser: rate graph, embedded DTMC, time-abstract vs time frequencies, simulation. */
import { useMemo, useState } from 'react';
import { stationary } from '../../../shared/math/markov';
import { fmt, toFraction } from '../../../shared/math/linalg';
import { expSample, makeRng, sampleIndex } from '../../../shared/math/random';
import { GraphView, lineLayout, type GEdge, type GNode } from '../../../shared/viz/graph';
import { KV, Seg, Slider, VizFrame } from '../../../shared/viz/kit';
import { Bars } from '../../../shared/viz/markovChain';

function queueRates(lambda: number, mu: number, servers: number, cap: number): number[][] {
  const n = cap + 1;
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (j === i + 1 ? lambda : j === i - 1 ? Math.min(i, servers) * mu : 0)),
  );
}

export default function CtmcViz() {
  const [lambda, setLambda] = useState(5);
  const [mu, setMu] = useState(7);
  const [servers, setServers] = useState(2);
  const [cap, setCap] = useState(2);
  const [view, setView] = useState<'ctmc' | 'dtmc' | 'unif'>('ctmc');
  const [seed, setSeed] = useState(1);
  const Q = useMemo(() => queueRates(lambda, mu, servers, cap), [lambda, mu, servers, cap]);
  const n = Q.length;
  const exit = Q.map((r) => r.reduce((a, b) => a + b, 0));
  const emb = Q.map((r, i) => (exit[i] > 0 ? r.map((x) => x / exit[i]) : r.map((_, j) => +(i === j))));
  const piD = stationary(emb) ?? new Array<number>(n).fill(1 / n);
  const w = piD.map((p, i) => p / exit[i]);
  const ws = w.reduce((a, b) => a + b, 0);
  const F = w.map((x) => x / ws);
  const Lam = Math.max(...exit);
  const unif = Q.map((r, i) => r.map((x, j) => (i === j ? 1 - exit[i] / Lam : x / Lam)));
  const util = 1 - F[0];
  const meanLen = F.reduce((s, f, i) => s + i * f, 0);

  const sim = useMemo(() => {
    const rng = makeRng(seed);
    let s = 0;
    let t = 0;
    const T = 200 / Math.max(lambda, mu);
    const time = new Array<number>(n).fill(0);
    const path: { s: number; t0: number; t1: number }[] = [];
    while (t < T) {
      const hold = exit[s] > 0 ? expSample(rng, exit[s]) : T - t;
      const t1 = Math.min(T, t + hold);
      path.push({ s, t0: t, t1 });
      time[s] += t1 - t;
      t = t1;
      if (exit[s] > 0) s = sampleIndex(rng, emb[s]);
    }
    return { path, freq: time.map((x) => x / T), T };
  }, [seed, Q]); // eslint-disable-line react-hooks/exhaustive-deps

  const W = 640,
    H = 170;
  const pos = lineLayout(n, W, H);
  const nodes: GNode[] = pos.map((p, i) => ({ id: i, label: `s${i}`, x: p.x, y: p.y, sub: view === 'ctmc' ? `exit ${fmt(exit[i], 2)}` : undefined }));
  const edges: GEdge[] = [];
  const M = view === 'ctmc' ? Q : view === 'dtmc' ? emb : unif;
  M.forEach((r, i) =>
    r.forEach((x, j) => {
      if (x > 1e-12 && (i !== j || view === 'unif')) edges.push({ from: i, to: j, label: view === 'ctmc' ? fmt(x, 2) : toFraction(x, 50), bend: i === j ? undefined : 0.25 });
    }),
  );
  return (
    <VizFrame
      title="Continuous-time Markov chain: M/M/c/K queue"
      caption="Rates on edges are parameters of exponential clocks; the first clock to ring decides the move. The embedded DTMC forgets time (exit probabilities λᵢⱼ/λᵢ); weighting its stationary distribution by mean holding times 1/λᵢ gives the fraction of time spent in each state."
    >
      <div className="viz-controls">
        <Slider label="arrival rate λ" value={lambda} min={0.5} max={15} step={0.5} onChange={setLambda} />
        <Slider label="service rate μ (per server)" value={mu} min={0.5} max={15} step={0.5} onChange={setMu} />
        <Slider label="servers c" value={servers} min={1} max={5} step={1} onChange={(v) => { setServers(v); setCap(Math.max(cap, v)); }} />
        <Slider label="capacity K (max in system)" value={cap} min={Math.max(1, servers)} max={8} step={1} onChange={setCap} />
      </div>
      <div className="row" style={{ marginBottom: 6 }}>
        <Seg
          value={view}
          onChange={setView}
          options={[
            { v: 'ctmc', label: 'CTMC (rates)' },
            { v: 'dtmc', label: 'Embedded DTMC' },
            { v: 'unif', label: `Uniformised (Λ = ${fmt(Lam, 2)})` },
          ]}
        />
      </div>
      <GraphView nodes={nodes} edges={edges} width={W} height={H} />
      <Bars
        labels={nodes.map((x) => x.label)}
        series={[
          { label: 'time-abstract frequency (embedded DTMC)', values: piD, color: 'var(--c1)' },
          { label: 'time frequency F_s', values: F, color: 'var(--c2)' },
          { label: 'simulated fraction of time', values: sim.freq, color: 'var(--c3)' },
        ]}
      />
      <KV
        items={[
          { k: 'time frequency F', v: `(${F.map((x) => toFraction(x, 2000)).join(', ')})` },
          { k: 'utilisation 1 − F₀', v: fmt(util, 4) },
          { k: 'mean number in system Σ s·F_s', v: fmt(meanLen, 4) },
          { k: 'mean holding times 1/λᵢ', v: exit.map((e) => fmt(1 / e, 3)).join(', ') },
        ]}
      />
      <div className="row between">
        <span className="small muted">Simulated horizon T = {fmt(sim.T, 2)} time units, {sim.path.length} jumps.</span>
        <button className="btn sm" onClick={() => setSeed((s) => s + 1)}>
          Re-simulate
        </button>
      </div>
      <svg viewBox="0 0 640 60" width="100%" style={{ maxWidth: 640, marginTop: 6 }}>
        {sim.path
          .filter((p) => p.t0 < sim.T * 0.25)
          .map((p, i) => {
            const x0 = 10 + (p.t0 / (sim.T * 0.25)) * 620;
            const x1 = 10 + (Math.min(p.t1, sim.T * 0.25) / (sim.T * 0.25)) * 620;
            return <rect key={i} x={x0} width={Math.max(0.5, x1 - x0)} y={50 - (p.s / Math.max(1, n - 1)) * 40 - 4} height={4} fill="var(--c2)" />;
          })}
        <text x={10} y={58} fontSize={9}>
          time → (first quarter of the run; height = state)
        </text>
      </svg>
    </VizFrame>
  );
}
