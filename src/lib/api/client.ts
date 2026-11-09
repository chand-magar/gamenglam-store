const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

// ── Server-side fetch (reads httpOnly cookies) ────────────────────────────────
export async function serverFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res  = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  const json = await res.json();
  return (json.data ?? json) as T;
}

// ── Client-side fetch (calls Next.js proxy routes) ────────────────────────────
export async function clientFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Request failed ${res.status}`);
  }
  const json = await res.json();
  return (json.data ?? json) as T;
}
