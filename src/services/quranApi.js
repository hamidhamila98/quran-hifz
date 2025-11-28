// Quran API Service
// Uses AlQuran.cloud for text, cpfair/quran-tajweed for accurate tajweed, and EveryAyah/Islamic Network CDN for audio

import { getVerseWithTajweed, hasTajweedData, getCpfairText, getVerseWordsWithTajweed } from './cpfairTajweed'

const TEXT_API_BASE = 'https://api.alquran.cloud/v1';
const QURAN_COM_API = 'https://api.quran.com/api/v4';
const AUDIO_CDN_BASE = 'https://cdn.islamic.network/quran/audio';

// Available reciters with their identifiers
export const RECITERS = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', everyAyahId: 'Alafasy_128kbps' },
  { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit (Murattal)', everyAyahId: 'Abdul_Basit_Murattal_192kbps' },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary', everyAyahId: 'Husary_128kbps' },
  { id: 'ar.minshawi', name: 'Mohamed Siddiq El-Minshawi', everyAyahId: 'Minshawy_Murattal_128kbps' },
  { id: 'ar.abdulsamad', name: 'Abdul Samad', everyAyahId: 'AbdulSamad_64kbps_QuranExplorer.Com' },
];

// Tajweed CSS classes from Quran.com API
// The API returns HTML with <tajweed class=...> tags
// We just need to define the CSS colors for these classes
export const TAJWEED_CLASSES = {
  'ham_wasl': { color: '#AAAAAA', name: 'Hamza Wasl' },
  'slnt': { color: '#AAAAAA', name: 'Silent' },
  'laam_shamsiyah': { color: '#AAAAAA', name: 'Lam Shamsiyya' },
  'madda_normal': { color: '#537FFF', name: 'Madd Normal' },
  'madda_permissible': { color: '#4DBA6F', name: 'Madd Permissible' },
  'madda_obligatory': { color: '#000EAD', name: 'Madd Obligatory' },
  'madda_necessary': { color: '#DD2222', name: 'Madd Necessary' },
  'qalpieces': { color: '#DD2222', name: 'Qalqala' },
  'ikhf_shfw': { color: '#D500B7', name: 'Ikhfa Shafawi' },
  'ikhf': { color: '#9400A8', name: 'Ikhfa' },
  'idghm_shfw': { color: '#58B800', name: 'Idgham Shafawi' },
  'iqlb': { color: '#26BFFD', name: 'Iqlab' },
  'idgh_ghn': { color: '#169777', name: 'Idgham with Ghunna' },
  'idgh_w_ghn': { color: '#169200', name: 'Idgham without Ghunna' },
  'idgh_mus': { color: '#A1A1A1', name: 'Idgham Mutajanisayn' },
  'ghn': { color: '#FF7E1E', name: 'Ghunna' },
};

// Available Arabic fonts
export const ARABIC_FONTS = [
  // Polices existantes
  { id: 'amiri-quran', name: 'Amiri Quran', family: "'Amiri Quran', 'Amiri', serif" },
  { id: 'amiri', name: 'Amiri', family: "'Amiri', serif" },
  { id: 'scheherazade', name: 'Scheherazade New', family: "'Scheherazade New', serif" },
  { id: 'noto-naskh', name: 'Noto Naskh Arabic', family: "'Noto Naskh Arabic', serif" },
  { id: 'kitab', name: 'Kitab', family: "'Kitab', serif" },
  // Nouvelles polices Google Fonts
  { id: 'noto-kufi', name: 'Noto Kufi Arabic', family: "'Noto Kufi Arabic', sans-serif" },
  { id: 'noto-nastaliq', name: 'Noto Nastaliq Urdu', family: "'Noto Nastaliq Urdu', serif" },
  { id: 'lateef', name: 'Lateef', family: "'Lateef', serif" },
  { id: 'reem-kufi', name: 'Reem Kufi', family: "'Reem Kufi', sans-serif" },
  { id: 'aref-ruqaa', name: 'Aref Ruqaa', family: "'Aref Ruqaa', serif" },
  { id: 'mada', name: 'Mada', family: "'Mada', sans-serif" },
  { id: 'harmattan', name: 'Harmattan', family: "'Harmattan', sans-serif" },
  { id: 'markazi', name: 'Markazi Text', family: "'Markazi Text', serif" },
  // Polices Quran spécialisées (CDN)
  { id: 'kfgqpc-uthmanic', name: 'KFGQPC Uthmanic (Mushaf Médine)', family: "'KFGQPC Uthmanic Script HAFS', 'Amiri Quran', serif" },
  { id: 'me-quran', name: 'Me Quran', family: "'Me Quran', 'Amiri Quran', serif" },
];

// Fetch a specific page of the Mushaf (1-604)
// Uses cpfair/quran-tajweed for accurate tajweed when enabled
export async function getPage(pageNumber, useTajweed = false, options = {}) {
  try {
    // Use AlQuran.cloud for text
    const response = await fetch(`${TEXT_API_BASE}/page/${pageNumber}/quran-uthmani`);
    if (!response.ok) throw new Error('Failed to fetch page');
    const data = await response.json();

    // Apply cpfair tajweed if enabled - uses cpfair's own text for accurate positions
    if (useTajweed && data.data && data.data.ayahs) {
      data.data.ayahs = data.data.ayahs.map(ayah => {
        if (hasTajweedData(ayah.surah.number, ayah.numberInSurah)) {
          const tajweedText = getVerseWithTajweed(ayah.surah.number, ayah.numberInSurah);
          if (tajweedText) {
            return {
              ...ayah,
              text: tajweedText
            };
          }
        }
        return ayah;
      });
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching page:', error);
    throw error;
  }
}

// Fetch a specific surah
export async function getSurah(surahNumber) {
  try {
    const response = await fetch(`${TEXT_API_BASE}/surah/${surahNumber}/quran-uthmani`);
    if (!response.ok) throw new Error('Failed to fetch surah');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching surah:', error);
    throw error;
  }
}

// Fetch a specific ayah
export async function getAyah(surahNumber, ayahNumber) {
  try {
    const response = await fetch(`${TEXT_API_BASE}/ayah/${surahNumber}:${ayahNumber}/quran-uthmani`);
    if (!response.ok) throw new Error('Failed to fetch ayah');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching ayah:', error);
    throw error;
  }
}

// Fetch multiple pages at once
export async function getPages(startPage, endPage) {
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    const page = await getPage(i);
    pages.push(page);
  }
  return pages;
}

// Get audio URL for a specific ayah
export function getAudioUrl(ayahNumber, reciterId = 'ar.alafasy', bitrate = 128) {
  return `${AUDIO_CDN_BASE}/${bitrate}/${reciterId}/${ayahNumber}.mp3`;
}

// Get audio URL using EveryAyah format (surah:ayah)
export function getEveryAyahUrl(surahNumber, ayahNumber, reciterEveryAyahId = 'Alafasy_128kbps') {
  const surahPadded = String(surahNumber).padStart(3, '0');
  const ayahPadded = String(ayahNumber).padStart(3, '0');
  return `https://everyayah.com/data/${reciterEveryAyahId}/${surahPadded}${ayahPadded}.mp3`;
}

// Fetch all surahs metadata
export async function getAllSurahs() {
  try {
    const response = await fetch(`${TEXT_API_BASE}/surah`);
    if (!response.ok) throw new Error('Failed to fetch surahs');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching surahs:', error);
    throw error;
  }
}

// Calculate which ayahs are on a specific page
export function getAyahsOnPage(pageData) {
  return pageData.ayahs || [];
}

// Get ayahs for a range of pages
export async function getAyahsInPageRange(startPage, endPage, useTajweed = false) {
  const allAyahs = [];
  for (let page = startPage; page <= endPage; page++) {
    const pageData = await getPage(page, useTajweed);
    allAyahs.push(...pageData.ayahs);
  }
  return allAyahs;
}

// Estimate lines per ayah (approximate based on text length)
// A Mushaf page typically has 15 lines
export function estimateLines(ayahText) {
  // Average characters per line in Uthmani script is approximately 45-50
  const charsPerLine = 47;
  return Math.ceil(ayahText.length / charsPerLine);
}

// Get portion of ayahs based on line count
export function getAyahsByLineCount(ayahs, targetLines) {
  let currentLines = 0;
  const selectedAyahs = [];

  for (const ayah of ayahs) {
    const ayahLines = estimateLines(ayah.text);

    // If adding this ayah would exceed target, check if we should include it
    if (currentLines + ayahLines > targetLines && selectedAyahs.length > 0) {
      // Don't cut in the middle of a verse - include it fully or not at all
      // If we're close enough (within 1 line), include it
      if (targetLines - currentLines >= ayahLines * 0.5) {
        selectedAyahs.push(ayah);
      }
      break;
    }

    selectedAyahs.push(ayah);
    currentLines += ayahLines;
  }

  return selectedAyahs;
}

// Search in Quran
export async function searchQuran(query) {
  try {
    const response = await fetch(`${TEXT_API_BASE}/search/${encodeURIComponent(query)}/all/ar`);
    if (!response.ok) throw new Error('Failed to search');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
}

// Get juz (part) - there are 30 juz
export async function getJuz(juzNumber) {
  try {
    const response = await fetch(`${TEXT_API_BASE}/juz/${juzNumber}/quran-uthmani`);
    if (!response.ok) throw new Error('Failed to fetch juz');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching juz:', error);
    throw error;
  }
}

// Get page with word-level line numbers from Quran.com API
// Uses cpfair/quran-tajweed for accurate character-level tajweed annotations
export async function getPageWithLines(pageNumber, useTajweed = false, options = {}) {
  try {
    // Always fetch plain text - we'll apply cpfair tajweed if needed
    const response = await fetch(
      `${QURAN_COM_API}/verses/by_page/${pageNumber}?words=true&word_fields=line_number,page_number,text_uthmani`
    );
    if (!response.ok) throw new Error('Failed to fetch page with lines');
    const data = await response.json();

    // Build line-by-line structure for Mushaf-style display
    const linesMap = new Map();
    for (let i = 1; i <= 15; i++) {
      linesMap.set(i, []);
    }

    // Process verses and extract line information
    const verses = data.verses.map(verse => {
      const words = verse.words || [];
      const lineNumbers = [...new Set(words.map(w => w.line_number))];
      const surahNumber = parseInt(verse.verse_key.split(':')[0]);
      const verseNumber = verse.verse_number;

      // Get word-level tajweed if enabled
      let cpfairWords = null;
      if (useTajweed && hasTajweedData(surahNumber, verseNumber)) {
        cpfairWords = getVerseWordsWithTajweed(surahNumber, verseNumber);
      }

      // Track cpfair word index (skip end markers)
      let cpfairWordIndex = 0;

      // Track which words go on which lines (for line-by-line display)
      words.forEach(word => {
        const lineNum = word.line_number;
        if (lineNum >= 1 && lineNum <= 15) {
          const isEndMarker = word.char_type_name === 'end';

          // Get tajweed HTML for this word
          let tajweedHtml = null;
          if (!isEndMarker && cpfairWords && cpfairWordIndex < cpfairWords.length) {
            tajweedHtml = cpfairWords[cpfairWordIndex].html;
            cpfairWordIndex++;
          }

          linesMap.get(lineNum).push({
            text: word.text_uthmani,
            tajweedHtml: tajweedHtml,
            charType: word.char_type_name,
            position: word.position,
            verseKey: verse.verse_key,
            verseNumber: verseNumber,
            surahNumber: surahNumber,
            isEndMarker: isEndMarker
          });
        }
      });

      // Get plain text (without end markers)
      const plainText = words
        .filter(w => w.char_type_name !== 'end')
        .map(w => w.text_uthmani)
        .join(' ');

      // Apply cpfair tajweed if enabled - uses cpfair's own text for accurate positions
      let text = plainText;
      if (useTajweed && hasTajweedData(surahNumber, verseNumber)) {
        const tajweedText = getVerseWithTajweed(surahNumber, verseNumber);
        if (tajweedText) {
          text = tajweedText;
        }
      }

      return {
        id: verse.id,
        verseKey: verse.verse_key,
        verseNumber: verseNumber,
        surahNumber: surahNumber,
        pageNumber: verse.page_number,
        juzNumber: verse.juz_number,
        text: text,
        words: words,
        lineNumbers: lineNumbers,
        startLine: Math.min(...lineNumbers),
        endLine: Math.max(...lineNumbers)
      };
    });

    // Convert linesMap to array
    const lines = [];
    for (let i = 1; i <= 15; i++) {
      const lineWords = linesMap.get(i);
      if (lineWords.length > 0) {
        lines.push({
          lineNumber: i,
          words: lineWords
        });
      }
    }

    return {
      pageNumber,
      verses,
      lines, // Line-by-line structure for Mushaf display
      totalLines: 15 // Madani Mushaf has 15 lines per page
    };
  } catch (error) {
    console.error('Error fetching page with lines:', error);
    throw error;
  }
}

// Group verses by their line numbers on a page
export function groupVersesByLines(pageData) {
  const lineMap = new Map();

  // Initialize all 15 lines
  for (let i = 1; i <= 15; i++) {
    lineMap.set(i, []);
  }

  // Assign verses to lines (a verse can span multiple lines)
  pageData.verses.forEach(verse => {
    verse.lineNumbers.forEach(lineNum => {
      if (!lineMap.get(lineNum).find(v => v.verseKey === verse.verseKey)) {
        lineMap.get(lineNum).push(verse);
      }
    });
  });

  return lineMap;
}

// Get page data organized by lines for Mushaf-style display
// Returns an array of 15 lines, each containing words with their metadata
export async function getPageMushafStyle(pageNumber, options = {}) {
  try {
    const response = await fetch(
      `${QURAN_COM_API}/verses/by_page/${pageNumber}?words=true&word_fields=line_number,page_number,text_uthmani,char_type_name`
    );
    if (!response.ok) throw new Error('Failed to fetch page');
    const data = await response.json();

    // Initialize 15 lines (standard Madani Mushaf)
    const lines = Array.from({ length: 15 }, (_, i) => ({
      lineNumber: i + 1,
      words: []
    }));

    // Process each verse and distribute words to their lines
    data.verses.forEach(verse => {
      const surahNumber = parseInt(verse.verse_key.split(':')[0]);
      const verseNumber = verse.verse_number;

      (verse.words || []).forEach(word => {
        const lineIndex = word.line_number - 1;
        if (lineIndex >= 0 && lineIndex < 15) {
          lines[lineIndex].words.push({
            text: word.text_uthmani,
            charType: word.char_type_name,
            position: word.position,
            verseKey: verse.verse_key,
            verseNumber: verseNumber,
            surahNumber: surahNumber,
            isEndMarker: word.char_type_name === 'end'
          });
        }
      });
    });

    return {
      pageNumber,
      lines: lines.filter(line => line.words.length > 0), // Only return non-empty lines
      totalLines: 15
    };
  } catch (error) {
    console.error('Error fetching Mushaf page:', error);
    throw error;
  }
}

// Get verses for a specific range of lines across pages
export async function getVersesByLineRange(startPage, startLine, lineCount, useTajweed = false) {
  const result = {
    verses: [],
    startPage,
    startLine,
    endPage: startPage,
    endLine: startLine,
    actualLineCount: 0
  };

  let currentPage = startPage;
  let currentLine = startLine;
  let linesWithVerses = 0;
  const seenVerseKeys = new Set();

  // Continue until we have enough lines WITH verses
  while (linesWithVerses < lineCount && currentPage <= 604) {
    const pageData = await getPageWithLines(currentPage, useTajweed);
    const lineMap = groupVersesByLines(pageData);

    while (currentLine <= 15 && linesWithVerses < lineCount) {
      const versesOnLine = lineMap.get(currentLine) || [];

      // Only count lines that have verses
      if (versesOnLine.length > 0) {
        versesOnLine.forEach(verse => {
          if (!seenVerseKeys.has(verse.verseKey)) {
            seenVerseKeys.add(verse.verseKey);
            result.verses.push(verse);
          }
        });
        linesWithVerses++;
        result.endPage = currentPage;
        result.endLine = currentLine;
      }

      currentLine++;
    }

    // Move to next page if needed
    if (linesWithVerses < lineCount && currentLine > 15) {
      currentPage++;
      currentLine = 1;
    }
  }

  result.actualLineCount = linesWithVerses;
  return result;
}

// Calculate total lines in the Quran (604 pages × 15 lines)
export const TOTAL_QURAN_LINES = 604 * 15; // 9060 lines

// Convert page/line position to absolute line number
export function toAbsoluteLine(page, line) {
  return (page - 1) * 15 + line;
}

// Convert absolute line number to page/line position
export function fromAbsoluteLine(absoluteLine) {
  const page = Math.ceil(absoluteLine / 15);
  const line = absoluteLine - (page - 1) * 15;
  return { page, line };
}

// Surah info with page numbers
export const SURAH_INFO = [
  { number: 1, name: "الفاتحة", englishName: "Al-Fatiha", startPage: 1, endPage: 1, ayahCount: 7 },
  { number: 2, name: "البقرة", englishName: "Al-Baqara", startPage: 2, endPage: 49, ayahCount: 286 },
  { number: 3, name: "آل عمران", englishName: "Aal-Imran", startPage: 50, endPage: 76, ayahCount: 200 },
  { number: 4, name: "النساء", englishName: "An-Nisa", startPage: 77, endPage: 106, ayahCount: 176 },
  { number: 5, name: "المائدة", englishName: "Al-Ma'ida", startPage: 106, endPage: 127, ayahCount: 120 },
  { number: 6, name: "الأنعام", englishName: "Al-An'am", startPage: 128, endPage: 150, ayahCount: 165 },
  { number: 7, name: "الأعراف", englishName: "Al-A'raf", startPage: 151, endPage: 176, ayahCount: 206 },
  { number: 8, name: "الأنفال", englishName: "Al-Anfal", startPage: 177, endPage: 186, ayahCount: 75 },
  { number: 9, name: "التوبة", englishName: "At-Tawba", startPage: 187, endPage: 207, ayahCount: 129 },
  { number: 10, name: "يونس", englishName: "Yunus", startPage: 208, endPage: 221, ayahCount: 109 },
  { number: 11, name: "هود", englishName: "Hud", startPage: 221, endPage: 235, ayahCount: 123 },
  { number: 12, name: "يوسف", englishName: "Yusuf", startPage: 235, endPage: 248, ayahCount: 111 },
  { number: 13, name: "الرعد", englishName: "Ar-Ra'd", startPage: 249, endPage: 255, ayahCount: 43 },
  { number: 14, name: "إبراهيم", englishName: "Ibrahim", startPage: 255, endPage: 261, ayahCount: 52 },
  { number: 15, name: "الحجر", englishName: "Al-Hijr", startPage: 262, endPage: 267, ayahCount: 99 },
  { number: 16, name: "النحل", englishName: "An-Nahl", startPage: 267, endPage: 281, ayahCount: 128 },
  { number: 17, name: "الإسراء", englishName: "Al-Isra", startPage: 282, endPage: 293, ayahCount: 111 },
  { number: 18, name: "الكهف", englishName: "Al-Kahf", startPage: 293, endPage: 304, ayahCount: 110 },
  { number: 19, name: "مريم", englishName: "Maryam", startPage: 305, endPage: 312, ayahCount: 98 },
  { number: 20, name: "طه", englishName: "Ta-Ha", startPage: 312, endPage: 321, ayahCount: 135 },
  { number: 21, name: "الأنبياء", englishName: "Al-Anbiya", startPage: 322, endPage: 331, ayahCount: 112 },
  { number: 22, name: "الحج", englishName: "Al-Hajj", startPage: 332, endPage: 341, ayahCount: 78 },
  { number: 23, name: "المؤمنون", englishName: "Al-Mu'minun", startPage: 342, endPage: 349, ayahCount: 118 },
  { number: 24, name: "النور", englishName: "An-Nur", startPage: 350, endPage: 359, ayahCount: 64 },
  { number: 25, name: "الفرقان", englishName: "Al-Furqan", startPage: 359, endPage: 366, ayahCount: 77 },
  { number: 26, name: "الشعراء", englishName: "Ash-Shu'ara", startPage: 367, endPage: 376, ayahCount: 227 },
  { number: 27, name: "النمل", englishName: "An-Naml", startPage: 377, endPage: 385, ayahCount: 93 },
  { number: 28, name: "القصص", englishName: "Al-Qasas", startPage: 385, endPage: 396, ayahCount: 88 },
  { number: 29, name: "العنكبوت", englishName: "Al-Ankabut", startPage: 396, endPage: 404, ayahCount: 69 },
  { number: 30, name: "الروم", englishName: "Ar-Rum", startPage: 404, endPage: 410, ayahCount: 60 },
  { number: 31, name: "لقمان", englishName: "Luqman", startPage: 411, endPage: 414, ayahCount: 34 },
  { number: 32, name: "السجدة", englishName: "As-Sajda", startPage: 415, endPage: 417, ayahCount: 30 },
  { number: 33, name: "الأحزاب", englishName: "Al-Ahzab", startPage: 418, endPage: 427, ayahCount: 73 },
  { number: 34, name: "سبأ", englishName: "Saba", startPage: 428, endPage: 434, ayahCount: 54 },
  { number: 35, name: "فاطر", englishName: "Fatir", startPage: 434, endPage: 440, ayahCount: 45 },
  { number: 36, name: "يس", englishName: "Ya-Sin", startPage: 440, endPage: 445, ayahCount: 83 },
  { number: 37, name: "الصافات", englishName: "As-Saffat", startPage: 446, endPage: 452, ayahCount: 182 },
  { number: 38, name: "ص", englishName: "Sad", startPage: 453, endPage: 458, ayahCount: 88 },
  { number: 39, name: "الزمر", englishName: "Az-Zumar", startPage: 458, endPage: 467, ayahCount: 75 },
  { number: 40, name: "غافر", englishName: "Ghafir", startPage: 467, endPage: 476, ayahCount: 85 },
  { number: 41, name: "فصلت", englishName: "Fussilat", startPage: 477, endPage: 482, ayahCount: 54 },
  { number: 42, name: "الشورى", englishName: "Ash-Shura", startPage: 483, endPage: 489, ayahCount: 53 },
  { number: 43, name: "الزخرف", englishName: "Az-Zukhruf", startPage: 489, endPage: 495, ayahCount: 89 },
  { number: 44, name: "الدخان", englishName: "Ad-Dukhan", startPage: 496, endPage: 498, ayahCount: 59 },
  { number: 45, name: "الجاثية", englishName: "Al-Jathiya", startPage: 499, endPage: 502, ayahCount: 37 },
  { number: 46, name: "الأحقاف", englishName: "Al-Ahqaf", startPage: 502, endPage: 506, ayahCount: 35 },
  { number: 47, name: "محمد", englishName: "Muhammad", startPage: 507, endPage: 510, ayahCount: 38 },
  { number: 48, name: "الفتح", englishName: "Al-Fath", startPage: 511, endPage: 515, ayahCount: 29 },
  { number: 49, name: "الحجرات", englishName: "Al-Hujurat", startPage: 515, endPage: 517, ayahCount: 18 },
  { number: 50, name: "ق", englishName: "Qaf", startPage: 518, endPage: 520, ayahCount: 45 },
  { number: 51, name: "الذاريات", englishName: "Adh-Dhariyat", startPage: 520, endPage: 523, ayahCount: 60 },
  { number: 52, name: "الطور", englishName: "At-Tur", startPage: 523, endPage: 525, ayahCount: 49 },
  { number: 53, name: "النجم", englishName: "An-Najm", startPage: 526, endPage: 528, ayahCount: 62 },
  { number: 54, name: "القمر", englishName: "Al-Qamar", startPage: 528, endPage: 531, ayahCount: 55 },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahman", startPage: 531, endPage: 534, ayahCount: 78 },
  { number: 56, name: "الواقعة", englishName: "Al-Waqi'a", startPage: 534, endPage: 537, ayahCount: 96 },
  { number: 57, name: "الحديد", englishName: "Al-Hadid", startPage: 537, endPage: 541, ayahCount: 29 },
  { number: 58, name: "المجادلة", englishName: "Al-Mujadila", startPage: 542, endPage: 545, ayahCount: 22 },
  { number: 59, name: "الحشر", englishName: "Al-Hashr", startPage: 545, endPage: 548, ayahCount: 24 },
  { number: 60, name: "الممتحنة", englishName: "Al-Mumtahina", startPage: 549, endPage: 551, ayahCount: 13 },
  { number: 61, name: "الصف", englishName: "As-Saff", startPage: 551, endPage: 552, ayahCount: 14 },
  { number: 62, name: "الجمعة", englishName: "Al-Jumu'a", startPage: 553, endPage: 554, ayahCount: 11 },
  { number: 63, name: "المنافقون", englishName: "Al-Munafiqun", startPage: 554, endPage: 555, ayahCount: 11 },
  { number: 64, name: "التغابن", englishName: "At-Taghabun", startPage: 556, endPage: 557, ayahCount: 18 },
  { number: 65, name: "الطلاق", englishName: "At-Talaq", startPage: 558, endPage: 559, ayahCount: 12 },
  { number: 66, name: "التحريم", englishName: "At-Tahrim", startPage: 560, endPage: 561, ayahCount: 12 },
  { number: 67, name: "الملك", englishName: "Al-Mulk", startPage: 562, endPage: 564, ayahCount: 30 },
  { number: 68, name: "القلم", englishName: "Al-Qalam", startPage: 564, endPage: 566, ayahCount: 52 },
  { number: 69, name: "الحاقة", englishName: "Al-Haqqa", startPage: 566, endPage: 568, ayahCount: 52 },
  { number: 70, name: "المعارج", englishName: "Al-Ma'arij", startPage: 568, endPage: 570, ayahCount: 44 },
  { number: 71, name: "نوح", englishName: "Nuh", startPage: 570, endPage: 571, ayahCount: 28 },
  { number: 72, name: "الجن", englishName: "Al-Jinn", startPage: 572, endPage: 573, ayahCount: 28 },
  { number: 73, name: "المزمل", englishName: "Al-Muzzammil", startPage: 574, endPage: 575, ayahCount: 20 },
  { number: 74, name: "المدثر", englishName: "Al-Muddaththir", startPage: 575, endPage: 577, ayahCount: 56 },
  { number: 75, name: "القيامة", englishName: "Al-Qiyama", startPage: 577, endPage: 578, ayahCount: 40 },
  { number: 76, name: "الإنسان", englishName: "Al-Insan", startPage: 578, endPage: 580, ayahCount: 31 },
  { number: 77, name: "المرسلات", englishName: "Al-Mursalat", startPage: 580, endPage: 581, ayahCount: 50 },
  { number: 78, name: "النبأ", englishName: "An-Naba", startPage: 582, endPage: 583, ayahCount: 40 },
  { number: 79, name: "النازعات", englishName: "An-Nazi'at", startPage: 583, endPage: 584, ayahCount: 46 },
  { number: 80, name: "عبس", englishName: "Abasa", startPage: 585, endPage: 585, ayahCount: 42 },
  { number: 81, name: "التكوير", englishName: "At-Takwir", startPage: 586, endPage: 586, ayahCount: 29 },
  { number: 82, name: "الانفطار", englishName: "Al-Infitar", startPage: 587, endPage: 587, ayahCount: 19 },
  { number: 83, name: "المطففين", englishName: "Al-Mutaffifin", startPage: 587, endPage: 589, ayahCount: 36 },
  { number: 84, name: "الانشقاق", englishName: "Al-Inshiqaq", startPage: 589, endPage: 589, ayahCount: 25 },
  { number: 85, name: "البروج", englishName: "Al-Buruj", startPage: 590, endPage: 590, ayahCount: 22 },
  { number: 86, name: "الطارق", englishName: "At-Tariq", startPage: 591, endPage: 591, ayahCount: 17 },
  { number: 87, name: "الأعلى", englishName: "Al-A'la", startPage: 591, endPage: 592, ayahCount: 19 },
  { number: 88, name: "الغاشية", englishName: "Al-Ghashiya", startPage: 592, endPage: 592, ayahCount: 26 },
  { number: 89, name: "الفجر", englishName: "Al-Fajr", startPage: 593, endPage: 594, ayahCount: 30 },
  { number: 90, name: "البلد", englishName: "Al-Balad", startPage: 594, endPage: 594, ayahCount: 20 },
  { number: 91, name: "الشمس", englishName: "Ash-Shams", startPage: 595, endPage: 595, ayahCount: 15 },
  { number: 92, name: "الليل", englishName: "Al-Layl", startPage: 595, endPage: 596, ayahCount: 21 },
  { number: 93, name: "الضحى", englishName: "Ad-Duha", startPage: 596, endPage: 596, ayahCount: 11 },
  { number: 94, name: "الشرح", englishName: "Ash-Sharh", startPage: 596, endPage: 596, ayahCount: 8 },
  { number: 95, name: "التين", englishName: "At-Tin", startPage: 597, endPage: 597, ayahCount: 8 },
  { number: 96, name: "العلق", englishName: "Al-Alaq", startPage: 597, endPage: 597, ayahCount: 19 },
  { number: 97, name: "القدر", englishName: "Al-Qadr", startPage: 598, endPage: 598, ayahCount: 5 },
  { number: 98, name: "البينة", englishName: "Al-Bayyina", startPage: 598, endPage: 599, ayahCount: 8 },
  { number: 99, name: "الزلزلة", englishName: "Az-Zalzala", startPage: 599, endPage: 599, ayahCount: 8 },
  { number: 100, name: "العاديات", englishName: "Al-Adiyat", startPage: 599, endPage: 600, ayahCount: 11 },
  { number: 101, name: "القارعة", englishName: "Al-Qari'a", startPage: 600, endPage: 600, ayahCount: 11 },
  { number: 102, name: "التكاثر", englishName: "At-Takathur", startPage: 600, endPage: 600, ayahCount: 8 },
  { number: 103, name: "العصر", englishName: "Al-Asr", startPage: 601, endPage: 601, ayahCount: 3 },
  { number: 104, name: "الهمزة", englishName: "Al-Humaza", startPage: 601, endPage: 601, ayahCount: 9 },
  { number: 105, name: "الفيل", englishName: "Al-Fil", startPage: 601, endPage: 601, ayahCount: 5 },
  { number: 106, name: "قريش", englishName: "Quraysh", startPage: 602, endPage: 602, ayahCount: 4 },
  { number: 107, name: "الماعون", englishName: "Al-Ma'un", startPage: 602, endPage: 602, ayahCount: 7 },
  { number: 108, name: "الكوثر", englishName: "Al-Kawthar", startPage: 602, endPage: 602, ayahCount: 3 },
  { number: 109, name: "الكافرون", englishName: "Al-Kafirun", startPage: 603, endPage: 603, ayahCount: 6 },
  { number: 110, name: "النصر", englishName: "An-Nasr", startPage: 603, endPage: 603, ayahCount: 3 },
  { number: 111, name: "المسد", englishName: "Al-Masad", startPage: 603, endPage: 603, ayahCount: 5 },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas", startPage: 604, endPage: 604, ayahCount: 4 },
  { number: 113, name: "الفلق", englishName: "Al-Falaq", startPage: 604, endPage: 604, ayahCount: 5 },
  { number: 114, name: "الناس", englishName: "An-Nas", startPage: 604, endPage: 604, ayahCount: 6 },
];

// Juz (Part) info with page numbers - 30 Juz total
export const JUZ_INFO = [
  { number: 1, name: "الجزء الأول", englishName: "Juz 1", startPage: 1, endPage: 21 },
  { number: 2, name: "الجزء الثاني", englishName: "Juz 2", startPage: 22, endPage: 41 },
  { number: 3, name: "الجزء الثالث", englishName: "Juz 3", startPage: 42, endPage: 61 },
  { number: 4, name: "الجزء الرابع", englishName: "Juz 4", startPage: 62, endPage: 81 },
  { number: 5, name: "الجزء الخامس", englishName: "Juz 5", startPage: 82, endPage: 101 },
  { number: 6, name: "الجزء السادس", englishName: "Juz 6", startPage: 102, endPage: 121 },
  { number: 7, name: "الجزء السابع", englishName: "Juz 7", startPage: 122, endPage: 141 },
  { number: 8, name: "الجزء الثامن", englishName: "Juz 8", startPage: 142, endPage: 161 },
  { number: 9, name: "الجزء التاسع", englishName: "Juz 9", startPage: 162, endPage: 181 },
  { number: 10, name: "الجزء العاشر", englishName: "Juz 10", startPage: 182, endPage: 201 },
  { number: 11, name: "الجزء الحادي عشر", englishName: "Juz 11", startPage: 202, endPage: 221 },
  { number: 12, name: "الجزء الثاني عشر", englishName: "Juz 12", startPage: 222, endPage: 241 },
  { number: 13, name: "الجزء الثالث عشر", englishName: "Juz 13", startPage: 242, endPage: 261 },
  { number: 14, name: "الجزء الرابع عشر", englishName: "Juz 14", startPage: 262, endPage: 281 },
  { number: 15, name: "الجزء الخامس عشر", englishName: "Juz 15", startPage: 282, endPage: 301 },
  { number: 16, name: "الجزء السادس عشر", englishName: "Juz 16", startPage: 302, endPage: 321 },
  { number: 17, name: "الجزء السابع عشر", englishName: "Juz 17", startPage: 322, endPage: 341 },
  { number: 18, name: "الجزء الثامن عشر", englishName: "Juz 18", startPage: 342, endPage: 361 },
  { number: 19, name: "الجزء التاسع عشر", englishName: "Juz 19", startPage: 362, endPage: 381 },
  { number: 20, name: "الجزء العشرون", englishName: "Juz 20", startPage: 382, endPage: 401 },
  { number: 21, name: "الجزء الحادي والعشرون", englishName: "Juz 21", startPage: 402, endPage: 421 },
  { number: 22, name: "الجزء الثاني والعشرون", englishName: "Juz 22", startPage: 422, endPage: 441 },
  { number: 23, name: "الجزء الثالث والعشرون", englishName: "Juz 23", startPage: 442, endPage: 461 },
  { number: 24, name: "الجزء الرابع والعشرون", englishName: "Juz 24", startPage: 462, endPage: 481 },
  { number: 25, name: "الجزء الخامس والعشرون", englishName: "Juz 25", startPage: 482, endPage: 501 },
  { number: 26, name: "الجزء السادس والعشرون", englishName: "Juz 26", startPage: 502, endPage: 521 },
  { number: 27, name: "الجزء السابع والعشرون", englishName: "Juz 27", startPage: 522, endPage: 541 },
  { number: 28, name: "الجزء الثامن والعشرون", englishName: "Juz 28", startPage: 542, endPage: 561 },
  { number: 29, name: "الجزء التاسع والعشرون", englishName: "Juz 29", startPage: 562, endPage: 581 },
  { number: 30, name: "جزء عم", englishName: "Juz Amma", startPage: 582, endPage: 604 },
];

// Hizb info with page numbers - 60 Hizb total (2 per Juz)
export const HIZB_INFO = [
  { number: 1, name: "الحزب ١", englishName: "Hizb 1", startPage: 1, endPage: 11, juz: 1 },
  { number: 2, name: "الحزب ٢", englishName: "Hizb 2", startPage: 12, endPage: 21, juz: 1 },
  { number: 3, name: "الحزب ٣", englishName: "Hizb 3", startPage: 22, endPage: 31, juz: 2 },
  { number: 4, name: "الحزب ٤", englishName: "Hizb 4", startPage: 32, endPage: 41, juz: 2 },
  { number: 5, name: "الحزب ٥", englishName: "Hizb 5", startPage: 42, endPage: 51, juz: 3 },
  { number: 6, name: "الحزب ٦", englishName: "Hizb 6", startPage: 52, endPage: 61, juz: 3 },
  { number: 7, name: "الحزب ٧", englishName: "Hizb 7", startPage: 62, endPage: 71, juz: 4 },
  { number: 8, name: "الحزب ٨", englishName: "Hizb 8", startPage: 72, endPage: 81, juz: 4 },
  { number: 9, name: "الحزب ٩", englishName: "Hizb 9", startPage: 82, endPage: 91, juz: 5 },
  { number: 10, name: "الحزب ١٠", englishName: "Hizb 10", startPage: 92, endPage: 101, juz: 5 },
  { number: 11, name: "الحزب ١١", englishName: "Hizb 11", startPage: 102, endPage: 111, juz: 6 },
  { number: 12, name: "الحزب ١٢", englishName: "Hizb 12", startPage: 112, endPage: 121, juz: 6 },
  { number: 13, name: "الحزب ١٣", englishName: "Hizb 13", startPage: 122, endPage: 131, juz: 7 },
  { number: 14, name: "الحزب ١٤", englishName: "Hizb 14", startPage: 132, endPage: 141, juz: 7 },
  { number: 15, name: "الحزب ١٥", englishName: "Hizb 15", startPage: 142, endPage: 151, juz: 8 },
  { number: 16, name: "الحزب ١٦", englishName: "Hizb 16", startPage: 152, endPage: 161, juz: 8 },
  { number: 17, name: "الحزب ١٧", englishName: "Hizb 17", startPage: 162, endPage: 171, juz: 9 },
  { number: 18, name: "الحزب ١٨", englishName: "Hizb 18", startPage: 172, endPage: 181, juz: 9 },
  { number: 19, name: "الحزب ١٩", englishName: "Hizb 19", startPage: 182, endPage: 191, juz: 10 },
  { number: 20, name: "الحزب ٢٠", englishName: "Hizb 20", startPage: 192, endPage: 201, juz: 10 },
  { number: 21, name: "الحزب ٢١", englishName: "Hizb 21", startPage: 202, endPage: 211, juz: 11 },
  { number: 22, name: "الحزب ٢٢", englishName: "Hizb 22", startPage: 212, endPage: 221, juz: 11 },
  { number: 23, name: "الحزب ٢٣", englishName: "Hizb 23", startPage: 222, endPage: 231, juz: 12 },
  { number: 24, name: "الحزب ٢٤", englishName: "Hizb 24", startPage: 232, endPage: 241, juz: 12 },
  { number: 25, name: "الحزب ٢٥", englishName: "Hizb 25", startPage: 242, endPage: 251, juz: 13 },
  { number: 26, name: "الحزب ٢٦", englishName: "Hizb 26", startPage: 252, endPage: 261, juz: 13 },
  { number: 27, name: "الحزب ٢٧", englishName: "Hizb 27", startPage: 262, endPage: 271, juz: 14 },
  { number: 28, name: "الحزب ٢٨", englishName: "Hizb 28", startPage: 272, endPage: 281, juz: 14 },
  { number: 29, name: "الحزب ٢٩", englishName: "Hizb 29", startPage: 282, endPage: 291, juz: 15 },
  { number: 30, name: "الحزب ٣٠", englishName: "Hizb 30", startPage: 292, endPage: 301, juz: 15 },
  { number: 31, name: "الحزب ٣١", englishName: "Hizb 31", startPage: 302, endPage: 311, juz: 16 },
  { number: 32, name: "الحزب ٣٢", englishName: "Hizb 32", startPage: 312, endPage: 321, juz: 16 },
  { number: 33, name: "الحزب ٣٣", englishName: "Hizb 33", startPage: 322, endPage: 331, juz: 17 },
  { number: 34, name: "الحزب ٣٤", englishName: "Hizb 34", startPage: 332, endPage: 341, juz: 17 },
  { number: 35, name: "الحزب ٣٥", englishName: "Hizb 35", startPage: 342, endPage: 351, juz: 18 },
  { number: 36, name: "الحزب ٣٦", englishName: "Hizb 36", startPage: 352, endPage: 361, juz: 18 },
  { number: 37, name: "الحزب ٣٧", englishName: "Hizb 37", startPage: 362, endPage: 371, juz: 19 },
  { number: 38, name: "الحزب ٣٨", englishName: "Hizb 38", startPage: 372, endPage: 381, juz: 19 },
  { number: 39, name: "الحزب ٣٩", englishName: "Hizb 39", startPage: 382, endPage: 391, juz: 20 },
  { number: 40, name: "الحزب ٤٠", englishName: "Hizb 40", startPage: 392, endPage: 401, juz: 20 },
  { number: 41, name: "الحزب ٤١", englishName: "Hizb 41", startPage: 402, endPage: 411, juz: 21 },
  { number: 42, name: "الحزب ٤٢", englishName: "Hizb 42", startPage: 412, endPage: 421, juz: 21 },
  { number: 43, name: "الحزب ٤٣", englishName: "Hizb 43", startPage: 422, endPage: 431, juz: 22 },
  { number: 44, name: "الحزب ٤٤", englishName: "Hizb 44", startPage: 432, endPage: 441, juz: 22 },
  { number: 45, name: "الحزب ٤٥", englishName: "Hizb 45", startPage: 442, endPage: 451, juz: 23 },
  { number: 46, name: "الحزب ٤٦", englishName: "Hizb 46", startPage: 452, endPage: 461, juz: 23 },
  { number: 47, name: "الحزب ٤٧", englishName: "Hizb 47", startPage: 462, endPage: 471, juz: 24 },
  { number: 48, name: "الحزب ٤٨", englishName: "Hizb 48", startPage: 472, endPage: 481, juz: 24 },
  { number: 49, name: "الحزب ٤٩", englishName: "Hizb 49", startPage: 482, endPage: 491, juz: 25 },
  { number: 50, name: "الحزب ٥٠", englishName: "Hizb 50", startPage: 492, endPage: 501, juz: 25 },
  { number: 51, name: "الحزب ٥١", englishName: "Hizb 51", startPage: 502, endPage: 511, juz: 26 },
  { number: 52, name: "الحزب ٥٢", englishName: "Hizb 52", startPage: 512, endPage: 521, juz: 26 },
  { number: 53, name: "الحزب ٥٣", englishName: "Hizb 53", startPage: 522, endPage: 531, juz: 27 },
  { number: 54, name: "الحزب ٥٤", englishName: "Hizb 54", startPage: 532, endPage: 541, juz: 27 },
  { number: 55, name: "الحزب ٥٥", englishName: "Hizb 55", startPage: 542, endPage: 551, juz: 28 },
  { number: 56, name: "الحزب ٥٦", englishName: "Hizb 56", startPage: 552, endPage: 561, juz: 28 },
  { number: 57, name: "الحزب ٥٧", englishName: "Hizb 57", startPage: 562, endPage: 571, juz: 29 },
  { number: 58, name: "الحزب ٥٨", englishName: "Hizb 58", startPage: 572, endPage: 581, juz: 29 },
  { number: 59, name: "الحزب ٥٩", englishName: "Hizb 59", startPage: 582, endPage: 591, juz: 30 },
  { number: 60, name: "الحزب ٦٠", englishName: "Hizb 60", startPage: 592, endPage: 604, juz: 30 },
];

export default {
  getPage,
  getSurah,
  getAyah,
  getPages,
  getAudioUrl,
  getEveryAyahUrl,
  getAllSurahs,
  getAyahsOnPage,
  getAyahsInPageRange,
  estimateLines,
  getAyahsByLineCount,
  searchQuran,
  getJuz,
  getPageWithLines,
  getPageMushafStyle,
  groupVersesByLines,
  getVersesByLineRange,
  toAbsoluteLine,
  fromAbsoluteLine,
  TOTAL_QURAN_LINES,
  RECITERS,
  ARABIC_FONTS,
  SURAH_INFO,
  JUZ_INFO,
  HIZB_INFO,
};
