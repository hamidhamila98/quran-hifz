import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Check, Languages, Youtube, FileText, BookOpen, ArrowLeft } from 'lucide-react'
import PdfViewer from '../components/PdfViewer'

// Arabic fonts for learning
const ARABIC_FONTS = [
  { id: 'amiri', name: 'Amiri', family: "'Amiri', serif" },
  { id: 'scheherazade', name: 'Scheherazade', family: "'Scheherazade New', serif" },
  { id: 'noto-naskh', name: 'Noto Naskh', family: "'Noto Naskh Arabic', serif" },
  { id: 'lateef', name: 'Lateef', family: "'Lateef', serif" },
]

// Map URL bookId to internal book key
const BOOK_MAP = {
  'aby-t1': { key: 'aby1', dataFile: '/arabic/ABY-T1.json', name: 'Tome 1' },
  'aby-t2': { key: 'aby2', dataFile: '/arabic/ABY-T2.json', name: 'Tome 2' },
  'aby-t3': { key: 'aby3', dataFile: '/arabic/ABY-T3.json', name: 'Tome 3' },
  'aby-t4': { key: 'aby4', dataFile: '/arabic/ABY-T4.json', name: 'Tome 4' },
}

export default function ArabicPage({ settings, updateSettings }) {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [arabicData, setArabicData] = useState(null)
  const [pdfPagesMapping, setPdfPagesMapping] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTranslation, setShowTranslation] = useState(false)
  const [selectedLineIndex, setSelectedLineIndex] = useState(null) // For individual line translation
  const [showVocabulary, setShowVocabulary] = useState(false) // For vocabulary PDF view
  const [showValidatedPopup, setShowValidatedPopup] = useState(false) // For validated lessons popup
  const [showResetConfirm, setShowResetConfirm] = useState(false) // For reset confirmation

  // Read URL params (URL is 1-based, internal state is 0-based for dialogue)
  const urlUnit = parseInt(searchParams.get('unit')) || null
  const urlDialogue = searchParams.get('dialogue') ? parseInt(searchParams.get('dialogue')) - 1 : null // Convert from 1-based URL to 0-based internal

  // Function to remove Arabic diacritics (tashkeel) but KEEP shadda
  const removeTashkeel = (text) => {
    // Remove: Fatha, Damma, Kasra, Sukun, Tanween, Superscript Alef
    // BUT KEEP: Shadda (U+0651) - شَدَّة
    // U+064B-U+0650 = Fathatan, Dammatan, Kasratan, Fatha, Damma, Kasra
    // U+0652 = Sukun
    // U+0670 = Superscript Alef
    return text.replace(/[\u064B-\u0650\u0652\u0670]/g, '')
  }

  // Get book info from URL parameter
  const bookInfo = BOOK_MAP[bookId] || BOOK_MAP['aby-t1']
  const currentBook = bookInfo.key
  const currentUnit = settings.arabicUnit || 1
  const currentDialogue = settings.arabicDialogue || 0

  // Determine which data file to load
  const getDataFile = () => {
    return bookInfo.dataFile
  }

  // Get font settings
  const getFontFamily = () => {
    const font = ARABIC_FONTS.find(f => f.id === settings.arabicLearningFont)
    return font ? font.family : "'Amiri', serif"
  }

  const getFontSize = () => {
    const size = settings.arabicLearningFontSize || 'medium'
    switch (size) {
      case 'small': return '1.25rem'
      case 'medium': return '1.5rem'
      case 'large': return '1.875rem'
      default: return '1.5rem'
    }
  }

  // Load Arabic data and PDF mapping (reload when bookId changes)
  useEffect(() => {
    setLoading(true)

    Promise.all([
      fetch(getDataFile()).then(res => res.json()),
      fetch('/arabic/aby-pages.json').then(res => res.json())
    ])
      .then(([data, pdfMapping]) => {
        setArabicData(data)
        setPdfPagesMapping(pdfMapping)

        // Initialize from URL params or reset to defaults
        const initialUnit = urlUnit || 1
        const initialDialogue = urlDialogue || 0
        updateSettings({ arabicUnit: initialUnit, arabicDialogue: initialDialogue })

        // Update URL if not already set (URL dialogue is 1-based)
        if (!searchParams.get('unit') || !searchParams.get('dialogue')) {
          setSearchParams({ unit: initialUnit, dialogue: initialDialogue + 1 }, { replace: true })
        }

        setLoading(false)
      })
      .catch(err => {
        setError('Erreur de chargement des données')
        setLoading(false)
      })
  }, [bookId])

  // Sync settings from URL when searchParams change (navigation from sidebar)
  useEffect(() => {
    if (!loading && arabicData) {
      const urlUnitValue = parseInt(searchParams.get('unit')) || 1
      const urlDialogueValue = parseInt(searchParams.get('dialogue')) || 1
      const internalDialogue = urlDialogueValue - 1 // Convert 1-based URL to 0-based internal

      // Only update if different from current settings
      if (urlUnitValue !== currentUnit || internalDialogue !== currentDialogue) {
        updateSettings({ arabicUnit: urlUnitValue, arabicDialogue: internalDialogue })
        setShowTranslation(false)
        setSelectedLineIndex(null)
      }
    }
  }, [searchParams, loading, arabicData])

  // Get PDF file and page for current lesson
  const getPdfInfo = () => {
    if (!pdfPagesMapping) return { file: null, page: 1 }
    const mapping = pdfPagesMapping[currentBook]
    if (!mapping) return { file: null, page: 1 }
    const fileName = mapping.file
    const key = `${currentUnit}-${currentDialogue}`
    const pageNum = mapping[key]
    if (!fileName || !pageNum) return { file: null, page: 1 }
    return { file: `/arabic/pdf/${fileName}`, page: pageNum }
  }

  // Get Vocabulary PDF file and page for current unit
  const getVocPdfInfo = () => {
    if (!pdfPagesMapping) return { file: null, page: 1 }
    const vocMapping = pdfPagesMapping[`${currentBook}-voc`]
    if (!vocMapping) return { file: null, page: 1 }
    const fileName = vocMapping.file
    const pageStr = vocMapping[`${currentUnit}`]
    if (!fileName || !pageStr) return { file: null, page: 1 }
    // Parse page (can be "5" or "5,7" for multiple pages - use first page)
    const firstPage = parseInt(pageStr.toString().split(',')[0])
    return { file: `/arabic/pdf/${fileName}`, page: firstPage }
  }

  // Get current unit and lesson (dialogue for tome 1, lesson for tome 2)
  const unit = arabicData?.units?.find(u => u.id === currentUnit)
  const lessons = currentBook === 'aby1' ? unit?.dialogues : unit?.lessons
  const lesson = lessons?.[currentDialogue]
  const totalLessons = lessons?.length || 0
  const isTexte = lesson?.type === 'texte' // For tome 2

  // Validation state
  const validatedDialogues = settings.arabicValidated || {}
  const dialogueKey = `${currentUnit}-${currentDialogue}`
  const isValidated = validatedDialogues[dialogueKey] === true

  // Calculate progress
  const getTotalLessonsAll = () => {
    if (!arabicData?.units) return 48
    return arabicData.units.reduce((acc, u) => {
      const lessonCount = currentBook === 'aby1' ? (u.dialogues?.length || 0) : (u.lessons?.length || 0)
      return acc + lessonCount
    }, 0)
  }
  const totalLessonsAll = getTotalLessonsAll()
  const validatedCount = Object.keys(validatedDialogues).filter(key => {
    const unitId = parseInt(key.split('-')[0])
    return arabicData?.units?.some(u => u.id === unitId)
  }).length
  const progressPercent = ((validatedCount / totalLessonsAll) * 100).toFixed(1)

  // Get list of validated lessons with details
  const getValidatedLessonsList = () => {
    if (!arabicData?.units) return []
    const list = []
    Object.keys(validatedDialogues).forEach(key => {
      const [unitId, dialogueIdx] = key.split('-').map(Number)
      const unit = arabicData.units.find(u => u.id === unitId)
      if (unit) {
        const lessons = currentBook === 'aby1' ? unit.dialogues : unit.lessons
        const lesson = lessons?.[dialogueIdx]
        if (lesson) {
          list.push({
            unitId,
            unitTitle: unit.titleFr,
            dialogueId: lesson.id,
            key
          })
        }
      }
    })
    // Sort by unit then dialogue
    return list.sort((a, b) => a.unitId - b.unitId || a.dialogueId - b.dialogueId)
  }

  // Get max unit for current book
  const maxUnit = arabicData?.units?.reduce((max, u) => Math.max(max, u.id), 0) || 16
  const minUnit = arabicData?.units?.reduce((min, u) => Math.min(min, u.id), 1) || 1

  // Navigation
  const goToNext = () => {
    if (currentDialogue < totalLessons - 1) {
      updateSettings({ arabicDialogue: currentDialogue + 1 })
      setShowTranslation(false)
      setSelectedLineIndex(null)
    } else if (currentUnit < maxUnit) {
      const nextUnitId = arabicData?.units?.find(u => u.id > currentUnit)?.id || currentUnit + 1
      updateSettings({ arabicUnit: nextUnitId, arabicDialogue: 0 })
      setShowTranslation(false)
      setSelectedLineIndex(null)
    }
  }

  const goToPrevious = () => {
    if (currentDialogue > 0) {
      updateSettings({ arabicDialogue: currentDialogue - 1 })
      setShowTranslation(false)
      setSelectedLineIndex(null)
    } else if (currentUnit > minUnit) {
      const prevUnit = arabicData?.units?.filter(u => u.id < currentUnit).pop()
      const prevLessons = currentBook === 'aby1' ? prevUnit?.dialogues : prevUnit?.lessons
      const prevLessonCount = prevLessons?.length || 1
      updateSettings({ arabicUnit: prevUnit?.id || currentUnit - 1, arabicDialogue: prevLessonCount - 1 })
      setShowTranslation(false)
      setSelectedLineIndex(null)
    }
  }

  const toggleValidation = () => {
    const newValidated = { ...validatedDialogues }
    if (isValidated) {
      delete newValidated[dialogueKey]
    } else {
      newValidated[dialogueKey] = true
    }
    updateSettings({ arabicValidated: newValidated })
  }

  const canGoPrevious = currentUnit > minUnit || currentDialogue > 0
  const canGoNext = currentUnit < maxUnit || currentDialogue < totalLessons - 1

  // Toggle line selection
  const handleLineClick = (index) => {
    if (selectedLineIndex === index) {
      setSelectedLineIndex(null)
    } else {
      setSelectedLineIndex(index)
    }
  }

  // Translate button: if a line is selected, show only that line's translation
  const handleTranslate = () => {
    setShowTranslation(!showTranslation)
  }

  // Get speaker color classes (alternates Blue/Amber by line index)
  const getSpeakerColor = (speaker, index, isTexteType) => {
    // For texte type, use a neutral color (no speaker alternation)
    if (isTexteType) {
      if (settings.darkMode) {
        return 'bg-slate-700/50 border-slate-600/50'
      }
      return 'bg-gray-50 border-gray-200'
    }
    // Simple alternation: even index = Blue, odd index = Amber
    const isEven = index % 2 === 0
    if (settings.darkMode) {
      return isEven
        ? 'bg-blue-900/50 border-blue-700/50'
        : 'bg-amber-900/50 border-amber-700/50'
    }
    return isEven
      ? 'bg-blue-100 border-blue-300'
      : 'bg-amber-100 border-amber-300'
  }

  const getSpeakerTextColor = (index, isTexteType) => {
    if (isTexteType) {
      return settings.darkMode ? 'text-emerald-400' : 'text-emerald-700'
    }
    const isEven = index % 2 === 0
    if (settings.darkMode) {
      return isEven ? 'text-blue-400' : 'text-amber-400'
    }
    return isEven ? 'text-blue-700' : 'text-amber-700'
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${settings.darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className={`mt-4 ${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Chargement...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${settings.darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className={`p-6 pb-16 ${settings.darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Progress Bar Header */}
      <div className={`mb-6 p-4 rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Back button */}
            <button
              onClick={() => navigate('/arabic')}
              className={`p-2 rounded-xl transition-colors ${
                settings.darkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title="Retour aux livres"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">ع</span>
            </div>
            <div>
              <h1 className={`text-lg font-bold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                Al-Arabiya Bayna Yadayk - {bookInfo.name}
              </h1>
              <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {arabicData?.bookName || `${totalLessonsAll} leçons`}
                {validatedCount > 0 && (
                  <> · <button
                    onClick={() => setShowValidatedPopup(true)}
                    className="font-semibold text-emerald-500 hover:text-emerald-400 hover:underline cursor-pointer"
                  >
                    {validatedCount} leçon{validatedCount > 1 ? 's' : ''} validée{validatedCount > 1 ? 's' : ''}
                  </button></>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="font-bold text-lg">{validatedCount}</span>
              <span className={`${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}> / {totalLessonsAll} leçons</span>
            </div>
            <div className={`font-semibold px-3 py-1 rounded-full ${
              settings.darkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700'
            }`}>
              {progressPercent}%
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className={`h-3 rounded-full ${settings.darkMode ? 'bg-slate-700' : 'bg-gray-200'} overflow-hidden`}>
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(parseFloat(progressPercent), 0.5)}%` }}
          />
        </div>
      </div>

      {/* Main Content - Flexible grid: Text takes more space, Video takes less */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Left: Arabic Text - 3/5 of space */}
        <div className="lg:col-span-3">
          {/* Navigation Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className={`text-lg font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                Unité {unit?.id} - {unit?.titleFr} <span className={`${settings.darkMode ? 'text-white' : 'text-gray-800'}`} dir="rtl" style={{ fontFamily: getFontFamily() }}>({unit?.titleAr})</span>
              </h3>
              {/* Type badge for tome 2 */}
              {currentBook !== 'aby1' && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isTexte
                    ? settings.darkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                    : settings.darkMode ? 'bg-sky-900/50 text-sky-300' : 'bg-sky-100 text-sky-700'
                }`}>
                  {isTexte ? 'نص' : 'حوار'}
                </span>
              )}
              {/* Checkbox Validé */}
              <button
                onClick={toggleValidation}
                className="flex items-center gap-2 cursor-pointer select-none group"
                title={isValidated ? "Marquer comme non validé" : "Marquer comme validé"}
              >
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
                  group-hover:scale-110
                  ${isValidated
                    ? 'bg-emerald-500 border-emerald-500'
                    : settings.darkMode
                      ? 'border-slate-500 bg-slate-700 hover:border-emerald-500'
                      : 'border-gray-300 bg-white hover:border-emerald-500'
                  }`}
                >
                  <Check className={`w-4 h-4 text-white transition-opacity ${isValidated ? 'opacity-100' : 'opacity-0'}`} />
                </div>
                <span className={`text-sm ${
                  isValidated
                    ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                    : settings.darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {isValidated ? 'Validé' : 'Valider'}
                </span>
              </button>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={goToPrevious}
                  disabled={!canGoPrevious}
                  title="Précédent"
                  className={`p-2 rounded-lg transition-all ${
                    canGoPrevious
                      ? settings.darkMode ? 'bg-slate-700 hover:bg-red-900/50 text-gray-200' : 'bg-gray-200 hover:bg-red-100 text-gray-700'
                      : settings.darkMode ? 'bg-slate-800 text-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goToNext}
                  disabled={!canGoNext}
                  title="Suivant"
                  className={`p-2 rounded-lg transition-all ${
                    canGoNext
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : settings.darkMode ? 'bg-slate-800 text-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>

          {/* Dialogues bar with Translate button - Sticky */}
          <div className={`mb-4 px-4 py-3 rounded-xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center flex-wrap gap-2">
                {lessons?.map((d, idx) => {
                  const isActive = idx === currentDialogue
                  const isValidatedLesson = validatedDialogues[`${currentUnit}-${idx}`]
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        updateSettings({ arabicDialogue: idx })
                        setShowTranslation(false)
                        setSelectedLineIndex(null)
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? isValidatedLesson
                            ? 'bg-emerald-500 text-white'
                            : 'bg-red-600 text-white'
                          : isValidatedLesson
                            ? settings.darkMode
                              ? 'bg-emerald-900/50 text-emerald-300 hover:bg-emerald-900/70'
                              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : settings.darkMode
                              ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isTexte ? 'Texte' : 'Dialogue'} {d.id}
                    </button>
                  )
                })}
              </div>
              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* PDF Mode Button */}
                <button
                  onClick={() => updateSettings({ pdfMode: !settings.pdfMode })}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                    settings.pdfMode
                      ? 'bg-sky-500 text-white'
                      : settings.darkMode
                        ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Mode PDF"
                >
                  <FileText className="w-4 h-4" />
                  PDF
                </button>
                {/* Vocabulary PDF Button */}
                <button
                  onClick={() => setShowVocabulary(!showVocabulary)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                    showVocabulary
                      ? 'bg-sky-500 text-white'
                      : settings.darkMode
                        ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Afficher le vocabulaire"
                >
                  <BookOpen className="w-4 h-4" />
                  Voc
                </button>
                {/* Translate Button - Only show in text mode (not PDF mode and not vocabulary) */}
                {!settings.pdfMode && !showVocabulary && (
                  <button
                    onClick={handleTranslate}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                      showTranslation
                        ? 'bg-sky-500 text-white'
                        : settings.darkMode
                          ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Languages className="w-4 h-4" />
                    Trad
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content: PDF Mode, Vocabulary PDF, or Text */}
          {settings.pdfMode || showVocabulary ? (
            <PdfViewer
              pdfFile={showVocabulary ? getVocPdfInfo().file : getPdfInfo().file}
              pageNumber={showVocabulary ? getVocPdfInfo().page : getPdfInfo().page}
              darkMode={settings.darkMode}
            />
          ) : (
            /* Lesson lines - Compact layout */
            <div className={`rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {lesson?.lines?.map((line, index) => {
                  // Separator line (empty speaker) - render as white divider
                  if (!line.speaker && !line.arabic) {
                    return (
                      <div
                        key={index}
                        className={`h-20 ${settings.darkMode ? 'bg-slate-900' : 'bg-white'}`}
                      />
                    )
                  }

                  const isSelected = selectedLineIndex === index
                  const showThisTranslation = showTranslation && (selectedLineIndex === null || selectedLineIndex === index)
                  const hideThisTashkeel = settings.hideTashkeel && (selectedLineIndex === null || selectedLineIndex === index)
                  const isFirst = index === 0
                  const isLast = index === (lesson?.lines?.length || 0) - 1
                  const displayArabic = hideThisTashkeel ? removeTashkeel(line.arabic) : line.arabic

                  return (
                    <div
                      key={index}
                      onClick={() => handleLineClick(index)}
                      className={`p-3 cursor-pointer transition-all border-l-4 ${getSpeakerColor(line.speaker, index, isTexte)} ${
                        isFirst ? 'rounded-t-2xl' : ''
                      } ${isLast ? 'rounded-b-2xl' : ''} ${
                        isSelected
                          ? settings.darkMode
                            ? 'bg-emerald-900/30 border-l-emerald-500'
                            : 'bg-emerald-50 border-l-emerald-500'
                          : 'hover:opacity-80'
                      }`}
                    >
                      {/* Arabic text with speaker name */}
                      <div
                        className={`leading-relaxed ${settings.darkMode ? 'text-gray-100' : 'text-gray-800'}`}
                        style={{
                          fontFamily: getFontFamily(),
                          fontSize: getFontSize(),
                          lineHeight: 2,
                          display: 'flex',
                          gap: '0.5em'
                        }}
                        dir="rtl"
                      >
                        {/* Speaker name (fixed width, no wrap) */}
                        {!isTexte && line.speaker && (
                          <span
                            className={`font-bold ${getSpeakerTextColor(index, isTexte)}`}
                            style={{ fontSize: '0.85em', whiteSpace: 'nowrap', flexShrink: 0 }}
                          >
                            {line.speaker}:
                          </span>
                        )}
                        {/* Arabic text (wraps and aligns properly) */}
                        <span style={{ whiteSpace: 'pre-line' }}>
                          {displayArabic}
                        </span>
                      </div>

                      {/* French translation */}
                      {showThisTranslation && (
                        <div
                          className={`mt-2 text-sm ${settings.darkMode ? 'text-sky-400' : 'text-sky-600'}`}
                          style={{ fontFamily: 'Georgia, serif' }}
                        >
                          {line.french}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right: Unit Info + YouTube iframe - 2/5 of space (40%) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Unit Info Block */}
          {unit && (
            <div className={`p-3 rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm text-center`}>
              {/* Nom de l'unité en arabe */}
              <div className="mb-2">
                <h2 className={`text-2xl font-bold mb-0.5 ${settings.darkMode ? 'text-white' : 'text-gray-800'}`} style={{ fontFamily: getFontFamily() }}>
                  {unit.titleAr}
                </h2>
                <p className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {unit.titleFr} - Unité {unit.id}
                </p>
              </div>

              {/* Position actuelle */}
              <div className={`px-2 py-1.5 rounded-lg ${settings.darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <span className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Position : </span>
                <span className={`font-semibold text-xs ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Unité {currentUnit} - Dialogue {currentDialogue + 1}
                </span>
              </div>
            </div>
          )}

          {/* Video Block */}
          <div className={`p-4 rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm sticky top-6`}>
            <div className="flex items-center gap-2 mb-3">
              <Youtube className={`w-5 h-5 ${settings.darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <h2 className={`font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                Vidéo
              </h2>
            </div>

            {lesson?.youtubeUrl ? (
              <div style={{ aspectRatio: '16/9' }}>
                <iframe
                  className="w-full h-full rounded-xl"
                  src={lesson.youtubeUrl}
                  title="Video leçon"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className={`flex items-center justify-center rounded-xl border-2 border-dashed ${
                settings.darkMode ? 'border-slate-600 text-gray-500' : 'border-gray-300 text-gray-400'
              }`} style={{ aspectRatio: '16/9' }}>
                <div className="text-center p-6">
                  <Youtube className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Aucune vidéo</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Validated Lessons Popup */}
      {showValidatedPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowValidatedPopup(false)}>
          <div
            className={`mx-4 p-6 rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col ${
              settings.darkMode ? 'bg-slate-800' : 'bg-white'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                Leçons validées ({validatedCount})
              </h3>
              <button
                onClick={() => setShowValidatedPopup(false)}
                className={`p-2 rounded-lg transition-colors ${
                  settings.darkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 space-y-2">
              {getValidatedLessonsList().map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    const [unitId, dialogueIdx] = item.key.split('-').map(Number)
                    updateSettings({ arabicUnit: unitId, arabicDialogue: dialogueIdx })
                    setShowValidatedPopup(false)
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                    settings.darkMode
                      ? 'bg-slate-700/50 hover:bg-slate-700 text-gray-200'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    settings.darkMode ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {item.unitId}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {item.unitTitle}
                    </p>
                    <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Dialogue {item.dialogueId}
                    </p>
                  </div>
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                </button>
              ))}
              {validatedCount === 0 && (
                <p className={`text-center py-8 ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Aucune leçon validée
                </p>
              )}
            </div>

            {/* Reset Progress Button */}
            {validatedCount > 0 && !showResetConfirm && (
              <button
                onClick={() => setShowResetConfirm(true)}
                className={`mt-4 w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                  settings.darkMode
                    ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                Réinitialiser ma progression
              </button>
            )}

            {/* Reset Confirmation */}
            {showResetConfirm && (
              <div className={`mt-4 p-4 rounded-xl ${settings.darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                <p className={`text-sm mb-3 ${settings.darkMode ? 'text-red-300' : 'text-red-700'}`}>
                  Êtes-vous sûr de vouloir réinitialiser toute votre progression ? Cette action est irréversible.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      updateSettings({ arabicValidated: {} })
                      setShowResetConfirm(false)
                      setShowValidatedPopup(false)
                    }}
                    className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
                  >
                    Oui, réinitialiser
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      settings.darkMode
                        ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
