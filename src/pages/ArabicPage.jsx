import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, Check, Languages, Youtube } from 'lucide-react'

export default function ArabicPage({ settings, updateSettings }) {
  const [arabicData, setArabicData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTranslation, setShowTranslation] = useState(false)

  // Current position
  const currentUnit = settings.arabicUnit || 1
  const currentDialogue = settings.arabicDialogue || 0

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

  // Navigation
  const goToNext = () => {
    if (currentDialogue < totalDialogues - 1) {
      updateSettings({ arabicDialogue: currentDialogue + 1 })
      setShowTranslation(false)
    } else if (currentUnit < 16) {
      updateSettings({ arabicUnit: currentUnit + 1, arabicDialogue: 0 })
      setShowTranslation(false)
    }
  }

  const goToPrevious = () => {
    if (currentDialogue > 0) {
      updateSettings({ arabicDialogue: currentDialogue - 1 })
      setShowTranslation(false)
    } else if (currentUnit > 1) {
      const prevUnit = arabicData?.units?.find(u => u.id === currentUnit - 1)
      const prevDialogueCount = prevUnit?.dialogues?.length || 1
      updateSettings({ arabicUnit: currentUnit - 1, arabicDialogue: prevDialogueCount - 1 })
      setShowTranslation(false)
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

  // Calculate progress
  const totalDialoguesAll = arabicData?.units?.reduce((acc, u) => acc + u.dialogues.length, 0) || 48
  const validatedCount = Object.keys(validatedDialogues).length
  const progressPercent = ((validatedCount / totalDialoguesAll) * 100).toFixed(1)

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
    <div className={`min-h-screen p-4 md:p-6 ${settings.darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`mb-6 p-4 rounded-xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Unit & Dialogue info */}
          <div>
            <h1 className={`text-xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
              {unit?.titleAr}
            </h1>
            <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {unit?.titleFr} - Dialogue {dialogue?.id} {dialogue?.description && `(${dialogue.description})`}
            </p>
          </div>

          {/* Progress */}
          <div className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className="font-semibold text-emerald-600">{validatedCount}</span>/{totalDialoguesAll} dialogues ({progressPercent}%)
          </div>
        </div>
      </div>

      {/* Main content: Text + YouTube */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Arabic Text */}
        <div className={`p-6 rounded-xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
          {/* Action buttons */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showTranslation
                  ? 'bg-sky-500 text-white'
                  : settings.darkMode
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Languages className="w-4 h-4" />
              Traduire
            </button>

            <button
              onClick={toggleValidation}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isValidated
                  ? 'bg-emerald-500 text-white'
                  : settings.darkMode
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Check className="w-4 h-4" />
              {isValidated ? 'Validé' : 'Valider'}
            </button>
          </div>

          {/* Dialogue lines */}
          <div className="space-y-4">
            {dialogue?.lines?.map((line, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-slate-700 pb-4 last:border-0">
                {/* Speaker */}
                <div className={`text-sm font-semibold mb-2 ${settings.darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {line.speaker}
                </div>

                {/* Arabic text */}
                <div
                  className="arabic-text text-2xl md:text-3xl mb-2"
                  style={{ fontFamily: "'Amiri', 'Amiri Quran', serif", lineHeight: 2.2 }}
                  dir="rtl"
                >
                  {line.arabic}
                </div>

                {/* French translation */}
                {showTranslation && (
                  <div className={`text-sm mt-2 ${settings.darkMode ? 'text-sky-400' : 'text-sky-600'}`} style={{ fontFamily: 'Georgia, serif' }}>
                    {line.french}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: YouTube iframe */}
        <div className={`p-6 rounded-xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-2 mb-4">
            <Youtube className={`w-5 h-5 ${settings.darkMode ? 'text-red-400' : 'text-red-600'}`} />
            <h2 className={`font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
              Video
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
              <div className="text-center">
                <Youtube className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucune vidéo configurée</p>
                <p className="text-xs mt-1">Lien YouTube à ajouter</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={goToPrevious}
          disabled={currentUnit === 1 && currentDialogue === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
            currentUnit === 1 && currentDialogue === 0
              ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-500'
              : settings.darkMode
                ? 'bg-slate-700 text-white hover:bg-slate-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          Précédent
        </button>

        {/* Dialogue selector */}
        <div className="flex items-center gap-2">
          {unit?.dialogues?.map((d, idx) => (
            <button
              key={idx}
              onClick={() => {
                updateSettings({ arabicDialogue: idx })
                setShowTranslation(false)
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                idx === currentDialogue
                  ? 'bg-emerald-500 text-white'
                  : validatedDialogues[`${currentUnit}-${idx}`]
                    ? settings.darkMode
                      ? 'bg-emerald-900 text-emerald-300'
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

        <button
          onClick={goToNext}
          disabled={currentUnit === 16 && currentDialogue === totalDialogues - 1}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
            currentUnit === 16 && currentDialogue === totalDialogues - 1
              ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-500'
              : 'bg-emerald-500 text-white hover:bg-emerald-600'
          }`}
        >
          Suivant
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
