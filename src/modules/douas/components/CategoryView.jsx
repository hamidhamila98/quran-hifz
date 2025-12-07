import { useState, useEffect } from 'react'
import {
  ArrowLeft, GraduationCap, Play, CheckCircle2, Clock,
  ChevronRight
} from 'lucide-react'
import { getCategoryById, getDuasByCategory, getProgress, isMemorized, isInProgress } from '../services/douasService'

export default function CategoryView({ categoryId, darkMode, onSelectDua, onBack, onTraining }) {
  const [category, setCategory] = useState(null)
  const [duas, setDuas] = useState([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState({ memorized: [], inProgress: [] })

  useEffect(() => {
    loadData()
  }, [categoryId])

  const loadData = async () => {
    setLoading(true)
    const [cat, duasList] = await Promise.all([
      getCategoryById(categoryId),
      getDuasByCategory(categoryId)
    ])
    setCategory(cat)
    setDuas(duasList)
    setProgress(getProgress())
    setLoading(false)
  }

  const getStatusIcon = (duaId) => {
    if (progress.memorized.includes(duaId)) {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />
    }
    if (progress.inProgress.includes(duaId)) {
      return <Clock className="w-5 h-5 text-amber-500" />
    }
    return null
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className={`h-8 w-48 rounded-lg animate-pulse mb-4 ${darkMode ? 'bg-slate-800' : 'bg-gray-200'}`} />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-24 rounded-xl animate-pulse ${darkMode ? 'bg-slate-800' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="p-6 text-center">
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Catégorie non trouvée</p>
      </div>
    )
  }

  const memorizedCount = duas.filter(d => progress.memorized.includes(d.id)).length

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className={`p-2 rounded-lg transition-colors ${
            darkMode ? 'hover:bg-slate-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {category.titleFr || category.title}
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {duas.length} invocations
          </p>
        </div>
        <button
          onClick={onTraining}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
            darkMode
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          S'entraîner
        </button>
      </div>

      {/* Progress bar */}
      {memorizedCount > 0 && (
        <div className={`mb-6 p-4 rounded-xl ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Progression
            </span>
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {memorizedCount}/{duas.length}
            </span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(memorizedCount / duas.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Liste des duas */}
      <div className="space-y-3">
        {duas.map((dua, index) => (
          <button
            key={dua.id}
            onClick={() => onSelectDua(dua.id)}
            className={`w-full p-4 rounded-xl text-left transition-all hover:scale-[1.01] ${
              darkMode
                ? 'bg-slate-800 hover:bg-slate-750'
                : 'bg-white hover:bg-gray-50 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Numéro */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                darkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                {index + 1}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <p className={`font-arabic text-lg leading-loose mb-2 line-clamp-2 ${
                  darkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {dua.arabic}
                </p>
                <p className={`text-sm line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {dua.french || dua.english}
                </p>
                {dua.repetitions > 1 && (
                  <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                    darkMode ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {dua.repetitions}x
                  </span>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                {getStatusIcon(dua.id)}
                <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
