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

export const topNormal2d: IVector2d = {
  x: -1,
  y: 0,
}

export const bottomNormal2d: IVector2d = {
  x: 1,
  y: 0,
}

export const leftNormal2d: IVector2d = {
  x: 0,
  y: -1,
}

export const rightNormal2d: IVector2d = {
  x: 0,
  y: 1,
}

export interface IIntersectionResult {
  type: IntersctionType
  point?: IVector2d
  uuid?: string
}

export const crossProduct = (a: IVector2d, b: IVector2d): number => {
  return a.x*b.y - a.y*b.x
}

export const dotProduct = (a: IVector2d, b: IVector2d): number => {
  return a.x*b.x + a.y*b.y
}

export const lengthSquared = (a: IVector2d): number => {
  return a.x*a.x + a.y*a.y
}

export const length = (a: IVector2d): number => {
  return Math.sqrt(lengthSquared(a))
}

export const distanceSquared = (a: IVector2d, b: IVector2d): number => {
  const dx = b.x-a.x
  const dy = b.y-a.y
  return dx*dx + dy*dy
}

export const distance = (a: IVector2d, b: IVector2d): number => {
  return Math.sqrt(distanceSquared(a, b))
}

export const integratePosition1d = (pos: number, vel: number, acc: number, t: number): number => {
  return pos + vel*t + (0.5*acc*t*t)
}

export const integratePosition2dMut = (pos: IVector2d, vel: IVector2d, acc: IVector2d, t: number) => {
  pos.x = integratePosition1d(pos.x, vel.x, acc.x, t)
  pos.y = integratePosition1d(pos.y, vel.y, acc.y, t)
}

export const add2dMut = (a: IVector2d, b: IVector2d) => {
  a.x += b.x
  a.y += b.y
}

export const sub2dMut = (a: IVector2d, b: IVector2d) => {
  a.x -= b.x
  b.y -= b.y
}

export const mul2dMut = (a: IVector2d, s: number) => {
  a.x *= s
  a.y *= s
}

export const reflectAroundNormal2dMut = (a: IVector2d, n: IVector2d) => {
  const dDotNTimes2 = 2*dotProduct(a, n)
  a.x -= dDotNTimes2 * n.x
  a.y -= dDotNTimes2 * n.y
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
  const anyWindow = window as any
  if (!anyWindow.wiggleRoom) {
    anyWindow.wiggleRoom = 1
  }
  const wiggleRoom = anyWindow.wiggleRoom

  const xmin = bounds.topLeft.x
  const xmax = bounds.topLeft.x + bounds.width
  const ymin = bounds.topLeft.y
  const ymax = bounds.topLeft.y + bounds.height

  const xminW = xmin + wiggleRoom
  const xmaxW = xmax - wiggleRoom
  const yminW = ymin + wiggleRoom
  const ymaxW = ymax - wiggleRoom

  const startPos = (ray.start.x < xminW ? LEFT : 0b0) |
                   (ray.start.x > xmaxW ? RIGHT : 0b0) |
                   (ray.start.y < yminW ? TOP : 0b0) |
                   (ray.start.y > ymaxW ? BOTTOM : 0b0)
  const endPos   = (ray.end.x < xminW ? LEFT : 0b0) |
                   (ray.end.x > xmaxW ? RIGHT : 0b0) |
                   (ray.end.y < yminW ? TOP : 0b0) |
                   (ray.end.y > ymaxW ? BOTTOM : 0b0)

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
