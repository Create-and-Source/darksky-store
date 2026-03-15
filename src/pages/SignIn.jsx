import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ROLES = [
  { emoji: '\u{1F3DB}\uFE0F', title: 'Executive Director', dept: 'Leadership', desc: 'Full platform access. Strategic overview, all departments.', role: 'executive_director', redirect: '/admin' },
  { emoji: '\u{1F4B0}', title: 'Treasurer', dept: 'Finance', desc: 'Financial reports, donations, payroll, QuickBooks.', role: 'treasurer', redirect: '/admin' },
  { emoji: '\u{1F4CA}', title: 'Board Member', dept: 'Board of Directors', desc: 'Board meeting dashboard. Fundraising and KPIs.', role: 'board', redirect: '/admin/board-meeting' },
  { emoji: '\u{1F6CD}\uFE0F', title: 'Gift Shop Manager', dept: 'Gift Shop Operations', desc: 'Orders, inventory, receiving, transfers, POS.', role: 'shop_manager', redirect: '/admin' },
  { emoji: '\u{1F3EA}', title: 'Gift Shop Staff', dept: 'Gift Shop', desc: 'Ring up sales, receive shipments, check stock.', role: 'shop_staff', redirect: '/admin' },
  { emoji: '\u{1F39F}\uFE0F', title: 'Visitor Services', dept: 'Front Desk', desc: 'Visitor counts, ticket scanning, daily operations.', role: 'visitor_services', redirect: '/admin' },
  { emoji: '\u{1F52D}', title: 'Education Director', dept: 'Education & Programs', desc: 'Events, field trips, school programs, curriculum.', role: 'education_director', redirect: '/admin' },
  { emoji: '\u{1F4F1}', title: 'Social Media Manager', dept: 'Marketing', desc: 'Social posts, email campaigns, design studio.', role: 'social_media', redirect: '/admin' },
  { emoji: '\u{1F465}', title: 'Volunteer Coordinator', dept: 'Volunteer Management', desc: 'Roster, scheduling, hours, certifications.', role: 'volunteer_coordinator', redirect: '/admin' },
  { emoji: '\u{1F64B}', title: 'Volunteer', dept: 'Volunteer Portal', desc: 'My schedule, log hours, training progress.', role: 'volunteer', redirect: '/volunteer-portal' },
  { emoji: '\u{1F4B5}', title: 'Payroll / HR', dept: 'Human Resources', desc: 'Staff roster, timesheets, payroll export.', role: 'payroll', redirect: '/admin' },
  { emoji: '\u2B50', title: 'Member', dept: 'Member Portal', desc: 'Membership card, benefits, discounts, events.', role: 'member', redirect: '/member-portal' },
];

const ROLE_MAP = {
  executive_director: 'manager',
  treasurer: 'manager',
  board: 'manager',
  shop_manager: 'manager',
  shop_staff: 'staff',
  visitor_services: 'staff',
  education_director: 'manager',
  social_media: 'staff',
  volunteer_coordinator: 'manager',
  volunteer: 'volunteer',
  payroll: 'manager',
  member: 'member',
};

const NAME_MAP = {
  executive_director: 'Dr. Jay',
  treasurer: 'Finance',
  board: 'Board',
  shop_manager: 'Nancy',
  shop_staff: 'Josie',
  visitor_services: 'Sam',
  education_director: 'Maria',
  social_media: 'Alex',
  volunteer_coordinator: 'Jordan',
  volunteer: 'Carlos',
  payroll: 'HR Admin',
  member: 'Member',
};

export default function SignIn() {
  const navigate = useNavigate();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const handleSelect = (r) => {
    const storeRole = ROLE_MAP[r.role] || 'staff'; // for store-side edit mode
    const name = NAME_MAP[r.role] || r.title;
    localStorage.setItem('ds_auth_user', JSON.stringify({ role: r.role, title: r.title, dept: r.dept }));
    localStorage.setItem('ds_user_role', storeRole);
    localStorage.setItem('ds_user_name', name);
    localStorage.setItem('ds_admin_role', r.role); // use actual role key for admin sidebar
    navigate(r.redirect);
  };

  return (
    <>
      <style>{`
        .si-page { min-height: 100vh; background: #FAFAF8; color: #1A1A2E; padding: 60px 24px; display: flex; flex-direction: column; align-items: center; }
        .si-star { font-size: 36px; color: #C5A55A; margin-bottom: 12px; }
        .si-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 600; text-align: center; margin: 0 0 8px; color: #1A1A2E; }
        .si-subtitle { font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #C5A55A; margin: 0 0 48px; }
        .si-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; max-width: 960px; width: 100%; }
        .si-card { background: #FFFFFF; border: 1px solid #E8E5DF; border-radius: 10px; padding: 24px; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .si-card:hover, .si-card.hovered { border-color: #C5A55A; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .si-emoji { font-size: 32px; margin-bottom: 12px; display: block; }
        .si-role { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; font-weight: 700; color: #1A1A2E; margin: 0 0 4px; }
        .si-dept { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #C5A55A; margin: 0 0 8px; }
        .si-desc { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; color: #7C7B76; margin: 0; line-height: 1.5; }
        .si-footer { margin-top: 48px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .si-link { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; color: #7C7B76; text-decoration: none; transition: color 0.2s; }
        .si-link:hover { color: #C5A55A; }
        @media (max-width: 860px) { .si-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 600px) { .si-grid { grid-template-columns: repeat(2, 1fr); } .si-card { padding: 16px; } .si-role { font-size: 15px; } .si-desc { font-size: 12px; } }
      `}</style>
      <div className="si-page">
        <div className="si-star">{'\u2726'}</div>
        <h1 className="si-title">International Dark Sky Discovery Center</h1>
        <p className="si-subtitle">Platform Login</p>
        <div className="si-grid">
          {ROLES.map((r, i) => (
            <div
              key={r.role}
              className={`si-card${hoveredIdx === i ? ' hovered' : ''}`}
              onClick={() => handleSelect(r)}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <span className="si-emoji">{r.emoji}</span>
              <p className="si-role">{r.title}</p>
              <p className="si-dept">{r.dept}</p>
              <p className="si-desc">{r.desc}</p>
            </div>
          ))}
        </div>
        <div className="si-footer">
          <a href="/membership" className="si-link">Not a member? Join today {'\u2192'}</a>
          <a href="/" className="si-link">Visit our website {'\u2192'}</a>
        </div>
      </div>
    </>
  );
}
