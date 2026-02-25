<script setup>
import { ref, computed, watch } from 'vue'
import { usePegawaiStore } from '~/stores/usePegawaiStore'

// =====================================================================
// 1. MASTER DATA & UTILITAS
// =====================================================================

const formatTanggal = (date) => {
  const d = new Date(date)
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

const getNamaBulan = (bulanIndex) => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return months[bulanIndex - 1] || months[bulanIndex] || ''
}

const getKodeJF = (jabatan) => {
  const j = jabatan.toLowerCase()
  if (j.includes('statistisi')) return 'ST'
  if (j.includes('pranata komputer')) return 'PK'
  if (j.includes('kepegawaian') || j.includes('sdm aparatur')) return 'JFK'
  if (j.includes('widyaiswara')) return 'WID'
  if (j.includes('analis anggaran')) return 'JFAA'
  if (j.includes('perencana')) return 'JFP'
  if (j.includes('auditor')) return 'AD'
  if (j.includes('pranata keuangan')) return 'PKA'
  if (j.includes('apk apbn')) return 'APK'
  if (j.includes('humas')) return 'JFPH'
  if (j.includes('barang dan jasa')) return 'PBJ'
  if (j.includes('laksana barang')) return 'PLB'
  if (j.includes('penyuluh hukum')) return 'JFH'
  if (j.includes('analis hukum')) return 'JFAH'
  if (j.includes('perundang-undangan') || j.includes('peratur')) return 'JFPU'
  if (j.includes('arsiparis')) return 'JFA'
  if (j.includes('teknologi pembelajaran')) return 'PTP'
  if (j.includes('dosen')) return 'JFD'
  return 'JF' 
}

const kamusPangkat = [
  { golru: 'II/c', nama: 'Pengatur', ak_kp: 20 },
  { golru: 'II/d', nama: 'Pengatur Tk.I', ak_kp: 20 },
  { golru: 'III/a', nama: 'Penata Muda', ak_kp: 50 },
  { golru: 'III/b', nama: 'Penata Muda Tk.I', ak_kp: 100 },
  { golru: 'III/c', nama: 'Penata', ak_kp: 100 },
  { golru: 'III/d', nama: 'Penata Tk.I', ak_kp: 200 },
  { golru: 'IV/a', nama: 'Pembina', ak_kp: 150 },
  { golru: 'IV/b', nama: 'Pembina Tk.I', ak_kp: 300 },
  { golru: 'IV/c', nama: 'Pembina Utama Muda', ak_kp: 450 },
  { golru: 'IV/d', nama: 'Pembina Utama Madya', ak_kp: 200 },
  { golru: 'IV/e', nama: 'Pembina Utama', ak_kp: null },
]

const kamusJabatan = [
  { keyword: 'utama', nama: 'Ahli Utama', koef_tahun: 50, target_jenjang: null },
  { keyword: 'madya', nama: 'Ahli Madya', koef_tahun: 37.5, target_jenjang: 450 },
  { keyword: 'muda', nama: 'Ahli Muda', koef_tahun: 25, target_jenjang: 200 },
  { keyword: 'pertama', nama: 'Ahli Pertama', koef_tahun: 12.5, target_jenjang: 100 },
  { keyword: 'penyelia', nama: 'Penyelia', koef_tahun: 25, target_jenjang: null },
  { keyword: 'mahir', nama: 'Mahir', koef_tahun: 12.5, target_jenjang: 100 },
  { keyword: 'terampil', nama: 'Terampil', koef_tahun: 5, target_jenjang: 40 },
]

const kamusPredikat = [
  { nama: 'Sangat Baik', persen: 1.50 },
  { nama: 'Baik', persen: 1.00 },
  { nama: 'Cukup/Butuh Perbaikan', persen: 0.75 },
  { nama: 'Kurang', persen: 0.50 },
  { nama: 'Sangat Kurang', persen: 0.25 },
]

// =====================================================================
// 2. DATA DARI PINIA
// =====================================================================
const store = usePegawaiStore()
const pegawaiList = computed(() => store.pegawaiList)

// =====================================================================
// 3. PENCARIAN & PAGINATION
// =====================================================================
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

watch(searchQuery, () => { currentPage.value = 1 })

const filteredPegawai = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return pegawaiList.value.filter(p => p.nama.toLowerCase().includes(query) || p.nip.includes(query))
})

const totalPages = computed(() => Math.ceil(filteredPegawai.value.length / itemsPerPage))
const paginatedPegawai = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredPegawai.value.slice(start, start + itemsPerPage)
})

// =====================================================================
// 4. DETAIL VIEW & CRUD AK
// =====================================================================
const selectedPegawai = ref(null)

const lihatDetailAK = (pegawai) => { selectedPegawai.value = pegawai }
const kembaliKeDaftar = () => { selectedPegawai.value = null }

const riwayatAK = computed(() => {
  if (!selectedPegawai.value) return []
  return store.riwayatList.filter(r => r.pegawai_id === selectedPegawai.value.id)
})

const totalAkumulasi = computed(() => {
  return selectedPegawai.value ? selectedPegawai.value.total_ak_kumulatif.toFixed(3) : '0.000'
})

const analisisKelayakan = computed(() => {
  if (!selectedPegawai.value) return { eligible: false }
  const match = selectedPegawai.value.pangkat.match(/\((.*?)\)/)
  const golru = match ? match[1] : ''
  const syarat = kamusPangkat.find(p => p.golru === golru)
  
  if (!syarat) return { eligible: false, pesan: 'Pangkat Invalid' }
  const totalAK = parseFloat(selectedPegawai.value.total_ak_kumulatif)
  const targetPangkat = syarat.ak_kp
  let kurangPangkat = targetPangkat - totalAK
  
  const jabatanLower = selectedPegawai.value.jabatan.toLowerCase()
  const jabInfo = kamusJabatan.find(j => jabatanLower.includes(j.keyword))
  const targetJenjang = jabInfo ? jabInfo.target_jenjang : 0
  let kurangJenjang = targetJenjang ? (targetJenjang - totalAK) : 0
  
  return { 
    eligible: kurangPangkat <= 0, 
    targetPangkat: targetPangkat, 
    kurangPangkat: kurangPangkat > 0 ? kurangPangkat.toFixed(3) : '0', 
    targetJenjang: targetJenjang || '-', 
    kurangJenjang: kurangJenjang > 0 ? kurangJenjang.toFixed(3) : '0', 
    pesan: kurangPangkat <= 0 ? 'MEMENUHI SYARAT PANGKAT' : 'BELUM MEMENUHI', 
    warna: kurangPangkat <= 0 ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600' 
  }
})

// MODAL KALKULATOR
const showModalKalkulator = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const formKalkulasi = ref({ tahun: new Date().getFullYear(), bulan_mulai: 1, bulan_selesai: 12, jabatan: 'Ahli Muda', predikat: 'Baik' })

// 🚀 DURASI DIHITUNG OTOMATIS
const durasiBulan = computed(() => {
  const start = parseInt(formKalkulasi.value.bulan_mulai)
  const end = parseInt(formKalkulasi.value.bulan_selesai)
  return end >= start ? (end - start + 1) : 0
})

const hasilKalkulasi = computed(() => {
  const selectedJabatan = kamusJabatan.find(j => j.nama === formKalkulasi.value.jabatan)
  const selectedPredikat = kamusPredikat.find(p => p.nama === formKalkulasi.value.predikat)
  if (!selectedJabatan || !selectedPredikat || durasiBulan.value <= 0) return 0
  return ((durasiBulan.value / 12) * selectedJabatan.koef_tahun * selectedPredikat.persen).toFixed(3)
})

const bukaModalTambah = () => {
  isEditing.value = false; editingId.value = null
  formKalkulasi.value = { tahun: new Date().getFullYear(), bulan_mulai: 1, bulan_selesai: 12, jabatan: selectedPegawai.value?.jabatan.includes('Muda') ? 'Ahli Muda' : 'Ahli Pertama', predikat: 'Baik' }
  showModalKalkulator.value = true
}

const bukaModalEdit = (item) => {
  if (item.sumber === 'Migrasi Data Lama') { alert("Data Migrasi Lama tidak disarankan untuk diedit."); return }
  isEditing.value = true; editingId.value = item.id
  formKalkulasi.value = { 
    tahun: item.tahun, 
    bulan_mulai: item.bulan_mulai || 1, 
    bulan_selesai: item.bulan_selesai || item.bulan, 
    jabatan: item.jabatan, 
    predikat: item.predikat 
  }
  showModalKalkulator.value = true
}

const simpanKalkulasi = () => {
  if (durasiBulan.value <= 0) {
    alert("Bulan Selesai harus lebih besar atau sama dengan Bulan Mulai!")
    return
  }

  const dataBaru = { 
    id: isEditing.value ? editingId.value : Date.now(), 
    pegawai_id: selectedPegawai.value.id,
    tahun: formKalkulasi.value.tahun, 
    bulan_mulai: parseInt(formKalkulasi.value.bulan_mulai),
    bulan_selesai: parseInt(formKalkulasi.value.bulan_selesai),
    bulan: durasiBulan.value, // Disimpan untuk kebutuhan backup/tampilan
    jabatan: formKalkulasi.value.jabatan, 
    predikat: formKalkulasi.value.predikat, 
    ak_didapat: parseFloat(hasilKalkulasi.value), 
    sumber: 'Konversi SKP' 
  }
  store.simpanRiwayat(dataBaru, isEditing.value)
  showModalKalkulator.value = false
}

const hapusItem = (id) => { 
  if (confirm("Hapus data ini?")) { store.hapusRiwayat(id, selectedPegawai.value.id) } 
}

// =====================================================================
// 5. LOGIKA PRINTING (DINAMIS RENTANG BULAN)
// =====================================================================
const showModalPrintKonversi = ref(false)
const showModalPrintAkumulasi = ref(false)
const showModalPrintPAK = ref(false)
const showModalStatus = ref(false)
const printData = ref(null)
const formStatus = ref({ status: '', catatan: '' })

// A. DINAMIS KONVERSI TAHUNAN (Per Item)
const cetakLaporanTahunan = (item) => {
  const jabatanLower = selectedPegawai.value.jabatan.toLowerCase()
  const jabInfo = kamusJabatan.find(j => item.jabatan.toLowerCase().includes(j.keyword)) || kamusJabatan.find(j => jabatanLower.includes(j.keyword))
  const predInfo = kamusPredikat.find(p => p.nama === item.predikat)
  
  // Format tulisan masa penilaian (Bulan Awal s.d Bulan Akhir)
  const start = item.bulan_mulai || 1
  const end = item.bulan_selesai || 12
  const masaPenilaian = start === end 
    ? `${getNamaBulan(end)} ${item.tahun}`
    : `${getNamaBulan(start)} s.d ${getNamaBulan(end)} ${item.tahun}`

  printData.value = { 
    ...item, 
    pegawai: selectedPegawai.value, 
    koef_tahun: jabInfo ? jabInfo.koef_tahun : 0, 
    persen: predInfo ? (predInfo.persen * 100) : 0, 
    kode_jf: getKodeJF(selectedPegawai.value.jabatan),
    masa_penilaian: masaPenilaian, 
    tanggal_ttd: formatTanggal(new Date())
  }
  showModalPrintKonversi.value = true
}

// B. DINAMIS AKUMULASI & PAK (Mencari Data Terbaru)
const siapkanDataAkumulasi = () => {
  const riwayatLengkap = riwayatAK.value.map(item => {
     const jabInfo = kamusJabatan.find(j => item.jabatan.toLowerCase().includes(j.keyword))
     const predInfo = kamusPredikat.find(p => p.nama === item.predikat)
     return { ...item, koef_tahun: jabInfo ? jabInfo.koef_tahun : 0, persen: predInfo ? (predInfo.persen * 100) : 0 }
  })
  
  // CARI DATA TERBARU
  let latestItem = null
  if (riwayatAK.value.length > 0) {
    const sorted = [...riwayatAK.value].sort((a, b) => {
       if (b.tahun !== a.tahun) return b.tahun - a.tahun 
       const endA = a.bulan_selesai || 12
       const endB = b.bulan_selesai || 12
       return endB - endA 
    })
    latestItem = sorted[0]
  }

  let masaPenilaian = ""
  if (latestItem) {
    const endMonth = latestItem.bulan_selesai || 12
    masaPenilaian = `s.d ${getNamaBulan(endMonth)} ${latestItem.tahun}`
  } else {
    const now = new Date()
    masaPenilaian = `s.d ${getNamaBulan(now.getMonth() + 1)} ${now.getFullYear()}`
  }

  return { 
    pegawai: selectedPegawai.value, 
    riwayat: riwayatLengkap, 
    total_ak: totalAkumulasi.value, 
    analisis: analisisKelayakan.value,
    kode_jf: getKodeJF(selectedPegawai.value.jabatan),
    masa_penilaian: masaPenilaian, 
    tanggal_ttd: formatTanggal(new Date())
  }
}

const cetakAkumulasi = () => {
  printData.value = siapkanDataAkumulasi()
  showModalPrintAkumulasi.value = true
}

const cetakFormPAK = () => {
  if (!analisisKelayakan.value.eligible) { alert("Syarat Angka Kredit belum terpenuhi."); return }
  printData.value = siapkanDataAkumulasi()
  showModalPrintPAK.value = true
}

// 🖨️ FUNGSI PRINT BROWSER BAWAAN
const unduhPDF = (elementId) => {
  const originalElement = document.getElementById(elementId);
  if (!originalElement) return;

  const originalBodyChildren = Array.from(document.body.children);
  originalBodyChildren.forEach(child => {
    if (child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
      child.setAttribute('data-original-display', child.style.display); 
      child.style.display = 'none'; 
    }
  });

  const printContainer = document.createElement('div');
  printContainer.id = 'print-target';
  printContainer.style.position = 'absolute';
  printContainer.style.top = '0';
  printContainer.style.left = '0';
  printContainer.style.width = '210mm';
  printContainer.style.height = '297mm';
  printContainer.style.backgroundColor = 'white';
  
  const clonedContent = originalElement.cloneNode(true);
  clonedContent.classList.remove('shadow-2xl', 'overflow-y-auto', 'overflow-hidden');
  clonedContent.style.boxShadow = 'none';
  clonedContent.style.margin = '0';
  
  printContainer.appendChild(clonedContent);
  document.body.appendChild(printContainer);

  setTimeout(() => {
    window.print();
    
    document.body.removeChild(printContainer);
    originalBodyChildren.forEach(child => {
      if (child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
        child.style.display = child.getAttribute('data-original-display') || '';
      }
    });
  }, 150);
}

const updateStatusPegawai = () => { 
  store.updateStatusPegawai(selectedPegawai.value.id, formStatus.value.status)
  showModalStatus.value = false; formStatus.value.status = ''
}
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6 bg-gray-50 min-h-screen pb-10">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Manajemen Angka Kredit (AK)</h2>
        <p class="text-sm text-gray-500 mt-1">Cari pegawai, kelola AK, dan cetak dokumen resmi</p>
      </div>
    </div>

    <div v-if="!selectedPegawai" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden no-print">
      <div class="p-6 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="relative w-full md:w-96">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
          <input v-model="searchQuery" type="text" placeholder="Cari berdasarkan Nama atau NIP..." class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-bps-blue outline-none text-sm" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-600 text-xs uppercase border-b border-gray-200">
              <th class="px-6 py-4 text-center">No</th><th class="px-6 py-4">Nama & NIP</th><th class="px-6 py-4">Jabatan & Pangkat</th><th class="px-6 py-4 text-center">Status</th><th class="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-sm">
            <tr v-for="(peg, index) in paginatedPegawai" :key="peg.id" class="hover:bg-blue-50/30">
              <td class="px-6 py-4 text-center">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td class="px-6 py-4"><div class="font-bold text-gray-900">{{ peg.nama }}</div><div class="text-xs text-gray-500 mt-0.5">{{ peg.nip }}</div></td>
              <td class="px-6 py-4"><div class="font-medium text-bps-blue">{{ peg.jabatan }}</div><div class="text-xs text-gray-500 mt-0.5">{{ peg.pangkat }}</div></td>
              <td class="px-6 py-4 text-center"><span class="px-2 py-1 bg-gray-100 rounded text-xs border">{{ peg.status_kepegawaian }}</span></td>
              <td class="px-6 py-4 text-center"><button @click="lihatDetailAK(peg)" class="bg-bps-blue text-white px-4 py-2 rounded-md font-semibold text-xs hover:bg-bps-dark">Buka Data</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="p-4 flex items-center justify-between text-sm bg-white">
        <div>Menampilkan Hal {{ currentPage }} dari {{ totalPages }}</div>
        <div class="flex gap-2">
          <button @click="currentPage--" :disabled="currentPage === 1" class="px-3 py-1.5 border rounded hover:bg-gray-50 disabled:opacity-50">&laquo; Prev</button>
          <button @click="currentPage++" :disabled="currentPage === totalPages" class="px-3 py-1.5 border rounded hover:bg-gray-50 disabled:opacity-50">Next &raquo;</button>
        </div>
      </div>
    </div>

    <div v-else class="space-y-6 animate-fade-in no-print">
      <button @click="kembaliKeDaftar" class="text-gray-500 hover:text-bps-blue font-medium text-sm flex items-center gap-1 mb-2"><span>&larr;</span> Kembali</button>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div class="flex flex-col md:flex-row items-start justify-between gap-4">
          <div>
            <h3 class="text-xl font-bold text-gray-800">{{ selectedPegawai.nama }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ selectedPegawai.nip }} | {{ selectedPegawai.unit_kerja }}</p>
            <div class="flex items-center gap-3 mt-3 text-sm">
              <span class="bg-blue-50 text-bps-dark px-2.5 py-1 rounded-md font-medium border border-blue-100">{{ selectedPegawai.jabatan }}</span>
              <span class="bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md font-medium border border-gray-200">{{ selectedPegawai.pangkat }}</span>
              <span :class="`px-2.5 py-1 rounded-md font-bold border ${analisisKelayakan.warna}`">{{ analisisKelayakan.pesan }}</span>
            </div>
          </div>
          
          <div class="flex flex-col gap-2 w-full md:w-auto">
             <button @click="showModalStatus = true" class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow">⚙️ Update Status</button>
             
             <button @click="cetakAkumulasi" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow">
                📄 Cetak Akumulasi AK
             </button>
             
             <button 
                @click="cetakFormPAK"
                :disabled="!analisisKelayakan.eligible"
                :class="['px-4 py-2 rounded-lg text-sm font-bold shadow flex justify-center', analisisKelayakan.eligible ? 'bg-bps-blue text-white hover:bg-bps-dark' : 'bg-gray-200 text-gray-400 cursor-not-allowed']"
              >
                🖨️ Cetak PAK {{ !analisisKelayakan.eligible ? '(AK Belum Cukup)' : '' }}
             </button>
          </div>
        </div>

        <div class="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
          <div><p class="text-sm text-gray-600 font-semibold uppercase">Total Angka Kredit Kumulatif</p></div>
          <div class="text-right"><span class="text-4xl font-extrabold text-bps-blue">{{ totalAkumulasi }}</span></div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 class="font-bold text-gray-800">Rincian Angka Kredit</h3>
          <button @click="bukaModalTambah" class="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-4 rounded-lg">+ Kalkulasi SKP Baru</button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50 text-xs uppercase border-b text-gray-600">
              <tr><th class="px-6 py-3">Tahun</th><th class="px-6 py-3 text-center">Rentang Waktu</th><th class="px-6 py-3">Jabatan</th><th class="px-6 py-3 text-center">Predikat</th><th class="px-6 py-3 text-right">AK Didapat</th><th class="px-6 py-3 text-center">Aksi / Cetak</th></tr>
            </thead>
            <tbody class="divide-y text-sm">
              <tr v-for="item in riwayatAK" :key="item.id" class="hover:bg-gray-50 group">
                <td class="px-6 py-4 font-bold">{{ item.tahun }}</td>
                <td class="px-6 py-4 text-center leading-tight">
                  <span v-if="item.sumber !== 'Migrasi Data Lama'">
                    <span class="font-semibold text-gray-800">{{ getNamaBulan(item.bulan_mulai) }} s/d {{ getNamaBulan(item.bulan_selesai) }}</span><br>
                    <span class="text-[11px] text-gray-500">({{ item.bulan }} Bulan)</span>
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-6 py-4">{{ item.jabatan }}</td>
                <td class="px-6 py-4 text-center"><span v-if="item.predikat !== '-'" class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">{{ item.predikat }}</span><span v-else class="text-gray-400">-</span></td>
                <td class="px-6 py-4 text-right font-bold text-bps-blue text-base">+{{ parseFloat(item.ak_didapat).toFixed(3) }}</td>
                <td class="px-6 py-4 text-center flex items-center justify-center gap-2">
                   <button v-if="item.sumber !== 'Migrasi Data Lama'" @click="cetakLaporanTahunan(item)" class="bg-gray-100 text-gray-600 px-3 py-1.5 rounded hover:bg-blue-50 border text-xs font-bold">📄 PDF Konversi</button>
                   <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button @click="bukaModalEdit(item)" class="bg-blue-100 text-blue-600 p-1.5 rounded" title="Edit">✏️</button>
                      <button @click="hapusItem(item.id)" class="bg-red-100 text-red-600 p-1.5 rounded" title="Hapus">🗑️</button>
                   </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showModalKalkulator" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl w-[600px] shadow-2xl animate-scale-in">
        <div class="bg-bps-blue px-6 py-4 flex justify-between items-center text-white rounded-t-2xl">
          <h3 class="font-bold text-lg">{{ isEditing ? 'Edit Data SKP' : 'Kalkulasi SKP Baru' }}</h3>
          <button @click="showModalKalkulator = false" class="text-white hover:text-gray-200 text-2xl">&times;</button>
        </div>
        <div class="p-6 space-y-4">
          
          <div class="grid grid-cols-3 gap-4">
             <div>
               <label class="block text-xs font-bold mb-1">Tahun Penilaian</label>
               <input v-model="formKalkulasi.tahun" type="number" class="w-full p-2 border rounded outline-none focus:border-bps-blue">
             </div>
             <div>
               <label class="block text-xs font-bold mb-1">Bulan Mulai</label>
               <select v-model="formKalkulasi.bulan_mulai" class="w-full p-2 border rounded bg-white outline-none focus:border-bps-blue">
                  <option value="1">Januari</option>
                  <option value="2">Februari</option>
                  <option value="3">Maret</option>
                  <option value="4">April</option>
                  <option value="5">Mei</option>
                  <option value="6">Juni</option>
                  <option value="7">Juli</option>
                  <option value="8">Agustus</option>
                  <option value="9">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">Desember</option>
               </select>
             </div>
             <div>
               <label class="block text-xs font-bold mb-1">Bulan Selesai</label>
               <select v-model="formKalkulasi.bulan_selesai" class="w-full p-2 border rounded bg-white outline-none focus:border-bps-blue">
                  <option value="1">Januari</option>
                  <option value="2">Februari</option>
                  <option value="3">Maret</option>
                  <option value="4">April</option>
                  <option value="5">Mei</option>
                  <option value="6">Juni</option>
                  <option value="7">Juli</option>
                  <option value="8">Agustus</option>
                  <option value="9">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">Desember</option>
               </select>
             </div>
          </div>
          
          <div><label class="block text-xs font-bold mb-1">Jabatan Saat Evaluasi</label><select v-model="formKalkulasi.jabatan" class="w-full p-2 border rounded bg-white outline-none focus:border-bps-blue"><option v-for="j in kamusJabatan" :value="j.nama">{{ j.nama }} (Koefisien: {{ j.koef_tahun }})</option></select></div>
          <div><label class="block text-xs font-bold mb-1">Predikat Kinerja</label><select v-model="formKalkulasi.predikat" class="w-full p-2 border rounded bg-white outline-none focus:border-bps-blue"><option v-for="p in kamusPredikat" :value="p.nama">{{ p.nama }} ({{ p.persen * 100 }}%)</option></select></div>
          
          <div class="p-4 bg-blue-50 border rounded text-center flex flex-col items-center justify-center">
             <p class="text-xs uppercase font-bold text-blue-600 mb-1">Hasil Konversi Angka Kredit</p>
             <p class="text-3xl font-extrabold text-bps-blue">{{ hasilKalkulasi }}</p>
             <p class="text-xs text-gray-500 mt-1">Berdasarkan Durasi Penilaian: <strong>{{ durasiBulan }} Bulan</strong></p>
          </div>
        </div>
        <div class="p-4 border-t flex justify-end gap-2 bg-gray-50 rounded-b-2xl">
          <button @click="showModalKalkulator = false" class="px-5 py-2 text-gray-600 font-semibold rounded hover:bg-gray-200">Batal</button>
          <button @click="simpanKalkulasi" class="px-5 py-2 bg-bps-blue text-white rounded font-bold hover:bg-bps-dark">Simpan Kalkulasi</button>
        </div>
      </div>
    </div>

    <div v-if="showModalStatus" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-6 no-print">
        <h3 class="text-lg font-bold mb-4">Update Status Kepegawaian</h3>
        <select v-model="formStatus.status" class="w-full border rounded p-2 mb-4 outline-none focus:border-bps-blue">
           <option value="">-- Pilih Status --</option>
           <option value="Aktif">Aktif</option>
           <option value="Sedang Ukom">Sedang Ukom</option>
           <option value="Lulus Ukom">Lulus Ukom</option>
           <option value="Proses SK">Proses SK</option>
        </select>
        <div class="flex justify-end gap-2">
           <button @click="showModalStatus = false" class="text-gray-600 px-4 py-2 hover:bg-gray-100 rounded">Batal</button>
           <button @click="updateStatusPegawai" class="bg-bps-blue text-white px-4 py-2 rounded">Simpan</button>
        </div>
      </div>
    </div>

    <div v-if="showModalPrintKonversi" class="fixed inset-0 bg-black/70 flex justify-center z-50 p-4 overflow-y-auto">
      <div class="shadow-2xl relative mt-4 mb-10">
        <div class="absolute top-0 right-[-140px] flex flex-col gap-2 no-print">
          <button @click="unduhPDF('print-area-konversi')" class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-bold"><span v-if="isGeneratingPDF">⏳</span><span v-else>🖨️</span> Cetak PDF</button>
          <button @click="showModalPrintKonversi = false" class="bg-gray-600 text-white px-4 py-2 rounded shadow hover:bg-gray-700 font-bold">Tutup</button>
        </div>
        
        <div id="print-area-konversi" class="bg-white text-black px-12 pt-16 pb-10 w-[210mm] min-h-[285mm] flex flex-col text-[13px] leading-tight print-font relative">
           
           <div class="relative flex justify-start items-center border-b-[3px] border-black pb-3">
             <img src="/logo-bps-kalteng1.png" alt="Logo BPS" class="absolute -left-12 top-0 w-[210px] h-auto" />
             <div class="text ml-[160px] text relative -left-12"> 
                 <h1 class="text-[20px] text relative left-1 font-bold uppercase tracking-wider -m-1 leading-tight italic" style="font-family: Arial, sans-serif;">BADAN PUSAT STATISTIK</h1>
                 <h2 class="text-[20px] text relative left-1 font-bold uppercase tracking-wider -m-1 leading-tight italic" style="font-family: Arial, sans-serif;">PROVINSI KALIMANTAN TENGAH</h2>
                 <p class="text-[12px] m-0 leading-tight mt-1">Jl. Kapten Piere Tendean No. 6 Palangka Raya 73112</p>
                 <p class="text-[12px] m-0 leading-tight">Telp. (0536) 3228105, Fax.: (0536) 3221380,</p>
                 <p class="text-[12px] m-0 leading-tight">Homepage: https://kalteng.bps.go.id/  E-mail: bps6200@bps.go.id</p>
             </div>
           </div>
           
           <div class="pb-4"></div>

           <div class="text-center font-bold text-[15px] underline mb-6 uppercase tracking-wide">KONVERSI PREDIKAT KINERJA KE ANGKA KREDIT</div>
           <div class="flex justify-between mb-2"><div>Instansi<br>Badan Pusat Statistik</div><div class="text-right">Masa Penilaian :<br>{{ printData.masa_penilaian }}</div></div>

           <table class="w-full border-collapse border border-black mb-6">
             <tbody>
              <tr><td colspan="3" class="border border-black font-bold text-center py-1 uppercase tracking-wider bg-gray-100">PEJABAT FUNGSIONAL YANG DINILAI</td></tr>
              <tr><td class="border border-black px-2 w-6 text-center">1</td><td class="border border-black px-2 w-56">N a m a</td><td class="border border-black px-2 font-bold">{{ printData.pegawai.nama }}</td></tr>
              <tr><td class="border border-black px-2 text-center">2</td><td class="border border-black px-2">NIP</td><td class="border border-black px-2">{{ printData.pegawai.nip }}</td></tr>
              <tr><td class="border border-black px-2 text-center">3</td><td class="border border-black px-2">Nomor Seri KARPEG</td><td class="border border-black px-2">{{ printData.pegawai.karpeg }}</td></tr>
              <tr><td class="border border-black px-2 text-center">4</td><td class="border border-black px-2">Tempat dan Tanggal Lahir</td><td class="border border-black px-2">{{ printData.pegawai.ttl }}</td></tr>
              <tr><td class="border border-black px-2 text-center">5</td><td class="border border-black px-2">Jenis Kelamin</td><td class="border border-black px-2">{{ printData.pegawai.jk }}</td></tr>
              <tr><td class="border border-black px-2 text-center">6</td><td class="border border-black px-2">Pangkat/Golongan Ruang/TMT</td><td class="border border-black px-2">{{ printData.pegawai.pangkat }} / 1 April 2024</td></tr>
              <tr><td class="border border-black px-2 text-center">7</td><td class="border border-black px-2">Jabatan Fungsional/TMT</td><td class="border border-black px-2">{{ printData.jabatan }}</td></tr>
              <tr><td class="border border-black px-2 text-center">8</td><td class="border border-black px-2">Unit Kerja</td><td class="border border-black px-2">{{ printData.pegawai.unit_kerja }}</td></tr>
              <tr><td class="border border-black px-2 text-center">9</td><td class="border border-black px-2">Instansi</td><td class="border border-black px-2">Badan Pusat Statistik</td></tr>
             </tbody>
           </table>

           <div class="text-center font-bold mb-1 uppercase">KONVERSI PREDIKAT KINERJA</div>
           
           <table class="w-full border-collapse border border-black text-center mb-10">
             <tbody>
              <tr class="bg-gray-100"><td colspan="2" class="border border-black font-bold py-1">HASIL PENILAIAN KINERJA</td><td class="border border-black font-bold px-2">KOEFISIEN PER {{ printData.bulan }} BULAN</td><td class="border border-black font-bold px-2">ANGKA KREDIT</td></tr>
              <tr class="bg-gray-100"><td class="border border-black py-1 font-semibold">PREDIKAT</td><td class="border border-black py-1 font-semibold">PROSENTASE</td><td class="border border-black py-1 text-[10px] text-gray-500">(Jenjang: {{ printData.jabatan }})</td><td class="border border-black font-bold py-1">(Kolom 2 x Kolom 3)</td></tr>
              <tr class="bg-gray-200 text-xs"><td class="border border-black">1</td><td class="border border-black">2</td><td class="border border-black">3</td><td class="border border-black">4</td></tr>
              <tr class="h-16 align-middle text-sm">
                <td class="border border-black">{{ printData.predikat }}</td><td class="border border-black">{{ printData.persen }}%</td>
                <td class="border border-black">{{ (printData.koef_tahun * (printData.bulan/12)).toFixed(3) }}</td>
                <td class="border border-black font-bold text-[15px]">{{ parseFloat(printData.ak_didapat).toFixed(3) }}</td>
              </tr>
             </tbody>
           </table>
           
           <div class="flex justify-end -mt-9 mb-8">
             <div class="w-60">
               <div class="flex justify-start">
                 <span class="text-left w-28">Ditetapkan di</span>
                 <span>: Palangka Raya</span>
               </div>
               <div class="flex justify-start mb-8">
                 <span class="text-left w-28">Pada tanggal</span>
                 <span>: {{ printData.tanggal_ttd }}</span>
               </div>
               <div class="text-justify pr-10">
                 <p class="mb-20">Pejabat Penilai Kinerja</p>
                 <p class="font-bold underline">Agnes Widiastuti</p>
               </div>
             </div>
           </div>

           <div style="margin-top: auto; padding-top: 20px; border-top: 1px solid black; position: relative;">
              
              <img src="/balai.png" style="position: absolute; right: 0; top: 6px; width: 60px; height: auto;" />
           </div>
           </div>
      </div>
    </div>

    <div v-if="showModalPrintAkumulasi" class="fixed inset-0 bg-black/70 flex justify-center z-50 p-4 overflow-y-auto">
      <div class="shadow-2xl relative mt-4 mb-10">
        <div class="absolute top-0 right-[-140px] flex flex-col gap-2 no-print">
          <button @click="unduhPDF('print-area-akumulasi')" class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-bold"><span v-if="isGeneratingPDF">⏳</span><span v-else>🖨️</span> Cetak PDF</button>
          <button @click="showModalPrintAkumulasi = false" class="bg-gray-600 text-white px-4 py-2 rounded shadow hover:bg-gray-700 font-bold">Tutup</button>
        </div>
        
        <div id="print-area-akumulasi" class="bg-white text-black px-12 pt-16 pb-10 w-[210mm] min-h-[285mm] flex flex-col text-[13px] leading-tight print-font relative">

           <div class="relative flex justify-start items-center border-b-[3px] border-black pb-3">
             <img src="/logo-bps-kalteng1.png" alt="Logo BPS" class="absolute -left-12 top-0 w-[190px] h-auto" />
             <div class="text ml-[160px] text relative -left-12"> 
                 <h1 class="text-[20px] text relative left-1 font-bold uppercase tracking-wider -m-1 leading-tight italic" style="font-family: Arial, sans-serif;">BADAN PUSAT STATISTIK</h1>
                 <h2 class="text-[20px] text relative left-1 font-bold uppercase tracking-wider -m-1 leading-tight italic" style="font-family: Arial, sans-serif;">PROVINSI KALIMANTAN TENGAH</h2>
                 <p class="text-[12px] m-0 leading-tight mt-1">Jl. Kapten Piere Tendean No. 6 Palangka Raya 73112</p>
                 <p class="text-[12px] m-0 leading-tight">Telp. (0536) 3228105, Fax.: (0536) 3221380,</p>
                 <p class="text-[12px] m-0 leading-tight">Homepage: https://kalteng.bps.go.id/  E-mail: bps6200@bps.go.id</p>
             </div>
           </div>

           <div class="text-center font-bold text-[15px] underline mb-6 uppercase tracking-wide pt-3">AKUMULASI ANGKA KREDIT</div>
           <div class="flex justify-between mb-2"><div>Instansi<br>Badan Pusat Statistik</div><div class="text-right">Masa Penilaian :<br>{{ printData.masa_penilaian }}</div></div>

           <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
             <tbody>
              <tr><td colspan="3" style="border: 1px solid black; padding: 4px; font-weight: bold; text-align: center; background-color: #e5e7eb;">PEJABAT FUNGSIONAL YANG DINILAI</td></tr>
              <tr><td style="border: 1px solid black; padding: 4px; width: 30px; text-align: center;">1</td><td style="border: 1px solid black; padding: 4px; width: 220px;">N a m a</td><td style="border: 1px solid black; padding: 4px; font-weight: bold;">{{ printData.pegawai.nama }}</td></tr>
              <tr><td style="border: 1px solid black; padding: 4px; text-align: center;">2</td><td style="border: 1px solid black; padding: 4px;">NIP</td><td style="border: 1px solid black; padding: 4px;">{{ printData.pegawai.nip }}</td></tr>
              <tr><td style="border: 1px solid black; padding: 4px; text-align: center;">3</td><td style="border: 1px solid black; padding: 4px;">Nomor Seri KARPEG</td><td style="border: 1px solid black; padding: 4px;">{{ printData.pegawai.karpeg }}</td></tr>
              <tr><td style="border: 1px solid black; padding: 4px; text-align: center;">4</td><td style="border: 1px solid black; padding: 4px;">Tempat dan Tanggal Lahir</td><td style="border: 1px solid black; padding: 4px;">{{ printData.pegawai.ttl }}</td></tr>
              <tr><td style="border: 1px solid black; padding: 4px; text-align: center;">5</td><td style="border: 1px solid black; padding: 4px;">Jenis Kelamin</td><td style="border: 1px solid black; padding: 4px;">{{ printData.pegawai.jk }}</td></tr>
              <tr><td style="border: 1px solid black; padding: 4px; text-align: center;">6</td><td style="border: 1px solid black; padding: 4px;">Pangkat/Golongan Ruang/TMT</td><td style="border: 1px solid black; padding: 4px;">{{ printData.pegawai.pangkat }} / 1 April 2024</td></tr>
              <tr><td style="border: 1px solid black; padding: 4px; text-align: center;">7</td><td style="border: 1px solid black; padding: 4px;">Jabatan Fungsional/TMT</td><td style="border: 1px solid black; padding: 4px;">{{ printData.pegawai.jabatan }}</td></tr>
              <tr><td style="border: 1px solid black; padding: 4px; text-align: center;">8</td><td style="border: 1px solid black; padding: 4px;">Unit Kerja</td><td style="border: 1px solid black; padding: 4px;">{{ printData.pegawai.unit_kerja }}</td></tr>
              <tr><td style="border: 1px solid black; padding: 4px; text-align: center;">9</td><td style="border: 1px solid black; padding: 4px;">Instansi</td><td style="border: 1px solid black; padding: 4px;">Badan Pusat Statistik</td></tr>
             </tbody>
           </table>

           <div class="text-center font-bold mb-1 uppercase">HASIL PENILAIAN ANGKA KREDIT</div>
           
           <table style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 40px; font-size: 11px;">
             <thead>
              <tr style="background-color: #e5e7eb;">
                <td colspan="4" style="border: 1px solid black; padding: 6px; font-weight: bold;">HASIL PENILAIAN KINERJA</td>
                <td rowspan="2" style="border: 1px solid black; padding: 6px; font-weight: bold; width: 100px;">KOEFISIEN PER TAHUN</td>
                <td rowspan="2" style="border: 1px solid black; padding: 6px; font-weight: bold; width: 120px;">ANGKA KREDIT YANG DIDAPAT</td>
              </tr>
              <tr style="background-color: #e5e7eb;">
                <td style="border: 1px solid black; padding: 6px; font-weight: bold; width: 60px;">TAHUN</td>
                <td style="border: 1px solid black; padding: 6px; font-weight: bold; width: 80px;">PERIODIK (BULAN)</td>
                <td style="border: 1px solid black; padding: 6px; font-weight: bold;">PREDIKAT</td>
                <td style="border: 1px solid black; padding: 6px; font-weight: bold; width: 80px;">PRESENTASE</td>
              </tr>
              <tr style="background-color: #f3f4f6;">
                <td style="border: 1px solid black; padding: 2px;">1</td>
                <td style="border: 1px solid black; padding: 2px;">2</td>
                <td style="border: 1px solid black; padding: 2px;">3</td>
                <td style="border: 1px solid black; padding: 2px;">4</td>
                <td style="border: 1px solid black; padding: 2px;">5</td>
                <td style="border: 1px solid black; padding: 2px;">6</td>
              </tr>
             </thead>
             <tbody>
              <tr v-for="rw in printData.riwayat" :key="rw.id">
                <td style="border: 1px solid black; padding: 6px; font-weight: bold;">{{ rw.tahun }}</td>
                <td style="border: 1px solid black; padding: 6px;">{{ rw.sumber !== 'Migrasi Data Lama' ? rw.bulan : '-' }}</td>
                <td style="border: 1px solid black; padding: 6px;">{{ rw.sumber !== 'Migrasi Data Lama' ? rw.predikat : '-' }}</td>
                <td style="border: 1px solid black; padding: 6px;">{{ rw.sumber !== 'Migrasi Data Lama' ? rw.persen + '%' : '-' }}</td>
                <td style="border: 1px solid black; padding: 6px;">{{ rw.sumber !== 'Migrasi Data Lama' ? rw.koef_tahun : '-' }}</td>
                <td style="border: 1px solid black; padding: 6px; font-weight: bold;">{{ parseFloat(rw.ak_didapat).toFixed(3) }}</td>
              </tr>
              <tr style="background-color: #e5e7eb; font-weight: bold;">
                 <td colspan="5" style="border: 1px solid black; padding: 8px; text-align: right; padding-right: 15px;">JUMLAH ANGKA KREDIT YANG DIPEROLEH</td>
                 <td style="border: 1px solid black; padding: 8px; font-size: 13px;">{{ parseFloat(printData.total_ak).toFixed(3) }}</td>
              </tr>
             </tbody>
           </table>
           
           <div class="flex justify-end -mt-9 mb-8">
             <div class="w-60">
               <div class="flex justify-start">
                 <span class="text-left w-28">Ditetapkan di</span>
                 <span>: Palangka Raya</span>
               </div>
               <div class="flex justify-start mb-8">
                 <span class="text-left w-28">Pada tanggal</span>
                 <span>: {{ printData.tanggal_ttd }}</span>
               </div>
               <div class="text-justify pr-10">
                 <p class="mb-20">Pejabat Penilai Kinerja</p>
                 <p class="font-bold underline">Agnes Widiastuti</p>
               </div>
             </div>
           </div>

           <div style="margin-top: auto; padding-top: 20px; border-top: 1px solid black; position: relative;">
              
              <img src="/balai.png" style="position: absolute; right: 0; top: 6px; width: 60px; height: auto;" />
           </div>
        </div>
      </div>
    </div>

    <div v-if="showModalPrintPAK" class="fixed inset-0 bg-black/70 flex justify-center z-50 p-4 overflow-y-auto">
      <div class="shadow-2xl relative mt-4 mb-10">
        <div class="absolute top-0 right-[-140px] flex flex-col gap-2 no-print">
          <button @click="unduhPDF('print-area-pak')" class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-bold"><span v-if="isGeneratingPDF">⏳</span><span v-else>🖨️</span> Cetak PDF</button>
          <button @click="showModalPrintPAK = false" class="bg-gray-600 text-white px-4 py-2 rounded shadow hover:bg-gray-700 font-bold">Tutup</button>
        </div>
        
        <div id="print-area-pak" class="bg-white text-black px-12 pt-6 pb-14 w-[210mm] min-h-[295mm] overflow-hidden flex flex-col text-[13px] leading-tight print-font border-box relative">

           <div class="relative flex justify-start items-center border-b-[3px] border-black pb-3">
             <img src="/logo-bps-kalteng1.png" alt="Logo BPS" class="absolute -left-12 top-0 w-[210px] h-auto" />
             <div class="text ml-[160px] text relative -left-12"> 
                 <h1 class="text-[20px] text relative left-1 font-bold uppercase tracking-wider -m-1 leading-tight italic" style="font-family: Arial, sans-serif;">BADAN PUSAT STATISTIK</h1>
                 <h2 class="text-[20px] text relative left-1 font-bold uppercase tracking-wider -m-1 leading-tight italic" style="font-family: Arial, sans-serif;">PROVINSI KALIMANTAN TENGAH</h2>
                 <p class="text-[12px] m-0 leading-tight mt-1">Jl. Kapten Piere Tendean No. 6 Palangka Raya 73112</p>
                 <p class="text-[12px] m-0 leading-tight">Telp. (0536) 3228105, Fax.: (0536) 3221380,</p>
                 <p class="text-[12px] m-0 leading-tight">Homepage: https://kalteng.bps.go.id/  E-mail: bps6200@bps.go.id</p>
             </div>
           </div>

           <div class="text-center font-bold text-[15px] underline uppercase mb-1 mt-4">PENETAPAN ANGKA KREDIT</div>
           <div class="text-center mb-4 font-semibold tracking-wider">NOMOR: 62000.0065/Konv/{{ printData.kode_jf }}/{{ new Date().getFullYear() }}</div>
           
           <div class="flex justify-between mb-2"><div>Instansi<br>Badan Pusat Statistik</div><div class="text-right">Masa Penilaian :<br>{{ printData.masa_penilaian }}</div></div>

           <table class="w-full border-collapse border border-black mb-4">
             <tbody>
              <tr><td class="border border-black font-bold px-2 text-center w-6 bg-gray-100">I</td><td colspan="3" class="border border-black font-bold px-2 uppercase tracking-wider bg-gray-100">KETERANGAN PERORANGAN</td></tr>
              <tr><td class="border border-black px-2 text-center">1</td><td class="border border-black px-2 w-56">N a m a</td><td class="border border-black px-2 font-bold">{{ printData.pegawai.nama }}</td></tr>
              <tr><td class="border border-black px-2 text-center">2</td><td class="border border-black px-2">NIP</td><td class="border border-black px-2">{{ printData.pegawai.nip }}</td></tr>
              <tr><td class="border border-black px-2 text-center">3</td><td class="border border-black px-2">Nomor Seri KARPEG</td><td class="border border-black px-2">{{ printData.pegawai.karpeg }}</td></tr>
              <tr><td class="border border-black px-2 text-center">4</td><td class="border border-black px-2">Tempat dan Tanggal Lahir</td><td class="border border-black px-2">{{ printData.pegawai.ttl }}</td></tr>
              <tr><td class="border border-black px-2 text-center">5</td><td class="border border-black px-2">Jenis Kelamin</td><td class="border border-black px-2">{{ printData.pegawai.jk }}</td></tr>
              <tr><td class="border border-black px-2 text-center">6</td><td class="border border-black px-2">Pangkat/Golongan Ruang/TMT</td><td class="border border-black px-2">{{ printData.pegawai.pangkat }}</td></tr>
              <tr><td class="border border-black px-2 text-center">7</td><td class="border border-black px-2">Jabatan Fungsional/TMT</td><td class="border border-black px-2">{{ printData.pegawai.jabatan }}</td></tr>
              <tr><td class="border border-black px-2 text-center">8</td><td class="border border-black px-2">Unit Kerja</td><td class="border border-black px-2">{{ printData.pegawai.unit_kerja }}</td></tr>
              <tr><td class="border border-black px-2 text-center">9</td><td class="border border-black px-2">Instansi</td><td class="border border-black px-2">Badan Pusat Statistik</td></tr>
             </tbody>
           </table>

           <div class="text-center font-bold mb-1 uppercase tracking-wider">HASIL PENILAIAN ANGKA KREDIT</div>

           <table class="w-full border-collapse border border-black mb-4">
             <tbody>
              <tr class="font-bold text-center bg-gray-100">
                 <td class="border border-black px-2 w-6">II</td><td class="border border-black px-2 text-left">PENETAPAN ANGKA KREDIT</td>
                 <td class="border border-black w-16">LAMA</td><td class="border border-black w-16">BARU</td><td class="border border-black w-16">JUMLAH</td><td class="border border-black w-12">KET.</td>
              </tr>
              <tr><td class="border border-black text-center">1</td><td class="border border-black px-2">AK Dasar yang diberikan</td><td class="border border-black text-center">-</td><td class="border border-black text-center">-</td><td class="border border-black text-center">-</td><td class="border border-black text-center">-</td></tr>
              <tr><td class="border border-black text-center">2</td><td class="border border-black px-2">AK JF Lama</td><td class="border border-black text-center">-</td><td class="border border-black text-center">-</td><td class="border border-black text-center">-</td><td class="border border-black text-center">-</td></tr>
              <tr><td class="border border-black text-center">3</td><td class="border border-black px-2">AK Penyesuaian/Penyetaraan</td><td class="border border-black text-center">-</td><td class="border border-black text-center">-</td><td class="border border-black text-center">-</td><td class="border border-black text-center">-</td></tr>
              <tr><td class="border border-black text-center">4</td><td class="border border-black px-2">AK Konversi</td><td class="border border-black text-center">-</td><td class="border border-black text-center font-bold">{{ parseFloat(printData.total_ak).toFixed(3) }}</td><td class="border border-black text-center font-bold">{{ parseFloat(printData.total_ak).toFixed(3) }}</td><td class="border border-black text-center">-</td></tr>
              <tr><td class="border border-black text-center">5</td><td class="border border-black px-2">AK yang diperoleh dari Peningkatan Pendidikan</td><td class="border border-black text-center">-</td><td class="border border-black text-center">-</td><td class="border border-black text-center">-</td><td class="border border-black text-center">-</td></tr>
              <tr><td class="border border-black text-center">6</td><td class="border border-black px-2">....**)</td><td class="border border-black text-center">-</td><td class="border border-black text-center">-</td><td class="border border-black text-center">-</td><td class="border border-black text-center">-</td></tr>
              <tr class="font-bold bg-gray-100">
                 <td colspan="2" class="border border-black px-2 text-right pr-4">JUMLAH ANGKA KREDIT KUMULATIF</td><td class="border border-black text-center">-</td>
                 <td class="border border-black text-center">{{ parseFloat(printData.total_ak).toFixed(3) }}</td><td class="border border-black text-center">{{ parseFloat(printData.total_ak).toFixed(3) }}</td><td class="border border-black text-center">-</td>
              </tr>
             </tbody>
           </table>
           
           <table class="w-full border-collapse border border-black text-center mb-6">
             <tbody>
              <tr class="font-bold bg-gray-100"><td class="border border-black px-2 text-left">Keterangan</td><td class="border border-black w-24">Pangkat</td><td class="border border-black w-32">Jenjang Jabatan</td></tr>
              <tr><td class="border border-black px-2 text-left">Angka Kredit minimal yang harus dicapai</td><td class="border border-black">{{ printData.analisis.targetPangkat }}</td><td class="border border-black">{{ printData.analisis.targetJenjang }}</td></tr>
              <tr><td class="border border-black px-2 text-left font-bold text-green-700">Kekurangan Angka Kredit yang harus dicapai</td><td class="border border-black font-bold text-green-700">0</td><td class="border border-black font-bold" :class="printData.analisis.kurangJenjang == 0 ? 'text-green-700' : 'text-red-700'">{{ printData.analisis.kurangJenjang == 0 ? '0' : printData.analisis.kurangJenjang }}</td></tr>
             </tbody>
           </table>

           <div class="mb-2 flex text-justify border border-black p-3">
              <span class="font-bold mr-2">III.</span>
              <span>Dapat dipertimbangkan untuk dinaikkan pangkatnya setingkat lebih tinggi.</span>
           </div>

           <div class="flex justify-between items-end mt-2 mb-10">
             <div class="text-[11px]">
                <p class="font-bold mb-1">ASLI Penetapan Angka Kredit untuk:</p>
                <p>1. Sdr. {{ printData.pegawai.nama }}</p>
                <p>2. Sekretariat Tim Penilai Kinerja BPS Prov. Kalteng</p>
                <p>3. Kepala Biro Sumber Daya Manusia</p>
             </div>
             <div class="w-64 text-center">
               <div class="flex justify-between"><span class="text-left w-24">Ditetapkan di</span><span>: Palangka Raya</span></div>
               <div class="flex justify-between mb-8"><span class="text-left w-24">Pada tanggal</span><span>: {{ printData.tanggal_ttd }}</span></div>
               <p class="mb-20 font-bold">Pejabat yang Berwenang Menetapkan Angka Kredit</p>
               <p class="font-bold underline">Agnes Widiastuti</p>
             </div>
           </div>

           <div class="w-full border-t border-black pt-2 flex justify-end mt-auto">
              <img src="/balai.png" alt="Balai" class="w-[60px] h-auto" />
           </div>

        </div> </div> </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,600;0,700;1,400&display=swap');

.print-font { font-family: 'Roboto', sans-serif !important; }

.animate-fade-in { animation: fadeIn 0.3s ease-out; }
.animate-scale-in { animation: scaleIn 0.2s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

/* GAYA KHUSUS SAAT PRINT/SAVE PDF */
@media print {
  @page {
    size: A4 portrait;
    margin: 0 !important; 
  }
  
  ::-webkit-scrollbar {
    display: none !important;
  }

  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background-color: white !important;
  }
}
</style>