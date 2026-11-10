/**
 * AES-128 for teaching: every round's state can be captured.
 * Straightforward, unoptimised and not constant-time — never use for real data.
 */
import { gfInv, gfMul } from './gf2';
import { blocks, concat, pkcs7, xor } from './bytes';

function buildSbox(): { sbox: Uint8Array; inv: Uint8Array } {
  const sbox = new Uint8Array(256);
  const inv = new Uint8Array(256);
  const rotl8 = (x: number, n: number) => ((x << n) | (x >>> (8 - n))) & 0xff;
  for (let x = 0; x < 256; x++) {
    const b = gfInv(x);
    const s = b ^ rotl8(b, 1) ^ rotl8(b, 2) ^ rotl8(b, 3) ^ rotl8(b, 4) ^ 0x63;
    sbox[x] = s;
    inv[s] = x;
  }
  return { sbox, inv };
}
export const { sbox: SBOX, inv: INV_SBOX } = buildSbox();

/** State is 16 bytes in column-major order (byte i is row i%4, column ⌊i/4⌋), as in FIPS-197. */
export type State = Uint8Array;

export const subBytes = (s: State): State => s.map((x) => SBOX[x]);
export const invSubBytes = (s: State): State => s.map((x) => INV_SBOX[x]);

export function shiftRows(s: State): State {
  const o = new Uint8Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[4 * c + r] = s[4 * ((c + r) % 4) + r];
  return o;
}
export function invShiftRows(s: State): State {
  const o = new Uint8Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[4 * ((c + r) % 4) + r] = s[4 * c + r];
  return o;
}

/** Column times the circulant matrix: out[r] = Σ_j m[(j − r) mod 4] · a[j] over GF(2^8). */
const mixCol = (a: number[], m: number[]) => [0, 1, 2, 3].map((r) => a.reduce((acc, aj, j) => acc ^ gfMul(m[(j - r + 4) % 4], aj), 0));
const MIX = [2, 3, 1, 1];
const INV_MIX = [14, 11, 13, 9];

export function mixColumns(s: State, m = MIX): State {
  const o = new Uint8Array(16);
  for (let c = 0; c < 4; c++) {
    const col = [s[4 * c], s[4 * c + 1], s[4 * c + 2], s[4 * c + 3]];
    mixCol(col, m).forEach((v, r) => (o[4 * c + r] = v));
  }
  return o;
}
export const invMixColumns = (s: State): State => mixColumns(s, INV_MIX);

export const addRoundKey = (s: State, k: Uint8Array): State => xor(s, k);

const RCON = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

/** AES-128 key expansion → 11 round keys of 16 bytes. */
export function expandKey(key: Uint8Array): Uint8Array[] {
  if (key.length !== 16) throw new Error('AES-128 needs a 16-byte key');
  const w: number[][] = [];
  for (let i = 0; i < 4; i++) w.push([key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]]);
  for (let i = 4; i < 44; i++) {
    let t = [...w[i - 1]];
    if (i % 4 === 0) {
      t = [t[1], t[2], t[3], t[0]].map((x) => SBOX[x]);
      t[0] ^= RCON[i / 4 - 1];
    }
    w.push(w[i - 4].map((x, j) => x ^ t[j]));
  }
  return Array.from({ length: 11 }, (_, r) => Uint8Array.from(w.slice(4 * r, 4 * r + 4).flat()));
}

export type StepName = 'input' | 'AddRoundKey' | 'SubBytes' | 'ShiftRows' | 'MixColumns';
export interface TraceStep {
  round: number;
  step: StepName;
  state: State;
}

/** Encrypt one block, recording the state after every operation. */
export function encryptBlockTrace(block: Uint8Array, key: Uint8Array | Uint8Array[], rounds = 10): { out: Uint8Array; trace: TraceStep[] } {
  const rk = Array.isArray(key) ? key : expandKey(key);
  const trace: TraceStep[] = [{ round: 0, step: 'input', state: block.slice() }];
  let s = addRoundKey(block, rk[0]);
  trace.push({ round: 0, step: 'AddRoundKey', state: s });
  for (let r = 1; r <= rounds; r++) {
    s = subBytes(s);
    trace.push({ round: r, step: 'SubBytes', state: s });
    s = shiftRows(s);
    trace.push({ round: r, step: 'ShiftRows', state: s });
    if (r !== 10) {
      s = mixColumns(s);
      trace.push({ round: r, step: 'MixColumns', state: s });
    }
    s = addRoundKey(s, rk[r]);
    trace.push({ round: r, step: 'AddRoundKey', state: s });
  }
  return { out: s, trace };
}

export const encryptBlock = (block: Uint8Array, key: Uint8Array | Uint8Array[]): Uint8Array => encryptBlockTrace(block, key).out;

export function decryptBlock(block: Uint8Array, key: Uint8Array | Uint8Array[]): Uint8Array {
  const rk = Array.isArray(key) ? key : expandKey(key);
  let s = addRoundKey(block, rk[10]);
  for (let r = 9; r >= 0; r--) {
    s = invShiftRows(s);
    s = invSubBytes(s);
    s = addRoundKey(s, rk[r]);
    if (r > 0) s = invMixColumns(s);
  }
  return s;
}

/** A keyed block-cipher interface so modes can run with AES or with a toy cipher. */
export interface BlockCipher {
  size: number;
  enc: (x: Uint8Array) => Uint8Array;
  dec: (x: Uint8Array) => Uint8Array;
}

export function aesCipher(key: Uint8Array): BlockCipher {
  const rk = expandKey(key);
  return { size: 16, enc: (x) => encryptBlock(x, rk), dec: (x) => decryptBlock(x, rk) };
}

/** ECB over already padded data. */
export const ecb = (E: BlockCipher, data: Uint8Array): Uint8Array[] => blocks(data, E.size).map((b) => E.enc(b));

export function cbcEncrypt(E: BlockCipher, iv: Uint8Array, data: Uint8Array): Uint8Array[] {
  let prev = iv;
  return blocks(data, E.size).map((b) => (prev = E.enc(xor(b, prev))));
}
export function cbcDecrypt(E: BlockCipher, iv: Uint8Array, cts: Uint8Array[]): Uint8Array[] {
  let prev = iv;
  return cts.map((c) => {
    const m = xor(E.dec(c), prev);
    prev = c;
    return m;
  });
}

/** Counter block: the IV/nonce block plus i (big-endian addition modulo 2^128). */
export function counterBlock(iv: Uint8Array, i: number): Uint8Array {
  const out = iv.slice();
  let carry = i;
  for (let j = out.length - 1; j >= 0 && carry > 0; j--) {
    const v = out[j] + (carry & 0xff);
    out[j] = v & 0xff;
    carry = (carry >>> 8) + (v >> 8);
  }
  return out;
}

/** CTR keystream ⊕ data (works for any length; also decrypts). */
export function ctr(E: BlockCipher, iv: Uint8Array, data: Uint8Array): Uint8Array {
  const parts = blocks(data, E.size).map((b, i) => xor(b, E.enc(counterBlock(iv, i))));
  return concat(...parts);
}

export const padForBlocks = (data: Uint8Array, size = 16) => pkcs7(data, size);
