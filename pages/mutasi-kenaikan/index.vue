<script setup>
import { ref, computed } from 'vue'
import { usePegawaiStore } from '~/stores/usePegawaiStore'

// =====================================================================
// 1. MASTER DATA (KAMUS REFERENSI)
// =====================================================================

// Syarat AK untuk Naik ke Pangkat BERIKUTNYA (AK Kenaikan Pangkat)
const kamusPangkat = [
  { golru: 'II/c', nama: 'Pengatur', ak_kp: 20 },
  { golru: 'II/d', nama: 'Pengatur Tk.I', ak_kp: 20 },
  { golru: 'III/a', nama: 'Penata Muda', ak_kp: 50 },
  { golru: 'III/b', nama: 'Penata Muda Tk.I', ak_kp: 50 },
  { golru: 'III/c', nama: 'Penata', ak_kp: 100 },
  { golru: 'III/d', nama: 'Penata Tk.I', ak_kp: 100 },
  { golru: 'IV/a', nama: 'Pembina', ak_kp: 150 },
  { golru: 'IV/b', nama: 'Pembina Tk.I', ak_kp: 150 },
  { golru: 'IV/c', nama: 'Pembina Utama Muda', ak_kp: 150 },
  { golru: 'IV/d', nama: 'Pembina Utama Madya', ak_kp: 200 },
]

// Syarat AK untuk Naik Jenjang Jabatan (AK Kenaikan Jenjang)
// Kita tambahkan 'keyword' agar bisa mendeteksi dari string seperti "Statistisi Muda"
const kamusJabatan = [
  { keyword: 'pertama', nama: 'Ahli Pertama', target_jenjang: 100, next: 'Ahli Muda' },
  { keyword: 'muda', nama: 'Ahli Muda', target_jenjang: 200, next: 'Ahli Madya' },
  { keyword: 'madya', nama: 'Ahli Madya', target_jenjang: 450, next: 'Ahli Utama' },
  { keyword: 'utama', nama: 'Ahli Utama', target_jenjang: null, next: null },
  { keyword: 'terampil', nama: 'Terampil', target_jenjang: 40, next: 'Mahir' },
  { keyword: 'mahir', nama: 'Mahir', target_jenjang: 100, next: 'Penyelia' },
  { keyword: 'penyelia', nama: 'Penyelia', target_jenjang: null, next: null },
]

// =====================================================================
// 2. AMBIL DATA PEGAWAI DARI PINIA
// =====================================================================
const store = usePegawaiStore()
const pegawaiList = computed(() => store.pegawaiList)

const activeTab = ref('kp') // 'kp' = Kenaikan Pangkat, 'kj' = Kenaikan Jenjang

// =====================================================================
// 3. LOGIKA SISTEM REKOMENDASI (THE BRAIN)
// =====================================================================

// Analisis Kenaikan Pangkat
const analisisKP = computed(() => {
  return pegawaiList.value.map(peg => {
    // Ambil kode golru (misal: "Penata (III/c)" -> "III/c")
    const match = peg.pangkat.match(/\((.*?)\)/)
    const golruSaatIni = match ? match[1] : ''
    
    const syarat = kamusPangkat.find(p => p.golru === golruSaatIni)
    const target = syarat ? syarat.ak_kp : 9999
    
    const kekurangan = target - peg.total_ak_kumulatif
    const isEligible = kekurangan <= 0

    return {
      ...peg,
      target_poin: target,
      kekurangan: kekurangan > 0 ? kekurangan.toFixed(3) : 0,
      status: isEligible ? 'Memenuhi Syarat' : 'Belum Memenuhi',
      progress: Math.min((peg.total_ak_kumulatif / target) * 100, 100).toFixed(1)
    }
  })
})

// Analisis Kenaikan Jenjang
const analisisKJ = computed(() => {
  return pegawaiList.value.map(peg => {
    // Deteksi jenjang berdasarkan keyword dari nama jabatannya
    const jabatanLower = peg.jabatan.toLowerCase()
    let jenjangSaatIni = kamusJabatan.find(j => jabatanLower.includes(j.keyword))
    
    if (!jenjangSaatIni) return { ...peg, status: 'Tidak Teridentifikasi' }

    const target = jenjangSaatIni.target_jenjang
    
    // Jika null berarti sudah puncak
    if (target === null) return { ...peg, next_jenjang: '-', target_poin: null, kekurangan: 0, status: 'Jabatan Puncak', progress: 100 }

    const kekurangan = target - peg.total_ak_kumulatif
    const isEligible = kekurangan <= 0

    return {
      ...peg,
      next_jenjang: jenjangSaatIni.next,
      target_poin: target,
      kekurangan: kekurangan > 0 ? kekurangan.toFixed(3) : 0,
      status: isEligible ? 'Siap Uji Kompetensi' : 'Belum Memenuhi',
      progress: Math.min((peg.total_ak_kumulatif / target) * 100, 100).toFixed(1)
    }
  })
})

// Hitung Statistik Dashboard Kecil
const stats = computed(() => {
  const siapKP = analisisKP.value.filter(p => p.status === 'Memenuhi Syarat').length
  const siapKJ = analisisKJ.value.filter(p => p.status === 'Siap Uji Kompetensi').length
  return { siapKP, siapKJ }
})

// Hapus kode lama, ganti dengan ini:
const updateStatusPegawai = () => {
  // 1. Panggil action dari Pinia untuk mengubah status
  store.updateStatusPegawai(selectedPegawai.value.id, formStatus.value.status)
  
  // 2. Tutup Modal
  showModalStatus.value = false
  
  // (Opsional) Reset form status
  formStatus.value.status = ''
}
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6 pb-10">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Identifikasi Usulan Kenaikan</h2>
        <p class="text-sm text-gray-500 mt-1">Sistem otomatis mendeteksi pegawai yang memenuhi syarat AK</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center shadow-sm">
        <div class="p-3 bg-green-100 rounded-full text-2xl mr-4">📈</div>
        <div>
          <p class="text-sm text-gray-600 font-semibold uppercase">Siap Kenaikan Pangkat</p>
          <p class="text-3xl font-bold text-green-700">{{ stats.siapKP }} <span class="text-sm text-gray-500 font-normal">Pegawai</span></p>
        </div>
      </div>
      <div class="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center shadow-sm">
        <div class="p-3 bg-blue-100 rounded-full text-2xl mr-4">🎓</div>
        <div>
          <p class="text-sm text-gray-600 font-semibold uppercase">Siap Uji Kompetensi (Jenjang)</p>
          <p class="text-3xl font-bold text-blue-700">{{ stats.siapKJ }} <span class="text-sm text-gray-500 font-normal">Pegawai</span></p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="flex border-b border-gray-200">
        <button 
          @click="activeTab = 'kp'"
          :class="['flex-1 py-4 text-sm font-bold text-center transition-colors', activeTab === 'kp' ? 'bg-white text-bps-blue border-b-2 border-bps-blue' : 'bg-gray-50 text-gray-500 hover:bg-gray-100']"
        >
          1. Kenaikan Pangkat (Reguler)
        </button>
        <button 
          @click="activeTab = 'kj'"
          :class="['flex-1 py-4 text-sm font-bold text-center transition-colors', activeTab === 'kj' ? 'bg-white text-bps-blue border-b-2 border-bps-blue' : 'bg-gray-50 text-gray-500 hover:bg-gray-100']"
        >
          2. Kenaikan Jenjang (Uji Kompetensi)
        </button>
      </div>

      <div v-if="activeTab === 'kp'" class="animate-fade-in">
        <div class="p-4 bg-yellow-50 border-b border-yellow-100 text-xs text-yellow-800 flex items-center gap-2">
          <span>💡</span>
          <span>Menampilkan perbandingan <strong>Total AK Saat Ini</strong> vs <strong>Target AK Kenaikan Pangkat</strong> berdasarkan Golongan Ruang.</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                <th class="px-6 py-4 font-semibold">Pegawai</th>
                <th class="px-6 py-4 font-semibold">Pangkat Saat Ini</th>
                <th class="px-6 py-4 font-semibold text-center">AK Kumulatif</th>
                <th class="px-6 py-4 font-semibold text-center">Target</th>
                <th class="px-6 py-4 font-semibold">Kekurangan</th>
                <th class="px-6 py-4 font-semibold text-center">Status Rekomendasi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm text-gray-700">
              <tr v-for="peg in analisisKP" :key="peg.id" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="font-bold text-gray-900">{{ peg.nama }}</div>
                  <div class="text-xs text-gray-500 mt-0.5">{{ peg.nip }} | {{ peg.unit_kerja }}</div>
                </td>
                <td class="px-6 py-4 text-gray-600">{{ peg.pangkat }}</td>
                <td class="px-6 py-4 text-center font-bold text-bps-blue">{{ peg.total_ak_kumulatif.toFixed(3) }}</td>
                <td class="px-6 py-4 text-center font-medium">{{ peg.target_poin }}</td>
                <td class="px-6 py-4">
                  <div v-if="peg.kekurangan > 0" class="text-red-600 font-semibold text-xs">
                    - {{ peg.kekurangan }} poin
                  </div>
                  <div v-else class="text-green-600 font-semibold text-xs flex items-center gap-1">
                    <span>✅</span> Terpenuhi
                  </div>
                  <div class="w-24 h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                    <div class="h-full bg-bps-blue rounded-full transition-all duration-500" :style="{ width: peg.progress + '%' }"></div>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <span :class="[
                    'px-3 py-1 rounded-full text-xs font-bold border inline-block w-36',
                    peg.status === 'Memenuhi Syarat' 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'bg-red-50 text-red-600 border-red-200'
                  ]">
                    {{ peg.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="activeTab === 'kj'" class="animate-fade-in">
        <div class="p-4 bg-blue-50 border-b border-blue-100 text-xs text-blue-800 flex items-center gap-2">
          <span>💡</span>
          <span>Menampilkan syarat akumulasi AK untuk mengikuti <strong>Uji Kompetensi</strong> ke jenjang jabatan setingkat lebih tinggi.</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                <th class="px-6 py-4 font-semibold">Pegawai</th>
                <th class="px-6 py-4 font-semibold">Jabatan Saat Ini</th>
                <th class="px-6 py-4 font-semibold text-center">Jenjang Berikutnya</th>
                <th class="px-6 py-4 font-semibold text-center">AK Kumulatif</th>
                <th class="px-6 py-4 font-semibold text-center">Syarat AK</th>
                <th class="px-6 py-4 font-semibold text-center">Status Ukom</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm text-gray-700">
              <tr v-for="peg in analisisKJ" :key="peg.id" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="font-bold text-gray-900">{{ peg.nama }}</div>
                  <div class="text-xs text-gray-500 mt-0.5">{{ peg.nip }} | {{ peg.unit_kerja }}</div>
                </td>
                <td class="px-6 py-4">
                  <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium border border-gray-200">
                    {{ peg.jabatan }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center text-xs font-semibold text-gray-500">
                  {{ peg.next_jenjang }}
                </td>
                <td class="px-6 py-4 text-center font-bold text-bps-blue">{{ peg.total_ak_kumulatif.toFixed(3) }}</td>
                <td class="px-6 py-4 text-center">
                  <div v-if="peg.target_poin">
                    <span class="font-medium text-gray-800">{{ peg.target_poin }}</span>
                    <div class="text-[10px] text-red-500 mt-0.5" v-if="peg.kekurangan > 0">
                      (Kurang {{ peg.kekurangan }})
                    </div>
                  </div>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span :class="[
                    'px-3 py-1 rounded-full text-xs font-bold border inline-block w-40',
                    peg.status === 'Siap Uji Kompetensi' 
                      ? 'bg-blue-100 text-blue-700 border-blue-200' 
                      : peg.status === 'Jabatan Puncak'
                        ? 'bg-purple-100 text-purple-700 border-purple-200'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                  ]">
                    {{ peg.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>