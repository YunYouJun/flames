import type { FlameKernelId, FlamePreset } from '@yunyoujun/flame-engine'

export type VisualFamilyId
  = | 'void'
    | 'lotus'
    | 'crown'
    | 'fluid'
    | 'spirit'
    | 'gale'
    | 'cold'
    | 'soul'
    | 'geofire'

export type FlameIdentityBasis = 'novel' | 'extension' | 'terminal'
export type FlameSourceTier = 'novel' | 'authorized-extension' | 'project-interpretation'
export type FlameReviewScene = 'idle' | 'pointer' | 'hold' | 'drag'

export interface FlameSourceRef {
  tier: FlameSourceTier
  label: string
  citation: string
  url?: string
}

export interface FlameAlternateName {
  name: string
  context: string
}

export interface FlameInteractionBrief {
  pointer: string
  hold: string
  drag: string
}

export interface FlameVisualBrief {
  facts: string[]
  interpretation: string
  silhouette: string
  palette: string
  motion: string
  interactions: FlameInteractionBrief
  fallback: string
  differentiation: string
  specialPasses: string[]
  reviewScenes: FlameReviewScene[]
}

export type FlameRenderPreset = Omit<FlamePreset, 'id' | 'rank'>

export type FlameVisual
  = | {
    state: 'reserved'
    plannedFamily?: VisualFamilyId
  }
  | {
    state: 'assigned'
    plannedFamily: VisualFamilyId
    brief: FlameVisualBrief
  }
  | {
    state: 'prototype' | 'approved'
    plannedFamily: VisualFamilyId
    brief: FlameVisualBrief
    preset: FlameRenderPreset
  }

export interface FlameSeat {
  id: string
  slug: string
  rank: number
  name: string
  epithet: string
  summary: string
  identityBasis: FlameIdentityBasis
  alternateNames: FlameAlternateName[]
  sources: FlameSourceRef[]
  visual: FlameVisual
}

/** Compatibility view consumed by the current runtime-facing components. */
export interface FlameEntry extends FlamePreset {
  slug: string
  name: string
  rankLabel: string
  epithet: string
  description: string
  interpretation: string
  sourceLabel: string
  sourceUrl: string
  identityBasis: FlameIdentityBasis
  sources: FlameSourceRef[]
}

export interface VisualFamilyDefinition {
  id: VisualFamilyId
  label: string
  representativeFlameId: string
  status: 'ready' | 'planned'
}

const QIDIAN_NOVEL_URL = 'https://book.qidian.com/info/1209977'
const AUTHORIZED_GAME_URL = 'https://apps.apple.com/cn/app/id1330149230'
const reviewScenes: FlameReviewScene[] = ['idle', 'pointer', 'hold', 'drag']

function novelSource(citation: string): FlameSourceRef {
  return {
    tier: 'novel',
    label: '《斗破苍穹》原著',
    citation,
    url: QIDIAN_NOVEL_URL,
  }
}

function projectSource(citation: string): FlameSourceRef {
  return {
    tier: 'project-interpretation',
    label: '项目视觉演绎',
    citation,
  }
}

function extensionSources(citation: string): FlameSourceRef[] {
  return [
    projectSource(citation),
    {
      tier: 'authorized-extension',
      label: '正版衍生作品存在另一套补位',
      citation: '仅用于说明衍生版本差异，不作为小说正文依据。',
      url: AUTHORIZED_GAME_URL,
    },
  ]
}

function reservedVisual(plannedFamily?: VisualFamilyId): FlameVisual {
  return { state: 'reserved', plannedFamily }
}

function approvedVisual(
  plannedFamily: Extract<VisualFamilyId, FlameKernelId>,
  brief: FlameVisualBrief,
  preset: FlameRenderPreset,
): FlameVisual {
  return { state: 'approved', plannedFamily, brief, preset }
}

const approvedBriefs = {
  nihility: {
    facts: ['黑色异火，与吞噬和虚无相连。'],
    interpretation: '以近乎无光的火心、被吞没的边缘与随拖拽收束的涡流，表现“吞噬”而非普通燃烧。',
    silhouette: '中央黑心被不完整焰环包围，外缘持续向内塌缩。',
    palette: '紫黑外焰、低亮黑心与少量冷紫高光。',
    motion: '缓慢内卷，受输入后形成明显的径向吸附。',
    interactions: {
      pointer: '黑心向指针轻微偏移。',
      hold: '吞噬边缘加深并扩大。',
      drag: '外焰收束成定向涡流。',
    },
    fallback: '以黑心、紫色焰环和内收动画构成轻量意象。',
    differentiation: '唯一以负亮度中心和吞噬方向作为主识别的家族。',
    specialPasses: ['void-core', 'void-ring'],
    reviewScenes,
  },
  purifyingLotus: {
    facts: ['乳白色异火，以净化与莲形意象著称。'],
    interpretation: '以莲瓣轮廓组织火焰下缘；长按时花瓣舒展，指针靠近时焰心轻微偏移。',
    silhouette: '低位莲瓣托起中央乳白焰柱。',
    palette: '骨白焰心、乳白内焰与冷青外晕。',
    motion: '花冠舒展与焰柱上升保持克制、平稳。',
    interactions: {
      pointer: '焰心随指针轻微偏转。',
      hold: '莲瓣向外盛放。',
      drag: '花冠产生有弹性的横向偏移。',
    },
    fallback: '以三层 CSS 莲瓣与乳白焰心保持莲形识别。',
    differentiation: '开放、洁净的乳白花冠区别于红莲与低矮青莲。',
    specialPasses: ['lotus-petals'],
    reviewScenes,
  },
  boneChilling: {
    facts: ['白色异火，同时呈现极寒与炽热的矛盾感。'],
    interpretation: '以紊乱分叉的冷白焰身包裹炽白焰心；长按时冷热边界外扩成霜环，拖拽时焰舌回卷。',
    silhouette: '高耸、分叉且不稳定的冷白火体。',
    palette: '纯白焰心、骨白内焰与银灰冷壳。',
    motion: '逆向流场让焰舌相互穿插，外围蒸汽持续游离。',
    interactions: {
      pointer: '焰身形成细微逆向偏流。',
      hold: '霜环从冷热边界向外扩散。',
      drag: '侧焰与蒸汽丝带发生回卷。',
    },
    fallback: '用骨白双层火体与淡霜环表现冷热并存。',
    differentiation: '唯一以冷壳、热核和霜环三者并置的家族。',
    specialPasses: [],
    reviewScenes,
  },
} satisfies Record<string, FlameVisualBrief>

const roster = [
  {
    id: 'emperor',
    slug: 'emperor',
    rank: 1,
    name: '帝炎',
    epithet: '万火归一，终局封印',
    summary: '帝炎被保留为完整异火榜的终局状态；它不会作为普通异火提前解封。',
    identityBasis: 'terminal',
    alternateNames: [],
    sources: [novelSource('终局关于多种异火汇聚与帝炎的相关描写。'), projectSource('项目将帝炎作为二十二种基础异火完成后的终局体验。')],
    visual: reservedVisual(),
  },
  {
    id: 'nihility',
    slug: 'nihility',
    rank: 2,
    name: '虚无吞炎',
    epithet: '生于虚无，吞噬万物',
    summary: '诞生于虚无之中的黑色火焰，能够吞噬外物并将其化作自身力量。',
    identityBasis: 'novel',
    alternateNames: [],
    sources: [novelSource('虚无吞炎的颜色、吞噬特征与榜位相关描写。')],
    visual: approvedVisual('void', approvedBriefs.nihility, {
      kernel: 'void',
      palette: { core: '#d8a8ff', inner: '#6e3d92', outer: '#110917' },
      speed: 0.72,
      scale: 0.72,
      turbulence: 1.22,
      intensity: 0.96,
    }),
  },
  {
    id: 'purifying-lotus',
    slug: 'purifying-lotus',
    rank: 3,
    name: '净莲妖火',
    epithet: '乳白如莲，焚尽尘秽',
    summary: '呈乳白色的妖异火焰，以强烈的净化与侵入能力闻名。',
    identityBasis: 'novel',
    alternateNames: [],
    sources: [novelSource('净莲妖火的颜色、净化特征与榜位相关描写。')],
    visual: approvedVisual('lotus', approvedBriefs.purifyingLotus, {
      kernel: 'lotus',
      palette: { core: '#fffef4', inner: '#d8ffff', outer: '#76bfc5' },
      speed: 0.86,
      scale: 0.72,
      turbulence: 0.88,
      intensity: 0.98,
    }),
  },
  {
    id: 'golden-emperor',
    slug: 'golden-emperor',
    rank: 4,
    name: '金帝焚天炎',
    epithet: '金焰流转，灼穿空间',
    summary: '金色火焰近似液体般流转，拥有焚烧斗气并侵蚀空间的强势特征。',
    identityBasis: 'novel',
    alternateNames: [],
    sources: [novelSource('金色、液态感、焚烧斗气与空间灼烧的相关描写。')],
    visual: reservedVisual('crown'),
  },
  {
    id: 'life-spirit',
    slug: 'life-spirit',
    rank: 5,
    name: '生灵之焱',
    epithet: '绿焰化生，万物滋长',
    summary: '翠绿色异火具有鲜明的生命气息，能够催生药材并展现罕见的灵性。',
    identityBasis: 'novel',
    alternateNames: [],
    sources: [novelSource('翠绿液态火海、绿雾、催生药材与高灵智的相关描写。')],
    visual: reservedVisual('fluid'),
  },
  {
    id: 'eight-desolation',
    slug: 'eight-desolation',
    rank: 6,
    name: '八荒破灭焱',
    epithet: '火翼横空，风暴破灭',
    summary: '淡黑色异火在施展时可铺展为巨大火翼，并卷起猛烈的火焰风暴。',
    identityBasis: 'novel',
    alternateNames: [],
    sources: [novelSource('淡黑色火焰、巨大火翼与火焰风暴的相关描写。')],
    visual: reservedVisual('crown'),
  },
  {
    id: 'nether-golden',
    slug: 'nether-golden',
    rank: 7,
    name: '九幽金祖火',
    epithet: '金火沉凝，祖焰未明',
    summary: '原著明确其名称、榜位与持有者，但对独立形态和能力着墨有限。',
    identityBasis: 'novel',
    alternateNames: [],
    sources: [novelSource('名称、榜位、持有者及其与火山石焰融合的相关描写。')],
    visual: reservedVisual('crown'),
  },
  {
    id: 'karmic-lotus',
    slug: 'karmic-lotus',
    rank: 8,
    name: '红莲业火',
    epithet: '深红成莲，妖焰灼空',
    summary: '深红而妖艳的异火，升腾时显出清晰的红莲纹样。',
    identityBasis: 'novel',
    alternateNames: [],
    sources: [novelSource('深红色、红莲纹样与压制九幽风炎的相关描写。')],
    visual: reservedVisual('lotus'),
  },
  {
    id: 'three-thousand',
    slug: 'three-thousand',
    rank: 9,
    name: '三千焱炎火',
    epithet: '星空孕火，紫黑化龙',
    summary: '诞生于星空的紫黑异火，可借星辰之力延续，并呈现鲜明的龙形本源。',
    identityBasis: 'novel',
    alternateNames: [{ name: '三千炎焱火', context: '原著中出现的异文写法' }],
    sources: [novelSource('紫黑色、星空来源、星力恢复与龙形本源的相关描写。')],
    visual: reservedVisual('spirit'),
  },
  {
    id: 'nether-gale',
    slug: 'nether-gale',
    rank: 10,
    name: '九幽风炎',
    epithet: '淡黑如风，幽声乱心',
    summary: '淡黑色异火如疾风流动，伴随的风声会扰动情绪与心神。',
    identityBasis: 'novel',
    alternateNames: [],
    sources: [novelSource('淡黑疾风形态、诞生环境与扰动情绪的相关描写。')],
    visual: reservedVisual('gale'),
  },
  {
    id: 'bone-chilling',
    slug: 'bone-chilling',
    rank: 11,
    name: '骨灵冷火',
    epithet: '极寒极热，相生相悖',
    summary: '白色异火兼具炽热与刺骨寒意，呈现冷与热并存的矛盾气息。',
    identityBasis: 'novel',
    alternateNames: [],
    sources: [novelSource('白色、极寒与极热并存及其诞生环境的相关描写。')],
    visual: approvedVisual('cold', approvedBriefs.boneChilling, {
      kernel: 'cold',
      palette: { core: '#ffffff', inner: '#f2f8ff', outer: '#c2cdd2' },
      speed: 0.72,
      scale: 0.92,
      turbulence: 1.12,
      intensity: 1.02,
    }),
  },
  {
    id: 'nine-dragon-thunder',
    slug: 'nine-dragon-thunder',
    rank: 12,
    name: '九龙雷罡火',
    epithet: '银龙游火，雷罡震魂',
    summary: '银色异火中游动着九条火龙，并以龙威和雷罡形成灵魂压迫。',
    identityBasis: 'novel',
    alternateNames: [],
    sources: [novelSource('银色、九条火龙、龙威与灵魂压迫的相关描写。')],
    visual: reservedVisual('spirit'),
  },
  {
    id: 'turtle-spirit',
    slug: 'turtle-spirit',
    rank: 13,
    name: '龟灵地火',
    epithet: '褐焰负甲，厚重如山',
    summary: '褐色异火凝成巨龟轮廓，甲身布满火刺，并带有獠牙与巨尾。',
    identityBasis: 'novel',
    alternateNames: [],
    sources: [novelSource('褐色、巨龟形态、火刺、獠牙与巨尾的相关描写。')],
    visual: reservedVisual('spirit'),
  },
  {
    id: 'fallen-heart',
    slug: 'fallen-heart',
    rank: 14,
    name: '陨落心炎',
    epithet: '无形由心，火起体内',
    summary: '无形无色的异火能在体内引发心火，成熟本源则可呈现透明火蟒般的形态。',
    identityBasis: 'novel',
    alternateNames: [],
    sources: [novelSource('无形无色、心火、淬炼作用与透明火蟒形态的相关描写。')],
    visual: reservedVisual('soul'),
  },
  {
    id: 'sea-heart',
    slug: 'sea-heart',
    rank: 15,
    name: '海心焰',
    epithet: '深蓝流火，凝若海心',
    summary: '深蓝色异火具有明显的液态质感；原著未赋予它额外的控水权能。',
    identityBasis: 'novel',
    alternateNames: [],
    sources: [novelSource('深蓝色、液态感与高温表现的相关描写。')],
    visual: reservedVisual('fluid'),
  },
  {
    id: 'fire-cloud-water',
    slug: 'fire-cloud-water',
    rank: 16,
    name: '火云水炎',
    epithet: '名落云水，形意待凝',
    summary: '原著明确其名称、榜位与持有者，颜色、形态和独有能力则没有可靠细述。',
    identityBasis: 'novel',
    alternateNames: [],
    sources: [novelSource('名称、榜位与炎族火曜持有的相关描写。')],
    visual: reservedVisual('fluid'),
  },
  {
    id: 'volcanic-stone',
    slug: 'volcanic-stone',
    rank: 17,
    name: '火山石焰',
    epithet: '石火相融，形意待考',
    summary: '原著明确其名称、榜位及融合关系，但并未具体描述独立颜色和岩浆形态。',
    identityBasis: 'novel',
    alternateNames: [],
    sources: [novelSource('名称、榜位、持有者及其与九幽金祖火融合的相关描写。')],
    visual: reservedVisual('geofire'),
  },
  {
    id: 'wind-fury-dragon',
    slug: 'wind-fury-dragon',
    rank: 18,
    name: '风怒龙炎',
    epithet: '风龙卷焰，扩展补位',
    summary: '小说正文未命名第十八席；项目采用常见榜单中的风怒龙炎作为扩展补位。',
    identityBasis: 'extension',
    alternateNames: [{ name: '风雷怒焱', context: '另一套正版衍生榜单采用的第十八席' }],
    sources: extensionSources('名称与视觉均作为扩展补位处理，不宣称来自小说正文。'),
    visual: reservedVisual('gale'),
  },
  {
    id: 'green-lotus',
    slug: 'green-lotus',
    rank: 19,
    name: '青莲地心火',
    epithet: '地心孕莲，青焰千年',
    summary: '诞生于大地深处的青色莲心火焰，经过漫长岁月才逐渐成形。',
    identityBasis: 'novel',
    alternateNames: [],
    sources: [novelSource('青色莲形、地心来源、成形周期与引发火山活动的相关描写。')],
    visual: reservedVisual('lotus'),
  },
  {
    id: 'nether-poison',
    slug: 'nether-poison',
    rank: 20,
    name: '幽冥毒火',
    epithet: '毒焰幽沉，扩展补位',
    summary: '小说正文未命名第二十席；项目采用常见榜单中的幽冥毒火作为扩展补位。',
    identityBasis: 'extension',
    alternateNames: [{ name: '龙凤焱', context: '另一套正版衍生榜单采用的第二十席' }],
    sources: extensionSources('名称、毒性与形态均作为扩展补位处理，不宣称来自小说正文。'),
    visual: reservedVisual('fluid'),
  },
  {
    id: 'yin-yang',
    slug: 'yin-yang',
    rank: 21,
    name: '阴阳双炎',
    epithet: '黑白双生，扩展补位',
    summary: '小说正文未明确命名第二十一席；项目采用阴阳双炎作为扩展补位。',
    identityBasis: 'extension',
    alternateNames: [{ name: '六道轮回炎', context: '另一套正版衍生榜单采用的第二十一席' }],
    sources: extensionSources('后补篇仅出现黑白混色异火，名称、榜位与能力不作为小说正文事实。'),
    visual: reservedVisual('soul'),
  },
  {
    id: 'myriad-beasts',
    slug: 'myriad-beasts',
    rank: 22,
    name: '万兽灵火',
    epithet: '红焰升腾，万兽隐现',
    summary: '红色异火升腾时会浮现万兽轮廓；原著未将其描述为召唤或统御万兽。',
    identityBasis: 'novel',
    alternateNames: [],
    sources: [novelSource('红色火焰与万兽轮廓的相关描写。')],
    visual: reservedVisual('spirit'),
  },
  {
    id: 'dark-yellow',
    slug: 'dark-yellow',
    rank: 23,
    name: '玄黄炎',
    epithet: '深黄微焰，末席留种',
    summary: '深黄色异火在古帝广场仅余微弱火种，原著没有展开额外的厚土能力。',
    identityBasis: 'novel',
    alternateNames: [],
    sources: [novelSource('深黄色与古帝广场弱小火种的相关描写。')],
    visual: reservedVisual('geofire'),
  },
] satisfies FlameSeat[]

export const visualFamilyCatalog: Record<VisualFamilyId, VisualFamilyDefinition> = {
  void: { id: 'void', label: '虚无', representativeFlameId: 'nihility', status: 'ready' },
  lotus: { id: 'lotus', label: '莲相', representativeFlameId: 'purifying-lotus', status: 'ready' },
  crown: { id: 'crown', label: '冠焰', representativeFlameId: 'golden-emperor', status: 'planned' },
  fluid: { id: 'fluid', label: '流火', representativeFlameId: 'sea-heart', status: 'planned' },
  spirit: { id: 'spirit', label: '灵形', representativeFlameId: 'nine-dragon-thunder', status: 'planned' },
  gale: { id: 'gale', label: '风焰', representativeFlameId: 'nether-gale', status: 'planned' },
  cold: { id: 'cold', label: '冷焰', representativeFlameId: 'bone-chilling', status: 'ready' },
  soul: { id: 'soul', label: '心焰', representativeFlameId: 'fallen-heart', status: 'planned' },
  geofire: { id: 'geofire', label: '地火', representativeFlameId: 'volcanic-stone', status: 'planned' },
}

export function validateFlameRoster<T extends readonly FlameSeat[]>(flames: T): T {
  if (flames.length !== 23)
    throw new Error(`Flame roster requires exactly 23 seats, received ${flames.length}.`)

  const ids = new Set<string>()
  const slugs = new Set<string>()
  const ranks = new Set<number>()

  for (const [index, flame] of flames.entries()) {
    const expectedRank = index + 1
    if (flame.rank !== expectedRank)
      throw new Error(`Flame roster expected rank ${expectedRank}, received ${flame.rank}.`)
    if (!flame.id.trim() || !flame.slug.trim() || !flame.name.trim() || !flame.summary.trim())
      throw new Error(`Flame seat ${flame.rank} requires identity and summary fields.`)
    if (ids.has(flame.id))
      throw new Error(`Duplicate flame id: ${flame.id}`)
    if (slugs.has(flame.slug))
      throw new Error(`Duplicate flame slug: ${flame.slug}`)
    if (ranks.has(flame.rank))
      throw new Error(`Duplicate flame rank: ${flame.rank}`)
    if (flame.sources.length === 0)
      throw new Error(`Flame seat ${flame.id} requires at least one source.`)
    if (flame.identityBasis === 'extension' && !flame.sources.some(source => source.tier === 'project-interpretation'))
      throw new Error(`Extension seat ${flame.id} requires an explicit project interpretation source.`)

    for (const source of flame.sources) {
      if (!source.label.trim() || !source.citation.trim())
        throw new Error(`Flame source for ${flame.id} requires a label and citation.`)
      if (source.url && !source.url.startsWith('https://'))
        throw new Error(`Flame source for ${flame.id} requires an HTTPS URL.`)
    }

    if (flame.visual.state !== 'reserved') {
      if (flame.visual.brief.reviewScenes.length !== 4)
        throw new Error(`Flame visual brief for ${flame.id} requires four review scenes.`)
      if (flame.visual.state === 'prototype' || flame.visual.state === 'approved') {
        if (flame.visual.plannedFamily !== flame.visual.preset.kernel)
          throw new Error(`Renderable flame ${flame.id} must match its planned family.`)
        for (const value of [flame.visual.preset.speed, flame.visual.preset.scale, flame.visual.preset.turbulence, flame.visual.preset.intensity]) {
          if (!Number.isFinite(value) || value <= 0)
            throw new Error(`Renderable flame ${flame.id} requires positive preset values.`)
        }
      }
    }

    ids.add(flame.id)
    slugs.add(flame.slug)
    ranks.add(flame.rank)
  }

  return flames
}

export const flameRoster = validateFlameRoster(roster)
export const flameRosterBySlug = new Map(flameRoster.map(flame => [flame.slug, flame] as const))

export function getFlamePreset(flame: FlameSeat): FlamePreset | undefined {
  if (flame.visual.state !== 'prototype' && flame.visual.state !== 'approved')
    return undefined

  return { id: flame.id, rank: flame.rank, ...flame.visual.preset }
}

export function formatFlameRank(rank: number): string {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  if (rank < 10)
    return `第${digits[rank]}`
  if (rank === 10)
    return '第十'
  if (rank < 20)
    return `第十${digits[rank - 10]}`
  if (rank === 20)
    return '第二十'
  return `第二十${digits[rank - 20]}`
}

function toFlameEntry(flame: FlameSeat): FlameEntry | undefined {
  const preset = getFlamePreset(flame)
  if (!preset || (flame.visual.state !== 'prototype' && flame.visual.state !== 'approved'))
    return undefined

  const primarySource = flame.sources.find(source => source.url) ?? flame.sources[0]
  return {
    ...preset,
    slug: flame.slug,
    name: flame.name,
    rankLabel: formatFlameRank(flame.rank),
    epithet: flame.epithet,
    description: flame.summary,
    interpretation: flame.visual.brief.interpretation,
    sourceLabel: flame.sources.map(source => source.label).join('；'),
    sourceUrl: primarySource?.url ?? QIDIAN_NOVEL_URL,
    identityBasis: flame.identityBasis,
    sources: flame.sources,
  }
}

export const flameCatalog: FlameEntry[] = flameRoster.flatMap((flame) => {
  if (flame.visual.state !== 'approved')
    return []
  const entry = toFlameEntry(flame)
  return entry ? [entry] : []
})

export const flameCatalogBySlug = new Map(flameCatalog.map(flame => [flame.slug, flame] as const))
export const defaultFlame = flameCatalog.find(flame => flame.id === 'purifying-lotus') as FlameEntry
