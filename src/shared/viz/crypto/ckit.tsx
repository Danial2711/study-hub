/** Small building blocks shared by the crypto visualizations. */
import type { ReactNode } from 'react';
import { makeRng } from '../../math/random';

/** A row of byte cells (hex), optionally highlighting changed cells. */
export function Bytes({ data, highlight, label, max = 64, ascii }: { data: ArrayLike<number>; highlight?: (i: number) => boolean; label?: ReactNode; max?: number; ascii?: boolean }) {
  const arr = Array.from(data).slice(0, max);
  return (
    <div className="bytes-row">
      {label && <span className="bytes-label">{label}</span>}
      <span className="bytes">
        {arr.map((b, i) => (
          <span key={i} className={`byte ${highlight?.(i) ? 'hl' : ''}`} title={`byte ${i}: ${b} = ${b.toString(2).padStart(8, '0')}`}>
            {ascii ? (b >= 32 && b < 127 ? String.fromCharCode(b) : '·') : b.toString(16).padStart(2, '0')}
          </span>
        ))}
        {data.length > max && <span className="faint small"> …</span>}
      </span>
    </div>
  );
}

/** A 4×4 state grid (column-major as in AES: byte i is row i%4, column ⌊i/4⌋). */
export function StateGrid({ state, changed, colMajor = true, words, title }: { state: ArrayLike<number>; changed?: (i: number) => boolean; colMajor?: boolean; words?: boolean; title?: ReactNode }) {
  const cell = (r: number, c: number) => (colMajor ? 4 * c + r : 4 * r + c);
  return (
    <div className="state-grid-wrap">
      {title && <div className="small muted" style={{ marginBottom: 4 }}>{title}</div>}
      <table className={`state-grid ${words ? 'words' : ''}`}>
        <tbody>
          {[0, 1, 2, 3].map((r) => (
            <tr key={r}>
              {[0, 1, 2, 3].map((c) => {
                const i = cell(r, c);
                const v = state[i];
                return (
                  <td key={c} className={changed?.(i) ? 'hl' : ''}>
                    {words ? (v >>> 0).toString(16).padStart(8, '0') : v.toString(16).padStart(2, '0')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Bit string with optional per-bit highlighting. */
export function Bits({ bits, highlight, group = 8 }: { bits: string; highlight?: (i: number) => boolean; group?: number }) {
  return (
    <span className="bits mono">
      {bits.split('').map((b, i) => (
        <span key={i} className={`${highlight?.(i) ? 'hl' : ''} ${i > 0 && i % group === 0 ? 'gap' : ''}`}>
          {b}
        </span>
      ))}
    </span>
  );
}

/** Seeded random bytes for demos. */
export function randomBytes(n: number, seed: number): Uint8Array {
  const r = makeRng(seed);
  return Uint8Array.from({ length: n }, () => r.int(0, 255));
}

/** A keyed random permutation of {0..size-1}: a toy "ideal" block cipher on tiny blocks. */
export function toyPrp(seed: number, size = 256): { enc: number[]; dec: number[] } {
  const enc = makeRng(seed).shuffle(Array.from({ length: size }, (_, i) => i));
  const dec = new Array<number>(size);
  enc.forEach((y, x) => (dec[y] = x));
  return { enc, dec };
}

export const hex = (n: number, w = 2) => (n >>> 0).toString(16).padStart(w, '0');

export function Step({ n, children, active }: { n: number | string; children: ReactNode; active?: boolean }) {
  return (
    <div className={`proto-step ${active ? 'active' : ''}`}>
      <span className="proto-n">{n}</span>
      <div>{children}</div>
    </div>
  );
}
