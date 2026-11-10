import type { Course, Flashcard, Formula, QuizQuestion, Topic } from './types';

export type Response = number | number[] | boolean | string | undefined;

/**
 * Parse a user-typed numeric answer. Accepts decimals, fractions and simple
 * expressions: `3/8`, `1 - 0.2^3`, `2^-3`, `sqrt(2)/2`, `log2(3)`, `ln 2`, `e`, `pi`, `35%`.
 * Returns NaN on anything it can't parse.
 */
export function parseNumber(input: string): number {
  const src = input.trim().replace(/,/g, '.').replace(/\s+/g, '').replace(/−/g, '-').replace(/·|×/g, '*');
  if (!src) return NaN;
  let i = 0;
  const peek = () => src[i];
  const eat = (c: string) => (src[i] === c ? (i++, true) : false);
  const fns: Record<string, (x: number) => number> = {
    sqrt: Math.sqrt,
    ln: Math.log,
    log: Math.log10,
    log2: Math.log2,
    log10: Math.log10,
    exp: Math.exp,
  };
  function expr(): number {
    let v = term();
    for (;;) {
      if (eat('+')) v += term();
      else if (eat('-')) v -= term();
      else return v;
    }
  }
  function term(): number {
    let v = unary();
    for (;;) {
      if (eat('*')) v *= unary();
      else if (eat('/')) v /= unary();
      else return v;
    }
  }
  function unary(): number {
    if (eat('-')) return -unary();
    if (eat('+')) return unary();
    return power();
  }
  function power(): number {
    const b = postfix();
    if (eat('^')) return b ** unary();
    return b;
  }
  function postfix(): number {
    let v = atom();
    while (eat('%')) v /= 100;
    return v;
  }
  function atom(): number {
    if (eat('(')) {
      const v = expr();
      if (!eat(')')) throw new Error('paren');
      return v;
    }
    const m = /^(\d+\.?\d*(e[+-]?\d+)?|\.\d+(e[+-]?\d+)?)/i.exec(src.slice(i));
    if (m) {
      i += m[0].length;
      return parseFloat(m[0]);
    }
    const w = /^[a-z]+\d*/i.exec(src.slice(i));
    if (w) {
      const name = w[0].toLowerCase();
      i += w[0].length;
      if (name === 'pi') return Math.PI;
      if (name === 'e') return Math.E;
      const f = fns[name];
      if (f) return f(atom());
    }
    throw new Error(`unexpected ${peek()}`);
  }
  try {
    const v = expr();
    return i === src.length ? v : NaN;
  } catch {
    return NaN;
  }
}

export function isAnswered(q: QuizQuestion, r: Response): boolean {
  switch (q.type) {
    case 'mcq':
      return typeof r === 'number';
    case 'multi':
      return Array.isArray(r) && r.length > 0;
    case 'truefalse':
      return typeof r === 'boolean';
    case 'numeric':
      return typeof r === 'string' && r.trim() !== '';
  }
}

export function numericClose(q: { answer: number; tolerance?: number }, v: number): boolean {
  if (!Number.isFinite(v)) return false;
  const tol = q.tolerance ?? Math.max(1e-3, Math.abs(q.answer) * 5e-3);
  return Math.abs(v - q.answer) <= tol;
}

export function grade(q: QuizQuestion, r: Response): boolean {
  switch (q.type) {
    case 'mcq':
      return r === q.answer;
    case 'multi': {
      if (!Array.isArray(r)) return false;
      const a = [...q.answer].sort();
      const b = [...r].sort();
      return a.length === b.length && a.every((x, i) => x === b[i]);
    }
    case 'truefalse':
      return r === q.answer;
    case 'numeric':
      return typeof r === 'string' && numericClose(q, parseNumber(r));
  }
}

export function formatAnswer(q: QuizQuestion): string {
  switch (q.type) {
    case 'mcq':
      return q.options[q.answer];
    case 'multi':
      return q.answer.map((i) => q.options[i]).join('; ');
    case 'truefalse':
      return q.answer ? 'True' : 'False';
    case 'numeric':
      return `${+q.answer.toPrecision(6)}`;
  }
}

/* --------------------------------------------------------- course indices */

export interface CardRef extends Flashcard {
  topicId: string;
  examGroup: string;
}
export interface FormulaRef extends Formula {
  topicId: string;
  topicTitle: string;
  sectionTitle: string;
  examGroup: string;
}

const cache = new WeakMap<Course, { questions: QuizQuestion[]; cards: CardRef[]; formulas: FormulaRef[] }>();

function build(course: Course) {
  let c = cache.get(course);
  if (c) return c;
  const questions: QuizQuestion[] = [];
  const cards: CardRef[] = [];
  const formulas: FormulaRef[] = [];
  for (const t of course.topics) {
    for (const q of t.quiz) questions.push({ ...q, topicId: t.id, examGroup: q.examGroup ?? t.examGroup });
    for (const f of t.flashcards) cards.push({ ...f, topicId: t.id, examGroup: t.examGroup });
    for (const s of t.sections)
      for (const f of s.formulas ?? [])
        formulas.push({ ...f, topicId: t.id, topicTitle: t.title, sectionTitle: s.title, examGroup: t.examGroup });
  }
  c = { questions, cards, formulas };
  cache.set(course, c);
  return c;
}

export const courseQuestions = (course: Course) => build(course).questions;
export const courseCards = (course: Course) => build(course).cards;
export const courseFormulas = (course: Course) => build(course).formulas;

export const topicById = (course: Course, id: string): Topic | undefined => course.topics.find((t) => t.id === id);
export const groupById = (course: Course, id: string) => course.examGroups.find((g) => g.id === id);
export const examinableGroups = (course: Course) => course.examGroups.filter((g) => g.examinable !== false);

/** Short topic label, e.g. "L3" or a course-defined tag such as "G". */
export const topicLabel = (t: Topic | undefined): string => (t ? (t.tag ?? `L${t.lecture ?? ''}`) : '');
/** Longer kicker, e.g. "Lecture 3". */
export const topicKicker = (t: Topic | undefined): string => (t ? (t.tag ?? `Lecture ${t.lecture ?? ''}`) : '');
