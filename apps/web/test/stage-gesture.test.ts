import { describe, expect, it } from 'vitest'
import { StageGesture, stageHoldDelayMs } from '../app/utils/stage-gesture'

describe('stage gesture arbitration', () => {
  it('accepts a quick tap and ignores small hand tremor', () => {
    const gesture = new StageGesture()
    gesture.start(1, 20, 20, 0)
    gesture.move(1, 24, 23)
    expect(gesture.finish(1, 100)).toBe(true)
    expect(gesture.owns(1)).toBe(false)
  })

  it('latches a drag even when the finger returns to its origin', () => {
    const gesture = new StageGesture()
    gesture.start(1, 20, 20, 0)
    gesture.move(1, 28, 20)
    gesture.move(1, 20, 20)
    expect(gesture.moved).toBe(true)
    expect(gesture.finish(1, 100)).toBe(false)
  })

  it('does not let another pointer steal or finish the interaction', () => {
    const gesture = new StageGesture()
    gesture.start(1, 20, 20, 0)
    expect(gesture.move(2, 80, 20)).toBeUndefined()
    expect(gesture.finish(2, 100)).toBe(false)
    expect(gesture.finish(1, 100)).toBe(true)
  })

  it('never pulses after a hold, cancellation, or route change', () => {
    const gesture = new StageGesture()
    gesture.start(1, 0, 0, 0)
    expect(gesture.finish(1, 350)).toBe(false)
    gesture.start(1, 0, 0, 400)
    expect(gesture.finish(1, 450, true)).toBe(false)
    gesture.start(1, 0, 0, 500)
    gesture.cancel()
    expect(gesture.finish(1, 550)).toBe(false)
  })

  it('waits for hold intent and never treats a held release as a tap', () => {
    const gesture = new StageGesture()
    gesture.start(1, 0, 0, 0)
    expect(gesture.phase).toBe('pending')
    expect(gesture.hold(2)).toBe(false)
    expect(gesture.hold(1)).toBe(true)
    expect(gesture.phase).toBe('holding')
    expect(gesture.finish(1, stageHoldDelayMs)).toBe(false)
    expect(gesture.phase).toBe('idle')
  })

  it('hands a held gesture to dragging once, including after returning to origin', () => {
    const gesture = new StageGesture()
    gesture.start(1, 10, 10, 0)
    gesture.hold(1)
    gesture.move(1, 14, 12)
    expect(gesture.phase).toBe('holding')
    gesture.move(1, 18, 10)
    expect(gesture.phase).toBe('dragging')
    gesture.move(1, 10, 10)
    expect(gesture.phase).toBe('dragging')
    expect(gesture.hold(1)).toBe(false)
    expect(gesture.finish(1, 800)).toBe(false)
  })

  it('does not start charging when a delayed timer fires after dragging or cancellation', () => {
    const gesture = new StageGesture()
    gesture.start(1, 0, 0, 0)
    gesture.move(1, 12, 0)
    expect(gesture.hold(1)).toBe(false)
    gesture.cancel()
    expect(gesture.hold(1)).toBe(false)
    expect(gesture.phase).toBe('idle')
  })
})
