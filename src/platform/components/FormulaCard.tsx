import { useState } from 'react';
import type { Formula } from '../types';
import { Markdown, Tex } from './Markdown';

export function FormulaCard({ f, compact, extra }: { f: Formula; compact?: boolean; extra?: React.ReactNode }) {
  const [open, setOpen] = useState(!compact);
  const hasBody = !!(f.symbols?.length || f.intuition || f.conditions || f.pitfalls);
  return (
    <div className="formula-card" id={`f-${f.id}`}>
      <div className="formula-head">
        <span>{f.name}</span>
        <span className="row" style={{ gap: 6 }}>
          {extra}
          {hasBody && (
            <button className="btn ghost sm no-print" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
              {open ? 'Hide details' : 'Explain'}
            </button>
          )}
        </span>
      </div>
      <div className="formula-tex">
        <Tex display>{f.tex}</Tex>
      </div>
      {open && hasBody && (
        <div className="formula-body">
          {f.symbols && f.symbols.length > 0 && (
            <>
              <div className="formula-label">Symbols</div>
              <div className="sym-table">
                {f.symbols.map((s, i) => (
                  <FragmentPair key={i} sym={s.sym} meaning={s.meaning} />
                ))}
              </div>
            </>
          )}
          {f.intuition && (
            <>
              <div className="formula-label">Intuition</div>
              <Markdown>{f.intuition}</Markdown>
            </>
          )}
          {f.conditions && (
            <>
              <div className="formula-label">When it holds / when to use</div>
              <Markdown>{f.conditions}</Markdown>
            </>
          )}
          {f.pitfalls && (
            <>
              <div className="formula-label">Common pitfalls</div>
              <Markdown>{f.pitfalls}</Markdown>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function FragmentPair({ sym, meaning }: { sym: string; meaning: string }) {
  return (
    <>
      <span className="sym">
        <Tex>{sym}</Tex>
      </span>
      <Markdown inline>{meaning}</Markdown>
    </>
  );
}
