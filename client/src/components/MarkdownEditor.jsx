'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, Edit3, Maximize2, X } from 'lucide-react';

/**
 * MarkdownEditor Component
 * A textarea with Markdown preview toggle and fullscreen expand option.
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
  const [isExpanded, setIsExpanded] = useState(false);

  // Ensure value is always a string
  const safeValue = typeof value === 'string' ? value : '';

  return (
    <>
      <div className={`space-y-2 ${className}`}>
        {/* Always show the Preview/Edit toggle row */}
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-md border transition-colors ${
              isPreview
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-white/5 dark:bg-white/10 border-border dark:border-gray-600 hover:bg-white/10 text-text-secondary hover:text-text-primary'
            }`}
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
          {isPreview && safeValue.trim() && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-white/5 dark:bg-white/10 border border-border dark:border-gray-600 hover:bg-white/10 transition-colors text-text-secondary hover:text-text-primary"
              title="Expand to fullscreen"
            >
              <Maximize2 className="w-3 h-3" />
              Expand
            </button>
          )}
        </div>

        <div className="relative">
          {isPreview ? (
            // Preview Mode - Rendered Markdown
            <div className="w-full min-h-[150px] max-h-[400px] overflow-y-auto px-4 py-3 bg-white dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-sm text-text-primary">
              {safeValue.trim() ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {safeValue}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-text-muted italic">Nothing to preview yet...</p>
              )}
            </div>
          ) : (
            // Edit Mode - Raw Markdown Textarea
            <textarea
              value={safeValue}
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
            💡 Supports Markdown: {'**bold**'}, {'*italic*'}, {'- lists'}, {'### headers'}
          </p>
        )}
      </div>

      {/* Expanded Preview Modal */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsExpanded(false)}>
          <div
            className="bg-card dark:bg-gray-800 rounded-card border border-border w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Preview
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {safeValue}
                </ReactMarkdown>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-border bg-bg-main/50 dark:bg-gray-750/50 flex items-center justify-between text-xs text-text-muted">
              <span>Markdown Preview</span>
              <button
                onClick={() => setIsExpanded(false)}
                className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
