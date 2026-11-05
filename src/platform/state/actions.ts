import type { QuizQuestion } from '../types';
import { bumpActivity, updateCourse } from './store';
import { review, type Grade } from './srs';
import type { ExamRecord, ExerciseState } from './model';

/** Generated questions are tracked per generator, not per random instance. */
export const statKey = (q: QuizQuestion) => (q.id.startsWith('gen:') ? q.id.split(':').slice(0, 2).join(':') : q.id);

export function recordAnswer(courseId: string, q: QuizQuestion, correct: boolean) {
  const now = Date.now();
  const key = statKey(q);
  updateCourse(courseId, (c) => {
    const s = c.questions[key] ?? { seen: 0, correct: 0, lastCorrect: false, updatedAt: now };
    c.questions[key] = { seen: s.seen + 1, correct: s.correct + (correct ? 1 : 0), lastCorrect: correct, updatedAt: now };
    if (!q.id.startsWith('gen:')) {
      if (!correct) c.mistakes[q.id] = { active: true, updatedAt: now };
      else if (c.mistakes[q.id]?.active) c.mistakes[q.id] = { active: false, updatedAt: now };
    }
    bumpActivity(c);
  });
}

export function reviewCard(courseId: string, cardId: string, grade: Grade) {
  updateCourse(courseId, (c) => {
    c.cards[cardId] = review(c.cards[cardId], grade);
    bumpActivity(c);
  });
}

export function setExerciseStatus(courseId: string, id: string, status: ExerciseState['status']) {
  updateCourse(courseId, (c) => {
    c.exercises[id] = { status, updatedAt: Date.now() };
    bumpActivity(c);
  });
}

export function markVisited(courseId: string, topicId: string) {
  updateCourse(courseId, (c) => {
    c.visited[topicId] = { at: Date.now(), updatedAt: Date.now() };
  });
}

export function setLastPath(courseId: string, path: string) {
  updateCourse(courseId, (c) => {
    if (c.lastPath?.path === path) return;
    c.lastPath = { path, updatedAt: Date.now() };
  });
}

export function saveExam(courseId: string, rec: ExamRecord) {
  updateCourse(courseId, (c) => {
    c.exams[rec.id] = rec;
    bumpActivity(c, 5);
  });
}

export function resetCourse(courseId: string) {
  updateCourse(courseId, (c) => {
    const now = Date.now();
    c.cards = {};
    c.questions = {};
    c.exercises = {};
    c.visited = {};
    c.exams = {};
    c.mistakes = {};
    c.activity = {};
    c.lastPath = undefined;
    c.resetAt = now;
  });
}
