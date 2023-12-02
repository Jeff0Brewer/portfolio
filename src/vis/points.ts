import { mat4 } from 'gl-matrix'
import { initProgram, initBuffer, initFloatAttribute } from '../lib/gl-wrap'
import vertSource from '../shaders/point-vert.glsl?raw'
import fragSource from '../shaders/point-frag.glsl?raw'

const PX_PER_POS = 3

class PointRenderer {
    program: WebGLProgram
    buffer: WebGLBuffer
    bindInds: () => void
    setProj: (m: mat4) => void
    setView: (m: mat4) => void
    setTime: (t: number) => void
    setWindowDims: (w: number, h: number) => void
    numPoints: number

    constructor (gl: WebGLRenderingContext, textureSize: number) {
        this.program = initProgram(gl, vertSource, fragSource)
        this.bindInds = initFloatAttribute(gl, this.program, 'vertexInd', 1, 1, 0)
        this.numPoints = Math.floor(textureSize * textureSize / PX_PER_POS)

        // initialize buffer of vertex indices, used to
        // look up attributes from texture in shader
        const vertexIndices = new Float32Array(this.numPoints)
        for (let i = 0; i < vertexIndices.length; i++) {
            vertexIndices[i] = i
        }
        this.buffer = initBuffer(gl)
        gl.bufferData(gl.ARRAY_BUFFER, vertexIndices, gl.STATIC_DRAW)

        // store closures to easily set potentially changing uniforms
        const projLoc = gl.getUniformLocation(this.program, 'proj')
        const viewLoc = gl.getUniformLocation(this.program, 'view')
        const timeLoc = gl.getUniformLocation(this.program, 'currTime')
        const windowSizeLoc = gl.getUniformLocation(this.program, 'windowSize')
        this.setProj = (mat: mat4): void => { gl.uniformMatrix4fv(projLoc, false, mat) }
        this.setView = (mat: mat4): void => { gl.uniformMatrix4fv(viewLoc, false, mat) }
        this.setTime = (time: number): void => { gl.uniform1f(timeLoc, time) }
        this.setWindowDims = (w: number, h: number): void => {
            gl.uniform2f(windowSizeLoc, w, h)
        }

        // set static uniforms
        const textureSizeLoc = gl.getUniformLocation(this.program, 'texSize')
        gl.uniform1f(textureSizeLoc, textureSize)

        const posTextureLoc = gl.getUniformLocation(this.program, 'positions')
        gl.uniform1i(posTextureLoc, 0)
    }

    bindProgram (gl: WebGLRenderingContext): void {
        gl.useProgram(this.program)
    }

    draw (
        gl: WebGLRenderingContext,
        time: number,
        positions: WebGLTexture
    ): void {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

        gl.useProgram(this.program)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
        this.bindInds()

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, positions)

        this.setTime(time)

        gl.drawArrays(gl.POINTS, 0, this.numPoints)
    }
}

export default PointRenderer
