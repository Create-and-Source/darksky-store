import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_ROLES = [
  { emoji: '\u{1F3DB}\uFE0F', title: 'Executive Director', dept: 'Leadership', role: 'executive_director', redirect: '/admin' },
  { emoji: '\u{1F4B0}', title: 'Treasurer', dept: 'Finance', role: 'treasurer', redirect: '/admin' },
  { emoji: '\u{1F4CA}', title: 'Board Member', dept: 'Board of Directors', role: 'board', redirect: '/admin/board-meeting' },
  { emoji: '\u{1F6CD}\uFE0F', title: 'Gift Shop Manager', dept: 'Gift Shop Operations', role: 'shop_manager', redirect: '/admin' },
  { emoji: '\u{1F3EA}', title: 'Gift Shop Staff', dept: 'Gift Shop', role: 'shop_staff', redirect: '/admin' },
  { emoji: '\u{1F39F}\uFE0F', title: 'Visitor Services', dept: 'Front Desk', role: 'visitor_services', redirect: '/admin' },
  { emoji: '\u{1F52D}', title: 'Education Director', dept: 'Education & Programs', role: 'education_director', redirect: '/admin' },
  { emoji: '\u{1F4F1}', title: 'Social Media Manager', dept: 'Marketing', role: 'social_media', redirect: '/admin' },
  { emoji: '\u{1F465}', title: 'Volunteer Coordinator', dept: 'Volunteer Management', role: 'volunteer_coordinator', redirect: '/admin' },
  { emoji: '\u{1F4B5}', title: 'Payroll / HR', dept: 'Human Resources', role: 'payroll', redirect: '/admin' },
];

const PORTALS = [
  { emoji: '\u{1F64B}', title: 'Volunteer Portal', desc: 'My schedule, log hours, training progress.', role: 'volunteer', redirect: '/volunteer-portal' },
  { emoji: '\u2B50', title: 'Member Portal', desc: 'Membership card, benefits, discounts, events.', role: 'member', redirect: '/member-portal' },
  { emoji: '\u{1F3EB}', title: 'School Portal', desc: 'Check field trip status, prep info, reviews.', role: 'school', redirect: '/school-portal' },
];

const ROLE_MAP = {
  executive_director: 'manager', treasurer: 'manager', board: 'manager',
  shop_manager: 'manager', shop_staff: 'staff', visitor_services: 'staff',
  education_director: 'manager', social_media: 'staff',
  volunteer_coordinator: 'manager', payroll: 'manager',
  volunteer: 'volunteer', member: 'member',
};

const NAME_MAP = {
  executive_director: 'Dr. J', treasurer: 'Nancy', board: 'Board',
  shop_manager: 'Josi', shop_staff: 'Staff', visitor_services: 'Sam',
  education_director: 'Maria', social_media: 'Alex',
  volunteer_coordinator: 'Jordan', payroll: 'HR Admin',
  volunteer: 'Carlos', member: 'Member',
};

export default function SignIn() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  const handleSelect = (r) => {
    const storeRole = ROLE_MAP[r.role] || 'staff';
    const name = NAME_MAP[r.role] || r.title;
    localStorage.setItem('ds_auth_user', JSON.stringify({ role: r.role, title: r.title, dept: r.dept }));
    localStorage.setItem('ds_user_role', storeRole);
    localStorage.setItem('ds_user_name', name);
    localStorage.setItem('ds_admin_role', r.role);
    navigate(r.redirect);
  };

  return (
    <>
      <style>{`
        .si-page {
          min-height: 100vh; background: #FAFAF8; color: #1A1A2E;
          padding: 48px 24px; display: flex; flex-direction: column; align-items: center;
        }
        .si-star { font-size: 32px; color: #C5A55A; margin-bottom: 10px; }
        .si-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 600; text-align: center; margin: 0 0 6px; color: #1A1A2E; }
        .si-subtitle { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #C5A55A; margin: 0 0 40px; }
        .si-layout { display: grid; grid-template-columns: 1fr 320px; gap: 40px; max-width: 1060px; width: 100%; align-items: start; }
        .si-section-label {
          font: 600 11px 'JetBrains Mono', monospace; letter-spacing: 2px; text-transform: uppercase;
          color: #C5A55A; margin: 0 0 16px; padding-bottom: 12px;
          border-bottom: 1px solid #E8E5DF;
        }
        .si-admin-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .si-card {
          background: #FFFFFF; border: 1px solid #E8E5DF; border-radius: 10px;
          padding: 18px 16px; cursor: pointer; transition: all 0.25s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; align-items: center; gap: 14px;
        }
        .si-card:hover, .si-card.hovered { border-color: #C5A55A; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .si-card-emoji { font-size: 24px; flex-shrink: 0; }
        .si-card-role { font: 600 14px 'Plus Jakarta Sans', sans-serif; color: #1A1A2E; margin: 0 0 2px; }
        .si-card-dept { font: 400 11px 'JetBrains Mono', monospace; color: #C5A55A; margin: 0; }
        .si-portal-list { display: flex; flex-direction: column; gap: 10px; }
        .si-portal {
          background: #FFFFFF; border: 1px solid #E8E5DF; border-radius: 10px;
          padding: 20px; cursor: pointer; transition: all 0.25s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .si-portal:hover { border-color: #C5A55A; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .si-portal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
        .si-portal-emoji { font-size: 22px; }
        .si-portal-title { font: 600 15px 'Plus Jakarta Sans', sans-serif; color: #1A1A2E; }
        .si-portal-desc { font: 400 13px 'Plus Jakarta Sans', sans-serif; color: #7C7B76; line-height: 1.5; margin: 0; }
        .si-portal-arrow { font: 400 14px 'Plus Jakarta Sans', sans-serif; color: #C5A55A; margin-top: 10px; display: block; }
        .si-footer { margin-top: 40px; text-align: center; }
        .si-link { font: 400 14px 'Plus Jakarta Sans', sans-serif; color: #7C7B76; text-decoration: none; transition: color 0.2s; }
        .si-link:hover { color: #C5A55A; }
        @media (max-width: 768px) {
          .si-layout { grid-template-columns: 1fr; gap: 32px; }
          .si-admin-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .si-admin-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="si-page">
        <div className="si-star">{'\u2726'}</div>
        <h1 className="si-title">International Dark Sky Discovery Center</h1>
        <p className="si-subtitle">MuseumOS Platform</p>

        <div className="si-layout">
          {/* Left — Admin Roles */}
          <div>
            <div className="si-section-label">Admin Dashboard</div>
            <div className="si-admin-grid">
              {ADMIN_ROLES.map((r) => (
                <div
                  key={r.role}
                  className={`si-card${hovered === r.role ? ' hovered' : ''}`}
                  onClick={() => handleSelect(r)}
                  onMouseEnter={() => setHovered(r.role)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span className="si-card-emoji">{r.emoji}</span>
                  <div>
                    <p className="si-card-role">{r.title}</p>
                    <p className="si-card-dept">{r.dept}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Portals */}
          <div>
            <div className="si-section-label">Portals</div>
            <div className="si-portal-list">
              {PORTALS.map((p) => (
                <div
                  key={p.role}
                  className="si-portal"
                  onClick={() => handleSelect(p)}
                  onMouseEnter={() => setHovered(p.role)}
                  onMouseLeave={() => setHovered(null)}
                  style={hovered === p.role ? { borderColor: '#C5A55A', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } : {}}
                >
                  <div className="si-portal-header">
                    <span className="si-portal-emoji">{p.emoji}</span>
                    <span className="si-portal-title">{p.title}</span>
                  </div>
                  <p className="si-portal-desc">{p.desc}</p>
                  <span className="si-portal-arrow">Open portal {'\u2192'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="si-footer">
          <a href="/" className="si-link">Visit our website {'\u2192'}</a>
        </div>
      </div>
    </>
  );
}
