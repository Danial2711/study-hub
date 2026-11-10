/**
 * Pure helpers for blueprint-based mock exams (see `MockExamConfig.blueprint`).
 * Kept free of React so they can be unit-tested.
 */
import type { Course, ExamPart, Exercise, GradeStep, QuizQuestion } from './types';
import type { Rng } from '../shared/math/random';
import { examinableGroups, grade, isAnswered, type Response } from './quiz';

/** Take items round-robin from per-group lists (group order shuffled) until `n` are taken. */
export function roundRobin<T>(lists: T[][], n: number, rng: Rng): T[] {
  const queues = rng.shuffle(lists.filter((l) => l.length).map((l) => [...l]));
  const out: T[] = [];
  while (out.length < n && queues.some((q) => q.length)) {
    for (const q of queues) {
      if (out.length >= n) break;
      const x = q.shift();
      if (x !== undefined) out.push(x);
    }
  }
  return out;
}

export interface BlueprintSelection {
  auto: QuizQuestion[];
  /** Part id for every auto question (same order). */
  autoPart: string[];
  written: string[];
  writtenPart: string[];
}

/**
 * Draw an exam following the blueprint.
 * `drawQuestions(groupId, part)` returns a shuffled candidate list for one group.
 */
export function selectBlueprint(
  course: Course,
  blueprint: ExamPart[],
  rng: Rng,
  drawQuestions: (groupId: string, part: Extract<ExamPart, { kind: 'auto' }>) => QuizQuestion[],
  includeAll = false,
): BlueprintSelection {
  const groups = includeAll ? course.examGroups : examinableGroups(course);
  const sel: BlueprintSelection = { auto: [], autoPart: [], written: [], writtenPart: [] };
  const usedQ = new Set<string>();
  const usedEx = new Set<string>();
  for (const part of blueprint) {
    if (part.kind === 'auto') {
      const lists = groups.map((g) => drawQuestions(g.id, part).filter((q) => !usedQ.has(q.id)));
      for (const q of roundRobin(lists, part.count, rng)) {
        usedQ.add(q.id);
        sel.auto.push(q);
        sel.autoPart.push(part.id);
      }
    } else {
      const ok = (e: Exercise) => !usedEx.has(e.id) && (!part.category || e.category === part.category) && groups.some((g) => g.id === e.examGroup);
      const pool = course.exercises.filter(ok);
      const lists = groups.map((g) => {
        const mine = rng.shuffle(pool.filter((e) => e.examGroup === g.id));
        // Prefer non-starred problems, but keep the starred ones as a fallback.
        return [...mine.filter((e) => e.tier !== 'star'), ...mine.filter((e) => e.tier === 'star')];
      });
      for (const e of roundRobin(lists, part.count, rng)) {
        usedEx.add(e.id);
        sel.written.push(e.id);
        sel.writtenPart.push(part.id);
      }
    }
  }
  return sel;
}

export interface PartScore {
  id: string;
  title: string;
  score: number;
  max: number;
}

/** Score of one auto-graded part: +points per correct, −penalty per wrong, 0 for blank; clamped at 0. */
export function scoreAutoPart(part: Extract<ExamPart, { kind: 'auto' }>, items: { q: QuizQuestion; r: Response }[]): PartScore {
  let score = 0;
  for (const { q, r } of items) {
    if (!isAnswered(q, r)) continue;
    score += grade(q, r) ? part.points : -(part.penalty ?? 0);
  }
  return { id: part.id, title: part.title, score: Math.max(0, score), max: items.length * part.points };
}

/** The best grade whose threshold is reached. */
export function gradeFor(scale: GradeStep[] | undefined, percent: number): string | undefined {
  if (!scale?.length) return undefined;
  const sorted = [...scale].sort((a, b) => b.minPercent - a.minPercent);
  return sorted.find((s) => percent >= s.minPercent - 1e-9)?.label ?? 'F';
}
