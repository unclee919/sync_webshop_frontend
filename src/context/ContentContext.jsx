import { createContext, useContext, useEffect, useState } from 'react'
import { getContent } from '../api/client'

const ContentContext = createContext(null)

const FONT_STACKS = {
  Poppins: "'Poppins', sans-serif",
  Cairo: "'Cairo', sans-serif",
  Inter: "'Inter', sans-serif",
  Roboto: "'Roboto', sans-serif",
  'Open Sans': "'Open Sans', sans-serif",
}

export const DEFAULT_CONTENT = {
  site_name: 'Sync Webshop',
  site_name_en: 'Sync Webshop',
  site_name_ar: 'متجر سينك',
  tagline_en: 'Everyday essentials, thoughtfully selected.',
  tagline_ar: 'احتياجاتك اليومية، مختارة بعناية.',
  phone_number: '',
  email_address: '',
  show_top_bar: 1,
  show_category_sidebar: 1,
  show_price_filter: 1,
  show_whatsapp_button: 0,
  show_back_to_top: 1,
  enable_wishlist: 1,
  nav_links: [],
  banners: [],
  featured_categories: [],
  landing_sections: [],
  testimonials: [],
  trust_badges: [],
  stories: [],
  stories_enabled: 1,
  stories_title_en: 'The edit, in moments',
  stories_title_ar: 'مختارات في لحظات',
  mega_menu_enabled: 1,
  mega_menu_title_en: 'Browse categories',
  mega_menu_title_ar: 'تصفح الأقسام',
  mega_menu_max_categories: 12,
  mega_menu_featured_image: null,
  mega_menu_featured_title_en: '',
  mega_menu_featured_title_ar: '',
  mega_menu_featured_url: '',
  mobile_quick_actions_enabled: 1,
  complete_the_look_enabled: 1,
  complete_the_look_title_en: 'Complete the look',
  complete_the_look_title_ar: 'أكمل الإطلالة',
  social_links: [],
  announcement: { enabled: 0 },
  footer_settings: { enabled: 1, columns: [] },
  product_settings: { show_related_products: 1, show_sidebar: 1, enable_immersive_viewer: 1, enable_video_hover: 1, complete_the_look_enabled: 1, complete_the_look_title_en: 'Complete the look', complete_the_look_title_ar: 'أكمل الإطلالة', ar_enabled: 1, ar_ios_model_url: '', ar_android_model_url: '', three_d_model_url: '', exploded_view_enabled: 1, exploded_view_title_en: 'Inspect the details', exploded_view_title_ar: 'استكشف التفاصيل', fit_guide_enabled: 1, fit_guide_title_en: 'Find your best fit', fit_guide_title_ar: 'اعثر على المقاس المناسب' },
  ultra_settings: { adaptive_palette_enabled: 1, circadian_theme_enabled: 1, shared_transitions_enabled: 1, magnetic_cursor_enabled: 1, predictive_prefetch_enabled: 1, palette_transition_ms: 520, circadian_evening_start: 18, circadian_morning_start: 7 },
  theme: {
    layout_style: 'Cedar',
    colors: {
      primary: '#173F3A',
      secondary: '#2D8B72',
      accent: '#E6B85C',
      danger: '#C95757',
      background: '#F8FAF7',
      top_bar_bg: '#173F3A',
      top_bar_text: '#F8FAF7',
      header_bg: '#FFFFFF',
      header_text: '#173F3A',
      nav_bg: '#FFFFFF',
      nav_text: '#173F3A',
      footer_bg: '#173F3A',
      footer_text: '#F8FAF7',
    },
    fonts: { heading: 'Poppins', body: 'Inter' },
    spacing: { container_width: '1240px', border_radius: '18px', border_radius_sm: '10px', border_radius_lg: '28px', section_gap: '5rem', card_gap: '1.25rem' },
    dimensions: {
      header_max_width: 1240,
      header_height: 84,
      logo_height: 46,
      hero_height: 500,
      search_bar_max_width: 560,
      search_bar_height: 48,
      nav_bar_height: 54,
    },
  },
}

function mergeContent(data) {
  const source = data || {}
  return {
    ...DEFAULT_CONTENT,
    ...source,
    theme: {
      ...DEFAULT_CONTENT.theme,
      ...(source.theme || {}),
      colors: { ...DEFAULT_CONTENT.theme.colors, ...(source.theme?.colors || {}) },
      fonts: { ...DEFAULT_CONTENT.theme.fonts, ...(source.theme?.fonts || {}) },
      spacing: { ...DEFAULT_CONTENT.theme.spacing, ...(source.theme?.spacing || {}) },
      dimensions: { ...DEFAULT_CONTENT.theme.dimensions, ...(source.theme?.dimensions || {}) },
    },
  }
}

function applyThemeToDocument(theme) {
  if (!theme) return
  const root = document.documentElement.style
  const colors = theme.colors || {}
  const fonts = theme.fonts || {}
  const spacing = theme.spacing || {}
  const dimensions = theme.dimensions || {}

  Object.entries(colors).forEach(([key, value]) => root.setProperty(`--${key.replaceAll('_', '-')}`, String(value)))
  root.setProperty('--border-radius-sm', String(spacing.border_radius_sm || '10px'))
  root.setProperty('--border-radius-md', String(spacing.border_radius || '18px'))
  root.setProperty('--border-radius-lg', String(spacing.border_radius_lg || '28px'))
  root.setProperty('--section-gap', String(spacing.section_gap || '5rem'))
  root.setProperty('--card-gap', String(spacing.card_gap || '1.25rem'))
  root.setProperty('--container-max-width', String(spacing.container_width || '1240px'))
  root.setProperty('--header-max-width', `${dimensions.header_max_width || 1240}px`)
  root.setProperty('--header-height', `${dimensions.header_height || 84}px`)
  root.setProperty('--logo-height', `${dimensions.logo_height || 46}px`)
  root.setProperty('--search-bar-max-width', `${dimensions.search_bar_max_width || 560}px`)
  root.setProperty('--search-bar-height', `${dimensions.search_bar_height || 48}px`)
  root.setProperty('--nav-bar-height', `${dimensions.nav_bar_height || 54}px`)
  root.setProperty('--hero-height', `${dimensions.hero_height || 500}px`)
  root.setProperty('--font-heading', FONT_STACKS[fonts.heading] || FONT_STACKS.Poppins)
  root.setProperty('--font-body', FONT_STACKS[fonts.body] || FONT_STACKS.Inter)
  document.documentElement.dataset.layout = String(theme.layout_style || 'Cedar').toLowerCase()
}

export function ContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadContent = async () => {
    try {
      setLoading(true)
      const data = await getContent()
      const nextContent = mergeContent(data)
      setContent(nextContent)
      applyThemeToDocument(nextContent.theme)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch content:', err)
      setError(err.message)
      applyThemeToDocument(DEFAULT_CONTENT.theme)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContent()
  }, [])

  const value = {
    content,
    loading,
    error,
    theme: content.theme || {},
    refresh: loadContent,
  }

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used inside ContentProvider')
  return ctx
}
