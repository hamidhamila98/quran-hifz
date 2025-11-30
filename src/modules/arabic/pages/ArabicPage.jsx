import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, Check, Languages, Youtube, Type } from 'lucide-react'

// Arabic fonts for learning
const ARABIC_FONTS = [
  { id: 'amiri', name: 'Amiri', family: "'Amiri', serif" },
  { id: 'scheherazade', name: 'Scheherazade', family: "'Scheherazade New', serif" },
  { id: 'noto-naskh', name: 'Noto Naskh', family: "'Noto Naskh Arabic', serif" },
  { id: 'lateef', name: 'Lateef', family: "'Lateef', serif" },
]

export default function ArabicPage({ settings, updateSettings }) {
  const [arabicData, setArabicData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTranslation, setShowTranslation] = useState(false)
  const [hideTashkeel, setHideTashkeel] = useState(false) // Toggle to hide diacritics
  const [selectedLineIndex, setSelectedLineIndex] = useState(null) // For individual line translation

  // Function to remove Arabic diacritics (tashkeel) but KEEP shadda
  const removeTashkeel = (text) => {
    // Remove: Fatha, Damma, Kasra, Sukun, Tanween, Superscript Alef
    // BUT KEEP: Shadda (U+0651) - شَدَّة
    // U+064B-U+0650 = Fathatan, Dammatan, Kasratan, Fatha, Damma, Kasra
    // U+0652 = Sukun
    // U+0670 = Superscript Alef
    return text.replace(/[\u064B-\u0650\u0652\u0670]/g, '')
  }

  // Current position
  const currentBook = settings.arabicBook || 'aby1'
  const currentUnit = settings.arabicUnit || 1
  const currentDialogue = settings.arabicDialogue || 0

  // Determine which data file to load
  const getDataFile = () => {
    if (currentBook === 'aby2') return '/arabic/ABY-T2.json'
    if (currentBook === 'aby3') return '/arabic/ABY-T3.json'
    return '/arabic/ABY-T1.json'
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

  // Load Arabic data (reload when book changes)
  useEffect(() => {
    setLoading(true)
    fetch(getDataFile())
      .then(res => res.json())
      .then(data => {
        setArabicData(data)
        setLoading(false)
      })
      .catch(err => {
        setError('Erreur de chargement des données')
        setLoading(false)
      })
  }, [currentBook])

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

  // Get speaker color classes
  const getSpeakerColor = (speaker, index, isTexteType) => {
    // For texte type, use a neutral color (no speaker alternation)
    if (isTexteType) {
      if (settings.darkMode) {
        return 'bg-slate-700/50 border-slate-600/50'
      }
      return 'bg-gray-50 border-gray-200'
    }
    // Alternate between two colors based on speaker or index
    // Dark yellow (amber) for first speaker, dark blue for second
    const isFirstSpeaker = index % 2 === 0
    if (settings.darkMode) {
      return isFirstSpeaker
        ? 'bg-amber-900/50 border-amber-700/50'
        : 'bg-blue-900/50 border-blue-700/50'
    }
    return isFirstSpeaker
      ? 'bg-amber-100 border-amber-300'
      : 'bg-blue-100 border-blue-300'
  }

  const getSpeakerTextColor = (index, isTexteType) => {
    if (isTexteType) {
      return settings.darkMode ? 'text-emerald-400' : 'text-emerald-700'
    }
    const isFirstSpeaker = index % 2 === 0
    if (settings.darkMode) {
      return isFirstSpeaker ? 'text-amber-400' : 'text-blue-400'
    }
    return isFirstSpeaker ? 'text-amber-700' : 'text-blue-700'
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${settings.darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className={`mt-4 ${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Chargement...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${settings.darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-6 ${settings.darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Progress Bar Header */}
      <div className={`mb-6 p-4 rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">ع</span>
            </div>
            <div>
              <h1 className={`text-lg font-bold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                Ma Progression
              </h1>
              <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {arabicData?.bookName || `Al-Arabiya Bayna Yadayk - Tome ${currentBook === 'aby1' ? '1' : '2'}`}
                {validatedCount > 0 && (
                  <> · <span className="font-semibold text-emerald-500">{validatedCount} leçon{validatedCount > 1 ? 's' : ''}</span> validée{validatedCount > 1 ? 's' : ''}</>
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
              settings.darkMode ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {progressPercent}%
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className={`h-3 rounded-full ${settings.darkMode ? 'bg-slate-700' : 'bg-gray-200'} overflow-hidden`}>
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(parseFloat(progressPercent), 0.5)}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Arabic Text */}
        <div className="lg:col-span-2">
          {/* Navigation Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className={`text-lg font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                Unité {unit?.id} - {isTexte ? 'Texte' : 'Dialogue'} {lesson?.id}
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
                      ? settings.darkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
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
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : settings.darkMode ? 'bg-slate-800 text-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Tashkeel Toggle Button */}
              <button
                onClick={() => setHideTashkeel(!hideTashkeel)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  hideTashkeel
                    ? 'bg-amber-500 text-white'
                    : settings.darkMode
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={hideTashkeel ? "Afficher les diacritiques" : "Masquer les diacritiques"}
              >
                <Type className="w-4 h-4" />
                تَشْكِيل {selectedLineIndex !== null && `(${selectedLineIndex + 1})`}
              </button>

              {/* Translate Button */}
              <button
                onClick={handleTranslate}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showTranslation
                    ? 'bg-sky-500 text-white'
                    : settings.darkMode
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Languages className="w-4 h-4" />
                Traduire {selectedLineIndex !== null && `(${selectedLineIndex + 1})`}
              </button>
            </div>
          </div>

          {/* Unit/Lesson Info */}
          <div className={`mb-4 px-4 py-3 rounded-xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={`text-lg font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {unit?.titleFr}
                </p>
                {/* Show lesson title for tome 2 */}
                {lesson?.titleAr && (
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`} dir="rtl" style={{ fontFamily: getFontFamily() }}>
                    {lesson.titleAr}
                  </p>
                )}
                {lesson?.description && (
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {lesson.description}
                  </p>
                )}
              </div>
              <p className={`text-xl font-bold ${settings.darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} dir="rtl" style={{ fontFamily: getFontFamily() }}>
                {unit?.titleAr}
              </p>
            </div>
          </div>

          {/* Lesson lines - Compact layout */}
          <div className={`rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              {lesson?.lines?.map((line, index) => {
                const isSelected = selectedLineIndex === index
                const showThisTranslation = showTranslation && (selectedLineIndex === null || selectedLineIndex === index)
                const hideThisTashkeel = hideTashkeel && (selectedLineIndex === null || selectedLineIndex === index)
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
                    {/* Arabic text with speaker name inline (no speaker for texte) */}
                    <div
                      className={`leading-relaxed ${settings.darkMode ? 'text-gray-100' : 'text-gray-800'}`}
                      style={{
                        fontFamily: getFontFamily(),
                        fontSize: getFontSize(),
                        lineHeight: 2
                      }}
                      dir="rtl"
                    >
                      {/* Only show speaker for dialogue type */}
                      {!isTexte && line.speaker && (
                        <>
                          <span className={`font-bold ${getSpeakerTextColor(index, isTexte)}`} style={{ fontSize: '0.85em' }}>
                            {line.speaker}:
                          </span>
                          {' '}
                        </>
                      )}
                      {displayArabic}
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

          {/* Lesson selector */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            {lessons?.map((d, idx) => (
              <button
                key={idx}
                onClick={() => {
                  updateSettings({ arabicDialogue: idx })
                  setShowTranslation(false)
                  setSelectedLineIndex(null)
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  idx === currentDialogue
                    ? 'bg-emerald-500 text-white'
                    : validatedDialogues[`${currentUnit}-${idx}`]
                      ? settings.darkMode
                        ? 'bg-emerald-900/50 text-emerald-300'
                        : 'bg-emerald-100 text-emerald-700'
                      : settings.darkMode
                        ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d.id}
              </button>
            ))}
          </div>
        </div>

        {/* Right: YouTube iframe - Made bigger */}
        <div className={`lg:col-span-1`}>
          <div className={`p-5 rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm sticky top-6`}>
            <div className="flex items-center gap-2 mb-4">
              <Youtube className={`w-6 h-6 ${settings.darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <h2 className={`font-semibold text-lg ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                Vidéo
              </h2>
            </div>

            {lesson?.youtubeUrl ? (
              <div style={{ aspectRatio: '16/10' }}>
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
              }`} style={{ aspectRatio: '16/10' }}>
                <div className="text-center p-6">
                  <Youtube className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className={`text-base ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Aucune vidéo configurée</p>
                  <p className={`text-sm mt-1 ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Lien YouTube à ajouter</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
