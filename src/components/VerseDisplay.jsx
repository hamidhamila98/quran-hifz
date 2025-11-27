import { useState } from 'react'
import { ARABIC_FONTS } from '../services/quranApi'

export default function VerseDisplay({
  ayahs,
  highlightedAyah = null,
  onAyahClick = null,
  hiddenMode = false,
  revealedAyahs = [],
  darkMode = false,
  tajweedEnabled = false,
  arabicFont = 'amiri-quran',
  flowMode = false,
  arabicNumerals = true
}) {
  const [hoveredAyah, setHoveredAyah] = useState(null)

  // Convert Arabic numeral to Eastern Arabic numerals
  const toArabicNumeral = (num) => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
    return String(num).split('').map(digit => arabicNumerals[parseInt(digit)]).join('')
  }

  // Get font family from font id
  const getFontFamily = () => {
    const font = ARABIC_FONTS.find(f => f.id === arabicFont)
    return font ? font.family : "'Amiri Quran', 'Amiri', serif"
  }

  if (!ayahs || ayahs.length === 0) {
    return (
      <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Chargement des versets...
      </div>
    )
  }

  return (
    <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
      <div
        className={`text-2xl md:text-3xl ${flowMode ? 'arabic-flow' : 'arabic-text'} ${tajweedEnabled ? 'tajweed-text' : ''}`}
        style={{ fontFamily: getFontFamily() }}
      >
        {ayahs.map((ayah, index) => {
          const isHighlighted = highlightedAyah === ayah.number
          const isHovered = hoveredAyah === ayah.number
          const isHidden = hiddenMode && !revealedAyahs.includes(ayah.number)

          return (
            <span
              key={ayah.number}
              className={`
                ${flowMode ? 'verse-inline' : 'inline'} transition-all duration-200 cursor-pointer
                ${isHighlighted ? 'verse-highlight' : ''}
                ${isHovered && !isHighlighted ? 'bg-gray-50 dark:bg-slate-700 rounded' : ''}
                ${isHidden ? 'verse-hidden' : 'verse-revealed'}
                ${darkMode ? 'text-gray-100' : 'text-gray-800'}
              `}
              onMouseEnter={() => setHoveredAyah(ayah.number)}
              onMouseLeave={() => setHoveredAyah(null)}
              onClick={() => onAyahClick && onAyahClick(ayah)}
            >
              {tajweedEnabled ? (
                <span dangerouslySetInnerHTML={{ __html: ayah.text.replace(/<span class=end>.*?<\/span>/g, '') }} />
              ) : (
                ayah.text
              )}
              {arabicNumerals ? (
                <span className="verse-marker" style={{ fontFamily: "'Amiri Quran', serif" }}>
                  {'\u06DD'}{toArabicNumeral(ayah.numberInSurah)}
                </span>
              ) : (
                <span className="verse-marker-western">
                  <span className="marker-symbol">{'\u06DD'}</span>
                  <span className="marker-number">{ayah.numberInSurah}</span>
                </span>
              )}
              {flowMode && index < ayahs.length - 1 && ' '}
            </span>
          )
        })}
      </div>
    </div>
  )
}
