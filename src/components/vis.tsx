import type { FC } from 'react'
import { useState, useEffect, useRef } from 'react'
import AudioAnalyzer from '../lib/audio'
import VisRenderer from '../vis/vis'
import '../style/vis.css'

const TEXTURE_SIZE = 2048

type VisProps = {
    audio: AudioAnalyzer
}

const Vis: FC<VisProps> = ({ audio }) => {
    const [width, setWidth] = useState<number>(0)
    const [height, setHeight] = useState<number>(0)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const visRef = useRef<VisRenderer | null>(null)
    const frameIdRef = useRef<number>(-1)

    useEffect(() => {
        const fitToWindow = (): void => {
            setWidth(window.innerWidth * window.devicePixelRatio)
            setHeight(window.innerHeight * window.devicePixelRatio)
        }
        // initialize canvas size
        fitToWindow()

        // resize canvas on window resize
        window.addEventListener('resize', fitToWindow)
        return () => {
            window.removeEventListener('resize', fitToWindow)
        }
    }, [])

    useEffect(() => {
        if (!canvasRef.current) {
            throw new Error('could not get reference to canvas')
        }
        visRef.current = new VisRenderer(
            canvasRef.current,
            TEXTURE_SIZE,
            audio
        )
        // will reinitialize vis renderer every time audio changes
        // highly unneccesary but fine for now
    }, [audio])

    useEffect(() => {
        // update projection matrices on canvas resize
        if (visRef.current) {
            visRef.current.resize(width, height)
        }
    }, [width, height])

    useEffect(() => {
        const tick = (): void => {
            if (!visRef.current) { return }

            visRef.current.draw()
            frameIdRef.current = window.requestAnimationFrame(tick)
        }
        frameIdRef.current = window.requestAnimationFrame(tick)
        return () => {
            window.cancelAnimationFrame(frameIdRef.current)
        }
    })

    return (
        <canvas
            width={width}
            height={height}
            ref={canvasRef}
            className="vis-canvas"
        />
    )
}

export default Vis
