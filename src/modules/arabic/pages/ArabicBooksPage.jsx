import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Lock } from 'lucide-react'

export default function ArabicBooksPage({ settings, updateSettings }) {
  const navigate = useNavigate()
  const [booksRegistry, setBooksRegistry] = useState({ books: [], categories: [] })
  const [booksData, setBooksData] = useState({})
  const [loading, setLoading] = useState(true)

  // Load books registry and data on mount
  useEffect(() => {
    fetch('/arabic/books.json')
      .then(res => res.json())
      .then(registry => {
        setBooksRegistry(registry)

        // Load data for each available book
        const loadPromises = registry.books
          .filter(b => b.available && b.dataFile)
          .map(book =>
            fetch(book.dataFile)
              .then(res => res.json())
              .then(data => ({ id: book.id, data }))
              .catch(err => {
                console.error(`Error loading ${book.id}:`, err)
                return null
              })
          )

        Promise.all(loadPromises).then(results => {
          const dataMap = {}
          results.filter(Boolean).forEach(({ id, data }) => {
            dataMap[id] = data
          })
          setBooksData(dataMap)
          setLoading(false)
        })
      })
      .catch(err => {
        console.error('Error loading books registry:', err)
        setLoading(false)
      })
  }, [])

  // Calculate progress for a book using new format (per-book storage)
  const getBookProgress = (bookId) => {
    const data = booksData[bookId]
    if (!data?.sections) return { validated: 0, total: 0, percent: 0 }

    const allValidated = settings.arabicValidated || {}
    const bookValidated = allValidated[bookId] || {}
    const totalItems = data.sections.reduce((acc, s) => acc + (s.items?.length || 0), 0)
    const validated = Object.keys(bookValidated).length

    return {
      validated,
      total: totalItems,
      percent: totalItems > 0 ? ((validated / totalItems) * 100).toFixed(0) : 0
    }
  }

  // Calculate total progress based on completed books (100% = book validated)
  const getTotalProgress = () => {
    const availableBooks = booksRegistry.books?.filter(b => b.available) || []
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

    const data = booksData[book.id]
    const allValidated = settings.arabicValidated || {}
    const bookValidated = allValidated[book.id] || {}

    // Find last validated position for this book
    let lastSection = 1
    let lastItemIdx = 0

    if (data?.sections && Object.keys(bookValidated).length > 0) {
      // Get all validated keys for this book, sorted
      const validatedList = Object.keys(bookValidated)
        .map(key => {
          const [sectionId, itemIdx] = key.split('-').map(Number)
          return { sectionId, itemIdx }
        })
        .sort((a, b) => a.sectionId - b.sectionId || a.itemIdx - b.itemIdx)

      if (validatedList.length > 0) {
        const last = validatedList[validatedList.length - 1]
        lastSection = last.sectionId
        lastItemIdx = last.itemIdx

        // Try to go to next item
        const section = data.sections.find(s => s.id === lastSection)
        if (section) {
          if (lastItemIdx < (section.items?.length || 1) - 1) {
            lastItemIdx += 1
          } else {
            const nextSection = data.sections.find(s => s.id > lastSection)
            if (nextSection) {
              lastSection = nextSection.id
              lastItemIdx = 0
            }
          }
        }
      }
    }

    updateSettings({ arabicBook: book.id, arabicSection: lastSection, arabicItem: lastItemIdx })
    navigate(`/arabic/${book.id}?section=${lastSection}&item=${lastItemIdx + 1}`)
  }

  // Group books by category
  const booksByCategory = booksRegistry.categories?.map(category => ({
    ...category,
    books: booksRegistry.books?.filter(b => b.category === category.id).sort((a, b) => a.order - b.order) || []
  })).filter(cat => cat.books.length > 0) || []

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${settings.darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className={`mt-4 ${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Chargement...</p>
        </div>
      </div>
    )
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

      {/* Books by Category */}
      {booksByCategory.map((category) => (
        <div key={category.id} className="mb-8">
          <h2 className={`text-lg font-semibold mb-4 px-1 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {category.label}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {category.books.map((book) => {
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
                    {book.shortName}
                  </h3>
                  <p className={`text-sm mb-3 ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {book.title}
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
      ))}
    </div>
  )
}
