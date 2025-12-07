import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  Plus,
  Folder,
  FolderOpen,
  Music,
  Quote,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Pencil,
  Trash2,
  FileText
} from 'lucide-react'
import {
  SidebarWrapper,
  SidebarHeader,
  SidebarNav,
  SidebarFooter
} from '../../../components/sidebar'
import { getNotes, addRootItem, deleteItem, updateItem } from '../services/notesService'

const navItems = [
  { path: '/', icon: Home, label: 'MyIslam' },
  { path: '/notes', icon: FileText, label: 'Mes Notes' },
]

const ITEM_ICONS = {
  folder: Folder,
  playlist: Music,
  citations: Quote
}

export default function NotesSidebar({ isOpen, setIsOpen, settings, updateSettings, isMobile, setMobileMenuOpen }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [notes, setNotes] = useState({ items: [] })
  const [expandedFolders, setExpandedFolders] = useState({})
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [contextMenu, setContextMenu] = useState(null)

  const darkMode = settings.darkMode

  // Charger les notes
  useEffect(() => {
    setNotes(getNotes())
  }, [location])

  const refreshNotes = () => {
    setNotes(getNotes())
  }

  // Récupérer l'ID actuel depuis l'URL
  const getCurrentItemId = () => {
    const params = new URLSearchParams(location.search)
    return params.get('id')
  }

  const currentItemId = getCurrentItemId()

  // Toggle expansion d'un dossier
  const toggleFolder = (folderId, e) => {
    e.stopPropagation()
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }))
  }

  // Ajouter un élément racine
  const handleAddItem = (type) => {
    const names = {
      folder: 'Nouvelle Catégorie',
      playlist: 'Nouvelle Playlist',
      citations: 'Nouvelles Citations'
    }
    const newItem = addRootItem(type, names[type])
    refreshNotes()
    setShowAddMenu(false)
    navigate(`/notes?id=${newItem.id}`)
    // Auto-édition du nom
    setEditingId(newItem.id)
    setEditingName(names[type])
  }

  // Sauvegarder le nom édité
  const handleSaveName = (itemId) => {
    if (editingName.trim()) {
      updateItem(itemId, { name: editingName.trim() })
      refreshNotes()
    }
    setEditingId(null)
    setEditingName('')
  }

  // Supprimer un élément
  const handleDelete = (itemId) => {
    if (confirm('Supprimer cet élément ?')) {
      deleteItem(itemId)
      refreshNotes()
      if (currentItemId === itemId) {
        navigate('/notes')
      }
    }
    setContextMenu(null)
  }

  // Naviguer vers un élément
  const handleNavigate = (item) => {
    navigate(`/notes?id=${item.id}`)
  }

  // Rendu récursif des éléments
  const renderItem = (item, depth = 0) => {
    const Icon = ITEM_ICONS[item.type] || Folder
    const isExpanded = expandedFolders[item.id]
    const isActive = currentItemId === item.id
    const hasChildren = item.children && item.children.length > 0
    const isEditing = editingId === item.id

    return (
      <div key={item.id} className="relative">
        <div
          className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all ${
            isActive
              ? darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-700'
              : darkMode ? 'hover:bg-slate-700/50 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
          }`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          onClick={() => !isEditing && handleNavigate(item)}
        >
          {/* Chevron pour les dossiers */}
          {item.type === 'folder' && (
            <button
              onClick={(e) => toggleFolder(item.id, e)}
              className={`p-0.5 rounded transition-colors ${darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-200'}`}
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Icône */}
          {item.type === 'folder' && isExpanded ? (
            <FolderOpen className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-500' : 'text-gray-500'}`} />
          ) : (
            <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-500' : 'text-gray-500'}`} />
          )}

          {/* Nom (éditable ou non) */}
          {isEditing ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => handleSaveName(item.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName(item.id)
                if (e.key === 'Escape') { setEditingId(null); setEditingName('') }
              }}
              className={`flex-1 text-sm bg-transparent border-b outline-none ${
                darkMode ? 'border-amber-500 text-gray-200' : 'border-amber-500 text-gray-800'
              }`}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 text-sm truncate">{item.name}</span>
          )}

          {/* Menu contextuel */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setContextMenu(contextMenu === item.id ? null : item.id)
            }}
            className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${
              darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-200'
            }`}
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Menu contextuel dropdown */}
        {contextMenu === item.id && (
          <div
            className={`absolute right-2 top-full z-50 mt-1 rounded-lg shadow-lg py-1 min-w-[120px] ${
              darkMode ? 'bg-slate-700 border border-slate-600' : 'bg-white border border-gray-200'
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                setEditingId(item.id)
                setEditingName(item.name)
                setContextMenu(null)
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
                darkMode ? 'hover:bg-slate-600 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Pencil className="w-3.5 h-3.5" /> Renommer
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(item.id)
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 ${
                darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-100'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" /> Supprimer
            </button>
          </div>
        )}

        {/* Enfants (si dossier et expanded) */}
        {item.type === 'folder' && isExpanded && item.children && (
          <div className="mt-0.5">
            {item.children.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  // Fermer le menu contextuel au clic ailleurs
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null)
      setShowAddMenu(false)
    }
    if (contextMenu || showAddMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [contextMenu, showAddMenu])

  return (
    <SidebarWrapper isOpen={isOpen} darkMode={darkMode} isMobile={isMobile}>
      <SidebarHeader
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        darkMode={darkMode}
        title="MyNotes"
        icon="📝"
        gradientFrom="from-amber-500"
        gradientTo="to-amber-700"
        isMobile={isMobile}
        onClose={() => setMobileMenuOpen && setMobileMenuOpen(false)}
      />

      <SidebarNav items={navItems} isOpen={isOpen} darkMode={darkMode} accentColor="amber" />

      {/* Contenu de la sidebar */}
      {isOpen && (
        <div className={`flex-1 px-3 py-4 space-y-2 border-t mt-2 overflow-y-auto overflow-x-hidden ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          {/* Bouton Ajouter */}
          <div className="relative mb-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowAddMenu(!showAddMenu)
              }}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-medium transition-all ${
                darkMode
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Ajouter</span>
            </button>

            {/* Menu d'ajout */}
            {showAddMenu && (
              <div
                className={`absolute left-0 right-0 top-full mt-2 rounded-xl shadow-lg py-2 z-50 ${
                  darkMode ? 'bg-slate-700 border border-slate-600' : 'bg-white border border-gray-200'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleAddItem('folder')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${
                    darkMode ? 'hover:bg-slate-600 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Folder className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="text-sm font-medium">Catégorie</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Dossiers, livres, chapitres...
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleAddItem('playlist')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${
                    darkMode ? 'hover:bg-slate-600 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Music className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="text-sm font-medium">Playlist</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Audio MP3, vidéos YouTube...
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleAddItem('citations')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${
                    darkMode ? 'hover:bg-slate-600 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Quote className="w-4 h-4 text-teal-500" />
                  <div>
                    <div className="text-sm font-medium">Citations</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Stocker des citations
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Liste des éléments */}
          <div className="space-y-1">
            {notes.items.length === 0 ? (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucune note</p>
                <p className="text-xs mt-1">Cliquez sur "Ajouter" pour commencer</p>
              </div>
            ) : (
              notes.items.map(item => renderItem(item))
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <SidebarFooter
          isOpen={isOpen}
          darkMode={darkMode}
          arabicText="وَقُل رَّبِّ زِدْنِي عِلْمًا"
          frenchText="Ta-Ha : 114"
          accentColor="amber"
        />
      )}
    </SidebarWrapper>
  )
}
