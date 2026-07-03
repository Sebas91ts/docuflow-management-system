export function getCookie(name) {
  const cookies = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`))

  return cookies ? decodeURIComponent(cookies.split('=').slice(1).join('=')) : null
}

export function setCookie(name, value, maxAgeSeconds) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`
}

export function deleteCookie(name) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}
