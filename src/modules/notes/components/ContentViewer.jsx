import { useState } from 'react'
import {
  X,
  ExternalLink,
  Maximize2,
  Minimize2,
  FileText,
  Youtube,
  File
} from 'lucide-react'

// Convertir URL Google Drive pour l'embed
const getGoogleDriveEmbedUrl = (url) => {
  // Format: https://drive.google.com/file/d/FILE_ID/view
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (match) {
    return `https://drive.google.com/file/d/${match[1]}/preview`
  }
  // Si c'est déjà une URL de preview
  if (url.includes('/preview')) {
    return url
  }
  return url
}

// Convertir URL Google Docs pour l'embed
const getGoogleDocsEmbedUrl = (url) => {
  // Format: https://docs.google.com/document/d/DOC_ID/edit
  if (url.includes('/edit')) {
    return url.replace('/edit', '/preview')
  }
  if (url.includes('/preview')) {
    return url
  }
  return url + '/preview'
}

// Extraire l'ID YouTube
const getYouTubeId = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

const CONTENT_ICONS = {
  pdf: FileText,
  youtube: Youtube,
  gdoc: File,
  link: ExternalLink
}

const CONTENT_COLORS = {
  pdf: 'text-red-500',
  youtube: 'text-red-500',
  gdoc: 'text-blue-500',
  link: 'text-gray-500'
}

export default function ContentViewer({ item, darkMode, onClose }) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Générer l'URL d'embed selon le type
  const getEmbedUrl = () => {
    switch (item.contentType) {
      case 'pdf':
        // Si c'est une URL Google Drive
        if (item.url.includes('drive.google.com')) {
          return getGoogleDriveEmbedUrl(item.url)
        }
        // Sinon, utiliser l'URL directement
        return item.url
      case 'youtube':
        const youtubeId = getYouTubeId(item.url)
        return youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : item.url
      case 'gdoc':
        return getGoogleDocsEmbedUrl(item.url)
      case 'link':
      default:
        return item.url
    }
  }

  const Icon = CONTENT_ICONS[item.contentType] || FileText
  const iconColor = CONTENT_COLORS[item.contentType] || 'text-gray-500'

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isFullscreen ? '' : 'p-4 md:p-8'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative flex flex-col ${
          isFullscreen
            ? 'w-full h-full'
            : 'w-full max-w-5xl h-[85vh] rounded-2xl'
        } ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-2xl overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-3 border-b ${
            darkMode ? 'border-slate-700' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
              <h2 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {item.name}
              </h2>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {item.contentType === 'pdf' && 'Document PDF'}
                {item.contentType === 'youtube' && 'Vidéo YouTube'}
                {item.contentType === 'gdoc' && 'Google Document'}
                {item.contentType === 'link' && 'Lien externe'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Ouvrir dans nouvel onglet */}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="w-5 h-5" />
            </a>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={isFullscreen ? 'Réduire' : 'Plein écran'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>

            {/* Fermer */}
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
          {item.contentType === 'link' ? (
            // Pour les liens externes, afficher un message
            <div className="flex flex-col items-center justify-center h-full p-8">
              <ExternalLink className={`w-16 h-16 mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Lien externe
              </h3>
              <p className={`text-center mb-4 max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Ce contenu ne peut pas être affiché directement. Cliquez sur le bouton ci-dessous pour l'ouvrir dans un nouvel onglet.
              </p>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  darkMode
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                <ExternalLink className="w-5 h-5" />
                Ouvrir le lien
              </a>
            </div>
          ) : (
            // Pour PDF, YouTube, Google Docs : iframe
            <iframe
              src={getEmbedUrl()}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={item.name}
            />
          )}
        </div>
      </div>
    </div>
  )
}
