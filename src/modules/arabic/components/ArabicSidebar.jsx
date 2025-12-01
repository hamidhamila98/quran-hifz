import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  BookOpen,
  BookText,
  ChevronDown,
  Type,
  Brain,
  Lock
} from 'lucide-react'
import {
  SidebarWrapper,
  SidebarHeader,
  SidebarNav,
  SidebarDropdown,
  SidebarToggle,
  SidebarSizeSelector,
  SidebarConfig,
  SidebarFooter
} from '../../../components/sidebar'

const navItems = [
  { path: '/', icon: Home, label: 'MyIslam' },
  { path: '/arabic', icon: BookText, label: 'Ma Progression' },
  { path: '/arabic/training', icon: Brain, label: 'Entraînement' },
]

const ARABIC_FONTS = [
  { id: 'noto-naskh', name: 'Noto Naskh Arabic' },
  { id: 'amiri', name: 'Amiri' },
  { id: 'scheherazade', name: 'Scheherazade New' },
]

const BOOKS = [
  { id: 'aby-t1', key: 'aby1', name: 'A. Bayna Yadayk T1', available: true, dataFile: '/arabic/ABY-T1.json' },
  { id: 'aby-t2', key: 'aby2', name: 'A. Bayna Yadayk T2', available: false, dataFile: null },
  { id: 'aby-t3', key: 'aby3', name: 'A. Bayna Yadayk T3', available: false, dataFile: null },
  { id: 'aby-t4', key: 'aby4', name: 'A. Bayna Yadayk T4', available: false, dataFile: null },
  { id: 'qiraatu', key: 'qiraatu', name: 'Qiraatu al Rachida', available: false, dataFile: null },
  { id: 'qassas', key: 'qassas', name: 'Qassas al Nabiyeen', available: false, dataFile: null },
]

export default function ArabicSidebar({ isOpen, setIsOpen, settings, updateSettings }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [openBookDropdown, setOpenBookDropdown] = useState(null)
  const [configOpen, setConfigOpen] = useState(false)
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false)
  const [booksData, setBooksData] = useState({})

  const darkMode = settings.darkMode
  const currentFont = ARABIC_FONTS.find(f => f.id === settings.arabicLearningFont) || ARABIC_FONTS[0]

  // Get current book from URL
  const currentBookId = location.pathname.split('/arabic/')[1] || null

  // Load Arabic data for available books
  useEffect(() => {
    BOOKS.filter(b => b.available && b.dataFile).forEach(book => {
      fetch(book.dataFile)
        .then(res => res.json())
        .then(data => setBooksData(prev => ({ ...prev, [book.id]: data })))
        .catch(err => console.error(`Error loading ${book.id}:`, err))
    })
  }, [])

  const toggleBookDropdown = (bookId) => {
    setOpenBookDropdown(openBookDropdown === bookId ? null : bookId)
  }

  const getUnitsForBook = (bookId) => {
    return booksData[bookId]?.units || []
  }

  const closeAllDropdowns = () => {
    setFontDropdownOpen(false)
    setOpenBookDropdown(null)
  }

  const handleBookClick = (book) => {
    if (!book.available) return
    navigate(`/arabic/${book.id}?unit=1&dialogue=1`)
  }

  return (
    <SidebarWrapper isOpen={isOpen} darkMode={darkMode}>
      <SidebarHeader
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        darkMode={darkMode}
        title="MyArabic"
        icon=""
        gradientFrom="from-red-500"
        gradientTo="to-red-700"
      />

      <SidebarNav items={navItems} isOpen={isOpen} darkMode={darkMode} accentColor="red" />

      {/* Books Section */}
      {isOpen && (
        <div className={`flex-1 px-3 py-4 space-y-2 border-t mt-2 overflow-y-auto overflow-x-hidden ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          <div className={`text-xs font-semibold uppercase tracking-wider px-3 mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Livres
          </div>

          {BOOKS.map((book) => {
            const bookUnits = getUnitsForBook(book.id)
            const isCurrentBook = currentBookId === book.id
            const hasUnits = bookUnits.length > 0

            return (
              <div key={book.id} className="relative">
                <div className="flex items-center gap-1 overflow-hidden">
                  {/* Book button - navigates to book */}
                  <button
                    onClick={() => handleBookClick(book)}
                    className={`flex-1 min-w-0 flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors overflow-hidden ${
                      isCurrentBook
                        ? darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'
                        : darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'
                    } ${!book.available && 'opacity-50 cursor-not-allowed'}`}
                    disabled={!book.available}
                  >
                    <BookOpen className={`w-4 h-4 flex-shrink-0 ${isCurrentBook ? 'text-red-500' : 'text-gray-500'}`} />
                    <span className={`text-sm font-medium truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {book.name}
                    </span>
                    {!book.available && (
                      <Lock className="w-3 h-3 text-gray-500 ml-auto flex-shrink-0" />
                    )}
                  </button>

                  {/* Dropdown toggle for units (only for available books with units) */}
                  {book.available && hasUnits && (
                    <button
                      onClick={() => toggleBookDropdown(book.id)}
                      className={`p-2.5 rounded-xl transition-colors ${
                        darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
                        openBookDropdown === book.id ? 'rotate-180' : ''
                      }`} />
                    </button>
                  )}
                </div>

                {/* Units dropdown - clickable to navigate */}
                {openBookDropdown === book.id && hasUnits && (
                  <div className={`mt-2 rounded-xl max-h-64 overflow-y-auto overflow-x-hidden p-1.5 ${
                    darkMode ? 'bg-slate-800/90 shadow-lg shadow-black/20' : 'bg-gray-50 shadow-md'
                  }`}>
                    {bookUnits.map((unit) => (
                      <button
                        type="button"
                        key={unit.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          const url = `/arabic/${book.id}?unit=${unit.id}&dialogue=1`
                          setOpenBookDropdown(null)
                          navigate(url)
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-1 last:mb-0 transition-colors cursor-pointer ${
                          darkMode
                            ? 'hover:bg-slate-700/70 text-gray-300'
                            : 'hover:bg-white hover:shadow-sm text-gray-600'
                        }`}
                      >
                        <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          darkMode
                            ? 'bg-red-900/50 text-red-400'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {unit.id}
                        </span>
                        <span className="text-sm truncate text-left">{unit.titleFr} <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>({unit.titleAr})</span></span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Configuration Section */}
          <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            <SidebarConfig
              isOpen={configOpen}
              setIsOpen={setConfigOpen}
              darkMode={darkMode}
              accentColor="red"
            >
              {/* Font Dropdown */}
              <SidebarDropdown
                label=""
                value={currentFont.name}
                icon={Type}
                isOpen={fontDropdownOpen}
                setIsOpen={(open) => { closeAllDropdowns(); setFontDropdownOpen(open) }}
                options={ARABIC_FONTS}
                onSelect={(id) => updateSettings({ arabicLearningFont: id })}
                currentValue={settings.arabicLearningFont || 'amiri'}
                darkMode={darkMode}
                accentColor="red"
              />

              {/* Font Size */}
              <SidebarSizeSelector
                label="Taille"
                value={settings.arabicLearningFontSize || 'medium'}
                onChange={(size) => updateSettings({ arabicLearningFontSize: size })}
                darkMode={darkMode}
                accentColor="red"
              />

              {/* Tashkeel Toggle */}
              <SidebarToggle
                label="Masquer Tashkîl"
                icon={Type}
                value={settings.hideTashkeel || false}
                onChange={() => updateSettings({ hideTashkeel: !settings.hideTashkeel })}
                darkMode={darkMode}
                accentColor="red"
              />

            </SidebarConfig>
          </div>
        </div>
      )}

      {isOpen && (
        <SidebarFooter
          isOpen={isOpen}
          darkMode={darkMode}
          arabicText="إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا"
          frenchText="Yusuf : 2"
          accentColor="red"
        />
      )}
    </SidebarWrapper>
  )
}
