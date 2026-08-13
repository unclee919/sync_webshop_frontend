import { useEffect } from 'react'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'

export default function PwaController() {
  const { content } = useContent()
  const { lang } = useLanguage()
  const settings = content?.elite_settings?.pwa || {}

  useEffect(() => {
    const themeColor = settings.theme_color || '#173F3A'
    document.documentElement.style.setProperty('--pwa-theme-color', themeColor)
    let meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.appendChild(meta)
    }
    meta.content = themeColor
    if (settings.app_short_name) document.title = `${settings.app_short_name} · ${document.title.split(' · ').pop() || ''}`.replace(/ · $/, '')

    if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return undefined
    if (settings.pwa_enabled === 0 || settings.pwa_enabled === false) {
      navigator.serviceWorker.getRegistrations().then((registrations) => registrations.forEach((registration) => registration.unregister())).catch(() => {})
      return undefined
    }
    const register = () => navigator.serviceWorker.register('/service-worker.js', { scope: '/' }).catch(() => {})
    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { once: true })
    return () => window.removeEventListener('load', register)
  }, [settings.pwa_enabled, settings.theme_color, settings.app_short_name, lang])

  return null
}
