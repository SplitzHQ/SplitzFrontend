/** @type {import('tailwindcss').Config} */
import colors from './tailwind.config.colors'

export default {
  corePlugins: {
    // outlineWidth: false,
    // outlineColor: false,
    // outlineOffset: false
  },
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      black: '#000000',
      ...colors
    },
    fontSize: {
      xs: [
        '0.75rem', // 12px
        {
          lineHeight: '1rem' // 16px
        }
      ],
      sm: [
        '0.875rem', // 14px
        {
          lineHeight: '1.25rem' // 20px
        }
      ],
      base: [
        '1rem', // 16px
        {
          lineHeight: '1.5rem' // 24px
        }
      ],
      md: [
        '1rem', // 16px
        {
          lineHeight: '1.5rem' // 24px
        }
      ],
      lg: [
        '1.125rem', // 18px
        {
          lineHeight: '1.75rem' // 28px
        }
      ],
      'lg-doc': [
        '1.125rem', // 18px
        {
          lineHeight: '2rem' // 32px
        }
      ],
      xl: [
        '1.25rem', // 20px
        {
          lineHeight: '1.875rem' // 30px
        }
      ],
      'display-xs': [
        '1.25rem', // 20px
        {
          lineHeight: '1.75rem' // 28px
        }
      ],
      'display-sm': [
        '1.5rem', // 24px
        {
          lineHeight: '2rem' // 32px
        }
      ],
      'display-md': [
        '2rem', // 32px
        {
          lineHeight: '2.5rem', // 40px
          letterSpacing: '-0.01rem'
        }
      ],
      'display-lg': [
        '2.5rem', // 40px
        {
          lineHeight: '3rem', // 48px
          letterSpacing: '-0.025rem'
        }
      ],
      'display-xl': [
        '3rem', // 48px
        {
          lineHeight: '3.5rem', // 56px
          letterSpacing: '-0.03rem'
        }
      ],
      'display-2xl': [
        '3.5rem', // 56px
        {
          lineHeight: '4rem', // 64px
          letterSpacing: '-0.035rem'
        }
      ]
    },

    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        '05xl': '0.625rem' // 10px
      },
      zIndex: {
        dropdown: '1000',
        sticky: '1020',
        fixed: '1030',
        offcanvasBackdrop: '1040',
        offcanvas: '1045',
        modalBackdrop: '1050',
        modal: '1055',
        popover: '1070',
        tooltip: '1080',
        toast: '1090'
      }
    }
  },
  future: {
    hoverOnlyWhenSupported: true
  },
  plugins: []
}
