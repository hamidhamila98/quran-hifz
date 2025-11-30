import { Library } from 'lucide-react'

export default function LibraryPage({ settings }) {
  const darkMode = settings.darkMode

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-8 ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="text-center">
        <Library className={`w-24 h-24 mx-auto mb-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} strokeWidth={1.5} />
        <h1 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Bibliothèque
        </h1>
        <p className={`text-xl font-arabic mb-4 ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`} dir="rtl">
          المكتبة الإسلامية
        </p>
        <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Module en cours de développement
        </p>
        <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Bientôt disponible - Livres islamiques, Tafsir, etc.
        </p>
      </div>
    </div>
  )
}
