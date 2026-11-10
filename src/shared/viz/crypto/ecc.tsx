/** Elliptic curves over the reals (geometry) and over F_p (the actual crypto groups). */
import { useState } from 'react';
import { Chart, KV, Seg, Slider, VizFrame, linePath } from '../kit';
import { add, addReal, hasse, isSingularModP, mulSteps, pointOrder, points, realY, type Curve, type Point, type RPoint } from '../../math/crypto/ec';
import { factor, primesBetween } from '../../math/crypto/numberTheory';

export function EllipticCurve({ tab: t0 = 'real' }: Record<string, unknown>) {
  const [tab, setTab] = useState<'real' | 'fp'>(t0 === 'fp' ? 'fp' : 'real');
  return (
    <VizFrame title="Elliptic curves y² = x³ + ax + b" caption="The points of the curve plus a point at infinity O form an abelian group: P + Q is the reflection of the third intersection of the line PQ with the curve. O is the neutral element and −(x, y) = (x, −y). Over F_p the same formulas give a finite group in which the discrete log is hard.">
      <Seg value={tab} onChange={setTab} options={[{ v: 'real', label: 'Over ℝ: geometry' }, { v: 'fp', label: 'Over F_p: finite group' }]} />
      <div style={{ marginTop: 10 }}>{tab === 'real' ? <RealCurve /> : <FpCurve />}</div>
    </VizFrame>
  );
}

function RealCurve() {
  const [a, setA] = useState(-2);
  const [b, setB] = useState(2);
  const [px, setPx] = useState(-1.4);
  const [qx, setQx] = useState(0.4);
  const [pSign, setPSign] = useState(1);
  const [qSign, setQSign] = useState(-1);
  const [double, setDouble] = useState(false);
  const disc = -16 * (4 * a ** 3 + 27 * b ** 2);
  const singular = Math.abs(4 * a ** 3 + 27 * b ** 2) < 1e-9;
  const xs = Array.from({ length: 1201 }, (_, i) => -3.5 + (i / 1200) * 7);
  const upper: [number, number][] = xs.map((x) => [x, realY(a, b, x) ?? NaN]);
  const lower: [number, number][] = xs.map((x) => [x, realY(a, b, x) === null ? NaN : -realY(a, b, x)!]);
  const pt = (x: number, s: number): RPoint => {
    const y = realY(a, b, x);
    return y === null ? null : { x, y: s * y };
  };
  const P = pt(px, pSign);
  const Q = double ? P : pt(qx, qSign);
  const res = P && Q ? addReal(a, P, Q) : null;
  const R = res?.R ?? null;
  const third = res?.third ?? null;
  const line: [number, number][] | null =
    P && res && res.slope !== null
      ? [
          [-4, P.y + res.slope * (-4 - P.x)],
          [4, P.y + res.slope * (4 - P.x)],
        ]
      : null;
  return (
    <>
      <div className="viz-controls">
        <Slider label="a" value={a} min={-4} max={3} step={0.1} onChange={setA} format={(v) => v.toFixed(1)} />
        <Slider label="b" value={b} min={-3} max={4} step={0.1} onChange={setB} format={(v) => v.toFixed(1)} />
        <Slider label="P: x" value={px} min={-3} max={3} step={0.01} onChange={setPx} format={(v) => v.toFixed(2)} />
        <Seg value={pSign} onChange={setPSign} options={[{ v: 1, label: 'P upper' }, { v: -1, label: 'P lower' }]} />
        <label className="row small" style={{ gap: 6 }}>
          <input type="checkbox" checked={double} onChange={(e) => setDouble(e.target.checked)} /> doubling (Q = P, tangent line)
        </label>
        {!double && (
          <>
            <Slider label="Q: x" value={qx} min={-3} max={3} step={0.01} onChange={setQx} format={(v) => v.toFixed(2)} />
            <Seg value={qSign} onChange={setQSign} options={[{ v: 1, label: 'Q upper' }, { v: -1, label: 'Q lower' }]} />
          </>
        )}
      </div>
      <Chart x={[-3.5, 3.5]} y={[-6, 6]} height={320} xFormat={(v) => String(v)} yFormat={(v) => String(v)}>
        {(sx, sy) => (
          <>
            <path d={linePath(upper, sx, sy)} stroke="var(--c1)" strokeWidth={2.5} fill="none" />
            <path d={linePath(lower, sx, sy)} stroke="var(--c1)" strokeWidth={2.5} fill="none" />
            {line && <path d={linePath(line, sx, sy)} stroke="var(--fg-faint)" strokeDasharray="5 4" fill="none" />}
            {P && Q && !line && Math.abs(P.x - Q.x) < 1e-9 && <line x1={sx(P.x)} x2={sx(P.x)} y1={sy(-6)} y2={sy(6)} stroke="var(--fg-faint)" strokeDasharray="5 4" />}
            {third && R && <line x1={sx(third.x)} x2={sx(R.x)} y1={sy(third.y)} y2={sy(R.y)} stroke="var(--c2)" strokeDasharray="2 3" />}
            {P && <circle cx={sx(P.x)} cy={sy(P.y)} r={5} fill="var(--c3)" />}
            {P && (
              <text x={sx(P.x) + 7} y={sy(P.y) - 6} fontSize={12} fontWeight={700}>
                P
              </text>
            )}
            {Q && !double && <circle cx={sx(Q.x)} cy={sy(Q.y)} r={5} fill="var(--c3)" />}
            {Q && !double && (
              <text x={sx(Q.x) + 7} y={sy(Q.y) - 6} fontSize={12} fontWeight={700}>
                Q
              </text>
            )}
            {third && <circle cx={sx(third.x)} cy={sy(third.y)} r={4} fill="var(--fg-faint)" />}
            {R && <circle cx={sx(R.x)} cy={sy(R.y)} r={6} fill="var(--c2)" />}
            {R && (
              <text x={sx(R.x) + 8} y={sy(R.y) + 4} fontSize={12} fontWeight={700}>
                {double ? '2P' : 'P+Q'}
              </text>
            )}
          </>
        )}
      </Chart>
      <KV
        items={[
          { k: '4a³ + 27b²', v: (4 * a ** 3 + 27 * b ** 2).toFixed(2) },
          { k: 'discriminant', v: `${disc.toFixed(1)} → ${singular ? 'singular' : disc > 0 ? '2 components' : '1 component'}` },
          { k: 'slope λ', v: res?.slope === null || res?.slope === undefined ? '∞ (vertical)' : res.slope.toFixed(3) },
          { k: double ? '2P' : 'P + Q', v: R ? `(${R.x.toFixed(3)}, ${R.y.toFixed(3)})` : P && Q ? 'O (point at infinity)' : 'choose x with a point on the curve' },
        ]}
      />
      {singular && <div className="callout bad small">4a³ + 27b² = 0: the cubic has a repeated root, the curve has a cusp or a node and tangents are not defined there. Singular curves are not elliptic curves; their “group” collapses to (F_p, +) or (F_p^×, ·), where the DLP is easy or classical.</div>}
      <p className="small muted">Formulas: λ = (y₂ − y₁)/(x₂ − x₁) for P ≠ Q, λ = (3x₁² + a)/(2y₁) for doubling; x₃ = λ² − x₁ − x₂, y₃ = λ(x₁ − x₃) − y₁. A vertical line means P + Q = O.</p>
    </>
  );
}

const FP_PRIMES = primesBetween(11, 103);

function FpCurve() {
  const [p, setP] = useState(17);
  const [a, setA] = useState(2);
  const [b, setB] = useState(2);
  const [sel, setSel] = useState(0);
  const [k, setK] = useState(5);
  const c: Curve = { a, b, p };
  const singular = isSingularModP(c);
  const pts = points(c);
  const n = pts.length + 1;
  const P: Point = pts[Math.min(sel, pts.length - 1)] ?? null;
  const ord = P ? pointOrder(c, P) : 1;
  const multiples: Point[] = [];
  let Q: Point = null;
  for (let i = 1; i <= ord && i <= 200; i++) {
    Q = add(c, Q, P);
    multiples.push(Q);
  }
  const kk = Math.min(k, 2 * n);
  const trace = P ? mulSteps(c, kk, P) : { R: null, steps: [] };
  const hb = hasse(p);
  const size = 300;
  const cell = size / p;
  const mIndex = (pt: { x: number; y: number }) => multiples.findIndex((M) => M && M.x === pt.x && M.y === pt.y);
  return (
    <>
      <div className="viz-controls">
        <label className="field">
          p
          <select value={p} onChange={(e) => { setP(+e.target.value); setSel(0); }}>
            {FP_PRIMES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <Slider label="a" value={a} min={0} max={p - 1} step={1} onChange={(v) => { setA(v); setSel(0); }} />
        <Slider label="b" value={b} min={0} max={p - 1} step={1} onChange={(v) => { setB(v); setSel(0); }} />
        <Slider label="k for k·P" value={k} min={0} max={Math.max(2, 2 * n)} step={1} onChange={setK} />
      </div>
      {singular && <div className="callout bad small">4a³ + 27b² ≡ 0 (mod p): singular curve, not allowed.</div>}
      <div className="row" style={{ gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <svg viewBox={`-20 -10 ${size + 30} ${size + 30}`} width={size + 30}>
          <rect x={0} y={0} width={size} height={size} fill="var(--bg-sunk)" rx={4} />
          {pts.map((pt, i) => {
            const mi = mIndex(pt);
            const isK = trace.R && trace.R.x === pt.x && trace.R.y === pt.y;
            return (
              <g key={i} onClick={() => setSel(i)} style={{ cursor: 'pointer' }}>
                <circle cx={(pt.x + 0.5) * cell} cy={size - (pt.y + 0.5) * cell} r={Math.max(2.5, Math.min(6, cell / 2.4))} fill={i === sel ? 'var(--c2)' : isK ? 'var(--c4)' : mi >= 0 ? 'var(--c3)' : 'var(--c1)'} opacity={mi >= 0 || i === sel ? 1 : 0.55} />
                {p <= 31 && mi >= 0 && mi < ord - 1 && (
                  <text x={(pt.x + 0.5) * cell + 5} y={size - (pt.y + 0.5) * cell - 4} fontSize={8}>
                    {mi + 1}P
                  </text>
                )}
              </g>
            );
          })}
          <text x={size / 2} y={size + 16} fontSize={10} textAnchor="middle">
            x ∈ F_{p}
          </text>
        </svg>
        <div style={{ flex: 1, minWidth: 220 }}>
          <KV
            items={[
              { k: '#E(F_p) incl. O', v: n },
              { k: 'Hasse interval', v: `[${hb.lo.toFixed(1)}, ${hb.hi.toFixed(1)}]` },
              { k: 'factorisation', v: factor(n).map(([q, e]) => (e > 1 ? `${q}^${e}` : q)).join('·') },
              { k: 'P', v: P ? `(${P.x}, ${P.y})` : '—' },
              { k: 'order of P', v: ord },
              { k: `${kk}·P`, v: trace.R ? `(${trace.R.x}, ${trace.R.y})` : 'O' },
            ]}
          />
          {n === p && <div className="callout bad small">|E| = p: anomalous curve — Smart’s attack solves the ECDLP in polynomial time.</div>}
          {n === p + 1 && <div className="callout warn small">|E| = p + 1: supersingular — the MOV attack moves the DLP into a small extension field.</div>}
          <div className="small">
            Double-and-add for k = {kk} = {kk.toString(2)}₂:{' '}
            {trace.steps.map((s, i) => (
              <span key={i} className="chip" style={{ margin: 2 }}>
                {s.bit ? 'D+A' : 'D'} → {s.acc ? `(${s.acc.x},${s.acc.y})` : 'O'}
              </span>
            ))}
          </div>
          <p className="small muted">
            Click a point to make it P; green points are the multiples of P (the subgroup ⟨P⟩), whose size divides #E. For cryptography choose a curve whose group (or a subgroup ⟨G⟩) has a large prime order — composite orders invite
            Pohlig–Hellman and small-subgroup attacks.
          </p>
        </div>
      </div>
    </>
  );
}
