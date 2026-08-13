const RESERVED_KEYS = new Set(['email', 'phone', 'address', 'name', 'customer', 'user_id', 'userId'])

function cleanParams(params = {}) {
  return Object.fromEntries(Object.entries(params).filter(([key, value]) => {
    if (RESERVED_KEYS.has(key) || value === undefined || value === null) return false
    return ['string', 'number', 'boolean'].includes(typeof value)
  }).slice(0, 20))
}

export function analyticsEnabled() {
  return typeof window !== 'undefined' && window.__syncWebshopAnalyticsEnabled === true
}

export function trackEvent(eventName, params = {}) {
  if (!analyticsEnabled() || !eventName) return false
  const safeParams = { ...cleanParams(params), page_path: window.location.pathname, language: document.documentElement.lang || 'en' }
  try {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: eventName, ...safeParams })
    if (typeof window.gtag === 'function') window.gtag('event', eventName, safeParams)
    if (typeof window.fbq === 'function') window.fbq('trackCustom', eventName, safeParams)
    if (typeof window.ttq?.track === 'function') window.ttq.track(eventName, safeParams)
    return true
  } catch {
    return false
  }
}

export function trackPageView(path = window.location.pathname) {
  return trackEvent('storefront_page_view', { page_path: path })
}
