'use client'

import { useMemo } from 'react'

/**
 * Minimal word-level diff (Myers-like) — no external dependencies.
 * Returns array of { value, added?, removed? } segments.
 */
function diffWords(oldStr, newStr) {
  const oldWords = oldStr.match(/\S+|\s+/g) || []
  const newWords = newStr.match(/\S+|\s+/g) || []

  const n = oldWords.length
  const m = newWords.length

  // Build LCS table
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1))
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] =
        oldWords[i - 1] === newWords[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }

  // Backtrack to build diff
  const parts = []
  let i = n
  let j = m
  const stack = [] // build in reverse, then flip

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      stack.push({ value: oldWords[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ value: newWords[j - 1], added: true })
      j--
    } else {
      stack.push({ value: oldWords[i - 1], removed: true })
      i--
    }
  }

  stack.reverse()

  // Merge consecutive segments of the same type
  for (const seg of stack) {
    const last = parts[parts.length - 1]
    if (last && !!last.added === !!seg.added && !!last.removed === !!seg.removed) {
      last.value += seg.value
    } else {
      parts.push({ ...seg })
    }
  }

  return parts
}

/**
 * Renders a git-diff-style visual comparing original text to AI-proposed text.
 * Removals are red with strikethrough, additions are green highlighted.
 */
export default function DiffView({ original, proposed }) {
  const parts = useMemo(() => {
    if (!original && !proposed) return []
    return diffWords(original || '', proposed || '')
  }, [original, proposed])

  if (!parts.length) return null

  return (
    <div
      className="prose prose-sm max-w-none font-mono whitespace-pre-wrap"
      style={{ fontSize: '15px', lineHeight: '1.85', color: 'var(--text-primary)' }}
    >
      {parts.map((part, i) => {
        if (part.added) {
          return (
            <span
              key={i}
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#16a34a',
                borderRadius: '2px',
                padding: '0 1px',
              }}
            >
              {part.value}
            </span>
          )
        }
        if (part.removed) {
          return (
            <span
              key={i}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#dc2626',
                textDecoration: 'line-through',
                borderRadius: '2px',
                padding: '0 1px',
                opacity: 0.7,
              }}
            >
              {part.value}
            </span>
          )
        }
        return <span key={i}>{part.value}</span>
      })}
    </div>
  )
}
