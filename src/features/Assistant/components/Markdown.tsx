import { Fragment, type ReactNode } from 'react';
import { cn } from '@/core/lib/cn';

/**
 * Minimal, dependency-free markdown renderer for assistant answers.
 *
 * It supports the small subset the assistant actually emits — paragraphs,
 * unordered/ordered lists, bold, italic, inline code and links — and renders
 * everything as React nodes. It never uses `dangerouslySetInnerHTML`, so it is
 * XSS-safe by construction; link hrefs are additionally restricted to safe
 * schemes.
 */
interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  const blocks = parseBlocks(content);

  return (
    <div className={cn('space-y-2 text-sm leading-relaxed', className)}>
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}

type Block =
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'p'; lines: string[] };

const UNORDERED = /^\s*[-*]\s+(.*)$/;
const ORDERED = /^\s*\d+\.\s+(.*)$/;

/** Splits text into block-level chunks on blank lines, then classifies each. */
function parseBlocks(content: string): Block[] {
  const chunks = content.replace(/\r\n/g, '\n').trim().split(/\n{2,}/);

  return chunks
    .map((chunk): Block | null => {
      const lines = chunk.split('\n').filter((line) => line.trim() !== '');
      if (lines.length === 0) {
        return null;
      }

      if (lines.every((line) => UNORDERED.test(line))) {
        return {
          type: 'ul',
          items: lines.map((line) => line.replace(UNORDERED, '$1')),
        };
      }

      if (lines.every((line) => ORDERED.test(line))) {
        return {
          type: 'ol',
          items: lines.map((line) => line.replace(ORDERED, '$1')),
        };
      }

      return { type: 'p', lines };
    })
    .filter((block): block is Block => block !== null);
}

function renderBlock(block: Block, index: number): ReactNode {
  const key = `b${index}`;

  if (block.type === 'ul') {
    return (
      <ul key={key} className="list-disc space-y-1 pl-5">
        {block.items.map((item, i) => (
          <li key={i}>{renderInline(item, `${key}-${i}`)}</li>
        ))}
      </ul>
    );
  }

  if (block.type === 'ol') {
    return (
      <ol key={key} className="list-decimal space-y-1 pl-5">
        {block.items.map((item, i) => (
          <li key={i}>{renderInline(item, `${key}-${i}`)}</li>
        ))}
      </ol>
    );
  }

  return (
    <p key={key}>
      {block.lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 ? <br /> : null}
          {renderInline(line, `${key}-${i}`)}
        </Fragment>
      ))}
    </p>
  );
}

// bold | inline code | link | italic. Bold is matched before italic so `**x**`
// is not mistaken for two italic markers.
const INLINE =
  /\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|(?:\*|_)(.+?)(?:\*|_)/g;

/** Allow only safe href schemes; reject `javascript:` and friends. */
function safeHref(raw: string): string | null {
  const value = raw.trim();
  if (/^(https?:|mailto:)/i.test(value) || /^[/#]/.test(value)) {
    return value;
  }
  return null;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let token = 0;
  let match: RegExpExecArray | null;

  INLINE.lastIndex = 0;
  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const key = `${keyPrefix}-i${token++}`;
    const [, bold, code, linkText, linkHref, italic] = match;

    if (bold !== undefined) {
      nodes.push(<strong key={key}>{bold}</strong>);
    } else if (code !== undefined) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em] text-slate-800"
        >
          {code}
        </code>,
      );
    } else if (linkText !== undefined && linkHref !== undefined) {
      const href = safeHref(linkHref);
      nodes.push(
        href ? (
          <a
            key={key}
            href={href}
            className="font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
            target={/^https?:/i.test(href) ? '_blank' : undefined}
            rel={/^https?:/i.test(href) ? 'noopener noreferrer' : undefined}
          >
            {linkText}
          </a>
        ) : (
          linkText
        ),
      );
    } else if (italic !== undefined) {
      nodes.push(<em key={key}>{italic}</em>);
    }

    lastIndex = INLINE.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
