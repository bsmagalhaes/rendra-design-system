/**
 * Codificador de QR Code próprio, sem biblioteca externa. Modo byte (qualquer texto,
 * inclusive acentos, via UTF-8), versões 1 a 10, as quatro correções de erro (L, M, Q, H),
 * Reed-Solomon em GF(256), as 8 máscaras com penalidade (ISO/IEC 18004) e informação de
 * formato (e de versão, a partir da versão 7). Cada etapa segue o algoritmo publicado do
 * padrão; as tabelas de capacidade, os coeficientes do Reed-Solomon e as posições de
 * alinhamento vêm da própria especificação.
 */

export type ErrorCorrectionLevel = 'low' | 'medium' | 'quartile' | 'high'

export interface QrMatrix {
  version: number
  size: number
  /** modules[linha][coluna]; true é módulo escuro. */
  modules: boolean[][]
}

/** Valor grande demais (ou codificação impossível) até a versão 10 no nível pedido. */
export class QrEncodingError extends Error {}

const LEVEL_LETTER: Record<ErrorCorrectionLevel, 'L' | 'M' | 'Q' | 'H'> = {
  low: 'L',
  medium: 'M',
  quartile: 'Q',
  high: 'H',
}

// Indicador de 2 bits do nível de correção de erro, usado na informação de formato.
const LEVEL_BITS: Record<ErrorCorrectionLevel, number> = { low: 1, medium: 0, quartile: 3, high: 2 }

interface BlockInfo {
  totalDataCodewords: number
  ecCodewordsPerBlock: number
  group1Blocks: number
  group1DataPerBlock: number
  group2Blocks: number
  group2DataPerBlock: number
}

// Tabela de blocos (ISO/IEC 18004), versões 1 a 10, quatro níveis de correção.
const CAPACITY: Record<number, Record<'L' | 'M' | 'Q' | 'H', BlockInfo>> = {
  1: {
    L: {
      totalDataCodewords: 19,
      ecCodewordsPerBlock: 7,
      group1Blocks: 1,
      group1DataPerBlock: 19,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
    M: {
      totalDataCodewords: 16,
      ecCodewordsPerBlock: 10,
      group1Blocks: 1,
      group1DataPerBlock: 16,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
    Q: {
      totalDataCodewords: 13,
      ecCodewordsPerBlock: 13,
      group1Blocks: 1,
      group1DataPerBlock: 13,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
    H: {
      totalDataCodewords: 9,
      ecCodewordsPerBlock: 17,
      group1Blocks: 1,
      group1DataPerBlock: 9,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
  },
  2: {
    L: {
      totalDataCodewords: 34,
      ecCodewordsPerBlock: 10,
      group1Blocks: 1,
      group1DataPerBlock: 34,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
    M: {
      totalDataCodewords: 28,
      ecCodewordsPerBlock: 16,
      group1Blocks: 1,
      group1DataPerBlock: 28,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
    Q: {
      totalDataCodewords: 22,
      ecCodewordsPerBlock: 22,
      group1Blocks: 1,
      group1DataPerBlock: 22,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
    H: {
      totalDataCodewords: 16,
      ecCodewordsPerBlock: 28,
      group1Blocks: 1,
      group1DataPerBlock: 16,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
  },
  3: {
    L: {
      totalDataCodewords: 55,
      ecCodewordsPerBlock: 15,
      group1Blocks: 1,
      group1DataPerBlock: 55,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
    M: {
      totalDataCodewords: 44,
      ecCodewordsPerBlock: 26,
      group1Blocks: 1,
      group1DataPerBlock: 44,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
    Q: {
      totalDataCodewords: 34,
      ecCodewordsPerBlock: 18,
      group1Blocks: 2,
      group1DataPerBlock: 17,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
    H: {
      totalDataCodewords: 26,
      ecCodewordsPerBlock: 22,
      group1Blocks: 2,
      group1DataPerBlock: 13,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
  },
  4: {
    L: {
      totalDataCodewords: 80,
      ecCodewordsPerBlock: 20,
      group1Blocks: 1,
      group1DataPerBlock: 80,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
    M: {
      totalDataCodewords: 64,
      ecCodewordsPerBlock: 18,
      group1Blocks: 2,
      group1DataPerBlock: 32,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
    Q: {
      totalDataCodewords: 48,
      ecCodewordsPerBlock: 26,
      group1Blocks: 2,
      group1DataPerBlock: 24,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
    H: {
      totalDataCodewords: 36,
      ecCodewordsPerBlock: 16,
      group1Blocks: 4,
      group1DataPerBlock: 9,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
  },
  5: {
    L: {
      totalDataCodewords: 108,
      ecCodewordsPerBlock: 26,
      group1Blocks: 1,
      group1DataPerBlock: 108,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
    M: {
      totalDataCodewords: 86,
      ecCodewordsPerBlock: 24,
      group1Blocks: 2,
      group1DataPerBlock: 43,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
    Q: {
      totalDataCodewords: 62,
      ecCodewordsPerBlock: 18,
      group1Blocks: 2,
      group1DataPerBlock: 15,
      group2Blocks: 2,
      group2DataPerBlock: 16,
    },
    H: {
      totalDataCodewords: 46,
      ecCodewordsPerBlock: 22,
      group1Blocks: 2,
      group1DataPerBlock: 11,
      group2Blocks: 2,
      group2DataPerBlock: 12,
    },
  },
  6: {
    L: {
      totalDataCodewords: 136,
      ecCodewordsPerBlock: 18,
      group1Blocks: 2,
      group1DataPerBlock: 68,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
    M: {
      totalDataCodewords: 108,
      ecCodewordsPerBlock: 16,
      group1Blocks: 4,
      group1DataPerBlock: 27,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
    Q: {
      totalDataCodewords: 76,
      ecCodewordsPerBlock: 24,
      group1Blocks: 4,
      group1DataPerBlock: 19,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
    H: {
      totalDataCodewords: 60,
      ecCodewordsPerBlock: 28,
      group1Blocks: 4,
      group1DataPerBlock: 15,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
  },
  7: {
    L: {
      totalDataCodewords: 156,
      ecCodewordsPerBlock: 20,
      group1Blocks: 2,
      group1DataPerBlock: 78,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
    M: {
      totalDataCodewords: 124,
      ecCodewordsPerBlock: 18,
      group1Blocks: 4,
      group1DataPerBlock: 31,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
    Q: {
      totalDataCodewords: 88,
      ecCodewordsPerBlock: 18,
      group1Blocks: 2,
      group1DataPerBlock: 14,
      group2Blocks: 4,
      group2DataPerBlock: 15,
    },
    H: {
      totalDataCodewords: 66,
      ecCodewordsPerBlock: 26,
      group1Blocks: 4,
      group1DataPerBlock: 13,
      group2Blocks: 1,
      group2DataPerBlock: 14,
    },
  },
  8: {
    L: {
      totalDataCodewords: 194,
      ecCodewordsPerBlock: 24,
      group1Blocks: 2,
      group1DataPerBlock: 97,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
    M: {
      totalDataCodewords: 154,
      ecCodewordsPerBlock: 22,
      group1Blocks: 2,
      group1DataPerBlock: 38,
      group2Blocks: 2,
      group2DataPerBlock: 39,
    },
    Q: {
      totalDataCodewords: 110,
      ecCodewordsPerBlock: 22,
      group1Blocks: 4,
      group1DataPerBlock: 18,
      group2Blocks: 2,
      group2DataPerBlock: 19,
    },
    H: {
      totalDataCodewords: 86,
      ecCodewordsPerBlock: 26,
      group1Blocks: 4,
      group1DataPerBlock: 14,
      group2Blocks: 2,
      group2DataPerBlock: 15,
    },
  },
  9: {
    L: {
      totalDataCodewords: 232,
      ecCodewordsPerBlock: 30,
      group1Blocks: 2,
      group1DataPerBlock: 116,
      group2Blocks: 0,
      group2DataPerBlock: 0,
    },
    M: {
      totalDataCodewords: 182,
      ecCodewordsPerBlock: 22,
      group1Blocks: 3,
      group1DataPerBlock: 36,
      group2Blocks: 2,
      group2DataPerBlock: 37,
    },
    Q: {
      totalDataCodewords: 132,
      ecCodewordsPerBlock: 20,
      group1Blocks: 4,
      group1DataPerBlock: 16,
      group2Blocks: 4,
      group2DataPerBlock: 17,
    },
    H: {
      totalDataCodewords: 100,
      ecCodewordsPerBlock: 24,
      group1Blocks: 4,
      group1DataPerBlock: 12,
      group2Blocks: 4,
      group2DataPerBlock: 13,
    },
  },
  10: {
    L: {
      totalDataCodewords: 274,
      ecCodewordsPerBlock: 18,
      group1Blocks: 2,
      group1DataPerBlock: 68,
      group2Blocks: 2,
      group2DataPerBlock: 69,
    },
    M: {
      totalDataCodewords: 216,
      ecCodewordsPerBlock: 26,
      group1Blocks: 4,
      group1DataPerBlock: 43,
      group2Blocks: 1,
      group2DataPerBlock: 44,
    },
    Q: {
      totalDataCodewords: 154,
      ecCodewordsPerBlock: 24,
      group1Blocks: 6,
      group1DataPerBlock: 19,
      group2Blocks: 2,
      group2DataPerBlock: 20,
    },
    H: {
      totalDataCodewords: 122,
      ecCodewordsPerBlock: 28,
      group1Blocks: 6,
      group1DataPerBlock: 15,
      group2Blocks: 2,
      group2DataPerBlock: 16,
    },
  },
}

export const QR_MAX_VERSION = 10

// Coordenadas candidatas do padrão de alinhamento (linha ou coluna), por versão. A versão 1
// não tem padrão de alinhamento. Os módulos reais são o produto cartesiano da lista consigo
// mesma, menos os três cantos que colidiriam com os localizadores.
const ALIGNMENT_COORDS: Record<number, number[]> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
}

/* --------------------------------------------------------------- Reed-Solomon em GF(256) */

// Multiplicação em GF(2^8) com o polinômio primitivo 0x11D (x^8 + x^4 + x^3 + x^2 + 1).
export function reedSolomonMultiply(x: number, y: number): number {
  let z = 0
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d)
    z ^= ((y >>> i) & 1) * x
  }
  return z & 0xff
}

/** Polinômio gerador de grau `degree` (produto de (x - 2^i) para i de 0 a degree-1). */
export function reedSolomonComputeDivisor(degree: number): number[] {
  const result: number[] = new Array(degree - 1).fill(0)
  result.push(1)
  let root = 1
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = reedSolomonMultiply(result[j] as number, root)
      if (j + 1 < result.length) result[j] = (result[j] as number) ^ (result[j + 1] as number)
    }
    root = reedSolomonMultiply(root, 0x02)
  }
  return result
}

/** Resto da divisão polinomial de `data` pelo `divisor`: os codewords de correção de erro. */
export function reedSolomonComputeRemainder(data: number[], divisor: number[]): number[] {
  const result = divisor.map(() => 0)
  for (const b of data) {
    const factor = b ^ (result.shift() as number)
    result.push(0)
    divisor.forEach((coef, i) => {
      result[i] = (result[i] as number) ^ reedSolomonMultiply(coef, factor)
    })
  }
  return result
}

/** Codewords de correção de erro para `data`, com `ecLength` codewords de saída. */
export function reedSolomonEncode(data: number[], ecLength: number): number[] {
  return reedSolomonComputeRemainder(data, reedSolomonComputeDivisor(ecLength))
}

/* --------------------------------------------------------------------- Dados (modo byte) */

function pushBits(bits: number[], value: number, length: number): void {
  for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1)
}

/** Exportada só para teste direto (isola a montagem dos codewords de dados do resto do pipeline). */
export function buildDataCodewords(
  bytes: Uint8Array,
  version: number,
  totalDataCodewords: number,
): number[] {
  const bits: number[] = []
  pushBits(bits, 0b0100, 4) // indicador de modo: byte
  const countBits = version <= 9 ? 8 : 16
  pushBits(bits, bytes.length, countBits)
  for (const b of bytes) pushBits(bits, b, 8)

  const capacityBits = totalDataCodewords * 8
  const terminator = Math.min(4, Math.max(0, capacityBits - bits.length))
  for (let i = 0; i < terminator; i++) bits.push(0)
  while (bits.length % 8 !== 0) bits.push(0)

  const codewords: number[] = []
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0
    for (let j = 0; j < 8; j++) byte = (byte << 1) | (bits[i + j] as number)
    codewords.push(byte)
  }
  const pad = [0xec, 0x11]
  let p = 0
  while (codewords.length < totalDataCodewords) {
    codewords.push(pad[p % 2] as number)
    p++
  }
  return codewords
}

/** Separa em blocos, aplica Reed-Solomon por bloco e intercala dados e correção. */
function structureCodewords(dataCodewords: number[], info: BlockInfo): number[] {
  const blocks: number[][] = []
  let offset = 0
  for (let i = 0; i < info.group1Blocks; i++) {
    blocks.push(dataCodewords.slice(offset, offset + info.group1DataPerBlock))
    offset += info.group1DataPerBlock
  }
  for (let i = 0; i < info.group2Blocks; i++) {
    blocks.push(dataCodewords.slice(offset, offset + info.group2DataPerBlock))
    offset += info.group2DataPerBlock
  }
  const ecBlocks = blocks.map((block) => reedSolomonEncode(block, info.ecCodewordsPerBlock))

  const result: number[] = []
  const maxDataLen = Math.max(info.group1DataPerBlock, info.group2DataPerBlock)
  for (let i = 0; i < maxDataLen; i++) {
    for (const block of blocks) if (i < block.length) result.push(block[i] as number)
  }
  for (let i = 0; i < info.ecCodewordsPerBlock; i++) {
    for (const ec of ecBlocks) result.push(ec[i] as number)
  }
  return result
}

function codewordsToBits(codewords: number[]): number[] {
  const bits: number[] = []
  for (const b of codewords) for (let i = 7; i >= 0; i--) bits.push((b >>> i) & 1)
  return bits
}

/* --------------------------------------------------------------- Informação de formato e versão */

function getBit(value: number, index: number): boolean {
  return ((value >>> index) & 1) !== 0
}

/** BCH(15,5) da informação de formato: nível (2 bits) + máscara (3 bits), com a máscara fixa 0x5412. */
export function computeFormatBits(levelBits: number, mask: number): number {
  const data = (levelBits << 3) | mask
  let rem = data
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
  return ((data << 10) | rem) ^ 0x5412
}

/** BCH(18,6) da informação de versão (só usada a partir da versão 7). */
export function computeVersionBits(version: number): number {
  let rem = version
  for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25)
  return (version << 12) | rem
}

/** Escreve (e reserva) os 15 módulos de formato, nas duas cópias, mais o módulo escuro fixo. */
function drawFormatBits(
  matrix: boolean[][],
  reserved: boolean[][],
  size: number,
  bits: number,
): void {
  const set = (col: number, row: number, dark: boolean) => {
    ;(matrix[row] as boolean[])[col] = dark
    ;(reserved[row] as boolean[])[col] = true
  }
  for (let i = 0; i <= 5; i++) set(8, i, getBit(bits, i))
  set(8, 7, getBit(bits, 6))
  set(8, 8, getBit(bits, 7))
  set(7, 8, getBit(bits, 8))
  for (let i = 9; i < 15; i++) set(14 - i, 8, getBit(bits, i))
  for (let i = 0; i <= 7; i++) set(size - 1 - i, 8, getBit(bits, i))
  for (let i = 8; i < 15; i++) set(8, size - 15 + i, getBit(bits, i))
  set(8, size - 8, true) // módulo escuro, sempre fixo
}

/** Escreve os dois blocos (3x6 e 6x3) da informação de versão, a partir da versão 7. */
function drawVersionBits(matrix: boolean[][], size: number, version: number, bits: number): void {
  if (version < 7) return
  for (let i = 0; i < 18; i++) {
    const bit = getBit(bits, i)
    const a = size - 11 + (i % 3)
    const b = Math.floor(i / 3)
    ;(matrix[b] as boolean[])[a] = bit
    ;(matrix[a] as boolean[])[b] = bit
  }
}

/* ------------------------------------------------------------------------ Padrões fixos */

interface Template {
  matrix: boolean[][]
  reserved: boolean[][]
  size: number
}

function buildTemplate(version: number): Template {
  const size = version * 4 + 17
  const matrix: boolean[][] = Array.from(
    { length: size },
    () => new Array(size).fill(false) as boolean[],
  )
  const reserved: boolean[][] = Array.from(
    { length: size },
    () => new Array(size).fill(false) as boolean[],
  )

  const drawFinder = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx
        const y = cy + dy
        if (x < 0 || x >= size || y < 0 || y >= size) continue
        const dist = Math.max(Math.abs(dx), Math.abs(dy))
        ;(reserved[y] as boolean[])[x] = true
        ;(matrix[y] as boolean[])[x] = dist !== 2 && dist !== 4
      }
    }
  }
  drawFinder(3, 3)
  drawFinder(size - 4, 3)
  drawFinder(3, size - 4)

  const drawAlignment = (cx: number, cy: number) => {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const x = cx + dx
        const y = cy + dy
        ;(reserved[y] as boolean[])[x] = true
        ;(matrix[y] as boolean[])[x] = Math.max(Math.abs(dx), Math.abs(dy)) !== 1
      }
    }
  }
  const coords = ALIGNMENT_COORDS[version] ?? []
  const first = coords[0]
  const last = coords[coords.length - 1]
  for (const r of coords) {
    for (const c of coords) {
      if (
        (r === first && c === first) ||
        (r === first && c === last) ||
        (r === last && c === first)
      )
        continue
      drawAlignment(c, r)
    }
  }

  for (let i = 8; i < size - 8; i++) {
    ;(reserved[6] as boolean[])[i] = true
    ;(matrix[6] as boolean[])[i] = i % 2 === 0
    ;(reserved[i] as boolean[])[6] = true
    ;(matrix[i] as boolean[])[6] = i % 2 === 0
  }

  // Reserva a área da informação de formato (o conteúdo real entra depois da máscara escolhida).
  drawFormatBits(matrix, reserved, size, 0)

  if (version >= 7) {
    for (let i = 0; i < 18; i++) {
      const a = size - 11 + (i % 3)
      const b = Math.floor(i / 3)
      ;(reserved[b] as boolean[])[a] = true
      ;(reserved[a] as boolean[])[b] = true
    }
  }

  return { matrix, reserved, size }
}

/** Zigue-zague clássico: de baixo para cima e de cima para baixo, colunas de 2 em 2,
 *  da direita para a esquerda, pulando a coluna do padrão de tempo vertical. */
function placeDataBits(
  matrix: boolean[][],
  reserved: boolean[][],
  size: number,
  bits: number[],
): void {
  let bitIndex = 0
  let upward = true
  for (let colRight = size - 1; colRight >= 1; colRight -= 2) {
    if (colRight === 6) colRight--
    for (let vert = 0; vert < size; vert++) {
      const row = upward ? size - 1 - vert : vert
      for (const col of [colRight, colRight - 1]) {
        if ((reserved[row] as boolean[])[col]) continue
        const bit = bitIndex < bits.length ? bits[bitIndex] : 0
        ;(matrix[row] as boolean[])[col] = bit === 1
        bitIndex++
      }
    }
    upward = !upward
  }
}

/* ------------------------------------------------------------------------------ Máscaras */

const MASK_FNS: ((r: number, c: number) => boolean)[] = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
]

function applyMask(
  matrix: boolean[][],
  reserved: boolean[][],
  size: number,
  maskId: number,
): boolean[][] {
  const fn = MASK_FNS[maskId] as (r: number, c: number) => boolean
  const out: boolean[][] = []
  for (let r = 0; r < size; r++) {
    const row: boolean[] = []
    for (let c = 0; c < size; c++) {
      const v = (matrix[r] as boolean[])[c] as boolean
      row.push((reserved[r] as boolean[])[c] ? v : v !== fn(r, c))
    }
    out.push(row)
  }
  return out
}

function runPenalty(bits: boolean[]): number {
  let total = 0
  let runLen = 1
  for (let i = 1; i <= bits.length; i++) {
    if (i < bits.length && bits[i] === bits[i - 1]) {
      runLen++
      continue
    }
    if (runLen >= 5) total += 3 + (runLen - 5)
    runLen = 1
  }
  return total
}

const FINDER_LIKE_PATTERN = [true, false, true, true, true, false, true]

function finderLikeCount(bits: boolean[]): number {
  let count = 0
  for (let i = 0; i + 7 <= bits.length; i++) {
    let matches = true
    for (let k = 0; k < 7; k++) {
      if (bits[i + k] !== FINDER_LIKE_PATTERN[k]) {
        matches = false
        break
      }
    }
    if (!matches) continue
    const before = i >= 4 && bits.slice(i - 4, i).every((b) => !b)
    const after = i + 11 <= bits.length && bits.slice(i + 7, i + 11).every((b) => !b)
    if (before || after) count++
  }
  return count
}

/** As quatro regras de penalidade da máscara (ISO/IEC 18004: 3, 3, 40 e a proporção de módulos escuros). */
export function computeMaskPenalty(matrix: boolean[][], size: number): number {
  let penalty = 0
  for (let r = 0; r < size; r++) penalty += runPenalty(matrix[r] as boolean[])
  for (let c = 0; c < size; c++) penalty += runPenalty(matrix.map((row) => row[c] as boolean))

  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = (matrix[r] as boolean[])[c]
      if (
        v === (matrix[r] as boolean[])[c + 1] &&
        v === (matrix[r + 1] as boolean[])[c] &&
        v === (matrix[r + 1] as boolean[])[c + 1]
      ) {
        penalty += 3
      }
    }
  }

  for (let r = 0; r < size; r++) penalty += finderLikeCount(matrix[r] as boolean[]) * 40
  for (let c = 0; c < size; c++)
    penalty += finderLikeCount(matrix.map((row) => row[c] as boolean)) * 40

  const total = size * size
  const dark = matrix.reduce((sum, row) => sum + row.filter(Boolean).length, 0)
  const percent = (dark * 100) / total
  const a = Math.floor(percent / 5) * 5
  const b = a + 5
  penalty += (Math.min(Math.abs(a - 50), Math.abs(b - 50)) / 5) * 10

  return penalty
}

/* --------------------------------------------------------------------------- API pública */

/**
 * Codifica `value` (modo byte, UTF-8) num QR Code, escolhendo a menor versão (1 a 10) que
 * comporta o valor no nível de correção pedido. Lança QrEncodingError se não couber em
 * nenhuma versão suportada.
 */
export function encodeQrMatrix(value: string, level: ErrorCorrectionLevel = 'medium'): QrMatrix {
  const bytes = new TextEncoder().encode(value)
  const letter = LEVEL_LETTER[level]

  let chosenVersion: number | null = null
  let info: BlockInfo | null = null
  for (let version = 1; version <= QR_MAX_VERSION; version++) {
    const candidate = (CAPACITY[version] as Record<'L' | 'M' | 'Q' | 'H', BlockInfo>)[letter]
    const countBits = version <= 9 ? 8 : 16
    const needed = 4 + countBits + bytes.length * 8
    if (needed <= candidate.totalDataCodewords * 8) {
      chosenVersion = version
      info = candidate
      break
    }
  }
  if (chosenVersion === null || info === null) {
    throw new QrEncodingError(
      `Valor grande demais para um QR Code até a versão ${QR_MAX_VERSION} neste nível de correção.`,
    )
  }

  const dataCodewords = buildDataCodewords(bytes, chosenVersion, info.totalDataCodewords)
  const allCodewords = structureCodewords(dataCodewords, info)
  const dataBits = codewordsToBits(allCodewords)

  const { matrix, reserved, size } = buildTemplate(chosenVersion)
  placeDataBits(matrix, reserved, size, dataBits)

  let bestMask = 0
  let bestPenalty = Number.POSITIVE_INFINITY
  let bestMatrix = matrix
  for (let maskId = 0; maskId < 8; maskId++) {
    const masked = applyMask(matrix, reserved, size, maskId)
    const penalty = computeMaskPenalty(masked, size)
    if (penalty < bestPenalty) {
      bestPenalty = penalty
      bestMask = maskId
      bestMatrix = masked
    }
  }

  const formatBits = computeFormatBits(LEVEL_BITS[level], bestMask)
  drawFormatBits(bestMatrix, reserved, size, formatBits)
  if (chosenVersion >= 7) {
    drawVersionBits(bestMatrix, size, chosenVersion, computeVersionBits(chosenVersion))
  }

  return { version: chosenVersion, size, modules: bestMatrix }
}

/**
 * Só para teste: relê os codewords (dados + correção de erro) de um QrMatrix já pronto,
 * redescobrindo a máscara pela informação de formato armazenada. Serve para comparar a
 * saída do codificador com um valor publicado, sem repetir a tabela de máscaras aqui.
 */
export function readCodewordsForTest(matrix: QrMatrix, level: ErrorCorrectionLevel): number[] {
  const { reserved, size } = buildTemplate(matrix.version)

  let maskId = 0
  for (let candidate = 0; candidate < 8; candidate++) {
    const bits = computeFormatBits(LEVEL_BITS[level], candidate)
    const scratch: boolean[][] = Array.from(
      { length: size },
      () => new Array(size).fill(false) as boolean[],
    )
    const scratchReserved: boolean[][] = Array.from(
      { length: size },
      () => new Array(size).fill(false) as boolean[],
    )
    drawFormatBits(scratch, scratchReserved, size, bits)
    let allMatch = true
    for (let r = 0; r < size && allMatch; r++) {
      for (let c = 0; c < size; c++) {
        if (
          (scratchReserved[r] as boolean[])[c] &&
          (scratch[r] as boolean[])[c] !== (matrix.modules[r] as boolean[])[c]
        ) {
          allMatch = false
          break
        }
      }
    }
    if (allMatch) {
      maskId = candidate
      break
    }
  }

  const fn = MASK_FNS[maskId] as (r: number, c: number) => boolean
  const bits: number[] = []
  let upward = true
  for (let colRight = size - 1; colRight >= 1; colRight -= 2) {
    if (colRight === 6) colRight--
    for (let vert = 0; vert < size; vert++) {
      const row = upward ? size - 1 - vert : vert
      for (const col of [colRight, colRight - 1]) {
        if ((reserved[row] as boolean[])[col]) continue
        const masked = (matrix.modules[row] as boolean[])[col] as boolean
        bits.push(masked !== fn(row, col) ? 1 : 0)
      }
    }
    upward = !upward
  }
  const codewords: number[] = []
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    let byte = 0
    for (let j = 0; j < 8; j++) byte = (byte << 1) | (bits[i + j] as number)
    codewords.push(byte)
  }
  return codewords
}

/** Um único `<path>` com todos os módulos escuros, para `fill="currentColor"` no SVG. */
export function qrMatrixToSvgPath(matrix: QrMatrix): string {
  let d = ''
  for (let r = 0; r < matrix.size; r++) {
    for (let c = 0; c < matrix.size; c++) {
      if ((matrix.modules[r] as boolean[])[c]) d += `M${c} ${r}h1v1h-1z`
    }
  }
  return d
}
