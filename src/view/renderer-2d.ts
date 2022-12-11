import { Renderer } from './renderer'

/**
 * Renderer for the 2D rendering context.
 */
export class Renderer2D<T extends HTMLCanvasElement | OffscreenCanvas, U extends CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D>
implements Renderer<T, U> {
  readonly canvas: T
  readonly context: U

  constructor (canvas: T) {
    this.canvas = canvas
    this.context = canvas.getContext('2d') as U
  }

  resize (width: number, height: number): void {
    if (width === this.canvas.width && height === this.canvas.height)
      return

    this.canvas.width = width
    this.canvas.height = height
  }
}
