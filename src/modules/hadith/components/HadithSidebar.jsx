import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  BookMarked,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  BookOpen,
  Languages,
  Library,
  Database,
  Cloud,
  ChevronDown,
  Type,
  Link2,
  Settings
} from 'lucide-react'
import { HADITH_BOOKS } from '../services/hadithService'

const navItems = [
  { path: '/quran', icon: BookOpen, label: 'Quran Hifz' },
  { path: '/arabic', icon: Languages, label: 'Arabe' },
  { path: '/library', icon: Library, label: 'Bibliothèque' },
]

const FONT_OPTIONS = [
  { id: 'amiri', name: 'Amiri', nameAr: 'أميري' },
  { id: 'scheherazade', name: 'Scheherazade', nameAr: 'شهرزاد' },
  { id: 'noto-naskh', name: 'Noto Naskh', nameAr: 'نوتو نسخ' },
  { id: 'kitab', name: 'Kitab', nameAr: 'كتاب' },
]

const SIZE_OPTIONS = [
  { id: 'small', name: 'Petit' },
  { id: 'medium', name: 'Moyen' },
  { id: 'large', name: 'Grand' },
]

export default function HadithSidebar({ isOpen, setIsOpen, settings, updateSettings }) {
  const darkMode = settings.darkMode
  const selectedBook = settings.hadithBook
  const isDorar = settings.hadithSource === 'dorar'

  // Dropdown states
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false)
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)

  const currentFont = FONT_OPTIONS.find(f => f.id === settings.hadithFont) || FONT_OPTIONS[0]
  const currentSize = SIZE_OPTIONS.find(s => s.id === settings.hadithFontSize) || SIZE_OPTIONS[1]

  const handleBookSelect = (bookId) => {
    updateSettings({ hadithBook: bookId })
  }

  const closeAllDropdowns = () => {
    setFontDropdownOpen(false)
    setSizeDropdownOpen(false)
  }

  return (
    <aside
      className={`fixed top-0 left-0 h-full ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-r transition-all duration-300 z-50 flex flex-col ${isOpen ? 'w-64' : 'w-16'}`}
    >
      {/* Header */}
      <div className={`p-4 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'} flex items-center justify-between`}>
        {isOpen && (
          <div>
            <h1 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Kutub al-Sitta
            </h1>
            <p className={`text-xs font-arabic ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              الكتب الستة
            </p>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Data Source Toggle */}
      {isOpen && (
        <div className={`px-3 py-2 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
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
          <div className={`px-3 py-2 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            <div className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Les 6 Recueils Authentiques
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors border ${
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
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
              <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Mode recherche Dorar
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Recherchez dans tous les livres avec grades (صحيح، حسن، ضعيف)
              </p>
            </div>
          )}

          {/* Separator */}
          <div className={`my-3 border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'}`} />

          {/* Configuration Section */}
          {isOpen && (
            <div className="space-y-2">
              {/* Config Header */}
              <button
                onClick={() => { setConfigOpen(!configOpen); closeAllDropdowns() }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings size={18} />
                  <span className="text-sm font-medium">Configuration</span>
                </div>
                <ChevronDown size={16} className={`transition-transform ${configOpen ? 'rotate-180' : ''}`} />
              </button>

              {configOpen && (
                <div className="space-y-2 pl-2">
                  {/* Font Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => { setFontDropdownOpen(!fontDropdownOpen); setSizeDropdownOpen(false) }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Type size={16} className="text-rose-500" />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {currentFont.name}
                        </span>
                      </div>
                      <ChevronDown size={14} className={`transition-transform ${fontDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {fontDropdownOpen && (
                      <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg border overflow-hidden z-50 ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                      }`}>
                        {FONT_OPTIONS.map((font) => (
                          <button
                            key={font.id}
                            onClick={() => {
                              updateSettings({ hadithFont: font.id })
                              setFontDropdownOpen(false)
                            }}
                            className={`w-full px-3 py-2 text-left text-sm flex justify-between items-center ${
                              settings.hadithFont === font.id
                                ? darkMode ? 'bg-rose-900/30 text-rose-300' : 'bg-rose-50 text-rose-700'
                                : darkMode ? 'text-gray-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span>{font.name}</span>
                            <span className="font-arabic">{font.nameAr}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Size Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => { setSizeDropdownOpen(!sizeDropdownOpen); setFontDropdownOpen(false) }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Aa</span>
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Taille: {currentSize.name}
                        </span>
                      </div>
                      <ChevronDown size={14} className={`transition-transform ${sizeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {sizeDropdownOpen && (
                      <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg border overflow-hidden z-50 ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                      }`}>
                        {SIZE_OPTIONS.map((size) => (
                          <button
                            key={size.id}
                            onClick={() => {
                              updateSettings({ hadithFontSize: size.id })
                              setSizeDropdownOpen(false)
                            }}
                            className={`w-full px-3 py-2 text-left text-sm ${
                              settings.hadithFontSize === size.id
                                ? darkMode ? 'bg-rose-900/30 text-rose-300' : 'bg-rose-50 text-rose-700'
                                : darkMode ? 'text-gray-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {size.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Isnad Toggle */}
                  <button
                    onClick={() => updateSettings({ hadithShowIsnad: !settings.hadithShowIsnad })}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Link2 size={16} className={settings.hadithShowIsnad ? 'text-rose-500' : (darkMode ? 'text-gray-500' : 'text-gray-400')} />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Isnad (chaîne)
                      </span>
                    </div>
                    <div className={`w-9 h-5 rounded-full transition-colors relative ${
                      settings.hadithShowIsnad
                        ? 'bg-rose-500'
                        : darkMode ? 'bg-slate-600' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        settings.hadithShowIsnad ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </div>
                  </button>
                </div>
              )}

              {/* Separator */}
              <div className={`my-2 border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'}`} />

              {/* Other modules */}
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? darkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-900'
                        : darkMode ? 'text-gray-400 hover:bg-slate-700 hover:text-gray-300' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`
                  }
                >
                  <item.icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}

          {/* Collapsed state - just icons */}
          {!isOpen && (
            <>
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-center p-3 rounded-lg transition-colors ${
                      isActive
                        ? darkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-900'
                        : darkMode ? 'text-gray-400 hover:bg-slate-700' : 'text-gray-500 hover:bg-gray-100'
                    }`
                  }
                  title={item.label}
                >
                  <item.icon size={20} />
                </NavLink>
              ))}
            </>
          )}
        </nav>
      </div>

      {/* Dark Mode Toggle */}
      <div className={`p-4 border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <button
          onClick={() => updateSettings({ darkMode: !darkMode })}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          {isOpen && <span>{darkMode ? 'Mode clair' : 'Mode sombre'}</span>}
        </button>
      </div>
    </aside>
  )
}
