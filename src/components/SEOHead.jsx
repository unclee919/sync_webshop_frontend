import { useEffect } from 'react'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'

function addScript(id, src, inlineCode) {
  if (document.getElementById(id)) return
  const script = document.createElement('script')
  script.id = id
  if (src) script.src = src
  if (inlineCode) script.textContent = inlineCode
  if (src) script.async = true
  document.head.appendChild(script)
}

function addJsonLd(id, value) {
  let script = document.getElementById(id)
  if (!script) {
    script = document.createElement('script')
    script.id = id
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(value)
}

export default function SEOHead({ title, description, image, url, type = 'website' }) {
  const { content } = useContent()
  const { lang } = useLanguage()

  useEffect(() => {
    if (!content) return
    const siteName = content.site_name || 'Sync Webshop'
    const pageTitle = title ? `${title} | ${siteName}` : siteName
    const pageDescription = description || (lang === 'ar' ? content.seo_meta_description_ar : content.seo_meta_description_en) || ''
    const pageImage = image || content.seo_og_image || ''
    const pageUrl = url || window.location.href
    const keywords = content.seo_keywords || ''
    window.__syncWebshopAnalyticsEnabled = content.analytics_events_enabled === true || content.analytics_events_enabled === 1
    window.__syncWebshopAnalyticsConfig = { ga4: content.ga4_measurement_id || null, facebook: content.facebook_pixel_id || null, tiktok: content.tiktok_pixel_id || null }

    document.title = pageTitle
    function setMeta(property, value, isName = false) {
      if (!value) return
      const attr = isName ? 'name' : 'property'
      let element = document.querySelector(`meta[${attr}="${property}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attr, property)
        document.head.appendChild(element)
      }
      element.setAttribute('content', value)
    }

    setMeta('description', pageDescription, true)
    setMeta('keywords', keywords, true)
    setMeta('og:title', pageTitle)
    setMeta('og:description', pageDescription)
    setMeta('og:image', pageImage)
    setMeta('og:url', pageUrl)
    setMeta('og:type', type)
    setMeta('og:site_name', siteName)
    setMeta('og:locale', lang === 'ar' ? 'ar_AR' : 'en_US')
    setMeta('twitter:card', 'summary_large_image', true)
    setMeta('twitter:title', pageTitle, true)
    setMeta('twitter:description', pageDescription, true)
    setMeta('twitter:image', pageImage, true)

    addJsonLd('sync-webshop-website-schema', { '@context': 'https://schema.org', '@type': 'WebSite', name: siteName, description: pageDescription, url: pageUrl, inLanguage: lang === 'ar' ? 'ar' : 'en' })
    if (content.seo?.structured_data) {
      try {
        const configured = typeof content.seo.structured_data === 'string' ? JSON.parse(content.seo.structured_data) : content.seo.structured_data
        addJsonLd('sync-webshop-configured-schema', configured)
      } catch {
        // Invalid Desk JSON must not break storefront rendering.
      }
    }

    if (content.enable_analytics_tracking && content.ga4_measurement_id) {
      const measurementId = content.ga4_measurement_id
      window.dataLayer = window.dataLayer || []
      window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments) }
      window.gtag('js', new Date())
      window.gtag('config', measurementId, { anonymize_ip: true })
      addScript('sync-webshop-ga4-src', `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`)
    }
    if (content.enable_analytics_tracking && content.facebook_pixel_id) {
      const pixelId = String(content.facebook_pixel_id).replace(/[^a-zA-Z0-9_-]/g, '')
      addScript('sync-webshop-facebook-pixel', null, `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`)
    }
    if (content.enable_analytics_tracking && content.tiktok_pixel_id) {
      const pixelId = String(content.tiktok_pixel_id).replace(/[^a-zA-Z0-9_-]/g, '')
      addScript('sync-webshop-tiktok-pixel', null, `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var r='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var s=d.createElement('script');s.type='text/javascript';s.async=!0;s.src=r+'?sdkid='+e+'&lib='+t;var a=d.getElementsByTagName('script')[0];a.parentNode.insertBefore(s,a)};ttq.load('${pixelId}');ttq.page()}(window,document,'ttq');`)
    }
  }, [content, title, description, image, url, type, lang])

  return null
}
