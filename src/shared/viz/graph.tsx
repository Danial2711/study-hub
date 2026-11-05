/** Draggable directed graph drawing used by the Markov-chain, CTMC and MDP visualisations. */
import { useId, useRef, type ReactNode } from 'react';

export interface GNode {
  id: number;
  label: string;
  x: number;
  y: number;
  fill?: string;
  stroke?: string;
  /** 0..1 — inner fill level (e.g. current probability). */
  level?: number;
  sub?: string;
  shape?: 'circle' | 'diamond' | 'dot';
  dashed?: boolean;
}

export interface GEdge {
  from: number;
  to: number;
  label?: string;
  color?: string;
  width?: number;
  dashed?: boolean;
  /** Curvature override (default: curve only when the reverse edge exists). */
  bend?: number;
}

export function circleLayout(n: number, w: number, h: number, r?: number): { x: number; y: number }[] {
  const R = r ?? Math.min(w, h) / 2 - 68;
  if (n === 1) return [{ x: w / 2, y: h / 2 }];
  return Array.from({ length: n }, (_, i) => ({
    x: w / 2 + R * Math.cos((2 * Math.PI * i) / n - Math.PI / 2),
    y: h / 2 + R * Math.sin((2 * Math.PI * i) / n - Math.PI / 2),
  }));
}

export function lineLayout(n: number, w: number, h: number): { x: number; y: number }[] {
  return Array.from({ length: n }, (_, i) => ({ x: 50 + ((w - 100) * i) / Math.max(1, n - 1), y: h / 2 }));
}

export function GraphView({
  nodes,
  edges,
  width = 640,
  height = 340,
  radius = 24,
  onMove,
  onNodeClick,
  children,
}: {
  nodes: GNode[];
  edges: GEdge[];
  width?: number;
  height?: number;
  radius?: number;
  onMove?: (id: number, x: number, y: number) => void;
  onNodeClick?: (id: number) => void;
  children?: ReactNode;
}) {
  const uid = useId().replace(/:/g, '');
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: number; moved: boolean } | null>(null);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const has = new Set(edges.map((e) => `${e.from}>${e.to}`));
  const toLocal = (e: React.PointerEvent) => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: Math.max(radius, Math.min(width - radius, p.x)), y: Math.max(radius, Math.min(height - radius, p.y)) };
  };
  const nr = (n: GNode) => (n.shape === 'dot' ? 9 : radius);
  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: width, touchAction: onMove ? 'none' : undefined, userSelect: 'none' }}
      onPointerMove={(e) => {
        if (!drag.current || !onMove) return;
        drag.current.moved = true;
        const p = toLocal(e);
        onMove(drag.current.id, p.x, p.y);
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerLeave={() => (drag.current = null)}
    >
      <defs>
        <marker id={`${uid}arr`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="context-stroke" />
        </marker>
      </defs>
      {edges.map((e, i) => {
        const a = byId.get(e.from);
        const b = byId.get(e.to);
        if (!a || !b) return null;
        const color = e.color ?? 'var(--fg-faint)';
        const w = e.width ?? 1.6;
        if (a.id === b.id) {
          // self-loop: arc above the node, pointing away from the centre of the drawing
          const cx = width / 2,
            cy = height / 2;
          let ang = Math.atan2(a.y - cy, a.x - cx);
          if (Math.hypot(a.x - cx, a.y - cy) < 5) ang = -Math.PI / 2;
          const r = nr(a);
          const p1 = { x: a.x + r * Math.cos(ang - 0.5), y: a.y + r * Math.sin(ang - 0.5) };
          const p2 = { x: a.x + r * Math.cos(ang + 0.5), y: a.y + r * Math.sin(ang + 0.5) };
          const c1 = { x: a.x + (r + 46) * Math.cos(ang - 0.6), y: a.y + (r + 46) * Math.sin(ang - 0.6) };
          const c2 = { x: a.x + (r + 46) * Math.cos(ang + 0.6), y: a.y + (r + 46) * Math.sin(ang + 0.6) };
          const lx = a.x + (r + 40) * Math.cos(ang),
            ly = a.y + (r + 40) * Math.sin(ang);
          return (
            <g key={i}>
              <path d={`M${p1.x},${p1.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}`} fill="none" stroke={color} strokeWidth={w} markerEnd={`url(#${uid}arr)`} strokeDasharray={e.dashed ? '5 4' : undefined} />
              {e.label && <EdgeLabel x={lx} y={ly} text={e.label} color={e.color} />}
            </g>
          );
        }
        const dx = b.x - a.x,
          dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len,
          uy = dy / len;
        const bend = e.bend ?? (has.has(`${e.to}>${e.from}`) ? 0.18 : 0);
        const mx = (a.x + b.x) / 2 - uy * bend * len;
        const my = (a.y + b.y) / 2 + ux * bend * len;
        // start/end on circle borders, aimed at the control point
        const sa = Math.atan2(my - a.y, mx - a.x);
        const ea = Math.atan2(my - b.y, mx - b.x);
        const s = { x: a.x + nr(a) * Math.cos(sa), y: a.y + nr(a) * Math.sin(sa) };
        const t = { x: b.x + (nr(b) + 2) * Math.cos(ea), y: b.y + (nr(b) + 2) * Math.sin(ea) };
        const lx = 0.25 * s.x + 0.5 * mx + 0.25 * t.x;
        const ly = 0.25 * s.y + 0.5 * my + 0.25 * t.y;
        return (
          <g key={i}>
            <path d={`M${s.x},${s.y} Q${mx},${my} ${t.x},${t.y}`} fill="none" stroke={color} strokeWidth={w} markerEnd={`url(#${uid}arr)`} strokeDasharray={e.dashed ? '5 4' : undefined} />
            {e.label && <EdgeLabel x={lx} y={ly} text={e.label} color={e.color} />}
          </g>
        );
      })}
      {nodes.map((n) => {
        const r = nr(n);
        const lvl = Math.max(0, Math.min(1, n.level ?? 0));
        return (
          <g
            key={n.id}
            transform={`translate(${n.x},${n.y})`}
            style={{ cursor: onMove || onNodeClick ? 'pointer' : 'default' }}
            onPointerDown={(e) => {
              (e.target as Element).setPointerCapture?.(e.pointerId);
              drag.current = { id: n.id, moved: false };
            }}
            onPointerUp={() => {
              if (drag.current && !drag.current.moved) onNodeClick?.(n.id);
              drag.current = null;
            }}
          >
            {n.shape === 'diamond' ? (
              <rect x={-r * 0.75} y={-r * 0.75} width={r * 1.5} height={r * 1.5} transform="rotate(45)" fill={n.fill ?? 'var(--bg-elev)'} stroke={n.stroke ?? 'var(--border-strong)'} strokeWidth={2} strokeDasharray={n.dashed ? '4 3' : undefined} />
            ) : (
              <>
                <circle r={r} fill={n.fill ?? 'var(--bg-elev)'} stroke={n.stroke ?? 'var(--border-strong)'} strokeWidth={2} strokeDasharray={n.dashed ? '4 3' : undefined} />
                {lvl > 0 && <circle r={r * Math.sqrt(lvl)} fill="color-mix(in srgb, var(--accent) 55%, transparent)" />}
              </>
            )}
            {n.shape !== 'dot' && (
              <text textAnchor="middle" y={4} fontSize={13} fontWeight={700} style={{ fill: 'var(--fg)' }} pointerEvents="none">
                {n.label}
              </text>
            )}
            {n.shape === 'dot' && (
              <text textAnchor="middle" y={-13} fontSize={11} fontWeight={600} pointerEvents="none">
                {n.label}
              </text>
            )}
            {n.sub && (
              <text textAnchor="middle" y={r + 15} fontSize={11} fontWeight={600} pointerEvents="none" style={{ fill: 'var(--accent)' }}>
                {n.sub}
              </text>
            )}
          </g>
        );
      })}
      {children}
    </svg>
  );
}

function EdgeLabel({ x, y, text, color }: { x: number; y: number; text: string; color?: string }) {
  const w = text.length * 6.6 + 8;
  return (
    <g transform={`translate(${x},${y})`} pointerEvents="none">
      <rect x={-w / 2} y={-9} width={w} height={17} rx={4} fill="var(--bg-elev)" opacity={0.92} />
      <text textAnchor="middle" y={4} fontSize={11} fontWeight={600} style={{ fill: color ?? 'var(--fg-muted)' }}>
        {text}
      </text>
    </g>
  );
}
