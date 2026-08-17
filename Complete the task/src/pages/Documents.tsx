import { useState } from 'react'
import { FileText, Download, Search, Upload, Lock } from 'lucide-react'
import type { PageProps } from '../App'
import { DOCUMENTS, PEOPLE_MAP, fullName } from '../data/family'
import type { FamilyDocument } from '../types'

const TYPE_CONFIG: Record<FamilyDocument['type'], { icon: string; color: string; bg: string; label: string }> = {
  'birth-cert':    { icon: '📄', color: '#5E8050', bg: '#E0EAD8', label: 'Birth Certificate' },
  'marriage-cert': { icon: '💒', color: '#8B5E3C', bg: '#F5EDE4', label: 'Marriage Certificate' },
  'death-cert':    { icon: '🕯️', color: '#7A6352', bg: '#EAE0D5', label: 'Death Certificate' },
  'military':      { icon: '🎖️', color: '#4A6080', bg: '#E0EAF0', label: 'Military Record' },
  'immigration':   { icon: '🚢', color: '#6050A0', bg: '#E8E4F5', label: 'Immigration Record' },
  'census':        { icon: '📊', color: '#A06030', bg: '#F5E8DC', label: 'Census Record' },
  'photo':         { icon: '🖼️', color: '#A05050', bg: '#F5E0E0', label: 'Historical Photo' },
  'other':         { icon: '📋', color: '#7A7058', bg: '#F0EDE4', label: 'Document' },
}

const CATEGORIES: Array<{ id: FamilyDocument['type'] | 'all'; label: string }> = [
  { id: 'all', label: 'All Documents' },
  { id: 'birth-cert', label: 'Birth Certificates' },
  { id: 'marriage-cert', label: 'Marriage Certificates' },
  { id: 'death-cert', label: 'Death Certificates' },
  { id: 'immigration', label: 'Immigration' },
  { id: 'other', label: 'Other Records' },
]

export default function Documents({ cardBg, textPrimary, textMuted, border, setSelectedPersonId, darkMode }: PageProps) {
  const [category, setCategory] = useState<FamilyDocument['type'] | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = DOCUMENTS.filter(d => {
    const matchCat = category === 'all' || d.type === category
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-display text-xl font-semibold" style={{ color: textPrimary }}>Documents</div>
          <div style={{ fontSize: 13, color: textMuted, marginTop: 2 }}>
            {DOCUMENTS.length} documents preserved in your family archive
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: '#8B5E3C', color: '#FDFAF6' }}>
          <Upload size={14} />
          Upload Document
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Category sidebar */}
        <div className="lg:w-48 flex-shrink-0">
          <nav className="space-y-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                style={{
                  background: category === cat.id ? '#F5EDE4' : 'transparent',
                  color: category === cat.id ? '#8B5E3C' : textMuted,
                  fontWeight: category === cat.id ? 600 : 400,
                }}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: textMuted }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search documents…"
              style={{
                width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                borderRadius: 9, border: `1px solid ${border}`, background: cardBg,
                fontSize: 13, color: textPrimary, outline: 'none',
              }}
            />
          </div>

          <div style={{ fontSize: 12, color: textMuted }}>{filtered.length} document{filtered.length !== 1 ? 's' : ''}</div>

          {/* Document list */}
          <div className="space-y-3">
            {filtered.map(doc => {
              const cfg = TYPE_CONFIG[doc.type]
              const people = doc.personIds.map(id => PEOPLE_MAP[id]).filter(Boolean)

              return (
                <div
                  key={doc.id}
                  className="rounded-xl p-4 flex items-start gap-4 hover:shadow-sm transition-all"
                  style={{ background: cardBg, border: `1px solid ${border}` }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                  }}>
                    {cfg.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, fontFamily: "'Lora', serif" }}>
                        {doc.title}
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '3px 7px', borderRadius: 99,
                        background: cfg.bg, color: cfg.color, flexShrink: 0,
                      }}>
                        {cfg.label}
                      </span>
                    </div>

                    {doc.description && (
                      <div style={{ fontSize: 12.5, color: textMuted, marginTop: 3, lineHeight: 1.5 }}>
                        {doc.description}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      {doc.year && (
                        <span style={{ fontSize: 11, color: textMuted }}>{doc.year}</span>
                      )}
                      {doc.fileSize && (
                        <span style={{ fontSize: 11, color: textMuted }}>{doc.fileSize}</span>
                      )}
                      {people.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {people.map(p => (
                            <button
                              key={p.id}
                              onClick={() => setSelectedPersonId(p.id)}
                              style={{
                                fontSize: 11, padding: '2px 7px', borderRadius: 99,
                                background: cfg.bg, color: cfg.color, fontWeight: 500,
                                cursor: 'pointer', border: 'none',
                              }}
                            >
                              {p.firstName} {p.lastName}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
                      style={{ border: `1px solid ${border}`, background: 'transparent' }}
                    >
                      <Lock size={12} style={{ color: textMuted }} />
                    </button>
                    <button
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
                      style={{ border: `1px solid ${border}`, background: 'transparent' }}
                    >
                      <Download size={12} style={{ color: textMuted }} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: textPrimary, marginBottom: 4 }}>No documents found</div>
              <div style={{ fontSize: 13, color: textMuted }}>Upload important family records to preserve them</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
