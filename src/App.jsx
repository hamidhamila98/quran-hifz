import { useState, useEffect, useCallback, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useUser } from './contexts/UserContext'
import LandingPage from './pages/LandingPage'
// Quran module
import QuranSidebar from './modules/quran/components/QuranSidebar'
import HomePage from './modules/quran/pages/HomePage'
import TrainingPage from './modules/quran/pages/TrainingPage'
// Arabic module
import ArabicSidebar from './modules/arabic/components/ArabicSidebar'
import ArabicPage from './modules/arabic/pages/ArabicPage'
import ArabicTrainingPage from './modules/arabic/pages/ArabicTrainingPage'
// Hadith module
import HadithSidebar from './modules/hadith/components/HadithSidebar'
import HadithPage from './modules/hadith/pages/HadithPage'
// Library module
import LibrarySidebar from './modules/library/components/LibrarySidebar'
import LibraryPage from './modules/library/pages/LibraryPage'
// Dourous module
import DourousSidebar from './modules/dourous/components/DourousSidebar'
import DourousPage from './modules/dourous/pages/DourousPage'

// Footer component for all pages
function Footer({ darkMode }) {
  return (
    <footer className={`
      fixed bottom-0 left-0 right-0 z-50
      ${darkMode
        ? 'bg-slate-800 border-t border-slate-700/50'
        : 'bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]'
      }
    `}>
      <div className="flex items-center justify-center py-3">
        <p style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", letterSpacing: '0.01em' }}>
          <span className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>MyIslam</span>
          <span className={`mx-2 ${darkMode ? 'text-slate-500' : 'text-gray-300'}`}>•</span>
          <span className={`text-base font-medium ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>AbuZayd93</span>
        </p>
      </div>
    </footer>
  )
}

// Page titles and favicon colors per module
const pageConfig = {
  '/': { title: 'MyIslam', color: '#10b981', letter: 'M' },
  '/quran': { title: 'MyHifz - MyIslam', color: '#10b981', letter: 'H' },
  '/arabic': { title: 'MyArabic - MyIslam', color: '#f59e0b', letter: 'A' },
  '/hadith': { title: 'MyHadith - MyIslam', color: '#f43f5e', letter: 'H' },
  '/library': { title: 'MyLibrary - MyIslam', color: '#6366f1', letter: 'L' },
  '/dourous': { title: 'MyDourous - MyIslam', color: '#06b6d4', letter: 'D' },
  '/conseils': { title: 'Conseils - MyIslam', color: '#a855f7', letter: 'C' },
}

// Generate SVG favicon
function generateFavicon(color, letter) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="45" fill="${color}"/>
    <text x="50" y="65" text-anchor="middle" fill="white" font-size="40" font-family="Arial, sans-serif" font-weight="bold">${letter}</text>
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

// Default settings
const defaultSettings = {
  portionSize: '1/3',
  currentPage: 1,
  currentAyah: 1,
  currentSurah: 1,
  currentAbsoluteLine: 1,
  currentPortionIndex: 0,
  validatedPages: [],
  portionProgress: {},
  lastVerseKey: null,
  reciter: 'ar.minshawimujawwad',
  playbackSpeed: 1,
  startDate: new Date().toISOString().split('T')[0],
  darkMode: false,
  tajweedEnabled: false,
  arabicFont: 'hafs-uthmanic-v14',
  flowMode: false,
  arabicNumerals: true,
  wordHighlight: true,
  arabicBook: 'aby1',
  arabicUnit: 1,
  arabicDialogue: 0,
  arabicValidated: {},
  arabicLearningFont: 'amiri',
  arabicLearningFontSize: 'medium',
  hadithSource: 'local',
  hadithBook: 'bukhari',
  hadithFont: 'amiri',
  hadithFontSize: 'medium',
  hadithShowIsnad: true,
}

function App() {
  const location = useLocation()
  const { user, isLoggedIn, updateUser } = useUser()

  const isLandingPage = location.pathname === '/'
  const isQuranPage = location.pathname.startsWith('/quran')
  const isArabicPage = location.pathname.startsWith('/arabic')
  const isHadithPage = location.pathname.startsWith('/hadith')
  const isLibraryPage = location.pathname.startsWith('/library')
  const isDourousPage = location.pathname.startsWith('/dourous')

  // Track if this is the initial load to avoid saving on first render
  const isInitialMount = useRef(true)
  const lastUserPseudo = useRef(user?.pseudo)

  // Load settings based on login state
  const getInitialSettings = useCallback(() => {
    if (isLoggedIn && user) {
      // Connected: merge user settings with defaults
      return { ...defaultSettings, ...user.settings }
    } else {
      // Guest: use guest_settings from localStorage
      const saved = localStorage.getItem('guest_settings')
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings
    }
  }, [isLoggedIn, user])

  const [settings, setSettings] = useState(getInitialSettings)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Reload settings when user changes (login/logout)
  useEffect(() => {
    // Only reload if user actually changed (not just settings update)
    if (lastUserPseudo.current !== user?.pseudo) {
      lastUserPseudo.current = user?.pseudo
      setSettings(getInitialSettings())
      isInitialMount.current = true // Reset to avoid immediate save
    }
  }, [isLoggedIn, user?.pseudo, getInitialSettings])

  // Save settings based on login state (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (isLoggedIn) {
      // Connected: save to user account
      updateUser({ settings })
    } else {
      // Guest: save to guest_settings
      localStorage.setItem('guest_settings', JSON.stringify(settings))
    }
  }, [settings]) // Removed isLoggedIn and updateUser from deps to avoid loops

  // Apply dark mode
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.darkMode])

  // Update page title and favicon based on route
  useEffect(() => {
    const basePath = '/' + location.pathname.split('/')[1]
    const config = pageConfig[basePath] || pageConfig['/']

    // Update title
    document.title = config.title

    // Update favicon
    const favicon = document.getElementById('favicon')
    if (favicon) {
      favicon.href = generateFavicon(config.color, config.letter)
    }
  }, [location.pathname])

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))
  }

  // Landing page has no sidebar
  if (isLandingPage) {
    return (
      <div className={settings.darkMode ? 'dark' : ''}>
        <Routes>
          <Route path="/" element={<LandingPage darkMode={settings.darkMode} toggleDarkMode={toggleDarkMode} />} />
        </Routes>
      </div>
    )
  }

  // Determine which sidebar to show
  const renderSidebar = () => {
    const sidebarProps = {
      isOpen: sidebarOpen,
      setIsOpen: setSidebarOpen,
      settings,
      updateSettings,
    }

    if (isArabicPage) return <ArabicSidebar {...sidebarProps} />
    if (isHadithPage) return <HadithSidebar {...sidebarProps} />
    if (isLibraryPage) return <LibrarySidebar {...sidebarProps} />
    if (isDourousPage) return <DourousSidebar {...sidebarProps} />
    return <QuranSidebar {...sidebarProps} />
  }

  return (
    <div className={`flex min-h-screen ${settings.darkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
      {renderSidebar()}

      <main className={`flex-1 transition-all duration-300 pb-12 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Routes>
          {/* Quran module */}
          <Route
            path="/quran"
            element={<HomePage settings={settings} updateSettings={updateSettings} />}
          />
          <Route
            path="/quran/training"
            element={<TrainingPage settings={settings} />}
          />
          {/* Arabic module */}
          <Route
            path="/arabic"
            element={<ArabicPage settings={settings} updateSettings={updateSettings} />}
          />
          <Route
            path="/arabic/training"
            element={<ArabicTrainingPage settings={settings} updateSettings={updateSettings} />}
          />
          {/* Hadith module */}
          <Route
            path="/hadith"
            element={<HadithPage settings={settings} updateSettings={updateSettings} />}
          />
          {/* Library module */}
          <Route
            path="/library"
            element={<LibraryPage settings={settings} updateSettings={updateSettings} />}
          />
          {/* Dourous module */}
          <Route
            path="/dourous"
            element={<DourousPage settings={settings} updateSettings={updateSettings} />}
          />
        </Routes>
      </main>

      <Footer darkMode={settings.darkMode} />
    </div>
  )
}

export default App
