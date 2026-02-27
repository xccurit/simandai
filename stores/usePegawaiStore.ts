import { defineStore } from 'pinia'

const STORAGE_KEY = 'simandai_data'

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

interface KamusPredikat {
  nama: string;
  persen: number;
}

interface RiwayatAK {
  id: number;
  pegawai_id: number;
  tahun: number;
  bulan_mulai: number;
  bulan_selesai: number;
  bulan: number;
  jabatan: string;
  predikat: string;
  ak_didapat: number;
  sumber: string;
  // --- TAMBAHAN UNTUK DATA MANUAL 2022 ---
  manual_bulan?: string;
  manual_persen?: string;
  manual_koef?: string;
}

interface KodeReferensi {
  kode: string;
  nama: string;
}

interface PegawaiState {
  pegawaiList: Pegawai[]
  riwayatList: RiwayatAK[]
  kamusPangkat: KamusPangkat[]
  kamusJabatan: KamusJabatan[]
  kamusKodeSatker: KodeReferensi[]
  kamusKodeJabatan: KodeReferensi[]
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
      { golru: 'III/b', nama: 'Penata Muda Tk.I', ak_kp: 100, next_golru: 'III/c', next_nama: 'Penata' },
      { golru: 'III/c', nama: 'Penata', ak_kp: 100, next_golru: 'III/d', next_nama: 'Penata Tk.I' },
      { golru: 'III/d', nama: 'Penata Tk.I', ak_kp: 200, next_golru: 'IV/a', next_nama: 'Pembina' },
      { golru: 'IV/a', nama: 'Pembina', ak_kp: 150, next_golru: 'IV/b', next_nama: 'Pembina Tk.I' },
      { golru: 'IV/b', nama: 'Pembina Tk.I', ak_kp: 300, next_golru: 'IV/c', next_nama: 'Pembina Utama Muda' },
      { golru: 'IV/c', nama: 'Pembina Utama Muda', ak_kp: 450, next_golru: 'IV/d', next_nama: 'Pembina Utama Madya' },
      { golru: 'IV/d', nama: 'Pembina Utama Madya', ak_kp: 200, next_golru: 'IV/e', next_nama: 'Pembina Utama' },
      { golru: 'IV/e', nama: 'Pembina Utama', ak_kp: null, next_golru: '-', next_nama: '-' }, 
    ], 
    kamusJabatan: [
      { keyword: 'utama', nama: 'Ahli Utama', koef_tahun: 50, target_jenjang: null, next: null },
      { keyword: 'madya', nama: 'Ahli Madya', koef_tahun: 37.5, target_jenjang: 450, next: 'Ahli Utama' },
      { keyword: 'muda', nama: 'Ahli Muda', koef_tahun: 25, target_jenjang: 200, next: 'Ahli Madya' },
      { keyword: 'pertama', nama: 'Ahli Pertama', koef_tahun: 12.5, target_jenjang: 100, next: 'Ahli Muda' },
      { keyword: 'penyelia', nama: 'Penyelia', koef_tahun: 25, target_jenjang: null, next: null },
      { keyword: 'mahir', nama: 'Mahir', koef_tahun: 12.5, target_jenjang: 100, next: 'Penyelia' },
      { keyword: 'terampil', nama: 'Terampil', koef_tahun: 5, target_jenjang: 60, next: 'Mahir' },
    ],
    // Tambahkan di dalam state () => ({ ... })
    kamusKodeSatker: [
      { kode: '6201', nama: 'Kab. Kotawaringin Barat' },
      { kode: '6202', nama: 'Kab. Kotawaringin Timur' },
      { kode: '6203', nama: 'Kab. Kapuas' },
      { kode: '6204', nama: 'Kab. Barito Selatan' },
      { kode: '6205', nama: 'Kab. Barito Utara' },
      { kode: '6209', nama: 'Kab. Katingan' },
      { kode: '6208', nama: 'Kab. Seruyan' },
      { kode: '6206', nama: 'Kab. Sukamara' },
      { kode: '6207', nama: 'Kab. Lamandau' },
      { kode: '6211', nama: 'Kab. Gunung Mas' },
      { kode: '6210', nama: 'Kab. Pulang Pisau' },
      { kode: '6213', nama: 'Kab. Murung Raya' },
      { kode: '6212', nama: 'Kab. Barito Timur' },
      { kode: '6271', nama: 'Kota Palangka Raya' },
    ],
    kamusKodeJabatan: [
      { kode: 'ST', nama: 'Statistisi' },
      { kode: 'PK', nama: 'Pranata Komputer' },
      { kode: 'JFK', nama: 'JF Kepegawaian' },
      { kode: 'JFAA', nama: 'Analis Anggaran' },
      { kode: 'JFP', nama: 'Perencana' },
      { kode: 'AD', nama: 'Auditor' },
      { kode: 'PKA', nama: 'Pranata Keuangan APBN' },
      { kode: 'APK', nama: 'APK APBN' },
      { kode: 'JFPH', nama: 'Pranata Humas' },
      { kode: 'PBJ', nama: 'Pengelola Barang dan Jasa' },
      { kode: 'PLB', nama: 'Penata Laksana Barang' },
      { kode: 'JFH', nama: 'Penyuluh Hukum' },
      { kode: 'JFAH', nama: 'Analis Hukum' },
      { kode: 'JFA', nama: 'Arsiparis' },
    ],
    pegawaiList: [],
    riwayatList: []
  }),

  // ==========================================
  // 3. ACTIONS (FUNGSI UBAH DATA)
  // ==========================================
  actions: {
    loadFromStorage() {
      if (import.meta.server) return
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        this.pegawaiList = parsed.pegawaiList || []
        this.riwayatList = parsed.riwayatList || []
      }
    },

    saveToStorage() {
      if (import.meta.server) return
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        pegawaiList: this.pegawaiList,
        riwayatList: this.riwayatList
      }))
    },

    // --- CRUD PEGAWAI ---
    tambahPegawai(pegawaiBaru: any) {
      this.pegawaiList.push(pegawaiBaru)
      this.saveToStorage()
    },

    updatePegawai(id: number, dataUpdate: any) {
      const index = this.pegawaiList.findIndex(p => p.id === id)
      if (index !== -1) {
        this.pegawaiList[index] = dataUpdate
        this.saveToStorage()
      }
    },

    hapusPegawai(id: number) {
      if (confirm("Yakin ingin menghapus data pegawai ini? Semua riwayat Angka Kreditnya juga akan ikut terhapus!")) {
        this.pegawaiList = this.pegawaiList.filter(p => p.id !== id)
        this.riwayatList = this.riwayatList.filter(r => r.pegawai_id !== id)
        this.saveToStorage()
      }
    },

    // --- CRUD RIWAYAT ANGKA KREDIT ---
    simpanRiwayat(dataBaru: any, isEditing: boolean) {
      if (isEditing) {
        const index = this.riwayatList.findIndex((x: any) => x.id === dataBaru.id)
        if (index !== -1) {
          const itemLama = this.riwayatList[index]
          
          // PENGAMAN ERROR 1: Pastikan itemLama benar-benar ada sebelum dihitung
          if (itemLama) {
            const selisih = Number(dataBaru.ak_didapat || 0) - Number(itemLama.ak_didapat || 0)
            this.riwayatList[index] = dataBaru
            
            const peg = this.pegawaiList.find((p: any) => p.id === dataBaru.pegawai_id)
            if (peg) peg.total_ak_kumulatif = Number(peg.total_ak_kumulatif || 0) + selisih
          }
        }
      } else {
        this.riwayatList.push(dataBaru)
        const peg = this.pegawaiList.find((p: any) => p.id === dataBaru.pegawai_id)
        if (peg) peg.total_ak_kumulatif = Number(peg.total_ak_kumulatif || 0) + Number(dataBaru.ak_didapat || 0)
      }
      this.saveToStorage()
    },

    hapusRiwayat(id: number, pegawai_id: number) {
      const index = this.riwayatList.findIndex((x: any) => x.id === id)
      if (index !== -1) {
        const itemDihapus = this.riwayatList[index]
        
        // PENGAMAN ERROR 2: Pastikan itemDihapus tidak undefined
        if (itemDihapus) {
          const peg = this.pegawaiList.find((p: any) => p.id === pegawai_id)
          if (peg) {
            peg.total_ak_kumulatif = Number(peg.total_ak_kumulatif || 0) - Number(itemDihapus.ak_didapat || 0)
          }
          this.riwayatList.splice(index, 1)
          this.saveToStorage()
        }
      }
    },

    // --- UPDATE STATUS ---
    updateStatusPegawai(pegawaiId: number, statusBaru: string) {
      const pegawai = this.pegawaiList.find((p: any) => p.id === pegawaiId)
      if (pegawai) {
        // PENGAMAN ERROR 3: Gunakan as any untuk memaksa penulisan ke tipe Union
        (pegawai as any).status_kepegawaian = statusBaru
        this.saveToStorage()
      }
    }
  }
})