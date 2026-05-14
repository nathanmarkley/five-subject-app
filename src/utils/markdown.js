import { marked } from 'marked'
import TurndownService from 'turndown'

const td = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
})

// Preserve strikethrough
td.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: (content) => `~~${content}~~`,
})

// Preserve highlight spans (TipTap renders as <mark>)
td.addRule('highlight', {
  filter: 'mark',
  replacement: (content) => `==${content}==`,
})

// Preserve images that have width or alignment attributes as raw HTML
td.addRule('richImage', {
  filter: (node) =>
    node.nodeName === 'IMG' &&
    (node.getAttribute('width') || node.getAttribute('data-align')),
  replacement: (content, node) => `\n\n${node.outerHTML}\n\n`,
})

marked.setOptions({ gfm: true, breaks: false })

// --- Frontmatter ---

export function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/m)
  if (!match) return { frontmatter: {}, body: raw }

  const lines = match[1].split(/\r?\n/)
  const fm = {}
  for (const line of lines) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    const val = line.slice(colonIdx + 1).trim()
    if (key === 'tags') {
      fm.tags = val.replace(/^\[|\]$/g, '').split(',').map((t) => t.trim()).filter(Boolean)
    } else {
      fm[key] = val
    }
  }
  return { frontmatter: fm, body: match[2] }
}

export function serializeFrontmatter(fm) {
  const tags = Array.isArray(fm.tags) ? fm.tags : []
  return [
    '---',
    `title: ${fm.title || 'Untitled'}`,
    `date: ${fm.date || new Date().toISOString().slice(0, 10)}`,
    `tags: [${tags.join(', ')}]`,
    '---',
    '',
  ].join('\n')
}

// --- Conversion ---

export function markdownToHtml(md) {
  return marked.parse(md)
}

export function htmlToMarkdown(html) {
  return td.turndown(html)
}

// --- File helpers ---

export function buildNoteContent(frontmatter, html) {
  return serializeFrontmatter(frontmatter) + htmlToMarkdown(html)
}

export function parseNoteFile(raw) {
  const { frontmatter, body } = parseFrontmatter(raw)
  const html = markdownToHtml(body)
  return { frontmatter, html, body }
}

export function noteTitle(frontmatter, fileName) {
  return frontmatter.title || fileName.replace(/\.md$/, '').replace(/-/g, ' ')
}

export function slugify(str) {
  return (str || 'untitled')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'untitled'
}

export function notePreview(body, maxLen = 120) {
  return body.replace(/#+\s/g, '').replace(/[*_`~]/g, '').trim().slice(0, maxLen)
}
