import { useState, useEffect, useRef } from 'react'
import {
  X, Play, Pause, Eye, RotateCcw, Check, ChevronDown, Shuffle
} from 'lucide-react'
import {
  generateTrainingSession, getCategories,
  markAsMemorized, getProgress
} from '../services/douasService'

export default function TrainingMode({ darkMode, categoryId, onClose, settings }) {
  const [step, setStep] = useState('setup') // 'setup', 'training', 'results'
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(categoryId || null)
  const [duaCount, setDuaCount] = useState(5)
  const [hiddenRatio, setHiddenRatio] = useState('1/2') // '1/2' ou '2/3'
  const [onlyMemorized, setOnlyMemorized] = useState(false)

  const [session, setSession] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [currentQuestion, setCurrentQuestion] = useState(1)

  const audioRef = useRef(null)

  // Playback speed from settings
  const playbackSpeed = settings?.douasPlaybackSpeed || 1

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed
    }
  }, [playbackSpeed])

  const loadCategories = async () => {
    const cats = await getCategories()
    setCategories(cats)
  }

  const startTraining = async () => {
    const duas = await generateTrainingSession({
      categoryId: selectedCategory,
      count: duaCount,
      onlyMemorized
    })

    if (duas.length === 0) {
      alert('Aucune dua disponible avec ces critères')
      return
    }

    setSession(duas)
    setCurrentIndex(0)
    setIsRevealed(false)
    setScore({ correct: 0, total: duaCount })
    setCurrentQuestion(1)
    setStep('training')
  }

  const currentDua = session[currentIndex]

  // Split text into visible and hidden parts
  const splitText = (text) => {
    if (!text) return { visible: '', hidden: '' }
    const words = text.split(' ')
    const visibleRatio = hiddenRatio === '2/3' ? 1/3 : 1/2
    const splitPoint = Math.ceil(words.length * visibleRatio)
    return {
      visible: words.slice(0, splitPoint).join(' '),
      hidden: words.slice(splitPoint).join(' ')
    }
  }

  const handleReveal = () => {
    setIsRevealed(true)
  }

  const handleAnswer = (points) => {
    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)

    // Update score
    const newScore = {
      correct: score.correct + points,
      total: score.total
    }
    setScore(newScore)

    // Mark as memorized if correct
    if (points === 1 && currentDua) {
      markAsMemorized(currentDua.id)
    }

    // Next question or end
    if (currentQuestion >= duaCount || currentIndex >= session.length - 1) {
      setStep('results')
    } else {
      setCurrentIndex(prev => prev + 1)
      setCurrentQuestion(prev => prev + 1)
      setIsRevealed(false)
    }
  }

  const toggleAudio = () => {
    if (!audioRef.current || !currentDua?.audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.src = currentDua.audioUrl
      audioRef.current.playbackRate = playbackSpeed
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err)
      })
    }
    setIsPlaying(!isPlaying)
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  const restartTraining = () => {
    setStep('setup')
    setSession([])
    setCurrentIndex(0)
    setIsRevealed(false)
    setScore({ correct: 0, total: 0 })
    setCurrentQuestion(1)
  }

  const getScoreMessage = () => {
    const percentage = Math.round((score.correct / score.total) * 100)
    if (percentage === 100) return { emoji: '🏆', message: 'Parfait ! Ma sha Allah !' }
    if (percentage >= 75) return { emoji: '⭐', message: 'Excellent travail !' }
    if (percentage >= 50) return { emoji: '💪', message: 'Bien ! Continue comme ça.' }
    if (percentage >= 25) return { emoji: '📖', message: 'Continue à réviser !' }
    return { emoji: '🤲', message: 'La persévérance est la clé !' }
  }

  // Setup screen
  if (step === 'setup') {
    const progress = getProgress()
    const memorizedCount = progress.memorized.length

    return (
      <div className={`h-full flex flex-col ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className={`flex items-center justify-between p-4 border-b ${
          darkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Mode Entraînement
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-slate-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-md mx-auto space-y-6">
            {/* Catégorie */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Catégorie
              </label>
              <div className="relative">
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className={`w-full px-4 py-3 rounded-xl border appearance-none cursor-pointer ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-gray-100'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title} ({cat.duaIds.length} duas)
                    </option>
                  ))}
                </select>
                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            </div>

            {/* Nombre de duas */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Nombre de questions
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[3, 5, 10, 15, 20].map(n => (
                  <button
                    key={n}
                    onClick={() => setDuaCount(n)}
                    className={`py-2 rounded-xl font-medium transition-colors ${
                      duaCount === n
                        ? 'bg-emerald-500 text-white'
                        : darkMode
                          ? 'bg-slate-800 hover:bg-slate-700 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Partie cachée */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Partie cachée
              </label>
              <div className="flex gap-2">
                {[
                  { id: '1/2', label: 'Moitié' },
                  { id: '2/3', label: '2 tiers' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setHiddenRatio(option.id)}
                    className={`flex-1 py-2 rounded-xl font-medium transition-colors ${
                      hiddenRatio === option.id
                        ? 'bg-emerald-500 text-white'
                        : darkMode
                          ? 'bg-slate-800 hover:bg-slate-700 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {hiddenRatio === '1/2'
                  ? 'La moitié de l\'invocation sera cachée'
                  : 'Les 2 tiers de l\'invocation seront cachés (plus difficile)'
                }
              </p>
            </div>

            {/* Mode révision */}
            {memorizedCount > 0 && (
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyMemorized}
                    onChange={(e) => setOnlyMemorized(e.target.checked)}
                    className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      Mode révision
                    </span>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Réviser uniquement les {memorizedCount} duas mémorisées
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Bouton démarrer */}
            <button
              onClick={startTraining}
              className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-lg transition-colors flex items-center justify-center gap-2"
            >
              <Shuffle className="w-5 h-5" />
              Commencer ({duaCount} questions)
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Training screen
  if (step === 'training' && currentDua) {
    const { visible, hidden } = splitText(currentDua.arabic)

    return (
      <div className={`h-full flex flex-col ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          darkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-slate-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Question {currentQuestion} / {duaCount}
          </div>

          <button
            onClick={restartTraining}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-slate-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className={`px-4 py-2 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${(currentQuestion / duaCount) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-500 font-medium">{score.correct} correct</span>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              {Math.round((score.correct / Math.max(currentQuestion - 1, 1)) * 100) || 0}%
            </span>
          </div>
        </div>

        {/* Hidden audio */}
        <audio ref={audioRef} onEnded={handleAudioEnded} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {/* Audio + Dua Card */}
            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
              {/* Play button */}
              {currentDua.audioUrl && (
                <div className="flex justify-center mb-6">
                  <button
                    onClick={toggleAudio}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                      isPlaying
                        ? 'bg-emerald-500 text-white'
                        : darkMode
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </button>
                </div>
              )}

              {/* Arabic text */}
              <div className="text-center mb-6" dir="rtl">
                <p className={`font-arabic text-2xl md:text-3xl leading-[2.5] ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  {isRevealed ? (
                    // Fully revealed
                    currentDua.arabic
                  ) : (
                    // Partially hidden
                    <>
                      <span>{visible}</span>
                      <span className="text-emerald-500 mx-2">...</span>
                      <span
                        className="verse-hidden cursor-pointer transition-all"
                        onClick={handleReveal}
                      >
                        {hidden}
                      </span>
                    </>
                  )}
                </p>
              </div>

              {/* Translation */}
              <div className={`p-4 rounded-xl mb-6 ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentDua.french || currentDua.english}
                </p>
              </div>

              {/* Repetitions */}
              {currentDua.repetitions > 1 && (
                <div className="flex justify-center mb-6">
                  <span className={`text-sm px-3 py-1.5 rounded-full ${
                    darkMode ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-700'
                  }`}>
                    À répéter {currentDua.repetitions} fois
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={`p-4 border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="max-w-md mx-auto">
            {!isRevealed ? (
              <button
                onClick={handleReveal}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
              >
                <Eye className="w-5 h-5" />
                Voir la réponse
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => handleAnswer(0)}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                >
                  <X className="w-5 h-5 mx-auto" />
                  <span className="text-sm">Incorrect</span>
                </button>
                <button
                  onClick={() => handleAnswer(0.5)}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
                >
                  <span className="text-lg font-bold">½</span>
                  <span className="text-sm block">Partiel</span>
                </button>
                <button
                  onClick={() => handleAnswer(1)}
                  className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
                >
                  <Check className="w-5 h-5 mx-auto" />
                  <span className="text-sm">Correct</span>
                </button>
              </div>
            )}

            {!isRevealed && (
              <p className={`text-center mt-3 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Cliquez sur la partie floutée pour la révéler
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Results screen
  if (step === 'results') {
    const { emoji, message } = getScoreMessage()
    const percentage = Math.round((score.correct / score.total) * 100)

    return (
      <div className={`h-full flex flex-col items-center justify-center p-6 ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className={`text-center max-w-md w-full p-8 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <div className="text-6xl mb-4">{emoji}</div>

          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Session terminée !
          </h2>

          <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{message}</p>

          <div className={`p-6 rounded-xl mb-6 ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <div className="flex justify-center gap-8 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">{score.correct}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Correct</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-500">{score.total - score.correct}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Incorrect</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-emerald-500 h-4 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {percentage}%
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={restartTraining}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
                darkMode
                  ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <RotateCcw className="w-5 h-5" />
              Recommencer
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
            >
              Terminer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
