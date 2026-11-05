/**
 * Course template — copy this folder to src/courses/<your-id>/ and register it
 * in src/platform/registry.ts. Everything here is plain data; see
 * src/platform/types.ts for all available fields.
 */
import type { Course } from '../../platform/types';

const md = String.raw;

const course: Course = {
  id: 'template',
  code: 'XX000',
  title: 'Course template',
  university: 'Your university',
  term: 'Term',
  description: 'Replace this with a one-line description.',
  examGroups: [
    { id: 'G1', label: 'G1', title: 'First exam topic', description: 'What this exam topic covers.' },
    { id: 'G2', label: 'G2', title: 'Second exam topic' },
  ],
  topics: [
    {
      id: 'intro',
      lecture: 1,
      examGroup: 'G1',
      title: 'Introduction',
      summary: md`A one-paragraph summary. Markdown and LaTeX like $E(X)=\sum_x x\,p(x)$ work everywhere.`,
      sections: [
        {
          id: 'first',
          title: 'A first concept',
          kind: 'definition',
          body: md`Explain the concept. Tables, lists and display math are supported:
$$P(A\mid B)=\frac{P(A\cap B)}{P(B)}$$`,
          formulas: [
            {
              id: 'f1',
              name: 'Example formula',
              tex: md`a^2+b^2=c^2`,
              symbols: [{ sym: 'c', meaning: 'hypotenuse' }],
              intuition: 'Why the formula makes sense.',
            },
          ],
          // Any shared visualization id from src/shared/viz/registry.ts can be embedded:
          viz: [{ id: 'distribution', props: { kind: 'binomial' } }],
          examples: [{ title: 'Worked example', problem: 'State a problem…', solution: 'Solve it step by step…' }],
        },
      ],
      flashcards: [{ id: 'intro-c1', front: 'Question side', back: 'Answer side' }],
      quiz: [
        {
          id: 'intro-q1',
          type: 'mcq',
          prompt: 'Which option is correct?',
          options: ['this one', 'not this one'],
          answer: 0,
          explanation: 'Explain why.',
        },
        { id: 'intro-q2', type: 'numeric', prompt: 'What is $1/4$ as a decimal?', answer: 0.25, explanation: '$1/4=0.25$.' },
      ],
    },
  ],
  exercises: [
    {
      id: '1.1',
      title: 'First exercise',
      tutorial: 1,
      examGroup: 'G1',
      topicId: 'intro',
      tier: 'core',
      prompt: 'Problem statement…',
      hints: ['A gentle hint.'],
      solution: 'Full worked solution…',
      rubric: ['Set-up', 'Computation', 'Result'],
    },
  ],
  mockExam: { minutes: [60, 90], autoPerGroup: 1, writtenPerGroup: 1 },
};

export default course;
