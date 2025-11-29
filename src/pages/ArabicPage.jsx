import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, Check, Languages, Youtube } from 'lucide-react'

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
  const [selectedLineIndex, setSelectedLineIndex] = useState(null) // For individual line translation

  // Current position
  const currentUnit = settings.arabicUnit || 1
  const currentDialogue = settings.arabicDialogue || 0

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

  // Load Arabic data
  useEffect(() => {
    fetch('/arabic-data.json')
      .then(res => res.json())
      .then(data => {
        setArabicData(data)
        setLoading(false)
      })
      .catch(err => {
        setError('Erreur de chargement des données')
        setLoading(false)
      })
  }, [])

  // Get current unit and dialogue
  const unit = arabicData?.units?.find(u => u.id === currentUnit)
  const dialogue = unit?.dialogues?.[currentDialogue]
  const totalDialogues = unit?.dialogues?.length || 0

  // Validation state
  const validatedDialogues = settings.arabicValidated || {}
  const dialogueKey = `${currentUnit}-${currentDialogue}`
  const isValidated = validatedDialogues[dialogueKey] === true

  // Calculate progress
  const totalDialoguesAll = arabicData?.units?.reduce((acc, u) => acc + u.dialogues.length, 0) || 48
  const validatedCount = Object.keys(validatedDialogues).length
  const progressPercent = ((validatedCount / totalDialoguesAll) * 100).toFixed(1)

  // Navigation
  const goToNext = () => {
    if (currentDialogue < totalDialogues - 1) {
      updateSettings({ arabicDialogue: currentDialogue + 1 })
      setShowTranslation(false)
      setSelectedLineIndex(null)
    } else if (currentUnit < 16) {
      updateSettings({ arabicUnit: currentUnit + 1, arabicDialogue: 0 })
      setShowTranslation(false)
      setSelectedLineIndex(null)
    }
  }

  const goToPrevious = () => {
    if (currentDialogue > 0) {
      updateSettings({ arabicDialogue: currentDialogue - 1 })
      setShowTranslation(false)
      setSelectedLineIndex(null)
    } else if (currentUnit > 1) {
      const prevUnit = arabicData?.units?.find(u => u.id === currentUnit - 1)
      const prevDialogueCount = prevUnit?.dialogues?.length || 1
      updateSettings({ arabicUnit: currentUnit - 1, arabicDialogue: prevDialogueCount - 1 })
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

  const canGoPrevious = currentUnit > 1 || currentDialogue > 0
  const canGoNext = currentUnit < 16 || currentDialogue < totalDialogues - 1

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
  const getSpeakerColor = (speaker, index) => {
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

  const getSpeakerTextColor = (index) => {
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
                Al-Arabiya Bayna Yadayk - Tome 1
                {validatedCount > 0 && (
                  <> · <span className="font-semibold text-emerald-500">{validatedCount} dialogue{validatedCount > 1 ? 's' : ''}</span> validé{validatedCount > 1 ? 's' : ''}</>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="font-bold text-lg">{validatedCount}</span>
              <span className={`${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}> / {totalDialoguesAll} dialogues</span>
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
                Unité {unit?.id} - Dialogue {dialogue?.id}
              </h3>
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
              Traduire {selectedLineIndex !== null && `(ligne ${selectedLineIndex + 1})`}
            </button>
          </div>

          {/* Unit/Dialogue Info */}
          <div className={`mb-4 px-4 py-3 rounded-xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={`text-lg font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {unit?.titleFr}
                </p>
                {dialogue?.description && (
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {dialogue.description}
                  </p>
                )}
              </div>
              <p className={`text-xl font-bold ${settings.darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} dir="rtl" style={{ fontFamily: getFontFamily() }}>
                {unit?.titleAr}
              </p>
            </div>
          </div>

          {/* Dialogue lines - Compact layout */}
          <div className={`rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              {dialogue?.lines?.map((line, index) => {
                const isSelected = selectedLineIndex === index
                const showThisTranslation = showTranslation && (selectedLineIndex === null || selectedLineIndex === index)
                const isFirst = index === 0
                const isLast = index === (dialogue?.lines?.length || 0) - 1

                return (
                  <div
                    key={index}
                    onClick={() => handleLineClick(index)}
                    className={`p-3 cursor-pointer transition-all border-l-4 ${getSpeakerColor(line.speaker, index)} ${
                      isFirst ? 'rounded-t-2xl' : ''
                    } ${isLast ? 'rounded-b-2xl' : ''} ${
                      isSelected
                        ? settings.darkMode
                          ? 'bg-emerald-900/30 border-l-emerald-500'
                          : 'bg-emerald-50 border-l-emerald-500'
                        : 'hover:opacity-80'
                    }`}
                  >
                    {/* Arabic text with speaker name inline */}
                    <div
                      className={`leading-relaxed ${settings.darkMode ? 'text-gray-100' : 'text-gray-800'}`}
                      style={{
                        fontFamily: getFontFamily(),
                        fontSize: getFontSize(),
                        lineHeight: 2
                      }}
                      dir="rtl"
                    >
                      <span className={`font-bold ${getSpeakerTextColor(index)}`} style={{ fontSize: '0.85em' }}>
                        {line.speaker}:
                      </span>
                      {' '}
                      {line.arabic}
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

          {/* Dialogue selector */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            {unit?.dialogues?.map((d, idx) => (
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

        {/* Right: YouTube iframe */}
        <div className={`lg:col-span-1`}>
          <div className={`p-4 rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm sticky top-6`}>
            <div className="flex items-center gap-2 mb-4">
              <Youtube className={`w-5 h-5 ${settings.darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <h2 className={`font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                Vidéo
              </h2>
            </div>

            {dialogue?.youtubeUrl ? (
              <div className="aspect-video">
                <iframe
                  className="w-full h-full rounded-lg"
                  src={dialogue.youtubeUrl}
                  title="Video dialogue"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className={`aspect-video flex items-center justify-center rounded-lg border-2 border-dashed ${
                settings.darkMode ? 'border-slate-600 text-gray-500' : 'border-gray-300 text-gray-400'
              }`}>
                <div className="text-center p-4">
                  <Youtube className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucune vidéo configurée</p>
                  <p className="text-xs mt-1">Lien YouTube à ajouter</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
