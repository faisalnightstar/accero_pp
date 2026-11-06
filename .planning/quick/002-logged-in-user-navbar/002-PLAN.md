# Quick Task 002: Dedicated Navigation Bar for Logged-In Users

## Objective
Create a dedicated, feature-rich Navigation Bar component for authenticated users (`UserNavbar`) separated from the public marketing navbar:
- **Component Architecture**:
  - `src/components/layout/UserNavbar.tsx`: Dedicated logged-in navigation bar with workspace navigation, live wallet balance pill + recharge trigger, quick print CTA, interactive user profile dropdown with logout, and responsive mobile drawer.
  - `src/components/layout/PublicNavbar.tsx`: Clean marketing navbar for unauthenticated visitors.
  - `src/components/layout/Navbar.tsx`: Smart dispatcher rendering `UserNavbar` for authenticated users and `PublicNavbar` for visitors.
- **Features in `UserNavbar`**:
  - **Portal Navigation**: Links to `/dashboard`, `/studio`, `/cards`, and `/wallet` with active route pill highlighting and Lucide icons.
  - **Live Wallet Widget**: Real-time balance display, low balance warning indicator (< ₹50), and one-click "+ Top-up" button triggering `RechargeModal`.
  - **Quick Action**: "+ New Print" button taking user directly to the Interactive Studio.
  - **User Profile Dropdown**: User avatar initials, name, email/phone, current balance, direct links, and logout action calling `/api/auth/logout`.
  - **Mobile Drawer**: Fully responsive mobile menu with user profile header, wallet badge, route list, and logout.
- **Verification**: Typecheck (`npx tsc --noEmit`) and Next.js production build (`npm run build`).

## Deliverables
1. `src/components/layout/UserNavbar.tsx` - Authenticated navbar component with dropdowns, wallet actions, and mobile drawer.
2. `src/components/layout/PublicNavbar.tsx` - Public marketing navbar component.
3. `src/components/layout/Navbar.tsx` - Controller switching between `UserNavbar` and `PublicNavbar`.
4. Verification and build confirmation.
