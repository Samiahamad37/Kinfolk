import { useState } from 'react'
import { CalendarDays, Plus, MapPin, Users } from 'lucide-react'
import type { PageProps } from '../App'
import { EVENTS, PEOPLE_MAP } from '../data/family'
import type { FamilyEvent } from '../types'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const TYPE_CONFIG: Record<FamilyEvent['type'], { icon: string; color: string; bg: string }> = {
  birth:      { icon: '👶', color: '#5E8050', bg: '#E0EAD8' },
  death:      { icon: '🕯️', color: '#7A6352', bg: '#EAE0D5' },
  marriage:   { icon: '💍', color: '#8B5E3C', bg: '#F5EDE4' },
  graduation: { icon: '🎓', color: '#A67B52', bg: '#FAE3C0' },
  reunion:    { icon: '🎉', color: '#C17E4A', bg: '#FDF4E7' },
  memorial:   { icon: '🌿', color: '#6E8050', bg: '#EAF0E4' },
  move:       { icon: '🏠', color: '#8B7052', bg: '#F0EAE0' },
  other:      { icon: '📌', color: '#A89882', bg: '#F7F3ED' },
}

export default function Events({ cardBg, textPrimary, textMuted, border, setSelectedPersonId, darkMode }: PageProps) {
  const [view, setView] = useState<'calendar' | 'list'>('list')
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)

  const upcomingEvents = [...EVENTS]
    .filter(e => e.year >= 2020)
    .sort((a, b) => b.year - a.year || (b.month ?? 0) - (a.month ?? 0))

  const birthdayEvents = EVENTS.filter(e => e.type === 'birth' || e.type === 'marriage')

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-display text-xl font-semibold" style={{ color: textPrimary }}>Family Events</div>
          <div style={{ fontSize: 13, color: textMuted, marginTop: 2 }}>{EVENTS.length} events recorded across all generations</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${border}` }}>
            {(['list', 'calendar'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-4 py-2 text-sm font-medium transition-colors"
                style={{ background: view === v ? '#8B5E3C' : cardBg, color: view === v ? '#FDFAF6' : textMuted }}
              >
                {v === 'list' ? 'List' : 'Calendar'}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: '#8B5E3C', color: '#FDFAF6' }}>
            <Plus size={14} />
            Add Event
          </button>
        </div>
      </div>

      {view === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main events list */}
          <div className="lg:col-span-2 space-y-3">
            <div className="text-sm font-semibold mb-4" style={{ color: textMuted }}>All Events</div>
            {[...EVENTS].sort((a, b) => b.year - a.year).map(event => {
              const cfg = TYPE_CONFIG[event.type]
              const people = event.personIds.map(id => PEOPLE_MAP[id]).filter(Boolean)
              return (
                <div key={event.id} className="rounded-xl p-4 flex gap-4"
                  style={{ background: cardBg, border: `1px solid ${border}` }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                    background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                  }}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, fontFamily: "'Lora', serif" }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>
                      {event.date}
                      {event.location && (
                        <span className="flex items-center gap-1 mt-1">
                          <MapPin size={10} /> {event.location}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <div style={{ fontSize: 12, color: textMuted, marginTop: 4, lineHeight: 1.6 }}>{event.description}</div>
                    )}
                    {people.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
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
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: cfg.color,
                    flexShrink: 0, alignSelf: 'flex-start',
                    background: cfg.bg, padding: '3px 8px', borderRadius: 99,
                  }}>
                    {event.year}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Upcoming birthdays */}
            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: border, background: cardBg }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>Anniversaries & Birthdays</div>
              </div>
              <div className="divide-y" style={{ borderColor: border }}>
                {birthdayEvents.slice(0, 6).map(event => {
                  const cfg = TYPE_CONFIG[event.type]
                  return (
                    <div key={event.id} className="flex items-center gap-3 px-4 py-3" style={{ background: cardBg }}>
                      <span style={{ fontSize: 16 }}>{cfg.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: 12, fontWeight: 500, color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {event.title}
                        </div>
                        <div style={{ fontSize: 11, color: textMuted }}>{event.date}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-xl p-4 space-y-3" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 4 }}>Event Summary</div>
              {(['birth','marriage','graduation','reunion'] as FamilyEvent['type'][]).map(type => {
                const count = EVENTS.filter(e => e.type === type).length
                const cfg = TYPE_CONFIG[type]
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span style={{ fontSize: 16 }}>{cfg.icon}</span>
                    <div style={{ flex: 1, fontSize: 13, color: textMuted, textTransform: 'capitalize' }}>{type}s</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{count}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {view === 'calendar' && (
        <div className="rounded-xl p-6" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {FULL_MONTHS.map((month, idx) => {
              const monthEvents = EVENTS.filter(e => e.month === idx + 1)
              return (
                <div
                  key={month}
                  className="rounded-xl p-3 cursor-pointer transition-all hover:shadow-sm"
                  style={{
                    border: `1px solid ${selectedMonth === idx ? '#C17E4A' : border}`,
                    background: selectedMonth === idx ? '#FDF4E7' : 'transparent',
                  }}
                  onClick={() => setSelectedMonth(prev => prev === idx ? null : idx)}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: selectedMonth === idx ? '#8B5E3C' : textMuted, marginBottom: 4 }}>
                    {MONTHS[idx]}
                  </div>
                  {monthEvents.length > 0 ? (
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: textPrimary }}>{monthEvents.length}</div>
                      <div style={{ fontSize: 10, color: textMuted }}>event{monthEvents.length !== 1 ? 's' : ''}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: border }}>—</div>
                  )}
                </div>
              )
            })}
          </div>

          {selectedMonth !== null && (
            <div className="mt-6 space-y-3">
              <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>{FULL_MONTHS[selectedMonth]} events</div>
              {EVENTS.filter(e => e.month === selectedMonth + 1).map(event => {
                const cfg = TYPE_CONFIG[event.type]
                return (
                  <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ border: `1px solid ${border}` }}>
                    <span style={{ fontSize: 18 }}>{cfg.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{event.title}</div>
                      <div style={{ fontSize: 12, color: textMuted }}>{event.date}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
