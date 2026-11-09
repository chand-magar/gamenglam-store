'use client';
import { useState }      from 'react';
import Link              from 'next/link';
import { useRouter }     from 'next/navigation';
import { Eye, EyeOff, Check } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8           },
    { label: 'One uppercase letter',   pass: /[A-Z]/.test(password)         },
    { label: 'One number',             pass: /[0-9]/.test(password)         },
    { label: 'One special character',  pass: /[^A-Za-z0-9]/.test(password) },
  ];

  if (!password) return null;

  const score = checks.filter((c) => c.pass).length;
  const color = score <= 1 ? '#EF4444' : score <= 2 ? '#F59E0B' : score <= 3 ? '#3B82F6' : '#10B981';
  const label = score <= 1 ? 'Weak' : score <= 2 ? 'Fair' : score <= 3 ? 'Good' : 'Strong';

  return (
    <div style={{ marginTop:8 }}>
      {/* Bar */}
      <div style={{ display:'flex', gap:3, marginBottom:6 }}>
        {[1,2,3,4].map((i) => (
          <div
            key={i}
            style={{ flex:1, height:3, borderRadius:2, background: i <= score ? color : 'var(--color-neutral-200)', transition:'background 0.2s' }}
          />
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'flex-end', fontSize:11, color, fontWeight:600, marginBottom:6 }}>
        {label}
      </div>
      {/* Checks */}
      <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
        {checks.map((c) => (
          <div key={c.label} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color: c.pass ? '#10B981' : 'var(--color-neutral-500)' }}>
            <Check size={11} strokeWidth={c.pass ? 3 : 1} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {

  const router = useRouter();
  const setCustomer = useAuthStore((s) => s.setCustomer);

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', mobile: '', password: '', confirm: '',
  });
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed,      setAgreed]      = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState('');

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!form.first_name || !form.last_name || !form.email || !form.password) {
    setError('Please fill in all required fields.'); return;
  }
  if (form.password !== form.confirm) {
    setError('Passwords do not match.'); return;
  }
  if (form.password.length < 8) {
    setError('Password must be at least 8 characters.'); return;
  }
  if (!agreed) {
    setError('Please accept the terms and privacy policy.'); return;
  }

  setIsLoading(true);
  setError('');

  try {
    const res = await fetch('/api/auth/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        first_name: form.first_name,
        last_name:  form.last_name,
        email:      form.email,      // proxy maps this to email_id
        mobile_no:  form.mobile || undefined,
        password:   form.password,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? 'Registration failed.');

    // Auto-login — set customer in store
    setCustomer(data.customer);
    router.push('/account');
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : 'Registration failed.');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div style={{ width:'100%', maxWidth:500 }}>
      <div className="card" style={{ padding:'36px', gap:'24px' }}>

        {/* Header */}
        <div style={{ textAlign:'center' }}>
          <h2 style={{ margin:'0 0 6px' }}>Create your account</h2>
          <p style={{ fontSize:14, color:'var(--color-neutral-600)', margin:0 }}>
            Join Game n Glam and shop everything, well chosen.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:'var(--radius-md)', padding:'10px 14px', fontSize:13, color:'#B91C1C' }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Name row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="field">
              <label htmlFor="first_name">First name <span style={{ color:'var(--color-accent)' }}>*</span></label>
              <input
                id="first_name"
                type="text"
                className="input"
                placeholder="Priya"
                value={form.first_name}
                onChange={(e) => update('first_name', e.target.value)}
                autoComplete="given-name"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="last_name">Last name <span style={{ color:'var(--color-accent)' }}>*</span></label>
              <input
                id="last_name"
                type="text"
                className="input"
                placeholder="Nandakumar"
                value={form.last_name}
                onChange={(e) => update('last_name', e.target.value)}
                autoComplete="family-name"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="field">
            <label htmlFor="reg-email">Email address <span style={{ color:'var(--color-accent)' }}>*</span></label>
            <input
              id="reg-email"
              type="email"
              className="input"
              placeholder="you@email.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {/* Mobile */}
          <div className="field">
            <label htmlFor="mobile">Mobile number <span style={{ color:'var(--color-neutral-400)', fontWeight:400 }}>(optional)</span></label>
            <input
              id="mobile"
              type="tel"
              className="input"
              placeholder="+1 (512) 555-0148"
              value={form.mobile}
              onChange={(e) => update('mobile', e.target.value)}
              autoComplete="tel"
            />
          </div>

          {/* Password */}
          <div className="field">
            <label htmlFor="reg-password">Password <span style={{ color:'var(--color-accent)' }}>*</span></label>
            <div style={{ position:'relative' }}>
              <input
                id="reg-password"
                type={showPass ? 'text' : 'password'}
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                autoComplete="new-password"
                style={{ paddingRight:42 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--color-neutral-500)', display:'flex', alignItems:'center' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <PasswordStrength password={form.password} />
          </div>

          {/* Confirm password */}
          <div className="field">
            <label htmlFor="confirm">Confirm password <span style={{ color:'var(--color-accent)' }}>*</span></label>
            <div style={{ position:'relative' }}>
              <input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                className="input"
                placeholder="••••••••"
                value={form.confirm}
                onChange={(e) => update('confirm', e.target.value)}
                autoComplete="new-password"
                style={{ paddingRight:42, borderColor: form.confirm && form.confirm !== form.password ? '#EF4444' : undefined }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--color-neutral-500)', display:'flex', alignItems:'center' }}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.confirm && form.confirm !== form.password && (
              <span style={{ fontSize:12, color:'#EF4444' }}>Passwords do not match</span>
            )}
          </div>

          {/* Terms */}
          <label style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:13, cursor:'pointer', lineHeight:1.5 }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ accentColor:'var(--color-accent)', width:15, height:15, marginTop:2, flexShrink:0 }}
              required
            />
            <span style={{ color:'var(--color-neutral-600)' }}>
              I agree to the{' '}
              <Link href="/terms" style={{ color:'var(--color-accent-700)', fontWeight:600 }}>Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" style={{ color:'var(--color-accent-700)', fontWeight:600 }}>Privacy Policy</Link>
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isLoading}
            style={{ marginTop:4 }}
          >
            {isLoading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ flex:1, height:1, background:'var(--color-divider)' }} />
          <span style={{ fontSize:12, color:'var(--color-neutral-500)' }}>or</span>
          <div style={{ flex:1, height:1, background:'var(--color-divider)' }} />
        </div>

        {/* Social */}
        <button className="btn btn-secondary btn-block" style={{ gap:10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Login link */}
        <p style={{ textAlign:'center', fontSize:13, color:'var(--color-neutral-600)', margin:0 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color:'var(--color-accent-700)', fontWeight:600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
