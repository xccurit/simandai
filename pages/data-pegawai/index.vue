<script setup lang="ts">
import { computed, ref, reactive, watch, onMounted } from 'vue'
import { usePegawaiStore, type Pegawai } from '~/stores/usePegawaiStore'

const store = usePegawaiStore()

onMounted(() => {
  store.loadFromStorage()
})

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
  id: 0, nama_lengkap: '', nip_baru: '', nip_lama: '', karpeg: '',
  tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: 'Laki-laki',
  pangkat: '', golru: '', tmt_pangkat: '', jabatan: '',
  jenis_jabatan: 'Fungsional', jenjang_jabatan: '', unit_kerja: '',
  instansi: '', status_kepegawaian: 'Aktif', total_ak_kumulatif: 0
}

const formPegawai = ref<Pegawai>({ ...emptyForm })
const errors = reactive({ nama_lengkap: '', nip_baru: '' })

// Real-time Validation
watch(() => formPegawai.value.nama_lengkap, (val) => {
  if (!val) errors.nama_lengkap = 'Nama wajib diisi'
  else if (val.length < 3) errors.nama_lengkap = 'Minimal 3 karakter'
  else errors.nama_lengkap = ''
})

watch(() => formPegawai.value.nip_baru, (val) => {
  if (!val) errors.nip_baru = 'NIP wajib diisi'
  else if (!/^\d+$/.test(val)) errors.nip_baru = 'NIP harus angka'
  else if (val.length !== 18) errors.nip_baru = 'NIP harus 18 digit'
  else errors.nip_baru = ''
})

const isFormValid = computed(() => {
  return formPegawai.value.nama_lengkap.length >= 3 && 
         formPegawai.value.nip_baru.length === 18 &&
         !errors.nama_lengkap && !errors.nip_baru
})

const openTambah = () => {
  isEditing.value = false
  formPegawai.value = { ...emptyForm }
  showModal.value = true
}

const openEdit = (pegawai: Pegawai) => {
  isEditing.value = true
  formPegawai.value = { ...pegawai }
  showModal.value = true
}

const savePegawai = () => {
  if (!isFormValid.value) return
  if (isEditing.value) {
    store.updatePegawai(formPegawai.value.id, formPegawai.value)
  } else {
    store.tambahPegawai(formPegawai.value)
  }
  showModal.value = false
}
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-10 pb-16 p-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold text-gray-800">Data Pokok Pegawai (SIMPEG)</h2>
        <p class="text-gray-500">Master data pegawai aktif dan tugas belajar</p>
      </div>
      <button @click="openTambah" class="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg">
        + Tambah Pegawai
      </button>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <div class="bg-white border p-6 rounded-2xl shadow-sm">
        <p class="text-gray-500 text-sm">TOTAL PEGAWAI</p>
        <p class="text-3xl font-bold">{{ totalPegawai }}</p>
      </div>
      <div class="bg-green-50 border border-green-100 p-6 rounded-2xl shadow-sm">
        <p class="text-green-600 text-sm">AKTIF</p>
        <p class="text-3xl font-bold text-green-700">{{ totalAktif }}</p>
      </div>
      <div class="bg-orange-50 border border-orange-100 p-6 rounded-2xl shadow-sm">
        <p class="text-orange-600 text-sm">TUGAS BELAJAR</p>
        <p class="text-3xl font-bold text-orange-700">{{ totalTugasBelajar }}</p>
      </div>
    </div>

    <div class="bg-white border rounded-2xl overflow-hidden shadow-sm">
      <div class="p-4 bg-gray-50 border-b flex gap-4">
        <input v-model="searchQuery" type="text" placeholder="Cari nama atau NIP..." class="flex-1 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
        <select v-model="selectedStatus" class="border rounded-lg px-4 py-2 outline-none">
          <option value="Semua">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Tugas Belajar">Tugas Belajar</option>
        </select>
      </div>
      <table class="w-full text-left">
        <thead class="bg-gray-50 text-gray-600 text-sm">
          <tr>
            <th class="p-4">Pegawai</th>
            <th class="p-4">Pangkat/Gol</th>
            <th class="p-4">Jabatan</th>
            <th class="p-4">Unit Kerja</th>
            <th class="p-4">Status</th>
            <th class="p-4">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filteredPegawai" :key="p.id" class="border-t hover:bg-gray-50 transition">
            <td class="p-4">
              <NuxtLink :to="`/data-pegawai/${p.id}`" class="font-bold text-blue-600 hover:underline">{{ p.nama_lengkap }}</NuxtLink>
              <div class="text-xs text-gray-500">{{ p.nip_baru }}</div>
            </td>
            <td class="p-4 text-sm">{{ p.pangkat }} <br> <span class="text-gray-500">{{ p.golru }}</span></td>
            <td class="p-4 text-sm">{{ p.jabatan }}</td>
            <td class="p-4 text-sm">{{ p.unit_kerja }}</td>
            <td class="p-4">
              <span :class="p.status_kepegawaian === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'" class="px-3 py-1 rounded-full text-xs font-medium">
                {{ p.status_kepegawaian }}
              </span>
            </td>
            <td class="p-4 space-x-3 text-sm">
              <button @click="openEdit(p)" class="text-blue-600 hover:font-bold">Edit</button>
              <button @click="store.hapusPegawai(p.id)" class="text-red-600 hover:font-bold">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8">
        <h3 class="text-2xl font-bold mb-6">{{ isEditing ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru' }}</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="space-y-1">
            <label class="text-sm font-semibold">Nama Lengkap</label>
            <input v-model="formPegawai.nama_lengkap" class="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Masukkan nama sesuai ijazah" />
            <p v-if="errors.nama_lengkap" class="text-red-500 text-xs">{{ errors.nama_lengkap }}</p>
          </div>

          <div class="space-y-1">
            <label class="text-sm font-semibold">NIP Baru (18 Digit)</label>
            <input v-model="formPegawai.nip_baru" class="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: 1990..." />
            <p v-if="errors.nip_baru" class="text-red-500 text-xs">{{ errors.nip_baru }}</p>
          </div>

          <div class="space-y-1">
            <label class="text-sm font-semibold">NIP Lama</label>
            <input v-model="formPegawai.nip_lama" class="w-full border p-3 rounded-xl" />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-semibold">No. Karpeg</label>
            <input v-model="formPegawai.karpeg" class="w-full border p-3 rounded-xl" />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-semibold">Tempat Lahir</label>
            <input v-model="formPegawai.tempat_lahir" class="w-full border p-3 rounded-xl" />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-semibold">Tanggal Lahir</label>
            <input v-model="formPegawai.tanggal_lahir" type="date" class="w-full border p-3 rounded-xl" />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-semibold">Jenis Kelamin</label>
            <select v-model="formPegawai.jenis_kelamin" class="w-full border p-3 rounded-xl">
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-sm font-semibold">Status Kepegawaian</label>
            <select v-model="formPegawai.status_kepegawaian" class="w-full border p-3 rounded-xl">
              <option value="Aktif">Aktif</option>
              <option value="Tugas Belajar">Tugas Belajar</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-sm font-semibold">Pangkat</label>
            <input v-model="formPegawai.pangkat" class="w-full border p-3 rounded-xl" />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-semibold">Golongan Ruang</label>
            <input v-model="formPegawai.golru" placeholder="Contoh: IV/a" class="w-full border p-3 rounded-xl" />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-semibold">Jabatan</label>
            <input v-model="formPegawai.jabatan" class="w-full border p-3 rounded-xl" />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-semibold">Jenis Jabatan</label>
            <select v-model="formPegawai.jenis_jabatan" class="w-full border p-3 rounded-xl">
              <option value="Struktural">Struktural</option>
              <option value="Fungsional">Fungsional</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-sm font-semibold">Unit Kerja</label>
            <input v-model="formPegawai.unit_kerja" class="w-full border p-3 rounded-xl" />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-semibold">Instansi</label>
            <input v-model="formPegawai.instansi" class="w-full border p-3 rounded-xl" />
          </div>
        </div>

        <div class="flex justify-end gap-4 mt-10">
          <button @click="showModal = false" class="px-6 py-3 text-gray-500 hover:underline">Batal</button>
          <button 
            @click="savePegawai" 
            :disabled="!isFormValid"
            :class="!isFormValid ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'"
            class="px-10 py-3 text-white rounded-xl shadow-lg transition"
          >
            {{ isEditing ? 'Simpan Perubahan' : 'Tambah Pegawai' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>