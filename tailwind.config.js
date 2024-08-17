module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'fittrack-primary': '#4CAF50',
        'fittrack-secondary': '#2196F3',
        'fittrack-accent': '#FF9800',
        'fittrack-background': '#F5F5F5',
        'fittrack-text': '#333333',
        'fittrack-error': '#F44336',
        'fittrack-success': '#4CAF50',
      },
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif'],
        heading: ['Montserrat', 'Helvetica', 'sans-serif'],
      },
      fontSize: {
        'xs': '.75rem',
        'sm': '.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      boxShadow: {
        'card': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'button': '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '1rem',
      },
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      cursor: ['disabled'],
      backgroundColor: ['active', 'hover'],
      textColor: ['active', 'hover'],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
  purge: {
    content: [
      './pages/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}',
    ],
    options: {
      safelist: [
        'bg-fittrack-primary',
        'bg-fittrack-secondary',
        'text-fittrack-primary',
        'text-fittrack-secondary',
        'border-fittrack-primary',
        'border-fittrack-secondary',
      ],
    },
  },
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
};