import { useState } from 'react'
import { BookOpen, Plus, Clock, Tag } from 'lucide-react'
import type { PageProps } from '../App'
import { STORIES, PEOPLE_MAP, fullName, initials, avatarColor } from '../data/family'
import type { Story } from '../types'

export default function Stories({ cardBg, textPrimary, textMuted, border, setSelectedPersonId, darkMode }: PageProps) {
  const [selected, setSelected] = useState<Story | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = Array.from(new Set(STORIES.flatMap(s => s.tags)))
  const filtered = activeTag ? STORIES.filter(s => s.tags.includes(activeTag)) : STORIES

  if (selected) {
    const author = PEOPLE_MAP[selected.authorId]
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <button
          onClick={() => setSelected(null)}
          style={{ fontSize: 13, color: '#C17E4A', marginBottom: 24, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ← Back to Stories
        </button>
        <div className="space-y-6">
          <div>
            <div className="flex gap-2 flex-wrap mb-3">
              {selected.tags.map(tag => (
                <span key={tag} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 99, background: '#F5EDE4', color: '#8B5E3C', fontWeight: 500 }}>
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="font-display text-3xl font-semibold leading-snug mb-4" style={{ color: textPrimary }}>
              {selected.title}
            </h1>
            <div className="flex items-center gap-3">
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: avatarColor(author),
                color: '#FDFAF6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600,
              }}>
                {initials(author)}
              </div>
              <div>
                <button
                  onClick={() => { setSelected(null); setSelectedPersonId(author.id) }}
                  style={{ fontSize: 13, fontWeight: 500, color: textPrimary, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {fullName(author)}
                </button>
                <div style={{ fontSize: 12, color: textMuted }}>{selected.date} · {selected.readTime} min read</div>
              </div>
            </div>
          </div>

          <div style={{
            fontSize: 16, lineHeight: 1.85, color: textPrimary,
            fontFamily: "'Lora', Georgia, serif",
            borderTop: `1px solid ${border}`,
            paddingTop: 24,
          }}>
            {selected.content.split('\n\n').map((para, i) => (
              <p key={i} style={{ marginBottom: 20 }}>{para}</p>
            ))}
          </div>

          {/* People in this story */}
          {selected.personIds.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 10 }}>People in this story</div>
              <div className="flex flex-wrap gap-3">
                {selected.personIds.map(id => {
                  const person = PEOPLE_MAP[id]
                  if (!person) return null
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedPersonId(id)}
                      className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors hover:opacity-80"
                      style={{ border: `1px solid ${border}`, background: 'transparent', cursor: 'pointer' }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', background: avatarColor(person),
                        color: '#FDFAF6', fontSize: 9, fontWeight: 600,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {initials(person)}
                      </div>
                      <span style={{ fontSize: 12, color: textPrimary }}>{fullName(person)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-display text-xl font-semibold" style={{ color: textPrimary }}>Family Stories</div>
          <div style={{ fontSize: 13, color: textMuted, marginTop: 2 }}>
            {STORIES.length} stories written by family members
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: '#8B5E3C', color: '#FDFAF6' }}>
          <Plus size={14} />
          Write a Story
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTag(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          style={{
            background: !activeTag ? '#8B5E3C' : cardBg,
            color: !activeTag ? '#FDFAF6' : textMuted,
            border: `1px solid ${!activeTag ? '#8B5E3C' : border}`,
          }}
        >
          All stories
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(prev => prev === tag ? null : tag)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: activeTag === tag ? '#F5EDE4' : cardBg,
              color: activeTag === tag ? '#8B5E3C' : textMuted,
              border: `1px solid ${activeTag === tag ? '#8B5E3C' : border}`,
            }}
          >
            <Tag size={10} />
            {tag}
          </button>
        ))}
      </div>

      {/* Stories grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(story => {
          const author = PEOPLE_MAP[story.authorId]
          return (
            <div
              key={story.id}
              className="rounded-2xl p-6 cursor-pointer transition-all hover:shadow-md group"
              style={{ background: cardBg, border: `1px solid ${border}` }}
              onClick={() => setSelected(story)}
            >
              <div className="flex gap-2 flex-wrap mb-3">
                {story.tags.slice(0, 3).map(tag => (
                  <span key={tag} style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 99,
                    background: '#F5EDE4', color: '#8B5E3C', fontWeight: 500,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="font-display text-lg font-semibold mb-3 group-hover:text-amber-400 transition-colors leading-snug"
                style={{ color: textPrimary }}>
                {story.title}
              </h2>
              <p style={{ fontSize: 13.5, color: textMuted, lineHeight: 1.7, marginBottom: 16 }}>
                {story.excerpt}
              </p>
              <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: border }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: avatarColor(author),
                  color: '#FDFAF6', fontSize: 10, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {initials(author)}
                </div>
                <span style={{ fontSize: 12, color: textMuted, flex: 1 }}>{fullName(author)}</span>
                <div className="flex items-center gap-1" style={{ fontSize: 11, color: textMuted }}>
                  <Clock size={11} />
                  {story.readTime} min
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: textPrimary, marginBottom: 4 }}>No stories found</div>
          <div style={{ fontSize: 13, color: textMuted }}>Be the first to write a family story</div>
        </div>
      )}
    </div>
  )
}
