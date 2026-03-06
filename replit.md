# replit.md

## Overview

CardXchange is a full-stack gift card exchange platform where users can buy and sell gift cards. The application features JWT-based authentication, role-based access control (USER and SUPER_ADMIN), KYC verification with Cloudinary image uploads, sell request management, payout details, and an admin dashboard. The UI is mobile-first with an app-like layout that works on both mobile and desktop.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, bundled via Vite
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state; no separate client state library
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support), custom fonts (Outfit for display, Plus Jakarta Sans for body)
- **Auth Pattern**: JWT token stored in `localStorage` under key `auth_token`. An `authenticatedFetch` wrapper in `client/src/lib/api-client.ts` automatically injects the `Authorization: Bearer <token>` header on all API calls
- **Protected Routes**: `ProtectedRoute` component checks auth state and optionally enforces `SUPER_ADMIN` role
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Framework**: Express.js with TypeScript, run via tsx
- **API Structure**: RESTful API with routes defined in `server/routes.ts`, with a shared route contract in `shared/routes.ts` that both client and server reference
- **Authentication**: JWT-based with bcryptjs for password hashing. Middleware (`requireAuth`) extracts user from Bearer token
- **File Uploads**: Multer with Cloudinary storage adapter for KYC document uploads (max 5MB, JPG/PNG/WEBP)
- **Development**: Vite dev server integrated as middleware for HMR during development (`server/vite.ts`)
- **Production**: Client built to `dist/public`, server bundled via esbuild to `dist/index.cjs`

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` — shared between frontend (for type inference) and backend
- **Schema Push**: `drizzle-kit push` (no migration files approach, uses `db:push` script)
- **Connection**: `DATABASE_URL` environment variable required, uses `pg` Pool
- **Tables**:
  - `users` — id, fullName, email, phoneNumber, password, role (USER/SUPER_ADMIN), isKycVerified, createdAt
  - `gift_cards` — id, title, description, price, discount, imageUrl, isActive
  - `sell_requests` — id, userId, brandName, cardNumber, cardPin, balance, expiryDate, status (Pending/Approved/Rejected), rejectionNote, createdAt
  - `payout_details` — id, userId, accountHolderName, bankName, accountNumber, ifscCode
  - `kyc_documents` — id, userId (unique), plus status and image fields
  - `banners` — promotional banners for the home page
  - `support_tickets` — user support system

### Storage Layer
- `server/storage.ts` implements `IStorage` interface with `DatabaseStorage` class
- All database operations go through this storage abstraction layer

### API Route Contract
- `shared/routes.ts` defines the full API contract with paths, methods, input schemas (Zod), and response schemas
- This shared contract ensures type safety between frontend hooks and backend handlers
- Frontend hooks in `client/src/hooks/` correspond to each API domain (auth, gift cards, sell requests, KYC, payouts, banners, admin)

### Build System
- **Dev**: `tsx server/index.ts` runs the Express server with Vite middleware
- **Build**: Custom `script/build.ts` runs Vite build for client + esbuild for server, with selective dependency bundling via an allowlist to optimize cold starts
- **Output**: `dist/public/` for client assets, `dist/index.cjs` for server

## External Dependencies

### Database
- **PostgreSQL**: Connected via `DATABASE_URL` environment variable. Drizzle ORM for schema definition and queries. Must be provisioned (Replit Postgres or external).

### Cloudinary
- **Purpose**: KYC document image uploads and storage
- **Integration**: Server-side upload via `cloudinary` npm package and `multer-storage-cloudinary`
- **Configuration**: Cloud name, API key, and API secret configured in `server/routes.ts` (should be moved to environment variables)
- **Settings**: Images stored in `kyc_docs` folder as authenticated/private resources with auto quality and format optimization

### Key Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (required)
- `JWT_SECRET` — Secret for signing JWT tokens (has a fallback default, should be set in production)
- Cloudinary credentials (currently hardcoded, should be `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)

### Major NPM Dependencies
- **Server**: express, jsonwebtoken, bcryptjs, drizzle-orm, pg, multer, cloudinary, multer-storage-cloudinary, zod
- **Client**: react, wouter, @tanstack/react-query, framer-motion, date-fns, recharts, shadcn/ui component suite (Radix UI primitives), tailwindcss
- **Shared**: zod (validation), drizzle-zod (schema-to-zod bridge)