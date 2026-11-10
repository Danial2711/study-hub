import type { Course } from '../../platform/types';
import { examGroups, exerciseCategories, schedule, examInfo } from './meta';
import { topics } from './topics';
import { exercises } from './exercises';
import { generators } from './generators';

const course: Course = {
  id: 'ia174',
  code: 'IA174',
  title: 'Fundaments of Cryptography',
  university: 'Faculty of Informatics, Masaryk University',
  term: 'Autumn 2026',
  description: 'Perfect and semantic security, stream and block ciphers, modes, hash functions, MACs, authenticated encryption, RSA, discrete log, elliptic curves, signatures and zero-knowledge proofs.',
  examGroups,
  exerciseCategories,
  exerciseUnits: 'topic',
  topics,
  exercises,
  generators,
  schedule,
  examInfo,
  mockExam: {
    minutes: [150, 90, 60],
    autoPerGroup: 1,
    writtenPerGroup: 0,
    instructions:
      'Simulates the structure of the IA174 written exam: two multiple-choice parts with a **penalty for wrong answers** (leave a question blank when unsure) and four open questions, one of each type. The real penalty size is not published; here a wrong answer costs one third of the question’s points.',
    blueprint: [
      { kind: 'auto', id: 'A', title: 'MCQ (easier)', count: 8, points: 2.5, penalty: 2.5 / 3, difficulty: [1, 2], types: ['mcq'] },
      { kind: 'auto', id: 'B', title: 'MCQ (harder)', count: 4, points: 5, penalty: 5 / 3, difficulty: [3], types: ['mcq'] },
      { kind: 'written', id: 'C', title: 'Describe', count: 1, points: 20, category: 'describe' },
      { kind: 'written', id: 'D', title: 'Find the flaw', count: 1, points: 20, category: 'flaw' },
      { kind: 'written', id: 'E', title: 'HW question', count: 1, points: 20, category: 'hw' },
      { kind: 'written', id: 'F', title: 'Security proof', count: 1, points: 20, category: 'proof' },
    ],
    gradeScale: [
      { label: 'A', minPercent: (100 * 110) / 120 },
      { label: 'B', minPercent: (100 * 95) / 120 },
      { label: 'C', minPercent: (100 * 86) / 120 },
      { label: 'D', minPercent: (100 * 73) / 120 },
      { label: 'E', minPercent: (100 * 60) / 120 },
    ],
  },
};

export default course;
