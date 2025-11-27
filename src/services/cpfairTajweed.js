/**
 * cpfair/quran-tajweed Integration Service
 * Provides accurate letter-level tajweed annotations
 * Source: https://github.com/cpfair/quran-tajweed
 */

// Import data files
import tajweedData from '../data/tajweed-cpfair.json'
import quranTextRaw from '../data/quran-uthmani.txt?raw'

// Map cpfair rule names to CSS classes and colors
export const TAJWEED_RULES = {
  // Silent/Non-pronounced letters - GRAY
  hamzat_wasl: { class: 'hamzat_wasl', color: '#AAAAAA', name: 'Hamzat al-Wasl' },
  lam_shamsiyyah: { class: 'lam_shamsiyyah', color: '#AAAAAA', name: 'Lam Shamsiyyah' },
  silent: { class: 'silent', color: '#AAAAAA', name: 'Silent Letter' },

  // Madd (Prolongation) - Various colors based on duration
  madd_2: { class: 'madd_normal', color: '#D4A017', name: 'Madd Normal (2)' },           // Gold - 2 harakat
  madd_246: { class: 'madd_permissible', color: '#FF7E1E', name: 'Madd Permissible (2/4/6)' }, // Orange
  madd_muttasil: { class: 'madd_muttasil', color: '#DD0008', name: 'Madd Muttasil (4/5)' },    // Red - connected
  madd_munfasil: { class: 'madd_munfasil', color: '#FF7E1E', name: 'Madd Munfasil (4/5)' },    // Orange - separated
  madd_6: { class: 'madd_necessary', color: '#8B0000', name: 'Madd Lazim (6)' },               // Dark red

  // Qalqalah - LIGHT BLUE
  qalqalah: { class: 'qalqalah', color: '#26BFFD', name: 'Qalqalah' },

  // Ghunnah/Nasalization - GREEN
  ghunnah: { class: 'ghunnah', color: '#169200', name: 'Ghunnah' },

  // Ikhfa (Concealment) - GREEN
  ikhfa: { class: 'ikhfa', color: '#169200', name: 'Ikhfa' },
  ikhfa_shafawi: { class: 'ikhfa_shafawi', color: '#169777', name: 'Ikhfa Shafawi' },

  // Idghaam (Assimilation) - GREEN variations
  idghaam_ghunnah: { class: 'idghaam_ghunnah', color: '#169777', name: 'Idghaam with Ghunnah' },
  idghaam_no_ghunnah: { class: 'idghaam_no_ghunnah', color: '#169200', name: 'Idghaam without Ghunnah' },
  idghaam_shafawi: { class: 'idghaam_shafawi', color: '#58B800', name: 'Idghaam Shafawi' },
  idghaam_mutajanisayn: { class: 'idghaam_mutajanisayn', color: '#A1A1A1', name: 'Idghaam Mutajanisayn' },
  idghaam_mutaqaribayn: { class: 'idghaam_mutaqaribayn', color: '#A1A1A1', name: 'Idghaam Mutaqaribayn' },

  // Iqlab (Conversion) - GREEN
  iqlab: { class: 'iqlab', color: '#58B800', name: 'Iqlab' },
}

// Build an index for fast lookup: { "surah:ayah": annotations }
const tajweedIndex = {}
tajweedData.forEach(item => {
  const key = `${item.surah}:${item.ayah}`
  tajweedIndex[key] = item.annotations || []
})

// Parse the cpfair Quran text file and build index: { "surah:ayah": text }
const quranTextIndex = {}
quranTextRaw.split('\n').forEach(line => {
  if (!line.trim()) return
  const parts = line.split('|')
  if (parts.length >= 3) {
    const surah = parseInt(parts[0])
    const ayah = parseInt(parts[1])
    const text = parts.slice(2).join('|') // In case text contains |
    const key = `${surah}:${ayah}`
    quranTextIndex[key] = text
  }
})

/**
 * Get the cpfair text for a specific verse
 * This is the text that matches the tajweed annotation positions
 */
export function getCpfairText(surah, ayah) {
  const key = `${surah}:${ayah}`
  return quranTextIndex[key] || null
}

/**
 * Get tajweed annotations for a specific verse
 * @param {number} surah - Surah number (1-114)
 * @param {number} ayah - Ayah number
 * @returns {Array} Array of annotations with rule, start, end
 */
export function getTajweedAnnotations(surah, ayah) {
  const key = `${surah}:${ayah}`
  return tajweedIndex[key] || []
}

/**
 * Apply tajweed annotations to text
 * Returns HTML string with <span> tags for each rule
 * @param {string} text - Plain Arabic text (should be cpfair text for accurate positions)
 * @param {Array} annotations - Array of {rule, start, end}
 * @returns {string} HTML string with tajweed markup
 */
export function applyTajweedToText(text, annotations) {
  if (!annotations || annotations.length === 0) {
    return text
  }

  // Sort annotations by start position (descending) to apply from end to start
  // This prevents position shifts when inserting tags
  const sorted = [...annotations].sort((a, b) => b.start - a.start)

  // Convert text to array of characters for manipulation
  let chars = [...text]

  for (const ann of sorted) {
    const rule = TAJWEED_RULES[ann.rule]
    if (!rule) continue

    // Get the characters to wrap
    const start = ann.start
    const end = ann.end

    if (start >= 0 && end <= chars.length && start < end) {
      const segment = chars.slice(start, end).join('')
      const wrapped = `<span class="tj-${rule.class}" style="color:${rule.color}">${segment}</span>`

      // Replace the segment
      chars.splice(start, end - start, wrapped)
    }
  }

  return chars.join('')
}

/**
 * Get verse with tajweed HTML applied using cpfair's own text
 * This ensures proper alignment of tajweed annotations
 * @param {number} surah - Surah number
 * @param {number} ayah - Ayah number
 * @returns {string|null} HTML string with tajweed markup, or null if not available
 */
export function getVerseWithTajweed(surah, ayah) {
  const text = getCpfairText(surah, ayah)
  if (!text) return null

  const annotations = getTajweedAnnotations(surah, ayah)
  return applyTajweedToText(text, annotations)
}

/**
 * Get all available tajweed rules with their colors
 * Useful for displaying a legend
 */
export function getTajweedLegend() {
  return Object.entries(TAJWEED_RULES).map(([key, value]) => ({
    id: key,
    ...value
  }))
}

/**
 * Check if cpfair tajweed data is available for a verse
 */
export function hasTajweedData(surah, ayah) {
  const key = `${surah}:${ayah}`
  return key in tajweedIndex && key in quranTextIndex
}

// Export the raw indexes for debugging
export { tajweedIndex, quranTextIndex }
