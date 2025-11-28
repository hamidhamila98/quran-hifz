import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import HomePage from './pages/HomePage'
import TrainingPage from './pages/TrainingPage'

// Default settings
const defaultSettings = {
  portionSize: '1/3', // Options: '1/4', '1/3', '1/2', '1', '2' (pages par jour)
  currentPage: 1,
  currentAyah: 1,
  currentSurah: 1,
  currentAbsoluteLine: 1, // Position actuelle (ligne absolue 1-9060)
  currentPortionIndex: 0, // Index de la portion dans la page (0, 1, 2...)
  validatedPages: 0, // Nombre de pages validées (en quarts: 4 = 1 page)
  lastVerseKey: null, // Dernier verset affiché pour éviter répétitions
  reciter: 'ar.husary',
  startDate: new Date().toISOString().split('T')[0],
  darkMode: false,
  tajweedEnabled: false,
  arabicFont: 'amiri-quran',
  flowMode: false,
  arabicNumerals: true,
  hideBismillah: true, // Cacher Bismillah au début de chaque sourate
}

function App() {
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
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        settings={settings}
        updateSettings={updateSettings}
      />

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
        </Routes>
      </main>
    </div>
  )
}

export default App
