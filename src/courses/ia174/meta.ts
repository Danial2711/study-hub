import type { ExamGroup, ExerciseCategory, ScheduleItem } from '../../platform/types';

export const examGroups: ExamGroup[] = [
  { id: 'S1', label: 'S1', title: 'Ciphers & perfect secrecy', description: 'Symmetric ciphers, Shannon perfect secrecy, one-time pad, the perfect-security attack game.' },
  { id: 'S2', label: 'S2', title: 'Semantic security, PRGs, stream ciphers', description: 'Adversaries, advantage, negligible functions, PRG security, stream ciphers, ChaCha.' },
  { id: 'S3', label: 'S3', title: 'Block ciphers & AES', description: 'Block ciphers as PRPs, PRP game, ECB, confusion/diffusion, DES, AES, GF(2⁸).' },
  { id: 'S4', label: 'S4', title: 'Modes & CPA security', description: 'CBC and CTR, CPA game, randomized and nonce-based encryption.' },
  { id: 'H', label: 'Hash', title: 'Hash functions', description: 'Preimage/collision resistance, birthday attack, Merkle–Damgård, Davies–Meyer, SHA-2, sponge/SHA-3, Merkle trees.' },
  { id: 'M', label: 'MAC', title: 'Message authentication codes', description: 'Existential forgery game, HMAC, CBC-MAC, ECBC, CMAC, one-time MACs, Carter–Wegman.' },
  { id: 'AE', label: 'AE', title: 'Authenticated encryption', description: 'Ciphertext integrity, CCA security, EtM vs MtE, AEAD.' },
  { id: 'G', label: 'Groups', title: 'Groups & number theory', description: 'Groups, notation, orders, Lagrange, ℤₙ and ℤₙ^×, φ, Euclid, CRT.' },
  { id: 'PK', label: 'RSA', title: 'Public-key encryption & RSA', description: 'PK encryption, trapdoor functions, RSA, attacks, PKCS#1, OAEP, hybrid encryption, PK semantic/CPA/CCA security.' },
  { id: 'DL', label: 'DL/ECC', title: 'Discrete log, Diffie–Hellman, ECC', description: 'Cyclic groups, discrete logarithm, DH and MITM, elliptic curves, curve choice.' },
  { id: 'DS', label: 'Sig', title: 'Digital signatures', description: 'Signature schemes, EF game, hashing, full-domain hash, RSA signatures, Schnorr, DSA/ECDSA.' },
  { id: 'ZK', label: 'ZK', title: 'Interactive proofs & zero knowledge', description: 'Challenge–response, interactive proof systems, HVZK and perfect ZK, Fiat–Shamir, Schnorr protocol, Σ-protocols.' },
];

export const exerciseCategories: ExerciseCategory[] = [
  { id: 'describe', label: 'Describe', description: 'Explain a concept, algorithm or attack from the lectures (exam question type 1).' },
  { id: 'flaw', label: 'Find the flaw', description: 'Break a given flawed construction (exam question type 2).' },
  { id: 'hw', label: 'HW-style', description: 'Questions on concepts behind the homeworks (exam question type 3).' },
  { id: 'proof', label: 'Security proof', description: 'Security reduction for a construction that was not in the lectures (exam question type 4).' },
];

const O = (date: string, label: string): ScheduleItem => ({ date, label, kind: 'other' });

/** Lectures are on Tuesdays 16:00 (S108); only the fixed homework dates are listed here. */
export const schedule: ScheduleItem[] = [
  O('2026-10-06', 'HW01 released'),
  O('2026-10-21', 'HW01 deadline'),
  O('2026-10-27', 'HW02 released'),
  O('2026-11-11', 'HW02 deadline'),
  O('2026-11-24', 'HW03 released'),
  O('2026-12-09', 'HW03 deadline'),
];

export const examInfo = `**Exam (150 min, 120 points), written:** 8 easier single-answer MCQs (20 pts) and 4 harder MCQs (20 pts) — wrong answers are penalised, blank ones are not — then four open questions of 20 points: **describe** a concept/algorithm/attack, **find the flaw** in a given scheme, a **HW question** about concepts from the three homeworks, and a **security proof** (a reduction for a construction not seen in the lectures).

**Grades:** A ≥ 110, B ≥ 95, C ≥ 86, D ≥ 73, E ≥ 60 points. Each homework gives up to 6 points: the first 2 are *hard* points (always counted), the rest *soft* points (counted only if exam + hard points ≥ 60). Non-zero points from at least two homeworks are required to sit the exam.

**What to learn:** the official exam guide marks every slide as must-know, understand or context — the badges on the lesson pages follow it. Expect definitions and attack games to be tested *in slightly modified settings*.

Lectures 08–12 currently follow last year's slides; they will be updated when the 2026 versions appear in IS.`;
