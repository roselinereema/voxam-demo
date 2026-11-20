# VOXAM - reorganized frontend

## Source structure

- `src/components/` - shared UI components and layouts
- `src/pages/Landing/` - public landing page
- `src/pages/Auth/` - role-selecting demo login
- `src/pages/Staff/` - staff pages
- `src/pages/Student/` - student pages
- `src/services/` - reserved for API integration
- `src/assets/` - images and static assets

## Run locally

```bash
npm install
npm run dev
```

The current login is a frontend demo only. It does not authenticate users or protect routes. Connect backend authentication before treating `ProtectedRoute` as a security boundary.
