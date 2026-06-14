# Products Command Center — Frontend

A modern, futuristic, production-grade React frontend for the Products Management API. Built with a dark-first enterprise dashboard aesthetic.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript 5 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| Server State | TanStack Query v5 |
| Forms | React Hook Form v7 |
| Validation | Zod |
| HTTP | Axios |
| Animations | Framer Motion |
| Icons | Lucide React |
| Toasts | React Hot Toast |

## Folder Structure

```
src/
├── app/              # App bootstrap, router, providers, protected route
├── assets/           # Static assets
├── components/
│   ├── layout/       # DashboardLayout, Sidebar, TopBar
│   ├── ui/           # Button, Input, Textarea, Select, Card, Badge, Modal
│   └── feedback/     # LoadingSkeleton, EmptyState, ErrorState, ConfirmDialog
├── features/
│   ├── auth/         # Login page, API, token store, types
│   ├── products/     # Products CRUD pages, components, API, schemas, types
│   ├── health/       # Health check page, API, types
│   └── dashboard/    # Dashboard overview page
├── lib/              # apiClient, authToken, date, formatters, utils
├── pages/            # NotFoundPage (404)
└── styles/           # globals.css (Tailwind base)
```

## Environment Setup

Copy `.env.example` to `.env.local` and set the API URL:

```bash
cp .env.example .env.local
```

```env
VITE_API_BASE_URL=https://localhost:7001
```

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server runs on `http://localhost:5173` by default.

## Connecting to the Backend

1. Start the .NET Products Web API (ensure it's running on the URL in `VITE_API_BASE_URL`).
2. If the API uses a self-signed certificate in development, you may need to trust it in your browser.
3. CORS must be configured on the API to allow requests from `http://localhost:5173`.

## Authentication

- Uses JWT Bearer authentication.
- Credentials are entered on the `/login` page (default: `admin` / `Admin@12345`).
- The token is stored in `localStorage` under the key `pcc_access_token`.
- All secured API requests automatically attach `Authorization: Bearer <token>`.
- On 401 responses, the token is cleared and the user is redirected to `/login` with a session-expired notice.
- On logout, the token is cleared from storage.

## Available Routes

| Route | Description |
|---|---|
| `/login` | Authentication page |
| `/dashboard` | Overview dashboard with metrics |
| `/products` | Products list with search and colour filter |
| `/products/create` | Create new product form |
| `/products/:id` | Product detail view |
| `/products/:id/edit` | Edit product form |
| `/health` | API health status page |
| `*` | 404 not found page |

## Production Considerations

- Replace `localStorage` token storage with `httpOnly` cookie-based auth for production workloads.
- Configure a proper CORS policy on the backend.
- Set `VITE_API_BASE_URL` to your production API URL at build time.
- Enable HTTPS on both frontend and backend.
- Review Content Security Policy headers.
- TanStack Query DevTools are included in development; they are excluded from production builds.
