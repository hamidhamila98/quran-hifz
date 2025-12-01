import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Lock } from 'lucide-react'

const BOOKS = [
  {
    id: 'aby-t1',
    name: 'Al-Arabiya Bayna Yadayk',
    tome: 'ABY - Tome 1',
    description: '16 unités · 48 dialogues',
    available: true,
    dataFile: '/arabic/ABY-T1.json'
  },
  {
    id: 'aby-t2',
    name: 'Al-Arabiya Bayna Yadayk',
    tome: 'ABY - Tome 2',
    description: 'Prochainement',
    available: false,
    dataFile: '/arabic/ABY-T2.json'
  },
  {
    id: 'aby-t3',
    name: 'Al-Arabiya Bayna Yadayk',
    tome: 'ABY - Tome 3',
    description: 'Prochainement',
    available: false,
    dataFile: '/arabic/ABY-T3.json'
  },
  {
    id: 'aby-t4',
    name: 'Al-Arabiya Bayna Yadayk',
    tome: 'ABY - Tome 4',
    description: 'Prochainement',
    available: false,
    dataFile: '/arabic/ABY-T4.json'
  },
  {
    id: 'qiraatu',
    name: 'Qiraatu al Rachida',
    tome: 'Qiraatu al Rachida',
    description: 'Prochainement',
    available: false,
    dataFile: null
  },
  {
    id: 'qassas',
    name: 'Qassas al Nabiyeen',
    tome: 'Qassas al Nabiyeen',
    description: 'Prochainement',
    available: false,
    dataFile: null
  },
]

export default function ArabicBooksPage({ settings, updateSettings }) {
  const navigate = useNavigate()
  const [booksData, setBooksData] = useState({})

  // Load data for available books to show progress
  useEffect(() => {
    BOOKS.filter(b => b.available).forEach(book => {
      fetch(book.dataFile)
        .then(res => res.json())
        .then(data => {
          setBooksData(prev => ({ ...prev, [book.id]: data }))
        })
        .catch(err => console.error(`Error loading ${book.id}:`, err))
    })
  }, [])

  // Calculate progress for a book
  const getBookProgress = (bookId) => {
    const data = booksData[bookId]
    if (!data?.units) return { validated: 0, total: 0, percent: 0 }

    const validatedDialogues = settings.arabicValidated || {}
    const totalLessons = data.units.reduce((acc, u) => acc + (u.dialogues?.length || u.lessons?.length || 0), 0)

    // Count validated lessons for this book
    const bookKey = bookId.replace('aby-t', 'aby')
    const validated = Object.keys(validatedDialogues).filter(key => {
      const unitId = parseInt(key.split('-')[0])
      return data.units.some(u => u.id === unitId)
    }).length

    return {
      validated,
      total: totalLessons,
      percent: totalLessons > 0 ? ((validated / totalLessons) * 100).toFixed(0) : 0
    }
  }

  // Calculate total progress based on completed books (100% = book validated)
  const getTotalProgress = () => {
    const availableBooks = BOOKS.filter(b => b.available)
    let completedBooks = 0

    availableBooks.forEach(book => {
      const progress = getBookProgress(book.id)
      if (progress.total > 0 && progress.validated === progress.total) {
        completedBooks++
      }
    })

    return {
      completed: completedBooks,
      total: availableBooks.length,
      percent: availableBooks.length > 0 ? ((completedBooks / availableBooks.length) * 100).toFixed(0) : 0
    }
  }

  const totalProgress = getTotalProgress()

  const handleBookClick = (book) => {
    if (!book.available) return
    // Update settings with book selection
    const bookKey = book.id.replace('aby-t', 'aby')
    updateSettings({ arabicBook: bookKey, arabicUnit: 1, arabicDialogue: 0 })
    navigate(`/arabic/${book.id}?unit=1&dialogue=1`)
  }

  return (
    <div className={`p-6 pb-16 ${settings.darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Header with total progress */}
      <div className={`mb-8 p-6 rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">ع</span>
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                Ma Progression
              </h1>
              <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Apprentissage de l'arabe
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-right ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="font-bold text-2xl">{totalProgress.completed}</span>
              <span className={`${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}> / {totalProgress.total}</span>
              <p className={`text-xs ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>livre{totalProgress.completed > 1 ? 's' : ''} validé{totalProgress.completed > 1 ? 's' : ''}</p>
            </div>
            <div className={`font-bold text-xl px-4 py-2 rounded-xl ${
              settings.darkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700'
            }`}>
              {totalProgress.percent}%
            </div>
          </div>
        </div>
        {/* Total progress bar */}
        <div className={`h-3 rounded-full ${settings.darkMode ? 'bg-slate-700' : 'bg-gray-200'} overflow-hidden`}>
          <div
            className="h-full bg-gradient-to-r from-red-600 to-red-700 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(parseFloat(totalProgress.percent), 0.5)}%` }}
          />
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BOOKS.map((book) => {
          const progress = getBookProgress(book.id)
          const isAvailable = book.available

          return (
            <button
              key={book.id}
              onClick={() => handleBookClick(book)}
              disabled={!isAvailable}
              className={`relative p-6 rounded-2xl text-left transition-all ${
                isAvailable
                  ? settings.darkMode
                    ? 'bg-slate-800 hover:bg-slate-700 hover:scale-[1.02] cursor-pointer'
                    : 'bg-white hover:bg-gray-50 hover:scale-[1.02] hover:shadow-lg cursor-pointer'
                  : settings.darkMode
                    ? 'bg-slate-800/50 cursor-not-allowed opacity-60'
                    : 'bg-gray-100 cursor-not-allowed opacity-60'
              } shadow-sm`}
            >
              {/* Lock icon for unavailable books */}
              {!isAvailable && (
                <div className="absolute top-4 right-4">
                  <Lock className={`w-5 h-5 ${settings.darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                </div>
              )}

              {/* Book icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                isAvailable
                  ? 'bg-gradient-to-br from-red-600 to-red-700'
                  : settings.darkMode ? 'bg-slate-700' : 'bg-gray-200'
              }`}>
                <BookOpen className={`w-6 h-6 ${isAvailable ? 'text-white' : settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>

              {/* Book info */}
              <h3 className={`font-bold text-lg mb-1 ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                {book.tome}
              </h3>
              <p className={`text-sm mb-3 ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {book.name}
              </p>
              <p className={`text-xs ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {book.description}
              </p>

              {/* Progress for available books */}
              {isAvailable && progress.total > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={settings.darkMode ? 'text-gray-400' : 'text-gray-500'}>
                      {progress.validated}/{progress.total} leçons
                    </span>
                    <span className={`font-semibold ${settings.darkMode ? 'text-red-400' : 'text-red-600'}`}>
                      {progress.percent}%
                    </span>
                  </div>
                  <div className={`h-2 rounded-full ${settings.darkMode ? 'bg-slate-700' : 'bg-gray-200'} overflow-hidden`}>
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-red-700 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(parseFloat(progress.percent), 1)}%` }}
                    />
                  </div>
                </div>
              )}

            </button>
          )
        })}
      </div>
    </div>
  )
}
