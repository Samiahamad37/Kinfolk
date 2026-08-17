import { useRef, useState, useCallback, useEffect } from 'react'
import { ZoomIn, ZoomOut, Crosshair, Search, Users, GitBranch } from 'lucide-react'
import type { PageProps } from '../App'
import { PEOPLE, PEOPLE_MAP, fullName, initials, avatarColor, CURRENT_USER_ID } from '../data/family'

// Tree node positions (cx = horizontal center, y = top of card)
// Canvas: 1020 × 760
const CARD_W = 148
const CARD_H = 84

const NODE_POS: Record<string, { cx: number; y: number }> = {
  'robert-hayes':   { cx: 155,  y: 30  },
  'eleanor-hayes':  { cx: 315,  y: 30  },
  'james-hayes':    { cx: 155,  y: 240 },
  'catherine-hayes':{ cx: 315,  y: 240 },
  'david-hayes':    { cx: 650,  y: 240 },
  'patricia-hayes': { cx: 810,  y: 240 },
  'thomas-hayes':   { cx: 80,   y: 450 },
  'sarah-hayes':    { cx: 270,  y: 450 },
  'michael-chen':   { cx: 450,  y: 450 },
  'rachel-hayes':   { cx: 650,  y: 450 },
  'benjamin-hayes': { cx: 820,  y: 450 },
  'emma-chen':      { cx: 310,  y: 660 },
  'lucas-chen':     { cx: 470,  y: 660 },
}

// Couple groups: person1, person2, children
const COUPLES = [
  {
    id: 'robert-eleanor',
    p1: 'robert-hayes',
    p2: 'eleanor-hayes',
    children: ['james-hayes', 'david-hayes'],
  },
  {
    id: 'james-catherine',
    p1: 'james-hayes',
    p2: 'catherine-hayes',
    children: ['thomas-hayes', 'sarah-hayes'],
  },
  {
    id: 'david-patricia',
    p1: 'david-hayes',
    p2: 'patricia-hayes',
    children: ['rachel-hayes', 'benjamin-hayes'],
  },
  {
    id: 'sarah-michael',
    p1: 'sarah-hayes',
    p2: 'michael-chen',
    children: ['emma-chen', 'lucas-chen'],
  },
]

function coupleMidX(coupleId: string): number {
  const c = COUPLES.find(c => c.id === coupleId)!
  const p1 = NODE_POS[c.p1]
  const p2 = NODE_POS[c.p2]
  return (p1.cx + p2.cx) / 2
}

function coupleBottomY(coupleId: string): number {
  const c = COUPLES.find(c => c.id === coupleId)!
  const p1 = NODE_POS[c.p1]
  return p1.y + CARD_H
}

function buildConnections(): React.ReactNode[] {
  const lines: React.ReactNode[] = []
  const strokeColor = '#DED0C0'
  const strokeW = 1.5

  // Spouse lines
  COUPLES.forEach(couple => {
    const p1 = NODE_POS[couple.p1]
    const p2 = NODE_POS[couple.p2]
    const y = p1.y + CARD_H / 2
    const x1 = p1.cx + CARD_W / 2
    const x2 = p2.cx - CARD_W / 2
    lines.push(
      <line
        key={`spouse-${couple.id}`}
        x1={x1} y1={y} x2={x2} y2={y}
        stroke="#C17E4A" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.7}
      />
    )
  })

  // Parent-child connections using T-shape
  COUPLES.forEach(couple => {
    if (couple.children.length === 0) return
    const mx = coupleMidX(couple.id)
    const bottomY = coupleBottomY(couple.id)
    const junctionY = bottomY + 44

    const childXs = couple.children.map(cid => NODE_POS[cid].cx)
    const childTopY = NODE_POS[couple.children[0]].y

    const leftMost = Math.min(mx, ...childXs)
    const rightMost = Math.max(mx, ...childXs)

    // Vertical from couple midpoint down to junction
    lines.push(
      <line key={`v-couple-${couple.id}`}
        x1={mx} y1={bottomY} x2={mx} y2={junctionY}
        stroke={strokeColor} strokeWidth={strokeW} />
    )
    // Horizontal bar at junction
    lines.push(
      <line key={`h-junction-${couple.id}`}
        x1={leftMost} y1={junctionY} x2={rightMost} y2={junctionY}
        stroke={strokeColor} strokeWidth={strokeW} />
    )
    // Verticals down to each child
    couple.children.forEach(childId => {
      const cx = NODE_POS[childId].cx
      lines.push(
        <line key={`v-child-${couple.id}-${childId}`}
          x1={cx} y1={junctionY} x2={cx} y2={childTopY}
          stroke={strokeColor} strokeWidth={strokeW} />
      )
    })
  })

  return lines
}

interface PersonCardProps {
  personId: string
  isHighlighted: boolean
  isSelected: boolean
  isUser: boolean
  onClick: () => void
  darkMode: boolean
}

function PersonCard({ personId, isHighlighted, isSelected, isUser, onClick, darkMode }: PersonCardProps) {
  const person = PEOPLE_MAP[personId]
  const pos = NODE_POS[personId]
  if (!person || !pos) return null

  const cardBg = isUser
    ? (darkMode ? '#3A2310' : '#FDF4E7')
    : (darkMode ? '#2A1E12' : '#FDFAF6')
  const borderColor = isSelected
    ? '#C17E4A'
    : isHighlighted
    ? '#A67B52'
    : isUser
    ? '#8B5E3C'
    : (darkMode ? '#3D2E1F' : '#E4D8CC')

  const displayName = fullName(person)
  const shortName = displayName.length > 18 ? `${person.firstName} ${person.lastName}` : displayName

  return (
    <div
      className="person-card"
      style={{
        left: pos.cx - CARD_W / 2,
        top: pos.y,
        width: CARD_W,
        background: cardBg,
        borderColor,
        boxShadow: isSelected
          ? `0 0 0 3px rgba(193,126,74,0.25), 0 4px 16px rgba(44,24,16,0.15)`
          : undefined,
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
          background: avatarColor(person), color: '#FDFAF6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 600,
        }}>
          {initials(person)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12, fontWeight: 600,
            color: isUser ? '#6E4828' : (darkMode ? '#F0E8DC' : '#2C1810'),
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            fontFamily: "'Outfit', sans-serif",
          }}>
            {shortName}
            {isUser && <span style={{ marginLeft: 4, fontSize: 9, color: '#C17E4A' }}>YOU</span>}
          </div>
          <div style={{ fontSize: 10.5, color: darkMode ? '#7A6352' : '#A89882', marginTop: 1 }}>
            {person.birthYear ?? '?'}
            {person.deathYear ? ` – ${person.deathYear}` : person.isLiving ? '' : ' – ?'}
          </div>
        </div>
      </div>
      <div style={{
        marginTop: 6, paddingTop: 6, borderTop: `1px solid ${darkMode ? '#3D2E1F' : '#F0E8DC'}`,
        fontSize: 10, color: darkMode ? '#6E4828' : '#C4AE98',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {person.occupation ?? (person.isLiving ? 'Family member' : 'Deceased')}
      </div>
    </div>
  )
}

export default function FamilyTree({ darkMode, textPrimary, textMuted, border, cardBg, setSelectedPersonId }: PageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(0.85)
  const [pan, setPan] = useState({ x: 40, y: 30 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<typeof PEOPLE>([])

  const connections = buildConnections()

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.08 : 0.08
    setZoom(z => Math.max(0.35, Math.min(2, z + delta)))
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.person-card')) return
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [pan])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return
    setPan({
      x: dragStart.current.px + (e.clientX - dragStart.current.x),
      y: dragStart.current.py + (e.clientY - dragStart.current.y),
    })
  }, [dragging])

  const handlePointerUp = useCallback(() => setDragging(false), [])

  function handleCardClick(personId: string) {
    setSelectedId(prev => prev === personId ? null : personId)
    setSelectedPersonId(personId)
  }

  function handleSearch(q: string) {
    setSearchQuery(q)
    if (!q.trim()) { setSearchResults([]); return }
    const lower = q.toLowerCase()
    setSearchResults(PEOPLE.filter(p =>
      fullName(p).toLowerCase().includes(lower) ||
      p.occupation?.toLowerCase().includes(lower)
    ).slice(0, 6))
  }

  function centerTree() {
    setPan({ x: 40, y: 30 })
    setZoom(0.85)
  }

  const CANVAS_W = 1020
  const CANVAS_H = 780

  const genCounts = [0, 1, 2, 3].map(g => PEOPLE.filter(p => p.generation === g).length)

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 57px)' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b flex-wrap" style={{ background: cardBg, borderColor: border }}>
        {/* Search */}
        <div className="relative">
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: textMuted }} />
          <input
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search family members…"
            style={{
              paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
              borderRadius: 8, border: `1px solid ${border}`, background: 'transparent',
              fontSize: 13, color: textPrimary, outline: 'none', width: 200,
            }}
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-1 rounded-lg shadow-xl z-10 overflow-hidden"
              style={{ background: cardBg, border: `1px solid ${border}`, width: 240 }}>
              {searchResults.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:opacity-80"
                  onClick={() => { setSelectedId(p.id); setSelectedPersonId(p.id); setSearchQuery(''); setSearchResults([]) }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', background: avatarColor(p),
                    color: '#FDFAF6', fontSize: 10, fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {initials(p)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: textPrimary }}>{fullName(p)}</div>
                    <div style={{ fontSize: 11, color: textMuted }}>Gen {p.generation + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
            style={{ border: `1px solid ${border}`, background: 'transparent' }}
            onClick={() => setZoom(z => Math.min(2, z + 0.12))}
          >
            <ZoomIn size={14} style={{ color: textMuted }} />
          </button>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
            style={{ border: `1px solid ${border}`, background: 'transparent' }}
            onClick={() => setZoom(z => Math.max(0.35, z - 0.12))}
          >
            <ZoomOut size={14} style={{ color: textMuted }} />
          </button>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
            style={{ border: `1px solid ${border}`, background: 'transparent' }}
            onClick={centerTree}
          >
            <Crosshair size={14} style={{ color: textMuted }} />
          </button>
        </div>

        <div style={{ fontSize: 12, color: textMuted }}>{Math.round(zoom * 100)}%</div>

        <div className="ml-auto flex items-center gap-4">
          {/* Generation legend */}
          {[0,1,2,3].map(g => (
            <div key={g} className="flex items-center gap-1.5 hidden md:flex">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: avatarColor({ generation: g } as any) }} />
              <span style={{ fontSize: 11, color: textMuted }}>Gen {g+1} ({genCounts[g]})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden tree-canvas-wrapper relative"
        style={{ background: '#F7F3ED', cursor: dragging ? 'grabbing' : 'grab' }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Subtle dot-grid background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(139,94,60,0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }} />

        {/* Transformed tree */}
        <div style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'relative',
          width: CANVAS_W,
          height: CANVAS_H,
        }}>
          {/* SVG connections */}
          <svg
            width={CANVAS_W}
            height={CANVAS_H}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          >
            {connections}
          </svg>

          {/* Generation labels */}
          {[
            { g: 0, y: 30, label: 'Grandparents' },
            { g: 1, y: 240, label: 'Parents' },
            { g: 2, y: 450, label: 'Our Generation' },
            { g: 3, y: 660, label: 'Children' },
          ].map(({ g, y, label }) => (
            <div key={g} style={{
              position: 'absolute', right: 12, top: y + CARD_H / 2 - 8,
              fontSize: 10, color: '#C4AE98', fontWeight: 500,
              letterSpacing: '0.05em', textTransform: 'uppercase',
              fontFamily: "'Outfit', sans-serif",
            }}>
              {label}
            </div>
          ))}

          {/* Person cards */}
          {Object.keys(NODE_POS).map(personId => (
            <PersonCard
              key={personId}
              personId={personId}
              isHighlighted={false}
              isSelected={selectedId === personId}
              isUser={personId === CURRENT_USER_ID}
              onClick={() => handleCardClick(personId)}
              darkMode={darkMode}
            />
          ))}
        </div>

        {/* Hint */}
        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          fontSize: 11, color: textMuted, display: 'flex', alignItems: 'center', gap: 6,
          background: cardBg, padding: '6px 12px', borderRadius: 99,
          border: `1px solid ${border}`, pointerEvents: 'none',
        }}>
          <GitBranch size={11} />
          Scroll to zoom · Drag to pan · Click a card to view profile
        </div>
      </div>
    </div>
  )
}
