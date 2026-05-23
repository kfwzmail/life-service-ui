<script setup>
import { ref, onMounted } from 'vue'
import { api, getStore } from '../api/index.js'
import { useToast } from '../composables/useToast.js'
import CategoryModal from '../components/CategoryModal.vue'
import { useRouter } from 'vue-router'
import { clearAuth } from '../api/index.js'

const router = useRouter()
const store = getStore()
const categories = ref([])
const showCatModal = ref(false)
const catModalType = ref('EXPENSE')

function fmt(n) {
  return (Number(n) || 0).toFixed(2)
}

async function load() {
  try {
    categories.value = await api.getCategories()
  } catch (e) { /* ignore */ }
}

const expenseCats = () => categories.value.filter(c => c.type === 'EXPENSE')
const incomeCats = () => categories.value.filter(c => c.type === 'INCOME')

async function deleteCat(id) {
  if (!confirm('删除此分类？')) return
  try {
    await api.deleteCategory(id)
    useToast().show('已删除', 'success')
    load()
  } catch (err) {
    useToast().show(err.message, 'error')
  }
}

function openAdd(type) {
  catModalType.value = type
  showCatModal.value = true
}

function onCatSaved() {
  showCatModal.value = false
  load()
}

function logout() {
  clearAuth()
  router.replace('/auth')
}

onMounted(load)
</script>

<template>
  <div>
    <!-- User bar -->
    <div class="user-bar">
      <div class="user-avatar">{{ (store.user?.nickname || store.user?.phone || '?')[0]?.toUpperCase() }}</div>
      <div class="user-info">
        <div class="name">{{ store.user?.nickname || '用户' }}</div>
        <div class="phone">{{ store.user?.phone }}</div>
      </div>
      <button class="btn btn-outline btn-sm" @click="logout">退出</button>
    </div>

    <!-- Expense Categories -->
    <div class="cat-section">
      <h3>支出分类</h3>
      <div class="cat-grid">
        <div
          v-for="cat in expenseCats()"
          :key="cat.id"
          :class="['cat-item', { custom: !cat.isDefault }]"
        >
          <button
            v-if="!cat.isDefault"
            class="cat-del"
            @click="deleteCat(cat.id)"
          >×</button>
          <div class="cat-icon expense">{{ cat.icon || '📌' }}</div>
          <div class="cat-name">{{ cat.name }}</div>
        </div>
        <button class="add-cat-btn" @click="openAdd('EXPENSE')">
          <span class="plus">+</span>添加
        </button>
      </div>
    </div>

    <!-- Income Categories -->
    <div class="cat-section">
      <h3>收入分类</h3>
      <div class="cat-grid">
        <div
          v-for="cat in incomeCats()"
          :key="cat.id"
          :class="['cat-item', { custom: !cat.isDefault }]"
        >
          <button
            v-if="!cat.isDefault"
            class="cat-del"
            @click="deleteCat(cat.id)"
          >×</button>
          <div class="cat-icon income">{{ cat.icon || '📌' }}</div>
          <div class="cat-name">{{ cat.name }}</div>
        </div>
        <button class="add-cat-btn" @click="openAdd('INCOME')">
          <span class="plus">+</span>添加
        </button>
      </div>
    </div>

    <CategoryModal
      v-if="showCatModal"
      :type="catModalType"
      @close="showCatModal = false"
      @saved="onCatSaved"
    />
  </div>
</template>

<style scoped>
.user-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--surface);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  margin-bottom: 20px;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-info { flex: 1; }
.user-info .name { font-weight: 600; font-size: 0.95rem; }
.user-info .phone { font-size: 0.8rem; color: var(--text-secondary); }

.cat-section { margin-bottom: 24px; }
.cat-section h3 {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 10px;
  padding: 0 4px;
}

.cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.cat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  background: var(--surface);
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border-light);
  cursor: pointer;
  transition: 180ms cubic-bezier(.4,0,.2,1);
  position: relative;
}

.cat-item:hover { border-color: var(--border); }

.cat-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.cat-icon.expense { background: var(--expense-bg); }
.cat-icon.income { background: var(--income-bg); }

.cat-name { font-size: 0.76rem; font-weight: 500; text-align: center; }

.cat-del {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--expense);
  color: #fff;
  border: none;
  font-size: 12px;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.cat-item.custom:hover .cat-del { display: flex; }

.add-cat-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 8px;
  border-radius: var(--radius-sm);
  border: 2px dashed var(--border);
  cursor: pointer;
  transition: 180ms cubic-bezier(.4,0,.2,1);
  color: var(--text-tertiary);
  font-size: 0.76rem;
  background: transparent;
  font-family: inherit;
  min-height: 90px;
}

.add-cat-btn:hover {
  border-color: var(--text-tertiary);
  color: var(--text-secondary);
}

.add-cat-btn .plus { font-size: 24px; font-weight: 300; line-height: 1; }
</style>
