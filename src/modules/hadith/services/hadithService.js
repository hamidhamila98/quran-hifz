// Hadith Service - Handles both local JSON and Dorar API

// CORS proxy for browser requests
const CORS_PROXY = 'https://api.allorigins.win/raw?url='
const DORAR_API_BASE = 'https://dorarapi.onrender.com/v1'

// Book metadata
export const HADITH_BOOKS = [
  { id: 'bukhari', name: 'Sahih Bukhari', nameFr: 'Sahih al-Boukhari', nameAr: 'صحيح البخاري', source: 'Sahih Bukhari', color: 'emerald' },
  { id: 'muslim', name: 'Sahih Muslim', nameFr: 'Sahih Mouslim', nameAr: 'صحيح مسلم', source: 'Sahih Muslim', color: 'blue' },
  { id: 'abudawud', name: 'Sunan Abu Dawud', nameFr: 'Sunan Abou Daoud', nameAr: 'سنن أبي داود', source: "Sunan Abi Da'ud", color: 'purple' },
  { id: 'tirmidhi', name: 'Jami at-Tirmidhi', nameFr: 'Jami at-Tirmidhi', nameAr: 'جامع الترمذي', source: "Jami' al-Tirmidhi", color: 'amber' },
  { id: 'nasai', name: 'Sunan an-Nasai', nameFr: 'Sunan an-Nasai', nameAr: 'سنن النسائي', source: "Sunan an-Nasa'i", color: 'rose' },
  { id: 'ibnmajah', name: 'Sunan Ibn Majah', nameFr: 'Sunan Ibn Majah', nameAr: 'سنن ابن ماجه', source: 'Sunan Ibn Majah', color: 'indigo' },
]

// Cache for loaded hadith data
let localHadithCache = null
let chaptersCache = {}

// Load all local hadith data
export async function loadLocalHadiths() {
  if (localHadithCache) return localHadithCache

  try {
    const [bukhari, muslim, abuDawud, tirmidhi, nasai, ibnMajah] = await Promise.all([
      fetch('/hadith/Bukhari.json').then(r => r.json()),
      fetch('/hadith/Muslim.json').then(r => r.json()),
      fetch('/hadith/AbouDaoud.json').then(r => r.json()),
      fetch('/hadith/Tirmidhi.json').then(r => r.json()),
      fetch('/hadith/Nasai.json').then(r => r.json()),
      fetch('/hadith/IbnMajah.json').then(r => r.json()),
    ])
    localHadithCache = [...bukhari, ...muslim, ...abuDawud, ...tirmidhi, ...nasai, ...ibnMajah]
    return localHadithCache
  } catch (error) {
    console.error('Error loading local hadiths:', error)
    return []
  }
}

// Get hadiths by book
export async function getHadithsByBook(bookSource) {
  const hadiths = await loadLocalHadiths()
  return hadiths.filter(h => h.source === bookSource)
}

// Get chapters for a book
export async function getChaptersForBook(bookSource) {
  const cacheKey = bookSource
  if (chaptersCache[cacheKey]) return chaptersCache[cacheKey]

  const hadiths = await getHadithsByBook(bookSource)
  const chaptersMap = new Map()

  hadiths.forEach(h => {
    if (!chaptersMap.has(h.chapter_no)) {
      chaptersMap.set(h.chapter_no, {
        number: h.chapter_no,
        name: h.chapter,
        count: 0
      })
    }
    chaptersMap.get(h.chapter_no).count++
  })

  const chapters = Array.from(chaptersMap.values()).sort((a, b) => a.number - b.number)
  chaptersCache[cacheKey] = chapters
  return chapters
}

// Get hadiths by chapter
export async function getHadithsByChapter(bookSource, chapterNo) {
  const hadiths = await getHadithsByBook(bookSource)
  return hadiths.filter(h => h.chapter_no === chapterNo).sort((a, b) => a.hadith_no - b.hadith_no)
}

// Search in local hadiths
export async function searchLocalHadiths(query, bookFilter = null) {
  const hadiths = await loadLocalHadiths()
  const queryLower = query.toLowerCase()
  const queryArabic = query

  let filtered = hadiths.filter(h => {
    const matchesArabic = h.text_ar?.includes(queryArabic)
    const matchesEnglish = h.text_en?.toLowerCase().includes(queryLower)
    const matchesChapter = h.chapter?.toLowerCase().includes(queryLower)
    return matchesArabic || matchesEnglish || matchesChapter
  })

  if (bookFilter) {
    filtered = filtered.filter(h => h.source === bookFilter)
  }

  return filtered.slice(0, 100) // Limit results
}

// Parse Dorar HTML response
function parseDorarHtml(html) {
  const results = []
  const hadithBlocks = html.split('--------------')

  hadithBlocks.forEach(block => {
    if (!block.trim()) return

    const hadithMatch = block.match(/<div class="hadith"[^>]*>([\s\S]*?)<\/div>/)
    const narratorMatch = block.match(/الراوي:<\/span>\s*([^<]+)/)
    const muhaddithMatch = block.match(/المحدث:<\/span>\s*([^<\n]+)/)
    const sourceMatch = block.match(/المصدر:<\/span>\s*([^<\n]+)/)
    const pageMatch = block.match(/الصفحة أو الرقم:<\/span>\s*([^<\n]+)/)
    const gradeMatch = block.match(/خلاصة حكم المحدث:<\/span>\s*<span[^>]*>([^<]+)<\/span>/)

    if (hadithMatch) {
      // Clean hadith text from HTML tags
      let text = hadithMatch[1]
        .replace(/<span class="search-keys">([^<]*)<\/span>/g, '$1')
        .replace(/<[^>]+>/g, '')
        .trim()

      results.push({
        text_ar: text,
        narrator: narratorMatch?.[1]?.trim() || '',
        muhaddith: muhaddithMatch?.[1]?.trim() || '',
        source: sourceMatch?.[1]?.trim() || '',
        page: pageMatch?.[1]?.trim() || '',
        grade: gradeMatch?.[1]?.trim() || '',
      })
    }
  })

  return results
}

// Search using Dorar API
export async function searchDorar(query) {
  try {
    // Use CORS proxy for direct Dorar API (most reliable)
    const dorarUrl = `https://dorar.net/dorar_api.json?skey=${encodeURIComponent(query)}`
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(dorarUrl)}`

    const response = await fetch(proxyUrl)
    if (response.ok) {
      const data = await response.json()
      if (data.ahadith?.result) {
        return parseDorarHtml(data.ahadith.result)
      }
    }

    return []
  } catch (error) {
    console.error('Dorar API error:', error)

    // Fallback: try wrapper API with CORS proxy
    try {
      const wrapperUrl = `${DORAR_API_BASE}/site/hadith/search?value=${encodeURIComponent(query)}`
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(wrapperUrl)}`

      const response = await fetch(proxyUrl)
      if (response.ok) {
        const data = await response.json()
        if (data.data) {
          return data.data.map(h => ({
            id: h.id,
            text_ar: h.hadith,
            narrator: h.rawi,
            muhaddith: h.mohadith,
            source: h.book,
            grade: h.grade,
          }))
        }
      }
    } catch (e) {
      console.error('Wrapper API error:', e)
    }

    return []
  }
}

// Get grade color class
export function getGradeColor(grade) {
  if (!grade) return 'gray'
  const gradeLower = grade.toLowerCase()

  if (gradeLower.includes('صحيح') || gradeLower.includes('sahih')) return 'green'
  if (gradeLower.includes('حسن') || gradeLower.includes('hasan')) return 'emerald'
  if (gradeLower.includes('ضعيف') || gradeLower.includes('weak')) return 'orange'
  if (gradeLower.includes('موضوع') || gradeLower.includes('fabricated')) return 'red'

  return 'gray'
}

// Get book stats
export async function getBookStats() {
  const hadiths = await loadLocalHadiths()
  const stats = {}

  HADITH_BOOKS.forEach(book => {
    stats[book.id] = {
      ...book,
      count: hadiths.filter(h => h.source === book.source).length
    }
  })

  return stats
}
