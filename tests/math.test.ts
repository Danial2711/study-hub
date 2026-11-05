import { describe, expect, it } from 'vitest';
import { binomial, choose, geometric, normalCdf, poisson, exponential } from '../src/shared/math/distributions';
import { chebyshevBound, chernoffUpper, chernoffUpperSimple, hoeffdingSampleSize, markovBound } from '../src/shared/math/bounds';
import { analyze, expectedHittingTimes, hittingProbabilities, stationary, boundedReachability, limitingFrom } from '../src/shared/math/markov';
import { evaluatePolicy, policyIteration, valueIteration, type Mdp } from '../src/shared/math/mdp';
import { binaryEntropy, entropy, infoSummary, klDivergence, mutualInformation } from '../src/shared/math/info';
import { classifyCode, huffman, kraftSum, prefixCodeFromLengths, shannonFano, shannonLengths, isUniquelyDecodable } from '../src/shared/math/codes';
import { blahutArimoto, bscCapacity, bscMatrix, becMatrix, repetitionErrorRate } from '../src/shared/math/channel';
import { solve } from '../src/shared/math/linalg';
import { makeRng } from '../src/shared/math/random';
import { parseNumber, grade } from '../src/platform/quiz';
import { mergeState, defaultState, emptyCourse, importJson, exportJson } from '../src/platform/state/model';
import { review } from '../src/platform/state/srs';

describe('distributions', () => {
  it('binomial pmf sums to 1 and has right moments', () => {
    const b = binomial(10, 0.3);
    let s = 0;
    let m = 0;
    for (let k = 0; k <= 10; k++) {
      s += b.pmf(k);
      m += k * b.pmf(k);
    }
    expect(s).toBeCloseTo(1, 10);
    expect(m).toBeCloseTo(3, 10);
    expect(b.pmf(3)).toBeCloseTo(choose(10, 3) * 0.3 ** 3 * 0.7 ** 7, 12);
  });
  it('geometric memoryless & mean', () => {
    const g = geometric(0.25);
    expect(g.mean).toBe(4);
    expect(g.tail(6) / g.tail(3)).toBeCloseTo(g.tail(4), 8); // P(X≥6 | X≥3) = P(X≥4)
  });
  it('poisson and normal', () => {
    expect(poisson(2).pmf(0)).toBeCloseTo(Math.exp(-2), 12);
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 3);
    expect(exponential(2).tail(1)).toBeCloseTo(Math.exp(-2), 12);
  });
  it('choose', () => {
    expect(choose(52, 5)).toBe(2598960);
  });
});

describe('bounds', () => {
  it('basic values', () => {
    expect(markovBound(2, 8)).toBe(0.25);
    expect(chebyshevBound(4, 4)).toBe(0.25);
    expect(chernoffUpper(10, 1)).toBeLessThan(chernoffUpperSimple(10, 1));
    expect(hoeffdingSampleSize(0.05, 0.05)).toBe(738);
  });
  it('chernoff really bounds binomial tail', () => {
    const b = binomial(100, 0.5);
    expect(b.tail(75)).toBeLessThan(chernoffUpper(50, 0.5));
  });
});

describe('linalg', () => {
  it('solves', () => {
    const x = solve(
      [
        [2, 1],
        [1, 3],
      ],
      [3, 5],
    )!;
    expect(x[0]).toBeCloseTo(0.8);
    expect(x[1]).toBeCloseTo(1.4);
  });
});

describe('markov', () => {
  const P = [
    [0.5, 0.5, 0],
    [0.25, 0.5, 0.25],
    [0, 0.5, 0.5],
  ];
  it('stationary distribution', () => {
    const pi = stationary(P)!;
    expect(pi[0]).toBeCloseTo(0.25);
    expect(pi[1]).toBeCloseTo(0.5);
    expect(pi[2]).toBeCloseTo(0.25);
  });
  it('gambler ruin hitting probabilities and times', () => {
    // states 0..4, absorbing 0 and 4, fair
    const G = [
      [1, 0, 0, 0, 0],
      [0.5, 0, 0.5, 0, 0],
      [0, 0.5, 0, 0.5, 0],
      [0, 0, 0.5, 0, 0.5],
      [0, 0, 0, 0, 1],
    ];
    const h = hittingProbabilities(G, [4]);
    expect(h[1]).toBeCloseTo(0.25);
    expect(h[2]).toBeCloseTo(0.5);
    const k = expectedHittingTimes(G, [0, 4]);
    expect(k[2]).toBeCloseTo(4); // i(N−i) = 2·2
    expect(expectedHittingTimes(G, [4])[2]).toBe(Infinity);
    const a = analyze(G);
    expect(a.states[2].recurrent).toBe(false);
    expect(a.states[0].absorbing).toBe(true);
    expect(a.bottom.length).toBe(2);
    expect(limitingFrom(G, [0, 0, 1, 0, 0])[4]).toBeCloseTo(0.5);
    expect(boundedReachability(G, [4], 2)[2]).toBeCloseTo(0.25);
  });
  it('period', () => {
    const C = [
      [0, 1],
      [1, 0],
    ];
    const a = analyze(C);
    expect(a.states[0].period).toBe(2);
    expect(a.ergodic).toBe(false);
    expect(analyze(P).ergodic).toBe(true);
  });
});

describe('mdp', () => {
  const m: Mdp = {
    states: [
      {
        name: 'a',
        actions: [
          { name: 'stay', reward: 1, next: [{ to: 0, p: 1 }] },
          { name: 'go', reward: 0, next: [{ to: 1, p: 1 }] },
        ],
      },
      { name: 'b', actions: [{ name: 'stay', reward: 2, next: [{ to: 1, p: 1 }] }] },
    ],
  };
  it('value iteration converges to Bellman optimum', () => {
    const steps = valueIteration(m, 0.9);
    const last = steps[steps.length - 1];
    expect(last.V[1]).toBeCloseTo(20, 5);
    expect(last.V[0]).toBeCloseTo(18, 5); // go: 0 + 0.9·20
    expect(last.policy[0]).toBe(1);
    const pi = policyIteration(m, 0.9);
    expect(pi[pi.length - 1].policy[0]).toBe(1);
    expect(evaluatePolicy(m, [0, 0], 0.9)[0]).toBeCloseTo(10, 6);
  });
});

describe('info', () => {
  it('entropy basics', () => {
    expect(entropy([0.5, 0.5])).toBeCloseTo(1);
    expect(entropy([0.25, 0.25, 0.25, 0.25])).toBeCloseTo(2);
    expect(binaryEntropy(0)).toBe(0);
    expect(klDivergence([0.5, 0.5], [0.5, 0.5])).toBe(0);
  });
  it('chain rule and MI', () => {
    const J = [
      [1 / 8, 1 / 16, 1 / 32, 1 / 32],
      [1 / 16, 1 / 8, 1 / 32, 1 / 32],
      [1 / 16, 1 / 16, 1 / 16, 1 / 16],
      [1 / 4, 0, 0, 0],
    ];
    const s = infoSummary(J);
    expect(s.HXY).toBeCloseTo(s.HX + s.HYgX, 10);
    expect(s.I).toBeCloseTo(mutualInformation(J), 10);
    // Cover & Thomas example 2.2.1 (rows = Y): H(X|Y) = 11/8 when rows are Y. Here rows are X.
    expect(s.HYgX).toBeCloseTo(11 / 8, 10);
    expect(s.I).toBeCloseTo(0.375, 10);
  });
});

describe('codes', () => {
  it('huffman', () => {
    const p = [0.25, 0.25, 0.2, 0.15, 0.15];
    const h = huffman(p);
    expect(h.L).toBeCloseTo(2.3, 10);
    expect(kraftSum(h.lengths)).toBeCloseTo(1);
    expect(classifyCode(h.codewords)).toBe('prefix-free');
    expect(h.L).toBeGreaterThanOrEqual(h.H);
    expect(h.L).toBeLessThan(h.H + 1);
  });
  it('ternary huffman', () => {
    const h = huffman([0.25, 0.25, 0.2, 0.1, 0.1, 0.1], 3);
    expect(kraftSum(h.lengths, 3)).toBeLessThanOrEqual(1 + 1e-12);
    // dummy symbol added (7 leaves); lengths 1,1,2,2,3,3 → L = 1.7
    expect(h.L).toBeCloseTo(1.7, 10);
    expect(h.L).toBeGreaterThanOrEqual(h.H);
  });
  it('shannon lengths, canonical code and classification', () => {
    expect(shannonLengths([0.5, 0.25, 0.125, 0.125])).toEqual([1, 2, 3, 3]);
    expect(prefixCodeFromLengths([1, 2, 3, 3])).toEqual(['0', '10', '110', '111']);
    expect(prefixCodeFromLengths([1, 1, 2])).toBeNull();
    expect(classifyCode(['0', '010', '01', '10'])).toBe('non-singular');
    expect(classifyCode(['10', '00', '11', '110'])).toBe('uniquely decodable');
    expect(isUniquelyDecodable(['0', '01', '11'])).toBe(true);
    expect(classifyCode(['0', '0', '1'])).toBe('singular');
    expect(shannonFano([0.4, 0.3, 0.2, 0.1]).map((c) => c.length)).toEqual([1, 2, 3, 3]);
  });
});

describe('channel', () => {
  it('capacities', () => {
    expect(bscCapacity(0)).toBe(1);
    expect(bscCapacity(0.5)).toBeCloseTo(0);
    expect(bscCapacity(0.11)).toBeCloseTo(0.5, 2);
    expect(blahutArimoto(bscMatrix(0.1)).capacity).toBeCloseTo(bscCapacity(0.1), 6);
    expect(blahutArimoto(becMatrix(0.3)).capacity).toBeCloseTo(0.7, 6);
    expect(repetitionErrorRate(3, 0.1)).toBeCloseTo(0.028, 10);
  });
});

describe('quiz parsing and grading', () => {
  it('parses expressions', () => {
    expect(parseNumber('3/8')).toBeCloseTo(0.375);
    expect(parseNumber('1 - 0.2^3')).toBeCloseTo(0.992);
    expect(parseNumber('2^-3')).toBeCloseTo(0.125);
    expect(parseNumber('sqrt(4)/2')).toBeCloseTo(1);
    expect(parseNumber('log2(8)')).toBeCloseTo(3);
    expect(parseNumber('35%')).toBeCloseTo(0.35);
    expect(parseNumber('0,5')).toBeCloseTo(0.5);
    expect(parseNumber('abc')).toBeNaN();
  });
  it('grades numeric with tolerance', () => {
    const q = { id: 'x', type: 'numeric' as const, prompt: '', explanation: '', answer: 0.3956 };
    expect(grade(q, '0.396')).toBe(true);
    expect(grade(q, '0.41')).toBe(false);
  });
});

describe('state merge', () => {
  it('keeps newer records per item and honours reset', () => {
    const a = defaultState();
    const b = defaultState();
    a.courses.c = emptyCourse();
    b.courses.c = emptyCourse();
    a.courses.c.questions.q1 = { seen: 1, correct: 1, lastCorrect: true, updatedAt: 10 };
    b.courses.c.questions.q1 = { seen: 2, correct: 1, lastCorrect: false, updatedAt: 20 };
    b.courses.c.questions.q2 = { seen: 1, correct: 0, lastCorrect: false, updatedAt: 5 };
    a.settings.syncCode = 'a'.repeat(32);
    const m = mergeState(a, b);
    expect(m.courses.c.questions.q1.seen).toBe(2);
    expect(m.courses.c.questions.q2).toBeDefined();
    expect(m.settings.syncCode).toBe('a'.repeat(32));
    a.courses.c.resetAt = 15;
    const m2 = mergeState(a, b);
    expect(m2.courses.c.questions.q2).toBeUndefined();
    expect(m2.courses.c.questions.q1.seen).toBe(2);
  });
  it('round-trips export/import without sync code', () => {
    const a = defaultState();
    a.settings.syncCode = 'b'.repeat(32);
    a.courses.x = emptyCourse();
    a.courses.x.cards.k = { ease: 2.5, interval: 3, due: 1, reps: 1, lapses: 0, updatedAt: 3 };
    const txt = exportJson(a);
    expect(txt).not.toContain('b'.repeat(32));
    const back = importJson(txt, defaultState());
    expect(back.courses.x.cards.k.interval).toBe(3);
  });
  it('srs schedules increasing intervals', () => {
    let c = review(undefined, 2, 0);
    expect(c.interval).toBe(1);
    c = review(c, 2, 0);
    expect(c.interval).toBe(3);
    c = review(c, 2, 0);
    expect(c.interval).toBeGreaterThan(3);
    expect(review(c, 0, 0).interval).toBe(0);
  });
});

describe('rng', () => {
  it('is deterministic', () => {
    const a = makeRng(42);
    const b = makeRng(42);
    expect(a.next()).toBe(b.next());
  });
});

import { normalizeDisplayMath } from '../src/platform/components/Markdown';
describe('markdown display math normalisation', () => {
  it('moves single-line $$ blocks onto their own lines', () => {
    expect(normalizeDisplayMath('so $$x=1$$ done')).toBe('so\n\n$$\nx=1\n$$\n\ndone');
    expect(normalizeDisplayMath('$$a$$')).toBe('$$\na\n$$');
    expect(normalizeDisplayMath('- item $$b$$')).toBe('- item\n\n$$\nb\n$$');
    expect(normalizeDisplayMath('inline $x$ only')).toBe('inline $x$ only');
  });
});
