import { Users, Heart, TreePine, Cake, Calendar, Plus, ArrowRight, Clock } from 'lucide-react'
import type { PageProps } from '../App'
import type { NavPage } from '../types'
import { PEOPLE, PEOPLE_MAP, EVENTS, STORIES, PHOTOS, fullName, initials, avatarColor } from '../data/family'

interface DashboardProps extends PageProps {
  setPage: (p: NavPage) => void
}

export default function Dashboard({ cardBg, textPrimary, textMuted, border, setSelectedPersonId, setPage, darkMode }: DashboardProps) {
  const livingMembers = PEOPLE.filter(p => p.isLiving)
  const generations = Math.max(...PEOPLE.map(p => p.generation)) + 1
  const now = new Date()

  const upcomingBirthdays = PEOPLE
    .filter(p => p.isLiving && p.birthDate)
    .map(p => {
      const parts = p.birthDate!.split(' ')
      const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
      const month = monthNames.indexOf(parts[0])
      const day = parseInt(parts[1] ?? '1')
      const upcoming = new Date(now.getFullYear(), month, day)
      if (upcoming < now) upcoming.setFullYear(now.getFullYear() + 1)
      const diff = Math.ceil((upcoming.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return { person: p, daysAway: diff, day, month: parts[0], age: now.getFullYear() - (p.birthYear ?? 0) + (upcoming.getFullYear() > now.getFullYear() ? 1 : 0) }
    })
    .sort((a, b) => a.daysAway - b.daysAway)
    .slice(0, 4)

  const recentMembers = PEOPLE.slice(-4).reverse()
  const recentEvents = EVENTS.slice(-3).reverse()

  const stats = [
    { label: 'Family Members', value: PEOPLE.length, icon: Users, color: '#8B5E3C' },
    { label: 'Living Members', value: livingMembers.length, icon: Heart, color: '#C17E4A' },
    { label: 'Generations', value: generations, icon: TreePine, color: '#5E8050' },
    { label: 'Family Events', value: EVENTS.length, icon: Calendar, color: '#A67B52' },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl overflow-hidden relative" style={{
        background: 'linear-gradient(135deg, #2C1810 0%, #52341A 60%, #6E4828 100%)',
        minHeight: 180,
      }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 30% 50%, #C17E4A 0%, transparent 60%)',
        }} />
        <div className="relative p-8">
          <div className="font-display text-2xl font-semibold text-white mb-1">
            Good morning, Sarah.
          </div>
          <div style={{ color: '#C4AE98', fontSize: 15, marginBottom: 24 }}>
            The Hayes family tree has {PEOPLE.length} members across {generations} generations.
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setPage('family-tree')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
              style={{ background: '#C17E4A', color: '#FDFAF6' }}
            >
              <TreePine size={15} />
              Explore Family Tree
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#F0E8DC', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <Plus size={15} />
              Add Family Member
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-xl p-5" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}18` }}>
                  <Icon size={17} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="font-display text-2xl font-semibold" style={{ color: textPrimary }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: textMuted, marginTop: 2 }}>{stat.label}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Birthdays */}
        <div className="rounded-xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: border }}>
            <div className="flex items-center gap-2">
              <Cake size={16} style={{ color: '#C17E4A' }} />
              <span className="font-semibold text-sm" style={{ color: textPrimary }}>Upcoming Birthdays</span>
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: border }}>
            {upcomingBirthdays.map(({ person, daysAway, day, month, age }) => (
              <div
                key={person.id}
                className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-bark-50/50 transition-colors"
                style={{ '--tw-bg-opacity': 1 } as React.CSSProperties}
                onClick={() => setSelectedPersonId(person.id)}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: avatarColor(person), color: '#FDFAF6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, flexShrink: 0,
                }}>
                  {initials(person)}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{fullName(person)}</div>
                  <div style={{ fontSize: 12, color: textMuted }}>{month} {day} · Turns {age}</div>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: daysAway <= 7 ? '#C17E4A' : textMuted,
                  background: daysAway <= 7 ? '#FDF4E7' : 'transparent',
                  padding: daysAway <= 7 ? '2px 8px' : undefined,
                  borderRadius: 99,
                }}>
                  {daysAway === 0 ? 'Today!' : daysAway === 1 ? 'Tomorrow' : `${daysAway}d`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Members */}
        <div className="rounded-xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: border }}>
            <div className="flex items-center gap-2">
              <Users size={16} style={{ color: '#8B5E3C' }} />
              <span className="font-semibold text-sm" style={{ color: textPrimary }}>Family Members</span>
            </div>
            <button
              onClick={() => setPage('family-members')}
              style={{ fontSize: 12, color: '#C17E4A', display: 'flex', alignItems: 'center', gap: 2 }}
            >
              See all <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: border }}>
            {recentMembers.map(person => (
              <div
                key={person.id}
                className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedPersonId(person.id)}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: avatarColor(person), color: '#FDFAF6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, flexShrink: 0,
                }}>
                  {initials(person)}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{fullName(person)}</div>
                  <div style={{ fontSize: 12, color: textMuted }}>
                    {person.occupation ?? (person.isLiving ? 'Family member' : 'Deceased')} · Gen {person.generation + 1}
                  </div>
                </div>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: person.isLiving ? '#5E8050' : '#C4AE98',
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: border }}>
            <div className="flex items-center gap-2">
              <Clock size={16} style={{ color: '#A67B52' }} />
              <span className="font-semibold text-sm" style={{ color: textPrimary }}>Recent Activity</span>
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: border }}>
            {recentEvents.map(event => {
              const typeIcon: Record<string, string> = {
                birth: '👶', death: '🕯️', marriage: '💍', graduation: '🎓',
                reunion: '🎉', memorial: '🌿', move: '🏠', other: '📌',
              }
              return (
                <div key={event.id} className="flex gap-3 px-5 py-3">
                  <div style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{typeIcon[event.type] ?? '📌'}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{event.title}</div>
                    <div style={{ fontSize: 12, color: textMuted }}>{event.date}</div>
                  </div>
                </div>
              )
            })}
            <div className="flex gap-3 px-5 py-3">
              <div style={{ fontSize: 18, flexShrink: 0 }}>📖</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>New story published</div>
                <div style={{ fontSize: 12, color: textMuted }}>{STORIES[0].title.slice(0, 32)}…</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Memories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="font-display text-lg font-semibold" style={{ color: textPrimary }}>Recent Memories</div>
          <button onClick={() => setPage('photos')} style={{ fontSize: 13, color: '#C17E4A', display: 'flex', alignItems: 'center', gap: 3 }}>
            All photos <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PHOTOS.slice(0, 4).map(photo => (
            <div key={photo.id} className="rounded-xl overflow-hidden aspect-[4/3] relative group cursor-pointer" style={{ background: '#DED0C0' }}>
              <img src={photo.url} alt={photo.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div style={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>{photo.title}</div>
                {photo.year && <div style={{ fontSize: 11, color: '#C4AE98' }}>{photo.year}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="font-display text-lg font-semibold" style={{ color: textPrimary }}>Family Stories</div>
          <button onClick={() => setPage('stories')} style={{ fontSize: 13, color: '#C17E4A', display: 'flex', alignItems: 'center', gap: 3 }}>
            All stories <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STORIES.slice(0, 2).map(story => {
            const author = PEOPLE_MAP[story.authorId]
            return (
              <div key={story.id} className="rounded-xl p-5" style={{ background: cardBg, border: `1px solid ${border}` }}>
                <div className="font-display text-base font-semibold mb-2" style={{ color: textPrimary }}>{story.title}</div>
                <div style={{ fontSize: 13, color: textMuted, lineHeight: 1.65, marginBottom: 16 }}>{story.excerpt}</div>
                <div className="flex items-center gap-2">
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', background: avatarColor(author),
                    color: '#FDFAF6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 600,
                  }}>
                    {initials(author)}
                  </div>
                  <span style={{ fontSize: 12, color: textMuted }}>{fullName(author)} · {story.date} · {story.readTime} min read</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
