import * as R from 'ramda'
import { GameEffector } from '../core/effectors'
import { IVector2d } from '../util/math'
import { IPositionState, positionStateLens, IComponents, IComponentsState } from '../defs'
import { LensFunction, IActorClass, IActor } from '../core/types'
import { BlockActor } from '../actors/Block'

interface IWorldGenerationConfig {
  gridSize: number
  blockLoadSize: number // NEEDS TO BE EVEN
  blockLoadDistance: number
  followActor: string // TODO: this should be moved into a component so it can be correctly serialized
                      // Alternatively add proper serializatrion to effectors
                      // Alternatively alternatively effectors can act like 'systems' in a pure ECS and work only on data from components
}

interface IBlockDescription {
  uuids: string[]
}

const debugLog = (s: string) => {
  //console.log(s)
}

const aboveGround = 
[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
 [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
 [0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0],
 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
 [0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0],
 [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
 [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0],
 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]

const belowGround =
[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
 [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],
 [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],
 [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],
 [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],
 [1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1],
 [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],
 [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],
 [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
 [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
 [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1],
 [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1],
 [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1],
 [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1],
 [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1],
 [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
 [1,1,1,1,1,1,1,1,1,3,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
 [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]


enum SpawnType {
  None = 0,
  Block = 1,
  SpawnPoint = 2,
  Machine = 3,
}

const spawnClasses = {
  Block: BlockActor
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
    const followPos = this.getPos(this.config.followActor)
    if (!followPos) {
      return
    }

    var shouldClear = false

    const mapWidth = belowGround[0].length
    const groundLevel = -1

    const gridSize = this.config.gridSize
    const gridPoint = this.pixelate({x:followPos.x, y:followPos.y}, gridSize)

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

    const blocksToRemove = shouldClear ? currentlyLoadedBlocks : R.difference(currentlyLoadedBlocks, blocksThatShouldBeLoaded)
    const blocksToAdd = shouldClear ? blocksThatShouldBeLoaded : R.difference(blocksThatShouldBeLoaded, currentlyLoadedBlocks)

    for (const blockId of blocksToRemove) {
      const blockDescription = this.loadedBlocks[blockId]
      if (blockDescription.uuids.length > 0) {
        debugLog(`removing some actors part of block ${blockId}`)
      }
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
      const spawnAtGridPos = (x: number, y: number, cls: IActorClass<IComponentsState, IComponents, IActor<IComponents>>) => {
        uuidsInBlock.push(this.world.spawn(cls, {
          position: {
            x: x*gridSize,
            y: y*gridSize,
          }
        }).uuid)
      }

      for (var x=p.x-halfBlockSize; x<p.x+halfBlockSize; x++) {
        for (var y=p.y-halfBlockSize; y<p.y+halfBlockSize; y++) {
          var spawnType = SpawnType.None

          const xIndex = ((x % mapWidth) + mapWidth) % mapWidth
          if (y <= groundLevel) {
            const yIndex = groundLevel - y
            if (yIndex >= belowGround.length) {
              spawnType = SpawnType.Block
            } else {
              spawnType = belowGround[yIndex][xIndex]
            }
          } else {
            const yIndex = y - groundLevel - 1
            if (yIndex < aboveGround.length) {
              spawnType = aboveGround[yIndex][xIndex]
            }
          }

          if (spawnType == SpawnType.Block) {
            spawnAtGridPos(x, y, BlockActor)
          }
        }
      }

      this.loadedBlocks[blockId] = {
        uuids: uuidsInBlock
      }
    }
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