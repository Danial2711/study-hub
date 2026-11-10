/**
 * A toy Merkle–Damgård hash with a 32-bit chaining value and 16-byte blocks.
 * The compression function is a truncated SHA-256 of (h ‖ block). Only for demos.
 */
import { concat } from './bytes';
import { sha256 } from './sha256';

export const MD_BLOCK = 16;
export const MD_IV = 0x13579bdf;

export function compress(h: number, block: Uint8Array): number {
  const hb = new Uint8Array([(h >>> 24) & 0xff, (h >>> 16) & 0xff, (h >>> 8) & 0xff, h & 0xff]);
  const d = sha256(concat(hb, block));
  return ((d[0] << 24) | (d[1] << 16) | (d[2] << 8) | d[3]) >>> 0;
}

/** MD-compliant padding for a message of `len` bytes: 0x80, zeros, then the 8-byte bit length. */
export function mdPad(len: number, blockSize = MD_BLOCK): Uint8Array {
  const zeros = (blockSize - ((len + 1 + 8) % blockSize)) % blockSize;
  const pad = new Uint8Array(1 + zeros + 8);
  pad[0] = 0x80;
  const bits = len * 8;
  for (let i = 0; i < 8; i++) pad[pad.length - 1 - i] = Math.floor(bits / 2 ** (8 * i)) & 0xff;
  return pad;
}

export interface MdTrace {
  padded: Uint8Array;
  blocks: Uint8Array[];
  /** Chaining values h0 (IV), h1, …, hn = digest. */
  chain: number[];
}

/** Hash with a full trace of the chaining values. */
export function mdHash(msg: Uint8Array): MdTrace {
  const padded = concat(msg, mdPad(msg.length));
  const blocks: Uint8Array[] = [];
  for (let i = 0; i < padded.length; i += MD_BLOCK) blocks.push(padded.slice(i, i + MD_BLOCK));
  const chain = [MD_IV];
  for (const b of blocks) chain.push(compress(chain[chain.length - 1], b));
  return { padded, blocks, chain };
}

export const toyHash = (msg: Uint8Array): number => {
  const t = mdHash(msg);
  return t.chain[t.chain.length - 1];
};

export const hex32 = (x: number) => (x >>> 0).toString(16).padStart(8, '0');
