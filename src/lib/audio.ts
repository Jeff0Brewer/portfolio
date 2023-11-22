class AudioAnalyzer {
    sourcePath: string
    size: number
    ctx: AudioContext | null
    audio: AudioBufferSourceNode | null
    analyzer: AnalyserNode | null
    paused: boolean

    constructor (sourcePath: string, size: number) {
        this.sourcePath = sourcePath
        this.size = size

        // don't initialize audio until user interaction
        this.ctx = null
        this.audio = null
        this.analyzer = null
        this.paused = true
    }

    async start (): Promise<void> {
        const ctx = new AudioContext()
        const audioBuffer = await fetch(this.sourcePath)
            .then(res => res.arrayBuffer())
            .then(buf => ctx.decodeAudioData(buf))

        const audio = ctx.createBufferSource()
        audio.buffer = audioBuffer
        audio.connect(ctx.destination)

        const analyzer = ctx.createAnalyser()
        // double size since top half of frequency data is usually empty
        analyzer.fftSize = this.size * 2
        audio.connect(analyzer)

        audio.start()
        this.paused = false

        this.ctx = ctx
        this.audio = audio
        this.analyzer = analyzer
    }

    getFrequencies (): Uint8Array {
        const freqs = new Uint8Array(this.size * 2)
        if (this.analyzer) {
            this.analyzer.getByteFrequencyData(freqs)
        }
        // slice bottom half to remove regularly empty values
        return freqs.slice(0, this.size)
    }

    playPause (): void {
        if (!this.ctx) {
            this.start()
        } else if (this.paused) {
            this.ctx.resume()
            this.paused = false
        } else {
            this.ctx.suspend()
            this.paused = true
        }
    }
}

export default AudioAnalyzer
