# Markdown 博客格式特性说明

这个博客项目支持丰富的 Markdown 格式和特殊功能。以下是你在编写博客时可以使用的所有特殊格式。

## 1. Front Matter (文章元数据)

每篇博客文章开头都需要包含 YAML 格式的元数据：

```markdown
---
title: 文章标题
date: 2025-01-01T00:00:00Z
lang: zh
duration: 5min
description: 文章描述（可选）
---
```

### 常用字段说明：
- `title`: 文章标题（必需）
- `date`: 发布日期，格式为 ISO 8601
- `lang`: 语言代码（`zh` 中文, `en` 英文, `ja` 日语等）
- `duration`: 阅读时长估计
- `description`: 文章描述，用于 SEO
- `image`: 自定义 OG 图片 URL（可选，不设置会自动生成）

## 2. 特殊布局控制

### 全宽布局
在文章中添加注释来使用全宽布局：

```markdown
<!-- @layout-full-width -->
```

这会移除文章的最大宽度限制，适合展示宽表格或大图。

## 3. Vue 组件集成

可以直接在 Markdown 中使用 Vue 组件：

```markdown
<ComponentName />
```

### 常用组件示例：

#### 照片组件
```markdown
<PhotoHelloTokyo1 />
<PhotoHelloTokyo2 />
```

#### YouTube 嵌入
```markdown
<YouTubeEmbed id="视频ID" />
```

#### 推文嵌入
```markdown
<Tweet id="推文ID" />
```

## 4. 代码高亮

### 基础代码块
使用三个反引号包裹代码，并指定语言：

````markdown
```typescript
const hello = 'world'
```
````

### Twoslash 类型提示
添加 `twoslash` 标记可以显示 TypeScript 类型信息：

````markdown
```ts twoslash
const num = 123
//    ^?
```
````

### 代码高亮和差异标记

#### 高亮特定行
````markdown
```js {2,4-6}
function hello() {
  console.log('highlighted')  // [!code highlight]
  const a = 1
  const b = 2  // [!code highlight]
  const c = 3  // [!code highlight]
  const d = 4  // [!code highlight]
}
```
````

#### 显示差异（添加/删除）
````markdown
```js
function hello() {
  console.log('removed')  // [!code --]
  console.log('added')    // [!code ++]
}
```
````

#### 高亮单词
````markdown
```js
const message = 'hello world'  // [!code word:hello]
```
````

## 5. Magic Link（自动链接）

项目配置了自动链接功能，可以直接使用花括号包裹项目名称：

```markdown
我在 {Vue} 和 {Nuxt} 工作
```

会自动转换为带图标的链接。支持的项目包括：
- `{Vue}`, `{Nuxt}`, `{Vite}`, `{Vitest}`
- `{UnoCSS}`, `{Slidev}`, `{VueUse}`
- `{NuxtLabs}`, `{Vercel}` 等

## 6. GitHub Alerts（提示框）

使用 GitHub 风格的提示框：

```markdown
> [!NOTE]
> 这是一个提示信息

> [!TIP]
> 这是一个技巧

> [!IMPORTANT]
> 这是重要信息

> [!WARNING]
> 这是警告信息

> [!CAUTION]
> 这是危险警告
```

## 7. 链接属性

外部链接会自动添加 `target="_blank"` 和 `rel="noopener"` 属性。

## 8. 目录（TOC）

在文章中添加目录：

```markdown
[[toc]]
```

会自动生成基于标题的目录。

## 9. 标题锚点

所有标题会自动生成锚点链接，点击标题旁的 `#` 符号可以复制链接。

## 10. Ruby 注音（日语/中文注音）

```markdown
<ruby lang="ja">東京<rp>(</rp><rt>Tokyo</rt><rp>)</rp></ruby>
```

显示效果：東京（Tokyo）

## 11. 内联样式和类名

可以直接使用 UnoCSS 的原子类：

```markdown
<span op75>半透明文字</span>
<div text-center>居中文本</div>
<p flex="~ gap-2">弹性布局</p>
```

## 12. 图标

使用 Iconify 图标：

```markdown
<div i-ri-github-line />
<span i-carbon-logo-vue />
```

## 13. 数学公式

### 行内公式
```markdown
这是行内公式 $E = mc^2$
```

### 块级公式
```markdown
$$
\frac{n!}{k!(n-k)!} = \binom{n}{k}
$$
```

## 14. 表格

标准 Markdown 表格：

```markdown
| 列1 | 列2 | 列3 |
| --- | --- | --- |
| 内容1 | 内容2 | 内容3 |
```

## 15. Shiki Magic Move（代码动画）

用于展示代码变化的动画效果：

```markdown
<ShikiMagicMoveDemo />
```

## 示例文章结构

```markdown
---
title: 我的第一篇博客
date: 2025-01-01T00:00:00Z
lang: zh
duration: 5min
---

# 主标题

这是一段介绍文字，我在使用 {Vue} 和 {Vite} 开发。

> [!TIP]
> 这是一个有用的提示

## 代码示例

```typescript twoslash
const greeting: string = 'Hello World'
//    ^?
```

## 照片展示

<PhotoExample />

## 总结

这是总结部分。
```

## 注意事项

1. **图片路径**：图片应放在 `public` 目录下，引用时使用绝对路径 `/path/to/image.jpg`
2. **组件命名**：自定义组件需要放在 `src/components` 目录下
3. **自动导入**：Vue 组件和 Composition API 会自动导入，无需手动 import
4. **OG 图片**：如果文章同目录下有同名 `.png` 文件，会自动作为 OG 图片；否则会根据标题自动生成
