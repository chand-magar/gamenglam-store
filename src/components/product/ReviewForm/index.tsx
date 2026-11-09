'use client';
import { useState } from 'react';
import type { Review } from '@/lib/types';
import { useAuthStore } from '@/lib/store/auth';

interface Props {
  productId: string;
  onSubmitted: (review: Review) => void;
}

export function ReviewForm({ productId, onSubmitted }: Props) {
  const { customer } = useAuthStore();

  const [rating,    setRating]    = useState(0);
  const [hovered,  setHovered]   = useState(0);
  const [title,    setTitle]     = useState('');
  const [body,     setBody]      = useState('');
  const [error,    setError]     = useState('');
  const [loading,  setLoading]   = useState(false);
  const [done,     setDone]      = useState(false);

  if (!customer) {
    return (
      <div style={{ padding:'20px 24px', border:'1px solid var(--color-divider)', borderRadius:'var(--radius-lg)', background:'var(--color-surface)', textAlign:'center' }}>
        <p style={{ margin:'0 0 12px', color:'var(--color-neutral-600)', fontSize:14 }}>
          Sign in to leave a review.
        </p>
        <a href="/login" className="btn btn-primary" style={{ display:'inline-flex' }}>Sign In</a>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ padding:'20px 24px', border:'1px solid var(--color-accent-300)', borderRadius:'var(--radius-lg)', background:'var(--color-accent-100)', display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ width:28, height:28, borderRadius:'50%', background:'var(--color-accent)', color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>✓</span>
        <span style={{ fontFamily:'var(--font-heading)', fontWeight:600, color:'var(--color-accent-800)' }}>
          Thanks for your review!
        </span>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError('');
    if (rating === 0) { setError('Please select a star rating.'); return; }
    if (body.trim().length < 10) { setError('Review must be at least 10 characters.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ rating, title: title.trim(), body: body.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? 'Submission failed.');
      onSubmitted(json.data as Review);
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const display = hovered || rating;

  return (
    <div style={{ border:'1px solid var(--color-divider)', borderRadius:'var(--radius-lg)', padding:'20px 24px', background:'var(--color-surface)' }}>
      <div style={{ fontFamily:'var(--font-heading)', fontWeight:600, fontSize:16, marginBottom:16 }}>
        Write a Review
      </div>

      {/* Star picker */}
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:12, fontWeight:600, color:'var(--color-neutral-600)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Rating</div>
        <div style={{ display:'flex', gap:4 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(s)}
              style={{
                fontSize:   28,
                lineHeight: 1,
                background: 'none',
                border:     'none',
                cursor:     'pointer',
                padding:    '0 2px',
                color:      s <= display ? 'var(--color-accent)' : 'var(--color-neutral-300)',
                transition: 'color 0.1s',
              }}
            >
              ★
            </button>
          ))}
          {display > 0 && (
            <span style={{ alignSelf:'center', marginLeft:6, fontSize:13, color:'var(--color-neutral-600)' }}>
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][display]}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="field" style={{ marginBottom:12 }}>
        <label>Review Title <span style={{ color:'var(--color-neutral-400)', fontWeight:400 }}>(optional)</span></label>
        <input
          className="input"
          placeholder="Summarise your experience"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
      </div>

      {/* Body */}
      <div className="field" style={{ marginBottom:16 }}>
        <label>Your Review</label>
        <textarea
          className="input"
          placeholder="What did you like or dislike? Min 10 characters."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          style={{ resize:'vertical', fontFamily:'var(--font-body)', fontSize:14 }}
        />
      </div>

      {error && (
        <div style={{ fontSize:13, color:'#EF4444', marginBottom:12 }}>{error}</div>
      )}

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  );
}
