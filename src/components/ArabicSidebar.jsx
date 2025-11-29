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
  BookText
} from 'lucide-react'

const navItems = [
  { path: '/arabic', icon: BookText, label: "Apprentissage" },
  { path: '/', icon: BookOpen, label: 'Quran Hifz' },
]

export default function ArabicSidebar({ isOpen, setIsOpen, settings, updateSettings }) {
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false)
  const [arabicData, setArabicData] = useState(null)

  const darkMode = settings.darkMode
  const currentUnit = settings.arabicUnit || 1

  // Load Arabic data for unit names
  useEffect(() => {
    fetch('/arabic-data.json')
      .then(res => res.json())
      .then(data => setArabicData(data))
      .catch(err => console.error('Error loading arabic data:', err))
  }, [])

  const units = arabicData?.units || []
  const currentUnitData = units.find(u => u.id === currentUnit)

  return (
    <aside
      className={`fixed top-0 left-0 h-full transition-all duration-300 z-50 ${
        isOpen ? 'w-64' : 'w-16'
      } ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'} shadow-lg`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-700">
        {isOpen && (
          <h2 className="text-lg font-bold text-emerald-600">
            Arabe
          </h2>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 ${!isOpen && 'mx-auto'}`}
        >
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition-colors mb-1 ${
                isActive
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                  : 'hover:bg-gray-100 dark:hover:bg-slate-700'
              } ${!isOpen && 'justify-center'}`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Settings when open */}
      {isOpen && (
        <div className="p-4 space-y-4 border-t border-gray-200 dark:border-slate-700">
          {/* Unit selector */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Unité
            </label>
            <button
              onClick={() => setUnitDropdownOpen(!unitDropdownOpen)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border ${
                darkMode ? 'border-slate-600 bg-slate-700' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <span className="text-sm truncate">
                {currentUnitData ? `${currentUnitData.id}. ${currentUnitData.titleFr}` : `Unité ${currentUnit}`}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${unitDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {unitDropdownOpen && (
              <div className={`absolute z-10 w-full mt-1 rounded-lg shadow-lg border max-h-60 overflow-y-auto ${
                darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'
              }`}>
                {units.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => {
                      updateSettings({ arabicUnit: unit.id, arabicDialogue: 0 })
                      setUnitDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 dark:hover:bg-slate-600 ${
                      unit.id === currentUnit ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : ''
                    }`}
                  >
                    <div className="font-medium">{unit.id}. {unit.titleFr}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{unit.titleAr}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark mode toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Mode sombre</span>
            <button
              onClick={() => updateSettings({ darkMode: !darkMode })}
              className={`p-2 rounded-lg ${
                darkMode
                  ? 'bg-slate-600 text-yellow-400'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Progress */}
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Progression</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${(Object.keys(settings.arabicValidated || {}).length / 48) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {Object.keys(settings.arabicValidated || {}).length}/48
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed state icons */}
      {!isOpen && (
        <div className="p-2 space-y-2 border-t border-gray-200 dark:border-slate-700 mt-2">
          <button
            onClick={() => updateSettings({ darkMode: !darkMode })}
            className={`w-full p-3 rounded-lg flex justify-center ${
              darkMode ? 'bg-slate-600 text-yellow-400' : 'bg-gray-100 text-gray-600'
            }`}
            title="Mode sombre"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      )}
    </aside>
  )
}
