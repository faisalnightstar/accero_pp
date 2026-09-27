import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          burgundy: 'var(--color-deep-burgundy, #8B1E2D)',
          crimson: 'var(--color-crimson, #E63946)',
          gold: 'var(--color-gold, #F4D35E)',
          steel: 'var(--color-steel-blue, #457B9D)',
          navy: 'var(--color-navy, #1D3557)',
          bg: 'var(--color-bg-light, #F0F4F8)',
          surface: 'var(--color-card-surface, #FFFFFF)',
        },
      },
      boxShadow: {
        card: '0 12px 30px rgba(29, 53, 87, 0.12)',
        'btn-hover': '0 8px 20px rgba(230, 57, 70, 0.35)',
      },
      borderRadius: {
        card: '16px',
        input: '10px',
      },
    },
  },
  plugins: [],
};

export default config;
