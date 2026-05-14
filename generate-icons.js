// Run once with: node generate-icons.js
// Generates PNG icons for the PWA manifest using Canvas API (Node 18+)
// If you don't have node-canvas, replace these with any 192x192 and 512x512 PNGs
// and save them as public/icons/icon-192.png and public/icons/icon-512.png

import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'

function drawIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const p = size / 192

  // Background
  ctx.fillStyle = '#2c1a0e'
  ctx.roundRect(0, 0, size, size, 16 * p)
  ctx.fill()

  // Notebook body
  ctx.fillStyle = '#fffef9'
  ctx.roundRect(20 * p, 16 * p, size - 32 * p, size - 28 * p, 6 * p)
  ctx.fill()

  // Spine
  ctx.fillStyle = '#e8761a'
  ctx.roundRect(20 * p, 16 * p, 12 * p, size - 28 * p, 4 * p)
  ctx.fill()

  // Lines
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'
  ctx.lineWidth = 1.5 * p
  const lineStart = 48 * p
  const lineEnd = size - 20 * p
  const lineLeft = 42 * p
  for (let y = 72 * p; y < size - 40 * p; y += 20 * p) {
    ctx.beginPath()
    ctx.moveTo(lineLeft, y)
    ctx.lineTo(lineEnd, y)
    ctx.stroke()
  }

  return canvas.toBuffer('image/png')
}

mkdirSync('./public/icons', { recursive: true })
writeFileSync('./public/icons/icon-192.png', drawIcon(192))
writeFileSync('./public/icons/icon-512.png', drawIcon(512))
console.log('Icons generated!')
