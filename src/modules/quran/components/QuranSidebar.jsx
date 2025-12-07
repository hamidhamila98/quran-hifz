import { useState } from 'react'
import {
  Home,
  Brain,
  BookOpen,
  Volume2,
  Palette,
  Type,
  Hash,
  Eye,
  BookText
} from 'lucide-react'
import {
  SidebarWrapper,
  SidebarHeader,
  SidebarNav,
  SidebarDropdown,
  SidebarToggle,
  SidebarSizeSelector,
  SidebarLineHeightSelector,
  SidebarConfig,
  SidebarFooter
} from '../../../components/sidebar'

const navItems = [
  { path: '/', icon: Home, label: 'MyIslam' },
  { path: '/quran', icon: BookOpen, label: 'Ma Progression' },
  { path: '/quran/training', icon: Brain, label: 'Entraînement' },
]

const ARABIC_FONTS = [
  { id: 'hafs-smart', name: 'Hafs Smart (Mushaf)' },
  // { id: 'uthmanic-hafs', name: 'Uthmanic Hafs v18' },
  { id: 'hafs-uthmanic-v14', name: 'Hafs Uthmanic v14' },
  // { id: 'kfgqpc-uthmanic', name: 'KFGQPC Uthmanic' },
  // { id: 'al-mushaf', name: 'Al Mushaf' },
  { id: 'al-qalam-quran-majeed', name: 'Al Qalam Quran Majeed' },
  // { id: 'al-qalam-quran', name: 'Al Qalam Quran' },
  { id: 'me-quran', name: 'Me Quran' },
  // { id: 'amiri-quran-colored', name: 'Amiri Quran Colored' },
  // { id: 'amiri-quran', name: 'Amiri Quran' },
  { id: 'scheherazade', name: 'Scheherazade New' },
  // { id: 'droid-naskh', name: 'Droid Naskh' },
  { id: 'noto-naskh', name: 'Noto Naskh Arabic' },
  // { id: 'lateef', name: 'Lateef' },
  // { id: 'hafs-nastaleeq', name: 'Hafs Nastaleeq' },
]

const RECITERS = [
  { id: 'ar.alafasy', name: 'Mishary Al-Afasy', style: null, hasWordTiming: true },
  { id: 'ar.abdulbasitmujawwad', name: 'Abdul Basit', style: 'Mujawwad', hasWordTiming: true },
  { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit', style: 'Murattal', hasWordTiming: true },
  { id: 'ar.sudais', name: 'Abdurrahmaan As-Sudais', style: null, hasWordTiming: true },
  { id: 'ar.shaatree', name: 'Abu Bakr Ash-Shaatree', style: null, hasWordTiming: true },
  { id: 'ar.hanirifai', name: 'Hani Ar-Rifai', style: null, hasWordTiming: true },
  { id: 'ar.husary', name: 'Al-Husary', style: 'Murattal', hasWordTiming: true },
  { id: 'ar.husarymuallim', name: 'Al-Husary', style: 'Muallim', hasWordTiming: true },
  { id: 'ar.minshawimujawwad', name: 'Al-Minshawi', style: 'Mujawwad', hasWordTiming: true },
  { id: 'ar.minshawimurttal', name: 'Al-Minshawi', style: 'Murattal', hasWordTiming: true },
  { id: 'ar.tablaway', name: 'Mohammad Al-Tablaway', style: null, hasWordTiming: true },
  { id: 'ar.shuraym', name: 'Saood Ash-Shuraym', style: null, hasWordTiming: true },
  { id: 'ar.dosarywarsh', name: 'Ibrahim Al-Dosary', style: 'Warsh', hasWordTiming: false },
]

const PORTION_SIZES = [
  { id: '1/4', name: '¼ page/j', description: '4, 4, 4, 3 lignes' },
  { id: '1/3', name: '⅓ page/j', description: '5, 5, 5 lignes' },
  { id: '1/2', name: '½ page/j', description: '8, 7 lignes' },
  { id: '1', name: '1 page/j', description: '15 lignes' },
  { id: '2', name: '2 pages/j', description: '30 lignes' },
]

const TAFSIR_SOURCES = [
  { id: 'ibn-kathir', name: 'Ibn Kathir', lang: 'AR/EN' },
  { id: 'tabari', name: 'Tabari', lang: 'AR' },
  { id: 'qurtubi', name: 'Qurtubi', lang: 'AR' },
]

export default function QuranSidebar({ isOpen, setIsOpen, settings, updateSettings, isMobile, setMobileMenuOpen }) {
  const [reciterDropdownOpen, setReciterDropdownOpen] = useState(false)
  const [portionDropdownOpen, setPortionDropdownOpen] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false)
  const [tafsirDropdownOpen, setTafsirDropdownOpen] = useState(false)

  const darkMode = settings.darkMode
  const currentReciter = RECITERS.find(r => r.id === settings.reciter) || RECITERS[0]
  const currentPortion = PORTION_SIZES.find(p => p.id === settings.portionSize) || PORTION_SIZES[1]
  const currentFont = ARABIC_FONTS.find(f => f.id === settings.arabicFont) || ARABIC_FONTS[0]
  const currentTafsir = TAFSIR_SOURCES.find(t => t.id === settings.tafsirSource) || TAFSIR_SOURCES[0]

  const closeAllDropdowns = () => {
    setReciterDropdownOpen(false)
    setPortionDropdownOpen(false)
    setFontDropdownOpen(false)
    setTafsirDropdownOpen(false)
  }

  return (
    <SidebarWrapper isOpen={isOpen} darkMode={darkMode} isMobile={isMobile}>
      <SidebarHeader
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        darkMode={darkMode}
        title="MyHifz"
        icon=""
        gradientFrom="from-sky-500"
        gradientTo="to-sky-700"
        isMobile={isMobile}
        onClose={() => setMobileMenuOpen && setMobileMenuOpen(false)}
      />

      <SidebarNav items={navItems} isOpen={isOpen} darkMode={darkMode} accentColor="blue" />

      {/* Main Settings - Always visible */}
      {isOpen && (
        <div className={`flex-1 px-3 py-4 space-y-3 border-t mt-2 overflow-y-auto ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          {/* Portion Size - Always visible */}
          <SidebarDropdown
            value={currentPortion.name}
            icon={BookOpen}
            isOpen={portionDropdownOpen}
            setIsOpen={(open) => { closeAllDropdowns(); setPortionDropdownOpen(open) }}
            options={PORTION_SIZES}
            onSelect={(id) => updateSettings({ portionSize: id, currentPortionIndex: 0 })}
            currentValue={settings.portionSize}
            darkMode={darkMode}
            accentColor="blue"
            renderOption={(option) => (
              <>
                <span className="font-medium">{option.name}</span>
                <span className={`ml-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  ({option.description})
                </span>
              </>
            )}
          />

          {/* Reciter - Always visible */}
          <SidebarDropdown
            value={currentReciter.style ? `${currentReciter.name} (${currentReciter.style})` : currentReciter.name}
            icon={Volume2}
            isOpen={reciterDropdownOpen}
            setIsOpen={(open) => { closeAllDropdowns(); setReciterDropdownOpen(open) }}
            options={RECITERS}
            onSelect={(id) => updateSettings({ reciter: id })}
            currentValue={settings.reciter}
            darkMode={darkMode}
            accentColor="blue"
            renderOption={(option) => (
              <>
                {option.name}
                {option.style && <span className="text-xs text-gray-500 ml-1">({option.style})</span>}
              </>
            )}
          />

          {/* Tajweed Toggle - Always visible */}
          <SidebarToggle
            label="Tajweed (BETA)"
            icon={Palette}
            value={settings.tajweedEnabled}
            onChange={() => updateSettings({ tajweedEnabled: !settings.tajweedEnabled })}
            darkMode={darkMode}
            accentColor="blue"
          />

          {/* Configuration Section */}
          <SidebarConfig
            isOpen={configOpen}
            setIsOpen={setConfigOpen}
            darkMode={darkMode}
            accentColor="blue"
          >
            {/* Font Dropdown */}
            <SidebarDropdown
              value={currentFont.name}
              icon={Type}
              isOpen={fontDropdownOpen}
              setIsOpen={(open) => { closeAllDropdowns(); setFontDropdownOpen(open) }}
              options={ARABIC_FONTS}
              onSelect={(id) => updateSettings({ arabicFont: id })}
              currentValue={settings.arabicFont}
              darkMode={darkMode}
              accentColor="blue"
            />

            {/* Tafsir Source */}
            <SidebarDropdown
              label="Tafsir"
              value={currentTafsir.name}
              icon={BookText}
              isOpen={tafsirDropdownOpen}
              setIsOpen={(open) => { closeAllDropdowns(); setTafsirDropdownOpen(open) }}
              options={TAFSIR_SOURCES}
              onSelect={(id) => updateSettings({ tafsirSource: id })}
              currentValue={settings.tafsirSource || 'ibn-kathir'}
              darkMode={darkMode}
              accentColor="blue"
              renderOption={(option) => (
                <>
                  {option.name}
                  {option.lang && <span className="text-xs text-gray-500 ml-1">({option.lang})</span>}
                </>
              )}
            />

            {/* Arabic Numerals Toggle */}
            <SidebarToggle
              label="Chiffres arabes"
              icon={Hash}
              value={settings.arabicNumerals}
              onChange={() => updateSettings({ arabicNumerals: !settings.arabicNumerals })}
              darkMode={darkMode}
              accentColor="blue"
            />

            {/* Verse Highlight Toggle */}
            <SidebarToggle
              label="Suivi verset"
              icon={Eye}
              value={settings.verseHighlight !== false}
              onChange={() => updateSettings({ verseHighlight: settings.verseHighlight === false ? true : false })}
              darkMode={darkMode}
              accentColor="blue"
            />

            {/* Word Highlight Toggle */}
            <SidebarToggle
              label="Suivi mot"
              icon={Type}
              value={settings.wordHighlight !== false}
              onChange={() => updateSettings({ wordHighlight: settings.wordHighlight === false ? true : false })}
              darkMode={darkMode}
              accentColor="blue"
            />

            {/* Playback Speed */}
            <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Vitesse</span>
              <div className="flex gap-1">
                {[1, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => updateSettings({ playbackSpeed: speed })}
                    className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                      settings.playbackSpeed === speed
                        ? 'bg-sky-500 text-white'
                        : darkMode
                          ? 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size - Quran */}
            <SidebarSizeSelector
              label="Taille"
              value={settings.fontSize || 'medium'}
              onChange={(size) => updateSettings({ fontSize: size })}
              darkMode={darkMode}
              accentColor="blue"
            />

            {/* Line Height - Quran */}
            <SidebarLineHeightSelector
              label="Interligne"
              value={settings.lineHeight || 'normal'}
              onChange={(height) => updateSettings({ lineHeight: height })}
              darkMode={darkMode}
              accentColor="blue"
            />

            {/* Font Size - Tafsir */}
            <SidebarSizeSelector
              label="Tafsir/Trad"
              value={settings.tafsirFontSize || 'medium'}
              onChange={(size) => updateSettings({ tafsirFontSize: size })}
              darkMode={darkMode}
              accentColor="blue"
            />
          </SidebarConfig>
        </div>
      )}

      {isOpen && (
        <SidebarFooter
          isOpen={isOpen}
          darkMode={darkMode}
          arabicText="وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا"
          frenchText="Al-Muzzammil : 4"
          accentColor="blue"
        />
      )}
    </SidebarWrapper>
  )
}
