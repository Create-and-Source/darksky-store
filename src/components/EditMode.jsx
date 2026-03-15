import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const LS_EDITS_KEY = 'ds_site_edits';
const LS_PUBLISHED_KEY = 'ds_site_published';
const LS_REVISIONS_KEY = 'ds_site_revisions';
const MAX_REVISIONS = 10;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/* ------------------------------------------------------------------ */
/*  Toast (lightweight, self-contained)                               */
/* ------------------------------------------------------------------ */

let toastTimeout = null;

function showToast(message, duration = 3000) {
  let el = document.getElementById('em-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'em-toast';
    el.className = 'em-toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('em-toast--visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    el.classList.remove('em-toast--visible');
  }, duration);
}

/* ------------------------------------------------------------------ */
/*  Context                                                           */
/* ------------------------------------------------------------------ */

const EditModeContext = createContext(null);

/* ------------------------------------------------------------------ */
/*  useEditMode hook                                                  */
/* ------------------------------------------------------------------ */

export function useEditMode() {
  const ctx = useContext(EditModeContext);
  if (!ctx) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  EditModeProvider                                                  */
/* ------------------------------------------------------------------ */

export function EditModeProvider({ children }) {
  const [editMode, setEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [changes, setChanges] = useState(() => loadJSON(LS_EDITS_KEY, {}));
  const [revisions, setRevisions] = useState(() => loadJSON(LS_REVISIONS_KEY, []));

  // Persist draft changes
  useEffect(() => {
    saveJSON(LS_EDITS_KEY, changes);
  }, [changes]);

  useEffect(() => {
    saveJSON(LS_REVISIONS_KEY, revisions);
  }, [revisions]);

  /* ---- Text ---- */
  const getText = useCallback(
    (key, defaultText) => {
      if (changes.texts && changes.texts[key] !== undefined) return changes.texts[key];
      const pub = loadJSON(LS_PUBLISHED_KEY, {});
      if (pub.texts && pub.texts[key] !== undefined) return pub.texts[key];
      return defaultText;
    },
    [changes],
  );

  const setText = useCallback((key, value) => {
    setChanges((prev) => ({
      ...prev,
      texts: { ...prev.texts, [key]: value },
    }));
  }, []);

  /* ---- Images ---- */
  const getImage = useCallback(
    (key, defaultSrc) => {
      if (changes.images && changes.images[key] !== undefined) return changes.images[key];
      const pub = loadJSON(LS_PUBLISHED_KEY, {});
      if (pub.images && pub.images[key] !== undefined) return pub.images[key];
      return defaultSrc;
    },
    [changes],
  );

  const setImage = useCallback((key, base64) => {
    setChanges((prev) => ({
      ...prev,
      images: { ...prev.images, [key]: base64 },
    }));
  }, []);

  /* ---- Section order ---- */
  const getSectionOrder = useCallback(
    (pageId) => {
      const key = `order_${pageId}`;
      if (changes[key]) return changes[key];
      const pub = loadJSON(LS_PUBLISHED_KEY, {});
      if (pub[key]) return pub[key];
      return null;
    },
    [changes],
  );

  const setSectionOrder = useCallback((pageId, order) => {
    setChanges((prev) => ({ ...prev, [`order_${pageId}`]: order }));
  }, []);

  /* ---- Section visibility ---- */
  const getSectionVisible = useCallback(
    (pageId, sectionId) => {
      const key = `vis_${pageId}_${sectionId}`;
      if (changes[key] !== undefined) return changes[key];
      const pub = loadJSON(LS_PUBLISHED_KEY, {});
      if (pub[key] !== undefined) return pub[key];
      return true;
    },
    [changes],
  );

  const toggleSectionVisible = useCallback((pageId, sectionId) => {
    const key = `vis_${pageId}_${sectionId}`;
    setChanges((prev) => ({ ...prev, [key]: prev[key] === undefined ? false : !prev[key] }));
  }, []);

  /* ---- Publish / Revisions ---- */
  const publish = useCallback(() => {
    const published = loadJSON(LS_PUBLISHED_KEY, {});
    // Merge draft changes into published
    const merged = { ...published };
    // texts
    if (changes.texts) merged.texts = { ...merged.texts, ...changes.texts };
    // images
    if (changes.images) merged.images = { ...merged.images, ...changes.images };
    // other keys (orders, visibility, custom sections)
    Object.keys(changes).forEach((k) => {
      if (k !== 'texts' && k !== 'images') merged[k] = changes[k];
    });

    saveJSON(LS_PUBLISHED_KEY, merged);

    // Save revision
    setRevisions((prev) => {
      const next = [{ timestamp: new Date().toISOString(), data: merged }, ...prev].slice(
        0,
        MAX_REVISIONS,
      );
      return next;
    });

    // Clear draft
    setChanges({});
    showToast('Changes published successfully');
  }, [changes]);

  const restoreRevision = useCallback((index) => {
    setRevisions((prev) => {
      const rev = prev[index];
      if (!rev) return prev;
      saveJSON(LS_PUBLISHED_KEY, rev.data);
      setChanges({});
      showToast('Revision restored');
      return prev;
    });
  }, []);

  const discardChanges = useCallback(() => {
    setChanges({});
    showToast('Changes discarded');
  }, []);

  const hasChanges = useMemo(() => {
    return Object.keys(changes).length > 0;
  }, [changes]);

  const changeCount = useMemo(() => {
    let count = 0;
    if (changes.texts) count += Object.keys(changes.texts).length;
    if (changes.images) count += Object.keys(changes.images).length;
    Object.keys(changes).forEach((k) => {
      if (k !== 'texts' && k !== 'images') count += 1;
    });
    return count;
  }, [changes]);

  const value = useMemo(
    () => ({
      editMode,
      setEditMode,
      previewMode,
      setPreviewMode,
      changes,
      getText,
      setText,
      getImage,
      setImage,
      getSectionOrder,
      setSectionOrder,
      getSectionVisible,
      toggleSectionVisible,
      publish,
      revisions,
      restoreRevision,
      hasChanges,
      changeCount,
      discardChanges,
    }),
    [
      editMode,
      previewMode,
      changes,
      getText,
      setText,
      getImage,
      setImage,
      getSectionOrder,
      setSectionOrder,
      getSectionVisible,
      toggleSectionVisible,
      publish,
      revisions,
      restoreRevision,
      hasChanges,
      changeCount,
      discardChanges,
    ],
  );

  return <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>;
}

/* ------------------------------------------------------------------ */
/*  EditToggleButton                                                  */
/* ------------------------------------------------------------------ */

export function EditToggleButton() {
  const { editMode, setEditMode } = useEditMode();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => setVisible(localStorage.getItem('ds_user_role') === 'manager');
    check();
    window.addEventListener('ds-auth-change', check);
    return () => window.removeEventListener('ds-auth-change', check);
  }, []);

  if (!visible) return null;

  return (
    <button
      className={`em-toggle-btn ${editMode ? 'em-toggle-btn--active' : 'em-toggle-btn--pulse'}`}
      onClick={() => setEditMode((v) => !v)}
      title={editMode ? 'Exit edit mode' : 'Enter edit mode'}
      aria-label="Toggle edit mode"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  EditBanner                                                        */
/* ------------------------------------------------------------------ */

export function EditBanner() {
  const {
    editMode,
    previewMode,
    setPreviewMode,
    hasChanges,
    changeCount,
    discardChanges,
  } = useEditMode();
  const [showPublish, setShowPublish] = useState(false);
  const [showRevisions, setShowRevisions] = useState(false);

  if (!editMode) return null;

  return (
    <>
      <div className={`em-banner ${previewMode ? 'em-banner--preview' : ''}`}>
        <div className="em-banner__left">
          <span className="em-banner__label">
            {previewMode ? 'Preview Mode' : 'Edit Mode'}
          </span>
          {changeCount > 0 && (
            <span className="em-banner__badge">{changeCount}</span>
          )}
        </div>
        <div className="em-banner__right">
          <button
            className="em-banner__btn"
            onClick={() => setShowRevisions(true)}
            title="Revision history"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
          <button
            className="em-banner__btn"
            onClick={() => setPreviewMode((v) => !v)}
          >
            {previewMode ? 'Edit' : 'Preview'}
          </button>
          <button
            className="em-banner__btn em-banner__btn--danger"
            onClick={() => {
              if (window.confirm('Discard all unpublished changes?')) {
                discardChanges();
              }
            }}
            disabled={!hasChanges}
          >
            Discard
          </button>
          <button
            className="em-banner__btn em-banner__btn--primary"
            onClick={() => setShowPublish(true)}
            disabled={!hasChanges}
          >
            Publish
          </button>
        </div>
      </div>

      {showPublish && <PublishModal onClose={() => setShowPublish(false)} />}
      {showRevisions && <RevisionHistory onClose={() => setShowRevisions(false)} />}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  EditableText                                                      */
/* ------------------------------------------------------------------ */

export function EditableText({
  textKey,
  defaultText,
  tag = 'span',
  className = '',
  style,
}) {
  const { editMode, previewMode, getText, setText } = useEditMode();
  const elRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const displayText = getText(textKey, defaultText);

  const isEditing = editMode && !previewMode;

  const handleBlur = useCallback(() => {
    setFocused(false);
    if (elRef.current) {
      const newText = elRef.current.innerHTML;
      if (newText !== defaultText) {
        setText(textKey, newText);
      }
    }
  }, [textKey, defaultText, setText]);

  const handleFocus = useCallback(() => {
    setFocused(true);
    if (elRef.current) {
      const rect = elRef.current.getBoundingClientRect();
      setToolbarPos({
        top: rect.top + window.scrollY - 40,
        left: rect.left + window.scrollX,
      });
    }
  }, []);

  const Tag = tag;

  if (!isEditing) {
    return (
      <Tag
        className={className}
        style={style}
        dangerouslySetInnerHTML={{ __html: displayText }}
      />
    );
  }

  return (
    <>
      <Tag
        ref={elRef}
        className={`${className} em-editable-text`}
        style={style}
        contentEditable
        suppressContentEditableWarning
        onFocus={handleFocus}
        onBlur={handleBlur}
        dangerouslySetInnerHTML={{ __html: displayText }}
      />
      {focused && (
        <div
          className="em-text-toolbar"
          style={{ top: toolbarPos.top, left: toolbarPos.left }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <button
            className="em-text-toolbar__btn"
            onClick={() => document.execCommand('bold')}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            className="em-text-toolbar__btn"
            onClick={() => document.execCommand('italic')}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            className="em-text-toolbar__btn"
            onClick={() => document.execCommand('undo')}
            title="Undo"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  EditableImage                                                     */
/* ------------------------------------------------------------------ */

export function EditableImage({
  imageKey,
  defaultSrc,
  alt = '',
  className = '',
  style,
}) {
  const { editMode, previewMode, getImage, setImage } = useEditMode();
  const fileRef = useRef(null);
  const src = getImage(imageKey, defaultSrc);
  const isEditing = editMode && !previewMode;

  const handleFile = useCallback(
    (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (file.size > MAX_IMAGE_BYTES) {
        showToast('Image must be under 2 MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImage(imageKey, reader.result);
      };
      reader.readAsDataURL(file);
    },
    [imageKey, setImage],
  );

  if (!isEditing) {
    return <img src={src} alt={alt} className={className} style={style} />;
  }

  return (
    <div className={`em-editable-image ${className}`} style={style}>
      <img src={src} alt={alt} className="em-editable-image__img" />
      <div
        className="em-editable-image__overlay"
        onClick={() => fileRef.current && fileRef.current.click()}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SectionWrapper                                                    */
/* ------------------------------------------------------------------ */

export function SectionWrapper({
  pageId,
  sectionId,
  children,
  className = '',
  style,
}) {
  const {
    editMode,
    previewMode,
    getSectionOrder,
    setSectionOrder,
    getSectionVisible,
    toggleSectionVisible,
  } = useEditMode();
  const [hovered, setHovered] = useState(false);
  const isVisible = getSectionVisible(pageId, sectionId);
  const isEditing = editMode && !previewMode;

  const move = useCallback(
    (dir) => {
      let order = getSectionOrder(pageId);
      if (!order) return;
      const idx = order.indexOf(sectionId);
      if (idx === -1) return;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= order.length) return;
      const next = [...order];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      setSectionOrder(pageId, next);
    },
    [pageId, sectionId, getSectionOrder, setSectionOrder],
  );

  // When not editing, respect visibility from published state
  if (!editMode && !isVisible) return null;

  // In preview mode, respect visibility
  if (previewMode && !isVisible) return null;

  // In edit mode and hidden: show collapsed placeholder
  if (isEditing && !isVisible) {
    return (
      <div
        className="em-section-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span className="em-section-hidden__label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
          {sectionId} (Hidden)
        </span>
        <button
          className="em-section-ctrl__btn"
          onClick={() => toggleSectionVisible(pageId, sectionId)}
          title="Show section"
        >
          Show
        </button>
      </div>
    );
  }

  return (
    <div
      className={`em-section ${className} ${isEditing && hovered ? 'em-section--hover' : ''}`}
      style={style}
      onMouseEnter={() => isEditing && setHovered(true)}
      onMouseLeave={() => isEditing && setHovered(false)}
    >
      {isEditing && hovered && (
        <div className="em-section-ctrl">
          <span className="em-section-ctrl__name">{sectionId}</span>
          <button
            className="em-section-ctrl__btn"
            onClick={() => move(-1)}
            title="Move up"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          <button
            className="em-section-ctrl__btn"
            onClick={() => move(1)}
            title="Move down"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <button
            className="em-section-ctrl__btn"
            onClick={() => toggleSectionVisible(pageId, sectionId)}
            title="Hide section"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      )}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PublishModal                                                       */
/* ------------------------------------------------------------------ */

export function PublishModal({ onClose }) {
  const { changes, publish, changeCount } = useEditMode();

  const textCount = changes.texts ? Object.keys(changes.texts).length : 0;
  const imageCount = changes.images ? Object.keys(changes.images).length : 0;
  const otherCount = changeCount - textCount - imageCount;

  const handlePublish = () => {
    publish();
    onClose();
  };

  return (
    <div className="em-modal-overlay" onClick={onClose}>
      <div className="em-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="em-modal__title">Publish Changes</h2>
        <div className="em-modal__body">
          <p>You are about to publish the following changes:</p>
          <ul className="em-modal__list">
            {textCount > 0 && <li>{textCount} text edit{textCount !== 1 ? 's' : ''}</li>}
            {imageCount > 0 && <li>{imageCount} image change{imageCount !== 1 ? 's' : ''}</li>}
            {otherCount > 0 && <li>{otherCount} section update{otherCount !== 1 ? 's' : ''}</li>}
          </ul>
          {changeCount === 0 && <p className="em-modal__empty">No changes to publish.</p>}
        </div>
        <div className="em-modal__footer">
          <button className="em-modal__btn em-modal__btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="em-modal__btn em-modal__btn--publish"
            onClick={handlePublish}
            disabled={changeCount === 0}
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  RevisionHistory                                                   */
/* ------------------------------------------------------------------ */

export function RevisionHistory({ onClose }) {
  const { revisions, restoreRevision } = useEditMode();

  const handleRestore = (index) => {
    if (window.confirm('Restore this revision? Current unpublished changes will be lost.')) {
      restoreRevision(index);
      onClose();
    }
  };

  return (
    <div className="em-modal-overlay" onClick={onClose}>
      <div className="em-modal em-modal--wide" onClick={(e) => e.stopPropagation()}>
        <h2 className="em-modal__title">Revision History</h2>
        <div className="em-modal__body">
          {revisions.length === 0 ? (
            <p className="em-modal__empty">No published revisions yet.</p>
          ) : (
            <ul className="em-revision-list">
              {revisions.map((rev, i) => (
                <li key={i} className="em-revision-item">
                  <span className="em-revision-item__time">
                    {new Date(rev.timestamp).toLocaleString()}
                  </span>
                  <button
                    className="em-revision-item__btn"
                    onClick={() => handleRestore(i)}
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="em-modal__footer">
          <button className="em-modal__btn em-modal__btn--cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AddSectionButton                                                  */
/* ------------------------------------------------------------------ */

const SECTION_TEMPLATES = [
  { id: 'hero', label: 'Hero' },
  { id: 'text-block', label: 'Text Block' },
  { id: 'image-text', label: 'Image + Text' },
  { id: 'product-grid', label: 'Product Grid' },
  { id: 'cta', label: 'CTA' },
];

export function AddSectionButton({ pageId, insertIndex, onAdd }) {
  const { editMode, previewMode } = useEditMode();
  const [open, setOpen] = useState(false);

  if (!editMode || previewMode) return null;

  const handleSelect = (template) => {
    if (onAdd) onAdd(template, insertIndex);
    setOpen(false);
    showToast(`Added ${template.label} section`);
  };

  return (
    <div className="em-add-section">
      <div className="em-add-section__line" />
      <button
        className="em-add-section__btn"
        onClick={() => setOpen((v) => !v)}
        title="Add section"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      {open && (
        <div className="em-add-section__picker">
          {SECTION_TEMPLATES.map((t) => (
            <button
              key={t.id}
              className="em-add-section__option"
              onClick={() => handleSelect(t)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles (injected once)                                            */
/* ------------------------------------------------------------------ */

function EditModeStyles() {
  return (
    <style>{`
      /* ---- Toast ---- */
      .em-toast {
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: #1a1a2e;
        color: #fff;
        padding: 10px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10001;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s, transform 0.3s;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      }
      .em-toast--visible {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
        pointer-events: auto;
      }

      /* ---- Toggle Button ---- */
      .em-toggle-btn {
        position: fixed;
        bottom: 24px;
        left: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #d4af37;
        color: #1a1a2e;
        border: none;
        cursor: pointer;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 16px rgba(212,175,55,0.4);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .em-toggle-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 24px rgba(212,175,55,0.5);
      }
      .em-toggle-btn--active {
        background: #1a1a2e;
        color: #d4af37;
        border: 2px solid #d4af37;
      }
      .em-toggle-btn--pulse {
        animation: em-pulse 2s ease-in-out infinite;
      }
      @keyframes em-pulse {
        0%, 100% { box-shadow: 0 4px 16px rgba(212,175,55,0.4); }
        50% { box-shadow: 0 4px 24px rgba(212,175,55,0.7); }
      }

      /* ---- Banner ---- */
      .em-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 48px;
        background: #d4af37;
        color: #1a1a2e;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        z-index: 9998;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }
      .em-banner--preview {
        background: #16213e;
        color: #d4af37;
      }
      .em-banner__left {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .em-banner__label {
        font-weight: 700;
        font-size: 15px;
      }
      .em-banner__badge {
        background: #1a1a2e;
        color: #d4af37;
        font-size: 12px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 12px;
        min-width: 20px;
        text-align: center;
      }
      .em-banner--preview .em-banner__badge {
        background: #d4af37;
        color: #1a1a2e;
      }
      .em-banner__right {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .em-banner__btn {
        background: rgba(26,26,46,0.15);
        border: 1px solid rgba(26,26,46,0.3);
        color: #1a1a2e;
        padding: 6px 14px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        transition: background 0.2s;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .em-banner--preview .em-banner__btn {
        background: rgba(212,175,55,0.15);
        border-color: rgba(212,175,55,0.3);
        color: #d4af37;
      }
      .em-banner__btn:hover {
        background: rgba(26,26,46,0.25);
      }
      .em-banner__btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .em-banner__btn--primary {
        background: #1a1a2e;
        color: #d4af37;
        border-color: #1a1a2e;
      }
      .em-banner__btn--primary:hover {
        background: #16213e;
      }
      .em-banner--preview .em-banner__btn--primary {
        background: #d4af37;
        color: #1a1a2e;
        border-color: #d4af37;
      }
      .em-banner__btn--danger {
        color: #991b1b;
      }

      /* ---- Editable Text ---- */
      .em-editable-text {
        outline: none;
        transition: border-color 0.2s;
        border: 2px dashed transparent;
        border-radius: 4px;
        min-width: 20px;
      }
      .em-editable-text:hover {
        border-color: rgba(212,175,55,0.5);
      }
      .em-editable-text:focus {
        border-color: #d4af37;
        background: rgba(212,175,55,0.05);
      }

      /* ---- Text Toolbar ---- */
      .em-text-toolbar {
        position: absolute;
        z-index: 10000;
        display: flex;
        gap: 2px;
        background: #1a1a2e;
        border: 1px solid rgba(212,175,55,0.3);
        border-radius: 6px;
        padding: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      }
      .em-text-toolbar__btn {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: transparent;
        color: #d4af37;
        cursor: pointer;
        border-radius: 4px;
        font-size: 14px;
      }
      .em-text-toolbar__btn:hover {
        background: rgba(212,175,55,0.2);
      }

      /* ---- Editable Image ---- */
      .em-editable-image {
        position: relative;
        display: inline-block;
        cursor: pointer;
      }
      .em-editable-image__img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .em-editable-image__overlay {
        position: absolute;
        inset: 0;
        background: rgba(26,26,46,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
        border-radius: inherit;
        border: 2px dashed rgba(212,175,55,0.5);
      }
      .em-editable-image:hover .em-editable-image__overlay {
        opacity: 1;
      }

      /* ---- Section Wrapper ---- */
      .em-section {
        position: relative;
        transition: outline 0.2s;
      }
      .em-section--hover {
        outline: 2px dashed rgba(212,175,55,0.4);
        outline-offset: 2px;
      }
      .em-section-ctrl {
        position: absolute;
        top: 8px;
        right: 8px;
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(26,26,46,0.85);
        padding: 4px 8px;
        border-radius: 6px;
        z-index: 100;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      }
      .em-section-ctrl__name {
        color: #d4af37;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-right: 4px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .em-section-ctrl__btn {
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: 1px solid rgba(255,255,255,0.2);
        color: #fff;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.2s;
      }
      .em-section-ctrl__btn:hover {
        background: rgba(212,175,55,0.3);
      }

      /* ---- Hidden Section ---- */
      .em-section-hidden {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        margin: 4px 0;
        background: rgba(26,26,46,0.06);
        border: 1px dashed rgba(212,175,55,0.3);
        border-radius: 6px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .em-section-hidden__label {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #64748B;
        font-size: 13px;
        font-weight: 500;
      }

      /* ---- Modal ---- */
      .em-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      .em-modal {
        background: #fff;
        border-radius: 12px;
        padding: 28px;
        width: 420px;
        max-width: 90vw;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 16px 48px rgba(0,0,0,0.2);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .em-modal--wide {
        width: 520px;
      }
      .em-modal__title {
        margin: 0 0 16px 0;
        font-size: 20px;
        font-weight: 700;
        color: #1E293B;
      }
      .em-modal__body {
        color: #1E293B;
        font-size: 14px;
        line-height: 1.6;
      }
      .em-modal__body p {
        margin: 0 0 12px 0;
      }
      .em-modal__list {
        margin: 8px 0 0 0;
        padding-left: 20px;
        color: #1E293B;
      }
      .em-modal__list li {
        margin-bottom: 4px;
      }
      .em-modal__empty {
        color: #64748B;
        font-style: italic;
      }
      .em-modal__footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 24px;
      }
      .em-modal__btn {
        padding: 8px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: background 0.2s;
      }
      .em-modal__btn--cancel {
        background: #f1f5f9;
        color: #64748B;
      }
      .em-modal__btn--cancel:hover {
        background: #e2e8f0;
      }
      .em-modal__btn--publish {
        background: #d4af37;
        color: #1a1a2e;
      }
      .em-modal__btn--publish:hover {
        background: #c4a030;
      }
      .em-modal__btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* ---- Revision List ---- */
      .em-revision-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .em-revision-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #f1f5f9;
      }
      .em-revision-item:last-child {
        border-bottom: none;
      }
      .em-revision-item__time {
        color: #1E293B;
        font-size: 13px;
      }
      .em-revision-item__btn {
        background: #f1f5f9;
        color: #1a1a2e;
        border: 1px solid rgba(212,175,55,0.3);
        padding: 4px 14px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }
      .em-revision-item__btn:hover {
        background: #d4af37;
        color: #1a1a2e;
        border-color: #d4af37;
      }

      /* ---- Add Section ---- */
      .em-add-section {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 32px;
        margin: 4px 0;
      }
      .em-add-section__line {
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        height: 2px;
        background: rgba(212,175,55,0.3);
      }
      .em-add-section__btn {
        position: relative;
        z-index: 1;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #d4af37;
        color: #1a1a2e;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(212,175,55,0.3);
        transition: transform 0.2s;
      }
      .em-add-section__btn:hover {
        transform: scale(1.15);
      }
      .em-add-section__picker {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: #fff;
        border: 1px solid rgba(212,175,55,0.3);
        border-radius: 8px;
        padding: 6px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        z-index: 101;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        min-width: 160px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .em-add-section__option {
        background: transparent;
        border: none;
        padding: 8px 14px;
        text-align: left;
        cursor: pointer;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        color: #1E293B;
        transition: background 0.15s;
      }
      .em-add-section__option:hover {
        background: rgba(212,175,55,0.15);
        color: #1a1a2e;
      }
    `}</style>
  );
}

/* ------------------------------------------------------------------ */
/*  Wrap Provider to include styles                                   */
/* ------------------------------------------------------------------ */

const OriginalProvider = EditModeProvider;

EditModeProvider = function EditModeProviderWithStyles({ children }) {
  return (
    <OriginalProvider>
      <EditModeStyles />
      {children}
    </OriginalProvider>
  );
};

/* ------------------------------------------------------------------ */
/*  Default export (convenience)                                      */
/* ------------------------------------------------------------------ */

export default {
  EditModeProvider,
  EditToggleButton,
  EditBanner,
  EditableText,
  EditableImage,
  SectionWrapper,
  PublishModal,
  RevisionHistory,
  AddSectionButton,
  useEditMode,
};
