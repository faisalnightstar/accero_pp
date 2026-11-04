# Quick Task 001: Forgot Password Flow

## Objective
Implement an end-to-end Forgot Password & Reset Password workflow for PrintPortal Next.js:
- Model support in `User.ts` for hashed reset tokens and expiry.
- SMTP mailer in `src/lib/mail.ts` using existing `.env.local` SMTP configuration with graceful console fallback.
- `POST /api/auth/forgot-password` endpoint supporting email or phone lookup, token generation, and email dispatch.
- `POST /api/auth/reset-password` endpoint verifying tokens and updating password hashes.
- UI pages:
  - Add "Forgot Password?" link to `src/app/(auth)/login/page.tsx`.
  - Create `src/app/(auth)/forgot-password/page.tsx`.
  - Create `src/app/(auth)/reset-password/page.tsx` with password visibility toggles and token validation.
- Typecheck and Next.js production build verification.

## Deliverables
1. `src/models/User.ts` - Add `resetPasswordToken` and `resetPasswordExpires`.
2. `src/lib/mail.ts` - Modular mail service configured with SMTP env vars.
3. `src/app/api/auth/forgot-password/route.ts` - Password reset request endpoint.
4. `src/app/api/auth/reset-password/route.ts` - Password reset confirmation endpoint.
5. `src/app/(auth)/login/page.tsx` - Add "Forgot Password?" link.
6. `src/app/(auth)/forgot-password/page.tsx` - Forgot password request UI.
7. `src/app/(auth)/reset-password/page.tsx` - Reset password UI with token verification.
