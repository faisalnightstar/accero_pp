# Codebase Structure

**Analysis Date:** 2026-09-28

## Directory Layout

```
accero_pp/
├── .planning/                          # GSD planning directory
│   └── codebase/                       # Architectural codebase maps
├── printportal/                        # Primary project root
│   ├── config.php                      # Root database connection configuration
│   ├── design.md                       # Design and API specifications
│   ├── index.php                       # Legacy landing page
│   ├── login.php                       # User authentication
│   ├── register.php                    # New user onboarding
│   ├── admin/                          # Main legacy administrative and card print module
│   │   ├── config.php                  # Admin-specific database connection
│   │   ├── route_guard.php             # Session validation and access control
│   │   ├── userHeader.php              # Shared admin header, navigation & wallet display
│   │   ├── userFooter.php              # Shared admin scripts and footer
│   │   ├── aadhar/                     # Aadhaar card print templates & background assets
│   │   │   ├── aadhar.php              # Aadhaar card print preview renderer
│   │   │   ├── aadhar.css              # Print stylesheet with precise CSS coordinate placements
│   │   │   ├── phpqrcode/              # QR code generator library for Aadhaar cards
│   │   │   └── *.jpg                   # Background template images (Hindi, Bengali, Marathi, etc.)
│   │   ├── voter/                      # Voter card print templates & background assets
│   │   │   ├── voter.php               # Voter card print preview renderer
│   │   │   ├── voterhindifront.jpg     # Front card canvas background
│   │   │   └── voterhindiback.jpg      # Back card canvas background
│   │   ├── aadharmanualnew.php         # Manual Aadhaar data entry form
│   │   ├── aadharmanuallist.php        # Stored manual Aadhaar records
│   │   ├── pan_advance.php             # Advanced PAN verification workflow
│   │   ├── panmanuls.php               # Manual PAN entry form
│   │   ├── Pan_Advance_Axen2.php       # PAN lookup via NeoAPI & card layout
│   │   ├── Pan_Advance_Axen2.css       # PAN card layout styling
│   │   ├── voter_new_print.php         # Voter ID verification via NeoAPI with captcha
│   │   ├── voter_new_print_2.php       # Voter ID lookup via FastNexora API
│   │   ├── DLFind_Axen.php             # Driving License lookup via AxenAPI
│   │   ├── dlprint-form.php            # Driving License manual entry form
│   │   ├── dl-print-view.php           # Driving License print view
│   │   ├── rc.php                      # Vehicle Registration Certificate (RC) form
│   │   ├── rc_get_chip_print_new.php   # RC chip card print layout
│   │   ├── wallect.php                 # Wallet recharge & transaction logs
│   │   └── package.json                # AdminLTE dependency manifest
│   ├── newportal/                      # Modernized PHP refactor prototype
│   │   ├── app/                        # Application core
│   │   │   └── bootstrap.php           # Service container and global initialization
│   │   ├── api/                        # REST API routing
│   │   │   └── index.php               # Front-controller for JSON API routes
│   │   ├── FastNexora-PrintPortal.sql  # Complete MySQL database export (50+ tables)
│   │   ├── config.php                  # Structured app configuration
│   │   └── dashboard.php               # Modular user dashboard
│   ├── API_TESTING/                    # API test scripts and payload samples
│   └── NEOAPI TESTING/                 # NeoAPI response screenshots and test records
```

## Key File Locations

### Verification & API Handlers
- **Voter Verification:** `printportal/admin/voter_new_print.php`, `printportal/admin/voter_new_print_2.php`
- **PAN Verification:** `printportal/admin/Pan_Advance_Axen2.php`, `printportal/admin/api.php`
- **DL & RC Verification:** `printportal/admin/DLFind_Axen.php`, `printportal/admin/rc_get_chip_print_new.php`
- **Aadhaar OTP:** `printportal/admin/aadharnumberfind.php` (referenced in `design.md`)

### Manual Form Entry
- **Aadhaar Manual:** `printportal/admin/aadharmanualnew.php`
- **PAN Manual:** `printportal/admin/panmanuls.php`
- **DL Manual:** `printportal/admin/dlprint-form.php`
- **RC Manual:** `printportal/admin/rc.php`

### Print Renderers & Assets
- **Aadhaar Print Template:** `printportal/admin/aadhar/aadhar.php`, `printportal/admin/aadhar/aadhar.css`
- **Voter Print Template:** `printportal/admin/voter/voter.php`
- **PAN Print Template:** `printportal/admin/Pan_Advance_Axen2.php`, `printportal/admin/Pan_Advance_Axen2.css`
- **RC Print Template:** `printportal/admin/rc_get_chip_print_new.php`, `printportal/admin/rc_get_chip_print.css`

## Naming Conventions & Patterns

### File Naming
- Inconsistent legacy conventions: snake_case (`voter_new_print.php`), PascalCase with suffixes (`Pan_Advance_Axen2.php`), concatenated strings (`aadharmanuallist.php`, `wallect.php`), and spaces in filenames (`voter new print.php`).
- **Target Next.js Standard:** Kebab-case for routes and utility files (`pan-card`, `verify-api.ts`), PascalCase for React components (`PanCardPreview.tsx`, `DocumentEditor.tsx`).

### Database Table Naming
- Mix of singular and plural nouns: `users`, `setting` vs `settings`, `aadharauto`, `voterauto3`, `dlprint`, `rc_vehical`.
- **Target MongoDB Collection Standard:** Lowercase plural or PascalCase models (`users`, `documents`, `walletTransactions`, `apiLogs`).

---

*Structure analysis: 2026-09-28*
*Prepared for Next.js & MongoDB migration*
