// Word Timing Service
// Uses quran-align data for word-by-word highlighting during audio playback
// Data source: https://github.com/cpfair/quran-align

// Mapping between reciter IDs and timing data files
// All 12 reciters from quran-align project
const TIMING_FILES = {
  'ar.alafasy': '/quran-timing-data/Alafasy.json',
  'ar.abdulbasitmujawwad': '/quran-timing-data/Abdul_Basit_Mujawwad.json',
  'ar.abdulbasitmurattal': '/quran-timing-data/Abdul_Basit_Murattal.json',
  'ar.sudais': '/quran-timing-data/Abdurrahmaan_As-Sudais.json',
  'ar.shaatree': '/quran-timing-data/Abu_Bakr_Ash-Shaatree.json',
  'ar.hanirifai': '/quran-timing-data/Hani_Rifai.json',
  'ar.husary': '/quran-timing-data/Husary.json',
  'ar.husarymuallim': '/quran-timing-data/Husary_Muallim.json',
  'ar.minshawimujawwad': '/quran-timing-data/Minshawy_Mujawwad.json',
  'ar.minshawimurttal': '/quran-timing-data/Minshawy_Murattal.json',
  'ar.tablaway': '/quran-timing-data/Mohammad_al_Tablaway.json',
  'ar.shuraym': '/quran-timing-data/Saood_ash-Shuraym.json',
}

// Cache for loaded timing data (indexed by surah:ayah for quick lookup)
const timingCache = {}
// Raw data cache (to avoid reloading JSON files)
const rawDataCache = {}

/**
 * Load timing data for a specific reciter
 * @param {string} reciterId - The reciter ID (e.g., 'ar.alafasy')
 * @returns {Promise<boolean>} - Whether loading was successful
 */
export async function loadTimingData(reciterId) {
  const timingFile = TIMING_FILES[reciterId]
  if (!timingFile) {
    console.log(`No timing data available for reciter: ${reciterId}`)
    return false
  }

  // Already loaded?
  if (rawDataCache[reciterId]) {
    return true
  }

  try {
    const response = await fetch(timingFile)
    if (!response.ok) {
      throw new Error(`Failed to fetch timing data: ${response.status}`)
    }

    const data = await response.json()
    rawDataCache[reciterId] = data

    // Index the data by surah:ayah for quick lookup
    timingCache[reciterId] = {}
    data.forEach(entry => {
      const key = `${entry.surah}:${entry.ayah}`
      timingCache[reciterId][key] = entry.segments
    })

    console.log(`Loaded timing data for ${reciterId}: ${data.length} entries`)
    return true
  } catch (error) {
    console.error(`Error loading timing data for ${reciterId}:`, error)
    return false
  }
}

/**
 * Check if timing data is available for a reciter
 * @param {string} reciterId - The reciter ID
 * @returns {boolean}
 */
export function hasTimingData(reciterId) {
  return !!TIMING_FILES[reciterId]
}

/**
 * Check if timing data is loaded for a reciter
 * @param {string} reciterId - The reciter ID
 * @returns {boolean}
 */
export function isTimingDataLoaded(reciterId) {
  return !!timingCache[reciterId]
}

/**
 * Get word segments for a specific verse
 * @param {string} reciterId - The reciter ID
 * @param {number} surah - Surah number (1-114)
 * @param {number} ayah - Ayah number
 * @returns {Array|null} - Array of [wordStart, wordEnd, startMs, endMs] or null
 */
export function getVerseTimings(reciterId, surah, ayah) {
  if (!timingCache[reciterId]) return null
  const key = `${surah}:${ayah}`
  return timingCache[reciterId][key] || null
}

/**
 * Get the current word index based on playback time
 * @param {Array} segments - The timing segments for the verse
 * @param {number} currentTimeMs - Current playback time in milliseconds
 * @returns {number} - The 0-based word index, or -1 if not found
 */
export function getCurrentWordIndex(segments, currentTimeMs) {
  if (!segments || segments.length === 0) return -1

  for (let i = 0; i < segments.length; i++) {
    const [wordStart, wordEnd, startMs, endMs] = segments[i]
    if (currentTimeMs >= startMs && currentTimeMs < endMs) {
      return wordStart // Return the word index
    }
  }

  // If past all segments, return the last word
  if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1]
    if (currentTimeMs >= lastSegment[2]) {
      return lastSegment[0]
    }
  }

  return -1
}

/**
 * Get word range being spoken at a given time
 * @param {Array} segments - The timing segments
 * @param {number} currentTimeMs - Current time in milliseconds
 * @returns {{start: number, end: number}|null} - Word range or null
 */
export function getCurrentWordRange(segments, currentTimeMs) {
  if (!segments || segments.length === 0) return null

  for (const [wordStart, wordEnd, startMs, endMs] of segments) {
    if (currentTimeMs >= startMs && currentTimeMs < endMs) {
      return { start: wordStart, end: wordEnd }
    }
  }

  return null
}

/**
 * Get all available reciters with timing data
 * @returns {Array<string>} - Array of reciter IDs
 */
export function getRecitersWithTiming() {
  return Object.keys(TIMING_FILES)
}
