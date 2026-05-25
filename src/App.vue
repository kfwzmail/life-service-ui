<script setup>
import { RouterView, useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import BottomTabs from './components/BottomTabs.vue'
import AppToast from './components/AppToast.vue'
import { isLoggedIn } from './api/index.js'

const router = useRouter()
const route = useRoute()

const showTabs = computed(() => {
  return isLoggedIn() && !route.path.includes('/auth')
})

const title = computed(() => {
  const map = { dashboard: '概览', bills: '账单', stats: '统计', budgets: '预算', categories: '分类' }
  return map[route.name] || '记一笔'
})
</script>

<template>
  <div class="app-shell">
    <header v-if="showTabs" class="topbar">
      <h1>{{ title }}</h1>
    </header>
    <main :class="{ 'has-tabs': showTabs }">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
    <BottomTabs v-if="showTabs" />
    <AppToast ref="toastRef" />
  </div>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg);
}

.topbar h1 { font-size: 1.15rem; }

main {
  padding: 0 20px 100px;
  min-height: 100dvh;
}
</style>
