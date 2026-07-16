export type MediaType = 'sample'

export interface MediaRecord {
  name: string
  creator?: string
  note?: string
  lang?: string
}

export const media: Record<MediaType, MediaRecord[]> = {
  sample: [
    {
      name: '葬送的芙莉莲',
      creator: '山田钟人',
      note: '布局示例',
      lang: 'zh-Hans',
    },
    {
      name: '赛博朋克：边缘行者',
      creator: 'CD Projekt Red',
      note: '布局示例',
      lang: 'zh-Hans',
    },
    {
      name: '钢之炼金术师 FULLMETAL ALCHEMIST',
      creator: '荒川弘',
      note: '布局示例',
      lang: 'zh-Hans',
    },
  ],
}
