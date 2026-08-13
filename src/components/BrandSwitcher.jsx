import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import './BrandSwitcher.css'

export default function BrandSwitcher() {
  const { content } = useContent()
  const { lang } = useLanguage()
  const [open, setOpen] = useState(false)
  const brands = Array.isArray(content?.storefront_brands) ? content.storefront_brands : []
  const isArabic = lang === 'ar'
  const current = brands.find((brand) => Number(brand.is_default) === 1) || brands[0]
  if (!current) return null
  const mark = (brand) => String(brand.profile_name || brand.label_en || brand.label_ar || '?').trim().charAt(0).toUpperCase()

  function visitBrand(brand) {
    setOpen(false)
    if (brand.domain && brand.domain !== window.location.origin) window.location.assign(brand.domain)
  }

  return <div className="brand-switcher"><button type="button" className="brand-switcher-trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open}><span className="brand-switcher-mark" style={{ background: current.accent_color || 'var(--color-primary)' }}>{mark(current)}</span><span><small>{isArabic ? 'تسوق من' : 'Shop from'}</small><strong>{isArabic ? (current.label_ar || current.label_en) : (current.label_en || current.label_ar)}</strong></span><span className={`brand-switcher-chevron ${open ? 'open' : ''}`}>⌄</span></button><AnimatePresence>{open && <motion.div className="brand-switcher-menu" initial={{ opacity: 0, y: -6, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: .98 }} transition={{ duration: .18 }}><span className="brand-switcher-menu-title">{isArabic ? 'علاماتنا التجارية' : 'Our storefronts'}</span>{brands.map((brand) => <button type="button" className="brand-switcher-option" key={brand.store_key || brand.name} onClick={() => visitBrand(brand)}><span className="brand-switcher-mark" style={{ background: brand.accent_color || 'var(--color-primary)' }}>{mark(brand)}</span><span><strong>{isArabic ? (brand.label_ar || brand.label_en) : (brand.label_en || brand.label_ar)}</strong><small>{brand.domain?.replace(/^https?:\/\//, '')}</small></span><span className="brand-switcher-arrow">↗</span></button>)}</motion.div>}</AnimatePresence></div>
}
