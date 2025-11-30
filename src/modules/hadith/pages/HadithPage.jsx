import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  X,
  Loader2,
  Database,
  Cloud,
  Copy,
  Check,
  Hash
} from 'lucide-react'
import {
  HADITH_BOOKS,
  loadLocalHadiths,
  getChaptersForBook,
  getHadithsByChapter,
  getHadithsByBook,
  searchLocalHadiths,
  searchDorar,
  getGradeColor,
  getBookStats
} from '../services/hadithService'

// Font options
const FONT_OPTIONS = [
  { id: 'amiri', name: 'Amiri', nameAr: 'أميري' },
  { id: 'scheherazade', name: 'Scheherazade', nameAr: 'شهرزاد' },
  { id: 'noto-naskh', name: 'Noto Naskh', nameAr: 'نوتو نسخ' },
  { id: 'kitab', name: 'Kitab', nameAr: 'كتاب' },
]

const SIZE_OPTIONS = [
  { id: 'small', name: 'Petit', size: 'text-base' },
  { id: 'medium', name: 'Moyen', size: 'text-lg' },
  { id: 'large', name: 'Grand', size: 'text-xl' },
]

// Get font class
function getFontClass(fontId) {
  const fontMap = {
    'amiri': 'font-amiri',
    'scheherazade': 'font-scheherazade',
    'noto-naskh': 'font-noto-naskh',
    'kitab': 'font-kitab',
  }
  return fontMap[fontId] || 'font-amiri'
}

// Get size class
function getSizeClass(sizeId) {
  const sizeMap = {
    'small': 'text-base',
    'medium': 'text-lg',
    'large': 'text-xl',
  }
  return sizeMap[sizeId] || 'text-lg'
}

// Grade badge component
function GradeBadge({ grade }) {
  if (!grade) return null

  const color = getGradeColor(grade)
  const colorClasses = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  }

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]}`}>
      {grade}
    </span>
  )
}


// Hadith card component
function HadithCard({ hadith, darkMode, isDorar, onClick, settings }) {
  const [copied, setCopied] = useState(false)
  const fontClass = getFontClass(settings.hadithFont)
  const sizeClass = getSizeClass(settings.hadithFontSize)
  const showIsnad = settings.hadithShowIsnad

  const copyHadith = (e) => {
    e.stopPropagation()
    const text = hadith.text_ar + (hadith.text_en ? '\n\n' + hadith.text_en : '')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Extract matn (text) without isnad if needed
  const getDisplayText = (text) => {
    if (!text) return ''
    if (showIsnad) return text

    // Try to find where the actual matn starts (after chain of narration)
    // Common patterns: "قال رسول الله", "أن النبي", "عن النبي"
    const matnPatterns = [
      /قال رسول الله صلى الله عليه وسلم/,
      /قال النبي صلى الله عليه وسلم/,
      /أن رسول الله صلى الله عليه وسلم/,
      /أن النبي صلى الله عليه وسلم/,
      /عن النبي صلى الله عليه وسلم قال/,
      /قال صلى الله عليه وسلم/,
      /قال رسول الله/,
      /أن النبي/,
      /عن النبي/,
      /قال:/,
      /‏"‏/,  // Start of quoted text marker
    ]

    for (const pattern of matnPatterns) {
      const match = text.search(pattern)
      if (match > 30) {
        return '...' + text.substring(match)
      }
    }
    return text
  }

  const displayText = getDisplayText(hadith.text_ar)

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
        darkMode
          ? 'bg-slate-800 border-slate-700 hover:border-rose-700'
          : 'bg-white border-gray-200 hover:border-rose-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {isDorar ? (
            <>
              <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                {hadith.source}
              </span>
              <GradeBadge grade={hadith.grade} />
            </>
          ) : (
            <>
              <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                {hadith.chapter?.split(' - ')[1] || hadith.chapter}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${darkMode ? 'bg-rose-900/50 text-rose-300' : 'bg-rose-100 text-rose-700'}`}>
                #{hadith.hadith_no}
              </span>
            </>
          )}
        </div>
        <button
          onClick={copyHadith}
          className={`p-1.5 rounded-lg transition-colors ${
            darkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
          }`}
          title="Copier"
        >
          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
        </button>
      </div>

      {/* Arabic text */}
      <p
        className={`${fontClass} ${sizeClass} leading-relaxed mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}
        dir="rtl"
      >
        {displayText?.length > 400 ? displayText.slice(0, 400) + '...' : displayText}
      </p>

      {/* English text (local only) */}
      {!isDorar && hadith.text_en && (
        <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {hadith.text_en?.length > 250 ? hadith.text_en.slice(0, 250) + '...' : hadith.text_en}
        </p>
      )}

      {/* Narrator (Dorar) */}
      {isDorar && hadith.narrator && (
        <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          <span className="font-medium">الراوي:</span> {hadith.narrator}
        </p>
      )}
    </div>
  )
}

// Hadith detail modal
function HadithModal({ hadith, isDorar, darkMode, onClose, settings }) {
  const [copied, setCopied] = useState(false)
  const fontClass = getFontClass(settings.hadithFont)
  const sizeClass = getSizeClass(settings.hadithFontSize)

  if (!hadith) return null

  const copyHadith = () => {
    const text = hadith.text_ar + (hadith.text_en ? '\n\n' + hadith.text_en : '')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl ${
          darkMode ? 'bg-slate-800' : 'bg-white'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 flex items-center justify-between p-4 border-b ${
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-sm ${darkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              {hadith.source}
            </span>
            {!isDorar && (
              <span className={`text-sm font-medium px-2 py-1 rounded ${darkMode ? 'bg-rose-900/50 text-rose-300' : 'bg-rose-100 text-rose-700'}`}>
                Hadith #{hadith.hadith_no}
              </span>
            )}
            {isDorar && <GradeBadge grade={hadith.grade} />}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyHadith}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Arabic text */}
          <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
            <p
              className={`${fontClass} text-xl leading-loose ${darkMode ? 'text-white' : 'text-gray-900'}`}
              dir="rtl"
            >
              {hadith.text_ar}
            </p>
          </div>

          {/* English translation (local) */}
          {!isDorar && hadith.text_en && (
            <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {hadith.text_en}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className={`grid grid-cols-2 gap-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {isDorar ? (
              <>
                {hadith.narrator && (
                  <div>
                    <span className="font-medium">الراوي: </span>
                    {hadith.narrator}
                  </div>
                )}
                {hadith.muhaddith && (
                  <div>
                    <span className="font-medium">المحدث: </span>
                    {hadith.muhaddith}
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <span className="font-medium">Chapter: </span>
                  {hadith.chapter}
                </div>
                <div>
                  <span className="font-medium">Hadith No: </span>
                  {hadith.hadith_no}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Main HadithPage component
export default function HadithPage({ settings, updateSettings }) {
  const darkMode = settings.darkMode
  const isDorar = settings.hadithSource === 'dorar'
  const selectedBookId = settings.hadithBook

  // Get selected book info
  const selectedBook = HADITH_BOOKS.find(b => b.id === selectedBookId) || HADITH_BOOKS[0]

  // State
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [chapters, setChapters] = useState([])
  const [allHadiths, setAllHadiths] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [hadithNumberFilter, setHadithNumberFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedHadith, setSelectedHadith] = useState(null)
  const [page, setPage] = useState(0)
  const [dorarResults, setDorarResults] = useState([])
  const [dorarSearching, setDorarSearching] = useState(false)
  const PAGE_SIZE = 50

  // Load hadiths when book changes (Local mode)
  useEffect(() => {
    if (!isDorar && selectedBook) {
      setLoading(true)
      setPage(0)
      setSearchQuery('')
      setHadithNumberFilter('')

      Promise.all([
        getHadithsByBook(selectedBook.source),
        getChaptersForBook(selectedBook.source)
      ]).then(([hadithData, chapterData]) => {
        setAllHadiths(hadithData)
        setChapters(chapterData)
      }).finally(() => setLoading(false))
    }
  }, [selectedBook, isDorar])

  // Debounced Dorar search
  useEffect(() => {
    if (!isDorar || !searchQuery.trim()) {
      setDorarResults([])
      return
    }

    const timer = setTimeout(async () => {
      setDorarSearching(true)
      try {
        const results = await searchDorar(searchQuery)
        setDorarResults(results)
      } catch (error) {
        console.error('Dorar search error:', error)
      } finally {
        setDorarSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, isDorar])

  // Filter hadiths based on search, chapter, and number filter
  const filteredHadiths = useMemo(() => {
    if (isDorar) return dorarResults

    let result = allHadiths

    // Filter by chapter
    if (selectedChapter) {
      result = result.filter(h => h.chapter_no === selectedChapter.number)
    }

    // Filter by text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const queryAr = searchQuery
      result = result.filter(h =>
        h.text_ar?.includes(queryAr) ||
        h.text_en?.toLowerCase().includes(query) ||
        h.chapter?.toLowerCase().includes(query)
      )
    }

    // Filter by hadith number
    if (hadithNumberFilter.trim()) {
      const numFilter = hadithNumberFilter.trim()
      if (numFilter.includes('-')) {
        // Range filter: "100-200"
        const [start, end] = numFilter.split('-').map(n => parseInt(n.trim()))
        if (!isNaN(start) && !isNaN(end)) {
          result = result.filter(h => h.hadith_no >= start && h.hadith_no <= end)
        }
      } else {
        // Exact number
        const num = parseInt(numFilter)
        if (!isNaN(num)) {
          result = result.filter(h => h.hadith_no === num)
        }
      }
    }

    return result
  }, [allHadiths, selectedChapter, searchQuery, hadithNumberFilter, isDorar, dorarResults])

  // Paginated hadiths
  const displayedHadiths = filteredHadiths.slice(0, (page + 1) * PAGE_SIZE)
  const hasMore = filteredHadiths.length > (page + 1) * PAGE_SIZE

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setHadithNumberFilter('')
    setSelectedChapter(null)
  }

  const hasActiveFilters = searchQuery || hadithNumberFilter || selectedChapter

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-30 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-5xl mx-auto px-4 py-4">
          {/* Top row */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedBook?.nameFr}
                </h1>
                <span className={`font-arabic text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedBook?.nameAr}
                </span>
              </div>
              {!isDorar && (
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {filteredHadiths.length.toLocaleString()} hadiths
                  {selectedChapter && ` • Chapitre: ${selectedChapter.name}`}
                </p>
              )}
            </div>

            {/* Source indicator */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
              darkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>
              {isDorar ? <Cloud size={16} /> : <Database size={16} />}
              <span>{isDorar ? 'Dorar API' : 'Local'}</span>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex gap-2 mb-3">
            <div className={`flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl ${
              darkMode ? 'bg-slate-700' : 'bg-gray-100'
            }`}>
              <Search size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isDorar ? 'البحث في الأحاديث... (recherche automatique)' : 'Rechercher dans le texte...'}
                className={`flex-1 bg-transparent outline-none ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                dir="auto"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`p-1 rounded ${darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-200'}`}
                >
                  <X size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                </button>
              )}
            </div>
          </div>

          {/* Filters row (Local mode only) */}
          {!isDorar && (
            <div className="flex gap-2 flex-wrap">
              {/* Chapter dropdown */}
              <div className="flex-1 min-w-[200px]">
                <select
                  value={selectedChapter?.number || ''}
                  onChange={(e) => {
                    const chapter = chapters.find(c => c.number === parseInt(e.target.value))
                    setSelectedChapter(chapter || null)
                    setPage(0)
                  }}
                  className={`w-full px-3 py-2 rounded-xl border text-sm ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-gray-300'
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  <option value="">Tous les chapitres ({chapters.length})</option>
                  {chapters.map(ch => (
                    <option key={ch.number} value={ch.number}>
                      {ch.number}. {ch.name} ({ch.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Hadith number filter */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'
              }`}>
                <Hash size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                <input
                  type="text"
                  value={hadithNumberFilter}
                  onChange={(e) => {
                    setHadithNumberFilter(e.target.value)
                    setPage(0)
                  }}
                  placeholder="N° (ex: 42 ou 100-200)"
                  className={`w-32 bg-transparent outline-none text-sm ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                />
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                    darkMode
                      ? 'bg-rose-900/30 text-rose-300 hover:bg-rose-900/50'
                      : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                  }`}
                >
                  <X size={14} />
                  Effacer filtres
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Loading state */}
        {(loading || dorarSearching) && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className={`animate-spin ${darkMode ? 'text-rose-400' : 'text-rose-600'}`} />
          </div>
        )}

        {/* Dorar mode - show search prompt when no search */}
        {!loading && !dorarSearching && isDorar && !searchQuery && (
          <div className="text-center py-20">
            <Cloud size={64} className={`mx-auto mb-4 ${darkMode ? 'text-rose-400' : 'text-rose-600'}`} />
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Mode API Dorar
            </h2>
            <p className={`text-lg mb-2 font-arabic ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} dir="rtl">
              ابحث في الأحاديث النبوية
            </p>
            <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              La recherche est automatique - tapez pour chercher
            </p>
            <div className={`mt-6 p-4 rounded-xl max-w-md mx-auto ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <h3 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Exemples de recherche:</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {['الأعمال بالنيات', 'الإيمان', 'الصلاة', 'الصيام', 'الصدق'].map(q => (
                  <button
                    key={q}
                    onClick={() => setSearchQuery(q)}
                    className={`px-3 py-1.5 rounded-lg font-arabic text-sm transition-colors ${
                      darkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    dir="rtl"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Note about Sharh */}
            <div className={`mt-8 p-4 rounded-xl max-w-lg mx-auto text-left ${darkMode ? 'bg-amber-900/20 border border-amber-700' : 'bg-amber-50 border border-amber-200'}`}>
              <p className={`text-sm ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                <strong>Note:</strong> L'API Dorar fournit les hadiths avec leur grade (صحيح, حسن, ضعيف) mais pas les explications (sharh).
                Pour les sharh, il faudrait intégrer une autre source comme islamweb.net ou les livres de sharh en PDF.
              </p>
            </div>
          </div>
        )}

        {/* Hadiths list */}
        {!loading && !dorarSearching && displayedHadiths.length > 0 && (
          <div className="space-y-4">
            {displayedHadiths.map((hadith, index) => (
              <HadithCard
                key={hadith.hadith_id || hadith.id || index}
                hadith={hadith}
                darkMode={darkMode}
                isDorar={isDorar}
                onClick={() => setSelectedHadith(hadith)}
                settings={settings}
              />
            ))}

            {/* Load more button */}
            {hasMore && (
              <button
                onClick={() => setPage(p => p + 1)}
                className={`w-full py-3 rounded-xl font-medium transition-colors ${
                  darkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-gray-300 border border-slate-700'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                }`}
              >
                Charger plus ({filteredHadiths.length - displayedHadiths.length} restants)
              </button>
            )}
          </div>
        )}

        {/* No results */}
        {!loading && !dorarSearching && displayedHadiths.length === 0 && (searchQuery || hadithNumberFilter || (isDorar && searchQuery)) && (
          <div className="text-center py-20">
            <Search size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              Aucun résultat pour cette recherche
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className={`mt-4 px-4 py-2 rounded-lg text-sm ${
                  darkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Effacer les filtres
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hadith detail modal */}
      {selectedHadith && (
        <HadithModal
          hadith={selectedHadith}
          isDorar={isDorar}
          darkMode={darkMode}
          onClose={() => setSelectedHadith(null)}
          settings={settings}
        />
      )}
    </div>
  )
}
