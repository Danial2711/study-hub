/** Distributions, tail bounds, laws of large numbers, CLT, Jensen. */
import { useMemo, useState } from 'react';
import { DIST_SPECS, binomial, normalPdf, type Dist, type DistKind } from '../math/distributions';
import { chebyshevBound, chernoffUpper, markovBound, hoeffdingBound } from '../math/bounds';
import { fmt } from '../math/linalg';
import { makeRng } from '../math/random';
import { Chart, KV, Legend, Seg, Slider, VizFrame, linePath, SERIES } from './kit';

/* ------------------------------------------------------------------ Distribution explorer */

export function DistributionExplorer(props: Record<string, unknown>) {
  const kinds = (props.kinds as DistKind[]) ?? (Object.keys(DIST_SPECS) as DistKind[]);
  const [kind, setKind] = useState<DistKind>((props.kind as DistKind) ?? kinds[0]);
  const spec = DIST_SPECS[kind];
  const [params, setParams] = useState<Record<string, Record<string, number>>>({});
  const p = { ...Object.fromEntries(spec.params.map((s) => [s.key, s.value])), ...(params[kind] ?? {}) };
  const d = spec.make(p);
  const [view, setView] = useState<'pdf' | 'cdf'>('pdf');
  const [memo, setMemo] = useState(false);
  const [shift, setShift] = useState(3);
  const memoryless = kind === 'geometric' || kind === 'exponential';
  return (
    <VizFrame
      title="Distribution explorer"
      caption={
        memoryless && memo
          ? 'Memorylessness: the conditional distribution of X − s given X > s (orange) coincides with the original distribution (blue).'
          : 'Drag the sliders; the dashed line marks E(X), the shaded band E(X) ± σ.'
      }
    >
      <div className="row" style={{ marginBottom: 8 }}>
        <select value={kind} onChange={(e) => setKind(e.target.value as DistKind)}>
          {kinds.map((k) => (
            <option key={k} value={k}>
              {DIST_SPECS[k].title}
            </option>
          ))}
        </select>
        <Seg
          value={view}
          onChange={setView}
          options={[
            { v: 'pdf', label: d.kind === 'discrete' ? 'PMF' : 'PDF' },
            { v: 'cdf', label: 'CDF' },
          ]}
        />
        {memoryless && (
          <label className="row small" style={{ gap: 6 }}>
            <input type="checkbox" checked={memo} onChange={(e) => setMemo(e.target.checked)} /> show memorylessness
          </label>
        )}
      </div>
      <div className="viz-controls">
        {spec.params.map((s) => (
          <Slider
            key={s.key}
            label={s.label}
            value={p[s.key]}
            min={s.min}
            max={s.max}
            step={s.step}
            onChange={(v) => setParams((ps) => ({ ...ps, [kind]: { ...(ps[kind] ?? {}), [s.key]: v } }))}
          />
        ))}
        {memoryless && memo && <Slider label="s (already waited)" value={shift} min={1} max={10} step={1} onChange={setShift} />}
      </div>
      <DistPlot d={d} view={view} memoShift={memoryless && memo ? shift : undefined} />
      <KV
        items={[
          { k: 'E(X)', v: fmt(d.mean, 4) },
          { k: 'Var(X)', v: fmt(d.variance, 4) },
          { k: 'σ', v: fmt(Math.sqrt(d.variance), 4) },
          { k: 'Distribution', v: d.name },
        ]}
      />
    </VizFrame>
  );
}

function DistPlot({ d, view, memoShift }: { d: Dist; view: 'pdf' | 'cdf'; memoShift?: number }) {
  const sd = Math.sqrt(d.variance);
  if (d.kind === 'discrete') {
    const ks: number[] = [];
    for (let k = Math.floor(d.lo); k <= Math.ceil(d.hi); k++) ks.push(k);
    let acc = 0;
    const cdf = ks.map((k) => (acc += d.pmf(k)));
    const vals = view === 'pdf' ? ks.map((k) => d.pmf(k)) : cdf;
    const ymax = view === 'pdf' ? Math.max(...vals) * 1.15 || 1 : 1.05;
    const bw = Math.max(1, Math.min(28, 560 / ks.length - 2));
    const cond =
      memoShift !== undefined
        ? ks.map((k) => {
            const tail = d.tail(memoShift + 1);
            return tail > 0 ? d.pmf(k + memoShift) / tail : 0;
          })
        : null;
    return (
      <Chart x={[d.lo - 0.8, d.hi + 0.8]} y={[0, ymax]} xLabel="k" yLabel={view === 'pdf' ? 'P(X = k)' : 'P(X ≤ k)'} xTicks={ks.length <= 16 ? ks : 10}>
        {(sx, sy) => (
          <>
            <rect x={sx(d.mean - sd)} width={Math.max(0, sx(d.mean + sd) - sx(d.mean - sd))} y={sy(ymax)} height={sy(0) - sy(ymax)} fill="var(--accent-soft)" />
            {view === 'pdf'
              ? ks.map((k, i) => <rect key={k} x={sx(k) - bw / 2} width={bw} y={sy(vals[i])} height={sy(0) - sy(vals[i])} fill="var(--c1)" rx={2} />)
              : ks.map((k, i) => <line key={k} x1={sx(k)} x2={sx(k + 1)} y1={sy(vals[i])} y2={sy(vals[i])} stroke="var(--c1)" strokeWidth={2.5} />)}
            {cond && view === 'pdf' && ks.map((k, i) => <circle key={`c${k}`} cx={sx(k)} cy={sy(cond[i])} r={4} fill="var(--c2)" />)}
            <line x1={sx(d.mean)} x2={sx(d.mean)} y1={sy(0)} y2={sy(ymax)} stroke="var(--fg-muted)" strokeDasharray="5 4" />
          </>
        )}
      </Chart>
    );
  }
  const n = 300;
  const xs = Array.from({ length: n + 1 }, (_, i) => d.lo + ((d.hi - d.lo) * i) / n);
  const ys = xs.map((x) => (view === 'pdf' ? d.pdf(x) : d.cdf(x)));
  const ymax = view === 'pdf' ? Math.max(...ys) * 1.15 || 1 : 1.05;
  const cond = memoShift !== undefined ? xs.map((x) => (view === 'pdf' ? d.pdf(x + memoShift) / d.tail(memoShift) : (d.cdf(x + memoShift) - d.cdf(memoShift)) / d.tail(memoShift))) : null;
  return (
    <Chart x={[d.lo, d.hi]} y={[0, ymax]} xLabel="x" yLabel={view === 'pdf' ? 'f(x)' : 'F(x)'}>
      {(sx, sy) => (
        <>
          <rect x={sx(d.mean - sd)} width={Math.max(0, sx(d.mean + sd) - sx(d.mean - sd))} y={sy(ymax)} height={sy(0) - sy(ymax)} fill="var(--accent-soft)" />
          {view === 'pdf' && <path d={`${linePath(xs.map((x, i) => [x, ys[i]]), sx, sy)}L${sx(d.hi)},${sy(0)}L${sx(d.lo)},${sy(0)}Z`} fill="color-mix(in srgb, var(--c1) 18%, transparent)" />}
          <path d={linePath(xs.map((x, i) => [x, ys[i]]), sx, sy)} fill="none" stroke="var(--c1)" strokeWidth={2.5} />
          {cond && <path d={linePath(xs.map((x, i) => [x, cond[i]]), sx, sy)} fill="none" stroke="var(--c2)" strokeWidth={2} strokeDasharray="6 4" />}
          <line x1={sx(d.mean)} x2={sx(d.mean)} y1={sy(0)} y2={sy(ymax)} stroke="var(--fg-muted)" strokeDasharray="5 4" />
        </>
      )}
    </Chart>
  );
}

/* ------------------------------------------------------------------ Tail bounds */

export function TailBoundsCompare() {
  const [n, setN] = useState(100);
  const [p, setP] = useState(0.5);
  const d = binomial(n, p);
  const mu = n * p;
  const variance = n * p * (1 - p);
  const [a, setA] = useState(Math.round(0.75 * 100));
  const aa = Math.min(n, Math.max(Math.ceil(mu) + 1, a));
  const exact = d.tail(aa);
  const mk = markovBound(mu, aa);
  const ch = chebyshevBound(variance, aa - mu);
  const cf = chernoffUpper(mu, aa / mu - 1);
  const xs: number[] = [];
  for (let k = Math.ceil(mu) + 1; k <= n; k++) xs.push(k);
  const series = [
    { label: 'exact P(X ≥ a)', color: SERIES[0], f: (k: number) => d.tail(k) },
    { label: 'Markov  μ/a', color: SERIES[1], f: (k: number) => markovBound(mu, k) },
    { label: 'Chebyshev  σ²/(a−μ)²', color: SERIES[2], f: (k: number) => chebyshevBound(variance, k - mu) },
    { label: 'Chernoff  (e^δ / (1+δ)^(1+δ))^μ', color: SERIES[3], f: (k: number) => chernoffUpper(mu, k / mu - 1) },
  ];
  const ymin = Math.max(1e-12, Math.min(...xs.map((k) => d.tail(k)).filter((v) => v > 0)) * 0.5);
  return (
    <VizFrame title="Markov vs Chebyshev vs Chernoff" caption="X ~ Bin(n, p) as a sum of n independent coin flips. Log scale: Markov decays like 1/a, Chebyshev like 1/a², Chernoff exponentially. Note: Chebyshev bounds the two-sided event |X−μ| ≥ a−μ, so it is also an upper bound for the one-sided tail.">
      <div className="viz-controls">
        <Slider label="n" value={n} min={10} max={400} step={10} onChange={(v) => { setN(v); setA(Math.round(v * (aa / n))); }} />
        <Slider label="p" value={p} min={0.05} max={0.95} step={0.05} onChange={setP} />
        <Slider label="threshold a" value={aa} min={Math.ceil(mu) + 1} max={n} step={1} onChange={setA} />
      </div>
      <Chart x={[xs[0] ?? mu, n]} y={[ymin, 1.2]} yLog xLabel="a" yLabel="P(X ≥ a) (log)" yFormat={(v) => (v >= 0.01 ? String(v) : `1e${Math.round(Math.log10(v))}`)}>
        {(sx, sy) => (
          <>
            {series.map((s) => (
              <path key={s.label} d={linePath(xs.map((k) => { const v = s.f(k); return [k, v < ymin ? NaN : v]; }), sx, sy)} fill="none" stroke={s.color} strokeWidth={s === series[0] ? 3 : 2} />
            ))}
            <line x1={sx(aa)} x2={sx(aa)} y1={sy(ymin)} y2={sy(1.2)} stroke="var(--fg-faint)" strokeDasharray="4 4" />
          </>
        )}
      </Chart>
      <Legend items={series.map((s) => ({ label: s.label, color: s.color }))} />
      <KV
        items={[
          { k: 'μ = np', v: fmt(mu, 3), color: undefined },
          { k: `exact P(X ≥ ${aa})`, v: fmt(exact, 4), color: SERIES[0] },
          { k: 'Markov', v: fmt(mk, 4), color: SERIES[1] },
          { k: 'Chebyshev', v: fmt(ch, 4), color: SERIES[2] },
          { k: `Chernoff (δ = ${fmt(aa / mu - 1, 3)})`, v: fmt(cf, 4), color: SERIES[3] },
        ]}
      />
    </VizFrame>
  );
}

/* ------------------------------------------------------------------ LLN */

export function LLNSimulator() {
  const [p, setP] = useState(0.3);
  const [n, setN] = useState(1000);
  const [paths, setPaths] = useState(6);
  const [eps, setEps] = useState(0.05);
  const [seed, setSeed] = useState(1);
  const runs = useMemo(() => {
    const rng = makeRng(seed);
    return Array.from({ length: paths }, () => {
      let s = 0;
      const pts: [number, number][] = [];
      for (let i = 1; i <= n; i++) {
        s += rng.next() < p ? 1 : 0;
        if (i < 50 || i % Math.max(1, Math.floor(n / 400)) === 0) pts.push([i, s / i]);
      }
      return pts;
    });
  }, [p, n, paths, seed]);
  const outside = runs.filter((r) => Math.abs(r[r.length - 1][1] - p) >= eps).length;
  return (
    <VizFrame
      title="Law of large numbers: running averages"
      caption={`Each path is Ā_n = (X₁+…+X_n)/n for i.i.d. Bernoulli(p). Weak LLN: for every ε, P(|Ā_n − p| ≥ ε) → 0. Chebyshev: ≤ p(1−p)/(nε²) = ${fmt((p * (1 - p)) / (n * eps * eps), 4)}; Hoeffding: ≤ 2e^{−2nε²} = ${fmt(hoeffdingBound(n, eps), 4)} at n = ${n}.`}
    >
      <div className="viz-controls">
        <Slider label="p" value={p} min={0.05} max={0.95} step={0.05} onChange={setP} />
        <Slider label="n (flips)" value={n} min={100} max={10000} step={100} onChange={setN} />
        <Slider label="paths" value={paths} min={1} max={20} step={1} onChange={setPaths} />
        <Slider label="ε band" value={eps} min={0.01} max={0.2} step={0.01} onChange={setEps} />
      </div>
      <Chart x={[1, n]} y={[0, 1]} xLabel="n" yLabel="Ā_n">
        {(sx, sy) => (
          <>
            <rect x={sx(1)} width={sx(n) - sx(1)} y={sy(Math.min(1, p + eps))} height={sy(Math.max(0, p - eps)) - sy(Math.min(1, p + eps))} fill="var(--accent-soft)" />
            <line x1={sx(1)} x2={sx(n)} y1={sy(p)} y2={sy(p)} stroke="var(--fg-muted)" strokeDasharray="5 4" />
            {runs.map((r, i) => (
              <path key={i} d={linePath(r, sx, sy)} fill="none" stroke={SERIES[i % SERIES.length]} strokeWidth={1.4} opacity={0.85} />
            ))}
          </>
        )}
      </Chart>
      <div className="row between" style={{ marginTop: 8 }}>
        <span className="small muted">
          {outside} of {paths} paths end outside p ± ε
        </span>
        <button className="btn sm" onClick={() => setSeed((s) => s + 1)}>
          Resample
        </button>
      </div>
    </VizFrame>
  );
}

/* ------------------------------------------------------------------ CLT */

export function CLTSimulator() {
  const [n, setN] = useState(10);
  const [src, setSrc] = useState<'coin' | 'die' | 'exp'>('coin');
  const [seed, setSeed] = useState(7);
  const samples = 4000;
  const { hist, bins, lo, hi } = useMemo(() => {
    const rng = makeRng(seed);
    const draw = () => (src === 'coin' ? (rng.next() < 0.2 ? 1 : 0) : src === 'die' ? 1 + Math.floor(rng.next() * 6) : -Math.log(1 - rng.next()));
    const mu = src === 'coin' ? 0.2 : src === 'die' ? 3.5 : 1;
    const sd = src === 'coin' ? Math.sqrt(0.16) : src === 'die' ? Math.sqrt(35 / 12) : 1;
    const lo = -4,
      hi = 4,
      bins = 40;
    const hist = new Array<number>(bins).fill(0);
    for (let s = 0; s < samples; s++) {
      let sum = 0;
      for (let i = 0; i < n; i++) sum += draw();
      const z = (sum - n * mu) / (sd * Math.sqrt(n));
      const b = Math.floor(((z - lo) / (hi - lo)) * bins);
      if (b >= 0 && b < bins) hist[b]++;
    }
    const w = (hi - lo) / bins;
    return { hist: hist.map((c) => c / (samples * w)), bins, lo, hi };
  }, [n, src, seed]);
  const w = (hi - lo) / bins;
  const xs = Array.from({ length: 161 }, (_, i) => lo + (i * (hi - lo)) / 160);
  return (
    <VizFrame title="Central limit theorem" caption="Histogram of the standardised sum Z_n = (S_n − nμ)/(σ√n) over 4000 repetitions vs the N(0,1) density. As n grows the histogram approaches the bell curve, whatever the source distribution.">
      <div className="row" style={{ marginBottom: 8 }}>
        <Seg
          value={src}
          onChange={setSrc}
          options={[
            { v: 'coin', label: 'Bernoulli(0.2)' },
            { v: 'die', label: 'fair die' },
            { v: 'exp', label: 'Exp(1)' },
          ]}
        />
        <button className="btn sm" onClick={() => setSeed((s) => s + 1)}>
          Resample
        </button>
      </div>
      <div className="viz-controls">
        <Slider label="n (summands)" value={n} min={1} max={200} step={1} onChange={setN} />
      </div>
      <Chart x={[lo, hi]} y={[0, 0.65]} xLabel="z" yLabel="density">
        {(sx, sy) => (
          <>
            {hist.map((h, i) => (
              <rect key={i} x={sx(lo + i * w) + 0.5} width={sx(lo + w) - sx(lo) - 1} y={sy(h)} height={sy(0) - sy(h)} fill="color-mix(in srgb, var(--c1) 55%, transparent)" />
            ))}
            <path d={linePath(xs.map((x) => [x, normalPdf(x)]), sx, sy)} fill="none" stroke="var(--c2)" strokeWidth={2.5} />
          </>
        )}
      </Chart>
    </VizFrame>
  );
}

/* ------------------------------------------------------------------ Jensen */

const JFUNCS = {
  square: { label: 'x²', f: (x: number) => x * x, convex: true },
  exp: { label: 'eˣ', f: (x: number) => Math.exp(x), convex: true },
  log: { label: 'log₂ x (concave)', f: (x: number) => Math.log2(x), convex: false },
  sqrt: { label: '√x (concave)', f: (x: number) => Math.sqrt(x), convex: false },
} as const;

export function JensenViz() {
  const [fk, setFk] = useState<keyof typeof JFUNCS>('square');
  const [x1, setX1] = useState(0.5);
  const [x2, setX2] = useState(3);
  const [w, setW] = useState(0.5);
  const F = JFUNCS[fk];
  const lo = 0.2,
    hi = 4;
  const xs = Array.from({ length: 200 }, (_, i) => lo + ((hi - lo) * i) / 199);
  const ys = xs.map(F.f);
  const ex = w * x1 + (1 - w) * x2;
  const fe = F.f(ex);
  const ef = w * F.f(x1) + (1 - w) * F.f(x2);
  const ymin = Math.min(...ys),
    ymax = Math.max(...ys);
  return (
    <VizFrame title="Jensen's inequality" caption={F.convex ? 'Convex f: the chord lies above the curve, so E[f(X)] ≥ f(E[X]).' : 'Concave f: the chord lies below the curve, so E[f(X)] ≤ f(E[X]).'}>
      <div className="row" style={{ marginBottom: 8 }}>
        <Seg value={fk} onChange={setFk} options={Object.entries(JFUNCS).map(([k, v]) => ({ v: k as keyof typeof JFUNCS, label: v.label }))} />
      </div>
      <div className="viz-controls">
        <Slider label="x₁" value={x1} min={lo} max={hi} step={0.05} onChange={setX1} />
        <Slider label="x₂" value={x2} min={lo} max={hi} step={0.05} onChange={setX2} />
        <Slider label="P(X = x₁)" value={w} min={0} max={1} step={0.01} onChange={setW} />
      </div>
      <Chart x={[lo, hi]} y={[ymin - 0.1 * (ymax - ymin), ymax + 0.1 * (ymax - ymin)]} xLabel="x" yLabel="f(x)">
        {(sx, sy) => (
          <>
            <path d={linePath(xs.map((x, i) => [x, ys[i]]), sx, sy)} fill="none" stroke="var(--c1)" strokeWidth={2.5} />
            <line x1={sx(x1)} y1={sy(F.f(x1))} x2={sx(x2)} y2={sy(F.f(x2))} stroke="var(--c2)" strokeWidth={2} />
            <circle cx={sx(ex)} cy={sy(fe)} r={5} fill="var(--c1)" />
            <circle cx={sx(ex)} cy={sy(ef)} r={5} fill="var(--c2)" />
            <line x1={sx(ex)} x2={sx(ex)} y1={sy(fe)} y2={sy(ef)} stroke="var(--fg-muted)" strokeDasharray="4 3" />
          </>
        )}
      </Chart>
      <Legend
        items={[
          { label: 'f(E[X])', color: 'var(--c1)' },
          { label: 'E[f(X)] (on the chord)', color: 'var(--c2)' },
        ]}
      />
      <KV
        items={[
          { k: 'E[X]', v: fmt(ex, 3) },
          { k: 'f(E[X])', v: fmt(fe, 4), color: 'var(--c1)' },
          { k: 'E[f(X)]', v: fmt(ef, 4), color: 'var(--c2)' },
          { k: 'gap', v: fmt(ef - fe, 4) },
        ]}
      />
    </VizFrame>
  );
}
