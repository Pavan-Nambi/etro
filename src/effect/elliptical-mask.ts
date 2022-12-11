import { Movie } from '../movie'
import { Dynamic, val } from '../util'
import { Visual } from './visual'
import { Base, VisualBase as VisualBaseLayer } from '../layer/index'
import { get2DRenderingContext, getOutput } from '../compatibility-utils'
import { View } from '../view'

export class EllipticalMaskOptions {
  x: Dynamic<number>
  y: Dynamic<number>
  radiusX: Dynamic<number>
  radiusY: Dynamic<number>
  rotation?: Dynamic<number>
  startAngle?: Dynamic<number>
  endAngle?: Dynamic<number>
  anticlockwise?: Dynamic<boolean>
}

/**
 * Preserves an ellipse of the layer and clears the rest
 */
// TODO: Parent layer mask effects will make more complex masks easier
export class EllipticalMask extends Visual {
  x: Dynamic<number>
  y: Dynamic<number>
  radiusX: Dynamic<number>
  radiusY: Dynamic<number>
  rotation: Dynamic<number>
  startAngle: Dynamic<number>
  endAngle: Dynamic<number>
  anticlockwise: Dynamic<boolean>

  private _tmpCanvas
  private _tmpCtx

  constructor (options: EllipticalMaskOptions) {
    super()
    this.x = options.x
    this.y = options.y
    this.radiusX = options.radiusX
    this.radiusY = options.radiusY
    this.rotation = options.rotation || 0
    this.startAngle = options.startAngle || 0
    this.endAngle = options.endAngle !== undefined ? options.endAngle : 2 * Math.PI
    this.anticlockwise = options.anticlockwise || false
  }

  attach (target: Movie | VisualBaseLayer): void {
    super.attach(target)

    if (!target.view) {
      // For buffering if not using a view
      this._tmpCanvas = document.createElement('canvas')
      this._tmpCtx = this._tmpCanvas.getContext('2d')
    }
  }

  apply (target: Movie | VisualBaseLayer, reltime: number): void {
    super.apply(target, reltime)

    const ctx = get2DRenderingContext(target)

    const x = val(this, 'x', reltime)
    const y = val(this, 'y', reltime)
    const radiusX = val(this, 'radiusX', reltime)
    const radiusY = val(this, 'radiusY', reltime)
    const rotation = val(this, 'rotation', reltime)
    const startAngle = val(this, 'startAngle', reltime)
    const endAngle = val(this, 'endAngle', reltime)
    const anticlockwise = val(this, 'anticlockwise', reltime)

    let source = getOutput(target)
    if (!target.view) {
      this._tmpCanvas.width = source.width
      this._tmpCanvas.height = source.height
      this._tmpCtx.drawImage(source, 0, 0)
      source = this._tmpCanvas
    }

    ctx.clearRect(0, 0, source.width, source.height)
    ctx.save() // idk how to preserve clipping state without save/restore
    // create elliptical path and clip
    ctx.beginPath()
    ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise)
    ctx.closePath()
    ctx.clip()
    // render image with clipping state
    ctx.drawImage(source, 0, 0)
    ctx.restore()

    if (target.view) {
      target.view.finish();
      (source as ImageBitmap).close()
    }
  }
}
