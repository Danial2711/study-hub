import { useState } from 'react';
import { Link } from 'react-router';
import { useCourse } from '../CourseContext';
import { courseFormulas } from '../quiz';
import { FormulaCard } from '../components/FormulaCard';

export function FormulaSheet() {
  const course = useCourse();
  const all = courseFormulas(course);
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('all');
  const [compact, setCompact] = useState(true);
  const shown = all.filter(
    (f) =>
      (group === 'all' || f.examGroup === group) &&
      (!q || `${f.name} ${f.tex} ${f.intuition ?? ''} ${f.topicTitle} ${f.sectionTitle}`.toLowerCase().includes(q.toLowerCase())),
  );
  const byTopic = course.topics.map((t) => ({ t, fs: shown.filter((f) => f.topicId === t.id) })).filter((x) => x.fs.length);
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Formula sheet</h1>
          <p className="page-sub">{all.length} formulas. Click “Explain” on any of them for symbol meanings, intuition and pitfalls.</p>
        </div>
        <div className="row no-print">
          <button className="btn" onClick={() => setCompact(!compact)}>
            {compact ? 'Expand all' : 'Collapse all'}
          </button>
          <button className="btn" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </div>
      <div className="row no-print" style={{ marginBottom: 12 }}>
        <input type="search" placeholder="Search formulas (e.g. Chebyshev, entropy, Kraft)…" value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1, minWidth: 220 }} />
        <select value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="all">All topics</option>
          {course.examGroups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}: {g.title}
            </option>
          ))}
        </select>
      </div>
      {byTopic.map(({ t, fs }) => (
        <div key={t.id}>
          <h2>
            <Link to={`/c/${course.id}/learn/${t.id}`} style={{ color: 'inherit' }}>
              L{t.lecture} · {t.title}
            </Link>
          </h2>
          <div className="grid cols-2">
            {fs.map((f) => (
              <div key={`${compact}-${f.id}`}>
                <FormulaCard f={f} compact={compact} />
              </div>
            ))}
          </div>
        </div>
      ))}
      {byTopic.length === 0 && <div className="card empty">No formula matches “{q}”.</div>}
    </>
  );
}
