import type { QuizQuestion } from '../types';
import { formatAnswer, grade, isAnswered, parseNumber, type Response } from '../quiz';
import { Markdown } from './Markdown';
import { fmt } from '../../shared/math/linalg';

const KEYS = 'ABCDEFGH';

export function QuestionView({
  q,
  response,
  onChange,
  revealed,
  onSubmit,
  meta,
}: {
  q: QuizQuestion;
  response: Response;
  onChange: (r: Response) => void;
  /** Show correctness + explanation. */
  revealed: boolean;
  /** If given, a "Check" button is shown before reveal. */
  onSubmit?: () => void;
  meta?: React.ReactNode;
}) {
  const correct = revealed && grade(q, response);
  const optClass = (i: number) => {
    const selected = q.type === 'mcq' ? response === i : q.type === 'multi' ? Array.isArray(response) && response.includes(i) : false;
    if (!revealed) return selected ? 'selected' : '';
    const isRight = q.type === 'mcq' ? q.answer === i : q.type === 'multi' ? q.answer.includes(i) : false;
    if (isRight) return 'correct';
    if (selected) return 'wrong';
    return '';
  };
  return (
    <div className="q-card">
      {meta && <div className="q-meta">{meta}</div>}
      <div className="q-prompt">
        <Markdown>{q.prompt}</Markdown>
      </div>
      {q.type === 'multi' && !revealed && <div className="small faint" style={{ marginTop: 6 }}>Select all that apply.</div>}
      {(q.type === 'mcq' || q.type === 'multi') && (
        <div className="options">
          {q.options.map((o, i) => (
            <button
              key={i}
              className={`option ${optClass(i)}`}
              disabled={revealed}
              onClick={() => {
                if (q.type === 'mcq') onChange(i);
                else {
                  const cur = Array.isArray(response) ? response : [];
                  onChange(cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]);
                }
              }}
            >
              <span className="opt-key">{q.type === 'multi' ? (optClass(i) === 'selected' || (Array.isArray(response) && response.includes(i)) ? '✓' : KEYS[i]) : KEYS[i]}</span>
              <Markdown inline>{o}</Markdown>
            </button>
          ))}
        </div>
      )}
      {q.type === 'truefalse' && (
        <div className="options" style={{ flexDirection: 'row' }}>
          {[true, false].map((v) => {
            const sel = response === v;
            const cls = !revealed ? (sel ? 'selected' : '') : q.answer === v ? 'correct' : sel ? 'wrong' : '';
            return (
              <button key={String(v)} className={`option ${cls}`} disabled={revealed} onClick={() => onChange(v)} style={{ justifyContent: 'center' }}>
                {v ? 'True' : 'False'}
              </button>
            );
          })}
        </div>
      )}
      {q.type === 'numeric' && (
        <div className="numeric-input">
          <input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 0.25 or 1/4"
            value={typeof response === 'string' ? response : ''}
            disabled={revealed}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit && isAnswered(q, response) && onSubmit()}
          />
          {typeof response === 'string' && response.trim() && !revealed && (
            <span className="small faint">= {Number.isFinite(parseNumber(response)) ? fmt(parseNumber(response), 6) : 'cannot parse'}</span>
          )}
          {q.format && <span className="small faint">{q.format}</span>}
        </div>
      )}
      {onSubmit && !revealed && (
        <div style={{ marginTop: 14 }}>
          <button className="btn primary" disabled={!isAnswered(q, response)} onClick={onSubmit}>
            Check answer
          </button>
        </div>
      )}
      {revealed && (
        <div className={`feedback ${correct ? 'good' : 'bad'}`}>
          <div className="feedback-title">{correct ? 'Correct' : isAnswered(q, response) ? 'Not quite' : 'Not answered'}</div>
          {!correct && (
            <div className="small" style={{ marginBottom: 6 }}>
              Correct answer: <Markdown inline>{formatAnswer(q)}</Markdown>
            </div>
          )}
          <Markdown>{q.explanation}</Markdown>
        </div>
      )}
    </div>
  );
}
