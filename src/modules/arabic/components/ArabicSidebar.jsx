import { useState, useEffect } from 'react'
import {
  Home,
  BookOpen,
  BookText,
  ChevronDown,
  Type,
  Moon,
  Sun,
  Brain
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
  { path: '/arabic', icon: BookText, label: 'Livres' },
  { path: '/arabic/training', icon: Brain, label: 'Entraînement' },
]

const ARABIC_FONTS = [
  { id: 'amiri', name: 'Amiri' },
  { id: 'scheherazade', name: 'Scheherazade New' },
  { id: 'noto-naskh', name: 'Noto Naskh Arabic' },
  { id: 'lateef', name: 'Lateef' },
]

const BOOKS = [
  { id: 'aby1', name: 'Al-Arabiya Bayna Yadayk - Tome 1', shortName: 'ABY Tome 1' },
  { id: 'aby2', name: 'Al-Arabiya Bayna Yadayk - Tome 2', shortName: 'ABY Tome 2' },
  { id: 'aby3', name: 'Al-Arabiya Bayna Yadayk - Tome 3', shortName: 'ABY Tome 3' },
  { id: 'aby4', name: 'Al-Arabiya Bayna Yadayk - Tome 4', shortName: 'ABY Tome 4' },
]

export default function ArabicSidebar({ isOpen, setIsOpen, settings, updateSettings }) {
  const [openTomeDropdown, setOpenTomeDropdown] = useState(null)
  const [configOpen, setConfigOpen] = useState(false)
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false)
  const [arabicDataTome1, setArabicDataTome1] = useState(null)
  const [arabicDataTome2, setArabicDataTome2] = useState(null)
  const [arabicDataTome3, setArabicDataTome3] = useState(null)

  const darkMode = settings.darkMode
  const currentBook = settings.arabicBook || 'aby1'
  const currentUnit = settings.arabicUnit || 1
  const currentFont = ARABIC_FONTS.find(f => f.id === settings.arabicLearningFont) || ARABIC_FONTS[0]

  // Load Arabic data for all tomes
  useEffect(() => {
    fetch('/arabic/ABY-T1.json')
      .then(res => res.json())
      .then(data => setArabicDataTome1(data))
      .catch(err => console.error('Error loading arabic data tome 1:', err))

    fetch('/arabic/ABY-T2.json')
      .then(res => res.json())
      .then(data => setArabicDataTome2(data))
      .catch(err => console.error('Error loading arabic data tome 2:', err))

    fetch('/arabic/ABY-T3.json')
      .then(res => res.json())
      .then(data => setArabicDataTome3(data))
      .catch(err => console.error('Error loading arabic data tome 3:', err))
  }, [])

  const toggleTomeDropdown = (tomeId) => {
    setOpenTomeDropdown(openTomeDropdown === tomeId ? null : tomeId)
  }

  const getUnitsForBook = (bookId) => {
    if (bookId === 'aby1') return arabicDataTome1?.units || []
    if (bookId === 'aby2') return arabicDataTome2?.units || []
    if (bookId === 'aby3') return arabicDataTome3?.units || []
    return []
  }

  const getLessonsCount = (bookId, unit) => {
    if (bookId === 'aby1') return unit.dialogues?.length || 0
    return unit.lessons?.length || 0
  }

  const getBookProgress = (bookId) => {
    const units = getUnitsForBook(bookId)
    if (units.length === 0) return { validated: 0, total: 0 }

    const validated = settings.arabicValidated || {}
    const bookValidations = Object.keys(validated).filter(key => {
      const unitId = parseInt(key.split('-')[0])
      return units.some(u => u.id === unitId)
    }).length

    const totalLessons = units.reduce((acc, u) => acc + getLessonsCount(bookId, u), 0)
    return { validated: bookValidations, total: totalLessons }
  }

  const closeAllDropdowns = () => {
    setFontDropdownOpen(false)
    setOpenTomeDropdown(null)
  }

  return (
    <SidebarWrapper isOpen={isOpen} darkMode={darkMode}>
      <SidebarHeader
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        darkMode={darkMode}
        title="MyArabic"
        icon="ع"
        gradientFrom="from-amber-500"
        gradientTo="to-amber-700"
      />

      <SidebarNav items={navItems} isOpen={isOpen} darkMode={darkMode} accentColor="amber" />

      {/* Books Section */}
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
                      ? darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600'
                      : darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'
                  } ${!hasUnits && 'opacity-50 cursor-not-allowed'}`}
                  disabled={!hasUnits}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <BookOpen className={`w-4 h-4 flex-shrink-0 ${isCurrentBook ? 'text-amber-500' : 'text-gray-500'}`} />
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
                  <div className={`mt-1 ml-2 rounded-lg border max-h-64 overflow-y-auto ${
                    darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'
                  }`}>
                    {bookUnits.map((unit) => {
                      const lessons = book.id === 'aby1' ? unit.dialogues : unit.lessons
                      const isUnitSelected = unit.id === currentUnit && currentBook === book.id
                      return (
                        <div key={unit.id} className="border-b last:border-b-0 border-slate-600/30">
                          {/* Unit header with Arabic title */}
                          <div className={`px-3 py-2 ${darkMode ? 'bg-slate-600/50' : 'bg-gray-100'}`}>
                            <div className={`text-sm font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} dir="rtl">
                              {unit.titleAr}
                            </div>
                          </div>
                          {/* Dialogues list */}
                          <div className="py-1">
                            {lessons?.map((lesson, idx) => {
                              const isSelected = isUnitSelected && settings.arabicDialogue === idx
                              // For Unit 1, show A/B suffix if dialogue id ends with 'b'
                              const dialogueLabel = lesson.id?.toString().includes('b')
                                ? `Unité ${unit.id} - Dialogue ${lesson.id}`
                                : `Unité ${unit.id} - Dialogue ${lesson.id}`
                              return (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    updateSettings({ arabicBook: book.id, arabicUnit: unit.id, arabicDialogue: idx })
                                    setOpenTomeDropdown(null)
                                  }}
                                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                                    isSelected
                                      ? darkMode ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700'
                                      : darkMode ? 'hover:bg-slate-600 text-gray-300' : 'hover:bg-gray-50 text-gray-600'
                                  }`}
                                >
                                  {dialogueLabel}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
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
              accentColor="amber"
            >
              {/* Font Dropdown */}
              <SidebarDropdown
                label="Police"
                value={currentFont.name}
                icon={Type}
                isOpen={fontDropdownOpen}
                setIsOpen={(open) => { closeAllDropdowns(); setFontDropdownOpen(open) }}
                options={ARABIC_FONTS}
                onSelect={(id) => updateSettings({ arabicLearningFont: id })}
                currentValue={settings.arabicLearningFont || 'amiri'}
                darkMode={darkMode}
                accentColor="amber"
              />

              {/* Font Size */}
              <SidebarSizeSelector
                label="Taille"
                value={settings.arabicLearningFontSize || 'medium'}
                onChange={(size) => updateSettings({ arabicLearningFontSize: size })}
                darkMode={darkMode}
                accentColor="amber"
              />

              {/* Tashkeel Toggle */}
              <SidebarToggle
                label="Masquer Tashkîl"
                icon={Type}
                value={settings.hideTashkeel || false}
                onChange={() => updateSettings({ hideTashkeel: !settings.hideTashkeel })}
                darkMode={darkMode}
                accentColor="amber"
              />

              {/* PDF Mode Toggle */}
              <SidebarToggle
                label="Mode PDF"
                icon={BookOpen}
                value={settings.pdfMode || false}
                onChange={() => updateSettings({ pdfMode: !settings.pdfMode })}
                darkMode={darkMode}
                accentColor="amber"
              />

              {/* Dark Mode Toggle */}
              <SidebarToggle
                label="Mode sombre"
                icon={darkMode ? Moon : Sun}
                value={darkMode}
                onChange={() => updateSettings({ darkMode: !darkMode })}
                darkMode={darkMode}
                accentColor="amber"
              />
            </SidebarConfig>
          </div>
        </div>
      )}

      {/* Collapsed Icons */}
      {!isOpen && (
        <div className={`flex-1 px-2 py-4 space-y-2 border-t mt-2 ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          <button
            onClick={() => updateSettings({ darkMode: !darkMode })}
            className={`w-full p-3 rounded-xl transition-colors ${
              darkMode
                ? 'bg-amber-900/30 text-amber-400'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Mode sombre"
          >
            {darkMode ? <Moon className="w-5 h-5 mx-auto" /> : <Sun className="w-5 h-5 mx-auto" />}
          </button>
        </div>
      )}

      <SidebarFooter
        isOpen={isOpen}
        darkMode={darkMode}
        arabicText="اللُّغَةُ العَرَبِيَّةُ"
        frenchText="La langue arabe"
        accentColor="amber"
      />
    </SidebarWrapper>
  )
}
