import { useState, useRef } from "react"
import { clamp, distance } from "@popmotion/popcorn"
import { arrayMove } from "@utils/helpers"

type PositionRecord<T> = [
  Array<T>,
  (i: number, offset: any) => number,
  (i: number, dragOffset: any) => void,
]

export function usePositionReorder<T>(
  initialState: Array<T>,
): PositionRecord<T> {
  const [order, setOrder] = useState(initialState)

  // We need to collect an array of height and position data for all of this component's
  // `Item` children, so we can later us that in calculations to decide when a dragging
  // `Item` should swap places with its siblings.
  const positions = useRef([]).current as Array<any>
  const updatePosition = (i: number, offset: number) => (positions[i] = offset)

  // Find the ideal index for a dragging item based on its position in the array, and its
  // current drag offset. If it's different to its current index, we swap this item with that
  // sibling.
  const updateOrder = (i: number, dragOffset: any) => {
    const targetIndex = findIndex(i, dragOffset, positions)
    if (targetIndex !== i) setOrder(arrayMove(order, i, targetIndex))
  }

  return [order, updatePosition, updateOrder]
}

const buffer = 30

export const findIndex = (
  i: number,
  yOffset: number,
  positions: string | any[],
) => {
  let target = i
  const { top, height } = positions[i]
  const bottom = top + height

  // If moving down
  if (yOffset > 0) {
    const nextItem = positions[i + 1]
    if (nextItem === undefined) return i

    const swapOffset =
      distance(bottom, nextItem.top + nextItem.height / 2) + buffer
    if (yOffset > swapOffset) target = i + 1

    // If moving up
  } else if (yOffset < 0) {
    const prevItem = positions[i - 1]
    if (prevItem === undefined) return i

    const prevBottom = prevItem.top + prevItem.height
    const swapOffset = distance(top, prevBottom - prevItem.height / 2) + buffer
    if (yOffset < -swapOffset) target = i - 1
  }

  return clamp(0, positions.length, target)
}
