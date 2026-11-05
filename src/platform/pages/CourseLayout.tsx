import { useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet, useLocation, useParams } from 'react-router';
import { findCourse } from '../registry';
import { CourseContext } from '../CourseContext';
import type { Course } from '../types';
import { useCourseProgress } from '../state/store';
import { courseCards } from '../quiz';
import { isDue } from '../state/srs';
import { setLastPath } from '../state/actions';

const NAV = [
  { to: '', label: 'Dashboard', icon: '◎', end: true },
  { to: 'learn', label: 'Learn', icon: '📖' },
  { to: 'cards', label: 'Flashcards', icon: '🃏', badge: 'due' as const },
  { to: 'quiz', label: 'Practice quiz', icon: '✎', badge: 'mistakes' as const },
  { to: 'mock', label: 'Mock exam', icon: '⏱' },
  { to: 'exercises', label: 'Exercises', icon: '✍' },
  { to: 'formulas', label: 'Formula sheet', icon: 'ƒ' },
  { to: 'playground', label: 'Playground', icon: '◈' },
  { to: 'progress', label: 'Progress', icon: '▤' },
];

const loaded = new Map<string, Course>();

export function CourseLayout() {
  const { courseId = '' } = useParams();
  const manifest = findCourse(courseId);
  const [course, setCourse] = useState<Course | null>(loaded.get(courseId) ?? null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!manifest) return;
    if (loaded.has(courseId)) {
      setCourse(loaded.get(courseId)!);
      return;
    }
    let alive = true;
    manifest
      .load()
      .then((m) => {
        loaded.set(courseId, m.default);
        if (alive) setCourse(m.default);
      })
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [courseId, manifest]);

  if (!manifest) return <Navigate to="/" replace />;
  if (error) return <div className="main"><div className="callout bad">Could not load course: {error}</div></div>;
  if (!course) return <div className="main muted">Loading {manifest.code}…</div>;
  return (
    <CourseContext.Provider value={course}>
      <Shell course={course} />
    </CourseContext.Provider>
  );
}

function Shell({ course }: { course: Course }) {
  const prog = useCourseProgress(course.id);
  const loc = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
    const t = setTimeout(() => setLastPath(course.id, loc.pathname), 1500);
    return () => clearTimeout(t);
  }, [loc.pathname, course.id]);
  const now = Date.now();
  const due = courseCards(course).filter((c) => isDue(prog.cards[c.id], now)).length;
  const mistakes = Object.values(prog.mistakes).filter((m) => m.active).length;
  const wide = /\/(playground)$/.test(loc.pathname);
  return (
    <div className="course-shell">
      <nav className="sidebar" aria-label="Course sections">
        <div className="sidebar-title">
          {course.code} · {course.title}
        </div>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">{n.icon}</span>
            {n.label}
            {n.badge === 'due' && due > 0 && <span className="nav-badge">{due}</span>}
            {n.badge === 'mistakes' && mistakes > 0 && <span className="nav-badge" style={{ background: 'var(--bad)' }}>{mistakes}</span>}
          </NavLink>
        ))}
      </nav>
      <main className={`main ${wide ? 'wide' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
