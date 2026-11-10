import { useSearchParams } from 'react-router';
import { useCourse } from '../CourseContext';
import { vizRegistry, VizHost } from '../components/VizHost';
import { topicLabel } from '../quiz';

export function Playground() {
  const course = useCourse();
  const reg = vizRegistry(course);
  const [params, setParams] = useSearchParams();
  // Show the visualizations this course uses first, then the rest of the shared library.
  const used = new Set(course.topics.flatMap((t) => t.sections.flatMap((s) => s.viz?.map((v) => v.id) ?? [])));
  const own = new Set([...used, ...Object.keys(course.viz ?? {})]);
  const showAll = params.get('all') === '1';
  const ids = [...Object.keys(reg).filter((k) => own.has(k)), ...(showAll ? Object.keys(reg).filter((k) => !own.has(k)) : [])];
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
          <button key={id} className={`chip ${id === sel ? 'on' : ''}`} onClick={() => setParams(showAll ? { v: id, all: '1' } : { v: id }, { replace: true })}>
            {reg[id].title}
          </button>
        ))}
        {Object.keys(reg).length > own.size && (
          <button className="chip" style={{ borderStyle: 'dashed' }} onClick={() => setParams(showAll ? { v: sel } : { v: sel, all: '1' }, { replace: true })}>
            {showAll ? 'Hide visualizations from other courses' : `+ ${Object.keys(reg).length - own.size} from other courses`}
          </button>
        )}
      </div>
      {where.length > 0 && <div className="small muted">Used in: {where.map((t) => `${topicLabel(t)} ${t.title}`).join(', ')}</div>}
      {sel && <VizHost key={sel} viz={{ id: sel }} />}
    </>
  );
}
