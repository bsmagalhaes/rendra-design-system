/*
 * WebP otimizado das capturas (regra 9 do guarda-chuva): grava o menor entre sem perda e com perda
 * q90 (subamostragem inteligente de croma, para o texto não sangrar). Usado por docs:images e og-image.
 */
import { writeFileSync } from 'node:fs'
import sharp from 'sharp'

export async function toWebp(input) {
  const [lossless, lossy] = await Promise.all([
    sharp(input).webp({ lossless: true, effort: 6 }).toBuffer(),
    sharp(input).webp({ quality: 90, effort: 6, smartSubsample: true }).toBuffer(),
  ])
  return lossless.length <= lossy.length ? lossless : lossy
}

export async function saveWebp(input, path) {
  const out = await toWebp(input)
  writeFileSync(path, out)
  return out.length
}
