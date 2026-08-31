<script setup lang="ts">
import type { FlameSeat } from '~/data/flames'
import { formatFlameRank } from '~/data/flames'

const props = defineProps<{
  flame: FlameSeat
}>()

defineEmits<{
  showDetails: []
}>()

const rankLabel = computed(() => formatFlameRank(props.flame.rank))
const stateLabel = computed(() => {
  if (props.flame.rank === 1)
    return '终局封印'
  if (props.flame.visual.state === 'prototype' && import.meta.dev)
    return '凝聚中 · 仅供评审'
  return '尚未凝聚'
})
</script>

<template>
  <aside class="flame-identity">
    <p class="rank-label">
      {{ rankLabel }}
    </p>
    <h1>{{ flame.name }}</h1>
    <p class="epithet">
      {{ flame.epithet }}
    </p>
    <p v-if="flame.visual.state !== 'approved'" class="identity-state">
      {{ stateLabel }}
    </p>
    <button class="text-action" type="button" @click="$emit('showDetails')">
      阅览设定
      <span aria-hidden="true">↗</span>
    </button>
  </aside>
</template>
