import { basename, relative, resolve } from 'node:path'
import fg from 'fast-glob'
import fs from 'fs-extra'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'

export const SITE_URL = 'https://desolatehao.top'
export const SITE_NAME = 'Desolatehao'
export const SITE_DESCRIPTION = 'Desolatehao 的个人博客，记录生活、阅读、编程与网络安全。'
export const DEFAULT_LANGUAGE = 'zh-CN'
export const AUTHOR = {
  name: 'Desolatehao',
  email: 'hi@desolatehao.top',
  link: SITE_URL,
}

export interface ContentPage {
  filePath: string
  route: string
  frontmatter: Record<string, any>
  content: string
  cleanContent: string
  description: string
  isPost: boolean
  is404: boolean
  date?: Date
}

export type PublicationReason = 'published' | 'draft' | 'future' | 'empty'

const markdown = new MarkdownIt({ html: false })
const warnedFiles = new Set<string>()

export function readContentFile(filePath: string): ContentPage {
  const normalizedPath = filePath.replace(/[?#].*$/, '')
  const absolutePath = resolve(normalizedPath)
  const raw = fs.readFileSync(absolutePath, 'utf-8')
  const { data, content } = matter(raw)
  const route = routeFromFilePath(absolutePath)
  const isPost = route.startsWith('/posts/')

  validateDraft(data, normalizedPath)

  let date: Date | undefined
  if (isPost) {
    validateTitle(data.title, normalizedPath)
    date = parseDate(data.date, normalizedPath)
  }

  const cleanContent = stripNonContent(content)

  return {
    filePath: absolutePath,
    route,
    frontmatter: data,
    content,
    cleanContent,
    description: getDescription(data.description, cleanContent),
    isPost,
    is404: normalizedPath.endsWith('[...404].md'),
    date,
  }
}

export function getAllContent(): ContentPage[] {
  return fg.sync('pages/**/*.md', { onlyFiles: true })
    .sort()
    .map(readContentFile)
}

export function getPublishedPosts(now = new Date()): ContentPage[] {
  return getAllContent()
    .filter((page) => {
      if (!page.isPost)
        return false
      const reason = publicationReason(page, now)
      warnSkippedPage(page, reason)
      return reason === 'published'
    })
    .sort((a, b) => b.date!.getTime() - a.date!.getTime())
}

export function publicationReason(page: ContentPage, now = new Date()): PublicationReason {
  if (page.frontmatter.draft === true)
    return 'draft'
  if (page.isPost && page.date!.getTime() > now.getTime())
    return 'future'
  if (page.isPost && !page.cleanContent)
    return 'empty'
  return 'published'
}

export function warnSkippedPage(page: ContentPage, reason: PublicationReason) {
  if (reason === 'published' || warnedFiles.has(page.filePath))
    return

  warnedFiles.add(page.filePath)
  console.warn(`[content] Skipping ${relative(process.cwd(), page.filePath)} (${reason}).`)
}

export function routeFromFilePath(filePath: string): string {
  const relativePath = relative(process.cwd(), resolve(filePath)).replace(/\\/g, '/')
  if (!relativePath.startsWith('pages/') || !relativePath.endsWith('.md'))
    throw new Error(`[content] Cannot derive a page route from ${filePath}.`)

  let route = relativePath.slice('pages/'.length, -'.md'.length)
  if (route === 'index')
    return '/'
  route = route.replace(/\/index$/, '')
  return `/${route}`
}

export function pageUrl(route: string): string {
  return new URL(route, `${SITE_URL}/`).href
}

export function normalizeLanguage(language: unknown): string {
  if (typeof language !== 'string' || !language.trim())
    return DEFAULT_LANGUAGE

  const normalized = language.trim()
  if (normalized.toLowerCase() === 'zh')
    return 'zh-CN'
  return normalized
}

export function openGraphLocale(language: string): string {
  if (language === 'en')
    return 'en_US'
  if (language === 'ja')
    return 'ja_JP'
  return language.replace('-', '_')
}

export function generatedOgPath(page: ContentPage): string | undefined {
  if (page.is404 || basename(page.filePath, '.md') === 'index' || !page.frontmatter.title)
    return undefined
  return `/og/${basename(page.filePath, '.md')}.png`
}

export function pageImageUrl(page: ContentPage): string {
  const image = page.frontmatter.image
  if (typeof image === 'string' && image.trim())
    return new URL(image.trim(), `${SITE_URL}/`).href

  return pageUrl(generatedOgPath(page) || '/og.png')
}

function validateDraft(frontmatter: Record<string, any>, filePath: string) {
  if ('draft' in frontmatter && typeof frontmatter.draft !== 'boolean')
    throw new TypeError(`[content] "draft" must be a boolean in ${filePath}.`)
}

function validateTitle(title: unknown, filePath: string) {
  if (typeof title !== 'string' || !title.trim())
    throw new TypeError(`[content] Published posts require a non-empty title in ${filePath}.`)
}

function parseDate(value: unknown, filePath: string): Date {
  if (!(value instanceof Date) && typeof value !== 'string')
    throw new TypeError(`[content] Published posts require a valid date in ${filePath}.`)

  const date = value instanceof Date ? new Date(value) : new Date(value)
  if (Number.isNaN(date.getTime()))
    throw new TypeError(`[content] Published posts require a valid date in ${filePath}.`)
  return date
}

function stripNonContent(content: string): string {
  return content
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^\s*\[\[toc\]\]\s*$/gim, '')
    .trim()
}

function getDescription(description: unknown, content: string): string {
  if (typeof description === 'string' && description.trim())
    return description.trim()

  const text: string[] = []
  const tokens = markdown.parse(content.replace(/<[^>]+>/g, ' '), {})

  for (const token of tokens) {
    if (token.type === 'fence' || token.type === 'code_block')
      continue
    if (token.type !== 'inline' || !token.children)
      continue

    for (const child of token.children) {
      if (child.type === 'text' || child.type === 'code_inline' || child.type === 'image')
        text.push(child.content)
      else if (child.type === 'softbreak' || child.type === 'hardbreak')
        text.push(' ')
    }
    text.push(' ')
  }

  const normalized = text.join('').replace(/\s+/g, ' ').trim()
  if (!normalized)
    return SITE_DESCRIPTION
  return normalized.length > 180 ? `${normalized.slice(0, 177).trimEnd()}...` : normalized
}
