import { dirname } from 'node:path'
import fs from 'fs-extra'
import sharp from 'sharp'

const ogSvg = fs.readFileSync('./scripts/og-template.svg', 'utf-8')
const ogAvatar = `data:image/jpeg;base64,${fs.readFileSync('./public/logo.jpg').toString('base64')}`

export async function generateOg(title: string, output: string) {
  await fs.mkdir(dirname(output), { recursive: true })
  const lines = wrapOgTitle(title)
  const fontSize = lines.length === 1 ? 58 : lines.length === 2 ? 52 : 46
  const lineHeight = fontSize * 1.35
  const firstLineY = lines.length === 1 ? 405 : lines.length === 2 ? 360 : 326

  const data: Record<string, string> = {
    avatar: ogAvatar,
    fontSize: String(fontSize),
    line1: escapeSvgText(lines[0] || ''),
    line2: escapeSvgText(lines[1] || ''),
    line3: escapeSvgText(lines[2] || ''),
    line1Y: String(firstLineY),
    line2Y: String(firstLineY + lineHeight),
    line3Y: String(firstLineY + lineHeight * 2),
  }
  const svg = ogSvg.replace(/\{\{([^}]+)\}\}/g, (_, name) => data[name] || '')

  console.log(`Generating ${output}`)
  try {
    await sharp(Buffer.from(svg))
      .png({ compressionLevel: 9 })
      .toFile(output)
  }
  catch (error) {
    console.error('Failed to generate og image', error)
    throw error
  }
}

export async function generateOgFromImage(source: string, output: string) {
  await fs.mkdir(dirname(output), { recursive: true })
  await sharp(source)
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .png({ compressionLevel: 9 })
    .toFile(output)
}

export function wrapOgTitle(title: string, maxLines = 3): string[] {
  const maxWidth = 18
  const chars = Array.from(title.trim().replace(/\s+/g, ' '))
  const lines: string[] = []
  let line = ''
  let width = 0
  let lastSpace = -1

  for (const char of chars) {
    const charWidth = measureOgChar(char)

    if (width + charWidth > maxWidth && line) {
      if (lastSpace > 0) {
        const overflow = line.slice(lastSpace + 1)
        lines.push(line.slice(0, lastSpace).trim())
        line = `${overflow}${char}`
        width = measureOgText(line)
      }
      else {
        lines.push(line.trim())
        line = char
        width = charWidth
      }
      lastSpace = line.lastIndexOf(' ')
    }
    else {
      line += char
      width += charWidth
      if (char === ' ')
        lastSpace = line.length - 1
    }

    if (lines.length === maxLines)
      break
  }

  if (lines.length < maxLines && line.trim())
    lines.push(line.trim())

  const consumed = lines.join('').replace(/\s/g, '').length
  const total = title.replace(/\s/g, '').length
  if (consumed < total) {
    const last = lines.length - 1
    lines[last] = `${lines[last].replace(/[.。…]+$/u, '').slice(0, -1)}…`
  }

  return lines
}

function measureOgText(text: string): number {
  return Array.from(text).reduce((width, char) => width + measureOgChar(char), 0)
}

function measureOgChar(char: string): number {
  if (/[\u2E80-\u9FFF\uF900-\uFAFF]/u.test(char))
    return 1
  if (char === ' ')
    return 0.35
  return /[A-Z0-9#@%&]/u.test(char) ? 0.7 : 0.55
}

function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
