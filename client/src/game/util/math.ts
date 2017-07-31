export interface IVector2d {
  x: number,
  y: number,
}

export interface IRay {
  start: IVector2d
  end: IVector2d
}

export interface IBounds {
  uuid: string
  topLeft: IVector2d
  width: number
  height: number
}

export enum IntersctionType {
  None = 1,
  Top,
  Left,
  Right,
  Bottom
}

export interface IIntersectionResult {
  type: IntersctionType
  point?: IVector2d
  uuid?: string
}

const INSIDE  = 0b0000
const LEFT    = 0b0001
const RIGHT   = 0b0010
const BOTTOM  = 0b0100
const TOP     = 0b1000

export const segmentIntersection = (a: IRay, b: IRay): (IVector2d | null) => {
  const diffA = {x: a.end.x-a.start.x, y: a.end.y-a.start.y}
  const diffB = {x: b.end.x-b.start.x, y: b.end.y-b.start.y}
  

  const diffADotDiffB = diffA.x * diffB.y - diffA.y * diffB.x

  

  // Parallel lines
  if (diffADotDiffB == 0) {
    return null
  }

  const diffStarts = {x: b.start.x - a.start.x, y: b.start.y - a.start.y}
  const t = (diffStarts.x * diffB.y - diffStarts.y * diffB.x) / diffADotDiffB
  if (t < 0 || t > 1) {
    return null
  }

  const u = (diffStarts.x * diffA.y - diffStarts.y * diffA.x) / diffADotDiffB
  if (u < 0 || u > 1) {
    return null
  }

  return {
    x: (diffA.x * t) + a.start.x,
    y: (diffA.y * t) + a.start.y,
  }
}

export const intersectionWithBounds = (ray: IRay, bounds: IBounds): IIntersectionResult => {
  const xmin = bounds.topLeft.x
  const xmax = bounds.topLeft.x + bounds.width
  const ymin = bounds.topLeft.y
  const ymax = bounds.topLeft.y + bounds.height

  const startPos = (ray.start.x < xmin ? LEFT : 0b0) |
                   (ray.start.x > xmax ? RIGHT : 0b0) |
                   (ray.start.y < ymin ? TOP : 0b0) |
                   (ray.start.y > ymax ? BOTTOM : 0b0)
  const endPos   = (ray.end.x < xmin ? LEFT : 0b0) |
                   (ray.end.x > xmax ? RIGHT : 0b0) |
                   (ray.end.y < ymin ? TOP : 0b0) |
                   (ray.end.y > ymax ? BOTTOM : 0b0)

  if (startPos & endPos) { // if true, both are in the same region and we can safely discard
    return {type: IntersctionType.None}
  } else if (startPos == INSIDE) { // starting from inside the box, we probably want to force to the closest edge (probably happening due to floating point issues)
    const distToLeft = ray.start.x - xmin
    const distToRight = xmax - ray.start.x
    const distToTop = ray.start.y - ymin
    const distToBottom = ymax - ray.start.y
    
    if (distToLeft < distToRight && distToLeft < distToTop && distToLeft < distToBottom) {
      return {type:IntersctionType.Left, point: {x:xmin, y:ray.start.y}, uuid:bounds.uuid}
    } else if (distToRight < distToTop && distToRight < distToBottom) {
      return {type:IntersctionType.Right, point: {x:xmax, y:ray.start.y}, uuid:bounds.uuid}
    } else if (distToTop < distToBottom) {
      return {type:IntersctionType.Top, point: {x:ray.start.x, y:ymin}, uuid:bounds.uuid}
    } else {
      return {type:IntersctionType.Bottom, point: {x:ray.start.x, y:ymax}, uuid:bounds.uuid}
    }
  }

  const topLeft = {x:xmin,y:ymin}
  const topRight = {x:xmax,y:ymin}
  const bottomLeft = {x:xmin,y:ymax}
  const bottomRight = {x:xmax,y:ymax}

  if ((startPos & TOP) != 0b0) {
    const intersection = segmentIntersection(ray, {start:topLeft,end:topRight})
    if (intersection) {
      return {
        type: IntersctionType.Top,
        point: intersection,
        uuid: bounds.uuid,
      }
    }
  }

  if ((startPos & RIGHT) != 0b0) {
    const intersection = segmentIntersection(ray, {start:topRight,end:bottomRight})
    if (intersection) {
      return {
        type: IntersctionType.Right,
        point: intersection,
        uuid: bounds.uuid,
      }
    }
  }

  if ((startPos & BOTTOM) != 0b0) {
    const intersection = segmentIntersection(ray, {start:bottomLeft,end:bottomRight})
    if (intersection) {
      return {
        type: IntersctionType.Bottom,
        point: intersection,
        uuid: bounds.uuid,
      }
    }
  }

  if ((startPos & LEFT) != 0b0) {
    const intersection = segmentIntersection(ray, {start:topLeft,end:bottomLeft})
    if (intersection) {
      return {
        type: IntersctionType.Left,
        point: intersection,
        uuid: bounds.uuid,
      }
    }
  }

  return {type:IntersctionType.None}
}


//const blockRay


//export enum PositionInRange {
//  Below = 1,
//  Inside,
//  Above,
//}
//
//export const positionInRange = (x: number, rangeStart: number, rangeEnd: number): PositionInRange => {
//  if (x < rangeStart) {
//    return PositionInRange.Below
//  } else if (x > rangeEnd) {
//    return PositionInRange.Above
//  }
//
//  return PositionInRange.Inside
//  
//  //const isLeftOfBox = pos.x < bounds.topLeft.x
//  //const isRightOfBox = pos.x > (bounds.topLeft.x + bounds.width)
//  //const isInsideWidthOfBox = !isLeftOfBox && !isRightOfBox
//  //const isTopOfBox = pos.y < bounds.topLeft.y
//  //const isBottomOfBox = pos.y > (bounds.topLeft.y + bounds.height)
//  //const isInsideHeightOfBox = !isTopOfBox && !isBottomOfBox
//  //
//  //if (isInsideWidthOfBox && isTopOfBox) {
//  //  return RelativePositionToBounds.Up
//  //} else if (isRightOfBox && isTopOfBox) {
//  //  return RelativePositionToBounds.UpRight
//  //} else if (isRightOfBox && isInsideHeightOfBox) {
//  //  return RelativePositionToBounds.Right
//  //} else if (isRightOfBox && isBottomOfBox) {
//  //  return RelativePositionToBounds.DownRight
//  //} else if (isInsideWidthOfBox && isBottomOfBox) {
//  //  return RelativePositionToBounds.Down
//  //} else if (isLeftOfBox && isBottomOfBox) {
//  //  return RelativePositionToBounds.DownLeft
//  //} else if (isLeftOfBox && isInsideHeightOfBox) {
//  //  return RelativePositionToBounds.Left
//  //} else if (isLeftOfBox && isTopOfBox) {
//  //  return RelativePositionToBounds.UpLeft
//  //}
//  //
//  //return RelativePositionToBounds.Inside
//}
//
//export const intersectionWithBounds = (ray: IRay, bounds: IBounds): IntersctionType => {
//  const bottomRight = {
//    x: bounds.topLeft.x + bounds.width,
//    y: bounds.topLeft.y + bounds.height,
//  }
//  const startXPosition = positionInRange(ray.start, bounds.topLeft.x, bottomRight.x)
//  const endXPosition = positionInRange(ray.start, bounds.topLeft.x, bottomRight.x)
//
//  const startYPosition = positionInRange(ray.start, bounds.topLeft.y, bottomRight.y)
//  const endYPosition = positionInRange(ray.start, bounds.topLeft.y, bottomRight.y)
//
//  if (
//    (startXPosition == PositionInRange.Below && endXPosition == PositionInRange.Below) ||
//    (startXPosition == PositionInRange.Above && endXPosition == PositionInRange.Above) ||
//    (startYPosition == PositionInRange.Below && endYPosition == PositionInRange.Below) ||
//    (startYPosition == PositionInRange.Above && endYPosition == PositionInRange.Above)) {
//    return IntersctionType.None
//  }
//
//  if (startXPosition == PositionInRange.Below) {
//    if (startYPosition == PositionInRange.Below) {
//        // Test TOP and LEFT
//    } else if (startYPosition == PositionInRange.Inside) {
//        // Test LEFT
//    } else { // Leaving only above position for y
//        // Test BOTTOM and LEFT
//    }
//  } else if (startXPosition == PositionInRange.Inside) {
//    if (startYPosition == PositionInRange.Below) {
//        // Test TOP
//    } else { // Inside option was already covered above, so this is above
//        // Test BOTTOM
//    }
//  } else { // startX is above
//    if (startYPosition == PositionInRange.Below) {
//      // Test TOP and RIGHT
//    } else if (startYPosition == PositionInRange.Inside) {
//      // Test RIGHT
//    } else { // startY is above
//      // Test BOTTOM and RIGHT
//    }
//  }
//
//  if (startXPosition == PositionInRange.Inside && startYPosition == PositionInRange.Inside) {
//    // In this case just force it towards the closest edge from the start, this is likely due to floating point issues
//    const distToLeft = ray.start.x - bounds.topLeft.x
//    const distToRight = bottomRight.x - ray.start.x
//    const distToTop = ray.start.y - bounds.topLeft.y
//    const distToBottom = bottomRight.y - ray.start.y
//
//    if (distToLeft < distToRight && distToLeft < distToTop && distToLeft < distToBottom) {
//      return IntersctionType.Left
//    } else if (distToRight < distToTop && distToRight < distToBottom) {
//      return IntersctionType.Right
//    } else if (distToTop < distToBottom) {
//      return IntersctionType.Top
//    } else {
//      return IntersctionType.Bottom
//    }
//  }
//
//  return IntersctionType.None
//}
