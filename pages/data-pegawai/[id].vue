<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePegawaiStore } from '~/stores/usePegawaiStore'

const store = usePegawaiStore()
const route = useRoute()
const router = useRouter()

const pegawaiId = Number(route.params.id)

onMounted(() => {
  store.loadFromStorage()
  if (!pegawai.value) {
    router.replace('/data-pegawai')
  }
})

const pegawai = computed(() => store.pegawaiList.find((p) => p.id === pegawaiId))
const activeTab = ref<'profil' | 'riwayat-ak'>('profil')

const formatTanggal = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

const riwayatAKPegawai = computed(() =>
  store.riwayatList
    .filter((r) => r.pegawai_id === pegawaiId)
    .sort((a, b) => b.tahun - a.tahun || b.bulan - a.bulan)
)
</script>

<template>
  <div v-if="pegawai" class="max-w-7xl mx-auto space-y-8 pb-12 p-6">
    <div class="bg-white rounded-3xl border shadow-sm p-8 flex flex-col md:flex-row justify-between items-center gap-6">
      <div class="flex items-center gap-6 text-center md:text-left">
        <div class="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg">
          {{ pegawai.nama_lengkap.charAt(0) }}
        </div>
        <div>
          <h1 class="text-3xl font-black text-gray-800">{{ pegawai.nama_lengkap }}</h1>
          <p class="text-gray-500 font-mono mt-1 tracking-tighter">NIP: {{ pegawai.nip_baru }}</p>
          <div class="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
            <span :class="pegawai.status_kepegawaian === 'Aktif' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'" class="px-4 py-1 rounded-full text-[10px] font-black uppercase border">
              {{ pegawai.status_kepegawaian }}
            </span>
            <span class="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-1 rounded-full text-[10px] font-black uppercase">
              {{ pegawai.jenis_jabatan }}
            </span>
          </div>
        </div>
      </div>
      <button @click="router.back()" class="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl hover:bg-gray-200 font-bold transition"> 
        ← Kembali 
      </button>
    </div>

    <div class="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
      <button @click="activeTab='profil'" :class="activeTab==='profil' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'" class="px-8 py-3 font-bold rounded-xl transition text-sm">Profil Lengkap</button>
      <button @click="activeTab='riwayat-ak'" :class="activeTab==='riwayat-ak' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'" class="px-8 py-3 font-bold rounded-xl transition text-sm">Riwayat Angka Kredit</button>
    </div>

    <div v-if="activeTab==='profil'" class="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
      <div class="bg-white p-8 rounded-3xl border shadow-sm">
        <h3 class="text-sm font-black text-blue-600 mb-6 uppercase tracking-widest border-b pb-2">📂 Data Identitas</h3>
        <dl class="space-y-4">
          <div class="flex justify-between items-center border-b border-gray-50 pb-2">
            <dt class="text-gray-400 text-xs font-bold uppercase">Tempat, Tgl Lahir</dt>
            <dd class="font-bold text-gray-800 text-sm">{{ pegawai.tempat_lahir }}, {{ formatTanggal(pegawai.tanggal_lahir) }}</dd>
          </div>
          <div class="flex justify-between items-center border-b border-gray-50 pb-2">
            <dt class="text-gray-400 text-xs font-bold uppercase">Jenis Kelamin</dt>
            <dd class="font-bold text-gray-800 text-sm">{{ pegawai.jenis_kelamin }}</dd>
          </div>
          <div class="flex justify-between items-center border-b border-gray-50 pb-2">
            <dt class="text-gray-400 text-xs font-bold uppercase">No. Karpeg</dt>
            <dd class="font-bold text-gray-800 text-sm font-mono">{{ pegawai.karpeg || '-' }}</dd>
          </div>
          <div class="flex justify-between items-center border-b border-gray-50 pb-2">
            <dt class="text-gray-400 text-xs font-bold uppercase">NIP Lama</dt>
            <dd class="font-bold text-gray-800 text-sm font-mono">{{ pegawai.nip_lama || '-' }}</dd>
          </div>
        </dl>
      </div>

      <div class="bg-white p-8 rounded-3xl border shadow-sm">
        <h3 class="text-sm font-black text-blue-600 mb-6 uppercase tracking-widest border-b pb-2">🎖️ Kepangkatan & Jabatan</h3>
        <dl class="space-y-4">
          <div class="flex justify-between items-center border-b border-gray-50 pb-2">
            <dt class="text-gray-400 text-xs font-bold uppercase">Pangkat/Golru</dt>
            <dd class="font-bold text-gray-800 text-sm">{{ pegawai.pangkat }} ({{ pegawai.golru }})</dd>
          </div>
          <div class="flex justify-between items-center border-b border-gray-50 pb-2">
            <dt class="text-gray-400 text-xs font-bold uppercase">TMT Pangkat</dt>
            <dd class="font-bold text-gray-800 text-sm">{{ formatTanggal(pegawai.tmt_pangkat) }}</dd>
          </div>
          <div class="flex justify-between items-center border-b border-gray-50 pb-2">
            <dt class="text-gray-400 text-xs font-bold uppercase">Jabatan</dt>
            <dd class="font-bold text-gray-800 text-sm">{{ pegawai.jabatan }}</dd>
          </div>
          <div class="flex justify-between items-center border-b border-gray-50 pb-2">
            <dt class="text-gray-400 text-xs font-bold uppercase">Jenjang</dt>
            <dd class="font-bold text-gray-800 text-sm">{{ pegawai.jenjang_jabatan }}</dd>
          </div>
        </dl>
      </div>

      <div class="bg-white p-8 rounded-3xl border shadow-sm md:col-span-2 flex flex-col md:flex-row justify-between items-center gap-8">
        <div class="space-y-4 w-full md:w-1/2">
          <h3 class="text-sm font-black text-blue-600 uppercase tracking-widest border-b pb-2">🏢 Penempatan</h3>
          <div>
            <p class="text-[10px] text-gray-400 font-bold uppercase">Unit Kerja</p>
            <p class="font-black text-xl text-gray-800 uppercase">{{ pegawai.unit_kerja }}</p>
          </div>
          <div>
            <p class="text-[10px] text-gray-400 font-bold uppercase">Instansi</p>
            <p class="font-bold text-gray-600">{{ pegawai.instansi }}</p>
          </div>
        </div>
        <div class="bg-blue-600 w-full md:w-auto p-8 rounded-2xl text-center text-white shadow-xl shadow-blue-100 min-w-[240px]">
          <p class="text-xs font-bold uppercase opacity-80 mb-2">Total AK Kumulatif</p>
          <p class="text-5xl font-black">{{ (pegawai.total_ak_kumulatif || 0).toFixed(3) }}</p>
        </div>
      </div>
    </div>

    <div v-if="activeTab==='riwayat-ak'" class="bg-white border rounded-3xl overflow-hidden shadow-sm animate-fade-in">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gray-50 text-[10px] font-black uppercase text-gray-500">
            <tr>
              <th class="p-5">Periode Penilaian</th>
              <th class="p-5">Jabatan Saat Evaluasi</th>
              <th class="p-5">Predikat</th>
              <th class="p-5 text-right">AK Diperoleh</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="r in riwayatAKPegawai" :key="r.id" class="hover:bg-gray-50 transition">
              <td class="p-5">
                <p class="font-black text-gray-800">Tahun {{ r.tahun }}</p>
                <p class="text-xs text-gray-400">Durasi: {{ r.bulan }} Bulan</p>
              </td>
              <td class="p-5 text-sm font-medium text-gray-600">{{ r.jabatan }}</td>
              <td class="p-5">
                 <span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                   {{ r.predikat }}
                 </span>
              </td>
              <td class="p-5 text-right">
                <span class="text-lg font-black text-blue-600">{{ parseFloat(r.ak_didapat || 0).toFixed(3) }}</span>
              </td>
            </tr>
            <tr v-if="riwayatAKPegawai.length === 0">
              <td colspan="4" class="p-20 text-center">
                <p class="text-gray-300 text-5xl mb-4">📄</p>
                <p class="text-gray-400 font-bold">Belum ada riwayat angka kredit untuk pegawai ini</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>