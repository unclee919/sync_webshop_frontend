import { createContext, useContext, useEffect, useState } from 'react'
import { getContent, getEliteSettings, getStorefrontProfiles, getMasterClassSettings, getEnterpriseSettings } from '../api/client'

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
  storefront_brands: [],
  master_settings: { landing: { enabled: 0 }, subscriptions: { enabled: 0, discount_percent: 0, intervals: [] }, courier: { provider: 'Manual', auto_waybill: 0 }, returns: { allowed_days: 14 }, currencies: { auto_detect: 1, supported: ['SAR'], rates: {} }, social_feed: [] },
  social_feed_items: [],
  enterprise_settings: { ai: { auto_translate_enabled: 0, intelligent_merchandising: 0, voice_actions_enabled: 0 }, b2b: { enabled: 0, volume_pricing_enabled: 0, corporate_credit_enabled: 0, quick_order_enabled: 0 }, live_shopping: { enabled: 0 }, flash_sales: { enabled: 0, scarcity_threshold: 5, discount_percent: 0 }, recovery: { enabled: 0, delay_hours: 2, coupon_discount: 0 }, fraud_shield: { enabled: 0, max_order_amount: 5000 }, infrastructure: { edge_cache_enabled: 0, auto_healing_enabled: 0 } },
  business_profile: { vertical: 'General Retail', vertical_label_en: 'Thoughtfully selected', vertical_label_ar: 'مختارات بعناية', intro_en: 'Everyday essentials, thoughtfully selected.', intro_ar: 'احتياجاتك اليومية، مختارة بعناية.', unit_label_en: 'item', unit_label_ar: 'منتج' },
  elite_settings: { ai_vision: { visual_search_enabled: 1, auto_tagging_enabled: 1, nlp_enabled: 1 }, marketplaces: { amazon_sa_enabled: 0, noon_enabled: 0, sync_interval_minutes: 30 }, regional_payments: { tabby_enabled: 1, tamara_enabled: 1, mada_enabled: 1, apple_pay_enabled: 1 }, pwa: { pwa_enabled: 1, app_short_name: 'Sync Webshop', theme_color: '#173F3A', offline_message_en: 'You are currently offline.', offline_message_ar: 'أنت غير متصل بالإنترنت حالياً.' } },
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
  editorial_collections: [],
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
  product_settings: { show_related_products: 1, show_sidebar: 1, enable_immersive_viewer: 1, enable_video_hover: 1, complete_the_look_enabled: 1, complete_the_look_title_en: 'Complete the look', complete_the_look_title_ar: 'أكمل الإطلالة', ar_enabled: 1, ar_ios_model_url: '', ar_android_model_url: '', three_d_model_url: '', exploded_view_enabled: 1, exploded_view_title_en: 'Inspect the details', exploded_view_title_ar: 'استكشف التفاصيل', fit_guide_enabled: 1, fit_guide_title_en: 'Find your best fit', fit_guide_title_ar: 'اعثر على المقاس المناسب', material_studio_enabled: 1, quote_requests_enabled: 0, quote_request_min_qty: 10 },
  ultra_settings: { adaptive_palette_enabled: 1, circadian_theme_enabled: 1, shared_transitions_enabled: 1, magnetic_cursor_enabled: 1, predictive_prefetch_enabled: 1, palette_transition_ms: 520, circadian_evening_start: 18, circadian_morning_start: 7 },
  experience_settings: { sensory_ui_enabled: 1, cinematic_transitions_enabled: 1, lookbook_hotspots_enabled: 1, curated_for_you_enabled: 1, curated_for_you_title_en: 'Curated for you', curated_for_you_title_ar: 'مختارات لك', express_checkout_enabled: 1, express_checkout_title_en: 'A faster way to checkout', express_checkout_title_ar: 'طريقة أسرع لإتمام الطلب', express_checkout_subtitle_en: 'Use your saved details and continue in one fluid step.', express_checkout_subtitle_ar: 'استخدم بياناتك المحفوظة وأكمل طلبك بخطوة سلسة.', express_checkout_cta_en: 'Checkout faster', express_checkout_cta_ar: 'إتمام أسرع', gifting_enabled: 1, gifting_title_en: 'Make it a gift', gifting_title_ar: 'اجعلها هدية', gifting_message_placeholder_en: 'Add a personal note', gifting_message_placeholder_ar: 'أضف رسالة شخصية', gifting_wrap_label_en: 'Add gift wrapping', gifting_wrap_label_ar: 'إضافة تغليف هدايا', visual_search_enabled: 0, visual_search_ai_enabled: 0, visual_search_title_en: 'Search by image', visual_search_title_ar: 'البحث بالصورة', visual_search_hint_en: 'Upload a product photo to find similar items', visual_search_hint_ar: 'ارفع صورة منتج للعثور على منتجات مشابهة', performance_adaptive_media_enabled: 1, performance_lazy_spatial_enabled: 1, pickup_enabled: 0, pickup_title_en: 'Store pickup', pickup_title_ar: 'الاستلام من المتجر', pickup_note_en: 'Choose an available warehouse and collect your order there.', pickup_note_ar: 'اختر مستودعاً متاحاً لاستلام طلبك منه.', membership_enabled: 1, membership_title_en: 'Your membership', membership_title_ar: 'عضويتك', presence_material_studio_enabled: 1, presence_material_studio_title_en: 'Make it yours', presence_material_studio_title_ar: 'صممه بطريقتك', style_quiz_enabled: 0, style_quiz_title_en: 'Find your point of view', style_quiz_title_ar: 'اكتشف ذوقك', style_quiz_intro_en: 'Answer a few questions and we will tune the edit to you.', style_quiz_intro_ar: 'أجب عن بعض الأسئلة لنضبط الاختيارات بما يناسبك.', quote_requests_enabled: 0, quote_request_title_en: 'Request a tailored quote', quote_request_title_ar: 'اطلب عرض سعر مخصص', quote_request_threshold: 10, live_tracking_map_enabled: 0, live_tracking_title_en: 'Your delivery, in view', live_tracking_title_ar: 'شاهد مسار توصيلك', social_proof_enabled: 0, social_proof_viewer_enabled: 0, social_proof_viewer_template_en: '{count} people are viewing this now', social_proof_viewer_template_ar: '{count} أشخاص يشاهدون هذا الآن' },
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
    product_settings: { ...DEFAULT_CONTENT.product_settings, ...(source.product_settings || {}) },
    ultra_settings: { ...DEFAULT_CONTENT.ultra_settings, ...(source.ultra_settings || {}) },
    experience_settings: { ...DEFAULT_CONTENT.experience_settings, ...(source.experience_settings || {}) },
    business_profile: { ...DEFAULT_CONTENT.business_profile, ...(source.business_profile || {}) },
    storefront_brands: Array.isArray(source.storefront_brands) ? source.storefront_brands : DEFAULT_CONTENT.storefront_brands,
    master_settings: { ...DEFAULT_CONTENT.master_settings, ...(source.master_settings || {}), landing: { ...DEFAULT_CONTENT.master_settings.landing, ...(source.master_settings?.landing || {}) }, subscriptions: { ...DEFAULT_CONTENT.master_settings.subscriptions, ...(source.master_settings?.subscriptions || {}) }, courier: { ...DEFAULT_CONTENT.master_settings.courier, ...(source.master_settings?.courier || {}) }, returns: { ...DEFAULT_CONTENT.master_settings.returns, ...(source.master_settings?.returns || {}) }, currencies: { ...DEFAULT_CONTENT.master_settings.currencies, ...(source.master_settings?.currencies || {}) } },
    social_feed_items: Array.isArray(source.social_feed_items) ? source.social_feed_items : DEFAULT_CONTENT.social_feed_items,
    enterprise_settings: { ...DEFAULT_CONTENT.enterprise_settings, ...(source.enterprise_settings || {}), ai: { ...DEFAULT_CONTENT.enterprise_settings.ai, ...(source.enterprise_settings?.ai || {}) }, b2b: { ...DEFAULT_CONTENT.enterprise_settings.b2b, ...(source.enterprise_settings?.b2b || {}) }, live_shopping: { ...DEFAULT_CONTENT.enterprise_settings.live_shopping, ...(source.enterprise_settings?.live_shopping || {}) }, flash_sales: { ...DEFAULT_CONTENT.enterprise_settings.flash_sales, ...(source.enterprise_settings?.flash_sales || {}) }, recovery: { ...DEFAULT_CONTENT.enterprise_settings.recovery, ...(source.enterprise_settings?.recovery || {}) }, fraud_shield: { ...DEFAULT_CONTENT.enterprise_settings.fraud_shield, ...(source.enterprise_settings?.fraud_shield || {}) }, infrastructure: { ...DEFAULT_CONTENT.enterprise_settings.infrastructure, ...(source.enterprise_settings?.infrastructure || {}) } },
    elite_settings: {
      ...DEFAULT_CONTENT.elite_settings,
      ...(source.elite_settings || {}),
      ai_vision: { ...DEFAULT_CONTENT.elite_settings.ai_vision, ...(source.elite_settings?.ai_vision || {}) },
      marketplaces: { ...DEFAULT_CONTENT.elite_settings.marketplaces, ...(source.elite_settings?.marketplaces || {}) },
      regional_payments: { ...DEFAULT_CONTENT.elite_settings.regional_payments, ...(source.elite_settings?.regional_payments || {}) },
      pwa: { ...DEFAULT_CONTENT.elite_settings.pwa, ...(source.elite_settings?.pwa || {}) },
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
      const [data, eliteSettings, storefrontProfiles, masterSettings, enterpriseSettings] = await Promise.all([getContent(), getEliteSettings().catch(() => null), getStorefrontProfiles().catch(() => []), getMasterClassSettings().catch(() => null), getEnterpriseSettings().catch(() => null)])
      const nextContent = mergeContent({ ...data, elite_settings: eliteSettings || data?.elite_settings, storefront_brands: storefrontProfiles || data?.storefront_brands, master_settings: masterSettings || data?.master_settings, social_feed_items: masterSettings?.social_feed || data?.social_feed_items, enterprise_settings: enterpriseSettings || data?.enterprise_settings })
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
