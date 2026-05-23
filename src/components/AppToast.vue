<script setup>
import { useToast } from '../composables/useToast.js'

const { toasts } = useToast()
</script>

<template>
  <div class="toast-container">
    <div
      v-for="t in toasts"
      :key="t.id"
      :class="['toast', t.type]"
    >{{ t.msg }}</div>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast {
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
  color: #fff;
  background: var(--accent);
  box-shadow: var(--shadow-md);
  animation: fadeIn 0.2s ease;
  pointer-events: auto;
}

.toast.error { background: var(--expense); }
.toast.success { background: var(--income); }
</style>
