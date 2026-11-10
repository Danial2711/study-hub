import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useCourse } from '../CourseContext';
import { useCourseProgress } from '../state/store';
import { setExerciseStatus } from '../state/actions';
import { groupById, topicLabel } from '../quiz';
import { Markdown } from '../components/Markdown';
import type { Exercise } from '../types';

const TIER: Record<string, { label: string; cls: string }> = {
  core: { label: 'core', cls: 'accent' },
  extra: { label: 'extra practice', cls: '' },
  star: { label: '⋆ advanced', cls: 'warn' },
};

export function Exercises() {
  const course = useCourse();
  const prog = useCourseProgress(course.id);
  const [params, setParams] = useSearchParams();
  const tutorial = params.get('tutorial');
  const [group, setGroup] = useState('all');
  const [category, setCategory] = useState(params.get('category') ?? 'all');
  const byTopic = course.exerciseUnits === 'topic';
  const unitLabel = (t: number) => {
    const topic = byTopic ? course.topics.find((x) => x.lecture === t) : undefined;
    return topic ? `${topicLabel(topic)} ${topic.title}` : `Tutorial ${t}`;
  };
  const [status, setStatus] = useState<'all' | 'todo' | 'solved' | 'review'>('all');
  const tutorials = [...new Set(course.exercises.map((e) => e.tutorial).filter((x): x is number => x !== undefined))].sort((a, b) => a - b);
  const list = course.exercises.filter((e) => {
    if (tutorial && String(e.tutorial) !== tutorial) return false;
    if (group !== 'all' && e.examGroup !== group) return false;
    if (category !== 'all' && e.category !== category) return false;
    const st = prog.exercises[e.id]?.status ?? 'none';
    if (status === 'todo' && st === 'solved') return false;
    if (status === 'solved' && st !== 'solved') return false;
    if (status === 'review' && st !== 'review') return false;
    return true;
  });
  const solved = course.exercises.filter((e) => prog.exercises[e.id]?.status === 'solved').length;
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Exercises</h1>
          <p className="page-sub">
            Exam-style problems with hints and full worked solutions. {solved}/{course.exercises.length} solved.
          </p>
        </div>
      </div>
      <div className="row" style={{ marginBottom: 14 }}>
        <select
          value={tutorial ?? ''}
          onChange={(e) => {
            const p = new URLSearchParams(params);
            if (e.target.value) p.set('tutorial', e.target.value);
            else p.delete('tutorial');
            setParams(p, { replace: true });
          }}
        >
          <option value="">{byTopic ? 'All topics' : 'All tutorials'}</option>
          {tutorials.map((t) => (
            <option key={t} value={t}>
              {unitLabel(t)}
            </option>
          ))}
        </select>
        <select value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="all">All exam topics</option>
          {course.examGroups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}: {g.title}
            </option>
          ))}
        </select>
        {course.exerciseCategories && (
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All question types</option>
            {course.exerciseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        )}
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="all">Any status</option>
          <option value="todo">Not solved</option>
          <option value="solved">Solved</option>
          <option value="review">Needs review</option>
        </select>
        <span className="small muted">{list.length} shown</span>
      </div>
      <div className="stack">
        {list.map((e) => (
          <ExerciseCard key={e.id} e={e} />
        ))}
        {list.length === 0 && <div className="card empty">No exercises match the filters.</div>}
      </div>
    </>
  );
}

function ExerciseCard({ e }: { e: Exercise }) {
  const course = useCourse();
  const prog = useCourseProgress(course.id);
  const st = prog.exercises[e.id]?.status ?? 'none';
  const [hints, setHints] = useState(0);
  const [sol, setSol] = useState(false);
  const g = groupById(course, e.examGroup);
  const cat = course.exerciseCategories?.find((c) => c.id === e.category);
  return (
    <div className="card" id={`ex-${e.id}`}>
      <div className="row between" style={{ marginBottom: 6 }}>
        <div className="row" style={{ gap: 6 }}>
          <span className="mono small faint">{e.id}</span>
          <b>{e.title}</b>
        </div>
        <div className="row" style={{ gap: 6 }}>
          {cat && <span className="chip" title={cat.description}>{cat.label}</span>}
          {g && <span className="chip accent">{g.label}</span>}
          <span className={`chip ${TIER[e.tier].cls}`}>{TIER[e.tier].label}</span>
          {st === 'solved' && <span className="chip good">solved</span>}
          {st === 'review' && <span className="chip bad">review</span>}
        </div>
      </div>
      <Markdown>{e.prompt}</Markdown>
      {e.ref && <div className="small faint" style={{ marginTop: 4 }}>{e.ref}</div>}
      {e.hints?.slice(0, hints).map((h, i) => (
        <div key={i} className="callout small">
          <b>Hint {i + 1}.</b> <Markdown inline>{h}</Markdown>
        </div>
      ))}
      <div className="row" style={{ marginTop: 10 }}>
        {e.hints && hints < e.hints.length && (
          <button className="btn sm" onClick={() => setHints(hints + 1)}>
            Show hint {hints + 1}/{e.hints.length}
          </button>
        )}
        <button className="btn sm" onClick={() => setSol(!sol)}>
          {sol ? 'Hide solution' : 'Show solution'}
        </button>
        <span style={{ flex: 1 }} />
        <button className={`btn sm ${st === 'solved' ? 'primary' : ''}`} onClick={() => setExerciseStatus(course.id, e.id, st === 'solved' ? 'none' : 'solved')}>
          ✓ Solved
        </button>
        <button className={`btn sm ${st === 'review' ? 'danger' : ''}`} onClick={() => setExerciseStatus(course.id, e.id, st === 'review' ? 'none' : 'review')}>
          ↻ Needs review
        </button>
      </div>
      {sol && (
        <div className="feedback" style={{ marginTop: 12 }}>
          <div className="feedback-title" style={{ color: 'var(--accent)' }}>
            Worked solution
          </div>
          <Markdown>{e.solution}</Markdown>
        </div>
      )}
    </div>
  );
}
