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

// Convert TipTap task list items to GFM markdown
td.addRule('taskItem', {
  filter: (node) => node.getAttribute('data-type') === 'taskItem',
  replacement: (content, node) => {
    const checked = node.getAttribute('data-checked') === 'true'
    // Content from TipTap taskItem has a <div> wrapper for text and a <label> for the checkbox
    // Use the div's text if available; otherwise fall back to trimmed content
    const div = node.querySelector('div')
    const text = (div ? div.textContent : content).trim()
    return `- [${checked ? 'x' : ' '}] ${text}\n`
  },
})

// Wrap the task list container (prevent default UL handling)
td.addRule('taskList', {
  filter: (node) => node.nodeName === 'UL' && node.getAttribute('data-type') === 'taskList',
  replacement: (content) => `\n\n${content.replace(/^\n+|\n+$/g, '')}\n\n`,
})

marked.setOptions({ gfm: true, breaks: false })

// Convert GFM task list HTML (produced by marked) to TipTap's data-type format
function convertGfmToTiptapTaskList(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html')
  const root = doc.querySelector('div')

  root.querySelectorAll('ul').forEach((ul) => {
    if (!ul.querySelector('input[type="checkbox"]')) return
    ul.setAttribute('data-type', 'taskList')
    ul.querySelectorAll('li').forEach((li) => {
      const checkbox = li.querySelector('input[type="checkbox"]')
      if (!checkbox) return
      const isChecked = checkbox.hasAttribute('checked')
      li.setAttribute('data-type', 'taskItem')
      li.setAttribute('data-checked', String(isChecked))
      checkbox.remove()
      // Wrap bare inline content in <p> so TipTap parses it correctly
      if (!li.querySelector('p, ul, ol, h1, h2, h3, h4, h5, h6, pre, blockquote')) {
        const p = doc.createElement('p')
        p.innerHTML = li.innerHTML.trim()
        li.innerHTML = ''
        li.appendChild(p)
      }
    })
  })

  return root.innerHTML
}

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
  const html = marked.parse(md)
  return convertGfmToTiptapTaskList(html)
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
