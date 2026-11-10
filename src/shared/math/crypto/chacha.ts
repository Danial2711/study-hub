/** ChaCha20 (RFC 8439) with access to intermediate values, for teaching. */
import { add32, rotl32 } from './bytes';

export interface QrStep {
  op: string;
  /** Index (0..3 of a,b,c,d) of the word that changed. */
  changed: number;
  words: [number, number, number, number];
}

/** One quarter round on (a,b,c,d) with the 12 ARX steps recorded. */
export function quarterRoundSteps(a: number, b: number, c: number, d: number): QrStep[] {
  const w: [number, number, number, number] = [a >>> 0, b >>> 0, c >>> 0, d >>> 0];
  const steps: QrStep[] = [];
  const rec = (op: string, changed: number) => steps.push({ op, changed, words: [...w] as [number, number, number, number] });
  const round = (x: number, y: number, z: number, r: number, names: string) => {
    w[x] = add32(w[x], w[y]);
    rec(`${names[0]} += ${names[1]}`, x);
    w[z] = (w[z] ^ w[x]) >>> 0;
    rec(`${names[2]} ^= ${names[0]}`, z);
    w[z] = rotl32(w[z], r);
    rec(`${names[2]} <<<= ${r}`, z);
  };
  round(0, 1, 3, 16, 'abd');
  round(2, 3, 1, 12, 'cdb');
  round(0, 1, 3, 8, 'abd');
  round(2, 3, 1, 7, 'cdb');
  return steps;
}

export function quarterRound(s: Uint32Array | number[], a: number, b: number, c: number, d: number) {
  const st = quarterRoundSteps(s[a], s[b], s[c], s[d]);
  const [wa, wb, wc, wd] = st[st.length - 1].words;
  s[a] = wa;
  s[b] = wb;
  s[c] = wc;
  s[d] = wd;
}

/** "expand 32-byte k" — the nothing-up-my-sleeve constants. */
export const SIGMA = [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574];

const le32 = (b: Uint8Array, o: number) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;

/** Initial 4×4 state: constants | key (8 words) | counter | nonce (3 words). */
export function initialState(key: Uint8Array, counter: number, nonce: Uint8Array): Uint32Array {
  const s = new Uint32Array(16);
  SIGMA.forEach((c, i) => (s[i] = c));
  for (let i = 0; i < 8; i++) s[4 + i] = le32(key, 4 * i);
  s[12] = counter >>> 0;
  for (let i = 0; i < 3; i++) s[13 + i] = le32(nonce, 4 * i);
  return s;
}

/** Apply `doubleRounds` double rounds (column + diagonal). */
export function permute(input: Uint32Array, doubleRounds = 10): Uint32Array {
  const x = input.slice();
  for (let i = 0; i < doubleRounds; i++) {
    quarterRound(x, 0, 4, 8, 12);
    quarterRound(x, 1, 5, 9, 13);
    quarterRound(x, 2, 6, 10, 14);
    quarterRound(x, 3, 7, 11, 15);
    quarterRound(x, 0, 5, 10, 15);
    quarterRound(x, 1, 6, 11, 12);
    quarterRound(x, 2, 7, 8, 13);
    quarterRound(x, 3, 4, 9, 14);
  }
  return x;
}

/** Inverse of one quarter round (shows the permutation itself is invertible). */
export function invQuarterRound(s: Uint32Array, a: number, b: number, c: number, d: number) {
  const rotr = (x: number, n: number) => ((x >>> n) | (x << (32 - n))) >>> 0;
  const sub = (x: number, y: number) => (x - y) >>> 0;
  s[b] = rotr(s[b], 7) ^ s[c];
  s[b] >>>= 0;
  s[c] = sub(s[c], s[d]);
  s[d] = (rotr(s[d], 8) ^ s[a]) >>> 0;
  s[a] = sub(s[a], s[b]);
  s[b] = (rotr(s[b], 12) ^ s[c]) >>> 0;
  s[c] = sub(s[c], s[d]);
  s[d] = (rotr(s[d], 16) ^ s[a]) >>> 0;
  s[a] = sub(s[a], s[b]);
}

export function invPermute(input: Uint32Array, doubleRounds = 10): Uint32Array {
  const x = input.slice();
  for (let i = 0; i < doubleRounds; i++) {
    invQuarterRound(x, 3, 4, 9, 14);
    invQuarterRound(x, 2, 7, 8, 13);
    invQuarterRound(x, 1, 6, 11, 12);
    invQuarterRound(x, 0, 5, 10, 15);
    invQuarterRound(x, 3, 7, 11, 15);
    invQuarterRound(x, 2, 6, 10, 14);
    invQuarterRound(x, 1, 5, 9, 13);
    invQuarterRound(x, 0, 4, 8, 12);
  }
  return x;
}

/** Block function: permute, then (optionally) add the input word-wise. */
export function block(key: Uint8Array, counter: number, nonce: Uint8Array, opts: { doubleRounds?: number; feedForward?: boolean } = {}): Uint32Array {
  const init = initialState(key, counter, nonce);
  const out = permute(init, opts.doubleRounds ?? 10);
  if (opts.feedForward !== false) for (let i = 0; i < 16; i++) out[i] = add32(out[i], init[i]);
  return out;
}

/** Serialize the 16 words little-endian (64 bytes of keystream). */
export function serialize(words: Uint32Array): Uint8Array {
  const out = new Uint8Array(64);
  words.forEach((w, i) => {
    out[4 * i] = w & 0xff;
    out[4 * i + 1] = (w >>> 8) & 0xff;
    out[4 * i + 2] = (w >>> 16) & 0xff;
    out[4 * i + 3] = (w >>> 24) & 0xff;
  });
  return out;
}
