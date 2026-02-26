<script setup>
import { ref, computed } from 'vue'
import { usePegawaiStore } from '~/stores/usePegawaiStore'

const store = usePegawaiStore()
const userSesi = useCookie('userProfile', { default: () => ({ role: 'Admin', unit_kerja: '', nip: '' }) })
const activeTab = ref('kp') // 'kp', 'ukom', 'assess', 'jft'

const basePegawaiList = computed(() => {
  let list = store.pegawaiList
  if (userSesi.value.role === 'Pegawai') {
    list = list.filter(p => p.nip === userSesi.value.nip)
  } else if (userSesi.value.role === 'Supervisor Kabko' || userSesi.value.role === 'Operator') {
    list = list.filter(p => p.unit_kerja === userSesi.value.unit_kerja)
  }
  return list
})


// State untuk Jadwal (Tersimpan di Cookie agar tidak hilang saat di-refresh)
const jadwalUkom = useCookie('jadwalUkom', { default: () => '10 - 15 Maret 2026' })
const jadwalAssess = useCookie('jadwalAssess', { default: () => '20 - 22 April 2026' })
const isEditingJadwal = ref(false)

// Helper untuk menyambung nama jabatan (misal: Pranata Komputer + Ahli Muda)
const getBaseJabatan = (jabatanLengkap) => {
  if (jabatanLengkap.toLowerCase().includes('statistisi')) return 'Statistisi'
  if (jabatanLengkap.toLowerCase().includes('pranata komputer')) return 'Pranata Komputer'
  if (jabatanLengkap.toLowerCase().includes('analis pengelolaan keuangan')) return 'Analis Pengelolaan Keuangan APBN'
  return jabatanLengkap.split(' ')[0] // Fallback
}

// 1. LOGIKA OTAK: MENGANALISIS SIAPA YANG MEMENUHI SYARAT
const analisisData = computed(() => {
  return store.pegawaiList.map(peg => {
    const totalAK = parseFloat(peg.total_ak_kumulatif)

    // --- A. CEK KENAIKAN PANGKAT (KP) ---
    const match = peg.pangkat.match(/\((.*?)\)/)
    const golruSaatIni = match ? match[1] : ''
    const infoPangkat = store.kamusPangkat.find(p => p.golru === golruSaatIni)
    
    let statusKP = 'Belum'
    let nextPangkat = '-'
    let nextGolru = '-'
    if (infoPangkat && infoPangkat.ak_kp) {
       const sisa = infoPangkat.ak_kp - totalAK
       if (sisa <= 0) {
         statusKP = 'Memenuhi'
         nextPangkat = infoPangkat.next_nama || '-'
         nextGolru = infoPangkat.next_golru || '-'
       }
    }

    // --- B. CEK KENAIKAN JENJANG / UKOM ---
    const jabatanLower = peg.jabatan.toLowerCase()
    const infoJabatan = store.kamusJabatan.find(j => jabatanLower.includes(j.keyword))
    
    let statusKJ = 'Belum'
    let nextJenjangLengkap = '-'
    let isAssessment = false

    if (infoJabatan && infoJabatan.target_jenjang) {
       const sisa = infoJabatan.target_jenjang - totalAK
       if (sisa <= 0) {
         statusKJ = 'Memenuhi'
         // Gabungkan base jabatan dengan next level (ex: Statistisi + Ahli Muda)
         const baseJabatan = getBaseJabatan(peg.jabatan)
         nextJenjangLengkap = `${baseJabatan} ${infoJabatan.next}`
         
         // Jika naik ke Madya atau Utama, wajib ikut Assessment
         if (infoJabatan.next.includes('Madya') || infoJabatan.next.includes('Utama')) {
            isAssessment = true
         }
       }
    }

    return {
      ...peg,
      statusKP,
      nextPangkat,
      nextGolru,
      statusKJ,
      nextJenjangLengkap,
      isAssessment,
      totalAK
    }
  })
})

// 2. PEMILAHAN DATA SESUAI TAB
const listKP = computed(() => analisisData.value.filter(p => p.statusKP === 'Memenuhi'))
const listUkom = computed(() => analisisData.value.filter(p => p.statusKJ === 'Memenuhi'))
const listAssessment = computed(() => analisisData.value.filter(p => p.isAssessment === true))
const listJFT = computed(() => analisisData.value.filter(p => p.statusKJ === 'Memenuhi'))

// 3. EXPORT KE MS WORD (Murni HTML ke Docx)
const unduhWord = (elementId, filename) => {
  const content = document.getElementById(elementId).innerHTML
  const preHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Export</title>
    <style>
      body { font-family: 'Times New Roman', serif; font-size: 11pt; }
      table { border-collapse: collapse; width: 100%; margin-top: 15px; }
      td, th { border: 1px solid black; padding: 5px; text-align: center; vertical-align: middle; }
      .text-left { text-align: left; }
      .font-bold { font-weight: bold; }
    </style></head><body>
  `
  const postHtml = "</body></html>"
  const blob = new Blob(['\ufeff', preHtml + content + postHtml], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.doc`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 4. EXPORT KE MS EXCEL (Khusus KP)
const unduhExcel = (elementId, filename) => {
  const content = document.getElementById(elementId).innerHTML
  const preHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="UTF-8"><style>table{border-collapse:collapse;} td,th{border:1px solid black; padding:5px; text-align:center;}</style></head><body>
  `
  const postHtml = "</body></html>"
  const blob = new Blob([preHtml + content + postHtml], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.xls`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6 bg-gray-50 min-h-screen pb-10">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Identifikasi Usulan</h2>
        <p class="text-sm text-gray-500 mt-1">Sistem otomatis mendeteksi pegawai yang memenuhi syarat AK</p>
      </div>
      <div class="flex gap-4 text-xs items-center">
        <template v-if="!isEditingJadwal">
          <div class="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg border border-blue-200 shadow-sm">
            📅 <strong>Estimasi Jadwal Ukom:</strong><br>{{ jadwalUkom }}
          </div>
          <div class="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg border border-purple-200 shadow-sm">
            📅 <strong>Estimasi Jadwal Assessment:</strong><br>{{ jadwalAssess }}
          </div>
          <button v-if="userSesi.role === 'Admin'" @click="isEditingJadwal = true" class="text-gray-500 hover:text-blue-600 font-bold p-2 bg-white rounded shadow-sm border">
            ✏️ Ubah Jadwal
          </button>
        </template>

        <template v-else>
          <div class="flex flex-col gap-1">
            <label class="font-bold">Jadwal Ukom:</label>
            <input v-model="jadwalUkom" class="border p-1.5 rounded outline-none focus:ring-2 focus:ring-blue-500 w-48" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="font-bold">Jadwal Assessment:</label>
            <input v-model="jadwalAssess" class="border p-1.5 rounded outline-none focus:ring-2 focus:ring-blue-500 w-48" />
          </div>
          <button @click="isEditingJadwal = false" class="bg-green-600 text-white font-bold px-4 py-2 rounded-lg mt-4 shadow hover:bg-green-700">
            💾 Simpan
          </button>
        </template>
      </div>
    </div>

    <div class="flex gap-2 border-b border-gray-300 overflow-x-auto">
      <button @click="activeTab = 'kp'" :class="['px-5 py-3 font-bold rounded-t-lg transition-colors whitespace-nowrap', activeTab === 'kp' ? 'bg-white border-x border-t border-gray-300 text-bps-blue shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200']">1. Kenaikan Pangkat</button>
      <button @click="activeTab = 'ukom'" :class="['px-5 py-3 font-bold rounded-t-lg transition-colors whitespace-nowrap', activeTab === 'ukom' ? 'bg-white border-x border-t border-gray-300 text-bps-blue shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200']">2. Peserta Ukom (KJ)</button>
      <button @click="activeTab = 'assess'" :class="['px-5 py-3 font-bold rounded-t-lg transition-colors whitespace-nowrap', activeTab === 'assess' ? 'bg-white border-x border-t border-gray-300 text-bps-blue shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200']">3. Peserta Assessment</button>
      <button @click="activeTab = 'jft'" :class="['px-5 py-3 font-bold rounded-t-lg transition-colors whitespace-nowrap', activeTab === 'jft' ? 'bg-white border-x border-t border-gray-300 text-bps-blue shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200']">4. Pengangkatan JFT</button>
    </div>

    <div class="bg-white p-6 rounded-b-xl shadow-sm border border-gray-200 min-h-[400px]">

      <div v-show="activeTab === 'kp'" class="animate-fade-in">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-lg">Daftar Nominasi Kenaikan Pangkat (Reguler/Fungsional)</h3>
          <button @click="unduhExcel('export-kp', 'Daftar_Nominasi_Kenaikan_Pangkat_Periode_April_2026')" class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-green-700 flex items-center gap-2">
            📊 Unduh Excel
          </button>
        </div>
        
        <div class="overflow-x-auto border rounded-lg">
          <table id="export-kp" class="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th colspan="8" style="text-align: left; border: none; font-weight: bold; font-size: 14pt;">NOMINASI KENAIKAN PANGKAT PERIODE APRIL 2026</th>
              </tr>
              <tr>
                <th colspan="8" style="text-align: left; border: none; font-weight: bold; font-size: 14pt; padding-bottom: 15px;">BPS PROVINSI KALIMANTAN TENGAH</th>
              </tr>
              <tr class="bg-gray-100 font-bold">
                <th style="border: 1px solid black; padding: 8px;">No</th>
                <th style="border: 1px solid black; padding: 8px;">NIP</th>
                <th style="border: 1px solid black; padding: 8px;">Nama</th>
                <th style="border: 1px solid black; padding: 8px;">Jabatan</th>
                <th style="border: 1px solid black; padding: 8px;">Jenis Kenaikan Pangkat</th>
                <th style="border: 1px solid black; padding: 8px;">Gol Yang di usulkan</th>
                <th style="border: 1px solid black; padding: 8px;">Satker</th>
                <th style="border: 1px solid black; padding: 8px;">Estimasi periode Angka Kredit</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, i) in listKP" :key="p.id" class="hover:bg-blue-50/50">
                <td style="border: 1px solid black; padding: 6px; text-align: center;">{{ i + 1 }}</td>
                <td style="border: 1px solid black; padding: 6px; text-align: center;">{{ p.nip }}</td>
                <td style="border: 1px solid black; padding: 6px; text-align: left;">{{ p.nama }}</td>
                <td style="border: 1px solid black; padding: 6px; text-align: left;">{{ p.jabatan }}</td>
                <td style="border: 1px solid black; padding: 6px; text-align: center;">Fungsional</td>
                <td style="border: 1px solid black; padding: 6px; text-align: center; font-weight: bold;">{{ p.nextGolru }}</td>
                <td style="border: 1px solid black; padding: 6px; text-align: left;">{{ p.unit_kerja }}</td>
                <td style="border: 1px solid black; padding: 6px; text-align: right;">{{ p.totalAK.toFixed(3) }}</td>
              </tr>
              <tr v-if="listKP.length === 0"><td colspan="8" class="p-4 text-center text-gray-500 italic">Belum ada pegawai yang memenuhi syarat AK untuk Kenaikan Pangkat.</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-show="activeTab === 'ukom'" class="animate-fade-in">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-lg">Daftar Usulan Calon Peserta Ujian Kompetensi (KJ)</h3>
          <button @click="unduhWord('export-ukom', 'Daftar_Usulan_Calon_Peserta_Ujian_Kompetensi_KJ_Periode_1_2026')" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700 flex items-center gap-2">
            📝 Unduh Word
          </button>
        </div>
        
        <div class="overflow-x-auto border rounded-lg bg-white">
          <div id="export-ukom" class="p-4">
            <div style="text-align: center; font-weight: bold; font-size: 12pt; margin-bottom: 15px; font-family: 'Times New Roman', serif;">
              USULAN PESERTA<br>
              UJI KOMPETENSI KENAIKAN JENJANG FUNGSIONAL<br>
              STATISTISI DAN PRANATA KOMPUTER PERIODE FEBRUARI 2026<br>
              BPS PROVINSI KALIMANTAN TENGAH
            </div>
            <table style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', serif; font-size: 11pt; text-align: center;">
              <thead>
                <tr style="background-color: #f2f2f2; font-weight: bold;">
                  <td rowspan="2" style="border: 1px solid black; padding: 5px;">No.</td>
                  <td rowspan="2" style="border: 1px solid black; padding: 5px;">Nama</td>
                  <td rowspan="2" style="border: 1px solid black; padding: 5px;">NIP</td>
                  <td rowspan="2" style="border: 1px solid black; padding: 5px;">Pangkat/Golongan</td>
                  <td colspan="2" style="border: 1px solid black; padding: 5px;">Jabatan</td>
                  <td rowspan="2" style="border: 1px solid black; padding: 5px;">KJ/PJL</td>
                  <td rowspan="2" style="border: 1px solid black; padding: 5px;">Satuan Kerja</td>
                  <td rowspan="2" style="border: 1px solid black; padding: 5px;">AK Kredit</td>
                </tr>
                <tr style="background-color: #f2f2f2; font-weight: bold;">
                  <td style="border: 1px solid black; padding: 5px;">Lama</td>
                  <td style="border: 1px solid black; padding: 5px;">Baru</td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, i) in listUkom" :key="p.id">
                  <td style="border: 1px solid black; padding: 5px;">{{ i + 1 }}.</td>
                  <td style="border: 1px solid black; padding: 5px; text-align: left;">{{ p.nama }}</td>
                  <td style="border: 1px solid black; padding: 5px;">{{ p.nip }}</td>
                  <td style="border: 1px solid black; padding: 5px;">{{ p.pangkat }}</td>
                  <td style="border: 1px solid black; padding: 5px; text-align: left;">{{ p.jabatan }}</td>
                  <td style="border: 1px solid black; padding: 5px; text-align: left; font-weight: bold;">{{ p.nextJenjangLengkap }}</td>
                  <td style="border: 1px solid black; padding: 5px;">KJ</td>
                  <td style="border: 1px solid black; padding: 5px; text-align: left;">{{ p.unit_kerja }}</td>
                  <td style="border: 1px solid black; padding: 5px;">{{ p.totalAK.toFixed(3) }}</td>
                </tr>
                <tr v-if="listUkom.length === 0"><td colspan="9" style="border: 1px solid black; padding: 10px; text-align: center; font-style: italic;">Belum ada pegawai yang memenuhi syarat Ukom.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'assess'" class="animate-fade-in">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-lg">Daftar Usulan Peserta Assessment (Ke Madya/Utama)</h3>
          <button @click="unduhWord('export-assess', 'Daftar_Usulan_Assessment')" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700 flex items-center gap-2">
            📝 Unduh Word
          </button>
        </div>
        
        <div class="overflow-x-auto border rounded-lg bg-white">
          <div id="export-assess" class="p-4">
            <div style="text-align: center; font-weight: bold; font-size: 12pt; margin-bottom: 15px; font-family: 'Times New Roman', serif;">
              USULAN CALON PESERTA ASSESSMENT<br>
              SELEKSI PEJABAT FUNGSIONAL AHLI MADYA<br>
              BPS PROVINSI KALIMANTAN TENGAH PERIODE APRIL TAHUN 2026
            </div>
            <table style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', serif; font-size: 11pt; text-align: center;">
              <thead>
                <tr style="background-color: #f2f2f2; font-weight: bold;">
                  <td rowspan="2" style="border: 1px solid black; padding: 5px;">No</td>
                  <td rowspan="2" style="border: 1px solid black; padding: 5px;">Nama</td>
                  <td rowspan="2" style="border: 1px solid black; padding: 5px;">NIP</td>
                  <td rowspan="2" style="border: 1px solid black; padding: 5px;">Pangkat/<br>Golongan</td>
                  <td colspan="2" style="border: 1px solid black; padding: 5px;">Jabatan</td>
                  <td rowspan="2" style="border: 1px solid black; padding: 5px;">Satuan Kerja</td>
                  <td rowspan="2" style="border: 1px solid black; padding: 5px;">Keterangan</td>
                  <td colspan="2" style="border: 1px solid black; padding: 5px;">Ket</td>
                </tr>
                <tr style="background-color: #f2f2f2; font-weight: bold;">
                  <td style="border: 1px solid black; padding: 5px;">Lama</td>
                  <td style="border: 1px solid black; padding: 5px;">Baru</td>
                  <td style="border: 1px solid black; padding: 5px;">Pernah</td>
                  <td style="border: 1px solid black; padding: 5px;">Tidak</td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, i) in listAssessment" :key="p.id">
                  <td style="border: 1px solid black; padding: 5px;">{{ i + 1 }}</td>
                  <td style="border: 1px solid black; padding: 5px; text-align: left;">{{ p.nama }}</td>
                  <td style="border: 1px solid black; padding: 5px;">{{ p.nip }}</td>
                  <td style="border: 1px solid black; padding: 5px;">{{ p.pangkat }}</td>
                  <td style="border: 1px solid black; padding: 5px; text-align: left;">{{ p.jabatan }}</td>
                  <td style="border: 1px solid black; padding: 5px; text-align: left; font-weight: bold;">{{ p.nextJenjangLengkap }}</td>
                  <td style="border: 1px solid black; padding: 5px; text-align: left;">{{ p.unit_kerja }}</td>
                  <td style="border: 1px solid black; padding: 5px;">-</td>
                  <td style="border: 1px solid black; padding: 5px;"></td>
                  <td style="border: 1px solid black; padding: 5px; text-align: center;">v</td>
                </tr>
                <tr v-if="listAssessment.length === 0"><td colspan="10" style="border: 1px solid black; padding: 10px; text-align: center; font-style: italic;">Tidak ada pegawai yang memenuhi syarat Assessment Madya/Utama saat ini.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'jft'" class="animate-fade-in">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-lg">Daftar Usulan Pengangkatan Pejabat Fungsional</h3>
          <button @click="unduhWord('export-jft', 'Daftar_Usulan_Pengangkatan_JFT')" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700 flex items-center gap-2">
            📝 Unduh Word
          </button>
        </div>
        
        <div class="overflow-x-auto border rounded-lg bg-white">
          <div id="export-jft" class="p-4">
            <div style="text-align: center; font-weight: bold; font-size: 12pt; margin-bottom: 15px; font-family: 'Times New Roman', serif;">
              USULAN PENGANGKATAN PERPINDAHAN JABATAN DAN KENAIKAN JENJANG JABATAN FUNGSIONAL<br>
              BPS PROVINSI KALIMANTAN TENGAH TAHUN 2026
            </div>
            <table style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', serif; font-size: 11pt; text-align: center;">
              <thead>
                <tr style="background-color: #f2f2f2; font-weight: bold;">
                  <td rowspan="2" style="border: 1px solid black; padding: 5px;">No</td>
                  <td rowspan="2" style="border: 1px solid black; padding: 5px;">Nama</td>
                  <td rowspan="2" style="border: 1px solid black; padding: 5px;">NIP</td>
                  <td rowspan="2" style="border: 1px solid black; padding: 5px;">Pangkat/Golongan</td>
                  <td colspan="2" style="border: 1px solid black; padding: 5px;">Jabatan</td>
                  <td rowspan="2" style="border: 1px solid black; padding: 5px;">Angka Kredit</td>
                </tr>
                <tr style="background-color: #f2f2f2; font-weight: bold;">
                  <td style="border: 1px solid black; padding: 5px;">Lama</td>
                  <td style="border: 1px solid black; padding: 5px;">Baru</td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, i) in listJFT" :key="p.id">
                  <td style="border: 1px solid black; padding: 5px;">{{ i + 1 }}.</td>
                  <td style="border: 1px solid black; padding: 5px; text-align: left;">{{ p.nama }}</td>
                  <td style="border: 1px solid black; padding: 5px;">{{ p.nip }}</td>
                  <td style="border: 1px solid black; padding: 5px;">{{ p.pangkat }}</td>
                  <td style="border: 1px solid black; padding: 5px; text-align: left;">{{ p.jabatan }}</td>
                  <td style="border: 1px solid black; padding: 5px; text-align: left; font-weight: bold;">{{ p.nextJenjangLengkap }}</td>
                  <td style="border: 1px solid black; padding: 5px;">{{ p.totalAK.toFixed(3) }}</td>
                </tr>
                <tr v-if="listJFT.length === 0"><td colspan="7" style="border: 1px solid black; padding: 10px; text-align: center; font-style: italic;">Tidak ada usulan JFT.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
/* Hilangkan tombol/navigasi saat nge-print langsung (jika ada yang iseng Ctrl+P) */
@media print { .no-print { display: none !important; } }
</style>