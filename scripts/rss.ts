import type { FeedOptions, Item } from 'feed'
import { dirname } from 'node:path'
import fg from 'fast-glob'
import { Feed } from 'feed'
import fs from 'fs-extra'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'

console.log('RSS SCRIPT RUNNING')

const DOMAIN = 'https://desolatehao.top'
const AUTHOR = {
  name: 'Desolatehao',
  email: 'hi@desolatehao.top',
  link: DOMAIN,
}
const markdown = MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
})

async function run() {
  await buildBlogRSS()
}

async function buildBlogRSS() {
  const files = await fg('pages/posts/*.md')
  console.log(`Found ${files.length} posts.`) // 建议添加此行，方便在编译时确认是否读取成功

  const options = {
    title: 'Desolatehao',
    description: 'Desolatehao Blog',
    id: 'https://desolatehao.top/',
    link: 'https://desolatehao.top/',
    copyright: '© Desolatehao',
    feedLinks: {
      json: 'https://desolatehao.top/feed.json',
      atom: 'https://desolatehao.top/feed.atom',
      rss: 'https://desolatehao.top/feed.xml',
    },
  }
  const posts: any[] = (
    await Promise.all(
      files.filter(i => !i.includes('index'))
        .map(async (i) => {
          const raw = await fs.readFile(i, 'utf-8')
          const { data, content } = matter(raw)

          // if (data.lang !== 'en')
          //  return

          const html = markdown.render(content)
            .replace('src="/', `src="${DOMAIN}/`)

          if (data.image?.startsWith('/'))
            data.image = DOMAIN + data.image

          return {
            ...data,
            date: new Date(data.date),
            content: html,
            author: [AUTHOR],
            link: DOMAIN + i.replace(/^pages/, '').replace(/\.md$/, ''),
          }
        }),
    ))
    .filter(Boolean)

  posts.sort((a, b) => (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0))

  await writeFeed('feed', options, posts)
}

async function writeFeed(name: string, options: FeedOptions, items: Item[]) {
  options.author = AUTHOR
  options.image = 'https://desolatehao.top/avatar.png'
  options.favicon = 'https://desolatehao.top/favicon-32x32.png'

  const feed = new Feed(options)

  items.forEach(item => feed.addItem(item))
  // items.forEach(i=> console.log(i.title, i.date))

  await fs.ensureDir(dirname(`./dist/${name}`))
  await fs.writeFile(`./dist/${name}.xml`, feed.rss2(), 'utf-8')
  await fs.writeFile(`./dist/${name}.atom`, feed.atom1(), 'utf-8')
  await fs.writeFile(`./dist/${name}.json`, feed.json1(), 'utf-8')
}

run()
