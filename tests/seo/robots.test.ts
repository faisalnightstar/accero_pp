import { describe, it, expect } from 'vitest';
import robots from '@/app/robots';
import {
  CANONICAL_PUBLIC_ROUTES,
  STATIC_VERIFICATION_ALLOWANCES,
  PRIVATE_NOINDEX_ROUTES,
} from '@/lib/seo/routes';

describe('Robots.txt Security & Bot Governance Policy', () => {
  const robotsConfig = robots();
  const rules = robotsConfig.rules as any[];

  it('points to the authoritative production sitemap.xml', () => {
    expect(robotsConfig.sitemap).toBe('https://printportal.accero.app/sitemap.xml');
  });

  it('explicitly allows public canonical paths for general search engine crawlers', () => {
    const starRule = rules.find((r) => r.userAgent === '*');
    expect(starRule).toBeDefined();

    CANONICAL_PUBLIC_ROUTES.forEach((route) => {
      expect(starRule.allow).toContain(route.path);
    });

    STATIC_VERIFICATION_ALLOWANCES.forEach((asset) => {
      expect(starRule.allow).toContain(asset);
    });
  });

  it('explicitly disallows all private operator workflows and API routes for all bots', () => {
    const targetAgents = [
      '*',
      'Googlebot',
      'bingbot',
      'OAI-SearchBot',
      'ChatGPT-User',
      'PerplexityBot',
      'ClaudeBot',
      'GPTBot',
    ];

    targetAgents.forEach((agent) => {
      const agentRule = rules.find((r) => r.userAgent === agent);
      expect(agentRule, `Rule missing for userAgent: ${agent}`).toBeDefined();

      PRIVATE_NOINDEX_ROUTES.forEach((disallowed) => {
        expect(agentRule.disallow).toContain(disallowed);
      });
    });
  });

  it('does NOT disallow /login or /register so crawlers can discover the meta noindex tags', () => {
    const starRule = rules.find((r) => r.userAgent === '*');
    expect(starRule.disallow).not.toContain('/login');
    expect(starRule.disallow).not.toContain('/register');
    expect(starRule.disallow).not.toContain('/forgot-password');
    expect(starRule.disallow).not.toContain('/reset-password');
  });
});
