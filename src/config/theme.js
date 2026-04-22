/**
 * NexusHub - Configuração de Tema
 * Arquivo central de configuração de cores, fontes e bordas
 */
export const theme = {
  colors: {
    background: '#ffffff',
    text: '#313131',
    sidebarBackground: '#313131',
    sidebarText: '#ffffff',
    buttonBackground: '#dfa625',
    buttonText: '#313131',
    inputBorder: '#e0e0e0',
    inputBackground: '#ffffff',
    inputText: '#313131',
    placeholder: '#9e9e9e',
    danger: '#e53935',
    success: '#43a047',
    warning: '#dfa625',
    info: '#1e88e5',
    cardBackground: '#f9f9f9',
    cardBorder: '#e8e8e8',
    skeletonBase: '#e0e0e0',
    skeletonHighlight: '#f5f5f5',
    overlay: 'rgba(0,0,0,0.4)',
    sidebarHover: 'rgba(255,255,255,0.1)',
    sidebarActive: 'rgba(223,166,37,0.2)',
    sidebarActiveBorder: '#dfa625',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  font: {
    family: "'Nunito', sans-serif",
    sizes: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '22px',
      xxl: '28px',
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },
  sidebar: {
    width: '260px',
    collapsedWidth: '68px',
  },
  transitions: {
    fast: '0.15s ease',
    normal: '0.25s ease',
    slow: '0.4s ease',
  },
  shadows: {
    card: '0 2px 12px rgba(0,0,0,0.08)',
    sidebar: '2px 0 16px rgba(0,0,0,0.15)',
    button: '0 2px 8px rgba(223,166,37,0.3)',
    modal: '0 8px 40px rgba(0,0,0,0.2)',
  },
}

export default theme
