# GenXPac — Project Documentation

## Overview

GenXPac is a private B2B middleware platform built for a Tunisian importer who sources products from China and sells them to Tunisian e-commerce shops. It acts as a bridge between Chinese suppliers and Tunisian retailers through a structured pre-order and aggregation system.

---

## Business Model

```
Chinese Suppliers (Taobao / 1688 / Alibaba)
        ↓
    Admin (GenXPac owner) — adds products to platform
        ↓
Tunisian shops browse catalog & pre-order with quantities
        ↓
Admin aggregates orders (e.g., 30 shops × 10 units = 300 total)
        ↓
Admin places one bulk order from China
        ↓
Products arrive in Tunisia → distributed to each shop
```

**No online payment** — invoicing and collection handled offline (bank transfer, cash, etc.)

---

## Objectives

### Primary Objectives
- Replace manual WhatsApp/Taobao coordination with a structured web platform
- Give Tunisian shop clients a professional self-service catalog to browse and pre-order
- Allow the admin to aggregate demand across all shops before placing any China order
- Track the full lifecycle of each order: from pre-order to delivery in Tunisia

### Secondary Objectives
- Support trilingual UI (French primary, Arabic, English)
- Allow flexible product entry: manual form, image URL import, CSV/Excel bulk upload
- Enable price negotiation between admin and individual shops per order
- Provide a real-time dashboard showing aggregated quantities ready to order

---

## Users & Roles

| Role | Description | Access |
|------|-------------|--------|
| **Admin** | The platform owner (importer) | Full access — product management, client management, order tracking, batches |
| **Client** | Tunisian shop owner | Catalog browsing, pre-ordering, order tracking, messaging |

> Clients must register and be **manually approved** by the admin before accessing the catalog.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 14 (App Router) | TypeScript, server components, server actions |
| Database | Supabase (PostgreSQL) | Auth, storage, RLS policies |
| UI Library | Tailwind CSS + shadcn/ui | Consistent, professional component system |
| File Import | `xlsx` | Parse .csv / .xls / .xlsx |
| Image Upload | `react-dropzone` | Drag & drop + URL paste |
| Forms | `react-hook-form` + `zod` | Validated forms with schema |
| Icons | `lucide-react` | Consistent icon set |
| Deployment | Vercel | Zero-config Next.js hosting |

### Supabase Project
- **Project URL:** `https://nepdkfhnjlxctcnnofnm.supabase.co`
- **Project Ref:** `nepdkfhnjlxctcnnofnm`

---

## Database Schema

### Tables

#### `profiles`
Extends Supabase `auth.users`. Created automatically on signup via trigger.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | FK → auth.users |
| email | TEXT | |
| full_name | TEXT | |
| shop_name | TEXT | For client accounts |
| phone | TEXT | |
| role | TEXT | `admin` or `client` |
| approved | BOOLEAN | Admin must approve clients |
| created_at | TIMESTAMPTZ | |

#### `categories`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name_en | TEXT | |
| name_fr | TEXT | |
| name_ar | TEXT | |
| slug | TEXT | Unique URL-friendly identifier |
| parent_id | UUID | Self-referencing for subcategories |

#### `products`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name_en / name_fr / name_ar | TEXT | Trilingual names |
| description_en / _fr / _ar | TEXT | Trilingual descriptions |
| category_id | UUID | FK → categories |
| brand | TEXT | |
| tags | TEXT[] | Array of tags |
| images | TEXT[] | Array of image URLs |
| cost_price | DECIMAL | In CNY (internal, not shown to clients) |
| selling_price | DECIMAL | In TND (shown to clients) |
| unit | TEXT | e.g., pièce, kg, boîte |
| min_order_qty | INTEGER | Minimum per shop |
| stock_status | TEXT | `available`, `limited`, `unavailable` |
| is_published | BOOLEAN | Admin controls visibility |

#### `preorders`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| product_id | UUID | FK → products |
| client_id | UUID | FK → profiles |
| quantity | INTEGER | Ordered by this shop |
| agreed_price | DECIMAL | Can differ after negotiation |
| notes | TEXT | Client notes |
| status | TEXT | See statuses below |
| batch_id | UUID | FK → batches (assigned when confirmed) |

#### `batches`
Groups of products the admin orders together from China.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | TEXT | e.g., "Commande Juin 2026" |
| status | TEXT | `collecting`, `confirmed`, `ordered`, `arrived`, `distributed` |
| china_order_date | DATE | |
| estimated_arrival | DATE | |
| actual_arrival | DATE | |
| notes | TEXT | |

#### `messages`
Per-preorder negotiation threads.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| preorder_id | UUID | FK → preorders |
| sender_id | UUID | FK → profiles |
| content | TEXT | |
| created_at | TIMESTAMPTZ | |

---

## Pre-order Status Lifecycle

```
pending → confirmed → ordered → arrived → delivered
                ↘ cancelled
```

| Status | French | Arabic | Color |
|--------|--------|--------|-------|
| pending | En attente | قيد الانتظار | Yellow |
| confirmed | Confirmé | مؤكد | Blue |
| ordered | Commandé en Chine | تم الطلب من الصين | Purple |
| arrived | Arrivé en Tunisie | وصل إلى تونس | Orange |
| delivered | Livré | تم التسليم | Green |
| cancelled | Annulé | ملغى | Red |

---

## Features

### Admin Features

#### Product Management
- [ ] Add product manually via form
  - [ ] Trilingual name/description tabs (FR / AR / EN)
  - [ ] Category selection (with subcategories)
  - [ ] Brand, tags (comma-separated, shown as badges)
  - [ ] Image upload: drag & drop to Supabase Storage
  - [ ] Image import: paste URL → auto-preview
  - [ ] Cost price (CNY) + Selling price (TND)
  - [ ] Unit, minimum order quantity
  - [ ] Stock status toggle
  - [ ] Publish/unpublish toggle
- [ ] Edit existing product
- [ ] Delete product
- [ ] Bulk import via CSV / Excel (.csv, .xls, .xlsx)
  - [ ] Column mapping: name_en, name_fr, brand, category, selling_price, min_order_qty, images (semicolon-separated URLs), tags
  - [ ] Preview table before confirming import

#### Client Management
- [ ] View all registered shops
- [ ] Approve / reject pending registrations
- [ ] View client details (shop name, phone, orders)
- [ ] Suspend a client account

#### Order Management
- [ ] Aggregated orders view per product:
  - Total units ordered across all shops
  - Number of shops that ordered
  - Current collective status
- [ ] Drill down per product: see which shop ordered how many
- [ ] Update order status (bulk or per shop)
- [ ] Send message to a client per order
- [ ] Set agreed price per shop (override default selling price)

#### Batches (China Orders)
- [ ] Create a batch (group of products to order together)
- [ ] Assign confirmed pre-orders to a batch
- [ ] Track batch status: collecting → ordered → arrived → distributed
- [ ] Set estimated and actual arrival dates
- [ ] View all products in a batch with quantities

#### Dashboard
- [ ] Total pre-orders pending
- [ ] Total units to order
- [ ] Clients awaiting approval
- [ ] Recent activity feed
- [ ] Revenue overview (TND)

---

### Client (Shop) Features

#### Catalog
- [ ] Browse all published products in a grid
- [ ] Filter by: category, brand, price range, stock status
- [ ] Search by name or tag
- [ ] Product detail page: images gallery, description, brand, price, min qty
- [ ] Multilingual toggle (FR / AR / EN)

#### Pre-orders
- [ ] Place pre-order from product detail page
  - [ ] Quantity input (respects minimum order)
  - [ ] Optional note to admin
  - [ ] Confirm submission
- [ ] View "Mes Commandes" — all pre-orders with live status
- [ ] Cancel a pending pre-order

#### Messaging / Negotiation
- [ ] Per-order message thread with admin
- [ ] See agreed price updates from admin
- [ ] Notification indicator for unread messages

---

### Auth & Access
- [ ] Email/password login (Supabase Auth)
- [ ] Shop registration form (shop name, full name, phone, email, password)
- [ ] Account pending approval page (shown after register)
- [ ] Admin approves → client gets access to catalog
- [ ] Protected routes via Next.js middleware

---

## Project Structure

```
GenXPac/
├── app/
│   ├── layout.tsx                        # Root layout
│   ├── page.tsx                          # Redirect logic
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (admin)/
│   │   ├── layout.tsx                    # Admin layout with sidebar
│   │   ├── admin/page.tsx                # Dashboard
│   │   ├── admin/products/page.tsx       # Products list
│   │   ├── admin/products/new/page.tsx   # Add product
│   │   ├── admin/products/[id]/edit/page.tsx
│   │   ├── admin/import/page.tsx         # CSV/Excel import
│   │   ├── admin/orders/page.tsx         # Aggregated orders
│   │   ├── admin/clients/page.tsx        # Client management
│   │   └── admin/batches/page.tsx        # China order batches
│   └── (shop)/
│       ├── layout.tsx                    # Shop layout with sidebar
│       ├── catalog/page.tsx              # Product grid
│       ├── catalog/[id]/page.tsx         # Product detail
│       ├── preorders/page.tsx            # My orders
│       └── messages/page.tsx            # Negotiations
├── components/
│   ├── ui/                               # shadcn/ui auto-generated
│   ├── admin/
│   │   ├── AdminSidebar.tsx
│   │   ├── ProductForm.tsx
│   │   ├── CsvImport.tsx
│   │   ├── OrdersTable.tsx
│   │   └── ClientsTable.tsx
│   └── shop/
│       ├── ShopSidebar.tsx
│       ├── ProductCard.tsx
│       ├── PreorderForm.tsx
│       └── MessageThread.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Browser Supabase client
│   │   └── server.ts                     # Server Supabase client (SSR)
│   └── utils.ts
├── types/
│   └── database.ts                       # TypeScript types for all tables
├── middleware.ts                         # Auth + role-based route protection
├── supabase/
│   └── schema.sql                        # Full DB schema (apply in Supabase SQL editor)
├── scripts/
│   └── seed-admin.mjs                    # Create first admin account
├── .env.local                            # Supabase credentials (not committed)
└── PROJECT.md                            # This file
```

---

## Advancement & Status

### Phase 0 — Planning ✅
- [x] Business model defined
- [x] Feature set scoped
- [x] Tech stack chosen (Next.js 14 + Supabase + shadcn/ui)
- [x] Database schema designed
- [x] Supabase project created and credentials collected
- [x] Project documentation written (this file)

### Phase 1 — Project Scaffold 🔲
- [ ] Initialize Next.js 14 project with TypeScript + Tailwind
- [ ] Install all dependencies
- [ ] Initialize shadcn/ui
- [ ] Create `.env.local` with Supabase credentials
- [ ] Apply database schema via Supabase SQL editor
- [ ] Configure Supabase Storage bucket (`product-images`)
- [ ] Write `middleware.ts` for route protection
- [ ] Create Supabase client helpers (`lib/supabase/`)
- [ ] Create TypeScript database types (`types/database.ts`)

### Phase 2 — Auth & User Management 🔲
- [ ] Login page
- [ ] Shop registration page
- [ ] "Pending approval" holding page
- [ ] Admin: client list + approve/reject
- [ ] Seed first admin account (`scripts/seed-admin.mjs`)

### Phase 3 — Product Catalog (Admin) 🔲
- [ ] Product list page with search/filter
- [ ] Add product form (multilingual, image upload, URL import)
- [ ] Edit product page
- [ ] Delete product
- [ ] Categories management

### Phase 4 — CSV/Excel Import 🔲
- [ ] File upload UI (drag & drop)
- [ ] Parse .csv / .xls / .xlsx with `xlsx`
- [ ] Column mapping and preview table
- [ ] Bulk insert to Supabase

### Phase 5 — Client Catalog & Pre-orders 🔲
- [ ] Product grid page with filters
- [ ] Product detail page
- [ ] Pre-order modal (quantity + note)
- [ ] "My orders" page with status tracking
- [ ] Cancel pending order

### Phase 6 — Order Aggregation (Admin) 🔲
- [ ] Aggregated orders table (product → total units → # shops)
- [ ] Drill-down per product: which shops, how many
- [ ] Bulk status update
- [ ] Assign orders to a batch

### Phase 7 — Batches 🔲
- [ ] Create batch page
- [ ] Assign pre-orders to batch
- [ ] Track batch lifecycle
- [ ] Set dates (ordered, estimated arrival, actual arrival)

### Phase 8 — Messaging / Negotiation 🔲
- [ ] Per-order message thread
- [ ] Admin: reply from order detail
- [ ] Client: message tab in "My Orders"
- [ ] Unread indicator

### Phase 9 — Polish & Deployment 🔲
- [ ] Multilingual UI toggle (FR / AR / EN)
- [ ] RTL layout support for Arabic
- [ ] Mobile responsive review
- [ ] Loading states and error handling throughout
- [ ] Deploy to Vercel
- [ ] Connect custom domain (if available)

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://nepdkfhnjlxctcnnofnm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

> Never commit `.env.local` to git.

---

## Conventions

- **Language:** French primary in UI labels, English in code (variable names, comments)
- **Currency:** TND (Tunisian Dinar) displayed to clients; CNY stored internally as cost
- **Dates:** `DD/MM/YYYY` format for Tunisian users
- **Images:** Stored as URL arrays; actual files go to Supabase Storage `product-images` bucket
- **Server Components** for all data fetching; **Client Components** only for interactivity
- **Server Actions** for all mutations (form submissions, status updates)
