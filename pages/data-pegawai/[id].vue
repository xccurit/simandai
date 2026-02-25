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
    <div class="bg-white rounded-2xl border shadow-sm p-8 flex justify-between items-start">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">{{ pegawai.nama_lengkap }}</h1>
        <p class="text-gray-500 font-mono mt-1">NIP: {{ pegawai.nip_baru }} (Baru) / {{ pegawai.nip_lama || '-' }} (Lama)</p>
        <div class="mt-4 flex gap-2">
          <span :class="pegawai.status_kepegawaian === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'" class="px-4 py-1 rounded-full text-xs font-bold uppercase">
            {{ pegawai.status_kepegawaian }}
          </span>
          <span class="bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-xs font-bold uppercase">
            {{ pegawai.jenis_jabatan }}
          </span>
        </div>
      </div>
      <button @click="router.back()" class="text-gray-400 hover:text-gray-600"> Kembali </button>
    </div>

    <div class="flex border-b border-gray-200">
      <button @click="activeTab='profil'" :class="activeTab==='profil' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'" class="px-8 py-4 font-medium transition">Profil Lengkap</button>
      <button @click="activeTab='riwayat-ak'" :class="activeTab==='riwayat-ak' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'" class="px-8 py-4 font-medium transition">Riwayat Angka Kredit</button>
    </div>

    <div v-if="activeTab==='profil'" class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="bg-white p-6 rounded-2xl border shadow-sm">
        <h3 class="text-lg font-bold mb-4 border-b pb-2">Data Pribadi</h3>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between"><dt class="text-gray-500">Tempat, Tgl Lahir</dt><dd class="font-medium text-right">{{ pegawai.tempat_lahir }}, {{ formatTanggal(pegawai.tanggal_lahir) }}</dd></div>
          <div class="flex justify-between"><dt class="text-gray-500">Jenis Kelamin</dt><dd class="font-medium">{{ pegawai.jenis_kelamin }}</dd></div>
          <div class="flex justify-between"><dt class="text-gray-500">No. Karpeg</dt><dd class="font-medium">{{ pegawai.karpeg || '-' }}</dd></div>
        </dl>
      </div>

      <div class="bg-white p-6 rounded-2xl border shadow-sm">
        <h3 class="text-lg font-bold mb-4 border-b pb-2">Kepangkatan & Jabatan</h3>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between"><dt class="text-gray-500">Pangkat/Golru</dt><dd class="font-medium text-right">{{ pegawai.pangkat }} ({{ pegawai.golru }})</dd></div>
          <div class="flex justify-between"><dt class="text-gray-500">TMT Pangkat</dt><dd class="font-medium">{{ formatTanggal(pegawai.tmt_pangkat) }}</dd></div>
          <div class="flex justify-between"><dt class="text-gray-500">Jabatan</dt><dd class="font-medium text-right">{{ pegawai.jabatan }} ({{ pegawai.jenjang_jabatan }})</dd></div>
        </dl>
      </div>

      <div class="bg-white p-6 rounded-2xl border shadow-sm md:col-span-2">
        <h3 class="text-lg font-bold mb-4 border-b pb-2">Unit Kerja & Instansi</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-gray-500 uppercase">Unit Kerja</p>
            <p class="font-semibold text-lg">{{ pegawai.unit_kerja }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 uppercase">Instansi</p>
            <p class="font-semibold text-lg">{{ pegawai.instansi }}</p>
          </div>
        </div>
        <div class="mt-6 pt-6 border-t flex items-center justify-between">
          <span class="text-gray-600">Total Angka Kredit Kumulatif</span>
          <span class="text-3xl font-black text-blue-600">{{ pegawai.total_ak_kumulatif.toFixed(3) }}</span>
        </div>
      </div>
    </div>

    <div v-if="activeTab==='riwayat-ak'" class="bg-white border rounded-2xl overflow-hidden shadow-sm">
      <table class="w-full text-left">
        <thead class="bg-gray-50 text-sm">
          <tr>
            <th class="p-4">Tahun/Bulan</th>
            <th class="p-4">Angka Kredit</th>
            <th class="p-4">Jabatan Saat Itu</th>
            <th class="p-4">Predikat</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in riwayatAKPegawai" :key="r.id" class="border-t">
            <td class="p-4 font-medium">{{ r.tahun }} / Bln-{{ r.bulan }}</td>
            <td class="p-4 text-blue-600 font-bold">{{ r.ak_didapat }}</td>
            <td class="p-4 text-sm">{{ r.jabatan }}</td>
            <td class="p-4">
               <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{{ r.predikat }}</span>
            </td>
          </tr>
          <tr v-if="riwayatAKPegawai.length === 0">
            <td colspan="4" class="p-10 text-center text-gray-400">Belum ada riwayat angka kredit</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>