<script setup>
import { ref, computed, watch } from 'vue'
import { usePegawaiStore } from '~/stores/usePegawaiStore'
import { useCookie } from '#app'
import { onMounted } from 'vue'

// =====================================================================
// 1. MASTER DATA & HELPER FUNGSI
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

// Helper untuk menebak Ibu Kota Kabupaten
const getIbukota = (unitKerja) => {
  const u = unitKerja.toLowerCase();
  if(u.includes('provinsi') || u.includes('palangka raya') || u.includes('kalteng')) return 'Palangka Raya';
  if(u.includes('kapuas')) return 'Kuala Kapuas';
  if(u.includes('kotawaringin timur') || u.includes('kotim')) return 'Sampit';
  if(u.includes('kotawaringin barat') || u.includes('kobar')) return 'Pangkalan Bun';
  if(u.includes('katingan')) return 'Kasongan';
  if(u.includes('seruyan')) return 'Kuala Pembuang';
  if(u.includes('sukamara')) return 'Sukamara';
  if(u.includes('lamandau')) return 'Nanga Bulik';
  if(u.includes('gunung mas')) return 'Kuala Kurun';
  if(u.includes('pulang pisau')) return 'Pulang Pisau';
  if(u.includes('barito selatan')) return 'Buntok';
  if(u.includes('barito timur')) return 'Tamiang Layang';
  if(u.includes('barito utara')) return 'Muara Teweh';
  if(u.includes('murung raya')) return 'Puruk Cahu';
  return 'Palangka Raya';
}

// Helper formatting instansi panjang & Anti Singkatan (Sesuai Arahan)
const formatKopSurat = (unitKerja) => {
  let u = unitKerja.toUpperCase();
  u = u.replace(/BPS/g, '').trim(); // Hapus BPS karena di baris pertama sudah ada
  u = u.replace(/KAB\./g, 'KABUPATEN');
  u = u.replace(/PROV\./g, 'PROVINSI');
  u = u.replace(/KALTENG/g, 'KALIMANTAN TENGAH');
  return u;
}
const formatUnitKerja = (unitKerja) => {
  let u = unitKerja;
  u = u.replace(/BPS/i, 'Badan Pusat Statistik');
  u = u.replace(/Kab\./i, 'Kabupaten');
  u = u.replace(/Prov\./i, 'Provinsi');
  u = u.replace(/Kalteng/i, 'Kalimantan Tengah');
  return u;
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
// 2. DATA DARI PINIA & ROLE
// =====================================================================
const store = usePegawaiStore()
const userSesi = useCookie('userProfile', { default: () => ({ role: 'Admin', unit_kerja: '', nip: '' }) })

const basePegawaiList = computed(() => {
  let list = store.pegawaiList
  if (userSesi.value.role === 'Pegawai') {
    list = list.filter(p => p.nip === userSesi.value.nip)
  } else if (userSesi.value.role === 'Supervisor Kabko' || userSesi.value.role === 'Operator') {
    list = list.filter(p => p.unit_kerja === userSesi.value.unit_kerja)
  }
  return list
})

// =====================================================================
// 3. PENCARIAN & PAGINATION (FIXED)
// =====================================================================
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

watch(searchQuery, () => { 
  currentPage.value = 1 
})

const filteredPegawai = computed(() => {
  const query = searchQuery.value.toLowerCase()

  // Gunakan basePegawaiList (yang sudah difilter berdasarkan Role)
  return basePegawaiList.value.filter(p => {
    // Mapping properti agar fleksibel dengan berbagai format API
    const nama = (p.nama_lengkap || p.nama || '').toLowerCase()
    const nipBaru = (p.nip_baru || p.nip || '')
    const nipLama = (p.nip_lama || '')

    return nama.includes(query) || 
           nipBaru.includes(query) || 
           nipLama.includes(query)
  })
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

// Data diurutkan Ascending (Tahun terlama di atas) khusus untuk cetakan Akumulasi/PAK
const riwayatCetakAscending = computed(() => {
  return [...riwayatAK.value].sort((a, b) => {
    if (a.tahun !== b.tahun) return a.tahun - b.tahun
    const endA = a.bulan_selesai || 12
    const endB = b.bulan_selesai || 12
    return endA - endB
  })
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

// =====================================================================
// 5. MODAL KALKULATOR SKP
// =====================================================================
const showModalKalkulator = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const formKalkulasi = ref({ tahun: new Date().getFullYear(), bulan_mulai: 1, bulan_selesai: 12, jabatan: 'Ahli Muda', predikat: 'Baik', sumber: 'Konversi SKP' })

const durasiBulan = computed(() => {
  const start = parseInt(formKalkulasi.value.bulan_mulai)
  const end = parseInt(formKalkulasi.value.bulan_selesai)
  return end >= start ? (end - start + 1) : 0
})

const hasilKalkulasi = computed(() => {
  // Jika sumbernya manual/2022, biarkan nilainya diketik admin
  if(formKalkulasi.value.sumber === 'Migrasi Data Lama') return formKalkulasi.value.ak_didapat || 0;

  const selectedJabatan = kamusJabatan.find(j => j.nama === formKalkulasi.value.jabatan)
  const selectedPredikat = kamusPredikat.find(p => p.nama === formKalkulasi.value.predikat)
  if (!selectedJabatan || !selectedPredikat || durasiBulan.value <= 0) return 0
  return ((durasiBulan.value / 12) * selectedJabatan.koef_tahun * selectedPredikat.persen).toFixed(3)
})

const bukaModalTambah = () => {
  isEditing.value = false; editingId.value = null
  formKalkulasi.value = { tahun: new Date().getFullYear(), bulan_mulai: 1, bulan_selesai: 12, jabatan: selectedPegawai.value?.jabatan.includes('Muda') ? 'Ahli Muda' : 'Ahli Pertama', predikat: 'Baik', sumber: 'Konversi SKP', ak_didapat: 0 }
  showModalKalkulator.value = true
}

const bukaModalEdit = (item) => {
  isEditing.value = true; editingId.value = item.id
  formKalkulasi.value = { 
    tahun: item.tahun, 
    bulan_mulai: item.bulan_mulai || 1, 
    bulan_selesai: item.bulan_selesai || item.bulan, 
    jabatan: item.jabatan, 
    predikat: item.predikat,
    sumber: item.sumber,
    ak_didapat: item.ak_didapat
  }
  showModalKalkulator.value = true
}

const simpanKalkulasi = () => {
  if (durasiBulan.value <= 0 && formKalkulasi.value.sumber !== 'Migrasi Data Lama') { 
     alert("Bulan Selesai harus lebih besar atau sama dengan Bulan Mulai!"); return; 
  }
  const dataBaru = { 
    id: isEditing.value ? editingId.value : Date.now(), 
    pegawai_id: selectedPegawai.value.id,
    tahun: formKalkulasi.value.tahun, 
    bulan_mulai: parseInt(formKalkulasi.value.bulan_mulai),
    bulan_selesai: parseInt(formKalkulasi.value.bulan_selesai),
    bulan: durasiBulan.value,
    jabatan: formKalkulasi.value.jabatan, 
    predikat: formKalkulasi.value.predikat, 
    ak_didapat: parseFloat(hasilKalkulasi.value), 
    sumber: formKalkulasi.value.tahun === 2022 ? 'Migrasi Data Lama' : formKalkulasi.value.sumber
  }
  store.simpanRiwayat(dataBaru, isEditing.value)
  showModalKalkulator.value = false
}

const hapusItem = (id) => { 
  if (confirm("Hapus data ini?")) { store.hapusRiwayat(id, selectedPegawai.value.id) } 
}

// =====================================================================
// 6. SETUP MODAL CETAK (INPUT MANUAL & TTD)
// =====================================================================
const showPrintSetupModal = ref(false)
const showModalPrintKonversi = ref(false)
const showModalPrintAkumulasi = ref(false)
const showModalPrintPAK = ref(false)
const showModalStatus = ref(false)
const printData = ref(null)
const formStatus = ref({ status: '', catatan: '' })

// Dictionary Keterangan Dapat Dipertimbangkan PAK
const kamusRekomendasi = [
  "Dapat dipertimbangkan untuk dinaikkan pangkatnya setingkat lebih tinggi.",
  "Dapat dipertimbangkan untuk diangkat dalam jabatan fungsional setingkat lebih tinggi.",
  "Dapat dipertimbangkan untuk mengikuti Uji Kompetensi Kenaikan Jenjang.",
  "Belum dapat dipertimbangkan untuk kenaikan pangkat maupun jabatan."
]

// State Form Cetak Khusus
const formCetak = ref({
  jenis: '', 
  item_id: null,
  ditetapkan_di: '',
  tanggal_ttd: formatTanggal(new Date()),
  nomor_surat: '',
  rekomendasi_pak: kamusRekomendasi[0]
})

const openPrintModal = (jenis, item = null) => {
  formCetak.value.jenis = jenis;
  formCetak.value.item_id = item ? item.id : null;
  formCetak.value.ditetapkan_di = getIbukota(selectedPegawai.value.unit_kerja); // Deteksi Ibukota Otomatis
  formCetak.value.tanggal_ttd = formatTanggal(new Date());
  formCetak.value.nomor_surat = '';
  formCetak.value.rekomendasi_pak = kamusRekomendasi[0];
  showPrintSetupModal.value = true;
}

const eksekusiCetak = () => {
  showPrintSetupModal.value = false;
  if (formCetak.value.jenis === 'konversi') {
     const item = riwayatAK.value.find(x => x.id === formCetak.value.item_id);
     cetakLaporanTahunan(item);
  } else if (formCetak.value.jenis === 'akumulasi') {
     cetakAkumulasi();
  } else if (formCetak.value.jenis === 'pak') {
     cetakFormPAK();
  }
}

// =====================================================================
// 7. GENERATOR DATA DOKUMEN
// =====================================================================
const cetakLaporanTahunan = (item) => {
  const jabatanLower = selectedPegawai.value.jabatan.toLowerCase()
  const jabInfo = kamusJabatan.find(j => item.jabatan.toLowerCase().includes(j.keyword)) || kamusJabatan.find(j => jabatanLower.includes(j.keyword))
  const predInfo = kamusPredikat.find(p => p.nama === item.predikat)
  
  const start = item.bulan_mulai || 1
  const end = item.bulan_selesai || 12
  const masaPenilaian = start === end ? `${getNamaBulan(end)} ${item.tahun}` : `${getNamaBulan(start)} s.d ${getNamaBulan(end)} ${item.tahun}`

  printData.value = { 
    ...item, 
    pegawai: selectedPegawai.value, 
    koef_tahun: jabInfo ? jabInfo.koef_tahun : 0, 
    persen: predInfo ? (predInfo.persen * 100) : 0, 
    kode_jf: getKodeJF(selectedPegawai.value.jabatan),
    masa_penilaian: masaPenilaian, 
    ditetapkan_di: formCetak.value.ditetapkan_di,
    tanggal_ttd: formCetak.value.tanggal_ttd
  }
  showModalPrintKonversi.value = true
}

const siapkanDataAkumulasi = () => {
  const riwayatLengkap = riwayatCetakAscending.value.map(item => {
     const jabInfo = kamusJabatan.find(j => item.jabatan.toLowerCase().includes(j.keyword))
     const predInfo = kamusPredikat.find(p => p.nama === item.predikat)
     return { ...item, koef_tahun: jabInfo ? jabInfo.koef_tahun : 0, persen: predInfo ? (predInfo.persen * 100) : 0 }
  })
  
  let latestItem = null
  if (riwayatAK.value.length > 0) {
    const sortedDesc = [...riwayatAK.value].sort((a, b) => {
       if (b.tahun !== a.tahun) return b.tahun - a.tahun 
       const endA = a.bulan_selesai || 12; const endB = b.bulan_selesai || 12;
       return endB - endA 
    })
    latestItem = sortedDesc[0]
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
    ditetapkan_di: formCetak.value.ditetapkan_di,
    tanggal_ttd: formCetak.value.tanggal_ttd,
    nomor_surat: formCetak.value.nomor_surat,
    rekomendasi_pak: formCetak.value.rekomendasi_pak
  }
}

const cetakAkumulasi = () => { printData.value = siapkanDataAkumulasi(); showModalPrintAkumulasi.value = true }
const cetakFormPAK = () => { printData.value = siapkanDataAkumulasi(); showModalPrintPAK.value = true }

// FUNGSI PRINT BROWSER BAWAAN
const unduhPDF = (elementId) => {
  const originalElement = document.getElementById(elementId);
  if (!originalElement) return;

  const originalBodyChildren = Array.from(document.body.children);
  originalBodyChildren.forEach(child => {
    if (child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
      child.setAttribute('data-original-display', child.style.display); child.style.display = 'none'; 
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
  clonedContent.style.boxShadow = 'none'; clonedContent.style.margin = '0';
  
  printContainer.appendChild(clonedContent); document.body.appendChild(printContainer);

  setTimeout(() => {
    window.print();
    document.body.removeChild(printContainer);
    originalBodyChildren.forEach(child => {
      if (child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') { child.style.display = child.getAttribute('data-original-display') || ''; }
    });
  }, 150);
}

const updateStatusPegawai = () => { store.updateStatusPegawai(selectedPegawai.value.id, formStatus.value.status); showModalStatus.value = false; formStatus.value.status = '' }

onMounted(() => {
  store.loadFromStorage()
})
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
              <td class="px-6 py-4"><div class="font-bold text-gray-900">{{ peg.nama_lengkap || peg.nama }}</div><div class="text-xs text-gray-500 mt-0.5">{{ peg.nip_baru || peg.nip }}</div></td>
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
            <h3 class="text-xl font-bold text-gray-800">{{ selectedPegawai.nama_lengkap || selectedPegawai.nama }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ selectedPegawai.nip_baru || selectedPegawai.nip }} | {{ formatUnitKerja(selectedPegawai.unit_kerja) }}</p>
            <div class="flex items-center gap-3 mt-3 text-sm">
              <span class="bg-blue-50 text-bps-dark px-2.5 py-1 rounded-md font-medium border border-blue-100">{{ selectedPegawai.jabatan }}</span>
              <span class="bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md font-medium border border-gray-200">{{ selectedPegawai.pangkat }}</span>
              <span :class="`px-2.5 py-1 rounded-md font-bold border ${analisisKelayakan.warna}`">{{ analisisKelayakan.pesan }}</span>
            </div>
          </div>
          
          <div class="flex flex-col gap-2 w-full md:w-auto">
             <button v-if="['Admin', 'Supervisor Prov'].includes(userSesi.role)" @click="showModalStatus = true" class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow">⚙️ Update Status</button>
             <button v-if="['Admin', 'Supervisor Prov', 'Supervisor Kabko'].includes(userSesi.role)" @click="openPrintModal('akumulasi')" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow">📄 Cetak Akumulasi AK</button>
             <button v-if="['Admin', 'Supervisor Prov', 'Supervisor Kabko'].includes(userSesi.role)" @click="openPrintModal('pak')" class="px-4 py-2 bg-bps-blue hover:bg-bps-dark text-white rounded-lg text-sm font-bold shadow flex justify-center">🖨️ Cetak Form PAK</button>
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
          <button v-if="userSesi.role !== 'Pegawai'" @click="bukaModalTambah" class="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-4 rounded-lg">+ Kalkulasi SKP Baru</button>
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
                  <span v-else class="text-gray-400 font-bold">Data Integrasi 2022</span>
                </td>
                <td class="px-6 py-4">{{ item.jabatan }}</td>
                <td class="px-6 py-4 text-center"><span v-if="item.predikat !== '-'" class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">{{ item.predikat }}</span><span v-else class="text-gray-400">-</span></td>
                <td class="px-6 py-4 text-right font-bold text-bps-blue text-base">+{{ parseFloat(item.ak_didapat).toFixed(3) }}</td>
                <td class="px-6 py-4 text-center flex items-center justify-center gap-2">
                   <button v-if="item.sumber !== 'Migrasi Data Lama' && ['Admin', 'Supervisor Prov', 'Supervisor Kabko'].includes(userSesi.role)" @click="openPrintModal('konversi', item)" class="bg-gray-100 text-gray-600 px-3 py-1.5 rounded hover:bg-blue-50 border text-xs font-bold">📄 PDF Konversi</button>
                   <div v-if="userSesi.role !== 'Pegawai'" class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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

    <div v-if="showPrintSetupModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 no-print">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
        <div class="bg-blue-700 px-6 py-4 flex justify-between items-center text-white">
          <h3 class="font-bold text-lg">📝 Setup Dokumen Cetak</h3>
          <button @click="showPrintSetupModal = false" class="text-white hover:text-gray-200 text-2xl leading-none">&times;</button>
        </div>
        <div class="p-6 space-y-4">
          <div class="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 mb-4">
            Lengkapi atribut surat di bawah ini sebelum dokumen dicetak. Kolom telah diisi otomatis berdasarkan data pegawai.
          </div>
          
          <div v-if="formCetak.jenis === 'pak'">
            <label class="block text-sm font-bold text-gray-700 mb-1">Nomor Surat PAK</label>
            <input v-model="formCetak.nomor_surat" type="text" class="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-bps-blue bg-white" placeholder="Ketik nomor surat manual...">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Ditetapkan Di</label>
              <input v-model="formCetak.ditetapkan_di" type="text" class="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-bps-blue bg-white">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Tanggal TTD</label>
              <input v-model="formCetak.tanggal_ttd" type="text" class="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-bps-blue bg-white">
            </div>
          </div>

          <div v-if="formCetak.jenis === 'pak'">
            <label class="block text-sm font-bold text-gray-700 mb-1">Rekomendasi (Keterangan PAK)</label>
            <select v-model="formCetak.rekomendasi_pak" class="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-bps-blue bg-white">
              <option v-for="rek in kamusRekomendasi" :key="rek" :value="rek">{{ rek }}</option>
            </select>
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button @click="showPrintSetupModal = false" class="px-5 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition-colors">Batal</button>
          <button @click="eksekusiCetak" class="px-5 py-2 bg-bps-blue text-white font-bold rounded-lg shadow-md hover:bg-blue-800 transition-colors flex items-center gap-2">
            🖨️ Generate Dokumen
          </button>
        </div>
      </div>
    </div>

    <div v-if="showModalKalkulator" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 no-print">
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
                  <option value="1">Januari</option><option value="2">Februari</option><option value="3">Maret</option><option value="4">April</option><option value="5">Mei</option><option value="6">Juni</option><option value="7">Juli</option><option value="8">Agustus</option><option value="9">September</option><option value="10">Oktober</option><option value="11">November</option><option value="12">Desember</option>
               </select>
             </div>
             <div>
               <label class="block text-xs font-bold mb-1">Bulan Selesai</label>
               <select v-model="formKalkulasi.bulan_selesai" class="w-full p-2 border rounded bg-white outline-none focus:border-bps-blue">
                  <option value="1">Januari</option><option value="2">Februari</option><option value="3">Maret</option><option value="4">April</option><option value="5">Mei</option><option value="6">Juni</option><option value="7">Juli</option><option value="8">Agustus</option><option value="9">September</option><option value="10">Oktober</option><option value="11">November</option><option value="12">Desember</option>
               </select>
             </div>
          </div>
          <div><label class="block text-xs font-bold mb-1">Jabatan Saat Evaluasi</label><select v-model="formKalkulasi.jabatan" class="w-full p-2 border rounded bg-white outline-none focus:border-bps-blue"><option v-for="j in kamusJabatan" :value="j.nama">{{ j.nama }} (Koefisien: {{ j.koef_tahun }})</option></select></div>
          
          <div class="grid grid-cols-2 gap-4">
             <div><label class="block text-xs font-bold mb-1">Predikat Kinerja</label><select v-model="formKalkulasi.predikat" class="w-full p-2 border rounded bg-white outline-none focus:border-bps-blue"><option v-for="p in kamusPredikat" :value="p.nama">{{ p.nama }} ({{ p.persen * 100 }}%)</option></select></div>
             <div>
                <label class="block text-xs font-bold mb-1">Sumber Dokumen</label>
                <select v-model="formKalkulasi.sumber" class="w-full p-2 border rounded bg-white outline-none focus:border-bps-blue">
                   <option value="Konversi SKP">Konversi SKP</option>
                   <option value="Migrasi Data Lama">Migrasi / Integrasi</option>
                </select>
             </div>
          </div>

          <div class="p-4 bg-blue-50 border rounded text-center flex flex-col items-center justify-center">
             <p class="text-xs uppercase font-bold text-blue-600 mb-1">Hasil Konversi Angka Kredit</p>
             <input v-if="formKalkulasi.sumber === 'Migrasi Data Lama'" v-model="formKalkulasi.ak_didapat" type="number" step="0.001" class="text-2xl font-bold text-center border-b-2 border-bps-blue bg-transparent outline-none w-1/2">
             <p v-else class="text-3xl font-extrabold text-bps-blue">{{ hasilKalkulasi }}</p>
             <p class="text-xs text-gray-500 mt-2">Berdasarkan Durasi Penilaian: <strong>{{ durasiBulan }} Bulan</strong></p>
          </div>
        </div>
        <div class="p-4 border-t flex justify-end gap-2 bg-gray-50 rounded-b-2xl">
          <button @click="showModalKalkulator = false" class="px-5 py-2 text-gray-600 font-semibold rounded hover:bg-gray-200">Batal</button>
          <button @click="simpanKalkulasi" class="px-5 py-2 bg-bps-blue text-white rounded font-bold hover:bg-bps-dark">Simpan Kalkulasi</button>
        </div>
      </div>
    </div>

    <div v-if="showModalStatus" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-print">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 class="text-lg font-bold mb-4">Update Status Kepegawaian</h3>
        <select v-model="formStatus.status" class="w-full border rounded p-2 mb-4 outline-none focus:border-bps-blue">
           <option value="Aktif">Aktif</option><option value="Sedang Ukom">Sedang Ukom</option><option value="Lulus Ukom">Lulus Ukom</option><option value="Proses SK">Proses SK</option>
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
        
        <div id="print-area-konversi" class="bg-white text-black px-12 pt-16 pb-10 w-[210mm] min-h-[285mm] flex flex-col text-[13px] leading-tight relative" style="font-family: 'Bookman Old Style', Georgia, serif;">
           
           <div class="flex items-center border-b-[3px] border-black pb-1 mb-4" style="font-family: 'Roboto', sans-serif;">
  
  <div class="flex-shrink-0 -ml-12">
      <img src="/logo-bps-kalteng1.png" alt="Logo BPS" class="-left-2 w-[180px] h-auto" />
  </div>
  
  <div class="flex-1 text-left -ml-10">
      <h1 class="text-[16pt] font-bold uppercase tracking-wider m-0 leading-tight italic">BADAN PUSAT STATISTIK</h1>
      <h2 class="text-[16pt] font-bold uppercase tracking-wider m-0 leading-tight italic">{{ formatKopSurat(printData.pegawai.unit_kerja) }}</h2>
  </div>

           </div>

           <div class="text-center font-bold text-[15px] underline mb-6 uppercase tracking-wide">KONVERSI PREDIKAT KINERJA KE ANGKA KREDIT</div>
           <div class="flex justify-between mb-2"><div>Instansi<br>Badan Pusat Statistik</div><div class="text-right">Masa Penilaian :<br>{{ printData.masa_penilaian }}</div></div>

           <table class="w-full border-collapse border border-black mb-6">
             <tbody>
              <tr><td colspan="3" class="border border-black font-bold text-center py-1 uppercase tracking-wider bg-gray-100">PEJABAT FUNGSIONAL YANG DINILAI</td></tr>
              <tr><td class="border border-black px-2 w-6 text-center">1</td><td class="border border-black px-2 w-56">N a m a</td><td class="border border-black px-2 font-bold">{{ printData.pegawai.nama_lengkap || printData.pegawai.nama }}</td></tr>
              <tr><td class="border border-black px-2 text-center">2</td><td class="border border-black px-2">NIP</td><td class="border border-black px-2">{{ printData.pegawai.nip_baru || printData.pegawai.nip }}</td></tr>
              <tr><td class="border border-black px-2 text-center">3</td><td class="border border-black px-2">Nomor Seri KARPEG</td><td class="border border-black px-2">{{ printData.pegawai.karpeg }}</td></tr>
              <tr><td class="border border-black px-2 text-center">3</td><td class="border border-black px-2">Tempat dan Tanggal Lahir</td><td class="border border-black px-2">{{ printData.pegawai.tempat_lahir }}, {{ printData.pegawai.tanggal_lahir }}</td></tr>
              <tr><td class="border border-black px-2 text-center">5</td><td class="border border-black px-2">Jenis Kelamin</td><td class="border border-black px-2">{{ printData.pegawai.jenis_kelamin || printData.pegawai.jk }}</td></tr>
              <tr><td class="border border-black px-2 text-center">6</td><td class="border border-black px-2">Pangkat/Golongan Ruang/TMT</td><td class="border border-black px-2">{{ printData.pegawai.pangkat }} / 1 April 2024</td></tr>
              <tr><td class="border border-black px-2 text-center">7</td><td class="border border-black px-2">Jabatan Fungsional/TMT</td><td class="border border-black px-2">{{ printData.jabatan }}</td></tr>
              <tr><td class="border border-black px-2 text-center">8</td><td class="border border-black px-2">Unit Kerja</td><td class="border border-black px-2">{{ formatUnitKerja(printData.pegawai.unit_kerja) }}</td></tr>
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
           
           <div class="flex justify-end mt-4 mb-10">
             <div class="w-64">
               <div class="flex justify-between"><span class="text-left w-28">Ditetapkan di</span><span>: {{ printData.ditetapkan_di }}</span></div>
               <div class="flex justify-between mb-8"><span class="text-left w-28">Pada tanggal</span><span>: {{ printData.tanggal_ttd }}</span></div>
               <div class="text-center pr-4">
                 <p class="mb-20">Pejabat Penilai Kinerja</p>
                 <p class="font-bold underline">Agnes Widiastuti</p>
               </div>
             </div>
           </div>

           <div class="w-full border-t border-black pt-2 flex justify-end mt-auto">
              <img src="/balai.png" alt="Balai" class="w-[60px] h-auto" />
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
        
        <div id="print-area-akumulasi" class="bg-white text-black px-12 pt-16 pb-10 w-[210mm] min-h-[285mm] flex flex-col text-[13px] leading-tight relative" style="font-family: 'Bookman Old Style', Georgia, serif;">

           <div class="flex items-center border-b-[3px] border-black pb-1 mb-4" style="font-family: 'Roboto', sans-serif;">
  
  <div class="flex-shrink-0 -ml-12">
      <img src="/logo-bps-kalteng1.png" alt="Logo BPS" class="-left-2 w-[180px] h-auto" />
  </div>
  
  <div class="flex-1 text-left -ml-10">
      <h1 class="text-[16pt] font-bold uppercase tracking-wider m-0 leading-tight italic">BADAN PUSAT STATISTIK</h1>
      <h2 class="text-[16pt] font-bold uppercase tracking-wider m-0 leading-tight italic">{{ formatKopSurat(printData.pegawai.unit_kerja) }}</h2>
  </div>

           </div>

           <div class="text-center font-bold text-[15px] underline mb-6 uppercase tracking-wide">AKUMULASI ANGKA KREDIT</div>
           <div class="flex justify-between mb-2"><div>Instansi<br>Badan Pusat Statistik</div><div class="text-right">Masa Penilaian :<br>{{ printData.masa_penilaian }}</div></div>

           <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11pt;">
             <tbody>
              <tr><td colspan="3" style="border: 1px solid black; padding: 4px; font-weight: bold; text-align: center; background-color: #e5e7eb;">PEJABAT FUNGSIONAL YANG DINILAI</td></tr>
              <tr><td style="border: 1px solid black; padding: 4px; width: 30px; text-align: center;">1</td><td style="border: 1px solid black; padding: 4px; width: 220px;">N a m a</td><td style="border: 1px solid black; padding: 4px; font-weight: bold;">{{ printData.pegawai.nama_lengkap || printData.pegawai.nama }}</td></tr>
              <tr><td style="border: 1px solid black; padding: 4px; text-align: center;">2</td><td style="border: 1px solid black; padding: 4px;">NIP</td><td style="border: 1px solid black; padding: 4px;">{{ printData.pegawai.nip_baru || printData.pegawai.nip }}</td></tr>
              <tr><td style="border: 1px solid black; padding: 4px; text-align: center;">3</td><td style="border: 1px solid black; padding: 4px;">Nomor Seri KARPEG</td><td style="border: 1px solid black; padding: 4px;">{{ printData.pegawai.karpeg }}</td></tr>
              <tr><td style="border: 1px solid black; padding: 4px; text-align: center;">4</td><td style="border: 1px solid black; padding: 4px;">Tempat dan Tanggal Lahir</td><td style="border: 1px solid black; padding: 4px;">{{ printData.pegawai.tempat_lahir }}, {{ printData.pegawai.tanggal_lahir }}</td></tr>
              <tr><td style="border: 1px solid black; padding: 4px; text-align: center;">5</td><td style="border: 1px solid black; padding: 4px;">Jenis Kelamin</td><td style="border: 1px solid black; padding: 4px;">{{ printData.pegawai.jenis_kelamin || printData.pegawai.jk }}</td></tr>
              <tr><td style="border: 1px solid black; padding: 4px; text-align: center;">6</td><td style="border: 1px solid black; padding: 4px;">Pangkat/Golongan Ruang/TMT</td><td style="border: 1px solid black; padding: 4px;">{{ printData.pegawai.pangkat }} / 1 April 2024</td></tr>
              <tr><td style="border: 1px solid black; padding: 4px; text-align: center;">7</td><td style="border: 1px solid black; padding: 4px;">Jabatan Fungsional/TMT</td><td style="border: 1px solid black; padding: 4px;">{{ printData.pegawai.jabatan }}</td></tr>
              <tr><td style="border: 1px solid black; padding: 4px; text-align: center;">8</td><td style="border: 1px solid black; padding: 4px;">Unit Kerja</td><td style="border: 1px solid black; padding: 4px;">{{ formatUnitKerja(printData.pegawai.unit_kerja) }}</td></tr>
              <tr><td style="border: 1px solid black; padding: 4px; text-align: center;">9</td><td style="border: 1px solid black; padding: 4px;">Instansi</td><td style="border: 1px solid black; padding: 4px;">Badan Pusat Statistik</td></tr>
             </tbody>
           </table>

           <div class="text-center font-bold mb-1 uppercase">HASIL PENILAIAN ANGKA KREDIT</div>
           
           <table style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 40px; font-size: 11pt;">
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
                <td style="border: 1px solid black; padding: 6px; font-weight: bold; width: 80px;">PROSENTASE</td>
              </tr>
             </thead>
             <tbody>
              <tr v-for="rw in printData.riwayat" :key="rw.id">
                <td style="border: 1px solid black; padding: 6px; font-weight: bold;">{{ rw.tahun }}</td>
                <template v-if="rw.sumber === 'Migrasi Data Lama'">
                   <td colspan="4" style="border: 1px solid black; padding: 6px; font-weight: bold; text-align: center; color: #4b5563;">
                      Angka Kredit Integrasi / Migrasi
                   </td>
                </template>
                <template v-else>
                   <td style="border: 1px solid black; padding: 6px;">{{ rw.bulan }} Bulan</td>
                   <td style="border: 1px solid black; padding: 6px;">{{ rw.predikat }}</td>
                   <td style="border: 1px solid black; padding: 6px;">{{ rw.persen + '%' }}</td>
                   <td style="border: 1px solid black; padding: 6px;">{{ rw.koef_tahun }}</td>
                </template>
                <td style="border: 1px solid black; padding: 6px; font-weight: bold;">{{ parseFloat(rw.ak_didapat).toFixed(3) }}</td>
              </tr>
              <tr style="background-color: #e5e7eb; font-weight: bold;">
                 <td colspan="5" style="border: 1px solid black; padding: 8px; text-align: right; padding-right: 15px;">JUMLAH ANGKA KREDIT YANG DIPEROLEH</td>
                 <td style="border: 1px solid black; padding: 8px; font-size: 13px;">{{ parseFloat(printData.total_ak).toFixed(3) }}</td>
              </tr>
             </tbody>
           </table>
           
           <div class="flex justify-end mt-4 mb-10">
             <div class="w-64">
               <div class="flex justify-between"><span class="text-left w-28">Ditetapkan di</span><span>: {{ printData.ditetapkan_di }}</span></div>
               <div class="flex justify-between mb-8"><span class="text-left w-28">Pada tanggal</span><span>: {{ printData.tanggal_ttd }}</span></div>
               <div class="text-center pr-4">
                 <p class="mb-20">Pejabat Penilai Kinerja</p>
                 <p class="font-bold underline">Agnes Widiastuti</p>
               </div>
             </div>
           </div>

           <div class="w-full border-t border-black pt-2 flex justify-end mt-auto">
              <img src="/balai.png" alt="Balai" class="w-[60px] h-auto" />
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
        
        <div id="print-area-pak" class="bg-white text-black px-10 pt-8 pb-6 w-[210mm] min-h-[295mm] flex flex-col text-[11px] leading-snug relative" style="font-family: 'Bookman Old Style', Georgia, serif;">

           <div class="flex items-center border-b-[3px] border-black pb-1 mb-4" style="font-family: 'Roboto', sans-serif;">
  
  <div class="flex-shrink-0 -ml-12">
      <img src="/logo-bps-kalteng1.png" alt="Logo BPS" class="-left-2 w-[180px] h-auto" />
  </div>
  
  <div class="flex-1 text-left -ml-10">
      <h1 class="text-[16pt] font-bold uppercase tracking-wider m-0 leading-tight italic">BADAN PUSAT STATISTIK</h1>
      <h2 class="text-[16pt] font-bold uppercase tracking-wider m-0 leading-tight italic">{{ formatKopSurat(printData.pegawai.unit_kerja) }}</h2>
  </div>

</div>
           <div class="text-center font-bold text-[13px] underline uppercase mb-1 mt-2">PENETAPAN ANGKA KREDIT</div>
           <div class="text-center mb-3 font-semibold tracking-wider text-[11px]">
              NOMOR: {{ printData.nomor_surat || '.................................' }}
           </div>
           
           <div class="flex justify-between mb-1 text-[11px]"><div>Instansi<br>Badan Pusat Statistik</div><div class="text-right">Masa Penilaian :<br>{{ printData.masa_penilaian }}</div></div>

           <table style="width: 100%; border-collapse: collapse; border: 1px solid black; font-size: 9.5pt;">
             <tbody>
              
              <tr style="font-weight: bold;">
                  <td style="border: 1px solid black; text-align: center; width: 25px; padding: 3px;">I</td>
                  <td colspan="5" style="border: 1px solid black; padding: 3px 5px;">KETERANGAN PERORANGAN</td>
              </tr>
              <tr>
                  <td style="border: 1px solid black; text-align: center; padding: 3px;"></td>
                  <td style="border: 1px solid black; text-align: center; width: 25px; padding: 3px;">1</td>
                  <td style="border: 1px solid black; padding: 3px 5px; width: 240px;">N a m a</td>
                  <td colspan="3" style="border: 1px solid black; padding: 3px 5px; font-weight: bold;">{{ printData.pegawai.nama_lengkap || printData.pegawai.nama }}</td>
              </tr>
              <tr>
                  <td style="border: 1px solid black; text-align: center; padding: 3px;"></td>
                  <td style="border: 1px solid black; text-align: center; padding: 3px;">2</td>
                  <td style="border: 1px solid black; padding: 3px 5px;">NIP</td>
                  <td colspan="3" style="border: 1px solid black; padding: 3px 5px;">{{ printData.pegawai.nip_baru || printData.pegawai.nip }}</td>
              </tr>
              <tr>
                  <td style="border: 1px solid black; text-align: center; padding: 3px;"></td>
                  <td style="border: 1px solid black; text-align: center; padding: 3px;">3</td>
                  <td style="border: 1px solid black; padding: 3px 5px;">Nomor Seri KARPEG</td>
                  <td colspan="3" style="border: 1px solid black; padding: 3px 5px;">{{ printData.pegawai.karpeg }}</td>
              </tr>
              <tr>
                  <td style="border: 1px solid black; text-align: center; padding: 3px;"></td>
                  <td style="border: 1px solid black; text-align: center; padding: 3px;">4</td>
                  <td style="border: 1px solid black; padding: 3px 5px;">Tempat dan Tanggal Lahir</td>
                  <td colspan="3" style="border: 1px solid black; padding: 3px 5px;">{{ printData.pegawai.tempat_lahir }}, {{ printData.pegawai.tanggal_lahir }}</td>
              </tr>
              <tr>
                  <td style="border: 1px solid black; text-align: center; padding: 3px;"></td>
                  <td style="border: 1px solid black; text-align: center; padding: 3px;">5</td>
                  <td style="border: 1px solid black; padding: 3px 5px;">Jenis Kelamin</td>
                  <td colspan="3" style="border: 1px solid black; padding: 3px 5px;">{{ printData.pegawai.jenis_kelamin || printData.pegawai.jk }}</td>
              </tr>
              <tr>
                  <td style="border: 1px solid black; text-align: center; padding: 3px;"></td>
                  <td style="border: 1px solid black; text-align: center; padding: 3px;">6</td>
                  <td style="border: 1px solid black; padding: 3px 5px;">Pangkat/Golongan Ruang/TMT</td>
                  <td colspan="3" style="border: 1px solid black; padding: 3px 5px;">{{ printData.pegawai.pangkat }}</td>
              </tr>
              <tr>
                  <td style="border: 1px solid black; text-align: center; padding: 3px;"></td>
                  <td style="border: 1px solid black; text-align: center; padding: 3px;">7</td>
                  <td style="border: 1px solid black; padding: 3px 5px;">Jabatan Fungsional/TMT</td>
                  <td colspan="3" style="border: 1px solid black; padding: 3px 5px;">{{ printData.pegawai.jabatan }}</td>
              </tr>
              <tr>
                  <td style="border: 1px solid black; text-align: center; padding: 3px;"></td>
                  <td style="border: 1px solid black; text-align: center; padding: 3px;">8</td>
                  <td style="border: 1px solid black; padding: 3px 5px;">Unit Kerja</td>
                  <td colspan="3" style="border: 1px solid black; padding: 3px 5px;">{{ formatUnitKerja(printData.pegawai.unit_kerja) }}</td>
              </tr>
              <tr>
                  <td style="border: 1px solid black; text-align: center; padding: 3px;"></td>
                  <td style="border: 1px solid black; text-align: center; padding: 3px;">9</td>
                  <td style="border: 1px solid black; padding: 3px 5px;">Instansi</td>
                  <td colspan="3" style="border: 1px solid black; padding: 3px 5px;">Badan Pusat Statistik</td>
              </tr>
             
              <tr style="font-weight: bold; text-align: center;">
                 <td style="border: 1px solid black; padding: 3px;">II</td>
                 <td colspan="2" style="border: 1px solid black; text-align: left; padding: 3px 5px;">PENETAPAN ANGKA KREDIT</td>
                 <td style="border: 1px solid black; width: 75px; padding: 3px;">LAMA</td>
                 <td style="border: 1px solid black; width: 75px; padding: 3px;">BARU</td>
                 <td style="border: 1px solid black; width: 75px; padding: 3px;">JUMLAH</td>
              </tr>
              <tr>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;"></td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">1</td>
                 <td style="border: 1px solid black; padding: 3px 5px;">AK Dasar yang diberikan</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">-</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">-</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">-</td>
              </tr>
              <tr>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;"></td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">2</td>
                 <td style="border: 1px solid black; padding: 3px 5px;">AK JF Lama</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">-</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">-</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">-</td>
              </tr>
              <tr>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;"></td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">3</td>
                 <td style="border: 1px solid black; padding: 3px 5px;">AK Penyesuaian/Penyetaraan</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">-</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">-</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">-</td>
              </tr>
              <tr>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;"></td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">4</td>
                 <td style="border: 1px solid black; padding: 3px 5px;">AK Konversi</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">-</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px; font-weight: bold;">{{ parseFloat(printData.total_ak).toFixed(3) }}</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px; font-weight: bold;">{{ parseFloat(printData.total_ak).toFixed(3) }}</td>
              </tr>
              <tr>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;"></td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">5</td>
                 <td style="border: 1px solid black; padding: 3px 5px;">AK yang diperoleh dari Peningkatan Pendidikan</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">-</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">-</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">-</td>
              </tr>
              <tr>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;"></td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">6</td>
                 <td style="border: 1px solid black; padding: 3px 5px;">....**)</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">-</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">-</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">-</td>
              </tr>
              <tr style="font-weight: bold;">
                 <td style="border: 1px solid black; text-align: center; padding: 3px;"></td>
                 <td colspan="2" style="border: 1px solid black; text-align: right; padding: 3px 15px;">JUMLAH ANGKA KREDIT KUMULATIF</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">-</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">{{ parseFloat(printData.total_ak).toFixed(3) }}</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">{{ parseFloat(printData.total_ak).toFixed(3) }}</td>
              </tr>
              
              <tr style="font-weight: bold;">
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">III</td>
                 <td colspan="2" style="border: 1px solid black; text-align: left; padding: 3px 5px;">KETERANGAN</td>
                 <td colspan="2" style="border: 1px solid black; text-align: center; padding: 3px;">PANGKAT</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">JENJANG JABATAN</td>
              </tr>
              <tr>
                 <td style="border: 1px solid black; padding: 3px;"></td>
                 <td colspan="2" style="border: 1px solid black; padding: 3px 5px;">Angka Kredit minimal yang harus dicapai</td>
                 <td colspan="2" style="border: 1px solid black; text-align: center; padding: 3px;">{{ printData.analisis.targetPangkat }}</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px;">{{ printData.analisis.targetJenjang }}</td>
              </tr>
              <tr>
                 <td style="border: 1px solid black; padding: 3px;"></td>
                 <td colspan="2" style="border: 1px solid black; padding: 3px 5px; font-weight: bold;">Kekurangan Angka Kredit yang harus dicapai</td>
                 <td colspan="2" style="border: 1px solid black; text-align: center; padding: 3px; font-weight: bold;">{{ printData.analisis.kurangPangkat }}</td>
                 <td style="border: 1px solid black; text-align: center; padding: 3px; font-weight: bold;">{{ printData.analisis.kurangJenjang }}</td>
              </tr>
             </tbody>
           </table>

           <div class="mb-4 mt-3 flex text-justify border border-black p-2 font-bold bg-gray-50 text-[11px]">
              <span class="mr-2">IV.</span>
              <span>{{ printData.rekomendasi_pak }}</span>
           </div>

           <div class="flex justify-between items-end mt-1 mb-8">
             <div class="text-[10px]">
                <p class="font-bold mb-1">ASLI Penetapan Angka Kredit untuk:</p>
                <p>1. Sdr. {{ printData.pegawai.nama_lengkap || printData.pegawai.nama }}</p>
                <p>2. Sekretariat Tim Penilai Kinerja Badan Pusat Statistik</p>
                <p>3. Kepala Biro Sumber Daya Manusia</p>
             </div>
             <div class="w-64 text-[11px]">
               <div class="flex justify-between"><span class="text-left w-28">Ditetapkan di</span><span>: {{ printData.ditetapkan_di }}</span></div>
               <div class="flex justify-between mb-6"><span class="text-left w-28">Pada tanggal</span><span>: {{ printData.tanggal_ttd }}</span></div>
               <div class="text-center pr-4">
                 <p class="mb-14 font-bold">Pejabat yang Berwenang<br>Menetapkan Angka Kredit</p>
                 <p class="font-bold underline">Agnes Widiastuti</p>
               </div>
             </div>
           </div>

           <div class="w-full border-t border-black pt-2 flex justify-end mt-auto">
              <img src="/balai.png" alt="Balai" class="w-[50px] h-auto" />
           </div>

        </div> 
      </div> 
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,600;0,700;1,400&display=swap');

.animate-fade-in { animation: fadeIn 0.3s ease-out; }
.animate-scale-in { animation: scaleIn 0.2s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

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
    -webkit-print-color-adjust: exact; 
    print-color-adjust: exact;
  }
}
</style>