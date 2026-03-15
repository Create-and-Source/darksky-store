import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMembers, getOrders, getDonations, getEvents, formatPrice, subscribe,
} from '../admin/data/store';

const FONT = "'Playfair Display', serif";
const BODY = "'Plus Jakarta Sans', sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', monospace";

function QRCode() {
  // Deterministic 8x8 grid for visual QR look
  const cells = useMemo(() => {
    const seed = [1,0,1,1,0,1,0,0, 0,1,0,0,1,0,1,1, 1,1,1,0,0,1,1,0, 0,0,1,1,1,0,0,1, 1,0,0,1,0,1,1,0, 0,1,1,0,1,1,0,1, 1,0,1,1,0,0,1,0, 0,1,0,0,1,1,0,1];
    return seed;
  }, []);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2, width: 64, height: 64 }}>
      {cells.map((c, i) => (
        <div key={i} style={{ background: c ? '#F0EDE6' : '#04040c', borderRadius: 1 }} />
      ))}
    </div>
  );
}

const BENEFITS = [
  { name: 'Unlimited Admission', detail: 'Active', color: '#4ADE80', icon: '\u2713' },
  { name: '15% Gift Shop Discount', detail: 'Code: EXPLORER15', color: '#D4AF37', icon: '%' },
  { name: 'Free Star Party Access', detail: 'Next event included', color: '#D4AF37', icon: '\u2606' },
  { name: '2 Guest Passes', detail: '2 remaining', color: '#FBBF24', icon: '\u{1F465}' },
  { name: 'Monthly Newsletter', detail: 'Subscribed', color: '#4ADE80', icon: '\u2709' },
];

export default function MemberPortal() {
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => subscribe(refresh), [refresh]);

  const events = getEvents();
  const orders = getOrders();

  const futureEvents = events
    .filter(e => e.status === 'Published' && new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);

  const recentOrders = orders.slice(0, 5);

  const handleSignOut = () => {
    localStorage.removeItem('ds_auth_user');
    localStorage.removeItem('ds_user_role');
    localStorage.removeItem('ds_user_name');
    localStorage.removeItem('ds_admin_role');
    navigate('/signin');
  };

  return (
    <>
      <style>{`
        .mp-page { min-height: 100vh; background: #04040c; color: #F0EDE6; }
        .mp-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 32px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .mp-logo { font-family: ${FONT}; font-size: 22px; color: #F0EDE6; display: flex; align-items: center; gap: 12px; }
        .mp-signout { font-family: ${BODY}; font-size: 13px; color: #908D9A; background: none; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 6px 16px; cursor: pointer; transition: all 0.2s; }
        .mp-signout:hover { color: #D4AF37; border-color: #D4AF37; }
        .mp-body { max-width: 960px; margin: 0 auto; padding: 40px 24px 80px; }
        .mp-section { margin-bottom: 48px; }
        .mp-label { font-family: ${MONO}; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #D4AF37; margin-bottom: 8px; }
        .mp-title { font-family: ${FONT}; font-size: 24px; font-weight: 600; margin: 0 0 20px; }

        /* Membership Card */
        .mp-card-wrap { display: flex; justify-content: center; margin-bottom: 32px; }
        .mp-card { width: 100%; max-width: 600px; height: 350px; border-radius: 16px; border: 1px solid rgba(212,175,55,0.3); background: linear-gradient(135deg, #0a0a1a 0%, #0f0f2e 50%, #0a0a1a 100%); position: relative; overflow: hidden; padding: 40px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 8px 40px rgba(212,175,55,0.08); }
        .mp-card-dots { position: absolute; inset: 0; background-image: radial-gradient(rgba(212,175,55,0.12) 1px, transparent 1px); background-size: 24px 24px; pointer-events: none; }
        .mp-card-top { position: relative; z-index: 1; }
        .mp-card-org { font-family: ${MONO}; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #D4AF37; margin-bottom: 24px; }
        .mp-card-tier { font-family: ${FONT}; font-size: 32px; font-weight: 700; color: #F0EDE6; }
        .mp-card-bottom { position: relative; z-index: 1; display: flex; align-items: flex-end; justify-content: space-between; }
        .mp-card-since { font-family: ${BODY}; font-size: 13px; color: #908D9A; margin-bottom: 4px; }
        .mp-card-id { font-family: ${MONO}; font-size: 12px; color: #D4AF37; }

        /* Benefits */
        .mp-benefits { display: flex; flex-direction: column; gap: 10px; }
        .mp-benefit { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 16px 20px; display: flex; align-items: center; gap: 16px; }
        .mp-benefit-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; flex-shrink: 0; }
        .mp-benefit-name { font-family: ${BODY}; font-size: 15px; font-weight: 600; margin: 0; }
        .mp-benefit-detail { font-family: ${MONO}; font-size: 12px; margin: 2px 0 0; }

        /* Events */
        .mp-events { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .mp-event { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px; }
        .mp-event h4 { font-family: ${BODY}; font-size: 15px; font-weight: 600; margin: 0 0 6px; }
        .mp-event-meta { font-family: ${MONO}; font-size: 11px; color: #908D9A; margin-bottom: 10px; }
        .mp-event-price { font-family: ${MONO}; font-size: 12px; }
        .mp-event-price .member { color: #4ADE80; font-weight: 700; }
        .mp-btn { font-family: ${BODY}; font-size: 13px; font-weight: 600; color: #04040c; background: linear-gradient(135deg, #D4AF37, #E5C76B); border: none; border-radius: 6px; padding: 8px 20px; cursor: pointer; transition: opacity 0.2s; margin-top: 10px; }
        .mp-btn:hover { opacity: 0.85; }

        /* Orders */
        .mp-table { width: 100%; border-collapse: collapse; }
        .mp-table th { font-family: ${MONO}; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #908D9A; text-align: left; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .mp-table td { font-family: ${BODY}; font-size: 13px; color: #F0EDE6; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }

        /* Quick Links */
        .mp-links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .mp-link-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 24px; text-align: center; text-decoration: none; color: #F0EDE6; transition: border-color 0.2s; display: block; }
        .mp-link-card:hover { border-color: #D4AF37; }
        .mp-link-icon { font-size: 28px; margin-bottom: 8px; }
        .mp-link-text { font-family: ${BODY}; font-size: 14px; font-weight: 600; }

        @media (max-width: 600px) {
          .mp-card { height: auto; min-height: 280px; padding: 28px; }
          .mp-card-tier { font-size: 24px; }
          .mp-events { grid-template-columns: 1fr; }
          .mp-links { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="mp-page">
        <div className="mp-header">
          <div className="mp-logo"><span style={{ color: '#D4AF37' }}>{'\u2726'}</span> Member Portal</div>
          <button className="mp-signout" onClick={handleSignOut}>Sign Out</button>
        </div>

        <div className="mp-body">
          {/* Membership Card */}
          <div className="mp-section">
            <div className="mp-label">Your Membership</div>
            <h2 className="mp-title">Membership Card</h2>
            <div className="mp-card-wrap">
              <div className="mp-card">
                <div className="mp-card-dots" />
                <div className="mp-card-top">
                  <div className="mp-card-org">{'\u2726'} IDSDC</div>
                  <div className="mp-card-tier">Explorer Member</div>
                </div>
                <div className="mp-card-bottom">
                  <div>
                    <div className="mp-card-since">Member Since March 2026</div>
                    <div className="mp-card-id">ID: IDSDC-2026-0042</div>
                  </div>
                  <QRCode />
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mp-section">
            <div className="mp-label">Perks</div>
            <h2 className="mp-title">My Benefits</h2>
            <div className="mp-benefits">
              {BENEFITS.map(b => (
                <div className="mp-benefit" key={b.name}>
                  <div className="mp-benefit-icon" style={{ background: b.color + '18', color: b.color }}>{b.icon}</div>
                  <div>
                    <p className="mp-benefit-name">{b.name}</p>
                    <p className="mp-benefit-detail" style={{ color: b.color }}>{b.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Events */}
          <div className="mp-section">
            <div className="mp-label">Events</div>
            <h2 className="mp-title">My Events</h2>
            <div className="mp-events">
              {futureEvents.length === 0 && <p style={{ color: '#908D9A', fontFamily: BODY }}>No upcoming events.</p>}
              {futureEvents.map(ev => (
                <div className="mp-event" key={ev.id}>
                  <h4>{ev.title}</h4>
                  <div className="mp-event-meta">
                    {new Date(ev.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} {'\u00B7'} {ev.time}
                  </div>
                  <div className="mp-event-price">
                    {ev.memberFree ? (
                      <span className="member">FREE for members</span>
                    ) : ev.price ? (
                      <><span style={{ textDecoration: 'line-through', color: '#5C5870' }}>{formatPrice(ev.price)}</span> <span className="member">{formatPrice(Math.round(ev.price * 0.85))} member</span></>
                    ) : (
                      <span style={{ color: '#4ADE80' }}>Free</span>
                    )}
                  </div>
                  <button className="mp-btn" onClick={() => navigate('/events')}>Reserve Spot</button>
                </div>
              ))}
            </div>
          </div>

          {/* Orders */}
          <div className="mp-section">
            <div className="mp-label">Shopping</div>
            <h2 className="mp-title">My Orders</h2>
            {recentOrders.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 32, textAlign: 'center' }}>
                <p style={{ fontFamily: BODY, fontSize: 15, color: '#908D9A', margin: '0 0 12px' }}>No orders yet.</p>
                <button className="mp-btn" onClick={() => navigate('/shop')}>Shop Now</button>
              </div>
            ) : (
              <table className="mp-table">
                <thead>
                  <tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o.id}>
                      <td style={{ color: '#D4AF37', fontFamily: MONO, fontSize: 12 }}>{o.id}</td>
                      <td>{o.date}</td>
                      <td>{(o.items || []).length}</td>
                      <td style={{ fontWeight: 600 }}>{formatPrice(o.total || 0)}</td>
                      <td><span style={{
                        fontFamily: MONO, fontSize: 11,
                        color: o.status === 'Delivered' ? '#4ADE80' : o.status === 'Shipped' ? '#D4AF37' : '#908D9A',
                      }}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Quick Links */}
          <div className="mp-section">
            <div className="mp-label">Explore</div>
            <h2 className="mp-title">Quick Links</h2>
            <div className="mp-links">
              <a href="/events" className="mp-link-card">
                <div className="mp-link-icon">{'\u{1F39F}\uFE0F'}</div>
                <div className="mp-link-text">Events</div>
              </a>
              <a href="/shop" className="mp-link-card">
                <div className="mp-link-icon">{'\u{1F6CD}\uFE0F'}</div>
                <div className="mp-link-text">Gift Shop</div>
              </a>
              <a href="/membership" className="mp-link-card">
                <div className="mp-link-icon">{'\u2B50'}</div>
                <div className="mp-link-text">Upgrade Membership</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
