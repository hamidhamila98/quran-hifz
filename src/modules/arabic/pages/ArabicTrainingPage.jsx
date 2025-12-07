import { useState } from 'react'
import { Shuffle, Eye, RotateCcw, Check, X, ChevronDown, BookOpen, Brain } from 'lucide-react'
import { MobileHeader } from '../../../components/sidebar'

// Placeholder - sera remplacé par les vraies données de vocabulaire
const PLACEHOLDER_VOCAB = []

export default function ArabicTrainingPage({ settings, updateSettings, isMobile, setMobileMenuOpen }) {
  const darkMode = settings.darkMode

  // Configuration states
  const [selectionMode, setSelectionMode] = useState('book') // 'book', 'unit', 'custom'
  const [selectedBook, setSelectedBook] = useState('aby1')
  const [selectedUnit, setSelectedUnit] = useState(1)
  const [questionCount, setQuestionCount] = useState(10)
  const [wordCount, setWordCount] = useState(1) // 1 mot ou plusieurs
  const [displayMode, setDisplayMode] = useState('arabic') // 'arabic', 'french', 'random'

  // Session states
  const [sessionStarted, setSessionStarted] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [currentWords, setCurrentWords] = useState([])
  const [revealed, setRevealed] = useState(false)

  // Font family helper
  const getFontFamily = () => {
    const fonts = {
      'amiri': "'Amiri', serif",
      'scheherazade': "'Scheherazade New', serif",
      'noto-naskh': "'Noto Naskh Arabic', serif",
      'lateef': "'Lateef', serif",
    }
    return fonts[settings.arabicLearningFont] || fonts.amiri
  }

  const getFontSize = () => {
    const sizes = {
      'small': 'text-xl md:text-2xl',
      'medium': 'text-2xl md:text-3xl',
      'large': 'text-3xl md:text-4xl',
    }
    return sizes[settings.arabicLearningFontSize] || sizes.medium
  }

  const startSession = () => {
    // TODO: Charger les données de vocabulaire selon la sélection
    // Pour l'instant, afficher un message d'attente
    setSessionStarted(true)
    setSessionEnded(false)
    setScore({ correct: 0, total: 0 })
    setCurrentQuestion(1)
    setRevealed(false)
  }

  const handleReveal = () => {
    setRevealed(true)
  }

  const handleAnswer = (points) => {
    const newScore = {
      correct: score.correct + points,
      total: score.total + 1
    }
    setScore(newScore)

    if (currentQuestion >= questionCount) {
      setSessionEnded(true)
    } else {
      setCurrentQuestion(prev => prev + 1)
      setRevealed(false)
      // TODO: Charger le prochain mot
    }
  }

  const handleReset = () => {
    setSessionStarted(false)
    setSessionEnded(false)
    setCurrentWords([])
    setRevealed(false)
    setScore({ correct: 0, total: 0 })
    setCurrentQuestion(1)
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
      <div className={`p-6 pb-16 ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className={`max-w-md mx-auto mt-12 p-8 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg text-center`}>
          <div className="text-6xl mb-4">{emoji}</div>
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Session terminée !
          </h2>
          <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{message}</p>

          <div className={`p-6 rounded-xl mb-6 ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <div className="flex justify-center gap-8 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">{score.correct}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Correct</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-500">{score.total - score.correct}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Incorrect</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-gradient-to-r from-red-600 to-red-700 h-4 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {percentage}% <span className={`text-base font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>({(percentage / 5).toFixed(1)}/20)</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl ${
                darkMode
                  ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <RotateCcw className="w-5 h-5" />
              Nouvelle session
            </button>
            <button
              onClick={startSession}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl"
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
    <div className={`pb-16 ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Mobile Header */}
      <MobileHeader
        title="MyArabic"
        icon="ع"
        gradientFrom="from-red-500"
        gradientTo="to-red-700"
        darkMode={darkMode}
        onMenuClick={() => setMobileMenuOpen && setMobileMenuOpen(true)}
      />

      <div className="p-4 md:p-6">
      <header className="mb-6 md:mb-8">
        <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Entraînement Vocabulaire
        </h1>
        <p className={`mt-2 text-sm md:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Testez votre vocabulaire arabe
        </p>
      </header>

      {!sessionStarted ? (
        <div className={`max-w-xl mx-auto p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Configurer l'entraînement
          </h2>

          <div className="space-y-6">
            {/* Selection Mode Tabs */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Sélection
              </label>
              <div className={`flex rounded-xl overflow-hidden border ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                {[
                  { id: 'book', label: 'Livre' },
                  { id: 'unit', label: 'Unité' },
                  { id: 'custom', label: 'Personnalisé' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectionMode(tab.id)}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      selectionMode === tab.id
                        ? 'bg-red-600 text-white'
                        : darkMode
                          ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Book Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Choisir un livre
              </label>
              <div className="relative">
                <select
                  value={selectedBook}
                  onChange={(e) => setSelectedBook(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border appearance-none cursor-pointer ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-800'
                  } focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                >
                  <option value="aby1">Al-Arabiya Bayna Yadayk - Tome 1</option>
                  <option value="aby2">Al-Arabiya Bayna Yadayk - Tome 2</option>
                  <option value="aby3">Al-Arabiya Bayna Yadayk - Tome 3</option>
                </select>
                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            </div>

            {/* Display Mode */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Mode d'affichage
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'arabic', label: 'Arabe → FR' },
                  { id: 'french', label: 'FR → Arabe' },
                  { id: 'random', label: 'Aléatoire' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setDisplayMode(mode.id)}
                    className={`py-2 rounded-xl font-medium transition-all text-sm ${
                      displayMode === mode.id
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : darkMode
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {displayMode === 'arabic' && "On affiche l'arabe, tu dois donner la traduction"}
                {displayMode === 'french' && "On affiche le français, tu dois donner l'arabe"}
                {displayMode === 'random' && "Le sens de traduction est aléatoire à chaque question"}
              </p>
            </div>

            {/* Question Count */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Nombre de questions
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuestionCount(num)}
                    className={`py-2 rounded-xl font-medium transition-all text-sm ${
                      questionCount === num
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : darkMode
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
                  max="100"
                  placeholder="Autre"
                  value={![5, 10, 15, 20].includes(questionCount) ? questionCount : ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 5
                    setQuestionCount(Math.max(1, Math.min(100, val)))
                  }}
                  className={`px-2 py-2 rounded-xl border text-center text-sm ${
                    ![5, 10, 15, 20].includes(questionCount)
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500'
                      : darkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                        : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            {/* Word Count per Question */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Mots par question
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setWordCount(num)}
                    className={`py-2 rounded-xl font-medium transition-all text-sm ${
                      wordCount === num
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : darkMode
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Coming Soon Notice */}
            <div className={`p-4 rounded-xl border-2 border-dashed ${darkMode ? 'border-red-700 bg-red-900/20' : 'border-red-300 bg-red-50'}`}>
              <div className="flex items-center gap-3">
                <Brain className={`w-8 h-8 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                <div>
                  <p className={`font-medium ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                    Données vocabulaire en attente
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-red-400/70' : 'text-red-600/70'}`}>
                    Les fichiers JSON de vocabulaire seront ajoutés prochainement
                  </p>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startSession}
              disabled={true}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Shuffle className="w-5 h-5" />
              Commencer ({questionCount} questions)
            </button>
          </div>
        </div>
      ) : (
        /* Training Session - Will be populated when vocab data is available */
        <div className="max-w-3xl mx-auto">
          {/* Progress & Score */}
          <div className={`mb-6 p-4 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Question {currentQuestion} / {questionCount}
              </span>
              <button
                onClick={handleReset}
                className={`p-2 rounded-lg ${
                  darkMode
                    ? 'hover:bg-slate-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div
                className="bg-gradient-to-r from-red-600 to-red-700 h-2 rounded-full transition-all"
                style={{ width: `${(currentQuestion / questionCount) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xl font-bold text-green-500">{score.correct}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Correct</p>
              </div>
              <div className={`w-px h-6 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
              <div className="text-center">
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{score.total}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
              </div>
              <div className={`w-px h-6 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
              <div className="text-center">
                <p className="text-xl font-bold text-red-500">
                  {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Score</p>
              </div>
            </div>
          </div>

          {/* Word Display Area */}
          <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
            <div className="text-center py-12">
              <Brain className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                En attente des données de vocabulaire...
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
