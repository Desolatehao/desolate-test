import { resolve } from 'node:path'
import MarkdownItShiki from '@shikijs/markdown-it'
import { transformerNotationDiff, transformerNotationHighlight, transformerNotationWordHighlight } from '@shikijs/transformers'
import { rendererRich, transformerTwoslash } from '@shikijs/twoslash'
import Vue from '@vitejs/plugin-vue'
import fs from 'fs-extra'
import matter from 'gray-matter'
import anchor from 'markdown-it-anchor'
import GitHubAlerts from 'markdown-it-github-alerts'
import LinkAttributes from 'markdown-it-link-attributes'
import MarkdownItMagicLink from 'markdown-it-magic-link'
// @ts-expect-error missing types
import TOC from 'markdown-it-table-of-contents'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import Markdown from 'unplugin-vue-markdown/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import Exclude from 'vite-plugin-optimize-exclude'
import SVG from 'vite-svg-loader'
import {
  generatedOgPath,
  normalizeLanguage,
  openGraphLocale,
  pageImageUrl,
  pageUrl,
  publicationReason,
  readContentFile,
  SITE_NAME,
  warnSkippedPage,
} from './scripts/content'
import { generateOg, generateOgFromImage } from './scripts/og'
import { slugify } from './scripts/slugify'

const ogPromises = new Map<string, Promise<void>>()

export default defineConfig({
  resolve: {
    alias: [
      { find: '~/', replacement: `${resolve(__dirname, 'src')}/` },
    ],
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      '@vueuse/core',
      'dayjs',
      'dayjs/plugin/localizedFormat',
    ],
  },
  plugins: [
    UnoCSS(),

    VueRouter({
      extensions: ['.vue', '.md'],
      routesFolder: 'pages',
      // logs: true,
      extendRoute(route) {
        const path = route.components.get('default')
        if (!path)
          return

        if (!path.includes('projects.md') && path.endsWith('.md')) {
          const { data } = matter(fs.readFileSync(path, 'utf-8'))
          route.addToMeta({
            frontmatter: data,
          })
        }
      },
      beforeWriteFiles(rootRoute) {
        for (const route of [...rootRoute]) {
          const filePath = route.component
          if (!filePath || !filePath.includes('/pages/posts/') || filePath.endsWith('/index.md'))
            continue

          const page = readContentFile(filePath)
          const reason = publicationReason(page)
          warnSkippedPage(page, reason)
          if (reason !== 'published')
            route.delete()
        }
      },
    }),

    Vue({
      include: [/\.vue$/, /\.md$/],
    }),

    Markdown({
      wrapperComponent: id => id.includes('/demo/')
        ? 'WrapperDemo'
        : 'WrapperPost',
      wrapperClasses: (id, code) => code.includes('@layout-full-width')
        ? ''
        : 'prose m-auto slide-enter-content',
      headEnabled: true,
      exportFrontmatter: false,
      exposeFrontmatter: false,
      exposeExcerpt: false,
      markdownItOptions: {
        quotes: '""\'\'',
      },
      async markdownItSetup(md) {
        md.use(await MarkdownItShiki({
          themes: {
            dark: 'vitesse-dark',
            light: 'vitesse-light',
          },
          langs: [
            'applescript',
            'javascript',
            'typescript',
            'vue',
            'html',
            'css',
            'bash',
            'shell',
            'json',
            'markdown',
            'python',
            'dockerfile',
            'ini',
            'yaml',
            'sql',
            'go',
            'rust',
            'java',
            'c',
            'cpp',
            'php',
          ],
          defaultColor: false,
          cssVariablePrefix: '--s-',
          transformers: [
            transformerTwoslash({
              explicitTrigger: true,
              renderer: rendererRich(),
            }),
            transformerNotationDiff(),
            transformerNotationHighlight(),
            transformerNotationWordHighlight(),
          ],
        }))

        md.use(anchor, {
          slugify,
          permalink: anchor.permalink.linkInsideHeader({
            symbol: '#',
            renderAttrs: () => ({ 'aria-hidden': 'true' }),
          }),
        })

        md.use(LinkAttributes, {
          matcher: (link: string) => /^https?:\/\//.test(link),
          attrs: {
            target: '_blank',
            rel: 'noopener',
          },
        })

        md.use(TOC, {
          includeLevel: [1, 2, 3, 4],
          slugify,
          containerHeaderHtml: '<div class="table-of-contents-anchor"><div class="i-ri-menu-2-fill" /></div>',
        })

        md.use(MarkdownItMagicLink, {
          linksMap: {
            'NuxtLabs': { link: 'https://nuxtlabs.com', imageUrl: 'https://nuxtlabs.com/nuxt.png' },
            'Vitest': 'https://github.com/vitest-dev/vitest',
            'Slidev': 'https://github.com/slidevjs/slidev',
            'VueUse': 'https://github.com/vueuse/vueuse',
            'UnoCSS': 'https://github.com/unocss/unocss',
            'Elk': 'https://github.com/elk-zone/elk',
            'Type Challenges': 'https://github.com/type-challenges/type-challenges',
            'Vue': 'https://github.com/vuejs/core',
            'Nuxt': 'https://github.com/nuxt/nuxt',
            'Vite': 'https://github.com/vitejs/vite',
            'Shiki': 'https://github.com/shikijs/shiki',
            'Twoslash': 'https://github.com/twoslashes/twoslash',
            'ESLint Stylistic': 'https://github.com/eslint-stylistic/eslint-stylistic',
            'Unplugin': 'https://github.com/unplugin',
            'Nuxt DevTools': 'https://github.com/nuxt/devtools',
            'Vite PWA': 'https://github.com/vite-pwa',
            'i18n Ally': 'https://github.com/lokalise/i18n-ally',
            'ESLint': 'https://github.com/eslint/eslint',
            'Astro': 'https://github.com/withastro/astro',
            'TwoSlash': 'https://github.com/twoslashes/twoslash',
            'Anthony Fu Collective': { link: 'https://opencollective.com/antfu', imageUrl: 'https://github.com/antfu-collective.png' },
            'Netlify': { link: 'https://netlify.com', imageUrl: 'https://github.com/netlify.png' },
            'Stackblitz': { link: 'https://stackblitz.com', imageUrl: 'https://github.com/stackblitz.png' },
            'Vercel': { link: 'https://vercel.com', imageUrl: 'https://github.com/vercel.png' },
          },
          imageOverrides: [
            ['https://github.com/vuejs/core', 'https://vuejs.org/logo.svg'],
            ['https://github.com/nuxt/nuxt', 'https://nuxt.com/assets/design-kit/icon-green.svg'],
            ['https://github.com/vitejs/vite', 'https://vitejs.dev/logo.svg'],
            ['https://github.com/sponsors', 'https://github.com/github.png'],
            ['https://github.com/sponsors/antfu', 'https://github.com/github.png'],
            ['https://nuxtlabs.com', 'https://github.com/nuxtlabs.png'],
            [/opencollective\.com\/vite/, 'https://github.com/vitejs.png'],
            [/opencollective\.com\/elk/, 'https://github.com/elk-zone.png'],
          ],
        })

        md.use(GitHubAlerts)
      },
      frontmatterPreprocess(frontmatter, options, id, defaults) {
        if (!id.endsWith('.md'))
          return { head: defaults(frontmatter, options), frontmatter }

        const page = readContentFile(id)
        const language = normalizeLanguage(frontmatter.lang)
        const image = pageImageUrl({ ...page, frontmatter })

        frontmatter.description = typeof frontmatter.description === 'string' && frontmatter.description.trim()
          ? frontmatter.description.trim()
          : page.description
        frontmatter.image = image
        frontmatter.htmlAttrs = {
          ...(frontmatter.htmlAttrs as Record<string, string> || {}),
          lang: language,
        }

        const ogPath = generatedOgPath(page)
        if (ogPath && !page.frontmatter.image) {
          const output = resolve('dist', ogPath.slice(1))
          if (!ogPromises.has(output)) {
            const sourceImage = `${id.slice(0, -3)}.png`
            ogPromises.set(
              output,
              fs.existsSync(sourceImage)
                ? generateOgFromImage(sourceImage, output)
                : generateOg(frontmatter.title!.trim(), output),
            )
          }
        }

        const head = defaults(frontmatter, options) || {}
        const meta = (head.meta ||= []) as Record<string, any>[]
        const link = (head.link ||= []) as Record<string, any>[]

        meta.push(
          { property: 'og:site_name', content: SITE_NAME },
          { property: 'og:type', content: page.isPost ? 'article' : 'website' },
          { property: 'og:locale', content: openGraphLocale(language) },
          { property: 'og:image:alt', content: frontmatter.title || SITE_NAME },
          { property: 'og:image:type', content: 'image/png' },
          { name: 'twitter:image:alt', content: frontmatter.title || SITE_NAME },
          { name: 'twitter:card', content: 'summary_large_image' },
        )

        if (!page.frontmatter.image || page.frontmatter.image === '/og.png') {
          meta.push(
            { property: 'og:image:width', content: '1200' },
            { property: 'og:image:height', content: '630' },
          )
        }

        if (page.isPost && page.date) {
          meta.push(
            { property: 'article:published_time', content: page.date.toISOString() },
            { property: 'article:author', content: SITE_NAME },
          )
        }

        if (page.is404) {
          meta.push({ name: 'robots', content: 'noindex, nofollow' })
        }
        else {
          meta.push({ property: 'og:url', content: pageUrl(page.route) })
          link.push({ rel: 'canonical', href: pageUrl(page.route) })
        }

        return { head, frontmatter }
      },
    }),

    AutoImport({
      imports: [
        'vue',
        VueRouterAutoImports,
        '@vueuse/core',
      ],
    }),

    Components({
      extensions: ['vue', 'md'],
      dts: true,
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        IconsResolver({
          componentPrefix: '',
        }),
      ],
    }),

    Inspect(),

    Icons({
      defaultClass: 'inline',
      defaultStyle: 'vertical-align: sub;',
    }),

    SVG({
      svgo: false,
      defaultImport: 'url',
    }),

    Exclude(),

    {
      name: 'await',
      async closeBundle() {
        await Promise.all(ogPromises.values())
        await generateOg('Desolate Hao', resolve('dist/og.png'))
        ogPromises.clear()
      },
    },
  ],

  build: {
    rollupOptions: {
      onwarn(warning, next) {
        if (warning.code !== 'UNUSED_EXTERNAL_IMPORT')
          next(warning)
      },
    },
  },

  ssgOptions: {
    formatting: 'minify',
    includedRoutes(paths) {
      return [
        ...paths.filter(path => !path.includes(':') && !path.includes('*')),
        '/404',
      ]
    },
  },
})
