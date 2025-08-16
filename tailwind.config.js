/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Apple-style responsive breakpoints
    screens: {
      'xs': '375px',    // iPhone SE (smallest modern iPhone)
      'sm': '390px',    // iPhone 12 mini
      'md': '430px',    // iPhone 12 Pro Max
      'lg': '768px',    // iPad Mini
      'xl': '1024px',   // iPad Pro 11"
      '2xl': '1366px',  // iPad Pro 12.9" / MacBook Air
      '3xl': '1512px',  // MacBook Pro 14"
      '4xl': '1728px',  // MacBook Pro 16"
      '5xl': '1920px',  // iMac 24"
      '6xl': '2560px',  // Studio Display / Pro Display XDR
      
      // Device-specific breakpoints
      'iphone-se': '375px',
      'iphone': '390px',
      'iphone-plus': '414px',
      'iphone-max': '430px',
      'ipad-mini': '768px',
      'ipad': '820px',
      'ipad-air': '1024px',
      'ipad-pro': '1366px',
      'macbook-air': '1440px',
      'macbook-pro': '1512px',
      'imac': '1920px',
      'imac-pro': '2560px',
      
      // Orientation-aware breakpoints
      'portrait': { 'raw': '(orientation: portrait)' },
      'landscape': { 'raw': '(orientation: landscape)' },
      
      // Apple device media queries
      'ios': { 'raw': '(-webkit-touch-callout: none)' },
      'safari': { 'raw': '(-webkit-appearance: none)' },
      'touch': { 'raw': '(hover: none) and (pointer: coarse)' },
      'mouse': { 'raw': '(hover: hover) and (pointer: fine)' },
      
      // Dynamic Island aware
      'notch': { 'raw': '(display-mode: standalone) and (orientation: portrait)' },
      
      // High density displays
      'retina': { 'raw': '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)' },
      'retina-3x': { 'raw': '(-webkit-min-device-pixel-ratio: 3), (min-resolution: 288dpi)' },
    },
    extend: {
      fontFamily: {
        'sf': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'system-ui', 'sans-serif'],
        'sf-display': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'system-ui', 'sans-serif'],
        'sf-text': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Apple Sistema de Colores
        apple: {
          white: '#FFFFFF',
          gray: {
            50: '#F9F9FB',
            100: '#F2F2F7',
            200: '#E5E5EA',
            300: '#D1D1D6',
            400: '#C7C7CC',
            500: '#AEAEB2',
            600: '#8E8E93',
            700: '#6D6D70',
            800: '#48484A',
            900: '#1C1C1E',
          },
          blue: {
            DEFAULT: '#007AFF',
            light: '#5AC8FA',
            dark: '#0051D5',
          },
          orange: {
            DEFAULT: '#FF9500',
            light: '#FFCC02',
            dark: '#D1810A',
          },
          green: {
            DEFAULT: '#34C759',
            light: '#30DB5B',
            dark: '#248A3D',
          },
          red: {
            DEFAULT: '#FF3B30',
            light: '#FF6961',
            dark: '#D70015',
          },
          // Textos Apple
          text: {
            primary: '#000000',
            secondary: '#3C3C43',
            tertiary: '#3C3C4399', // 60% opacity
            quaternary: '#3C3C432E', // 18% opacity
          }
        },
        // Colores corporativos SISDAT basados en el logo
        sisdat: {
          'blue-dark': '#1B4F8C',    // Azul oscuro del logo
          'blue-primary': '#2E7CD6',  // Azul principal del logo  
          'blue-medium': '#4A9FE7',   // Azul medio del logo
          'blue-light': '#66B3F0',    // Azul claro del logo
          'blue-lightest': '#7AC4F7', // Azul más claro del logo
          'cyan': '#40C9E7',          // Cyan del "FORECAST"
        },
        // Alias para mantener compatibilidad
        energy: {
          primary: '#2E7CD6',   // Azul principal SISDAT
          secondary: '#4A9FE7', // Azul medio SISDAT
          accent: '#40C9E7',    // Cyan SISDAT
        },
        // Compatibility con sistema anterior
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontSize: {
        // Sistema tipográfico Apple
        'apple-xs': ['11px', { lineHeight: '13px', letterSpacing: '0.06em' }],
        'apple-sm': ['13px', { lineHeight: '16px', letterSpacing: '0.04em' }],
        'apple-base': ['15px', { lineHeight: '20px', letterSpacing: '0' }],
        'apple-lg': ['17px', { lineHeight: '22px', letterSpacing: '-0.02em' }],
        'apple-xl': ['20px', { lineHeight: '25px', letterSpacing: '-0.02em' }],
        'apple-2xl': ['24px', { lineHeight: '29px', letterSpacing: '-0.03em' }],
        'apple-3xl': ['32px', { lineHeight: '38px', letterSpacing: '-0.04em' }],
        'apple-4xl': ['48px', { lineHeight: '52px', letterSpacing: '-0.05em' }],
      },
      fontWeight: {
        // Pesos Apple específicos
        'apple-light': '300',
        'apple-regular': '400',
        'apple-medium': '500',
        'apple-semibold': '600',
        'apple-bold': '700',
      },
      spacing: {
        // Espaciado Apple - múltiplos de 4
        '18': '4.5rem', // 72px
        '22': '5.5rem', // 88px
        '26': '6.5rem', // 104px
        '30': '7.5rem', // 120px
        
        // Apple device-specific spacing
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        
        // Responsive spacing for different devices
        'iphone-padding': '16px',    // Standard mobile padding
        'ipad-padding': '24px',      // Tablet padding
        'macbook-padding': '32px',   // Desktop padding
        'imac-padding': '48px',      // Large screen padding
      },
      borderRadius: {
        // Border radius Apple
        'apple-sm': '6px',
        'apple': '10px',
        'apple-lg': '12px',
        'apple-xl': '16px',
        'apple-2xl': '20px',
      },
      boxShadow: {
        // Sombras Apple
        'apple-sm': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'apple': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'apple-lg': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'apple-xl': '0 16px 64px rgba(0, 0, 0, 0.15)',
        'apple-button': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'apple-button-hover': '0 4px 12px rgba(0, 122, 255, 0.25)',
        'apple-card': '0 8px 24px rgba(0, 0, 0, 0.08)',
      },
      backdropBlur: {
        'apple': '20px',
        'apple-lg': '40px',
      },
      animation: {
        // Animaciones Apple
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in-down': 'fadeInDown 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-right': 'slideInRight 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'apple-bounce': 'appleBounce 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionTimingFunction: {
        // Easing curves Apple
        'apple': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'apple-spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      transitionDuration: {
        // Duraciones Apple
        'apple-fast': '150ms',
        'apple': '200ms',
        'apple-slow': '300ms',
      }
    },
  },
  plugins: [
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Utilidades Apple específicas
        '.apple-transition': {
          'transition': 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.apple-transition-fast': {
          'transition': 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.apple-transition-slow': {
          'transition': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.apple-focus': {
          'outline': 'none',
          'box-shadow': '0 0 0 3px rgba(0, 122, 255, 0.2)',
        },
        '.apple-blur': {
          'backdrop-filter': 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
        },
        
        // Apple device-specific layouts
        '.apple-container': {
          'width': '100%',
          'margin-left': 'auto',
          'margin-right': 'auto',
          'padding-left': '16px',
          'padding-right': '16px',
          '@media (min-width: 768px)': {
            'padding-left': '24px',
            'padding-right': '24px',
          },
          '@media (min-width: 1024px)': {
            'padding-left': '32px',
            'padding-right': '32px',
          },
          '@media (min-width: 1920px)': {
            'padding-left': '48px',
            'padding-right': '48px',
          },
        },
        
        // Responsive text sizing following Apple HIG
        '.apple-text-responsive': {
          'font-size': '15px',
          'line-height': '20px',
          '@media (min-width: 768px)': {
            'font-size': '17px',
            'line-height': '22px',
          },
          '@media (min-width: 1024px)': {
            'font-size': '19px',
            'line-height': '24px',
          },
        },
        
        '.apple-heading-responsive': {
          'font-size': '24px',
          'line-height': '29px',
          'font-weight': '600',
          '@media (min-width: 768px)': {
            'font-size': '32px',
            'line-height': '38px',
          },
          '@media (min-width: 1024px)': {
            'font-size': '48px',
            'line-height': '52px',
          },
        },
        
        // Apple grid layouts
        '.apple-grid-mobile': {
          'display': 'grid',
          'grid-template-columns': '1fr',
          'gap': '16px',
        },
        
        '.apple-grid-tablet': {
          '@media (min-width: 768px)': {
            'grid-template-columns': 'repeat(2, 1fr)',
            'gap': '24px',
          },
        },
        
        '.apple-grid-desktop': {
          '@media (min-width: 1024px)': {
            'grid-template-columns': 'repeat(3, 1fr)',
            'gap': '32px',
          },
        },
        
        '.apple-grid-wide': {
          '@media (min-width: 1920px)': {
            'grid-template-columns': 'repeat(4, 1fr)',
            'gap': '48px',
          },
        },
        
        // Safe area utilities
        '.apple-safe-area': {
          'padding-top': 'env(safe-area-inset-top)',
          'padding-bottom': 'env(safe-area-inset-bottom)',
          'padding-left': 'env(safe-area-inset-left)',
          'padding-right': 'env(safe-area-inset-right)',
        },
        
        '.apple-safe-top': {
          'padding-top': 'max(env(safe-area-inset-top), 16px)',
        },
        
        '.apple-safe-bottom': {
          'padding-bottom': 'max(env(safe-area-inset-bottom), 16px)',
        },
        
        // Apple touch targets
        '.apple-touch-44': {
          'min-height': '44px',
          'min-width': '44px',
        },
        
        '.apple-touch-48': {
          'min-height': '48px',
          'min-width': '48px',
        },
        
        // Apple card layouts
        '.apple-card-mobile': {
          'border-radius': '12px',
          'padding': '16px',
          'margin': '8px',
        },
        
        '.apple-card-tablet': {
          '@media (min-width: 768px)': {
            'border-radius': '16px',
            'padding': '24px',
            'margin': '12px',
          },
        },
        
        '.apple-card-desktop': {
          '@media (min-width: 1024px)': {
            'border-radius': '20px',
            'padding': '32px',
            'margin': '16px',
          },
        },
        
        // Apple navigation
        '.apple-nav-mobile': {
          'position': 'fixed',
          'bottom': '0',
          'left': '0',
          'right': '0',
          'background': 'rgba(255, 255, 255, 0.8)',
          'backdrop-filter': 'blur(20px)',
          'border-top': '1px solid rgba(0, 0, 0, 0.1)',
          'padding': '8px 16px calc(8px + env(safe-area-inset-bottom))',
        },
        
        '.apple-nav-desktop': {
          '@media (min-width: 1024px)': {
            'position': 'static',
            'background': 'transparent',
            'backdrop-filter': 'none',
            'border-top': 'none',
            'padding': '16px 32px',
          },
        },
        
        // Apple form elements responsive
        '.apple-input-responsive': {
          'height': '44px',
          'padding': '0 16px',
          'font-size': '16px', // Prevents zoom on iOS
          '@media (min-width: 768px)': {
            'height': '48px',
            'padding': '0 20px',
            'font-size': '17px',
          },
        },
        
        // Apple button responsive
        '.apple-button-responsive': {
          'height': '44px',
          'padding': '0 20px',
          'font-size': '17px',
          'font-weight': '500',
          '@media (min-width: 768px)': {
            'height': '48px',
            'padding': '0 24px',
            'font-size': '17px',
          },
        },
        
        // Reduced motion support
        '@media (prefers-reduced-motion: reduce)': {
          '.apple-transition': {
            'transition': 'none',
          },
          '.apple-transition-fast': {
            'transition': 'none',
          },
          '.apple-transition-slow': {
            'transition': 'none',
          },
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
