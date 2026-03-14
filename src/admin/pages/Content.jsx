import { useState, useRef } from 'react';
import { useToast } from '../AdminLayout';

/* ── MOCK PAGE DATA ── */
const INITIAL_PAGES = [
  { id: 'homepage', name: 'Homepage', section: 'Hero Section', title: 'Where the Stars Meet the Sonoran Desert', subtitle: 'IDSDC Gift Shop', body: 'Explore our curated collection of astronomy-inspired apparel, art, and gifts — each piece designed to celebrate the wonder of the night sky. Every purchase supports dark sky preservation.', image: null, lastEdited: '2026-03-10', editedBy: 'Tovah' },
  { id: 'about', name: 'About Page', section: 'Main Content', title: 'About the Discovery Center', subtitle: 'Our Mission', body: 'The International Dark Sky Discovery Center is dedicated to inspiring wonder and understanding of the night sky. Located in the heart of the Sonoran Desert, we combine world-class exhibits, immersive planetarium shows, and community programs to connect people with the cosmos.\n\nOur gift shop supports the center\'s mission — every purchase funds dark sky education, light pollution advocacy, and STEM programming for underserved communities.', image: null, lastEdited: '2026-03-08', editedBy: 'Nancy' },
  { id: 'membership', name: 'Membership Page', section: 'Hero Section', title: 'More Than a Membership', subtitle: 'Join the Community', body: 'Join a community dedicated to preserving the wonder of the night sky. Your membership supports dark sky education, conservation, and gives you exclusive access to the cosmos.', image: null, lastEdited: '2026-03-12', editedBy: 'Tovah' },
  { id: 'events', name: 'Events Page', section: 'Hero Section', title: 'Experience the Night Sky', subtitle: 'Events & Programs', body: 'Star parties, planetarium shows, workshops, and celestial events — all under some of the darkest skies in North America.', image: null, lastEdited: '2026-03-11', editedBy: 'Josie' },
  { id: 'field-trips', name: 'Field Trips Page', section: 'Hero Section', title: 'School Field Trips', subtitle: 'Education Programs', body: 'Hands-on STEM experiences aligned with state standards. Inspire the next generation of scientists, astronomers, and dark sky advocates.', image: null, lastEdited: '2026-03-09', editedBy: 'Nancy' },
  { id: 'contact', name: 'Contact Info', section: 'Footer & Contact', title: 'Contact Us', subtitle: 'Get in Touch', body: 'International Dark Sky Discovery Center\n1000 Observatory Road\nFlagstaff, AZ 86001\n\nPhone: (928) 555-0100\nEmail: hello@idarksky.org\n\nHours:\nMonday–Saturday: 10 AM – 6 PM\nSunday: 12 PM – 5 PM', image: null, lastEdited: '2026-03-05', editedBy: 'Tovah' },
];

const INITIAL_ANNOUNCEMENT = {
  text: 'FREE SHIPPING ON ALL ORDERS OVER $50 — USE CODE DARKSKY',
  active: true,
};

const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Apparel', visible: true, count: 14 },
  { id: 'cat-2', name: 'Kids', visible: true, count: 8 },
  { id: 'cat-3', name: 'Accessories', visible: true, count: 6 },
  { id: 'cat-4', name: 'Drinkware', visible: true, count: 4 },
  { id: 'cat-5', name: 'Prints', visible: true, count: 3 },
  { id: 'cat-6', name: 'Books', visible: true, count: 2 },
  { id: 'cat-7', name: 'Gifts', visible: true, count: 5 },
  { id: 'cat-8', name: 'Home', visible: false, count: 0 },
];

/* ── SIMPLE TOOLBAR BUTTON ── */
function ToolBtn({ label, icon, onClick, active }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'rgba(212,175,55,0.12)' : 'transparent',
        border: '1px solid ' + (active ? 'rgba(212,175,55,0.25)' : 'transparent'),
        borderRadius: 4, color: active ? '#d4af37' : '#908a84',
        cursor: 'pointer', fontSize: 14, fontWeight: active ? 700 : 400,
        transition: 'all 0.15s',
      }}
    >{icon}</button>
  );
}

/* ── MAIN COMPONENT ── */
export default function Content() {
  const [tab, setTab] = useState('pages');
  const [pages, setPages] = useState(INITIAL_PAGES);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [announcement, setAnnouncement] = useState(INITIAL_ANNOUNCEMENT);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [saving, setSaving] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [renamingCat, setRenamingCat] = useState(null);
  const [renameVal, setRenameVal] = useState('');
  const bodyRef = useRef(null);
  const toast = useToast();

  // ── Page editing ──
  const openEdit = (page) => {
    setEditing(page.id);
    setEditForm({ title: page.title, subtitle: page.subtitle, body: page.body });
  };

  const savePage = () => {
    setSaving(true);
    setTimeout(() => {
      setPages(prev => prev.map(p => p.id === editing ? {
        ...p, ...editForm, lastEdited: new Date().toISOString().slice(0, 10), editedBy: 'Tovah',
      } : p));
      setSaving(false);
      setEditing(null);
      toast('Page content saved successfully');
    }, 800);
  };

  // ── Rich text helpers ──
  const execCmd = (cmd, val) => {
    document.execCommand(cmd, false, val || null);
    bodyRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) execCmd('createLink', url);
  };

  // ── Announcement ──
  const saveAnnouncement = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast('Announcement updated');
    }, 600);
  };

  // ── Categories drag/drop ──
  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setCategories(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  const toggleCatVisibility = (id) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
    toast('Category visibility updated');
  };

  const startRename = (cat) => {
    setRenamingCat(cat.id);
    setRenameVal(cat.name);
  };
  const finishRename = () => {
    if (renameVal.trim()) {
      setCategories(prev => prev.map(c => c.id === renamingCat ? { ...c, name: renameVal.trim() } : c));
      toast('Category renamed');
    }
    setRenamingCat(null);
  };

  const tabs = [
    { id: 'pages', label: 'Pages' },
    { id: 'announcement', label: 'Announcement Bar' },
    { id: 'categories', label: 'Store Categories' },
  ];

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Content Manager</h1>
          <p className="admin-page-subtitle">Edit website text, announcements, and categories</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0, marginBottom: 24,
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden',
        width: 'fit-content',
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 20px', font: '500 12.5px/1 DM Sans',
              background: tab === t.id ? 'rgba(212,175,55,0.1)' : 'transparent',
              color: tab === t.id ? '#d4af37' : '#5a5550',
              border: 'none', borderRight: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* ═══ PAGES TAB ═══ */}
      {tab === 'pages' && !editing && (
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <span className="admin-table-title">Editable Pages</span>
            <span style={{ font: '400 12px DM Sans', color: '#5a5550' }}>Click any page to edit its content</span>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Page</th>
                <th>Section</th>
                <th>Current Title</th>
                <th>Last Edited</th>
                <th>By</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pages.map(page => (
                <tr key={page.id} className="clickable" onClick={() => openEdit(page)}>
                  <td className="text-white" style={{ fontWeight: 500 }}>{page.name}</td>
                  <td><span className="badge badge-gold">{page.section}</span></td>
                  <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{page.title}</td>
                  <td>{page.lastEdited}</td>
                  <td>{page.editedBy}</td>
                  <td>
                    <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={(e) => { e.stopPropagation(); openEdit(page); }}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ PAGE EDITOR ═══ */}
      {tab === 'pages' && editing && (() => {
        const page = pages.find(p => p.id === editing);
        return (
          <div>
            <button
              onClick={() => setEditing(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
                background: 'none', border: 'none', color: '#908a84', cursor: 'pointer',
                font: '400 13px DM Sans',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
              Back to all pages
            </button>

            <div className="admin-panel" style={{ maxWidth: 800 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(212,175,55,0.06)' }}>
                <div>
                  <h2 className="admin-panel-title" style={{ marginBottom: 4 }}>Editing: {page.name}</h2>
                  <span style={{ font: '400 11px DM Sans', color: '#5a5550' }}>
                    Last edited {page.lastEdited} by {page.editedBy}
                  </span>
                </div>
                <span className="badge badge-gold">{page.section}</span>
              </div>

              {/* Title */}
              <div style={{ marginBottom: 20 }}>
                <label className="admin-label">Page Title</label>
                <input
                  className="admin-input"
                  style={{ fontSize: 18, fontFamily: 'Playfair Display, serif', padding: '14px 16px' }}
                  placeholder="Enter a compelling headline..."
                  value={editForm.title}
                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                />
                <p style={{ font: '300 11px DM Sans', color: '#5a5550', marginTop: 4 }}>This appears as the main heading on the page</p>
              </div>

              {/* Subtitle */}
              <div style={{ marginBottom: 20 }}>
                <label className="admin-label">Subtitle / Label</label>
                <input
                  className="admin-input"
                  placeholder="Short label that appears above the title (e.g. 'Our Mission')"
                  value={editForm.subtitle}
                  onChange={e => setEditForm(f => ({ ...f, subtitle: e.target.value }))}
                />
              </div>

              {/* Body — contentEditable rich text */}
              <div style={{ marginBottom: 20 }}>
                <label className="admin-label">Body Text</label>
                <div style={{
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden',
                }}>
                  {/* Toolbar */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 2, padding: '6px 8px',
                    background: 'rgba(4,4,12,0.5)', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    flexWrap: 'wrap',
                  }}>
                    <ToolBtn label="Bold" icon="B" onClick={() => execCmd('bold')} />
                    <ToolBtn label="Italic" icon={<span style={{ fontStyle: 'italic' }}>I</span>} onClick={() => execCmd('italic')} />
                    <ToolBtn label="Underline" icon={<span style={{ textDecoration: 'underline' }}>U</span>} onClick={() => execCmd('underline')} />
                    <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.06)', margin: '0 6px' }} />
                    <ToolBtn label="Link" icon="🔗" onClick={insertLink} />
                    <ToolBtn label="Bullet List" icon="•" onClick={() => execCmd('insertUnorderedList')} />
                    <div style={{ flex: 1 }} />
                    <span style={{ font: '300 10px DM Sans', color: '#5a5550', marginRight: 4 }}>
                      Select text, then click a button to format
                    </span>
                  </div>

                  {/* Editable area */}
                  <div
                    ref={bodyRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={e => setEditForm(f => ({ ...f, body: e.currentTarget.innerText }))}
                    style={{
                      minHeight: 180, padding: '16px 18px',
                      background: '#0a0a1a',
                      font: '300 14px/1.8 DM Sans', color: '#e8e4df',
                      outline: 'none', whiteSpace: 'pre-wrap',
                    }}
                    dangerouslySetInnerHTML={{ __html: editForm.body.replace(/\n/g, '<br>') }}
                  />
                </div>
                <p style={{ font: '300 11px DM Sans', color: '#5a5550', marginTop: 4 }}>
                  Tip: Type naturally like a document. Use the toolbar to bold, italicize, or add links.
                </p>
              </div>

              {/* Image dropzone */}
              <div style={{ marginBottom: 28 }}>
                <label className="admin-label">Featured Image</label>
                <div style={{
                  border: '2px dashed rgba(212,175,55,0.2)', borderRadius: 8,
                  padding: '40px 24px', textAlign: 'center',
                  background: 'rgba(212,175,55,0.02)', cursor: 'pointer',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'; e.currentTarget.style.background = 'rgba(212,175,55,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'; e.currentTarget.style.background = 'rgba(212,175,55,0.02)'; }}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#d4af37'; }}
                onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'; }}
                onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'; toast('Image upload coming soon'); }}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1" style={{ marginBottom: 12, opacity: 0.5 }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                  <p style={{ font: '400 14px DM Sans', color: '#908a84', marginBottom: 4 }}>
                    Drag an image here, or click to browse
                  </p>
                  <p style={{ font: '300 11px DM Sans', color: '#5a5550' }}>
                    JPG, PNG, or WebP — max 5 MB
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  className="admin-btn admin-btn-gold admin-btn-lg"
                  disabled={saving}
                  onClick={savePage}
                  style={{ minWidth: 160 }}
                >
                  {saving ? <><span className="admin-spinner" style={{ marginRight: 8 }} /> Saving...</> : 'Save Changes'}
                </button>
                <button className="admin-btn admin-btn-outline admin-btn-lg" onClick={() => toast('Preview opening in new tab...')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  Preview
                </button>
                <button className="admin-btn admin-btn-ghost admin-btn-lg" onClick={() => setEditing(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ ANNOUNCEMENT TAB ═══ */}
      {tab === 'announcement' && (
        <div className="admin-panel" style={{ maxWidth: 700 }}>
          <div className="admin-panel-title" style={{ marginBottom: 8 }}>Announcement Bar</div>
          <p style={{ font: '300 13px/1.5 DM Sans', color: '#5a5550', marginBottom: 24 }}>
            This gold bar appears at the very top of the store. Use it for sales, shipping promos, or important updates.
          </p>

          {/* Preview */}
          <div style={{ marginBottom: 24 }}>
            <label className="admin-label">Live Preview</label>
            <div style={{
              width: '100%', padding: '11px 20px',
              background: announcement.active ? '#d4af37' : '#3a3a3a',
              color: announcement.active ? '#04040c' : '#888',
              textAlign: 'center',
              font: '600 11px/1 DM Sans', letterSpacing: '2.5px', textTransform: 'uppercase',
              borderRadius: 4, transition: 'all 0.3s',
              opacity: announcement.active ? 1 : 0.5,
            }}>
              {announcement.text || 'Your announcement text here'}
            </div>
          </div>

          {/* Text input */}
          <div style={{ marginBottom: 20 }}>
            <label className="admin-label">Announcement Text</label>
            <input
              className="admin-input admin-input-lg"
              placeholder="e.g. FREE SHIPPING ON ALL ORDERS OVER $50"
              value={announcement.text}
              onChange={e => setAnnouncement(a => ({ ...a, text: e.target.value }))}
              style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
            />
            <p style={{ font: '300 11px DM Sans', color: '#5a5550', marginTop: 4 }}>
              Keep it short — one sentence works best. Text will appear in all caps.
            </p>
          </div>

          {/* Toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.04)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            marginBottom: 24,
          }}>
            <div>
              <div style={{ font: '500 13px DM Sans', color: '#e8e4df', marginBottom: 2 }}>Show Announcement Bar</div>
              <div style={{ font: '300 11px DM Sans', color: '#5a5550' }}>
                {announcement.active ? 'Currently visible to all visitors' : 'Hidden from the store'}
              </div>
            </div>
            <button
              onClick={() => setAnnouncement(a => ({ ...a, active: !a.active }))}
              style={{
                width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                background: announcement.active ? '#d4af37' : 'rgba(255,255,255,0.1)',
                position: 'relative', transition: 'background 0.25s',
                flexShrink: 0,
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: '#fff', position: 'absolute', top: 3,
                left: announcement.active ? 27 : 3,
                transition: 'left 0.25s cubic-bezier(.16,1,.3,1)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }} />
            </button>
          </div>

          <button
            className="admin-btn admin-btn-gold admin-btn-lg"
            disabled={saving}
            onClick={saveAnnouncement}
          >
            {saving ? <><span className="admin-spinner" style={{ marginRight: 8 }} /> Saving...</> : 'Save Announcement'}
          </button>
        </div>
      )}

      {/* ═══ CATEGORIES TAB ═══ */}
      {tab === 'categories' && (
        <div className="admin-panel" style={{ maxWidth: 600 }}>
          <div className="admin-panel-title" style={{ marginBottom: 4 }}>Store Categories</div>
          <p style={{ font: '300 13px/1.5 DM Sans', color: '#5a5550', marginBottom: 24 }}>
            Drag to reorder. Toggle visibility to show or hide categories in the shop. Click a name to rename it.
          </p>

          <div>
            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', marginBottom: 4,
                  background: dragIdx === idx ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.02)',
                  border: '1px solid ' + (dragIdx === idx ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)'),
                  borderRadius: 6, cursor: 'grab', transition: 'background 0.15s, border-color 0.15s',
                  opacity: cat.visible ? 1 : 0.5,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {/* Drag handle */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5a5550" strokeWidth="2" style={{ flexShrink: 0, cursor: 'grab' }}>
                  <circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/>
                  <circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/>
                  <circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>
                </svg>

                {/* Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {renamingCat === cat.id ? (
                    <input
                      autoFocus
                      className="admin-input"
                      style={{ padding: '6px 10px', fontSize: 13 }}
                      value={renameVal}
                      onChange={e => setRenameVal(e.target.value)}
                      onBlur={finishRename}
                      onKeyDown={e => { if (e.key === 'Enter') finishRename(); if (e.key === 'Escape') setRenamingCat(null); }}
                    />
                  ) : (
                    <span
                      onClick={() => startRename(cat)}
                      style={{
                        font: '500 14px DM Sans', color: '#e8e4df', cursor: 'text',
                        borderBottom: '1px dashed transparent', transition: 'border-color 0.15s',
                      }}
                      onMouseEnter={e => e.target.style.borderBottomColor = 'rgba(212,175,55,0.3)'}
                      onMouseLeave={e => e.target.style.borderBottomColor = 'transparent'}
                    >{cat.name}</span>
                  )}
                </div>

                {/* Product count */}
                <span style={{ font: '400 11px DM Sans', color: '#5a5550', flexShrink: 0 }}>
                  {cat.count} product{cat.count !== 1 ? 's' : ''}
                </span>

                {/* Visibility toggle */}
                <button
                  onClick={() => toggleCatVisibility(cat.id)}
                  title={cat.visible ? 'Hide category' : 'Show category'}
                  style={{
                    width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'none', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 4, cursor: 'pointer', color: cat.visible ? '#d4af37' : '#5a5550',
                    transition: 'all 0.15s', flexShrink: 0,
                  }}
                >
                  {cat.visible ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  )}
                </button>
              </div>
            ))}
          </div>

          <p style={{ font: '300 11px DM Sans', color: '#5a5550', marginTop: 16, padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            Drag categories to change the order they appear in the shop filters. Click a name to rename it. Use the eye icon to show or hide a category.
          </p>
        </div>
      )}
    </>
  );
}
