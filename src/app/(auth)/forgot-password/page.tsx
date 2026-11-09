'use client';
import { useState } from 'react';
import Link         from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email,       setEmail]       = useState('');
  const [isLoading,   setIsLoading]   = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error,       setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }

    setIsLoading(true);
    setError('');

    try {
      // TODO: POST to /api/auth/forgot-password
      await new Promise((r) => setTimeout(r, 800)); // simulate
      setIsSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width:'100%', maxWidth:420 }}>
      <div className="card" style={{ padding:'36px', gap:'24px' }}>

        {isSubmitted ? (
          /* Success state */
          <div style={{ textAlign:'center', display:'flex', flexDirection:'column', gap:16, alignItems:'center' }}>
            <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--color-accent-100)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:24 }}>✉️</span>
            </div>
            <div>
              <h3 style={{ margin:'0 0 8px' }}>Check your inbox</h3>
              <p style={{ fontSize:14, color:'var(--color-neutral-600)', margin:0, lineHeight:1.6 }}>
                We sent a password reset link to <strong>{email}</strong>. It expires in 30 minutes.
              </p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, width:'100%' }}>
              <button
                className="btn btn-secondary btn-block"
                onClick={() => { setIsSubmitted(false); setEmail(''); }}
              >
                Try a different email
              </button>
              <Link href="/login" className="btn btn-primary btn-block">
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          /* Form state */
          <>
            <div style={{ textAlign:'center' }}>
              <h2 style={{ margin:'0 0 6px' }}>Forgot your password?</h2>
              <p style={{ fontSize:14, color:'var(--color-neutral-600)', margin:0, lineHeight:1.6 }}>
                Enter your email address and we'll send you a link to reset it.
              </p>
            </div>

            {error && (
              <div style={{ background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:'var(--radius-md)', padding:'10px 14px', fontSize:13, color:'#B91C1C' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div className="field">
                <label htmlFor="fp-email">Email address</label>
                <input
                  id="fp-email"
                  type="email"
                  className="input"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={isLoading}
              >
                {isLoading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>

            <Link
              href="/login"
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontSize:13, color:'var(--color-neutral-600)' }}
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
