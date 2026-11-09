'use client';
import { useState } from 'react';

export function Newsletter() {
  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  async function handleSubmit() {
    if (!email.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) { const d = await res.json(); setError(d?.error ?? 'Could not subscribe.'); return; }
      setSubmitted(true); setEmail('');
    } catch { setError('Something went wrong. Try again.'); }
    finally { setLoading(false); }
  }

  return (
    <section style={{
      background: '#080808',
      padding: '88px 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(90deg,rgba(255,255,255,0.02) 0px,rgba(255,255,255,0.02) 1px,transparent 1px,transparent 80px), repeating-linear-gradient(0deg,rgba(255,255,255,0.02) 0px,rgba(255,255,255,0.02) 1px,transparent 1px,transparent 80px)',
        pointerEvents: 'none',
      }} />
      {/* Indigo glow */}
      <div style={{ position:'absolute', width:600, height:500, top:'-20%', left:'-8%', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(79,70,229,0.15) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:400, height:400, bottom:'-20%', right:'-5%', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(79,70,229,0.08) 0%,transparent 70%)', pointerEvents:'none' }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>

          {/* Left — copy */}
          <div>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:6,
              padding:'5px 14px',
              background:'rgba(79,70,229,0.15)',
              border:'1px solid rgba(99,102,241,0.35)',
              borderRadius:30,
              fontSize:11, fontWeight:700, letterSpacing:'0.14em',
              color:'rgba(165,180,252,0.95)', textTransform:'uppercase' as const,
              fontFamily:'var(--font-body)', marginBottom:24,
            }}>
              ✉ Newsletter
            </div>

            <h2 style={{
              fontFamily:'var(--font-heading)',
              fontSize:'clamp(32px,4.5vw,56px)',
              fontWeight:700, color:'#fff',
              lineHeight:0.95, margin:'0 0 20px',
              letterSpacing:'-0.025em',
            }}>
              Stay ahead<br />
              of every <span style={{ color:'#818cf8', fontStyle:'italic' }}>deal.</span>
            </h2>

            <p style={{ fontSize:15, color:'rgba(255,255,255,0.5)', lineHeight:1.75, margin:'0 0 32px', fontWeight:300 }}>
              Be first to know about sales, new arrivals, and exclusive member offers — delivered to your inbox.
            </p>

            <div style={{ display:'flex', flexDirection:'column' as const, gap:12 }}>
              {[
                { icon:'🎯', text:'Early access to new arrivals & sales'      },
                { icon:'💸', text:'Exclusive discount codes for members'       },
                { icon:'🔔', text:'Instant alerts when your wishlist restocks' },
              ].map((p) => (
                <div key={p.text} style={{ display:'flex', alignItems:'flex-start', gap:12, fontSize:13.5, color:'rgba(255,255,255,0.62)', fontFamily:'var(--font-body)', lineHeight:1.5 }}>
                  <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{p.icon}</span>
                  {p.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div>
            {submitted ? (
              <div style={{
                display:'flex', flexDirection:'column' as const, alignItems:'center', gap:16,
                padding:'44px 36px', textAlign:'center',
                background:'rgba(79,70,229,0.1)',
                border:'1px solid rgba(99,102,241,0.3)',
                borderRadius:24,
              }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--color-accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, color:'#fff', fontWeight:700 }}>✓</div>
                <div style={{ fontFamily:'var(--font-heading)', fontSize:28, fontWeight:700, color:'#fff' }}>You&apos;re in!</div>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.52)', margin:0 }}>Welcome to Game n Glam. Expect great things in your inbox.</p>
              </div>
            ) : (
              <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:24, padding:'40px 36px' }}>
                <p style={{ fontFamily:'var(--font-heading)', fontSize:19, fontWeight:600, color:'rgba(255,255,255,0.88)', margin:'0 0 6px' }}>
                  Get exclusive offers
                </p>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.38)', margin:'0 0 24px', fontFamily:'var(--font-body)' }}>
                  Join 2,000+ smart shoppers today
                </p>

                <div style={{ display:'flex', flexDirection:'column' as const, gap:12 }}>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    disabled={loading}
                    style={{
                      width:'100%', padding:'14px 18px',
                      background:'rgba(255,255,255,0.07)',
                      border:'1px solid rgba(255,255,255,0.14)',
                      borderRadius:12, color:'#fff', fontSize:14,
                      fontFamily:'var(--font-body)', outline:'none',
                      transition:'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor='rgba(99,102,241,0.7)'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(79,70,229,0.15)'; }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor='rgba(255,255,255,0.14)'; e.currentTarget.style.boxShadow='none'; }}
                  />

                  {error && <p style={{ fontSize:12.5, color:'#fca5a5', margin:0 }}>{error}</p>}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      width:'100%', height:52, padding:'0 20px',
                      background: loading ? 'rgba(79,70,229,0.5)' : 'var(--color-accent)',
                      color:'#fff', border:'none', borderRadius:12,
                      fontFamily:'var(--font-body)', fontSize:14, fontWeight:700,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition:'background 0.18s, transform 0.15s, box-shadow 0.18s',
                      letterSpacing:'0.02em',
                    }}
                    onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 32px rgba(79,70,229,0.5)'; }}}
                    onMouseLeave={(e) => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}
                  >
                    {loading ? 'Subscribing…' : 'Subscribe — It\'s Free'}
                  </button>

                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.26)', margin:0, textAlign:'center' as const }}>
                    No spam. Unsubscribe anytime.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
