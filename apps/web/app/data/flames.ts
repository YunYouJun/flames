import type { FlamePreset } from '@yunyoujun/flame-engine'

export interface FlameEntry extends FlamePreset {
  slug: string
  name: string
  rankLabel: string
  epithet: string
  description: string
  interpretation: string
  sourceLabel: string
  sourceUrl: string
}

export const flameCatalog: FlameEntry[] = [
  {
    id: 'nihility',
    slug: 'nihility',
    rank: 2,
    rankLabel: '第二',
    name: '虚无吞炎',
    epithet: '生于虚无，吞噬万物',
    description: '诞生于虚无之中的黑色火焰，能够吞噬万物，并以此化作自身力量。',
    interpretation: '以近乎无光的火心、被吞没的边缘与随拖拽收束的涡流，表现“吞噬”而非普通燃烧。',
    sourceLabel: '《斗破苍穹》原著设定；百度百科“虚无吞炎”条目交叉核对',
    sourceUrl: 'https://baike.baidu.com/item/%E8%99%9A%E6%97%A0%E5%90%9E%E7%82%8E',
    kernel: 'void',
    palette: { core: '#d8a8ff', inner: '#6e3d92', outer: '#110917' },
    speed: 0.72,
    scale: 0.72,
    turbulence: 1.22,
    intensity: 0.96,
  },
  {
    id: 'purifying-lotus',
    slug: 'purifying-lotus',
    rank: 3,
    rankLabel: '第三',
    name: '净莲妖火',
    epithet: '乳白如莲，焚尽尘秽',
    description: '呈乳白色的妖异火焰，可将接触之物净化为虚无，并能借由情绪悄然侵入。',
    interpretation: '以莲瓣轮廓组织火焰下缘；长按时花瓣舒展，指针靠近时焰心轻微偏移。',
    sourceLabel: '《斗破苍穹》原著设定；百度百科“净莲妖火”条目交叉核对',
    sourceUrl: 'https://baike.baidu.com/item/%E5%87%80%E8%8E%B2%E5%A6%96%E7%81%AB',
    kernel: 'lotus',
    palette: { core: '#fffef4', inner: '#d8ffff', outer: '#76bfc5' },
    speed: 0.86,
    scale: 0.72,
    turbulence: 0.88,
    intensity: 0.98,
  },
  {
    id: 'bone-chilling',
    slug: 'bone-chilling',
    rank: 11,
    rankLabel: '第十一',
    name: '骨灵冷火',
    epithet: '极寒极热，相生相悖',
    description: '诞生于极阴与极寒之地，白色火焰兼具炽热与刺骨寒意，是冷与热的奇异结合。',
    interpretation: '以紊乱分叉的冷白焰身包裹炽白焰心；长按时冷热边界外扩成霜环，拖拽时焰舌回卷。',
    sourceLabel: '《斗破苍穹》原著设定；百度百科“骨灵冷火”条目交叉核对',
    sourceUrl: 'https://baike.baidu.com/item/%E9%AA%A8%E7%81%B5%E5%86%B7%E7%81%AB',
    kernel: 'cold',
    palette: { core: '#ffffff', inner: '#f2f8ff', outer: '#c2cdd2' },
    speed: 0.72,
    scale: 0.92,
    turbulence: 1.12,
    intensity: 1.02,
  },
]

export const flameCatalogBySlug = new Map(flameCatalog.map(flame => [flame.slug, flame]))

export const defaultFlame = flameCatalog[1] as FlameEntry
