<template>
  <div class="flex h-screen bg-gray-50">
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
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
        <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Menu Utama
        </p>
        
        <NuxtLink to="/" class="menu-item">
          Dashboard
        </NuxtLink>
        <NuxtLink to="/data-pegawai" class="menu-item">
          Data Pegawai
        </NuxtLink>

        <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2">
          Fungsional & Karir
        </p>
        <NuxtLink to="/angka-kredit" class="menu-item">
          Angka Kredit
        </NuxtLink>
        <NuxtLink to="/mutasi-kenaikan" class="menu-item">
          Usulan Kenaikan
        </NuxtLink>

        <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2">
          Organisasi & Kompetensi
        </p>
        <NuxtLink to="/analisis-beban-kerja" class="menu-item">
          Analisis Beban Kerja
        </NuxtLink>
        
        <NuxtLink to="/kompetensi/jabatan" class="menu-item ml-2 text-sm">
          Kompetensi Jabatan
        </NuxtLink>
        <NuxtLink to="/kompetensi/layanan" class="menu-item ml-2 text-sm">
          Kompetensi Layanan
        </NuxtLink>

        <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2">
          Lainnya
        </p>
        <NuxtLink to="/reward-punishment" class="menu-item">
          Reward & Punishment
        </NuxtLink>
      </nav>

      <div class="border-t border-gray-200 p-4">
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full bg-bps-blue text-white flex items-center justify-center font-bold">
            A
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-700">Admin BPS</p>
            <p class="text-xs text-gray-500">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>

    <main class="flex-1 ml-64 p-8 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.menu-item {
  @apply flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-bps-light hover:text-bps-blue transition-colors;
}
/* Style khusus untuk link yang sedang aktif */
.router-link-active {
  @apply bg-bps-blue text-white hover:bg-bps-dark hover:text-white;
}

/* --- ANIMASI TEKS BERJALAN (MARQUEE) --- */
.marquee-container {
  overflow: hidden;
  white-space: nowrap;
  position: relative;
  width: 100%;
}

.marquee-text {
  display: inline-block;
  padding-left: 100%; /* Memulai teks tepat di luar batas kanan */
  animation: scroll-left 6s linear infinite; /* 6s adalah kecepatan, semakin kecil semakin cepat */
}

@keyframes scroll-left {
  0% { 
    transform: translate(0, 0); 
  }
  100% { 
    transform: translate(-100%, 0); 
  }
}
</style>