// stores/usePegawaiStore.ts
import { defineStore } from 'pinia'

// ==========================================
// 1. DEFINISI TIPE DATA (TYPESCRIPT)
// ==========================================
interface KamusPangkat {
  golru: string;
  nama: string;
  ak_kp: number | null;
}

interface KamusJabatan {
  keyword: string;
  nama: string;
  target_jenjang: number | null;
  next: string | null;
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

// Di dalam stores/usePegawaiStore.ts
interface RiwayatAK {
  id: number;
  pegawai_id: number;
  tahun: number;
  bulan_selesai?: number; // <--- TAMBAHKAN BARIS INI
  bulan: number;
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
    ] as KamusPangkat[], 

    kamusJabatan: [
      { keyword: 'pertama', nama: 'Ahli Pertama', target_jenjang: 100, next: 'Ahli Muda' },
      { keyword: 'muda', nama: 'Ahli Muda', target_jenjang: 200, next: 'Ahli Madya' },
      { keyword: 'madya', nama: 'Ahli Madya', target_jenjang: 450, next: 'Ahli Utama' },
      { keyword: 'utama', nama: 'Ahli Utama', target_jenjang: null, next: null },
      { keyword: 'terampil', nama: 'Terampil', target_jenjang: 40, next: 'Mahir' },
      { keyword: 'mahir', nama: 'Mahir', target_jenjang: 100, next: 'Penyelia' },
      { keyword: 'penyelia', nama: 'Penyelia', target_jenjang: null, next: null },
    ] as KamusJabatan[], 
    
    pegawaiList: [
      { id: 1, nip: '198501012010011001', nama: 'Budi Santoso', jabatan: 'Statistisi Muda', pangkat: 'Penata (III/c)', target_ak_tahunan: 25, unit_kerja: 'BPS Provinsi Kalteng', status_kepegawaian: 'Aktif', karpeg: 'B-010101', ttl: 'Palangka Raya, 10 Jan 1985', jk: 'Laki-laki', total_ak_kumulatif: 72.252 },
      { id: 2, nip: '199103052014101002', nama: 'Delly Rakasiwi, SST', jabatan: 'Pranata Komputer Ahli Muda', pangkat: 'Penata (III/c)', target_ak_tahunan: 25, unit_kerja: 'BPS Provinsi Kalteng', status_kepegawaian: 'Aktif', karpeg: 'B-08007477', ttl: 'Jakarta, 5 Maret 1991', jk: 'Laki-laki', total_ak_kumulatif: 72.251 },
    ] as Pegawai[],

    // TAMBAHAN: Gudang riwayat AK agar tidak reset saat pindah halaman
    riwayatList: [
      { id: 101, pegawai_id: 1, tahun: 2022, bulan: 12, jabatan: 'Ahli Pertama', predikat: '-', ak_didapat: 7.668, sumber: 'Migrasi Data Lama' },
      { id: 102, pegawai_id: 1, tahun: 2023, bulan: 10, jabatan: 'Ahli Pertama', predikat: 'Baik', ak_didapat: 10.417, sumber: 'Konversi SKP' },
      { id: 103, pegawai_id: 1, tahun: 2023, bulan: 2, jabatan: 'Ahli Muda', predikat: 'Baik', ak_didapat: 4.167, sumber: 'Konversi SKP' },
      { id: 104, pegawai_id: 1, tahun: 2024, bulan: 12, jabatan: 'Ahli Muda', predikat: 'Baik', ak_didapat: 25.000, sumber: 'Konversi SKP' },
      { id: 105, pegawai_id: 1, tahun: 2025, bulan: 12, jabatan: 'Ahli Muda', predikat: 'Baik', ak_didapat: 25.000, sumber: 'Konversi SKP' },
      // Copy Data Dummy juga untuk Delly Rakasiwi (ID: 13)
      { id: 106, pegawai_id: 2, tahun: 2022, bulan: 12, jabatan: 'Ahli Pertama', predikat: '-', ak_didapat: 7.668, sumber: 'Migrasi Data Lama' },
      { id: 107, pegawai_id: 2, tahun: 2023, bulan: 10, jabatan: 'Ahli Pertama', predikat: 'Baik', ak_didapat: 10.417, sumber: 'Konversi SKP' },
      { id: 108, pegawai_id: 2, tahun: 2023, bulan: 2, jabatan: 'Ahli Muda', predikat: 'Baik', ak_didapat: 4.167, sumber: 'Konversi SKP' },
      { id: 109, pegawai_id: 2, tahun: 2024, bulan: 12, jabatan: 'Ahli Muda', predikat: 'Baik', ak_didapat: 25.000, sumber: 'Konversi SKP' },
      { id: 110, pegawai_id: 2, tahun: 2025, bulan: 12, jabatan: 'Ahli Muda', predikat: 'Baik', ak_didapat: 25.000, sumber: 'Konversi SKP' },
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

    // FUNGSI CRUD RIWAYAT (SUDAH DIPERBAIKI TYPING-NYA)
    simpanRiwayat(dataBaru: RiwayatAK, isEditing: boolean) {
      if (isEditing) {
        const index = this.riwayatList.findIndex(x => x.id === dataBaru.id)
        if (index !== -1) {
          const itemLama = this.riwayatList[index] // Tampung dulu ke variabel
          
          // TS Guard: Pastikan itemLama benar-benar tidak undefined
          if (itemLama) {
            // Jika edit, hitung selisihnya lalu tambahkan ke total AK
            const selisih = dataBaru.ak_didapat - itemLama.ak_didapat
            this.riwayatList[index] = dataBaru
            this.tambahAngkaKredit(dataBaru.pegawai_id, selisih)
          }
        }
      } else {
        // Jika tambah baru, push ke gudang dan tambahkan poinnya
        this.riwayatList.push(dataBaru)
        this.tambahAngkaKredit(dataBaru.pegawai_id, dataBaru.ak_didapat)
      }
    },

    hapusRiwayat(id: number, pegawai_id: number) {
      const index = this.riwayatList.findIndex(x => x.id === id)
      if (index !== -1) {
        const itemDihapus = this.riwayatList[index] // Tampung dulu ke variabel
        
        // TS Guard: Pastikan itemDihapus benar-benar tidak undefined
        if (itemDihapus) {
          // Kurangi poin total sebelum riwayat dihapus
          this.tambahAngkaKredit(pegawai_id, -itemDihapus.ak_didapat)
          this.riwayatList.splice(index, 1)
        }
      }
    }
  }
})