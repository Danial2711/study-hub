import { useEffect, useMemo, useState } from 'react';
import { useCourse } from '../CourseContext';
import { useAppState, useCourseProgress } from '../state/store';
import { examinableGroups, grade, groupById, type Response } from '../quiz';
import { recordAnswer, saveExam } from '../state/actions';
import { QuestionView } from '../components/QuestionView';
import { Markdown } from '../components/Markdown';
import { buildQuestionSet } from './Quiz';
import { makeRng } from '../../shared/math/random';
import type { Course, Exercise, QuizQuestion } from '../types';
import type { ExamRecord } from '../state/model';

const WRITTEN_POINTS = 4;

interface ExamSession {
  id: string;
  startedAt: number;
  minutes: number;
  auto: QuizQuestion[];
  written: string[]; // exercise ids
  responses: Record<number, Response>;
  phase: 'exam' | 'grading' | 'done';
  usedSeconds?: number;
  writtenScores: Record<string, number>;
  rubricChecks: Record<string, boolean[]>;
}

const storeKey = (courseId: string) => `studyhub.mock.${courseId}`;
function loadSession(courseId: string): ExamSession | null {
  try {
    const raw = localStorage.getItem(storeKey(courseId));
    return raw ? (JSON.parse(raw) as ExamSession) : null;
  } catch {
    return null;
  }
}
function saveSession(courseId: string, s: ExamSession | null) {
  try {
    if (s) localStorage.setItem(storeKey(courseId), JSON.stringify(s));
    else localStorage.removeItem(storeKey(courseId));
  } catch {
    /* ignore */
  }
}

function createExam(course: Course, prog: ReturnType<typeof useCourseProgress>, minutes: number, includeAll: boolean): ExamSession {
  const rng = makeRng();
  const groups = includeAll ? course.examGroups : examinableGroups(course);
  const auto: QuizQuestion[] = [];
  const written: string[] = [];
  for (const g of groups) {
    const qs = buildQuestionSet(course, prog, { groups: new Set([g.id]), n: course.mockExam.autoPerGroup, source: 'all', generated: true, seed: Math.floor(rng.next() * 2 ** 31) });
    auto.push(...qs);
    const ex = course.exercises.filter((e) => e.examGroup === g.id);
    const core = ex.filter((e) => e.tier !== 'star');
    written.push(...rng.shuffle(core.length ? core : ex).slice(0, course.mockExam.writtenPerGroup).map((e) => e.id));
  }
  return { id: `exam-${Date.now()}`, startedAt: Date.now(), minutes, auto, written, responses: {}, phase: 'exam', writtenScores: {}, rubricChecks: {} };
}

function useNow(active: boolean) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

export function MockExam() {
  const course = useCourse();
  const prog = useCourseProgress(course.id);
  const settings = useAppState().settings;
  const [session, setSessionState] = useState<ExamSession | null>(() => loadSession(course.id));
  const setSession = (s: ExamSession | null) => {
    setSessionState(s);
    saveSession(course.id, s);
  };
  const defaultMinutes = settings.mockMinutes ?? course.mockExam.minutes[0];
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [includeAll, setIncludeAll] = useState(false);
  const history = Object.values(prog.exams).sort((a, b) => b.at - a.at);

  if (session) return <ExamRun session={session} setSession={setSession} />;

  const groups = includeAll ? course.examGroups : examinableGroups(course);
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Mock exam</h1>
          <p className="page-sub">A timed exam simulation across all exam topics, with an auto-graded part and a written part you grade yourself.</p>
        </div>
      </div>
      <div className="card">
        {course.mockExam.instructions && <Markdown>{course.mockExam.instructions}</Markdown>}
        <ul className="small">
          <li>
            <b>Part A:</b> {groups.length * course.mockExam.autoPerGroup} auto-graded questions ({course.mockExam.autoPerGroup} per exam topic). No feedback until you submit.
          </li>
          <li>
            <b>Part B:</b> {groups.length * course.mockExam.writtenPerGroup} written problems ({WRITTEN_POINTS} points each). Solve them on paper; after submitting you reveal the worked solutions and grade yourself with a checklist.
          </li>
          <li>The exam is saved in this browser, so you can reload the page without losing it.</li>
        </ul>
        <div className="row" style={{ marginTop: 10 }}>
          <label className="field">
            Duration
            <select value={minutes} onChange={(e) => setMinutes(+e.target.value)}>
              {[...new Set([...course.mockExam.minutes, defaultMinutes, 30, 60, 120])].sort((a, b) => a - b).map((m) => (
                <option key={m} value={m}>
                  {m} minutes
                </option>
              ))}
              <option value={0}>untimed</option>
            </select>
          </label>
          {course.examGroups.some((g) => g.examinable === false) && (
            <label className="row small" style={{ gap: 6, marginTop: 18 }}>
              <input type="checkbox" checked={includeAll} onChange={(e) => setIncludeAll(e.target.checked)} /> include non-exam topics
            </label>
          )}
        </div>
        <div style={{ marginTop: 16 }}>
          <button className="btn primary lg" onClick={() => setSession(createExam(course, prog, minutes, includeAll))}>
            Start mock exam
          </button>
        </div>
      </div>
      {history.length > 0 && (
        <div className="card">
          <h3>History</h3>
          <ExamHistory course={course} history={history} />
        </div>
      )}
    </>
  );
}

export function ExamHistory({ course, history }: { course: Course; history: ExamRecord[] }) {
  const groups = course.examGroups.filter((g) => history.some((h) => h.byGroup[g.id]));
  return (
    <div className="scroll-x">
      <table className="data-table">
        <thead>
          <tr>
            <th>date</th>
            <th className="num">total</th>
            <th className="num">auto</th>
            <th className="num">written</th>
            {groups.map((g) => (
              <th key={g.id} className="num">
                {g.label}
              </th>
            ))}
            <th className="num">time</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => {
            const tot = h.auto.score + h.written.score;
            const max = h.auto.max + h.written.max;
            return (
              <tr key={h.id}>
                <td className="nowrap">{new Date(h.at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</td>
                <td className="num">
                  <b>{Math.round((100 * tot) / Math.max(1, max))}%</b>
                </td>
                <td className="num">
                  {fmt1(h.auto.score)}/{h.auto.max}
                </td>
                <td className="num">
                  {fmt1(h.written.score)}/{h.written.max}
                </td>
                {groups.map((g) => {
                  const s = h.byGroup[g.id];
                  return (
                    <td key={g.id} className="num" style={{ color: s && s.score / s.max < 0.5 ? 'var(--bad)' : undefined }}>
                      {s ? `${Math.round((100 * s.score) / Math.max(1, s.max))}%` : '—'}
                    </td>
                  );
                })}
                <td className="num">{Math.round(h.usedSeconds / 60)} min</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const fmt1 = (x: number) => String(Math.round(x * 10) / 10);

function ExamRun({ session, setSession }: { session: ExamSession; setSession: (s: ExamSession | null) => void }) {
  const course = useCourse();
  const now = useNow(session.phase === 'exam');
  const exById = useMemo(() => new Map(course.exercises.map((e) => [e.id, e])), [course]);
  const written = session.written.map((id) => exById.get(id)).filter((e): e is Exercise => !!e);
  const [tab, setTab] = useState<'auto' | 'written'>('auto');
  const [idx, setIdx] = useState(0);
  const elapsed = Math.floor((now - session.startedAt) / 1000);
  const remaining = session.minutes > 0 ? session.minutes * 60 - elapsed : Infinity;

  const submit = () => {
    const used = Math.floor((Date.now() - session.startedAt) / 1000);
    session.auto.forEach((q, i) => recordAnswer(course.id, q, grade(q, session.responses[i])));
    setSession({ ...session, phase: 'grading', usedSeconds: used });
    setTab('auto');
    window.scrollTo({ top: 0 });
  };
  useEffect(() => {
    if (session.phase === 'exam' && remaining <= 0) submit();
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const answered = session.auto.filter((_, i) => session.responses[i] !== undefined && session.responses[i] !== '').length;

  if (session.phase === 'exam') {
    const q = session.auto[idx];
    const mm = Math.floor(Math.abs(remaining) / 60);
    const ss = Math.abs(remaining) % 60;
    return (
      <>
        <div className="exam-bar">
          <div className="row between">
            <div className="row">
              <span className={`timer ${remaining < 300 ? 'low' : ''}`}>{Number.isFinite(remaining) ? `${mm}:${String(ss).padStart(2, '0')}` : `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`}</span>
              <div className="btn-group">
                <button className={tab === 'auto' ? 'on' : ''} onClick={() => setTab('auto')}>
                  Part A ({answered}/{session.auto.length})
                </button>
                <button className={tab === 'written' ? 'on' : ''} onClick={() => setTab('written')}>
                  Part B ({written.length})
                </button>
              </div>
            </div>
            <div className="row">
              <button
                className="btn ghost sm"
                onClick={() => {
                  if (confirm('Abandon this exam? It will not be saved.')) setSession(null);
                }}
              >
                Abandon
              </button>
              <button className="btn primary" onClick={() => confirm('Submit the exam now?') && submit()}>
                Submit exam
              </button>
            </div>
          </div>
        </div>
        {tab === 'auto' && q && (
          <>
            <div className="q-nav" style={{ marginBottom: 12 }}>
              {session.auto.map((_, k) => (
                <button key={k} className={`${k === idx ? 'current' : ''} ${session.responses[k] !== undefined && session.responses[k] !== '' ? 'answered' : ''}`} onClick={() => setIdx(k)}>
                  {k + 1}
                </button>
              ))}
            </div>
            <QuestionView
              q={q}
              response={session.responses[idx]}
              onChange={(r) => setSession({ ...session, responses: { ...session.responses, [idx]: r } })}
              revealed={false}
              meta={
                <>
                  <span className="chip">
                    A{idx + 1} / {session.auto.length}
                  </span>
                  <span className="chip accent">{groupById(course, q.examGroup ?? '')?.label}</span>
                </>
              }
            />
            <div className="row between" style={{ marginTop: 12 }}>
              <button className="btn" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>
                ← Previous
              </button>
              {idx + 1 < session.auto.length ? (
                <button className="btn primary" onClick={() => setIdx(idx + 1)}>
                  Next →
                </button>
              ) : (
                <button className="btn primary" onClick={() => setTab('written')}>
                  Go to Part B →
                </button>
              )}
            </div>
          </>
        )}
        {tab === 'written' && (
          <div className="stack">
            <div className="callout small">Solve these on paper. Solutions are revealed after you submit the exam.</div>
            {written.map((e, k) => (
              <div key={e.id} className="card">
                <div className="row" style={{ marginBottom: 6 }}>
                  <span className="chip">B{k + 1}</span>
                  <span className="chip accent">{groupById(course, e.examGroup)?.label}</span>
                  <b>{e.title}</b>
                  <span className="small faint">{WRITTEN_POINTS} points</span>
                </div>
                <Markdown>{e.prompt}</Markdown>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  // ---------------- grading / done
  const autoScore = session.auto.filter((q, i) => grade(q, session.responses[i])).length;
  const writtenScore = written.reduce((s, e) => s + (session.writtenScores[e.id] ?? 0), 0);
  const byGroup: Record<string, { score: number; max: number }> = {};
  session.auto.forEach((q, i) => {
    const g = q.examGroup ?? '?';
    byGroup[g] ??= { score: 0, max: 0 };
    byGroup[g].max += 1;
    if (grade(q, session.responses[i])) byGroup[g].score += 1;
  });
  written.forEach((e) => {
    byGroup[e.examGroup] ??= { score: 0, max: 0 };
    byGroup[e.examGroup].max += WRITTEN_POINTS;
    byGroup[e.examGroup].score += session.writtenScores[e.id] ?? 0;
  });
  const total = autoScore + writtenScore;
  const max = session.auto.length + written.length * WRITTEN_POINTS;
  const finish = () => {
    saveExam(course.id, {
      id: session.id,
      at: session.startedAt,
      minutes: session.minutes,
      usedSeconds: session.usedSeconds ?? 0,
      auto: { score: autoScore, max: session.auto.length },
      written: { score: writtenScore, max: written.length * WRITTEN_POINTS },
      byGroup,
      updatedAt: Date.now(),
    });
    setSession({ ...session, phase: 'done' });
  };
  const weak = Object.entries(byGroup)
    .filter(([, s]) => s.score / s.max < 0.6)
    .map(([g]) => groupById(course, g))
    .filter(Boolean);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{session.phase === 'done' ? 'Exam report' : 'Grade your exam'}</h1>
          <p className="page-sub">
            Part A: {autoScore}/{session.auto.length} · Part B: {fmt1(writtenScore)}/{written.length * WRITTEN_POINTS} · total {Math.round((100 * total) / Math.max(1, max))}% · time used {Math.round((session.usedSeconds ?? 0) / 60)} min
          </p>
        </div>
        <div className="row">
          {session.phase === 'grading' ? (
            <button className="btn primary" onClick={finish}>
              Save result
            </button>
          ) : (
            <button className="btn primary" onClick={() => setSession(null)}>
              Close
            </button>
          )}
        </div>
      </div>
      <div className="grid cols-4" style={{ marginBottom: 14 }}>
        {Object.entries(byGroup).map(([g, s]) => (
          <div key={g} className="card tight">
            <div className="row between">
              <span className="chip accent">{groupById(course, g)?.label ?? g}</span>
              <b>{Math.round((100 * s.score) / Math.max(1, s.max))}%</b>
            </div>
            <div className="small muted" style={{ marginTop: 4 }}>
              {groupById(course, g)?.title}
            </div>
            <div className="progress" style={{ marginTop: 6 }}>
              <div style={{ width: `${(100 * s.score) / Math.max(1, s.max)}%`, background: s.score / s.max < 0.6 ? 'var(--bad)' : undefined }} />
            </div>
          </div>
        ))}
      </div>
      {weak.length > 0 && (
        <div className="callout warn small">
          Review suggested: {weak.map((g) => `${g!.label} ${g!.title}`).join(', ')}. Use the practice quiz with the “Weak” filter or the flashcards for these topics.
        </div>
      )}
      <div className="row" style={{ margin: '14px 0' }}>
        <div className="btn-group">
          <button className={tab === 'auto' ? 'on' : ''} onClick={() => setTab('auto')}>
            Part A answers
          </button>
          <button className={tab === 'written' ? 'on' : ''} onClick={() => setTab('written')}>
            Part B self-grading
          </button>
        </div>
      </div>
      {tab === 'auto' && (
        <div className="stack">
          {session.auto.map((q, i) => (
            <QuestionView key={i} q={q} response={session.responses[i]} onChange={() => {}} revealed meta={<span className="chip">A{i + 1}</span>} />
          ))}
        </div>
      )}
      {tab === 'written' && (
        <div className="stack">
          {written.map((e, k) => {
            const rubric = e.rubric?.length ? e.rubric : ['Correct approach / model set up', 'Key computation carried out correctly', 'Correct final result', 'Clear justification'];
            const checks = session.rubricChecks[e.id] ?? rubric.map(() => false);
            const setChecks = (c: boolean[]) =>
              setSession({
                ...session,
                rubricChecks: { ...session.rubricChecks, [e.id]: c },
                writtenScores: { ...session.writtenScores, [e.id]: (WRITTEN_POINTS * c.filter(Boolean).length) / rubric.length },
              });
            return (
              <div key={e.id} className="card">
                <div className="row" style={{ marginBottom: 6 }}>
                  <span className="chip">B{k + 1}</span>
                  <b>{e.title}</b>
                  {e.ref && <span className="small faint">{e.ref}</span>}
                  <span className="chip accent" style={{ marginLeft: 'auto' }}>
                    {fmt1(session.writtenScores[e.id] ?? 0)} / {WRITTEN_POINTS}
                  </span>
                </div>
                <Markdown>{e.prompt}</Markdown>
                <details className="collapse" open={session.phase === 'grading'}>
                  <summary>Worked solution</summary>
                  <div className="collapse-body">
                    <Markdown>{e.solution}</Markdown>
                  </div>
                </details>
                <div className="formula-label">Self-grading checklist</div>
                {rubric.map((r, ri) => (
                  <label key={ri} className="rubric-item small">
                    <input
                      type="checkbox"
                      disabled={session.phase === 'done'}
                      checked={!!checks[ri]}
                      onChange={(ev) => setChecks(checks.map((c, j) => (j === ri ? ev.target.checked : c)))}
                    />
                    <Markdown inline>{r}</Markdown>
                  </label>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
