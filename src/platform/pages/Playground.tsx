import { useSearchParams } from 'react-router';
import { useCourse } from '../CourseContext';
import { vizRegistry, VizHost } from '../components/VizHost';

export function Playground() {
  const course = useCourse();
  const reg = vizRegistry(course);
  const [params, setParams] = useSearchParams();
  // Show the visualizations this course uses first, then the rest of the shared library.
  const used = new Set(course.topics.flatMap((t) => t.sections.flatMap((s) => s.viz?.map((v) => v.id) ?? [])));
  const ids = [...Object.keys(reg).filter((k) => used.has(k)), ...Object.keys(reg).filter((k) => !used.has(k))];
  const sel = params.get('v') || ids[0];
  const where = course.topics.filter((t) => t.sections.some((s) => s.viz?.some((v) => v.id === sel)));
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Playground</h1>
          <p className="page-sub">Every interactive visualization, with free parameters. Experiment until the theorems feel obvious.</p>
        </div>
      </div>
      <div className="row" style={{ gap: 6, marginBottom: 12 }}>
        {ids.map((id) => (
          <button key={id} className={`chip ${id === sel ? 'on' : ''}`} onClick={() => setParams({ v: id }, { replace: true })}>
            {reg[id].title}
          </button>
        ))}
      </div>
      {where.length > 0 && <div className="small muted">Used in: {where.map((t) => `L${t.lecture} ${t.title}`).join(', ')}</div>}
      {sel && <VizHost key={sel} viz={{ id: sel }} />}
    </>
  );
}
