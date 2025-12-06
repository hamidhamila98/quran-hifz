import { useState, useRef, useEffect } from 'react'
import {
  Music,
  Plus,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  MoreVertical,
  Pencil,
  Trash2,
  GripVertical,
  Youtube,
  FileAudio,
  Video,
  ExternalLink
} from 'lucide-react'
import { addTrackToPlaylist, updateItem, deleteTrack, reorderTracks } from '../services/notesService'

const TRACK_TYPES = [
  { id: 'mp3', name: 'Audio MP3', icon: FileAudio, color: 'text-green-500' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-500' },
  { id: 'mp4', name: 'Vidéo MP4', icon: Video, color: 'text-blue-500' }
]

// Extraire l'ID YouTube d'une URL
const getYouTubeId = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

export default function PlaylistView({ item, darkMode, onUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedTrackType, setSelectedTrackType] = useState('mp3')
  const [newTrackName, setNewTrackName] = useState('')
  const [newTrackUrl, setNewTrackUrl] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [contextMenu, setContextMenu] = useState(null)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const audioRef = useRef(null)

  // Mettre à jour la progression
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      setProgress(audio.currentTime)
      setDuration(audio.duration || 0)
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('loadedmetadata', updateProgress)
    audio.addEventListener('ended', handleTrackEnd)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('loadedmetadata', updateProgress)
      audio.removeEventListener('ended', handleTrackEnd)
    }
  }, [currentTrack])

  // Ajouter une piste
  const handleAddTrack = () => {
    if (newTrackName.trim() && newTrackUrl.trim()) {
      addTrackToPlaylist(item.id, {
        name: newTrackName.trim(),
        type: selectedTrackType,
        url: newTrackUrl.trim()
      })
      setNewTrackName('')
      setNewTrackUrl('')
      setShowAddForm(false)
      onUpdate()
    }
  }

  // Sauvegarder le nom édité
  const handleSaveName = (trackId) => {
    if (editingName.trim()) {
      const track = item.tracks.find(t => t.id === trackId)
      if (track) {
        track.name = editingName.trim()
        onUpdate()
      }
    }
    setEditingId(null)
    setEditingName('')
  }

  // Supprimer une piste
  const handleDeleteTrack = (trackId) => {
    if (confirm('Supprimer cette piste ?')) {
      deleteTrack(item.id, trackId)
      if (currentTrack?.id === trackId) {
        setCurrentTrack(null)
        setIsPlaying(false)
      }
      onUpdate()
    }
    setContextMenu(null)
  }

  // Jouer une piste
  const playTrack = (track) => {
    if (track.type === 'youtube') {
      setCurrentTrack(track)
      setIsPlaying(true)
    } else {
      setCurrentTrack(track)
      setIsPlaying(true)
      if (audioRef.current) {
        audioRef.current.src = track.url
        audioRef.current.play()
      }
    }
  }

  // Toggle play/pause
  const togglePlay = () => {
    if (!currentTrack) return

    if (currentTrack.type !== 'youtube') {
      if (isPlaying) {
        audioRef.current?.pause()
      } else {
        audioRef.current?.play()
      }
    }
    setIsPlaying(!isPlaying)
  }

  // Piste suivante
  const nextTrack = () => {
    if (!currentTrack || !item.tracks.length) return
    const currentIndex = item.tracks.findIndex(t => t.id === currentTrack.id)
    const nextIndex = (currentIndex + 1) % item.tracks.length
    playTrack(item.tracks[nextIndex])
  }

  // Piste précédente
  const prevTrack = () => {
    if (!currentTrack || !item.tracks.length) return
    const currentIndex = item.tracks.findIndex(t => t.id === currentTrack.id)
    const prevIndex = (currentIndex - 1 + item.tracks.length) % item.tracks.length
    playTrack(item.tracks[prevIndex])
  }

  // Fin de piste
  const handleTrackEnd = () => {
    nextTrack()
  }

  // Formater le temps
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Seek
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    if (audioRef.current && duration) {
      audioRef.current.currentTime = percent * duration
    }
  }

  // Volume
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
    setIsMuted(!isMuted)
  }

  // Icône selon le type
  const getTrackIcon = (type) => {
    const trackType = TRACK_TYPES.find(t => t.id === type)
    return trackType ? trackType.icon : FileAudio
  }

  const getTrackColor = (type) => {
    const trackType = TRACK_TYPES.find(t => t.id === type)
    return trackType ? trackType.color : 'text-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
              <Music className={`w-8 h-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {item.name}
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {item.tracks?.length || 0} piste{(item.tracks?.length || 0) > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              darkMode
                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        {/* Formulaire ajout */}
        {showAddForm && (
          <div className={`mt-4 p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
            {/* Type de piste */}
            <div className="flex gap-2 mb-3">
              {TRACK_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedTrackType(type.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedTrackType === type.id
                      ? darkMode ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'
                      : darkMode ? 'bg-slate-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <type.icon className="w-4 h-4" />
                  {type.name}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={newTrackName}
                onChange={(e) => setNewTrackName(e.target.value)}
                placeholder="Titre de la piste..."
                className={`w-full px-4 py-2 rounded-xl text-sm ${
                  darkMode
                    ? 'bg-slate-700 text-gray-200 placeholder-gray-500 border-slate-600'
                    : 'bg-white text-gray-800 placeholder-gray-400 border-gray-200'
                } border focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                autoFocus
              />
              <input
                type="text"
                value={newTrackUrl}
                onChange={(e) => setNewTrackUrl(e.target.value)}
                placeholder={
                  selectedTrackType === 'youtube'
                    ? 'URL YouTube (ex: https://youtube.com/watch?v=...)'
                    : 'URL du fichier audio/vidéo...'
                }
                className={`w-full px-4 py-2 rounded-xl text-sm ${
                  darkMode
                    ? 'bg-slate-700 text-gray-200 placeholder-gray-500 border-slate-600'
                    : 'bg-white text-gray-800 placeholder-gray-400 border-gray-200'
                } border focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className={`px-4 py-2 rounded-xl text-sm ${
                    darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddTrack}
                  disabled={!newTrackName.trim() || !newTrackUrl.trim()}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    newTrackName.trim() && newTrackUrl.trim()
                      ? darkMode ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'
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

      {/* Lecteur */}
      {currentTrack && (
        <div className={`p-4 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
          {currentTrack.type === 'youtube' ? (
            <div className="aspect-video rounded-xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(currentTrack.url)}?autoplay=1`}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="space-y-4">
              <audio ref={audioRef} />

              {/* Info piste */}
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = getTrackIcon(currentTrack.type)
                  return <Icon className={`w-10 h-10 ${getTrackColor(currentTrack.type)}`} />
                })()}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {currentTrack.name}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {TRACK_TYPES.find(t => t.id === currentTrack.type)?.name}
                  </p>
                </div>
              </div>

              {/* Barre de progression */}
              <div
                className={`h-2 rounded-full cursor-pointer ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
                />
              </div>

              {/* Temps */}
              <div className="flex justify-between text-xs">
                <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>{formatTime(progress)}</span>
                <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>{formatTime(duration)}</span>
              </div>

              {/* Contrôles */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={toggleMute} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={prevTrack}
                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className={`p-3 rounded-full ${
                      darkMode ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-500 hover:bg-purple-600'
                    } text-white`}
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </button>
                  <button
                    onClick={nextTrack}
                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                <div className="w-24" /> {/* Spacer */}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Liste des pistes */}
      <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
        {item.tracks?.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {item.tracks.map((track, index) => {
              const isEditing = editingId === track.id
              const isCurrent = currentTrack?.id === track.id
              const TrackIcon = getTrackIcon(track.type)

              return (
                <div
                  key={track.id}
                  className={`group flex items-center gap-3 p-4 cursor-pointer transition-all ${
                    isCurrent
                      ? darkMode ? 'bg-purple-900/20' : 'bg-purple-50'
                      : darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => !isEditing && playTrack(track)}
                >
                  {/* Numéro / Play */}
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                    isCurrent
                      ? darkMode ? 'bg-purple-600' : 'bg-purple-500'
                      : 'group-hover:bg-purple-500'
                  }`}>
                    {isCurrent && isPlaying ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <span className={`text-sm font-medium ${
                        isCurrent ? 'text-white' : darkMode ? 'text-gray-500 group-hover:text-white' : 'text-gray-400 group-hover:text-white'
                      }`}>
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Icône type */}
                  <TrackIcon className={`w-5 h-5 ${getTrackColor(track.type)}`} />

                  {/* Nom */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleSaveName(track.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName(track.id)
                          if (e.key === 'Escape') { setEditingId(null); setEditingName('') }
                        }}
                        className={`w-full text-sm bg-transparent border-b outline-none ${
                          darkMode ? 'border-purple-500 text-gray-200' : 'border-purple-500 text-gray-800'
                        }`}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className={`truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {track.name}
                      </span>
                    )}
                  </div>

                  {/* Type badge */}
                  <span className={`text-xs px-2 py-1 rounded-lg ${
                    darkMode ? 'bg-slate-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {TRACK_TYPES.find(t => t.id === track.type)?.name}
                  </span>

                  {/* Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setContextMenu(contextMenu === track.id ? null : track.id)
                      }}
                      className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all ${
                        darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-200'
                      }`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {contextMenu === track.id && (
                      <div
                        className={`absolute right-0 top-full z-50 mt-1 rounded-lg shadow-lg py-1 min-w-[120px] ${
                          darkMode ? 'bg-slate-700 border border-slate-600' : 'bg-white border border-gray-200'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setEditingId(track.id)
                            setEditingName(track.name)
                            setContextMenu(null)
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
                            darkMode ? 'hover:bg-slate-600 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <Pencil className="w-3.5 h-3.5" /> Renommer
                        </button>
                        <a
                          href={track.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
                            darkMode ? 'hover:bg-slate-600 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Ouvrir
                        </a>
                        <button
                          onClick={() => handleDeleteTrack(track.id)}
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
          </div>
        ) : (
          <div className={`p-8 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune piste dans cette playlist</p>
            <p className="text-sm mt-1">Cliquez sur "Ajouter" pour ajouter des pistes</p>
          </div>
        )}
      </div>
    </div>
  )
}
