import { FC, useState } from 'react'
import AudioAnalyzer from '../lib/audio'
import Vis from '../components/vis'
import '../style/app.css'

const App: FC = () => {
    // don't need audio setter until song change functionality added
    const [audio] = useState<AudioAnalyzer>(new AudioAnalyzer('song.mp3', 4096))
    const [paused, setPaused] = useState<boolean>(true)

    const playPause = (): void => {
        audio.playPause()
        setPaused(!paused)
    }

    return (
        <main className="app">
            { audio && <Vis audio={audio} /> }
            <button className="playPause" onClick={playPause}>
                { paused ? 'play' : 'pause' }
            </button>
        </main>
    )
}

export default App
