import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import './BrandSwitcher.css'

const DEFAULT_BRANDS = [
  { key: 'luxury', label_en: 'Luxury', label_ar: 'الفاخرة', domain: 'https://luxury.sync-webshop.com', accent: '#c5a059' },
  { key: 'budget', label_en: 'Budget', label_ar: 'اليومية', domain: 'https://budget.sync-webshop.com', accent: '#10b981' },
]

export default function BrandSwitcher() {
  const { content } = useContent()
  const { lang } = useLanguage()
  const [open, setOpen] = useState(false)
  const brands = content?.storefront_brands?.length ? content.storefront_brands : DEFAULT_BRANDS
  const isArabic = lang === 'ar'
  const current = brands[0]

  function visitBrand(brand) {
    setOpen(false)
    if (brand.domain && brand.domain !== window.location.origin) window.location.assign(brand.domain)
  }

  return <div className="brand-switcher"><button type="button" className="brand-switcher-trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open}><span className="brand-switcher-mark" style={{ background: current.accent }}>S</span><span><small>{isArabic ? 'تسوق من' : 'Shop from'}</small><strong>{isArabic ? (current.label_ar || current.label_en) : (current.label_en || current.label_ar)}</strong></span><span className={`brand-switcher-chevron ${open ? 'open' : ''}`}>⌄</span></button><AnimatePresence>{open && <motion.div className="brand-switcher-menu" initial={{ opacity: 0, y: -6, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: .98 }} transition={{ duration: .18 }}><span className="brand-switcher-menu-title">{isArabic ? 'علاماتنا التجارية' : 'Our storefronts'}</span>{brands.map((brand) => <button type="button" className="brand-switcher-option" key={brand.key || brand.name} onClick={() => visitBrand(brand)}><span className="brand-switcher-mark" style={{ background: brand.accent || 'var(--color-primary)' }}>S</span><span><strong>{isArabic ? (brand.label_ar || brand.label_en) : (brand.label_en || brand.label_ar)}</strong><small>{brand.domain?.replace(/^https?:\/\//, '')}</small></span><span className="brand-switcher-arrow">↗</span></button>)}</motion.div>}</AnimatePresence></div>
}
