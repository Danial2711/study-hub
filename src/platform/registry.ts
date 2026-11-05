/**
 * The list of courses on the platform. To add a course:
 *   1. copy src/courses/_template → src/courses/<id>
 *   2. fill in its data
 *   3. add one entry below.
 * Each course is code-split and only downloaded when opened.
 */
import type { CourseManifest } from './types';

export const COURSES: CourseManifest[] = [
  {
    id: 'iv111',
    code: 'IV111',
    title: 'Probability in Computer Science',
    description: 'Probability spaces, tail bounds, laws of large numbers, Markov chains, MDPs, entropy, coding and channel capacity.',
    color: '#4f5bd5',
    load: () => import('../courses/iv111'),
  },
];

export const findCourse = (id: string) => COURSES.find((c) => c.id === id);
