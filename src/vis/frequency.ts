import { initTexture } from '../lib/gl-wrap'
import AudioAnalyzer from '../lib/audio'

class FrequencyRenderer {
    analyzer: AudioAnalyzer
    texture: WebGLTexture

    constructor (gl: WebGLRenderingContext, analyzer: AudioAnalyzer) {
        this.analyzer = analyzer
        this.texture = initTexture(gl)
    }

    getTexture (gl: WebGLRenderingContext): WebGLTexture {
        const frequencies = this.analyzer.getFrequencies()
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.LUMINANCE,
            this.analyzer.size,
            1,
            0,
            gl.LUMINANCE,
            gl.UNSIGNED_BYTE,
            frequencies
        )

        return this.texture
    }
}

export default FrequencyRenderer
