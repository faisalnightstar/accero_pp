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
        burgundy: '#8B1E2D',
        crimson: '#E63946',
        gold: '#F4D35E',
        'steel-blue': '#457B9D',
        steel: '#457B9D',
        navy: '#1D3557',
        'bg-light': '#F0F4F8',
        brand: {
          burgundy: '#8B1E2D',
          crimson: '#E63946',
          gold: '#F4D35E',
          steel: '#457B9D',
          navy: '#1D3557',
          bg: '#F0F4F8',
          surface: '#FFFFFF',
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
      fontFamily: {
        pan: [
          "'Helvetica LT Pro Bold'",
          "'Helvetica LT Pro'",
          "'Helvetica Neue'",
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        aadhaar: [
          "'Comma Serif Regular'",
          "'Comma Serif'",
          "'Noto Serif'",
          "'DejaVu Serif'",
          'Georgia',
          'serif',
        ],
        aadhaarNumber: [
          "'Rockwell'",
          "'Rockwell Nova'",
          "'GeoSlab703 Md BT'",
          "'Roboto Slab'",
          'serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
