export function getCurrencySettings(content) {
  return content?.master_settings?.currencies || content?.currencies || { supported: [], rates: {}, auto_detect: 1 }
}

export function getActiveCurrency(content) {
  const settings = getCurrencySettings(content)
  const supported = Array.isArray(settings.supported) && settings.supported.length ? settings.supported : (content?.currency_base ? [content.currency_base] : [])
  const saved = window.localStorage.getItem('sync_webshop_currency')
  if (saved && supported.includes(saved)) return saved
  return content?.currency_base || settings.base_currency || supported[0] || ''
}

export function setActiveCurrency(currency) {
  window.localStorage.setItem('sync_webshop_currency', currency)
  window.dispatchEvent(new CustomEvent('sync-currency-changed', { detail: currency }))
}

export function formatStorefrontPrice(amount, currency, content) {
  const settings = getCurrencySettings(content)
  const active = currency || getActiveCurrency(content)
  if (!active) return Number(amount || 0).toFixed(2)
  const rates = settings.rates || {}
  const sourceCurrency = content?.currency_base || settings.base_currency || settings.supported?.[0] || active
  const sourceRate = Number(rates[sourceCurrency] || 1)
  const targetRate = Number(rates[active] || 1)
  const converted = Number(amount || 0) / sourceRate * targetRate
  try {
    const locale = document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl' ? 'ar-SA' : 'en'
    return new Intl.NumberFormat(locale, { style: 'currency', currency: active, maximumFractionDigits: 2 }).format(converted)
  } catch {
    return `${converted.toFixed(2)} ${active}`
  }
}
