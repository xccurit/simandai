<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Beritahu Nuxt agar tidak memunculkan Sidebar di halaman ini
definePageMeta({
  layout: 'blank'
})

const router = useRouter()
const nip = ref('')
const password = ref('')
const isLoading = ref(false)

const handleLogin = () => {
  if (!nip.value || !password.value) {
    alert("NIP dan Password wajib diisi!")
    return
  }
  
  isLoading.value = true
  
  // Efek loading sejenak agar terlihat realistis
  setTimeout(() => {
    isLoading.value = false
    router.push('/')
  }, 1000)
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      
      <div class="login-header">
        <div class="flex justify-center mb-4">
          <img src="/logo-bps-kalteng.png" alt="Logo BPS" class="h-24 w-auto" />
        </div>
        
        <h2>SIMANDAI BPS</h2>
        <p>Sistem Manajemen SDM Kalteng</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>NIP / Username</label>
          <input v-model="nip" type="text" required placeholder="Masukkan NIP Anda">
        </div>

        <div class="form-group">
          <label>Password</label>
          <input v-model="password" type="password" required placeholder="••••••••">
        </div>

        <button type="submit" class="btn-primary btn-block" :disabled="isLoading">
          {{ isLoading ? 'Memverifikasi...' : 'Masuk' }}
        </button>
      </form>

    </div>
  </div>
</template>

<style scoped>
/* CSS PERSIS SEPERTI PROJECT VUE SEBELUMNYA */
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f3f4f6; /* Warna abu-abu background BPS */
  width: 100vw;
}

.login-card {
  background: white;
  width: 100%;
  max-width: 400px;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-top: 4px solid #0277BD; /* Garis biru khas Siuber/BPS */
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo-box {
  width: 100px;
  height: 100px;
  background-color: #e0f2fe;
  border-radius: 80%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 15px auto;
}

.login-header h2 {
  margin: 0;
  color: #111827;
  font-size: 24px;
  font-weight: 700;
}

.login-header p {
  margin: 5px 0 0 0;
  color: #6b7280;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.form-group input {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.form-group input:focus {
  border-color: #0277BD;
  box-shadow: 0 0 0 3px rgba(2, 119, 189, 0.15);
}

.btn-primary {
  background-color: #0277BD;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #015f96;
}

.btn-primary:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.btn-block {
  width: 100%;
  margin-top: 10px;
}
</style>