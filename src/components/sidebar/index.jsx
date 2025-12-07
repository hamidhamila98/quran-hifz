import { NavLink } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Moon,
  Sun,
  Settings
} from 'lucide-react'

// ===========================================
// SIDEBAR WRAPPER - Container principal
// ===========================================
export function SidebarWrapper({ isOpen, darkMode, children }) {
  return (
    <aside
      className={`fixed left-0 top-0 h-[calc(100vh-41px)] transition-all duration-300 z-40 flex flex-col ${
        isOpen ? 'w-64' : 'w-16'
      } ${darkMode ? 'bg-slate-800 border-r border-slate-700' : 'bg-white border-r border-gray-200'}`}
    >
      {children}
    </aside>
  )
}

// ===========================================
// SIDEBAR HEADER - En-tête avec logo et toggle
// ===========================================
export function SidebarHeader({ isOpen, setIsOpen, darkMode, title, icon, gradientFrom, gradientTo }) {
  return (
    <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
      {isOpen && (
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-lg flex items-center justify-center`}>
            <span className="text-white font-bold text-sm">{icon}</span>
          </div>
          <h1 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{title}</h1>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} ${!isOpen && 'mx-auto'}`}
      >
        {isOpen ? (
          <ChevronLeft className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
        ) : (
          <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
        )}
      </button>
    </div>
  )
}

// ===========================================
// SIDEBAR NAV - Navigation principale
// ===========================================
export function SidebarNav({ items, isOpen, darkMode, accentColor = 'primary' }) {
  const colorClasses = {
    primary: {
      active: darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
      inactive: darkMode ? 'text-gray-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50'
    },
    blue: {
      active: darkMode ? 'bg-sky-900/30 text-sky-400' : 'bg-sky-50 text-sky-600',
      inactive: darkMode ? 'text-gray-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50'
    },
    red: {
      active: darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600',
      inactive: darkMode ? 'text-gray-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50'
    },
    amber: {
      active: darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600',
      inactive: darkMode ? 'text-gray-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50'
    },
    rose: {
      active: darkMode ? 'bg-rose-900/30 text-rose-400' : 'bg-rose-50 text-rose-600',
      inactive: darkMode ? 'text-gray-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50'
    },
    indigo: {
      active: darkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600',
      inactive: darkMode ? 'text-gray-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50'
    },
    cyan: {
      active: darkMode ? 'bg-cyan-900/30 text-cyan-400' : 'bg-cyan-50 text-cyan-600',
      inactive: darkMode ? 'text-gray-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50'
    }
  }

  const colors = colorClasses[accentColor] || colorClasses.primary

  return (
    <nav className="p-3 space-y-1">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
              isActive ? colors.active : colors.inactive
            } ${!isOpen && 'justify-center'}`
          }
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="font-medium">{item.label}</span>}
        </NavLink>
      ))}
    </nav>
  )
}

// ===========================================
// SIDEBAR SECTION - Section avec titre
// ===========================================
export function SidebarSection({ title, isOpen, darkMode, children, className = '' }) {
  return (
    <div className={`${className}`}>
      {isOpen && title && (
        <div className={`px-3 py-2 border-t ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          <div className={`text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {title}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

// ===========================================
// SIDEBAR DROPDOWN - Menu déroulant
// ===========================================
export function SidebarDropdown({
  label,
  value,
  icon: Icon,
  isOpen: dropdownOpen,
  setIsOpen: setDropdownOpen,
  options,
  onSelect,
  currentValue,
  darkMode,
  accentColor = 'primary',
  renderOption
}) {
  const iconColorClass = {
    primary: 'text-emerald-500',
    blue: 'text-sky-500',
    red: 'text-red-500',
    amber: 'text-amber-500',
    rose: 'text-rose-500',
    indigo: 'text-indigo-500',
    cyan: 'text-cyan-500'
  }[accentColor] || 'text-emerald-500'

  const activeColorClass = {
    primary: darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
    blue: darkMode ? 'bg-sky-900/30 text-sky-400' : 'bg-sky-50 text-sky-600',
    red: darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600',
    amber: darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600',
    rose: darkMode ? 'bg-rose-900/30 text-rose-400' : 'bg-rose-50 text-rose-600',
    indigo: darkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600',
    cyan: darkMode ? 'bg-cyan-900/30 text-cyan-400' : 'bg-cyan-50 text-cyan-600'
  }[accentColor] || (darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600')

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
          darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${iconColorClass}`} />}
          <span className={`text-sm font-medium overflow-hidden whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} style={{ textOverflow: 'clip' }}>
            {label ? `${label}: ${value}` : value}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      {dropdownOpen && (
        <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg border overflow-hidden z-50 max-h-48 overflow-y-auto ${
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
        }`}>
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                onSelect(option.id)
                setDropdownOpen(false)
              }}
              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                currentValue === option.id
                  ? activeColorClass
                  : darkMode ? 'text-gray-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {renderOption ? renderOption(option) : option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ===========================================
// SIDEBAR TOGGLE - Toggle switch
// ===========================================
export function SidebarToggle({ label, icon: Icon, value, onChange, darkMode, accentColor = 'primary' }) {
  const iconColorClass = {
    primary: 'text-emerald-500',
    blue: 'text-sky-500',
    red: 'text-red-500',
    amber: 'text-amber-500',
    rose: 'text-rose-500',
    indigo: 'text-indigo-500',
    cyan: 'text-cyan-500'
  }[accentColor] || 'text-emerald-500'

  const activeColorClass = {
    primary: 'bg-emerald-500',
    blue: 'bg-sky-500',
    red: 'bg-red-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    indigo: 'bg-indigo-500',
    cyan: 'bg-cyan-500'
  }[accentColor] || 'bg-emerald-500'

  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`w-4 h-4 ${value ? iconColorClass : 'text-gray-500'}`} />}
        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          value ? activeColorClass : darkMode ? 'bg-slate-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${
            value ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  )
}

// ===========================================
// SIDEBAR SIZE SELECTOR - Sélecteur de taille
// ===========================================
export function SidebarSizeSelector({ label, value, onChange, darkMode, accentColor = 'primary' }) {
  const activeColorClass = {
    primary: 'bg-emerald-500 text-white',
    blue: 'bg-sky-500 text-white',
    red: 'bg-red-500 text-white',
    amber: 'bg-amber-500 text-white',
    rose: 'bg-rose-500 text-white',
    indigo: 'bg-indigo-500 text-white',
    cyan: 'bg-cyan-500 text-white'
  }[accentColor] || 'bg-emerald-500 text-white'

  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
      <div className="flex gap-1 items-end">
        {['small', 'medium', 'large'].map((size) => (
          <button
            key={size}
            onClick={() => onChange(size)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
              value === size
                ? activeColorClass
                : darkMode ? 'bg-slate-600 text-gray-300 hover:bg-slate-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            title={size === 'small' ? 'Petit' : size === 'medium' ? 'Moyen' : 'Grand'}
          >
            <span className={size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base'} style={{ fontWeight: 'bold' }}>A</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ===========================================
// SIDEBAR LINE HEIGHT SELECTOR - Sélecteur d'interligne
// ===========================================
export function SidebarLineHeightSelector({ label, value, onChange, darkMode, accentColor = 'primary' }) {
  const activeColorClass = {
    primary: 'bg-emerald-500 text-white',
    blue: 'bg-sky-500 text-white',
    red: 'bg-red-500 text-white',
    amber: 'bg-amber-500 text-white',
    rose: 'bg-rose-500 text-white',
    indigo: 'bg-indigo-500 text-white',
    cyan: 'bg-cyan-500 text-white'
  }[accentColor] || 'bg-emerald-500 text-white'

  const options = [
    { id: 'compact', label: 'Serré', icon: '≡' },
    { id: 'normal', label: 'Normal', icon: '☰' },
    { id: 'relaxed', label: 'Aéré', icon: '⋮' }
  ]

  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
      <div className="flex gap-1">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
              value === option.id
                ? activeColorClass
                : darkMode ? 'bg-slate-600 text-gray-300 hover:bg-slate-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            title={option.label}
          >
            <span className="text-sm font-bold">{option.icon}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ===========================================
// SIDEBAR CONFIG - Section Configuration
// ===========================================
export function SidebarConfig({ isOpen: configOpen, setIsOpen: setConfigOpen, darkMode, accentColor = 'primary', children }) {
  const activeColorClass = {
    primary: darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
    blue: darkMode ? 'bg-sky-900/30 text-sky-400' : 'bg-sky-50 text-sky-600',
    red: darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600',
    amber: darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600',
    rose: darkMode ? 'bg-rose-900/30 text-rose-400' : 'bg-rose-50 text-rose-600',
    indigo: darkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600',
    cyan: darkMode ? 'bg-cyan-900/30 text-cyan-400' : 'bg-cyan-50 text-cyan-600'
  }[accentColor] || (darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600')

  const iconColorClass = {
    primary: 'text-emerald-500',
    blue: 'text-sky-500',
    red: 'text-red-500',
    amber: 'text-amber-500',
    rose: 'text-rose-500',
    indigo: 'text-indigo-500',
    cyan: 'text-cyan-500'
  }[accentColor] || 'text-emerald-500'

  return (
    <div>
      <button
        onClick={() => setConfigOpen(!configOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
          configOpen
            ? activeColorClass
            : darkMode ? 'bg-slate-700/50 hover:bg-slate-700 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <Settings className={`w-4 h-4 ${configOpen ? iconColorClass : 'text-gray-500'}`} />
          <span className="text-sm font-medium">Configuration</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${configOpen ? 'rotate-180' : ''}`} />
      </button>
      {configOpen && (
        <div className={`space-y-3 mt-2 pl-2 border-l-2 ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
          {children}
        </div>
      )}
    </div>
  )
}

// ===========================================
// SIDEBAR DARK MODE TOGGLE - Toggle mode sombre
// ===========================================
export function SidebarDarkModeToggle({ darkMode, onChange, accentColor = 'primary' }) {
  return (
    <SidebarToggle
      label="Mode sombre"
      icon={darkMode ? Moon : Sun}
      value={darkMode}
      onChange={onChange}
      darkMode={darkMode}
      accentColor={accentColor}
    />
  )
}

// ===========================================
// SIDEBAR FOOTER - Pied de page
// ===========================================
export function SidebarFooter({ isOpen, darkMode, arabicText, frenchText, accentColor = 'primary' }) {
  const gradientClassesMap = {
    primary: darkMode
      ? 'bg-gradient-to-br from-emerald-900/40 via-teal-900/30 to-emerald-900/20 border-emerald-700/30'
      : 'bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border-emerald-200/50',
    blue: darkMode
      ? 'bg-gradient-to-br from-sky-900/40 via-cyan-900/30 to-sky-900/20 border-sky-700/30'
      : 'bg-gradient-to-br from-sky-500/10 via-cyan-500/10 to-sky-500/5 border-sky-200/50',
    red: darkMode
      ? 'bg-gradient-to-br from-red-900/40 via-rose-900/30 to-red-900/20 border-red-700/30'
      : 'bg-gradient-to-br from-red-500/10 via-rose-500/10 to-red-500/5 border-red-200/50',
    amber: darkMode
      ? 'bg-gradient-to-br from-amber-900/40 via-orange-900/30 to-amber-900/20 border-amber-700/30'
      : 'bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-500/5 border-amber-200/50',
    rose: darkMode
      ? 'bg-gradient-to-br from-rose-900/40 via-pink-900/30 to-rose-900/20 border-rose-700/30'
      : 'bg-gradient-to-br from-rose-500/10 via-pink-500/10 to-rose-500/5 border-rose-200/50',
    indigo: darkMode
      ? 'bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-indigo-900/20 border-indigo-700/30'
      : 'bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-indigo-500/5 border-indigo-200/50',
    cyan: darkMode
      ? 'bg-gradient-to-br from-cyan-900/40 via-teal-900/30 to-cyan-900/20 border-cyan-700/30'
      : 'bg-gradient-to-br from-cyan-500/10 via-teal-500/10 to-cyan-500/5 border-cyan-200/50',
    emerald: darkMode
      ? 'bg-gradient-to-br from-emerald-900/40 via-teal-900/30 to-emerald-900/20 border-emerald-700/30'
      : 'bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border-emerald-200/50'
  }
  const gradientClasses = gradientClassesMap[accentColor] || gradientClassesMap.primary

  const textColorClassesMap = {
    primary: darkMode ? 'text-emerald-300' : 'text-emerald-700',
    blue: darkMode ? 'text-sky-300' : 'text-sky-700',
    red: darkMode ? 'text-red-300' : 'text-red-700',
    amber: darkMode ? 'text-amber-300' : 'text-amber-700',
    rose: darkMode ? 'text-rose-300' : 'text-rose-700',
    indigo: darkMode ? 'text-indigo-300' : 'text-indigo-700',
    cyan: darkMode ? 'text-cyan-300' : 'text-cyan-700',
    emerald: darkMode ? 'text-emerald-300' : 'text-emerald-700'
  }
  const textColorClasses = textColorClassesMap[accentColor] || textColorClassesMap.primary

  const lineColorClassesMap = {
    primary: darkMode ? 'via-emerald-600' : 'via-emerald-300',
    blue: darkMode ? 'via-sky-600' : 'via-sky-300',
    red: darkMode ? 'via-red-600' : 'via-red-300',
    amber: darkMode ? 'via-amber-600' : 'via-amber-300',
    rose: darkMode ? 'via-rose-600' : 'via-rose-300',
    indigo: darkMode ? 'via-indigo-600' : 'via-indigo-300',
    cyan: darkMode ? 'via-cyan-600' : 'via-cyan-300',
    emerald: darkMode ? 'via-emerald-600' : 'via-emerald-300'
  }
  const lineColorClasses = lineColorClassesMap[accentColor] || lineColorClassesMap.primary

  const subTextColorClassesMap = {
    primary: darkMode ? 'text-emerald-400' : 'text-emerald-600',
    blue: darkMode ? 'text-sky-400' : 'text-sky-600',
    red: darkMode ? 'text-red-400' : 'text-red-600',
    amber: darkMode ? 'text-amber-400' : 'text-amber-600',
    rose: darkMode ? 'text-rose-400' : 'text-rose-600',
    indigo: darkMode ? 'text-indigo-400' : 'text-indigo-600',
    cyan: darkMode ? 'text-cyan-400' : 'text-cyan-600',
    emerald: darkMode ? 'text-emerald-400' : 'text-emerald-600'
  }
  const subTextColorClasses = subTextColorClassesMap[accentColor] || subTextColorClassesMap.primary

  return (
    <div className="p-3 mb-2">
      <div className={`rounded-2xl p-4 border ${!isOpen ? 'p-2' : ''} ${gradientClasses}`}>
        {isOpen ? (
          <>
            <p className={`text-center font-semibold ${textColorClasses}`}
               style={{ fontFamily: "'Amiri', serif", fontSize: '1.1rem', lineHeight: '2' }} dir="rtl">
              {arabicText}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-transparent ${lineColorClasses}`} />
              <p className={`text-xs font-medium px-2 ${subTextColorClasses}`}>
                {frenchText}
              </p>
              <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-transparent ${lineColorClasses}`} />
            </div>
          </>
        ) : (
          <p className={`text-center text-lg ${subTextColorClasses}`}>{arabicText.charAt(0)}</p>
        )}
      </div>
    </div>
  )
}
