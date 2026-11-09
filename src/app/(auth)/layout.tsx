import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight:'100vh', background:'var(--color-bg)', display:'flex', flexDirection:'column' }}>

      {/* Minimal header */}
      <header style={{ borderBottom:'1px solid var(--color-divider)', padding:'0 36px' }}>
        <div style={{ maxWidth:1440, margin:'0 auto', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Link href="/" style={{ fontFamily:'var(--font-heading)', fontWeight:600, fontSize:20 }}>
            Game n Glam
          </Link>
          <span style={{ fontSize:13, color:'var(--color-neutral-600)' }}>
            Everything, well chosen.
          </span>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'36px 24px' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid var(--color-divider)', padding:'16px 36px' }}>
        <div style={{ maxWidth:1440, margin:'0 auto', display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--color-neutral-600)' }}>
          <span>© 2026 Game n Glam Market</span>
          <div style={{ display:'flex', gap:16 }}>
            <Link href="#" style={{ color:'var(--color-neutral-600)' }}>Privacy Policy</Link>
            <Link href="#" style={{ color:'var(--color-neutral-600)' }}>Terms</Link>
            <Link href="#" style={{ color:'var(--color-neutral-600)' }}>Help Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
