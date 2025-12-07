import { useState, useCallback, useRef, useEffect } from 'react'
import { Shuffle, Eye, RotateCcw, Check, X, Lightbulb, Trophy, BookOpen, ChevronDown, Play, Pause } from 'lucide-react'
import { getAyahsInPageRange, SURAH_INFO, JUZ_INFO, HIZB_INFO, ARABIC_FONTS, getEveryAyahUrl, RECITERS } from '../services/quranApi'
import { loadTimingData, getVerseTimings, getCurrentWordIndex, hasTimingData, isTimingDataLoaded } from '../services/wordTiming'
import { MobileHeader } from '../../../components/sidebar'

export default function TrainingPage({ settings, isMobile, setMobileMenuOpen }) {
  // Selection mode: 'juz', 'hizb', 'surah', 'custom'
  const [selectionMode, setSelectionMode] = useState('juz')
  const [selectedJuz, setSelectedJuz] = useState(30)
  const [selectedHizb, setSelectedHizb] = useState(60)
  const [selectedSurah, setSelectedSurah] = useState(1)

  const [startPage, setStartPage] = useState(582)
  const [endPage, setEndPage] = useState(604)
  const [verseCount, setVerseCount] = useState(1)
  const [questionCount, setQuestionCount] = useState(10)
  const [hiddenRatio, setHiddenRatio] = useState('1/2') // '1/2' pour moitié, '1/3' pour tiers

  const [ayahs, setAyahs] = useState([])
  const [currentAyahs, setCurrentAyahs] = useState([])
  const [revealedVerses, setRevealedVerses] = useState([])
  const [partiallyRevealedVerses, setPartiallyRevealedVerses] = useState([]) // Pour la révélation en 2 étapes
  const [showBeginnings, setShowBeginnings] = useState(false)
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [sessionStarted, setSessionStarted] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [allRevealed, setAllRevealed] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [playingAyahIndex, setPlayingAyahIndex] = useState(null)
  const [highlightedWord, setHighlightedWord] = useState(null) // { surah, ayah, wordIndex }
  const [timingDataLoaded, setTimingDataLoaded] = useState(false)

  const audioRef = useRef(null)

  // Sync playback speed in real-time when setting changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = settings.playbackSpeed || 1
    }
  }, [settings.playbackSpeed])

  // Load timing data when reciter changes (for word-by-word highlighting)
  useEffect(() => {
    const loadTiming = async () => {
      if (hasTimingData(settings.reciter)) {
        const loaded = await loadTimingData(settings.reciter)
        setTimingDataLoaded(loaded)
      } else {
        setTimingDataLoaded(false)
      }
    }
    loadTiming()
  }, [settings.reciter])

  // Live toggle for word highlight - clear if disabled
  useEffect(() => {
    if (settings.wordHighlight === false) {
      setHighlightedWord(null)
    }
  }, [settings.wordHighlight])

  // Update pages when selection changes
  const updatePagesFromSelection = (mode, value) => {
    let pages = { start: 1, end: 604 }

    if (mode === 'juz') {
      const juz = JUZ_INFO.find(j => j.number === value)
      if (juz) pages = { start: juz.startPage, end: juz.endPage }
    } else if (mode === 'hizb') {
      const hizb = HIZB_INFO.find(h => h.number === value)
      if (hizb) pages = { start: hizb.startPage, end: hizb.endPage }
    } else if (mode === 'surah') {
      const surah = SURAH_INFO.find(s => s.number === value)
      if (surah) pages = { start: surah.startPage, end: surah.endPage }
    }

    setStartPage(pages.start)
    setEndPage(pages.end)
  }

  const handleSelectionModeChange = (mode) => {
    setSelectionMode(mode)
    if (mode === 'juz') {
      updatePagesFromSelection('juz', selectedJuz)
    } else if (mode === 'hizb') {
      updatePagesFromSelection('hizb', selectedHizb)
    } else if (mode === 'surah') {
      updatePagesFromSelection('surah', selectedSurah)
    }
  }

  const handleJuzChange = (value) => {
    setSelectedJuz(value)
    updatePagesFromSelection('juz', value)
  }

  const handleHizbChange = (value) => {
    setSelectedHizb(value)
    updatePagesFromSelection('hizb', value)
  }

  const handleSurahChange = (value) => {
    setSelectedSurah(value)
    updatePagesFromSelection('surah', value)
  }

  const getSurahName = (surahNumber) => {
    const surah = SURAH_INFO.find(s => s.number === surahNumber)
    return surah ? surah.name : ''
  }

  const loadAyahs = async () => {
    try {
      setLoading(true)
      const fetchedAyahs = await getAyahsInPageRange(startPage, endPage, settings.tajweedEnabled)
      setAyahs(fetchedAyahs)
      return fetchedAyahs
    } catch (error) {
      console.error('Error loading ayahs:', error)
      return []
    } finally {
      setLoading(false)
    }
  }

  const startSession = async () => {
    const loadedAyahs = await loadAyahs()
    if (loadedAyahs.length > 0) {
      setSessionStarted(true)
      setSessionEnded(false)
      setScore({ correct: 0, total: 0 })
      setCurrentQuestion(1)
      pickRandomAyahs(loadedAyahs)
    }
  }

  const pickRandomAyahs = useCallback((ayahList = ayahs) => {
    if (ayahList.length === 0) return

    const maxStart = Math.max(0, ayahList.length - verseCount)
    const startIndex = Math.floor(Math.random() * (maxStart + 1))
    const selectedAyahs = ayahList.slice(startIndex, startIndex + verseCount)

    setCurrentAyahs(selectedAyahs)
    setRevealedVerses([])
    setPartiallyRevealedVerses([])
    setShowBeginnings(false)
    setAllRevealed(false)
  }, [ayahs, verseCount])

  const handleRevealVerse = (index) => {
    const isFirst = index === 0

    // Pour le premier verset ou quand il n'y a qu'un verset: révélation directe
    if (isFirst || currentAyahs.length === 1) {
      if (!revealedVerses.includes(index)) {
        const newRevealed = [...revealedVerses, index]
        setRevealedVerses(newRevealed)
        if (newRevealed.length === currentAyahs.length) {
          setAllRevealed(true)
        }
      }
    } else {
      // Pour les autres versets: révélation en 2 étapes
      if (!partiallyRevealedVerses.includes(index)) {
        // Premier clic: afficher le début
        setPartiallyRevealedVerses([...partiallyRevealedVerses, index])
      } else if (!revealedVerses.includes(index)) {
        // Deuxième clic: afficher tout
        const newRevealed = [...revealedVerses, index]
        setRevealedVerses(newRevealed)
        if (newRevealed.length === currentAyahs.length) {
          setAllRevealed(true)
        }
      }
    }
  }

  const handleRevealAll = () => {
    const allIndices = currentAyahs.map((_, i) => i)
    setRevealedVerses(allIndices)
    setAllRevealed(true)
  }

  const handleAnswer = (points) => {
    // Arrêter l'audio en cours avant de passer à la question suivante
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setPlayingAyahIndex(null)

    // points: 0 = incorrect, 0.5 = partiel, 1 = correct
    const newScore = {
      correct: score.correct + points,
      total: score.total + 1
    }
    setScore(newScore)

    if (currentQuestion >= questionCount) {
      setSessionEnded(true)
    } else {
      setCurrentQuestion(prev => prev + 1)
      pickRandomAyahs()
    }
  }

  const handleReset = () => {
    // Arrêter l'audio en cours
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setPlayingAyahIndex(null)

    setSessionStarted(false)
    setSessionEnded(false)
    setCurrentAyahs([])
    setRevealedVerses([])
    setPartiallyRevealedVerses([])
    setShowBeginnings(false)
    setAllRevealed(false)
    setScore({ correct: 0, total: 0 })
    setCurrentQuestion(1)
  }

  const splitAyahText = (text, ratio = hiddenRatio) => {
    if (!text) return { visible: '', hidden: '', visibleCount: 0 }
    // On utilise le texte brut pour calculer le point de split
    const plainText = getPlainText(text)
    const words = plainText.split(' ')
    // Ratio: '1/2' = moitié visible (moitié cachée), '2/3' = un tiers visible (deux tiers cachés)
    const visibleRatio = ratio === '2/3' ? 1/3 : 1/2
    const splitPoint = Math.ceil(words.length * visibleRatio)
    return {
      visible: words.slice(0, splitPoint).join(' '),
      hidden: words.slice(splitPoint).join(' '),
      visibleCount: splitPoint
    }
  }

  const getFirstWords = (text, count = 2) => {
    if (!text) return ''
    // Pour le tajweed, on doit gérer le HTML
    const cleanText = text.replace(/<[^>]*>/g, '')
    const words = cleanText.split(' ')
    return words.slice(0, count).join(' ')
  }

  // Helper to get first N words while preserving HTML/tajweed
  const getHtmlForFirstWords = (html, wordCount) => {
    if (!html || !wordCount) return ''
    // Remove end markers
    const cleanHtml = html.replace(/<span class=end>.*?<\/span>/g, '')
    // Get plain text to count words
    const plainText = cleanHtml.replace(/<[^>]*>/g, '')
    const words = plainText.split(/\s+/).filter(w => w.length > 0)
    if (words.length <= wordCount) return cleanHtml

    // Find position of Nth word in original text and extract with HTML
    let result = ''
    let wordsSeen = 0
    let i = 0
    let inWord = false

    while (i < cleanHtml.length && wordsSeen < wordCount) {
      if (cleanHtml[i] === '<') {
        // Include HTML tag
        const tagEnd = cleanHtml.indexOf('>', i)
        result += cleanHtml.substring(i, tagEnd + 1)
        i = tagEnd + 1
      } else if (/\s/.test(cleanHtml[i])) {
        if (inWord) {
          wordsSeen++
          inWord = false
        }
        if (wordsSeen < wordCount) {
          result += cleanHtml[i]
        }
        i++
      } else {
        inWord = true
        result += cleanHtml[i]
        i++
      }
    }
    return result
  }

  // Fonction pour extraire le texte brut (sans HTML du tajweed)
  const getPlainText = (text) => {
    if (!text) return ''
    return text.replace(/<[^>]*>/g, '')
  }

  // Fonction pour rendre le texte (avec ou sans tajweed)
  const renderText = (text) => {
    if (settings.tajweedEnabled) {
      // Nettoyer les balises end du tajweed
      const cleanedText = text.replace(/<span class=end>.*?<\/span>/g, '')
      return <span dangerouslySetInnerHTML={{ __html: cleanedText }} />
    }
    return text
  }

  // Parse tajweed HTML into words while preserving HTML tags
  const parseTajweedWords = (html) => {
    if (!html) return []

    // Remove end markers first
    const cleanHtml = html.replace(/<span class=end>.*?<\/span>/g, '')

    // Split by spaces but keep track of HTML tags
    const words = []
    let currentWord = ''
    let inTag = false
    let tagDepth = 0

    for (let i = 0; i < cleanHtml.length; i++) {
      const char = cleanHtml[i]

      if (char === '<') {
        inTag = true
        if (cleanHtml[i + 1] !== '/') tagDepth++
        else tagDepth--
        currentWord += char
      } else if (char === '>') {
        inTag = false
        currentWord += char
      } else if (char === ' ' && !inTag && tagDepth === 0) {
        if (currentWord.trim()) {
          words.push(currentWord)
        }
        currentWord = ''
      } else {
        currentWord += char
      }
    }

    if (currentWord.trim()) {
      words.push(currentWord)
    }

    return words
  }

  // Render text with word-by-word highlighting
  const renderTextWithWordHighlight = (ayah, index) => {
    const surahNumber = ayah.surah?.number || 1
    const ayahNumber = ayah.numberInSurah || 1

    // Check if this verse should have word highlighting
    const isPlaying = playingAyahIndex === index
    const shouldHighlight = settings.wordHighlight && isPlaying && highlightedWord &&
      highlightedWord.surah === surahNumber && highlightedWord.ayah === ayahNumber

    // Use tajweed HTML if enabled, otherwise plain text
    if (settings.tajweedEnabled) {
      const tajweedWords = parseTajweedWords(ayah.text)
      return tajweedWords.map((wordHtml, wordIndex) => {
        const isHighlighted = shouldHighlight && wordIndex === highlightedWord?.wordIndex
        return (
          <span
            key={wordIndex}
            className={isHighlighted ? 'word-highlight' : ''}
          >
            <span
              className={isHighlighted ? 'word-highlight-inner' : ''}
              dangerouslySetInnerHTML={{ __html: wordHtml }}
            />
            {wordIndex < tajweedWords.length - 1 ? ' ' : ''}
          </span>
        )
      })
    } else {
      const plainText = getPlainText(ayah.text)
      const words = plainText.split(' ')
      return words.map((word, wordIndex) => {
        const isHighlighted = shouldHighlight && wordIndex === highlightedWord?.wordIndex
        return (
          <span
            key={wordIndex}
            className={isHighlighted ? 'word-highlight' : ''}
          >
            {word}
            {wordIndex < words.length - 1 ? ' ' : ''}
          </span>
        )
      })
    }
  }

  // Get font family from settings
  const getFontFamily = () => {
    const font = ARABIC_FONTS.find(f => f.id === settings.arabicFont)
    return font ? font.family : "'Amiri Quran', 'Amiri', serif"
  }

  // Convert to Arabic-Indic numerals for proper rendering inside ۝ symbol
  const toArabicNumerals = (num) => {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
    return String(num).split('').map(d => arabicDigits[parseInt(d)]).join('')
  }

  // Render verse end marker with number (Quran style) - identique à HomePage
  const renderVerseMarker = (number) => {
    return (
      <span className="verse-marker-styled">
        <span className="marker-symbol">{'\u06DD'}</span>
        <span className={`marker-number ${settings.arabicNumerals ? 'marker-number-arabic' : 'marker-number-western'}`}>
          {settings.arabicNumerals ? toArabicNumerals(number) : number}
        </span>
      </span>
    )
  }

  // Stop audio playback
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setPlayingAyahIndex(null)
    setHighlightedWord(null)
  }

  // Play/Pause audio for a specific ayah
  const toggleAyahAudio = (ayah, index) => {
    if (!audioRef.current) return

    // Si on clique sur le même verset en cours de lecture, on met en pause
    if (playingAyahIndex === index) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err)
          setPlayingAyahIndex(null)
          setHighlightedWord(null)
        })
      } else {
        audioRef.current.pause()
        setPlayingAyahIndex(null)
        setHighlightedWord(null)
      }
      return
    }

    // Si un autre verset est en cours, on l'arrête d'abord
    if (playingAyahIndex !== null) {
      audioRef.current.pause()
      setHighlightedWord(null)
    }

    const reciter = RECITERS.find(r => r.id === settings.reciter) || RECITERS[0]
    const surahNumber = ayah.surah?.number || 1
    const ayahNumber = ayah.numberInSurah || 1
    const audioUrl = getEveryAyahUrl(surahNumber, ayahNumber, reciter.everyAyahId)

    audioRef.current.src = audioUrl
    audioRef.current.playbackRate = settings.playbackSpeed || 1
    setPlayingAyahIndex(index)
    audioRef.current.play().catch(err => {
      console.error('Error playing audio:', err)
      setPlayingAyahIndex(null)
    })
  }

  const handleAudioEnded = () => {
    setPlayingAyahIndex(null)
    setHighlightedWord(null)
  }

  // Handle audio time update for word-by-word highlighting
  const handleAudioTimeUpdate = () => {
    if (!audioRef.current || playingAyahIndex === null || !settings.wordHighlight) {
      return
    }

    const ayah = currentAyahs[playingAyahIndex]
    if (!ayah) return

    const surahNumber = ayah.surah?.number || 1
    const ayahNumber = ayah.numberInSurah || 1

    // Get timing segments for this verse
    const segments = getVerseTimings(settings.reciter, surahNumber, ayahNumber)
    if (!segments) return

    // Get current word index based on playback time (in milliseconds)
    const currentTimeMs = audioRef.current.currentTime * 1000
    const wordIndex = getCurrentWordIndex(segments, currentTimeMs)

    if (wordIndex >= 0) {
      setHighlightedWord({
        surah: surahNumber,
        ayah: ayahNumber,
        wordIndex
      })
    }
  }

  const getScoreMessage = () => {
    const percentage = Math.round((score.correct / score.total) * 100)
    if (percentage === 100) return { emoji: '🏆', message: 'Parfait ! Ma sha Allah, aucune erreur !' }
    if (percentage >= 75) return { emoji: '⭐', message: 'Excellent travail ! Continue comme ça !' }
    if (percentage >= 50) return { emoji: '💪', message: 'Bien ! Quelques révisions et ce sera parfait.' }
    if (percentage >= 25) return { emoji: '📖', message: 'Continue à réviser, tu progresses !' }
    return { emoji: '🤲', message: 'Ne te décourage pas, la persévérance est la clé !' }
  }

  // End Screen
  if (sessionEnded) {
    const { emoji, message } = getScoreMessage()
    const percentage = Math.round((score.correct / score.total) * 100)

    return (
      <div className={`p-6 pb-16 ${settings.darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className={`max-w-md mx-auto mt-12 p-8 rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg text-center`}>
          <div className="text-6xl mb-4">{emoji}</div>
          <h2 className={`text-2xl font-bold mb-2 ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
            Session terminée !
          </h2>
          <p className={`mb-6 ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{message}</p>

          <div className={`p-6 rounded-xl mb-6 ${settings.darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <div className="flex justify-center gap-8 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">{score.correct}</p>
                <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Correct</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-500">{score.total - score.correct}</p>
                <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Incorrect</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-4 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className={`text-xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
              {percentage}% <span className={`text-base font-medium ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>({(percentage / 5).toFixed(1)}/20)</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl ${
                settings.darkMode
                  ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <RotateCcw className="w-5 h-5" />
              Nouvelle session
            </button>
            <button
              onClick={startSession}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl"
            >
              <Shuffle className="w-5 h-5" />
              Recommencer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`pb-16 ${settings.darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Mobile Header */}
      <MobileHeader
        title="MyHifz"
        icon="📖"
        gradientFrom="from-sky-500"
        gradientTo="to-sky-700"
        darkMode={settings.darkMode}
        onMenuClick={() => setMobileMenuOpen && setMobileMenuOpen(true)}
      />

      <div className="p-4 md:p-6">
      <header className="mb-6 md:mb-8">
        <h1 className={`text-2xl md:text-3xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
          Entraînement
        </h1>
        <p className={`mt-2 text-sm md:text-base ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Testez votre mémorisation
        </p>
      </header>

      {!sessionStarted ? (
        <div className={`max-w-xl mx-auto p-6 rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-xl font-semibold mb-6 ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
            Configurer l'entraînement
          </h2>

          <div className="space-y-6">
            {/* Selection Mode Tabs */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Sélection rapide
              </label>
              <div className={`flex rounded-xl overflow-hidden border ${settings.darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                {[
                  { id: 'juz', label: 'Juz' },
                  { id: 'hizb', label: 'Hizb' },
                  { id: 'surah', label: 'Sourate' },
                  { id: 'custom', label: 'Pages' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectionModeChange(tab.id)}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      selectionMode === tab.id
                        ? 'bg-primary-500 text-white'
                        : settings.darkMode
                          ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Selection Dropdown */}
            {selectionMode === 'juz' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Choisir un Juz
                </label>
                <div className="relative">
                  <select
                    value={selectedJuz}
                    onChange={(e) => handleJuzChange(parseInt(e.target.value))}
                    className={`w-full px-4 py-3 rounded-xl border appearance-none cursor-pointer ${
                      settings.darkMode
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-800'
                    } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  >
                    {JUZ_INFO.map((juz) => (
                      <option key={juz.number} value={juz.number}>
                        {juz.englishName} - {juz.name} (p.{juz.startPage}-{juz.endPage})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
              </div>
            )}

            {selectionMode === 'hizb' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Choisir un Hizb
                </label>
                <div className="relative">
                  <select
                    value={selectedHizb}
                    onChange={(e) => handleHizbChange(parseInt(e.target.value))}
                    className={`w-full px-4 py-3 rounded-xl border appearance-none cursor-pointer ${
                      settings.darkMode
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-800'
                    } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  >
                    {HIZB_INFO.map((hizb) => (
                      <option key={hizb.number} value={hizb.number}>
                        {hizb.englishName} (Juz {hizb.juz}) - p.{hizb.startPage}-{hizb.endPage}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
              </div>
            )}

            {selectionMode === 'surah' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Choisir une Sourate
                </label>
                <div className="relative">
                  <select
                    value={selectedSurah}
                    onChange={(e) => handleSurahChange(parseInt(e.target.value))}
                    className={`w-full px-4 py-3 rounded-xl border appearance-none cursor-pointer ${
                      settings.darkMode
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-800'
                    } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  >
                    {SURAH_INFO.map((surah) => (
                      <option key={surah.number} value={surah.number}>
                        {surah.number}. {surah.englishName} - {surah.name} ({surah.ayahCount} versets)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
              </div>
            )}

            {/* Page Range (only visible for custom/Pages mode) */}
            {selectionMode === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Page de début
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="604"
                    value={startPage}
                    onChange={(e) => {
                      setStartPage(Math.max(1, Math.min(604, parseInt(e.target.value) || 1)))
                    }}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      settings.darkMode
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-800'
                    } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Page de fin
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="604"
                    value={endPage}
                    onChange={(e) => {
                      setEndPage(Math.max(startPage, Math.min(604, parseInt(e.target.value) || 1)))
                    }}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      settings.darkMode
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-800'
                    } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  />
                </div>
              </div>
            )}

            {/* Question Count */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Nombre de questions
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuestionCount(num)}
                    className={`py-2 rounded-xl font-medium transition-all text-sm ${
                      questionCount === num && ![5, 10, 15, 20].includes(questionCount) === false
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                        : settings.darkMode
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <input
                  type="number"
                  min="1"
                  max="500"
                  placeholder="Autre"
                  value={![5, 10, 15, 20].includes(questionCount) ? questionCount : ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 5
                    setQuestionCount(Math.max(1, Math.min(500, val)))
                  }}
                  className={`px-2 py-2 rounded-xl border text-center text-sm ${
                    ![5, 10, 15, 20].includes(questionCount)
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-primary-500'
                      : settings.darkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                        : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            {/* Verse Count */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Versets par question
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setVerseCount(num)}
                    className={`py-2 rounded-xl font-medium transition-all text-sm ${
                      verseCount === num
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                        : settings.darkMode
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className={`mt-2 text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {verseCount === 1
                  ? `${hiddenRatio === '1/2' ? 'La moitié' : 'Les 2 tiers'} du verset ${hiddenRatio === '1/2' ? 'sera cachée' : 'seront cachés'}`
                  : verseCount === 2
                    ? `Le 1er verset sera ${hiddenRatio === '1/2' ? 'à moitié' : 'aux 2/3'} caché, le suivant sera complètement caché`
                    : `Le 1er verset sera ${hiddenRatio === '1/2' ? 'à moitié' : 'aux 2/3'} caché, les ${verseCount - 1} suivants seront complètement cachés`
                }
              </p>
            </div>

            {/* Hidden Ratio Option */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Partie cachée
              </label>
              <div className="flex gap-2">
                {[
                  { id: '1/2', label: 'Moitié' },
                  { id: '2/3', label: '2 tiers' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setHiddenRatio(option.id)}
                    className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                      hiddenRatio === option.id
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                        : settings.darkMode
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className={`mt-2 text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {hiddenRatio === '1/2'
                  ? 'La moitié du verset sera cachée'
                  : 'Les 2 tiers du verset seront cachés (plus difficile)'
                }
              </p>
            </div>

            {/* Start Button */}
            <button
              onClick={startSession}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <Shuffle className="w-5 h-5" />
                  Commencer ({questionCount} questions)
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Training Session */
        <div className="max-w-3xl mx-auto">
          {/* Progress & Score */}
          <div className={`mb-6 p-4 rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-medium ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Question {currentQuestion} / {questionCount}
              </span>
              <button
                onClick={handleReset}
                className={`p-2 rounded-lg ${
                  settings.darkMode
                    ? 'hover:bg-slate-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
                style={{ width: `${(currentQuestion / questionCount) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xl font-bold text-green-500">{score.correct}</p>
                <p className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Correct</p>
              </div>
              <div className={`w-px h-6 ${settings.darkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
              <div className="text-center">
                <p className={`text-xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>{score.total}</p>
                <p className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
              </div>
              <div className={`w-px h-6 ${settings.darkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
              <div className="text-center">
                <p className="text-xl font-bold text-gold-500">
                  {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
                </p>
                <p className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Score</p>
              </div>
            </div>
          </div>

          {/* Verses Display */}
          {currentAyahs.length > 0 && (
            <div className={`p-6 rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
              {/* Hidden audio element */}
              <audio ref={audioRef} onEnded={handleAudioEnded} onTimeUpdate={handleAudioTimeUpdate} />

              {/* Header Info with Page Number */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {getSurahName(currentAyahs[0].surah.number)} - Versets {currentAyahs[0].numberInSurah}
                    {currentAyahs.length > 1 && ` à ${currentAyahs[currentAyahs.length - 1].numberInSurah}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm px-3 py-1 rounded-lg ${settings.darkMode ? 'bg-primary-900/50 text-primary-300' : 'bg-primary-50 text-primary-600'}`}>
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    {(() => {
                      const pages = [...new Set(currentAyahs.map(a => a.page))].sort((a, b) => a - b)
                      if (pages.length === 1) {
                        return `Page ${pages[0]}`
                      } else {
                        return `Pages ${pages[0]}-${pages[pages.length - 1]}`
                      }
                    })()}
                  </span>
                  <span className={`text-sm px-2 py-1 rounded-lg ${settings.darkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    {currentAyahs.length} verset{currentAyahs.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Verses */}
              <div className={`space-y-6 ${settings.tajweedEnabled ? 'tajweed-text' : ''}`} style={{ fontFamily: getFontFamily() }}>
                {currentAyahs.map((ayah, index) => {
                  const isFirst = index === 0
                  const isRevealed = revealedVerses.includes(index)
                  const isPartiallyRevealed = partiallyRevealedVerses.includes(index)
                  const plainText = getPlainText(ayah.text)
                  const { visible, hidden } = splitAyahText(ayah.text)
                  // Pour la révélation partielle (1er clic sur verset non-premier)
                  const plainWords = plainText.split(' ')
                  const partialWords = Math.ceil(plainWords.length / 3)
                  const partialVisible = plainWords.slice(0, partialWords).join(' ')
                  const partialHidden = plainWords.slice(partialWords).join(' ')

                  // Check if this verse is currently playing and verse highlight is enabled
                  const isVersePlaying = playingAyahIndex === index && settings.verseHighlight !== false

                  return (
                    <div
                      key={ayah.number}
                      className={`p-4 rounded-xl ${settings.darkMode ? 'bg-slate-700/50' : 'bg-gray-50'} flex items-start gap-3 transition-all ${isVersePlaying ? 'verse-playing' : ''}`}
                    >
                      {/* Play/Pause button */}
                      <button
                        onClick={() => toggleAyahAudio(ayah, index)}
                        className={`flex-shrink-0 p-2 rounded-full transition-colors ${
                          playingAyahIndex === index
                            ? 'bg-primary-500 text-white'
                            : settings.darkMode
                              ? 'bg-slate-600 hover:bg-slate-500 text-gray-300'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                        }`}
                        title={playingAyahIndex === index ? "Mettre en pause" : "Écouter ce verset"}
                      >
                        {playingAyahIndex === index ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>

                      {isFirst || currentAyahs.length === 1 ? (
                        // Premier verset ou verset unique: révélation directe
                        <div className={`arabic-text text-2xl md:text-3xl flex-1 font-size-${settings.fontSize || 'medium'} line-height-${settings.lineHeight || 'normal'}`} dir="rtl" style={{ fontFamily: getFontFamily() }}>
                          {isRevealed ? (
                            // Révélé: afficher tout le verset avec surlignage des mots si actif
                            <span className={settings.darkMode ? 'text-white' : 'text-gray-800'}>
                              {playingAyahIndex === index && settings.wordHighlight && timingDataLoaded
                                ? renderTextWithWordHighlight(ayah, index)
                                : renderText(ayah.text)}
                            </span>
                          ) : (
                            // Non révélé: partie visible (avec tajweed si activé) + partie cachée
                            <>
                              <span className={settings.darkMode ? 'text-white' : 'text-gray-800'}>
                                {settings.tajweedEnabled ? (
                                  <span dangerouslySetInnerHTML={{ __html: getHtmlForFirstWords(ayah.text, splitAyahText(ayah.text).visibleCount) }} />
                                ) : (
                                  visible
                                )}
                              </span>
                              <span className="text-primary-500 mx-2">...</span>
                              <span
                                className={`transition-all duration-300 cursor-pointer verse-hidden ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}
                                onClick={() => handleRevealVerse(index)}
                              >
                                {hidden}
                              </span>
                            </>
                          )}
                          {renderVerseMarker(ayah.numberInSurah)}
                        </div>
                      ) : (
                        // Autres versets: révélation en 2 étapes
                        <div className={`arabic-text text-2xl md:text-3xl flex-1 font-size-${settings.fontSize || 'medium'} line-height-${settings.lineHeight || 'normal'}`} dir="rtl" style={{ fontFamily: getFontFamily() }}>
                          {isRevealed ? (
                            // Complètement révélé - avec surlignage des mots si actif
                            <span className={settings.darkMode ? 'text-white' : 'text-gray-800'}>
                              {playingAyahIndex === index && settings.wordHighlight && timingDataLoaded
                                ? renderTextWithWordHighlight(ayah, index)
                                : renderText(ayah.text)}
                            </span>
                          ) : isPartiallyRevealed ? (
                            // Partiellement révélé (1er clic effectué) - affiche juste les 2 premiers mots
                            <>
                              <span className={settings.darkMode ? 'text-white' : 'text-gray-800'}>
                                {settings.tajweedEnabled ? (
                                  <span dangerouslySetInnerHTML={{ __html: getHtmlForFirstWords(ayah.text, 2) }} />
                                ) : (
                                  getFirstWords(ayah.text, 2)
                                )}
                              </span>
                              <span className="text-primary-500 mx-2">...</span>
                              <span
                                className={`transition-all duration-300 cursor-pointer verse-hidden ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}
                                onClick={() => handleRevealVerse(index)}
                              >
                                {plainWords.slice(2).join(' ')}
                              </span>
                            </>
                          ) : (
                            // Pas encore révélé
                            <>
                              {showBeginnings && (
                                <span className={settings.darkMode ? 'text-white' : 'text-gray-800'}>
                                  {settings.tajweedEnabled ? (
                                    <span dangerouslySetInnerHTML={{ __html: getHtmlForFirstWords(ayah.text, 2) }} />
                                  ) : (
                                    getFirstWords(ayah.text)
                                  )}
                                  <span className="text-primary-500 mx-2">...</span>
                                </span>
                              )}
                              <span
                                className={`transition-all duration-300 cursor-pointer verse-hidden ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}
                                onClick={() => handleRevealVerse(index)}
                              >
                                {showBeginnings
                                  ? plainWords.slice(2).join(' ')
                                  : plainText
                                }
                              </span>
                            </>
                          )}
                          {renderVerseMarker(ayah.numberInSurah)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 justify-center mt-6">
                {!allRevealed ? (
                  <>
                    {currentAyahs.length > 1 && !showBeginnings && (
                      <button
                        onClick={() => setShowBeginnings(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                          settings.darkMode
                            ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <Lightbulb className="w-4 h-4" />
                        Afficher début des versets
                      </button>
                    )}
                    <button
                      onClick={handleRevealAll}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700"
                    >
                      <Eye className="w-4 h-4" />
                      Tout révéler
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleAnswer(0)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                    >
                      <X className="w-4 h-4" />
                      Incorrect
                    </button>
                    <button
                      onClick={() => handleAnswer(0.5)}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                    >
                      <span className="w-4 h-4 text-sm font-bold">½</span>
                      Partiel
                    </button>
                    <button
                      onClick={() => handleAnswer(1)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                    >
                      <Check className="w-4 h-4" />
                      Correct
                    </button>
                  </>
                )}
              </div>

              {!allRevealed && (
                <p className={`text-center mt-4 text-sm ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Cliquez sur les parties floutées pour les révéler une par une
                </p>
              )}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  )
}
