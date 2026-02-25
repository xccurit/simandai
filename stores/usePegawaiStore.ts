import { defineStore } from 'pinia'

const STORAGE_KEY = 'simandai_pegawai_store'

export type StatusKepegawaian = 'Aktif' | 'Tugas Belajar'

export interface Pegawai {
  id: number
  nama_lengkap: string
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
}

export interface RiwayatAK {
  id: number
  pegawai_id: number
  tahun: number
  bulan: number
  jabatan: string
  predikat: string
  ak_didapat: number
  sumber: string
}

interface PegawaiState {
  pegawaiList: Pegawai[]
  riwayatList: RiwayatAK[]
}

export const usePegawaiStore = defineStore('pegawai', {
  state: (): PegawaiState => ({
    pegawaiList: [],
    riwayatList: []
  }),

  actions: {
    loadFromStorage() {
      if (process.server) return
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed: PegawaiState = JSON.parse(saved)
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
        // Gunakan spread untuk memutus reference
        this.pegawaiList[index] = { ...dataBaru }
        this.saveToStorage()
      }
    },

    hapusPegawai(id: number) {
      this.pegawaiList = this.pegawaiList.filter(p => p.id !== id)
      this.riwayatList = this.riwayatList.filter(r => r.pegawai_id !== id)
      this.saveToStorage()
    }
  }
})