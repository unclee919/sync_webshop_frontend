import { useEffect } from 'react'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'

/**
 * SEOHead - Dynamically manages document <head> meta tags for SEO and social sharing.
 * Reads defaults from Content Settings and can be overridden per-page via props.
 */
export default function SEOHead({ title, description, image, url, type = 'website' }) {
  const { content } = useContent()
  const { lang } = useLanguage()

  useEffect(() => {
    if (!content) return

    const siteName = content.site_name || 'Sync Webshop'
    const pageTitle = title ? `${title} | ${siteName}` : siteName
    const pageDescription = description || 
      (lang === 'ar' ? content.seo_meta_description_ar : content.seo_meta_description_en) || ''
    const pageImage = image || content.seo_og_image || ''
    const pageUrl = url || window.location.href
    const keywords = content.seo_keywords || ''

    // Update document title
    document.title = pageTitle

    // Helper to set or create a meta tag
    function setMeta(property, content, isName = false) {
      if (!content) return
      const attr = isName ? 'name' : 'property'
      let el = document.querySelector(`meta[${attr}="${property}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, property)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    // Standard SEO meta
    setMeta('description', pageDescription, true)
    setMeta('keywords', keywords, true)

    // Open Graph
    setMeta('og:title', pageTitle)
    setMeta('og:description', pageDescription)
    setMeta('og:image', pageImage)
    setMeta('og:url', pageUrl)
    setMeta('og:type', type)
    setMeta('og:site_name', siteName)
    setMeta('og:locale', lang === 'ar' ? 'ar_AR' : 'en_US')

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image', true)
    setMeta('twitter:title', pageTitle, true)
    setMeta('twitter:description', pageDescription, true)
    setMeta('twitter:image', pageImage, true)

  }, [content, title, description, image, url, type, lang])

  return null // This component only manages <head>, no visible output
}
