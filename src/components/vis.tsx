import type { FC } from 'react'
import { useEffect, useRef } from 'react'
import VisRenderer from '../vis/vis'
import '../style/vis.css'

const TEXTURE_SIZE = 2048

const Vis: FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const visRef = useRef<VisRenderer | null>(null)
    const frameIdRef = useRef<number>(-1)

    useEffect(() => {
        if (!canvasRef.current) {
            throw new Error('No reference to canvas')
        }
        visRef.current = new VisRenderer(canvasRef.current, TEXTURE_SIZE)
    }, [])

    useEffect(() => {
        const resize = (): void => {
            if (!canvasRef.current || !visRef.current) {
                throw new Error('No reference to visualization')
            }

            const width = window.innerWidth * window.devicePixelRatio
            const height = window.innerHeight * window.devicePixelRatio

            canvasRef.current.width = width
            canvasRef.current.height = height
            visRef.current.resize(width, height)
        }
        resize()

        window.addEventListener('resize', resize)
        return () => {
            window.removeEventListener('resize', resize)
        }
    }, [])

    useEffect(() => {
        const tick = (time: number): void => {
            if (!visRef.current) { return }

            visRef.current.draw(time * 0.001)
            frameIdRef.current = window.requestAnimationFrame(tick)
        }
        frameIdRef.current = window.requestAnimationFrame(tick)
        return () => {
            window.cancelAnimationFrame(frameIdRef.current)
        }
    })

    return (
        <canvas ref={canvasRef} className="vis-canvas" />
    )
}

export default Vis
