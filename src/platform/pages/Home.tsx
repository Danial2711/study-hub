import { Link } from 'react-router';
import { COURSES } from '../registry';
import { useAppState } from '../state/store';

export function Home() {
  const s = useAppState();
  return (
    <div className="main" style={{ margin: '0 auto' }}>
      <div className="page-head">
        <div>
          <h1>Your courses</h1>
          <p className="page-sub">Pick a course to study: lessons with interactive diagrams, spaced-repetition flashcards, practice quizzes and timed mock exams.</p>
        </div>
      </div>
      <div className="grid cols-2">
        {COURSES.map((c) => {
          const p = s.courses[c.id];
          const answered = p ? Object.values(p.questions).reduce((a, q) => a + q.seen, 0) : 0;
          const exams = p ? Object.keys(p.exams).length : 0;
          return (
            <Link key={c.id} to={`/c/${c.id}`} className="card course-card" style={{ ['--course-color' as string]: c.color }}>
              <span className="course-code">{c.code}</span>
              <h2 style={{ margin: 0 }}>{c.title}</h2>
              <p className="muted small" style={{ margin: 0 }}>
                {c.description}
              </p>
              <div className="row small faint" style={{ marginTop: 'auto' }}>
                {answered > 0 ? `${answered} answers · ${exams} mock exams` : 'Not started yet'}
                {p?.lastPath && <span>· continue →</span>}
              </div>
            </Link>
          );
        })}
        <div className="card flat" style={{ borderStyle: 'dashed' }}>
          <h3 className="mt0">Add another course</h3>
          <p className="small muted">
            Courses are plain data folders. Copy <code>src/courses/_template</code>, fill in topics, flashcards, questions and exercises, and register it in{' '}
            <code>src/platform/registry.ts</code>. See the README for details.
          </p>
        </div>
      </div>
    </div>
  );
}
