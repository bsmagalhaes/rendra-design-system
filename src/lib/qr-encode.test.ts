import { describe, expect, it } from 'vitest'
import {
  buildDataCodewords,
  computeFormatBits,
  computeVersionBits,
  encodeQrMatrix,
  QrEncodingError,
  qrMatrixToSvgPath,
  readCodewordsForTest,
  reedSolomonComputeDivisor,
  reedSolomonEncode,
} from './qr-encode'

/*
 * Vetores conhecidos, publicados pelo tutorial da especificação ISO/IEC 18004
 * (thonky.com/qr-code-tutorial), usados para validar o codificador contra uma fonte externa,
 * não contra o próprio código.
 *
 * Atenção: o exemplo "HELLO WORLD" mais divulgado nesse tutorial (16 codewords de dados, 10
 * de correção) é do modo ALFANUMÉRICO, não do modo byte que este componente usa. Como
 * Reed-Solomon não depende do modo que gerou os codewords de dados, o vetor continua válido
 * para testar só o Reed-Solomon (abaixo). Para o modo byte, os 16 codewords de dados de
 * "HELLO WORLD" (versão 1, nível M) foram conferidos byte a byte à mão a partir do algoritmo
 * publicado (indicador de modo 0100, indicador de quantidade de 8 bits, um byte por
 * caractere, terminador e preenchimento com 0xEC/0x11): ver a demonstração abaixo.
 */

// Reed-Solomon: par publicado de codewords (16 dados -> 10 de correção), modo alfanumérico.
const RS_KNOWN_DATA = [32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17]
const RS_KNOWN_EC = [196, 35, 39, 119, 235, 215, 231, 226, 93, 23]

// "HELLO WORLD" em modo byte, versão 1, nível M: 13 codewords reais (indicador de modo,
// indicador de quantidade e os 11 bytes ASCII, deslocados 4 bits pelo cabeçalho) mais 3
// codewords de preenchimento (0xEC, 0x11, 0xEC), conferidos byte a byte à mão.
const HELLO_WORLD_BYTE_MODE_DATA = [
  64, 180, 132, 84, 196, 196, 242, 5, 116, 245, 36, 196, 64, 236, 17, 236,
]

// As 32 strings de informação de formato (4 níveis x 8 máscaras), publicadas na tabela do
// tutorial (format-version-tables), na ordem L, M, Q, H, máscara 0 a 7.
const FORMAT_STRINGS: Record<'L' | 'M' | 'Q' | 'H', string[]> = {
  L: [
    '111011111000100',
    '111001011110011',
    '111110110101010',
    '111100010011101',
    '110011000101111',
    '110001100011000',
    '110110001000001',
    '110100101110110',
  ],
  M: [
    '101010000010010',
    '101000100100101',
    '101111001111100',
    '101101101001011',
    '100010111111001',
    '100000011001110',
    '100111110010111',
    '100101010100000',
  ],
  Q: [
    '011010101011111',
    '011000001101000',
    '011111100110001',
    '011101000000110',
    '010010010110100',
    '010000110000011',
    '010111011011010',
    '010101111101101',
  ],
  H: [
    '001011010001001',
    '001001110111110',
    '001110011100111',
    '001100111010000',
    '000011101100010',
    '000001001010101',
    '000110100001100',
    '000100000111011',
  ],
}
const LEVEL_BITS_REF: Record<'L' | 'M' | 'Q' | 'H', number> = { L: 1, M: 0, Q: 3, H: 2 }

// As strings de informação de versão (18 bits) publicadas, versões 7 a 10.
const VERSION_STRINGS: Record<number, string> = {
  7: '000111110010010100',
  8: '001000010110111100',
  9: '001001101010011001',
  10: '001010010011010011',
}

describe('Reed-Solomon: vetor conhecido publicado', () => {
  it('gera exatamente os 10 codewords de correção publicados a partir dos 16 de dados', () => {
    expect(reedSolomonEncode(RS_KNOWN_DATA, 10)).toEqual(RS_KNOWN_EC)
  })

  it('o polinômio gerador de grau 10 tem 10 coeficientes', () => {
    expect(reedSolomonComputeDivisor(10)).toHaveLength(10)
  })
})

describe('Informação de formato: bate com a tabela publicada (32 combinações)', () => {
  it.each(Object.keys(FORMAT_STRINGS) as ('L' | 'M' | 'Q' | 'H')[])('nível %s', (level) => {
    for (let mask = 0; mask < 8; mask++) {
      const bits = computeFormatBits(LEVEL_BITS_REF[level], mask)
      const asString = bits.toString(2).padStart(15, '0')
      expect(asString, `nível ${level}, máscara ${mask}`).toBe(FORMAT_STRINGS[level][mask])
    }
  })
})

describe('Informação de versão: bate com a tabela publicada (versões 7 a 10)', () => {
  it.each([7, 8, 9, 10])('versão %i', (version) => {
    const bits = computeVersionBits(version)
    expect(bits.toString(2).padStart(18, '0')).toBe(VERSION_STRINGS[version])
  })
})

describe('buildDataCodewords: modo byte, "HELLO WORLD", versão 1 nível M', () => {
  it('bate byte a byte com o cálculo manual (cabeçalho + ASCII + preenchimento)', () => {
    const bytes = new TextEncoder().encode('HELLO WORLD')
    expect(buildDataCodewords(bytes, 1, 16)).toEqual(HELLO_WORLD_BYTE_MODE_DATA)
  })
})

describe('encodeQrMatrix: estrutura fixa (localizador, tempo, módulo escuro)', () => {
  // Comprimentos (em bytes) escolhidos para forçar cada versão no nível low, com base na
  // tabela oficial de codewords de dados (19, 34, ..., 156, ..., 274): um valor logo acima
  // da capacidade da versão anterior, sem estourar a da versão alvo.
  const FORCE_LENGTH: Record<number, number> = { 1: 1, 2: 18, 7: 135, 10: 231 }

  it.each([1, 2, 7, 10])(
    'versão %i tem o tamanho certo e os localizadores no padrão do QR',
    (v) => {
      const matrix = encodeQrMatrix('x'.repeat(FORCE_LENGTH[v] as number), 'low')
      expect(matrix.version).toBe(v)
      const size = v * 4 + 17
      expect(matrix.size).toBe(size)

      // Bullseye do localizador: escuro, escuro, claro, escuro, claro nas distâncias de
      // Chebyshev 0, 1, 2, 3, 4 a partir do centro (3,3) do localizador superior esquerdo.
      const expectByDistance: Record<number, boolean> = {
        0: true,
        1: true,
        2: false,
        3: true,
        4: false,
      }
      for (let dist = 0; dist <= 4; dist++) {
        expect(matrix.modules[3]?.[3 + dist]).toBe(expectByDistance[dist])
        expect(matrix.modules[3 + dist]?.[3]).toBe(expectByDistance[dist])
      }

      // Padrão de tempo: alterna claro/escuro a partir da coluna/linha 8.
      for (let i = 8; i < size - 8; i++) {
        expect(matrix.modules[6]?.[i]).toBe(i % 2 === 0)
        expect(matrix.modules[i]?.[6]).toBe(i % 2 === 0)
      }

      // Módulo escuro fixo, sempre em (linha 4*versão+9, coluna 8).
      expect(matrix.modules[4 * v + 9]?.[8]).toBe(true)
    },
  )
})

describe('encodeQrMatrix: vetor conhecido de ponta a ponta (HELLO WORLD, modo byte, 1-M)', () => {
  it('a matriz gerada devolve, módulo a módulo, os mesmos codewords calculados (dados + Reed-Solomon)', () => {
    const matrix = encodeQrMatrix('HELLO WORLD', 'medium')
    expect(matrix.version).toBe(1)
    expect(matrix.size).toBe(21)

    const expectedEc = reedSolomonEncode(HELLO_WORLD_BYTE_MODE_DATA, 10)
    const codewords = readCodewordsForTest(matrix, 'medium')
    expect(codewords).toEqual([...HELLO_WORLD_BYTE_MODE_DATA, ...expectedEc])
  })
})

describe('encodeQrMatrix: estados de erro e limites', () => {
  it('lança QrEncodingError quando o valor não cabe até a versão 10 no nível pedido', () => {
    expect(() => encodeQrMatrix('x'.repeat(2000), 'high')).toThrow(QrEncodingError)
  })

  it('aceita texto com acentuação (UTF-8) sem lançar', () => {
    const matrix = encodeQrMatrix('Ção com acentuação, ç ã õ é', 'medium')
    expect(matrix.version).toBeGreaterThanOrEqual(1)
  })

  it('nível de correção mais alto nunca precisa de uma versão menor para o mesmo texto', () => {
    const text = 'x'.repeat(60)
    const low = encodeQrMatrix(text, 'low')
    const high = encodeQrMatrix(text, 'high')
    expect(high.version).toBeGreaterThanOrEqual(low.version)
  })
})

describe('qrMatrixToSvgPath', () => {
  it('gera um comando de desenho por módulo escuro', () => {
    const matrix = encodeQrMatrix('RENDRA', 'medium')
    const path = qrMatrixToSvgPath(matrix)
    const darkCount = matrix.modules.reduce((sum, row) => sum + row.filter(Boolean).length, 0)
    expect(path.match(/M/g)?.length).toBe(darkCount)
  })

  it('matriz vazia de módulos produz path vazio', () => {
    const empty = {
      version: 1,
      size: 2,
      modules: [
        [false, false],
        [false, false],
      ],
    }
    expect(qrMatrixToSvgPath(empty)).toBe('')
  })
})
