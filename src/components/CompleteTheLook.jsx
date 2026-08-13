import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { formatStorefrontPrice } from '../utils/currency'
import './CompleteTheLook.css'

export default function CompleteTheLook({ item, products = [], content }) {
  const { addItem } = useCart()
  const { lang, isRtl } = useLanguage()
  const isArabic = lang === 'ar'
  const [selected, setSelected] = useState(() => products.slice(0, 2).map((product) => product.item_code))
  const t = (en, ar) => isArabic ? (ar || en) : (en || ar)
  const productSettings = content?.product_settings || {}
  const titleEn = content?.complete_the_look_title_en || productSettings.complete_the_look_title_en
  const titleAr = content?.complete_the_look_title_ar || productSettings.complete_the_look_title_ar
  const picks = useMemo(() => products.filter((product) => product.item_code !== item?.item_code).slice(0, 4), [item?.item_code, products])
  const selectedProducts = picks.filter((product) => selected.includes(product.item_code))
  const bundleTotal = [item, ...selectedProducts].reduce((sum, product) => sum + Number(product?.price || 0), 0)
  if (content?.complete_the_look_enabled === 0 || productSettings.complete_the_look_enabled === 0 || !picks.length) return null

  const toggle = (itemCode) => setSelected((current) => current.includes(itemCode) ? current.filter((code) => code !== itemCode) : [...current, itemCode])
  const addBundle = () => [item, ...selectedProducts].forEach((product) => addItem({ item_code: product.item_code, item_name: product.item_name, price: product.price, currency: product.currency, image: product.image }))

  return <section className={`complete-look ${isRtl ? 'rtl' : 'ltr'}`} aria-labelledby="complete-look-title">
    <div className="complete-look-heading"><div><span className="section-kicker">{t('Styled together', 'منسقة معاً')}</span><h2 id="complete-look-title">{t(titleEn, titleAr) || t('Complete the look', 'أكمل الإطلالة')}</h2><p>{t('Thoughtful pairings that make a considered set.', 'اختيارات متناسقة لتشكيل مجموعة متكاملة.')}</p></div><span className="complete-look-total">{t('Set total', 'إجمالي المجموعة')}<strong>{formatStorefrontPrice(bundleTotal, item?.currency, content)}</strong></span></div>
    <div className="complete-look-rail">
      <article className="complete-look-base"><div>{item?.image ? <img src={item.image} alt={item.item_name} /> : <span>{item?.item_name?.slice(0, 1)}</span>}</div><strong>{item?.item_name}</strong><small>{formatStorefrontPrice(item?.price, item?.currency, content)}</small><span className="complete-look-plus">+</span></article>
      {picks.map((product) => <motion.button layout type="button" key={product.item_code} className={`complete-look-card ${selected.includes(product.item_code) ? 'selected' : ''}`} onClick={() => toggle(product.item_code)} aria-pressed={selected.includes(product.item_code)}><div>{product.image ? <img src={product.image} alt={product.item_name} /> : <span>{product.item_name?.slice(0, 1)}</span>}<span className="complete-look-check">{selected.includes(product.item_code) ? '✓' : '+'}</span></div><strong>{product.item_name}</strong><small>{product.price != null ? formatStorefrontPrice(product.price, product.currency, content) : t('On request', 'حسب الطلب')}</small></motion.button>)}
    </div>
    <button type="button" className="complete-look-cta" onClick={addBundle}>{t('Add the set to bag', 'أضف المجموعة إلى السلة')} <span>→</span></button>
  </section>
}
