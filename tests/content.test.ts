/**
 * Content integrity for every registered course (and the template):
 * LaTeX renders, ids are unique, answers are valid, every exam group has material,
 * generators produce valid questions.
 */
import { describe, expect, it } from 'vitest';
import katex from 'katex';
import { COURSES } from '../src/platform/registry';
import type { Course, QuizQuestion } from '../src/platform/types';
import { courseQuestions, courseCards } from '../src/platform/quiz';
import { makeRng } from '../src/shared/math/random';
import { SHARED_VIZ } from '../src/shared/viz/registry';
import template from '../src/courses/_template';

/** Extract math segments from markdown: $$…$$ and $…$ (ignoring escaped \$). */
function mathSegments(src: string): { tex: string; display: boolean }[] {
  const out: { tex: string; display: boolean }[] = [];
  const s = src.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
  const re = /\$\$([\s\S]+?)\$\$|(?<!\\)\$((?:\\\$|[^$])+?)\$/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) out.push(m[1] !== undefined ? { tex: m[1], display: true } : { tex: m[2], display: false });
  return out;
}

function checkTex(where: string, src: string | undefined, errors: string[]) {
  if (!src) return;
  for (const seg of mathSegments(src)) {
    try {
      katex.renderToString(seg.tex, { displayMode: seg.display, throwOnError: true, strict: false });
    } catch (e) {
      errors.push(`${where}: ${(e as Error).message.slice(0, 160)} in «${seg.tex.slice(0, 80)}»`);
    }
  }
}

function checkRawTex(where: string, tex: string, errors: string[]) {
  try {
    katex.renderToString(tex, { displayMode: true, throwOnError: true, strict: false });
  } catch (e) {
    errors.push(`${where}: ${(e as Error).message.slice(0, 160)}`);
  }
}

function checkQuestion(where: string, q: QuizQuestion, errors: string[]) {
  checkTex(`${where}.prompt`, q.prompt, errors);
  checkTex(`${where}.explanation`, q.explanation, errors);
  if (q.type === 'mcq' || q.type === 'multi') {
    q.options.forEach((o, i) => checkTex(`${where}.opt${i}`, o, errors));
    const ans = q.type === 'mcq' ? [q.answer] : q.answer;
    if (!ans.length || ans.some((a) => !Number.isInteger(a) || a < 0 || a >= q.options.length)) errors.push(`${where}: invalid answer index`);
  }
  if (q.type === 'numeric' && !Number.isFinite(q.answer)) errors.push(`${where}: non-finite numeric answer`);
}

function validateCourse(course: Course): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const uniq = (kind: string, id: string) => {
    const k = `${kind}:${id}`;
    if (ids.has(k)) errors.push(`duplicate ${kind} id ${id}`);
    ids.add(k);
  };
  const groups = new Set(course.examGroups.map((g) => g.id));
  const viz = new Set([...Object.keys(SHARED_VIZ), ...Object.keys(course.viz ?? {})]);
  for (const t of course.topics) {
    uniq('topic', t.id);
    if (!groups.has(t.examGroup)) errors.push(`topic ${t.id}: unknown exam group ${t.examGroup}`);
    checkTex(`${t.id}.summary`, t.summary, errors);
    for (const s of t.sections) {
      uniq(`section/${t.id}`, s.id);
      checkTex(`${t.id}/${s.id}.body`, s.body, errors);
      checkTex(`${t.id}/${s.id}.proof`, s.proof, errors);
      for (const ex of s.examples ?? []) {
        checkTex(`${t.id}/${s.id}.example`, ex.problem, errors);
        checkTex(`${t.id}/${s.id}.example`, ex.solution, errors);
      }
      for (const f of s.formulas ?? []) {
        uniq('formula', f.id);
        checkRawTex(`${t.id}/${f.id}.tex`, f.tex, errors);
        for (const sym of f.symbols ?? []) {
          checkRawTex(`${t.id}/${f.id}.sym`, sym.sym, errors);
          checkTex(`${t.id}/${f.id}.sym`, sym.meaning, errors);
        }
        checkTex(`${t.id}/${f.id}`, `${f.intuition ?? ''} ${f.conditions ?? ''} ${f.pitfalls ?? ''}`, errors);
      }
      for (const v of s.viz ?? []) if (!viz.has(v.id)) errors.push(`${t.id}/${s.id}: unknown viz ${v.id}`);
    }
    for (const c of t.flashcards) {
      uniq('card', c.id);
      checkTex(`${c.id}.front`, c.front, errors);
      checkTex(`${c.id}.back`, c.back, errors);
    }
    for (const q of t.quiz) {
      uniq('question', q.id);
      checkQuestion(q.id, q, errors);
    }
  }
  for (const e of course.exercises) {
    uniq('exercise', e.id);
    if (!groups.has(e.examGroup)) errors.push(`exercise ${e.id}: unknown group`);
    if (e.topicId && !course.topics.some((t) => t.id === e.topicId)) errors.push(`exercise ${e.id}: unknown topic ${e.topicId}`);
    checkTex(`ex ${e.id}.prompt`, e.prompt, errors);
    checkTex(`ex ${e.id}.solution`, e.solution, errors);
    for (const h of e.hints ?? []) checkTex(`ex ${e.id}.hint`, h, errors);
  }
  for (const g of course.generators ?? []) {
    if (!groups.has(g.examGroup)) errors.push(`generator ${g.id}: unknown group`);
    for (let seed = 1; seed <= 25; seed++) checkQuestion(`gen ${g.id}#${seed}`, g.generate(makeRng(seed)), errors);
  }
  return errors;
}

describe('template course', () => {
  it('validates (adding a course needs no platform changes)', () => {
    expect(validateCourse(template)).toEqual([]);
    expect(courseQuestions(template).length).toBe(2);
    expect(courseCards(template)[0].examGroup).toBe('G1');
  });
});

describe.each(COURSES.map((c) => [c.id, c] as const))('course %s', (_id, manifest) => {
  it('loads and validates', async () => {
    const course = (await manifest.load()).default;
    expect(course.id).toBe(manifest.id);
    const errors = validateCourse(course);
    expect(errors).toEqual([]);
  });
  it('has material for every examinable group', async () => {
    const course = (await manifest.load()).default;
    for (const g of course.examGroups.filter((x) => x.examinable !== false)) {
      expect(courseQuestions(course).filter((q) => q.examGroup === g.id).length, `${g.id} questions`).toBeGreaterThanOrEqual(2);
      expect(course.exercises.filter((e) => e.examGroup === g.id).length, `${g.id} exercises`).toBeGreaterThanOrEqual(1);
    }
  });
});
