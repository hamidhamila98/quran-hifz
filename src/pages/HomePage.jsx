import { useState, useEffect, useCallback } from 'react'
import { BookOpen, ChevronRight, ChevronLeft, Check, List, Music } from 'lucide-react'
import {
  getPageWithLines,
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
  const [portionLines, setPortionLines] = useState([]) // Lignes de la portion pour affichage Mushaf
  const [overflowVerse, setOverflowVerse] = useState(null) // Verset dépassant
  const [previewVerses, setPreviewVerses] = useState([]) // Aperçu page suivante
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [portionInfo, setPortionInfo] = useState(null)
  const [highlightedAyah, setHighlightedAyah] = useState(null)
  const [audioKey, setAudioKey] = useState(0)
  const [selectedVerses, setSelectedVerses] = useState(new Set()) // Versets sélectionnés pour audio
  const [audioMode, setAudioMode] = useState('portion') // 'portion' ou 'selection'
  const [loopAudio, setLoopAudio] = useState(false) // Lecture en boucle

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

  // Toggle verse selection for audio (using verseKey for unique identification)
  const toggleVerseSelection = (verseKey) => {
    setSelectedVerses(prev => {
      const newSet = new Set(prev)
      if (newSet.has(verseKey)) {
        newSet.delete(verseKey)
      } else {
        newSet.add(verseKey)
      }
      return newSet
    })
    // Auto-switch to selection mode when selecting verses
    if (!selectedVerses.has(verseKey)) {
      setAudioMode('selection')
    }
  }

  // Clear all selections
  const clearSelection = () => {
    setSelectedVerses(new Set())
  }

  // Get verses for audio based on mode
  const getAudioVerses = () => {
    const portionVerses = verses.filter(v => !v.isSecondPage)
    if (audioMode === 'selection' && selectedVerses.size > 0) {
      return portionVerses.filter(v => selectedVerses.has(v.verseKey))
    }
    return portionVerses
  }

  const loadPortion = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setOverflowVerse(null)
      setPreviewVerses([])
      setPortionLines([])
      setSelectedVerses(new Set()) // Reset selection when portion changes

      // Handle special pages (1 and 2)
      if (SPECIAL_PAGES.includes(currentPage) && portionSize !== '2') {
        const pageData = await getPageWithLines(currentPage)

        const transformedVerses = pageData.verses.map(verse => ({
          number: verse.id,
          text: verse.text,
          numberInSurah: verse.verseNumber,
          surah: { number: verse.surahNumber },
          page: verse.pageNumber,
          verseKey: verse.verseKey
        }))

        setVerses(transformedVerses)
        // Store all lines for special pages
        setPortionLines(pageData.lines || [])
        setPortionInfo({
          isSpecialPage: true,
          page: currentPage,
          verseCount: transformedVerses.length
        })

        // Load preview for page 2 (end of special pages)
        if (currentPage === 2) {
          const nextPageData = await getPageWithLines(3)
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
      const pageData = await getPageWithLines(currentPage)

      // Extract lines for this portion (with word-level tajweed)
      const linesForPortion = (pageData.lines || []).filter(
        line => line.lineNumber >= startLine && line.lineNumber <= endLine
      )
      setPortionLines(linesForPortion)

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
            const nextPageData = await getPageWithLines(nextPage)
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
        const secondPageData = await getPageWithLines(currentPage + 1)
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
  }, [currentPage, portionIndex, portionSize])

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

  // Get position display text
  const getPositionText = () => {
    if (portionInfo?.isSpecialPage || portionSize === '1' || portionSize === '2') {
      return `Page ${currentPage}`
    }
    return `Page ${currentPage}, Portion ${portionIndex + 1}/${config.portions}`
  }

  // Render verse marker
  const renderVerseMarker = (number) => {
    return (
      <span className="verse-marker-styled">
        <span className="marker-symbol">{'\u06DD'}</span>
        <span className={`marker-number ${settings.arabicNumerals ? 'marker-number-arabic' : 'marker-number-western'}`}>
          {settings.arabicNumerals ? toArabicNumeral(number) : number}
        </span>
      </span>
    )
  }

  return (
    <div className={`min-h-screen p-6 ${settings.darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Progress Bar Header */}
      <div className={`mb-6 p-4 rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-lg font-bold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                Ma Progression
              </h1>
              <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {getPositionText()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="font-bold text-lg">{validatedPagesDisplay()}</span>
              <span className={`${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}> / 604 pages</span>
            </div>
            <div className={`font-semibold px-3 py-1 rounded-full ${
              settings.darkMode ? 'bg-primary-900/50 text-primary-400' : 'bg-primary-100 text-primary-700'
            }`}>
              {progressPercent}%
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className={`h-3 rounded-full ${settings.darkMode ? 'bg-slate-700' : 'bg-gray-200'} overflow-hidden`}>
          <div
            className="h-full bg-gradient-to-r from-primary-500 via-primary-400 to-gold-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(parseFloat(progressPercent), 0.5)}%` }}
          />
        </div>
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
              {/* Line-by-line display */}
              <div
                className="text-2xl md:text-3xl arabic-text"
                style={{ fontFamily: getFontFamily() }}
              >
                {portionLines.map((line, lineIdx) => (
                  <div
                    key={`line-${line.lineNumber}`}
                    className="mushaf-line text-center mb-2"
                    dir="rtl"
                  >
                    {line.words.map((word, wordIdx) => (
                      <span
                        key={`${word.verseKey}-${word.position}`}
                        className={`
                          inline cursor-pointer transition-all duration-200
                          ${selectedVerses.has(word.verseKey) ? 'verse-selected' : ''}
                          ${highlightedAyah === word.verseKey ? 'verse-highlight' : ''}
                          ${settings.darkMode ? 'text-gray-100' : 'text-gray-800'}
                        `}
                        onClick={() => toggleVerseSelection(word.verseKey)}
                      >
                        {word.isEndMarker ? renderVerseMarker(word.verseNumber) : word.text}
                        {wordIdx < line.words.length - 1 && !word.isEndMarker && ' '}
                      </span>
                    ))}
                  </div>
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
                    {overflowVerse.text}
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
                    className="text-2xl md:text-3xl arabic-text"
                    style={{ fontFamily: getFontFamily() }}
                  >
                    {verses.filter(v => v.isSecondPage).map((ayah, index) => (
                      <span
                        key={ayah.verseKey || ayah.number}
                        className={`
                          inline transition-all duration-200 cursor-pointer
                          ${selectedVerses.has(ayah.verseKey) ? 'verse-selected' : ''}
                          ${highlightedAyah === ayah.verseKey ? 'verse-highlight' : ''}
                          ${settings.darkMode ? 'text-gray-100' : 'text-gray-800'}
                        `}
                        onClick={() => toggleVerseSelection(ayah.verseKey)}
                      >
                        {ayah.text}
                        {renderVerseMarker(ayah.numberInSurah)}
                        {index < verses.filter(v => v.isSecondPage).length - 1 && ' '}
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
                        {ayah.text}
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

          {/* Audio Mode Selection */}
          <div className={`mb-4 p-3 rounded-xl ${settings.darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
            <div className="flex flex-col gap-2">
              {/* Mode: Portion entière */}
              <button
                onClick={() => setAudioMode('portion')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  audioMode === 'portion'
                    ? 'bg-primary-500 text-white'
                    : settings.darkMode
                      ? 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                      : 'bg-white text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Music className="w-4 h-4" />
                <span>Toute la portion</span>
              </button>

              {/* Mode: Sélection */}
              <button
                onClick={() => setAudioMode('selection')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  audioMode === 'selection'
                    ? 'bg-primary-500 text-white'
                    : settings.darkMode
                      ? 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                      : 'bg-white text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
                <span>Versets sélectionnés ({selectedVerses.size})</span>
              </button>
            </div>

            {/* Clear selection button */}
            {selectedVerses.size > 0 && (
              <button
                onClick={clearSelection}
                className={`mt-2 w-full text-xs py-1 rounded ${
                  settings.darkMode
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Effacer la sélection
              </button>
            )}
          </div>

          <AudioPlayer
            key={`${audioKey}-${audioMode}-${selectedVerses.size}`}
            ayahs={getAudioVerses()}
            reciterId={settings.reciter}
            darkMode={settings.darkMode}
            loopAll={loopAudio}
            onLoopChange={setLoopAudio}
          />
        </div>
      </div>
    </div>
  )
}
