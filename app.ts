import { Keys, pointerListener, keyListener, box, hit, createMainCanvas, loop, game, createCanvas, GameElement, HitTest, Steppable } from './engine.js'

export function main () {
  const canvas: HTMLCanvasElement = createMainCanvas()
  const gameEntities: Steppable[] = [ball(canvas, (el) => gameEntities.push(el), pointerListener(canvas))]
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

function ball(world: HTMLCanvasElement, addGameElements, pointerHit: HitTest) : Steppable {
  const { canvas, ctx } = createCanvas(4, 4)
  const moveInterval = 1000
  let lastMove = 0
  let x = 0
  let y = 0

  const rand = (min, max) => { return (Math.random() * max) + min }
  const either = (a, b) => { return Math.random() > 0.5 ? a : b }
  
  const move = (timestamp: number) => {
    if (lastMove === 0 || timestamp - lastMove > moveInterval) {
      x = either(1, -1) * rand(canvas.width  / 2, world.width / 2  - canvas.width  / 2)
      y = either(1, -1) * rand(canvas.height / 2, world.height / 2 - canvas.height / 2)
      lastMove = timestamp
      canvas.width += 1
      canvas.height += 1
    }
    return { x: x, y: y }
  }

  const draw = () => {
    ctx.fillStyle = '#8a4a4a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    return canvas
  }

  const hit = () => {
    if (pointerHit(box(x, y, canvas))) {
      canvas.width = 4
      canvas.height = 4
      addGameElements(
        ball(world, addGameElements, pointerHit),
        ball(world, addGameElements, pointerHit),
        ball(world, addGameElements, pointerHit)
      )
    }
  }
  
  return (timestamp: number, diff: number, totalProgress: number) : GameElement => {
    hit()
    const { x, y } = move(timestamp)
    return { x: x, y: y, image: draw() }
  }
}

