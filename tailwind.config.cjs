/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b1320',
        mist: '#edf2f7',
        panel: '#ffffff',
        brand: {
          50: '#e9fff9',
          100: '#c5ffef',
          200: '#90fee1',
          300: '#54f4d0',
          400: '#26ddb8',
          500: '#11c3a0',
          600: '#0a9d83',
          700: '#0d7d6a',
          800: '#126355',
          900: '#124f45'
        },
        warn: '#d9480f',
        danger: '#c92a2a',
        ok: '#2b8a3e',
        info: '#1c7ed6'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(11, 19, 32, 0.08)',
        focus: '0 0 0 3px rgba(17, 195, 160, 0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '"Segoe UI"', 'sans-serif'],
        display: ['"Barlow Condensed"', '"IBM Plex Sans"', 'sans-serif'],
      },
      backgroundImage: {
        app: 'radial-gradient(circle at 10% 5%, rgba(17,195,160,0.12), transparent 35%), radial-gradient(circle at 90% 0%, rgba(28,126,214,0.10), transparent 40%), linear-gradient(180deg, #f8fbfd 0%, #eff4f7 100%)',
      }
    },
  },
  plugins: [],
};
