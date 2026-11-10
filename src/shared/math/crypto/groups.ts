/** Small finite groups for exploration: (Z_n, +) and (Z_n^×, ·). */
import { factor, gcdN, phi } from './numberTheory';

export type GroupKind = 'add' | 'mul';

export interface FiniteGroup {
  kind: GroupKind;
  n: number;
  elements: number[];
  op: (a: number, b: number) => number;
  identity: number;
  inverse: (a: number) => number;
  /** Symbol used in notation. */
  symbol: string;
}

export function zn(kind: GroupKind, n: number): FiniteGroup {
  if (kind === 'add') {
    return {
      kind,
      n,
      elements: Array.from({ length: n }, (_, i) => i),
      op: (a, b) => (a + b) % n,
      identity: 0,
      inverse: (a) => (n - a) % n,
      symbol: '+',
    };
  }
  const elements = Array.from({ length: n }, (_, i) => i).filter((i) => i > 0 && gcdN(i, n) === 1);
  const op = (a: number, b: number) => (a * b) % n;
  return {
    kind,
    n,
    elements: n === 1 ? [0] : elements,
    op,
    identity: 1 % n,
    inverse: (a) => elements.find((b) => op(a, b) === 1 % n) ?? NaN,
    symbol: '·',
  };
}

/** ⟨g⟩ = {g^0 = e, g, g^2, …} in generation order. */
export function cycle(G: FiniteGroup, g: number): number[] {
  const out = [G.identity];
  let x = g;
  while (x !== G.identity && out.length <= G.elements.length) {
    out.push(x);
    x = G.op(x, g);
  }
  return out;
}

export const order = (G: FiniteGroup, g: number): number => cycle(G, g).length;

export const generators = (G: FiniteGroup): number[] => G.elements.filter((g) => order(G, g) === G.elements.length);

export const isCyclic = (G: FiniteGroup): boolean => generators(G).length > 0;

export function cayley(G: FiniteGroup): number[][] {
  return G.elements.map((a) => G.elements.map((b) => G.op(a, b)));
}

/** Generator test from the lecture: g generates a cyclic group of order m iff g^(m/p) ≠ e for every prime p | m. */
export function generatorTest(G: FiniteGroup, g: number): { p: number; value: number }[] {
  const m = G.elements.length;
  return factor(m).map(([p]) => {
    let x = G.identity;
    for (let i = 0; i < m / p; i++) x = G.op(x, g);
    return { p, value: x };
  });
}

export { phi };
