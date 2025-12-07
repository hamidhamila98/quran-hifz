import { useState, useEffect, useCallback, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useUser } from './contexts/UserContext'
import LandingPage from './pages/LandingPage'
import Footer from './components/Footer'
// Quran module
import QuranSidebar from './modules/quran/components/QuranSidebar'
import HomePage from './modules/quran/pages/HomePage'
import TrainingPage from './modules/quran/pages/TrainingPage'
// Arabic module
import ArabicSidebar from './modules/arabic/components/ArabicSidebar'
import ArabicBooksPage from './modules/arabic/pages/ArabicBooksPage'
import ArabicPage from './modules/arabic/pages/ArabicPage'
import ArabicTrainingPage from './modules/arabic/pages/ArabicTrainingPage'
// Notes module
import NotesSidebar from './modules/notes/components/NotesSidebar'
import NotesPage from './modules/notes/pages/NotesPage'
// Douas module
import DouasSidebar from './modules/douas/components/DouasSidebar'
import DouasPage from './modules/douas/pages/DouasPage'

// Page titles and favicon colors per module
const pageConfig = {
  '/': { title: 'MyIslam', color: '#10b981', letter: 'M' },
  '/quran': { title: 'MyHifz - MyIslam', color: '#10b981', letter: 'H' },
  '/arabic': { title: 'MyArabic - MyIslam', color: '#ef4444', letter: 'A' },
  '/notes': { title: 'MyNotes - MyIslam', color: '#f59e0b', letter: 'N' },
  '/douas': { title: 'MyDouas - MyIslam', color: '#10b981', letter: 'D' },
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
  lineHeight: 'normal',
  flowMode: false,
  arabicNumerals: true,
  wordHighlight: true,
  arabicBook: 'aby1',
  arabicUnit: 1,
  arabicDialogue: 0,
  arabicValidated: {},
  arabicLearningFont: 'noto-naskh',
  arabicLearningFontSize: 'medium',
}

function App() {
  const location = useLocation()
  const { user, isLoggedIn, updateUser } = useUser()

  const isLandingPage = location.pathname === '/'
  const isQuranPage = location.pathname.startsWith('/quran')
  const isArabicPage = location.pathname.startsWith('/arabic')
  const isNotesPage = location.pathname.startsWith('/notes')
  const isDouasPage = location.pathname.startsWith('/douas')

  // Track if this is the initial load to avoid saving on first render
  const isInitialMount = useRef(true)
  const lastUserPseudo = useRef(user?.pseudo)

  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setMobileMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

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
      isOpen: isMobile ? true : sidebarOpen, // Always open when visible on mobile
      setIsOpen: isMobile ? setMobileMenuOpen : setSidebarOpen,
      settings,
      updateSettings,
      isMobile,
      mobileMenuOpen,
      setMobileMenuOpen,
    }

    if (isArabicPage) return <ArabicSidebar {...sidebarProps} />
    if (isNotesPage) return <NotesSidebar {...sidebarProps} />
    if (isDouasPage) return <DouasSidebar {...sidebarProps} />
    return <QuranSidebar {...sidebarProps} />
  }

  // Calculate main content margin based on device and sidebar state
  const getMainMargin = () => {
    if (isMobile) return 'ml-0' // No margin on mobile
    return sidebarOpen ? 'ml-64' : 'ml-16'
  }

  return (
    <div className={`flex h-screen overflow-hidden ${settings.darkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
      {/* Mobile overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile unless menu open */}
      <div className={`${isMobile ? (mobileMenuOpen ? 'block' : 'hidden') : 'block'}`}>
        {renderSidebar()}
      </div>

      <main className={`flex-1 transition-all duration-300 h-[calc(100vh-41px)] overflow-y-auto ${getMainMargin()}`}>
        <Routes>
          {/* Quran module */}
          <Route
            path="/quran"
            element={<HomePage settings={settings} updateSettings={updateSettings} isMobile={isMobile} setMobileMenuOpen={setMobileMenuOpen} />}
          />
          <Route
            path="/quran/training"
            element={<TrainingPage settings={settings} isMobile={isMobile} />}
          />
          {/* Arabic module */}
          <Route
            path="/arabic"
            element={<ArabicBooksPage settings={settings} updateSettings={updateSettings} isMobile={isMobile} setMobileMenuOpen={setMobileMenuOpen} />}
          />
          <Route
            path="/arabic/training"
            element={<ArabicTrainingPage settings={settings} updateSettings={updateSettings} isMobile={isMobile} />}
          />
          <Route
            path="/arabic/:bookId"
            element={<ArabicPage settings={settings} updateSettings={updateSettings} isMobile={isMobile} setMobileMenuOpen={setMobileMenuOpen} />}
          />
          {/* Notes module */}
          <Route
            path="/notes"
            element={<NotesPage settings={settings} updateSettings={updateSettings} isMobile={isMobile} setMobileMenuOpen={setMobileMenuOpen} />}
          />
          {/* Douas module */}
          <Route
            path="/douas"
            element={<DouasPage settings={settings} updateSettings={updateSettings} isMobile={isMobile} setMobileMenuOpen={setMobileMenuOpen} />}
          />
        </Routes>
      </main>

      <Footer darkMode={settings.darkMode} toggleDarkMode={toggleDarkMode} isMobile={isMobile} />
    </div>
  )
}

export default App
