import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    frontmatter: any
  }
}

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
