import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFlashSaleItems, getLiveShopping } from '../api/client'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import { formatStorefrontPrice } from '../utils/currency'
import './EnterpriseExperience.css'

export default function EnterpriseExperience() {
  const { content } = useContent()
  const { lang, isRtl } = useLanguage()
  const [live, setLive] = useState(null)
  const [saleItems, setSaleItems] = useState([])
  const settings = content?.enterprise_settings || {}
  const isArabic = lang === 'ar'
  const t = (en, ar) => isArabic ? (ar || en) : (en || ar)

  useEffect(() => {
    if (settings.live_shopping?.enabled) getLiveShopping().then(setLive).catch(() => setLive(null))
    if (settings.flash_sales?.enabled) getFlashSaleItems(8).then((items) => setSaleItems(Array.isArray(items) ? items : [])).catch(() => setSaleItems([]))
  }, [settings.live_shopping?.enabled, settings.flash_sales?.enabled])

  if (!live?.enabled && saleItems.length === 0) return null
  return <section className={`enterprise-experience ${isRtl ? 'rtl' : 'ltr'}`}>
    <div className="container">
      {live?.enabled && live.stream_url && <article className="live-shopping-panel"><div className="live-shopping-copy"><span className="section-kicker">{t('Live now', 'مباشر الآن')}</span><h2>{t(live.title_en, live.title_ar)}</h2><p>{t('Join the next tasting, workshop, or product drop from the storefront.', 'انضم إلى جلسة التذوق أو الورشة أو إطلاق المنتج مباشرة من المتجر.')}</p></div><div className="live-shopping-frame"><iframe title={t(live.title_en, live.title_ar)} src={live.stream_url} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" /></div></article>}
      {saleItems.length > 0 && <div className="flash-sale-panel"><div className="home-section-heading"><div><span className="section-kicker">{t('A considered moment', 'لحظة مختارة')}</span><h2>{t('Limited-time edit', 'مختارات لفترة محدودة')}</h2></div><span className="scarcity-note">{t('Desk-controlled offer', 'عرض مضبوط من Desk')}</span></div><div className="flash-sale-grid">{saleItems.map((item) => <Link className="flash-sale-card" to={`/products/${encodeURIComponent(item.item_code)}`} key={item.item_code}><div className="flash-sale-media">{item.image ? <img src={item.image} alt={item.item_name} loading="lazy" /> : <span>{item.item_name?.slice(0, 1)}</span>}<b>-{item.discount_percent}%</b></div><strong>{item.item_name}</strong><span>{formatStorefrontPrice(item.price, undefined, content)} <del>{formatStorefrontPrice(item.old_price, undefined, content)}</del></span>{item.scarcity && <small>{t(`Only ${Math.round(item.stock)} left`, `متبقي ${Math.round(item.stock)} فقط`)}</small>}</Link>)}</div></div>}
    </div>
  </section>
}
