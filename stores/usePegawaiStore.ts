// stores/usePegawaiStore.ts
import { defineStore } from 'pinia'

// ==========================================
// 1. DEFINISI TIPE DATA (TYPESCRIPT)
// ==========================================
interface KamusPangkat {
  golru: string;
  nama: string;
  ak_kp: number | null;
  next_golru: string; 
  next_nama: string;  
}

interface KamusJabatan {
  keyword: string;
  nama: string;
  koef_tahun: number;            // <--- TAMBAHKAN BARIS INI
  target_jenjang: number | null;
  next: string | null;           // <--- INI JUGA WAJIB ADA
}

interface Pegawai {
  id: number;
  nip: string;
  nama: string;
  jabatan: string;
  pangkat: string;
  target_ak_tahunan: number;
  unit_kerja: string;
  status_kepegawaian: string;
  karpeg: string;
  ttl: string;
  jk: string;
  total_ak_kumulatif: number;
}

interface RiwayatAK {
  id: number;
  pegawai_id: number;
  tahun: number;
  bulan_mulai: number;   // <--- DITAMBAHKAN: Bulan Awal
  bulan_selesai: number; // <--- DITAMBAHKAN: Bulan Akhir
  bulan: number;         // Durasi (Hasil Kalkulasi)
  jabatan: string;
  predikat: string;
  ak_didapat: number;
  sumber: string;
}

export const usePegawaiStore = defineStore('pegawai', {
  // ==========================================
  // 2. STATE (GUDANG DATA)
  // ==========================================
  state: () => ({
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
    ] as KamusPangkat[],

    kamusJabatan: [
      { keyword: 'Utama', nama: 'Ahli Utama', koef_tahun: 50, target_jenjang: null },
      { keyword: 'Madya', nama: 'Ahli Madya', koef_tahun: 37.5, target_jenjang: 450 },
      { keyword: 'Muda', nama: 'Ahli Muda', koef_tahun: 25, target_jenjang: 200 },
      { keyword: 'Pertama', nama: 'Ahli Pertama', koef_tahun: 12.5, target_jenjang: 100 },
      { keyword: 'Penyelia', nama: 'Penyelia', koef_tahun: 25, target_jenjang: null },
      { keyword: 'Mahir', nama: 'Mahir', koef_tahun: 12.5, target_jenjang: 100 },
      { keyword: 'Terampil', nama: 'Terampil', koef_tahun: 5, target_jenjang: 40 },
    ] as KamusJabatan[],
    
    pegawaiList: [
      { id: 1, nip: '198501012010011001', nama: 'Budi Santoso', jabatan: 'Statistisi Ahli Muda', pangkat: 'Penata (III/c)', target_ak_tahunan: 25, unit_kerja: 'BPS Provinsi Kalteng', status_kepegawaian: 'Aktif', karpeg: 'B-010101', ttl: 'Palangka Raya, 10 Jan 1985', jk: 'Laki-laki', total_ak_kumulatif: 72.252 },
      { id: 2, nip: '199103052014101002', nama: 'Delly Rakasiwi, SST', jabatan: 'Pranata Komputer Ahli Muda', pangkat: 'Penata (III/c)', target_ak_tahunan: 25, unit_kerja: 'BPS Provinsi Kalteng', status_kepegawaian: 'Aktif', karpeg: 'B-08007477', ttl: 'Jakarta, 5 Maret 1991', jk: 'Laki-laki', total_ak_kumulatif: 72.251 },
    ] as Pegawai[],

    riwayatList: [
      { id: 101, pegawai_id: 1, tahun: 2022, bulan_mulai: 1, bulan_selesai: 12, bulan: 12, jabatan: 'Ahli Pertama', predikat: '-', ak_didapat: 7.668, sumber: 'Migrasi Data Lama' },
      { id: 102, pegawai_id: 1, tahun: 2023, bulan_mulai: 1, bulan_selesai: 10, bulan: 10, jabatan: 'Ahli Pertama', predikat: 'Baik', ak_didapat: 10.417, sumber: 'Konversi SKP' },
      { id: 103, pegawai_id: 1, tahun: 2023, bulan_mulai: 11, bulan_selesai: 12, bulan: 2, jabatan: 'Ahli Muda', predikat: 'Baik', ak_didapat: 4.167, sumber: 'Konversi SKP' },
      { id: 104, pegawai_id: 1, tahun: 2024, bulan_mulai: 1, bulan_selesai: 12, bulan: 12, jabatan: 'Ahli Muda', predikat: 'Baik', ak_didapat: 25.000, sumber: 'Konversi SKP' },
      { id: 105, pegawai_id: 1, tahun: 2025, bulan_mulai: 1, bulan_selesai: 12, bulan: 12, jabatan: 'Ahli Muda', predikat: 'Baik', ak_didapat: 25.000, sumber: 'Konversi SKP' },
      { id: 101, pegawai_id: 2, tahun: 2022, bulan_mulai: 1, bulan_selesai: 12, bulan: 12, jabatan: 'Ahli Pertama', predikat: '-', ak_didapat: 7.668, sumber: 'Migrasi Data Lama' },
      { id: 102, pegawai_id: 2, tahun: 2023, bulan_mulai: 1, bulan_selesai: 10, bulan: 10, jabatan: 'Ahli Pertama', predikat: 'Baik', ak_didapat: 10.417, sumber: 'Konversi SKP' },
      { id: 103, pegawai_id: 2, tahun: 2023, bulan_mulai: 11, bulan_selesai: 12, bulan: 2, jabatan: 'Ahli Muda', predikat: 'Baik', ak_didapat: 4.167, sumber: 'Konversi SKP' },
      { id: 104, pegawai_id: 2, tahun: 2024, bulan_mulai: 1, bulan_selesai: 12, bulan: 12, jabatan: 'Ahli Muda', predikat: 'Baik', ak_didapat: 25.000, sumber: 'Konversi SKP' },
      { id: 105, pegawai_id: 2, tahun: 2025, bulan_mulai: 1, bulan_selesai: 12, bulan: 12, jabatan: 'Ahli Muda', predikat: 'Baik', ak_didapat: 25.000, sumber: 'Konversi SKP' },
    
    ] as RiwayatAK[]
  }),

  // ==========================================
  // 3. ACTIONS (FUNGSI UBAH DATA)
  // ==========================================
  actions: {
    tambahAngkaKredit(pegawaiId: number, nilaiAKTambahan: number | string) {
      const pegawai = this.pegawaiList.find((p: Pegawai) => p.id === pegawaiId)
      if (pegawai) {
        pegawai.total_ak_kumulatif += Number(nilaiAKTambahan)
      }
    },

    updateStatusPegawai(pegawaiId: number, statusBaru: string) {
      const pegawai = this.pegawaiList.find((p: Pegawai) => p.id === pegawaiId)
      if (pegawai) {
        pegawai.status_kepegawaian = statusBaru
      }
    },

    simpanRiwayat(dataBaru: RiwayatAK, isEditing: boolean) {
      if (isEditing) {
        const index = this.riwayatList.findIndex(x => x.id === dataBaru.id)
        if (index !== -1) {
          const itemLama = this.riwayatList[index]
          if (itemLama) {
            const selisih = dataBaru.ak_didapat - itemLama.ak_didapat
            this.riwayatList[index] = dataBaru
            this.tambahAngkaKredit(dataBaru.pegawai_id, selisih)
          }
        }
      } else {
        this.riwayatList.push(dataBaru)
        this.tambahAngkaKredit(dataBaru.pegawai_id, dataBaru.ak_didapat)
      }
    },

    hapusRiwayat(id: number, pegawai_id: number) {
      const index = this.riwayatList.findIndex(x => x.id === id)
      if (index !== -1) {
        const itemDihapus = this.riwayatList[index]
        if (itemDihapus) {
          this.tambahAngkaKredit(pegawai_id, -itemDihapus.ak_didapat)
          this.riwayatList.splice(index, 1)
        }
      }
    }
  }
})