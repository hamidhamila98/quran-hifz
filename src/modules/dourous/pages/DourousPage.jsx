import { BookOpenText } from 'lucide-react'

export default function DourousPage({ settings }) {
  const darkMode = settings.darkMode

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-8 ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="text-center">
        <BookOpenText className={`w-24 h-24 mx-auto mb-6 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} strokeWidth={1.5} />
        <h1 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Mes Dourous
        </h1>
        <p className={`text-xl font-arabic mb-4 ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`} dir="rtl">
          دُرُوسِي
        </p>
        <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Module en cours de développement
        </p>
        <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Bientôt disponible - Notes & Playlists
        </p>
      </div>
    </div>
  )
}
