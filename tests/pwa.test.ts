import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import manifest from '@/app/manifest';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';

describe('Progressive Web App (PWA) Foundation & Standards', () => {
  describe('1. Web App Manifest Standards', () => {
    it('generates a compliant Web App Manifest', () => {
      const data = manifest();
      expect(data).toBeDefined();
      expect(data.id).toBe('/');
      expect(data.name).toBe('Accero PrintPortal');
      expect(data.short_name).toBe('Accero');
      expect(data.start_url).toBe('/');
      expect(data.scope).toBe('/');
      expect(data.display).toBe('standalone');
      expect(data.orientation).toBe('any');
      expect(data.background_color).toBe('#ffffff');
      expect(data.theme_color).toBe('#8B1E2D');
      expect(data.categories).toContain('productivity');
      expect(data.categories).toContain('utilities');
    });

    it('defines standard and maskable icons in manifest', () => {
      const data = manifest();
      expect(data.icons).toBeDefined();
      expect(data.icons!.length).toBeGreaterThanOrEqual(4);

      const anyIcons = data.icons!.filter((i) => i.purpose === 'any');
      const maskableIcons = data.icons!.filter((i) => i.purpose === 'maskable');

      expect(anyIcons.some((i) => i.sizes === '192x192')).toBe(true);
      expect(anyIcons.some((i) => i.sizes === '512x512')).toBe(true);
      expect(maskableIcons.some((i) => i.sizes === '192x192')).toBe(true);
      expect(maskableIcons.some((i) => i.sizes === '512x512')).toBe(true);
    });

    it('ensures every icon referenced in manifest exists on disk', () => {
      const data = manifest();
      for (const icon of data.icons || []) {
        const filePath = path.join(process.cwd(), 'public', icon.src.replace(/^\//, ''));
        expect(fs.existsSync(filePath), `Icon not found: ${icon.src}`).toBe(true);
        const stats = fs.statSync(filePath);
        expect(stats.size).toBeGreaterThan(500);
      }
    });

    it('declares useful desktop/mobile shortcuts without leaking sensitive routes', () => {
      const data = manifest();
      expect(data.shortcuts).toBeDefined();
      expect(data.shortcuts!.length).toBeGreaterThanOrEqual(2);
      for (const s of data.shortcuts || []) {
        expect(s.url.startsWith('/')).toBe(true);
        expect(s.url.includes('/api/')).toBe(false);
      }
    });
  });

  describe('2. Service Worker & Caching Security Policy', () => {
    const swPath = path.join(process.cwd(), 'public', 'sw.js');

    it('verifies public/sw.js exists and is non-empty', () => {
      expect(fs.existsSync(swPath)).toBe(true);
      const content = fs.readFileSync(swPath, 'utf-8');
      expect(content.length).toBeGreaterThan(1000);
    });

    it('enforces Network-Only rule on all sensitive and authenticated API endpoints', () => {
      const content = fs.readFileSync(swPath, 'utf-8');
      expect(content).toContain("pathname.startsWith('/api/')");
      expect(content).toContain("pathname.startsWith('/dashboard')");
      expect(content).toContain("pathname.startsWith('/studio')");
      expect(content).toContain("pathname.startsWith('/wallet')");
      expect(content).toContain("pathname.startsWith('/admin')");
      expect(content).toContain("pathname.startsWith('/support')");
    });

    it('precaches the offline page and essential branding assets', () => {
      const content = fs.readFileSync(swPath, 'utf-8');
      expect(content).toContain('/offline');
      expect(content).toContain('/favicon.ico');
      expect(content).toContain('/favicon.svg');
      expect(content).toContain('/icons/icon-192.png');
      expect(content).toContain('/icons/icon-512.png');
      expect(content).toContain('/manifest.webmanifest');
    });

    it('cleans up outdated caches on activation and claims clients', () => {
      const content = fs.readFileSync(swPath, 'utf-8');
      expect(content).toContain('caches.delete');
      expect(content).toContain('self.clients.claim()');
      expect(content).toContain('self.skipWaiting()');
    });
  });

  describe('3. PWA Icon Assets Verification', () => {
    const requiredAssets = [
      'public/favicon.ico',
      'public/favicon.svg',
      'public/icons/icon-192.png',
      'public/icons/icon-512.png',
      'public/icons/icon-maskable-192.png',
      'public/icons/icon-maskable-512.png',
      'public/icons/apple-touch-icon.png',
      'public/apple-touch-icon.png',
    ];

    it.each(requiredAssets)('verifies asset exists: %s', (assetPath) => {
      const fullPath = path.join(process.cwd(), assetPath);
      expect(fs.existsSync(fullPath), `Asset missing: ${assetPath}`).toBe(true);
      const stat = fs.statSync(fullPath);
      expect(stat.size).toBeGreaterThan(100);
    });
  });

  describe('4. PWA Analytics & Telemetry Contract', () => {
    it('defines all required privacy-conscious PWA telemetry events', () => {
      expect(ANALYTICS_EVENTS.PWA_INSTALL_PROMPT_VIEW).toBe('pwa_install_prompt_view');
      expect(ANALYTICS_EVENTS.PWA_INSTALL_PROMPT_DISMISS).toBe('pwa_install_prompt_dismiss');
      expect(ANALYTICS_EVENTS.PWA_INSTALL_COMPLETED).toBe('pwa_install_completed');
      expect(ANALYTICS_EVENTS.PWA_STANDALONE_LAUNCH).toBe('pwa_standalone_launch');
      expect(ANALYTICS_EVENTS.PWA_OFFLINE_VIEW).toBe('pwa_offline_view');
      expect(ANALYTICS_EVENTS.PWA_UPDATE_AVAILABLE).toBe('pwa_update_available');
      expect(ANALYTICS_EVENTS.PWA_UPDATE_COMPLETED).toBe('pwa_update_completed');
    });
  });

  describe('5. Offline Fallback Route', () => {
    it('verifies src/app/offline/page.tsx exists and contains essential offline UI elements', () => {
      const offlinePath = path.join(process.cwd(), 'src/app/offline/page.tsx');
      expect(fs.existsSync(offlinePath)).toBe(true);
      const content = fs.readFileSync(offlinePath, 'utf-8');
      expect(content).toContain('currently offline');
      expect(content).toContain('Retry Connection');
    });
  });
});
