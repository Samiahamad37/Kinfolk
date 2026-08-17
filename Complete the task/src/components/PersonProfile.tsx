import { X, MapPin, Briefcase, GraduationCap, Mail, Phone, Lock, Users, Heart, Baby, User } from 'lucide-react'
import { PEOPLE_MAP, fullName, initials, avatarColor, age, EVENTS, PHOTOS } from '../data/family'
import type { Person } from '../types'

interface PersonProfileProps {
  personId: string
  onClose: () => void
  onSelectPerson: (id: string) => void
  darkMode: boolean
  cardBg: string
  textPrimary: string
  textMuted: string
  border: string
  bg: string
}

const PRIVACY_CONFIG: Record<string, { icon: string; color: string }> = {
  'public':       { icon: '🌐', color: '#5E8050' },
  'family':       { icon: '👨‍👩‍👧', color: '#8B5E3C' },
  'close-family': { icon: '🔒', color: '#A67B52' },
  'private':      { icon: '🔐', color: '#7A6352' },
}

export default function PersonProfile({
  personId, onClose, onSelectPerson, darkMode, cardBg, textPrimary, textMuted, border, bg,
}: PersonProfileProps) {
  const person = PEOPLE_MAP[personId]
  if (!person) return null

  const personAge = age(person)
  const parents = person.parentIds.map(id => PEOPLE_MAP[id]).filter(Boolean)
  const spouses = person.spouseIds.map(id => PEOPLE_MAP[id]).filter(Boolean)
  const children = person.childrenIds.map(id => PEOPLE_MAP[id]).filter(Boolean)
  const siblings = person.siblingIds.map(id => PEOPLE_MAP[id]).filter(Boolean)
  const personEvents = EVENTS.filter(e => e.personIds.includes(personId))
  const personPhotos = PHOTOS.filter(p => p.personIds.includes(personId))
  const privacyCfg = PRIVACY_CONFIG[person.privacy] ?? PRIVACY_CONFIG['family']
  const genLabels = ['Grandparent', 'Parent', 'Sibling / Cousin', 'Child']

  const panelBg = darkMode ? '#1C1208' : '#FDFAF6'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(44,24,16,0.35)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{
          width: 420,
          maxWidth: '95vw',
          background: panelBg,
          borderLeft: `1px solid ${border}`,
          boxShadow: '-8px 0 40px rgba(44,24,16,0.15)',
        }}
      >
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${avatarColor(person)} 0%, ${avatarColor(person)}CC 100%)`,
          padding: '28px 24px 20px',
          position: 'relative',
        }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <X size={16} color="#fff" />
          </button>

          <div className="flex items-start gap-4">
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: '2.5px solid rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700, color: '#fff',
              flexShrink: 0,
            }}>
              {initials(person)}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="font-display text-xl font-semibold text-white leading-tight mb-1">
                {fullName(person)}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>
                {genLabels[person.generation] ?? 'Family member'}
                {person.occupation && ` · ${person.occupation}`}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99,
                  background: person.isLiving ? 'rgba(94,128,80,0.35)' : 'rgba(196,174,152,0.35)',
                  color: person.isLiving ? '#C8F0B8' : '#E8D8C0',
                  border: `1px solid ${person.isLiving ? 'rgba(94,128,80,0.4)' : 'rgba(196,174,152,0.4)'}`,
                }}>
                  {person.isLiving ? 'Living' : 'Deceased'}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99,
                  background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)',
                }}>
                  {privacyCfg.icon} {person.privacy}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* Vitals */}
            <Section title="Life Details" border={border} textPrimary={textPrimary}>
              <div className="space-y-2.5">
                {person.birthDate && (
                  <InfoRow icon="🎂" label="Born" value={`${person.birthDate}${personAge !== null ? ` · ${personAge} years old` : ''}`} textMuted={textMuted} textPrimary={textPrimary} />
                )}
                {person.birthPlace && (
                  <InfoRow icon="📍" label="Birthplace" value={person.birthPlace} textMuted={textMuted} textPrimary={textPrimary} />
                )}
                {person.deathDate && (
                  <InfoRow icon="🕯️" label="Died" value={person.deathDate} textMuted={textMuted} textPrimary={textPrimary} />
                )}
                {person.deathPlace && (
                  <InfoRow icon="📍" label="Death place" value={person.deathPlace} textMuted={textMuted} textPrimary={textPrimary} />
                )}
                {person.occupation && (
                  <InfoRow icon="💼" label="Occupation" value={person.occupation} textMuted={textMuted} textPrimary={textPrimary} />
                )}
                {person.education && (
                  <InfoRow icon="🎓" label="Education" value={person.education} textMuted={textMuted} textPrimary={textPrimary} />
                )}
              </div>
            </Section>

            {/* Contact */}
            {(person.email || person.phone) && (
              <Section title="Contact" border={border} textPrimary={textPrimary}>
                <div className="space-y-2">
                  {person.email && <InfoRow icon="✉️" label="Email" value={person.email} textMuted={textMuted} textPrimary={textPrimary} />}
                  {person.phone && <InfoRow icon="📱" label="Phone" value={person.phone} textMuted={textMuted} textPrimary={textPrimary} />}
                </div>
              </Section>
            )}

            {/* Biography */}
            {person.biography && (
              <Section title="Biography" border={border} textPrimary={textPrimary}>
                <div style={{ fontSize: 13.5, color: textMuted, lineHeight: 1.75, fontFamily: "'Lora', serif" }}>
                  {person.biography}
                </div>
              </Section>
            )}

            {/* Relationships */}
            <Section title="Family Connections" border={border} textPrimary={textPrimary}>
              <div className="space-y-3">
                {parents.length > 0 && (
                  <RelGroup label="Parents" people={parents} onSelect={onSelectPerson} textMuted={textMuted} textPrimary={textPrimary} border={border} cardBg={cardBg} />
                )}
                {spouses.length > 0 && (
                  <RelGroup label="Spouse / Partner" people={spouses} onSelect={onSelectPerson} textMuted={textMuted} textPrimary={textPrimary} border={border} cardBg={cardBg} />
                )}
                {children.length > 0 && (
                  <RelGroup label="Children" people={children} onSelect={onSelectPerson} textMuted={textMuted} textPrimary={textPrimary} border={border} cardBg={cardBg} />
                )}
                {siblings.length > 0 && (
                  <RelGroup label="Siblings" people={siblings} onSelect={onSelectPerson} textMuted={textMuted} textPrimary={textPrimary} border={border} cardBg={cardBg} />
                )}
                {parents.length === 0 && spouses.length === 0 && children.length === 0 && siblings.length === 0 && (
                  <div style={{ fontSize: 13, color: textMuted }}>No connections recorded yet.</div>
                )}
              </div>
            </Section>

            {/* Photos */}
            {personPhotos.length > 0 && (
              <Section title={`Photos (${personPhotos.length})`} border={border} textPrimary={textPrimary}>
                <div className="grid grid-cols-3 gap-2">
                  {personPhotos.map(photo => (
                    <div key={photo.id} className="aspect-square rounded-lg overflow-hidden" style={{ background: '#DED0C0' }}>
                      <img src={photo.url.replace(/w=\d+/, 'w=200').replace(/h=\d+/, 'h=200')} alt={photo.title} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Events */}
            {personEvents.length > 0 && (
              <Section title="Life Events" border={border} textPrimary={textPrimary}>
                <div className="space-y-2">
                  {personEvents.map(event => (
                    <div key={event.id} className="flex items-start gap-2.5">
                      <div style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>
                        {{birth:'👶',death:'🕯️',marriage:'💍',graduation:'🎓',reunion:'🎉',memorial:'🌿',move:'🏠',other:'📌'}[event.type]}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{event.title}</div>
                        <div style={{ fontSize: 11.5, color: textMuted }}>{event.date}{event.location ? ` · ${event.location}` : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 p-4 border-t" style={{ borderColor: border }}>
          <button className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: '#8B5E3C', color: '#FDFAF6' }}>
            Edit Profile
          </button>
          <button className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: 'transparent', color: '#8B5E3C', border: `1.5px solid #8B5E3C` }}>
            Add Relative
          </button>
        </div>
      </div>
    </>
  )
}

function Section({ title, children, border, textPrimary }: {
  title: string; children: React.ReactNode; border: string; textPrimary: string
}) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#C17E4A', textTransform: 'uppercase', marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function InfoRow({ icon, label, value, textMuted, textPrimary }: {
  icon: string; label: string; value: string; textMuted: string; textPrimary: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span style={{ fontSize: 14, flexShrink: 0, width: 20, textAlign: 'center' }}>{icon}</span>
      <div>
        <div style={{ fontSize: 10.5, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 13, color: textPrimary }}>{value}</div>
      </div>
    </div>
  )
}

function RelGroup({ label, people, onSelect, textMuted, textPrimary, border, cardBg }: {
  label: string; people: Person[]; onSelect: (id: string) => void;
  textMuted: string; textPrimary: string; border: string; cardBg: string;
}) {
  return (
    <div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: textMuted, marginBottom: 6 }}>{label}</div>
      <div className="space-y-1.5">
        {people.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:opacity-80"
            style={{ border: `1px solid ${border}`, background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%', background: avatarColor(p),
              color: '#FDFAF6', fontSize: 10, fontWeight: 600, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {initials(p)}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {fullName(p)}
              </div>
              <div style={{ fontSize: 11, color: textMuted }}>
                {p.birthYear ?? '?'}{p.deathYear ? ` – ${p.deathYear}` : ''}
              </div>
            </div>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: p.isLiving ? '#5E8050' : '#C4AE98',
            }} />
          </button>
        ))}
      </div>
    </div>
  )
}
