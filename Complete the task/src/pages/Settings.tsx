import { useState } from 'react'
import { User, Lock, Bell, Globe, Palette, Download, Upload, Trash2, Shield, Eye, EyeOff } from 'lucide-react'
import type { PageProps } from '../App'
import { PEOPLE_MAP, CURRENT_USER_ID, fullName, initials, avatarColor } from '../data/family'

const SECTION_ICONS = { profile: User, privacy: Shield, notifications: Bell, account: Lock, appearance: Palette, data: Download }

export default function Settings({ cardBg, textPrimary, textMuted, border, darkMode }: PageProps) {
  const [section, setSection] = useState('profile')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const me = PEOPLE_MAP[CURRENT_USER_ID]

  const sections = [
    { id: 'profile', label: 'Profile' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'data', label: 'Data & Export' },
    { id: 'account', label: 'Account Security' },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-52 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map(s => {
              const Icon = SECTION_ICONS[s.id as keyof typeof SECTION_ICONS] ?? User
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className="w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg text-sm transition-colors"
                  style={{
                    background: section === s.id ? '#F5EDE4' : 'transparent',
                    color: section === s.id ? '#8B5E3C' : textMuted,
                    fontWeight: section === s.id ? 600 : 400,
                  }}
                >
                  <Icon size={15} />
                  {s.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {/* Profile */}
          {section === 'profile' && (
            <div className="rounded-xl p-6 space-y-5" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="font-display text-lg font-semibold" style={{ color: textPrimary }}>Profile Settings</div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', background: avatarColor(me),
                  color: '#FDFAF6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 600,
                }}>
                  {initials(me)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>{fullName(me)}</div>
                  <button style={{ fontSize: 13, color: '#C17E4A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4 }}>
                    Change photo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'First Name', value: me.firstName },
                  { label: 'Last Name', value: me.lastName },
                  { label: 'Email', value: me.email ?? '' },
                  { label: 'Phone', value: me.phone ?? '' },
                  { label: 'Occupation', value: me.occupation ?? '' },
                  { label: 'Place of Birth', value: me.birthPlace ?? '' },
                ].map(field => (
                  <div key={field.label}>
                    <label style={{ fontSize: 12, fontWeight: 500, color: textMuted, display: 'block', marginBottom: 6 }}>
                      {field.label}
                    </label>
                    <input
                      defaultValue={field.value}
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: 8,
                        border: `1px solid ${border}`, background: 'transparent',
                        fontSize: 13, color: textPrimary, outline: 'none',
                      }}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: textMuted, display: 'block', marginBottom: 6 }}>
                  Biography
                </label>
                <textarea
                  defaultValue={me.biography}
                  rows={4}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: `1px solid ${border}`, background: 'transparent',
                    fontSize: 13, color: textPrimary, outline: 'none', resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <button style={{
                padding: '9px 20px', borderRadius: 8, background: '#8B5E3C',
                color: '#FDFAF6', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              }}>
                Save Changes
              </button>
            </div>
          )}

          {/* Privacy */}
          {section === 'privacy' && (
            <div className="rounded-xl p-6 space-y-5" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="font-display text-lg font-semibold" style={{ color: textPrimary }}>Privacy Controls</div>
              <div style={{ fontSize: 13, color: textMuted, lineHeight: 1.6 }}>
                Control who can see different parts of your family tree. Living members have stronger privacy protections by default.
              </div>
              {[
                { label: 'My Profile', desc: 'Who can see your personal information', value: 'Family only' },
                { label: 'Family Tree', desc: 'Who can view and explore your tree', value: 'Family only' },
                { label: 'Photos & Memories', desc: 'Who can see uploaded photos', value: 'Family only' },
                { label: 'Documents', desc: 'Who can access sensitive documents', value: 'Close family' },
                { label: 'Family Stories', desc: 'Who can read published stories', value: 'Public' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: border }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: textPrimary }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: textMuted }}>{item.desc}</div>
                  </div>
                  <select
                    defaultValue={item.value}
                    style={{
                      padding: '6px 12px', borderRadius: 7, border: `1px solid ${border}`,
                      background: cardBg, fontSize: 12, color: textPrimary, outline: 'none', cursor: 'pointer',
                    }}
                  >
                    <option>Public</option>
                    <option>Family only</option>
                    <option>Close family</option>
                    <option>Private</option>
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Notifications */}
          {section === 'notifications' && (
            <div className="rounded-xl p-6 space-y-4" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="font-display text-lg font-semibold" style={{ color: textPrimary }}>Notifications</div>
              {[
                { label: 'Birthday reminders', desc: 'Get notified 3 days before a family birthday', on: true },
                { label: 'Anniversary reminders', desc: 'Get notified about upcoming anniversaries', on: true },
                { label: 'New family members', desc: 'When someone is added to the family tree', on: true },
                { label: 'New stories published', desc: 'When a family member publishes a story', on: false },
                { label: 'Document uploads', desc: 'When new documents are added to the archive', on: false },
                { label: 'Family invitations', desc: 'When someone accepts your invitation', on: true },
              ].map(item => (
                <ToggleRow key={item.label} label={item.label} desc={item.desc} defaultOn={item.on} textPrimary={textPrimary} textMuted={textMuted} border={border} />
              ))}
            </div>
          )}

          {/* Appearance */}
          {section === 'appearance' && (
            <div className="rounded-xl p-6 space-y-5" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="font-display text-lg font-semibold" style={{ color: textPrimary }}>Appearance</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, marginBottom: 12 }}>Theme</div>
                <div className="grid grid-cols-3 gap-3">
                  {['Light', 'Dark', 'System'].map(t => (
                    <button
                      key={t}
                      className="py-3 rounded-xl text-sm font-medium transition-all"
                      style={{
                        border: `1.5px solid ${t === 'Light' ? '#8B5E3C' : border}`,
                        background: t === 'Light' ? '#F5EDE4' : 'transparent',
                        color: t === 'Light' ? '#8B5E3C' : textMuted,
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, marginBottom: 12 }}>Language</div>
                <select
                  style={{
                    padding: '8px 12px', borderRadius: 8, border: `1px solid ${border}`,
                    background: 'transparent', fontSize: 13, color: textPrimary, outline: 'none', cursor: 'pointer',
                  }}
                >
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Español</option>
                  <option>Français</option>
                  <option>Deutsch</option>
                  <option>Italiano</option>
                </select>
              </div>
            </div>
          )}

          {/* Data */}
          {section === 'data' && (
            <div className="space-y-4">
              <div className="rounded-xl p-6 space-y-4" style={{ background: cardBg, border: `1px solid ${border}` }}>
                <div className="font-display text-lg font-semibold" style={{ color: textPrimary }}>Export Data</div>
                <div style={{ fontSize: 13, color: textMuted }}>Download your family tree data in various formats.</div>
                {[
                  { label: 'GEDCOM Export', desc: 'Standard genealogy format, compatible with most family tree software', icon: '🌲' },
                  { label: 'PDF Family Tree', desc: 'Beautiful printable family tree document', icon: '📄' },
                  { label: 'CSV Spreadsheet', desc: 'All family members in a spreadsheet format', icon: '📊' },
                  { label: 'Photo Archive', desc: 'All photos and memories in a ZIP archive', icon: '🖼️' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: border }}>
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: textPrimary }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: textMuted }}>{item.desc}</div>
                      </div>
                    </div>
                    <button style={{
                      padding: '6px 14px', borderRadius: 7, background: 'transparent',
                      color: '#8B5E3C', fontSize: 12, fontWeight: 600,
                      border: '1.5px solid #8B5E3C', cursor: 'pointer',
                    }}>
                      Export
                    </button>
                  </div>
                ))}
              </div>

              <div className="rounded-xl p-6" style={{ background: cardBg, border: `1px solid ${border}` }}>
                <div className="font-display text-base font-semibold mb-2" style={{ color: textPrimary }}>Import Data</div>
                <div style={{ fontSize: 13, color: textMuted, marginBottom: 12 }}>Import an existing family tree from GEDCOM format.</div>
                <button style={{
                  padding: '8px 16px', borderRadius: 8, background: 'transparent',
                  color: textMuted, fontSize: 13, border: `1.5px solid ${border}`, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <Upload size={14} />
                  Import GEDCOM File
                </button>
              </div>
            </div>
          )}

          {/* Account Security */}
          {section === 'account' && (
            <div className="space-y-4">
              <div className="rounded-xl p-6 space-y-4" style={{ background: cardBg, border: `1px solid ${border}` }}>
                <div className="font-display text-lg font-semibold" style={{ color: textPrimary }}>Account Security</div>
                {[
                  { label: 'Change Password', desc: 'Last changed 3 months ago' },
                  { label: 'Two-Factor Authentication', desc: 'Not enabled' },
                  { label: 'Active Sessions', desc: '2 active sessions' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: border }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: textPrimary }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: textMuted }}>{item.desc}</div>
                    </div>
                    <button style={{
                      padding: '6px 14px', borderRadius: 7, background: 'transparent',
                      color: '#8B5E3C', fontSize: 12, fontWeight: 600,
                      border: '1.5px solid #8B5E3C', cursor: 'pointer',
                    }}>
                      Manage
                    </button>
                  </div>
                ))}
              </div>

              <div className="rounded-xl p-6" style={{ background: cardBg, border: `1.5px solid #C47878` }}>
                <div className="font-display text-base font-semibold mb-2" style={{ color: '#A05050' }}>Danger Zone</div>
                <div style={{ fontSize: 13, color: textMuted, marginBottom: 12 }}>
                  Permanently delete your account and all family data. This action cannot be undone.
                </div>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                      padding: '8px 16px', borderRadius: 8, background: 'transparent',
                      color: '#A05050', fontSize: 13, border: '1.5px solid #C47878', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    <Trash2 size={14} />
                    Delete Account
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#A05050' }}>
                      Are you sure? This will permanently delete all family data.
                    </div>
                    <div className="flex gap-2">
                      <button
                        style={{ padding: '7px 14px', borderRadius: 7, background: '#A05050', color: '#fff', fontSize: 12, border: 'none', cursor: 'pointer' }}
                      >
                        Yes, delete everything
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        style={{ padding: '7px 14px', borderRadius: 7, background: 'transparent', color: textMuted, fontSize: 12, border: `1px solid ${border}`, cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ToggleRow({ label, desc, defaultOn, textPrimary, textMuted, border }: {
  label: string; desc: string; defaultOn: boolean;
  textPrimary: string; textMuted: string; border: string;
}) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: border }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: textPrimary }}>{label}</div>
        <div style={{ fontSize: 12, color: textMuted }}>{desc}</div>
      </div>
      <button
        onClick={() => setOn(!on)}
        style={{
          width: 42, height: 24, borderRadius: 99, position: 'relative',
          background: on ? '#8B5E3C' : '#DED0C0', transition: 'background 0.2s',
          border: 'none', cursor: 'pointer', flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', width: 18, height: 18, borderRadius: '50%', background: '#fff',
          top: 3, left: on ? 21 : 3, transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  )
}
