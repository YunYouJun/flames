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

export type FlameRenderPreset = {
  [K in FlameKernelId]: Omit<FlamePreset<K>, 'id' | 'rank'>
}[FlameKernelId]

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
  interactions: FlameInteractionBrief
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

function approvedVisual(
  plannedFamily: Extract<VisualFamilyId, FlameKernelId>,
  brief: FlameVisualBrief,
  preset: FlameRenderPreset,
): FlameVisual {
  return { state: 'approved', plannedFamily, brief, preset }
}

function prototypeVisual(
  plannedFamily: Extract<VisualFamilyId, FlameKernelId>,
  brief: FlameVisualBrief,
  preset: FlameRenderPreset,
): FlameVisual {
  return { state: 'prototype', plannedFamily, brief, preset }
}

const visualBriefs = {
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
  karmicLotus: {
    facts: ['深红色异火，升腾时会形成鲜明的红莲纹样。'],
    interpretation: '以八瓣业火轮托起闭合上卷的深红火茧；长按时业纹从莲座逐层向上点燃，拖拽时火茧与业火轮反向错转。',
    silhouette: '低伏的八瓣莲轮托起收束火茧与尖锐主焰，外缘保留灼烧后的暗色缺口。',
    palette: '炽白金焰心、猩红内焰、深绯外瓣与近黑焦边。',
    motion: '底部业火轮周期脉冲，焰片向上裹合成火茧；节奏比净莲妖火更急促、更具压迫感。',
    interactions: {
      pointer: '莲心与焰纹朝指针方向偏转。',
      hold: '业火轮外扩，业纹逐层向上点燃。',
      drag: '火茧与业火轮反向错转。',
    },
    fallback: '以八瓣深红莲轮、金白焰心与焦黑火茧保留业火识别。',
    differentiation: '低伏旋转的业火轮与闭合火茧，区别于净莲妖火开放平稳的乳白花冠。',
    specialPasses: ['lotus-petals'],
    reviewScenes,
  },
  greenLotus: {
    facts: ['青色莲形异火，孕生于大地深处，历经漫长岁月才逐渐成形。'],
    interpretation: '以低伏厚重的青莲扎入地心熔隙；长按时岩缝与莲脉同时亮起，拖拽时根焰沿熔脉横向游走。',
    silhouette: '低矮、饱满的青色莲盏包裹黄绿焰心，下方延伸不规则地脉裂隙。',
    palette: '淡金莲心、青绿内焰、深青外瓣与少量熔金地脉。',
    motion: '莲瓣缓慢起伏，根焰从下方断续涌入；整体沉稳，偶尔出现地心式能量脉冲。',
    interactions: {
      pointer: '莲盏与根焰朝指针方向倾斜。',
      hold: '地心裂隙亮起，青莲二次绽放。',
      drag: '根焰沿熔脉错位流动。',
    },
    fallback: '以低伏青莲、淡金焰心与三道熔隙根焰保持识别。',
    differentiation: '低矮厚重且扎根地脉，区别于净莲的开放白冠与红莲的高耸火茧。',
    specialPasses: ['lotus-petals'],
    reviewScenes,
  },
  seaHeart: {
    facts: ['深蓝色异火，升腾时具有清澈海水般的液态质感。', '原著未赋予它额外的控水权能。'],
    interpretation: '以低位深蓝潮盆托起三道液膜焰舌；火体边缘像水波一样翻卷，内部以横向涟漪和冷亮焦散强调“流火”而非普通蓝焰。',
    silhouette: '宽阔椭圆潮盆上升起一主两辅三道光滑焰潮，整体低宽，顶部收束成被风卷起的水峰。',
    palette: '冰白焰心、亮青液膜、深钴蓝外焰与近黑蓝潮底。',
    motion: '潮盆缓慢呼吸，涟漪向外扩散；焰潮以连续液膜起伏，减少普通火焰的碎裂抖动。',
    interactions: {
      pointer: '主焰潮朝指针方向倾斜，近侧涟漪随之偏移。',
      hold: '潮盆外扩并连续泛起同心潮环，中央液焰向上涌升。',
      drag: '潮面与焰潮反向剪切，拖出短暂的蓝色飞沫。',
    },
    fallback: '以深蓝椭圆潮盆、三道液膜焰舌和两层同心波纹保留流火识别。',
    differentiation: '唯一以横向潮盆、同心涟漪和连续液膜作为主轮廓的家族，区别于莲瓣、冷壳与普通上升焰舌。',
    specialPasses: ['tidal-rings'],
    reviewScenes,
  },
  lifeSpirit: {
    facts: ['翠绿色异火具有液态火海与绿雾意象，能够催生药材，并展现出罕见灵性。'],
    interpretation: '将翠绿液态火海收束成一枚会呼吸的生命种核：五枚火种错峰萌发，焰茎与绿焰叶经历舒展、凋散和再生。',
    silhouette: '低位翠绿焰湖托起轮番生长的焰芽，数量与高度持续变化，中心保留柔和生命焰心。',
    palette: '黄绿生命焰心、鲜翠内焰、深林绿潮底与少量嫩绿孢光。',
    motion: '焰芽错峰经历萌芽、伸展、开叶与消隐，并缓慢趋光；长按时生长周期整体抬升。',
    interactions: {
      pointer: '焰芽与液态火海朝指针方向缓慢趋光。',
      hold: '潮面亮起生命脉冲，焰茎升高并舒展双叶。',
      drag: '翠绿孢光沿拖拽方向播散，潮面形成柔和生长轨迹。',
    },
    fallback: '以翠绿焰湖、五株焰芽和淡金生命焰心保持识别。',
    differentiation: '以液态生长和趋光焰芽为主识别，区别于海心焰的纯潮汐、火云水炎的双层焰幕与幽冥毒火的黏稠气泡。',
    specialPasses: ['tidal-rings'],
    reviewScenes,
  },
  fireCloudWater: {
    facts: ['原著明确名称、榜位与持有者，但没有可靠细述颜色、独立形态或能力。'],
    interpretation: '仅从“火云水炎”的名称出发做项目演绎：上下两层薄焰云之间垂落水线般的火丝，形成悬浮焰幕，不追加控水设定。',
    silhouette: '宽阔下层焰云与收窄上层焰云相互错位，五道细长火丝从云底垂落。',
    palette: '暖白云心、珊瑚橙内焰、深海蓝外缘，形成云火与水影的双色反差。',
    motion: '上下焰云低速反向漂移，垂落火丝周期性收放；整体像悬空的燃烧云幕。',
    interactions: {
      pointer: '两层焰云产生不同幅度的水平漂移。',
      hold: '云层增厚，垂落火丝延长并点亮银边。',
      drag: '上下焰云反向剪切，火丝短暂倾斜成雨幕。',
    },
    fallback: '以橙蓝双层焰云和五道垂落火丝保持项目演绎轮廓。',
    differentiation: '唯一采用上下分层、向下垂落的流火构图；其形态明确标注为项目演绎而非原著事实。',
    specialPasses: [],
    reviewScenes,
  },
  netherPoison: {
    facts: ['小说正文未命名第二十席；幽冥毒火作为项目采用的扩展补位，不宣称为小说正文设定。'],
    interpretation: '以近黑绿毒池承托紫色黏焰，毒泡在池面周期鼓起破裂，两道细长毒焰从两侧向上试探。',
    silhouette: '低伏不规则毒池、密集大小毒泡与两侧蛇信般细焰，中央保持空腔感。',
    palette: '酸黄泡心、幽紫黏焰、近黑绿毒池与少量病态荧光。',
    motion: '池面黏滞缓流，毒泡随机鼓起；细焰运动迟缓但拖尾明显。',
    interactions: {
      pointer: '毒泡向近侧聚集，两道细焰追随指针。',
      hold: '毒池膨胀，更多毒泡同时亮起并破裂。',
      drag: '黏焰被拉成长尾，毒池留下扭曲的荧光沟痕。',
    },
    fallback: '以黑绿毒池、紫色黏焰和酸黄泡环保持扩展身份。',
    differentiation: '黏稠毒池与破裂泡环是核心识别，避免与普通紫焰或海心焰的清澈潮汐混同。',
    specialPasses: ['tidal-rings'],
    reviewScenes,
  },
  netherGale: {
    facts: ['淡黑色异火如疾风流动，伴随的风声能够扰动情绪与心神。'],
    interpretation: '让火焰失去传统竖直焰身，改为七道横向淡黑风带穿过中央暗眼；长按时声压环从暗眼向外扩张。',
    silhouette: '横向拉长的层叠风带围绕中央低亮暗眼，没有固定底座与主焰柱。',
    palette: '雾白风刃、灰青内流、淡黑外风与近乎无光的风眼。',
    motion: '风带高速横穿并周期断裂，局部出现逆向回流；声压环以较慢节奏扩散。',
    interactions: {
      pointer: '风带在指针附近弯曲绕流。',
      hold: '中央风眼收紧，淡灰声压环向外扩张。',
      drag: '多层风带产生不同相位的横向撕裂。',
    },
    fallback: '以七道淡黑横向风带、中央暗眼和灰白声压环保持识别。',
    differentiation: '横向疾风与声压环取代普通向上燃烧，是九幽风炎的唯一主识别。',
    specialPasses: [],
    reviewScenes,
  },
  windFuryDragon: {
    facts: ['小说正文未命名第十八席；风怒龙炎作为项目采用的扩展补位，不宣称为小说正文设定。'],
    interpretation: '让两股青灰风焰彼此缠绕成上升龙卷，龙首只在高位风压汇聚时显形，外围两道高速风轨交叉旋切。',
    silhouette: '宽窄交替的双股龙卷焰身贯穿纵向空间，顶部凝出侧向龙首、后掠角冠与风须，外围保留两道倾斜风轨。',
    palette: '冷白龙目、青灰风鳞、深蓝黑外风与少量风刃高光。',
    motion: '双股风焰交替越过龙卷表面，紊流外焰不断撕开轮廓；外轨速度高于龙身，形成包裹式风暴。',
    interactions: {
      pointer: '龙首与上段龙身朝指针方向追随。',
      hold: '龙首抬高、双角点亮，外轨半径扩大。',
      drag: '螺旋龙身加剧摆动，两道外轨产生反向旋切。',
    },
    fallback: '以青灰双股龙卷、短暂凝形的侧向龙首和交叉风轨保持扩展身份。',
    differentiation: '纵向螺旋龙形区别于九幽风炎的横向无形风带，并明确保持扩展补位边界。',
    specialPasses: [],
    reviewScenes,
  },
  threeThousand: {
    facts: ['紫黑色异火诞生于星空，能够借星辰之力延续，并呈现龙形本源。'],
    interpretation: '将紫黑焰身拉成长距离星轨火龙：龙身沿纵向星弧蜿蜒，头部在高位凝聚，周围的断续星环补足“星空孕火”的空间感。',
    silhouette: '一条细长紫黑火龙从低位星尘中盘旋上升，高位龙首与外侧星环构成明显的不对称轮廓。',
    palette: '冷白星核、亮紫内焰、深紫黑龙身与少量蓝紫星尘。',
    motion: '龙身以缓慢长波摆动，鳞光逐段流向龙首；星环的旋转速度低于龙身，形成深空漂移感。',
    interactions: {
      pointer: '龙首追随指针，长龙身以延迟波动跟进。',
      hold: '龙首抬升，星环与沿途鳞光同时增强。',
      drag: '龙身被拉出更长的星轨，外环产生反向偏转。',
    },
    fallback: '以紫黑长龙、冷白龙首和断续星环保留星空龙火识别。',
    differentiation: '长距离星轨与单一龙形本源，区别于九龙雷罡火的九重环绕和风怒龙炎的风暴螺旋。',
    specialPasses: [],
    reviewScenes,
  },
  nineDragonThunder: {
    facts: ['银色异火中游动着九条火龙，并以龙威和雷罡形成灵魂压迫。'],
    interpretation: '以中央银焰为雷罡核心，九枚龙首沿三层轨道巡游，龙尾化成断续银色电弧向内扣合，强调数量、雷性与压迫感。',
    silhouette: '中央高亮银焰被九枚不同半径的龙首和放射雷弧包围，形成近似雷轮的圆形灵阵。',
    palette: '炽白雷核、银蓝龙焰、深铅灰外焰与冷紫阴影。',
    motion: '九条龙轨以三组差速巡游，放射雷弧间歇闪断；主焰呼吸节奏短促而有重量。',
    interactions: {
      pointer: '雷轮中心向指针轻移，近侧龙首率先偏转。',
      hold: '三层龙轨外扩，九道雷弧同时贯通中央。',
      drag: '相邻龙轨发生错相旋转，雷弧被拉成折线。',
    },
    fallback: '以银色中央雷焰、九枚环绕龙首和放射电弧保持识别。',
    differentiation: '唯一明确呈现九个环绕龙首与雷轮结构的异火，不以单条龙身承担轮廓。',
    specialPasses: [],
    reviewScenes,
  },
  turtleSpirit: {
    facts: ['褐色异火凝成巨龟轮廓，甲身布满火刺，并带有獠牙与巨尾。'],
    interpretation: '压低普通火焰的上升感，以厚重龟甲作为主体；甲纹内透出熔亮裂隙，首尾与背刺只在外缘短促燃烧。',
    silhouette: '低伏宽阔的褐色龟甲占据中央，右侧伸出带獠牙的头部，左侧拖出粗尾，背部排列短火刺。',
    palette: '琥珀裂隙、赤褐甲面、深棕外壳与少量暗金背刺。',
    motion: '龟甲仅缓慢起伏，裂隙像沉积热流般游走；首尾摆动幅度小，整体保持山岳般重量。',
    interactions: {
      pointer: '龟首略向指针转动，甲内熔光向近侧聚集。',
      hold: '龟甲外扩，背刺与甲纹逐层点亮。',
      drag: '巨尾产生延迟摆动，甲纹沿拖拽方向错位。',
    },
    fallback: '以低伏褐色龟甲、发光甲纹、头尾和背刺保持灵龟轮廓。',
    differentiation: '唯一压低到近乎贴地、以完整甲兽承担主体的灵形异火。',
    specialPasses: [],
    reviewScenes,
  },
  myriadBeasts: {
    facts: ['红色异火升腾时会浮现万兽轮廓；原著未将其描述为召唤或统御万兽。'],
    interpretation: '让七枚抽象兽面在红色主焰外围交替浮现，以角、耳与短吻的剪影暗示万兽，而不表现实体召唤或支配能力。',
    silhouette: '中央红色焰柱外环绕七枚带双角的兽面火印，轮廓时隐时现并保持半透明。',
    palette: '暖白焰心、鲜红主焰、深绯兽面与暗酒红外缘。',
    motion: '主焰持续升腾，兽面火印以低速轮转和交替明灭出现，避免形成整齐召唤阵。',
    interactions: {
      pointer: '近侧兽面向指针聚拢，主焰轻微偏转。',
      hold: '七枚兽面同时显形，中央红焰增高。',
      drag: '兽面火印沿环轨错相追逐，角形拖出短暂火痕。',
    },
    fallback: '以红色主焰、七枚半透明兽面火印和深绯外环保持识别。',
    differentiation: '多枚交替显现的兽面剪影区别于具象单兽、龙形与普通红焰，同时严格避免新增召唤设定。',
    specialPasses: [],
    reviewScenes,
  },
  fallenHeart: {
    facts: ['无形无色的异火能在体内引发心火，成熟本源可呈透明火蟒般的形态。'],
    interpretation: '压低可见色彩，以折射般的透明火蟒环绕心火脉冲；观者先感知热晕与内部圆环，再辨认出蛇形本源。',
    silhouette: '几乎透明的细长火蟒从下方盘升，中央悬着一圈规律搏动的心火热环，外侧只有轻微空气扭曲。',
    palette: '近白透明热核、淡琥珀心环、低饱和暗红外晕与大面积留空。',
    motion: '火蟒以延迟波动盘升，心环维持近似心跳的双段脉冲；整体不出现普通高亮焰柱。',
    interactions: {
      pointer: '透明蟒首追随指针，热晕向近侧折射。',
      hold: '心火环向外扩张，蟒身鳞光短暂显现。',
      drag: '火蟒被拉出透明热痕，心环产生轻微偏心。',
    },
    fallback: '以淡琥珀心环、低透明火蟒线和空气扭曲保留无形心火识别。',
    differentiation: '以低可见度、体内心环和透明火蟒为核心，区别于所有依赖高亮外焰的家族。',
    specialPasses: [],
    reviewScenes,
  },
  yinYang: {
    facts: ['小说正文未明确命名第二十一席；阴阳双炎作为项目扩展补位，不宣称为小说正文设定。'],
    interpretation: '用一黑一白两道小焰围绕阴阳火印互相追逐，只表达名称带来的双生意象，不追加生死轮回等能力。',
    silhouette: '黑白双焰位于阴阳火印两侧，中央圆印随长按分离，外围留下一圈断续双向轨迹。',
    palette: '纯白阳焰、近黑阴焰、暖灰交界光与少量冷银轨迹。',
    motion: '双焰以同速反向追逐，中央阴阳界面缓慢翻转；明暗呼吸始终互补。',
    interactions: {
      pointer: '中央火印向指针移动，黑白双焰保持对称距离。',
      hold: '双焰分离并扩大轨道，阴阳火印边界更清晰。',
      drag: '黑白双焰沿轨迹错相旋转，留下相反方向的短尾。',
    },
    fallback: '以黑白双焰、中央阴阳火印和双向环轨保持扩展身份。',
    differentiation: '唯一以等量明暗双体和阴阳圆印为主结构，并明确不扩写额外能力。',
    specialPasses: [],
    reviewScenes,
  },
  goldenEmperor: {
    facts: ['金色异火近似液体般流转，能够焚烧斗气并侵蚀空间。'],
    interpretation: '以七枚流金火种轮番催生火舌：显形、并合、熄灭后再生，低位熔金火池持续补充焰身；日轮退到后景压住空间。',
    silhouette: '数道高低错落的金色火舌从宽阔熔金底座交替升起，数量与重心持续变化；日轮只作为后景。',
    palette: '熔炉橙外焰、鲜亮帝金与浅金焰心组成高饱和金色，白金仅留在最热处。',
    motion: '漂移涡核逆向卷吸火冠，七道火苗独立摆动、断裂与再生；日轮缓慢转动。',
    interactions: {
      pointer: '主焰与涡纹向指针偏转，近侧火舌提前卷起。',
      hold: '七重火苗同时抬高，熔金底座外扩，涡纹随焰身增强。',
      drag: '液金纹横向剪切，裂痕沿拖拽方向产生错位。',
    },
    fallback: '以七重金焰、熔金底座与后景日轮保持通体金色的火冠识别。',
    differentiation: '真实动态火苗承担主体，日轮仅提供帝王威势；区别于帝炎的多色万火归一，也避免退化为静态金色纹章。',
    specialPasses: [],
    reviewScenes,
  },
  eightDesolation: {
    facts: ['八荒破灭焱为炎族传承异火，色泽淡黑，火炫施展时可化作巨大的火焰双翼。'],
    interpretation: '让左右展开的淡黑宽翼占据画面并越出边界；拍击时推出一道向下崩散的压焰，以名称引申破灭感，不宣称额外权能。',
    silhouette: '一对横贯画面的巨大火翼包围低亮焰心，上缘如刃、翼尖下压，翼下只保留一道拍击压焰。',
    palette: '冷白翼刃、淡黑火翼、深灰紫外缘与低亮中央焰心。',
    motion: '双翼以沉重节拍扩张并下压，翼纹向外传播；每次拍击只产生一道快速下坠并消隐的压焰。',
    interactions: {
      pointer: '双翼迎着指针方向产生不对称倾角。',
      hold: '翼展越出画面边缘，翼刃与压焰同时增强。',
      drag: '左右火翼反向扭曲，压焰沿拖拽方向偏折。',
    },
    fallback: '以淡黑巨大双翼、中央小焰心和单道下坠压焰保持识别。',
    differentiation: '画面主体是越出边界的横向双翼而非龙、莲或圆环；破灭仅作为名称引申的拍击压焰。',
    specialPasses: [],
    reviewScenes,
  },
  netherGolden: {
    facts: ['原著明确名称、榜位、持有者和融合关系，但没有可靠细述独立颜色、形态或能力。'],
    interpretation: '仅从名称做克制的项目演绎：让暗金祖焰受断续祖纹环约束成碑形，焰身在碑肩内上涌并间歇冲出顶部，不扩写独立权能。',
    silhouette: '窄长暗金主焰被束成碑形，肩部保留折角，顶部化作游动焰尖，外围一圈断续祖纹火环。',
    palette: '暗白纹心、沉金主体、乌金外缘与低亮褐黑背景。',
    motion: '碑肩保持沉稳，内部焰身持续向上翻涌并蚀出缺口；祖纹逆流，外围火环间歇分段点亮。',
    interactions: {
      pointer: '碑状火印轻微偏转，近侧祖纹提前显现。',
      hold: '主焰尖向上抬升，外围祖纹环向外扩张。',
      drag: '内部铭纹沿拖拽方向倾斜，主体保持沉稳。',
    },
    fallback: '以碑形暗金主焰、游动祖纹和断续祖纹环保持项目演绎轮廓。',
    differentiation: '碑形约束下的动态祖焰区别于金帝焚天炎的流动金冠，并明确形态属于项目演绎。',
    specialPasses: [],
    reviewScenes,
  },
  emperor: {
    facts: ['终局以多种异火汇聚为核心意象，项目将帝炎作为二十二种基础异火完成后的终局体验。'],
    interpretation: '以四层同心万火冠环汇聚到无色焰核，十一道辐线暗示多种火意归一；环面保留冷暖光谱流转，但不直接复制任何单席轮廓。',
    silhouette: '高位无色主焰贯穿四层同心冠环，十一道短辐线向中心收束，整体呈完整而稳定的终局印记。',
    palette: '无色炽白核心、金色主环、冷蓝与绯红交替光谱、深紫外缘。',
    motion: '四层冠环以不同低速错相转动，光谱沿环面缓慢汇入中心；节奏比单席异火更稳定克制。',
    interactions: {
      pointer: '冠环整体朝指针偏心，主焰保持居中牵引。',
      hold: '四层环逐级展开，辐线从外向内完成一次汇聚。',
      drag: '相邻冠环反向错转，冷暖光谱产生短暂分离。',
    },
    fallback: '以无色焰核、四层同心冠环和十一道汇聚辐线保持终局识别。',
    differentiation: '多层万火归一结构只属于终局帝炎，并始终保持开发原型，等待全部基础席视觉审定。',
    specialPasses: [],
    reviewScenes,
  },
  volcanicStone: {
    facts: ['原著明确名称、榜位与融合关系，但没有可靠细述独立颜色或岩浆形态。'],
    interpretation: '仅从“火山石焰”名称做项目演绎：以破裂玄武岩丘包住岩浆焰口，熔光沿石隙渗出，少量火山弹从中央喷发。',
    silhouette: '低宽黑褐岩丘围住扁平焰口，中央短焰上涌，表面交错裂隙构成主要细节。',
    palette: '淡金熔核、橙红岩浆、黑褐玄武岩与暗红裂隙。',
    motion: '岩丘保持稳定，熔光沿裂隙缓慢游走；中央焰口周期鼓动并抛出少量火山弹。',
    interactions: {
      pointer: '岩浆焰口朝指针偏移，近侧裂隙先行点亮。',
      hold: '岩丘略微张开，裂隙增亮并提高火山弹喷发高度。',
      drag: '熔光沿拖拽方向穿过石隙，焰口产生短暂横向喷流。',
    },
    fallback: '以黑褐岩丘、橙红焰口和发光裂隙保持项目演绎轮廓。',
    differentiation: '玄武岩实体感与地表熔隙区别于流体、莲形和纯焰家族，并明确不将岩浆形态写成原著事实。',
    specialPasses: [],
    reviewScenes,
  },
  darkYellow: {
    facts: ['深黄色异火在古帝广场仅余微弱火种，原著没有展开额外的厚土能力。'],
    interpretation: '保留末席火种的弱小状态：一枚深黄种核贴近地面，只有短小灯芯焰与极少尘光，不把它放大成山岳或厚土神通。',
    silhouette: '画面低位仅有椭圆火种、一道细裂与短小焰芯，上方大面积留空。',
    palette: '浅黄种心、玄黄色种壳、深褐外缘与少量暗金尘光。',
    motion: '种核低频呼吸，灯芯焰轻微摆动；尘光稀少且上升缓慢，整体保持克制。',
    interactions: {
      pointer: '短小焰芯向指针倾斜，种核本体只做极小位移。',
      hold: '种壳裂隙短暂增亮，灯芯焰略微升高。',
      drag: '焰芯拖出一缕短痕，种核仍停留在低位。',
    },
    fallback: '以低位深黄种核、细小裂隙和短焰芯保持末席火种识别。',
    differentiation: '最小、最低、留空最多的异火轮廓，主动避免为末席补写宏大能力。',
    specialPasses: [],
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
    visual: prototypeVisual('crown', visualBriefs.emperor, {
      kernel: 'crown',
      kernelOptions: { crownMode: 'emperor' },
      palette: { core: '#ffffff', inner: '#f7c65b', outer: '#38245c' },
      speed: 0.66,
      scale: 0.94,
      turbulence: 0.82,
      intensity: 1.14,
    }),
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
    visual: approvedVisual('void', visualBriefs.nihility, {
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
    visual: approvedVisual('lotus', visualBriefs.purifyingLotus, {
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
    visual: prototypeVisual('crown', visualBriefs.goldenEmperor, {
      kernel: 'crown',
      kernelOptions: { crownMode: 'golden' },
      palette: { core: '#fff0a3', inner: '#ffc400', outer: '#ff6b00' },
      speed: 1.36,
      scale: 1,
      turbulence: 1.28,
      intensity: 1.34,
    }),
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
    visual: prototypeVisual('fluid', visualBriefs.lifeSpirit, {
      kernel: 'fluid',
      kernelOptions: { flowMode: 'verdant' },
      palette: { core: '#dfff8a', inner: '#35ef77', outer: '#063d2c' },
      speed: 0.58,
      scale: 0.88,
      turbulence: 0.62,
      intensity: 0.98,
    }),
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
    visual: prototypeVisual('crown', visualBriefs.eightDesolation, {
      kernel: 'crown',
      kernelOptions: { crownMode: 'desolation' },
      palette: { core: '#f5ffff', inner: '#aaa5af', outer: '#09070b' },
      speed: 1.08,
      scale: 1.02,
      turbulence: 1.28,
      intensity: 1.12,
    }),
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
    visual: prototypeVisual('crown', visualBriefs.netherGolden, {
      kernel: 'crown',
      kernelOptions: { crownMode: 'ancestral' },
      palette: { core: '#fff5c7', inner: '#dda531', outer: '#241307' },
      speed: 0.78,
      scale: 0.94,
      turbulence: 0.90,
      intensity: 1.08,
    }),
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
    visual: approvedVisual('lotus', visualBriefs.karmicLotus, {
      kernel: 'lotus',
      kernelOptions: { bloomMode: 'karmic' },
      palette: { core: '#fff1c2', inner: '#ff3a20', outer: '#5a000b' },
      speed: 0.96,
      scale: 0.76,
      turbulence: 1.14,
      intensity: 1.08,
    }),
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
    visual: prototypeVisual('spirit', visualBriefs.threeThousand, {
      kernel: 'spirit',
      kernelOptions: { spiritMode: 'starlit' },
      palette: { core: '#f6e8ff', inner: '#a955ff', outer: '#32105c' },
      speed: 0.82,
      scale: 0.98,
      turbulence: 0.95,
      intensity: 1.20,
    }),
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
    visual: prototypeVisual('gale', visualBriefs.netherGale, {
      kernel: 'gale',
      kernelOptions: { galeMode: 'nether' },
      palette: { core: '#dce9e6', inner: '#718487', outer: '#101619' },
      speed: 1.05,
      scale: 0.92,
      turbulence: 1.25,
      intensity: 0.88,
    }),
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
    visual: approvedVisual('cold', visualBriefs.boneChilling, {
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
    visual: prototypeVisual('spirit', visualBriefs.nineDragonThunder, {
      kernel: 'spirit',
      kernelOptions: { spiritMode: 'thunder' },
      palette: { core: '#ffffff', inner: '#d4e9ff', outer: '#58688f' },
      speed: 1.02,
      scale: 0.98,
      turbulence: 1.15,
      intensity: 1.26,
    }),
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
    visual: prototypeVisual('spirit', visualBriefs.turtleSpirit, {
      kernel: 'spirit',
      kernelOptions: { spiritMode: 'turtle' },
      palette: { core: '#ffe0a0', inner: '#e77834', outer: '#4b2412' },
      speed: 0.52,
      scale: 0.94,
      turbulence: 0.72,
      intensity: 1.10,
    }),
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
    visual: prototypeVisual('soul', visualBriefs.fallenHeart, {
      kernel: 'soul',
      kernelOptions: { soulMode: 'heart' },
      palette: { core: '#fffef5', inner: '#ffdda5', outer: '#713548' },
      speed: 0.76,
      scale: 0.96,
      turbulence: 0.84,
      intensity: 0.98,
    }),
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
    visual: approvedVisual('fluid', visualBriefs.seaHeart, {
      kernel: 'fluid',
      kernelOptions: { flowMode: 'tidal' },
      palette: { core: '#d9ffff', inner: '#25b9ef', outer: '#08245f' },
      speed: 0.68,
      scale: 0.86,
      turbulence: 0.72,
      intensity: 1.04,
    }),
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
    visual: prototypeVisual('fluid', visualBriefs.fireCloudWater, {
      kernel: 'fluid',
      kernelOptions: { flowMode: 'cloudwater' },
      palette: { core: '#fff4d4', inner: '#ff6c5a', outer: '#276da8' },
      speed: 0.74,
      scale: 0.96,
      turbulence: 0.78,
      intensity: 1.10,
    }),
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
    visual: prototypeVisual('geofire', visualBriefs.volcanicStone, {
      kernel: 'geofire',
      kernelOptions: { earthMode: 'volcanic' },
      palette: { core: '#fff2ad', inner: '#ef6725', outer: '#24140e' },
      speed: 0.76,
      scale: 0.92,
      turbulence: 0.88,
      intensity: 1.04,
    }),
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
    visual: prototypeVisual('gale', visualBriefs.windFuryDragon, {
      kernel: 'gale',
      kernelOptions: { galeMode: 'dragon' },
      palette: { core: '#f4fff9', inner: '#57ffdd', outer: '#126779' },
      speed: 1.32,
      scale: 1.08,
      turbulence: 1.48,
      intensity: 1.28,
    }),
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
    visual: approvedVisual('lotus', visualBriefs.greenLotus, {
      kernel: 'lotus',
      kernelOptions: { bloomMode: 'earthcore' },
      palette: { core: '#fff2a8', inner: '#34dc96', outer: '#006149' },
      speed: 0.78,
      scale: 0.74,
      turbulence: 0.92,
      intensity: 1.04,
    }),
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
    visual: prototypeVisual('fluid', visualBriefs.netherPoison, {
      kernel: 'fluid',
      kernelOptions: { flowMode: 'venom' },
      palette: { core: '#efff78', inner: '#b543e6', outer: '#093f31' },
      speed: 0.64,
      scale: 0.90,
      turbulence: 1.05,
      intensity: 1.12,
    }),
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
    visual: prototypeVisual('soul', visualBriefs.yinYang, {
      kernel: 'soul',
      kernelOptions: { soulMode: 'duality' },
      palette: { core: '#ffffff', inner: '#e5e1d7', outer: '#14161b' },
      speed: 0.70,
      scale: 0.94,
      turbulence: 0.58,
      intensity: 1.10,
    }),
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
    visual: prototypeVisual('spirit', visualBriefs.myriadBeasts, {
      kernel: 'spirit',
      kernelOptions: { spiritMode: 'beasts' },
      palette: { core: '#fff0ba', inner: '#ff563b', outer: '#7a1320' },
      speed: 0.96,
      scale: 1.00,
      turbulence: 1.18,
      intensity: 1.18,
    }),
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
    visual: prototypeVisual('geofire', visualBriefs.darkYellow, {
      kernel: 'geofire',
      kernelOptions: { earthMode: 'seed' },
      palette: { core: '#fff0a0', inner: '#c49a28', outer: '#39280d' },
      speed: 0.46,
      scale: 0.76,
      turbulence: 0.48,
      intensity: 0.76,
    }),
  },
] satisfies FlameSeat[]

export const visualFamilyCatalog: Record<VisualFamilyId, VisualFamilyDefinition> = {
  void: { id: 'void', label: '虚无', representativeFlameId: 'nihility', status: 'ready' },
  lotus: { id: 'lotus', label: '莲相', representativeFlameId: 'purifying-lotus', status: 'ready' },
  crown: { id: 'crown', label: '冠焰', representativeFlameId: 'golden-emperor', status: 'planned' },
  fluid: { id: 'fluid', label: '流火', representativeFlameId: 'sea-heart', status: 'ready' },
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

export function getFlameEntry(flame: FlameSeat): FlameEntry | undefined {
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
    interactions: flame.visual.brief.interactions,
    sourceLabel: flame.sources.map(source => source.label).join('；'),
    sourceUrl: primarySource?.url ?? QIDIAN_NOVEL_URL,
    identityBasis: flame.identityBasis,
    sources: flame.sources,
  }
}

export const flameCatalog: FlameEntry[] = flameRoster.flatMap((flame) => {
  if (flame.visual.state !== 'approved')
    return []
  const entry = getFlameEntry(flame)
  return entry ? [entry] : []
})

export const flameCatalogBySlug = new Map(flameCatalog.map(flame => [flame.slug, flame] as const))
export const defaultFlame = flameCatalog.find(flame => flame.id === 'purifying-lotus') as FlameEntry
