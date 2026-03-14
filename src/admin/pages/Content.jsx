import { useState, useEffect } from 'react';
import { useToast } from '../AdminLayout';
import {
  getContent, updateContent, getAnnouncement, updateAnnouncement,
  getInventory, subscribe,
} from '../data/store';
import HelpBubble from '../components/HelpBubble';

const PAGE_KEYS = ['home', 'about', 'membership'];
const PAGE_LABELS = { home: 'Home', about: 'About', membership: 'Membership' };

const fmtDate = (d) => {
  if (!d) return '';
  const dt = new Date(d + 'T12:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
};

export default function Content() {
  const [, setTick] = useState(0);
  const [tab, setTab] = useState('pages');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [originalForm, setOriginalForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [catOrder, setCatOrder] = useState([]);
  const [catVisibility, setCatVisibility] = useState({});
  const toast = useToast();

  useEffect(() => {
    const unsub = subscribe(() => setTick(t => t + 1));
    return unsub;
  }, []);

  const content = getContent();
  const announcement = getAnnouncement();
  const inventory = getInventory();

  // Derive categories from inventory
  const categorySet = new Set();
  inventory.forEach(item => { if (item.category) categorySet.add(item.category); });
  const derivedCategories = Array.from(categorySet);

  // Initialize category order from content or derived
  useEffect(() => {
    const stored = content.categoryOrder || derivedCategories;
    setCatOrder(stored);
    setCatVisibility(content.categoryVisibility || {});
  }, []);

  // Announcement local state
  const [annText, setAnnText] = useState(announcement.text || '');
  const [annActive, setAnnActive] = useState(announcement.active || false);

  useEffect(() => {
    setAnnText(announcement.text || '');
    setAnnActive(announcement.active || false);
  }, [announcement.text, announcement.active]);

  // Page editing
  const openEdit = (pageKey) => {
    const pageData = content[pageKey] || {};
    const formData = {
      title: pageData.title || '',
      subtitle: pageData.subtitle || '',
      body: pageData.body || '',
    };
    setEditForm(formData);
    setOriginalForm({ ...formData });
    setEditing(pageKey);
  };

  const savePage = () => {
    if (!editing) return;
    setSaving(true);
    setTimeout(() => {
      updateContent(editing, {
        title: editForm.title,
        subtitle: editForm.subtitle,
        body: editForm.body,
      });
      setSaving(false);
      setEditing(null);
      toast('Page content saved successfully');
    }, 600);
  };

  const revertPage = () => {
    setEditForm({ ...originalForm });
    toast('Changes reverted');
  };

  // Announcement
  const saveAnnouncement = () => {
    setSaving(true);
    setTimeout(() => {
      updateAnnouncement({ text: annText, active: annActive });
      setSaving(false);
      toast('Announcement updated');
    }, 500);
  };

  // Category management
  const moveCat = (idx, direction) => {
    const newOrder = [...catOrder];
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= newOrder.length) return;
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    setCatOrder(newOrder);
    updateContent('categoryOrder', newOrder);
    toast('Category order updated');
  };

  const toggleCatVisibility = (cat) => {
    const newVis = { ...catVisibility, [cat]: !catVisibility[cat] };
    setCatVisibility(newVis);
    updateContent('categoryVisibility', newVis);
    toast(`Category "${cat}" ${newVis[cat] ? 'hidden' : 'shown'}`);
  };

  const tabs = [
    { id: 'pages', label: 'Pages' },
    { id: 'announcement', label: 'Announcement Bar' },
    { id: 'categories', label: 'Categories' },
  ];

  const inputStyle = {
    width: '100%', padding: '14px 16px', background: '#FFFFFF',
    border: '1px solid #E2E8F0', borderRadius: 6,
    font: "400 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#1E293B', outline: 'none',
    boxSizing: 'border-box',
  };
  const labelStyle = {
    display: 'flex', alignItems: 'center',
    font: "500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", letterSpacing: '1px',
    textTransform: 'uppercase', color: '#94A3B8', marginBottom: 8,
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title" style={{ display: 'inline-flex', alignItems: 'center' }}>
            Content Manager
            <HelpBubble text="Edit your website text and announcements without calling anyone." />
          </h1>
          <p className="admin-page-subtitle">Edit website text, announcements, and categories</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0, marginBottom: 24,
        border: '1px solid #E2E8F0', borderRadius: 6, overflow: 'hidden', width: 'fit-content',
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setEditing(null); }} style={{
            padding: '10px 20px', font: "500 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            background: tab === t.id ? 'rgba(212,175,55,0.1)' : 'transparent',
            color: tab === t.id ? '#d4af37' : '#64748B',
            border: 'none', borderRight: '1px solid #E2E8F0',
            cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}>{t.label}</button>
        ))}
      </div>

      {/* PAGES TAB - List */}
      {tab === 'pages' && !editing && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {PAGE_KEYS.map(key => {
            const page = content[key] || {};
            return (
              <div
                key={key}
                onClick={() => openEdit(key)}
                style={{
                  background: '#FFFFFF', border: '1px solid #E2E8F0',
                  borderRadius: 10, padding: 24, cursor: 'pointer', transition: 'border-color 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
              >
                <div style={{ display: 'flex', alignItems: 'center', font: "500 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#1E293B', marginBottom: 8 }}>
                  {PAGE_LABELS[key]}
                  <HelpBubble text="Click a page to edit its text. Changes go live immediately when you save." />
                </div>
                <div style={{ font: "400 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#64748B', marginBottom: 12, lineHeight: 1.5 }}>
                  {page.title || 'No title set'}
                </div>
                <div style={{ font: "400 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#94A3B8' }}>
                  Click to edit
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PAGES TAB - Edit */}
      {tab === 'pages' && editing && (() => {
        return (
          <div>
            <button
              onClick={() => setEditing(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
                background: 'none', border: 'none', color: '#64748B', cursor: 'pointer',
                font: "400 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
              Back to all pages
            </button>

            <div className="admin-panel" style={{ maxWidth: 800 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
                <h2 style={{ font: "500 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#1E293B' }}>Editing: {PAGE_LABELS[editing]}</h2>
              </div>

              {/* Title */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>
                  Page Title
                  <HelpBubble text="The main heading visitors see at the top of this page." />
                </label>
                <input
                  style={{ ...inputStyle, fontSize: 18, padding: '14px 16px' }}
                  placeholder="Enter page title..."
                  value={editForm.title}
                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              {/* Subtitle */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>
                  Subtitle
                  <HelpBubble text="A short tagline or description that appears below the title." />
                </label>
                <input
                  style={inputStyle}
                  placeholder="Short subtitle or tagline"
                  value={editForm.subtitle}
                  onChange={e => setEditForm(f => ({ ...f, subtitle: e.target.value }))}
                />
              </div>

              {/* Body */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>
                  Body Text
                  <HelpBubble text="The main content of the page. You can write as much as you need here." />
                </label>
                <textarea
                  style={{ ...inputStyle, minHeight: 200, resize: 'vertical', lineHeight: 1.8 }}
                  placeholder="Page body content..."
                  value={editForm.body}
                  onChange={e => setEditForm(f => ({ ...f, body: e.target.value }))}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  className="admin-btn admin-btn-gold admin-btn-lg"
                  disabled={saving}
                  onClick={savePage}
                  style={{ minWidth: 160 }}
                >
                  {saving ? <><span className="admin-spinner" style={{ marginRight: 8 }} /> Saving...</> : 'Save'}
                </button>
                <button className="admin-btn admin-btn-outline admin-btn-lg" onClick={revertPage}>
                  Revert
                </button>
                <button className="admin-btn admin-btn-ghost admin-btn-lg" onClick={() => setEditing(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ANNOUNCEMENT TAB */}
      {tab === 'announcement' && (
        <div className="admin-panel" style={{ maxWidth: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', font: "500 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#1E293B', marginBottom: 8 }}>
            Announcement Bar
            <HelpBubble text="This banner appears at the top of every page on your website. Great for promotions." />
          </div>
          <p style={{ font: "400 14px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#94A3B8', marginBottom: 24 }}>
            This gold bar appears at the very top of the store. Use it for sales, shipping promos, or important updates.
          </p>

          {/* Preview */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Live Preview</label>
            <div style={{
              width: '100%', padding: '11px 20px',
              background: annActive ? '#d4af37' : '#CBD5E1',
              color: annActive ? '#04040c' : '#94A3B8',
              textAlign: 'center',
              font: "600 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", letterSpacing: '2.5px', textTransform: 'uppercase',
              borderRadius: 4, transition: 'all 0.3s',
              opacity: annActive ? 1 : 0.5,
            }}>
              {annText || 'Your announcement text here'}
            </div>
          </div>

          {/* Text input */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Announcement Text</label>
            <input
              style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: '1px' }}
              placeholder="e.g. FREE SHIPPING ON ALL ORDERS OVER $50"
              value={annText}
              onChange={e => setAnnText(e.target.value)}
            />
            <p style={{ font: "400 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#94A3B8', marginTop: 4 }}>
              Keep it short -- one sentence works best.
            </p>
          </div>

          {/* Toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 0', borderTop: '1px solid #E2E8F0',
            borderBottom: '1px solid #E2E8F0',
            marginBottom: 24,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', font: "500 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#1E293B', marginBottom: 2 }}>
                Show Announcement Bar
                <HelpBubble text="When on, customers see the announcement. Turn off to hide it." />
              </div>
              <div style={{ font: "400 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#94A3B8' }}>
                {annActive ? 'Currently visible to all visitors' : 'Hidden from the store'}
              </div>
            </div>
            <button
              onClick={() => setAnnActive(a => !a)}
              style={{
                width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                background: annActive ? '#d4af37' : '#E2E8F0',
                position: 'relative', transition: 'background 0.25s', flexShrink: 0,
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3,
                left: annActive ? 27 : 3,
                transition: 'left 0.25s cubic-bezier(.16,1,.3,1)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
              }} />
            </button>
          </div>

          <button
            className="admin-btn admin-btn-gold admin-btn-lg"
            disabled={saving}
            onClick={saveAnnouncement}
          >
            {saving ? <><span className="admin-spinner" style={{ marginRight: 8 }} /> Saving...</> : 'Save'}
          </button>
        </div>
      )}

      {/* CATEGORIES TAB */}
      {tab === 'categories' && (
        <div className="admin-panel" style={{ maxWidth: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', font: "500 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#1E293B', marginBottom: 4 }}>
            Store Categories
            <HelpBubble text="These are the product categories shown in your shop. You can reorder them or hide ones you don't need." />
          </div>
          <p style={{ font: "400 14px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#94A3B8', marginBottom: 24 }}>
            Reorder categories using the arrow buttons. Toggle visibility to show or hide categories in the shop.
          </p>

          {catOrder.length === 0 && derivedCategories.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8', font: "400 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
              No categories found in inventory
            </div>
          ) : (
            <div>
              {(catOrder.length > 0 ? catOrder : derivedCategories).map((cat, idx, arr) => {
                const isHidden = catVisibility[cat];
                const productCount = inventory.filter(p => p.category === cat).length;
                return (
                  <div
                    key={cat}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px', marginBottom: 4,
                      background: '#FAFAF8',
                      border: '1px solid #E2E8F0',
                      borderRadius: 6,
                      opacity: isHidden ? 0.5 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {/* Up/Down buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <button
                        onClick={() => moveCat(idx, -1)}
                        disabled={idx === 0}
                        style={{
                          width: 24, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'none', border: '1px solid #E2E8F0', borderRadius: 3,
                          color: idx === 0 ? '#CBD5E1' : '#64748B', cursor: idx === 0 ? 'default' : 'pointer',
                          fontSize: 10,
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18,15 12,9 6,15"/></svg>
                      </button>
                      <button
                        onClick={() => moveCat(idx, 1)}
                        disabled={idx === arr.length - 1}
                        style={{
                          width: 24, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'none', border: '1px solid #E2E8F0', borderRadius: 3,
                          color: idx === arr.length - 1 ? '#CBD5E1' : '#64748B', cursor: idx === arr.length - 1 ? 'default' : 'pointer',
                          fontSize: 10,
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6,9 12,15 18,9"/></svg>
                      </button>
                    </div>

                    {/* Name */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ font: "500 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#1E293B' }}>{cat}</span>
                    </div>

                    {/* Product count */}
                    <span style={{ font: "400 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#94A3B8', flexShrink: 0 }}>
                      {productCount} product{productCount !== 1 ? 's' : ''}
                    </span>

                    {/* Visibility toggle */}
                    <button
                      onClick={() => toggleCatVisibility(cat)}
                      title={isHidden ? 'Show category' : 'Hide category'}
                      style={{
                        width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'none', border: '1px solid #E2E8F0',
                        borderRadius: 4, cursor: 'pointer', color: isHidden ? '#94A3B8' : '#d4af37',
                        transition: 'all 0.15s', flexShrink: 0,
                      }}
                    >
                      {isHidden ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <p style={{ font: "400 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#94A3B8', marginTop: 16, padding: '12px 0', borderTop: '1px solid #E2E8F0' }}>
            Use the arrows to reorder categories. Use the eye icon to show or hide a category in the shop.
          </p>
        </div>
      )}
    </>
  );
}
