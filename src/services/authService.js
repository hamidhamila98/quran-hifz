/**
 * Service d'authentification locale
 * Stocke les utilisateurs dans localStorage avec leurs données
 */

const USERS_PREFIX = 'user_'
const CURRENT_USER_KEY = 'current_user'

// Structure par défaut d'un utilisateur
const createDefaultUserData = (pseudo, password) => ({
  pseudo,
  password,
  createdAt: new Date().toISOString(),
  settings: {
    darkMode: false,
  },
  quran: {
    lastSurah: 1,
    lastPage: 1,
    validatedVerses: [],
    bookmarks: [],
  },
  arabic: {
    lastBook: 'aby1',
    lastUnit: 1,
    lastDialogue: 0,
    progress: {},
  },
  hadith: {
    lastBook: null,
    favorites: [],
    bookmarks: [],
  },
  dourous: {
    notes: [],
    playlists: [],
  },
  library: {
    favorites: [],
    readingProgress: {},
  },
})

// Obtenir tous les utilisateurs enregistrés
export function getAllUsers() {
  const users = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith(USERS_PREFIX)) {
      const userData = JSON.parse(localStorage.getItem(key))
      users.push({ pseudo: userData.pseudo })
    }
  }
  return users
}

// Vérifier si un pseudo existe
export function userExists(pseudo) {
  return localStorage.getItem(USERS_PREFIX + pseudo) !== null
}

// Créer un nouveau compte
export function register(pseudo, password) {
  if (!pseudo || !password) {
    return { success: false, error: 'Pseudo et mot de passe requis' }
  }

  if (pseudo.length < 2) {
    return { success: false, error: 'Pseudo trop court (min 2 caractères)' }
  }

  if (password.length < 3) {
    return { success: false, error: 'Mot de passe trop court (min 3 caractères)' }
  }

  if (userExists(pseudo)) {
    return { success: false, error: 'Ce pseudo existe déjà' }
  }

  const userData = createDefaultUserData(pseudo, password)
  localStorage.setItem(USERS_PREFIX + pseudo, JSON.stringify(userData))
  localStorage.setItem(CURRENT_USER_KEY, pseudo)

  return { success: true, user: userData }
}

// Connexion
export function login(pseudo, password) {
  if (!pseudo || !password) {
    return { success: false, error: 'Pseudo et mot de passe requis' }
  }

  const stored = localStorage.getItem(USERS_PREFIX + pseudo)
  if (!stored) {
    return { success: false, error: 'Compte inexistant' }
  }

  const userData = JSON.parse(stored)
  if (userData.password !== password) {
    return { success: false, error: 'Mot de passe incorrect' }
  }

  localStorage.setItem(CURRENT_USER_KEY, pseudo)
  return { success: true, user: userData }
}

// Déconnexion
export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY)
}

// Obtenir l'utilisateur connecté
export function getCurrentUser() {
  const pseudo = localStorage.getItem(CURRENT_USER_KEY)
  if (!pseudo) return null

  const stored = localStorage.getItem(USERS_PREFIX + pseudo)
  if (!stored) {
    localStorage.removeItem(CURRENT_USER_KEY)
    return null
  }

  return JSON.parse(stored)
}

// Vérifier si connecté
export function isLoggedIn() {
  return getCurrentUser() !== null
}

// Mettre à jour les données utilisateur (sauvegarde en live)
export function updateUserData(updates) {
  const pseudo = localStorage.getItem(CURRENT_USER_KEY)
  if (!pseudo) return false

  const stored = localStorage.getItem(USERS_PREFIX + pseudo)
  if (!stored) return false

  const userData = JSON.parse(stored)
  const updated = deepMerge(userData, updates)
  localStorage.setItem(USERS_PREFIX + pseudo, JSON.stringify(updated))

  return updated
}

// Mettre à jour un module spécifique
export function updateModuleData(moduleName, data) {
  return updateUserData({ [moduleName]: data })
}

// Mettre à jour les settings
export function updateSettings(settings) {
  return updateUserData({ settings })
}

// Obtenir les données d'un module
export function getModuleData(moduleName) {
  const user = getCurrentUser()
  if (!user) return null
  return user[moduleName] || null
}

// Obtenir les settings
export function getSettings() {
  const user = getCurrentUser()
  if (!user) {
    // Mode invité - utiliser localStorage classique
    const stored = localStorage.getItem('guest_settings')
    return stored ? JSON.parse(stored) : { darkMode: false }
  }
  return user.settings
}

// Sauvegarder settings (mode invité ou connecté)
export function saveSettings(settings) {
  const user = getCurrentUser()
  if (!user) {
    // Mode invité
    localStorage.setItem('guest_settings', JSON.stringify(settings))
    return settings
  }
  return updateSettings(settings)
}

// Deep merge helper
function deepMerge(target, source) {
  const result = { ...target }
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}

// Supprimer un compte
export function deleteAccount(pseudo, password) {
  const stored = localStorage.getItem(USERS_PREFIX + pseudo)
  if (!stored) return { success: false, error: 'Compte inexistant' }

  const userData = JSON.parse(stored)
  if (userData.password !== password) {
    return { success: false, error: 'Mot de passe incorrect' }
  }

  localStorage.removeItem(USERS_PREFIX + pseudo)
  if (localStorage.getItem(CURRENT_USER_KEY) === pseudo) {
    localStorage.removeItem(CURRENT_USER_KEY)
  }

  return { success: true }
}
