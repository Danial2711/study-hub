/** Byte / bit helpers shared by the crypto demos. */

export const toHex = (b: ArrayLike<number>): string => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');

export function fromHex(h: string): Uint8Array {
  const clean = h.replace(/[^0-9a-fA-F]/g, '');
  const out = new Uint8Array(Math.floor(clean.length / 2));
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(2 * i, 2 * i + 2), 16);
  return out;
}

export const utf8 = (s: string): Uint8Array => new TextEncoder().encode(s);
export const fromUtf8 = (b: Uint8Array): string => new TextDecoder('utf-8', { fatal: false }).decode(b);

/** Printable view of bytes: ASCII where printable, `·` otherwise. */
export const printable = (b: ArrayLike<number>): string => Array.from(b, (x) => (x >= 32 && x < 127 ? String.fromCharCode(x) : '·')).join('');

export function xor(a: ArrayLike<number>, b: ArrayLike<number>): Uint8Array {
  const n = Math.min(a.length, b.length);
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) out[i] = a[i] ^ b[i];
  return out;
}

export function concat(...parts: ArrayLike<number>[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(Array.from(p), o);
    o += p.length;
  }
  return out;
}

export const bits8 = (x: number): string => (x & 0xff).toString(2).padStart(8, '0');
export const bitsOf = (b: ArrayLike<number>): string => Array.from(b, bits8).join('');

export const popcount = (x: number): number => {
  let c = 0;
  x >>>= 0;
  while (x) {
    c += x & 1;
    x >>>= 1;
  }
  return c;
};

export function hamming(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let d = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) d += popcount(a[i] ^ b[i]);
  return d;
}

export const rotl32 = (x: number, n: number): number => ((x << n) | (x >>> (32 - n))) >>> 0;
export const add32 = (a: number, b: number): number => (a + b) >>> 0;
export const hex32 = (x: number): string => (x >>> 0).toString(16).padStart(8, '0');

/** Split into blocks of `size` bytes (last block may be shorter). */
export function blocks(b: Uint8Array, size: number): Uint8Array[] {
  const out: Uint8Array[] = [];
  for (let i = 0; i < b.length; i += size) out.push(b.slice(i, i + size));
  return out;
}

/** PKCS#7 padding to a multiple of `size`. */
export function pkcs7(b: Uint8Array, size: number): Uint8Array {
  const p = size - (b.length % size);
  return concat(b, new Uint8Array(p).fill(p));
}

/** Deterministic pseudo-random bytes (xorshift), for reproducible demos only — not cryptographic. */
export function demoBytes(n: number, seed = 1): Uint8Array {
  let s = seed >>> 0 || 1;
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    out[i] = s & 0xff;
  }
  return out;
}
