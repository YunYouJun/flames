import { describe, expect, it } from 'vitest'
import { FlameCharge, ignitionPulse } from '../src/interaction'

describe('ignition pulse', () => {
  it('holds a visible peak independent of animation time', () => {
    expect(ignitionPulse(0)).toBe(1)
    expect(ignitionPulse(120)).toBe(1)
    expect(ignitionPulse(600)).toBeGreaterThan(0.2)
  })

  it('decays monotonically and finishes without residual energy', () => {
    let previous = 1
    for (let age = 0; age <= 1200; age += 10) {
      const value = ignitionPulse(age)
      expect(value).toBeLessThanOrEqual(previous)
      expect(value).toBeGreaterThanOrEqual(0)
      previous = value
    }
    expect(previous).toBe(0)
    expect(ignitionPulse(-1)).toBe(0)
    expect(ignitionPulse(Infinity)).toBe(0)
  })
})

describe('charge envelope', () => {
  it('fades continuously on release, reaches its midpoint at 300 ms and settles at 600 ms', () => {
    const charge = new FlameCharge()
    charge.setPressed(true)
    charge.update(1000)
    expect(charge.value).toBe(1)
    charge.setPressed(false)
    expect(charge.value).toBe(1)
    expect(charge.settled).toBe(false)
    charge.update(100)
    expect(charge.value).toBeGreaterThan(0.9)
    charge.update(200)
    expect(charge.value).toBeCloseTo(0.5)
    charge.update(300)
    expect(charge.value).toBe(0)
    expect(charge.settled).toBe(true)
  })

  it('does not restart or jump when rotation repeatedly releases the pointer', () => {
    const charge = new FlameCharge()
    charge.setPressed(true)
    charge.update(1000)
    charge.setPressed(false)
    let previous = charge.value
    for (let i = 0; i < 6; i++) {
      charge.setPressed(false)
      charge.update(100)
      expect(charge.value).toBeLessThan(previous)
      previous = charge.value
    }
    expect(charge.value).toBe(0)
  })

  it('resumes charging from the current fade value and cancels without residual energy', () => {
    const charge = new FlameCharge()
    charge.setPressed(true)
    charge.update(1000)
    charge.setPressed(false)
    charge.update(300)
    charge.setPressed(true)
    expect(charge.value).toBeCloseTo(0.5)
    charge.update(100)
    expect(charge.value).toBeGreaterThan(0.5)
    charge.reset()
    charge.update(16)
    expect(charge.value).toBe(0)
    expect(charge.settled).toBe(true)
  })

  it('is stable while idle and frame-rate independent', () => {
    const a = new FlameCharge()
    const b = new FlameCharge()
    a.update(16)
    expect(a.value).toBe(0)
    for (const charge of [a, b]) {
      charge.setPressed(true)
      charge.update(1000)
      charge.setPressed(false)
    }
    a.update(240)
    for (let i = 0; i < 15; i++)
      b.update(16)
    expect(a.value).toBeCloseTo(b.value)
  })
})
