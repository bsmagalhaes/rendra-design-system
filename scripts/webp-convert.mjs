#!/usr/bin/env node
/*
 * Converte para WebP otimizado os PNG de uma pasta: node scripts/webp-convert.mjs docs/images
 * Grava o .webp ao lado e apaga o PNG. Imprime tamanho antes e depois.
 */
import { readdirSync, readFileSync, statSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { saveWebp } from './lib/webp.mjs'

const dir = process.argv[2] ?? 'docs/images'
let antes = 0
let depois = 0
for (const f of readdirSync(dir)
  .filter((n) => n.endsWith('.png'))
  .sort()) {
  const src = join(dir, f)
  const a = statSync(src).size
  const b = await saveWebp(readFileSync(src), src.replace(/\.png$/, '.webp'))
  unlinkSync(src)
  antes += a
  depois += b
  console.log(`${f}\t${a}\t${b}`)
}
console.log(`TOTAL\t${antes}\t${depois}`)
