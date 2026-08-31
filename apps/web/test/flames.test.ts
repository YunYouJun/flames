import { validateFlamePreset } from '@yunyoujun/flame-engine'
import { describe, expect, it } from 'vitest'
import {
  flameCatalog,
  flameRoster,
  flameRosterBySlug,
  getFlamePreset,
  validateFlameRoster,
  visualFamilyCatalog,
} from '../app/data/flames'

const expectedRoster = [
  [1, 'emperor', '帝炎'],
  [2, 'nihility', '虚无吞炎'],
  [3, 'purifying-lotus', '净莲妖火'],
  [4, 'golden-emperor', '金帝焚天炎'],
  [5, 'life-spirit', '生灵之焱'],
  [6, 'eight-desolation', '八荒破灭焱'],
  [7, 'nether-golden', '九幽金祖火'],
  [8, 'karmic-lotus', '红莲业火'],
  [9, 'three-thousand', '三千焱炎火'],
  [10, 'nether-gale', '九幽风炎'],
  [11, 'bone-chilling', '骨灵冷火'],
  [12, 'nine-dragon-thunder', '九龙雷罡火'],
  [13, 'turtle-spirit', '龟灵地火'],
  [14, 'fallen-heart', '陨落心炎'],
  [15, 'sea-heart', '海心焰'],
  [16, 'fire-cloud-water', '火云水炎'],
  [17, 'volcanic-stone', '火山石焰'],
  [18, 'wind-fury-dragon', '风怒龙炎'],
  [19, 'green-lotus', '青莲地心火'],
  [20, 'nether-poison', '幽冥毒火'],
  [21, 'yin-yang', '阴阳双炎'],
  [22, 'myriad-beasts', '万兽灵火'],
  [23, 'dark-yellow', '玄黄炎'],
] as const

describe('flame roster', () => {
  it('locks the complete 23-seat identity roster', () => {
    expect(flameRoster.map(({ rank, slug, name }) => [rank, slug, name])).toEqual(expectedRoster)
    expect(flameRosterBySlug.size).toBe(23)
    expect(validateFlameRoster(flameRoster)).toBe(flameRoster)
  })

  it('marks the three non-novel names as extension seats', () => {
    const extensionRanks = flameRoster
      .filter(flame => flame.identityBasis === 'extension')
      .map(flame => flame.rank)

    expect(extensionRanks).toEqual([18, 20, 21])
    for (const rank of extensionRanks) {
      const flame = flameRoster.find(item => item.rank === rank)
      expect(flame?.alternateNames.length).toBeGreaterThan(0)
      expect(flame?.sources.some(source => source.tier === 'project-interpretation')).toBe(true)
    }
  })

  it('keeps implemented seats renderable while the public catalog stays approved-only', () => {
    const renderable = flameRoster.flatMap((flame) => {
      const preset = getFlamePreset(flame)
      return preset ? [validateFlamePreset(preset)] : []
    })

    expect(renderable.map(preset => preset.id)).toEqual([
      'nihility',
      'purifying-lotus',
      'karmic-lotus',
      'bone-chilling',
      'green-lotus',
    ])
    expect(flameCatalog.map(flame => flame.id)).toEqual([
      'nihility',
      'purifying-lotus',
      'karmic-lotus',
      'bone-chilling',
      'green-lotus',
    ])
  })

  it('publishes the red lotus implementation after visual approval', () => {
    const redLotus = flameRosterBySlug.get('karmic-lotus')

    expect(redLotus?.visual.state).toBe('approved')
    expect(getFlamePreset(redLotus!)).toMatchObject({
      id: 'karmic-lotus',
      rank: 8,
      kernel: 'lotus',
      kernelOptions: {
        bloomMode: 'karmic',
      },
    })
    expect(flameCatalog.map(flame => flame.id)).toContain('karmic-lotus')
  })

  it('publishes the green lotus implementation after visual approval', () => {
    const greenLotus = flameRosterBySlug.get('green-lotus')

    expect(greenLotus?.visual.state).toBe('approved')
    expect(getFlamePreset(greenLotus!)).toMatchObject({
      id: 'green-lotus',
      rank: 19,
      kernel: 'lotus',
      kernelOptions: {
        bloomMode: 'earthcore',
      },
    })
    expect(flameCatalog.map(flame => flame.id)).toContain('green-lotus')
  })

  it('assigns one representative to every visual family', () => {
    for (const family of Object.values(visualFamilyCatalog)) {
      const representative = flameRoster.find(flame => flame.id === family.representativeFlameId)
      expect(representative, family.id).toBeDefined()
      expect(representative?.visual.plannedFamily).toBe(family.id)
    }
  })

  it('does not publish unofficial novel mirrors as sources', () => {
    const sourceUrls = flameRoster.flatMap(flame => flame.sources.flatMap(source => source.url ?? []))
    expect(sourceUrls.every(url => url.startsWith('https://'))).toBe(true)
    expect(sourceUrls.some(url => /yodu|ttkan|sudugu|bidutuijian/.test(url))).toBe(false)
  })
})
