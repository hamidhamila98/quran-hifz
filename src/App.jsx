import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ArabicSidebar from './components/ArabicSidebar'
import HomePage from './pages/HomePage'
import TrainingPage from './pages/TrainingPage'
import ArabicPage from './pages/ArabicPage'

// Default settings
const defaultSettings = {
  portionSize: '1/3', // Options: '1/4', '1/3', '1/2', '1', '2' (pages par jour)
  currentPage: 1,
  currentAyah: 1,
  currentSurah: 1,
  currentAbsoluteLine: 1, // Position actuelle (ligne absolue 1-9060)
  currentPortionIndex: 0, // Index de la portion dans la page (0, 1, 2...)
  // Système de validation simple: tableau des pages validées [1, 2, 3, 7, 8...]
  validatedPages: [],
  // Portions validées par page pour le mode fractionné: { "5": [0, 1], "6": [0, 1, 2] }
  portionProgress: {},
  lastVerseKey: null, // Dernier verset affiché pour éviter répétitions
  reciter: 'ar.minshawimujawwad',
  playbackSpeed: 1, // Vitesse de lecture audio: 1, 1.5 ou 2
  startDate: new Date().toISOString().split('T')[0],
  darkMode: false,
  tajweedEnabled: false,
  arabicFont: 'hafs-uthmanic-v14',
  flowMode: false,
  arabicNumerals: true,
  wordHighlight: true, // Word-by-word highlighting during audio playback
  // Arabic learning settings
  arabicBook: 'aby1', // Current book/tome
  arabicUnit: 1,
  arabicDialogue: 0,
  arabicValidated: {}, // { "1-0": true, "1-1": true, ... }
  arabicLearningFont: 'amiri',
  arabicLearningFontSize: 'medium',
}

function App() {
  const location = useLocation()
  const isArabicPage = location.pathname.startsWith('/arabic')

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('quran-hifz-settings')
    // Fusionner avec les défauts pour gérer les nouveaux champs
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings
  })

  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('quran-hifz-settings', JSON.stringify(settings))
  }, [settings])

  // Apply dark mode
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.darkMode])

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  return (
    <div className={`flex min-h-screen ${settings.darkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
      {isArabicPage ? (
        <ArabicSidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          settings={settings}
          updateSettings={updateSettings}
        />
      ) : (
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          settings={settings}
          updateSettings={updateSettings}
        />
      )}

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Routes>
          <Route
            path="/"
            element={<HomePage settings={settings} updateSettings={updateSettings} />}
          />
          <Route
            path="/training"
            element={<TrainingPage settings={settings} />}
          />
          <Route
            path="/arabic"
            element={<ArabicPage settings={settings} updateSettings={updateSettings} />}
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
