import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getItem } from '../api/client'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import SEOHead from '../components/SEOHead'
import './Products.css'

export default function ProductDetail() {
  const { itemCode } = useParams()
  const { lang, isRtl } = useLanguage()
  const { content } = useContent()
  const c = content || {}
  const [item, setItem] = useState(null)
  const [error, setError] = useState(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()
  const isArabic = lang === 'ar'

  useEffect(() => {
    setItem(null)
    setError(null)
    setAdded(false)
    getItem(itemCode).then(setItem).catch((err) => setError(err.message))
  }, [itemCode])

  if (error) return <div className={`products-page container ${isRtl ? 'rtl' : 'ltr'}`}><p className="error-box">{isArabic ? 'تعذر تحميل المنتج' : 'Could not load this item'}: {error}</p></div>
  if (!item) return <div className={`products-page container ${isRtl ? 'rtl' : 'ltr'}`}><p className="loading-state">{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</p></div>

  const availableQty = Number(item.stock?.available_qty || 0)
  const isInStock = item.stock?.in_stock || availableQty > 0
  const maxQty = availableQty > 0 ? Math.max(1, Math.floor(availableQty)) : 1

  function handleAdd() {
    if (!isInStock) return
    addItem({ item_code: item.item_code, item_name: item.item_name, price: item.price, currency: item.currency, image: item.image }, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className={`products-page container ${isRtl ? 'rtl' : 'ltr'}`}>
      <SEOHead title={item.item_name} description={item.description || item.item_name} image={item.image} type="product" />
      <div className="breadcrumb"><Link to="/">{isArabic ? 'الرئيسية' : 'Home'}</Link><span>/</span><Link to="/products">{isArabic ? 'المنتجات' : 'Products'}</Link><span>/</span><span>{item.item_name}</span></div>
      <div className="product-detail-layout">
        <div className="product-gallery">
          {item.image ? <img src={item.image} alt={item.item_name} className="main-image" /> : <div className="no-image-large">{isArabic ? 'لا توجد صورة' : 'No image'}</div>}
        </div>
        <div className="product-info">
          <span className="product-cat">{item.item_group}</span>
          <h1>{item.item_name}</h1>
          <div className="product-rate-feedback"><div className="star-rating"><div className="stars-outer">★★★★★<div className="stars-inner" style={{ width: `${(item.rating || 4.5) * 20}%` }}>★★★★★</div></div></div><span className="rating-count">({item.review_count || 0} {isArabic ? 'تقييم' : 'reviews'})</span></div>
          <div className="detail-price">{item.price != null ? <span className="current-price">{Number(item.price).toFixed(2)} {item.currency}</span> : <span className="price-empty">{isArabic ? 'السعر عند الطلب' : 'Price on request'}</span>}</div>
          <div className={`stock-message ${isInStock ? 'stock-ok' : 'stock-out'}`}>{isInStock ? `${isArabic ? 'متوفر' : 'In stock'}${availableQty ? ` · ${availableQty} ${isArabic ? 'متاح' : 'available'}` : ''}` : (isArabic ? 'غير متوفر حالياً' : 'Currently unavailable')}</div>
          {item.attributes?.length > 0 && <div className="variant-attributes"><h3>{isArabic ? 'المواصفات' : 'Available options'}</h3>{item.attributes.map((attribute) => <span className="variant-chip" key={`${attribute.attribute}-${attribute.value}`}>{attribute.attribute}: {attribute.value}</span>)}</div>}
          <div className="product-detail-description-wrapper"><div className="product-detail-description" dangerouslySetInnerHTML={{ __html: item.description || '' }} /></div>
          <ul className="product-meta"><li>{isArabic ? (c.item_code_label_ar || 'رمز المنتج:') : (c.item_code_label_en || 'Item Code:')} <span>{item.item_code}</span></li><li>{isArabic ? (c.category_label_ar || 'الفئة:') : (c.category_label_en || 'Category:')} <span>{item.item_group}</span></li>{item.stock_uom && <li>{isArabic ? (c.unit_label_ar || 'الوحدة:') : (c.unit_label_en || 'Unit:')} <span>{item.stock_uom}</span></li>}</ul>
          <div className="detail-actions"><div className="qty-input"><button className="qty-btn" onClick={() => setQty((value) => Math.max(1, value - 1))}>−</button><input type="number" min="1" max={maxQty} value={qty} onChange={(e) => setQty(Math.min(maxQty, Math.max(1, parseInt(e.target.value, 10) || 1)))} /><button className="qty-btn" onClick={() => setQty((value) => Math.min(maxQty, value + 1))}>+</button></div><button className={`add-cart-large ${added ? 'added' : ''}`} disabled={!isInStock} onClick={handleAdd}>{added ? (isArabic ? (c.added_text_ar || 'تمت الإضافة') : (c.added_text_en || 'Added')) : (isArabic ? (c.add_to_cart_text_ar || 'أضف إلى السلة') : (c.add_to_cart_text_en || 'Add to Cart'))}</button></div>
        </div>
      </div>
      {item.recommendations?.length > 0 && <section className="related-products"><div className="section-heading"><h2>{isArabic ? (c.related_products_title_ar || 'قد يعجبك أيضاً') : (c.related_products_title_en || 'You may also like')}</h2></div><div className="product-grid">{item.recommendations.map((product) => <Link className="product-card" to={`/products/${encodeURIComponent(product.item_code)}`} key={product.item_code}><div className="product-card-image">{product.image ? <img src={product.image} alt={product.item_name} /> : <div className="no-image">{isArabic ? 'لا توجد صورة' : 'No image'}</div>}</div><div className="product-card-body"><h3>{product.item_name}</h3>{product.price != null && <p className="card-price">{Number(product.price).toFixed(2)} {product.currency}</p>}</div></Link>)}</div></section>}
    </div>
  )
}
