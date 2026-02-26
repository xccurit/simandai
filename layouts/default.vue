<script setup>
import { useRouter } from 'vue-router'
import { useCookie } from '#app'
import { ref } from 'vue'

const router = useRouter()
const isAuth = useCookie('isLoggedIn')

const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
    isAuth.value = null
    router.push('/login')
  }
}

const isSidebarOpen = ref(false)
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    
    <div class="md:hidden flex items-center bg-white border-b border-gray-200 fixed w-full z-30 shadow-sm top-0 left-0 h-14 no-print overflow-hidden">
      <div class="bg-white z-10 px-4 py-2 h-full flex items-center shadow-[10px_0_15px_-10px_rgba(255,255,255,1)]">
        <button @click="isSidebarOpen = !isSidebarOpen" class="text-gray-600 hover:text-bps-blue p-1 rounded focus:outline-none">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>
      <div class="marquee-container flex-1 h-full flex items-center">
        <h1 class="marquee-text-slow text-[20px] font-extrabold text-bps-blue tracking-wider uppercase">
          SISTEM INFORMASI MANAJEMEN DATA PEGAWAI
        </h1>
      </div>
    </div>

    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity no-print"></div>

    <aside 
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      class="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-50 transition-transform duration-300 ease-in-out md:translate-x-0 no-print"
    >
      <div class="h-16 flex items-center pl-4 border-b border-gray-200 overflow-hidden bg-white">
        <div class="z-10 bg-white pr-3 py-2 shadow-[10px_0_15px_-10px_rgba(255,255,255,1)]">
          <img src="/logo-bps-kalteng1.png" alt="Logo BPS" class="h-8 w-auto relative" />
        </div>
        <div class="marquee-container flex-1 h-full flex items-center">
          <h1 class="marquee-text text-xl font-extrabold text-bps-blue tracking-wider uppercase">
            SIMANDAI
          </h1>
        </div>
      </div>
      
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu Utama</p>
        <NuxtLink @click="isSidebarOpen = false" to="/" class="menu-item">Dashboard</NuxtLink>
        <NuxtLink @click="isSidebarOpen = false" to="/data-pegawai" class="menu-item">Data Pegawai</NuxtLink>

        <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2">Fungsional & Karir</p>
        <NuxtLink @click="isSidebarOpen = false" to="/angka-kredit" class="menu-item">Angka Kredit</NuxtLink>
        <NuxtLink @click="isSidebarOpen = false" to="/usulan-kenaikan" class="menu-item">Usulan Kenaikan</NuxtLink>

        <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2">Organisasi & Kompetensi</p>
        <NuxtLink @click="isSidebarOpen = false" to="/analisis-beban-kerja" class="menu-item">Analisis Beban Kerja</NuxtLink>
        <NuxtLink @click="isSidebarOpen = false" to="/kompetensi/jabatan" class="menu-item ml-2 text-sm">Kompetensi Jabatan</NuxtLink>
        <NuxtLink @click="isSidebarOpen = false" to="/kompetensi/layanan" class="menu-item ml-2 text-sm">Kompetensi Layanan</NuxtLink>

        <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2">Lainnya</p>
        <NuxtLink @click="isSidebarOpen = false" to="/reward-punishment" class="menu-item">Reward & Punishment</NuxtLink>
      </nav>

      <div class="border-t border-gray-200 p-3">
        <button @click="handleLogout" class="w-full flex items-center justify-between p-2 hover:bg-red-50 rounded-lg transition-colors group">
          <div class="flex items-center text-left">
            <div class="w-8 h-8 rounded-full bg-bps-blue text-white flex items-center justify-center font-bold group-hover:bg-red-600 transition-colors">
              A
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-700 group-hover:text-red-700 transition-colors">Admin BPS</p>
              <p class="text-xs text-gray-500 group-hover:text-red-500 transition-colors">Super Admin</p>
            </div>
          </div>
          <div class="text-gray-400 group-hover:text-red-600 mr-1" title="Keluar">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
        </button>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 md:ml-64 w-full mt-14 md:mt-0 relative print-main">
      <slot />
    </main>
    
  </div>
</template>

<style scoped>
.menu-item {
  @apply flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-bps-light hover:text-bps-blue transition-colors;
}
.router-link-active {
  @apply bg-bps-blue text-white hover:bg-bps-dark hover:text-white;
}
.marquee-container { overflow: hidden; white-space: nowrap; position: relative; width: 100%; }
.marquee-text { display: inline-block; padding-left: 100%; animation: scroll-left 6s linear infinite; }
.marquee-text-slow { display: inline-block; padding-left: 100%; animation: scroll-left 15s linear infinite; }
@keyframes scroll-left { 0% { transform: translate(0, 0); } 100% { transform: translate(-100%, 0); } }
@media print { .no-print { display: none !important; } .print-main { margin-left: 0 !important; padding: 0 !important; margin-top: 0 !important; } }
</style>