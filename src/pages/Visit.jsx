import { useState, useEffect, useRef } from 'react';
import { getAdmissionProducts, addTicketOrder, lookupMemberByEmail, getMemberTicketPrice, formatPrice, subscribe } from '../admin/data/store';

/* ── Reveal on scroll ── */
function RevealSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('vis'); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

/* ── Helpers ── */
const tomorrow = () => {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};
const fmtDate = (iso) => {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};

/* ── Styles ── */
const S = {
  page: { background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  hero: { position: 'relative', minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', overflow: 'hidden' },
  heroImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(4,4,12,0.5), rgba(4,4,12,0.85))' },
  heroContent: { position: 'relative', zIndex: 2, padding: '80px 24px 60px' },
  heroTitle: { fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, color: 'var(--text)', margin: 0, lineHeight: 1.2 },
  heroSub: { fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: 'var(--text2)', letterSpacing: '0.08em', marginTop: 16 },
  body: { maxWidth: 1120, margin: '0 auto', padding: '48px 24px 120px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, alignItems: 'start' },
  label: { fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12, display: 'block' },
  dateInput: { width: '100%', padding: '12px 16px', background: 'var(--bg2, #0a0a1a)', border: '1px solid var(--border)', borderRadius: 'var(--r, 3px)', color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.95rem', outline: 'none' },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 400, color: 'var(--text)', margin: '0 0 16px' },
  card: { background: 'var(--bg2, #0a0a1a)', border: '1px solid var(--border)', borderRadius: 'var(--r, 3px)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  cardSmall: { background: 'var(--bg2, #0a0a1a)', border: '1px solid var(--border)', borderRadius: 'var(--r, 3px)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  cardName: { fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)' },
  cardAge: { fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.05em', marginTop: 2 },
  cardDesc: { fontSize: '0.8rem', color: 'var(--text2)', marginTop: 4 },
  cardPrice: { fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: 'var(--gold)', whiteSpace: 'nowrap' },
  memberPrice: { fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--text2)', marginTop: 2, whiteSpace: 'nowrap' },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg3, #12122a)', border: '1px solid var(--border)', borderRadius: 'var(--r, 3px)', color: 'var(--text)', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, transition: 'border-color 0.2s' },
  qtyVal: { fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', minWidth: 24, textAlign: 'center', color: 'var(--text)' },
  sidebar: { position: 'sticky', top: 96 },
  summary: { background: 'var(--bg2, #0a0a1a)', border: '1px solid var(--border)', borderRadius: 'var(--r, 3px)', padding: 24 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', fontSize: '0.85rem' },
  divider: { height: 1, background: 'var(--border)', margin: '12px 0' },
  input: { width: '100%', padding: '10px 14px', background: 'var(--bg3, #12122a)', border: '1px solid var(--border)', borderRadius: 'var(--r, 3px)', color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' },
  memberBadge: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 'var(--r, 3px)', padding: '8px 14px', fontSize: '0.8rem', color: '#4ADE80' },
  successBox: { textAlign: 'center', padding: '80px 24px', maxWidth: 560, margin: '0 auto' },
  successCode: { fontFamily: "'JetBrains Mono', monospace", fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, letterSpacing: '0.12em', background: 'linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: '24px 0 8px' },
  mobileBar: { position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bg2, #0a0a1a)', borderTop: '1px solid var(--border)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100 },
};

export default function Visit() {
  const [products, setProducts] = useState([]);
  const [visitDate, setVisitDate] = useState(tomorrow);
  const [quantities, setQuantities] = useState({});
  const [memberEmail, setMemberEmail] = useState('');
  const [member, setMember] = useState(null);
  const [memberSearched, setMemberSearched] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmed, setConfirmed] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const load = () => setProducts(getAdmissionProducts().filter(p => p.active).sort((a, b) => a.sortOrder - b.sortOrder));
    load();
    const unsub = subscribe(load);
    const checkMobile = () => setIsMobile(window.innerWidth <= 860);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => { unsub(); window.removeEventListener('resize', checkMobile); };
  }, []);

  const setQty = (id, delta) => {
    setQuantities(prev => {
      const cur = prev[id] || 0;
      const next = Math.max(0, cur + delta);
      return { ...prev, [id]: next };
    });
  };

  const getPrice = (product) => member ? getMemberTicketPrice(product, member) : product.price;

  const standard = products.filter(p => p.category === 'standard');
  const addons = products.filter(p => p.category === 'addon');
  const groups = products.filter(p => p.category === 'group');

  const selectedItems = products
    .filter(p => (quantities[p.id] || 0) > 0)
    .map(p => ({ ...p, qty: quantities[p.id], unitPrice: getPrice(p), lineTotal: quantities[p.id] * getPrice(p) }));

  const subtotal = selectedItems.reduce((s, i) => s + i.lineTotal, 0);
  const regularTotal = products
    .filter(p => (quantities[p.id] || 0) > 0)
    .reduce((s, p) => s + (quantities[p.id] * p.price), 0);
  const memberDiscount = member ? regularTotal - subtotal : 0;
  const total = subtotal;

  const canPurchase = name.trim() && email.trim() && selectedItems.length > 0;

  const handleMemberLookup = () => {
    const found = lookupMemberByEmail(memberEmail);
    setMember(found);
    setMemberSearched(true);
  };

  const handlePurchase = () => {
    const order = addTicketOrder({
      type: 'admission',
      channel: 'online',
      visitDate,
      items: selectedItems.map(i => ({ productId: i.id, name: i.name, qty: i.qty, price: i.unitPrice, lineTotal: i.lineTotal })),
      subtotal,
      discount: memberDiscount,
      tax: 0,
      total,
      customer: name.trim(),
      email: email.trim(),
      memberId: member?.id || null,
      memberTier: member?.tier || null,
      paymentMethod: 'card',
    });
    setConfirmed(order);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderMemberPriceHint = (product) => {
    if (member) return null;
    if (product.memberPrice === null || product.memberPrice === undefined) return null;
    if (product.memberPrice === product.price) return null;
    const label = product.memberPrice === 0 ? 'Members: Free' : `Members: ${formatPrice(product.memberPrice)}`;
    return <div style={S.memberPrice}>{label}</div>;
  };

  /* ── Ticket Card ── */
  const TicketCard = ({ product, compact }) => {
    const qty = quantities[product.id] || 0;
    const price = getPrice(product);
    const style = compact ? S.cardSmall : S.card;
    return (
      <div style={style}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={S.cardName}>{product.name}</div>
          {product.ageRange && <div style={S.cardAge}>{product.ageRange}</div>}
          {product.desc && <div style={S.cardDesc}>{product.desc}</div>}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={S.cardPrice}>{price === 0 ? 'Free' : formatPrice(price)}</div>
          {renderMemberPriceHint(product)}
        </div>
        <div style={S.qtyRow}>
          <button style={{ ...S.qtyBtn, opacity: qty === 0 ? 0.3 : 1 }} onClick={() => setQty(product.id, -1)} aria-label={`Remove one ${product.name}`}>-</button>
          <span style={S.qtyVal}>{qty}</span>
          <button style={S.qtyBtn} onClick={() => setQty(product.id, 1)} aria-label={`Add one ${product.name}`}>+</button>
        </div>
      </div>
    );
  };

  /* ── Success state ── */
  if (confirmed) {
    return (
      <div style={S.page} data-page="visit">
        <div style={S.successBox}>
          <RevealSection>
            <div style={{ ...S.label, textAlign: 'center', marginBottom: 24 }}>Confirmation</div>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ margin: '0 auto', display: 'block' }}>
              <circle cx="28" cy="28" r="27" stroke="#4ADE80" strokeWidth="2" />
              <path d="M17 28l8 8 14-14" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={S.successCode}>{confirmed.confirmationCode}</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 400, margin: '4px 0 24px', color: 'var(--text)' }}>Tickets Confirmed!</h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text2)', lineHeight: 1.8 }}>
              <div><strong style={{ color: 'var(--text)' }}>Visit Date:</strong> {fmtDate(confirmed.visitDate)}</div>
              <div><strong style={{ color: 'var(--text)' }}>Guest:</strong> {confirmed.customer}</div>
              <div style={{ marginTop: 16 }}>
                {(confirmed.items || []).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 320, margin: '4px auto' }}>
                    <span>{item.qty} x {item.name}</span>
                    <span style={{ color: 'var(--gold)', fontFamily: "'JetBrains Mono', monospace" }}>{formatPrice(item.lineTotal)}</span>
                  </div>
                ))}
                <div style={{ ...S.divider, maxWidth: 320, margin: '12px auto' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 320, margin: '0 auto', fontWeight: 600, color: 'var(--text)' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--gold)', fontFamily: "'JetBrains Mono', monospace" }}>{formatPrice(confirmed.total)}</span>
                </div>
              </div>
              <p style={{ marginTop: 32, fontSize: '0.8rem', color: 'var(--muted)' }}>A confirmation email has been sent to {confirmed.email}.<br />Please show your confirmation code at the front desk.</p>
            </div>
          </RevealSection>
        </div>
      </div>
    );
  }

  /* ── Order Summary panel ── */
  const OrderSummary = ({ inDrawer } = {}) => (
    <div style={inDrawer ? {} : { ...S.sidebar, ...S.summary }}>
      <div style={S.label}>Order Summary</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text2)', marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>{fmtDate(visitDate)}</div>
      {selectedItems.length === 0 && <div style={{ fontSize: '0.85rem', color: 'var(--muted)', padding: '16px 0' }}>No tickets selected yet.</div>}
      {selectedItems.map(item => (
        <div key={item.id} style={S.summaryRow}>
          <span style={{ color: 'var(--text2)' }}>{item.qty} x {item.name}</span>
          <span style={{ color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace" }}>{formatPrice(item.lineTotal)}</span>
        </div>
      ))}
      {selectedItems.length > 0 && (
        <>
          <div style={S.divider} />
          <div style={S.summaryRow}>
            <span style={{ color: 'var(--text2)' }}>Subtotal</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatPrice(member ? regularTotal : subtotal)}</span>
          </div>
          {memberDiscount > 0 && (
            <div style={S.summaryRow}>
              <span style={{ color: '#4ADE80' }}>Member Discount</span>
              <span style={{ color: '#4ADE80', fontFamily: "'JetBrains Mono', monospace" }}>-{formatPrice(memberDiscount)}</span>
            </div>
          )}
          <div style={{ ...S.summaryRow, fontWeight: 600, fontSize: '1rem' }}>
            <span>Total</span>
            <span style={{ color: 'var(--gold)', fontFamily: "'JetBrains Mono', monospace" }}>{formatPrice(total)}</span>
          </div>
        </>
      )}
      {!inDrawer && (
        <>
          <div style={S.divider} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input style={S.input} type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
            <input style={S.input} type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <button className="btn-primary" style={{ width: '100%', marginTop: 16, padding: '14px 0', fontSize: '0.85rem', opacity: canPurchase ? 1 : 0.4, pointerEvents: canPurchase ? 'auto' : 'none' }} onClick={handlePurchase}>
            Purchase Tickets
          </button>
          <div style={{ textAlign: 'center', marginTop: 10, fontSize: '0.65rem', color: 'var(--muted)', fontFamily: "'JetBrains Mono', monospace" }}>
            Secure checkout · No booking fees
          </div>
        </>
      )}
    </div>
  );

  return (
    <div style={S.page} data-page="visit">

      {/* ── Hero ── */}
      <div style={S.hero}>
        <img src="/images/darksky/observatory-hero.jpg" alt="" style={S.heroImg} loading="eager" />
        <div style={S.heroOverlay} />
        <div style={S.heroContent}>
          <RevealSection>
            <div style={S.label}>General Admission</div>
            <h1 style={S.heroTitle}>Plan Your Visit</h1>
            <p style={S.heroSub}>Wed — Sun, 6pm — 11pm &middot; 13001 N La Montana Dr, Fountain Hills, AZ</p>
          </RevealSection>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ ...S.body, ...(isMobile ? { gridTemplateColumns: '1fr', paddingBottom: 100 } : {}) }}>

        {/* ── Left Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

          {/* Date Picker */}
          <RevealSection>
            <div style={S.label}>Select Your Visit Date</div>
            <input type="date" style={S.dateInput} value={visitDate} min={tomorrow()} onChange={e => setVisitDate(e.target.value)} />
          </RevealSection>

          {/* Standard Tickets */}
          <RevealSection delay={100}>
            <h2 style={S.sectionTitle}>Admission</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {standard.map(p => <TicketCard key={p.id} product={p} />)}
            </div>
          </RevealSection>

          {/* Add-Ons */}
          {addons.length > 0 && (
            <RevealSection delay={200}>
              <h2 style={S.sectionTitle}>Add-Ons</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {addons.map(p => <TicketCard key={p.id} product={p} compact />)}
              </div>
            </RevealSection>
          )}

          {/* Group Rates */}
          {groups.length > 0 && (
            <RevealSection delay={300}>
              <h2 style={S.sectionTitle}>Group Rates</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {groups.map(p => <TicketCard key={p.id} product={p} compact />)}
              </div>
            </RevealSection>
          )}

          {/* Member Lookup */}
          <RevealSection delay={400}>
            <div style={{ background: 'var(--bg2, #0a0a1a)', border: '1px solid var(--border)', borderRadius: 'var(--r, 3px)', padding: 24 }}>
              <div style={S.label}>Already a member?</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text2)', margin: '0 0 14px' }}>
                Enter your email to unlock member pricing on all tickets.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <input style={{ ...S.input, flex: 1 }} type="email" placeholder="Member email address" value={memberEmail} onChange={e => { setMemberEmail(e.target.value); setMemberSearched(false); setMember(null); }} onKeyDown={e => e.key === 'Enter' && handleMemberLookup()} />
                <button className="btn-ghost" style={{ padding: '10px 20px', fontSize: '0.8rem', whiteSpace: 'nowrap', flexShrink: 0 }} onClick={handleMemberLookup}>
                  Look Up
                </button>
              </div>
              {memberSearched && member && (
                <div style={{ marginTop: 14 }}>
                  <div style={S.memberBadge}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#4ADE80" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {member.name} &middot; {member.tier} Member
                  </div>
                  <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text2)' }}>Member pricing applied to all tickets above.</div>
                </div>
              )}
              {memberSearched && !member && (
                <div style={{ marginTop: 14, fontSize: '0.8rem', color: 'var(--text2)' }}>
                  No active membership found for that email. <a href="/membership" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Become a member</a>
                </div>
              )}
            </div>
          </RevealSection>

          {/* Mobile: inline summary */}
          {isMobile && selectedItems.length > 0 && (
            <RevealSection>
              <div style={S.summary}>
                <OrderSummary />
              </div>
            </RevealSection>
          )}
        </div>

        {/* ── Right Column (desktop) ── */}
        {!isMobile && <OrderSummary />}
      </div>

      {/* ── Mobile sticky bar ── */}
      {isMobile && (
        <div style={S.mobileBar}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold)' }}>{formatPrice(total)}</div>
          </div>
          <button className="btn-primary" style={{ padding: '12px 32px', fontSize: '0.85rem', opacity: canPurchase ? 1 : 0.4, pointerEvents: canPurchase ? 'auto' : 'none' }} onClick={handlePurchase}>
            Purchase
          </button>
        </div>
      )}
    </div>
  );
}
