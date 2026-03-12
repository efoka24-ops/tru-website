/**
 * Palette de couleurs globale pour TRU GROUP
 * Centralisée pour cohérence et maintenance facile
 */

export const colors = {
  // Couleurs primaires (TRU GROUP)
  primary: {
    light: '#4ade80',    // green-400
    main: '#22c55e',     // green-500
    dark: '#16a34a',     // green-600
    hover: '#22c55e99',  // green-500 avec transparence
  },

  // Couleurs secondaires (Slate)
  secondary: {
    dark: '#0f172a',     // slate-900
    darkMuted: '#1e293b', // slate-800
    muted: '#334155',    // slate-700
    light: '#64748b',    // slate-600
    lighter: '#cbd5e1',  // slate-300
    lightest: '#f1f5f9', // slate-100
    bg: '#f8fafc',       // slate-50
  },

  // Couleurs neutres
  neutral: {
    white: '#ffffff',
    black: '#000000',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
  },

  // Couleurs pour les états
  states: {
    success: '#10b981',   // emerald-500
    error: '#ef4444',     // red-500
    warning: '#f59e0b',   // amber-500
    info: '#3b82f6',      // blue-500
  },

  // Gradients prédéfinis
  gradients: {
    primary: 'from-green-400 to-green-500',
    primaryReverse: 'from-green-600 to-green-500',
    slate: 'from-slate-100 to-slate-200',
    dark: 'from-slate-900 to-slate-800',
    vibrant: 'from-green-500 via-slate-700 to-slate-900',
  },

  // Palettes thématiques par service
  services: {
    conseil: {
      gradient: 'from-blue-500 to-indigo-600',
      icon: '#3b82f6',
      bg: '#dbeafe',
    },
    digital: {
      gradient: 'from-amber-500 to-orange-600',
      icon: '#f59e0b',
      bg: '#fef3c7',
    },
    dev: {
      gradient: 'from-emerald-500 to-teal-600',
      icon: '#10b981',
      bg: '#d1fae5',
    },
    projet: {
      gradient: 'from-purple-500 to-pink-600',
      icon: '#a855f7',
      bg: '#f3e8ff',
    },
    telemedicine: {
      gradient: 'from-rose-500 to-pink-600',
      icon: '#f43f5e',
      bg: '#ffe4e6',
    },
    formation: {
      gradient: 'from-cyan-500 to-blue-600',
      icon: '#06b6d4',
      bg: '#cffafe',
    },
  },

  // Opacités couramment utilisées
  opacity: {
    full: 1,
    high: 0.8,
    medium: 0.6,
    low: 0.4,
    veryLow: 0.2,
  },

  // Ombres
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    hover: 'hover:shadow-xl transition-all duration-500',
  },
};

/**
 * Utilitaires pour les couleurs
 */
export const colorUtils = {
  /**
   * Obtient un gradient Tailwind pour un service
   */
  getServiceGradient: (serviceType) => {
    return colors.services[serviceType]?.gradient || colors.gradients.primary;
  },

  /**
   * Obtient la couleur d'icône pour un service
   */
  getServiceIconColor: (serviceType) => {
    return colors.services[serviceType]?.icon || colors.primary.main;
  },

  /**
   * Obtient la couleur de fond pour un service
   */
  getServiceBg: (serviceType) => {
    return colors.services[serviceType]?.bg || colors.secondary.lighter;
  },

  /**
   * Convertit un hex en rgba
   */
  hexToRgba: (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  /**
   * Mélange deux couleurs
   */
  blend: (color1, color2, ratio = 0.5) => {
    const c1 = colors[color1] || color1;
    const c2 = colors[color2] || color2;
    // Simple blending logic
    return `color-mix(in srgb, ${c1} ${ratio * 100}%, ${c2})`;
  },
};

export default colors;
