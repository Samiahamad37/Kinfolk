import { useState } from 'react'
import { Upload, Search } from 'lucide-react'
import type { PageProps } from '../App'
import { ALBUMS, PHOTOS } from '../data/family'
import type { Photo } from '../types'

export default function Photos({ cardBg, textPrimary, textMuted, border, darkMode }: PageProps) {
  const [view, setView] = useState<'albums' | 'all'>('albums')
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const displayPhotos = selectedAlbum
    ? PHOTOS.filter(p => p.albumId === selectedAlbum)
    : PHOTOS.filter(p => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${border}` }}>
          {(['albums', 'all'] as const).map(v => (
            <button
              key={v}
              onClick={() => { setView(v); setSelectedAlbum(null) }}
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{ background: view === v ? '#8B5E3C' : cardBg, color: view === v ? '#FDFAF6' : textMuted }}
            >
              {v === 'albums' ? 'Albums' : 'All Photos'}
            </button>
          ))}
        </div>

        {view === 'all' && (
          <div className="relative">
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: textMuted }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search photos…"
              style={{
                paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                borderRadius: 8, border: `1px solid ${border}`, background: cardBg,
                fontSize: 13, color: textPrimary, outline: 'none',
              }}
            />
          </div>
        )}

        <button className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: '#8B5E3C', color: '#FDFAF6' }}>
          <Upload size={14} />
          Upload Photos
        </button>
      </div>

      {/* Albums view */}
      {view === 'albums' && !selectedAlbum && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ALBUMS.map(album => (
            <div
              key={album.id}
              className="rounded-2xl overflow-hidden cursor-pointer group"
              style={{ border: `1px solid ${border}` }}
              onClick={() => { setView('all'); setSelectedAlbum(album.id) }}
            >
              <div className="aspect-[4/3] overflow-hidden relative" style={{ background: '#DED0C0' }}>
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="font-display text-base font-semibold text-white">{album.title}</div>
                  {album.year && <div style={{ fontSize: 12, color: '#C4AE98' }}>{album.year}</div>}
                </div>
              </div>
              <div className="px-4 py-3 flex items-center justify-between" style={{ background: cardBg }}>
                <div style={{ fontSize: 13, color: textMuted }}>{album.description}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#C17E4A' }}>{album.count} photos</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photos grid */}
      {view === 'all' && (
        <>
          {selectedAlbum && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setView('albums'); setSelectedAlbum(null) }}
                style={{ fontSize: 13, color: '#C17E4A', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                ← Back to Albums
              </button>
              <span style={{ color: textMuted }}>·</span>
              <span style={{ fontSize: 13, color: textMuted }}>
                {ALBUMS.find(a => a.id === selectedAlbum)?.title}
              </span>
            </div>
          )}

          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {displayPhotos.map(photo => (
              <div
                key={photo.id}
                className="break-inside-avoid rounded-xl overflow-hidden cursor-pointer group relative"
                style={{ background: '#DED0C0', border: `1px solid ${border}`, marginBottom: 12 }}
                onClick={() => setLightboxPhoto(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>{photo.title}</div>
                  {photo.year && <div style={{ fontSize: 11, color: '#C4AE98' }}>{photo.year}</div>}
                </div>
              </div>
            ))}
          </div>

          {displayPhotos.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: textPrimary, marginBottom: 4 }}>No photos here yet</div>
              <div style={{ fontSize: 13, color: textMuted }}>Upload the first photo to get started</div>
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.9)' }}
          onClick={() => setLightboxPhoto(null)}
        >
          <div className="relative max-w-3xl w-full mx-6" onClick={e => e.stopPropagation()}>
            <img
              src={lightboxPhoto.url.replace(/w=\d+/, 'w=900')}
              alt={lightboxPhoto.title}
              className="w-full rounded-2xl"
            />
            <div className="mt-4">
              <div className="font-display text-lg font-semibold text-white">{lightboxPhoto.title}</div>
              {lightboxPhoto.year && <div style={{ fontSize: 13, color: '#C4AE98' }}>{lightboxPhoto.year}{lightboxPhoto.location && ` · ${lightboxPhoto.location}`}</div>}
              {lightboxPhoto.description && <div style={{ fontSize: 13, color: '#A89882', marginTop: 4 }}>{lightboxPhoto.description}</div>}
            </div>
            <button
              className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors text-2xl font-light"
              onClick={() => setLightboxPhoto(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
