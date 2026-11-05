import { useEffect } from 'react';
import { HashRouter, Link, Navigate, Route, Routes } from 'react-router';
import { useAppState, useSyncStatus } from './state/store';
import { CourseLayout } from './pages/CourseLayout';
import { Home } from './pages/Home';
import { Settings } from './pages/Settings';
import { Dashboard } from './pages/Dashboard';
import { Learn, TopicPage } from './pages/Learn';
import { Flashcards } from './pages/Flashcards';
import { Quiz } from './pages/Quiz';
import { MockExam } from './pages/MockExam';
import { Exercises } from './pages/Exercises';
import { FormulaSheet } from './pages/FormulaSheet';
import { Playground } from './pages/Playground';
import { Progress } from './pages/Progress';

function useTheme() {
  const theme = useAppState().settings.theme;
  useEffect(() => {
    const apply = () => {
      const t = theme === 'auto' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
      document.documentElement.dataset.theme = t;
    };
    apply();
    const mq = matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
}

const SYNC_COLOR: Record<string, string> = {
  synced: 'var(--good)',
  pending: 'var(--warn)',
  syncing: 'var(--info)',
  offline: 'var(--fg-faint)',
  error: 'var(--bad)',
};

function Header() {
  const { status } = useSyncStatus();
  return (
    <header className="app-header">
      <Link to="/" className="brand">
        <span className="brand-logo">∑</span>
        <span>Study Hub</span>
      </Link>
      <div className="header-spacer" />
      {status !== 'off' && (
        <span className="small muted row" style={{ gap: 6 }} title={`Sync: ${status}`}>
          <span className="sync-dot" style={{ background: SYNC_COLOR[status] }} />
          <span className="nowrap">{status}</span>
        </span>
      )}
      <Link to="/settings" className="btn ghost sm" aria-label="Settings">
        ⚙ Settings
      </Link>
    </header>
  );
}

export function App() {
  useTheme();
  return (
    <HashRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/c/:courseId" element={<CourseLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="learn" element={<Learn />} />
          <Route path="learn/:topicId" element={<TopicPage />} />
          <Route path="cards" element={<Flashcards />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="mock" element={<MockExam />} />
          <Route path="exercises" element={<Exercises />} />
          <Route path="formulas" element={<FormulaSheet />} />
          <Route path="playground" element={<Playground />} />
          <Route path="progress" element={<Progress />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
