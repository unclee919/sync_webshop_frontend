import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import './Products.css'

export default function Wishlist() {
  const { content } = useContent()
  const { lang, isRtl } = useLanguage()
  const { addItem } = useCart()
  const [items, setItems] = useState([])
  const isArabic = lang === 'ar'
  const t = (en, ar, fallback = '') => (isArabic ? (ar || en || fallback) : (en || ar || fallback))

  useEffect(() => {
    const read = () => {
      try { setItems(JSON.parse(localStorage.getItem('sync_webshop_wishlist') || '[]')) } catch { setItems([]) }
    }
    read()
    window.addEventListener('wishlist-updated', read)
    return () => window.removeEventListener('wishlist-updated', read)
  }, [])

  const remove = (itemCode) => {
    const next = items.filter((item) => item.item_code !== itemCode)
    localStorage.setItem('sync_webshop_wishlist', JSON.stringify(next))
    setItems(next)
  }

  return <div className={`products-page container ${isRtl ? 'rtl' : 'ltr'}`}>
    <div className="breadcrumb"><Link to="/">{t('Home', 'الرئيسية')}</Link><span>/</span><span>{t('Wishlist', 'المفضلة')}</span></div>
    <div className="products-header"><h1 className="products-title">{t(content?.wishlist_text_en, content?.wishlist_text_ar, 'Wishlist')}</h1><span className="products-count">{items.length} {t('saved items', 'منتجات محفوظة')}</span></div>
    {items.length === 0 ? <div className="empty-state"><p>{t('Your wishlist is empty. Save products you would like to revisit.', 'قائمة المفضلة فارغة. احفظ المنتجات التي تريد العودة إليها.')}</p><Link className="primary-button" to="/products">{t('Browse products', 'تصفح المنتجات')}</Link></div> : <div className="products-grid">{items.map((item) => <article key={item.item_code} className="product-card-v2"><div className="product-img-action-wrap"><Link to={`/products/${encodeURIComponent(item.item_code)}`}>{item.image ? <img className="default-img" src={item.image} alt={item.item_name} /> : <span className="no-image-large">{item.item_name?.slice(0, 1)}</span>}</Link></div><div className="product-content-wrap"><Link className="product-category" to={`/products?category=${encodeURIComponent(item.item_group || '')}`}>{item.item_group}</Link><h2 className="product-title"><Link to={`/products/${encodeURIComponent(item.item_code)}`}>{item.item_name}</Link></h2><div className="product-card-bottom"><div className="product-price">{item.price ? `${Number(item.price).toFixed(2)} ${item.currency || ''}` : t('On request', 'حسب الطلب')}</div><button className="add-btn" type="button" onClick={() => addItem(item)}>{t('Add', 'أضف')}</button></div><button className="wishlist-remove" type="button" onClick={() => remove(item.item_code)}>{t('Remove', 'إزالة')}</button></div></article>)}</div>}
  </div>
}
