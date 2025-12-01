import { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ZoomIn, ZoomOut, RotateCw, Loader2, FileWarning, ChevronLeft, ChevronRight } from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function PdfViewer({ pdfFile, pageNumber = 1, darkMode }) {
  const [scale, setScale] = useState(1.2)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [currentPage, setCurrentPage] = useState(pageNumber)

  // Reset loading state when PDF file changes
  useEffect(() => {
    setLoading(true)
    setError(null)
  }, [pdfFile])

  // Update current page when pageNumber prop changes
  useEffect(() => {
    setCurrentPage(pageNumber)
  }, [pageNumber])

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.5))
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5))
  const handleResetZoom = () => setScale(1.2)

  const onLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }

  const onLoadError = (err) => {
    setLoading(false)
    setError('Erreur de chargement du PDF')
    console.error('PDF load error:', err)
  }

  // Extract filename for display
  const getFileName = () => {
    if (!pdfFile) return 'Aucun fichier'
    const parts = pdfFile.split('/')
    return parts[parts.length - 1]
  }

  if (!pdfFile) {
    return (
      <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
        <div className={`flex flex-col items-center justify-center p-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <FileWarning className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg font-medium">Aucun PDF configuré</p>
          <p className="text-sm mt-2">Le mapping pour ce dialogue n'existe pas encore</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
      {/* Controls */}
      <div className={`flex items-center justify-between p-3 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className={`p-2 rounded-lg transition-colors ${
              currentPage <= 1
                ? darkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                : darkMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Page précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className={`text-sm min-w-[80px] text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {currentPage} / {numPages || '?'}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(numPages || p, p + 1))}
            disabled={currentPage >= numPages}
            className={`p-2 rounded-lg transition-colors ${
              currentPage >= numPages
                ? darkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                : darkMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Page suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Zoom arrière"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className={`text-sm min-w-[50px] text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Zoom avant"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Réinitialiser"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Display */}
      <div
        className={`overflow-auto flex justify-center p-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}
        style={{ maxHeight: 'calc(100vh - 300px)', minHeight: '500px' }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
          </div>
        )}

        {error && (
          <div className={`flex flex-col items-center justify-center py-20 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
            <FileWarning className="w-12 h-12 mb-3 opacity-70" />
            <p>{error}</p>
            <p className="text-sm mt-2 opacity-70">Fichier: {getFileName()}</p>
          </div>
        )}

        <Document
          file={pdfFile}
          onLoadSuccess={onLoadSuccess}
          onLoadError={onLoadError}
          loading={null}
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-lg"
          />
        </Document>
      </div>
    </div>
  )
}
