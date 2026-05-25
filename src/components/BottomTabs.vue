<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { name: 'dashboard', label: '概览' },
  { name: 'bills', label: '账单' },
  { name: 'stats', label: '统计' },
  { name: 'budgets', label: '预算' },
  { name: 'categories', label: '分类' },
]

function switchTab(name) { router.push({ name }) }
</script>

<template>
  <nav class="bottom-tabs">
    <button
      v-for="tab in tabs" :key="tab.name"
      :class="['tab-item', { active: route.name === tab.name }]"
      @click="switchTab(tab.name)"
    >
      <svg v-if="tab.name === 'dashboard'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
      <svg v-else-if="tab.name === 'bills'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <svg v-else-if="tab.name === 'stats'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
      <svg v-else-if="tab.name === 'budgets'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
      <span>{{ tab.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.bottom-tabs {
  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 480px;
  background: var(--surface); border-top: 1px solid var(--border);
  display: flex; z-index: 20; padding: 4px 8px;
  padding-bottom: max(4px, env(safe-area-inset-bottom));
}
.tab-item {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 6px 0; cursor: pointer; color: var(--text-tertiary);
  transition: 180ms cubic-bezier(.4,0,.2,1);
  border: none; background: none; font-family: inherit; font-size: 0.62rem; font-weight: 500;
}
.tab-item.active { color: var(--text); }
.tab-item svg { width: 20px; height: 20px; }
</style>
