/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4A5D41',    // Even darker Sage Green
        secondary: '#8B4229',  // Even darker Dusty Rose
        background: '#F8F6F5', // Lighter Creamy Ivory (improved from #F1EDEB)
        text: '#2D3748',       // Even darker slate gray for main text
        textSecondary: '#1A202C', // Almost black for secondary text
        accent: '#8B3300',     // Darker Burnt Orange
        dark: '#0F172A',       // Darker Navy Blue
        notification: '#9B7100', // Darker Mustard Yellow
        focus: '#6B4088',      // Darker Lavender
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      opacity: {
        '70': '0.7',
        '80': '0.8',
      },
      fontWeight: {
        normal: '500',  // Increase base font weight
        medium: '600',  // Increase medium font weight
        semibold: '700', // Increase semibold font weight
        bold: '800',    // Increase bold font weight
      }
    },
  },
  plugins: [],
} 