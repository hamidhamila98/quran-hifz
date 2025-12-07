import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Languages, FileText, User, LogOut, LogIn, UserPlus, BookMarked, Library, ScrollText } from 'lucide-react'
import { useUser } from '../contexts/UserContext'
import Footer from '../components/Footer'

const modules = [
  {
    id: 'quran',
    path: '/quran',
    icon: BookOpen,
    title: 'MyHifz',
    titleAr: 'حفظ القرآن',
    description: 'Memorisation du Coran avec audio synchronise',
    color: 'blue',
  },
  {
    id: 'arabic',
    path: '/arabic',
    icon: Languages,
    title: 'MyArabic',
    titleAr: 'تعلم العربية',
    description: 'Apprentissage de la langue arabe',
    color: 'red',
  },
  {
    id: 'notes',
    path: '/notes',
    icon: FileText,
    title: 'MyNotes',
    titleAr: 'ملاحظاتي',
    description: 'Organisez vos ressources islamiques',
    color: 'amber',
  },
  {
    id: 'douas',
    path: '/douas',
    icon: BookMarked,
    title: 'MyDouas',
    titleAr: 'حصن المسلم',
    description: 'La Citadelle du Musulman avec audio',
    color: 'emerald',
  },
  {
    id: 'library',
    path: '/library',
    icon: Library,
    title: 'MyLibrary',
    titleAr: 'مكتبتي',
    description: 'Votre bibliothèque islamique',
    color: 'purple',
    comingSoon: true,
  },
  {
    id: 'hadiths',
    path: '/hadiths',
    icon: ScrollText,
    title: 'MyHadiths',
    titleAr: 'الأحاديث',
    description: 'Collection de hadiths authentiques',
    color: 'teal',
    comingSoon: true,
  },
]

export default function LandingPage({ darkMode, toggleDarkMode, isMobile }) {
  const { user, isLoggedIn, login, register, logout } = useUser()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' ou 'register'
  const [pseudo, setPseudo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const result = authMode === 'login'
      ? login(pseudo, password)
      : register(pseudo, password)

    if (result.success) {
      setShowAuthModal(false)
      setPseudo('')
      setPassword('')
    } else {
      setError(result.error)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const openAuth = (mode) => {
    setAuthMode(mode)
    setError('')
    setPseudo('')
    setPassword('')
    setShowAuthModal(true)
  }

  const colorClasses = {
    blue: {
      bg: darkMode ? 'bg-sky-900/30' : 'bg-sky-50',
      border: darkMode ? 'border-sky-700' : 'border-sky-200',
      hover: darkMode ? 'hover:bg-sky-900/50' : 'hover:bg-sky-100',
      icon: darkMode ? 'text-sky-400' : 'text-sky-600',
      title: darkMode ? 'text-sky-300' : 'text-sky-700',
    },
    red: {
      bg: darkMode ? 'bg-red-900/30' : 'bg-red-50',
      border: darkMode ? 'border-red-700' : 'border-red-200',
      hover: darkMode ? 'hover:bg-red-900/50' : 'hover:bg-red-100',
      icon: darkMode ? 'text-red-400' : 'text-red-600',
      title: darkMode ? 'text-red-300' : 'text-red-700',
    },
    amber: {
      bg: darkMode ? 'bg-amber-900/30' : 'bg-amber-50',
      border: darkMode ? 'border-amber-700' : 'border-amber-200',
      hover: darkMode ? 'hover:bg-amber-900/50' : 'hover:bg-amber-100',
      icon: darkMode ? 'text-amber-400' : 'text-amber-600',
      title: darkMode ? 'text-amber-300' : 'text-amber-700',
    },
    emerald: {
      bg: darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50',
      border: darkMode ? 'border-emerald-700' : 'border-emerald-200',
      hover: darkMode ? 'hover:bg-emerald-900/50' : 'hover:bg-emerald-100',
      icon: darkMode ? 'text-emerald-400' : 'text-emerald-600',
      title: darkMode ? 'text-emerald-300' : 'text-emerald-700',
    },
    purple: {
      bg: darkMode ? 'bg-purple-900/30' : 'bg-purple-50',
      border: darkMode ? 'border-purple-700' : 'border-purple-200',
      hover: darkMode ? 'hover:bg-purple-900/50' : 'hover:bg-purple-100',
      icon: darkMode ? 'text-purple-400' : 'text-purple-600',
      title: darkMode ? 'text-purple-300' : 'text-purple-700',
    },
    teal: {
      bg: darkMode ? 'bg-teal-900/30' : 'bg-teal-50',
      border: darkMode ? 'border-teal-700' : 'border-teal-200',
      hover: darkMode ? 'hover:bg-teal-900/50' : 'hover:bg-teal-100',
      icon: darkMode ? 'text-teal-400' : 'text-teal-600',
      title: darkMode ? 'text-teal-300' : 'text-teal-700',
    },
  }

  const renderModuleCard = (module) => {
    const Icon = module.icon
    const colors = colorClasses[module.color]

    const cardContent = (
      <div className="flex flex-col items-center text-center">
        <Icon className={`w-10 h-10 md:w-14 md:h-14 mb-3 md:mb-4 ${colors.icon}`} strokeWidth={1.5} />
        <h2 className={`text-lg md:text-2xl font-bold mb-1 ${colors.title}`}>
          {module.title}
        </h2>
        <p className={`text-base md:text-xl font-arabic mb-2 ${colors.title}`} dir="rtl">
          {module.titleAr}
        </p>
        <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {module.description}
        </p>
        {module.comingSoon && (
          <span className={`mt-2 text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
            Bientot
          </span>
        )}
      </div>
    )

    const baseClasses = `
      p-4 md:p-6 rounded-2xl border-2 transition-all duration-200
      ${colors.bg} ${colors.border} ${colors.hover}
      ${module.comingSoon ? 'cursor-not-allowed opacity-75' : 'transform hover:scale-[1.02] hover:shadow-lg'}
    `

    if (module.comingSoon) {
      return (
        <div key={module.id} className={baseClasses}>
          {cardContent}
        </div>
      )
    }

    return (
      <Link key={module.id} to={module.path} className={baseClasses}>
        {cardContent}
      </Link>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col ${isMobile ? 'pb-20' : 'pb-24'} ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Top bar avec dark mode et auth */}
      <div className={`absolute ${isMobile ? 'top-3 right-3' : 'top-4 right-4'} z-50 flex items-center gap-1 md:gap-2`}>
        {/* User info / Auth buttons */}
        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${
              darkMode ? 'bg-slate-700 text-white' : 'bg-white text-gray-700 shadow-md'
            }`}>
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">{user.pseudo}</span>
            </div>
            <button
              onClick={handleLogout}
              className={`p-2.5 rounded-full transition-colors ${
                darkMode
                  ? 'bg-slate-700 hover:bg-slate-600 text-red-400'
                  : 'bg-white hover:bg-gray-100 text-red-500 shadow-md'
              }`}
              title="Deconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => openAuth('login')}
              className={`flex items-center gap-1 px-2 py-1.5 md:px-3 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${
                darkMode
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-white hover:bg-gray-100 text-gray-700 shadow-md'
              }`}
            >
              <LogIn className="w-3 h-3 md:w-4 md:h-4" />
              <span className={isMobile ? 'hidden' : ''}>Connexion</span>
            </button>
            <button
              onClick={() => openAuth('register')}
              className={`flex items-center gap-1 px-2 py-1.5 md:px-3 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${
                darkMode
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
              }`}
            >
              <UserPlus className="w-3 h-3 md:w-4 md:h-4" />
              <span className={isMobile ? 'hidden' : ''}>Inscription</span>
            </button>
          </div>
        )}

      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-sm mx-4 p-6 rounded-2xl shadow-xl ${
            darkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <h2 className={`text-xl font-bold mb-4 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {authMode === 'login' ? 'Connexion' : 'Inscription'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {authMode === 'login' ? 'Pseudo' : 'Choisit un nouveau Pseudo'}
                </label>
                <input
                  type="text"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-emerald-500'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-emerald-500'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                  placeholder="Ton pseudo"
                  autoFocus
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-emerald-500'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-emerald-500'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                  placeholder="Ton mot de passe"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg font-medium transition-colors bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {authMode === 'login' ? 'Se connecter' : "S'inscrire"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login')
                  setError('')
                }}
                className={`text-sm ${darkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}
              >
                {authMode === 'login' ? "Pas de compte ? S'inscrire" : 'Deja un compte ? Se connecter'}
              </button>
            </div>

            <button
              onClick={() => setShowAuthModal(false)}
              className={`mt-4 w-full py-2 rounded-lg text-sm transition-colors ${
                darkMode
                  ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              Continuer sans compte
            </button>
          </div>
        </div>
      )}

      <div className={`flex-1 flex flex-col items-center justify-center p-4 md:p-8 ${isMobile ? 'pt-14' : ''}`}>
        {/* Header - Bismillah */}
        <div className="text-center mb-6 md:mb-12">
          <h1 className={`text-2xl md:text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </h1>
          <p className={`text-sm md:text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Votre compagnon pour l'apprentissage islamique
          </p>
          {isLoggedIn && (
            <p className={`text-xs md:text-sm mt-2 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              Connecté en tant que <span className="font-semibold">{user.pseudo}</span>
            </p>
          )}
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 max-w-5xl w-full">
          {modules.map(module => renderModuleCard(module))}
        </div>

        {/* Hadith Quote */}
        <div className={`mt-6 md:mt-10 max-w-2xl text-center px-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p className="text-lg md:text-2xl font-arabic mb-2 md:mb-3" dir="rtl">
            طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ
          </p>
          <p className={`text-sm md:text-base italic mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            "Apprendre la science est une obligation pour chaque musulman"
          </p>
          <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Rapporte par Ibn Majah - Sahih Targhib n°72
          </p>
        </div>
      </div>

      <Footer darkMode={darkMode} toggleDarkMode={toggleDarkMode} isMobile={isMobile} />
    </div>
  )
}
