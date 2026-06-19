import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Khmer Tenant Color System ─────────────────────────────────────
        // All major colors are dynamic — resolved via CSS variables injected
        // per-tenant in layout.tsx. Fallbacks are the system defaults.
        gold: {
          // --theme-primary-light: lighter tint of the primary accent
          light: 'rgb(var(--theme-primary-light, 253 183 26) / <alpha-value>)',
          // --theme-primary: the main accent color (e.g. gold for Buddhist tenants)
          primary: 'rgb(var(--theme-primary, 245 158 11) / <alpha-value>)',
          DEFAULT: 'rgb(var(--theme-primary, 245 158 11) / <alpha-value>)',
          // --theme-primary-dark: darker shade for hover states, borders
          dark: 'rgb(var(--theme-primary-dark, 218 165 32) / <alpha-value>)',
        },
        brown: {
          light: '#1a1611ff',
          DEFAULT: 'rgb(var(--theme-secondary, 92 64 51) / <alpha-value>)',
          dark: '#4A2C2A',
        },
        coffee: {
          light: '#3D2817',
          DEFAULT: 'rgb(var(--theme-text, 44 24 16) / <alpha-value>)',
          // --theme-hero: the deep dark background for Hero sections, headers
          dark: 'rgb(var(--theme-hero, 26 15 9) / <alpha-value>)',
        },
        saffron: {
          DEFAULT: 'rgb(var(--theme-accent, 255 140 0) / <alpha-value>)',
        },
        // --theme-surface: the off-white ivory page background
        page: {
          surface: 'rgb(var(--theme-surface, 250 250 247) / <alpha-value>)',
          bgStart: 'rgb(var(--theme-bg-start, 254 249 243) / <alpha-value>)',
          bgEnd: 'rgb(var(--theme-bg-end, 253 245 235) / <alpha-value>)',
        },
        ivory: {
          DEFAULT: 'rgb(var(--theme-surface, 250 250 247) / <alpha-value>)',
        },
      },
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        inter: ["Inter", "sans-serif"],
        khmer: ["Kantumruy Pro", "sans-serif"],
        lora: ["var(--font-lora)", "serif"],
        manrope: ["var(--font-manrope)", "sans-serif"],
      },
      keyframes: {
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(5%)' },
        },
        'glow': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1.2) drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))' },
          '50%': { opacity: '0.8', filter: 'brightness(1) drop-shadow(0 0 5px rgba(255, 215, 0, 0.2))' },
        }
      },
      animation: {
        'bounce-slow': 'bounce-slow 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'spin-slow': 'spin 10s linear infinite',
      }
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
export default config;
