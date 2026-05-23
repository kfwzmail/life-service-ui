<script setup>
import { ref, watch, computed } from 'vue'
import { api } from '../api/index.js'
import { useToast } from '../composables/useToast.js'

const props = defineProps({
  bill: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'saved'])

const type = ref('EXPENSE')
const categoryId = ref(null)
const amount = ref('')
const billTime = ref('')
const remark = ref('')
const saving = ref(false)

const isEdit = computed(() => !!props.bill)

const filteredCats = computed(() => {
  return props.categories.filter(c => c.type === type.value)
})

function init() {
  if (props.bill) {
    type.value = props.bill.type
    categoryId.value = props.bill.categoryId
    amount.value = props.bill.amount
    billTime.value = (props.bill.billTime || '').slice(0, 16)
    remark.value = props.bill.remark || ''
  } else {
    type.value = 'EXPENSE'
    categoryId.value = null
    amount.value = ''
    billTime.value = new Date().toISOString().slice(0, 16)
    remark.value = ''
  }
}

watch(() => props.bill, init, { immediate: true })

async function save() {
  if (!categoryId.value) {
    useToast().show('请选择分类', 'error')
    return
  }
  if (!amount.value || Number(amount.value) <= 0) {
    useToast().show('请输入有效金额', 'error')
    return
  }
  if (!billTime.value) {
    useToast().show('请选择时间', 'error')
    return
  }

  saving.value = true
  const body = {
    categoryId: categoryId.value,
    type: type.value,
    amount: Number(amount.value),
    billTime: billTime.value + ':00',
    remark: remark.value.trim() || undefined,
  }

  try {
    if (isEdit.value) {
      await api.updateBill(props.bill.id, body)
    } else {
      await api.createBill(body)
    }
    useToast().show(isEdit.value ? '已更新' : '已记录', 'success')
    emit('saved')
  } catch (err) {
    useToast().show(err.message, 'error')
  } finally {
    saving.value = false
  }
}

async function remove() {
  if (!confirm('确认删除？')) return
  try {
    await api.deleteBill(props.bill.id)
    useToast().show('已删除', 'success')
    emit('saved')
  } catch (err) {
    useToast().show(err.message, 'error')
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-sheet">
      <h2>{{ isEdit ? '编辑账单' : '记一笔' }}</h2>

      <div class="type-toggle">
        <button :class="{ active: type === 'EXPENSE', expense: type === 'EXPENSE' }" @click="type = 'EXPENSE'">支出</button>
        <button :class="{ active: type === 'INCOME', income: type === 'INCOME' }" @click="type = 'INCOME'">收入</button>
      </div>

      <div class="form-group">
        <label>分类</label>
        <div class="cat-picker">
          <button
            v-for="cat in filteredCats"
            :key="cat.id"
            :class="['cat-picker-item', { selected: categoryId === cat.id }]"
            @click="categoryId = cat.id"
          >{{ cat.icon || '📌' }} {{ cat.name }}</button>
        </div>
      </div>

      <div class="form-group">
        <label>金额</label>
        <input class="form-input" type="number" v-model="amount" placeholder="0.00" step="0.01" min="0.01" style="font-size:1.5rem;font-weight:600">
      </div>

      <div class="form-group">
        <label>时间</label>
        <input class="form-input" type="datetime-local" v-model="billTime">
      </div>

      <div class="form-group">
        <label>备注（选填）</label>
        <input class="form-input" type="text" v-model="remark" placeholder="写点什么...">
      </div>

      <div class="modal-actions">
        <button class="btn btn-outline" @click="emit('close')">取消</button>
        <button class="btn btn-primary" @click="save" :disabled="saving">{{ saving ? '...' : '保存' }}</button>
      </div>

      <button
        v-if="isEdit"
        class="btn btn-outline btn-danger"
        style="width:100%;margin-top:10px"
        @click="remove"
      >删除此账单</button>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.4);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.modal-sheet {
  width: 100%;
  max-width: 480px;
  max-height: 85dvh;
  overflow-y: auto;
  background: var(--surface);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding: 24px 20px;
  padding-bottom: max(24px, env(safe-area-inset-bottom));
  animation: slideUp 0.3s ease;
  box-shadow: var(--shadow-lg);
}

.modal-sheet h2 { font-size: 1.1rem; margin-bottom: 20px; }

.cat-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cat-picker-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  cursor: pointer;
  font-size: 0.82rem;
  transition: 180ms cubic-bezier(.4,0,.2,1);
  background: var(--surface);
  font-family: inherit;
}

.cat-picker-item.selected {
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.modal-actions .btn { flex: 1; }
</style>
