import { createContext, useContext } from 'react';
import type { Course } from './types';

export const CourseContext = createContext<Course | null>(null);

export function useCourse(): Course {
  const c = useContext(CourseContext);
  if (!c) throw new Error('useCourse outside of a course');
  return c;
}
