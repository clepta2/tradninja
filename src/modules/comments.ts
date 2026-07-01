import { readFileSync, writeFileSync } from 'fs';
import type { Language } from '../core/types';
import { createTranslator } from '../core/engine';

interface Comment {
  type: 'line' | 'block';
  content: string;
  line: number;
  column?: number;
}

interface CommentResult {
  file: string;
  original: Comment[];
  translated: Comment[];
}

const translator = createTranslator();

const LINE_COMMENT_REGEX = /\/\/(.+)$/gm;
const BLOCK_COMMENT_REGEX = /\/\*[\s\S]*?\*\//g;

export function extractComments(filePath: string): Comment[] {
  const content = readFileSync(filePath, 'utf-8');
  const comments: Comment[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip import lines
    if (/^\s*import\s/.test(line)) continue;

    let match: RegExpExecArray | null;
    const lineRegex = /\/\/(.+)$/;
    match = lineRegex.exec(line);
    if (match) {
      comments.push({
        type: 'line',
        content: match[1].trim(),
        line: i + 1,
      });
    }
  }

  const blockRegex = /\/\*([\s\S]*?)\*\//g;
  let fullMatch: RegExpExecArray | null;
  while ((fullMatch = blockRegex.exec(content)) !== null) {
    const blockContent = fullMatch[1].trim();
    const beforeMatch = content.substring(0, fullMatch.index);
    const lineNum = beforeMatch.split('\n').length;

    // Don't re-add single-line comments
    if (!blockContent.includes('\n') && comments.some((c) => c.line === lineNum)) continue;

    comments.push({
      type: 'block',
      content: blockContent,
      line: lineNum,
    });
  }

  return comments;
}

export function translateComments(
  filePath: string,
  target: Language
): CommentResult {
  const original = extractComments(filePath);
  const translated: Comment[] = original.map((comment) => {
    if (/^[\s\d.,;:\/\-_@#$%^&*()=+]+$/m.test(comment.content)) {
      return { ...comment };
    }

    const result = translator.translate(comment.content, {
      source: 'pt',
      target,
      fallback: comment.content,
    });

    return {
      ...comment,
      content: result.matched ? result.text : comment.content,
    };
  });

  return { file: filePath, original, translated };
}

export function replaceCommentsInFile(
  filePath: string,
  translated: CommentResult
): void {
  let content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (const tc of translated.translated) {
    const origComment = translated.original.find(
      (o) => o.line === tc.line && o.type === tc.type
    );
    if (!origComment || origComment.content === tc.content) continue;

    const lineIdx = tc.line - 1;
    if (lineIdx < 0 || lineIdx >= lines.length) continue;

    if (tc.type === 'line') {
      const oldComment = `//${origComment.content}`;
      const newComment = `//${tc.content}`;
      lines[lineIdx] = lines[lineIdx].replace(oldComment, newComment);
    }
  }

  writeFileSync(filePath, lines.join('\n'), 'utf-8');
}

export function extractTranslatableStrings(filePath: string): string[] {
  const comments = extractComments(filePath);
  return comments
    .filter((c) => /[a-zA-ZÀ-ÿ]/.test(c.content))
    .map((c) => c.content);
}
