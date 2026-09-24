import { describe, expect, it } from 'vitest'
import { moveKanbanCard, type KanbanCard } from './kanban'

const cards: KanbanCard[] = [
  { id: 'a', columnId: 'x', title: 'A' },
  { id: 'b', columnId: 'x', title: 'B' },
  { id: 'c', columnId: 'y', title: 'C' },
]
const order = (list: KanbanCard[], col: string) =>
  list.filter((c) => c.columnId === col).map((c) => c.id)

describe('moveKanbanCard', () => {
  it('move para outra coluna na posição pedida', () => {
    const r = moveKanbanCard(cards, 'a', 'y', 0)
    expect(order(r, 'y')).toEqual(['a', 'c'])
    expect(order(r, 'x')).toEqual(['b'])
  })
  it('move para o fim da coluna', () => {
    expect(order(moveKanbanCard(cards, 'a', 'y', 9), 'y')).toEqual(['c', 'a'])
  })
  it('reordena dentro da mesma coluna', () => {
    expect(order(moveKanbanCard(cards, 'b', 'x', 0), 'x')).toEqual(['b', 'a'])
  })
  it('move para coluna vazia', () => {
    expect(order(moveKanbanCard(cards, 'c', 'z', 0), 'z')).toEqual(['c'])
  })
})
