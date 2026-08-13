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
  if (!items.length) return null
  return <>
    <motion.div className={`comparison-tray ${isRtl ? 'rtl' : 'ltr'}`} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}><div className="comparison-tray-copy"><strong>{isArabic ? 'مقارنة المنتجات' : 'Compare products'}</strong><span>{items.length}/3 {isArabic ? 'منتجات' : 'items'}</span></div><div className="comparison-tray-items">{items.map((item) => <div className="comparison-tray-item" key={item.item_code}><div>{item.image ? <img src={item.image} alt="" /> : <span>{item.item_name?.slice(0, 1)}</span>}</div><button type="button" onClick={() => remove(item.item_code)} aria-label={isArabic ? 'إزالة' : 'Remove'}>×</button></div>)}</div><button className="comparison-tray-primary" type="button" onClick={() => setOpen(true)} disabled={items.length < 2}>{isArabic ? 'قارن الآن' : 'Compare now'}</button><button className="comparison-tray-clear" type="button" onClick={clear}>{isArabic ? 'مسح' : 'Clear'}</button></motion.div>
    <AnimatePresence>{open && <motion.div className="comparison-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}><motion.section className={`comparison-modal ${isRtl ? 'rtl' : 'ltr'}`} initial={{ y: 28, opacity: 0, scale: .98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 28, opacity: 0 }} onClick={(event) => event.stopPropagation()}><header><div><span className="section-kicker">{isArabic ? 'قرار أذكى' : 'A smarter choice'}</span><h2>{isArabic ? 'قارن اختياراتك' : 'Compare your picks'}</h2></div><button type="button" onClick={() => setOpen(false)}>×</button></header><div className="comparison-table">{items.map((item) => <article className="comparison-column" key={item.item_code}><div className="comparison-image">{item.image ? <img src={item.image} alt={item.item_name} /> : <span>{item.item_name?.slice(0, 1)}</span>}</div><h3>{item.item_name}</h3><strong>{item.price != null ? formatStorefrontPrice(item.price, item.currency, content) : (isArabic ? 'حسب الطلب' : 'On request')}</strong><dl><div><dt>{isArabic ? 'الفئة' : 'Category'}</dt><dd>{item.item_group || '—'}</dd></div><div><dt>{isArabic ? 'التقييم' : 'Rating'}</dt><dd>★★★★★</dd></div><div><dt>{isArabic ? 'التوفر' : 'Availability'}</dt><dd>{item.available === false || item.in_stock === false ? (isArabic ? 'غير متوفر' : 'Unavailable') : (isArabic ? 'متوفر' : 'Available')}</dd></div></dl><Link to={`/products/${encodeURIComponent(item.item_code)}`} onClick={() => setOpen(false)}>{isArabic ? 'عرض المنتج' : 'View product'} →</Link></article>)}</div></motion.section></motion.div>}</AnimatePresence>
  </>
}
