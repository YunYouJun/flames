<script setup lang="ts">
import type { FlameSeat } from '~/data/flames'

const props = defineProps<{
  flames: FlameSeat[]
  activeSlug: string
}>()

defineEmits<{
  openRoster: []
}>()

const visibleFlames = computed(() => {
  const activeIndex = props.flames.findIndex(flame => flame.slug === props.activeSlug)
  const width = 5
  const start = Math.min(Math.max(activeIndex - 2, 0), Math.max(props.flames.length - width, 0))
  return props.flames.slice(start, start + width)
})

function statusClass(flame: FlameSeat) {
  return flame.visual.state === 'approved' ? 'is-approved' : 'is-sealed'
}
</script>

<template>
  <div class="roster-rail-wrap">
    <nav class="roster-rail" aria-label="相邻异火席位">
      <NuxtLink
        v-for="flame in visibleFlames"
        :key="flame.id"
        :to="`/flames/${flame.slug}`"
        class="rail-seat"
        :class="[statusClass(flame), { 'is-active': flame.slug === activeSlug }]"
        :aria-current="flame.slug === activeSlug ? 'page' : undefined"
      >
        <span>{{ String(flame.rank).padStart(2, '0') }}</span>
        <strong>{{ flame.name }}</strong>
        <i aria-hidden="true" />
      </NuxtLink>
    </nav>
    <button class="roster-open" type="button" @click="$emit('openRoster')">
      展开全榜
      <span aria-hidden="true">廿三席</span>
    </button>
  </div>
</template>

<style scoped>
.roster-rail-wrap {
  display: flex;
  gap: 0.65rem;
  align-items: stretch;
  width: min(100%, 64rem);
}

.roster-rail {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
  border: 1px solid rgba(232, 224, 208, 0.1);
  background: rgba(232, 224, 208, 0.06);
}

.rail-seat {
  position: relative;
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  gap: 0.5rem;
  align-items: center;
  min-height: 3.7rem;
  padding: 0.55rem 0.7rem;
  overflow: hidden;
  color: rgba(232, 224, 208, 0.36);
  background: linear-gradient(120deg, rgba(21, 29, 31, 0.94), rgba(4, 7, 8, 0.9));
  text-decoration: none;
  transition: color 180ms ease, background 180ms ease;
}

.rail-seat span {
  color: rgba(168, 138, 85, 0.62);
  font-family: var(--display);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
}

.rail-seat strong {
  overflow: hidden;
  font-family: var(--display);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rail-seat i {
  position: absolute;
  right: 0.7rem;
  bottom: 0.42rem;
  left: 0.7rem;
  height: 1px;
  background: currentColor;
  opacity: 0.1;
}

.rail-seat.is-approved::after {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  width: 0.28rem;
  height: 0.28rem;
  border-radius: 50%;
  background: var(--cold);
  box-shadow: 0 0 0.7rem var(--cold);
  content: '';
  opacity: 0.72;
}

.rail-seat:hover,
.rail-seat.is-active {
  color: var(--bone);
  background: linear-gradient(120deg, rgba(41, 52, 54, 0.96), rgba(7, 12, 14, 0.94));
}

.rail-seat.is-active {
  box-shadow: inset 0 -1px var(--brass);
}

.roster-open {
  display: grid;
  min-width: 8.2rem;
  place-content: center;
  border: 1px solid var(--brass-dim);
  color: var(--brass);
  background: rgba(9, 13, 14, 0.92);
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  cursor: pointer;
}

.roster-open span {
  margin-top: 0.28rem;
  color: rgba(232, 224, 208, 0.28);
  font-size: 0.48rem;
  letter-spacing: 0.14em;
}

@media (max-width: 760px) {
  .roster-rail-wrap {
    gap: 0.35rem;
  }

  .roster-rail {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .rail-seat:first-child,
  .rail-seat:last-child {
    display: none;
  }

  .rail-seat {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 0.2rem;
    min-height: 3.5rem;
    padding: 0.35rem 0.2rem;
  }

  .rail-seat strong {
    width: 100%;
    font-size: 0.62rem;
    text-align: center;
  }

  .roster-open {
    min-width: 5.4rem;
    padding: 0 0.45rem;
    font-size: 0.56rem;
  }
}
</style>
