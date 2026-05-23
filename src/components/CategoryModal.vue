<script setup>
import { ref } from 'vue'
import { api } from '../api/index.js'
import { useToast } from '../composables/useToast.js'

const props = defineProps({
  type: { type: String, default: 'EXPENSE' },
})

const emit = defineEmits(['close', 'saved'])

const name = ref('')
const icon = ref('')
const catType = ref(props.type)
const saving = ref(false)

async function save() {
  if (!name.value.trim()) {
    useToast().show('请输入分类名称', 'error')
    return
  }
  saving.value = true
  try {
    await api.createCategory({
      name: name.value.trim(),
      type: catType.value,
      icon: icon.value.trim() || undefined,
    })
    useToast().show('分类已添加', 'success')
    emit('saved')
  } catch (err) {
    useToast().show(err.message, 'error')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-sheet">
      <h2>添加分类</h2>
      <div class="form-group">
        <label>图标（emoji）</label>
        <input class="form-input" type="text" v-model="icon" placeholder="例如：🍕" maxlength="2">
      </div>
      <div class="form-group">
        <label>名称</label>
        <input class="form-input" type="text" v-model="name" placeholder="分类名称">
      </div>
      <div class="form-group">
        <label>类型</label>
        <div class="type-toggle">
          <button :class="{ active: catType === 'EXPENSE', expense: catType === 'EXPENSE' }" @click="catType = 'EXPENSE'">支出</button>
          <button :class="{ active: catType === 'INCOME', income: catType === 'INCOME' }" @click="catType = 'INCOME'">收入</button>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-outline" @click="emit('close')">取消</button>
        <button class="btn btn-primary" @click="save" :disabled="saving">{{ saving ? '...' : '保存' }}</button>
      </div>
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

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.modal-actions .btn { flex: 1; }
</style>
