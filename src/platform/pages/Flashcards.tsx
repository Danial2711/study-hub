import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useCourse } from '../CourseContext';
import { useCourseProgress } from '../state/store';
import { courseCards, topicLabel, type CardRef } from '../quiz';
import { describeInterval, isDue, isLearned, type Grade } from '../state/srs';
import { reviewCard } from '../state/actions';
import { Markdown } from '../components/Markdown';
import { Seg } from '../../shared/viz/kit';
import { makeRng } from '../../shared/math/random';

type Mode = 'review' | 'cram' | 'browse';

export function Flashcards() {
  const course = useCourse();
  const prog = useCourseProgress(course.id);
  const [params, setParams] = useSearchParams();
  const filter = params.get('topic') ? `t:${params.get('topic')}` : params.get('group') ? `g:${params.get('group')}` : 'all';
  const [mode, setMode] = useState<Mode>('review');
  const all = courseCards(course);
  const deck = useMemo(
    () => all.filter((c) => (filter === 'all' ? true : filter.startsWith('t:') ? c.topicId === filter.slice(2) : c.examGroup === filter.slice(2))),
    [all, filter],
  );
  const setFilter = (v: string) => {
    const p = new URLSearchParams();
    if (v.startsWith('t:')) p.set('topic', v.slice(2));
    if (v.startsWith('g:')) p.set('group', v.slice(2));
    setParams(p, { replace: true });
  };
  const now = Date.now();
  const due = deck.filter((c) => isDue(prog.cards[c.id], now));
  const learned = deck.filter((c) => isLearned(prog.cards[c.id])).length;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Flashcards</h1>
          <p className="page-sub">Spaced repetition: grade how well you recalled each card and it comes back right before you would forget it.</p>
        </div>
        <Seg
          value={mode}
          onChange={setMode}
          options={[
            { v: 'review', label: `Review (${due.length} due)` },
            { v: 'cram', label: 'Cram all' },
            { v: 'browse', label: 'Browse' },
          ]}
        />
      </div>
      <div className="row" style={{ marginBottom: 14 }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All cards ({all.length})</option>
          <optgroup label="By exam topic">
            {course.examGroups.map((g) => (
              <option key={g.id} value={`g:${g.id}`}>
                {g.label}: {g.title}
              </option>
            ))}
          </optgroup>
          <optgroup label="By lecture">
            {course.topics.map((t) => (
              <option key={t.id} value={`t:${t.id}`}>
                {topicLabel(t)}: {t.title}
              </option>
            ))}
          </optgroup>
        </select>
        <span className="small muted">
          {deck.length} cards · {learned} learned · {due.length} due now
        </span>
      </div>
      {mode === 'browse' ? (
        <Browse deck={deck} />
      ) : (
        <Session key={`${mode}-${filter}`} courseId={course.id} cards={mode === 'review' ? due : deck} cram={mode === 'cram'} />
      )}
    </>
  );
}

function Session({ courseId, cards, cram }: { courseId: string; cards: CardRef[]; cram: boolean }) {
  const prog = useCourseProgress(courseId);
  const [queue] = useState(() => {
    const rng = makeRng();
    // Review: overdue first; new cards after; cram: shuffled.
    if (cram) return rng.shuffle(cards);
    const seen = cards.filter((c) => prog.cards[c.id]).sort((a, b) => prog.cards[a.id].due - prog.cards[b.id].due);
    const fresh = cards.filter((c) => !prog.cards[c.id]);
    return [...seen, ...fresh];
  });
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [again, setAgain] = useState<CardRef[]>([]);
  const [tally, setTally] = useState([0, 0, 0, 0]);
  const list = [...queue, ...again];
  const card = list[i];
  const gradeIt = useCallback(
    (g: Grade) => {
      if (!card) return;
      if (!cram) reviewCard(courseId, card.id, g);
      setTally((t) => t.map((x, k) => (k === g ? x + 1 : x)));
      if (g === 0) setAgain((a) => [...a, card]);
      setFlipped(false);
      setI((x) => x + 1);
    },
    [card, courseId, cram],
  );
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'SELECT') return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && ['1', '2', '3', '4'].includes(e.key)) gradeIt((+e.key - 1) as Grade);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flipped, gradeIt]);

  if (!list.length)
    return (
      <div className="card empty">
        <h3>Nothing due right now 🎉</h3>
        <p>All cards in this deck are scheduled for later. Use “Cram all” to go through them anyway, or pick another deck.</p>
      </div>
    );
  if (!card)
    return (
      <div className="card empty">
        <h3>Session complete</h3>
        <p>
          {tally.reduce((a, b) => a + b, 0)} reviews · again {tally[0]} · hard {tally[1]} · good {tally[2]} · easy {tally[3]}
        </p>
      </div>
    );
  const st = prog.cards[card.id];
  const labels: [Grade, string, string][] = [
    [0, 'Again', 'grade-again'],
    [1, 'Hard', 'grade-hard'],
    [2, 'Good', 'grade-good'],
    [3, 'Easy', 'grade-easy'],
  ];
  return (
    <>
      <div className="row between" style={{ maxWidth: 720, margin: '0 auto 8px' }}>
        <span className="small muted">
          Card {i + 1} / {list.length}
          {cram && ' · cram mode (schedule not changed)'}
        </span>
        <span className="small faint">{st ? `interval ${st.interval}d · ${st.reps} reviews` : 'new card'}</span>
      </div>
      <div className="progress" style={{ maxWidth: 720, margin: '0 auto 12px' }}>
        <div style={{ width: `${(i / list.length) * 100}%` }} />
      </div>
      <div className="flash-wrap">
        <div className={`flash ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped((f) => !f)} role="button" tabIndex={0} aria-label="Flip card">
          <div className="flash-face">
            <div className="flash-label">Question</div>
            <div className="flash-content">
              <Markdown>{card.front}</Markdown>
            </div>
            <div className="flash-hint">click or press Space to reveal</div>
          </div>
          <div className="flash-face back">
            <div className="flash-label">Answer</div>
            <div className="flash-content">
              <Markdown>{card.back}</Markdown>
            </div>
          </div>
        </div>
      </div>
      {flipped ? (
        <div className="grade-row">
          {labels.map(([g, name, cls]) => (
            <button key={g} className={`btn ${cls}`} onClick={() => gradeIt(g)}>
              {name}
              <small>{cram ? `key ${g + 1}` : describeInterval(st, g)}</small>
            </button>
          ))}
        </div>
      ) : (
        <div className="center" style={{ marginTop: 16 }}>
          <button className="btn primary lg" onClick={() => setFlipped(true)}>
            Show answer
          </button>
        </div>
      )}
    </>
  );
}

function Browse({ deck }: { deck: CardRef[] }) {
  const [q, setQ] = useState('');
  const shown = deck.filter((c) => !q || (c.front + c.back).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <input type="search" placeholder="Search cards…" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: '100%', marginBottom: 12 }} />
      <div className="grid cols-2">
        {shown.map((c) => (
          <div key={c.id} className="card tight">
            <Markdown>{c.front}</Markdown>
            <hr style={{ margin: '10px 0' }} />
            <Markdown className="small">{c.back}</Markdown>
          </div>
        ))}
      </div>
    </>
  );
}
