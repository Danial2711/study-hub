import { useCourse } from '../CourseContext';
import { useCourseProgress } from '../state/store';
import { courseCards, courseQuestions } from '../quiz';
import { isLearned } from '../state/srs';
import { todayKey } from '../state/model';
import { groupMastery } from './Dashboard';
import { ExamHistory } from './MockExam';
import { Chart } from '../../shared/viz/kit';

export function Progress() {
  const course = useCourse();
  const prog = useCourseProgress(course.id);
  const qs = courseQuestions(course);
  const cards = courseCards(course);
  const answered = qs.filter((q) => prog.questions[q.id]).length;
  const totalAnswers = Object.values(prog.questions).reduce((a, s) => a + s.seen, 0);
  const totalCorrect = Object.values(prog.questions).reduce((a, s) => a + s.correct, 0);
  const learned = cards.filter((c) => isLearned(prog.cards[c.id])).length;
  const history = Object.values(prog.exams).sort((a, b) => b.at - a.at);

  // 18-week activity heatmap
  const days: { key: string; n: number }[] = [];
  const d = new Date();
  d.setDate(d.getDate() - 7 * 18 + 1 - d.getDay());
  for (let i = 0; i < 7 * 18; i++) {
    const k = todayKey(d);
    days.push({ key: k, n: prog.activity[k]?.n ?? 0 });
    d.setDate(d.getDate() + 1);
  }
  const maxN = Math.max(1, ...days.map((x) => x.n));

  // Topic accuracy table
  const topicRows = course.topics.map((t) => {
    const st = t.quiz.map((q) => prog.questions[q.id]).filter(Boolean);
    const seen = st.reduce((a, s) => a + s!.seen, 0);
    const ok = st.reduce((a, s) => a + s!.correct, 0);
    const tc = cards.filter((c) => c.topicId === t.id);
    return { t, seen, acc: seen ? ok / seen : null, answered: st.length, cards: tc.length, learned: tc.filter((c) => isLearned(prog.cards[c.id])).length };
  });
  const examPts = [...history].reverse().map((h, i) => [i + 1, (h.auto.score + h.written.score) / Math.max(1, h.auto.max + h.written.max)] as [number, number]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Progress</h1>
          <p className="page-sub">Everything is stored locally and synced if you set up a sync code in Settings.</p>
        </div>
      </div>
      <div className="grid cols-4">
        <div className="card stat">
          <span className="stat-value">
            {answered}/{qs.length}
          </span>
          <span className="stat-label">questions attempted</span>
        </div>
        <div className="card stat">
          <span className="stat-value">{totalAnswers ? Math.round((100 * totalCorrect) / totalAnswers) : 0}%</span>
          <span className="stat-label">overall accuracy ({totalAnswers} answers)</span>
        </div>
        <div className="card stat">
          <span className="stat-value">
            {learned}/{cards.length}
          </span>
          <span className="stat-label">flashcards learned (interval ≥ 3 days)</span>
        </div>
        <div className="card stat">
          <span className="stat-value">{history.length}</span>
          <span className="stat-label">mock exams taken</span>
        </div>
      </div>

      <div className="card">
        <h3>Activity (last 18 weeks)</h3>
        <div className="heat">
          {days.map((x) => (
            <i key={x.key} title={`${x.key}: ${x.n}`} style={x.n ? { background: `color-mix(in srgb, var(--accent) ${20 + (80 * x.n) / maxN}%, transparent)` } : undefined} />
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Mastery by exam topic</h3>
        <div className="stack">
          {course.examGroups.map((g) => {
            const m = groupMastery(course, prog, g.id);
            return (
              <div key={g.id} className="row" style={{ gap: 12 }}>
                <span className="chip accent" style={{ width: 54, justifyContent: 'center' }}>
                  {g.label}
                </span>
                <span style={{ width: 240 }} className="small">
                  {g.title}
                </span>
                <div className="progress" style={{ flex: 1, minWidth: 100 }}>
                  <div style={{ width: `${m.score * 100}%` }} />
                </div>
                <span className="small mono" style={{ width: 44, textAlign: 'right' }}>
                  {Math.round(m.score * 100)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h3>By lecture</h3>
        <div className="scroll-x">
          <table className="data-table">
            <thead>
              <tr>
                <th>lecture</th>
                <th className="num">questions tried</th>
                <th className="num">accuracy</th>
                <th className="num">cards learned</th>
              </tr>
            </thead>
            <tbody>
              {topicRows.map((r) => (
                <tr key={r.t.id}>
                  <td>
                    L{r.t.lecture} {r.t.title}
                  </td>
                  <td className="num">
                    {r.answered}/{r.t.quiz.length}
                  </td>
                  <td className="num" style={{ color: r.acc !== null && r.acc < 0.6 ? 'var(--bad)' : undefined }}>
                    {r.acc === null ? '—' : `${Math.round(r.acc * 100)}%`}
                  </td>
                  <td className="num">
                    {r.learned}/{r.cards}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {history.length > 0 && (
        <div className="card">
          <h3>Mock exams</h3>
          {examPts.length > 1 && (
            <Chart x={[1, examPts.length]} y={[0, 1]} height={180} xLabel="attempt" yFormat={(v) => `${Math.round(v * 100)}%`} xTicks={examPts.map((p) => p[0])}>
              {(sx, sy) => (
                <>
                  <path d={examPts.map((p, i) => `${i ? 'L' : 'M'}${sx(p[0])},${sy(p[1])}`).join('')} fill="none" stroke="var(--c1)" strokeWidth={2.5} />
                  {examPts.map((p) => (
                    <circle key={p[0]} cx={sx(p[0])} cy={sy(p[1])} r={4} fill="var(--c1)" />
                  ))}
                </>
              )}
            </Chart>
          )}
          <ExamHistory course={course} history={history} />
        </div>
      )}
    </>
  );
}
