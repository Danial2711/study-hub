import { Link } from 'react-router';
import { useCourse } from '../CourseContext';
import { useCourseProgress } from '../state/store';
import { courseCards, courseQuestions, topicLabel } from '../quiz';
import { isDue, isLearned } from '../state/srs';
import { Markdown } from '../components/Markdown';
import { todayKey, type CourseProgress } from '../state/model';
import type { Course } from '../types';

export function groupMastery(course: Course, prog: CourseProgress, groupId: string) {
  const qs = courseQuestions(course).filter((q) => q.examGroup === groupId);
  const cards = courseCards(course).filter((c) => c.examGroup === groupId);
  const ex = course.exercises.filter((e) => e.examGroup === groupId);
  const qOk = qs.filter((q) => prog.questions[q.id]?.lastCorrect).length;
  const cOk = cards.filter((c) => isLearned(prog.cards[c.id])).length;
  const eOk = ex.filter((e) => prog.exercises[e.id]?.status === 'solved').length;
  const parts = [qs.length ? qOk / qs.length : null, cards.length ? cOk / cards.length : null, ex.length ? eOk / ex.length : null].filter((x): x is number => x !== null);
  return {
    score: parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 0,
    qOk,
    qTotal: qs.length,
    cOk,
    cTotal: cards.length,
    eOk,
    eTotal: ex.length,
  };
}

export function Dashboard() {
  const course = useCourse();
  const prog = useCourseProgress(course.id);
  const now = Date.now();
  const cards = courseCards(course);
  const due = cards.filter((c) => isDue(prog.cards[c.id], now)).length;
  const fresh = cards.filter((c) => !prog.cards[c.id]).length;
  const exams = Object.values(prog.exams).sort((a, b) => b.at - a.at);
  const last = exams[0];
  const mistakes = Object.values(prog.mistakes).filter((m) => m.active).length;
  const today = todayKey();
  const upcoming = (course.schedule ?? []).filter((s) => s.date >= today).slice(0, 4);
  const streak = (() => {
    let n = 0;
    const d = new Date();
    for (;;) {
      if (prog.activity[todayKey(d)]?.n) n++;
      else if (n > 0 || todayKey(d) !== today) break;
      d.setDate(d.getDate() - 1);
      if (n > 365) break;
    }
    return n;
  })();
  const lastTopic = prog.lastPath?.path;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>
            {course.code}: {course.title}
          </h1>
          <p className="page-sub">
            {course.university} · {course.term}
          </p>
        </div>
        {lastTopic && lastTopic !== `/c/${course.id}` && (
          <Link className="btn primary" to={lastTopic}>
            Continue where you left off →
          </Link>
        )}
      </div>

      <div className="grid cols-4">
        <Link to="cards" className="card stat" style={{ color: 'inherit' }}>
          <span className="stat-value">{due}</span>
          <span className="stat-label">flashcards due ({fresh} new)</span>
        </Link>
        <Link to="quiz" className="card stat" style={{ color: 'inherit' }}>
          <span className="stat-value">{mistakes}</span>
          <span className="stat-label">mistakes to review</span>
        </Link>
        <Link to="mock" className="card stat" style={{ color: 'inherit' }}>
          <span className="stat-value">{last ? `${Math.round((100 * (last.auto.score + last.written.score)) / Math.max(1, last.auto.max + last.written.max))}%` : '—'}</span>
          <span className="stat-label">last mock exam</span>
        </Link>
        <div className="card stat">
          <span className="stat-value">{streak}</span>
          <span className="stat-label">day streak</span>
        </div>
      </div>

      <h2>Exam topics</h2>
      <div className="grid cols-2">
        {course.examGroups.map((g) => {
          const m = groupMastery(course, prog, g.id);
          const topics = course.topics.filter((t) => t.examGroup === g.id);
          return (
            <div key={g.id} className="card">
              <div className="row between">
                <span className="row" style={{ gap: 8 }}>
                  <span className={`chip ${g.examinable === false ? '' : 'accent'}`}>{g.label}</span>
                  <b>{g.title}</b>
                </span>
                <span className="small muted">{Math.round(m.score * 100)}%</span>
              </div>
              <div className="progress" style={{ margin: '10px 0' }}>
                <div style={{ width: `${m.score * 100}%` }} />
              </div>
              {g.description && <Markdown className="small muted">{g.description}</Markdown>}
              <div className="row small" style={{ marginTop: 6 }}>
                {topics.map((t) => (
                  <Link key={t.id} to={`learn/${t.id}`} className="chip">
                    {topicLabel(t)} {t.title}
                  </Link>
                ))}
              </div>
              <div className="small faint" style={{ marginTop: 8 }}>
                questions {m.qOk}/{m.qTotal} · cards {m.cOk}/{m.cTotal} learned · exercises {m.eOk}/{m.eTotal}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid cols-2" style={{ marginTop: 14 }}>
        {course.examInfo && (
          <div className="card">
            <h3>About the exam</h3>
            <Markdown className="small">{course.examInfo}</Markdown>
          </div>
        )}
        {upcoming.length > 0 && (
          <div className="card">
            <h3>Coming up</h3>
            <table className="data-table">
              <tbody>
                {upcoming.map((s, i) => (
                  <tr key={i}>
                    <td className="nowrap">{new Date(s.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                    <td>
                      <span className={`chip ${s.kind === 'exam' ? 'bad' : s.kind === 'lecture' ? 'accent' : ''}`}>{s.kind}</span>
                    </td>
                    <td>{s.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
