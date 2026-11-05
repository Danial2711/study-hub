/** Source codes: Kraft/McMillan, Huffman, Shannon(-Fano), code classification. */
import { entropy } from './info';

export const kraftSum = (lengths: readonly number[], d = 2) => lengths.reduce((s, l) => s + d ** -l, 0);

export const expectedLength = (p: readonly number[], lengths: readonly number[]) => p.reduce((s, pi, i) => s + pi * lengths[i], 0);

/** Shannon code lengths ⌈log_d 1/p_i⌉. */
export const shannonLengths = (p: readonly number[], d = 2) =>
  p.map((x) => (x <= 0 ? Infinity : Math.max(1, Math.ceil(-Math.log(x) / Math.log(d) - 1e-12))));

/** Canonical prefix code (binary or d-ary) for lengths satisfying Kraft; null otherwise. */
export function prefixCodeFromLengths(lengths: readonly number[], d = 2): string[] | null {
  if (kraftSum(lengths, d) > 1 + 1e-12) return null;
  const order = lengths.map((l, i) => [l, i] as const).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const out = new Array<string>(lengths.length);
  // Assign codewords as d-ary fractions: next codeword = previous + 1 (at its length).
  let value = 0; // current codeword as integer in base d at length curLen
  let curLen = order.length ? order[0][0] : 0;
  order.forEach(([l, i], k) => {
    if (k > 0) value += 1;
    value *= d ** (l - curLen);
    curLen = l;
    out[i] = value.toString(d).padStart(l, '0');
  });
  return out;
}

export interface HuffmanNode {
  id: number;
  p: number;
  symbol?: number;
  children?: HuffmanNode[];
}

export interface HuffmanStep {
  /** Nodes present before this merge, sorted by probability. */
  queue: HuffmanNode[];
  merged: HuffmanNode[];
  result: HuffmanNode;
}

export interface HuffmanResult {
  codewords: string[];
  lengths: number[];
  root: HuffmanNode;
  steps: HuffmanStep[];
  L: number;
  H: number;
}

/**
 * d-ary Huffman code. For d > 2, dummy symbols of probability 0 are added so that
 * (n − 1) is divisible by (d − 1). Ties are broken by insertion order (stable).
 */
export function huffman(p: readonly number[], d = 2): HuffmanResult {
  let nid = 0;
  let nodes: HuffmanNode[] = p.map((x, i) => ({ id: nid++, p: x, symbol: i }));
  if (d > 2) while ((nodes.length - 1) % (d - 1) !== 0) nodes.push({ id: nid++, p: 0, symbol: -1 });
  const steps: HuffmanStep[] = [];
  if (nodes.length === 1) {
    const root = nodes[0];
    return { codewords: ['0'], lengths: [1], root, steps, L: 1, H: entropy(p, d) };
  }
  while (nodes.length > 1) {
    const sorted = [...nodes].sort((a, b) => a.p - b.p || a.id - b.id);
    const merged = sorted.slice(0, d);
    const result: HuffmanNode = { id: nid++, p: merged.reduce((s, x) => s + x.p, 0), children: merged };
    steps.push({ queue: sorted, merged, result });
    nodes = [...sorted.slice(d), result];
  }
  const root = nodes[0];
  const codewords = new Array<string>(p.length).fill('');
  const walk = (n: HuffmanNode, prefix: string) => {
    if (!n.children) {
      if (n.symbol !== undefined && n.symbol >= 0) codewords[n.symbol] = prefix || '0';
      return;
    }
    // Highest-probability child gets digit 0 for readability.
    const kids = [...n.children].sort((a, b) => b.p - a.p || a.id - b.id);
    kids.forEach((c, i) => walk(c, prefix + i.toString(d)));
  };
  walk(root, '');
  const lengths = codewords.map((c) => c.length);
  return { codewords, lengths, root, steps, L: expectedLength(p, lengths), H: entropy(p, d) };
}

/** Top-down (naive) Shannon–Fano: split sorted probabilities into halves of nearly equal mass. */
export function shannonFano(p: readonly number[]): string[] {
  const idx = p.map((_, i) => i).sort((a, b) => p[b] - p[a] || a - b);
  const out = new Array<string>(p.length).fill('');
  const rec = (items: number[], prefix: string) => {
    if (items.length === 1) {
      out[items[0]] = prefix || '0';
      return;
    }
    const total = items.reduce((s, i) => s + p[i], 0);
    let acc = 0;
    let best = 1;
    let bestDiff = Infinity;
    for (let k = 1; k < items.length; k++) {
      acc += p[items[k - 1]];
      const diff = Math.abs(total - 2 * acc);
      if (diff < bestDiff - 1e-12) {
        bestDiff = diff;
        best = k;
      }
    }
    rec(items.slice(0, best), prefix + '0');
    rec(items.slice(best), prefix + '1');
  };
  if (idx.length) rec(idx, '');
  return out;
}

export const isNonSingular = (code: readonly string[]) => new Set(code).size === code.length && code.every((c) => c.length > 0);

export function isPrefixFree(code: readonly string[]): boolean {
  for (let i = 0; i < code.length; i++)
    for (let j = 0; j < code.length; j++) if (i !== j && code[j].startsWith(code[i])) return false;
  return true;
}

/** Sardinas–Patterson test for unique decodability. */
export function isUniquelyDecodable(code: readonly string[]): boolean {
  if (!isNonSingular(code)) return false;
  const C = new Set(code);
  const dangling = (A: Set<string>, B: Set<string>) => {
    const out = new Set<string>();
    for (const a of A) for (const b of B) if (b.length > a.length && b.startsWith(a)) out.add(b.slice(a.length));
    return out;
  };
  let S = dangling(C, C);
  const seen = new Set<string>();
  while (S.size) {
    for (const s of S) if (C.has(s)) return false;
    const key = [...S].sort().join('|');
    if (seen.has(key)) return true;
    seen.add(key);
    S = new Set([...dangling(S, C), ...dangling(C, S)]);
  }
  return true;
}

export type CodeClass = 'singular' | 'non-singular' | 'uniquely decodable' | 'prefix-free';

export function classifyCode(code: readonly string[]): CodeClass {
  if (!isNonSingular(code)) return 'singular';
  if (isPrefixFree(code)) return 'prefix-free';
  if (isUniquelyDecodable(code)) return 'uniquely decodable';
  return 'non-singular';
}
