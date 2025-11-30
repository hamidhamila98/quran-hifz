import {
  Home,
  NotebookPen,
  ListMusic,
  Moon,
  Sun
} from 'lucide-react'
import {
  SidebarWrapper,
  SidebarHeader,
  SidebarNav,
  SidebarToggle,
  SidebarFooter
} from '../../../components/sidebar'

const navItems = [
  { path: '/', icon: Home, label: 'MyIslam' },
]

export default function DourousSidebar({ isOpen, setIsOpen, settings, updateSettings }) {
  const darkMode = settings.darkMode

  return (
    <SidebarWrapper isOpen={isOpen} darkMode={darkMode}>
      <SidebarHeader
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        darkMode={darkMode}
        title="MyDourous"
        icon="د"
        gradientFrom="from-cyan-500"
        gradientTo="to-cyan-700"
      />

      <SidebarNav items={navItems} isOpen={isOpen} darkMode={darkMode} accentColor="cyan" />

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto">
        {isOpen && (
          <div className={`px-3 py-2 border-t ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
            <div className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Contenu
            </div>
          </div>
        )}

        <nav className="p-2 space-y-1">
          {/* Notes */}
          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              darkMode
                ? 'text-gray-300 hover:bg-slate-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <NotebookPen size={18} />
            {isOpen && (
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Mes Notes</div>
                <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Bientôt disponible</div>
              </div>
            )}
          </button>

          {/* Playlists */}
          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              darkMode
                ? 'text-gray-300 hover:bg-slate-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ListMusic size={18} />
            {isOpen && (
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Playlists</div>
                <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Bientôt disponible</div>
              </div>
            )}
          </button>
        </nav>
      </div>

      {/* Configuration - Dark mode only */}
      {isOpen && (
        <div className={`px-3 py-3 border-t ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          <SidebarToggle
            label="Mode sombre"
            icon={darkMode ? Moon : Sun}
            value={darkMode}
            onChange={() => updateSettings({ darkMode: !darkMode })}
            darkMode={darkMode}
            accentColor="cyan"
          />
        </div>
      )}

      {/* Collapsed Icons */}
      {!isOpen && (
        <div className={`flex-1 px-2 py-4 space-y-2 border-t mt-2 ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          <button
            onClick={() => updateSettings({ darkMode: !darkMode })}
            className={`w-full p-3 rounded-xl transition-colors ${
              darkMode
                ? 'bg-cyan-900/30 text-cyan-400'
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
        arabicText="دُرُوسِي"
        frenchText="Mes cours"
        accentColor="cyan"
      />
    </SidebarWrapper>
  )
}
