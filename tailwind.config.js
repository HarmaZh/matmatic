/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F6F2E9',
        'mat-cream': '#EDE5D3',
        ink: '#1F1B17',
        graphite: '#5C544A',
        pigment: '#9C3E2C',
        seal: '#1A4E3A',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
