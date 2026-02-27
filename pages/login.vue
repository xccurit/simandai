<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCookie } from '#app'
import { usePegawaiStore } from '~/stores/usePegawaiStore'

definePageMeta({ layout: false })

const router = useRouter()
const store = usePegawaiStore() // Inisialisasi store
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
// =========================================================
// DATABASE USER DUMMY (Sesuai Arahan Kepala Umum)
// Password Semuanya: 12345
// Akan diganti dengan Fetch API saat backend siap
// =========================================================
const dataUser = [
  // --- TINGKAT PROVINSI ---
  { nip: 'admin', pass: '12345', nama: 'Bapak Kabag Umum', role: 'Admin', unit_kerja: 'BPS Provinsi Kalimantan Tengah' },
  { nip: 'spvprov', pass: '12345', nama: 'Ibu SDM Prov', role: 'Supervisor Prov', unit_kerja: 'BPS Provinsi Kalimantan Tengah' },

  // --- 1. KOTA PALANGKA RAYA ---
  { nip: 'spv_palangkaraya', pass: '12345', nama: 'Ketua Tim Palangka Raya', role: 'Supervisor Kabko', unit_kerja: 'BPS Kota Palangka Raya' },
  { nip: 'op_palangkaraya', pass: '12345', nama: 'Operator Palangka Raya', role: 'Operator', unit_kerja: 'BPS Kota Palangka Raya' },

  // --- 2. KAB. KAPUAS ---
  { nip: 'spv_kapuas', pass: '12345', nama: 'Ketua Tim Kapuas', role: 'Supervisor Kabko', unit_kerja: 'BPS Kabupaten Kapuas' },
  { nip: 'op_kapuas', pass: '12345', nama: 'Operator Kapuas', role: 'Operator', unit_kerja: 'BPS Kabupaten Kapuas' },

  // --- 3. KAB. KATINGAN ---
  { nip: 'spv_katingan', pass: '12345', nama: 'Ketua Tim Katingan', role: 'Supervisor Kabko', unit_kerja: 'BPS Kabupaten Katingan' },
  { nip: 'op_katingan', pass: '12345', nama: 'Operator Katingan', role: 'Operator', unit_kerja: 'BPS Kabupaten Katingan' },

  // --- 4. KAB. KOTAWARINGIN TIMUR ---
  { nip: 'spv_kotim', pass: '12345', nama: 'Ketua Tim Kotim', role: 'Supervisor Kabko', unit_kerja: 'BPS Kabupaten Kotawaringin Timur' },
  { nip: 'op_kotim', pass: '12345', nama: 'Operator Kotim', role: 'Operator', unit_kerja: 'BPS Kabupaten Kotawaringin Timur' },

  // --- 5. KAB. KOTAWARINGIN BARAT ---
  { nip: 'spv_kobar', pass: '12345', nama: 'Ketua Tim Kobar', role: 'Supervisor Kabko', unit_kerja: 'BPS Kabupaten Kotawaringin Barat' },
  { nip: 'op_kobar', pass: '12345', nama: 'Operator Kobar', role: 'Operator', unit_kerja: 'BPS Kabupaten Kotawaringin Barat' },

  // --- 6. KAB. BARITO SELATAN ---
  { nip: 'spv_barsel', pass: '12345', nama: 'Ketua Tim Barsel', role: 'Supervisor Kabko', unit_kerja: 'BPS Kabupaten Barito Selatan' },
  { nip: 'op_barsel', pass: '12345', nama: 'Operator Barsel', role: 'Operator', unit_kerja: 'BPS Kabupaten Barito Selatan' },

  // --- 7. KAB. BARITO UTARA ---
  { nip: 'spv_barut', pass: '12345', nama: 'Ketua Tim Barut', role: 'Supervisor Kabko', unit_kerja: 'BPS Kabupaten Barito Utara' },
  { nip: 'op_barut', pass: '12345', nama: 'Operator Barut', role: 'Operator', unit_kerja: 'BPS Kabupaten Barito Utara' },

  // --- 8. KAB. BARITO TIMUR ---
  { nip: 'spv_bartim', pass: '12345', nama: 'Ketua Tim Bartim', role: 'Supervisor Kabko', unit_kerja: 'BPS Kabupaten Barito Timur' },
  { nip: 'op_bartim', pass: '12345', nama: 'Operator Bartim', role: 'Operator', unit_kerja: 'BPS Kabupaten Barito Timur' },

  // --- 9. KAB. GUNUNG MAS ---
  { nip: 'spv_gumas', pass: '12345', nama: 'Ketua Tim Gumas', role: 'Supervisor Kabko', unit_kerja: 'BPS Kabupaten Gunung Mas' },
  { nip: 'op_gumas', pass: '12345', nama: 'Operator Gumas', role: 'Operator', unit_kerja: 'BPS Kabupaten Gunung Mas' },

  // --- 10. KAB. PULANG PISAU ---
  { nip: 'spv_pulpis', pass: '12345', nama: 'Ketua Tim Pulpis', role: 'Supervisor Kabko', unit_kerja: 'BPS Kabupaten Pulang Pisau' },
  { nip: 'op_pulpis', pass: '12345', nama: 'Operator Pulpis', role: 'Operator', unit_kerja: 'BPS Kabupaten Pulang Pisau' },

  // --- 11. KAB. SERUYAN ---
  { nip: 'spv_seruyan', pass: '12345', nama: 'Ketua Tim Seruyan', role: 'Supervisor Kabko', unit_kerja: 'BPS Kabupaten Seruyan' },
  { nip: 'op_seruyan', pass: '12345', nama: 'Operator Seruyan', role: 'Operator', unit_kerja: 'BPS Kabupaten Seruyan' },

  // --- 12. KAB. SUKAMARA ---
  { nip: 'spv_sukamara', pass: '12345', nama: 'Ketua Tim Sukamara', role: 'Supervisor Kabko', unit_kerja: 'BPS Kabupaten Sukamara' },
  { nip: 'op_sukamara', pass: '12345', nama: 'Operator Sukamara', role: 'Operator', unit_kerja: 'BPS Kabupaten Sukamara' },

  // --- 13. KAB. LAMANDAU ---
  { nip: 'spv_lamandau', pass: '12345', nama: 'Ketua Tim Lamandau', role: 'Supervisor Kabko', unit_kerja: 'BPS Kabupaten Lamandau' },
  { nip: 'op_lamandau', pass: '12345', nama: 'Operator Lamandau', role: 'Operator', unit_kerja: 'BPS Kabupaten Lamandau' },

  // --- 14. KAB. MURUNG RAYA ---
  { nip: 'spv_mura', pass: '12345', nama: 'Ketua Tim Mura', role: 'Supervisor Kabko', unit_kerja: 'BPS Kabupaten Murung Raya' },
  { nip: 'op_mura', pass: '12345', nama: 'Operator Mura', role: 'Operator', unit_kerja: 'BPS Kabupaten Murung Raya' },
]

const handleLogin = () => {
  errorMessage.value = ''
  
  if (!nip.value || !password.value) {
    errorMessage.value = "NIP dan Password wajib diisi!"
    return
  }

  // VALIDASI PANJANG NIP (Khusus jika yang diinput adalah angka/pegawai)
  const isNumeric = /^\d+$/.test(nip.value)
  if (isNumeric && (nip.value.length < 9 || nip.value.length > 18)) {
     errorMessage.value = "NIP Pegawai harus berjumlah antara 9 hingga 18 karakter!"
     return
  }
  
  isLoading.value = true
  
  setTimeout(() => {
    isLoading.value = false
    
    // 1. Cek apakah yang login adalah Petugas (Admin/Spv/Operator)
    let userValid = dataUser.find(u => u.nip === nip.value && u.pass === password.value)
    
    // 2. Jika bukan Petugas, cari di Database Pegawai Pinia (Bisa NIP Lama atau NIP Baru)
    if (!userValid) {
       const peg = store.pegawaiList.find(p => p.nip_baru === nip.value || p.nip_lama === nip.value || p.nip === nip.value)
       
       // Asumsi password default semua pegawai adalah 12345
       if (peg && password.value === '12345') {
          userValid = {
            nama: peg.nama_lengkap || peg.nama,
            role: 'Pegawai',
            unit_kerja: peg.unit_kerja,
            nip: peg.nip_baru || peg.nip
          }
       }
    }
    
    if (userValid) {
      userSesi.value = {
        nama: userValid.nama,
        role: userValid.role,
        unit_kerja: userValid.unit_kerja,
        nip: userValid.nip
      }
      isAuth.value = 'true'
      router.push('/')
    } else {
      errorMessage.value = "NIP atau Password salah / Pegawai tidak ditemukan!"
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
        <h2>SIMANDAI</h2>
        <!-- <p>Sistem Manajemen Data Pegawai</p>
        <p>Badan Pusat Statistik</p>
        <p>Provinsi Kalimantan Tengah</p> -->
      </div>

      <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm text-center font-bold">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>NIP / Username</label>
          <input v-model="nip" type="text" required minlength="5" maxlength="18" placeholder="Contoh: admin / spvkab / 199999999999999999"></div>
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
        • Spv Kabko: <code>spv_kapuas</code>, <code>spv_kotim</code>, <code>spv_katingan</code>, dll.<br>
        • Operator: <code>op_kapuas</code>, <code>op_kotim</code>, <code>op_katingan</code>, dll.<br>
        • Pegawai: Ketik NIP pegawai yang bersangkutan.
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