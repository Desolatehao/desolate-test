# 项目结构说明

这是一个基于 Vue 3 + Vite 的个人博客项目，使用了 Markdown 来编写博客内容。

## 主要文件夹说明

### `/pages` - 页面内容
存放所有页面的 Markdown 文件，这些文件会被自动转换为路由页面。
- `index.md` - 首页
- `[...404].md` - 404 错误页面
- `bookmarks.md` - 书签页面
- `demos.md` - 演示项目列表
- `media.md` - 媒体消费记录（动漫、电影等）
- `notes.md` - 笔记页面
- `photos.md` - 照片展示页面
- `use.md` - 使用的硬件/软件列表
- `posts/` - 博客文章目录，所有博客文章都存放在这里

### `/src` - 源代码
项目的核心源代码目录。

#### `/src/components` - Vue 组件
- `NavBar.vue` - 顶部导航栏
- `Footer.vue` - 页脚
- `ListPosts.vue` - 博客文章列表组件
- `ListDemos.vue` - 演示项目列表组件
- `WrapperPost.vue` - 博客文章包装器
- `WrapperDemo.vue` - 演示项目包装器
- `ToggleTheme.vue` - 主题切换按钮
- `Logo.vue` - Logo 组件
- `photos/` - 照片相关组件
- `icons/` - 自定义图标组件
- `slides/` - 幻灯片相关组件
- `shiki/` - 代码高亮相关组件

#### `/src/styles` - 样式文件
- `main.css` - 主样式文件
- `prose.css` - 文章排版样式
- `markdown.css` - Markdown 特定样式

#### `/src/logics` - 业务逻辑
存放可复用的业务逻辑代码。

#### `/src/store` - 状态管理
使用 Pinia 进行状态管理。

### `/public` - 静态资源
存放不需要编译的静态资源文件，会被直接复制到构建输出目录。

### `/scripts` - 构建脚本
- `copy-fonts.ts` - 复制字体文件
- `rss.ts` - 生成 RSS 订阅
- `photos-manage.ts` - 照片管理脚本
- `img-compress-staged.ts` - 图片压缩脚本
- `redirects.ts` - 重定向配置生成

### `/photos` - 照片数据
存放照片文件及其元数据（JSON 格式）。

### `/demo` - 演示项目
存放演示项目的 Markdown 说明和视频文件。

### `/data` - 数据文件
- `media.ts` - 媒体消费数据
- `talks.ts` - 演讲数据（已删除相关页面）

## 配置文件

- `vite.config.ts` - Vite 构建配置
- `unocss.config.ts` - UnoCSS 原子化 CSS 配置
- `tsconfig.json` - TypeScript 配置
- `eslint.config.js` - ESLint 代码检查配置
- `package.json` - 项目依赖和脚本配置
- `netlify.toml` - Netlify 部署配置

## 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **路由**: unplugin-vue-router (文件系统路由)
- **样式**: UnoCSS (原子化 CSS)
- **Markdown**: unplugin-vue-markdown (支持在 Vue 中使用 Markdown)
- **代码高亮**: Shiki
- **状态管理**: Pinia
- **图标**: unplugin-icons
- **自动导入**: unplugin-auto-import, unplugin-vue-components

## 构建命令

- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm preview` - 预览构建结果
