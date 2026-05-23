<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '../api/index.js'
import { useToast } from '../composables/useToast.js'

const today = ref(null)
const month = ref(null)
const currentMonth = ref(new Date().toISOString().slice(0, 7))

function fmt(n) {
  return (Number(n) || 0).toFixed(2)
}

const monthLabel = computed(() => {
  const [y, m] = currentMonth.value.split('-')
  return y + '年' + parseInt(m) + '月'
})

function maxPct(items, item) {
  const max = Math.max(...items.map(i => Number(i.amount || 0)), 1)
  return ((Number(item.amount) / max) * 100).toFixed(0)
}

async function load() {
  try {
    const [t, m] = await Promise.all([
      api.getTodayStats(),
      api.getMonthStats(currentMonth.value),
    ])
    today.value = t
    month.value = m
  } catch (err) {
    useToast().show(err.message, 'error')
  }
}

function prevMonth() {
  const d = new Date(currentMonth.value + '-01')
  d.setMonth(d.getMonth() - 1)
  currentMonth.value = d.toISOString().slice(0, 7)
  load()
}

function nextMonth() {
  const d = new Date(currentMonth.value + '-01')
  d.setMonth(d.getMonth() + 1)
  currentMonth.value = d.toISOString().slice(0, 7)
  load()
}

onMounted(load)
</script>

<template>
  <div>
    <div class="section-header"><h2>今日统计</h2></div>
    <div class="stats-row">
      <div class="stat-card expense"><div class="stat-label">支出</div><div class="amount amount-md">¥{{ fmt(today?.totalExpense) }}</div></div>
      <div class="stat-card income"><div class="stat-label">收入</div><div class="amount amount-md">¥{{ fmt(today?.totalIncome) }}</div></div>
      <div class="stat-card full balance"><div class="stat-label">今日结余</div><div class="amount amount-lg">¥{{ fmt(today?.netBalance) }}</div></div>
    </div>
    <div class="section-header">
      <h2>月度分析</h2>
      <div class="month-picker">
        <button @click="prevMonth">‹</button>
        <span>{{ monthLabel }}</span>
        <button @click="nextMonth">›</button>
      </div>
    </div>
    <div class="stats-row">
      <div class="stat-card expense"><div class="stat-label">本月支出</div><div class="amount amount-md">¥{{ fmt(month?.totalExpense) }}</div></div>
      <div class="stat-card income"><div class="stat-label">本月收入</div><div class="amount amount-md">¥{{ fmt(month?.totalIncome) }}</div></div>
    </div>
    <div style="margin-top:4px">
      <h3 style="font-size:.85rem;color:var(--text-secondary);margin-bottom:10px">支出分类</h3>
      <div v-if="!month?.expenseBreakdown?.length" class="empty-state"><p>暂无数据</p></div>
      <div v-else class="breakdown-list">
        <div v-for="item in month.expenseBreakdown" :key="item.categoryId" class="breakdown-item">
          <div class="breakdown-icon expense">{{ item.icon || '📌' }}</div>
          <div class="breakdown-info">
            <div class="name">{{ item.categoryName }}</div>
            <div class="breakdown-bar-wrap"><div class="breakdown-bar expense" :style="{ width: maxPct(month.expenseBreakdown, item) + '%' }"></div></div>
          </div>
          <div class="breakdown-amounts"><div class="amount">¥{{ fmt(item.amount) }}</div><div class="percent">{{ (Number(item.percentage) || 0).toFixed(1) }}%</div></div>
        </div>
      </div>
    </div>
    <div style="margin-top:20px">
      <h3 style="font-size:.85rem;color:var(--text-secondary);margin-bottom:10px">收入分类</h3>
      <div v-if="!month?.incomeBreakdown?.length" class="empty-state"><p>暂无数据</p></div>
      <div v-else class="breakdown-list">
        <div v-for="item in month.incomeBreakdown" :key="item.categoryId" class="breakdown-item">
          <div class="breakdown-icon income">{{ item.icon || '📌' }}</div>
          <div class="breakdown-info">
            <div class="name">{{ item.categoryName }}</div>
            <div class="breakdown-bar-wrap"><div class="breakdown-bar income" :style="{ width: maxPct(month.incomeBreakdown, item) + '%' }"></div></div>
          </div>
          <div class="breakdown-amounts"><div class="amount">¥{{ fmt(item.amount) }}</div><div class="percent">{{ (Number(item.percentage) || 0).toFixed(1) }}%</div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px}
.stat-card{background:var(--surface);border-radius:var(--radius);padding:18px 16px;box-shadow:var(--shadow-sm);border:1px solid var(--border)}
.stat-card.full{grid-column:1/-1}
.stat-label{font-size:.78rem;color:var(--text-secondary);margin-bottom:6px}
.stat-card.expense .amount{color:var(--expense)}
.stat-card.income .amount{color:var(--income)}
.month-picker{display:flex;align-items:center;gap:8px;font-size:.88rem;font-weight:500}
.month-picker button{width:28px;height:28px;border-radius:50%;border:1.5px solid var(--border);background:var(--surface);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);transition:180ms cubic-bezier(.4,0,.2,1);font-size:16px}
.month-picker button:hover{border-color:var(--text-tertiary);color:var(--text)}
.breakdown-list{display:flex;flex-direction:column;gap:10px;margin-bottom:8px}
.breakdown-item{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--surface);border-radius:var(--radius-sm);border:1px solid var(--border-light)}
.breakdown-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.breakdown-icon.expense{background:var(--expense-bg)}
.breakdown-icon.income{background:var(--income-bg)}
.breakdown-info{flex:1;min-width:0}
.breakdown-info .name{font-size:.88rem;font-weight:500}
.breakdown-bar-wrap{height:5px;background:var(--border-light);border-radius:3px;margin-top:6px;overflow:hidden}
.breakdown-bar{height:100%;border-radius:3px;transition:width .6s ease}
.breakdown-bar.expense{background:var(--expense)}
.breakdown-bar.income{background:var(--income)}
.breakdown-amounts{text-align:right}
.breakdown-amounts .amount{font-size:.9rem}
.breakdown-amounts .percent{font-size:.75rem;color:var(--text-tertiary)}
</style>
