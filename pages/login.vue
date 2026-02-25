<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCookie } from '#app'

definePageMeta({ layout: false })

const router = useRouter()
const nip = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const isAuth = useCookie('isLoggedIn')
const userSesi = useCookie('userProfile', { 
  default: () => ({ nama: '', role: '', unit_kerja: '', nip: '' }) 
})

// =========================================================
// DATABASE USER DUMMY (Sesuai Arahan Kepala Umum)
// Password Semuanya: 12345
// =========================================================
const dataUser = [
  { nip: 'admin', pass: '12345', nama: 'Bapak Kabag Umum', role: 'Admin', unit_kerja: 'BPS Provinsi Kalimantan Tengah' },
  { nip: 'spvprov', pass: '12345', nama: 'Ibu SDM Prov', role: 'Supervisor Prov', unit_kerja: 'BPS Provinsi Kalimantan Tengah' },
  { nip: 'spvkab', pass: '12345', nama: 'Ketua Tim Kapuas', role: 'Supervisor Kabko', unit_kerja: 'BPS Kab. Kapuas' },
  { nip: 'operator', pass: '12345', nama: 'Staf Entri Kapuas', role: 'Operator', unit_kerja: 'BPS Kab. Kapuas' },
  // Login sebagai Pegawai (Sesuai dengan NIP Budi Santoso di data Pegawai)
  { nip: '198501012010011001', pass: '12345', nama: 'Budi Santoso', role: 'Pegawai', unit_kerja: 'BPS Provinsi Kalimantan Tengah' },
]

const handleLogin = () => {
  errorMessage.value = ''
  if (!nip.value || !password.value) {
    errorMessage.value = "NIP dan Password wajib diisi!"
    return
  }
  
  isLoading.value = true
  
  setTimeout(() => {
    isLoading.value = false
    
    // Cek kecocokan user
    const userValid = dataUser.find(u => u.nip === nip.value && u.pass === password.value)
    
    if (userValid) {
      // 1. Simpan Data Sesi
      userSesi.value = {
        nama: userValid.nama,
        role: userValid.role,
        unit_kerja: userValid.unit_kerja,
        nip: userValid.nip
      }
      isAuth.value = 'true'
      
      // 2. Arahkan ke Dashboard
      router.push('/')
    } else {
      errorMessage.value = "NIP atau Password salah!"
    }
  }, 800)
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="flex justify-center mb-4">
          <img src="/logo-bps-kalteng1.png" alt="Logo BPS" class="h-24 w-auto mx-auto" />
        </div>
        <h2>SIMANDAI BPS</h2>
        <p>Sistem Manajemen SDM Kalteng</p>
      </div>

      <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm text-center font-bold">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>NIP / Username</label>
          <input v-model="nip" type="text" required placeholder="Contoh: admin / spvkab / 198501012010011001">
        </div>
        <div class="form-group">
          <label>Password</label>
          <input v-model="password" type="password" required placeholder="Ketik: 12345">
        </div>
        <button type="submit" class="btn-primary btn-block" :disabled="isLoading">
          <span v-if="isLoading">⏳ Memverifikasi...</span>
          <span v-else>Masuk Aplikasi</span>
        </button>
      </form>
      
      <div class="mt-6 p-4 bg-blue-50 rounded-lg text-xs text-blue-800 leading-relaxed border border-blue-100">
        <strong>📝 Info Testing Role (Pass: 12345)</strong><br>
        • Admin: <code>admin</code><br>
        • Spv Prov: <code>spvprov</code><br>
        • Spv Kabko: <code>spvkab</code><br>
        • Operator: <code>operator</code><br>
        • Pegawai: <code>198501012010011001</code>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh; display: flex; justify-content: center; align-items: center; background-color: #f3f4f6; width: 100vw; position: absolute; top: 0; left: 0; z-index: 50; 
}
.login-card { background: white; width: 100%; max-width: 400px; padding: 40px 30px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); border-top: 5px solid #0277BD; }
.login-header { text-align: center; margin-bottom: 20px; }
.login-header h2 { margin: 0; color: #111827; font-size: 24px; font-weight: 800; }
.login-header p { margin: 5px 0 0 0; color: #6b7280; font-size: 14px; }
.login-form { display: flex; flex-direction: column; gap: 15px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 13px; font-weight: 700; color: #374151; }
.form-group input { padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; background-color: #f9fafb; }
.form-group input:focus { border-color: #0277BD; background-color: #ffffff; box-shadow: 0 0 0 3px rgba(2, 119, 189, 0.15); }
.btn-primary { background-color: #0277BD; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 15px; }
.btn-primary:hover:not(:disabled) { background-color: #015f96; }
.btn-block { width: 100%; margin-top: 10px; }
</style>