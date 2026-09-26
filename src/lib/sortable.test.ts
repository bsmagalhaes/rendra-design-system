// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { bindPointerDrag, findDragTarget, useSortable } from './sortable'

/** Cria um elemento com o atributo e o retângulo (getBoundingClientRect) dados. */
function elWithRect(attr: string, id: string, rect: { top: number; height: number }) {
  const el = document.createElement('div')
  el.setAttribute(attr, id)
  el.getBoundingClientRect = () =>
    ({ top: rect.top, height: rect.height, bottom: rect.top + rect.height }) as DOMRect
  document.body.appendChild(el)
  return el
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

/** jsdom não implementa elementFromPoint: substitui a função direto (spyOn exige que já exista). */
function mockElementFromPoint(el: Element | null) {
  document.elementFromPoint = (() => el) as typeof document.elementFromPoint
}

describe('findDragTarget', () => {
  it('devolve null quando não há elemento com o atributo sob o ponto', () => {
    mockElementFromPoint(null)
    expect(findDragTarget(10, 10)).toBeNull()
  })

  it('acha o item e diz se o ponto está antes do meio dele', () => {
    const el = elWithRect('data-sortable-id', 'b', { top: 100, height: 40 })
    mockElementFromPoint(el)
    expect(findDragTarget(0, 105, 'data-sortable-id')).toEqual({ id: 'b', before: true })
    expect(findDragTarget(0, 135, 'data-sortable-id')).toEqual({ id: 'b', before: false })
  })

  it('sobe até o ancestral com o atributo (closest)', () => {
    const parent = elWithRect('data-sortable-id', 'c', { top: 0, height: 20 })
    const child = document.createElement('span')
    parent.appendChild(child)
    mockElementFromPoint(child)
    expect(findDragTarget(0, 5)).toEqual({ id: 'c', before: true })
  })

  it('aceita outro atributo (o Kanban usa o dele, por exemplo data-kanban-card)', () => {
    const el = elWithRect('data-kanban-card', 'card-1', { top: 0, height: 10 })
    mockElementFromPoint(el)
    expect(findDragTarget(0, 2, 'data-kanban-card')).toEqual({ id: 'card-1', before: true })
    expect(findDragTarget(0, 2, 'data-sortable-id')).toBeNull()
  })
})

describe('bindPointerDrag', () => {
  it('entrega os movimentos e avisa ao soltar, ligado ao pointerId certo', () => {
    const node = document.createElement('button')
    document.body.appendChild(node)
    const onMove = vi.fn()
    const onEnd = vi.fn()
    bindPointerDrag(node, { pointerId: 7 } as PointerEvent, { onMove, onEnd })

    const move = new Event('pointermove') as PointerEvent
    Object.assign(move, { clientX: 12, clientY: 34, pointerId: 7 })
    window.dispatchEvent(move)
    expect(onMove).toHaveBeenCalledWith(12, 34)

    // pointerup de outro ponteiro não encerra este arraste.
    const upOther = new Event('pointerup') as PointerEvent
    Object.assign(upOther, { pointerId: 99 })
    window.dispatchEvent(upOther)
    expect(onEnd).not.toHaveBeenCalled()

    const up = new Event('pointerup') as PointerEvent
    Object.assign(up, { pointerId: 7 })
    window.dispatchEvent(up)
    expect(onEnd).toHaveBeenCalledTimes(1)

    // depois de soltar, não escuta mais mover.
    window.dispatchEvent(move)
    expect(onMove).toHaveBeenCalledTimes(1)
  })
})

describe('useSortable', () => {
  it('moveBy troca o item de posição uma vez e chama onReorder com a lista nova', () => {
    const onReorder = vi.fn()
    const items = [
      { id: 'a', data: 'A' },
      { id: 'b', data: 'B' },
      { id: 'c', data: 'C' },
    ]
    const { result } = renderHook(() => useSortable({ items, onReorder }))
    act(() => result.current.moveBy('a', 1))
    expect(onReorder).toHaveBeenCalledWith([
      { id: 'b', data: 'B' },
      { id: 'a', data: 'A' },
      { id: 'c', data: 'C' },
    ])
  })

  it('moveBy não faz nada nas bordas (primeiro para cima, último para baixo)', () => {
    const onReorder = vi.fn()
    const items = [
      { id: 'a', data: 'A' },
      { id: 'b', data: 'B' },
    ]
    const { result } = renderHook(() => useSortable({ items, onReorder }))
    act(() => result.current.moveBy('a', -1))
    act(() => result.current.moveBy('b', 1))
    expect(onReorder).not.toHaveBeenCalled()
  })

  it('sem onReorder, o pointerdown na alça não inicia arraste (motor só leitura)', () => {
    const items = [
      { id: 'a', data: 'A' },
      { id: 'b', data: 'B' },
    ]
    const { result } = renderHook(() => useSortable<string>({ items }))
    const handle = result.current.handleProps('a')
    expect(handle.className).toBe('touch-none')
    const node = document.createElement('button')
    document.body.appendChild(node)
    expect(() =>
      handle.onPointerDown({
        currentTarget: node,
        pointerId: 1,
      } as unknown as React.PointerEvent<HTMLElement>),
    ).not.toThrow()
  })

  it('arraste pelo pointer down/move/up na alça reordena via findDragTarget', () => {
    const onReorder = vi.fn()
    const items = [
      { id: 'a', data: 'A' },
      { id: 'b', data: 'B' },
      { id: 'c', data: 'C' },
    ]
    const { result } = renderHook(() => useSortable({ items, onReorder }))
    const target = elWithRect('data-sortable-id', 'c', { top: 100, height: 40 })
    mockElementFromPoint(target)

    const node = document.createElement('button')
    document.body.appendChild(node)
    act(() => {
      result.current.handleProps('a').onPointerDown({
        currentTarget: node,
        pointerId: 3,
      } as unknown as React.PointerEvent<HTMLElement>)
    })
    expect(result.current.draggingId).toBe('a')

    const move = new Event('pointermove') as PointerEvent
    Object.assign(move, { clientX: 0, clientY: 105, pointerId: 3 })
    act(() => window.dispatchEvent(move))
    expect(onReorder).toHaveBeenCalledWith([
      { id: 'b', data: 'B' },
      { id: 'a', data: 'A' },
      { id: 'c', data: 'C' },
    ])

    const up = new Event('pointerup') as PointerEvent
    Object.assign(up, { pointerId: 3 })
    act(() => window.dispatchEvent(up))
    expect(result.current.draggingId).toBeNull()
  })
})
