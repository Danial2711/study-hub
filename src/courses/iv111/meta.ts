import type { ExamGroup, ScheduleItem } from '../../platform/types';

export const examGroups: ExamGroup[] = [
  { id: 'Q1', label: 'Q1', title: 'Probability space, random variable', description: 'Probability space, events, conditional probability, independence, random variables and distributions.' },
  { id: 'Q2', label: 'Q2', title: 'Markov and Chebyshev inequalities', description: 'Expectation, moments, variance and tail bounds.' },
  { id: 'Q3', label: 'Q3', title: 'Laws of large numbers', description: 'Moment generating functions, Chernoff bounds, weak & strong LLN, CLT.' },
  { id: 'Q4', label: 'Q4', title: 'Discrete-time Markov chains', description: 'Definitions, reachability, hitting times, classification, invariant distributions, ergodic theorem.' },
  { id: 'Q5', label: 'Q5', title: 'Markov decision processes', description: 'Rewards and payoffs, MDP definition, strategies, Bellman equations, solution techniques.' },
  { id: 'Q6', label: 'Q6', title: 'Kraft & McMillan, Huffman codes', description: 'Entropy, mutual information, codes, Kraft–McMillan, optimal codes, Huffman, compression.' },
  { id: 'Q7', label: 'Q7', title: 'Channel coding theorem', description: 'Noisy channels, capacity, code rates and the channel coding theorem.' },
  { id: 'NX', label: 'Bonus', title: 'Continuous-time Markov chains', description: 'Bonus lecture, **not part of the exam**.', examinable: false },
];

const L = (date: string, label: string): ScheduleItem => ({ date, label, kind: 'lecture' });
const T = (date: string, label: string): ScheduleItem => ({ date, label, kind: 'tutorial' });

export const schedule: ScheduleItem[] = [
  L('2026-09-16', '01 Basic definitions'),
  T('2026-09-17', 'T01 Sample spaces and events'),
  L('2026-09-23', '02 Random variables'),
  T('2026-09-24', 'T02 Events and conditional probability'),
  L('2026-09-30', '03 Expectation, Markov inequality'),
  T('2026-10-01', 'T03 Random variables and expected values'),
  L('2026-10-07', '04 Variance, Chebyshev inequality'),
  T('2026-10-08', 'T04 Markov and Chebyshev inequality'),
  L('2026-10-14', '05 Chernoff bounds, laws of large numbers'),
  T('2026-10-15', 'T05 Chebyshev and Chernoff bounds'),
  L('2026-10-21', '06 Stochastic processes, Markov chains'),
  T('2026-10-22', 'T06 DTMC'),
  L('2026-11-04', '07 Markov chain analysis'),
  T('2026-11-05', 'T07 MC analysis'),
  L('2026-11-11', '08 Markov decision processes'),
  T('2026-11-12', 'T08 MDP'),
  L('2026-11-18', '09 Information theory'),
  T('2026-11-19', 'T09 Entropy and mutual information'),
  L('2026-11-25', '10 Codes'),
  T('2026-11-26', 'T10 Kraft and McMillan theorems'),
  L('2026-12-02', '11 Data compression'),
  T('2026-12-03', 'T11 Codes'),
  L('2026-12-09', '12 Channel capacity'),
  T('2026-12-10', 'T12 Channel coding theorem'),
  L('2026-12-16', '13 CTMC (optional, not examined)'),
];

export const examInfo = `**Assessment:** written final exam (preliminary evaluation, see the Sample Exam in IS) followed by an oral exam.

**Exam questions:** Q1 probability space & random variables · Q2 Markov & Chebyshev inequalities · Q3 laws of large numbers · Q4 discrete-time Markov chains · Q5 Markov decision processes · Q6 Kraft & McMillan theorems, Huffman codes · Q7 channel coding theorem.

Attendance at tutorials is compulsory. Lecture 13 (CTMC) is a bonus and is not examined.`;
