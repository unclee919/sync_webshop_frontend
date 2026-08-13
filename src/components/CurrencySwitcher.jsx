import { useEffect, useState } from 'react'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import { getActiveCurrency, getCurrencySettings, setActiveCurrency } from '../utils/currency'

export default function CurrencySwitcher() {
  const { content } = useContent()
  const { lang } = useLanguage()
  const [currency, setCurrency] = useState(() => getActiveCurrency(content))
  const settings = getCurrencySettings(content)
  const currencies = Array.isArray(settings.supported) ? settings.supported : []
  useEffect(() => setCurrency(getActiveCurrency(content)), [content])
  if (currencies.length < 2) return null
  const isArabic = lang === 'ar'
  return <label className="currency-switcher"><span className="sr-only">{isArabic ? 'العملة' : 'Currency'}</span><select aria-label={isArabic ? 'العملة' : 'Currency'} value={currency} onChange={(event) => { setCurrency(event.target.value); setActiveCurrency(event.target.value); window.location.reload() }}>{currencies.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
}
