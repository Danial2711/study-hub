/** Tiny SVG charting kit shared by all visualizations. */
import { scaleLinear, scaleLog, type ScaleContinuousNumeric } from 'd3-scale';
import { useId, type ReactNode } from 'react';
import { fmt } from '../math/linalg';

export type Scale = ScaleContinuousNumeric<number, number>;

export interface ChartProps {
  width?: number;
  height?: number;
  x: [number, number];
  y: [number, number];
  yLog?: boolean;
  xLabel?: string;
  yLabel?: string;
  xTicks?: number | number[];
  yTicks?: number | number[];
  xFormat?: (v: number) => string;
  yFormat?: (v: number) => string;
  margin?: { t: number; r: number; b: number; l: number };
  children: (sx: Scale, sy: Scale) => ReactNode;
  grid?: boolean;
}

export function Chart({
  width = 640,
  height = 280,
  x,
  y,
  yLog,
  xLabel,
  yLabel,
  xTicks = 8,
  yTicks = 5,
  xFormat = (v) => fmt(v, 3),
  yFormat = (v) => fmt(v, 3),
  margin = { t: 12, r: 16, b: 38, l: 52 },
  children,
  grid = true,
}: ChartProps) {
  const clip = useId().replace(/:/g, '');
  const sx = scaleLinear().domain(x).range([margin.l, width - margin.r]);
  const sy = (yLog ? scaleLog().clamp(true) : scaleLinear()).domain(y).range([height - margin.b, margin.t]);
  const xt = Array.isArray(xTicks) ? xTicks : sx.ticks(xTicks);
  const yt = Array.isArray(yTicks) ? yTicks : yLog ? logTicks(y) : sy.ticks(yTicks);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" style={{ maxWidth: width }}>
      <defs>
        <clipPath id={clip}>
          <rect x={margin.l} y={margin.t - 2} width={width - margin.l - margin.r} height={height - margin.t - margin.b + 4} />
        </clipPath>
      </defs>
      {grid &&
        yt.map((t) => (
          <line key={`gy${t}`} x1={margin.l} x2={width - margin.r} y1={sy(t)} y2={sy(t)} stroke="var(--border)" strokeWidth={1} />
        ))}
      <line x1={margin.l} x2={width - margin.r} y1={height - margin.b} y2={height - margin.b} stroke="var(--border-strong)" />
      <line x1={margin.l} x2={margin.l} y1={margin.t} y2={height - margin.b} stroke="var(--border-strong)" />
      {xt.map((t) => (
        <g key={`x${t}`} transform={`translate(${sx(t)},${height - margin.b})`}>
          <line y2={4} stroke="var(--border-strong)" />
          <text y={16} textAnchor="middle" fontSize={11}>
            {xFormat(t)}
          </text>
        </g>
      ))}
      {yt.map((t) => (
        <text key={`y${t}`} x={margin.l - 6} y={sy(t) + 4} textAnchor="end" fontSize={11}>
          {yFormat(t)}
        </text>
      ))}
      {xLabel && (
        <text x={(margin.l + width - margin.r) / 2} y={height - 4} textAnchor="middle" fontSize={12} fontWeight={600}>
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text transform={`translate(12,${(margin.t + height - margin.b) / 2}) rotate(-90)`} textAnchor="middle" fontSize={12} fontWeight={600}>
          {yLabel}
        </text>
      )}
      <g clipPath={`url(#${clip})`}>{children(sx, sy)}</g>
    </svg>
  );
}

function logTicks([a, b]: [number, number]): number[] {
  const out: number[] = [];
  for (let e = Math.floor(Math.log10(a)); e <= Math.ceil(Math.log10(b)); e++) {
    const v = 10 ** e;
    if (v >= a * 0.999 && v <= b * 1.001) out.push(v);
  }
  return out;
}

export function linePath(pts: [number, number][], sx: Scale, sy: Scale): string {
  let d = '';
  let pen = false;
  for (const [x, y] of pts) {
    if (!Number.isFinite(y)) {
      pen = false;
      continue;
    }
    d += `${pen ? 'L' : 'M'}${sx(x).toFixed(2)},${sy(y).toFixed(2)}`;
    pen = true;
  }
  return d;
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="slider">
      <span className="slider-head">
        <span>{label}</span>
        <b>{format ? format(value) : value}</b>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} />
    </label>
  );
}

export function Seg<T extends string | number>({ value, options, onChange }: { value: T; options: { v: T; label: ReactNode }[]; onChange: (v: T) => void }) {
  return (
    <div className="btn-group" role="group">
      {options.map((o) => (
        <button key={String(o.v)} className={o.v === value ? 'on' : ''} onClick={() => onChange(o.v)} type="button">
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function KV({ items }: { items: { k: ReactNode; v: ReactNode; color?: string }[] }) {
  return (
    <div className="kv">
      {items.map((it, i) => (
        <div key={i} style={it.color ? { borderLeft: `3px solid ${it.color}` } : undefined}>
          <div className="k">{it.k}</div>
          <div className="v">{it.v}</div>
        </div>
      ))}
    </div>
  );
}

export function Legend({ items }: { items: { label: ReactNode; color: string; box?: boolean; dash?: boolean }[] }) {
  return (
    <div className="legend">
      {items.map((it, i) => (
        <span key={i}>
          <i
            className={it.box ? 'box' : ''}
            style={{ background: it.dash ? `repeating-linear-gradient(90deg, ${it.color} 0 4px, transparent 4px 7px)` : it.color }}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}

export function VizFrame({ title, children, caption }: { title: string; children: ReactNode; caption?: ReactNode }) {
  return (
    <div className="viz">
      <div className="viz-title">{title}</div>
      {children}
      {caption && <div className="viz-caption">{caption}</div>}
    </div>
  );
}

export const SERIES = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)'];

/** Editable numeric matrix. */
export function MatrixInput({
  value,
  onChange,
  rowLabels,
  colLabels,
  badRows = [],
  step = 0.05,
}: {
  value: number[][];
  onChange: (m: number[][]) => void;
  rowLabels: string[];
  colLabels: string[];
  badRows?: number[];
  step?: number;
}) {
  return (
    <div className="scroll-x">
      <table className="matrix-input">
        <thead>
          <tr>
            <th />
            {colLabels.map((c, j) => (
              <th key={j}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {value.map((row, i) => (
            <tr key={i} className={badRows.includes(i) ? 'bad' : ''}>
              <th>{rowLabels[i]}</th>
              {row.map((x, j) => (
                <td key={j}>
                  <input
                    type="number"
                    step={step}
                    min={0}
                    value={Number.isFinite(x) ? +x.toFixed(4) : ''}
                    onChange={(e) => {
                      const m = value.map((r) => r.slice());
                      m[i][j] = e.target.value === '' ? 0 : +e.target.value;
                      onChange(m);
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function NumberList({ value, onChange, label, step = 0.05 }: { value: number[]; onChange: (v: number[]) => void; label?: (i: number) => string; step?: number }) {
  return (
    <div className="row" style={{ gap: 6 }}>
      {value.map((x, i) => (
        <label key={i} className="field" style={{ width: 78 }}>
          {label ? label(i) : `#${i + 1}`}
          <input
            type="number"
            step={step}
            value={+x.toFixed(4)}
            onChange={(e) => {
              const v = value.slice();
              v[i] = +e.target.value;
              onChange(v);
            }}
          />
        </label>
      ))}
    </div>
  );
}
