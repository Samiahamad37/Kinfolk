import { useState } from 'react'
import { Search, LayoutGrid, List, Filter, ArrowUpDown } from 'lucide-react'
import type { PageProps } from '../App'
import { PEOPLE, fullName, initials, avatarColor, age } from '../data/family'
import type { Person } from '../types'

type SortKey = 'name' | 'age' | 'generation'
type ViewMode = 'grid' | 'list'

export default function FamilyMembers({ cardBg, textPrimary, textMuted, border, setSelectedPersonId, darkMode }: PageProps) {
  const [query, setQuery] = useState('')
  const [view, setView] = useState<ViewMode>('grid')
  const [sort, setSort] = useState<SortKey>('generation')
  const [filterGen, setFilterGen] = useState<number | null>(null)
  const [filterLiving, setFilterLiving] = useState<boolean | null>(null)

  const filtered = PEOPLE
    .filter(p => {
      const matchQuery = !query || fullName(p).toLowerCase().includes(query.toLowerCase()) ||
        p.occupation?.toLowerCase().includes(query.toLowerCase())
      const matchGen = filterGen === null || p.generation === filterGen
      const matchLiving = filterLiving === null || p.isLiving === filterLiving
      return matchQuery && matchGen && matchLiving
    })
    .sort((a, b) => {
      if (sort === 'name') return fullName(a).localeCompare(fullName(b))
      if (sort === 'age') return (b.birthYear ?? 0) - (a.birthYear ?? 0)
      return a.generation - b.generation || (b.birthYear ?? 0) - (a.birthYear ?? 0)
    })

  const genLabels = ['Grandparents', 'Parents', 'Our Generation', 'Children']

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header + controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: textMuted }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search members…"
            style={{
              width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
              borderRadius: 9, border: `1px solid ${border}`, background: cardBg,
              fontSize: 13, color: textPrimary, outline: 'none',
            }}
          />
        </div>

        {/* Generation filter */}
        <select
          value={filterGen ?? ''}
          onChange={e => setFilterGen(e.target.value === '' ? null : Number(e.target.value))}
          style={{
            padding: '8px 12px', borderRadius: 9, border: `1px solid ${border}`,
            background: cardBg, fontSize: 13, color: textPrimary, outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="">All generations</option>
          {genLabels.map((label, i) => <option key={i} value={i}>{label}</option>)}
        </select>

        {/* Living filter */}
        <select
          value={filterLiving === null ? '' : filterLiving ? 'living' : 'deceased'}
          onChange={e => setFilterLiving(e.target.value === '' ? null : e.target.value === 'living')}
          style={{
            padding: '8px 12px', borderRadius: 9, border: `1px solid ${border}`,
            background: cardBg, fontSize: 13, color: textPrimary, outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="">All members</option>
          <option value="living">Living</option>
          <option value="deceased">Deceased</option>
        </select>

        {/* Sort */}
        <button
          onClick={() => setSort(s => s === 'name' ? 'age' : s === 'age' ? 'generation' : 'name')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:opacity-80"
          style={{ border: `1px solid ${border}`, background: cardBg, fontSize: 13, color: textPrimary }}
        >
          <ArrowUpDown size={13} />
          {sort === 'name' ? 'Name' : sort === 'age' ? 'Age' : 'Generation'}
        </button>

        {/* View toggle */}
        <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${border}` }}>
          {(['grid', 'list'] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="p-2 transition-colors"
              style={{ background: view === v ? '#8B5E3C' : cardBg, color: view === v ? '#FDFAF6' : textMuted }}
            >
              {v === 'grid' ? <LayoutGrid size={14} /> : <List size={14} />}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 13, color: textMuted }}>{filtered.length} member{filtered.length !== 1 ? 's' : ''}</div>

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(person => (
            <MemberCard key={person.id} person={person} cardBg={cardBg} textPrimary={textPrimary} textMuted={textMuted} border={border} darkMode={darkMode} onClick={() => setSelectedPersonId(person.id)} />
          ))}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b text-xs font-semibold" style={{ borderColor: border, color: textMuted, background: cardBg }}>
            <span>Member</span>
            <span className="hidden md:block">Occupation</span>
            <span>Generation</span>
            <span>Status</span>
          </div>
          <div className="divide-y" style={{ borderColor: border }}>
            {filtered.map(person => (
              <MemberRow key={person.id} person={person} cardBg={cardBg} textPrimary={textPrimary} textMuted={textMuted} border={border} onClick={() => setSelectedPersonId(person.id)} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: textPrimary, marginBottom: 4 }}>No members found</div>
          <div style={{ fontSize: 13, color: textMuted }}>Try adjusting your search or filters</div>
        </div>
      )}
    </div>
  )
}

function MemberCard({ person, cardBg, textPrimary, textMuted, border, darkMode, onClick }: {
  person: Person; cardBg: string; textPrimary: string; textMuted: string; border: string; darkMode: boolean; onClick: () => void
}) {
  const genLabels = ['Grandparent', 'Parent', 'Sibling/Cousin', 'Child']
  const personAge = age(person)

  return (
    <div
      className="rounded-xl p-4 cursor-pointer transition-all hover:shadow-md"
      style={{ background: cardBg, border: `1px solid ${border}` }}
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center">
        <div style={{
          width: 56, height: 56, borderRadius: '50%', marginBottom: 10,
          background: avatarColor(person), color: '#FDFAF6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 600,
          position: 'relative',
        }}>
          {initials(person)}
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 12, height: 12, borderRadius: '50%', border: `2px solid ${cardBg}`,
            background: person.isLiving ? '#5E8050' : '#C4AE98',
          }} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 2, lineHeight: 1.3 }}>
          {person.firstName} {person.lastName}
        </div>
        <div style={{ fontSize: 10.5, color: '#C17E4A', fontWeight: 500, marginBottom: 4 }}>
          {genLabels[person.generation] ?? 'Family'}
        </div>
        <div style={{ fontSize: 11, color: textMuted }}>
          b. {person.birthYear ?? '?'}
          {personAge !== null && !person.deathYear && ` · ${personAge} yrs`}
        </div>
        {person.occupation && (
          <div style={{ fontSize: 10.5, color: textMuted, marginTop: 4, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
            {person.occupation}
          </div>
        )}
      </div>
    </div>
  )
}

function MemberRow({ person, cardBg, textPrimary, textMuted, border, onClick }: {
  person: Person; cardBg: string; textPrimary: string; textMuted: string; border: string; onClick: () => void
}) {
  const genLabels = ['Grandparent', 'Parent', 'Sibling/Cousin', 'Child']
  return (
    <div
      className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3 cursor-pointer hover:opacity-80 transition-opacity"
      style={{ background: cardBg }}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: avatarColor(person), color: '#FDFAF6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 600,
        }}>
          {initials(person)}
        </div>
        <div className="min-w-0">
          <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {fullName(person)}
          </div>
          <div style={{ fontSize: 11, color: textMuted }}>b. {person.birthYear ?? '?'}{person.birthPlace ? ` · ${person.birthPlace}` : ''}</div>
        </div>
      </div>
      <div className="hidden md:block" style={{ fontSize: 12, color: textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
        {person.occupation ?? '—'}
      </div>
      <div style={{ fontSize: 12, color: textMuted, whiteSpace: 'nowrap' }}>
        {genLabels[person.generation] ?? `Gen ${person.generation + 1}`}
      </div>
      <div>
        <span style={{
          fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 99,
          background: person.isLiving ? '#E0EAD8' : '#F0EBDC',
          color: person.isLiving ? '#3A5830' : '#6E4828',
        }}>
          {person.isLiving ? 'Living' : 'Deceased'}
        </span>
      </div>
    </div>
  )
}
