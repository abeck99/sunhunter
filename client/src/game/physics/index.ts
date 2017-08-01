import * as R from 'ramda'
import  { IVector2d, IRay, intersectionWithBounds, IBounds, IntersctionType, IIntersectionResult, dotProduct, distance, integratePosition2dMut, reflectAroundNormal2dMut,
          topNormal2d, bottomNormal2d, leftNormal2d, rightNormal2d } from '../util/math'

const debugLog = (s: string) => {
  console.log(s)
}

interface IPartition {
  partitionBounds: IBounds
  partX: number
  partY: number
  collisionBounds: IBounds[]
}

interface IMovementResult {
  type: IntersctionType
  vel: IVector2d
  pos: IVector2d
  acc: IVector2d
}

interface IObjectProperties {
  mass: number
  bounce: number
  drag: IVector2d // 0.47 for ball, 1.05 for cube, 0.82 for long cylinder, 0.04 for streamlined object
                  // This of course varies if you're moving left or right, but simplifying it on just x/y axis
  frontalArea: number // This of course varies by direction...
}

enum ForceType {
  Acceleration = 1,
  Medium,
}

interface IBaseForce {
  type: ForceType
}

// For example, gravity is {x: 0, y: -9.81}
interface IAccelerationForce extends IBaseForce {
  v: IVector2d
}

interface IMediumForce extends IBaseForce {
  density: number
}

type Force = IAccelerationForce | IMediumForce

const maxCollisionRecursion = 4

export class Physics {
  spacePartitionSize: number
  halfSpacePartitionSize: number

  partitions: {[key: string]: IPartition}

  constructor(spacePartitionSize: number) {
    this.spacePartitionSize = this.spacePartitionSize
    this.halfSpacePartitionSize = this.spacePartitionSize / 2
    this.partitions = {}
  }

  partitionByGridPos = (partX: number, partY: number): IPartition => {
    const partitionId = `${partX}-${partY}`

    const existingPartition = this.partitions[partitionId]
    if (existingPartition) {
      return existingPartition
    }

    return {
      partitionBounds: {
        uuid: partitionId,
        topLeft: {
          x: partX*this.spacePartitionSize-this.halfSpacePartitionSize,
          y: partY*this.spacePartitionSize-this.halfSpacePartitionSize,
        },
        width: this.spacePartitionSize,
        height: this.spacePartitionSize,
      },
      partX: partX,
      partY: partY,
      collisionBounds: [],
    }
  }

  posToPartition = (pos: IVector2d): IPartition => {
    const partX = Math.round(pos.x/this.spacePartitionSize)
    const partY = Math.round(pos.y/this.spacePartitionSize)
    return this.partitionByGridPos(partX, partY)
  }

  boundsToPartition = (bounds: IBounds): IPartition => {
    return this.posToPartition({
      x: bounds.topLeft.x + (bounds.width/2),
      y: bounds.topLeft.y + (bounds.height/2),
    })
  }

  addToWorld = (bounds: IBounds): string => {
    const partition = this.boundsToPartition(bounds)
    partition.collisionBounds.push(bounds)
    this.partitions[partition.partitionBounds.uuid] = partition
    return partition.partitionBounds.uuid
  }

  removeFromWorld = (partitionId: string, uuid: string) => {
    const partition = this.partitions[partitionId]
    if (!partition) {
      console.log('This is probably a bug, the expected partition didn\'t exist')
      return
    }

    const startingBoundsCount = partition.collisionBounds.length
    partition.collisionBounds = R.filter((collisionBounds) => {
      return collisionBounds.uuid != uuid
    }, partition.collisionBounds)

    const endingBoundsCount = partition.collisionBounds.length
    if (startingBoundsCount != endingBoundsCount) {
      console.log('This is probably a bug, someone wasn\'t found in the partition they were expecting')
    }

    if (endingBoundsCount == 0) {
      delete this.partitions[partitionId]
    } else {
      this.partitions[partitionId] = partition
    }
  }

  includeSurroundingPartitions = (inPartitions: IPartition[]): IPartition[] => {
    var partitions: IPartition[] = []

    for (const partition of inPartitions) {
      partitions.push(partition)
      partitions.push(this.partitionByGridPos(partition.partX-1,partition.partY+0))
      partitions.push(this.partitionByGridPos(partition.partX-1,partition.partY+1))
      partitions.push(this.partitionByGridPos(partition.partX+0,partition.partY+1))
      partitions.push(this.partitionByGridPos(partition.partX+1,partition.partY+1))
      partitions.push(this.partitionByGridPos(partition.partX+1,partition.partY+0))
      partitions.push(this.partitionByGridPos(partition.partX+1,partition.partY-1))
      partitions.push(this.partitionByGridPos(partition.partX+0,partition.partY-1))
      partitions.push(this.partitionByGridPos(partition.partX-1,partition.partY-1))
    }

    return R.uniqBy((partition): string => {
      return partition.partitionBounds.uuid
    }, partitions)
  }

  partitionsRayIntersectsWith = (ray: IRay): IPartition[] => {
    const startPartition = this.posToPartition(ray.start)
    const endPartition = this.posToPartition(ray.end)

    if (startPartition.partitionBounds.uuid == endPartition.partitionBounds.uuid) {
      return this.includeSurroundingPartitions([startPartition])
    }

    var partitions: IPartition[] = [
      startPartition,
      endPartition
    ]

    const minPartX = Math.min(startPartition.partX, endPartition.partX)
    const maxPartX = Math.max(startPartition.partX, endPartition.partX)
    const minPartY = Math.min(startPartition.partY, endPartition.partY)
    const maxPartY = Math.max(startPartition.partY, endPartition.partY)

    for (var partX=minPartX; partX<=maxPartX; partX++) {
      for (var partY=minPartY; partY<=maxPartY; partY++) {
        const partition = this.partitionByGridPos(partX, partY)
        if (intersectionWithBounds(ray, partition.partitionBounds).type != IntersctionType.None) {
          partitions.push(partition)
        }
      }
    }

    return this.includeSurroundingPartitions(partitions)
  }

  clipRayInPartition = (ray: IRay, partition: IPartition, currentResult: IIntersectionResult): IIntersectionResult => {
    // TODO: Skip bounds that are overall closer than the one that gave us the current hit
    var closestIntersectionResult = currentResult

    var currentRay = ray

    for (const bounds of partition.collisionBounds) {
      const intersectionResult = intersectionWithBounds(currentRay, bounds)

      const collisionPoint = intersectionResult.point
      if (collisionPoint) {
        closestIntersectionResult = intersectionResult
        currentRay.end = collisionPoint
      }
    }

    return closestIntersectionResult
  }

  clipRayInPartitions = (ray: IRay, partitions: IPartition[]): IIntersectionResult => {
    // TODO: Start close from start and quit if all other paritions are further away
    var currentResult = { type: IntersctionType.None }

    for (const partition of partitions) {
      currentResult = this.clipRayInPartition(ray, partition, currentResult)
    }

    return currentResult
  }

  clipRay = (ray: IRay): IIntersectionResult => {
    const partitions = this.partitionsRayIntersectsWith(ray)
    debugLog(`checking ${partitions.length} paritions`)
    return this.clipRayInPartitions(ray, partitions)
  }

  applyForceMut = (mutableAcc: IVector2d, force: Force, vel: IVector2d, obj: IObjectProperties) => {
    switch (force.type) {
      case ForceType.Acceleration:
      {
        const f = force as IAccelerationForce
        mutableAcc.x += obj.mass * f.v.x
        mutableAcc.y += obj.mass * f.v.y
        break
      }
      case ForceType.Medium:
      {
        const f = force as IMediumForce
        mutableAcc.x += -0.5 * f.density * obj.drag.x * obj.frontalArea * vel.x * vel.x
        mutableAcc.y += -0.5 * f.density * obj.drag.y * obj.frontalArea * vel.y * vel.y
        break
      }
    }
  }

  // Forces is typically only gravity (9.81 towards ground)
  moveMut = (pos: IVector2d, vel: IVector2d, acc: IVector2d, t: number, obj: IObjectProperties, forces: Force[], withCollision: boolean = true, recursionCount: number = 0): IntersctionType => {
    if (obj.mass <= 0.00001) {
      debugLog('Mass is too small to calculate movement!')
      return IntersctionType.None
    }

    const pos_ = pos
    integratePosition2dMut(pos, vel, acc, t)
    const dFull = distance(pos_, pos)

    if (dFull > 0 && withCollision) {
      const res = this.clipRay({start: pos_, end: pos})
      if (res.type != IntersctionType.None) {
        if (recursionCount < maxCollisionRecursion) {
          // We had an intersection, so 
          //    1) guess the time that the intersection occured
          //    2) run moveMut on that interval, ignoring clipRay
          //    3) rerun moveMut on that point with a reflected velocity vector

          // guess time interval at collision
          const dClipped = distance(pos_, res.point)
          const dRatio = dClipped / dFull

          // Rewind
          const t2 = t*dRatio
          pos.x = pos_.x 
          pos.y = pos_.y

          this.moveMut(pos, vel, acc, t2, obj, forces, false)

          const t3 = t-t2
          // Reflect vel around res.type side
          switch (res.type) {
            case IntersctionType.Top:
              reflectAroundNormal2dMut(vel, topNormal2d)
              break
            case IntersctionType.Bottom:
              reflectAroundNormal2dMut(vel, bottomNormal2d)
              break
            case IntersctionType.Left:
              reflectAroundNormal2dMut(vel, leftNormal2d)
              break
            case IntersctionType.Right:
              reflectAroundNormal2dMut(vel, rightNormal2d)
              break
          }

          // Continue with reflected vector
          return this.moveMut(pos, vel, acc, t3, obj, forces, true, recursionCount+1)
        } else {
          debugLog('Reached max recursion count for collision...')
        }
      }
    }

    const acc_ = acc
    acc.x = 0
    acc.y = 0
    for (const force of forces) {
      this.applyForceMut(acc, force, vel, obj)
    }
    acc.x = acc.x / obj.mass
    acc.y = acc.y / obj.mass

    const avgAccX = 0.5*(acc_.x+acc.x)
    const avgAccY = 0.5*(acc_.y*acc.y)

    vel.x += avgAccX * t
    vel.y += avgAccY * t

    return IntersctionType.None
  }
}



