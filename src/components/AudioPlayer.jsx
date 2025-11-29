import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, RefreshCw } from 'lucide-react'
import { getAudioUrl, RECITERS } from '../services/quranApi'

export default function AudioPlayer({
  ayahs,
  reciterId = 'ar.alafasy',
  darkMode,
  loopAll = false,
  onLoopChange = null
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isRepeatOne, setIsRepeatOne] = useState(false) // Répéter le verset actuel
  const [isLoading, setIsLoading] = useState(false)

  const audioRef = useRef(null)

  const currentAyah = ayahs[currentAyahIndex]
  const reciter = RECITERS.find(r => r.id === reciterId) || RECITERS[0]

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  useEffect(() => {
    // Reset when ayahs change
    setCurrentAyahIndex(0)
    setIsPlaying(false)
    setProgress(0)
  }, [ayahs])

  const loadAudio = () => {
    if (!currentAyah || !audioRef.current) return

    const audioUrl = getAudioUrl(currentAyah.number, reciterId)
    audioRef.current.src = audioUrl
    setIsLoading(true)
  }

  useEffect(() => {
    loadAudio()
  }, [currentAyahIndex, currentAyah, reciterId])

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
    if (!audioRef.current) return
    setProgress(audioRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return
    setDuration(audioRef.current.duration)
    setIsLoading(false)
  }

  const handleEnded = () => {
    if (isRepeatOne) {
      // Répéter le verset actuel
      audioRef.current.currentTime = 0
      audioRef.current.play()
    } else if (currentAyahIndex < ayahs.length - 1) {
      // Passer au verset suivant
      setCurrentAyahIndex(prev => prev + 1)
      setTimeout(() => {
        audioRef.current?.play()
      }, 300)
    } else if (loopAll) {
      // Boucle sur toute la sélection: revenir au début
      setCurrentAyahIndex(0)
      setTimeout(() => {
        audioRef.current?.play()
      }, 300)
    } else {
      // Fin de la lecture
      setIsPlaying(false)
      setCurrentAyahIndex(0)
    }
  }

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setProgress(time)
    }
  }

  const handlePrevious = () => {
    if (currentAyahIndex > 0) {
      setCurrentAyahIndex(prev => prev - 1)
    }
  }

  const handleNext = () => {
    if (currentAyahIndex < ayahs.length - 1) {
      setCurrentAyahIndex(prev => prev + 1)
    }
  }

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!ayahs || ayahs.length === 0) {
    return null
  }

  return (
    <div className={`rounded-2xl p-4 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onCanPlay={() => setIsLoading(false)}
        onWaiting={() => setIsLoading(true)}
      />

      {/* Current Ayah Info */}
      <div className="mb-4 text-center">
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {reciter.name}
        </p>
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
          Verset {currentAyahIndex + 1} sur {ayahs.length}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={progress}
          onChange={handleSeek}
          className="audio-progress w-full"
        />
        <div className="flex justify-between mt-1">
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {formatTime(progress)}
          </span>
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {/* Repeat One (verset actuel) */}
        <button
          onClick={() => setIsRepeatOne(!isRepeatOne)}
          title="Répéter le verset"
          className={`p-2 rounded-full transition-colors ${
            isRepeatOne
              ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400'
              : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400'
          }`}
        >
          <Repeat className="w-4 h-4" />
        </button>

        {/* Loop All (boucle globale) */}
        {onLoopChange && (
          <button
            onClick={() => onLoopChange(!loopAll)}
            title="Jouer en boucle"
            className={`p-2 rounded-full transition-colors ${
              loopAll
                ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'
                : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Previous */}
        <button
          onClick={handlePrevious}
          disabled={currentAyahIndex === 0}
          className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${
            currentAyahIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <SkipBack className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
        </button>

        {/* Play/Pause */}
        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={handleNext}
          disabled={currentAyahIndex === ayahs.length - 1}
          className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${
            currentAyahIndex === ayahs.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <SkipForward className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
        </button>

        {/* Volume */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          {isMuted ? (
            <VolumeX className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          ) : (
            <Volume2 className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          )}
        </button>
      </div>

      {/* Volume Slider */}
      <div className="mt-4 flex items-center gap-2 px-8">
        <Volume2 className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="audio-progress flex-1"
        />
      </div>
    </div>
  )
}
