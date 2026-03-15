import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getOrders, getMembers, getEvents, getDonations, getFundraising, formatPrice,
} from '../data/store';

const FONT = "'Playfair Display', serif";
const BODY = "'Plus Jakarta Sans', sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', monospace";

function MetricCard({ label, value, sub }) {
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E8E5DF', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      borderRadius: 8, padding: '32px 28px', flex: 1, minWidth: 200,
    }}>
      <div style={{ fontFamily: MONO, fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#D4AF37', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 700, color: '#1A1A2E' }}>{value}</div>
      {sub && <div style={{ fontFamily: BODY, fontSize: 13, color: '#7C7B76', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function BoardMeeting() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const orders = getOrders();
    const members = getMembers();
    const events = getEvents();
    const donations = getDonations();
    const fundraising = getFundraising();

    const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
    const publishedFutureEvents = events.filter(e => e.status === 'Published' && new Date(e.date) >= new Date());
    const totalDonations = donations.reduce((s, d) => s + (d.amount || 0), 0);

    // Top products by frequency
    const prodCount = {};
    orders.forEach(o => (o.items || []).forEach(item => {
      prodCount[item.name] = (prodCount[item.name] || 0) + (item.qty || 1);
    }));
    const topProducts = Object.entries(prodCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    setData({
      totalRevenue, members, publishedFutureEvents, donations, fundraising,
      totalDonations, topProducts,
    });
  }, []);

  if (!data) return null;

  const { fundraising } = data;
  const raisedPct = fundraising.goal > 0 ? Math.min(100, (fundraising.raised / fundraising.goal) * 100) : 0;
  const top5Donations = data.donations.slice(0, 5);

  const revenueStreams = [
    { name: 'Gift Shop Sales', pct: 42 },
    { name: 'Memberships', pct: 18 },
    { name: 'Event Tickets', pct: 15 },
    { name: 'Donations & Grants', pct: 25 },
  ];

  return (
    <>
      <style>{`
        .bm-page { min-height: 100vh; background: #FAFAF8; color: #1A1A2E; }
        .bm-topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(255,255,255,0.97); backdrop-filter: blur(12px); border-bottom: 1px solid #E8E5DF; display: flex; align-items: center; justify-content: space-between; padding: 12px 32px; height: 56px; }
        .bm-logo { font-family: ${FONT}; font-size: 18px; color: #C5A55A; }
        .bm-center { font-family: ${MONO}; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #C5A55A; }
        .bm-exit { font-family: ${BODY}; font-size: 13px; color: #7C7B76; background: none; border: 1px solid #E8E5DF; border-radius: 6px; padding: 6px 16px; cursor: pointer; transition: all 0.2s; }
        .bm-exit:hover { color: #C5A55A; border-color: #C5A55A; }
        .bm-body { padding: 80px 32px 60px; max-width: 1100px; margin: 0 auto; }
        .bm-metrics { display: flex; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
        .bm-progress-wrap { background: #FFFFFF; border: 1px solid #E8E5DF; border-radius: 10px; padding: 28px; margin-bottom: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .bm-progress-label { font-family: ${MONO}; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #C5A55A; margin-bottom: 16px; }
        .bm-bar-bg { background: #E8E5DF; border-radius: 6px; height: 20px; overflow: hidden; margin-bottom: 12px; }
        .bm-bar-fill { height: 100%; background: linear-gradient(90deg, #C5A55A, #D4AF37); border-radius: 6px; transition: width 1s ease; }
        .bm-bar-labels { display: flex; justify-content: space-between; font-family: ${BODY}; font-size: 14px; color: #1A1A2E; }
        .bm-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
        .bm-card { background: #FFFFFF; border: 1px solid #E8E5DF; border-radius: 10px; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .bm-card-title { font-family: ${MONO}; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #C5A55A; margin-bottom: 16px; }
        .bm-table { width: 100%; border-collapse: collapse; }
        .bm-table th { font-family: ${MONO}; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #7C7B76; text-align: left; padding: 8px 0; border-bottom: 1px solid #E8E5DF; }
        .bm-table td { font-family: ${BODY}; font-size: 14px; color: #1A1A2E; padding: 10px 0; border-bottom: 1px solid #F0EDE8; }
        .bm-don-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #F0EDE8; }
        .bm-don-name { font-family: ${BODY}; font-size: 14px; color: #1A1A2E; }
        .bm-don-amt { font-family: ${FONT}; font-size: 16px; color: #C5A55A; }
        .bm-footer { text-align: center; font-family: ${MONO}; font-size: 11px; color: #B5B3AD; padding: 40px 0 24px; }
        @media (max-width: 768px) { .bm-cols { grid-template-columns: 1fr; } .bm-metrics { flex-direction: column; } }
      `}</style>
      <div className="bm-page">
        <div className="bm-topbar">
          <div className="bm-logo">{'\u2726'} IDSDC</div>
          <div className="bm-center">Board Report — March 2026</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: '#7C7B76' }}>
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <button className="bm-exit" onClick={() => navigate('/admin')}>Exit {'\u2192'}</button>
          </div>
        </div>

        <div className="bm-body">
          <div className="bm-metrics">
            <MetricCard label="Gift Shop Revenue" value={formatPrice(data.totalRevenue)} sub={`${getOrders().length} total orders`} />
            <MetricCard label="Active Members" value={data.members.filter(m => m.status === 'Active').length} sub={`${data.members.length} total`} />
            <MetricCard label="Fundraising" value={formatPrice(fundraising.raised)} sub={`of ${formatPrice(fundraising.goal)} goal`} />
            <MetricCard label="Upcoming Events" value={data.publishedFutureEvents.length} sub="published events" />
          </div>

          <div className="bm-progress-wrap">
            <div className="bm-progress-label">Capital Campaign Progress</div>
            <div className="bm-bar-bg">
              <div className="bm-bar-fill" style={{ width: `${raisedPct}%` }} />
            </div>
            <div className="bm-bar-labels">
              <span style={{ color: '#D4AF37', fontWeight: 600 }}>{formatPrice(fundraising.raised)} raised</span>
              <span style={{ color: '#7C7B76' }}>{formatPrice(fundraising.goal)} goal</span>
            </div>
            <div style={{ marginTop: 20 }}>
              <div className="bm-card-title">Top Donations</div>
              {top5Donations.map(d => (
                <div className="bm-don-row" key={d.id}>
                  <span className="bm-don-name">{d.donor}</span>
                  <span className="bm-don-amt">{formatPrice(d.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bm-cols">
            <div className="bm-card">
              <div className="bm-card-title">Revenue Streams</div>
              <table className="bm-table">
                <thead>
                  <tr><th>Source</th><th style={{ textAlign: 'right' }}>Share</th></tr>
                </thead>
                <tbody>
                  {revenueStreams.map(r => (
                    <tr key={r.name}>
                      <td>{r.name}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ color: '#D4AF37', fontWeight: 600 }}>{r.pct}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bm-card">
              <div className="bm-card-title">Top Products</div>
              <table className="bm-table">
                <thead>
                  <tr><th>Product</th><th style={{ textAlign: 'right' }}>Sold</th></tr>
                </thead>
                <tbody>
                  {data.topProducts.length === 0 ? (
                    <tr><td colSpan={2} style={{ color: '#5C5870' }}>No order data</td></tr>
                  ) : data.topProducts.map(([name, qty]) => (
                    <tr key={name}>
                      <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</td>
                      <td style={{ textAlign: 'right', color: '#D4AF37', fontWeight: 600 }}>{qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bm-footer">Prepared by Create & Source {'\u00B7'} MuseumOS Platform</div>
        </div>
      </div>
    </>
  );
}
