import { useState } from 'react'
import {
  Home,
  BookMarked,
  Database,
  Cloud,
  Type,
  Link2,
  Moon,
  Sun
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
import { HADITH_BOOKS } from '../services/hadithService'

const navItems = [
  { path: '/', icon: Home, label: 'MyIslam' },
]

const FONT_OPTIONS = [
  { id: 'amiri', name: 'Amiri' },
  { id: 'scheherazade', name: 'Scheherazade New' },
  { id: 'noto-naskh', name: 'Noto Naskh Arabic' },
  { id: 'kitab', name: 'Kitab' },
]

export default function HadithSidebar({ isOpen, setIsOpen, settings, updateSettings }) {
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)

  const darkMode = settings.darkMode
  const selectedBook = settings.hadithBook
  const isDorar = settings.hadithSource === 'dorar'
  const currentFont = FONT_OPTIONS.find(f => f.id === settings.hadithFont) || FONT_OPTIONS[0]

  const handleBookSelect = (bookId) => {
    updateSettings({ hadithBook: bookId })
  }

  const closeAllDropdowns = () => {
    setFontDropdownOpen(false)
  }

  return (
    <SidebarWrapper isOpen={isOpen} darkMode={darkMode}>
      <SidebarHeader
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        darkMode={darkMode}
        title="MyHadith"
        icon="ح"
        gradientFrom="from-rose-500"
        gradientTo="to-rose-700"
      />

      <SidebarNav items={navItems} isOpen={isOpen} darkMode={darkMode} accentColor="rose" />

      {/* Data Source Toggle */}
      {isOpen && (
        <div className={`px-3 py-3 border-t ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          <div className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Source des données
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => updateSettings({ hadithSource: 'local' })}
              className={`flex items-center gap-1.5 flex-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                !isDorar
                  ? darkMode ? 'bg-rose-900/50 text-rose-300' : 'bg-rose-100 text-rose-700'
                  : darkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <Database size={14} />
              <span>Local</span>
            </button>
            <button
              onClick={() => updateSettings({ hadithSource: 'dorar' })}
              className={`flex items-center gap-1.5 flex-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                isDorar
                  ? darkMode ? 'bg-rose-900/50 text-rose-300' : 'bg-rose-100 text-rose-700'
                  : darkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <Cloud size={14} />
              <span>Dorar</span>
            </button>
          </div>
        </div>
      )}

      {/* Books List */}
      <div className="flex-1 overflow-y-auto">
        {isOpen && !isDorar && (
          <div className={`px-3 py-2 border-t ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
            <div className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Les 6 Recueils
            </div>
          </div>
        )}

        <nav className="p-2 space-y-1">
          {/* Hadith Books (Local mode only) */}
          {!isDorar && HADITH_BOOKS.map((book) => {
            const isSelected = selectedBook === book.id
            const colorClasses = {
              emerald: isSelected
                ? (darkMode ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700' : 'bg-emerald-100 text-emerald-700 border-emerald-300')
                : '',
              blue: isSelected
                ? (darkMode ? 'bg-blue-900/50 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-700 border-blue-300')
                : '',
              purple: isSelected
                ? (darkMode ? 'bg-purple-900/50 text-purple-300 border-purple-700' : 'bg-purple-100 text-purple-700 border-purple-300')
                : '',
              amber: isSelected
                ? (darkMode ? 'bg-amber-900/50 text-amber-300 border-amber-700' : 'bg-amber-100 text-amber-700 border-amber-300')
                : '',
              rose: isSelected
                ? (darkMode ? 'bg-rose-900/50 text-rose-300 border-rose-700' : 'bg-rose-100 text-rose-700 border-rose-300')
                : '',
              indigo: isSelected
                ? (darkMode ? 'bg-indigo-900/50 text-indigo-300 border-indigo-700' : 'bg-indigo-100 text-indigo-700 border-indigo-300')
                : '',
            }

            return (
              <button
                key={book.id}
                onClick={() => handleBookSelect(book.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors border ${
                  isSelected
                    ? colorClasses[book.color]
                    : darkMode
                      ? 'border-transparent text-gray-300 hover:bg-slate-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BookMarked size={18} />
                {isOpen && (
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{book.nameFr}</div>
                    <div className={`font-arabic text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{book.nameAr}</div>
                  </div>
                )}
              </button>
            )
          })}

          {/* Dorar mode info */}
          {isDorar && isOpen && (
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
              <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Mode recherche Dorar
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Recherchez dans tous les livres avec grades
              </p>
            </div>
          )}
        </nav>
      </div>

      {/* Configuration Section */}
      {isOpen && (
        <div className={`px-3 py-3 border-t ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          <SidebarConfig
            isOpen={configOpen}
            setIsOpen={setConfigOpen}
            darkMode={darkMode}
            accentColor="rose"
          >
            {/* Font Dropdown */}
            <SidebarDropdown
              label="Police"
              value={currentFont.name}
              icon={Type}
              isOpen={fontDropdownOpen}
              setIsOpen={(open) => { closeAllDropdowns(); setFontDropdownOpen(open) }}
              options={FONT_OPTIONS}
              onSelect={(id) => updateSettings({ hadithFont: id })}
              currentValue={settings.hadithFont || 'amiri'}
              darkMode={darkMode}
              accentColor="rose"
            />

            {/* Font Size */}
            <SidebarSizeSelector
              label="Taille"
              value={settings.hadithFontSize || 'medium'}
              onChange={(size) => updateSettings({ hadithFontSize: size })}
              darkMode={darkMode}
              accentColor="rose"
            />

            {/* Isnad Toggle */}
            <SidebarToggle
              label="Isnad (chaîne)"
              icon={Link2}
              value={settings.hadithShowIsnad}
              onChange={() => updateSettings({ hadithShowIsnad: !settings.hadithShowIsnad })}
              darkMode={darkMode}
              accentColor="rose"
            />

            {/* Dark Mode Toggle */}
            <SidebarToggle
              label="Mode sombre"
              icon={darkMode ? Moon : Sun}
              value={darkMode}
              onChange={() => updateSettings({ darkMode: !darkMode })}
              darkMode={darkMode}
              accentColor="rose"
            />
          </SidebarConfig>
        </div>
      )}

      {/* Collapsed Icons */}
      {!isOpen && (
        <div className={`flex-1 px-2 py-4 space-y-2 border-t mt-2 ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          <button
            onClick={() => updateSettings({ darkMode: !darkMode })}
            className={`w-full p-3 rounded-xl transition-colors ${
              darkMode
                ? 'bg-rose-900/30 text-rose-400'
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
        arabicText="الْحَدِيثُ النَّبَوِيُّ"
        frenchText="Le hadith prophétique"
        accentColor="rose"
      />
    </SidebarWrapper>
  )
}
