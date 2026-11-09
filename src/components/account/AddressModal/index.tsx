'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Address } from '@/lib/types';

interface Props {
  open:         boolean;
  onClose:      () => void;
  onSubmit:     (data: Partial<Address>) => Promise<void>;
  editItem?:    Address | null;
  isSubmitting: boolean;
}

const EMPTY = {
  label:         'Home',
  address_line1: '',
  address_line2: '',
  city:          '',
  state:         '',
  country:       'Nepal',
  postal_code:   '',
  is_default:    false,
};

export function AddressModal({ open, onClose, onSubmit, editItem, isSubmitting }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editItem) {
      setForm({
        label:         editItem.label,
        address_line1: editItem.address_line1,
        address_line2: editItem.address_line2 ?? '',
        city:          editItem.city,
        state:         editItem.state,
        country:       editItem.country,
        postal_code:   editItem.postal_code ?? '',
        is_default:    editItem.is_default,
      });
    } else {
      setForm(EMPTY);
    }
    setError('');
  }, [open, editItem]);

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.address_line1 || !form.city || !form.state || !form.country) {
      setError('Please fill in all required fields.'); return;
    }
    setError('');
    await onSubmit({
      ...form,
      address_line2: form.address_line2 || undefined,
      postal_code:   form.postal_code   || undefined,
    });
  };

  if (!open) return null;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(32,31,29,0.5)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div className="card" style={{ width:'100%', maxWidth:520, padding:'28px', gap:20, maxHeight:'90vh', overflowY:'auto' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ margin:0 }}>{editItem ? 'Edit Address' : 'Add Address'}</h3>
          <button className="btn btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {error && (
          <div style={{ background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:'var(--radius-md)', padding:'10px 14px', fontSize:13, color:'#B91C1C' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Label */}
          <div className="field">
            <label>Label <span style={{ color:'var(--color-accent)' }}>*</span></label>
            <div className="seg" style={{ width:'fit-content' }}>
              {['Home', 'Office', 'Other'].map((l) => (
                <label key={l} className={`seg-opt ${form.label === l ? 'active' : ''}`}>
                  <input type="radio" name="label" checked={form.label === l} onChange={() => update('label', l)} />
                  {l}
                </label>
              ))}
            </div>
          </div>

          {/* Address Line 1 */}
          <div className="field">
            <label>Address Line 1 <span style={{ color:'var(--color-accent)' }}>*</span></label>
            <input
              className="input"
              placeholder="123 Main Street"
              value={form.address_line1}
              onChange={(e) => update('address_line1', e.target.value)}
              required
            />
          </div>

          {/* Address Line 2 */}
          <div className="field">
            <label>Address Line 2 <span style={{ color:'var(--color-neutral-400)', fontWeight:400 }}>(optional)</span></label>
            <input
              className="input"
              placeholder="Apartment, suite, etc."
              value={form.address_line2}
              onChange={(e) => update('address_line2', e.target.value)}
            />
          </div>

          {/* City + State */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="field">
              <label>City <span style={{ color:'var(--color-accent)' }}>*</span></label>
              <input
                className="input"
                placeholder="Kathmandu"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>State / Province <span style={{ color:'var(--color-accent)' }}>*</span></label>
              <input
                className="input"
                placeholder="Bagmati"
                value={form.state}
                onChange={(e) => update('state', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Country + Postal */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="field">
              <label>Country <span style={{ color:'var(--color-accent)' }}>*</span></label>
              <input
                className="input"
                placeholder="Nepal"
                value={form.country}
                onChange={(e) => update('country', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Postal Code</label>
              <input
                className="input"
                placeholder="44600"
                value={form.postal_code}
                onChange={(e) => update('postal_code', e.target.value)}
              />
            </div>
          </div>

          {/* Default */}
          <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => update('is_default', e.target.checked)}
              style={{ accentColor:'var(--color-accent)', width:15, height:15 }}
            />
            Set as default address
          </label>

          {/* Actions */}
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : editItem ? 'Save Changes' : 'Add Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}