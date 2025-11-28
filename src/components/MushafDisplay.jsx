import { useState, useEffect } from 'react'
import { getPageMushafStyle, ARABIC_FONTS } from '../services/quranApi'

export default function MushafDisplay({
  pageNumber,
  darkMode = false,
  arabicFont = 'amiri-quran',
  arabicNumerals = true,
  hideBismillah = false,
  onVerseClick = null
}) {
  const [pageData, setPageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Convert to Arabic numerals
  const toArabicNumeral = (num) => {
    const numerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
    return String(num).split('').map(digit => numerals[parseInt(digit)]).join('')
  }

  // Get font family
  const getFontFamily = () => {
    const font = ARABIC_FONTS.find(f => f.id === arabicFont)
    return font ? font.family : "'Amiri Quran', 'Amiri', serif"
  }

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getPageMushafStyle(pageNumber, { hideBismillah })
        setPageData(data)
      } catch (err) {
        console.error('Error loading Mushaf page:', err)
        setError('Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [pageNumber, hideBismillah])

  if (loading) {
    return (
      <div className={`rounded-2xl p-8 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className={`text-center mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Chargement...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`rounded-2xl p-8 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
        <p className="text-red-500 text-center">{error}</p>
      </div>
    )
  }

  if (!pageData) return null

  return (
    <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
      {/* Mushaf-style lines */}
      <div
        className="mushaf-page"
        style={{ fontFamily: getFontFamily() }}
      >
        {pageData.lines.map((line, lineIndex) => (
          <div
            key={line.lineNumber}
            className={`mushaf-line text-2xl md:text-3xl ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}
            style={{
              direction: 'rtl',
              textAlign: 'justify',
              textAlignLast: 'center',
              lineHeight: '3.2',
              minHeight: '3.2em'
            }}
          >
            {line.words.map((word, wordIndex) => {
              // Render verse end marker
              if (word.isEndMarker) {
                return (
                  <span
                    key={`${word.verseKey}-end-${wordIndex}`}
                    className="verse-marker-styled"
                    onClick={() => onVerseClick && onVerseClick(word)}
                  >
                    <span className="marker-symbol">{'\u06DD'}</span>
                    <span className="marker-number">
                      {arabicNumerals ? toArabicNumeral(word.verseNumber) : word.verseNumber}
                    </span>
                  </span>
                )
              }

              // Render regular word
              return (
                <span
                  key={`${word.verseKey}-${word.position}-${wordIndex}`}
                  className="mushaf-word cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded px-0.5 transition-colors"
                  onClick={() => onVerseClick && onVerseClick(word)}
                >
                  {word.text}
                </span>
              )
            })}
          </div>
        ))}
      </div>

      {/* Page number */}
      <div className={`text-center mt-4 pt-4 border-t ${darkMode ? 'border-slate-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
        <span className="text-sm font-medium">
          {arabicNumerals ? toArabicNumeral(pageNumber) : pageNumber}
        </span>
      </div>
    </div>
  )
}
