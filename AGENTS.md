# 博客维护交接说明

> 本文件用于 Codex 后续窗口交接，不属于博客产品文件。本文件已纳入版本控制，但除非用户明确要求，否则不要修改或提交。

## 当前状态

最后核对：2026-07-16。

- 仓库：`/Users/desolatehao/Documents/Obsidian/desolate-test`
- 分支：`main`
- 远端：`git@github.com:Desolatehao/desolate-test.git`
- 当前产品提交：`dfcf16d fix: prioritize notes in navigation`
- 本轮相关提交：
  - `cf4d7f8 fix: replace legacy OG branding`
  - `a53eb54 chore: hide legacy personal content`
  - `dfcf16d fix: prioritize notes in navigation`
- 生产站点：`https://desolatehao.top`
- 部署方式：推送 GitHub `main` 后由 Cloudflare Pages 自动构建部署。
- SEO、RSS、sitemap、404 和旧 Netlify/Antfu 重定向清理任务已完成并上线验证。
- 本地 `main` 包含尚待推送的 OG 品牌替换、旧作者个人页面隐藏和 Notes/Blog 导航顺序调整。
- 用户使用 Obsidian 直接编辑本仓库。
- `.obsidian/` 配置没有被本次任务修改。
- 用户草稿 `pages/posts/Blog-how-to-remark.md` 仍是未跟踪文件，并已使用 `draft: true` 明确阻止发布；不要擅自修改、删除、暂存或提交。

## Obsidian 写作是否受影响

日常使用 Obsidian 打开、编辑和保存 Markdown 不受影响：

- 没有安装或修改 Obsidian 插件。
- 没有修改 Obsidian 工作区、模板目录或附件设置。
- 没有改变现有文章文件的位置和基本 frontmatter 格式。
- 普通 `git add`、`git commit` 仍可正常使用。
- 当前 pre-commit 只对暂存的 JS/TS/Vue/JSON 等代码文件执行 ESLint，不会自动改写 Markdown 文章。

需要注意的是，推送到 `main` 会触发 Cloudflare Pages 构建。构建会根据文章 frontmatter 和正文决定是否公开发布，因此“提交 Git”和“公开发布”之间有明确规则。

## 推荐写作流程

在 `pages/posts/` 新建文章时，写作阶段建议使用：

```yaml
---
title: 文章标题
lang: zh
date: 2026-07-16
type: note
draft: true
---
```

写作过程中可以正常提交和推送 Git。只要保留 `draft: true`，文章就不会进入：

- 博客路由和文章列表
- 静态 HTML 与前端路由 chunk
- RSS、Atom 和 JSON Feed
- `sitemap.xml`
- 自动生成的公开 OG 图片

准备发布时：

1. 确认 `title` 非空。
2. 确认 `date` 是有效日期，并且不晚于部署时间。
3. 确认正文不为空。
4. 删除 `draft: true`，或改成 `draft: false`。
5. 提交并推送 `main`，等待 Cloudflare Pages 部署。

不要只依赖“正文为空”来保护草稿。空正文目前也会被自动跳过，但一旦开始写入正文，如果没有 `draft: true` 且日期已经到达，下一次推送就会公开发布。

## 发布判定

共享规则位于 `scripts/content.ts`，路由、Feed 和 sitemap 使用同一套判定：

- `draft: true`：不发布。
- 日期晚于构建时间：不发布。
- 去掉 HTML 注释和单独一行的 `[[toc]]` 后正文为空：不发布，并在构建时警告。
- 其他符合要求的文章：发布。
- `draft` 如果存在，必须是 YAML boolean，即 `true` 或 `false`，不要写成字符串 `"true"`。
- `pages/posts/` 中的文章必须有非空 `title` 和有效 `date`；否则生产构建会失败，防止错误内容静默上线。

日期在 Obsidian YAML 中可继续使用现有格式：

```yaml
date: 2026-07-16
```

## Obsidian Markdown 注意事项

- `[[toc]]` 是项目已有的目录标记，可以继续使用；Feed 会自动移除这个标记。
- 博客渲染器主要支持标准 Markdown。面向公开网页的链接和图片建议使用 `[文字](URL)`、`![说明](路径)`。
- Obsidian 的普通 Wiki Link，例如 `[[另一篇笔记]]` 或 `![[附件.png]]`，没有在本次任务中新增网站转换支持；是否能在网页正确显示取决于原有 Markdown 构建能力。
- HTML 注释可以用于写作备注；发布判定和摘要生成会忽略注释内容。

## Git 注意事项

- 本地 `git commit` 本身不会部署，推送 GitHub `main` 后才会触发生产部署。
- 显式暂存准备提交的文件，避免把未完成草稿或无关改动一起提交。
- 不要默认使用会收集所有未跟踪文件的暂存方式。
- 运行 `pnpm build` 后检查 `git status`；`typed-router.d.ts` 可能被路由生成器刷新，除非路由类型变化是本次任务的一部分，否则不要顺手提交生成漂移。
- `AGENTS.md` 是已跟踪的交接文件，仅在用户明确要求时更新和提交。

当前应长期保留且不要自动提交的用户文件：

```text
pages/posts/Blog-how-to-remark.md
```

## 已完成能力

- 页面 canonical、description、`og:url`、`og:site_name`、本站 OG 图片和语言元数据。
- 文章 `article:published_time` 与作者元数据。
- `robots.txt` 声明 `https://desolatehao.top/sitemap.xml`。
- `sitemap.xml` 只包含公开页面和已发布文章。
- RSS、Atom、JSON Feed 只包含已发布文章，并验证结构和条目数。
- Feed 内相对链接和图片会转换为绝对 URL。
- 顶层 `404.html` 已生成，Cloudflare 对未知路径返回 HTTP 404。
- `/rss` 只重定向到本站 `/feed.xml`。
- 失效的 Netlify CMS、Netlify 配置、Antfu 重定向和 Octokit 生成链已删除。
- OG 分享图和元数据中的旧作者品牌已替换为 Desolatehao。
- `Media`、`Photos` 的前端入口已注释隐藏；`Media`、`Photos`、`Use`、`Bar` 页面带有 `noindex`，暂不进入公开索引。
- `Photos` 已精简为 3 张预览图片，`Media` 已精简为 3 条示例记录，便于后续确认实际展示效果。
- 首页大号切换器和右上角导航均按 `Notes`、`Blog` 顺序展示。

## 最近验证结果

以下结果最后验证于 2026-07-16，属于时间点快照；后续应以最新构建和生产检查为准。

- 本地 `pnpm build`：通过。
- 当前本地构建生成的 `sitemap.xml`：24 个本站 URL。
- 临时干净 clone 中 `pnpm install --frozen-lockfile`：通过。
- 临时干净 clone 中 `pnpm build`：通过。
- 生产 `sitemap.xml`：HTTP 200，28 个本站 URL。
- 生产 RSS、Atom、JSON Feed：HTTP 200，各 21 篇文章。
- 生产 `/rss`：301 到本站 `/feed.xml`。
- 生产 `/admin/`、`/blog`、`/github` 和随机不存在路径：HTTP 404。
- 用户空草稿不在路由、Feed、sitemap 或构建产物中。
- 全仓 `pnpm lint` 仍有大量历史 Markdown 格式问题；本次新增和修改的 TypeScript 文件单独 ESLint 检查通过。

## 后续 Codex 工作原则

1. 开始前先运行 `git status --short --branch`。
2. 把 Obsidian 中的未提交文章视为用户内容，不擅自格式化或改写。
3. 修改发布规则前，优先保证 `draft: true` 的文章可以安全提交和推送而不公开。
4. 涉及构建时同时验证路由、Feed、sitemap、OG 和 404。
5. 提交前确认用户草稿没有进入暂存区；`AGENTS.md` 仅在用户明确要求时暂存。
