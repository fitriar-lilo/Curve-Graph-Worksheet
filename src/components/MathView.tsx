import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  content: string;
  className?: string;
  inline?: boolean;
}

export const MathView: React.FC<MathViewProps> = ({ content, className = '', inline = true }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // Regex to split string into text segments and LaTeX segments: $...$ or $$...$$
    const mathRegex = /(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g;
    const parts = content.split(mathRegex);

    return parts
      .map((part) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const rawMath = part.slice(2, -2).trim();
          try {
            return katex.renderToString(rawMath, { displayMode: true, throwOnError: false });
          } catch (e) {
            return `<span class="text-red-500 font-mono text-xs">${part}</span>`;
          }
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const rawMath = part.slice(1, -1).trim();
          try {
            return katex.renderToString(rawMath, { displayMode: false, throwOnError: false });
          } catch (e) {
            return `<span class="text-red-500 font-mono text-xs">${part}</span>`;
          }
        } else {
          // Regular text: sanitize minimal HTML entities
          return part
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        }
      })
      .join('');
  }, [content]);

  if (!inline) {
    return (
      <div
        className={`math-rendered font-serif text-slate-900 leading-relaxed ${className}`}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    );
  }

  return (
    <span
      className={`math-rendered font-serif text-slate-900 leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
