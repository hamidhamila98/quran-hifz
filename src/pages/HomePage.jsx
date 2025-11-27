import { useState, useEffect, useCallback } from 'react'
import { Calendar, BookOpen, Target, TrendingUp, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import {
  getPageWithLines,
  TOTAL_QURAN_LINES,
  SURAH_INFO,
  ARABIC_FONTS
} from '../services/quranApi'
import AudioPlayer from '../components/AudioPlayer'

// Pages spéciales (pas 15 lignes standard)
const SPECIAL_PAGES = [1, 2]

// Configuration des portions selon la taille choisie
const PORTION_CONFIG = {
  '1/4': { lines: [4, 4, 4, 3], portions: 4, label: '¼' },
  '1/3': { lines: [5, 5, 5], portions: 3, label: '⅓' },
  '1/2': { lines: [8, 7], portions: 2, label: '½' },
  '1': { lines: [15], portions: 1, label: '1' },
  '2': { lines: [15, 15], portions: 1, pages: 2, label: '2' }
}

export default function HomePage({ settings, updateSettings }) {
  const [verses, setVerses] = useState([])
  const [overflowVerse, setOverflowVerse] = useState(null) // Verset dépassant
  const [previewVerses, setPreviewVerses] = useState([]) // Aperçu page suivante
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [portionInfo, setPortionInfo] = useState(null)
  const [highlightedAyah, setHighlightedAyah] = useState(null)
  const [audioKey, setAudioKey] = useState(0)

  const currentPage = settings.currentPage || 1
  const portionIndex = settings.currentPortionIndex || 0
  const portionSize = settings.portionSize || '1/3'
  const config = PORTION_CONFIG[portionSize] || PORTION_CONFIG['1/3']

  // Calculate validated pages as fraction
  const validatedQuarters = settings.validatedPages || 0
  const validatedPagesDisplay = () => {
    const fullPages = Math.floor(validatedQuarters / 4)
    const remainder = validatedQuarters % 4
    if (remainder === 0) return fullPages === 0 ? '0' : `${fullPages}`
    const fractions = ['', '¼', '½', '¾']
    return fullPages > 0 ? `${fullPages}${fractions[remainder]}` : fractions[remainder]
  }

  // Progress percentage (604 pages total, 4 quarters each = 2416 quarters)
  const totalQuarters = 604 * 4
  const progressPercent = ((validatedQuarters / totalQuarters) * 100).toFixed(2)

  // Days since start
  const daysSinceStart = Math.floor(
    (new Date() - new Date(settings.startDate)) / (1000 * 60 * 60 * 24)
  )

  // Find current surah based on page
  const getCurrentSurah = (page) => {
    return SURAH_INFO.find(s => page >= s.startPage && page <= s.endPage)
  }

  const currentSurah = getCurrentSurah(currentPage)

  // Get font family
  const getFontFamily = () => {
    const font = ARABIC_FONTS.find(f => f.id === settings.arabicFont)
    return font ? font.family : "'Amiri Quran', 'Amiri', serif"
  }

  // Convert to Arabic numerals
  const toArabicNumeral = (num) => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
    return String(num).split('').map(digit => arabicNumerals[parseInt(digit)]).join('')
  }

  // Get lines for current portion
  const getPortionLines = () => {
    if (portionSize === '2') {
      return { startLine: 1, endLine: 15, pages: 2 }
    }

    const linesArray = config.lines
    let startLine = 1
    for (let i = 0; i < portionIndex; i++) {
      startLine += linesArray[i] || 0
    }
    const lineCount = linesArray[portionIndex] || linesArray[0]
    return { startLine, endLine: Math.min(startLine + lineCount - 1, 15), lineCount }
  }

  // Check if current portion is last of page
  const isLastPortionOfPage = () => {
    if (portionSize === '2') return true
    return portionIndex >= config.portions - 1
  }

  const loadPortion = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setOverflowVerse(null)
      setPreviewVerses([])

      // Handle special pages (1 and 2)
      if (SPECIAL_PAGES.includes(currentPage) && portionSize !== '2') {
        const pageData = await getPageWithLines(currentPage, settings.tajweedEnabled)

        const transformedVerses = pageData.verses.map(verse => ({
          number: verse.id,
          text: verse.text,
          numberInSurah: verse.verseNumber,
          surah: { number: verse.surahNumber },
          page: verse.pageNumber,
          verseKey: verse.verseKey
        }))

        setVerses(transformedVerses)
        setPortionInfo({
          isSpecialPage: true,
          page: currentPage,
          verseCount: transformedVerses.length
        })

        // Load preview for page 2 (end of special pages)
        if (currentPage === 2) {
          const nextPageData = await getPageWithLines(3, settings.tajweedEnabled)
          const firstLineVerses = nextPageData.verses.filter(v => v.lineNumbers.includes(1))
          setPreviewVerses(firstLineVerses.slice(0, 1).map(v => ({
            number: v.id,
            text: v.text,
            numberInSurah: v.verseNumber,
            verseKey: v.verseKey,
            isPreview: true
          })))
        }

        setLoading(false)
        return
      }

      // Normal page handling
      const { startLine, endLine, lineCount } = getPortionLines()

      // Load page data
      const pageData = await getPageWithLines(currentPage, settings.tajweedEnabled)

      // Group verses by lines
      const lineMap = new Map()
      pageData.verses.forEach(verse => {
        verse.lineNumbers.forEach(lineNum => {
          if (!lineMap.has(lineNum)) lineMap.set(lineNum, [])
          const existing = lineMap.get(lineNum)
          if (!existing.find(v => v.verseKey === verse.verseKey)) {
            lineMap.get(lineNum).push(verse)
          }
        })
      })

      // Collect verses for the portion lines
      // Only include verses that are FULLY within the portion lines
      // Verses that extend beyond go to overflow
      const portionVerses = []
      const overflowVerses = []
      const seenKeys = new Set()

      for (let line = startLine; line <= endLine; line++) {
        const versesOnLine = lineMap.get(line) || []
        versesOnLine.forEach(verse => {
          if (!seenKeys.has(verse.verseKey)) {
            seenKeys.add(verse.verseKey)
            const maxLine = Math.max(...verse.lineNumbers)

            // If verse extends beyond our portion, it's an overflow
            if (maxLine > endLine) {
              overflowVerses.push(verse)
            } else {
              portionVerses.push(verse)
            }
          }
        })
      }

      // Get the first overflow verse (the one that extends beyond)
      let overflow = overflowVerses.length > 0 ? overflowVerses[0] : null

      // Transform verses
      const transformedVerses = portionVerses.map(verse => ({
        number: verse.id,
        text: verse.text,
        numberInSurah: verse.verseNumber,
        surah: { number: verse.surahNumber },
        page: verse.pageNumber,
        verseKey: verse.verseKey
      }))

      setVerses(transformedVerses)

      // Set overflow verse if exists
      if (overflow) {
        setOverflowVerse({
          number: overflow.id,
          text: overflow.text,
          numberInSurah: overflow.verseNumber,
          verseKey: overflow.verseKey
        })
      }

      setPortionInfo({
        isSpecialPage: false,
        page: currentPage,
        startLine,
        endLine,
        portionIndex,
        totalPortions: config.portions,
        verseCount: transformedVerses.length
      })

      // Load preview if last portion of page
      if (isLastPortionOfPage() && currentPage < 604) {
        try {
          let nextPage = portionSize === '2' ? currentPage + 2 : currentPage + 1
          if (nextPage <= 604) {
            const nextPageData = await getPageWithLines(nextPage, settings.tajweedEnabled)
            // Get ONLY the first line (not full verse)
            const firstLineVerses = nextPageData.verses.filter(v => v.lineNumbers.includes(1))
            // Take just the first verse fragment on line 1
            const previewVerse = firstLineVerses[0]
            if (previewVerse) {
              setPreviewVerses([{
                number: previewVerse.id,
                text: previewVerse.text,
                numberInSurah: previewVerse.verseNumber,
                verseKey: previewVerse.verseKey,
                isPreview: true
              }])
            }
          }
        } catch (e) {
          console.log('Could not load preview')
        }
      }

      // Handle 2 pages mode - load second page
      if (portionSize === '2' && currentPage < 604) {
        const secondPageData = await getPageWithLines(currentPage + 1, settings.tajweedEnabled)
        const secondPageVerses = secondPageData.verses.map(verse => ({
          number: verse.id,
          text: verse.text,
          numberInSurah: verse.verseNumber,
          surah: { number: verse.surahNumber },
          page: verse.pageNumber,
          verseKey: verse.verseKey,
          isSecondPage: true
        }))
        setVerses(prev => [...prev, ...secondPageVerses])
      }

    } catch (err) {
      console.error('Error loading portion:', err)
      setError('Erreur de chargement. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }, [currentPage, portionIndex, portionSize, settings.tajweedEnabled])

  useEffect(() => {
    loadPortion()
  }, [loadPortion])

  // Navigate to next portion
  const handleNext = () => {
    if (verses.length === 0) return

    if (portionInfo?.isSpecialPage) {
      // Special pages: go to next page
      const nextPage = currentPage + 1
      if (nextPage <= 604) {
        updateSettings({
          currentPage: nextPage,
          currentPortionIndex: 0
        })
        setAudioKey(prev => prev + 1)
      }
    } else if (portionSize === '2') {
      // 2 pages mode: advance by 2 pages
      const nextPage = currentPage + 2
      if (nextPage <= 604) {
        updateSettings({ currentPage: nextPage })
        setAudioKey(prev => prev + 1)
      }
    } else if (portionIndex < config.portions - 1) {
      // Next portion on same page
      updateSettings({ currentPortionIndex: portionIndex + 1 })
      setAudioKey(prev => prev + 1)
    } else {
      // Next page, first portion
      const nextPage = currentPage + 1
      if (nextPage <= 604) {
        // Skip special pages if coming from page 2
        const targetPage = SPECIAL_PAGES.includes(nextPage) ? nextPage : nextPage
        updateSettings({
          currentPage: targetPage,
          currentPortionIndex: 0
        })
        setAudioKey(prev => prev + 1)
      }
    }
  }

  // Navigate to previous portion
  const handlePrevious = () => {
    if (portionInfo?.isSpecialPage) {
      const prevPage = currentPage - 1
      if (prevPage >= 1) {
        updateSettings({
          currentPage: prevPage,
          currentPortionIndex: 0
        })
        setAudioKey(prev => prev + 1)
      }
    } else if (portionSize === '2') {
      const prevPage = currentPage - 2
      if (prevPage >= 1) {
        updateSettings({ currentPage: Math.max(1, prevPage) })
        setAudioKey(prev => prev + 1)
      }
    } else if (portionIndex > 0) {
      updateSettings({ currentPortionIndex: portionIndex - 1 })
      setAudioKey(prev => prev + 1)
    } else {
      const prevPage = currentPage - 1
      if (prevPage >= 1) {
        if (SPECIAL_PAGES.includes(prevPage)) {
          updateSettings({
            currentPage: prevPage,
            currentPortionIndex: 0
          })
        } else {
          updateSettings({
            currentPage: prevPage,
            currentPortionIndex: config.portions - 1
          })
        }
        setAudioKey(prev => prev + 1)
      }
    }
  }

  // Validate current portion
  const handleValidate = () => {
    if (verses.length === 0) return

    // Calculate quarters to add based on portion size
    let quartersToAdd = 0
    switch (portionSize) {
      case '1/4': quartersToAdd = 1; break
      case '1/3': quartersToAdd = 4/3; break // Approximately
      case '1/2': quartersToAdd = 2; break
      case '1': quartersToAdd = 4; break
      case '2': quartersToAdd = 8; break
      default: quartersToAdd = 1
    }

    // For 1/3, we need to track better - let's use actual progression
    // Each 1/3 portion = 1.33 quarters, so 3 portions = 4 quarters = 1 page
    if (portionSize === '1/3') {
      quartersToAdd = portionIndex === 2 ? 2 : 1 // Last portion gets extra to round up
    }
    if (portionSize === '1/4') {
      quartersToAdd = 1
    }

    const newValidatedPages = (settings.validatedPages || 0) + quartersToAdd

    // Move to next portion
    if (portionInfo?.isSpecialPage) {
      const nextPage = currentPage + 1
      if (nextPage <= 604) {
        updateSettings({
          currentPage: nextPage,
          currentPortionIndex: 0,
          validatedPages: newValidatedPages
        })
        setAudioKey(prev => prev + 1)
      }
    } else if (portionSize === '2') {
      const nextPage = currentPage + 2
      if (nextPage <= 604) {
        updateSettings({
          currentPage: nextPage,
          validatedPages: newValidatedPages
        })
        setAudioKey(prev => prev + 1)
      } else {
        updateSettings({ validatedPages: totalQuarters })
      }
    } else if (portionIndex < config.portions - 1) {
      updateSettings({
        currentPortionIndex: portionIndex + 1,
        validatedPages: newValidatedPages
      })
      setAudioKey(prev => prev + 1)
    } else {
      const nextPage = currentPage + 1
      if (nextPage <= 604) {
        updateSettings({
          currentPage: nextPage,
          currentPortionIndex: 0,
          validatedPages: newValidatedPages
        })
        setAudioKey(prev => prev + 1)
      } else {
        updateSettings({ validatedPages: totalQuarters })
      }
    }
  }

  // Can navigate
  const canGoPrevious = currentPage > 1 || portionIndex > 0
  const canGoNext = verses.length > 0

  // Get portion label for display
  const getPortionLabel = () => {
    if (portionInfo?.isSpecialPage) {
      return `Page ${currentPage} complète`
    }
    if (portionSize === '2') {
      return `Pages ${currentPage}-${Math.min(currentPage + 1, 604)}`
    }
    const { startLine, endLine } = getPortionLines()
    return `Page ${currentPage} - Portion ${portionIndex + 1}/${config.portions} (lignes ${startLine}-${endLine})`
  }

  const stats = [
    {
      icon: Calendar,
      label: 'Jours',
      value: daysSinceStart,
      color: 'bg-blue-500'
    },
    {
      icon: Target,
      label: 'Page/j',
      value: config.label,
      color: 'bg-gold-500'
    },
    {
      icon: BookOpen,
      label: 'Page',
      value: currentPage,
      subtitle: portionInfo?.isSpecialPage ? 'Page spéciale' : `Portion ${portionIndex + 1}/${config.portions}`,
      color: 'bg-green-500'
    },
    {
      icon: TrendingUp,
      label: 'Pages validées',
      value: validatedPagesDisplay(),
      subtitle: `/ 604 pages`,
      color: 'bg-purple-500'
    }
  ]

  // Render verse marker
  const renderVerseMarker = (number) => {
    if (settings.arabicNumerals) {
      return (
        <span className="verse-marker" style={{ fontFamily: "'KFGQPC Uthmanic Script HAFS', 'Amiri Quran', serif" }}>
          {'\u06DD'}{toArabicNumeral(number)}
        </span>
      )
    } else {
      return (
        <span className="verse-marker-western">
          <span className="marker-symbol">{'\u06DD'}</span>
          <span className="marker-number">{number}</span>
        </span>
      )
    }
  }

  return (
    <div className={`min-h-screen p-6 ${settings.darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className="mb-8">
        <h1 className={`text-3xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
          Assalamu Alaikum
        </h1>
        <p className={`mt-2 ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Voici votre portion du Quran pour aujourd'hui
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`p-4 rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm card-hover`}
          >
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className={`text-2xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
              {stat.value}
            </p>
            <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {stat.label}
            </p>
            {stat.subtitle && (
              <p className={`text-xs ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {stat.subtitle}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Current Surah Info */}
      {currentSurah && (
        <div className={`mb-6 p-4 rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Sourate actuelle
              </p>
              <h2 className={`text-xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                {currentSurah.name} - {currentSurah.englishName}
              </h2>
              <p className={`text-sm ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Page {currentPage} • {currentSurah.ayahCount} versets
              </p>
            </div>
            <div className="arabic-text text-3xl text-primary-600 dark:text-primary-400">
              {currentSurah.number}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Verses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
              {getPortionLabel()}
            </h3>
            <span className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {verses.length} versets
            </span>
          </div>

          {loading ? (
            <div className={`rounded-2xl p-8 ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className={`text-center mt-4 ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Chargement des versets...
              </p>
            </div>
          ) : error ? (
            <div className={`rounded-2xl p-8 ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
              <p className="text-red-500 text-center">{error}</p>
              <button
                onClick={loadPortion}
                className="mt-4 mx-auto block px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <div className={`rounded-2xl p-6 ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
              {/* Main verses */}
              <div
                className={`text-2xl md:text-3xl ${settings.flowMode ? 'arabic-flow' : 'arabic-text'} ${settings.tajweedEnabled ? 'tajweed-text' : ''}`}
                style={{ fontFamily: getFontFamily() }}
              >
                {verses.filter(v => !v.isSecondPage).map((ayah, index) => (
                  <span
                    key={ayah.verseKey || ayah.number}
                    className={`
                      ${settings.flowMode ? 'verse-inline' : 'inline'} transition-all duration-200 cursor-pointer
                      ${highlightedAyah === ayah.number ? 'verse-highlight' : ''}
                      ${settings.darkMode ? 'text-gray-100' : 'text-gray-800'}
                    `}
                    onClick={() => setHighlightedAyah(ayah.number)}
                  >
                    {settings.tajweedEnabled ? (
                      <span dangerouslySetInnerHTML={{ __html: ayah.text.replace(/<span class=end>.*?<\/span>/g, '') }} />
                    ) : (
                      ayah.text
                    )}
                    {renderVerseMarker(ayah.numberInSurah)}
                    {settings.flowMode && index < verses.filter(v => !v.isSecondPage).length - 1 && ' '}
                  </span>
                ))}
              </div>

              {/* Overflow verse (verse extending beyond portion) */}
              {overflowVerse && (
                <div className={`mt-4 pt-4 border-t border-dashed ${settings.darkMode ? 'border-slate-600' : 'border-gray-300'}`}>
                  <p className={`text-xs mb-2 ${settings.darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                    Verset dépassant la portion :
                  </p>
                  <div
                    className={`text-xl md:text-2xl arabic-text ${settings.darkMode ? 'text-amber-200' : 'text-amber-700'} opacity-80`}
                    style={{ fontFamily: getFontFamily() }}
                  >
                    {settings.tajweedEnabled ? (
                      <span dangerouslySetInnerHTML={{ __html: overflowVerse.text.replace(/<span class=end>.*?<\/span>/g, '') }} />
                    ) : (
                      overflowVerse.text
                    )}
                    {renderVerseMarker(overflowVerse.numberInSurah)}
                  </div>
                </div>
              )}

              {/* Second page for 2-pages mode */}
              {portionSize === '2' && verses.some(v => v.isSecondPage) && (
                <div className={`mt-6 pt-6 border-t-2 ${settings.darkMode ? 'border-slate-600' : 'border-gray-300'}`}>
                  <p className={`text-sm mb-3 font-semibold ${settings.darkMode ? 'text-primary-400' : 'text-primary-600'}`}>
                    Page {currentPage + 1}
                  </p>
                  <div
                    className={`text-2xl md:text-3xl ${settings.flowMode ? 'arabic-flow' : 'arabic-text'} ${settings.tajweedEnabled ? 'tajweed-text' : ''}`}
                    style={{ fontFamily: getFontFamily() }}
                  >
                    {verses.filter(v => v.isSecondPage).map((ayah, index) => (
                      <span
                        key={ayah.verseKey || ayah.number}
                        className={`
                          ${settings.flowMode ? 'verse-inline' : 'inline'} transition-all duration-200 cursor-pointer
                          ${highlightedAyah === ayah.number ? 'verse-highlight' : ''}
                          ${settings.darkMode ? 'text-gray-100' : 'text-gray-800'}
                        `}
                        onClick={() => setHighlightedAyah(ayah.number)}
                      >
                        {settings.tajweedEnabled ? (
                          <span dangerouslySetInnerHTML={{ __html: ayah.text.replace(/<span class=end>.*?<\/span>/g, '') }} />
                        ) : (
                          ayah.text
                        )}
                        {renderVerseMarker(ayah.numberInSurah)}
                        {settings.flowMode && index < verses.filter(v => v.isSecondPage).length - 1 && ' '}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview of next page (only first LINE) */}
              {previewVerses.length > 0 && (
                <div className={`mt-6 pt-4 border-t border-dashed ${settings.darkMode ? 'border-slate-600' : 'border-gray-300'}`}>
                  <p className={`text-xs mb-2 ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Première ligne page suivante :
                  </p>
                  <div
                    className={`text-lg md:text-xl arabic-text text-red-500 dark:text-red-400 opacity-70`}
                    style={{ fontFamily: getFontFamily() }}
                  >
                    {previewVerses.map((ayah) => (
                      <span key={ayah.verseKey || ayah.number}>
                        {settings.tajweedEnabled ? (
                          <span dangerouslySetInnerHTML={{ __html: ayah.text.replace(/<span class=end>.*?<\/span>/g, '') }} />
                        ) : (
                          ayah.text
                        )}
                        {renderVerseMarker(ayah.numberInSurah)}
                      </span>
                    ))}
                    <span className="text-sm ml-2">...</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          {!loading && !error && verses.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-between gap-3">
              <button
                onClick={handlePrevious}
                disabled={!canGoPrevious}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all shadow-md
                  ${canGoPrevious
                    ? 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Précédent</span>
              </button>

              <button
                onClick={handleValidate}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Check className="w-5 h-5" />
                <span>Valider</span>
              </button>

              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all shadow-md
                  ${canGoNext
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
              >
                <span>Suivant</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Audio Player Sidebar */}
        <div className="lg:col-span-1">
          <h3 className={`text-lg font-semibold mb-4 ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
            Écouter la récitation
          </h3>
          <AudioPlayer
            key={audioKey}
            ayahs={verses.filter(v => !v.isSecondPage)}
            reciterId={settings.reciter}
            darkMode={settings.darkMode}
          />

          {/* Progress Card */}
          <div className={`mt-6 p-4 rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
            <h4 className={`font-semibold mb-3 ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
              Progression
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={settings.darkMode ? 'text-gray-400' : 'text-gray-500'}>Quran</span>
                  <span className={settings.darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {progressPercent}%
                  </span>
                </div>
                <div className={`h-2 rounded-full ${settings.darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-gold-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className={`pt-3 border-t ${settings.darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                <div className="flex justify-between text-sm">
                  <span className={settings.darkMode ? 'text-gray-400' : 'text-gray-500'}>Position</span>
                  <span className={settings.darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    Page {currentPage}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className={settings.darkMode ? 'text-gray-400' : 'text-gray-500'}>Pages validées</span>
                  <span className={settings.darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {validatedPagesDisplay()} / 604
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
