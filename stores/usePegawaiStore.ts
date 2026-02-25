import { defineStore } from 'pinia'

const STORAGE_KEY = 'simandai_pegawai_store'

// ==========================================
// 1. DEFINISI TIPE DATA (TYPESCRIPT)
// ==========================================
export type StatusKepegawaian = 'Aktif' | 'Tugas Belajar'

export interface KamusPangkat {
  golru: string;
  nama: string;
  ak_kp: number | null;
  next_golru: string; 
  next_nama: string;  
}

export interface KamusJabatan {
  keyword: string;
  nama: string;
  koef_tahun: number;
  target_jenjang: number | null;
  next?: string | null;
}

export interface Pegawai {
  id: number
  nama_lengkap: string // Menggunakan nama_lengkap agar konsisten dengan form detail
  nip_baru: string
  nip_lama: string
  karpeg: string
  tempat_lahir: string
  tanggal_lahir: string
  jenis_kelamin: 'Laki-laki' | 'Perempuan'
  pangkat: string
  golru: string
  tmt_pangkat: string
  jabatan: string
  jenis_jabatan: 'Struktural' | 'Fungsional'
  jenjang_jabatan: string
  unit_kerja: string
  instansi: string
  status_kepegawaian: StatusKepegawaian
  total_ak_kumulatif: number
  target_ak_tahunan?: number // Dari main
}

export interface RiwayatAK {
  id: number
  pegawai_id: number
  tahun: number
  bulan_mulai: number
  bulan_selesai: number
  bulan: number
  jabatan: string
  predikat: string
  ak_didapat: number
  sumber: string
}

interface PegawaiState {
  pegawaiList: Pegawai[]
  riwayatList: RiwayatAK[]
  kamusPangkat: KamusPangkat[]
  kamusJabatan: KamusJabatan[]
}

export const usePegawaiStore = defineStore('pegawai', {
  // ==========================================
  // 2. STATE (GUDANG DATA)
  // ==========================================
  state: (): PegawaiState => ({
    kamusPangkat: [
      { golru: 'II/c', nama: 'Pengatur', ak_kp: 20, next_golru: 'II/d', next_nama: 'Pengatur Tk.I' },
      { golru: 'II/d', nama: 'Pengatur Tk.I', ak_kp: 20, next_golru: 'III/a', next_nama: 'Penata Muda' },
      { golru: 'III/a', nama: 'Penata Muda', ak_kp: 50, next_golru: 'III/b', next_nama: 'Penata Muda Tk.I' },
      { golru: 'III/b', nama: 'Penata Muda Tk.I', ak_kp: 50, next_golru: 'III/c', next_nama: 'Penata' },
      { golru: 'III/c', nama: 'Penata', ak_kp: 100, next_golru: 'III/d', next_nama: 'Penata Tk.I' },
      { golru: 'III/d', nama: 'Penata Tk.I', ak_kp: 100, next_golru: 'IV/a', next_nama: 'Pembina' },
      { golru: 'IV/a', nama: 'Pembina', ak_kp: 150, next_golru: 'IV/b', next_nama: 'Pembina Tk.I' },
      { golru: 'IV/b', nama: 'Pembina Tk.I', ak_kp: 150, next_golru: 'IV/c', next_nama: 'Pembina Utama Muda' },
      { golru: 'IV/c', nama: 'Pembina Utama Muda', ak_kp: 150, next_golru: 'IV/d', next_nama: 'Pembina Utama Madya' },
      { golru: 'IV/d', nama: 'Pembina Utama Madya', ak_kp: 200, next_golru: 'IV/e', next_nama: 'Pembina Utama' },
      { golru: 'IV/e', nama: 'Pembina Utama', ak_kp: null, next_golru: '-', next_nama: '-' }, 
    ],
    kamusJabatan: [
      { keyword: 'Utama', nama: 'Ahli Utama', koef_tahun: 50, target_jenjang: null },
      { keyword: 'Madya', nama: 'Ahli Madya', koef_tahun: 37.5, target_jenjang: 450 },
      { keyword: 'Muda', nama: 'Ahli Muda', koef_tahun: 25, target_jenjang: 200 },
      { keyword: 'Pertama', nama: 'Ahli Pertama', koef_tahun: 12.5, target_jenjang: 100 },
      { keyword: 'Penyelia', nama: 'Penyelia', koef_tahun: 25, target_jenjang: null },
      { keyword: 'Mahir', nama: 'Mahir', koef_tahun: 12.5, target_jenjang: 100 },
      { keyword: 'Terampil', nama: 'Terampil', koef_tahun: 5, target_jenjang: 40 },
    ],
    pegawaiList: [],
    riwayatList: []
  }),

  // ==========================================
  // 3. ACTIONS (FUNGSI UBAH DATA)
  // ==========================================
  actions: {
    loadFromStorage() {
      if (process.server) return
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        this.pegawaiList = parsed.pegawaiList || []
        this.riwayatList = parsed.riwayatList || []
      }
    },

    saveToStorage() {
      if (process.server) return
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        pegawaiList: this.pegawaiList,
        riwayatList: this.riwayatList
      }))
    },

    generateId(): number {
      return this.pegawaiList.length
        ? Math.max(...this.pegawaiList.map(p => p.id)) + 1
        : 1
    },

    tambahPegawai(data: Pegawai) {
      const newPegawai = { ...data, id: this.generateId() }
      this.pegawaiList.push(newPegawai)
      this.saveToStorage()
    },

    updatePegawai(id: number, dataBaru: Pegawai) {
      const index = this.pegawaiList.findIndex(p => p.id === id)
      if (index !== -1) {
        this.pegawaiList[index] = { ...dataBaru }
        this.saveToStorage()
      }
    },

    hapusPegawai(id: number) {
      this.pegawaiList = this.pegawaiList.filter(p => p.id !== id)
      this.riwayatList = this.riwayatList.filter(r => r.pegawai_id !== id)
      this.saveToStorage()
    },

    // Action tambahan dari branch Main untuk kalkulasi AK
    tambahAngkaKredit(pegawai_id: number, ak: number) {
      const p = this.pegawaiList.find(x => x.id === pegawai_id)
      if (p) {
        p.total_ak_kumulatif += ak
        this.saveToStorage()
      }
    },

    simpanRiwayat(dataBaru: RiwayatAK, isEditing: boolean) {
      if (isEditing) {
        const index = this.riwayatList.findIndex(x => x.id === dataBaru.id)
        if (index !== -1) {
          const itemLama = this.riwayatList[index]
          const selisih = dataBaru.ak_didapat - itemLama.ak_didapat
          this.riwayatList[index] = { ...dataBaru }
          this.tambahAngkaKredit(dataBaru.pegawai_id, selisih)
        }
      } else {
        const newRiwayat = { ...dataBaru, id: Date.now() }
        this.riwayatList.push(newRiwayat)
        this.tambahAngkaKredit(dataBaru.pegawai_id, dataBaru.ak_didapat)
      }
      this.saveToStorage()
    }
  }
})