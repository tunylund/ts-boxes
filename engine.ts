
export function createCanvas(w: number, h: number) : { canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D } {
  const canvas: HTMLCanvasElement = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  return { canvas: canvas, ctx: canvas.getContext('2d') }
}

export function createMainCanvas() : HTMLCanvasElement {
  const c = document.createElement('canvas')

  function resize() {
    c.width = window.innerWidth
    c.height = window.innerHeight
  }
  
  resize()
  window.addEventListener('resize', resize, false)
  document.body.appendChild(c)
  return c
}

export function loop(fn: Steppable, framesPerSecond: number) :object {
  let start :number = 0
  let totalProgress :number = 0
  let previousTimestamp :number = 0
  let diff :number = 0
  
  function step(timestamp :number) {
    start = start || timestamp
    totalProgress = timestamp - start
    diff = timestamp - previousTimestamp
    previousTimestamp = timestamp
    fn(timestamp, diff, totalProgress)
    frameId = window.requestAnimationFrame(step)
  }

  let frameId = window.requestAnimationFrame(step)

  return () => { window.cancelAnimationFrame(frameId) }
}

export function game(gameElements : Steppable[], canvas: HTMLCanvasElement) : Steppable {
  const ctx = canvas.getContext('2d')
  return (timestamp: number, diff: number, totalProgress: number) : GameElement => {
    let centerX = canvas.width / 2
    let centerY = canvas.height / 2
    ctx.fillStyle = '#f2f2f2'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    gameElements.map(e => {
      const el: GameElement = e(timestamp, diff, totalProgress)
      ctx.drawImage(el.image, centerX + el.x - el.image.width / 2, centerY + el.y - el.image.height / 2)
    })
    return { x: 0, y: 0, image: canvas }
  }
}

export function hit (aFn) : HitTest {
  return b => {
    const a = aFn()
    return !(a.x1 >= b.x2 || a.x2 <= b.x1) &&
           !(a.y1 >= b.y2 || a.y2 <= b.y1)
  }
}

export const M = {

  rand: (min, max) => (Math.random() * (max - min)) + min,

  either: (a, b) => { return Math.random() > 0.5 ? a : b },

  nanOr: (a: number, def) => isNaN(a) ? def : a

}

export function keyListener() : Keys {
  const k = { up: false, down: false, left: false, right: false }
  const listener = state => { return e => {
    switch (e.keyCode) {
      case 37: case 72: case 65: k.left = state; break
      case 39: case 76: case 68: k.right = state; break
      case 40: case 83: case 74: k.down = state; break
      case 38: case 87: case 75: k.up = state; break
    }
  } }
  window.addEventListener('keydown', listener(true), false)
  window.addEventListener('keyup', listener(false), false)
  return k
}

export function pointerListener(world: HTMLCanvasElement) : HitTest {
  let x = NaN
  let y = NaN
  window.addEventListener('pointerdown', e => {
    x = e.clientX
    y = e.clientY
  }, false)
  window.addEventListener('pointerup', e => {
    x = y = NaN
  })
  return hit(() => {
    return P.box({ x: x - world.width / 2, y: y - world.height / 2 }, { width: 1, height: 1 })
  })
}

export const P = {

  rand: (minX, maxX, minY, maxY) => {
    return {
      x: M.rand(minX, maxX),
      y: M.rand(minY, maxY)
    }
  },

  box: (position: Point, size: Size) : Box => { return {
    position,
    size,
    x1: M.nanOr(position.x - size.width / 2, Infinity),
    x2: M.nanOr(position.x + size.width / 2, -Infinity),
    y1: M.nanOr(position.y - size.height / 2, Infinity),
    y2: M.nanOr(position.y + size.height / 2, -Infinity)
  } }

}

export const V = {

  vector: (a: Point, b: Point, size: number) => {
    return V.multiply(V.normalize({
      x: b.x - a.x,
      y: b.y - a.y
    }), size)
  },

  multiply: (vector: Point, size) => {
    return {
      x: vector.x * size,
      y: vector.y * size
    }
  },

  divide: (vector: Point, size) => {
    return V.multiply(vector, 1 / size)
  },

  normalize: (vector: Point) => {
    const distance: number = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
    return V.divide(vector, distance)
  },

  add: (a: Point, b: Point) => {
    return {
      x: a.x + b.x,
      y: a.y + b.y
    }
  }

}

export interface Steppable { (timestamp :number, diff :number, totalProgress: number) : GameElement }
export interface GameElement {
  x: number
  y: number
  image: HTMLCanvasElement 
}
export interface Size {
  width: number,
  height: number
}
export interface Box {
  x1: number
  x2: number
  y1: number
  y2: number
  position: Point
  size: Size
}
export interface HitTest { (b: Box) : boolean }

export interface Point {
  x: number
  y: number
}

export interface Keys {
  left: boolean
  right: boolean
  up: boolean
  down: boolean
}
