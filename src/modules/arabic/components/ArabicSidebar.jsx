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

export default function ArabicSidebar({ isOpen, setIsOpen, settings, updateSettings, isMobile, setMobileMenuOpen }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [openBookDropdown, setOpenBookDropdown] = useState(null)
  const [configOpen, setConfigOpen] = useState(false)
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false)

  // Dynamic data from registry
  const [booksRegistry, setBooksRegistry] = useState({ books: [], categories: [] })
  const [booksUnits, setBooksUnits] = useState({}) // Store units per book

  const darkMode = settings.darkMode
  const currentFont = ARABIC_FONTS.find(f => f.id === settings.arabicLearningFont) || ARABIC_FONTS[0]

  // Get current book from URL
  const currentBookId = location.pathname.split('/arabic/')[1]?.split('?')[0] || null

  // Load books registry on mount
  useEffect(() => {
    fetch('/arabic/books.json')
      .then(res => res.json())
      .then(data => {
        setBooksRegistry(data)
        // Load units for each available book
        data.books
          .filter(b => b.available && b.dataFolder)
          .forEach(book => {
            // Load all units for this book
            const unitCount = book.unitCount || 16
            const unitPromises = []
            for (let i = 1; i <= unitCount; i++) {
              const unitNum = i.toString().padStart(2, '0')
              unitPromises.push(
                fetch(`${book.dataFolder}/unit-${unitNum}.json`)
                  .then(res => res.json())
                  .then(data => ({
                    id: data.id,
                    titleAr: data.titleAr,
                    titleFr: data.titleFr,
                    itemCount: data.items?.length || 0
                  }))
                  .catch(() => null)
              )
            }
            Promise.all(unitPromises).then(units => {
              setBooksUnits(prev => ({
                ...prev,
                [book.id]: units.filter(u => u !== null)
              }))
            })
          })
      })
      .catch(err => console.error('Error loading books registry:', err))
  }, [])

  const toggleBookDropdown = (bookId) => {
    setOpenBookDropdown(openBookDropdown === bookId ? null : bookId)
  }

  const getUnitsForBook = (bookId) => {
    return booksUnits[bookId] || []
  }

  const closeAllDropdowns = () => {
    setFontDropdownOpen(false)
    setOpenBookDropdown(null)
  }

  const handleBookClick = (book) => {
    if (!book.available) return

    const units = booksUnits[book.id] || []
    const allValidated = settings.arabicValidated || {}
    const bookValidated = allValidated[book.id] || {}

    // Find last validated position for this book
    let lastSection = 1
    let lastItemIdx = 0

    if (units.length > 0 && Object.keys(bookValidated).length > 0) {
      const validatedList = Object.keys(bookValidated)
        .map(key => {
          const [sectionId, itemIdx] = key.split('-').map(Number)
          return { sectionId, itemIdx }
        })
        .sort((a, b) => a.sectionId - b.sectionId || a.itemIdx - b.itemIdx)

      if (validatedList.length > 0) {
        const last = validatedList[validatedList.length - 1]
        lastSection = last.sectionId
        lastItemIdx = last.itemIdx

        // Go to next item
        const unit = units.find(u => u.id === lastSection)
        if (unit) {
          if (lastItemIdx < (unit.itemCount || 1) - 1) {
            lastItemIdx += 1
          } else {
            const nextUnit = units.find(u => u.id > lastSection)
            if (nextUnit) {
              lastSection = nextUnit.id
              lastItemIdx = 0
            }
          }
        }
      }
    }

    navigate(`/arabic/${book.id}?section=${lastSection}&item=${lastItemIdx + 1}`)
  }

  // Group books by category
  const booksByCategory = booksRegistry.categories?.map(category => ({
    ...category,
    books: booksRegistry.books?.filter(b => b.category === category.id).sort((a, b) => a.order - b.order) || []
  })).filter(cat => cat.books.length > 0) || []

  return (
    <SidebarWrapper isOpen={isOpen} darkMode={darkMode} isMobile={isMobile}>
      <SidebarHeader
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        darkMode={darkMode}
        title="MyArabic"
        icon="ع"
        gradientFrom="from-red-500"
        gradientTo="to-red-700"
        isMobile={isMobile}
        onClose={() => setMobileMenuOpen && setMobileMenuOpen(false)}
      />

      <SidebarNav items={navItems} isOpen={isOpen} darkMode={darkMode} accentColor="red" />

      {/* Books Section - Dynamic from registry */}
      {isOpen && (
        <div className={`flex-1 px-3 py-4 space-y-4 border-t mt-2 overflow-y-auto overflow-x-hidden ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>

          {booksByCategory.map((category) => (
            <div key={category.id}>
              <div className={`text-xs font-semibold uppercase tracking-wider px-3 mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {category.label}
              </div>

              <div className="space-y-2">
                {category.books.map((book) => {
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
                            {book.shortName}
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
                                const url = `/arabic/${book.id}?section=${unit.id}&item=1`
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
                              <span className="text-sm truncate text-left">
                                {unit.titleFr}
                                <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}> ({unit.titleAr})</span>
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

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
