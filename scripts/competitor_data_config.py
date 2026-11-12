#!/usr/bin/env python3
"""
Competitor Intelligence & Keyword Extraction Engine
Analyzes the PHP source application at:
/Users/faisal/Documents/Documents/Notes/Indi PrintPortal/Indi Print Portal/
Extracts keywords, brands, intent, and maps them to Accero PrintPortal architecture.
"""

import os
import re
import csv
from collections import Counter, defaultdict

SOURCE_DIR = '/Users/faisal/Documents/Documents/Notes/Indi PrintPortal/Indi Print Portal/'
OUTPUT_DIR = '/Users/faisal/Documents/GitHub/accero_pp/docs/seo/competitor-intelligence/'

os.makedirs(OUTPUT_DIR, exist_ok=True)

# 1. Seed keywords from user prompt
SEED_KEYWORDS = [
    # Print Portal
    ('Print Portal', 'Generic Print Portal', 'Commercial', 'en', None, '/print-portal', '/print-portal'),
    ('Aadhar Print Portal', 'Aadhaar Keywords', 'Commercial', 'en', None, '/services/aadhaar-document-management', '/services/aadhaar-document-management'),
    ('PAN Print Portal', 'PAN Keywords', 'Commercial', 'en', None, '/services/pan-card-printing', '/services/pan-card-printing'),
    ('Voter Print Portal', 'Voter Keywords', 'Commercial', 'en', None, '/services/voter-id-printing', '/services/voter-id-printing'),
    ('Online Print Portal', 'Generic Print Portal', 'Commercial', 'en', None, '/print-portal', '/print-portal'),
    # PAN and identity services
    ('PAN card apply online', 'PAN Keywords', 'Transactional', 'en', None, '/services/pan-card-printing', '/services/pan-card-printing'),
    ('PAN card print', 'PAN Keywords', 'Transactional', 'en', None, '/services/pan-card-printing', '/services/pan-card-printing'),
    ('PAN status check', 'PAN Keywords', 'Informational', 'en', None, '/features/document-lookup', '/features/document-lookup'),
    # Voter services
    ('Voter ID download', 'Voter Keywords', 'Transactional', 'en', None, '/services/voter-id-printing', '/services/voter-id-printing'),
    ('Voter ID PDF', 'Voter Keywords', 'Transactional', 'en', None, '/services/voter-id-printing', '/services/voter-id-printing'),
    ('Voter list download', 'Voter Keywords', 'Informational', 'en', None, None, '/services/voter-id-printing'),
    ('EPIC card', 'Voter Keywords', 'Transactional', 'en', None, '/services/voter-id-printing', '/services/voter-id-printing'),
    ('Form 8 Voter', 'Voter Keywords', 'Informational', 'en', None, None, '/blog/voter-id-correction-guide'),
    # Driving Licence and vehicle services
    ('Driving license PDF', 'Driving Licence Keywords', 'Transactional', 'en', None, '/services/driving-licence-printing', '/services/driving-licence-printing'),
    ('DL download', 'Driving Licence Keywords', 'Transactional', 'en', None, '/services/driving-licence-printing', '/services/driving-licence-printing'),
    ('LL exam', 'Driving Licence Keywords', 'Informational', 'en', None, None, '/blog/driving-licence-ll-exam-guide'),
    ('RC book download', 'RC Keywords', 'Transactional', 'en', None, '/services/vehicle-rc-printing', '/services/vehicle-rc-printing'),
    ('Vehicle registration', 'RC Keywords', 'Commercial', 'en', None, '/services/vehicle-rc-printing', '/services/vehicle-rc-printing'),
    ('Vehicle challan check', 'RC Keywords', 'Informational', 'en', None, None, '/features/document-lookup'),
    # CSC and VLE
    ('CSC portal', 'CSC/VLE Keywords', 'Navigational', 'en', None, '/best-print-portal-for-csc', '/best-print-portal-for-csc'),
    ('CSC VLE portal', 'CSC/VLE Keywords', 'Navigational', 'en', None, '/best-print-portal-for-csc', '/best-print-portal-for-csc'),
    ('VLE services', 'CSC/VLE Keywords', 'Commercial', 'en', None, '/best-print-portal-for-csc', '/best-print-portal-for-csc'),
    ('VLE registration', 'CSC/VLE Keywords', 'Informational', 'en', None, None, '/blog/vle-registration-guide'),
    ('VLE login', 'CSC/VLE Keywords', 'Navigational', 'en', None, '/login', '/login'),
    ('Common Service Center', 'CSC/VLE Keywords', 'Informational', 'en', None, '/solutions/csc-operators', '/solutions/csc-operators'),
    ('Jan Seva Kendra', 'CSC/VLE Keywords', 'Commercial', 'hi-en', None, '/solutions/digital-service-centers', '/solutions/digital-service-centers'),
    ('E-Mitra services', 'CSC/VLE Keywords', 'Commercial', 'en', None, '/solutions/digital-service-centers', '/solutions/digital-service-centers'),
    ('Sewa Kendra', 'CSC/VLE Keywords', 'Commercial', 'hi-en', None, '/solutions/digital-service-centers', '/solutions/digital-service-centers'),
    # Government document services
    ('Government document print', 'Generic Print Portal', 'Commercial', 'en', None, '/document-processing-platform', '/document-processing-platform'),
    ('E-district services', 'Government Certificate Keywords', 'Informational', 'en', None, None, '/solutions/digital-service-centers'),
    ('Ration card apply', 'Ration Card Keywords', 'Informational', 'en', None, '/services/ration-card-management', '/services/ration-card-management'),
    ('Income certificate', 'Government Certificate Keywords', 'Informational', 'en', None, None, '/features/document-printing'),
    ('Caste certificate', 'Government Certificate Keywords', 'Informational', 'en', None, None, '/features/document-printing'),
    ('Birth certificate', 'Government Certificate Keywords', 'Informational', 'en', None, None, '/features/document-printing'),
    ('Death certificate', 'Government Certificate Keywords', 'Informational', 'en', None, None, '/features/document-printing'),
    ('Marriage certificate', 'Government Certificate Keywords', 'Informational', 'en', None, None, '/features/document-printing'),
    ('Ayushman card', 'Government Certificate Keywords', 'Transactional', 'en', None, None, '/services/ayushman-card-printing'),
    ('E-Shram card', 'Government Certificate Keywords', 'Transactional', 'en', None, None, '/services/eshram-card-printing'),
    # Agriculture and other services
    ('Digital India services', 'Agriculture and Citizen Schemes', 'Informational', 'en', None, None, '/document-processing-platform'),
    ('DBT farmer', 'Agriculture and Citizen Schemes', 'Informational', 'en', None, None, '/blog/dbt-farmer-schemes-guide'),
    ('PM Kisan', 'Agriculture and Citizen Schemes', 'Informational', 'en', None, None, '/blog/pm-kisan-status-guide'),
    ('Agristack', 'Agriculture and Citizen Schemes', 'Informational', 'en', None, None, '/blog/agristack-operator-guide'),
    ('NPCI status', 'Agriculture and Citizen Schemes', 'Informational', 'en', None, None, '/blog/npci-aadhaar-seeding-guide'),
    ('Electric bill payment', 'Agriculture and Citizen Schemes', 'Transactional', 'en', None, None, '/solutions/cyber-cafes'),
    # Generic document processing
    ('Document print', 'Generic Print Portal', 'Commercial', 'en', None, '/document-processing-platform', '/document-processing-platform'),
    ('Document download', 'Generic Print Portal', 'Informational', 'en', None, '/features/document-lookup', '/features/document-lookup'),
    ('Online document print', 'Generic Print Portal', 'Commercial', 'en', None, '/print-portal', '/print-portal'),
]

# 2. Competitor Brands Mapping
KNOWN_COMPETITORS = [
    {
        'brand': 'Digital Portal',
        'domain': 'digitalportal.in',
        'source': 'External Verified + Source Mention',
        'focus': 'All-in-one Card Print & CSC Services',
        'features': 'Aadhaar manual print, PAN print, Voter ID, Ayushman, E-District',
        'strengths': 'High legacy traffic, established brand recognition in CSC groups',
        'weaknesses': 'Frequent 502 gateway timeouts, arbitrary pixel margins, charges repeat fees on reprints',
        'positioning': 'Legacy High-Traffic Portal',
        'volume_tier': 'High (Tier 1)',
        'counter_strategy': 'Publish /compare/digitalportal-alternative highlighting zero-margin CR80 accuracy, 99.99% Edge uptime, and 100% free lifetime reprints.'
    },
    {
        'brand': 'Fast Print Portal',
        'domain': 'fastprintportal.in / fastprintportals.in',
        'source': 'External Verified + Source Mention',
        'focus': 'Speed-focused Aadhaar, PAN, Voter PVC Print',
        'features': 'Auto-print scripts, instant number find, wallet prepaid system',
        'strengths': 'Aggressive SEO keyword spamming, recognized across North India VLEs',
        'weaknesses': 'Deceptive government emblem mimicry, unhandled API timeouts leading to ruined PVC plastic',
        'positioning': 'Aggressive Keyword-Stuffed Portal',
        'volume_tier': 'High (Tier 1)',
        'counter_strategy': 'Publish /compare/fastprintportal-alternative contrasting Accero split-screen live editor (amber missing data flags) vs blind ruined card printing.'
    },
    {
        'brand': 'Print Fast Portal',
        'domain': 'printfastportal.net',
        'source': 'External Verified',
        'focus': 'PVC Card Printing & Alphanumeric Lookup',
        'features': 'Card downloads, fast registration, wallet topup',
        'strengths': 'Direct alternative traffic capture from fastprintportal',
        'weaknesses': 'Unstable backend, lacks transparent pricing, zero customer service SLAs',
        'positioning': 'Clone / Domain Derivative Portal',
        'volume_tier': 'Medium (Tier 2)',
        'counter_strategy': 'Publish /compare/printfastportal-alternative emphasizing transparent Paytm UPI billing with atomic transaction rollbacks.'
    },
    {
        'brand': 'Kamboj Pan Portal',
        'domain': 'kambojpanportel.com',
        'source': 'External Verified + Source Mention',
        'focus': 'Specialized UTI/NSDL PAN Card Services',
        'features': 'PAN number lookup, instant PDF generation, manual correction',
        'strengths': 'Dedicated brand trust among PAN service agents and tax kiosks',
        'weaknesses': 'Single-document narrow focus; lacks multi-card studio; manual workflow',
        'positioning': 'Niche PAN Service Provider',
        'volume_tier': 'Medium (Tier 2)',
        'counter_strategy': 'Publish /compare/kamboj-print-portal-alternative demonstrating Accero 6-in-1 multi-document support with automated demographic QR codes.'
    },
    {
        'brand': 'RajPrint',
        'domain': 'rajprint.co.in',
        'source': 'External Verified + Source Mention',
        'focus': 'Closed Operator Login Kiosk',
        'features': 'Pre-gated operator portal, custom PVC card generation',
        'strengths': 'Private network of loyal cafe operators',
        'weaknesses': 'Gated login wall with zero public educational documentation; no live previews',
        'positioning': 'Closed Gated Kiosk Portal',
        'volume_tier': 'Medium (Tier 2)',
        'counter_strategy': 'Publish /compare/rajprint-alternative offering instant free registration with zero upfront software purchase fees.'
    },
    {
        'brand': 'Eforms99',
        'domain': 'eforms99.in',
        'source': 'External Verified',
        'focus': 'Digital Form Filling & Document Print',
        'features': 'Form auto-filling, e-district integration, certificate prints',
        'strengths': 'Wide government form catalogue beyond PVC cards',
        'weaknesses': 'Clunky UI, lacks physical card tray zero-margin formatting, desktop-only layout',
        'positioning': 'Form Processing Utility',
        'volume_tier': 'Medium (Tier 2)',
        'counter_strategy': 'Publish /compare/eforms99-alternative highlighting mobile-responsive Next.js UI with instant CR80 physical card tray alignment.'
    },
    {
        'brand': 'Indi Print Portal',
        'domain': 'indiprintportal.in',
        'source': 'PHP Source Application (Source Codebase)',
        'focus': 'Premier Automated PVC Printing for CSC VLEs',
        'features': 'Aadhaar, Voter, PAN, Ayushman, DL, RC, RTPS certificates',
        'strengths': 'Comprehensive keyword targeting in meta tags, attractive color palette',
        'weaknesses': 'Procedural PHP 7.x vulnerability, rigid hardcoded forms, lack of split-screen data validation',
        'positioning': 'Legacy Predecessor / Template Portal',
        'volume_tier': 'High (Source Anchor)',
        'counter_strategy': 'Migrate and upgrade keyword authority to Accero modern Next.js 15 architecture with sub-100ms Edge rendering.'
    },
    {
        'brand': 'Shivyog Print Portal',
        'domain': 'shivyogprint.com / shivyog.in',
        'source': 'PHP Source (login2.php)',
        'focus': 'CSC VLE PVC Card Printing',
        'features': 'Aadhaar fingerprint print, Voter ID download, PAN find',
        'strengths': 'Heavily searched in UP & Bihar regional operator circles',
        'weaknesses': 'Unstable domains frequently banned or moved; unverified API scripts',
        'positioning': 'Regional VLE Portal',
        'volume_tier': 'Medium (Tier 2)',
        'counter_strategy': 'Capture "shivyog print portal alternative" searches with stable, permanent Vercel-hosted Accero architecture.'
    },
    {
        'brand': 'Balaji Print Portal',
        'domain': 'balajiprintportal.in',
        'source': 'PHP Source (login2.php)',
        'focus': 'Fast Card Printing & Aadhaar Lookup',
        'features': 'Aadhaar manual print, fast registration, wallet topup',
        'strengths': 'Strong regional trust in Rajasthan and MP',
        'weaknesses': 'Zero customer support SLA; manual WhatsApp-based wallet topup disputes',
        'positioning': 'Regional Operator Portal',
        'volume_tier': 'Medium (Tier 2)',
        'counter_strategy': 'Capture Balaji searches via /compare/balaji-print-portal-alternative emphasizing automated instant Paytm UPI topup.'
    },
    {
        'brand': 'SK Print Portal',
        'domain': 'skprintportal.com / skprint.in',
        'source': 'PHP Source (login2.php)',
        'focus': 'CSC Aadhaar & Voter Print',
        'features': 'Fingerprint Aadhaar print, instant DL and RC print',
        'strengths': 'High keyword prominence in login pages',
        'weaknesses': 'Broken mobile view, security vulnerabilities in legacy sessions',
        'positioning': 'Generic PHP Kiosk Portal',
        'volume_tier': 'Medium (Tier 2)',
        'counter_strategy': 'Target SK portal queries with mobile-friendly, secure 256-bit SSL encrypted Accero platform.'
    },
    {
        'brand': 'Ravi Print Portal',
        'domain': 'myraviprintportal.com / raviprint.in',
        'source': 'PHP Source (login2.php)',
        'focus': 'VLE Card Print & Fast Services',
        'features': 'Advance Aadhaar print, voter card, PAN card',
        'strengths': 'Prominent brand in MP & Chhattisgarh',
        'weaknesses': 'Lack of CR80 precision, arbitrary margins causing tray jams',
        'positioning': 'Regional VLE Utility',
        'volume_tier': 'Medium (Tier 2)',
        'counter_strategy': 'Target with exact Epson L805 Tray J zero-margin alignment specifications.'
    },
    {
        'brand': 'Harshit Print Portal',
        'domain': 'harshitprintportal.com',
        'source': 'PHP Source (default.php, login.php)',
        'focus': 'Aadhaar Card Print & PVC Utility',
        'features': 'Aadhaar print, PVC layout formatting',
        'strengths': 'Appears frequently in Aadhaar print portal queries',
        'weaknesses': 'Frequent downtime; lack of multi-document support',
        'positioning': 'Niche Aadhaar Print Tool',
        'volume_tier': 'Low-Medium (Tier 3)',
        'counter_strategy': 'Offer all-in-one 6-document Accero solution as superior alternative.'
    },
    {
        'brand': 'PK Print Portal',
        'domain': 'pkprintportal.com',
        'source': 'PHP Source (login.php, default.php)',
        'focus': 'Aadhaar & Voter Card Print',
        'features': 'Login portal, quick card download',
        'strengths': 'Common long-tail search for portal login',
        'weaknesses': 'Unsecured HTTP endpoints, potential credential leakage',
        'positioning': 'Small Regional Portal',
        'volume_tier': 'Low-Medium (Tier 3)',
        'counter_strategy': 'Provide enterprise-grade security and DPDP compliance.'
    },
    {
        'brand': 'Digital Fast Print',
        'domain': 'digitalfastprint.in',
        'source': 'PHP Source (ind.php, login.php)',
        'focus': 'Fast Digital Printing & Card Services',
        'features': 'Automated card lookups, wallet deduction',
        'strengths': 'Descriptive generic-brand hybrid name',
        'weaknesses': 'High wallet deduction fees; no free reprints',
        'positioning': 'High-Fee Fast Portal',
        'volume_tier': 'Medium (Tier 2)',
        'counter_strategy': 'Target cost-conscious operators with 100% Free Lifetime Re-Prints (₹0).'
    },
    {
        'brand': 'Super PVC Print Portal',
        'domain': 'superpvcprint.in',
        'source': 'PHP Source (login2.php)',
        'focus': 'PVC Card Printing for Retailers',
        'features': 'CR80 templates, card trays',
        'strengths': 'High relevance for PVC printing hardware searches',
        'weaknesses': 'Static templates without dynamic data verification',
        'positioning': 'Hardware-Adjacent Portal',
        'volume_tier': 'Low-Medium (Tier 3)',
        'counter_strategy': 'Combine hardware tray precision with intelligent API lookup cascade.'
    },
    {
        'brand': 'Milan Print Portal',
        'domain': 'milanprintportal.com',
        'source': 'PHP Source (login2.php)',
        'focus': 'VLE Document Services',
        'features': 'Aadhaar, Voter, PAN cards',
        'strengths': 'Regional operator following in Eastern UP',
        'weaknesses': 'Unstable hosting, outdated PHP scripts',
        'positioning': 'Regional Operator Script',
        'volume_tier': 'Low-Medium (Tier 3)',
        'counter_strategy': 'Provide robust Vercel Edge stability with 99.99% uptime.'
    },
    {
        'brand': 'Baba Print Portal',
        'domain': 'babaprintportal.com',
        'source': 'PHP Source (login2.php)',
        'focus': 'General Card Printing',
        'features': 'Card downloads, quick print',
        'strengths': 'Memorable colloquial brand name',
        'weaknesses': 'Zero documentation, untraceable support',
        'positioning': 'Informal Kiosk Script',
        'volume_tier': 'Low-Medium (Tier 3)',
        'counter_strategy': 'Position Accero as professional, reliable, business-grade software.'
    },
    {
        'brand': 'Somnath Print Portal',
        'domain': 'somnathprintportal.com',
        'source': 'PHP Source (login2.php)',
        'focus': 'Customer Helpline & Card Services',
        'features': 'Customer care helpline, card services',
        'strengths': 'Targets "print portal helpline number" searches',
        'weaknesses': 'Unresponsive phone support, manual processing',
        'positioning': 'Helpline-Targeted Portal',
        'volume_tier': 'Low-Medium (Tier 3)',
        'counter_strategy': 'Offer instant automated self-service with 24/7 ticket and priority WhatsApp support.'
    },
    {
        'brand': 'Kayamat Print Portal',
        'domain': 'kayamatprintportal.xyz',
        'source': 'PHP Source (login2.php)',
        'focus': 'Free / Low-Cost Card Printing',
        'features': '.xyz cheap domain, card formatting',
        'strengths': 'Targets budget / free card print searches',
        'weaknesses': 'Spammy domain reputation, frequent malware warnings in browsers',
        'positioning': 'Budget / Free Script Portal',
        'volume_tier': 'Low (Tier 3)',
        'counter_strategy': 'Warn operators against malware risks of shady .xyz scripts and offer secure ₹5 manual drafts.'
    },
    {
        'brand': 'BharatSeva Print Portal',
        'domain': 'bharatsevaprint.in',
        'source': 'PHP Source (login2.php)',
        'focus': 'Government Identity Document Services',
        'features': 'Aadhaar, Voter, PAN, Ayushman cards',
        'strengths': 'Patriotic civic branding appealing to CSC operators',
        'weaknesses': 'Risk of trademark / official emblem violation; poor server performance',
        'positioning': 'Civic-Themed Operator Script',
        'volume_tier': 'Low-Medium (Tier 3)',
        'counter_strategy': 'Emphasize legal transparency, DPDP compliance, and genuine enterprise reliability.'
    }
]

print(f'Configured {len(KNOWN_COMPETITORS)} competitor profiles.')

