import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import {
  Home,
  Brain,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Palette,
  Type,
  Volume2,
  ChevronDown,
  Hash,
  BookOpen,
  Settings,
  Eye,
  BookText
} from 'lucide-react'

const navItems = [
  { path: '/', icon: Home, label: "Aujourd'hui" },
  { path: '/training', icon: Brain, label: 'Entraînement' },
  { path: '/arabic', icon: BookText, label: 'Arabe' },
]

const ARABIC_FONTS = [
  // Polices Mushaf Uthmani KFGQPC
  { id: 'hafs-smart', name: 'Hafs Smart (Mushaf)', category: 'Mushaf' },
  { id: 'uthmanic-hafs', name: 'Uthmanic Hafs v18', category: 'Mushaf' },
  { id: 'hafs-uthmanic-v14', name: 'Hafs Uthmanic v14', category: 'Mushaf' },
  { id: 'kfgqpc-uthmanic', name: 'KFGQPC Uthmanic', category: 'Mushaf' },
  { id: 'al-mushaf', name: 'Al Mushaf', category: 'Mushaf' },
  // Polices Quran calligraphiques
  { id: 'al-qalam-quran-majeed', name: 'Al Qalam Quran Majeed', category: 'Calligraphie' },
  { id: 'al-qalam-quran', name: 'Al Qalam Quran', category: 'Calligraphie' },
  { id: 'me-quran', name: 'Me Quran', category: 'Calligraphie' },
  { id: 'amiri-quran-colored', name: 'Amiri Quran Colored', category: 'Calligraphie' },
  { id: 'amiri-quran', name: 'Amiri Quran', category: 'Calligraphie' },
  // Polices Naskh (lisibilité)
  { id: 'scheherazade', name: 'Scheherazade New', category: 'Naskh' },
  { id: 'droid-naskh', name: 'Droid Naskh', category: 'Naskh' },
  { id: 'noto-naskh', name: 'Noto Naskh Arabic', category: 'Naskh' },
  { id: 'lateef', name: 'Lateef', category: 'Naskh' },
  // Police Nastaliq
  { id: 'hafs-nastaleeq', name: 'Hafs Nastaleeq', category: 'Nastaliq' },
]

const RECITERS = [
  // Reciters with word-by-word timing (from quran-align)
  { id: 'ar.alafasy', name: 'Mishary Al-Afasy', type: 'Hafs', hasWordTiming: true },
  { id: 'ar.abdulbasitmujawwad', name: 'Abdul Basit (Mujawwad)', type: 'Hafs', hasWordTiming: true },
  { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit (Murattal)', type: 'Hafs', hasWordTiming: true },
  { id: 'ar.sudais', name: 'Abdurrahmaan As-Sudais', type: 'Hafs', hasWordTiming: true },
  { id: 'ar.shaatree', name: 'Abu Bakr Ash-Shaatree', type: 'Hafs', hasWordTiming: true },
  { id: 'ar.hanirifai', name: 'Hani Ar-Rifai', type: 'Hafs', hasWordTiming: true },
  { id: 'ar.husary', name: 'Al-Husary (Murattal)', type: 'Hafs', hasWordTiming: true },
  { id: 'ar.husarymuallim', name: 'Al-Husary (Muallim)', type: 'Hafs', hasWordTiming: true },
  { id: 'ar.minshawimujawwad', name: 'Al-Minshawi (Mujawwad)', type: 'Hafs', hasWordTiming: true },
  { id: 'ar.minshawimurttal', name: 'Al-Minshawi (Murattal)', type: 'Hafs', hasWordTiming: true },
  { id: 'ar.tablaway', name: 'Mohammad Al-Tablaway', type: 'Hafs', hasWordTiming: true },
  { id: 'ar.shuraym', name: 'Saood Ash-Shuraym', type: 'Hafs', hasWordTiming: true },
  // Reciter without word timing
  { id: 'ar.dosarywarsh', name: 'Ibrahim Al-Dosary (Warsh)', type: 'Warsh', hasWordTiming: false },
]

const PORTION_SIZES = [
  { id: '1/4', name: '¼ page/j', description: '4, 4, 4, 3 lignes' },
  { id: '1/3', name: '⅓ page/j', description: '5, 5, 5 lignes' },
  { id: '1/2', name: '½ page/j', description: '8, 7 lignes' },
  { id: '1', name: '1 page/j', description: '15 lignes' },
  { id: '2', name: '2 pages/j', description: '30 lignes' },
]

const FONT_SIZES = [
  { id: 'small', name: 'Petit' },
  { id: 'medium', name: 'Moyen' },
  { id: 'large', name: 'Grand' },
]

const TAFSIR_SOURCES = [
  { id: 'ibn-kathir', name: 'Ibn Kathir', hasEnglish: true },
  { id: 'tabari', name: 'Tabari', hasEnglish: false },
  { id: 'qurtubi', name: 'Qurtubi', hasEnglish: false },
]

export default function Sidebar({ isOpen, setIsOpen, settings, updateSettings }) {
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false)
  const [reciterDropdownOpen, setReciterDropdownOpen] = useState(false)
  const [portionDropdownOpen, setPortionDropdownOpen] = useState(false)
  const [tafsirDropdownOpen, setTafsirDropdownOpen] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)

  const currentFont = ARABIC_FONTS.find(f => f.id === settings.arabicFont) || ARABIC_FONTS[0]
  const currentReciter = RECITERS.find(r => r.id === settings.reciter) || RECITERS[0]
  const currentPortion = PORTION_SIZES.find(p => p.id === settings.portionSize) || PORTION_SIZES[1]
  const currentTafsir = TAFSIR_SOURCES.find(t => t.id === settings.tafsirSource) || TAFSIR_SOURCES[0]
  const darkMode = settings.darkMode

  return (
    <aside
      className={`fixed left-0 top-0 h-full shadow-lg transition-all duration-300 z-50 flex flex-col ${
        isOpen ? 'w-64' : 'w-16'
      } ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
        {isOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ق</span>
            </div>
            <h1 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Quran Hifz</h1>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
        >
          {isOpen ? (
            <ChevronLeft className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
          ) : (
            <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? darkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-50 text-primary-600'
                  : darkMode ? 'text-gray-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Settings Controls */}
      {isOpen && (
        <div className={`flex-1 px-3 py-4 space-y-3 border-t mt-2 overflow-y-auto ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          {/* Portion Size Dropdown - Always visible */}
          <div className="relative">
            <button
              onClick={() => { setPortionDropdownOpen(!portionDropdownOpen); setFontDropdownOpen(false); setReciterDropdownOpen(false) }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-500" />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {currentPortion.name}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${portionDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {portionDropdownOpen && (
              <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg border overflow-hidden z-50 max-h-48 overflow-y-auto ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
              }`}>
                {PORTION_SIZES.map((portion) => (
                  <button
                    key={portion.id}
                    onClick={() => {
                      updateSettings({ portionSize: portion.id, currentPortionIndex: 0 });
                      setPortionDropdownOpen(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                      settings.portionSize === portion.id
                        ? darkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-50 text-primary-600'
                        : darkMode ? 'text-gray-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{portion.name}</span>
                    <span className={`ml-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      ({portion.description})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reciter Dropdown - Always visible */}
          <div className="relative">
            <button
              onClick={() => { setReciterDropdownOpen(!reciterDropdownOpen); setFontDropdownOpen(false); setPortionDropdownOpen(false) }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-primary-500" />
                <span className={`text-sm font-medium truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {currentReciter.name}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${reciterDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {reciterDropdownOpen && (
              <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg border overflow-hidden z-50 max-h-48 overflow-y-auto ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
              }`}>
                {RECITERS.map((reciter) => (
                  <button
                    key={reciter.id}
                    onClick={() => { updateSettings({ reciter: reciter.id }); setReciterDropdownOpen(false) }}
                    className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                      settings.reciter === reciter.id
                        ? darkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-50 text-primary-600'
                        : darkMode ? 'text-gray-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {reciter.name}
                    {reciter.type === 'Warsh' && <span className="text-xs text-gray-500 ml-1">(Warsh)</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tajweed Toggle - Outside config */}
          <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary-500" />
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tajweed</span>
            </div>
            <button
              onClick={() => updateSettings({ tajweedEnabled: !settings.tajweedEnabled })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                settings.tajweedEnabled ? 'bg-primary-500' : darkMode ? 'bg-slate-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                  settings.tajweedEnabled ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {/* Tafsir Source Dropdown - Outside config */}
          <div className="relative">
            <button
              onClick={() => { setTafsirDropdownOpen(!tafsirDropdownOpen); setFontDropdownOpen(false); setReciterDropdownOpen(false); setPortionDropdownOpen(false) }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookText className="w-4 h-4 text-primary-500" />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tafsir: {currentTafsir.name}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${tafsirDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {tafsirDropdownOpen && (
              <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg border overflow-hidden z-50 ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
              }`}>
                {TAFSIR_SOURCES.map((tafsir) => (
                  <button
                    key={tafsir.id}
                    onClick={() => { updateSettings({ tafsirSource: tafsir.id }); setTafsirDropdownOpen(false) }}
                    className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                      settings.tafsirSource === tafsir.id || (!settings.tafsirSource && tafsir.id === 'ibn-kathir')
                        ? darkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-50 text-primary-600'
                        : darkMode ? 'text-gray-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tafsir.name}
                    {tafsir.hasEnglish && <span className="text-xs text-gray-500 ml-1">(AR/EN)</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark Mode Toggle - Outside config */}
          <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              {darkMode ? (
                <Moon className="w-4 h-4 text-primary-500" />
              ) : (
                <Sun className="w-4 h-4 text-primary-500" />
              )}
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mode sombre</span>
            </div>
            <button
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                darkMode ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                  darkMode ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {/* Configuration Button */}
          <button
            onClick={() => setConfigOpen(!configOpen)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
              configOpen
                ? darkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-50 text-primary-600'
                : darkMode ? 'bg-slate-700/50 hover:bg-slate-700 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className={`w-4 h-4 ${configOpen ? 'text-primary-500' : 'text-gray-500'}`} />
              <span className="text-sm font-medium">Configuration</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${configOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Configuration Options - Collapsible */}
          {configOpen && (
            <div className={`space-y-3 pl-2 border-l-2 ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
              {/* Arabic Numerals Toggle */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-primary-500" />
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Chiffres arabes</span>
                </div>
                <button
                  onClick={() => updateSettings({ arabicNumerals: !settings.arabicNumerals })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    settings.arabicNumerals ? 'bg-primary-500' : darkMode ? 'bg-slate-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                      settings.arabicNumerals ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Font Dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setFontDropdownOpen(!fontDropdownOpen); setReciterDropdownOpen(false); setPortionDropdownOpen(false) }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                    darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-primary-500" />
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{currentFont.name}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${fontDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {fontDropdownOpen && (
                  <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg border overflow-hidden z-50 max-h-48 overflow-y-auto ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
                  }`}>
                    {ARABIC_FONTS.map((font) => (
                      <button
                        key={font.id}
                        onClick={() => { updateSettings({ arabicFont: font.id }); setFontDropdownOpen(false) }}
                        className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                          settings.arabicFont === font.id
                            ? darkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-50 text-primary-600'
                            : darkMode ? 'text-gray-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Playback Speed */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Vitesse</span>
                <div className="flex gap-1">
                  {[1, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => updateSettings({ playbackSpeed: speed })}
                      className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                        settings.playbackSpeed === speed
                          ? 'bg-primary-500 text-white'
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

              {/* Verse Highlight Toggle */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary-500" />
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Suivi verset</span>
                </div>
                <button
                  onClick={() => updateSettings({ verseHighlight: settings.verseHighlight === false ? true : false })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    settings.verseHighlight !== false ? 'bg-primary-500' : darkMode ? 'bg-slate-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                      settings.verseHighlight !== false ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Word Highlight Toggle */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-primary-500" />
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Suivi mot</span>
                </div>
                <button
                  onClick={() => updateSettings({ wordHighlight: settings.wordHighlight === false ? true : false })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    settings.wordHighlight !== false ? 'bg-primary-500' : darkMode ? 'bg-slate-600' : 'bg-gray-300'
                  }`}
                  title={currentReciter.hasWordTiming ? 'Suivi mot par mot disponible' : 'Non disponible pour ce réciteur'}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                      settings.wordHighlight !== false ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Font Size - Quran */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Coran</span>
                <div className="flex gap-1 items-end">
                  <button
                    onClick={() => updateSettings({ fontSize: 'small' })}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                      (settings.fontSize || 'medium') === 'small'
                        ? 'bg-primary-500 text-white'
                        : darkMode ? 'bg-slate-600 text-gray-300 hover:bg-slate-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title="Petit"
                  >
                    <span className="text-xs font-bold">A</span>
                  </button>
                  <button
                    onClick={() => updateSettings({ fontSize: 'medium' })}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                      (settings.fontSize || 'medium') === 'medium'
                        ? 'bg-primary-500 text-white'
                        : darkMode ? 'bg-slate-600 text-gray-300 hover:bg-slate-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title="Moyen"
                  >
                    <span className="text-sm font-bold">A</span>
                  </button>
                  <button
                    onClick={() => updateSettings({ fontSize: 'large' })}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                      (settings.fontSize || 'medium') === 'large'
                        ? 'bg-primary-500 text-white'
                        : darkMode ? 'bg-slate-600 text-gray-300 hover:bg-slate-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title="Grand"
                  >
                    <span className="text-base font-bold">A</span>
                  </button>
                </div>
              </div>

              {/* Font Size - Tafsir/Translation */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tafsir/Trad</span>
                <div className="flex gap-1 items-end">
                  <button
                    onClick={() => updateSettings({ tafsirFontSize: 'small' })}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                      (settings.tafsirFontSize || 'medium') === 'small'
                        ? 'bg-primary-500 text-white'
                        : darkMode ? 'bg-slate-600 text-gray-300 hover:bg-slate-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title="Petit"
                  >
                    <span className="text-xs font-bold">A</span>
                  </button>
                  <button
                    onClick={() => updateSettings({ tafsirFontSize: 'medium' })}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                      (settings.tafsirFontSize || 'medium') === 'medium'
                        ? 'bg-primary-500 text-white'
                        : darkMode ? 'bg-slate-600 text-gray-300 hover:bg-slate-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title="Moyen"
                  >
                    <span className="text-sm font-bold">A</span>
                  </button>
                  <button
                    onClick={() => updateSettings({ tafsirFontSize: 'large' })}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                      (settings.tafsirFontSize || 'medium') === 'large'
                        ? 'bg-primary-500 text-white'
                        : darkMode ? 'bg-slate-600 text-gray-300 hover:bg-slate-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title="Grand"
                  >
                    <span className="text-base font-bold">A</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsed Settings Icons */}
      {!isOpen && (
        <div className={`flex-1 px-2 py-4 space-y-2 border-t mt-2 ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          <button
            onClick={() => updateSettings({ tajweedEnabled: !settings.tajweedEnabled })}
            className={`w-full p-3 rounded-xl transition-colors ${
              settings.tajweedEnabled
                ? darkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-100 text-primary-600'
                : darkMode ? 'text-gray-500 hover:bg-slate-700' : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Tajweed"
          >
            <Palette className="w-5 h-5 mx-auto" />
          </button>
          <button
            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
            className={`w-full p-3 rounded-xl transition-colors ${
              darkMode
                ? 'bg-primary-900/30 text-primary-400'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Mode sombre"
          >
            {darkMode ? <Moon className="w-5 h-5 mx-auto" /> : <Sun className="w-5 h-5 mx-auto" />}
          </button>
        </div>
      )}

      {/* Footer Verse */}
      <div className="p-3">
        <div className={`rounded-2xl p-4 border ${!isOpen ? 'p-2' : ''} ${
          darkMode
            ? 'bg-gradient-to-br from-primary-900/40 via-gold-900/30 to-primary-900/20 border-primary-700/30'
            : 'bg-gradient-to-br from-primary-500/10 via-gold-500/10 to-primary-500/5 border-primary-200/50'
        }`}>
          {isOpen ? (
            <>
              <p className={`text-center arabic-text font-semibold ${darkMode ? 'text-primary-300' : 'text-primary-700'}`} style={{ fontSize: '1.1rem', lineHeight: '2' }}>
                وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-transparent ${darkMode ? 'via-primary-600' : 'via-primary-300'}`} />
                <p className={`text-xs font-medium px-2 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>
                  Al-Muzzammil : 4
                </p>
                <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-transparent ${darkMode ? 'via-primary-600' : 'via-primary-300'}`} />
              </div>
            </>
          ) : (
            <p className={`text-center text-lg ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>ق</p>
          )}
        </div>
      </div>
    </aside>
  )
}
