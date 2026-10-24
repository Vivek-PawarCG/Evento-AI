import React from 'react';
import { Info, Sparkles } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  if (!content) return null;

  // Normalize markdown boundaries so headers and blockquotes become separate clean blocks
  const normalized = content
    .replace(/\r\n/g, '\n')
    .replace(/\n(#{1,4}\s+)/g, '\n\n$1')
    .replace(/\n(>\s*)/g, '\n\n$1');

  const blocks = normalized.split(/\n\n+/);

  return (
    <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-[#fafafa] leading-relaxed">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Check if block is a blockquote / alert (starts with >)
        if (trimmed.startsWith('>')) {
          const lines = trimmed
            .split('\n')
            .map((line) => line.replace(/^>\s*/, '').trim())
            .filter(Boolean);

          const isAlertNote = lines.some((l) => l.includes('[NOTE]') || l.includes('[!NOTE]'));
          const cleanLines = lines.filter((l) => !l.includes('[NOTE]') && !l.includes('[!NOTE]'));

          return (
            <div
              key={bIdx}
              className="my-1.5 p-3 rounded-xl bg-[#a78bfa]/10 border border-[#a78bfa]/30 text-xs font-mono text-[#fafafa] flex items-start gap-2.5 shadow-sm"
            >
              <Info className="w-4 h-4 text-[#a78bfa] flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                {cleanLines.map((line, lIdx) => (
                  <p key={lIdx} className="leading-relaxed">
                    {renderInlineFormatting(line)}
                  </p>
                ))}
              </div>
            </div>
          );
        }

        // Check if block is a heading (### or ##)
        if (trimmed.startsWith('### ')) {
          return (
            <h4
              key={bIdx}
              className="text-sm font-bold text-[#fafafa] pt-1.5 flex items-center gap-1.5 font-headline"
            >
              {renderInlineFormatting(trimmed.replace(/^###\s+/, ''))}
            </h4>
          );
        }

        if (trimmed.startsWith('## ')) {
          return (
            <h3
              key={bIdx}
              className="text-base font-bold text-[#fafafa] pt-2 pb-0.5 border-b border-[#27272a]"
            >
              {renderInlineFormatting(trimmed.replace(/^##\s+/, ''))}
            </h3>
          );
        }

        // Check if block is an ordered list (starts with 1. )
        if (/^\d+\.\s+/.test(trimmed)) {
          const listItems = trimmed.split('\n').filter((l) => /^\d+\.\s+/.test(l.trim()));
          return (
            <ol key={bIdx} className="space-y-1.5 my-1 pl-1">
              {listItems.map((item, iIdx) => {
                const match = item.match(/^(\d+)\.\s+(.*)/);
                const num = match ? match[1] : `${iIdx + 1}`;
                const text = match ? match[2] : item;
                return (
                  <li key={iIdx} className="flex items-start gap-2 text-xs sm:text-sm">
                    <span className="font-mono text-[#a78bfa] font-bold text-xs mt-0.5 min-w-[1.2rem]">
                      {num}.
                    </span>
                    <span className="flex-1 leading-relaxed">{renderInlineFormatting(text)}</span>
                  </li>
                );
              })}
            </ol>
          );
        }

        // Check if block is an unordered list (starts with * or -)
        if (/^[\*\-]\s+/.test(trimmed)) {
          const listItems = trimmed.split('\n').filter((l) => /^[\*\-]\s+/.test(l.trim()));
          return (
            <ul key={bIdx} className="space-y-1.5 my-1 pl-1">
              {listItems.map((item, iIdx) => {
                const text = item.replace(/^[\*\-]\s+/, '');
                return (
                  <li key={iIdx} className="flex items-start gap-2 text-xs sm:text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] mt-1.5 flex-shrink-0" />
                    <span className="flex-1 leading-relaxed">{renderInlineFormatting(text)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Regular paragraph with potential single newlines inside
        const subLines = trimmed.split('\n');
        return (
          <p key={bIdx} className="leading-relaxed">
            {subLines.map((sub, sIdx) => (
              <React.Fragment key={sIdx}>
                {renderInlineFormatting(sub)}
                {sIdx < subLines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Parses inline formatting like **bold**, *italic*, `code`, and clean text
 */
function renderInlineFormatting(text: string): React.ReactNode {
  if (!text) return null;

  // Pattern matching: **bold**, *italic*, `code`
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-[#fafafa]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-[#a1a1aa]">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-[#a78bfa]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Remaining trailing text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
