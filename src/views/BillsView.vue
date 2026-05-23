<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api/index.js'
import { useToast } from '../composables/useToast.js'
import BillModal from '../components/BillModal.vue'

const bills = ref([])
const categories = ref([])
const billType = ref('')
const page = ref(1)
const hasMore = ref(true)
const loading = ref(false)
const showModal = ref(false)
const editBill = ref(null)

const catMap = ref({})

function fmt(n) {
  return (Number(n) || 0).toFixed(2)
}

async function loadCats() {
  try {
    categories.value = await api.getCategories()
    categories.value.forEach(c => { catMap.value[c.id] = c })
  } catch (e) { /* ignore */ }
}

async function loadBills(reset = false) {
  if (loading.value) return
  if (reset) {
    page.value = 1
    bills.value = []
    hasMore.value = true
  }
  if (!hasMore.value) return

  loading.value = true
  try {
    const params = { page: page.value, size: 20 }
    if (billType.value) params.type = billType.value
    const data = await api.getBills(params)
    if (page.value === 1) bills.value = data.records
    else bills.value.push(...data.records)
    hasMore.value = page.value < data.pages
    page.value++
  } catch (err) {
    useToast().show(err.message, 'error')
  } finally {
    loading.value = false
  }
}

function setFilter(type) {
  billType.value = type
  loadBills(true)
}

function groupedBills() {
  const groups = {}
  bills.value.forEach(b => {
    const d = (b.billTime || '').slice(0, 10) || '未知日期'
    if (!groups[d]) groups[d] = { date: d, bills: [], expense: 0, income: 0 }
    groups[d].bills.push(b)
    if (b.type === 'EXPENSE') groups[d].expense += Number(b.amount)
    else groups[d].income += Number(b.amount)
  })
  return Object.values(groups)
}

function openAdd() {
  editBill.value = null
  showModal.value = true
}

function openEdit(bill) {
  editBill.value = bill
  showModal.value = true
}

function onSaved() {
  showModal.value = false
  loadBills(true)
}

// Infinite scroll
function onScroll() {
  const el = document.documentElement
  if (el.scrollTop + el.clientHeight > el.scrollHeight - 200) {
    loadBills()
  }
}

onMounted(async () => {
  await loadCats()
  loadBills()
  window.addEventListener('scroll', onScroll, { passive: true })
})
</script>

<template>
  <div>
    <div class="filter-bar">
      <button
        :class="['filter-chip', { active: billType === '' }]"
        @click="setFilter('')"
      >全部</button>
      <button
        :class="['filter-chip', { active: billType === 'EXPENSE' }]"
        @click="setFilter('EXPENSE')"
      >支出</button>
      <button
        :class="['filter-chip', { active: billType === 'INCOME' }]"
        @click="setFilter('INCOME')"
      >收入</button>
    </div>

    <div v-if="bills.length === 0 && !loading" class="empty-state">
      <div class="icon">📋</div>
      <p>还没有账单，点击 + 开始记账吧</p>
    </div>

    <div v-for="group in groupedBills()" :key="group.date" class="bill-date-group">
      <div class="bill-date-header">
        <span class="bill-date-label">{{ group.date }}</span>
        <span class="bill-date-total">
          <span v-if="group.expense > 0" class="text-expense">支出 ¥{{ fmt(group.expense) }}</span>
          <span v-if="group.expense > 0 && group.income > 0"> | </span>
          <span v-if="group.income > 0" class="text-income">收入 ¥{{ fmt(group.income) }}</span>
        </span>
      </div>
      <div
        v-for="bill in group.bills"
        :key="bill.id"
        class="bill-card"
        @click="openEdit(bill)"
      >
        <div :class="['category-icon', bill.type === 'EXPENSE' ? 'expense' : 'income']">
          {{ catMap[bill.categoryId]?.icon || (bill.type === 'EXPENSE' ? '💸' : '💰') }}
        </div>
        <div class="bill-info">
          <div class="name">{{ catMap[bill.categoryId]?.name || '未分类' }}</div>
          <div class="meta">{{ (bill.billTime || '').slice(11, 16) }}</div>
        </div>
        <div class="bill-amount">
          <div :class="['amount', bill.type === 'EXPENSE' ? 'expense' : 'income']">
            {{ bill.type === 'EXPENSE' ? '-' : '+' }}¥{{ fmt(bill.amount) }}
          </div>
          <div v-if="bill.remark" class="bill-remark">{{ bill.remark }}</div>
        </div>
      </div>
    </div>

    <div style="text-align: center; padding: 16px">
      <span v-if="loading" class="spinner"></span>
      <span v-else-if="!hasMore" style="color: var(--text-tertiary); font-size: 0.8rem">-- 全部加载完毕 --</span>
    </div>

    <!-- FAB -->
    <button class="fab" @click="openAdd">+</button>

    <!-- Bill Modal -->
    <BillModal
      v-if="showModal"
      :bill="editBill"
      :categories="categories"
      @close="showModal = false"
      @saved="onSaved"
    />
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.filter-bar::-webkit-scrollbar { display: none; }

.filter-chip {
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1.5px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: 180ms cubic-bezier(.4,0,.2,1);
  font-family: inherit;
}

.filter-chip.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.bill-date-group { margin-bottom: 20px; }

.bill-date-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  margin-bottom: 8px;
}

.bill-date-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.bill-date-total { font-size: 0.82rem; color: var(--text-tertiary); }

.bill-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--surface);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
  margin-bottom: 6px;
  cursor: pointer;
  transition: 180ms cubic-bezier(.4,0,.2,1);
}

.bill-card:hover {
  border-color: var(--border);
  box-shadow: var(--shadow-sm);
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.category-icon.expense { background: var(--expense-bg); }
.category-icon.income { background: var(--income-bg); }

.bill-info { flex: 1; min-width: 0; }
.bill-info .name { font-size: 0.9rem; font-weight: 500; }
.bill-info .meta { font-size: 0.76rem; color: var(--text-tertiary); margin-top: 2px; }

.bill-amount { text-align: right; }
.bill-amount .amount.expense { color: var(--expense); }
.bill-amount .amount.income { color: var(--income); }

.bill-remark {
  font-size: 0.76rem;
  color: var(--text-tertiary);
  margin-top: 2px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fab {
  position: fixed;
  bottom: 90px;
  right: calc(50% - 220px);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 15;
  transition: 180ms cubic-bezier(.4,0,.2,1);
  font-size: 24px;
}

@media (max-width: 520px) { .fab { right: 20px; } }

.fab:hover { background: var(--accent-hover); transform: scale(1.06); }
.fab:active { transform: scale(0.94); }

.spinner {
  display: inline-block;
  width: 22px;
  height: 22px;
  border: 2px solid var(--border);
  border-top-color: var(--text-tertiary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
