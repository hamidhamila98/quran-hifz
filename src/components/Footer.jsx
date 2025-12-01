import { Moon, Sun } from 'lucide-react'

export default function Footer({ darkMode, toggleDarkMode }) {
  return (
    <footer className={`
      fixed bottom-0 left-0 w-screen z-40
      ${darkMode
        ? 'bg-slate-800 border-t border-slate-700/50'
        : 'bg-white border-t border-gray-200'
      }
    `}>
      <div className="flex items-center justify-center py-2.5 relative">
        {/* App branding - centered */}
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>MyIslam</span>
          {' '}By{' '}
          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>AbuZayd93</span>
        </p>

        {/* Dark mode toggle - absolute right */}
        <button
          onClick={toggleDarkMode}
          className={`absolute right-4 p-2 rounded-lg transition-all ${
            darkMode
              ? 'bg-slate-700 hover:bg-slate-600 text-amber-400'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
          title={darkMode ? 'Mode clair' : 'Mode sombre'}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </footer>
  )
}
