import fs from 'fs-extra'
import { getAllContent, pageUrl, publicationReason, SITE_URL, warnSkippedPage } from './content'

const pages = getAllContent().filter((page) => {
  if (page.is404 || page.route.includes('[') || page.frontmatter.noindex === true)
    return false

  const reason = publicationReason(page)
  warnSkippedPage(page, reason)
  return reason === 'published'
})

const urls = pages.map((page) => {
  const lastmod = page.date ? `\n    <lastmod>${escapeXml(page.date.toISOString())}</lastmod>` : ''
  return `  <url>\n    <loc>${escapeXml(pageUrl(page.route))}</loc>${lastmod}\n  </url>`
})

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`

validateSitemap(sitemap, pages.length)
await fs.outputFile('dist/sitemap.xml', sitemap, 'utf-8')
console.log(`[sitemap] Generated ${pages.length} URLs.`)

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function validateSitemap(xml: string, expectedUrls: number) {
  if (!xml.startsWith('<?xml') || !xml.includes('<urlset ') || !xml.trimEnd().endsWith('</urlset>'))
    throw new Error('[sitemap] Generated sitemap has an invalid root structure.')
  if ((xml.match(/<url>/g) || []).length !== expectedUrls)
    throw new Error('[sitemap] Generated sitemap URL count does not match its source pages.')
  if (xml.includes('antfu.me') || !xml.includes(SITE_URL))
    throw new Error('[sitemap] Generated sitemap contains an unexpected site URL.')
}
