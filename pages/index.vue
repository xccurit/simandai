<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePegawaiStore } from '~/stores/usePegawaiStore'
import { useCookie } from '#app'

const store = usePegawaiStore()
const userSesi = useCookie('userProfile', { default: () => ({ nama: 'Guest', role: 'Admin', unit_kerja: '', nip: '' }) })

onMounted(() => {
  store.loadFromStorage()
})

// ================= DATA MASTER UNTUK CEK KELULUSAN =================
const kamusPangkat = [
  { golru: 'II/c', ak_kp: 20 }, { golru: 'II/d', ak_kp: 20 },
  { golru: 'III/a', ak_kp: 50 }, { golru: 'III/b', ak_kp: 100 },
  { golru: 'III/c', ak_kp: 100 }, { golru: 'III/d', ak_kp: 200 },
  { golru: 'IV/a', ak_kp: 150 }, { golru: 'IV/b', ak_kp: 300 },
  { golru: 'IV/c', ak_kp: 450 }, { golru: 'IV/d', ak_kp: 200 }, { golru: 'IV/e', ak_kp: null },
]

const kamusJabatan = [
  { keyword: 'utama', target_jenjang: null }, { keyword: 'madya', target_jenjang: 450 },
  { keyword: 'muda', target_jenjang: 200 }, { keyword: 'pertama', target_jenjang: 100 },
  { keyword: 'penyelia', target_jenjang: null }, { keyword: 'mahir', target_jenjang: 100 }, { keyword: 'terampil', target_jenjang: 60 },
]

// ================= LOGIKA FILTER & KELULUSAN =================
const normalizeUnitKerja = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/bps|kabupaten|kab\.|kota|provinsi|prov\./gi, '').trim();
}

// Data pegawai khusus yang boleh dilihat oleh Sesi yang login
const roleFilteredPegawai = computed(() => {
  const list = store.pegawaiList;
  const role = userSesi.value.role;
  
  if (role === 'Pegawai') {
    return list.filter(p => p.nip_baru === userSesi.value.nip || p.nip_lama === userSesi.value.nip);
  } else if (role === 'Supervisor Kabko' || role === 'Operator') {
    const uKerjaSesi = normalizeUnitKerja(userSesi.value.unit_kerja);
    return list.filter(p => {
       const uKerjaPegawai = normalizeUnitKerja(p.unit_kerja);
       return uKerjaPegawai.includes(uKerjaSesi) || uKerjaSesi.includes(uKerjaPegawai);
    });
  }
  return list; // Admin & Spv Prov melihat semua
})

// Cek apakah seorang pegawai sudah memenuhi syarat (Pangkat / Jenjang)
const checkLulus = (peg) => {
  const totalAK = parseFloat(peg.total_ak_kumulatif) || 0
  if (totalAK <= 0) return false;

  const infoPangkat = kamusPangkat.find(p => p.golru === peg.golru)
  const targetPangkat = infoPangkat && infoPangkat.ak_kp ? infoPangkat.ak_kp : 99999

  const jabatanLengkap = `${peg.jabatan || ''} ${peg.jenjang_jabatan || ''}`.toLowerCase()
  const infoJabatan = kamusJabatan.find(j => jabatanLengkap.includes(j.keyword))
  const targetJenjang = infoJabatan && infoJabatan.target_jenjang ? infoJabatan.target_jenjang : 99999

  return (totalAK >= targetPangkat || totalAK >= targetJenjang)
}

// ================= LOGIKA GRAFIK & ANALITIK =================
// Menghitung statistik global
const statGlobal = computed(() => {
  let total = roleFilteredPegawai.value.length;
  let lulus = 0;
  roleFilteredPegawai.value.forEach(p => { if (checkLulus(p)) lulus++; })
  return { total, lulus, persentase: total > 0 ? Math.round((lulus/total)*100) : 0 }
})

// Mengelompokkan data per Kabupaten/Kota untuk Bar Chart
const rekapKabupaten = computed(() => {
  const map = {}
  roleFilteredPegawai.value.forEach(peg => {
    const rawUnit = peg.unit_kerja || 'Tidak Diketahui'
    const cleanUnit = normalizeUnitKerja(rawUnit).toUpperCase()
    const isLulus = checkLulus(peg)

    if (!map[cleanUnit]) {
      map[cleanUnit] = { name: rawUnit, id: cleanUnit, total: 0, lulus: 0 }
    }
    map[cleanUnit].total += 1
    if (isLulus) map[cleanUnit].lulus += 1
  })

  // Ubah ke array dan urutkan berdasarkan yang total pegawainya terbanyak
  return Object.values(map).sort((a, b) => b.total - a.total).map(item => ({
    ...item,
    persentase: item.total > 0 ? Math.round((item.lulus / item.total) * 100) : 0
  }))
})

// ================= LOGIKA DRILL-DOWN (KLIK GRAFIK -> TOP 5) =================
const selectedKab = ref(null) // Menyimpan ID kabupaten yang sedang diklik

// Menangkap wilayah default jika Operator (agar grafiknya langsung terpilih)
onMounted(() => {
  if (['Operator', 'Supervisor Kabko'].includes(userSesi.value.role)) {
    selectedKab.value = normalizeUnitKerja(userSesi.value.unit_kerja).toUpperCase()
  }
})

const selectKabupaten = (id) => {
  if (selectedKab.value === id) selectedKab.value = null // Toggle (Buka/Tutup)
  else selectedKab.value = id
}

// Mengambil 5 pegawai terbaik berdasarkan Kab/Kota yang dipilih
const top5Pegawai = computed(() => {
  if (!selectedKab.value) return []
  
  // Ambil pegawai di wilayah tersebut
  let filtered = roleFilteredPegawai.value.filter(p => normalizeUnitKerja(p.unit_kerja).toUpperCase() === selectedKab.value)
  
  // Urutkan berdasarkan total AK tertinggi ke terendah
  filtered.sort((a, b) => (parseFloat(b.total_ak_kumulatif) || 0) - (parseFloat(a.total_ak_kumulatif) || 0))
  
  // Ambil 5 teratas
  return filtered.slice(0, 5)
})

// Format hari ini
const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-8 pb-10">
    
    <div class="bg-gradient-to-r from-bps-blue to-blue-500 rounded-3xl p-8 text-white shadow-lg flex justify-between items-center animate-fade-in">
      <div>
        <p class="text-blue-100 font-medium mb-1">{{ today }}</p>
        <h1 class="text-3xl font-bold">Selamat Datang, {{ userSesi.nama === 'Admin BPS' ? 'Administrator' : userSesi.nama }} 👋</h1>
        <p class="text-blue-100 mt-2 text-sm max-w-xl">
          Sistem Manajemen Data Pegawai (SIMANDAI) Badan Pusat Statistik Provinsi Kalimantan Tengah.
        </p>
      </div>
      <div class="hidden md:block bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/30 text-center">
        <p class="text-xs uppercase tracking-widest font-bold opacity-80">Hak Akses</p>
        <p class="text-lg font-black">{{ userSesi.role }}</p>
      </div>
    </div>

    <div v-if="userSesi.role === 'Pegawai'" class="bg-white p-8 rounded-3xl border shadow-sm text-center py-20">
      <div class="text-6xl mb-4">📊</div>
      <h2 class="text-2xl font-bold text-gray-800">Ruang Pegawai</h2>
      <p class="text-gray-500 mt-2 mb-6">Silakan gunakan menu di samping untuk melihat rincian Angka Kredit dan Profil Anda.</p>
      <NuxtLink to="/data-pegawai" class="bg-bps-blue text-white px-8 py-3 rounded-xl font-bold shadow hover:bg-bps-dark transition">
        Lihat Profil Saya
      </NuxtLink>
    </div>

    <div v-else class="space-y-8 animate-fade-in">
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-5 border-l-4 border-l-blue-500">
          <div class="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-2xl">
            <Icon name="heroicons:users" />
          </div>
          <div>
            <p class="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Pegawai</p>
            <p class="text-3xl font-black text-gray-800">{{ statGlobal.total }}</p>
          </div>
        </div>
        <div class="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-5 border-l-4 border-l-green-500">
          <div class="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-green-600 text-2xl">
            <Icon name="heroicons:check-badge" />
          </div>
          <div>
            <p class="text-gray-500 text-xs font-bold uppercase tracking-wider">Memenuhi Syarat (Lulus)</p>
            <p class="text-3xl font-black text-gray-800">{{ statGlobal.lulus }}</p>
          </div>
        </div>
        <div class="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-5 border-l-4 border-l-purple-500">
          <div class="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 text-2xl">
            <Icon name="heroicons:chart-pie" />
          </div>
          <div>
            <p class="text-gray-500 text-xs font-bold uppercase tracking-wider">Rasio Kelulusan</p>
            <p class="text-3xl font-black text-gray-800">{{ statGlobal.persentase }}%</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <div class="bg-white p-6 rounded-3xl border shadow-sm lg:col-span-2">
          <h3 class="font-bold text-lg text-gray-800 mb-1">Tingkat Kelulusan Angka Kredit</h3>
          <p class="text-xs text-gray-500 mb-6">Pilih (klik) salah satu kabupaten/kota untuk melihat 5 pegawai terbaik.</p>

          <div class="space-y-5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <div 
              v-for="item in rekapKabupaten" 
              :key="item.id" 
              @click="selectKabupaten(item.id)"
              class="cursor-pointer group p-3 rounded-xl transition-all border border-transparent"
              :class="selectedKab === item.id ? 'bg-blue-50/50 border-blue-200' : 'hover:bg-gray-50'"
            >
              <div class="flex justify-between items-end mb-2">
                <span class="font-bold text-sm text-gray-700 group-hover:text-bps-blue flex items-center gap-2">
                  {{ item.name }} 
                  <Icon v-if="selectedKab === item.id" name="heroicons:cursor-arrow-rays" class="text-bps-blue w-4 h-4" />
                </span>
                <span class="text-xs font-bold" :class="item.persentase >= 50 ? 'text-green-600' : 'text-orange-500'">
                  {{ item.lulus }} dari {{ item.total }} Lulus ({{ item.persentase }}%)
                </span>
              </div>
              
              <div class="w-full bg-gray-100 rounded-full h-3.5 relative overflow-hidden">
                <div 
                  class="h-3.5 rounded-full transition-all duration-1000 ease-out"
                  :class="item.persentase >= 50 ? 'bg-green-500' : 'bg-orange-400'"
                  :style="{ width: item.persentase + '%' }"
                ></div>
              </div>
            </div>
            
            <div v-if="rekapKabupaten.length === 0" class="text-center text-gray-400 py-10 text-sm">
              Tidak ada data pegawai untuk dianalisis.
            </div>
          </div>
        </div>

        <div class="bg-gray-800 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden min-h-[500px]">
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl"></div>
          
          <template v-if="selectedKab">
            <div class="flex justify-between items-start mb-6 relative z-10">
              <div>
                <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Top 5 Skor AK</p>
                <h3 class="font-black text-lg text-white leading-tight capitalize">{{ selectedKab }}</h3>
              </div>
              <button @click="selectedKab = null" class="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-1.5" title="Tutup">
                <Icon name="heroicons:x-mark" class="w-4 h-4" />
              </button>
            </div>

            <div class="space-y-3 relative z-10">
              <div 
                v-for="(peg, idx) in top5Pegawai" 
                :key="peg.id"
                class="bg-gray-700/50 p-3 rounded-xl border border-gray-600 flex items-center justify-between hover:bg-gray-700 transition"
              >
                <div class="flex items-center gap-3 overflow-hidden">
                  <div class="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-black text-xs border border-gray-500 flex-shrink-0" :class="idx === 0 ? 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10' : 'text-gray-300'">
                    #{{ idx + 1 }}
                  </div>
                  <div class="truncate">
                    <p class="font-bold text-sm truncate">{{ peg.nama_lengkap || peg.nama }}</p>
                    <p class="text-[10px] text-gray-400 truncate">{{ peg.jabatan }} {{ peg.jenjang_jabatan }}</p>
                  </div>
                </div>
                <div class="text-right flex-shrink-0 ml-2">
                  <p class="font-black text-blue-400">{{ parseFloat(peg.total_ak_kumulatif || 0).toFixed(3) }}</p>
                  <p class="text-[9px] uppercase font-bold" :class="checkLulus(peg) ? 'text-green-400' : 'text-orange-400'">
                    {{ checkLulus(peg) ? 'Lulus' : 'Belum' }}
                  </p>
                </div>
              </div>

              <div v-if="top5Pegawai.length === 0" class="text-center text-gray-500 py-20 text-xs">
                Tidak ada pegawai di wilayah ini.
              </div>
            </div>
          </template>

          <template v-else>
            <div class="flex flex-col items-center justify-center h-full text-center py-32 opacity-60">
              <Icon name="heroicons:chart-bar-square" class="w-16 h-16 text-gray-500 mb-4" />
              <p class="font-bold text-gray-300">Pilih Wilayah</p>
              <p class="text-xs text-gray-500 mt-1">Klik salah satu batang grafik di sebelah kiri untuk melihat daftar 5 pegawai dengan capaian terbaik.</p>
            </div>
          </template>

        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Mempercantik Scrollbar di Daftar Grafik */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9; 
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1; 
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8; 
}
</style>