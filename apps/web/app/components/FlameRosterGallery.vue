<script setup lang="ts">
import type { FlameSeat } from '~/data/flames'

const props = defineProps<{
  flames: FlameSeat[]
  activeSlug: string
  approvedCount: number
  emperorAvailable: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const closeButton = useTemplateRef<HTMLButtonElement>('closeButton')

function publicState(flame: FlameSeat) {
  if (flame.visual.state === 'approved')
    return 'approved'
  if (flame.visual.state === 'prototype' && import.meta.dev)
    return 'prototype'
  return 'reserved'
}

function stateLabel(flame: FlameSeat) {
  const state = publicState(flame)
  if (state === 'approved')
    return '已现世'
  if (state === 'prototype')
    return '凝聚中'
  return flame.rank === 1 ? '终局封印' : '尚未凝聚'
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape')
    emit('close')
}

onMounted(() => {
  closeButton.value?.focus()
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="roster-backdrop" @click.self="$emit('close')">
    <section class="roster-gallery" role="dialog" aria-modal="true" aria-labelledby="roster-title">
      <header class="roster-header">
        <div>
          <p>异火碑廊 · 基础已现世 {{ approvedCount }} / 22 · {{ emperorAvailable ? '帝炎已现世' : '帝炎未启' }}</p>
          <h2 id="roster-title">
            廿三席
          </h2>
        </div>
        <button ref="closeButton" type="button" aria-label="关闭异火榜" @click="$emit('close')">
          ×
        </button>
      </header>

      <nav class="roster-list" aria-label="完整异火榜">
        <NuxtLink
          v-for="flame in props.flames"
          :key="flame.id"
          :to="`/flames/${flame.slug}`"
          class="roster-seat"
          :class="[`is-${publicState(flame)}`, { 'is-active': flame.slug === activeSlug }]"
          :aria-current="flame.slug === activeSlug ? 'page' : undefined"
          @click="$emit('close')"
        >
          <span class="roster-rank">{{ String(flame.rank).padStart(2, '0') }}</span>
          <strong>{{ flame.name }}</strong>
          <small>{{ stateLabel(flame) }}</small>
          <i aria-hidden="true" />
        </NuxtLink>
      </nav>
    </section>
  </div>
</template>

<style scoped>
.roster-backdrop {
  position: fixed;
  z-index: 120;
  inset: 0;
  display: flex;
  justify-content: flex-end;
  background: rgba(0, 0, 0, 0.74);
  backdrop-filter: blur(0.55rem);
}

.roster-gallery {
  width: min(100%, 48rem);
  height: 100%;
  padding: 3rem 3rem 4rem;
  overflow-y: auto;
  border-left: 1px solid var(--brass-dim);
  background:
    linear-gradient(90deg, rgba(168, 138, 85, 0.04) 1px, transparent 1px),
    linear-gradient(180deg, rgba(18, 27, 29, 0.99), rgba(3, 6, 8, 0.995));
  background-size: 4.8rem 100%, auto;
  box-shadow: -3rem 0 8rem #000;
}

.roster-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 2.4rem;
  padding-bottom: 1.6rem;
  border-bottom: 1px solid var(--line);
}

.roster-header p {
  margin: 0 0 0.55rem;
  color: var(--brass);
  font-size: 0.58rem;
  letter-spacing: 0.24em;
}

.roster-header h2 {
  margin: 0;
  font-family: var(--display);
  font-size: 2.6rem;
  font-weight: 500;
  letter-spacing: 0.22em;
}

.roster-header button {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--bone-dim);
  background: transparent;
  font-size: 1.3rem;
  cursor: pointer;
}

.roster-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px 2rem;
}

.roster-seat {
  position: relative;
  display: grid;
  grid-template-columns: 2.6rem minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
  min-height: 3.7rem;
  padding: 0 0.5rem;
  color: rgba(232, 224, 208, 0.44);
  text-decoration: none;
}

.roster-seat::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(168, 138, 85, 0.36), transparent);
  content: '';
  opacity: 0.42;
}

.roster-rank {
  color: var(--brass);
  font-family: var(--display);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
}

.roster-seat strong {
  overflow: hidden;
  font-family: var(--display);
  font-size: 0.84rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.roster-seat small {
  color: rgba(232, 224, 208, 0.24);
  font-size: 0.48rem;
  letter-spacing: 0.12em;
}

.roster-seat i {
  position: absolute;
  left: -0.1rem;
  width: 0.22rem;
  height: 0.22rem;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.2;
}

.roster-seat.is-approved i {
  color: var(--cold);
  box-shadow: 0 0 0.7rem var(--cold);
  opacity: 0.9;
}

.roster-seat.is-approved small {
  color: rgba(159, 216, 218, 0.62);
}

.roster-seat:hover,
.roster-seat.is-active {
  color: var(--bone);
}

.roster-seat.is-active::after {
  background: var(--brass);
  opacity: 1;
}

@media (max-width: 640px) {
  .roster-gallery {
    width: 100%;
    padding: 2rem 1.25rem 3rem;
  }

  .roster-header {
    margin-bottom: 1rem;
  }

  .roster-list {
    grid-template-columns: 1fr;
    gap: 1px;
  }
}
</style>
