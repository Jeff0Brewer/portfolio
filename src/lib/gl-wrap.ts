const initGl = (canvas: HTMLCanvasElement): WebGLRenderingContext => {
    const gl = canvas.getContext('webgl')
    if (!gl) {
        throw new Error('WebGL context creation failed')
    }
    gl.viewport(0, 0, canvas.width, canvas.height)
    return gl
}

const initShader = (
    gl: WebGLRenderingContext,
    type: number,
    source: string
): WebGLShader => {
    const shader = gl.createShader(type)
    if (!shader) {
        throw new Error('Shader creation failed')
    }
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    const compileSuccess = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (!compileSuccess) {
        const log = gl.getShaderInfoLog(shader)
        throw new Error(`Shader compilation failed: ${log}`)
    }
    return shader
}

const initProgram = (
    gl: WebGLRenderingContext,
    vertSource: string,
    fragSource: string
): WebGLProgram => {
    const vert = initShader(gl, gl.VERTEX_SHADER, vertSource)
    const frag = initShader(gl, gl.FRAGMENT_SHADER, fragSource)
    const program = gl.createProgram()
    if (!program) {
        throw new Error('Program creation failed')
    }
    gl.attachShader(program, vert)
    gl.attachShader(program, frag)
    gl.linkProgram(program)
    const linkSuccess = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (!linkSuccess) {
        const log = gl.getProgramInfoLog(program)
        throw new Error(`Program linking failed: ${log}`)
    }

    gl.useProgram(program)
    return program
}

const initBuffer = (gl: WebGLRenderingContext): WebGLBuffer => {
    const buffer = gl.createBuffer()
    if (!buffer) {
        throw new Error('Buffer creation failed')
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    return buffer
}

const initFloatAttribute = (
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    name: string,
    size: number,
    stride: number,
    offset: number
): (() => void) => {
    const location = gl.getAttribLocation(program, name)
    if (location === -1) {
        throw new Error(`Attribute ${name} not found in program`)
    }

    // store vertex attrib pointer call in closure for future binding
    const bindAttrib = (): void => {
        gl.vertexAttribPointer(
            location,
            size,
            gl.FLOAT,
            false,
            stride * Float32Array.BYTES_PER_ELEMENT,
            offset * Float32Array.BYTES_PER_ELEMENT
        )
    }
    bindAttrib()

    gl.enableVertexAttribArray(location)
    return bindAttrib
}

const initTexture = (gl: WebGLRenderingContext): WebGLTexture => {
    const texture = gl.createTexture()
    if (!texture) {
        throw new Error('Texture creation failed')
    }
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 0, 255])
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    return texture
}

const initTextureFramebuffer = (
    gl: WebGLRenderingContext,
    size: number
): {
    texture: WebGLTexture,
    framebuffer: WebGLFramebuffer
} => {
    const texture = gl.createTexture()
    if (!texture) {
        throw new Error('Texture creation failed')
    }

    const framebuffer = gl.createFramebuffer()
    if (!framebuffer) {
        throw new Error('Framebuffer creation failed')
    }

    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        size,
        size,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)

    return { texture, framebuffer }
}

const getTextureAttachments = (
    gl: WebGLRenderingContext,
    numTextures: number
): Array<number> => {
    const attachments = [
        gl.TEXTURE0,
        gl.TEXTURE1,
        gl.TEXTURE2,
        gl.TEXTURE3,
        gl.TEXTURE4,
        gl.TEXTURE5,
        gl.TEXTURE6,
        gl.TEXTURE7,
        gl.TEXTURE8,
        gl.TEXTURE9
    ]
    if (numTextures > attachments.length) {
        throw new Error('Too many texture attachments requested')
    }
    return attachments.slice(0, numTextures)
}

const FULLSCREEN_RECT = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])

export {
    initGl,
    initProgram,
    initBuffer,
    initFloatAttribute,
    initTexture,
    initTextureFramebuffer,
    getTextureAttachments,
    FULLSCREEN_RECT
}
