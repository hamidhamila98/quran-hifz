import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileText, Folder, Music, Quote } from 'lucide-react'
import FolderView from '../components/FolderView'
import PlaylistView from '../components/PlaylistView'
import CitationsView from '../components/CitationsView'
import { getNotes, findItemById } from '../services/notesService'
import { MobileHeader } from '../../../components/sidebar'

export default function NotesPage({ settings, updateSettings, isMobile, setMobileMenuOpen }) {
  const [searchParams] = useSearchParams()
  const [currentItem, setCurrentItem] = useState(null)
  const [notes, setNotes] = useState({ items: [] })

  const darkMode = settings.darkMode
  const itemId = searchParams.get('id')

  // Charger les notes et l'élément actuel
  useEffect(() => {
    const loadedNotes = getNotes()
    setNotes(loadedNotes)

    if (itemId) {
      const item = findItemById(loadedNotes.items, itemId)
      setCurrentItem(item)
    } else {
      setCurrentItem(null)
    }
  }, [itemId])

  // Rafraîchir les notes
  const refreshNotes = () => {
    const loadedNotes = getNotes()
    setNotes(loadedNotes)
    if (itemId) {
      const item = findItemById(loadedNotes.items, itemId)
      setCurrentItem(item)
    }
  }

  // Rendu de la vue selon le type
  const renderView = () => {
    if (!currentItem) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className={`p-6 rounded-3xl ${darkMode ? 'bg-slate-800/50' : 'bg-white/50'}`}>
            <FileText className={`w-20 h-20 mx-auto mb-4 ${darkMode ? 'text-amber-400/50' : 'text-amber-500/50'}`} />
            <h2 className={`text-xl font-semibold text-center mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Bienvenue dans MyNotes
            </h2>
            <p className={`text-center max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Organisez vos ressources islamiques : livres, cours audio, citations et plus encore.
              Cliquez sur "Ajouter" dans la sidebar pour commencer.
            </p>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className={`p-4 rounded-2xl text-center ${darkMode ? 'bg-slate-800/50' : 'bg-white/50'}`}>
              <Folder className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
              <div className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {notes.items.filter(i => i.type === 'folder').length}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Catégories</div>
            </div>
            <div className={`p-4 rounded-2xl text-center ${darkMode ? 'bg-slate-800/50' : 'bg-white/50'}`}>
              <Music className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
              <div className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {notes.items.filter(i => i.type === 'playlist').length}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Playlists</div>
            </div>
            <div className={`p-4 rounded-2xl text-center ${darkMode ? 'bg-slate-800/50' : 'bg-white/50'}`}>
              <Quote className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-teal-400' : 'text-teal-500'}`} />
              <div className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {notes.items.filter(i => i.type === 'citations').length}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Citations</div>
            </div>
          </div>
        </div>
      )
    }

    switch (currentItem.type) {
      case 'folder':
        return <FolderView item={currentItem} darkMode={darkMode} onUpdate={refreshNotes} />
      case 'playlist':
        return <PlaylistView item={currentItem} darkMode={darkMode} onUpdate={refreshNotes} />
      case 'citations':
        return <CitationsView item={currentItem} darkMode={darkMode} onUpdate={refreshNotes} />
      default:
        return null
    }
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Mobile Header */}
      <MobileHeader
        title="MyNotes"
        icon="📝"
        gradientFrom="from-amber-500"
        gradientTo="to-amber-700"
        darkMode={darkMode}
        onMenuClick={() => setMobileMenuOpen && setMobileMenuOpen(true)}
      />

      <main className="overflow-y-auto">
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  )
}
