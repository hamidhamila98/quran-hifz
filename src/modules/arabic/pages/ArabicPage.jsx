import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Check, Languages, Youtube, FileText, BookOpen, ArrowLeft } from 'lucide-react'
import PdfViewer from '../components/PdfViewer'
import { MobileHeader } from '../../../components/sidebar'

// Arabic fonts for learning
const ARABIC_FONTS = [
  { id: 'amiri', name: 'Amiri', family: "'Amiri', serif" },
  { id: 'scheherazade', name: 'Scheherazade', family: "'Scheherazade New', serif" },
  { id: 'noto-naskh', name: 'Noto Naskh', family: "'Noto Naskh Arabic', serif" },
  { id: 'lateef', name: 'Lateef', family: "'Lateef', serif" },
]

export default function ArabicPage({ settings, updateSettings, isMobile, setMobileMenuOpen }) {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [bookData, setBookData] = useState(null)
  const [bookRegistry, setBookRegistry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTranslation, setShowTranslation] = useState(false)
  const [selectedLineIndex, setSelectedLineIndex] = useState(null)
  const [showVocabulary, setShowVocabulary] = useState(false)
  const [showValidatedPopup, setShowValidatedPopup] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // URL params (1-based for user, 0-based internally for item index)
  const urlSection = parseInt(searchParams.get('section')) || 1
  const urlItem = parseInt(searchParams.get('item')) || 1
  const currentSection = urlSection
  const currentItemIndex = urlItem - 1  // Convert to 0-based

  // Function to remove Arabic diacritics (tashkeel) but KEEP shadda
  const removeTashkeel = (text) => {
    return text?.replace(/[\u064B-\u0650\u0652\u0670]/g, '') || ''
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

  // Load book data
  useEffect(() => {
    setLoading(true)
    setError(null)

    // First load registry to get book info
    fetch('/arabic/books.json')
      .then(res => res.json())
      .then(registry => {
        const book = registry.books.find(b => b.id === bookId)
        if (!book) {
          throw new Error('Livre non trouvé')
        }
        setBookRegistry(book)

        // Then load actual book data
        return fetch(book.dataFile)
      })
      .then(res => res.json())
      .then(data => {
        setBookData(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message || 'Erreur de chargement')
        setLoading(false)
      })
  }, [bookId])

  // Get current section and item
  const section = bookData?.sections?.find(s => s.id === currentSection)
  const items = section?.items || []
  const item = items[currentItemIndex]
  const totalItems = items.length
  const isTexte = item?.type === 'text' || item?.type === 'texte'

  // Get labels from metadata
  const meta = bookData?.meta
  const sectionLabel = meta?.structure?.sectionLabel?.fr || 'Unité'
  const getItemLabel = (type) => {
    const labels = meta?.structure?.itemLabels || {}
    if (type === 'text' || type === 'texte') {
      return labels.text?.fr || 'Texte'
    }
    return labels.dialogue?.fr || 'Dialogue'
  }

  // Validation state (per book)
  const allValidated = settings.arabicValidated || {}
  const validatedItems = allValidated[bookId] || {}
  const itemKey = `${currentSection}-${currentItemIndex}`
  const isValidated = validatedItems[itemKey] === true

  // Calculate progress
  const getTotalItemsAll = () => {
    if (!bookData?.sections) return 0
    return bookData.sections.reduce((acc, s) => acc + (s.items?.length || 0), 0)
  }
  const totalItemsAll = getTotalItemsAll()
  const validatedCount = Object.keys(validatedItems).length
  const progressPercent = totalItemsAll > 0 ? ((validatedCount / totalItemsAll) * 100).toFixed(1) : 0

  // Get list of validated items with details
  const getValidatedItemsList = () => {
    if (!bookData?.sections) return []
    const list = []
    Object.keys(validatedItems).forEach(key => {
      const [sectionId, itemIdx] = key.split('-').map(Number)
      const section = bookData.sections.find(s => s.id === sectionId)
      if (section) {
        const item = section.items?.[itemIdx]
        if (item) {
          list.push({
            sectionId,
            sectionTitle: section.titleFr,
            itemType: item.type,
            itemTitle: item.titleFr || item.titleAr,
            key,
            itemIdx
          })
        }
      }
    })
    return list.sort((a, b) => a.sectionId - b.sectionId || a.itemIdx - b.itemIdx)
  }

  // Navigation
  const maxSection = bookData?.sections?.reduce((max, s) => Math.max(max, s.id), 0) || 1
  const minSection = bookData?.sections?.reduce((min, s) => Math.min(min, s.id), Infinity) || 1

  const navigateTo = (sectionId, itemIdx) => {
    setSearchParams({ section: sectionId, item: itemIdx + 1 })
    setShowTranslation(false)
    setSelectedLineIndex(null)
  }

  const goToNext = () => {
    if (currentItemIndex < totalItems - 1) {
      navigateTo(currentSection, currentItemIndex + 1)
    } else if (currentSection < maxSection) {
      const nextSection = bookData?.sections?.find(s => s.id > currentSection)
      if (nextSection) {
        navigateTo(nextSection.id, 0)
      }
    }
  }

  const goToPrevious = () => {
    if (currentItemIndex > 0) {
      navigateTo(currentSection, currentItemIndex - 1)
    } else if (currentSection > minSection) {
      const prevSection = bookData?.sections?.filter(s => s.id < currentSection).pop()
      if (prevSection) {
        const prevItemCount = prevSection.items?.length || 1
        navigateTo(prevSection.id, prevItemCount - 1)
      }
    }
  }

  const toggleValidation = () => {
    const newBookValidated = { ...validatedItems }
    if (isValidated) {
      delete newBookValidated[itemKey]
    } else {
      newBookValidated[itemKey] = true
    }
    // Update per-book validation
    updateSettings({
      arabicValidated: {
        ...allValidated,
        [bookId]: newBookValidated
      }
    })
  }

  const canGoPrevious = currentSection > minSection || currentItemIndex > 0
  const canGoNext = currentSection < maxSection || currentItemIndex < totalItems - 1

  // Toggle line selection
  const handleLineClick = (index) => {
    setSelectedLineIndex(selectedLineIndex === index ? null : index)
  }

  const handleTranslate = () => {
    setShowTranslation(!showTranslation)
  }

  // Get speaker color classes
  const getSpeakerColor = (index, isTexteType) => {
    if (isTexteType) {
      if (settings.darkMode) {
        return 'bg-blue-900/50 border-blue-700/50'
      }
      return 'bg-blue-100 border-blue-300'
    }
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
      return settings.darkMode ? 'text-blue-400' : 'text-blue-700'
    }
    const isEven = index % 2 === 0
    if (settings.darkMode) {
      return isEven ? 'text-blue-400' : 'text-amber-400'
    }
    return isEven ? 'text-blue-700' : 'text-amber-700'
  }

  // Get PDF info
  const getPdfInfo = () => {
    const resources = meta?.resources || {}
    return { file: resources.pdf, page: item?.pdfPage || 1 }
  }

  const getVocPdfInfo = () => {
    const resources = meta?.resources || {}
    return { file: resources.vocabulary, page: currentSection }
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
    <div className={`pb-20 ${settings.darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Mobile Header */}
      <MobileHeader
        title="MyArabic"
        icon="ع"
        gradientFrom="from-red-500"
        gradientTo="to-red-700"
        darkMode={settings.darkMode}
        onMenuClick={() => setMobileMenuOpen && setMobileMenuOpen(true)}
      />

      <div className="p-4 md:p-6">
      {/* Progress Bar Header */}
      <div className={`mb-6 p-4 rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
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
                {meta?.title || bookRegistry?.title}
              </h1>
              <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {totalItemsAll} leçons
                {validatedCount > 0 && (
                  <> · <button
                    onClick={() => setShowValidatedPopup(true)}
                    className="font-semibold text-emerald-500 hover:text-emerald-400 hover:underline cursor-pointer"
                  >
                    {validatedCount} validée{validatedCount > 1 ? 's' : ''}
                  </button></>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="font-bold text-lg">{validatedCount}</span>
              <span className={`${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}> / {totalItemsAll}</span>
            </div>
            <div className={`font-semibold px-3 py-1 rounded-full ${
              settings.darkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700'
            }`}>
              {progressPercent}%
            </div>
          </div>
        </div>
        <div className={`h-3 rounded-full ${settings.darkMode ? 'bg-slate-700' : 'bg-gray-200'} overflow-hidden`}>
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(parseFloat(progressPercent), 0.5)}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Left: Content - 3/5 */}
        <div className="lg:col-span-3">
          {/* Navigation Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className={`text-lg font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                {sectionLabel} {section?.id} - {section?.titleFr}
                <span className={`ml-2 ${settings.darkMode ? 'text-white' : 'text-gray-800'}`} dir="rtl" style={{ fontFamily: getFontFamily() }}>
                  ({section?.titleAr})
                </span>
              </h3>
              {/* Type badge */}
              <span className={`text-xs px-2 py-1 rounded-full ${
                isTexte
                  ? settings.darkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                  : settings.darkMode ? 'bg-sky-900/50 text-sky-300' : 'bg-sky-100 text-sky-700'
              }`}>
                {isTexte ? 'نص' : 'حوار'}
              </span>
              {/* Validation checkbox */}
              <button
                onClick={toggleValidation}
                className="flex items-center gap-2 cursor-pointer select-none group"
                title={isValidated ? "Marquer comme non validé" : "Marquer comme validé"}
              >
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all group-hover:scale-110 ${
                  isValidated
                    ? 'bg-emerald-500 border-emerald-500'
                    : settings.darkMode
                      ? 'border-slate-500 bg-slate-700 hover:border-emerald-500'
                      : 'border-gray-300 bg-white hover:border-emerald-500'
                }`}>
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
              {/* Navigation */}
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={goToPrevious}
                  disabled={!canGoPrevious}
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

          {/* Items bar with buttons */}
          <div className={`mb-4 px-4 py-3 rounded-xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center flex-wrap gap-2">
                {(() => {
                  let dialogueCount = 0
                  let texteCount = 0
                  return items.map((d, idx) => {
                    const isTexteItem = d.type === 'text' || d.type === 'texte'
                    if (isTexteItem) {
                      texteCount++
                    } else {
                      dialogueCount++
                    }
                    const displayNum = isTexteItem ? texteCount : dialogueCount
                    const isActive = idx === currentItemIndex
                    const isValidatedItem = validatedItems[`${currentSection}-${idx}`]
                    return (
                      <button
                        key={idx}
                        onClick={() => navigateTo(currentSection, idx)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? isValidatedItem
                              ? 'bg-emerald-500 text-white'
                              : 'bg-red-600 text-white'
                            : isValidatedItem
                              ? settings.darkMode
                                ? 'bg-emerald-900/50 text-emerald-300 hover:bg-emerald-900/70'
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : settings.darkMode
                                ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {getItemLabel(d.type)} {displayNum}
                      </button>
                    )
                  })
                })()}
              </div>
              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => updateSettings({ pdfMode: !settings.pdfMode })}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                    settings.pdfMode
                      ? 'bg-sky-500 text-white'
                      : settings.darkMode
                        ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  PDF
                </button>
                <button
                  onClick={() => setShowVocabulary(!showVocabulary)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                    showVocabulary
                      ? 'bg-sky-500 text-white'
                      : settings.darkMode
                        ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Voc
                </button>
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

          {/* Content: PDF or Text */}
          {settings.pdfMode || showVocabulary ? (
            <PdfViewer
              pdfFile={showVocabulary ? getVocPdfInfo().file : getPdfInfo().file}
              pageNumber={showVocabulary ? getVocPdfInfo().page : getPdfInfo().page}
              darkMode={settings.darkMode}
            />
          ) : (
            <div className={`rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {item?.lines?.map((line, index) => {
                  if (!line.speaker && !line.ar) {
                    return (
                      <div key={index} className={`h-20 ${settings.darkMode ? 'bg-slate-900' : 'bg-white'}`} />
                    )
                  }

                  const isSelected = selectedLineIndex === index
                  const showThisTranslation = showTranslation && (selectedLineIndex === null || selectedLineIndex === index)
                  const hideThisTashkeel = settings.hideTashkeel && (selectedLineIndex === null || selectedLineIndex === index)
                  const isFirst = index === 0
                  const isLast = index === (item?.lines?.length || 0) - 1
                  const displayArabic = hideThisTashkeel ? removeTashkeel(line.ar) : line.ar

                  return (
                    <div
                      key={index}
                      onClick={() => handleLineClick(index)}
                      className={`p-3 cursor-pointer transition-all border-l-4 ${getSpeakerColor(index, isTexte)} ${
                        isFirst ? 'rounded-t-2xl' : ''
                      } ${isLast ? 'rounded-b-2xl' : ''} ${
                        isSelected
                          ? settings.darkMode
                            ? 'bg-emerald-900/30 border-l-emerald-500'
                            : 'bg-emerald-50 border-l-emerald-500'
                          : 'hover:opacity-80'
                      }`}
                    >
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
                        {!isTexte && line.speaker && (
                          <span
                            className={`font-bold ${getSpeakerTextColor(index, isTexte)}`}
                            style={{ fontSize: '0.85em', whiteSpace: 'nowrap', flexShrink: 0 }}
                          >
                            {line.speaker}:
                          </span>
                        )}
                        <span style={{ whiteSpace: 'pre-line' }}>
                          {displayArabic}
                        </span>
                      </div>
                      {showThisTranslation && (
                        <div
                          className={`mt-2 text-sm ${settings.darkMode ? 'text-sky-400' : 'text-sky-600'}`}
                          style={{ fontFamily: 'Georgia, serif' }}
                        >
                          {line.fr}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Info + Video - 2/5 */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {section && (
            <div className={`p-3 rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm text-center`}>
              <div className="mb-2">
                <h2 className={`text-2xl font-bold mb-0.5 ${settings.darkMode ? 'text-white' : 'text-gray-800'}`} style={{ fontFamily: getFontFamily() }}>
                  {section.titleAr}
                </h2>
                <p className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {section.titleFr} - {sectionLabel} {section.id}
                </p>
              </div>
              <div className={`px-2 py-1.5 rounded-lg ${settings.darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <span className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Position : </span>
                <span className={`font-semibold text-xs ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {sectionLabel} {currentSection} - {getItemLabel(item?.type)} {currentItemIndex + 1}
                </span>
              </div>
            </div>
          )}

          <div className={`p-4 rounded-2xl ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm sticky top-6`}>
            <div className="flex items-center gap-2 mb-3">
              <Youtube className={`w-5 h-5 ${settings.darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <h2 className={`font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Vidéo</h2>
            </div>
            {item?.youtube ? (
              <div style={{ aspectRatio: '16/9' }}>
                <iframe
                  className="w-full h-full rounded-xl"
                  src={item.youtube}
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

      {/* Validated Items Popup */}
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
              {getValidatedItemsList().map((validated) => (
                <button
                  key={validated.key}
                  onClick={() => {
                    const [sectionId, itemIdx] = validated.key.split('-').map(Number)
                    navigateTo(sectionId, itemIdx)
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
                    {validated.sectionId}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {validated.sectionTitle}
                    </p>
                    <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {getItemLabel(validated.itemType)} {validated.itemIdx + 1}
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

            {showResetConfirm && (
              <div className={`mt-4 p-4 rounded-xl ${settings.darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                <p className={`text-sm mb-3 ${settings.darkMode ? 'text-red-300' : 'text-red-700'}`}>
                  Êtes-vous sûr de vouloir réinitialiser toute votre progression ?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Only reset current book's progress
                      const newAllValidated = { ...allValidated }
                      delete newAllValidated[bookId]
                      updateSettings({ arabicValidated: newAllValidated })
                      setShowResetConfirm(false)
                      setShowValidatedPopup(false)
                    }}
                    className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white"
                  >
                    Oui, réinitialiser
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
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
    </div>
  )
}
