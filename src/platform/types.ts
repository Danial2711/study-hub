/**
 * Course content model. Platform code only ever depends on these types —
 * never on a concrete course. A course is plain data + optional components.
 */
import type { ComponentType, LazyExoticComponent } from 'react';
import type { Rng } from '../shared/math/random';

/** Markdown with inline `$…$` and display `$$…$$` LaTeX. */
export type Md = string;

/** A group the exam is organised by (e.g. "Q1", "Midterm", "Chapter 3"). */
export interface ExamGroup {
  id: string;
  /** Short chip label, e.g. "Q1". */
  label: string;
  title: string;
  description?: Md;
  /** false → not part of the exam (excluded from mock exams by default). */
  examinable?: boolean;
}

export interface FormulaSymbol {
  sym: string; // LaTeX (no dollars)
  meaning: Md;
}

export interface Formula {
  id: string;
  name: string;
  /** LaTeX, display mode, no surrounding dollars. */
  tex: string;
  symbols?: FormulaSymbol[];
  intuition?: Md;
  /** When does it hold / when to use it. */
  conditions?: Md;
  pitfalls?: Md;
}

export interface VizRef {
  id: string;
  props?: Record<string, unknown>;
  caption?: Md;
}

export interface WorkedExample {
  title?: string;
  problem: Md;
  solution: Md;
}

export type SectionKind = 'concept' | 'definition' | 'theorem' | 'example' | 'summary';

export interface Section {
  id: string;
  title: string;
  kind?: SectionKind;
  body: Md;
  formulas?: Formula[];
  viz?: VizRef[];
  examples?: WorkedExample[];
  /** Short proof idea, collapsible. */
  proof?: Md;
}

export interface Flashcard {
  id: string;
  front: Md;
  back: Md;
  tags?: string[];
}

interface QuestionBase {
  id: string;
  prompt: Md;
  /** Step-by-step explanation shown after answering. */
  explanation: Md;
  difficulty?: 1 | 2 | 3;
  /** Defaults to the containing topic's group. */
  examGroup?: string;
  /** Filled in by the platform when the bank is built. */
  topicId?: string;
}

export interface McqQuestion extends QuestionBase {
  type: 'mcq';
  options: Md[];
  answer: number;
}
export interface MultiQuestion extends QuestionBase {
  type: 'multi';
  options: Md[];
  answer: number[];
}
export interface TrueFalseQuestion extends QuestionBase {
  type: 'truefalse';
  answer: boolean;
}
export interface NumericQuestion extends QuestionBase {
  type: 'numeric';
  answer: number;
  /** Absolute tolerance (default: 1e-3 relative-or-absolute). */
  tolerance?: number;
  /** Hint about the expected format, e.g. "as a decimal, 3 places". */
  format?: string;
}

export type QuizQuestion = McqQuestion | MultiQuestion | TrueFalseQuestion | NumericQuestion;

export type ExerciseTier = 'core' | 'extra' | 'star';

export interface Exercise {
  id: string;
  title: string;
  /** Tutorial / chapter number it belongs to. */
  tutorial?: number;
  examGroup: string;
  topicId?: string;
  /** Pointer to the official material, e.g. "cf. Tutorial 2.1". */
  ref?: string;
  tier: ExerciseTier;
  prompt: Md;
  hints?: Md[];
  solution: Md;
  /** Self-grading checklist used in mock exams (each item worth 1 point). */
  rubric?: string[];
}

export interface QuestionGenerator {
  id: string;
  title: string;
  examGroup: string;
  topicId?: string;
  generate(rng: Rng): QuizQuestion;
}

export interface Topic {
  id: string;
  /** Lecture / chapter number, used for ordering. */
  lecture?: number;
  examGroup: string;
  title: string;
  summary: Md;
  sections: Section[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export interface ScheduleItem {
  date: string; // ISO yyyy-mm-dd
  label: string;
  kind: 'lecture' | 'tutorial' | 'exam' | 'other';
}

export interface MockExamConfig {
  /** Selectable durations in minutes; first is the default. */
  minutes: number[];
  /** Auto-graded questions per examinable group. */
  autoPerGroup: number;
  /** Written problems per examinable group. */
  writtenPerGroup: number;
  instructions?: Md;
}

export type VizComponent = ComponentType<Record<string, unknown>>;
export type VizRegistry = Record<string, { title: string; component: LazyExoticComponent<VizComponent> | VizComponent }>;

export interface Course {
  id: string;
  code: string;
  title: string;
  university?: string;
  term?: string;
  description: Md;
  examGroups: ExamGroup[];
  topics: Topic[];
  exercises: Exercise[];
  generators?: QuestionGenerator[];
  /** Course-specific visualizations (merged over the shared registry). */
  viz?: VizRegistry;
  schedule?: ScheduleItem[];
  mockExam: MockExamConfig;
  /** Free-form notes about the exam shown on the dashboard. */
  examInfo?: Md;
}

/** Lightweight entry in the course registry; the full course is lazy-loaded. */
export interface CourseManifest {
  id: string;
  code: string;
  title: string;
  description: string;
  /** CSS colour used as the course accent. */
  color: string;
  load: () => Promise<{ default: Course }>;
}
