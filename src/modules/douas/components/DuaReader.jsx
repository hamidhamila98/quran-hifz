import { useState, useEffect } from 'react'
import {
  ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, RotateCcw
} from 'lucide-react'
import DouasAudioPlayer from './DouasAudioPlayer'
import {
  getDuaById, getDuasByCategory,
  markAsMemorized, removeFromProgress,
  isMemorized
} from '../services/douasService'

export default function DuaReader({ duaId, categoryId, darkMode, onBack, settings }) {
  const [dua, setDua] = useState(null)
  const [categoryDuas, setCategoryDuas] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(null) // 'memorized', 'inProgress', null
  const [currentIndex, setCurrentIndex] = useState(0)

  // Get settings with defaults
  const fontSize = settings?.douasFontSize || 'medium'
  const lineHeight = settings?.douasLineHeight || 'normal'
  const playbackSpeed = settings?.douasPlaybackSpeed || 1

  // Font size classes
  const fontSizeClasses = {
    small: 'text-xl',
    medium: 'text-2xl',
    large: 'text-3xl',
    xlarge: 'text-4xl'
  }

  // Line height classes
  const lineHeightClasses = {
    compact: 'leading-[2]',
    normal: 'leading-[2.5]',
    relaxed: 'leading-[3]',
    loose: 'leading-[3.5]'
  }

  useEffect(() => {
    loadData()
  }, [duaId, categoryId])

  useEffect(() => {
    // Update status when dua changes
    if (dua) {
      if (isMemorized(dua.id)) setStatus('memorized')
      else setStatus(null)
    }
  }, [dua])

  const loadData = async () => {
    setLoading(true)
    const duaData = await getDuaById(duaId)
    setDua(duaData)

    if (categoryId) {
      const duas = await getDuasByCategory(categoryId)
      setCategoryDuas(duas)
      const index = duas.findIndex(d => d.id === duaId)
      setCurrentIndex(index >= 0 ? index : 0)
    }

    setLoading(false)
  }

  const handleMarkMemorized = () => {
    if (status === 'memorized') {
      removeFromProgress(dua.id)
      setStatus(null)
    } else {
      markAsMemorized(dua.id)
      setStatus('memorized')
    }
  }

  const navigateToDua = (direction) => {
    if (!categoryDuas.length) return

    let newIndex = currentIndex + direction
    if (newIndex < 0) newIndex = categoryDuas.length - 1
    if (newIndex >= categoryDuas.length) newIndex = 0

    const newDua = categoryDuas[newIndex]
    if (newDua) {
      window.history.replaceState(null, '', `/douas?category=${categoryId}&dua=${newDua.id}`)
      setDua(newDua)
      setCurrentIndex(newIndex)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className={`animate-spin w-8 h-8 border-4 rounded-full ${
          darkMode ? 'border-emerald-500 border-t-transparent' : 'border-emerald-500 border-t-transparent'
        }`} />
      </div>
    )
  }

  if (!dua) {
    return (
      <div className="p-6 text-center">
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Dua non trouvée</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${
        darkMode ? 'border-slate-700' : 'border-gray-200'
      }`}>
        <button
          onClick={onBack}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            darkMode ? 'hover:bg-slate-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        {/* Navigation entre duas */}
        {categoryDuas.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateToDua(-1)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-slate-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentIndex + 1} / {categoryDuas.length}
            </span>
            <button
              onClick={() => navigateToDua(1)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-slate-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Status badge */}
        <div className="flex items-center gap-2">
          {status === 'memorized' && (
            <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600'
            }`}>
              <CheckCircle2 className="w-3 h-3" />
              Mémorisée
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Mini Audio Player + Memorized button */}
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
            {dua.audioUrl ? (
              <div className="flex-1">
                <DouasAudioPlayer
                  audioUrl={dua.audioUrl}
                  darkMode={darkMode}
                  playbackSpeed={playbackSpeed}
                />
              </div>
            ) : (
              <div className="flex-1" />
            )}
            <button
              onClick={handleMarkMemorized}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors flex-shrink-0 ${
                status === 'memorized'
                  ? 'bg-green-500 text-white'
                  : darkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Mémorisée
            </button>
          </div>

          {/* Arabic text */}
          <div className={`p-8 rounded-2xl mb-4 ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
            <p className={`font-arabic ${fontSizeClasses[fontSize]} ${lineHeightClasses[lineHeight]} text-center ${
              darkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              {dua.arabic}
            </p>
          </div>

          {/* Repetitions badge - prominently displayed */}
          {dua.repetitions > 1 && (
            <div className="flex justify-center mb-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                darkMode ? 'bg-amber-900/30 border border-amber-700/50' : 'bg-amber-50 border border-amber-200'
              }`}>
                <RotateCcw className={`w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                <span className={`font-semibold ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                  À répéter {dua.repetitions} fois
                </span>
              </div>
            </div>
          )}

          {/* Translation */}
          <div className={`p-5 rounded-xl ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
            <p className={`text-base leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {dua.french || dua.english}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
