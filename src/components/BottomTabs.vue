<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { name: 'dashboard', label: '概览', icon: 'dashboard' },
  { name: 'bills', label: '账单', icon: 'bills' },
  { name: 'categories', label: '分类', icon: 'categories' },
]

function switchTab(name) {
  router.push({ name })
}
</script>

<template>
  <nav class="bottom-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.name"
      :class="['tab-item', { active: route.name === tab.name }]"
      @click="switchTab(tab.name)"
    >
      <svg v-if="tab.icon === 'dashboard'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
      <svg v-else-if="tab.icon === 'bills'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
      <span>{{ tab.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.bottom-tabs {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background: var(--surface);
  border-top: 1px solid var(--border);
  display: flex;
  z-index: 20;
  padding: 6px 12px;
  padding-bottom: max(6px, env(safe-area-inset-bottom));
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 0;
  cursor: pointer;
  color: var(--text-tertiary);
  transition: 180ms cubic-bezier(.4,0,.2,1);
  border: none;
  background: none;
  font-family: inherit;
  font-size: 0.68rem;
  font-weight: 500;
}

.tab-item.active { color: var(--text); }

.tab-item svg {
  width: 22px;
  height: 22px;
}
</style>
