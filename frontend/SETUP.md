# Setup

1. `npm install`
2. Copy `.env.example` to `.env` and point `VITE_API_URL` at your backend
   (your api-gateway once it proxies /auth, or users-service directly for now
   e.g. http://localhost:3001)
3. `npm run dev` — runs on http://localhost:5173

## What's wired up
- `/` — landing page
- `/register` — calls POST {API_URL}/auth/register with { email, password }
- `/login` — calls POST {API_URL}/auth/login, expects { user, accessToken } back
- `/dashboard` — placeholder, protected route, only reachable after login

## What's a stub / needs your backend to match
- `src/lib/api.ts` — the `authApi.login` call expects your backend to return
  `{ user: { id, email, role }, accessToken }`. Adjust the `AuthResponse`
  type and the destructuring in `Login.tsx` if your actual response shape
  differs once you build that endpoint.
- Access token is currently kept in `sessionStorage` for simplicity. If you
  end up issuing refresh tokens via httpOnly cookies (recommended, discussed
  earlier), you won't need to store the access token client-side at all in
  the same way — that's a deliberate decision to revisit once login/refresh
  is built.
- Password complexity regex in `Register.tsx` mirrors the one in your
  `CreateUserDto` — keep these in sync if you change one.
