# gamenglam-store (Next.js storefront) — CLAUDE.md

Customer-facing storefront for the GameNGlam / Aldine e-commerce platform.
Stack: **Next.js (App Router) · TypeScript · CSS (inline styles + CSS variables)**

Backend: `gamenglam-server` at `http://localhost:8080/api/v1`.

---

## Quick start

```bash
npm install
npm run dev      # Next.js dev server (port 3000)
npm run build
npm run start
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` (defaults to `http://localhost:8080/api/v1`).

---

## Architecture — SOLID layers

```
src/
  app/                   # Next.js App Router pages + layouts
    (auth)/              # login, register — auth layout group
    (store)/             # main storefront layout group
    api/                 # Next.js proxy route handlers
      auth/login/        # POST — proxies to backend, sets cookies
      auth/logout/       # POST — clears cookies
      auth/register/     # POST — proxies to backend register
      me/                # GET — reads customer profile
      addresses/         # GET + POST
      addresses/[id]/    # PUT + DELETE
      orders/            # POST — place order
  components/            # shared UI components
  lib/                   # repository functions, mappers, utilities
  types/                 # TypeScript interfaces
```

---

## Auth pattern

- Customer JWT stored in **`httpOnly` cookies** (`gng_access_token`, `gng_refresh_token`) — never accessible from client JS
- All sensitive API calls go through **Next.js proxy routes** (`/api/*`) which read the cookie server-side via `next/headers` and forward the `Authorization` header to the backend
- Middleware protects `/account` and `/checkout` — unauthenticated users redirect to `/login`
- Login posts to `/api/auth/login` (Next.js route) → backend `POST /customers/login` (`email_id` field, not `email`)
- Logout: `POST /api/auth/logout` clears both cookies (`maxAge: 0`)

```ts
// Reading token server-side (in API route handlers)
import { cookies } from 'next/headers';
const token = (await cookies()).get('gng_access_token')?.value;
```

---

## API proxy pattern

Client components **never** call `localhost:8080` directly. All calls go through `/api/*` routes.

```
Client → /api/addresses (Next.js route) → localhost:8080/api/v1/customers/addresses
```

This keeps auth cookies server-side and avoids CORS issues.

---

## ID conventions — critical

**Always use `_id` (UUID) in all request payloads. Never send `_no` (serial) fields.**

All `_no` fields in API responses carry `json:"-"` on the backend — they will never appear in JSON. If you see a `_no` field in a response, something is wrong.

| Payload field | Notes |
|--------------|-------|
| `address_id` | UUID — used in `PlaceOrderRequest` |
| `category_id` | UUID — used for product filtering |
| `attribute_value_id` | UUID — used in variant filter params |

**One exception — `customer_no` in place order**: The `/api/orders` proxy route decodes the `gng_access_token` JWT server-side with `jwtDecode` to extract `customer_no` and includes it in the `POST /orders` body. This is the only `_no` value ever sent to the backend from this app, and it comes directly from the JWT — it is never constructed or stored by client code.

---

## Key API endpoints

| Method | Path | Notes |
|--------|------|-------|
| GET | `/categories` | All active categories |
| GET | `/products?category_id=UUID` | Products filtered by category |
| GET | `/product-variants/listing` | One default variant per product (DISTINCT ON product_id, in-stock first, lowest price) |
| GET | `/product-variants/listing?category_id=UUID&values=red,golden` | Filtered listing |
| GET | `/products/:id/variants-with-attributes` | All variants with attribute map (`code → value`) |
| GET | `/products/:id/attributes` | Attribute names + values with `color_hex` |
| GET | `/attributes/category/:id/values` | Only `show_in_filter = true` attributes (for sidebar) |
| POST | `/customers/login` | Field: `email_id` (not `email`) |
| POST | `/customers/register` | Fields: `first_name`, `last_name`, `email_id`, `mobile_no`, `password` |
| GET | `/customers/me` | Requires auth cookie |
| GET/POST | `/customers/addresses` | Requires auth cookie |
| PUT/DELETE | `/customers/addresses/:id` | Requires auth cookie |
| GET | `/orders/customer/:id` | Orders by customer UUID |
| POST | `/orders` | Place order (see below) |

### Place order request shape
```ts
{
  customer_no: number,   // from JWT (internal — only field using _no, comes from token)
  address_id:  string,   // UUID
  items: [{ variant_id: string, quantity: number, unit_price: number }],
  subtotal: number,
  discount: number,
  tax: number,
  delivery_fee: number,
  total: number,
  notes?: string,
}
```

---

## Product detail page

- Dynamic attribute selectors: color swatches + size pills
- Gallery updates when a different variant is selected
- Auto-selects default in-stock variant on load
- Out-of-stock combos shown with strikethrough / reduced opacity
- "You may also like" uses `getVariantListing()` + inline `VariantCard`

---

## Category page (sidebar filters)

- Attribute filters fetched from `GET /attributes/category/:id/values` (only `show_in_filter = true` attributes)
- On filter change, refetches `getVariantListing(categoryId, selectedValues)` via `useEffect`
- Selected values passed as comma-separated query param: `?values=red,golden`
- Two-path query on backend: with filter → match variant; without filter → lowest-price/most-stock default

---

## Cart

The cart is **client-side only** — a Zustand store persisted to `localStorage` under the key `game-n-glam-cart`. Cart data is never synced to the backend `/cart` API (those endpoints exist but are unused by the storefront). The cart is only sent to the backend at checkout time as `items[]` inside `POST /api/orders`.

Cart state lives in `src/lib/store/cart.ts`. It calculates `itemCount` and `subtotal` locally from `lines[]`.

---

## Checkout

- COD only (no payment gateway yet)
- Fetches customer profile + addresses via `/api/me` and `/api/addresses`
- `PlaceOrderRequest` sends `address_id` (UUID); backend resolves `address_no` internally
- On successful order, call `useCartStore.getState().clearCart()` to empty the persisted cart

---

## Styling

- **Inline styles + CSS variables** — no CSS-in-JS library, no Tailwind
- CSS variables defined on `:root`: `--color-bg`, `--color-accent`, `--color-accent-700`, `--color-neutral-*`, `--color-divider`, `--radius-md`, `--font-heading`, etc.
- Shared utility classes: `card`, `btn`, `btn-primary`, `btn-secondary`, `btn-block`, `input`, `field`
- Auth pages use the `(auth)` layout group with a minimal header + centered card

---

## Data mapping

Backend field names differ from what components consume — always map at the repository/lib layer, not in components.

```ts
// Example: mapProduct() normalises API fields for component use
function mapProduct(raw: ApiProduct): Product {
  return {
    id:          raw.product_id,
    name:        raw.product_name,
    categoryId:  raw.category_id,
    imageUrl:    raw.image_url,
    // ...
  };
}
```

---

## Common mistakes to avoid

- **Don't call `localhost:8080` from client components** — use the `/api/*` proxy routes.
- **Don't use `email` field for login** — the backend expects `email_id`.
- **Don't send `_no` fields** in any request body (except `customer_no` which comes from the JWT in the orders proxy — see ID conventions above).
- **Don't access cookies from client JS** — they are `httpOnly`; read them server-side in API route handlers via `req.cookies.get('gng_access_token')`.
- **Don't skip `mapProduct()` / field normalisation** — API field names don't match component prop names.
- **Don't show draft variants** on any storefront page — backend filters `status = 'active'` only, but double-check queries if implementing custom fetches.
- **`/product-variants/listing` not `/products`** for category and home pages — listing returns one variant per product with price + stock pre-resolved.
- **Don't sync cart to the backend `/cart` API** — the storefront cart is Zustand + localStorage only; those backend endpoints are intentionally unused.
