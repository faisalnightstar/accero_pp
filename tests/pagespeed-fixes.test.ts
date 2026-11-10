import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PageSpeed Insights Fixes Verification', () => {
  it('public/llms.txt contains properly formatted markdown links', () => {
    const filePath = path.join(process.cwd(), 'public/llms.txt');
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, 'utf-8');
    const markdownLinks = content.match(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g);

    expect(markdownLinks).not.toBeNull();
    expect(markdownLinks!.length).toBeGreaterThan(15);
    expect(content).toContain('[PAN Card Printing](https://printportal.accero.app/services/pan-card-printing)');
    expect(content).toContain('[Aadhaar Document Management](https://printportal.accero.app/services/aadhaar-document-management)');
    expect(content).toContain('[Voter ID (EPIC) Card Printing](https://printportal.accero.app/services/voter-id-printing)');
    expect(content).toContain('[Website](https://printportal.accero.app)');
  });

  it('eliminates bare "Learn more" links on the homepage in favor of descriptive text', () => {
    const filePath = path.join(process.cwd(), 'src/app/page.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Should not contain bare <span>Learn more</span>
    expect(content).not.toMatch(/<span>Learn more<\/span>/);

    // Should contain descriptive links with aria-label
    expect(content).toContain('<span>Explore document lookup</span>');
    expect(content).toContain('<span>Explore live editing</span>');
    expect(content).toContain('<span>Explore multilingual printing</span>');
    expect(content).toContain('aria-label="Learn more about document lookup and manual entry"');
  });

  it('uses WCAG AAA compliant high-contrast color for FAQ question markers on white backgrounds', () => {
    const pageContent = fs.readFileSync(path.join(process.cwd(), 'src/app/page.tsx'), 'utf-8');
    const faqContent = fs.readFileSync(path.join(process.cwd(), 'src/app/faq/page.tsx'), 'utf-8');

    // Neither should use low-contrast text-[#E63946] on white background for Q:
    expect(pageContent).not.toMatch(/<span className="text-\[#E63946\] font-mono">Q:<\/span>/);
    expect(faqContent).not.toMatch(/<span className="text-\[#E63946\] font-mono">Q:<\/span>/);

    // Should use high-contrast #8B1E2D (contrast ratio ~9.8:1, passes AAA)
    expect(pageContent).toContain('text-[#8B1E2D] font-mono');
    expect(faqContent).toContain('text-[#8B1E2D] font-mono');
  });

  it('ensures .browserslistrc targets modern ES6+ browsers to eliminate legacy polyfills', () => {
    const filePath = path.join(process.cwd(), '.browserslistrc');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('not IE 11');
    expect(content).toContain('last 2 versions');
  });

  it('configures Next.js performance optimizations in next.config.ts', () => {
    const filePath = path.join(process.cwd(), 'next.config.ts');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('poweredByHeader: false');
    expect(content).toContain('compress: true');
    expect(content).toContain("optimizePackageImports: ['lucide-react']");
  });

  it('ensures font-display: swap is present on local @font-face declarations', () => {
    const filePath = path.join(process.cwd(), 'src/app/globals.css');
    const content = fs.readFileSync(filePath, 'utf-8');
    const swapCount = (content.match(/font-display:\s*swap;/g) || []).length;
    expect(swapCount).toBeGreaterThanOrEqual(7);
  });

  it('ensures GoogleTagManager uses lazyOnload strategy to prevent main thread blocking', () => {
    const filePath = path.join(process.cwd(), 'src/components/analytics/GoogleTagManager.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('strategy="lazyOnload"');
  });

  it('ensures preconnect hints for Google Tag Manager are present in root layout', () => {
    const filePath = path.join(process.cwd(), 'src/app/layout.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('rel="preconnect" href="https://www.googletagmanager.com"');
    expect(content).toContain('rel="dns-prefetch" href="https://www.googletagmanager.com"');
  });
});
