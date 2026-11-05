import { Component, Suspense, type ReactNode } from 'react';
import { SHARED_VIZ } from '../../shared/viz/registry';
import { useCourse } from '../CourseContext';
import type { Course, VizRef } from '../types';
import { Markdown } from './Markdown';

export function vizRegistry(course: Course) {
  return { ...SHARED_VIZ, ...(course.viz ?? {}) };
}

class Boundary extends Component<{ children: ReactNode }, { err: Error | null }> {
  state = { err: null as Error | null };
  static getDerivedStateFromError(err: Error) {
    return { err };
  }
  render() {
    if (this.state.err) return <div className="callout bad small">Visualization failed: {this.state.err.message}</div>;
    return this.props.children;
  }
}

export function VizHost({ viz }: { viz: VizRef }) {
  const course = useCourse();
  const entry = vizRegistry(course)[viz.id];
  if (!entry) return <div className="callout warn small">Unknown visualization “{viz.id}”.</div>;
  const C = entry.component;
  return (
    <Boundary>
      <Suspense fallback={<div className="viz muted small">Loading visualization…</div>}>
        <C {...(viz.props ?? {})} />
      </Suspense>
      {viz.caption && (
        <div className="viz-caption" style={{ marginTop: -6, marginBottom: 12 }}>
          <Markdown>{viz.caption}</Markdown>
        </div>
      )}
    </Boundary>
  );
}
