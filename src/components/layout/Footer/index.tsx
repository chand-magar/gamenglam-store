import Link from 'next/link';

const SHOP_LINKS = [
  { label: 'New Arrivals',  href: '#' },
  { label: 'Sports',        href: '#' },
  { label: 'Fashion',       href: '#' },
  { label: 'Fitness',       href: '#' },
  { label: 'Footwear',      href: '#' },
  { label: 'Sale',          href: '#' },
];

const HELP_LINKS = [
  { label: 'Track Your Order',   href: '#' },
  { label: 'Returns & Exchange', href: '#' },
  { label: 'Shipping Info',      href: '#' },
  { label: 'Contact Us',         href: '#' },
];

const COMPANY_LINKS = [
  { label: 'About Us',       href: '#' },
  { label: 'Our Store',      href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Use',   href: '#' },
];

function LinkColumn({ heading, links }: { heading: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h6 style={{ marginBottom: '14px' }}>{heading}</h6>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {links.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            style={{ fontSize: 14, color: 'var(--color-neutral-600)', lineHeight: 1.4, textDecoration: 'none', transition: 'color 0.15s' }}
            className="hover:text-[var(--color-text)] hover:no-underline"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function IconFacebook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const SOCIAL = [
  { label: 'Facebook',  Icon: IconFacebook,  href: '#' },
  { label: 'Instagram', Icon: IconInstagram, href: '#' },
  { label: 'X',         Icon: IconX,         href: '#' },
];

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--color-divider)', marginTop: 64 }}>

      {/* Accent rule */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, var(--color-accent-700) 0%, var(--color-accent) 50%, var(--color-accent-300) 100%)' }} />

      {/* Main body */}
      <div className="container" style={{ paddingTop: 52, paddingBottom: 52 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 40,
          }}
          className="footer-grid"
        >

          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 22, marginBottom: 10, letterSpacing: '-0.01em' }}>
              Game n Glam
            </div>
            <p style={{ fontSize: 14, color: 'var(--color-neutral-600)', lineHeight: 1.65, maxWidth: 230, marginBottom: 20 }}>
              Barasat&apos;s home for sport and style. Premium gear, active fashion, and everyday fitness essentials — all under one roof.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--color-neutral-500)', minWidth: 16 }}>📍</span>
                <span style={{ fontSize: 13, color: 'var(--color-neutral-600)', lineHeight: 1.5 }}>
                  Jessore Road, Barasat,<br />West Bengal — 700124
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--color-neutral-500)', minWidth: 16 }}>📞</span>
                <a
                  href="tel:+919000000000"
                  style={{ fontSize: 13, color: 'var(--color-neutral-600)', textDecoration: 'none' }}
                  className="hover:text-[var(--color-text)]"
                >
                  +91 90000 00000
                </a>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--color-neutral-500)', minWidth: 16 }}>✉</span>
                <a
                  href="mailto:hello@gamenglam.in"
                  style={{ fontSize: 13, color: 'var(--color-neutral-600)', textDecoration: 'none' }}
                  className="hover:text-[var(--color-text)]"
                >
                  hello@gamenglam.in
                </a>
              </div>
            </div>
          </div>

          <LinkColumn heading="Shop"    links={SHOP_LINKS}    />
          <LinkColumn heading="Help"    links={HELP_LINKS}    />
          <LinkColumn heading="Company" links={COMPANY_LINKS} />
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid var(--color-divider)' }}>
        <div
          className="container"
          style={{ paddingTop: 16, paddingBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
        >
          <span style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
            © 2026 Game n Glam. All rights reserved.
          </span>

          <div style={{ display: 'flex', gap: 6 }}>
            {SOCIAL.map(({ label, Icon, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                style={{
                  width: 32,
                  height: 32,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-divider)',
                  color: 'var(--color-neutral-600)',
                  textDecoration: 'none',
                  transition: 'background 0.15s, color 0.15s',
                }}
                className="hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] hover:no-underline"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .footer-grid > :first-child {
            grid-column: span 2;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
          .footer-grid > :first-child {
            grid-column: span 1;
          }
        }
      `}</style>
    </footer>
  );
}
