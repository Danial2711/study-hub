import { memo, useMemo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import katex from 'katex';

const remarkPlugins = [remarkGfm, remarkMath];
/** KaTeX's \not overlay renders poorly in some browsers; use the precomposed symbols. */
export const KATEX_MACROS = { '\\ne': '\\mathrel{\\char"2260}', '\\neq': '\\mathrel{\\char"2260}' };
const rehypePlugins: Parameters<typeof ReactMarkdown>[0]['rehypePlugins'] = [[rehypeKatex, { throwOnError: false, strict: false, macros: KATEX_MACROS }]];

const inlineComponents: Components = {
  p: ({ children }) => <span>{children}</span>,
};

/**
 * remark-math treats `$$…$$` as *display* math only when the fences are on their own
 * lines. Content authors naturally write `$$x$$` on one line, so normalise it here.
 * Indentation of the surrounding line is kept so display math inside list items works.
 */
export function normalizeDisplayMath(src: string): string {
  return src.replace(/(^|\n)([ \t]*)([^\n]*?)\$\$([\s\S]+?)\$\$([^\n]*)/g, (_m, nl: string, indent: string, before: string, tex: string, after: string) => {
    const pre = before.trim() ? `${indent}${before.trimEnd()}\n\n` : '';
    const post = after.trim() ? `\n\n${indent}${after.trimStart()}` : '';
    return `${nl}${pre}${indent}$$\n${indent}${tex.trim()}\n${indent}$$${post}`;
  });
}

/** Markdown + KaTeX. `inline` renders without block wrappers (for option labels, chips…). */
export const Markdown = memo(function Markdown({ children, inline, className }: { children: string; inline?: boolean; className?: string }) {
  if (inline)
    return (
      <span className={`md ${className ?? ''}`}>
        <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={inlineComponents}>
          {children}
        </ReactMarkdown>
      </span>
    );
  return (
    <div className={`md ${className ?? ''}`}>
      <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
        {normalizeDisplayMath(children)}
      </ReactMarkdown>
    </div>
  );
});

/** Raw LaTeX (no dollars). */
export const Tex = memo(function Tex({ children, display }: { children: string; display?: boolean }) {
  const html = useMemo(() => katex.renderToString(children, { displayMode: !!display, throwOnError: false, strict: false, macros: { ...KATEX_MACROS } }), [children, display]);
  return display ? <div className="md" dangerouslySetInnerHTML={{ __html: html }} /> : <span dangerouslySetInnerHTML={{ __html: html }} />;
});
