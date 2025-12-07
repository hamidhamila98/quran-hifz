import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  BookOpen,
  BookMarked,
  ChevronDown,
  Brain,
  Type,
  Star
} from 'lucide-react'
import {
  SidebarWrapper,
  SidebarHeader,
  SidebarConfig,
  SidebarFooter,
  SidebarSizeSelector,
  SidebarLineHeightSelector,
  SidebarDropdown
} from '../../../components/sidebar'
import { getCategories, getProgress, getFavoriteCategories } from '../services/douasService'

const ARABIC_FONTS = [
  { id: 'noto-naskh', name: 'Noto Naskh Arabic' },
  { id: 'scheherazade', name: 'Scheherazade New' },
  { id: 'amiri', name: 'Amiri' },
  { id: 'lateef', name: 'Lateef' },
]

export default function DouasSidebar({ isOpen, setIsOpen, settings, updateSettings, isMobile, setMobileMenuOpen }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [categories, setCategories] = useState([])
  const [favoriteIds, setFavoriteIds] = useState([])
  const [favoritesOpen, setFavoritesOpen] = useState(true)
  const [configOpen, setConfigOpen] = useState(false)
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false)

  const darkMode = settings.darkMode
  const currentFont = ARABIC_FONTS.find(f => f.id === settings.douasFont) || ARABIC_FONTS[0]

  // Get current state from URL
  const searchParams = new URLSearchParams(location.search)
  const currentCategoryId = searchParams.get('category')
  const currentMode = searchParams.get('mode')
  const isTrainingMode = currentMode === 'training'
  const isProgressionPage = location.pathname === '/douas' && !currentCategoryId && !isTrainingMode

  useEffect(() => {
    loadData()
  }, [])

  // Listen for favorite changes
  useEffect(() => {
    const handleFavoritesChange = () => {
      setFavoriteIds(getFavoriteCategories())
    }
    window.addEventListener('douas-favorites-changed', handleFavoritesChange)
    return () => window.removeEventListener('douas-favorites-changed', handleFavoritesChange)
  }, [])

  const loadData = async () => {
    const cats = await getCategories()
    setCategories(cats)
    setFavoriteIds(getFavoriteCategories())
  }

  const handleCategoryClick = (categoryId) => {
    navigate(`/douas?category=${categoryId}`)
  }

  // Get favorite categories
  const favoriteCategories = categories.filter(c => favoriteIds.includes(c.id))

  // Get progress for category
  const progress = getProgress()
  const getCategoryProgress = (category) => {
    const memorized = category.duaIds.filter(id => progress.memorized.includes(id)).length
    return { memorized, total: category.duaIds.length }
  }

  return (
    <SidebarWrapper isOpen={isOpen} darkMode={darkMode} isMobile={isMobile}>
      <SidebarHeader
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        darkMode={darkMode}
        title="MyDouas"
        icon="🤲"
        gradientFrom="from-emerald-500"
        gradientTo="to-emerald-700"
        isMobile={isMobile}
        onClose={() => setMobileMenuOpen && setMobileMenuOpen(false)}
      />

      {/* Custom Navigation */}
      <nav className="p-3 space-y-1">
        {/* MyIslam */}
        <button
          onClick={() => navigate('/')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
            darkMode ? 'text-gray-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50'
          } ${!isOpen && 'justify-center'}`}
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="font-medium">MyIslam</span>}
        </button>

        {/* Ma Progression */}
        <button
          onClick={() => navigate('/douas')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
            isProgressionPage
              ? darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
              : darkMode ? 'text-gray-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50'
          } ${!isOpen && 'justify-center'}`}
        >
          <BookMarked className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="font-medium">Ma Progression</span>}
        </button>

        {/* Entraînement */}
        <button
          onClick={() => navigate('/douas?mode=training')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
            isTrainingMode
              ? darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
              : darkMode ? 'text-gray-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50'
          } ${!isOpen && 'justify-center'}`}
        >
          <Brain className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="font-medium">Entraînement</span>}
        </button>
      </nav>

      {/* Favorites Section */}
      {isOpen && (
        <div className={`flex-1 px-3 py-4 space-y-4 border-t mt-2 overflow-y-auto overflow-x-hidden ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>

          {/* Favoris */}
          {favoriteCategories.length > 0 && (
            <div>
              <button
                onClick={() => setFavoritesOpen(!favoritesOpen)}
                className={`w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider px-3 mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
              >
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  Favoris ({favoriteCategories.length})
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${favoritesOpen ? 'rotate-180' : ''}`} />
              </button>

              {favoritesOpen && (
                <div className="space-y-1">
                  {favoriteCategories.map((category) => {
                    const isActive = currentCategoryId === category.id
                    const catProgress = getCategoryProgress(category)

                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors ${
                          isActive
                            ? darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                            : darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <BookOpen className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-500' : 'text-gray-500'}`} />
                        <span className={`text-sm font-medium truncate flex-1 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {(category.titleFr || category.title).length > 22 ? (category.titleFr || category.title).substring(0, 22) + '...' : (category.titleFr || category.title)}
                        </span>
                        {catProgress.memorized > 0 && (
                          <span className={`text-xs ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            {catProgress.memorized}/{catProgress.total}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {favoriteCategories.length === 0 && (
            <div className={`text-center py-4 px-3 rounded-xl ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
              <Star className={`w-6 h-6 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Ajoutez des favoris depuis la page d'accueil
              </p>
            </div>
          )}

          {/* Configuration Section */}
          <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            <SidebarConfig
              isOpen={configOpen}
              setIsOpen={setConfigOpen}
              darkMode={darkMode}
              accentColor="emerald"
            >
              {/* Font Dropdown */}
              <SidebarDropdown
                value={currentFont.name}
                icon={Type}
                isOpen={fontDropdownOpen}
                setIsOpen={setFontDropdownOpen}
                options={ARABIC_FONTS}
                onSelect={(id) => updateSettings({ douasFont: id })}
                currentValue={settings.douasFont || 'noto-naskh'}
                darkMode={darkMode}
                accentColor="emerald"
              />

              {/* Font Size */}
              <SidebarSizeSelector
                label="Taille"
                value={settings.douasFontSize || 'medium'}
                onChange={(size) => updateSettings({ douasFontSize: size })}
                darkMode={darkMode}
                accentColor="emerald"
              />

              {/* Line Height */}
              <SidebarLineHeightSelector
                label="Interligne"
                value={settings.douasLineHeight || 'normal'}
                onChange={(height) => updateSettings({ douasLineHeight: height })}
                darkMode={darkMode}
                accentColor="emerald"
              />

              {/* Playback Speed */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Vitesse</span>
                <div className="flex gap-1">
                  {[1, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => updateSettings({ douasPlaybackSpeed: speed })}
                      className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                        (settings.douasPlaybackSpeed || 1) === speed
                          ? 'bg-emerald-500 text-white'
                          : darkMode
                            ? 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </SidebarConfig>
          </div>
        </div>
      )}

      {isOpen && (
        <SidebarFooter
          isOpen={isOpen}
          darkMode={darkMode}
          arabicText="أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ"
          frenchText="Al-Baqara : 186"
          accentColor="emerald"
        />
      )}
    </SidebarWrapper>
  )
}
