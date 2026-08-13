export function getCurrencySettings(content) {
  return content?.master_settings?.currencies || { supported: ['SAR'], rates: {}, auto_detect: 1 }
}

export function getActiveCurrency(content) {
  const settings = getCurrencySettings(content)
  const supported = Array.isArray(settings.supported) && settings.supported.length ? settings.supported : ['SAR']
  const saved = window.localStorage.getItem('sync_webshop_currency')
  if (saved && supported.includes(saved)) return saved
  return supported[0]
}

export function setActiveCurrency(currency) {
  window.localStorage.setItem('sync_webshop_currency', currency)
  window.dispatchEvent(new CustomEvent('sync-currency-changed', { detail: currency }))
}

export function formatStorefrontPrice(amount, currency, content) {
  const settings = getCurrencySettings(content)
  const active = currency || getActiveCurrency(content)
  const rates = settings.rates || {}
  const sourceCurrency = content?.currency_base || 'SAR'
  const sourceRate = Number(rates[sourceCurrency] || 1)
  const targetRate = Number(rates[active] || 1)
  const converted = Number(amount || 0) / sourceRate * targetRate
  try {
    return new Intl.NumberFormat(active === 'ar' ? 'ar-SA' : 'en', { style: 'currency', currency: active, maximumFractionDigits: 2 }).format(converted)
  } catch {
    return `${converted.toFixed(2)} ${active}`
  }
}
