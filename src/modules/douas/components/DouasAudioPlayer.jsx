import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Repeat } from 'lucide-react'

export default function DouasAudioPlayer({
  audioUrl,
  darkMode,
  playbackSpeed = 1
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLooping, setIsLooping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const audioRef = useRef(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed
    }
  }, [playbackSpeed])

  useEffect(() => {
    // Reset when audio URL changes
    setIsPlaying(false)
    setProgress(0)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }, [audioUrl])

  const handlePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err)
      })
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current || !duration) return
    const percent = (audioRef.current.currentTime / duration) * 100
    setProgress(percent)
  }

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return
    setDuration(audioRef.current.duration)
    setIsLoading(false)
  }

  const handleEnded = () => {
    if (isLooping) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    } else {
      setIsPlaying(false)
      setProgress(0)
    }
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const time = percent * duration
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setProgress(percent * 100)
    }
  }

  if (!audioUrl) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onCanPlay={() => {
          setIsLoading(false)
          if (audioRef.current) audioRef.current.playbackRate = playbackSpeed
        }}
        onWaiting={() => setIsLoading(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Play/Pause Button */}
      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          isPlaying
            ? 'bg-emerald-500 text-white'
            : darkMode
              ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" />
        )}
      </button>

      {/* Progress Bar */}
      <div
        onClick={handleSeek}
        className={`flex-1 h-2 rounded-full cursor-pointer ${
          darkMode ? 'bg-slate-700' : 'bg-gray-200'
        }`}
      >
        <div
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Loop Button */}
      <button
        onClick={() => setIsLooping(!isLooping)}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          isLooping
            ? 'bg-emerald-500 text-white'
            : darkMode
              ? 'bg-slate-700 hover:bg-slate-600 text-gray-400'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
        }`}
      >
        <Repeat className="w-4 h-4" />
      </button>
    </div>
  )
}
