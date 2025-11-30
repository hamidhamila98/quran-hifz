import { Link } from 'react-router-dom'
import { BookOpen, Languages, BookMarked, Library } from 'lucide-react'

const modules = [
  {
    id: 'quran',
    path: '/quran',
    icon: BookOpen,
    title: 'Quran Hifz',
    titleAr: 'حفظ القرآن',
    description: 'Mémorisation du Coran avec audio synchronisé',
    color: 'emerald',
  },
  {
    id: 'arabic',
    path: '/arabic',
    icon: Languages,
    title: 'Arabic Learning',
    titleAr: 'تعلم العربية',
    description: 'Al-Arabiya Bayna Yadayk (Tomes 1-4)',
    color: 'amber',
  },
  {
    id: 'hadith',
    path: '/hadith',
    icon: BookMarked,
    title: 'Hadiths',
    titleAr: 'الأحاديث النبوية',
    description: '6 recueils majeurs - Recherche & Navigation',
    color: 'rose',
  },
  {
    id: 'library',
    path: '/library',
    icon: Library,
    title: 'Bibliothèque',
    titleAr: 'المكتبة الإسلامية',
    description: 'Livres islamiques, Tafsir (Bientôt)',
    color: 'indigo',
    comingSoon: true,
  },
]

export default function LandingPage({ darkMode }) {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-8 ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </h1>
        <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Apprentissage du Coran et de la langue arabe
        </p>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
        {modules.map((module) => {
          const Icon = module.icon
          const colorClasses = {
            emerald: {
              bg: darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50',
              border: darkMode ? 'border-emerald-700' : 'border-emerald-200',
              hover: darkMode ? 'hover:bg-emerald-900/50' : 'hover:bg-emerald-100',
              icon: darkMode ? 'text-emerald-400' : 'text-emerald-600',
              title: darkMode ? 'text-emerald-300' : 'text-emerald-700',
            },
            amber: {
              bg: darkMode ? 'bg-amber-900/30' : 'bg-amber-50',
              border: darkMode ? 'border-amber-700' : 'border-amber-200',
              hover: darkMode ? 'hover:bg-amber-900/50' : 'hover:bg-amber-100',
              icon: darkMode ? 'text-amber-400' : 'text-amber-600',
              title: darkMode ? 'text-amber-300' : 'text-amber-700',
            },
            rose: {
              bg: darkMode ? 'bg-rose-900/30' : 'bg-rose-50',
              border: darkMode ? 'border-rose-700' : 'border-rose-200',
              hover: darkMode ? 'hover:bg-rose-900/50' : 'hover:bg-rose-100',
              icon: darkMode ? 'text-rose-400' : 'text-rose-600',
              title: darkMode ? 'text-rose-300' : 'text-rose-700',
            },
            indigo: {
              bg: darkMode ? 'bg-indigo-900/30' : 'bg-indigo-50',
              border: darkMode ? 'border-indigo-700' : 'border-indigo-200',
              hover: darkMode ? 'hover:bg-indigo-900/50' : 'hover:bg-indigo-100',
              icon: darkMode ? 'text-indigo-400' : 'text-indigo-600',
              title: darkMode ? 'text-indigo-300' : 'text-indigo-700',
            },
          }
          const colors = colorClasses[module.color]

          return (
            <Link
              key={module.id}
              to={module.path}
              className={`
                p-8 rounded-2xl border-2 transition-all duration-200
                ${colors.bg} ${colors.border} ${colors.hover}
                transform hover:scale-[1.02] hover:shadow-lg
              `}
            >
              <div className="flex flex-col items-center text-center">
                <Icon className={`w-16 h-16 mb-4 ${colors.icon}`} strokeWidth={1.5} />
                <h2 className={`text-2xl font-bold mb-1 ${colors.title}`}>
                  {module.title}
                </h2>
                <p className={`text-xl font-arabic mb-3 ${colors.title}`} dir="rtl">
                  {module.titleAr}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {module.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Footer */}
      <div className={`mt-12 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        <p className="text-2xl font-arabic" dir="rtl">
          وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
        </p>
        <p className="text-sm mt-1 italic">
          "Et récite le Coran lentement et clairement" - Al-Muzzammil:4
        </p>
      </div>
    </div>
  )
}
