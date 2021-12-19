import { TLDs } from './domains'

export function getDomain(url: string = 'misc') {
  try {
    const hostname = getHostnameFromUrl(url)
    let parts = hostname.split('.').reverse()
    while (parts.length > 0) {
      const part = parts.shift()
      if (part && !TLDs.includes(part)) {
        return part
      }
    }
    return url
  } catch (e) {
    return url
  }
}

function getHostnameFromUrl(url: string) {
  const urlObj = new URL(url)
  return urlObj.hostname
}
