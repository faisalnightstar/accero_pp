import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { WEBMCP_TOOLS } from '@/components/ai/WebMcpProvider';

describe('WebMCP & ARD Agentic Resource Discovery Verification', () => {
  it('public/.well-known/ard.json exists and strictly conforms to ARD v0.91 specification', () => {
    const ardPath = path.join(process.cwd(), 'public/.well-known/ard.json');
    expect(fs.existsSync(ardPath)).toBe(true);

    const raw = fs.readFileSync(ardPath, 'utf-8');
    const data = JSON.parse(raw);

    // Root requirements
    expect(data.$schema).toContain('agenticresourcediscovery.org');
    expect(Array.isArray(data.entries)).toBe(true);
    expect(data.entries.length).toBeGreaterThan(0);

    const entry = data.entries[0];

    // Entry requirements per ARD spec §5.1
    expect(entry.identifier).toMatch(/^urn:air:printportal\.accero\.app:[a-z0-9_-]+:[a-z0-9_-]+$/);
    expect(typeof entry.displayName).toBe('string');
    expect(entry.displayName.length).toBeGreaterThan(5);
    expect(typeof entry.type).toBe('string');
    expect(typeof entry.description).toBe('string');

    // Mutually exclusive location: url exists, data is undefined
    expect(entry.url).toBe('https://printportal.accero.app');
    expect(entry.data).toBeUndefined();

    // Representative queries (2 to 5 items)
    expect(Array.isArray(entry.representativeQueries)).toBe(true);
    expect(entry.representativeQueries.length).toBeGreaterThanOrEqual(2);
    expect(entry.representativeQueries.length).toBeLessThanOrEqual(5);

    // Capabilities and tags
    expect(entry.capabilities).toContain('pvc-card-formatting');
    expect(entry.tags).toContain('pvc-card-printing');

    // Trust manifest
    expect(entry.trustManifest).toBeDefined();
    expect(entry.trustManifest.identity).toBe('https://printportal.accero.app');
  });

  it('provides backward-compatible /.well-known/ai-catalog.json manifest', () => {
    const legacyPath = path.join(process.cwd(), 'public/.well-known/ai-catalog.json');
    expect(fs.existsSync(legacyPath)).toBe(true);

    const data = JSON.parse(fs.readFileSync(legacyPath, 'utf-8'));
    expect(data.entries.length).toBeGreaterThan(0);
  });

  it('exposes <link rel="ard"> in root layout head', () => {
    const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf-8');
    expect(content).toContain('rel="ard" href="/.well-known/ard.json"');
  });

  it('allows /.well-known/ard.json in robots.ts static allowances', () => {
    const routesPath = path.join(process.cwd(), 'src/lib/seo/routes.ts');
    const content = fs.readFileSync(routesPath, 'utf-8');
    expect(content).toContain("'/.well-known/ard.json'");
    expect(content).toContain("'/.well-known/ai-catalog.json'");
  });

  it('validates WebMCP registered tools and input schemas (webmcp-schemas-valid)', () => {
    expect(WEBMCP_TOOLS.length).toBeGreaterThanOrEqual(3);

    for (const tool of WEBMCP_TOOLS) {
      // Tool name snake_case format
      expect(tool.name).toMatch(/^[a-z]+(_[a-z]+)*$/);
      expect(tool.description.length).toBeGreaterThan(15);

      // JSON Schema validation
      expect(tool.inputSchema.type).toBe('object');
      expect(typeof tool.inputSchema.properties).toBe('object');
      expect(Array.isArray(tool.inputSchema.required)).toBe(true);

      for (const requiredProp of tool.inputSchema.required) {
        expect(tool.inputSchema.properties[requiredProp]).toBeDefined();
        expect(tool.inputSchema.properties[requiredProp].type).toBeDefined();
        expect(tool.inputSchema.properties[requiredProp].description).toBeDefined();
      }
    }
  });

  it('validates WebMCP declarative form coverage in public interactive components', () => {
    // 1. HeroLookupForm
    const heroForm = fs.readFileSync(
      path.join(process.cwd(), 'src/components/seo/HeroLookupForm.tsx'),
      'utf-8'
    );
    expect(heroForm).toContain('toolname="hero_document_lookup"');
    expect(heroForm).toContain('tooldescription=');
    expect(heroForm).toContain('toolparamdescription=');

    // 2. ContactForm
    const contactForm = fs.readFileSync(
      path.join(process.cwd(), 'src/components/contact/ContactForm.tsx'),
      'utf-8'
    );
    expect(contactForm).toContain('toolname="contact_support_form"');
    expect(contactForm).toContain('tooldescription=');
    expect(contactForm).toContain('toolparamdescription=');

    // 3. StudioSearchBar
    const studioSearch = fs.readFileSync(
      path.join(process.cwd(), 'src/components/studio/StudioSearchBar.tsx'),
      'utf-8'
    );
    expect(studioSearch).toContain('toolname="studio_document_lookup"');
    expect(studioSearch).toContain('tooldescription=');

    // 4. QuickLookupModal
    const quickModal = fs.readFileSync(
      path.join(process.cwd(), 'src/components/dashboard/QuickLookupModal.tsx'),
      'utf-8'
    );
    expect(quickModal).toContain('toolname="dashboard_quick_lookup"');
    expect(quickModal).toContain('tooldescription=');
  });
});

