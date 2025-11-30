import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Home,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  ChevronDown,
  BookText,
  Settings,
  Type
} from 'lucide-react'

const navItems = [
  { path: '/arabic', icon: BookText, label: "Arabe" },
  { path: '/quran', icon: BookOpen, label: 'Quran Hifz' },
]

// Arabic fonts for learning
const ARABIC_FONTS = [
  { id: 'amiri', name: 'Amiri', family: "'Amiri', serif" },
  { id: 'scheherazade', name: 'Scheherazade', family: "'Scheherazade New', serif" },
  { id: 'noto-naskh', name: 'Noto Naskh', family: "'Noto Naskh Arabic', serif" },
  { id: 'lateef', name: 'Lateef', family: "'Lateef', serif" },
]

// Book/Tome configuration
const BOOKS = [
  { id: 'aby1', name: 'Al-Arabiya Bayna Yadayk - Tome 1', shortName: 'ABY Tome 1' },
  { id: 'aby2', name: 'Al-Arabiya Bayna Yadayk - Tome 2', shortName: 'ABY Tome 2' },
  { id: 'aby3', name: 'Al-Arabiya Bayna Yadayk - Tome 3', shortName: 'ABY Tome 3' },
  { id: 'aby4', name: 'Al-Arabiya Bayna Yadayk - Tome 4', shortName: 'ABY Tome 4' },
]

export default function ArabicSidebar({ isOpen, setIsOpen, settings, updateSettings }) {
  const [openTomeDropdown, setOpenTomeDropdown] = useState(null) // Which tome dropdown is open
  const [configOpen, setConfigOpen] = useState(false)
  const [arabicDataTome1, setArabicDataTome1] = useState(null)
  const [arabicDataTome2, setArabicDataTome2] = useState(null)
  const [arabicDataTome3, setArabicDataTome3] = useState(null)

  const darkMode = settings.darkMode
  const currentBook = settings.arabicBook || 'aby1'
  const currentUnit = settings.arabicUnit || 1

  // Load Arabic data for all tomes
  useEffect(() => {
    // Load Tome 1
    fetch('/arabic/ABY-T1.json')
      .then(res => res.json())
      .then(data => setArabicDataTome1(data))
      .catch(err => console.error('Error loading arabic data tome 1:', err))

    // Load Tome 2
    fetch('/arabic/ABY-T2.json')
      .then(res => res.json())
      .then(data => setArabicDataTome2(data))
      .catch(err => console.error('Error loading arabic data tome 2:', err))

    // Load Tome 3
    fetch('/arabic/ABY-T3.json')
      .then(res => res.json())
      .then(data => setArabicDataTome3(data))
      .catch(err => console.error('Error loading arabic data tome 3:', err))
  }, [])

  const currentFont = ARABIC_FONTS.find(f => f.id === settings.arabicLearningFont) || ARABIC_FONTS[0]

  // Toggle tome dropdown
  const toggleTomeDropdown = (tomeId) => {
    setOpenTomeDropdown(openTomeDropdown === tomeId ? null : tomeId)
  }

  // Get units for a specific book
  const getUnitsForBook = (bookId) => {
    if (bookId === 'aby1') return arabicDataTome1?.units || []
    if (bookId === 'aby2') return arabicDataTome2?.units || []
    if (bookId === 'aby3') return arabicDataTome3?.units || []
    return [] // Tome 4 empty for now
  }

  // Get lessons count for a unit (dialogues for tome 1, lessons for tome 2)
  const getLessonsCount = (bookId, unit) => {
    if (bookId === 'aby1') return unit.dialogues?.length || 0
    return unit.lessons?.length || 0
  }

  // Get validation count for a book
  const getBookProgress = (bookId) => {
    const units = getUnitsForBook(bookId)
    if (units.length === 0) return { validated: 0, total: 0 }

    const validated = settings.arabicValidated || {}
    // Filter validations for this book
    const bookValidations = Object.keys(validated).filter(key => {
      const unitId = parseInt(key.split('-')[0])
      return units.some(u => u.id === unitId)
    }).length

    const totalLessons = units.reduce((acc, u) => acc + getLessonsCount(bookId, u), 0)
    return { validated: bookValidations, total: totalLessons }
  }

  return (
    <aside
      className={`fixed top-0 left-0 h-full transition-all duration-300 z-50 flex flex-col ${
        isOpen ? 'w-64' : 'w-16'
      } ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'} shadow-lg`}
    >
      {/* Header */}
      <div className={`p-4 flex items-center justify-between border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
        {isOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ع</span>
            </div>
            <h1 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Arabe</h1>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} ${!isOpen && 'mx-auto'}`}
        >
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
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
                  ? darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                  : darkMode ? 'text-gray-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50'
              } ${!isOpen && 'justify-center'}`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Books/Tomes Section */}
      {isOpen && (
        <div className={`flex-1 px-3 py-4 space-y-2 border-t mt-2 overflow-y-auto ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          <div className={`text-xs font-semibold uppercase tracking-wider px-3 mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Livres
          </div>

          {BOOKS.map((book) => {
            const bookUnits = getUnitsForBook(book.id)
            const progress = getBookProgress(book.id)
            const isCurrentBook = currentBook === book.id
            const hasUnits = bookUnits.length > 0

            return (
              <div key={book.id} className="relative">
                <button
                  onClick={() => hasUnits && toggleTomeDropdown(book.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                    isCurrentBook
                      ? darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                      : darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'
                  } ${!hasUnits && 'opacity-50 cursor-not-allowed'}`}
                  disabled={!hasUnits}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <BookOpen className={`w-4 h-4 flex-shrink-0 ${isCurrentBook ? 'text-emerald-500' : 'text-gray-500'}`} />
                    <span className={`text-sm font-medium truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {book.shortName}
                    </span>
                    {hasUnits && progress.total > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        darkMode ? 'bg-slate-600 text-gray-400' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {progress.validated}/{progress.total}
                      </span>
                    )}
                  </div>
                  {hasUnits && (
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${
                      openTomeDropdown === book.id ? 'rotate-180' : ''
                    }`} />
                  )}
                </button>

                {/* Units dropdown */}
                {openTomeDropdown === book.id && hasUnits && (
                  <div className={`mt-1 ml-4 rounded-lg border max-h-48 overflow-y-auto ${
                    darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'
                  }`}>
                    {bookUnits.map((unit) => (
                      <button
                        key={unit.id}
                        onClick={() => {
                          updateSettings({ arabicBook: book.id, arabicUnit: unit.id, arabicDialogue: 0 })
                          setOpenTomeDropdown(null)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          unit.id === currentUnit && currentBook === book.id
                            ? darkMode ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                            : darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {unit.id}. {unit.titleFr}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} dir="rtl">
                          {unit.titleAr}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Configuration Section */}
          <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setConfigOpen(!configOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                configOpen
                  ? darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                  : darkMode ? 'bg-slate-700/50 hover:bg-slate-700 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className={`w-4 h-4 ${configOpen ? 'text-emerald-500' : 'text-gray-500'}`} />
                <span className="text-sm font-medium">Configuration</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${configOpen ? 'rotate-180' : ''}`} />
            </button>

            {configOpen && (
              <div className={`mt-2 space-y-3 pl-2 border-l-2 ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                {/* Font Selection */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-emerald-500" />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Police</span>
                  </div>
                  <select
                    value={settings.arabicLearningFont || 'amiri'}
                    onChange={(e) => updateSettings({ arabicLearningFont: e.target.value })}
                    className={`text-xs px-2 py-1 rounded-lg border ${
                      darkMode
                        ? 'bg-slate-600 border-slate-500 text-gray-200'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    {ARABIC_FONTS.map(font => (
                      <option key={font.id} value={font.id}>{font.name}</option>
                    ))}
                  </select>
                </div>

                {/* Font Size */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Taille</span>
                  <div className="flex gap-1 items-end">
                    {['small', 'medium', 'large'].map((size) => (
                      <button
                        key={size}
                        onClick={() => updateSettings({ arabicLearningFontSize: size })}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                          (settings.arabicLearningFontSize || 'medium') === size
                            ? 'bg-emerald-500 text-white'
                            : darkMode ? 'bg-slate-600 text-gray-300 hover:bg-slate-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        title={size === 'small' ? 'Petit' : size === 'medium' ? 'Moyen' : 'Grand'}
                      >
                        <span className={size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base'} style={{ fontWeight: 'bold' }}>A</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dark Mode Toggle */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2">
                    {darkMode ? <Moon className="w-4 h-4 text-emerald-500" /> : <Sun className="w-4 h-4 text-emerald-500" />}
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mode sombre</span>
                  </div>
                  <button
                    onClick={() => updateSettings({ darkMode: !darkMode })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      darkMode ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                        darkMode ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapsed Settings Icons */}
      {!isOpen && (
        <div className={`flex-1 px-2 py-4 space-y-2 border-t mt-2 ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          <button
            onClick={() => updateSettings({ darkMode: !darkMode })}
            className={`w-full p-3 rounded-xl transition-colors ${
              darkMode
                ? 'bg-emerald-900/30 text-emerald-400'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Mode sombre"
          >
            {darkMode ? <Moon className="w-5 h-5 mx-auto" /> : <Sun className="w-5 h-5 mx-auto" />}
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="p-3">
        <div className={`rounded-2xl p-4 border ${!isOpen ? 'p-2' : ''} ${
          darkMode
            ? 'bg-gradient-to-br from-emerald-900/40 via-teal-900/30 to-emerald-900/20 border-emerald-700/30'
            : 'bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border-emerald-200/50'
        }`}>
          {isOpen ? (
            <>
              <p className={`text-center font-semibold ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}
                 style={{ fontFamily: "'Amiri', serif", fontSize: '1.1rem', lineHeight: '2' }} dir="rtl">
                اللُّغَةُ العَرَبِيَّةُ
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-transparent ${darkMode ? 'via-emerald-600' : 'via-emerald-300'}`} />
                <p className={`text-xs font-medium px-2 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  La langue arabe
                </p>
                <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-transparent ${darkMode ? 'via-emerald-600' : 'via-emerald-300'}`} />
              </div>
            </>
          ) : (
            <p className={`text-center text-lg ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>ع</p>
          )}
        </div>
      </div>
    </aside>
  )
}
