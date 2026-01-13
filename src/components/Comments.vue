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
