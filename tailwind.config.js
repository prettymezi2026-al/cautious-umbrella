/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        joseon: {
          bg: '#fbf7ee',
          paper: '#f5edd6',
          hanji: '#ede1c9',
          primary: '#8b261b', // 왕실 적색
          accent: '#d99b26',  // 황금색
          gold: '#f3b61f',
          dark: '#2c221e',    // 먹색
          blue: '#1b4965',    // 단청 청색
          green: '#2d6a4f',   // 단청 녹색
          wood: '#5c3d2e',
        }
      },
      fontFamily: {
        sans: ['Gowun Batang', 'Noto Serif KR', 'Nanum Myeongjo', 'serif', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-fast': 'pulse 1s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
