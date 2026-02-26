<script setup lang="ts">
import { computed, ref, reactive, watch, onMounted } from 'vue'
import { usePegawaiStore, type Pegawai } from '~/stores/usePegawaiStore'

const store = usePegawaiStore()

onMounted(() => {
  store.loadFromStorage()
})

/* ================= DATA MASTER ================= */
const daftarPangkatGolru = [
  { pangkat: 'Pengatur', golru: 'II/c' },
  { pangkat: 'Pengatur Tk.I', golru: 'II/d' },
  { pangkat: 'Penata Muda', golru: 'III/a' },
  { pangkat: 'Penata Muda Tk.I', golru: 'III/b' },
  { pangkat: 'Penata', golru: 'III/c' },
  { pangkat: 'Penata Tk.I', golru: 'III/d' },
  { pangkat: 'Pembina', golru: 'IV/a' },
  { pangkat: 'Pembina Tk.I', golru: 'IV/b' },
  { pangkat: 'Pembina Utama Muda', golru: 'IV/c' },
  { pangkat: 'Pembina Utama Madya', golru: 'IV/d' },
  { pangkat: 'Pembina Utama', golru: 'IV/e' },
]

const daftarUnitKerja = [
  'BPS Provinsi Kalimantan Tengah',
  'BPS Kota Palangka Raya',
  'BPS Kabupaten Barito Selatan',
  'BPS Kabupaten Barito Timur',
  'BPS Kabupaten Barito Utara',
  'BPS Kabupaten Gunung Mas',
  'BPS Kabupaten Kapuas',
  'BPS Kabupaten Katingan',
  'BPS Kabupaten Kotawaringin Barat',
  'BPS Kabupaten Kotawaringin Timur',
  'BPS Kabupaten Lamandau',
  'BPS Kabupaten Murung Raya',
  'BPS Kabupaten Pulang Pisau',
  'BPS Kabupaten Seruyan',
  'BPS Kabupaten Sukamara'
]

const daftarJenjangJabatan = [
  'Terampil',
  'Mahir',
  'Penyelia',
  'Ahli Pertama',
  'Ahli Muda',
  'Ahli Madya',
  'Ahli Utama'
]

/* ================= FILTER & STATS ================= */
const searchQuery = ref('')
const selectedStatus = ref<'Semua' | 'Aktif' | 'Tugas Belajar'>('Semua')

const filteredPegawai = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return store.pegawaiList.filter((p) => {
    const matchStatus = selectedStatus.value === 'Semua' || p.status_kepegawaian === selectedStatus.value
    const matchSearch = p.nama_lengkap.toLowerCase().includes(query) || p.nip_baru.includes(query)
    return matchStatus && matchSearch
  })
})

const totalPegawai = computed(() => store.pegawaiList.length)
const totalAktif = computed(() => store.pegawaiList.filter(p => p.status_kepegawaian === 'Aktif').length)
const totalTugasBelajar = computed(() => store.pegawaiList.filter(p => p.status_kepegawaian === 'Tugas Belajar').length)

/* ================= CRUD LOGIC ================= */
const showModal = ref(false)
const isEditing = ref(false)

const emptyForm: Pegawai = {
  id: 0, 
  nama_lengkap: '', 
  nip_baru: '', 
  nip_lama: '', 
  karpeg: '',
  tempat_lahir: '', 
  tanggal_lahir: '', 
  jenis_kelamin: 'Laki-laki',
  pangkat: '', 
  golru: '', 
  tmt_pangkat: '', // Pastikan ini ada
  jabatan: '',
  jenis_jabatan: 'Fungsional', 
  jenjang_jabatan: '', 
  unit_kerja: '',
  instansi: 'Badan Pusat Statistik', 
  status_kepegawaian: 'Aktif', 
  total_ak_kumulatif: 0
}

const formPegawai = ref<Pegawai>({ ...emptyForm })
const errors = reactive({ nama_lengkap: '', nip_baru: '' })

// Validation
const validateForm = () => {
  errors.nama_lengkap = formPegawai.value.nama_lengkap.length < 3 ? 'Minimal 3 karakter' : ''
  errors.nip_baru = !/^\d{18}$/.test(formPegawai.value.nip_baru) ? 'NIP harus 18 digit angka' : ''
}

const isFormValid = computed(() => {
  return formPegawai.value.nama_lengkap.length >= 3 && 
         /^\d{18}$/.test(formPegawai.value.nip_baru)
})

const openTambah = () => {
  isEditing.value = false
  formPegawai.value = { ...emptyForm, id: Date.now() }
  showModal.value = true
}

const openEdit = (pegawai: Pegawai) => {
  isEditing.value = true
  formPegawai.value = { ...pegawai }
  showModal.value = true
}

const savePegawai = () => {
  validateForm()
  if (!isFormValid.value) return
  
  if (isEditing.value) {
    store.updatePegawai(formPegawai.value.id, formPegawai.value)
  } else {
    store.tambahPegawai(formPegawai.value)
  }
  showModal.value = false
}

// Otomatis isi Golru saat Pangkat dipilih
watch(() => formPegawai.value.pangkat, (newPangkat) => {
  const match = daftarPangkatGolru.find(p => p.pangkat === newPangkat)
  if (match) {
    formPegawai.value.golru = match.golru
  }
})
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-10 pb-16 p-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold text-gray-800">Data Pokok Pegawai</h2>
        <p class="text-gray-500">Master data pegawai aktif dan tugas belajar</p>
      </div>
      <button @click="openTambah" class="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg font-bold">
        + Tambah Pegawai
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white border p-6 rounded-2xl shadow-sm">
        <p class="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Pegawai</p>
        <p class="text-3xl font-black text-gray-800">{{ totalPegawai }}</p>
      </div>
      <div class="bg-green-50 border border-green-100 p-6 rounded-2xl shadow-sm">
        <p class="text-green-600 text-xs font-bold uppercase tracking-wider">Aktif</p>
        <p class="text-3xl font-black text-green-700">{{ totalAktif }}</p>
      </div>
      <div class="bg-orange-50 border border-orange-100 p-6 rounded-2xl shadow-sm">
        <p class="text-orange-600 text-xs font-bold uppercase tracking-wider">Tugas Belajar</p>
        <p class="text-3xl font-black text-orange-700">{{ totalTugasBelajar }}</p>
      </div>
    </div>

    <div class="bg-white border rounded-2xl overflow-hidden shadow-sm">
      <div class="p-4 bg-gray-50 border-b flex flex-wrap gap-4">
        <input v-model="searchQuery" type="text" placeholder="Cari nama atau NIP..." class="flex-1 min-w-[200px] border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
        <select v-model="selectedStatus" class="border rounded-lg px-4 py-2 outline-none bg-white">
          <option value="Semua">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Tugas Belajar">Tugas Belajar</option>
        </select>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
            <tr>
              <th class="p-4 border-b">Pegawai</th>
              <th class="p-4 border-b">Pangkat/Gol</th>
              <th class="p-4 border-b">Jabatan & Pangkat</th>
              <th class="p-4 border-b">Unit Kerja</th>
              <th class="p-4 border-b text-center">Status</th>
              <th class="p-4 border-b text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="p in filteredPegawai" :key="p.id" class="hover:bg-blue-50/30 transition">
              <td class="p-4">
                <NuxtLink :to="`/data-pegawai/${p.id}`" class="font-bold text-blue-600 hover:underline">{{ p.nama_lengkap }}</NuxtLink>
                <div class="text-xs text-gray-500 font-mono">{{ p.nip_baru }}</div>
              </td>
              <td class="p-4 text-sm">
                <span class="font-medium">{{ p.pangkat }}</span>
                <div class="text-gray-500 text-xs">{{ p.golru }}</div>
              </td>
              <td class="p-4 text-sm font-medium">{{ p.jabatan }} {{ p.jenjang_jabatan }}</td>
              <td class="p-4 text-sm text-gray-600">{{ p.unit_kerja }}</td>
              <td class="p-4 text-center">
                <span :class="p.status_kepegawaian === 'Aktif' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'" class="px-3 py-1 rounded-full text-[10px] font-bold uppercase border">
                  {{ p.status_kepegawaian }}
                </span>
              </td>
              <td class="p-4 text-center">
                <div class="flex justify-center gap-3">
                  <button @click="openEdit(p)" class="text-blue-600 hover:text-blue-800 p-1 rounded-lg hover:bg-blue-100 transition" title="Edit">✏️</button>
                  <button @click="store.hapusPegawai(p.id)" class="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-100 transition" title="Hapus">🗑️</button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredPegawai.length === 0">
              <td colspan="6" class="p-10 text-center text-gray-400 italic">Data pegawai tidak ditemukan</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-scale-in">
        <div class="p-8 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
          <h3 class="text-2xl font-black text-gray-800">{{ isEditing ? '📝 Edit Data Pegawai' : '👤 Tambah Pegawai Baru' }}</h3>
          <button @click="showModal = false" class="text-3xl text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        
        <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4 md:col-span-2">
             <h4 class="font-bold text-blue-600 border-b pb-1 text-sm uppercase">Identitas Utama</h4>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-600 uppercase">Nama Lengkap (Tanpa Gelar)</label>
            <input v-model="formPegawai.nama_lengkap" class="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Budi Santoso" />
            <p v-if="errors.nama_lengkap" class="text-red-500 text-[10px] font-bold">{{ errors.nama_lengkap }}</p>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-600 uppercase">NIP Baru (18 Digit)</label>
            <input v-model="formPegawai.nip_baru" maxlength="18" class="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono" placeholder="199XXXXXXXXXXXXXXX" />
            <p v-if="errors.nip_baru" class="text-red-500 text-[10px] font-bold">{{ errors.nip_baru }}</p>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-600 uppercase">NIP Lama</label>
            <input v-model="formPegawai.nip_lama" class="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: 3400..." />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-600 uppercase">No. Karpeg</label>
            <input v-model="formPegawai.karpeg" class="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: N-123456" />
          </div>

          <div class="space-y-4 md:col-span-2 mt-4">
             <h4 class="font-bold text-blue-600 border-b pb-1 text-sm uppercase">Data Pribadi</h4>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-600 uppercase">Tempat Lahir</label>
            <input v-model="formPegawai.tempat_lahir" class="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-600 uppercase">Tanggal Lahir</label>
            <input v-model="formPegawai.tanggal_lahir" type="date" class="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-600 uppercase">Jenis Kelamin</label>
            <select v-model="formPegawai.jenis_kelamin" class="w-full border p-3 rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-500">
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-600 uppercase">Status</label>
            <select v-model="formPegawai.status_kepegawaian" class="w-full border p-3 rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-500">
              <option value="Aktif">Aktif</option>
              <option value="Tugas Belajar">Tugas Belajar</option>
            </select>
          </div>

          <div class="space-y-4 md:col-span-2 mt-4">
             <h4 class="font-bold text-blue-600 border-b pb-1 text-sm uppercase">Pangkat & Jabatan</h4>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-600 uppercase">Pangkat / Golru</label>
            <div class="flex gap-2">
              <select v-model="formPegawai.pangkat" class="flex-1 border p-3 rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-500">
                <option value="" disabled>Pilih Pangkat</option>
                <option v-for="item in daftarPangkatGolru" :key="item.pangkat" :value="item.pangkat">
                  {{ item.pangkat }}
                </option>
              </select>
              <input v-model="formPegawai.golru" readonly class="w-24 border p-3 rounded-xl outline-none bg-gray-50 text-gray-500 text-center font-bold" placeholder="Golru" />
            </div>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-600 uppercase">TMT Pangkat</label>
            <input v-model="formPegawai.tmt_pangkat" type="date" class="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-600 uppercase">Jabatan Saat Ini</label>
            <input v-model="formPegawai.jabatan" class="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-600 uppercase">Jenjang Jabatan</label>
            <select 
              v-model="formPegawai.jenjang_jabatan" 
              class="w-full border p-3 rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Pilih Jenjang Jabatan</option>
              <option v-for="jenjang in daftarJenjangJabatan" :key="jenjang" :value="jenjang">
                {{ jenjang }}
              </option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-600 uppercase">Unit Kerja</label>
            <select v-model="formPegawai.unit_kerja" class="w-full border p-3 rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-500">
              <option value="" disabled>Pilih Unit Kerja</option>
              <option v-for="unit in daftarUnitKerja" :key="unit" :value="unit">
                {{ unit }}
              </option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-600 uppercase">Instansi</label>
            <input v-model="formPegawai.instansi" class="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-400 bg-gray-50" readonly />
          </div>
        </div>

        <div class="p-8 bg-gray-50 border-t flex justify-end gap-4 rounded-b-3xl">
          <button @click="showModal = false" class="px-6 py-3 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition">Batal</button>
          <button 
            @click="savePegawai" 
            :disabled="!isFormValid"
            :class="!isFormValid ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-800 shadow-blue-200'"
            class="px-10 py-3 text-white rounded-xl font-bold shadow-lg transition"
          >
            {{ isEditing ? 'Simpan Perubahan' : 'Simpan Data Pegawai' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-scale-in { animation: scaleIn 0.2s ease-out; }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>