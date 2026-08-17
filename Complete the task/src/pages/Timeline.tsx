import { useState } from 'react'
import { Filter } from 'lucide-react'
import type { PageProps } from '../App'
import { EVENTS, PEOPLE_MAP, fullName } from '../data/family'
import type { FamilyEvent } from '../types'

const TYPE_CONFIG: Record<FamilyEvent['type'], { icon: string; color: string; bg: string; label: string }> = {
  birth:      { icon: '👶', color: '#5E8050', bg: '#E0EAD8', label: 'Birth' },
  death:      { icon: '🕯️', color: '#7A6352', bg: '#EAE0D5', label: 'Death' },
  marriage:   { icon: '💍', color: '#8B5E3C', bg: '#F5EDE4', label: 'Marriage' },
  graduation: { icon: '🎓', color: '#A67B52', bg: '#FAE3C0', label: 'Graduation' },
  reunion:    { icon: '🎉', color: '#C17E4A', bg: '#FDF4E7', label: 'Reunion' },
  memorial:   { icon: '🌿', color: '#6E8050', bg: '#EAF0E4', label: 'Memorial' },
  move:       { icon: '🏠', color: '#8B7052', bg: '#F0EAE0', label: 'Move' },
  other:      { icon: '📌', color: '#A89882', bg: '#F7F3ED', label: 'Event' },
}

export default function Timeline({ cardBg, textPrimary, textMuted, border, setSelectedPersonId, darkMode }: PageProps) {
  const [filter, setFilter] = useState<FamilyEvent['type'] | 'all'>('all')

  const sorted = [...EVENTS]
    .filter(e => filter === 'all' || e.type === filter)
    .sort((a, b) => a.year - b.year || (a.month ?? 0) - (b.month ?? 0))

  const grouped = sorted.reduce<Record<number, FamilyEvent[]>>((acc, e) => {
    if (!acc[e.year]) acc[e.year] = []
    acc[e.year].push(e)
    return acc
  }, {})

  const years = Object.keys(grouped).map(Number).sort((a, b) => a - b)
  const types: Array<FamilyEvent['type'] | 'all'> = ['all', 'birth', 'death', 'marriage', 'graduation', 'reunion', 'other']

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Filter row */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        <Filter size={14} style={{ color: textMuted }} />
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: filter === t ? '#8B5E3C' : cardBg,
              color: filter === t ? '#FDFAF6' : textMuted,
              border: `1px solid ${filter === t ? '#8B5E3C' : border}`,
            }}
          >
            {t === 'all' ? 'All events' : TYPE_CONFIG[t].label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical spine */}
        <div style={{
          position: 'absolute', left: 72, top: 0, bottom: 0,
          width: 1.5, background: border,
        }} />

        <div className="space-y-0">
          {years.map(year => (
            <div key={year}>
              {/* Year marker */}
              <div className="flex items-center gap-4 mb-4 mt-8 first:mt-0">
                <div style={{
                  width: 72, textAlign: 'right', paddingRight: 20,
                  fontSize: 13, fontWeight: 700, color: '#C17E4A',
                  fontFamily: "'Lora', serif",
                }}>
                  {year}
                </div>
                <div style={{
                  width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                  background: '#C17E4A', marginLeft: -4,
                  boxShadow: '0 0 0 3px rgba(193,126,74,0.2)',
                }} />
              </div>

              {/* Events in this year */}
              {grouped[year].map((event, idx) => {
                const cfg = TYPE_CONFIG[event.type]
                const people = event.personIds.map(id => PEOPLE_MAP[id]).filter(Boolean)

                return (
                  <div key={event.id} className="flex gap-4 mb-3 pl-0" style={{ paddingLeft: 72 }}>
                    <div style={{ width: 20, display: 'flex', justifyContent: 'center', flexShrink: 0, paddingTop: 2 }}>
                      <div style={{
                        width: 1.5, height: '100%', background: border,
                        position: 'relative', marginLeft: 3,
                      }} />
                    </div>

                    <div className="flex-1 rounded-xl p-4 mb-1 transition-all hover:shadow-sm cursor-default"
                      style={{ background: cardBg, border: `1px solid ${border}` }}>
                      <div className="flex items-start gap-3">
                        <div style={{
                          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                          background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16,
                        }}>
                          {cfg.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, marginBottom: 2, fontFamily: "'Lora', serif" }}>
                            {event.title}
                          </div>
                          <div style={{ fontSize: 12, color: textMuted, marginBottom: event.description || people.length > 0 ? 8 : 0 }}>
                            {event.date}
                            {event.location && ` · ${event.location}`}
                          </div>
                          {event.description && (
                            <div style={{ fontSize: 12.5, color: textMuted, lineHeight: 1.6, marginBottom: people.length > 0 ? 8 : 0 }}>
                              {event.description}
                            </div>
                          )}
                          {people.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {people.map(p => (
                                <button
                                  key={p.id}
                                  onClick={() => setSelectedPersonId(p.id)}
                                  style={{
                                    fontSize: 11, padding: '2px 8px', borderRadius: 99,
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
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: '3px 7px', borderRadius: 99,
                          background: cfg.bg, color: cfg.color, flexShrink: 0,
                        }}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
