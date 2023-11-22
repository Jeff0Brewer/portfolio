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
        this.setProj = (mat: mat4): void => {
            gl.useProgram(this.program)
            gl.uniformMatrix4fv(projLoc, false, mat)
        }
        this.setView = (mat: mat4): void => {
            gl.useProgram(this.program)
            gl.uniformMatrix4fv(viewLoc, false, mat)
        }

        // set static uniforms
        const textureSizeLoc = gl.getUniformLocation(this.program, 'texSize')
        gl.uniform1f(textureSizeLoc, textureSize)

        const posTextureLoc = gl.getUniformLocation(this.program, 'positions')
        const freqTextureLoc = gl.getUniformLocation(this.program, 'frequencies')
        gl.uniform1i(posTextureLoc, 0)
        gl.uniform1i(freqTextureLoc, 1)

        const dprLoc = gl.getUniformLocation(this.program, 'dpr')
        gl.uniform1f(dprLoc, window.devicePixelRatio)
    }

    draw (
        gl: WebGLRenderingContext,
        positions: WebGLTexture,
        width: number,
        height: number
    ): void {
        gl.viewport(0, 0, width, height)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.useProgram(this.program)
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, positions)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
        this.bindInds()

        gl.drawArrays(gl.POINTS, 0, this.numPoints)
    }
}

export default PointRenderer
