/** Discrete memoryless channels: transition diagram, I(X;Y) vs input distribution, capacity, repetition codes. */
import { useMemo, useState } from 'react';
import { becMatrix, blahutArimoto, bscMatrix, isSymmetric, isWeaklySymmetric, mutualInfoChannel, repetitionErrorRate } from '../../../shared/math/channel';
import { binaryEntropy, entropy } from '../../../shared/math/info';
import { fmt } from '../../../shared/math/linalg';
import { Chart, KV, Legend, MatrixInput, Seg, Slider, VizFrame, linePath } from '../../../shared/viz/kit';
import { Tex } from '../../../platform/components/Markdown';

type Kind = 'bsc' | 'bec' | 'typewriter' | 'sym3' | 'custom';

function typewriter(k: number): number[][] {
  return Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => (j === i || j === (i + 1) % k ? 0.5 : 0)));
}

export default function ChannelViz(props: Record<string, unknown>) {
  const [kind, setKind] = useState<Kind>((props.kind as Kind) ?? 'bsc');
  const [p, setP] = useState(0.1);
  const [k, setK] = useState(6);
  const [q, setQ] = useState(0.5);
  const [custom, setCustom] = useState([
    [0.7, 0.2, 0.1],
    [0.1, 0.2, 0.7],
  ]);
  const W = useMemo(() => {
    switch (kind) {
      case 'bsc':
        return bscMatrix(p);
      case 'bec':
        return becMatrix(p);
      case 'typewriter':
        return typewriter(k);
      case 'sym3':
        return [
          [0.3, 0.2, 0.5],
          [0.5, 0.3, 0.2],
          [0.2, 0.5, 0.3],
        ];
      case 'custom':
        return custom.map((r) => {
          const s = r.reduce((a, b) => a + b, 0);
          return s > 0 ? r.map((x) => x / s) : r.map(() => 1 / r.length);
        });
    }
  }, [kind, p, k, custom]);
  const ba = useMemo(() => blahutArimoto(W), [W]);
  const inLabels = W.map((_, i) => (kind === 'typewriter' ? String.fromCharCode(65 + i) : String(i)));
  const outLabels = W[0].map((_, j) => (kind === 'bec' ? ['0', 'e', '1'][j] : kind === 'typewriter' ? String.fromCharCode(97 + j) : String.fromCharCode(97 + j)));
  const binaryInput = W.length === 2;
  const px = binaryInput ? [q, 1 - q] : ba.px;
  const I = mutualInfoChannel(px, W);
  const closed =
    kind === 'bsc'
      ? { tex: 'C = 1 - H(p)', v: 1 - binaryEntropy(p) }
      : kind === 'bec'
        ? { tex: 'C = 1 - \\alpha', v: 1 - p }
        : kind === 'typewriter'
          ? { tex: `C = \\log_2 ${k} - 1 = \\log_2 ${k / 2}`, v: Math.log2(k) - 1 }
          : isSymmetric(W) || isWeaklySymmetric(W)
            ? { tex: 'C = \\log_2 |\\mathcal Y| - H(\\text{row})', v: Math.log2(W[0].length) - entropy(W[0]) }
            : null;

  // Repetition code trade-off on BSC
  const reps = [1, 3, 5, 7, 9, 11, 15, 21, 31];
  return (
    <VizFrame title="Channel capacity" caption="Capacity C = max over input distributions of I(X;Y). The channel coding theorem says rates R < C are achievable with vanishing error; R > C are not.">
      <div className="row" style={{ marginBottom: 8 }}>
        <Seg
          value={kind}
          onChange={setKind}
          options={[
            { v: 'bsc', label: 'BSC' },
            { v: 'bec', label: 'Erasure' },
            { v: 'typewriter', label: 'Noisy typewriter' },
            { v: 'sym3', label: 'Symmetric 3×3' },
            { v: 'custom', label: 'Custom' },
          ]}
        />
      </div>
      <div className="viz-controls">
        {(kind === 'bsc' || kind === 'bec') && <Slider label={kind === 'bsc' ? 'crossover p' : 'erasure α'} value={p} min={0} max={1} step={0.01} onChange={setP} />}
        {kind === 'typewriter' && <Slider label="alphabet size k" value={k} min={2} max={12} step={2} onChange={setK} />}
        {binaryInput && <Slider label="input P(X = 0) = q" value={q} min={0} max={1} step={0.01} onChange={setQ} />}
      </div>
      {kind === 'custom' && (
        <div style={{ marginBottom: 8 }}>
          <MatrixInput value={custom} onChange={setCustom} rowLabels={custom.map((_, i) => `x=${i}`)} colLabels={custom[0].map((_, j) => `y=${String.fromCharCode(97 + j)}`)} />
          <div className="row" style={{ gap: 6, marginTop: 6 }}>
            <button className="btn sm" onClick={() => custom.length < 5 && setCustom([...custom, custom[0].map(() => 1 / custom[0].length)])}>
              + input
            </button>
            <button className="btn sm" onClick={() => custom.length > 2 && setCustom(custom.slice(0, -1))}>
              − input
            </button>
            <button className="btn sm" onClick={() => custom[0].length < 5 && setCustom(custom.map((r) => [...r, 0]))}>
              + output
            </button>
            <button className="btn sm" onClick={() => custom[0].length > 2 && setCustom(custom.map((r) => r.slice(0, -1)))}>
              − output
            </button>
            <span className="small faint">rows are normalised automatically</span>
          </div>
        </div>
      )}
      <div className="grid cols-2" style={{ alignItems: 'center' }}>
        <ChannelDiagram W={W} inLabels={inLabels} outLabels={outLabels} px={px} />
        {binaryInput ? (
          <div>
            <Chart x={[0, 1]} y={[0, Math.max(0.05, ba.capacity) * 1.25 + 0.02]} height={220} xLabel="q = P(X = 0)" yLabel="I(X;Y) [bits]">
              {(sx, sy) => {
                const xs = Array.from({ length: 101 }, (_, i) => i / 100);
                return (
                  <>
                    <path d={linePath(xs.map((x) => [x, mutualInfoChannel([x, 1 - x], W)]), sx, sy)} fill="none" stroke="var(--c1)" strokeWidth={2.5} />
                    <line x1={sx(0)} x2={sx(1)} y1={sy(ba.capacity)} y2={sy(ba.capacity)} stroke="var(--c2)" strokeDasharray="5 4" />
                    <circle cx={sx(q)} cy={sy(I)} r={5} fill="var(--c1)" />
                  </>
                );
              }}
            </Chart>
            <Legend
              items={[
                { label: 'I(X;Y) as a function of the input distribution', color: 'var(--c1)' },
                { label: 'capacity (maximum)', color: 'var(--c2)', dash: true },
              ]}
            />
          </div>
        ) : (
          <div className="small muted">
            Capacity-achieving input (Blahut–Arimoto): ({ba.px.map((x) => fmt(x, 3)).join(', ')})
          </div>
        )}
      </div>
      <KV
        items={[
          { k: 'I(X;Y) at this input', v: `${fmt(I, 4)} bits` },
          { k: 'Capacity (numerical)', v: `${fmt(ba.capacity, 4)} bits` },
          ...(closed ? [{ k: 'Closed form', v: <span><Tex>{closed.tex}</Tex> = {fmt(closed.v, 4)}</span> }] : []),
          { k: 'Symmetric?', v: isSymmetric(W) ? 'symmetric' : isWeaklySymmetric(W) ? 'weakly symmetric' : 'no' },
        ]}
      />
      {kind === 'bsc' && p > 0 && p < 0.5 && (
        <details className="collapse" open>
          <summary>Repetition codes on this BSC: rate vs error</summary>
          <div className="collapse-body">
            <Chart x={[0, 1.05]} y={[1e-9, 1]} yLog height={220} xLabel="rate R = 1/n" yLabel="bit error (log)" yFormat={(v) => (v >= 0.01 ? String(v) : `1e${Math.round(Math.log10(v))}`)}>
              {(sx, sy) => (
                <>
                  <rect x={sx(1 - binaryEntropy(p))} width={sx(1.05) - sx(1 - binaryEntropy(p))} y={sy(1)} height={sy(1e-9) - sy(1)} fill="var(--bad-soft)" />
                  <line x1={sx(1 - binaryEntropy(p))} x2={sx(1 - binaryEntropy(p))} y1={sy(1e-9)} y2={sy(1)} stroke="var(--c2)" strokeDasharray="5 4" />
                  {reps.map((n) => (
                    <g key={n}>
                      <circle cx={sx(1 / n)} cy={sy(Math.max(1e-9, repetitionErrorRate(n, p)))} r={4} fill="var(--c1)" />
                      <text x={sx(1 / n) + 6} y={sy(Math.max(1e-9, repetitionErrorRate(n, p))) - 4} fontSize={10}>
                        n={n}
                      </text>
                    </g>
                  ))}
                </>
              )}
            </Chart>
            <div className="small muted">
              Repetition codes (majority decoding) reduce the error only by sending the rate to 0. Shannon's theorem promises codes with any rate below
              C = {fmt(1 - binaryEntropy(p), 3)} (dashed line) and arbitrarily small error, for large block length n. Rates in the red region are impossible to use reliably.
            </div>
          </div>
        </details>
      )}
    </VizFrame>
  );
}

function ChannelDiagram({ W, inLabels, outLabels, px }: { W: number[][]; inLabels: string[]; outLabels: string[]; px: number[] }) {
  const nIn = W.length,
    nOut = W[0].length;
  const H = Math.max(nIn, nOut) * 44 + 30;
  const Wd = 300;
  const yi = (i: number, n: number) => 25 + ((H - 50) * (n === 1 ? 0.5 : i / (n - 1)));
  return (
    <svg viewBox={`0 0 ${Wd} ${H}`} width="100%" style={{ maxWidth: Wd }}>
      {W.map((row, i) =>
        row.map((pr, j) =>
          pr > 1e-9 ? (
            <g key={`${i}${j}`}>
              <line x1={60} y1={yi(i, nIn)} x2={240} y2={yi(j, nOut)} stroke="var(--c1)" strokeOpacity={0.25 + 0.75 * pr} strokeWidth={1 + 4 * pr} />
              {nIn * nOut <= 12 && (
                <text x={60 + (240 - 60) * 0.28} y={yi(i, nIn) + (yi(j, nOut) - yi(i, nIn)) * 0.28 - 4} fontSize={10} textAnchor="middle">
                  {fmt(pr, 2)}
                </text>
              )}
            </g>
          ) : null,
        ),
      )}
      {inLabels.map((l, i) => (
        <g key={`i${i}`} transform={`translate(60,${yi(i, nIn)})`}>
          <circle r={13} fill="var(--bg-elev)" stroke="var(--accent)" strokeWidth={2} />
          <text y={4} textAnchor="middle" fontSize={12} fontWeight={700} style={{ fill: 'var(--fg)' }}>
            {l}
          </text>
          <text x={-20} y={4} textAnchor="end" fontSize={10}>
            {fmt(px[i] ?? 0, 2)}
          </text>
        </g>
      ))}
      {outLabels.map((l, j) => (
        <g key={`o${j}`} transform={`translate(240,${yi(j, nOut)})`}>
          <circle r={13} fill="var(--bg-elev)" stroke="var(--c2)" strokeWidth={2} />
          <text y={4} textAnchor="middle" fontSize={12} fontWeight={700} style={{ fill: 'var(--fg)' }}>
            {l}
          </text>
        </g>
      ))}
      <text x={60} y={12} textAnchor="middle" fontSize={11} fontWeight={600}>
        X
      </text>
      <text x={240} y={12} textAnchor="middle" fontSize={11} fontWeight={600}>
        Y
      </text>
    </svg>
  );
}
