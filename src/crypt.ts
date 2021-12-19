export function sha512(str: string) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then((buf) => {
    return Array.prototype.map.call(new Uint8Array(buf), (x) => ('00' + x.toString(16)).slice(-2)).join('')
  })
}

export function sha512Numeric(str: string) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then((buf) => {
    return Array.prototype.map.call(new Uint8Array(buf), (x) => x.toString(10)).join('')
  })
}
