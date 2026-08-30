<script setup lang="ts">
import type { FlameSeat, FlameSourceTier } from '~/data/flames'

const props = defineProps<{
  flame: FlameSeat
}>()

const emit = defineEmits<{
  close: []
}>()

const closeButton = useTemplateRef<HTMLButtonElement>('closeButton')
const visualBrief = computed(() => props.flame.visual.state === 'reserved' ? undefined : props.flame.visual.brief)
const sourceTierLabels: Record<FlameSourceTier, string> = {
  'novel': '原著明确',
  'authorized-extension': '授权扩展',
  'project-interpretation': '项目演绎',
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
  <div class="details-backdrop" @click.self="$emit('close')">
    <aside class="details-panel" role="dialog" aria-modal="true" :aria-labelledby="`details-${flame.slug}`">
      <button ref="closeButton" class="details-close" type="button" aria-label="关闭设定" @click="$emit('close')">
        ×
      </button>
      <p class="details-eyebrow">
        异火 {{ String(flame.rank).padStart(2, '0') }}
      </p>
      <h2 :id="`details-${flame.slug}`">
        {{ flame.name }}
      </h2>
      <section>
        <h3>设定摘要</h3>
        <p>{{ flame.summary }}</p>
      </section>
      <section v-if="visualBrief">
        <h3>视觉演绎</h3>
        <p>{{ visualBrief.interpretation }}</p>
      </section>
      <section v-else>
        <h3>凝聚状态</h3>
        <p>{{ flame.rank === 1 ? '帝炎将在二十二种基础异火完成后开启。' : '该席视觉尚在封印中，不以临时换色效果代替正式还原。' }}</p>
      </section>
      <section v-if="flame.alternateNames.length">
        <h3>衍生版本</h3>
        <p v-for="alternate in flame.alternateNames" :key="alternate.name">
          {{ alternate.context }}：{{ alternate.name }}
        </p>
      </section>
      <section class="source-note">
        <h3>资料说明</h3>
        <p>文案为项目独立概括；原著事实、授权扩展与视觉演绎分别标注，不替代原作。</p>
        <ul class="source-list">
          <li v-for="source in flame.sources" :key="`${source.tier}-${source.citation}`">
            <strong>{{ sourceTierLabels[source.tier] }}</strong>
            <a v-if="source.url" :href="source.url" target="_blank" rel="noreferrer">{{ source.label }}</a>
            <span v-else>{{ source.label }}</span>
            <small>{{ source.citation }}</small>
          </li>
        </ul>
      </section>
    </aside>
  </div>
</template>
