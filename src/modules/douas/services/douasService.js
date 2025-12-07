// Service pour les Douas (Hisnul Muslim)
// Source: GitHub wafaaelmaandy/Hisn-Muslim-Json

const STORAGE_KEY = 'myislam_douas_progress'
const FAVORITES_KEY = 'myislam_douas_favorites'

let douasData = null

// Charge les données du JSON
export const loadDouasData = async () => {
  if (douasData) return douasData

  try {
    const response = await fetch('/douas/hisnul-muslim.json')
    douasData = await response.json()
    return douasData
  } catch (error) {
    console.error('Error loading douas data:', error)
    return null
  }
}

// Récupère toutes les catégories
export const getCategories = async () => {
  const data = await loadDouasData()
  return data?.categories || []
}

// Récupère une catégorie par ID
export const getCategoryById = async (categoryId) => {
  const data = await loadDouasData()
  return data?.categories.find(c => c.id === categoryId)
}

// Récupère les duas d'une catégorie
export const getDuasByCategory = async (categoryId) => {
  const data = await loadDouasData()
  const category = data?.categories.find(c => c.id === categoryId)
  if (!category) return []

  return category.duaIds.map(id => data.duas.find(d => d.id === id)).filter(Boolean)
}

// Récupère une dua par ID
export const getDuaById = async (duaId) => {
  const data = await loadDouasData()
  return data?.duas.find(d => d.id === duaId)
}

// Récupère toutes les duas
export const getAllDuas = async () => {
  const data = await loadDouasData()
  return data?.duas || []
}

// Génère l'URL audio pour une dua (utilise l'URL directe du JSON)
export const getAudioUrl = (audioUrl) => {
  // L'URL est maintenant stockée directement dans la dua
  return audioUrl || ''
}

// --- Progression ---

// Récupère la progression sauvegardée
export const getProgress = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : { memorized: [], inProgress: [], lastSession: null }
  } catch {
    return { memorized: [], inProgress: [], lastSession: null }
  }
}

// Sauvegarde la progression
export const saveProgress = (progress) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

// Marque une dua comme mémorisée
export const markAsMemorized = (duaId) => {
  const progress = getProgress()
  if (!progress.memorized.includes(duaId)) {
    progress.memorized.push(duaId)
    // Retire de "en cours" si présent
    progress.inProgress = progress.inProgress.filter(id => id !== duaId)
    saveProgress(progress)
  }
  return progress
}

// Marque une dua comme en cours d'apprentissage
export const markAsInProgress = (duaId) => {
  const progress = getProgress()
  if (!progress.inProgress.includes(duaId) && !progress.memorized.includes(duaId)) {
    progress.inProgress.push(duaId)
    saveProgress(progress)
  }
  return progress
}

// Retire une dua de la progression
export const removeFromProgress = (duaId) => {
  const progress = getProgress()
  progress.memorized = progress.memorized.filter(id => id !== duaId)
  progress.inProgress = progress.inProgress.filter(id => id !== duaId)
  saveProgress(progress)
  return progress
}

// Vérifie si une dua est mémorisée
export const isMemorized = (duaId) => {
  const progress = getProgress()
  return progress.memorized.includes(duaId)
}

// Vérifie si une dua est en cours
export const isInProgress = (duaId) => {
  const progress = getProgress()
  return progress.inProgress.includes(duaId)
}

// Sauvegarde la dernière session d'entraînement
export const saveLastSession = (session) => {
  const progress = getProgress()
  progress.lastSession = session
  saveProgress(progress)
}

// Récupère les stats
export const getStats = async () => {
  const data = await loadDouasData()
  const progress = getProgress()

  return {
    total: data?.totalDuas || 0,
    memorized: progress.memorized.length,
    inProgress: progress.inProgress.length,
    categories: data?.totalCategories || 0
  }
}

// --- Mode entraînement ---

// Génère une session d'entraînement
export const generateTrainingSession = async (options = {}) => {
  const {
    categoryId = null,      // null = toutes catégories
    duaIds = null,          // liste spécifique de duas
    count = 5,              // nombre de duas
    onlyMemorized = false,  // révision uniquement
    onlyInProgress = false  // en cours uniquement
  } = options

  let duas = []

  if (duaIds && duaIds.length > 0) {
    // Duas spécifiques
    const data = await loadDouasData()
    duas = duaIds.map(id => data.duas.find(d => d.id === id)).filter(Boolean)
  } else if (categoryId) {
    // Par catégorie
    duas = await getDuasByCategory(categoryId)
  } else {
    // Toutes les duas
    duas = await getAllDuas()
  }

  // Filtrer par progression si demandé
  const progress = getProgress()
  if (onlyMemorized) {
    duas = duas.filter(d => progress.memorized.includes(d.id))
  } else if (onlyInProgress) {
    duas = duas.filter(d => progress.inProgress.includes(d.id))
  }

  // Mélanger et limiter
  const shuffled = [...duas].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// Masque une partie du texte pour l'entraînement
export const maskText = (text, maskLevel = 0.5) => {
  if (!text) return { visible: '', hidden: '', hiddenCount: 0, totalWords: 0 }

  const words = text.split(' ')
  const visibleCount = Math.ceil(words.length * (1 - maskLevel))
  const visible = words.slice(0, visibleCount).join(' ')
  const hidden = words.slice(visibleCount)

  return {
    visible,
    hidden: hidden.join(' '),
    hiddenCount: hidden.length,
    totalWords: words.length
  }
}

// Recherche dans les duas
export const searchDuas = async (query) => {
  if (!query || query.length < 2) return []

  const data = await loadDouasData()
  const lowerQuery = query.toLowerCase()

  return data.duas.filter(dua =>
    dua.arabic?.includes(query) ||
    dua.english?.toLowerCase().includes(lowerQuery) ||
    dua.french?.toLowerCase().includes(lowerQuery) ||
    dua.reference?.toLowerCase().includes(lowerQuery)
  )
}

// --- Favoris ---

// Récupère les catégories favorites
export const getFavoriteCategories = () => {
  try {
    const data = localStorage.getItem(FAVORITES_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// Ajoute une catégorie aux favoris
export const addFavoriteCategory = (categoryId) => {
  const favorites = getFavoriteCategories()
  if (!favorites.includes(categoryId)) {
    favorites.push(categoryId)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    window.dispatchEvent(new CustomEvent('douas-favorites-changed'))
  }
  return favorites
}

// Retire une catégorie des favoris
export const removeFavoriteCategory = (categoryId) => {
  let favorites = getFavoriteCategories()
  favorites = favorites.filter(id => id !== categoryId)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  window.dispatchEvent(new CustomEvent('douas-favorites-changed'))
  return favorites
}

// Toggle favori
export const toggleFavoriteCategory = (categoryId) => {
  const favorites = getFavoriteCategories()
  if (favorites.includes(categoryId)) {
    return removeFavoriteCategory(categoryId)
  } else {
    return addFavoriteCategory(categoryId)
  }
}

// Vérifie si une catégorie est en favori
export const isFavoriteCategory = (categoryId) => {
  const favorites = getFavoriteCategories()
  return favorites.includes(categoryId)
}
