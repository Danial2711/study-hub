import { useRef, useState } from 'react';
import { COURSES } from '../registry';
import { exportJson, importJson } from '../state/model';
import { getState, newSyncCode, pull, replaceState, updateSettings, useAppState, useSyncStatus } from '../state/store';
import { resetCourse } from '../state/actions';
import { Seg } from '../../shared/viz/kit';

export function Settings() {
  const s = useAppState();
  const { status, lastSyncAt } = useSyncStatus();
  const [codeInput, setCodeInput] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const code = s.settings.syncCode;

  const connect = (c: string) => {
    const v = c.trim().toLowerCase();
    if (!/^[0-9a-f]{32}$/.test(v)) {
      setMsg('A sync code is 32 hexadecimal characters.');
      return;
    }
    updateSettings({ syncCode: v });
    setCodeInput('');
    setMsg('Connected. Pulling progress from the cloud…');
    void pull();
  };

  return (
    <div className="main" style={{ margin: '0 auto', maxWidth: 820 }}>
      <h1>Settings</h1>
      {msg && (
        <div className="callout small" onClick={() => setMsg(null)}>
          {msg}
        </div>
      )}
      <div className="card">
        <h2>Appearance</h2>
        <Seg
          value={s.settings.theme}
          onChange={(t) => updateSettings({ theme: t })}
          options={[
            { v: 'auto', label: 'Auto' },
            { v: 'light', label: 'Light' },
            { v: 'dark', label: 'Dark' },
          ]}
        />
      </div>

      <div className="card">
        <h2>Sync between devices</h2>
        <p className="small muted">
          Progress is stored in this browser. To use it on your phone and laptop, create a sync code here and enter the same code on the other device. Anyone who knows
          the code can read and overwrite the synced progress, so treat it like a password. The code itself never leaves your device except as the storage key.
        </p>
        {code ? (
          <div className="stack">
            <div className="row">
              <code style={{ fontSize: '1rem', padding: '6px 10px', userSelect: 'all' }}>{code}</code>
              <button className="btn sm" onClick={() => navigator.clipboard?.writeText(code).then(() => setMsg('Code copied.'))}>
                Copy
              </button>
            </div>
            <div className="row small muted">
              Status: <b>{status}</b>
              {lastSyncAt > 0 && <span>· last synced {new Date(lastSyncAt).toLocaleTimeString()}</span>}
            </div>
            <div className="row">
              <button className="btn" onClick={() => void pull()}>
                Sync now
              </button>
              <button
                className="btn danger"
                onClick={() => {
                  updateSettings({ syncCode: undefined });
                  setMsg('Sync disconnected on this device. Local progress is kept.');
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="stack">
            <div>
              <button className="btn primary" onClick={() => connect(newSyncCode())}>
                Create a new sync code
              </button>
            </div>
            <div className="row">
              <input type="text" placeholder="…or paste an existing code" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} style={{ flex: 1, minWidth: 220 }} className="mono" />
              <button className="btn" onClick={() => connect(codeInput)}>
                Connect
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Backup</h2>
        <p className="small muted">Export everything as a JSON file, or import a backup (it is merged with the current progress — newer records win).</p>
        <div className="row">
          <button
            className="btn"
            onClick={() => {
              const blob = new Blob([exportJson(getState())], { type: 'application/json' });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = `study-hub-progress-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(a.href);
            }}
          >
            Export JSON
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            Import JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                replaceState(importJson(await f.text(), getState()));
                setMsg('Imported and merged.');
              } catch (err) {
                setMsg(`Import failed: ${(err as Error).message}`);
              }
              e.target.value = '';
            }}
          />
        </div>
      </div>

      <div className="card">
        <h2>Mock exam</h2>
        <label className="field" style={{ maxWidth: 260 }}>
          Default duration (minutes, 0 = course default)
          <input type="number" min={0} max={300} value={s.settings.mockMinutes ?? 0} onChange={(e) => updateSettings({ mockMinutes: +e.target.value || undefined })} />
        </label>
      </div>

      <div className="card">
        <h2>Reset progress</h2>
        <p className="small muted">Deletes flashcard schedules, quiz statistics, exercise marks and exam history for one course (also on synced devices).</p>
        <div className="row">
          {COURSES.map((c) => (
            <button
              key={c.id}
              className="btn danger"
              onClick={() => {
                if (confirm(`Reset all progress for ${c.code}? This cannot be undone.`)) {
                  resetCourse(c.id);
                  setMsg(`${c.code} progress reset.`);
                }
              }}
            >
              Reset {c.code}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
