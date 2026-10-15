const MAX_SIDE = 512

// Light logos (e.g. white on transparent) are stored with this marker in the file
// name so badges can show them on a dark background instead of white.
const LIGHT_MARK = '-light.'

export const isLightLogo = (url) => !!url?.includes(LIGHT_MARK)

// Trims empty padding around a logo, shrinks it to MAX_SIDE and works out whether
// it needs a dark background. Falls back to the original file if anything fails.
export async function prepareLogo(file) {
  try {
    const img = await loadImage(file)
    const w = img.naturalWidth
    const h = img.naturalHeight
    if (!w || !h) return { blob: file, ext: extOf(file), light: false }

    const src = document.createElement('canvas')
    src.width = w
    src.height = h
    const ctx = src.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(img, 0, 0)
    const { data } = ctx.getImageData(0, 0, w, h)

    // Background = top-left pixel: transparent, or a solid colour (e.g. white).
    const bg = [data[0], data[1], data[2], data[3]]
    const transparentBg = bg[3] < 10
    const isContent = (i) =>
      transparentBg
        ? data[i + 3] > 10
        : Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) > 36

    let minX = w, minY = h, maxX = -1, maxY = -1
    let lumSum = 0, alphaSum = 0
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4
        if (!isContent(i)) continue
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
        const a = data[i + 3]
        lumSum += (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) * a
        alphaSum += a
      }
    }
    if (maxX < 0) return { blob: file, ext: extOf(file), light: false }

    const cw = maxX - minX + 1
    const ch = maxY - minY + 1
    const scale = Math.min(1, MAX_SIDE / Math.max(cw, ch))
    const out = document.createElement('canvas')
    out.width = Math.round(cw * scale)
    out.height = Math.round(ch * scale)
    out.getContext('2d').drawImage(src, minX, minY, cw, ch, 0, 0, out.width, out.height)

    const blob = await new Promise((resolve) => out.toBlob(resolve, 'image/png'))
    if (!blob) return { blob: file, ext: extOf(file), light: false }
    const light = transparentBg && alphaSum > 0 && lumSum / alphaSum > 215
    return { blob, ext: 'png', light }
  } catch {
    return { blob: file, ext: extOf(file), light: false }
  }
}

export const logoFileName = (id, ext, light) => `${id}${light ? LIGHT_MARK.slice(0, -1) : ''}.${ext}`

function extOf(file) {
  return (file.name.split('.').pop() || 'png').toLowerCase()
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}
