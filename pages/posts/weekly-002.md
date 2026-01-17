---
title: "周报 #2 - 平淡生活、莫向外求"
lang: zh
date: 2026-01-17
---
本篇是关于 `2026-01-12`至`2026-01-17`生活与思考。

最近减少了游戏与抖音，感觉时间一下子就多了起来，生活里感到了有点空旷，总是想给自己找点事情做，改改了博客，还有就是找到了些有趣的书看看。

## 博客变动

这周把之前原先的`Hugo`的`remark42`移植到了目前这个博客，这里贴一下配置
采用了`Docker + Caddy + Remark42` 
```yaml
services:
  remark42:
    image: ghcr.io/umputun/remark42:latest
    container_name: "remark42"
    restart: always
    network_mode: "host"

    environment:
      - REMARK_URL=https://comments.desolatehao.top
      - SITE_ID=remark
      - SECRET=自行设置密钥
      - DEBUG=true
      - AUTH_ANON=true
      - SIMPLE_CAPTCHA=true
      - MAX_COMMENTS_PER_MINUTE=5

      # 通知配置
      - NOTIFY_USERS=email
      - NOTIFY_ADMINS=email
      - NOTIFY_EMAIL_FROM=desolatehao@gmail.com
      - ADMIN_SHARED_EMAIL=desolatehao@gmail.com

      # 认证配置
      - AUTH_GITHUB_CID=需要去GitHub申请令牌
      - AUTH_GITHUB_CSEC=同上
      
      # SMTP 配置 （之前一直尝试使用465但是会出现无法链接的情况
      - SMTP_HOST=smtp.gmail.com
      - SMTP_PORT=587
      - SMTP_TLS=false
      - SMTP_STARTTLS=true
      - SMTP_USERNAME=desolatehao@gmail.com
      - SMTP_PASSWORD=自行去Google生成应用密钥
      - AUTH_EMAIL_FROM=desolatehao@gmail.com

      - ALLOWED_HOSTS=https://desolatehao.top,http://localhost:3333
      - CORS_ALLOWED_ORIGINS=https://desolatehao.top,http://localhost:3333

    volumes:
      - ./remark-data:/srv/var
```
在前端`Vue`配置中新建`Comments.vue`
```vue
<script setup lang="ts">
import { isDark } from '~/logics'

const route = useRoute()

// Remark42 configuration
const remarkConfig = {
  host: 'https://comments.desolatehao.top',
  site_id: 'remark',
  components: ['embed'],
  max_shown_comments: 10,
  theme: isDark.value ? 'dark' : 'light',
  locale: 'zh',
  show_email_subscription: false,
  simple_view: true,
}

// Function to initialize Remark42
function initRemark42() {
  const config = {
    ...remarkConfig,
    url: window.location.origin + route.path,
    theme: isDark.value ? 'dark' : 'light',
  }

  if (window.REMARK42) {
    if (window.REMARK42.destroy) {
      window.REMARK42.destroy()
    }
    window.REMARK42.createInstance(config)
  }
  else {
    // Set global config for the first load
    window.remark_config = config

    // Load script
    const script = document.createElement('script')
    script.src = `${remarkConfig.host}/web/embed.js`
    script.defer = true
    document.head.appendChild(script)
  }
}

onMounted(() => {
  // Delay initialization slightly to ensure DOM is ready and route is stable
  setTimeout(() => {
    initRemark42()
  }, 500)
})

// Watch for route changes to re-initialize
watch(
  () => route.path,
  () => {
    nextTick(() => {
      initRemark42()
    })
  },
)

// Watch for theme changes
watch(
  isDark,
  (val) => {
    if (window.REMARK42 && window.REMARK42.changeTheme) {
      window.REMARK42.changeTheme(val ? 'dark' : 'light')
    }
  },
)
</script>

<template>
  <div id="remark42" class="remark42" />
</template>

<style>
.remark42 {
  min-height: 100px;
  margin-top: 4rem;
  margin-bottom: 4rem;
}

/* Adjust Remark42 iframe width if needed */
#remark42 {
  width: 100%;
}
</style>
```

追加`shime.d.ts` 保证白夜模式切换正常
```ts
interface Remark42Instance {
  changeTheme: (theme: 'light' | 'dark') => void
  destroy: () => void
  createInstance: (config: any) => void
}

declare global {
  interface Window {
    REMARK42: Remark42Instance
    remark_config: any
  }
}
```

还有一个要做调整，识别路径显示组件 `WrapperPost.vue`
```vue
  <div v-if="route.path !== '/'" class="prose m-auto mt-8 mb-8 slide-enter animate-delay-500 print:hidden">
    <Comments v-if="route.path.startsWith('/posts/')" />
    <br>
    <span font-mono op50>> </span>
    <RouterLink
      :to="route.path.split('/').slice(0, -1).join('/') || '/'"
      class="font-mono op50 hover:op75"
      v-text="'cd ..'"
    />
  </div>
```

## 财务问题

最近在整理年度开销的时候发现有很多支出都是带有冲动消费，并且没有做好记录，整理起来也是有些棘手。也是从0开始了记账，花钱也确实稍微意识到一点是否有必要有此项消费的问题。希望自己能检查下去吧，也希望自己别做出假账了😋

## 书

最近开始看个人财富管理相关的数据，也是出入无门，先看起了《小狗钱钱》。颇为有趣的一本书，简单的儿童向故事，灌输了很多有意思的观点，比如：
1. 太多的人做事情犹豫不决，就是因为他们觉得没有完全弄懂这件事。真正付诸实践比纯粹的思考有用多了
2. 不是试试看，而是切实去行动！如果你只是抱着试试看的心态，那么你只会以失败告终，你会一事无成。‘尝试’纯粹是一种借口，你还没有做，就已经给自己想好了退路。不能试验，你只有两个选择--做或者不做
3. 尽可能少的偿还贷款--分期付款
4. 贷款的人应当遵守的原则，将不用于生活的那部分的钱的一半存起来，另一半用于偿还贷款
5. 债务人都应该在钱包里贴一张纸条，上面写着‘这真的有必要吗？’

其中关于分期付款的观点，我认为是和我之前看法不一致的地方。我曾经单纯的以为尽可能的提前偿还贷款能够减轻心理压力，但是无论小额还是大额分期付款，都应该提前计算利息，尽可能延长还款时长，此书提到，在延长还款时长的过程中，可以伴随着个人原始积累，让他成为下金蛋的鸡。我感觉如果是手机电脑此类一年两年内还清的倒是可以选择更长期限，但是对于车贷房贷等超长期的分期付款，贷款持续时间是会对精神状态施加压力的，而心态压力同时也是一种成本，这个还是需要不断平衡和调整个人心态来动态的看待问题。

下一本准备看《指数基金投资指南》，看后续进度吧，我也不知道能不能读下去，还是有很多好书在等着我呢😋


