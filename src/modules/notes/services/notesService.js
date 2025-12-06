// Notes Service - Gestion des données MyNotes
const STORAGE_KEY = 'myislam_notes'

// Génère un ID unique
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Récupère toutes les notes
export const getNotes = () => {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : { items: [] }
}

// Sauvegarde les notes
export const saveNotes = (notes) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

// Ajoute un élément racine (catégorie, playlist, citations)
export const addRootItem = (type, name, icon = null) => {
  const notes = getNotes()
  const newItem = {
    id: generateId(),
    type, // 'folder', 'playlist', 'citations'
    name,
    icon,
    createdAt: new Date().toISOString(),
    ...(type === 'folder' && { children: [] }),
    ...(type === 'playlist' && { tracks: [] }),
    ...(type === 'citations' && { quotes: [] })
  }
  notes.items.push(newItem)
  saveNotes(notes)
  return newItem
}

// Trouve un élément par ID (recherche récursive)
export const findItemById = (items, id) => {
  for (const item of items) {
    if (item.id === id) return item
    if (item.children) {
      const found = findItemById(item.children, id)
      if (found) return found
    }
  }
  return null
}

// Trouve le parent d'un élément
export const findParentById = (items, id, parent = null) => {
  for (const item of items) {
    if (item.id === id) return parent
    if (item.children) {
      const found = findParentById(item.children, id, item)
      if (found !== undefined) return found
    }
  }
  return undefined
}

// Ajoute un enfant à un dossier
export const addChildToFolder = (folderId, childData) => {
  const notes = getNotes()
  const folder = findItemById(notes.items, folderId)
  if (folder && folder.type === 'folder') {
    const newChild = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...childData,
      ...(childData.type === 'folder' && { children: childData.children || [] })
    }
    folder.children.push(newChild)
    saveNotes(notes)
    return newChild
  }
  return null
}

// Ajoute une piste à une playlist
export const addTrackToPlaylist = (playlistId, trackData) => {
  const notes = getNotes()
  const playlist = findItemById(notes.items, playlistId)
  if (playlist && playlist.type === 'playlist') {
    const newTrack = {
      id: generateId(),
      order: playlist.tracks.length,
      createdAt: new Date().toISOString(),
      ...trackData
    }
    playlist.tracks.push(newTrack)
    saveNotes(notes)
    return newTrack
  }
  return null
}

// Ajoute une citation
export const addQuote = (citationsId, quoteData) => {
  const notes = getNotes()
  const citations = findItemById(notes.items, citationsId)
  if (citations && citations.type === 'citations') {
    const newQuote = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...quoteData
    }
    citations.quotes.push(newQuote)
    saveNotes(notes)
    return newQuote
  }
  return null
}

// Met à jour un élément
export const updateItem = (itemId, updates) => {
  const notes = getNotes()
  const item = findItemById(notes.items, itemId)
  if (item) {
    Object.assign(item, updates, { updatedAt: new Date().toISOString() })
    saveNotes(notes)
    return item
  }
  return null
}

// Supprime un élément
export const deleteItem = (itemId) => {
  const notes = getNotes()

  // Cherche dans les items racine
  const rootIndex = notes.items.findIndex(item => item.id === itemId)
  if (rootIndex !== -1) {
    notes.items.splice(rootIndex, 1)
    saveNotes(notes)
    return true
  }

  // Cherche récursivement dans les enfants
  const deleteRecursive = (items) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === itemId) {
        items.splice(i, 1)
        return true
      }
      if (items[i].children && deleteRecursive(items[i].children)) {
        return true
      }
    }
    return false
  }

  for (const item of notes.items) {
    if (item.children && deleteRecursive(item.children)) {
      saveNotes(notes)
      return true
    }
  }
  return false
}

// Supprime une piste d'une playlist
export const deleteTrack = (playlistId, trackId) => {
  const notes = getNotes()
  const playlist = findItemById(notes.items, playlistId)
  if (playlist && playlist.tracks) {
    const index = playlist.tracks.findIndex(t => t.id === trackId)
    if (index !== -1) {
      playlist.tracks.splice(index, 1)
      saveNotes(notes)
      return true
    }
  }
  return false
}

// Supprime une citation
export const deleteQuote = (citationsId, quoteId) => {
  const notes = getNotes()
  const citations = findItemById(notes.items, citationsId)
  if (citations && citations.quotes) {
    const index = citations.quotes.findIndex(q => q.id === quoteId)
    if (index !== -1) {
      citations.quotes.splice(index, 1)
      saveNotes(notes)
      return true
    }
  }
  return false
}

// Réordonne les pistes d'une playlist
export const reorderTracks = (playlistId, trackIds) => {
  const notes = getNotes()
  const playlist = findItemById(notes.items, playlistId)
  if (playlist && playlist.tracks) {
    const reordered = trackIds.map((id, index) => {
      const track = playlist.tracks.find(t => t.id === id)
      return { ...track, order: index }
    }).filter(Boolean)
    playlist.tracks = reordered
    saveNotes(notes)
    return true
  }
  return false
}

// Déplace un élément vers un autre dossier
export const moveItem = (itemId, newParentId) => {
  const notes = getNotes()
  const item = findItemById(notes.items, itemId)
  if (!item) return false

  // Supprime de l'emplacement actuel
  deleteItem(itemId)

  // Recharge les notes après suppression
  const updatedNotes = getNotes()

  if (newParentId === null) {
    // Déplace vers la racine
    updatedNotes.items.push(item)
  } else {
    const newParent = findItemById(updatedNotes.items, newParentId)
    if (newParent && newParent.type === 'folder') {
      newParent.children.push(item)
    }
  }

  saveNotes(updatedNotes)
  return true
}

// Obtient le chemin (breadcrumb) vers un élément
export const getPathToItem = (items, targetId, path = []) => {
  for (const item of items) {
    if (item.id === targetId) {
      return [...path, item]
    }
    if (item.children) {
      const found = getPathToItem(item.children, targetId, [...path, item])
      if (found) return found
    }
  }
  return null
}
