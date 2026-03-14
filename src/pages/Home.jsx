import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Stars from '../components/Stars';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/products';
import { EditableText, SectionWrapper, AddSectionButton, useEditMode } from '../components/EditMode';

const MARQUEE_ITEMS = ['Astronomy Apparel', 'Space Gifts', 'Kids Collection', 'Observatory Merch', 'Dark Sky Membership', 'Stargazing Accessories', 'Limited Editions', 'Night Sky Prints'];

const TESTIMONIALS = [
  {
    text: "The quality is incredible. My Milky Way hoodie gets compliments every time I wear it. Love knowing my purchase supports dark sky preservation.",
    author: "Sarah M.",
    location: "Tucson, AZ",
    initials: "SM",
  },
  {
    text: "Bought gifts for the whole family. The kids' telescope kit was a huge hit, and the star chart poster is now the centerpiece of our living room.",
    author: "James K.",
    location: "Sedona, AZ",
    initials: "JK",
  },
  {
    text: "As a member, the exclusive access and discounts make it so worthwhile. The limited edition prints are museum quality. Truly special pieces.",
    author: "Elena R.",
    location: "Phoenix, AZ",
    initials: "ER",
  },
];

function useReveal(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('vis'); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
}

function RevealSection({ children, className = '' }) {
  const ref = useRef(null);
  useReveal(ref);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

export default function Home({ onAddToCart }) {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const [heroVis, setHeroVis] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVis(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Featured: first 8 products, prioritizing ones with good images
  const featured = PRODUCTS.filter(p => p.images.length > 0).slice(0, 8);
  const newArrivals = PRODUCTS.slice(-4);

  return (
    <div>
      {/* -- HERO -- */}
      <SectionWrapper pageId="home" sectionId="Hero">
      <section className="hero" ref={heroRef}>
        <div className="hero-stars">
          <Stars count={260} className="stars-canvas" />
        </div>
        <div className="hero-vid">
          <video
            ref={videoRef}
            autoPlay muted loop playsInline
            poster=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }}
          >
            <source src="/videos/hero1.mp4" type="video/mp4" />
            <source src="/videos/hero1.webm" type="video/webm" />
          </video>
        </div>

        <div className={`hero-content ${heroVis ? 'hero-vis' : ''}`} style={{ opacity: heroVis ? 1 : 0, transform: heroVis ? 'none' : 'translateY(30px)', transition: 'opacity 1s, transform 1s cubic-bezier(.16,1,.3,1)', transitionDelay: '0.2s' }}>
          <EditableText textKey="home-hero-label" defaultText="// International Dark Sky Discovery Center" tag="div" className="label hero-label" style={{ transitionDelay: '0.1s' }} />
          <EditableText textKey="home-hero-title" defaultText="The Night<br/><em>Sky, Yours.</em>" tag="h1" className="hero-h1" style={{ transitionDelay: '0.3s' }} />
          <EditableText textKey="home-hero-sub" defaultText="Astronomy apparel, gifts, and collectibles from the International Dark Sky Discovery Center in Fountain Hills, Arizona. Every purchase supports dark sky preservation and STEM education." tag="p" className="hero-sub" style={{ transitionDelay: '0.45s' }} />
          <div className="hero-actions" style={{ transitionDelay: '0.6s' }}>
            <button className="btn-primary" onClick={() => navigate('/shop')}>Explore the Collection</button>
            <button className="btn-ghost" onClick={() => navigate('/membership')}>Become a Member</button>
          </div>
        </div>

        <div className="hero-scroll">
          <div className="hero-scroll-line" />
          Scroll to Discover
        </div>
      </section>
      </SectionWrapper>

      {/* -- MARQUEE -- */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="marquee-item">
              {item} <span className="marquee-dot">&#10022;</span>
            </span>
          ))}
        </div>
      </div>

      {/* -- FEATURED COLLECTION -- */}
      <AddSectionButton pageId="home" insertIndex={1} />
      <SectionWrapper pageId="home" sectionId="Featured Collection">
      <section className="section" style={{ background: 'var(--bg)' }}>
        <RevealSection className="section-header">
          <EditableText textKey="home-featured-label" defaultText="01 -- Collection" tag="div" className="label section-label" />
          <EditableText textKey="home-featured-title" defaultText="Curated for the <em>Curious</em>" tag="h2" className="section-title" />
        </RevealSection>
        <div className="grid">
          {featured.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={onAddToCart}
              delay={Math.min(i * 60, 300)}
              badge={i === 0 ? 'Bestseller' : i === 3 ? 'Staff Pick' : null}
            />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <button className="btn-ghost" onClick={() => navigate('/shop')}>View All Products</button>
        </div>
      </section>
      </SectionWrapper>

      {/* -- NEWSLETTER SIGNUP -- */}
      <AddSectionButton pageId="home" insertIndex={2} />
      <SectionWrapper pageId="home" sectionId="Newsletter">
      <div className="newsletter-section">
        <RevealSection>
          <EditableText textKey="home-newsletter-title" defaultText="Stay Under the <em>Stars</em>" tag="h3" className="newsletter-title" />
          <EditableText textKey="home-newsletter-sub" defaultText="New products, events, and dark sky updates — straight to your inbox. No spam, just starlight." tag="p" className="newsletter-sub" />
          <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
            <input type="email" className="newsletter-input" placeholder="Your email address" />
            <button type="submit" className="newsletter-btn">Subscribe</button>
          </form>
        </RevealSection>
      </div>
      </SectionWrapper>

      {/* -- MISSION BAND -- */}
      <AddSectionButton pageId="home" insertIndex={3} />
      <SectionWrapper pageId="home" sectionId="Mission Quote">
      <div className="mission">
        <EditableText textKey="home-mission-quote" defaultText={`"My hope is that the IDSDC will be an Arizona icon known around the world as a place that enables sky watchers of all ages to learn more about the <em>observable universe.</em>"`} tag="blockquote" className="mission-quote" />
        <EditableText textKey="home-mission-attr" defaultText="// Joe Bill, Board President" tag="div" className="mission-attr" />
      </div>
      </SectionWrapper>

      {/* -- NEW ARRIVALS -- */}
      <AddSectionButton pageId="home" insertIndex={4} />
      <SectionWrapper pageId="home" sectionId="New Arrivals">
      <section className="section" style={{ background: 'var(--bg2)' }}>
        <RevealSection className="section-header">
          <EditableText textKey="home-arrivals-label" defaultText="02 -- New Arrivals" tag="div" className="label section-label" />
          <EditableText textKey="home-arrivals-title" defaultText="Just <em>Landed</em>" tag="h2" className="section-title" />
        </RevealSection>
        <div className="grid grid-4">
          {newArrivals.map((p, i) => (
            <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} delay={i * 80} badge="New" />
          ))}
        </div>
      </section>
      </SectionWrapper>

      {/* -- CATEGORIES -- */}
      <AddSectionButton pageId="home" insertIndex={5} />
      <SectionWrapper pageId="home" sectionId="Categories">
      <section className="section" style={{ background: 'var(--bg)' }}>
        <RevealSection className="section-header">
          <EditableText textKey="home-cat-label" defaultText="03 -- Shop by Category" tag="div" className="label section-label" />
          <EditableText textKey="home-cat-title" defaultText="Find Your <em>Constellation</em>" tag="h2" className="section-title" />
        </RevealSection>
        <div className="cat-cards-5">
          {['Apparel', 'Kids', 'Gifts', 'Outerwear', 'Tanks'].map((cat, i) => {
            const catProducts = PRODUCTS.filter(p => p.category === cat && p.images[0]);
            const heroImg = catProducts[0]?.images[0];
            const count = catProducts.length + PRODUCTS.filter(p => p.category === cat && !p.images[0]).length;
            return (
              <button
                key={cat}
                className="cat-card"
                onClick={() => navigate(`/shop?cat=${cat}`)}
              >
                <div className="cat-card-img">
                  <div className="cat-card-overlay" />
                  {heroImg ? (
                    <img src={heroImg} alt={cat} />
                  ) : (
                    <span style={{ fontSize: 48, opacity: 0.3, color: 'var(--gold)' }}>&#10022;</span>
                  )}
                </div>
                <div className="cat-card-info">
                  <div className="cat-card-label">{`0${i+1} -- ${cat.toUpperCase()}`}</div>
                  <div className="cat-card-name">{cat}</div>
                  <div className="cat-card-meta">
                    <span className="cat-card-count">{count} products</span>
                    <span className="cat-card-link">Shop &#8594;</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
      </SectionWrapper>

      {/* -- TESTIMONIALS -- */}
      <AddSectionButton pageId="home" insertIndex={6} />
      <SectionWrapper pageId="home" sectionId="Testimonials">
      <section className="section" style={{ background: 'var(--bg2)' }}>
        <RevealSection className="section-header">
          <EditableText textKey="home-test-label" defaultText="04 -- Community" tag="div" className="label section-label" />
          <EditableText textKey="home-test-title" defaultText="What Our Community <em>Says</em>" tag="h2" className="section-title" />
        </RevealSection>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <EditableText textKey={`home-testimonial-${i}-text`} defaultText={`"${t.text}"`} tag="p" className="testimonial-text" />
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.initials}</div>
                <div>
                  <EditableText textKey={`home-testimonial-${i}-name`} defaultText={t.author} tag="div" className="testimonial-name" />
                  <EditableText textKey={`home-testimonial-${i}-loc`} defaultText={t.location} tag="div" className="testimonial-loc" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      </SectionWrapper>

      {/* -- TRUST BADGES -- */}
      <AddSectionButton pageId="home" insertIndex={7} />
      <SectionWrapper pageId="home" sectionId="Trust Badges">
      <div className="trust-row" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div className="trust-item">
          <div className="trust-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
          <span>Free Shipping $50+</span>
        </div>
        <div className="trust-item">
          <div className="trust-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <span>Secure Checkout</span>
        </div>
        <div className="trust-item">
          <div className="trust-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <span>Premium Quality</span>
        </div>
        <div className="trust-item">
          <div className="trust-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z"/>
              <path d="M2 12h20"/>
            </svg>
          </div>
          <span>Dark Sky Mission</span>
        </div>
      </div>
      </SectionWrapper>

      {/* -- MEMBERSHIP TEASER -- */}
      <AddSectionButton pageId="home" insertIndex={8} />
      <SectionWrapper pageId="home" sectionId="Membership Teaser">
      <section className="section" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 60%), var(--bg)', textAlign: 'center' }}>
        <RevealSection>
          <EditableText textKey="home-mem-label" defaultText="05 -- Membership" tag="div" className="label section-label" style={{ marginBottom: 24 }} />
          <EditableText textKey="home-mem-title" defaultText="Join the <em>Observatory</em>" tag="h2" className="section-title" style={{ marginBottom: 20 }} />
          <EditableText textKey="home-mem-desc" defaultText="Members enjoy unlimited admission, exclusive discounts up to 20%, and invitations to private observatory sessions under the darkest skies in Greater Phoenix." tag="p" style={{ font: '300 16px/1.8 DM Sans, sans-serif', color: 'var(--muted)', maxWidth: 480, margin: '0 auto 36px' }} />
          <button className="btn-primary" onClick={() => navigate('/membership')}>Explore Membership Tiers</button>
        </RevealSection>
      </section>
      </SectionWrapper>
    </div>
  );
}
