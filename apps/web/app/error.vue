<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const isNotFound = computed(() => props.error.statusCode === 404)

useSeoMeta({
  title: () => isNotFound.value ? '席位未录 · 异火榜 | YunYouJun' : '异火榜暂不可用 | YunYouJun',
  robots: 'noindex, nofollow',
})

function returnToRoster() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <main class="error-shell">
    <div class="error-atmosphere" aria-hidden="true" />

    <NuxtLink class="error-brand" to="/" @click.prevent="returnToRoster">
      异火榜
    </NuxtLink>

    <section class="error-card" aria-labelledby="error-title">
      <p class="error-code">
        {{ error.statusCode }}
      </p>
      <h1 id="error-title">
        {{ isNotFound ? '此席未录' : '火种暂熄' }}
      </h1>
      <p>
        {{ isNotFound ? '异火碑廊中没有这枚铭牌。' : '当前无法展开异火碑廊，请稍后再试。' }}
      </p>
      <button type="button" @click="returnToRoster">
        返回廿三席
        <span aria-hidden="true">↗</span>
      </button>
    </section>

    <p class="error-mark" aria-hidden="true">
      封
    </p>
  </main>
</template>

<style scoped>
.error-shell {
  position: relative;
  display: grid;
  min-height: 100svh;
  place-items: center;
  overflow: hidden;
  color: var(--bone);
  background:
    radial-gradient(circle at 50% 48%, rgba(63, 100, 104, 0.16), transparent 24rem),
    var(--ink);
}

.error-shell::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  box-shadow: inset 0 0 14rem 4rem #000;
}

.error-atmosphere {
  position: absolute;
  inset: 0;
  opacity: 0.5;
  background:
    linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.014) 1px, transparent 1px);
  background-size: 68px 68px;
}

.error-brand {
  position: absolute;
  z-index: 2;
  top: 2.5rem;
  left: 3.5rem;
  color: var(--bone);
  font-family: var(--display);
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: 0.34em;
  text-decoration: none;
}

.error-card {
  position: relative;
  z-index: 2;
  width: min(calc(100% - 3rem), 34rem);
  padding: 4rem 3rem;
  border-block: 1px solid var(--line);
  text-align: center;
}

.error-code {
  margin: 0 0 0.5rem;
  color: var(--brass);
  font-family: var(--display);
  font-size: 0.72rem;
  letter-spacing: 0.55em;
}

.error-card h1 {
  margin: 0;
  font-family: var(--display);
  font-size: clamp(3rem, 9vw, 5.4rem);
  font-weight: 500;
  letter-spacing: 0.16em;
}

.error-card > p:not(.error-code) {
  margin: 1.2rem 0 2.5rem;
  color: var(--bone-dim);
  font-size: 0.78rem;
  letter-spacing: 0.18em;
}

.error-card button {
  display: inline-flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.8rem 1.1rem;
  border: 1px solid var(--brass-dim);
  color: var(--brass);
  background: transparent;
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  cursor: pointer;
}

.error-mark {
  position: absolute;
  z-index: 1;
  margin: 0;
  color: rgba(168, 138, 85, 0.04);
  font-family: var(--display);
  font-size: min(55vw, 38rem);
  line-height: 1;
}

@media (max-width: 640px) {
  .error-brand {
    top: 1.5rem;
    left: 1.25rem;
  }

  .error-card {
    padding: 3rem 1rem;
  }
}
</style>
