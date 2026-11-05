/** Finite MDPs with rewards r(s, a) and discounted payoff. */
import { solve } from './linalg';

export interface MdpAction {
  name: string;
  reward: number;
  /** Distribution over successor states. */
  next: { to: number; p: number }[];
}

export interface MdpState {
  name: string;
  actions: MdpAction[];
}

export interface Mdp {
  states: MdpState[];
}

export type Policy = number[]; // action index per state

export function qValue(m: Mdp, V: number[], s: number, a: number, gamma: number): number {
  const act = m.states[s].actions[a];
  return act.reward + gamma * act.next.reduce((acc, t) => acc + t.p * V[t.to], 0);
}

export interface ViStep {
  V: number[];
  policy: Policy;
  delta: number;
}

/** Value iteration; returns every iterate (for animation). */
export function valueIteration(m: Mdp, gamma: number, maxIter = 500, eps = 1e-9): ViStep[] {
  const n = m.states.length;
  let V = new Array<number>(n).fill(0);
  const steps: ViStep[] = [{ V, policy: greedyPolicy(m, V, gamma), delta: Infinity }];
  for (let k = 0; k < maxIter; k++) {
    const nv = m.states.map((st, s) => Math.max(...st.actions.map((_, a) => qValue(m, V, s, a, gamma))));
    const delta = Math.max(...nv.map((x, i) => Math.abs(x - V[i])));
    V = nv;
    steps.push({ V, policy: greedyPolicy(m, V, gamma), delta });
    if (delta < eps) break;
  }
  return steps;
}

export function greedyPolicy(m: Mdp, V: number[], gamma: number): Policy {
  return m.states.map((st, s) => {
    let best = 0;
    let bv = -Infinity;
    st.actions.forEach((_, a) => {
      const q = qValue(m, V, s, a, gamma);
      if (q > bv + 1e-12) {
        bv = q;
        best = a;
      }
    });
    return best;
  });
}

/** Solve the linear Bellman equations V = r_σ + γ P_σ V for a memoryless deterministic policy. */
export function evaluatePolicy(m: Mdp, policy: Policy, gamma: number): number[] {
  const n = m.states.length;
  const A = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => +(i === j)));
  const b = new Array<number>(n).fill(0);
  m.states.forEach((st, s) => {
    const act = st.actions[policy[s]];
    b[s] = act.reward;
    for (const t of act.next) A[s][t.to] -= gamma * t.p;
  });
  return solve(A, b) ?? new Array<number>(n).fill(NaN);
}

export interface PiStep {
  policy: Policy;
  V: number[];
}

export function policyIteration(m: Mdp, gamma: number, maxIter = 100): PiStep[] {
  let policy: Policy = m.states.map(() => 0);
  const out: PiStep[] = [];
  for (let k = 0; k < maxIter; k++) {
    const V = evaluatePolicy(m, policy, gamma);
    out.push({ policy, V });
    // improve, keeping current action on ties to guarantee termination
    const next = m.states.map((st, s) => {
      let best = policy[s];
      let bv = qValue(m, V, s, best, gamma);
      st.actions.forEach((_, a) => {
        const q = qValue(m, V, s, a, gamma);
        if (q > bv + 1e-10) {
          bv = q;
          best = a;
        }
      });
      return best;
    });
    if (next.every((a, i) => a === policy[i])) break;
    policy = next;
  }
  return out;
}

/** Transition matrix of the Markov chain induced by a memoryless deterministic policy. */
export function inducedChain(m: Mdp, policy: Policy): number[][] {
  const n = m.states.length;
  return m.states.map((st, s) => {
    const row = new Array<number>(n).fill(0);
    for (const t of st.actions[policy[s]].next) row[t.to] += t.p;
    return row;
  });
}
