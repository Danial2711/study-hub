import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useCourse } from '../CourseContext';
import { useCourseProgress } from '../state/store';
import { courseQuestions, grade, groupById, topicById, type Response } from '../quiz';
import { recordAnswer } from '../state/actions';
import { QuestionView } from '../components/QuestionView';
import { Markdown } from '../components/Markdown';
import { makeRng } from '../../shared/math/random';
import type { Course, QuizQuestion } from '../types';
import type { CourseProgress } from '../state/model';

type Source = 'all' | 'mistakes' | 'unseen' | 'weak';

export function buildQuestionSet(course: Course, prog: CourseProgress, opts: { groups: Set<string>; topics?: Set<string>; n: number; source: Source; generated: boolean; seed?: number }): QuizQuestion[] {
  const rng = makeRng(opts.seed);
  let bank = courseQuestions(course).filter((q) => (opts.topics?.size ? opts.topics.has(q.topicId!) : opts.groups.has(q.examGroup!)));
  if (opts.source === 'mistakes') bank = bank.filter((q) => prog.mistakes[q.id]?.active);
  if (opts.source === 'unseen') bank = bank.filter((q) => !prog.questions[q.id]);
  if (opts.source === 'weak') bank = bank.filter((q) => { const s = prog.questions[q.id]; return !s || s.correct / s.seen < 0.7; });
  let out = rng.shuffle(bank);
  if (opts.generated && opts.source === 'all') {
    const gens = (course.generators ?? []).filter((g) => (opts.topics?.size ? opts.topics.has(g.topicId ?? '') : opts.groups.has(g.examGroup)));
    const k = Math.min(gens.length * 2, Math.ceil(opts.n / 3));
    const genQs = Array.from({ length: k }, () => {
      const g = rng.pick(gens);
      const q = g.generate(makeRng(Math.floor(rng.next() * 2 ** 31)));
      return { ...q, id: `gen:${g.id}:${Math.floor(rng.next() * 1e9)}`, examGroup: g.examGroup, topicId: g.topicId };
    });
    out = rng.shuffle([...out.slice(0, opts.n - genQs.length), ...genQs]);
  }
  return out.slice(0, opts.n);
}

export function Quiz() {
  const course = useCourse();
  const prog = useCourseProgress(course.id);
  const [params] = useSearchParams();
  const topicParam = params.get('topic');
  const [groups, setGroups] = useState<Set<string>>(new Set(course.examGroups.filter((g) => g.examinable !== false).map((g) => g.id)));
  const [topics, setTopics] = useState<Set<string>>(new Set(topicParam ? [topicParam] : []));
  const [n, setN] = useState(10);
  const [source, setSource] = useState<Source>('all');
  const [generated, setGenerated] = useState(true);
  const [run, setRun] = useState<QuizQuestion[] | null>(null);
  const mistakes = Object.values(prog.mistakes).filter((m) => m.active).length;

  if (run) return <Runner key={run.map((q) => q.id).join()} questions={run} onExit={() => setRun(null)} onRetry={(qs) => setRun(qs)} />;

  const preview = buildQuestionSet(course, prog, { groups, topics, n: 1000, source, generated: false });
  const toggle = (s: Set<string>, v: string) => {
    const x = new Set(s);
    if (x.has(v)) x.delete(v);
    else x.add(v);
    return x;
  };
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Practice quiz</h1>
          <p className="page-sub">Immediate feedback with step-by-step explanations. Wrong answers are collected for later review.</p>
        </div>
      </div>
      <div className="card">
        <h3>Topics</h3>
        {topics.size === 0 ? (
          <div className="row" style={{ gap: 6 }}>
            {course.examGroups.map((g) => (
              <button key={g.id} className={`chip ${groups.has(g.id) ? 'on' : ''}`} onClick={() => setGroups(toggle(groups, g.id))}>
                {g.label} {g.title}
              </button>
            ))}
          </div>
        ) : (
          <div className="row" style={{ gap: 6 }}>
            {[...topics].map((t) => (
              <span key={t} className="chip accent">
                L{topicById(course, t)?.lecture} {topicById(course, t)?.title}
              </span>
            ))}
            <button className="btn sm ghost" onClick={() => setTopics(new Set())}>
              choose exam topics instead
            </button>
          </div>
        )}
        <details className="collapse" style={{ marginTop: 10 }}>
          <summary>…or pick individual lectures</summary>
          <div className="collapse-body row" style={{ gap: 6 }}>
            {course.topics.map((t) => (
              <button key={t.id} className={`chip ${topics.has(t.id) ? 'on' : ''}`} onClick={() => setTopics(toggle(topics, t.id))}>
                L{t.lecture} {t.title}
              </button>
            ))}
          </div>
        </details>
        <h3>Questions</h3>
        <div className="row">
          <select value={source} onChange={(e) => setSource(e.target.value as Source)}>
            <option value="all">All questions</option>
            <option value="mistakes">My mistakes ({mistakes})</option>
            <option value="unseen">Not answered yet</option>
            <option value="weak">Weak (&lt; 70% correct)</option>
          </select>
          <label className="row small" style={{ gap: 6 }}>
            how many
            <input type="number" min={1} max={100} value={n} onChange={(e) => setN(Math.max(1, +e.target.value))} style={{ width: 70 }} />
          </label>
          {(course.generators?.length ?? 0) > 0 && source === 'all' && (
            <label className="row small" style={{ gap: 6 }}>
              <input type="checkbox" checked={generated} onChange={(e) => setGenerated(e.target.checked)} /> include randomly generated problems
            </label>
          )}
        </div>
        <div className="row between" style={{ marginTop: 16 }}>
          <span className="small muted">{preview.length} matching questions in the bank</span>
          <button
            className="btn primary lg"
            disabled={preview.length === 0 && !(generated && source === 'all')}
            onClick={() => setRun(buildQuestionSet(course, prog, { groups, topics, n, source, generated }))}
          >
            Start quiz
          </button>
        </div>
      </div>
    </>
  );
}

function Runner({ questions, onExit, onRetry }: { questions: QuizQuestion[]; onExit: () => void; onRetry: (qs: QuizQuestion[]) => void }) {
  const course = useCourse();
  const [i, setI] = useState(0);
  const [resp, setResp] = useState<Record<number, Response>>({});
  const [shown, setShown] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);
  const q = questions[i];
  const submit = () => {
    setShown((s) => ({ ...s, [i]: true }));
    recordAnswer(course.id, q, grade(q, resp[i]));
  };
  const results = questions.map((qq, k) => ({ q: qq, ok: !!shown[k] && grade(qq, resp[k]) }));
  const score = results.filter((r) => r.ok).length;

  if (finished || !q)
    return (
      <>
        <div className="page-head">
          <div>
            <h1>Quiz results</h1>
            <p className="page-sub">
              {score} / {questions.length} correct ({Math.round((100 * score) / Math.max(1, questions.length))}%)
            </p>
          </div>
          <div className="row">
            {results.some((r) => !r.ok) && (
              <button className="btn" onClick={() => onRetry(results.filter((r) => !r.ok).map((r) => r.q))}>
                Retry wrong ones
              </button>
            )}
            <button className="btn primary" onClick={onExit}>
              New quiz
            </button>
          </div>
        </div>
        <div className="stack">
          {results.map((r, k) => (
            <details key={k} className="card tight">
              <summary className="row" style={{ cursor: 'pointer' }}>
                <span className={`chip ${r.ok ? 'good' : 'bad'}`}>{r.ok ? '✓' : '✗'}</span>
                <Markdown inline className="small">{r.q.prompt.split('\n')[0].slice(0, 140)}</Markdown>
              </summary>
              <div style={{ marginTop: 10 }}>
                <QuestionView q={r.q} response={resp[k]} onChange={() => {}} revealed />
              </div>
            </details>
          ))}
        </div>
      </>
    );

  const g = groupById(course, q.examGroup ?? '');
  const t = q.topicId ? topicById(course, q.topicId) : undefined;
  return (
    <>
      <div className="row between" style={{ marginBottom: 10 }}>
        <div className="q-nav">
          {questions.map((_, k) => (
            <button key={k} className={`${k === i ? 'current' : ''} ${shown[k] ? (grade(questions[k], resp[k]) ? 'good' : 'bad') : ''}`} onClick={() => setI(k)}>
              {k + 1}
            </button>
          ))}
        </div>
        <button className="btn ghost sm" onClick={() => setFinished(true)}>
          Finish
        </button>
      </div>
      <QuestionView
        q={q}
        response={resp[i]}
        onChange={(r) => setResp((s) => ({ ...s, [i]: r }))}
        revealed={!!shown[i]}
        onSubmit={submit}
        meta={
          <>
            <span className="chip">
              {i + 1} / {questions.length}
            </span>
            {g && <span className="chip accent">{g.label}</span>}
            {t && <span className="chip">L{t.lecture} {t.title}</span>}
            {q.id.startsWith('gen:') && <span className="chip warn">generated</span>}
          </>
        }
      />
      {shown[i] && (
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
          {i + 1 < questions.length ? (
            <button className="btn primary" onClick={() => setI(i + 1)}>
              Next question →
            </button>
          ) : (
            <button className="btn primary" onClick={() => setFinished(true)}>
              See results
            </button>
          )}
        </div>
      )}
    </>
  );
}
