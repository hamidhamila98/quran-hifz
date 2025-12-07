import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { BookMarked, ChevronRight, Star } from 'lucide-react'
import CategoryView from '../components/CategoryView'
import DuaReader from '../components/DuaReader'
import TrainingMode from '../components/TrainingMode'
import { getCategories, getStats, getProgress, getFavoriteCategories, toggleFavoriteCategory } from '../services/douasService'
import { MobileHeader } from '../../../components/sidebar'

export default function DouasPage({ settings, updateSettings, isMobile, setMobileMenuOpen }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState({ total: 0, memorized: 0, inProgress: 0, categories: 0 })
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  const darkMode = settings.darkMode
  const categoryId = searchParams.get('category')
  const duaId = searchParams.get('dua')
  const mode = searchParams.get('mode')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [cats, statsData] = await Promise.all([
      getCategories(),
      getStats()
    ])
    setCategories(cats)
    setStats(statsData)
    setFavorites(getFavoriteCategories())
    setLoading(false)
  }

  const handleToggleFavorite = (e, categoryId) => {
    e.stopPropagation()
    toggleFavoriteCategory(categoryId)
    setFavorites(getFavoriteCategories())
  }

  // Vue entraînement
  if (mode === 'training') {
    return (
      <TrainingMode
        darkMode={darkMode}
        categoryId={categoryId}
        settings={settings}
        onClose={() => navigate('/douas')}
      />
    )
  }

  // Vue lecture d'une dua
  if (duaId) {
    return (
      <DuaReader
        duaId={duaId}
        categoryId={categoryId}
        darkMode={darkMode}
        settings={settings}
        onBack={() => categoryId ? navigate(`/douas?category=${categoryId}`) : navigate('/douas')}
      />
    )
  }

  // Vue catégorie
  if (categoryId) {
    return (
      <CategoryView
        categoryId={categoryId}
        darkMode={darkMode}
        onSelectDua={(id) => navigate(`/douas?category=${categoryId}&dua=${id}`)}
        onBack={() => navigate('/douas')}
        onTraining={() => navigate(`/douas?category=${categoryId}&mode=training`)}
      />
    )
  }

  // Calculate progress percentage
  const progress = getProgress()
  const progressPercent = stats.total > 0 ? ((progress.memorized.length / stats.total) * 100).toFixed(0) : 0

  if (loading) {
    return (
      <div className={`flex-1 flex items-center justify-center ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Chargement...</p>
        </div>
      </div>
    )
  }

  // Vue accueil - Style copié de ArabicBooksPage
  return (
    <div className={`pb-20 ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Mobile Header */}
      <MobileHeader
        title="MyDouas"
        icon="🤲"
        gradientFrom="from-emerald-500"
        gradientTo="to-emerald-700"
        darkMode={darkMode}
        onMenuClick={() => setMobileMenuOpen && setMobileMenuOpen(true)}
      />

      <div className="p-4 md:p-6">
      {/* Header with total progress - Same style as ArabicBooksPage */}
      <div className={`mb-8 p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">د</span>
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Ma Progression
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Invocations mémorisées
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="font-bold text-2xl">{progress.memorized.length}</span>
              <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}> / {stats.total}</span>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                dua{progress.memorized.length > 1 ? 's' : ''} mémorisée{progress.memorized.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className={`font-bold text-xl px-4 py-2 rounded-xl ${
              darkMode ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {progressPercent}%
            </div>
          </div>
        </div>
        {/* Total progress bar */}
        <div className={`h-3 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-200'} overflow-hidden`}>
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(parseFloat(progressPercent), 0.5)}%` }}
          />
        </div>
      </div>

      {/* Categories Grid - Same style as ArabicBooksPage books */}
      <div className="mb-8">
        <h2 className={`text-lg font-semibold mb-4 px-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Catégories ({categories.length})
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category) => {
            const memorizedInCategory = category.duaIds.filter(id =>
              progress.memorized.includes(id)
            ).length
            const categoryPercent = category.duaIds.length > 0
              ? ((memorizedInCategory / category.duaIds.length) * 100).toFixed(0)
              : 0

            const isFavorite = favorites.includes(category.id)

            return (
              <div
                key={category.id}
                className={`relative p-5 rounded-2xl text-left transition-all ${
                  darkMode
                    ? 'bg-slate-800 hover:bg-slate-700 hover:scale-[1.02]'
                    : 'bg-white hover:bg-gray-50 hover:scale-[1.02] hover:shadow-lg'
                } shadow-sm`}
              >
                {/* Favorite button */}
                <button
                  onClick={(e) => handleToggleFavorite(e, category.id)}
                  className={`absolute top-4 right-4 p-2 rounded-lg transition-all z-10 ${
                    isFavorite
                      ? 'text-amber-500'
                      : darkMode
                        ? 'text-gray-600 hover:text-amber-500 hover:bg-slate-700'
                        : 'text-gray-300 hover:text-amber-500 hover:bg-gray-100'
                  }`}
                >
                  <Star className={`w-5 h-5 ${isFavorite ? 'fill-amber-500' : ''}`} />
                </button>

                {/* Clickable area */}
                <button
                  onClick={() => navigate(`/douas?category=${category.id}`)}
                  className="w-full text-left cursor-pointer"
                >
                  {/* Category icon */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-emerald-600 to-emerald-700">
                    <BookMarked className="w-6 h-6 text-white" />
                  </div>

                  {/* Category info */}
                  <h3 className={`font-bold text-sm mb-2 line-clamp-2 pr-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {category.titleFr || category.title}
                  </h3>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {category.duaIds.length} invocation{category.duaIds.length > 1 ? 's' : ''}
                  </p>

                  {/* Progress */}
                  {category.duaIds.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {memorizedInCategory}/{category.duaIds.length}
                        </span>
                        <span className={`font-semibold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          {categoryPercent}%
                        </span>
                      </div>
                      <div className={`h-2 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-200'} overflow-hidden`}>
                        <div
                          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(parseFloat(categoryPercent), 1)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>
      </div>
    </div>
  )
}
