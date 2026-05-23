<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api, setAuth } from '../api/index.js'
import { useToast } from '../composables/useToast.js'

const router = useRouter()

const mode = ref('login')
const phone = ref('')
const password = ref('')
const nickname = ref('')
const loading = ref(false)

async function submit() {
  if (!phone.value.trim() || !password.value) {
    useToast().show('请填写完整信息', 'error')
    return
  }
  if (mode.value === 'register' && password.value.length < 6) {
    useToast().show('密码至少6位', 'error')
    return
  }

  loading.value = true
  try {
    const body = { phone: phone.value.trim(), password: password.value }
    if (mode.value === 'register' && nickname.value.trim()) {
      body.nickname = nickname.value.trim()
    }

    const data = mode.value === 'login'
      ? await api.login(body)
      : await api.register(body)

    setAuth(data.token, data.user)
    router.replace('/dashboard')
  } catch (err) {
    useToast().show(err.message, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-header">
      <div class="logo">📒</div>
      <h1>记一笔</h1>
      <p>简洁生活记账</p>
    </div>
    <div class="auth-card">
      <div class="auth-tabs">
        <button
          :class="['auth-tab', { active: mode === 'login' }]"
          @click="mode = 'login'"
        >登录</button>
        <button
          :class="['auth-tab', { active: mode === 'register' }]"
          @click="mode = 'register'"
        >注册</button>
      </div>
      <form @submit.prevent="submit">
        <div class="form-group">
          <label>手机号</label>
          <input class="form-input" type="tel" v-model="phone" placeholder="请输入手机号" maxlength="11">
        </div>
        <div class="form-group">
          <label>密码</label>
          <input class="form-input" type="password" v-model="password" placeholder="请输入密码" minlength="6">
        </div>
        <div v-if="mode === 'register'" class="form-group">
          <label>昵称（选填）</label>
          <input class="form-input" type="text" v-model="nickname" placeholder="给自己取个名字吧">
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? '...' : (mode === 'login' ? '登录' : '注册') }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 32px 24px;
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
}

.auth-header .logo {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 24px;
  color: #fff;
}

.auth-header h1 { margin-bottom: 4px; }
.auth-header p { color: var(--text-secondary); font-size: 0.9rem; }

.auth-card {
  width: 100%;
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 28px 24px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border);
}

.auth-tabs {
  display: flex;
  margin-bottom: 24px;
  border-bottom: 2px solid var(--border-light);
}

.auth-tab {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  border: none;
  background: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: 180ms cubic-bezier(.4,0,.2,1);
  font-family: inherit;
}

.auth-tab.active {
  color: var(--text);
  border-bottom-color: var(--accent);
}
</style>