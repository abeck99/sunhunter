import * as R from 'ramda'
import { GameEffector } from '../core/effectors'
import { IVector2d } from '../util/math'
import { IPositionState, positionStateLens, IComponents } from '../defs'
import { LensFunction } from '../core/types'
import { CAMERA } from '../util'
import { BlockActor } from '../actors/Block'

interface IWorldGenerationConfig {
  gridSize: number
  blockLoadSize: number
  blockLoadDistance: number
}

interface IBlockDescription {
  uuids: string[]
}

export class GenerativeWorldEffector<TPhysics> extends GameEffector<IWorldGenerationConfig, TPhysics, IComponents> {
  getPos: LensFunction<IPositionState>

  start = (shouldLoadContent: boolean) => {
    this.getPos = positionStateLens(this.world)
    this.loadedBlocks = {}

    if (shouldLoadContent) {
      this.determineNeededSquares()
    }
  }

  loadedBlocks: {[key: string]: IBlockDescription}

  determineNeededSquares = () => {
    const cameraPos = this.getPos(CAMERA)
    if (!cameraPos) {
      return
    }

    const gridPoint = this.pixelate({x:cameraPos.x, y:cameraPos.y}, this.config.gridSize)

    // Load in blocks of blockLoadSize x blockLoadSize so we don't waste a lot of time
    const blockLoadSize = this.config.blockLoadSize
    const blockPosition = this.pixelate(gridPoint, blockLoadSize)

    const loadSize = this.config.blockLoadDistance

    var blocksToLoad: {[key: string]: IVector2d} = {}
    for (var i=blockPosition.x-loadSize; i<=blockPosition.x+loadSize; i++) {
      for (var j=blockPosition.y-loadSize; j<=blockPosition.y+loadSize; j++) {
        const blockId = `${i}-${j}`
        blocksToLoad[blockId] = {x:i, y:j}
      }
    }
    
    const currentlyLoadedBlocks = R.keys(this.loadedBlocks)
    const blocksThatShouldBeLoaded = R.keys(blocksToLoad)

    const blocksToRemove = R.difference(currentlyLoadedBlocks, blocksThatShouldBeLoaded)
    const blocksToAdd = R.difference(blocksThatShouldBeLoaded, currentlyLoadedBlocks)

    for (const blockId of blocksToRemove) {
      const blockDescription = this.loadedBlocks[blockId]
      for (const uuid of blockDescription.uuids) {
        this.world.removeActorFromWorldWithId(uuid)
      }
      delete this.loadedBlocks[blockId]
    }

    const halfBlockSize = blockLoadSize/2

    for (const blockId of blocksToAdd) {
      const blockPoint = blocksToLoad[blockId]

      const p = {
        x: blockPoint.x * blockLoadSize,
        y: blockPoint.y * blockLoadSize,
      }

      var uuidsInBlock: string[] = []
      for (var x=p.x-halfBlockSize; x<p.x+halfBlockSize; x++) {
        for (var y=p.y-halfBlockSize; y<p.y+halfBlockSize; y++) {
          if (this.hasBlockAtGridPos({x: x, y: y})) {
            uuidsInBlock.push(this.world.spawn(BlockActor, {}).uuid)
          }
        }
      }

      this.loadedBlocks[blockId] = {
        uuids: uuidsInBlock
      }
    }
  }

  hasBlockAtGridPos = (pos: IVector2d): boolean => {
    if (pos.y == -1) {
      return true
    }
    return false
  }

  pixelate = (pos: IVector2d, size: number): IVector2d => {
    return {
      x: Math.round(pos.x/size),
      y: Math.round(pos.y/size),
    }

  }

  tick = (elapsedTime: number) => {
    this.determineNeededSquares()
  }
  
  stop = () => {
  }

  getState = (): {[key: string]: any} => {
    return {
    }
  }

  setState = (data: {[key: string]: any}) => {
  }
}