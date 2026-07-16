import type { FeedOptions, Item } from 'feed'
import type { RenderRule } from 'markdown-it/lib/renderer.mjs'
import { Feed } from 'feed'
import fs from 'fs-extra'
import MarkdownIt from 'markdown-it'
import {
  AUTHOR,
  getPublishedPosts,
  pageImageUrl,
  pageUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from './content'

interface RenderEnvironment {
  pageUrl: string
}

const markdown = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
})

const defaultImageRenderer = markdown.renderer.rules.image
const defaultLinkRenderer = markdown.renderer.rules.link_open

markdown.renderer.rules.image = absoluteAttributeRenderer('src', defaultImageRenderer)
markdown.renderer.rules.link_open = absoluteAttributeRenderer('href', defaultLinkRenderer)

const posts = getPublishedPosts()
const options: FeedOptions = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  id: `${SITE_URL}/`,
  link: `${SITE_URL}/`,
  language: 'zh-CN',
  copyright: `© ${SITE_NAME}`,
  author: AUTHOR,
  image: `${SITE_URL}/avatar.png`,
  favicon: `${SITE_URL}/favicon-32x32.png`,
  feedLinks: {
    json: `${SITE_URL}/feed.json`,
    atom: `${SITE_URL}/feed.atom`,
    rss: `${SITE_URL}/feed.xml`,
  },
}

const items: Item[] = posts.map((post) => {
  const link = pageUrl(post.route)
  return {
    title: post.frontmatter.title.trim(),
    id: link,
    link,
    date: post.date!,
    description: post.description,
    content: markdown.render(post.cleanContent, { pageUrl: link } satisfies RenderEnvironment),
    author: [AUTHOR],
    image: pageImageUrl(post),
  }
})

const feed = new Feed(options)
items.forEach(item => feed.addItem(item))

const outputs = {
  'dist/feed.xml': feed.rss2(),
  'dist/feed.atom': feed.atom1(),
  'dist/feed.json': feed.json1(),
}

validateFeeds(outputs, items.length)
await Promise.all(Object.entries(outputs).map(([file, content]) => fs.outputFile(file, content, 'utf-8')))
console.log(`[feed] Generated RSS, Atom, and JSON feeds with ${items.length} posts.`)

function absoluteAttributeRenderer(attribute: 'src' | 'href', fallback?: RenderRule): RenderRule {
  return (tokens, index, options, env: RenderEnvironment, self) => {
    const value = tokens[index].attrGet(attribute)
    if (value)
      tokens[index].attrSet(attribute, absoluteContentUrl(value, env.pageUrl))
    return fallback ? fallback(tokens, index, options, env, self) : self.renderToken(tokens, index, options)
  }
}

function absoluteContentUrl(value: string, base: string): string {
  if (/^(?:data:|mailto:|tel:|javascript:)/i.test(value))
    return value
  return new URL(value, base).href
}

function validateFeeds(outputs: Record<string, string>, expectedItems: number) {
  const rss = outputs['dist/feed.xml']
  const atom = outputs['dist/feed.atom']
  const json = JSON.parse(outputs['dist/feed.json'])

  if (!/^<\?xml[\s\S]*<rss\b/.test(rss) || !rss.includes('</rss>'))
    throw new Error('[feed] RSS output has an invalid root structure.')
  if (!/^<\?xml[\s\S]*<feed\b/.test(atom) || !atom.includes('</feed>'))
    throw new Error('[feed] Atom output has an invalid root structure.')
  if ((rss.match(/<item>/g) || []).length !== expectedItems)
    throw new Error('[feed] RSS item count does not match the published post count.')
  if ((atom.match(/<entry>/g) || []).length !== expectedItems)
    throw new Error('[feed] Atom entry count does not match the published post count.')
  if (!Array.isArray(json.items) || json.items.length !== expectedItems)
    throw new Error('[feed] JSON Feed item count does not match the published post count.')
}
