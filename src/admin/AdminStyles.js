export const ADMIN_CSS = `
/* ══════════════════════════════════════════
   DARK SKY ADMIN STYLES — LIGHT THEME
   ══════════════════════════════════════════ */

.admin {
  display: flex;
  min-height: 100vh;
  background: #F8F7F4;
  color: #1E293B;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ── SIDEBAR ── */
.admin-sidebar {
  width: 260px;
  background: #1E293B;
  border-right: none;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  transition: transform 0.3s cubic-bezier(.16,1,.3,1);
}
.admin-sidebar.collapsed {
  transform: translateX(-260px);
}

.admin-sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.admin-sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.admin-sidebar-logo {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37, #a08520);
  display: flex;
  align-items: center;
  justify-content: center;
  font: 700 15px/1 Georgia, serif;
  color: #FFFFFF;
  flex-shrink: 0;
}
.admin-sidebar-title {
  font: 500 15px/1.2 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #FFFFFF;
}
.admin-sidebar-title small {
  display: block;
  font: 600 9px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #d4af37;
  margin-bottom: 3px;
}

.admin-sidebar-nav {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}
.admin-nav-section {
  padding: 0 12px;
  margin-bottom: 8px;
}
.admin-nav-label {
  font: 600 11px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #64748B;
  padding: 12px 12px 8px;
}
.admin-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 12px;
  height: 48px;
  border-radius: 6px;
  font: 400 15px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #94A3B8;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  border: none;
  border-left: 3px solid transparent;
  background: none;
  width: 100%;
  text-align: left;
  box-sizing: border-box;
}
.admin-nav-item:hover {
  background: rgba(255,255,255,0.05);
  color: #FFFFFF;
}
.admin-nav-item.active {
  background: rgba(212,175,55,0.15);
  color: #D4AF37;
  border-left-color: #D4AF37;
}
.admin-nav-item svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  opacity: 0.7;
}
.admin-nav-item.active svg {
  opacity: 1;
}
.admin-nav-badge {
  margin-left: auto;
  background: rgba(212,175,55,0.12);
  color: #d4af37;
  font: 600 12px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 3px 8px;
  border-radius: 10px;
}

.admin-sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.admin-nav-back {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  height: 48px;
  border-radius: 6px;
  font: 400 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #94A3B8;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  border: none;
  background: none;
  width: 100%;
}
.admin-nav-back:hover {
  color: #FFFFFF;
  background: rgba(255,255,255,0.05);
}

/* ── MAIN CONTENT ── */
.admin-main {
  flex: 1;
  margin-left: 260px;
  min-height: 100vh;
  transition: margin-left 0.3s cubic-bezier(.16,1,.3,1);
}
.admin-main.expanded {
  margin-left: 0;
}

.admin-topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 64px;
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
}
.admin-topbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.admin-topbar-title {
  font: 500 16px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1E293B;
}
.admin-topbar-user {
  font: 400 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #64748B;
  display: flex;
  align-items: center;
  gap: 8px;
}
.admin-topbar-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(212,175,55,0.12);
  color: #d4af37;
  display: flex;
  align-items: center;
  justify-content: center;
  font: 600 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.admin-hamburger {
  display: none;
  background: none;
  border: none;
  color: #64748B;
  cursor: pointer;
  padding: 4px;
}

.admin-content {
  padding: 28px 32px 48px;
}

/* ── STAT CARDS ── */
.admin-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}
.admin-stat {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 22px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  transition: border-color 0.2s;
}
.admin-stat:hover {
  border-color: rgba(212,175,55,0.3);
}
.admin-stat-label {
  font: 500 13px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #94A3B8;
  margin-bottom: 10px;
}
.admin-stat-value {
  font: 600 28px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1E293B;
  margin-bottom: 6px;
}
.admin-stat-value.gold { color: #d4af37; }
.admin-stat-sub {
  font: 400 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #64748B;
}
.admin-stat-sub .up { color: #10B981; }
.admin-stat-sub .down { color: #EF4444; }

/* ── TABLES ── */
.admin-table-wrap {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.admin-table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #E2E8F0;
}
.admin-table-title {
  font: 500 15px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1E293B;
}
.admin-table {
  width: 100%;
  border-collapse: collapse;
}
.admin-table th {
  padding: 12px 16px;
  font: 500 13px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #94A3B8;
  text-align: left;
  border-bottom: 1px solid #E2E8F0;
  background: #F8F7F4;
  white-space: nowrap;
}
.admin-table td {
  padding: 14px 16px;
  font: 400 15px/1.4 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #64748B;
  border-bottom: 1px solid #FAFAF8;
  vertical-align: middle;
}
.admin-table tr:last-child td { border-bottom: none; }
.admin-table tr:hover td { background: #FAFAF8; }
.admin-table tr.clickable { cursor: pointer; }
.admin-table .text-white { color: #1E293B; }
.admin-table .text-gold { color: #d4af37; }

/* ── BADGES ── */
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 100px;
  font: 600 12px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  white-space: nowrap;
}
.badge-green { background: rgba(16,185,129,0.1); color: #10B981; }
.badge-yellow { background: rgba(245,158,11,0.1); color: #F59E0B; }
.badge-red { background: rgba(239,68,68,0.1); color: #EF4444; }
.badge-blue { background: rgba(59,130,246,0.1); color: #3B82F6; }
.badge-purple { background: rgba(139,92,246,0.1); color: #8B5CF6; }
.badge-gray { background: rgba(100,116,139,0.1); color: #64748B; }
.badge-gold { background: rgba(212,175,55,0.12); color: #d4af37; }

/* ── BUTTONS ── */
.admin-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  height: 48px;
  border-radius: 8px;
  font: 600 15px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  white-space: nowrap;
  box-sizing: border-box;
}
.admin-btn-gold {
  background: #d4af37;
  color: #FFFFFF;
}
.admin-btn-gold:hover {
  background: #e0bf47;
  box-shadow: 0 4px 16px rgba(212,175,55,0.25);
}
.admin-btn-gold:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}
.admin-btn-outline {
  background: transparent;
  border: 1px solid #E2E8F0;
  color: #d4af37;
}
.admin-btn-outline:hover {
  background: rgba(212,175,55,0.06);
  border-color: #d4af37;
}
.admin-btn-ghost {
  background: transparent;
  color: #64748B;
  border: 1px solid #E2E8F0;
}
.admin-btn-ghost:hover {
  color: #1E293B;
  border-color: #CBD5E1;
}
.admin-btn-sm {
  padding: 8px 14px;
  height: 36px;
  font-size: 14px;
}
.admin-btn-lg {
  padding: 16px 28px;
  height: 52px;
  font-size: 15px;
  border-radius: 10px;
}
.admin-btn-danger {
  background: transparent;
  border: 1px solid rgba(239,68,68,0.25);
  color: #EF4444;
}
.admin-btn-danger:hover {
  background: rgba(239,68,68,0.06);
}

/* ── FORM INPUTS ── */
.admin-input {
  width: 100%;
  padding: 13px 14px;
  height: 48px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font: 400 16px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1E293B;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.admin-input:focus {
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212,175,55,0.1);
}
.admin-input::placeholder {
  color: #94A3B8;
}
.admin-input-lg {
  padding: 16px 18px;
  height: 52px;
  font-size: 16px;
  border-radius: 10px;
}
.admin-select {
  width: 100%;
  padding: 13px 14px;
  height: 48px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font: 400 16px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1E293B;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2364748B' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
  box-sizing: border-box;
}
.admin-select:focus {
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212,175,55,0.1);
}
.admin-textarea {
  width: 100%;
  padding: 14px 14px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font: 400 16px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1E293B;
  outline: none;
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;
}
.admin-textarea:focus {
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212,175,55,0.1);
}
.admin-label {
  display: block;
  font: 500 13px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #94A3B8;
  margin-bottom: 8px;
}

/* ── FILTER BAR ── */
.admin-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #E2E8F0;
  flex-wrap: wrap;
}
.admin-filter-search {
  flex: 1;
  min-width: 200px;
}
.admin-filter-tabs {
  display: flex;
  gap: 0;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  overflow: hidden;
}
.admin-filter-tab {
  padding: 10px 14px;
  font: 500 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #94A3B8;
  cursor: pointer;
  background: transparent;
  border: none;
  border-right: 1px solid #E2E8F0;
  transition: all 0.2s;
  white-space: nowrap;
}
.admin-filter-tab:last-child { border-right: none; }
.admin-filter-tab:hover { color: #64748B; }
.admin-filter-tab.active {
  background: rgba(212,175,55,0.1);
  color: #d4af37;
}

/* ── PRODUCT IMAGE ── */
.admin-product-img {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: #F1F5F9;
  overflow: hidden;
  flex-shrink: 0;
}
.admin-product-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.admin-product-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #94A3B8;
}
.admin-product-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ── PANELS / CARDS ── */
.admin-panel {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.admin-panel-title {
  font: 500 15px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1E293B;
  margin-bottom: 20px;
}
.admin-panel-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #FAFAF8;
}
.admin-panel-row:last-child { border-bottom: none; }

/* ── STEPPER ── */
.admin-stepper {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 32px;
  padding: 0 20px;
}
.admin-step {
  display: flex;
  align-items: center;
  gap: 10px;
  font: 400 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #94A3B8;
  white-space: nowrap;
}
.admin-step.active { color: #d4af37; }
.admin-step.done { color: #10B981; }
.admin-step-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font: 600 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  flex-shrink: 0;
}
.admin-step.active .admin-step-num {
  border-color: #d4af37;
  background: rgba(212,175,55,0.1);
  color: #d4af37;
}
.admin-step.done .admin-step-num {
  border-color: #10B981;
  background: rgba(16,185,129,0.1);
  color: #10B981;
}
.admin-step-line {
  flex: 1;
  height: 1px;
  background: #E2E8F0;
  margin: 0 12px;
  min-width: 20px;
}

/* ── RECEIVE LIST ITEM ── */
.admin-receive-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  background: #FAFAF8;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  margin-bottom: 8px;
}
.admin-receive-item-info {
  flex: 1;
  min-width: 0;
}
.admin-receive-item-name {
  font: 500 15px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1E293B;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.admin-receive-item-sku {
  font: 400 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #94A3B8;
}
.admin-receive-qty {
  display: flex;
  align-items: center;
  gap: 10px;
}
.admin-receive-qty-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  color: #1E293B;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.admin-receive-qty-btn:hover,
.admin-receive-qty-btn:active {
  border-color: #d4af37;
  color: #d4af37;
}
.admin-receive-qty-input {
  width: 56px;
  text-align: center;
  padding: 10px 4px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font: 600 16px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1E293B;
  outline: none;
}
.admin-receive-qty-input:focus {
  border-color: #D4AF37;
}
.admin-receive-remove {
  background: none;
  border: none;
  color: #94A3B8;
  cursor: pointer;
  padding: 4px;
  font-size: 18px;
  transition: color 0.2s;
}
.admin-receive-remove:hover { color: #EF4444; }

/* ── TOAST ── */
.admin-toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}
.admin-toast {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-left: 4px solid #d4af37;
  border-radius: 8px;
  padding: 14px 20px;
  font: 400 15px/1.4 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1E293B;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  pointer-events: auto;
  animation: toastIn 0.3s cubic-bezier(.16,1,.3,1);
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 380px;
}
.admin-toast.success { border-left-color: #10B981; }
.admin-toast.error { border-left-color: #EF4444; }
.admin-toast-icon { font-size: 16px; flex-shrink: 0; }
@keyframes toastIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

/* ── DETAIL MODAL / DRAWER ── */
.admin-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 200;
  animation: fadeIn 0.2s;
}
.admin-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 520px;
  max-width: 100vw;
  background: #FFFFFF;
  box-shadow: -4px 0 24px rgba(0,0,0,0.12);
  z-index: 201;
  overflow-y: auto;
  animation: slideIn 0.3s cubic-bezier(.16,1,.3,1);
}
.admin-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #E2E8F0;
  position: sticky;
  top: 0;
  background: #FFFFFF;
  z-index: 1;
}
.admin-drawer-title {
  font: 500 16px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1E293B;
}
.admin-drawer-close {
  background: none;
  border: none;
  color: #94A3B8;
  cursor: pointer;
  font-size: 22px;
  padding: 4px;
  transition: color 0.2s;
}
.admin-drawer-close:hover { color: #1E293B; }
.admin-drawer-body {
  padding: 24px;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

/* ── PAGE HEADER ── */
.admin-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}
.admin-page-title {
  font: 600 22px/1.2 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1E293B;
}
.admin-page-subtitle {
  font: 400 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #94A3B8;
  margin-top: 4px;
}

/* ── ALERT ROW ── */
.admin-alert-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid #FAFAF8;
}
.admin-alert-row:last-child { border-bottom: none; }
.admin-alert-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.admin-alert-dot.red { background: #EF4444; }
.admin-alert-dot.yellow { background: #F59E0B; }
.admin-alert-info { flex: 1; }
.admin-alert-name {
  font: 500 15px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1E293B;
}
.admin-alert-meta {
  font: 400 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #94A3B8;
  margin-top: 2px;
}

/* ── EMPTY STATE ── */
.admin-empty {
  text-align: center;
  padding: 48px 24px;
  color: #94A3B8;
}
.admin-empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.5;
}
.admin-empty-text {
  font: 400 15px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ── CONFIRMATION ── */
.admin-confirm {
  text-align: center;
  padding: 32px 24px;
}
.admin-confirm-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(16,185,129,0.1);
  color: #10B981;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 16px;
}
.admin-confirm-title {
  font: 500 18px/1.2 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  margin-bottom: 8px;
  color: #1E293B;
}
.admin-confirm-sub {
  font: 400 15px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #64748B;
  margin-bottom: 24px;
}

/* ── TWO COL GRID ── */
.admin-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.admin-grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

/* ── LOADING SPINNER ── */
.admin-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(212,175,55,0.2);
  border-top-color: #d4af37;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .admin-stats { grid-template-columns: repeat(2, 1fr); }
  .admin-grid-2 { grid-template-columns: 1fr; }
  .admin-drawer { width: 100%; }
}
@media (max-width: 860px) {
  .admin-sidebar {
    transform: translateX(-260px);
  }
  .admin-sidebar.open {
    transform: translateX(0);
    box-shadow: 4px 0 24px rgba(0,0,0,0.2);
  }
  .admin-main {
    margin-left: 0;
  }
  .admin-hamburger { display: block; }
  .admin-content { padding: 20px 16px 48px; }
  .admin-topbar { padding: 0 16px; }
  .admin-stats { grid-template-columns: 1fr 1fr; }
  .admin-table td { font-size: 14px; }
  .admin-table th, .admin-table td { padding: 10px 10px; }
  .admin-stepper { flex-wrap: wrap; gap: 8px; padding: 0; }
  .admin-step-line { display: none; }
  .admin-filters { flex-direction: column; align-items: stretch; }
  .admin-filter-search { min-width: unset; }
  .admin-page-header { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 560px) {
  .admin-stats { grid-template-columns: 1fr; }
  .admin-grid-3 { grid-template-columns: 1fr; }
}
`;
