import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useComparison } from '../context/ComparisonContext'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import { formatStorefrontPrice } from '../utils/currency'
import './ComparisonTray.css'

export default function ComparisonTray() {
  const { items, remove, clear } = useComparison()
  const { lang, isRtl } = useLanguage()
  const { content } = useContent()
  const [open, setOpen] = useState(false)
  const isArabic = lang === 'ar'
  const uiCopy = content?.copy?.ui || {}
  const t = (en, ar, fallback = '') => (isArabic ? (ar || en || fallback) : (en || ar || fallback))
  if (!items.length) return null
  return <>
    <motion.div className={`comparison-tray ${isRtl ? 'rtl' : 'ltr'}`} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}><div className="comparison-tray-copy"><strong>{t(uiCopy.compare_products_en, uiCopy.compare_products_ar, 'Compare products')}</strong><span>{items.length}/3 {t(uiCopy.compare_items_en, uiCopy.compare_items_ar, 'items')}</span></div><div className="comparison-tray-items">{items.map((item) => <div className="comparison-tray-item" key={item.item_code}><div>{item.image ? <img src={item.image} alt="" /> : <span>{item.item_name?.slice(0, 1)}</span>}</div><button type="button" onClick={() => remove(item.item_code)} aria-label={t(uiCopy.remove_en, uiCopy.remove_ar, 'Remove')}>×</button></div>)}</div><button className="comparison-tray-primary" type="button" onClick={() => setOpen(true)} disabled={items.length < 2}>{t(uiCopy.compare_now_en, uiCopy.compare_now_ar, 'Compare now')}</button><button className="comparison-tray-clear" type="button" onClick={clear}>{t(uiCopy.clear_en, uiCopy.clear_ar, 'Clear')}</button></motion.div>
    <AnimatePresence>{open && <motion.div className="comparison-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}><motion.section className={`comparison-modal ${isRtl ? 'rtl' : 'ltr'}`} initial={{ y: 28, opacity: 0, scale: .98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 28, opacity: 0 }} onClick={(event) => event.stopPropagation()}><header><div><span className="section-kicker">{t(uiCopy.comparison_kicker_en, uiCopy.comparison_kicker_ar, 'A smarter choice')}</span><h2>{t(uiCopy.comparison_title_en, uiCopy.comparison_title_ar, 'Compare your picks')}</h2></div><button type="button" onClick={() => setOpen(false)}>×</button></header><div className="comparison-table">{items.map((item) => <article className="comparison-column" key={item.item_code}><div className="comparison-image">{item.image ? <img src={item.image} alt={item.item_name} /> : <span>{item.item_name?.slice(0, 1)}</span>}</div><h3>{item.item_name}</h3><strong>{item.price != null ? formatStorefrontPrice(item.price, item.currency, content) : (t(uiCopy.on_request_en, uiCopy.on_request_ar, 'On request'))}</strong><dl><div><dt>{t(uiCopy.search_result_category_en, uiCopy.search_result_category_ar, 'Category')}</dt><dd>{item.item_group || '—'}</dd></div><div><dt>{t(uiCopy.rating_en, uiCopy.rating_ar, 'Rating')}</dt><dd>★★★★★</dd></div><div><dt>{t(uiCopy.availability_en, uiCopy.availability_ar, 'Availability')}</dt><dd>{item.available === false || item.in_stock === false ? (t(uiCopy.unavailable_en, uiCopy.unavailable_ar, 'Unavailable')) : (t(uiCopy.available_en, uiCopy.available_ar, 'Available'))}</dd></div></dl><Link to={`/products/${encodeURIComponent(item.item_code)}`} onClick={() => setOpen(false)}>{t(uiCopy.view_product_en, uiCopy.view_product_ar, 'View product')} →</Link></article>)}</div></motion.section></motion.div>}</AnimatePresence>
  </>
}
