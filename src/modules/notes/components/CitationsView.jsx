import { useState } from 'react'
import {
  Quote,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Check,
  BookOpen
} from 'lucide-react'
import { addQuote, deleteQuote, updateItem } from '../services/notesService'

export default function CitationsView({ item, darkMode, onUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newQuoteText, setNewQuoteText] = useState('')
  const [newQuoteSource, setNewQuoteSource] = useState('')
  const [newQuoteAuthor, setNewQuoteAuthor] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingQuote, setEditingQuote] = useState({ text: '', source: '', author: '' })
  const [contextMenu, setContextMenu] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  // Ajouter une citation
  const handleAddQuote = () => {
    if (newQuoteText.trim()) {
      addQuote(item.id, {
        text: newQuoteText.trim(),
        source: newQuoteSource.trim(),
        author: newQuoteAuthor.trim()
      })
      setNewQuoteText('')
      setNewQuoteSource('')
      setNewQuoteAuthor('')
      setShowAddForm(false)
      onUpdate()
    }
  }

  // Supprimer une citation
  const handleDeleteQuote = (quoteId) => {
    if (confirm('Supprimer cette citation ?')) {
      deleteQuote(item.id, quoteId)
      onUpdate()
    }
    setContextMenu(null)
  }

  // Commencer l'édition
  const startEditing = (quote) => {
    setEditingId(quote.id)
    setEditingQuote({
      text: quote.text,
      source: quote.source || '',
      author: quote.author || ''
    })
    setContextMenu(null)
  }

  // Sauvegarder l'édition
  const handleSaveEdit = () => {
    if (editingQuote.text.trim()) {
      const quote = item.quotes.find(q => q.id === editingId)
      if (quote) {
        quote.text = editingQuote.text.trim()
        quote.source = editingQuote.source.trim()
        quote.author = editingQuote.author.trim()
        quote.updatedAt = new Date().toISOString()
        onUpdate()
      }
    }
    setEditingId(null)
    setEditingQuote({ text: '', source: '', author: '' })
  }

  // Copier une citation
  const handleCopy = (quote) => {
    const text = `"${quote.text}"${quote.author ? ` - ${quote.author}` : ''}${quote.source ? ` (${quote.source})` : ''}`
    navigator.clipboard.writeText(text)
    setCopiedId(quote.id)
    setTimeout(() => setCopiedId(null), 2000)
    setContextMenu(null)
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
              <Quote className={`w-8 h-8 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {item.name}
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {item.quotes?.length || 0} citation{(item.quotes?.length || 0) > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              darkMode
                ? 'bg-teal-600 hover:bg-teal-500 text-white'
                : 'bg-teal-500 hover:bg-teal-600 text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        {/* Formulaire ajout */}
        {showAddForm && (
          <div className={`mt-4 p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
            <div className="space-y-3">
              <textarea
                value={newQuoteText}
                onChange={(e) => setNewQuoteText(e.target.value)}
                placeholder="Texte de la citation..."
                rows={3}
                className={`w-full px-4 py-3 rounded-xl text-sm resize-none ${
                  darkMode
                    ? 'bg-slate-700 text-gray-200 placeholder-gray-500 border-slate-600'
                    : 'bg-white text-gray-800 placeholder-gray-400 border-gray-200'
                } border focus:outline-none focus:ring-2 focus:ring-teal-500/50`}
                autoFocus
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newQuoteAuthor}
                  onChange={(e) => setNewQuoteAuthor(e.target.value)}
                  placeholder="Auteur (optionnel)"
                  className={`px-4 py-2 rounded-xl text-sm ${
                    darkMode
                      ? 'bg-slate-700 text-gray-200 placeholder-gray-500 border-slate-600'
                      : 'bg-white text-gray-800 placeholder-gray-400 border-gray-200'
                  } border focus:outline-none focus:ring-2 focus:ring-teal-500/50`}
                />
                <input
                  type="text"
                  value={newQuoteSource}
                  onChange={(e) => setNewQuoteSource(e.target.value)}
                  placeholder="Source (optionnel)"
                  className={`px-4 py-2 rounded-xl text-sm ${
                    darkMode
                      ? 'bg-slate-700 text-gray-200 placeholder-gray-500 border-slate-600'
                      : 'bg-white text-gray-800 placeholder-gray-400 border-gray-200'
                  } border focus:outline-none focus:ring-2 focus:ring-teal-500/50`}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewQuoteText('')
                    setNewQuoteSource('')
                    setNewQuoteAuthor('')
                  }}
                  className={`px-4 py-2 rounded-xl text-sm ${
                    darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddQuote}
                  disabled={!newQuoteText.trim()}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    newQuoteText.trim()
                      ? darkMode ? 'bg-teal-600 text-white' : 'bg-teal-500 text-white'
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

      {/* Liste des citations */}
      <div className="space-y-4">
        {item.quotes?.length > 0 ? (
          item.quotes.map((quote) => {
            const isEditing = editingId === quote.id

            return (
              <div
                key={quote.id}
                className={`group relative p-6 rounded-2xl ${
                  darkMode ? 'bg-slate-800' : 'bg-white'
                } shadow-sm`}
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingQuote.text}
                      onChange={(e) => setEditingQuote(prev => ({ ...prev, text: e.target.value }))}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl text-sm resize-none ${
                        darkMode
                          ? 'bg-slate-700 text-gray-200 border-slate-600'
                          : 'bg-gray-50 text-gray-800 border-gray-200'
                      } border focus:outline-none focus:ring-2 focus:ring-teal-500/50`}
                      autoFocus
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editingQuote.author}
                        onChange={(e) => setEditingQuote(prev => ({ ...prev, author: e.target.value }))}
                        placeholder="Auteur"
                        className={`px-4 py-2 rounded-xl text-sm ${
                          darkMode
                            ? 'bg-slate-700 text-gray-200 border-slate-600'
                            : 'bg-gray-50 text-gray-800 border-gray-200'
                        } border focus:outline-none focus:ring-2 focus:ring-teal-500/50`}
                      />
                      <input
                        type="text"
                        value={editingQuote.source}
                        onChange={(e) => setEditingQuote(prev => ({ ...prev, source: e.target.value }))}
                        placeholder="Source"
                        className={`px-4 py-2 rounded-xl text-sm ${
                          darkMode
                            ? 'bg-slate-700 text-gray-200 border-slate-600'
                            : 'bg-gray-50 text-gray-800 border-gray-200'
                        } border focus:outline-none focus:ring-2 focus:ring-teal-500/50`}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setEditingQuote({ text: '', source: '', author: '' })
                        }}
                        className={`px-4 py-2 rounded-xl text-sm ${
                          darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className={`px-4 py-2 rounded-xl text-sm font-medium ${
                          darkMode ? 'bg-teal-600 text-white' : 'bg-teal-500 text-white'
                        }`}
                      >
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Guillemet décoratif */}
                    <Quote className={`absolute top-4 left-4 w-8 h-8 opacity-10 ${
                      darkMode ? 'text-teal-400' : 'text-teal-500'
                    }`} />

                    {/* Texte */}
                    <p className={`text-lg leading-relaxed pl-8 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      "{quote.text}"
                    </p>

                    {/* Auteur et source */}
                    {(quote.author || quote.source) && (
                      <div className={`mt-4 pt-4 border-t flex items-center gap-2 ${
                        darkMode ? 'border-slate-700' : 'border-gray-100'
                      }`}>
                        <BookOpen className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {quote.author && <span className="font-medium">{quote.author}</span>}
                          {quote.author && quote.source && ' — '}
                          {quote.source && <span className="italic">{quote.source}</span>}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="absolute top-4 right-4 flex items-center gap-1">
                      {/* Bouton copier */}
                      <button
                        onClick={() => handleCopy(quote)}
                        className={`opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all ${
                          copiedId === quote.id
                            ? 'bg-green-500 text-white'
                            : darkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                        }`}
                      >
                        {copiedId === quote.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>

                      {/* Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setContextMenu(contextMenu === quote.id ? null : quote.id)}
                          className={`opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all ${
                            darkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                          }`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {contextMenu === quote.id && (
                          <div
                            className={`absolute right-0 top-full z-50 mt-1 rounded-lg shadow-lg py-1 min-w-[120px] ${
                              darkMode ? 'bg-slate-700 border border-slate-600' : 'bg-white border border-gray-200'
                            }`}
                          >
                            <button
                              onClick={() => startEditing(quote)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
                                darkMode ? 'hover:bg-slate-600 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              <Pencil className="w-3.5 h-3.5" /> Modifier
                            </button>
                            <button
                              onClick={() => handleCopy(quote)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
                                darkMode ? 'hover:bg-slate-600 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              <Copy className="w-3.5 h-3.5" /> Copier
                            </button>
                            <button
                              onClick={() => handleDeleteQuote(quote.id)}
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
                  </>
                )}
              </div>
            )
          })
        ) : (
          <div className={`p-8 rounded-2xl text-center ${
            darkMode ? 'bg-slate-800/50' : 'bg-gray-100/50'
          }`}>
            <Quote className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Aucune citation
            </p>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              Cliquez sur "Ajouter" pour enregistrer des citations
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
