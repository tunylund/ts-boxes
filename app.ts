import {
  createCanvas,
  createMainCanvas,
  GameElement,
  pointerListener,
  Steppable,
  loop,
  game,
  Keys,
  Point,
  hit,
  HitTest,
  M,
  P,
  V
} from './engine.js'

export function main () {
  const canvas: HTMLCanvasElement = createMainCanvas()
  const gameEntities: Steppable[] = [
    ball(
      {x: 0, y: 0},
      canvas,
      (el) => gameEntities.push(el),
      pointerListener(canvas)
    )
  ]
  loop(game(gameEntities, canvas), 60)
}

function player(keys : Keys) : Steppable {
  const speed = 0.25
  const { canvas, ctx } = createCanvas(16, 16)
  let x = 0
  let y = 0

  const draw = () => {
    ctx.fillStyle = '#afafaf'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    return canvas 
  }

  const move = (diff: number) => {
    return {
      x: x += (keys.left ? -1 : keys.right ? 1 : 0) * speed * diff,
      y: y += (keys.up   ? -1 : keys.down  ? 1 : 0) * speed * diff
    }
  }

  return (timestamp: number, diff: number, totalProgress: number) : GameElement => {
    const { x, y } = move(diff)
    return { x: x, y: y, image: draw() }
  }
}

function ball(position: Point, world: HTMLCanvasElement, addGameElements, pointerHit: HitTest) : Steppable {
  const w2 = world.width / 2 - 10
  const h2 = world.height / 2 - 10
  const rand = () => P.rand(-w2, w2, -h2, h2)
  const { canvas, ctx } = createCanvas(4, 4)
  const isTooLarge = () => canvas.width > 10
  let speed = 1
  let target: Point = rand()
  const hitTest = hit(() => P.box(position, canvas))
  
  const move = (diff: number, position, target) => {
    return V.add(position, V.vector(position, target, speed * diff / 60))
  }

  const lookForTarget = (target: Point) => {
    if (hitTest(P.box(target, { width: 1, height: 1 }))) {
      canvas.width += 1
      canvas.height += 1
      speed++
      if (isTooLarge()) {
        addGameElements(
          ball(position, world, addGameElements, pointerHit),
          ball(position, world, addGameElements, pointerHit),
          ball(position, world, addGameElements, pointerHit),
          ball(position, world, addGameElements, pointerHit)
        )
      } else {
        addGameElements(
          ball(position, world, addGameElements, pointerHit)
        )
      }
      return rand()
    }

    return target
  }

  const draw = () => {
    ctx.fillStyle = isTooLarge() ? '#222222' : '#8a4a4a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    return canvas
  }
  
  return (timestamp: number, diff: number, totalProgress: number) : GameElement => {
    if (!isTooLarge()) target = lookForTarget(target)
    if (!isTooLarge()) position = move(diff, position, target)
    return { ...position, image: draw() }
  }
}

