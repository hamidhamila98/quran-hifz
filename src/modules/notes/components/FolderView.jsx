import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Folder,
  FolderOpen,
  FileText,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  ExternalLink,
  ChevronRight,
  Youtube,
  File
} from 'lucide-react'
import { addChildToFolder, updateItem, deleteItem, getPathToItem, getNotes } from '../services/notesService'
import ContentViewer from './ContentViewer'

const CONTENT_TYPES = [
  { id: 'pdf', name: 'PDF (iframe)', icon: FileText, color: 'text-red-500' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-500' },
  { id: 'gdoc', name: 'Google Doc', icon: File, color: 'text-blue-500' },
  { id: 'link', name: 'Lien externe', icon: ExternalLink, color: 'text-gray-500' }
]

export default function FolderView({ item, darkMode, onUpdate }) {
  const navigate = useNavigate()
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showAddContentForm, setShowAddContentForm] = useState(false)
  const [selectedContentType, setSelectedContentType] = useState(null)
  const [newItemName, setNewItemName] = useState('')
  const [newContentUrl, setNewContentUrl] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [contextMenu, setContextMenu] = useState(null)
  const [viewingContent, setViewingContent] = useState(null)

  // Breadcrumb
  const notes = getNotes()
  const path = getPathToItem(notes.items, item.id) || []

  // Ajouter un sous-dossier
  const handleAddFolder = () => {
    if (newItemName.trim()) {
      addChildToFolder(item.id, {
        type: 'folder',
        name: newItemName.trim(),
        children: []
      })
      setNewItemName('')
      setShowAddMenu(false)
      onUpdate()
    }
  }

  // Ajouter du contenu
  const handleAddContent = () => {
    if (newItemName.trim() && newContentUrl.trim() && selectedContentType) {
      addChildToFolder(item.id, {
        type: 'content',
        name: newItemName.trim(),
        contentType: selectedContentType,
        url: newContentUrl.trim()
      })
      setNewItemName('')
      setNewContentUrl('')
      setSelectedContentType(null)
      setShowAddContentForm(false)
      onUpdate()
    }
  }

  // Sauvegarder le nom édité
  const handleSaveName = (childId) => {
    if (editingName.trim()) {
      updateItem(childId, { name: editingName.trim() })
      onUpdate()
    }
    setEditingId(null)
    setEditingName('')
  }

  // Supprimer un élément
  const handleDelete = (childId) => {
    if (confirm('Supprimer cet élément ?')) {
      deleteItem(childId)
      onUpdate()
    }
    setContextMenu(null)
  }

  // Clic sur un élément
  const handleItemClick = (child) => {
    if (child.type === 'folder') {
      navigate(`/notes?id=${child.id}`)
    } else if (child.type === 'content') {
      setViewingContent(child)
    }
  }

  // Icône selon le type de contenu
  const getContentIcon = (contentType) => {
    const type = CONTENT_TYPES.find(t => t.id === contentType)
    return type ? type.icon : FileText
  }

  const getContentColor = (contentType) => {
    const type = CONTENT_TYPES.find(t => t.id === contentType)
    return type ? type.color : 'text-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-wrap">
        {path.map((p, index) => (
          <div key={p.id} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />}
            <button
              onClick={() => navigate(`/notes?id=${p.id}`)}
              className={`text-sm hover:underline ${
                index === path.length - 1
                  ? darkMode ? 'text-amber-400 font-medium' : 'text-amber-600 font-medium'
                  : darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {p.name}
            </button>
          </div>
        ))}
      </div>

      {/* En-tête */}
      <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-amber-900/30' : 'bg-amber-100'}`}>
              <FolderOpen className={`w-8 h-8 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {item.name}
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {item.children?.length || 0} élément{(item.children?.length || 0) > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Bouton Ajouter */}
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                darkMode
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>

            {showAddMenu && (
              <div
                className={`absolute right-0 top-full mt-2 rounded-xl shadow-lg py-2 w-56 z-50 ${
                  darkMode ? 'bg-slate-700 border border-slate-600' : 'bg-white border border-gray-200'
                }`}
              >
                <button
                  onClick={() => {
                    setShowAddMenu(false)
                    setNewItemName('')
                    setTimeout(() => document.getElementById('new-folder-input')?.focus(), 100)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${
                    darkMode ? 'hover:bg-slate-600 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Folder className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">Sous-dossier</span>
                </button>
                {CONTENT_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedContentType(type.id)
                      setShowAddMenu(false)
                      setShowAddContentForm(true)
                      setNewItemName('')
                      setNewContentUrl('')
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${
                      darkMode ? 'hover:bg-slate-600 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <type.icon className={`w-4 h-4 ${type.color}`} />
                    <span className="text-sm">{type.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Formulaire nouveau dossier */}
        {!showAddMenu && !showAddContentForm && (
          <div className="mt-4">
            <div className="flex gap-2">
              <input
                id="new-folder-input"
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Nom du nouveau dossier..."
                className={`flex-1 px-4 py-2 rounded-xl text-sm ${
                  darkMode
                    ? 'bg-slate-700 text-gray-200 placeholder-gray-500 border-slate-600'
                    : 'bg-gray-100 text-gray-800 placeholder-gray-400 border-gray-200'
                } border focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
              />
              {newItemName && (
                <button
                  onClick={handleAddFolder}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    darkMode ? 'bg-amber-600 text-white' : 'bg-amber-500 text-white'
                  }`}
                >
                  Créer
                </button>
              )}
            </div>
          </div>
        )}

        {/* Formulaire ajout contenu */}
        {showAddContentForm && (
          <div className={`mt-4 p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              {(() => {
                const type = CONTENT_TYPES.find(t => t.id === selectedContentType)
                const Icon = type?.icon || FileText
                return <Icon className={`w-5 h-5 ${type?.color || 'text-gray-500'}`} />
              })()}
              <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Ajouter {CONTENT_TYPES.find(t => t.id === selectedContentType)?.name}
              </span>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Titre..."
                className={`w-full px-4 py-2 rounded-xl text-sm ${
                  darkMode
                    ? 'bg-slate-700 text-gray-200 placeholder-gray-500 border-slate-600'
                    : 'bg-white text-gray-800 placeholder-gray-400 border-gray-200'
                } border focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
                autoFocus
              />
              <input
                type="text"
                value={newContentUrl}
                onChange={(e) => setNewContentUrl(e.target.value)}
                placeholder={selectedContentType === 'youtube' ? 'URL YouTube...' : 'URL du fichier...'}
                className={`w-full px-4 py-2 rounded-xl text-sm ${
                  darkMode
                    ? 'bg-slate-700 text-gray-200 placeholder-gray-500 border-slate-600'
                    : 'bg-white text-gray-800 placeholder-gray-400 border-gray-200'
                } border focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAddContentForm(false)
                    setSelectedContentType(null)
                  }}
                  className={`px-4 py-2 rounded-xl text-sm ${
                    darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddContent}
                  disabled={!newItemName.trim() || !newContentUrl.trim()}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    newItemName.trim() && newContentUrl.trim()
                      ? darkMode ? 'bg-amber-600 text-white' : 'bg-amber-500 text-white'
                      : darkMode ? 'bg-slate-600 text-gray-500' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Liste des éléments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {item.children?.map(child => {
          const isEditing = editingId === child.id
          const ContentIcon = child.type === 'folder' ? Folder : getContentIcon(child.contentType)

          return (
            <div
              key={child.id}
              className={`group relative p-4 rounded-2xl cursor-pointer transition-all ${
                darkMode
                  ? 'bg-slate-800 hover:bg-slate-700/80'
                  : 'bg-white hover:bg-gray-50 shadow-sm'
              }`}
              onClick={() => !isEditing && handleItemClick(child)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${
                  child.type === 'folder'
                    ? darkMode ? 'bg-amber-900/30' : 'bg-amber-100'
                    : darkMode ? 'bg-slate-700' : 'bg-gray-100'
                }`}>
                  <ContentIcon className={`w-5 h-5 ${
                    child.type === 'folder'
                      ? darkMode ? 'text-amber-400' : 'text-amber-600'
                      : getContentColor(child.contentType)
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleSaveName(child.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName(child.id)
                        if (e.key === 'Escape') { setEditingId(null); setEditingName('') }
                      }}
                      className={`w-full text-sm font-medium bg-transparent border-b outline-none ${
                        darkMode ? 'border-amber-500 text-gray-200' : 'border-amber-500 text-gray-800'
                      }`}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <h3 className={`font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {child.name}
                    </h3>
                  )}
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {child.type === 'folder'
                      ? `${child.children?.length || 0} élément${(child.children?.length || 0) > 1 ? 's' : ''}`
                      : CONTENT_TYPES.find(t => t.id === child.contentType)?.name
                    }
                  </p>
                </div>

                {/* Menu contextuel */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setContextMenu(contextMenu === child.id ? null : child.id)
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all ${
                    darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-200'
                  }`}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {contextMenu === child.id && (
                  <div
                    className={`absolute right-4 top-12 z-50 rounded-lg shadow-lg py-1 min-w-[120px] ${
                      darkMode ? 'bg-slate-700 border border-slate-600' : 'bg-white border border-gray-200'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setEditingId(child.id)
                        setEditingName(child.name)
                        setContextMenu(null)
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
                        darkMode ? 'hover:bg-slate-600 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Pencil className="w-3.5 h-3.5" /> Renommer
                    </button>
                    <button
                      onClick={() => handleDelete(child.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 ${
                        darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-100'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Message si vide */}
        {(!item.children || item.children.length === 0) && (
          <div className={`col-span-full p-8 rounded-2xl text-center ${
            darkMode ? 'bg-slate-800/50' : 'bg-gray-100/50'
          }`}>
            <Folder className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Ce dossier est vide
            </p>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              Cliquez sur "Ajouter" pour créer du contenu
            </p>
          </div>
        )}
      </div>

      {/* Viewer de contenu */}
      {viewingContent && (
        <ContentViewer
          item={viewingContent}
          darkMode={darkMode}
          onClose={() => setViewingContent(null)}
        />
      )}
    </div>
  )
}
