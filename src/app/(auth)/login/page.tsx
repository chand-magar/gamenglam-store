'use client';
import { useState }     from 'react';
import Link             from 'next/link';
import { useRouter }    from 'next/navigation';
import { Eye, EyeOff }  from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';

export default function LoginPage() {
  const router     = useRouter();
  const setCustomer = useAuthStore((s) => s.setCustomer);

  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [remember,  setRemember]  = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!email || !password) { setError('Please fill in all fields.'); return; }

  setIsLoading(true);
  setError('');

  try {
    const res = await fetch('/api/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? 'Invalid email or password.');

    // Store customer in Zustand
    setCustomer(data.customer);

    // Refresh router so middleware sees the new cookie
    router.refresh();

    // Then redirect
    const params   = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect') ?? '/account';
    router.push(redirect);

  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : 'Login failed.');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div style={{ width:'100%', maxWidth:440 }}>
      <div className="card" style={{ padding:'36px', gap:'24px' }}>

        {/* Header */}
        <div style={{ textAlign:'center' }}>
          <h2 style={{ margin:'0 0 6px' }}>Welcome back</h2>
          <p style={{ fontSize:14, color:'var(--color-neutral-600)', margin:0 }}>
            Sign in to your Game n Glam account
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

          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <label htmlFor="password">Password</label>
              <Link href="/forgot-password" style={{ fontSize:12, color:'var(--color-accent-700)' }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position:'relative' }}>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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
          </div>

          <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{ accentColor:'var(--color-accent)', width:15, height:15 }}
            />
            Keep me signed in
          </label>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isLoading}
            style={{ marginTop:4 }}
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ flex:1, height:1, background:'var(--color-divider)' }} />
          <span style={{ fontSize:12, color:'var(--color-neutral-500)' }}>or</span>
          <div style={{ flex:1, height:1, background:'var(--color-divider)' }} />
        </div>

        <p style={{ textAlign:'center', fontSize:13, color:'var(--color-neutral-600)', margin:0 }}>
          Don't have an account?{' '}
          <Link href="/register" style={{ color:'var(--color-accent-700)', fontWeight:600 }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}