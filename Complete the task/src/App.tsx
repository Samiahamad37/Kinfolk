import { useState } from 'react'
import type { NavPage } from './types'
import { PEOPLE_MAP, CURRENT_USER_ID, fullName, initials } from './data/family'
import {
  LayoutDashboard, GitBranch, Users, Clock, Image, CalendarDays,
  FileText, BookOpen, MessageCircle, Settings2, Menu, X, Bell, Sun, Moon,
  ChevronRight,
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import FamilyTree from './pages/FamilyTree'
import FamilyMembers from './pages/FamilyMembers'
import Timeline from './pages/Timeline'
import Photos from './pages/Photos'
import Events from './pages/Events'
import Stories from './pages/Stories'
import Documents from './pages/Documents'
import Settings from './pages/Settings'
import PersonProfile from './components/PersonProfile'

const NAV_ITEMS: Array<{ id: NavPage; label: string; icon: React.ElementType }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'family-tree', label: 'Family Tree', icon: GitBranch },
  { id: 'family-members', label: 'Family Members', icon: Users },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'photos', label: 'Photos & Memories', icon: Image },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'stories', label: 'Family Stories', icon: BookOpen },
  { id: 'messages', label: 'Messages', icon: MessageCircle },
  { id: 'settings', label: 'Settings', icon: Settings2 },
]

const MOBILE_NAV: Array<{ id: NavPage; label: string; icon: React.ElementType }> = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'family-tree', label: 'Tree', icon: GitBranch },
  { id: 'family-members', label: 'Members', icon: Users },
  { id: 'photos', label: 'Photos', icon: Image },
  { id: 'settings', label: 'Settings', icon: Settings2 },
]

export default function App() {
  const [page, setPage] = useState<NavPage>('dashboard')
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentUser = PEOPLE_MAP[CURRENT_USER_ID]

  const bg = darkMode ? '#1C1208' : '#F7F3ED'
  const cardBg = darkMode ? '#2A1E12' : '#FDFAF6'
  const sidebarBg = darkMode ? '#140E06' : '#2C1810'
  const textPrimary = darkMode ? '#F0E8DC' : '#2C1810'
  const textMuted = darkMode ? '#A89882' : '#7A6352'
  const border = darkMode ? '#3D2E1F' : '#E4D8CC'

  const ctx = { darkMode, bg, cardBg, textPrimary, textMuted, border, setSelectedPersonId }

  function navigateTo(p: NavPage) {
    setPage(p)
    setSidebarOpen(false)
  }

  return (
    <div style={{ background: bg, minHeight: '100vh', display: 'flex', fontFamily: "'Outfit', system-ui, sans-serif", color: textPrimary }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-transform lg:translate-x-0 lg:static lg:flex"
        style={{
          width: 240,
          background: sidebarBg,
          transform: sidebarOpen ? 'translateX(0)' : undefined,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6">
          <div style={{ width: 32, height: 32, background: '#C17E4A', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GitBranch size={17} color="#FDFAF6" />
          </div>
          <div>
            <div className="font-display text-sm font-semibold leading-none" style={{ color: '#F0E8DC' }}>Roots &</div>
            <div className="font-display text-sm font-semibold leading-none" style={{ color: '#C17E4A' }}>Relations</div>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={18} color="#A89882" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pb-4 overflow-y-auto">
          <div className="mb-1">
            <div className="px-3 mb-2" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: '#6E4828', textTransform: 'uppercase' }}>
              Navigation
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = page === item.id
              return (
                <button
                  key={item.id}
                  className="sidebar-nav-item w-full"
                  style={active ? { background: 'rgba(193,126,74,0.18)', color: '#E8A85C' } : {}}
                  onClick={() => navigateTo(item.id)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {active && <ChevronRight size={14} className="ml-auto" />}
                </button>
              )
            })}
          </div>
        </nav>

        {/* User profile */}
        <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(196,174,152,0.12)' }}>
          <div className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => setSelectedPersonId(CURRENT_USER_ID)}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: '#8B5E3C',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 600, color: '#FDFAF6',
              flexShrink: 0,
            }}>
              {initials(currentUser)}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: 13, fontWeight: 500, color: '#F0E8DC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {fullName(currentUser)}
              </div>
              <div style={{ fontSize: 11, color: '#6E4828' }}>Tree creator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0" style={{ marginLeft: 0 }}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 px-5 py-3 border-b" style={{ background: cardBg, borderColor: border }}>
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} style={{ color: textMuted }} />
          </button>

          <div>
            <div className="font-display text-base font-semibold" style={{ color: textPrimary }}>
              {NAV_ITEMS.find(n => n.id === page)?.label}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-bark-50 transition-colors"
              style={{ background: 'transparent', border: `1px solid ${border}` }}
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun size={15} style={{ color: textMuted }} /> : <Moon size={15} style={{ color: textMuted }} />}
            </button>
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-bark-50 transition-colors relative"
              style={{ background: 'transparent', border: `1px solid ${border}` }}
            >
              <Bell size={15} style={{ color: textMuted }} />
              <span style={{ position: 'absolute', top: 5, right: 5, width: 5, height: 5, borderRadius: '50%', background: '#C17E4A' }} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {page === 'dashboard' && <Dashboard {...ctx} setPage={setPage} />}
          {page === 'family-tree' && <FamilyTree {...ctx} />}
          {page === 'family-members' && <FamilyMembers {...ctx} />}
          {page === 'timeline' && <Timeline {...ctx} />}
          {page === 'photos' && <Photos {...ctx} />}
          {page === 'events' && <Events {...ctx} />}
          {page === 'documents' && <Documents {...ctx} />}
          {page === 'stories' && <Stories {...ctx} />}
          {page === 'messages' && <MessagesPlaceholder {...ctx} />}
          {page === 'settings' && <Settings {...ctx} />}
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden border-t flex" style={{ background: cardBg, borderColor: border }}>
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon
            const active = page === item.id
            return (
              <button
                key={item.id}
                className="flex-1 flex flex-col items-center gap-1 py-3"
                onClick={() => navigateTo(item.id)}
                style={{ color: active ? '#C17E4A' : textMuted }}
              >
                <Icon size={20} />
                <span style={{ fontSize: 10 }}>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Person profile panel */}
      {selectedPersonId && (
        <PersonProfile
          personId={selectedPersonId}
          onClose={() => setSelectedPersonId(null)}
          onSelectPerson={setSelectedPersonId}
          darkMode={darkMode}
          cardBg={cardBg}
          textPrimary={textPrimary}
          textMuted={textMuted}
          border={border}
          bg={bg}
        />
      )}
    </div>
  )
}

export interface PageProps {
  darkMode: boolean
  bg: string
  cardBg: string
  textPrimary: string
  textMuted: string
  border: string
  setSelectedPersonId: (id: string | null) => void
}

function MessagesPlaceholder({ cardBg, textPrimary, textMuted, border }: PageProps) {
  return (
    <div className="p-8">
      <EmptyState
        icon="💬"
        title="Messages"
        description="Family messaging coming soon. You'll be able to chat with relatives, share updates, and coordinate family events."
        cardBg={cardBg}
        textPrimary={textPrimary}
        textMuted={textMuted}
        border={border}
      />
    </div>
  )
}

export function EmptyState({
  icon, title, description, cardBg, textPrimary, textMuted, border,
}: {
  icon: string; title: string; description: string;
  cardBg: string; textPrimary: string; textMuted: string; border: string;
}) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-8 rounded-2xl max-w-sm mx-auto"
      style={{ background: cardBg, border: `1px solid ${border}` }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <div className="font-display text-xl font-semibold mb-2" style={{ color: textPrimary }}>{title}</div>
      <div style={{ fontSize: 14, color: textMuted, lineHeight: 1.6 }}>{description}</div>
    </div>
  )
}
