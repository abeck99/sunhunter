import * as R from 'ramda'
import  { IVector2d, IRay, intersectionWithBounds, IBounds, IntersctionType, IIntersectionResult } from '../util/math'

interface IPartition {
  partitionBounds: IBounds
  partX: number
  partY: number
  collisionBounds: IBounds[]
}

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
    return this.clipRayInPartitions(ray, partitions)
  }
}



