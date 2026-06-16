import { useEffect, useRef } from 'react'
import Sortable from 'sortablejs'

type UseSortableIdsOptions = {
  enabled?: boolean
  onReorder: (ids: number[]) => void
}

export function useSortableIds<TElement extends HTMLElement>({ enabled = true, onReorder }: UseSortableIdsOptions) {
  const ref = useRef<TElement | null>(null)

  useEffect(() => {
    if (!ref.current || !enabled) {
      return undefined
    }

    const sortable = Sortable.create(ref.current, {
      animation: 140,
      handle: '.drag-handle',
      draggable: '[data-item-id]',
      ghostClass: 'sortable-ghost',
      onEnd(event) {
        if (event.oldIndex === event.newIndex) {
          return
        }

        const ids = Array.from(ref.current?.children ?? [])
          .filter((element): element is HTMLElement => element instanceof HTMLElement && Boolean(element.dataset.itemId))
          .map((element) => Number(element.dataset.itemId))

        onReorder(ids)
      },
    })

    return () => sortable.destroy()
  }, [enabled, onReorder])

  return ref
}
