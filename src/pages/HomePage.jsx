import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookOpen, ChevronRight, ChevronLeft, Check, List, Music, ChevronUp, ChevronDown, Play, Pause } from 'lucide-react'
import {
  getPageWithLines,
  SURAH_INFO,
  ARABIC_FONTS,
  JUZ_INFO,
  getEveryAyahUrl,
  RECITERS
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
  const [searchParams, setSearchParams] = useSearchParams()
  const [verses, setVerses] = useState([])
  const [portionLines, setPortionLines] = useState([]) // Lignes de la portion pour affichage Mushaf
  const [secondPageLines, setSecondPageLines] = useState([]) // Lignes de la 2ème page (mode 2 pages)
  const [overflowVerse, setOverflowVerse] = useState(null) // Verset dépassant (fin de portion)
  const [overflowLines, setOverflowLines] = useState([]) // Lignes du verset dépassant
  const [cutVerse, setCutVerse] = useState(null) // Verset coupé (début de portion)
  const [cutVerseLines, setCutVerseLines] = useState([]) // Lignes du verset coupé (avant la portion)
  const [previewVerses, setPreviewVerses] = useState([]) // Aperçu page suivante
  const [previewLines, setPreviewLines] = useState([]) // Lignes de l'aperçu page suivante
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [portionInfo, setPortionInfo] = useState(null)
  const [highlightedAyah, setHighlightedAyah] = useState(null)
  const [audioKey, setAudioKey] = useState(0)
  const [selectedVerses, setSelectedVerses] = useState(new Set()) // Versets sélectionnés pour audio
  const [audioMode, setAudioMode] = useState('portion') // 'portion' ou 'selection'
  const [loopAudio, setLoopAudio] = useState(false) // Lecture en boucle
  const [showCutVerse, setShowCutVerse] = useState(false) // Afficher début du verset (portion précédente)
  const [showOverflowVerse, setShowOverflowVerse] = useState(false) // Afficher fin du verset (dépassant)

  // Mini player state
  const [miniPlayerPlaying, setMiniPlayerPlaying] = useState(false)
  const [miniPlayerProgress, setMiniPlayerProgress] = useState(0)
  const [miniPlayerDuration, setMiniPlayerDuration] = useState(0)
  const [miniPlayerCurrentIndex, setMiniPlayerCurrentIndex] = useState(0)
  const miniPlayerRef = useRef(null)

  const currentPage = settings.currentPage || 1
  const portionIndex = settings.currentPortionIndex || 0
  const portionSize = settings.portionSize || '1/3'
  const config = PORTION_CONFIG[portionSize] || PORTION_CONFIG['1/3']

  // Synchroniser les paramètres URL avec les settings
  useEffect(() => {
    const urlPage = searchParams.get('page')
    const urlPortion = searchParams.get('portion')
    
    if (urlPage) {
      const pageNum = parseInt(urlPage)
      if (pageNum >= 1 && pageNum <= 604 && pageNum !== currentPage) {
        updateSettings({ currentPage: pageNum })
      }
    }
    
    if (urlPortion !== null) {
      const portionNum = parseInt(urlPortion)
      const maxPortions = config.portions
      if (portionNum >= 0 && portionNum < maxPortions && portionNum !== portionIndex) {
        updateSettings({ currentPortionIndex: portionNum })
      }
    }
  }, [searchParams])

  // Mettre à jour l'URL quand la page/portion change
  useEffect(() => {
    const newParams = new URLSearchParams()
    newParams.set('page', String(currentPage))
    if (config.portions > 1 && portionSize !== '1' && portionSize !== '2') {
      newParams.set('portion', String(portionIndex))
    }
    setSearchParams(newParams, { replace: true })
  }, [currentPage, portionIndex, portionSize])

  // Nouveau système simple: tableau des pages validées
  // S'assurer que validatedPages est bien un tableau (migration depuis ancien système)
  const validatedPages = Array.isArray(settings.validatedPages) ? settings.validatedPages : []
  const portionProgress = settings.portionProgress || {}

  // Nombre de pages validées = longueur du tableau
  const completePagesCount = validatedPages.length
  const progressPercent = ((completePagesCount / 604) * 100).toFixed(2)

  // Label pour la taille de portion
  const getPortionSizeLabel = () => {
    switch (portionSize) {
      case '1/4': return '¼ de page'
      case '1/3': return '⅓ de page'
      case '1/2': return '½ page'
      case '1': return '1 page'
      case '2': return '2 pages'
      default: return portionSize
    }
  }

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
      setOverflowLines([])
      setCutVerse(null)
      setCutVerseLines([])
      setPreviewVerses([])
      setPreviewLines([])
      setPortionLines([])
      setSelectedVerses(new Set()) // Reset selection when portion changes
      setShowCutVerse(false) // Reset toggle states
      setShowOverflowVerse(false)
      // Reset mini player
      if (miniPlayerRef.current) {
        miniPlayerRef.current.pause()
        miniPlayerRef.current.currentTime = 0
      }
      setMiniPlayerPlaying(false)
      setMiniPlayerProgress(0)
      setMiniPlayerCurrentIndex(0)

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
        // Store all lines for special pages
        setPortionLines(pageData.lines || [])
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
      // Include ALL verses that touch the portion lines (start OR end within)
      // Track: verse cut from previous portion (starts before) and overflow verse (ends after)
      const portionVerses = []
      const seenKeys = new Set()
      let lastOverflowVerse = null
      let firstCutVerse = null // Verset qui commence AVANT notre portion

      for (let line = startLine; line <= endLine; line++) {
        const versesOnLine = lineMap.get(line) || []
        versesOnLine.forEach(verse => {
          if (!seenKeys.has(verse.verseKey)) {
            seenKeys.add(verse.verseKey)
            const maxLine = Math.max(...verse.lineNumbers)
            const minLine = Math.min(...verse.lineNumbers)

            // Include verse if it touches our portion
            // A verse "touches" the portion if any of its lines are in [startLine, endLine]
            const touchesPortion = verse.lineNumbers.some(l => l >= startLine && l <= endLine)

            if (touchesPortion) {
              // If verse starts before our portion (cut from previous), track it
              if (minLine < startLine && !firstCutVerse) {
                firstCutVerse = verse
              }
              // If verse extends beyond our portion (ends after endLine), track as potential overflow
              if (maxLine > endLine) {
                lastOverflowVerse = verse
              }
              // Add to portion verses (for audio and counting)
              portionVerses.push(verse)
            }
          }
        })
      }

      // Transform verses for audio/counting (all verses that touch the portion)
      const transformedVerses = portionVerses.map(verse => ({
        number: verse.id,
        text: verse.text,
        numberInSurah: verse.verseNumber,
        surah: { number: verse.surahNumber },
        page: verse.pageNumber,
        verseKey: verse.verseKey
      }))

      setVerses(transformedVerses)

      // Set cut verse if exists - extract lines that are BEFORE our portion
      if (firstCutVerse) {
        setCutVerse({
          number: firstCutVerse.id,
          text: firstCutVerse.text,
          numberInSurah: firstCutVerse.verseNumber,
          verseKey: firstCutVerse.verseKey
        })
        // Extract lines for the cut verse (lines before startLine)
        const cutLinesData = (pageData.lines || []).filter(
          line => line.lineNumber < startLine && firstCutVerse.lineNumbers.includes(line.lineNumber)
        ).map(line => ({
          ...line,
          words: line.words.filter(w => w.verseKey === firstCutVerse.verseKey)
        }))
        setCutVerseLines(cutLinesData)
      }

      // Set overflow verse if exists - extract lines that are beyond our portion
      if (lastOverflowVerse) {
        setOverflowVerse({
          number: lastOverflowVerse.id,
          text: lastOverflowVerse.text,
          numberInSurah: lastOverflowVerse.verseNumber,
          verseKey: lastOverflowVerse.verseKey
        })
        // Extract lines for the overflow verse (lines after endLine)
        const overflowLinesData = (pageData.lines || []).filter(
          line => line.lineNumber > endLine && lastOverflowVerse.lineNumbers.includes(line.lineNumber)
        ).map(line => ({
          ...line,
          words: line.words.filter(w => w.verseKey === lastOverflowVerse.verseKey)
        }))
        setOverflowLines(overflowLinesData)
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
            // Get ONLY the first line
            const firstLine = (nextPageData.lines || []).find(l => l.lineNumber === 1)
            if (firstLine) {
              setPreviewLines([firstLine])
            }
            // Keep verse info for marker
            const firstLineVerses = nextPageData.verses.filter(v => v.lineNumbers.includes(1))
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
        // Stocker les lignes de la 2ème page
        setSecondPageLines(secondPageData.lines || [])
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
      } else {
        setSecondPageLines([])
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

  // Vérifier si une page spécifique est validée
  const isPageValidated = (page) => {
    return validatedPages.includes(page)
  }

  // Vérifier si la portion actuelle est validée
  const isCurrentPortionValidated = () => {
    // Pages spéciales (1 et 2) sont toujours validées en entier, pas par portion
    if (SPECIAL_PAGES.includes(currentPage)) {
      return isPageValidated(currentPage)
    }

    // Mode 1 page ou 2 pages: vérifier si la/les page(s) sont validées
    if (portionSize === '1') {
      return isPageValidated(currentPage)
    }
    if (portionSize === '2') {
      return isPageValidated(currentPage) && isPageValidated(currentPage + 1)
    }

    // Mode fractionné (1/4, 1/3, 1/2):
    // Si la page entière est déjà validée (via mode 1p ou 2p), toutes les portions sont validées
    if (isPageValidated(currentPage)) {
      return true
    }
    // Sinon vérifier la portion spécifique
    const pageProgress = portionProgress[String(currentPage)] || []
    return pageProgress.includes(portionIndex)
  }

  // Vérifier si une page est complète (toutes portions validées)
  const isPageComplete = (page) => {
    return isPageValidated(page)
  }

  // Obtenir le nombre de portions validées pour la page actuelle
  const getValidatedPortionsCount = () => {
    if (portionSize === '1' || portionSize === '2') {
      return isPageValidated(currentPage) ? 1 : 0
    }
    // Si la page est déjà validée (via mode 1p ou 2p), toutes les portions sont validées
    if (isPageValidated(currentPage)) {
      return config.portions
    }
    const pageProgress = portionProgress[String(currentPage)] || []
    return pageProgress.length
  }

  // Toggle validation pour la portion/page actuelle
  const handleToggleValidation = () => {
    if (verses.length === 0) return

    let newValidatedPages = [...validatedPages]
    let newPortionProgress = { ...portionProgress }

    // Pages spéciales (1 et 2): toujours validées en entier (1 page)
    if (SPECIAL_PAGES.includes(currentPage)) {
      if (isPageValidated(currentPage)) {
        newValidatedPages = newValidatedPages.filter(p => p !== currentPage)
      } else {
        newValidatedPages.push(currentPage)
      }
    } else if (portionSize === '1') {
      // Mode 1 page: toggle la page
      if (isPageValidated(currentPage)) {
        newValidatedPages = newValidatedPages.filter(p => p !== currentPage)
      } else {
        newValidatedPages.push(currentPage)
      }
    } else if (portionSize === '2') {
      // Mode 2 pages: toggle les 2 pages ensemble
      const page1 = currentPage
      const page2 = currentPage + 1
      const bothValidated = isPageValidated(page1) && isPageValidated(page2)

      if (bothValidated) {
        // Dévalider les 2 pages
        newValidatedPages = newValidatedPages.filter(p => p !== page1 && p !== page2)
      } else {
        // Valider les 2 pages
        if (!newValidatedPages.includes(page1)) newValidatedPages.push(page1)
        if (!newValidatedPages.includes(page2)) newValidatedPages.push(page2)
      }
    } else {
      // Mode fractionné (1/4, 1/3, 1/2)
      const pageKey = String(currentPage)
      const pageProgress = newPortionProgress[pageKey] || []

      if (pageProgress.includes(portionIndex)) {
        // Dévalider cette portion
        newPortionProgress[pageKey] = pageProgress.filter(p => p !== portionIndex)
        // Si c'était la dernière portion, retirer la page des validées
        if (newPortionProgress[pageKey].length < config.portions) {
          newValidatedPages = newValidatedPages.filter(p => p !== currentPage)
        }
      } else {
        // Valider cette portion
        newPortionProgress[pageKey] = [...pageProgress, portionIndex]
        // Si toutes les portions sont validées, ajouter la page
        if (newPortionProgress[pageKey].length >= config.portions) {
          if (!newValidatedPages.includes(currentPage)) {
            newValidatedPages.push(currentPage)
          }
        }
      }
    }

    // Trier le tableau pour garder l'ordre
    newValidatedPages.sort((a, b) => a - b)

    updateSettings({
      validatedPages: newValidatedPages,
      portionProgress: newPortionProgress
    })
  }

  // Can navigate
  const canGoPrevious = currentPage > 1 || portionIndex > 0
  const canGoNext = verses.length > 0

  // Mini player functions
  const getMiniPlayerVerses = () => {
    // Si des versets sont sélectionnés, les utiliser, sinon toute la portion
    const portionVerses = verses.filter(v => !v.isSecondPage && !v.isPreview)
    if (selectedVerses.size > 0) {
      return portionVerses.filter(v => selectedVerses.has(v.verseKey))
    }
    return portionVerses
  }

  // Sync playback speed in real-time
  useEffect(() => {
    if (miniPlayerRef.current) {
      miniPlayerRef.current.playbackRate = settings.playbackSpeed || 1
    }
  }, [settings.playbackSpeed])

  // Reset mini player when selection changes
  useEffect(() => {
    if (miniPlayerRef.current && miniPlayerPlaying) {
      miniPlayerRef.current.pause()
      miniPlayerRef.current.currentTime = 0
    }
    setMiniPlayerPlaying(false)
    setMiniPlayerProgress(0)
    setMiniPlayerCurrentIndex(0)
  }, [selectedVerses.size])

  const loadMiniPlayerAudio = (index) => {
    const miniVerses = getMiniPlayerVerses()
    if (!miniPlayerRef.current || index >= miniVerses.length) return

    const verse = miniVerses[index]
    const reciter = RECITERS.find(r => r.id === settings.reciter) || RECITERS[0]
    const [surahNumber, ayahNumber] = verse.verseKey
      ? verse.verseKey.split(':').map(Number)
      : [verse.surah?.number || 1, verse.numberInSurah || 1]

    const audioUrl = getEveryAyahUrl(surahNumber, ayahNumber, reciter.everyAyahId)
    miniPlayerRef.current.src = audioUrl
    miniPlayerRef.current.playbackRate = settings.playbackSpeed || 1
  }

  const handleMiniPlayerPlayPause = () => {
    if (!miniPlayerRef.current) return

    if (miniPlayerPlaying) {
      miniPlayerRef.current.pause()
      setMiniPlayerPlaying(false)
    } else {
      const miniVerses = getMiniPlayerVerses()
      if (miniVerses.length === 0) return

      // Si c'est la première fois ou si terminé, charger le premier verset
      if (miniPlayerRef.current.src === '' || miniPlayerCurrentIndex >= miniVerses.length) {
        setMiniPlayerCurrentIndex(0)
        loadMiniPlayerAudio(0)
      }
      miniPlayerRef.current.play().catch(err => {
        console.error('Mini player error:', err)
        setMiniPlayerPlaying(false)
      })
      setMiniPlayerPlaying(true)
    }
  }

  const handleMiniPlayerTimeUpdate = () => {
    if (!miniPlayerRef.current) return
    setMiniPlayerProgress(miniPlayerRef.current.currentTime)
  }

  const handleMiniPlayerLoadedMetadata = () => {
    if (!miniPlayerRef.current) return
    setMiniPlayerDuration(miniPlayerRef.current.duration)
  }

  const handleMiniPlayerEnded = () => {
    const miniVerses = getMiniPlayerVerses()
    if (miniPlayerCurrentIndex < miniVerses.length - 1) {
      // Passer au verset suivant
      const nextIndex = miniPlayerCurrentIndex + 1
      setMiniPlayerCurrentIndex(nextIndex)
      loadMiniPlayerAudio(nextIndex)
      setTimeout(() => {
        miniPlayerRef.current?.play()
      }, 100)
    } else {
      // Fin de tous les versets
      setMiniPlayerPlaying(false)
      setMiniPlayerProgress(0)
      setMiniPlayerCurrentIndex(0)
    }
  }

  // Get current Juz number
  const getCurrentJuz = () => {
    const juz = JUZ_INFO.find(j => currentPage >= j.startPage && currentPage <= j.endPage)
    return juz ? juz.number : 1
  }

  // Get portion label for display
  const getPortionLabel = () => {
    const juzNum = getCurrentJuz()
    const juzLabel = `[Juz ${juzNum}]`

    if (portionInfo?.isSpecialPage) {
      return `${juzLabel} Page ${currentPage} complète`
    }
    if (portionSize === '2') {
      return `${juzLabel} Pages ${currentPage}-${Math.min(currentPage + 1, 604)}`
    }
    if (portionSize === '1') {
      return `${juzLabel} Page ${currentPage}`
    }
    // Mode fractionné: [Juz X] Page Y - 1/3, 2/3, etc.
    return `${juzLabel} Page ${currentPage} - ${portionIndex + 1}/${config.portions}`
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
                Vous apprenez <span className="font-semibold text-primary-500">{getPortionSizeLabel()}</span> du Coran par jour.
                {completePagesCount > 0 && (
                  <> Vous avez appris <span className="font-semibold text-green-500">{completePagesCount} page{completePagesCount > 1 ? 's' : ''}</span>.</>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="font-bold text-lg">{completePagesCount}</span>
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

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Verses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className={`text-lg font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                {getPortionLabel()}
              </h3>
              {/* Checkbox Validé */}
              <button
                onClick={handleToggleValidation}
                className="flex items-center gap-2 cursor-pointer select-none group"
                title={isCurrentPortionValidated() ? "Marquer comme non validé" : "Marquer comme validé"}
              >
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
                  group-hover:scale-110
                  ${isCurrentPortionValidated()
                    ? 'bg-green-500 border-green-500 dark:bg-green-600 dark:border-green-600'
                    : settings.darkMode
                      ? 'border-slate-500 bg-slate-700 hover:border-green-500'
                      : 'border-gray-300 bg-white hover:border-green-500'
                  }`}
                >
                  <Check className={`w-4 h-4 text-white transition-opacity ${isCurrentPortionValidated() ? 'opacity-100' : 'opacity-0'}`} />
                </div>
                <span className={`text-sm ${
                  isCurrentPortionValidated()
                    ? 'text-green-600 dark:text-green-400 font-medium'
                    : settings.darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {isCurrentPortionValidated() ? 'Validé' : 'Valider'}
                </span>
                {/* Indicateur de progression de la page */}
                {config.portions > 1 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isPageComplete(currentPage)
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                      : settings.darkMode ? 'bg-slate-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {getValidatedPortionsCount()}/{config.portions}
                  </span>
                )}
              </button>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={handlePrevious}
                  disabled={!canGoPrevious}
                  title="Précédent"
                  className={`p-2 rounded-lg transition-all ${
                    canGoPrevious
                      ? 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canGoNext}
                  title="Suivant"
                  className={`p-2 rounded-lg transition-all ${
                    canGoNext
                      ? 'bg-primary-500 hover:bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>

          {/* Mini Player - Full width bar */}
          <div className={`mb-4 rounded-2xl p-3 ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
            <audio
              ref={miniPlayerRef}
              onTimeUpdate={handleMiniPlayerTimeUpdate}
              onLoadedMetadata={handleMiniPlayerLoadedMetadata}
              onEnded={handleMiniPlayerEnded}
              onCanPlay={() => {
                if (miniPlayerRef.current) miniPlayerRef.current.playbackRate = settings.playbackSpeed || 1
              }}
            />
            <div className="flex items-center gap-3">
              {/* Play/Pause Button */}
              <button
                onClick={handleMiniPlayerPlayPause}
                disabled={getMiniPlayerVerses().length === 0}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                  getMiniPlayerVerses().length === 0
                    ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
                    : miniPlayerPlaying
                      ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg'
                      : 'bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:scale-105'
                }`}
                title={miniPlayerPlaying ? "Pause" : (selectedVerses.size > 0 ? "Écouter la sélection" : "Écouter la portion")}
              >
                {miniPlayerPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>

              {/* Progress Section */}
              <div className="flex-1 flex flex-col gap-1">
                {/* Progress bar */}
                <div className={`h-2 rounded-full ${settings.darkMode ? 'bg-slate-700' : 'bg-gray-200'} overflow-hidden cursor-pointer`}>
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-150"
                    style={{
                      width: getMiniPlayerVerses().length > 0 && miniPlayerDuration > 0
                        ? `${((miniPlayerCurrentIndex / getMiniPlayerVerses().length) * 100) + ((miniPlayerProgress / miniPlayerDuration) * (100 / getMiniPlayerVerses().length))}%`
                        : '0%'
                    }}
                  />
                </div>
                {/* Info row */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedVerses.size > 0 ? (
                      <span className="text-primary-500 font-medium">{selectedVerses.size} verset{selectedVerses.size > 1 ? 's' : ''} sélectionné{selectedVerses.size > 1 ? 's' : ''}</span>
                    ) : (
                      `${getMiniPlayerVerses().length} verset${getMiniPlayerVerses().length > 1 ? 's' : ''}`
                    )}
                  </span>
                  <span className={`text-xs font-medium ${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {miniPlayerCurrentIndex + 1}/{getMiniPlayerVerses().length || 1}
                  </span>
                </div>
              </div>

              {/* Speed indicator */}
              {settings.playbackSpeed !== 1 && (
                <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${
                  settings.darkMode ? 'bg-primary-900/50 text-primary-400' : 'bg-primary-100 text-primary-600'
                }`}>
                  x{settings.playbackSpeed}
                </span>
              )}
            </div>
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
              {/* Toggle button for cut verse (verse starting before this portion) */}
              {cutVerse && cutVerseLines.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowCutVerse(!showCutVerse)}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                      showCutVerse
                        ? settings.darkMode ? 'bg-amber-900/30 text-amber-400 border border-amber-700' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        : settings.darkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronUp className={`w-4 h-4 transition-transform ${showCutVerse ? 'rotate-180' : ''}`} />
                    {showCutVerse ? 'Masquer le début du verset' : 'Afficher le début du verset'}
                  </button>
                </div>
              )}

              {/* Line-by-line display with tajweed */}
              <div
                className={`text-2xl md:text-3xl arabic-text ${settings.tajweedEnabled ? 'tajweed-text' : ''}`}
                style={{ fontFamily: getFontFamily() }}
              >
                {/* Cut verse lines (before portion) - shown inline when toggled */}
                {showCutVerse && cutVerseLines.map((line) => (
                  <div
                    key={`cut-line-${line.lineNumber}`}
                    className={`mushaf-line text-center mb-2 ${settings.darkMode ? 'text-amber-200' : 'text-amber-700'} opacity-80`}
                    dir="rtl"
                  >
                    {line.words.map((word, wordIdx) => (
                      <span key={`${word.verseKey}-${word.position}-cut`}>
                        {word.isEndMarker ? (
                          renderVerseMarker(word.verseNumber)
                        ) : settings.tajweedEnabled && word.tajweedHtml ? (
                          <span dangerouslySetInnerHTML={{ __html: word.tajweedHtml }} />
                        ) : (
                          word.text
                        )}
                        {wordIdx < line.words.length - 1 && !word.isEndMarker && ' '}
                      </span>
                    ))}
                  </div>
                ))}

                {/* Main portion lines */}
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
                        {word.isEndMarker ? (
                          renderVerseMarker(word.verseNumber)
                        ) : settings.tajweedEnabled && word.tajweedHtml ? (
                          <span dangerouslySetInnerHTML={{ __html: word.tajweedHtml }} />
                        ) : (
                          word.text
                        )}
                        {wordIdx < line.words.length - 1 && !word.isEndMarker && ' '}
                      </span>
                    ))}
                  </div>
                ))}

                {/* Overflow verse lines (after portion) - shown inline when toggled */}
                {showOverflowVerse && overflowLines.map((line) => (
                  <div
                    key={`overflow-line-${line.lineNumber}`}
                    className={`mushaf-line text-center mb-2 ${settings.darkMode ? 'text-amber-200' : 'text-amber-700'} opacity-80`}
                    dir="rtl"
                  >
                    {line.words.map((word, wordIdx) => (
                      <span key={`${word.verseKey}-${word.position}-overflow`}>
                        {word.isEndMarker ? (
                          renderVerseMarker(word.verseNumber)
                        ) : settings.tajweedEnabled && word.tajweedHtml ? (
                          <span dangerouslySetInnerHTML={{ __html: word.tajweedHtml }} />
                        ) : (
                          word.text
                        )}
                        {wordIdx < line.words.length - 1 && !word.isEndMarker && ' '}
                      </span>
                    ))}
                  </div>
                ))}
              </div>

              {/* Toggle button for overflow verse (verse extending beyond portion) */}
              {overflowVerse && overflowLines.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowOverflowVerse(!showOverflowVerse)}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                      showOverflowVerse
                        ? settings.darkMode ? 'bg-amber-900/30 text-amber-400 border border-amber-700' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        : settings.darkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${showOverflowVerse ? 'rotate-180' : ''}`} />
                    {showOverflowVerse ? 'Masquer la fin du verset' : 'Afficher la fin du verset'}
                  </button>
                </div>
              )}

              {/* Second page for 2-pages mode - line by line display */}
              {portionSize === '2' && secondPageLines.length > 0 && (
                <div className={`mt-6 pt-6 border-t-2 ${settings.darkMode ? 'border-slate-600' : 'border-gray-300'}`}>
                  <p className={`text-sm mb-3 font-semibold ${settings.darkMode ? 'text-primary-400' : 'text-primary-600'}`}>
                    Page {currentPage + 1}
                  </p>
                  <div
                    className={`text-2xl md:text-3xl arabic-text ${settings.tajweedEnabled ? 'tajweed-text' : ''}`}
                    style={{ fontFamily: getFontFamily() }}
                  >
                    {secondPageLines.map((line) => (
                      <div
                        key={`line2-${line.lineNumber}`}
                        className="mushaf-line text-center mb-2"
                        dir="rtl"
                      >
                        {line.words.map((word, wordIdx) => (
                          <span
                            key={`${word.verseKey}-${word.position}-p2`}
                            className={`
                              inline cursor-pointer transition-all duration-200
                              ${selectedVerses.has(word.verseKey) ? 'verse-selected' : ''}
                              ${highlightedAyah === word.verseKey ? 'verse-highlight' : ''}
                              ${settings.darkMode ? 'text-gray-100' : 'text-gray-800'}
                            `}
                            onClick={() => toggleVerseSelection(word.verseKey)}
                          >
                            {word.isEndMarker ? (
                              renderVerseMarker(word.verseNumber)
                            ) : settings.tajweedEnabled && word.tajweedHtml ? (
                              <span dangerouslySetInnerHTML={{ __html: word.tajweedHtml }} />
                            ) : (
                              word.text
                            )}
                            {wordIdx < line.words.length - 1 && !word.isEndMarker && ' '}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview of next page (only first LINE) */}
              {previewLines.length > 0 && (
                <div className={`mt-6 pt-4 border-t border-dashed ${settings.darkMode ? 'border-slate-600' : 'border-gray-300'}`}>
                  <p className={`text-xs mb-2 text-center ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Première ligne page suivante :
                  </p>
                  <div
                    className={`text-2xl md:text-3xl arabic-text ${settings.tajweedEnabled ? 'tajweed-text' : ''}`}
                    style={{ fontFamily: getFontFamily() }}
                  >
                    {previewLines.map((line) => (
                      <div
                        key={`preview-line-${line.lineNumber}`}
                        className="mushaf-line text-center mb-2 text-red-500 dark:text-red-400 opacity-70"
                        dir="rtl"
                      >
                        {line.words.map((word, wordIdx) => (
                          <span key={`${word.verseKey}-${word.position}-preview`}>
                            {word.isEndMarker ? (
                              renderVerseMarker(word.verseNumber)
                            ) : settings.tajweedEnabled && word.tajweedHtml ? (
                              <span dangerouslySetInnerHTML={{ __html: word.tajweedHtml }} />
                            ) : (
                              word.text
                            )}
                            {wordIdx < line.words.length - 1 && !word.isEndMarker && ' '}
                          </span>
                        ))}
                        <span className="text-sm mr-2">...</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Sidebar: Surah Info + Audio */}
        <div className="lg:col-span-1 space-y-4">
          {/* Current Surah Info */}
          <h3 className={`text-lg font-semibold mb-2 ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
            Sourate actuelle
          </h3>
          {currentSurah && (
            <div className={`p-4 rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center gap-4">
                {/* Numéro de sourate stylisé */}
                <div className={`w-14 h-14 rounded-xl ${settings.darkMode ? 'bg-slate-700' : 'bg-gray-100'} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-gold-500/20"></div>
                  <span className={`text-2xl font-bold ${settings.darkMode ? 'text-primary-400' : 'text-primary-600'}`} style={{ fontFamily: "'Amiri', serif" }}>
                    {settings.arabicNumerals ? toArabicNumeral(currentSurah.number) : currentSurah.number}
                  </span>
                </div>
                {/* Infos sourate */}
                <div className="flex-1">
                  <h2 className={`text-xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`} style={{ fontFamily: "'Amiri', serif" }}>
                    {currentSurah.name}
                  </h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {currentSurah.englishName}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Audio Player */}
          <h3 className={`text-lg font-semibold mb-2 ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
            Écouter l'audio
          </h3>
          <div className={`p-4 rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
            {/* Audio Mode Selection */}
            <div className={`mb-4 p-3 rounded-xl ${settings.darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <div className="flex flex-col gap-2">
                {/* Mode: Partie du jour */}
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
                  <span>Toute la partie du jour</span>
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
              playbackSpeed={settings.playbackSpeed || 1}
              onSpeedChange={(speed) => updateSettings({ playbackSpeed: speed })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}