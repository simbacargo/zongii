import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0f1117",
  bg2: "#161b26",
  bg3: "#1e2435",
  bg4: "#252d40",
  accent: "#378ADD",
  accent2: "#85B7EB",
  accentDim: "#1a3a5c",
  text: "#eef1f7",
  text2: "#9aa3b8",
  text3: "#5c6478",
  border: "#2a3248",
};

const services = [
  {
    title: "Residential plumbing",
    desc: "Pipe repairs, fixtures, water heaters, and full bathroom upgrades.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    title: "Commercial plumbing",
    desc: "Large-scale installations and maintenance for hotels, offices, and businesses.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    title: "Emergency repairs",
    desc: "Burst pipes, leaks, blockages — fast response day and night.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    title: "Drainage & sewage",
    desc: "Drain unblocking, sewer inspection, and septic system care.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

const whyItems = [
  { num: "01", title: "Licensed professionals", desc: "Fully certified plumbers with years of hands-on experience." },
  { num: "02", title: "Transparent pricing", desc: "You know the full cost before we start — no surprises." },
  { num: "03", title: "Local expertise", desc: "We know Arusha's water systems and infrastructure inside out." },
  { num: "04", title: "Clean, tidy work", desc: "We leave your space exactly as we found it — or better." },
];

const stats = [
  { n: "500+", l: "Jobs completed" },
  { n: "8 yrs", l: "Serving Arusha" },
  { n: "4.9★", l: "Customer rating" },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(22px)",
        transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function ServiceCard({ icon, title, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: COLORS.bg2,
        border: `0.5px solid ${hovered ? COLORS.accent : COLORS.border}`,
        borderRadius: 12,
        padding: "1.25rem",
        transition: "border-color 0.2s",
        cursor: "default",
      }}
    >
      <div style={{
        width: 36, height: 36, background: COLORS.accentDim,
        borderRadius: 8, display: "flex", alignItems: "center",
        justifyContent: "center", marginBottom: 12,
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 500, color: COLORS.text, marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 13, color: COLORS.text2, lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "1rem 2rem",
      borderBottom: `0.5px solid ${scrolled ? COLORS.border : "transparent"}`,
      background: scrolled ? COLORS.bg : "transparent",
      position: "sticky", top: 0, zIndex: 10,
      transition: "background 0.3s, border-color 0.3s",
    }}>
      <div style={{ fontSize: 20, fontWeight: 500, color: COLORS.text }}>
        Zongii <span style={{ color: COLORS.accent }}>Plumbing</span>
      </div>
      <ul style={{ display: "flex", gap: 24, listStyle: "none", margin: 0, padding: 0 }}>
        {["Services", "About", "Gallery", "Contact"].map((l) => (
          <li key={l}>
            <a href="#" style={{ fontSize: 14, color: COLORS.text2, textDecoration: "none" }}>{l}</a>
          </li>
        ))}
      </ul>
      <button style={{
        background: COLORS.accent, color: "#E6F1FB",
        border: "none", padding: "8px 20px", borderRadius: 8,
        fontSize: 14, fontWeight: 500, cursor: "pointer",
      }}>
        Get a quote
      </button>
    </nav>
  );
}

export default function ZongiiPlumbing() {
  return (
    <div style={{ background: COLORS.bg, color: COLORS.text, fontFamily: "sans-serif", minHeight: "100vh" }}>
      <NavBar />

      {/* Hero */}
      <div style={{
        padding: "4rem 2rem 3rem", maxWidth: 980, margin: "0 auto",
        display: "flex", alignItems: "center", gap: "3rem", justifyContent: "space-between",
        flexWrap: "wrap",
      }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <FadeIn delay={0}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: COLORS.accentDim, color: COLORS.accent2,
              fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 20,
              border: `0.5px solid #2a5a8c`, marginBottom: "1.25rem",
            }}>
              <span style={{ width: 6, height: 6, background: COLORS.accent, borderRadius: "50%", display: "inline-block" }} />
              Arusha, Tanzania
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 style={{ fontSize: 38, fontWeight: 500, lineHeight: 1.2, marginBottom: "1rem", color: COLORS.text }}>
              Plumbing you can<br />
              <em style={{ fontStyle: "normal", color: COLORS.accent }}>trust</em>, when it<br />
              matters most.
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p style={{ fontSize: 15, color: COLORS.text2, lineHeight: 1.7, marginBottom: "1.75rem", maxWidth: 420 }}>
              Zongii Plumbing brings fast, professional, and affordable plumbing to homes and businesses across Arusha — done right, every time.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button style={{
                background: COLORS.accent, color: "#E6F1FB",
                border: "none", padding: "12px 28px", borderRadius: 8,
                fontSize: 15, fontWeight: 500, cursor: "pointer",
              }}>
                Book a service ↗
              </button>
              <button style={{
                background: "transparent", color: COLORS.text2,
                border: `0.5px solid ${COLORS.border}`, padding: "11px 24px",
                borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: "pointer",
              }}>
                Call us now
              </button>
            </div>
          </FadeIn>
        </div>

        {/* Hero cards */}
        <div style={{ flex: "0 0 260px", display: "flex", flexDirection: "column", gap: 12 }}>
          <FadeIn delay={0.2}>
            <div style={{
              background: COLORS.accentDim, border: `0.5px solid #2a5a8c`,
              borderRadius: 12, padding: "1rem 1.25rem",
            }}>
              <div style={{ fontSize: 26, fontWeight: 500, color: COLORS.accent2 }}>24 / 7</div>
              <div style={{ fontSize: 12, color: COLORS.accent2, opacity: 0.8 }}>Emergency response, always available</div>
            </div>
          </FadeIn>
          {[
            {
              title: "Licensed & insured",
              desc: "Every job backed by fully certified professionals.",
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
            },
            {
              title: "Same-day service",
              desc: "Most jobs completed the same day you call.",
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
            },
          ].map((card, i) => (
            <FadeIn delay={0.3 + i * 0.1} key={card.title}>
              <div style={{
                background: COLORS.bg2, border: `0.5px solid ${COLORS.border}`,
                borderRadius: 12, padding: "1rem 1.25rem",
              }}>
                <div style={{
                  width: 32, height: 32, background: COLORS.accentDim,
                  borderRadius: 8, display: "flex", alignItems: "center",
                  justifyContent: "center", marginBottom: 10,
                }}>
                  {card.icon}
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 500, color: COLORS.text, marginBottom: 4 }}>{card.title}</h4>
                <p style={{ fontSize: 12, color: COLORS.text2, lineHeight: 1.5 }}>{card.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1px", background: COLORS.border,
        borderTop: `0.5px solid ${COLORS.border}`,
        borderBottom: `0.5px solid ${COLORS.border}`,
      }}>
        {stats.map(({ n, l }) => (
          <div key={l} style={{ background: COLORS.bg2, padding: "1.5rem 2rem", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 500, color: COLORS.accent }}>{n}</div>
            <div style={{ fontSize: 13, color: COLORS.text2, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Services */}
      <div style={{ padding: "3rem 2rem", maxWidth: 980, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ fontSize: 12, fontWeight: 500, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>What we do</div>
          <div style={{ fontSize: 26, fontWeight: 500, marginBottom: 6 }}>Our services</div>
          <div style={{ fontSize: 15, color: COLORS.text2, marginBottom: "2rem" }}>Everything your home or business needs</div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {services.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.08}>
              <ServiceCard {...s} />
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Why Zongii */}
      <div style={{ padding: "0 2rem 3rem", maxWidth: 980, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ fontSize: 12, fontWeight: 500, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Why Zongii</div>
          <div style={{ fontSize: 26, fontWeight: 500, marginBottom: 6 }}>Built on trust</div>
          <div style={{ fontSize: 15, color: COLORS.text2, marginBottom: "2rem" }}>What makes us the preferred choice in Arusha</div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: "2rem" }}>
          {whyItems.map((w, i) => (
            <FadeIn key={w.num} delay={i * 0.08}>
              <div style={{
                background: COLORS.bg2, border: `0.5px solid ${COLORS.border}`,
                borderRadius: 12, padding: "1.25rem",
              }}>
                <div style={{ fontSize: 28, fontWeight: 500, color: COLORS.bg3, marginBottom: 8 }}>{w.num}</div>
                <h4 style={{ fontSize: 14, fontWeight: 500, color: COLORS.text, marginBottom: 4 }}>{w.title}</h4>
                <p style={{ fontSize: 13, color: COLORS.text2, lineHeight: 1.6 }}>{w.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn>
          <div style={{
            background: COLORS.bg2,
            borderLeft: `3px solid ${COLORS.accent}`,
            borderRadius: "0 12px 12px 0",
            padding: "1.5rem 1.75rem",
          }}>
            <p style={{ fontSize: 15, color: COLORS.text2, lineHeight: 1.7, fontStyle: "italic" }}>
              "Zongii fixed our burst pipe the same evening I called. Professional team, fair price, and they cleaned up everything. I won't call anyone else in Arusha."
            </p>
            <div style={{ marginTop: 12, fontSize: 13, fontWeight: 500, color: COLORS.text }}>— Amina K., homeowner, Arusha</div>
          </div>
        </FadeIn>
      </div>

      {/* CTA band */}
      <div style={{
        background: COLORS.bg2,
        borderTop: `0.5px solid ${COLORS.border}`,
        borderBottom: `0.5px solid ${COLORS.border}`,
        padding: "3rem 2rem", textAlign: "center",
      }}>
        <FadeIn>
          <div style={{ fontSize: 12, fontWeight: 500, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Ready to get started?</div>
          <h2 style={{ fontSize: 28, fontWeight: 500, marginBottom: 8 }}>Need a plumber in Arusha?</h2>
          <p style={{ color: COLORS.text2, marginBottom: "1.5rem" }}>Contact us today — free quotes, no obligation.</p>
          <button style={{
            background: COLORS.accent, color: "#E6F1FB",
            border: "none", padding: "12px 28px", borderRadius: 8,
            fontSize: 15, fontWeight: 500, cursor: "pointer",
          }}>
            Request a free quote ↗
          </button>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: "1rem" }}>
            {[
              { dot: COLORS.accent, label: "+255 XXX XXX XXX" },
              { dot: "#1D9E75", label: "Arusha, Tanzania" },
              { dot: "#EF9F27", label: "info@zongii.co.tz" },
            ].map(({ dot, label }) => (
              <div key={label} style={{
                background: COLORS.bg3, border: `0.5px solid ${COLORS.border}`,
                borderRadius: 20, padding: "8px 16px", fontSize: 13,
                color: COLORS.text2, display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, display: "inline-block" }} />
                {label}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>

      {/* Footer */}
      <footer style={{
        padding: "1.25rem 2rem", display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        borderTop: `0.5px solid ${COLORS.border}`,
      }}>
        <p style={{ fontSize: 13, color: COLORS.text3 }}>© 2026 Zongii Plumbing, Arusha, Tanzania</p>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "Contact"].map((l) => (
            <a key={l} href="#" style={{ fontSize: 13, color: COLORS.text3, textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
