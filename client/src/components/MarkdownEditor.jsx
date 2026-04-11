'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, Edit3 } from 'lucide-react';

/**
 * MarkdownEditor Component
 * A textarea with Markdown preview toggle.
 * AI-generated content renders beautifully with Markdown formatting.
 * Teachers can edit in raw Markdown or preview the rendered version.
 */
export default function MarkdownEditor({
  value = '',
  onChange,
  placeholder = '',
  rows = 3,
  label = '',
  className = '',
}) {
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs md:text-sm font-medium text-text-secondary">{label}</label>
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-white/5 dark:bg-white/10 border border-border dark:border-gray-600 hover:bg-white/10 transition-colors text-text-secondary hover:text-text-primary"
            title={isPreview ? 'Switch to Edit mode' : 'Switch to Preview mode'}
          >
            {isPreview ? (
              <>
                <Edit3 className="w-3 h-3" />
                Edit
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" />
                Preview
              </>
            )}
          </button>
        </div>
      )}

      <div className="relative">
        {isPreview ? (
          // Preview Mode - Rendered Markdown
          <div className="w-full min-h-[120px] px-3 py-2 bg-white dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-sm text-text-primary prose prose-sm dark:prose-invert max-w-none">
            {value ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 className="text-xl font-bold text-text-primary mt-4 mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-bold text-text-primary mt-3 mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-semibold text-text-primary mt-2 mb-1">{children}</h3>,
                  h4: ({ children }) => <h4 className="text-sm font-semibold text-text-primary mt-2 mb-1">{children}</h4>,
                  p: ({ children }) => <p className="text-sm text-text-primary mb-2 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside text-sm text-text-primary mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside text-sm text-text-primary mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-sm text-text-secondary leading-relaxed">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
                  em: ({ children }) => <em className="italic text-text-secondary">{children}</em>,
                  code: ({ children }) => (
                    <code className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs font-mono">{children}</code>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary/30 pl-4 py-2 my-2 text-text-secondary italic">{children}</blockquote>
                  ),
                  hr: () => <hr className="my-4 border-border" />,
                }}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-text-muted italic">Nothing to preview yet...</p>
            )}
          </div>
        ) : (
          // Edit Mode - Raw Markdown Textarea
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-sm text-text-primary dark:text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono leading-relaxed resize-y"
          />
        )}
      </div>

      {/* Markdown hint */}
      {!isPreview && (
        <p className="text-xs text-text-muted">
          💡 Supports Markdown: **bold**, *italic*, - lists, ### headers, > quotes
        </p>
      )}
    </div>
  );
}
