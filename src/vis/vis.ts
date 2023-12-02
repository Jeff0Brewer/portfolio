import { mat4 } from 'gl-matrix'
import { initGl } from '../lib/gl-wrap'
import TexAttribRenderer from '../vis/tex-attrib'
import PointRenderer from '../vis/points'
import positionFrag from '../shaders/position-frag.glsl?raw'
import positionInitFrag from '../shaders/position-init-frag.glsl?raw'

const FOV = Math.PI * 0.5
const NEAR = 0.01
const FAR = 100

class VisRenderer {
    width: number
    height: number
    gl: WebGLRenderingContext
    positions: [TexAttribRenderer, TexAttribRenderer]
    currPosRenderer: number
    points: PointRenderer
    view: mat4
    proj: mat4

    constructor (canvas: HTMLCanvasElement, textureSize: number) {
        this.width = canvas.width
        this.height = canvas.height

        checkTextureSize(textureSize)
        this.gl = initGl(canvas)
        this.gl.enable(this.gl.DEPTH_TEST)

        // two position renderers so position calc can reference current
        // position texture from other renderer
        this.currPosRenderer = 0
        this.positions = [
            new TexAttribRenderer(this.gl, positionFrag, textureSize, 1),
            new TexAttribRenderer(this.gl, positionFrag, textureSize, 1)
        ]
        this.points = new PointRenderer(this.gl, textureSize)

        for (const renderer of this.positions) {
            renderer.initTexture(this.gl, positionInitFrag)
        }

        const aspect = canvas.width / canvas.height
        this.proj = mat4.perspective(mat4.create(), FOV, aspect, NEAR, FAR)
        this.view = mat4.lookAt(mat4.create(), [0, 1, 0], [0, 0, 0], [0, 0, 1])

        this.points.bindProgram(this.gl)
        this.points.setView(this.view)
        this.points.setProj(this.proj)
        this.points.setWindowDims(this.width, this.height)
    }

    draw (time: number): void {
        const lastPosTexture = this.positions[(this.currPosRenderer + 1) % 2].texture

        this.positions[this.currPosRenderer].draw(this.gl, [lastPosTexture])
        const currPosTexture = this.positions[this.currPosRenderer].texture

        // toggle between position rederers on each draw to access last
        // position texture from previous renderer
        this.currPosRenderer = (this.currPosRenderer + 1) % 2

        this.gl.viewport(0, 0, this.width, this.height)
        this.points.draw(this.gl, time, currPosTexture)
    }

    resize (width: number, height: number): void {
        this.width = width
        this.height = height

        const aspect = width / height
        this.proj = mat4.perspective(mat4.create(), FOV, aspect, NEAR, FAR)

        this.points.bindProgram(this.gl)
        this.points.setProj(this.proj)
        this.points.setWindowDims(this.width, this.height)
    }
}

const checkTextureSize = (size: number): void => {
    const powerOfTwo = (size & (size - 1)) === 0
    if (!powerOfTwo) {
        throw new Error(`texture size must be power of two, recieved ${size}`)
    }
}

export default VisRenderer
