import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import {
  Home,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  BookOpen,
  Languages,
  Library
} from 'lucide-react'

const navItems = [
  { path: '/library', icon: Library, label: 'Bibliothèque' },
  { path: '/quran', icon: BookOpen, label: 'Quran Hifz' },
  { path: '/arabic', icon: Languages, label: 'Arabe' },
  { path: '/hadith', icon: BookMarked, label: 'Hadiths' },
]

export default function LibrarySidebar({ isOpen, setIsOpen, settings, updateSettings }) {
  const darkMode = settings.darkMode

  return (
    <aside
      className={`fixed top-0 left-0 h-full ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-r transition-all duration-300 z-50 flex flex-col ${isOpen ? 'w-64' : 'w-16'}`}
    >
      {/* Header */}
      <div className={`p-4 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'} flex items-center justify-between`}>
        {isOpen && (
          <h1 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Bibliothèque
          </h1>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? darkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                  : darkMode ? 'text-gray-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <item.icon size={20} />
            {isOpen && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

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
