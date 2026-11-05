import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { useCourse } from '../CourseContext';
import { useCourseProgress } from '../state/store';
import { Markdown } from '../components/Markdown';
import { FormulaCard } from '../components/FormulaCard';
import { VizHost } from '../components/VizHost';
import { QuestionView } from '../components/QuestionView';
import { groupById, grade, type Response } from '../quiz';
import { markVisited, recordAnswer } from '../state/actions';
import type { QuizQuestion, Section, Topic } from '../types';

export function Learn() {
  const course = useCourse();
  const prog = useCourseProgress(course.id);
  const topics = [...course.topics].sort((a, b) => (a.lecture ?? 0) - (b.lecture ?? 0));
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Learn</h1>
          <p className="page-sub">One page per lecture: definitions, theorems, worked examples, formula cards with explanations and interactive diagrams.</p>
        </div>
      </div>
      <div className="stack">
        {course.examGroups.map((g) => {
          const ts = topics.filter((t) => t.examGroup === g.id);
          if (!ts.length) return null;
          return (
            <div key={g.id}>
              <h3 className="row" style={{ gap: 8 }}>
                <span className={`chip ${g.examinable === false ? '' : 'accent'}`}>{g.label}</span> {g.title}
              </h3>
              <div className="grid cols-2">
                {ts.map((t) => {
                  const answered = t.quiz.filter((q) => prog.questions[q.id]).length;
                  const right = t.quiz.filter((q) => prog.questions[q.id]?.lastCorrect).length;
                  return (
                    <Link key={t.id} to={`/c/${course.id}/learn/${t.id}`} className="card" style={{ color: 'inherit' }}>
                      <div className="row between">
                        <span className="faint small mono">Lecture {t.lecture}</span>
                        {prog.visited[t.id] && <span className="chip good">visited</span>}
                      </div>
                      <h3 style={{ margin: '4px 0 6px' }}>{t.title}</h3>
                      <Markdown className="small muted">{t.summary}</Markdown>
                      <div className="small faint" style={{ marginTop: 8 }}>
                        {t.sections.length} sections · {t.flashcards.length} cards · {t.quiz.length} questions
                        {answered > 0 && ` · ${right}/${t.quiz.length} correct`}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

const KIND_LABEL: Record<string, string> = { concept: 'Concept', definition: 'Definition', theorem: 'Theorem', example: 'Example', summary: 'Summary' };

function SectionView({ s }: { s: Section }) {
  return (
    <section id={s.id} className={`card section ${s.kind ?? ''}`}>
      {s.kind && <div className="section-kind">{KIND_LABEL[s.kind]}</div>}
      <h2 style={{ marginTop: 4 }}>{s.title}</h2>
      <Markdown>{s.body}</Markdown>
      {s.formulas?.map((f) => <FormulaCard key={f.id} f={f} />)}
      {s.proof && (
        <details className="collapse">
          <summary>Proof idea</summary>
          <div className="collapse-body">
            <Markdown>{s.proof}</Markdown>
          </div>
        </details>
      )}
      {s.viz?.map((v, i) => <VizHost key={i} viz={v} />)}
      {s.examples?.map((ex, i) => (
        <div key={i} className="callout" style={{ borderColor: 'var(--c2)', background: 'color-mix(in srgb, var(--c2) 8%, transparent)' }}>
          <div className="small" style={{ fontWeight: 700, color: 'var(--c2)' }}>
            Worked example{ex.title ? `: ${ex.title}` : ''}
          </div>
          <Markdown>{ex.problem}</Markdown>
          <details className="collapse" style={{ background: 'var(--bg-elev)' }}>
            <summary>Show solution</summary>
            <div className="collapse-body">
              <Markdown>{ex.solution}</Markdown>
            </div>
          </details>
        </div>
      ))}
    </section>
  );
}

function MiniQuiz({ topic }: { topic: Topic }) {
  const course = useCourse();
  const [resp, setResp] = useState<Record<string, Response>>({});
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const submit = (q: QuizQuestion) => {
    setShown((s) => ({ ...s, [q.id]: true }));
    recordAnswer(course.id, { ...q, examGroup: q.examGroup ?? topic.examGroup }, grade(q, resp[q.id]));
  };
  const done = topic.quiz.filter((q) => shown[q.id]);
  const ok = done.filter((q) => grade(q, resp[q.id])).length;
  return (
    <div className="stack" id="check">
      <div className="row between">
        <h2 style={{ margin: 0 }}>Check your understanding</h2>
        {done.length > 0 && (
          <span className="chip accent">
            {ok}/{done.length} correct
          </span>
        )}
      </div>
      {topic.quiz.map((q, i) => (
        <QuestionView
          key={q.id}
          q={q}
          response={resp[q.id]}
          onChange={(r) => setResp((s) => ({ ...s, [q.id]: r }))}
          revealed={!!shown[q.id]}
          onSubmit={() => submit(q)}
          meta={<span className="chip">Question {i + 1}</span>}
        />
      ))}
    </div>
  );
}

export function TopicPage() {
  const course = useCourse();
  const { topicId = '' } = useParams();
  const topics = [...course.topics].sort((a, b) => (a.lecture ?? 0) - (b.lecture ?? 0));
  const idx = topics.findIndex((t) => t.id === topicId);
  const topic = topics[idx];
  useEffect(() => {
    if (topic) markVisited(course.id, topic.id);
  }, [course.id, topic]);
  const base = `/c/${course.id}`;
  if (!topic) return <Navigate to={`${base}/learn`} replace />;
  const g = groupById(course, topic.examGroup);
  const prev = topics[idx - 1];
  const next = topics[idx + 1];
  const nEx = course.exercises.filter((e) => e.topicId === topic.id || (!e.topicId && e.tutorial === topic.lecture)).length;
  return (
    <div className="topic-layout">
      <div>
        <div className="row small" style={{ marginBottom: 4 }}>
          <Link to={`${base}/learn`}>← All lectures</Link>
          <span className="faint">/</span>
          <span className="faint">Lecture {topic.lecture}</span>
          {g && <span className={`chip ${g.examinable === false ? 'warn' : 'accent'}`}>{g.examinable === false ? 'not examined' : `${g.label}: ${g.title}`}</span>}
        </div>
        <h1 style={{ marginTop: 6 }}>{topic.title}</h1>
        <Markdown className="muted">{topic.summary}</Markdown>
        <div className="row no-print" style={{ margin: '12px 0 18px' }}>
          <Link className="btn sm" to={`${base}/cards?topic=${topic.id}`}>
            🃏 {topic.flashcards.length} flashcards
          </Link>
          <Link className="btn sm" to={`${base}/quiz?topic=${topic.id}`}>
            ✎ Practice quiz
          </Link>
          {nEx > 0 && (
            <Link className="btn sm" to={`${base}/exercises?tutorial=${topic.lecture}`}>
              ✍ {nEx} exercises
            </Link>
          )}
        </div>
        <div className="stack" style={{ gap: 14 }}>
          {topic.sections.map((s) => (
            <SectionView key={s.id} s={s} />
          ))}
        </div>
        {topic.quiz.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <MiniQuiz topic={topic} />
          </div>
        )}
        <div className="row between no-print" style={{ marginTop: 28 }}>
          {prev ? (
            <Link className="btn" to={`${base}/learn/${prev.id}`}>
              ← L{prev.lecture} {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link className="btn" to={`${base}/learn/${next.id}`}>
              L{next.lecture} {next.title} →
            </Link>
          )}
        </div>
      </div>
      <aside className="toc-wrap">
        <nav className="toc">
          <div className="small faint" style={{ marginBottom: 6, fontWeight: 600 }}>
            ON THIS PAGE
          </div>
          {topic.sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }); }}>
              {s.title}
            </a>
          ))}
          {topic.quiz.length > 0 && (
            <a href="#check" onClick={(e) => { e.preventDefault(); document.getElementById('check')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Check your understanding
            </a>
          )}
        </nav>
      </aside>
    </div>
  );
}
