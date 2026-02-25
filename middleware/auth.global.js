// middleware/auth.global.js
export default defineNuxtRouteMiddleware((to, from) => {
  // Kita gunakan Cookie bawaan Nuxt untuk mengecek status login
  const isAuth = useCookie('isLoggedIn')

  // JIKA BELUM LOGIN, dan mencoba buka halaman selain /login -> Tendang ke /login
  if (!isAuth.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  // JIKA SUDAH LOGIN, tapi iseng mau buka halaman /login lagi -> Tendang ke Dashboard (/)
  if (isAuth.value && to.path === '/login') {
    return navigateTo('/')
  }
})