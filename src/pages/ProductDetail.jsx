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

  useEffect(() => {
    setItem(null)
    setAdded(false)
    getItem(itemCode).then(setItem).catch((err) => setError(err.message))
  }, [itemCode])

  if (error) {
    return (
      <div className={`products-page container ${isRtl ? 'rtl' : 'ltr'}`}>
        <p className="error-box">Couldn't load this item: {error}</p>
      </div>
    )
  }

  if (!item) {
    return (
      <div className={`products-page container ${isRtl ? 'rtl' : 'ltr'}`}>
        <p className="loading-state">Loading...</p>
      </div>
    )
  }

  function handleAdd() {
    addItem(
      {
        item_code: item.item_code,
        item_name: item.item_name,
        price: item.price,
        currency: item.currency,
        image: item.image
      },
      qty
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className={`products-page container ${isRtl ? 'rtl' : 'ltr'}`}>
      <SEOHead 
        title={item.item_name}
        description={item.item_name}
        image={item.image}
        type="product"
      />
      
      <div className="breadcrumb">
        <Link to="/">{lang === 'ar' ? 'الرئيسية' : 'Home'}</Link>
        <span>/</span>
        <Link to="/products">{lang === 'ar' ? 'المنتجات' : 'Products'}</Link>
        <span>/</span>
        <span>{item.item_name}</span>
      </div>

      <div className="product-detail-layout">
        <div className="product-gallery">
          {item.image ? (
            <img src={item.image} alt={item.item_name} className="main-image" />
          ) : (
            <div className="no-image-large">{lang === 'ar' ? 'لا توجد صورة' : 'No image'}</div>
          )}
        </div>

        <div className="product-info">
          <span className="product-cat">{item.item_group}</span>
          <h1>{item.item_name}</h1>
          <div className="product-rate-feedback">
            <div className="star-rating">
              <div className="stars-outer">
                ★★★★★
                <div className="stars-inner" style={{ width: `${(item.rating || 4.5) * 20}%` }}>
                  ★★★★★
                </div>
              </div>
            </div>
            <span className="rating-count" style={{ color: '#adadad', fontSize: '14px' }}>
              ({item.review_count || 0} {lang === 'ar' ? 'تقييم' : 'reviews'})
            </span>
          </div>
          
          <div className="detail-price">
            {item.price != null ? (
              <span className="current-price">
                {item.price.toFixed(2)} {item.currency}
              </span>
            ) : (
              <span className="price-empty">{lang === 'ar' ? 'السعر عند الطلب' : 'Price on request'}</span>
            )}
          </div>

          <div className="product-detail-description-wrapper">
            <div
              className="product-detail-description"
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
          </div>

          <ul className="product-meta">
            <li>{lang === 'ar' ? (c.item_code_label_ar || 'رمز المنتج:') : (c.item_code_label_en || 'Item Code:')} <span>{item.item_code}</span></li>
            <li>{lang === 'ar' ? (c.category_label_ar || 'الفئة:') : (c.category_label_en || 'Category:')} <span>{item.item_group}</span></li>
            {item.stock_uom && <li>{lang === 'ar' ? (c.unit_label_ar || 'الوحدة:') : (c.unit_label_en || 'Unit:')} <span>{item.stock_uom}</span></li>}
          </ul>

          <div className="detail-actions">
            <div className="qty-input">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <input 
                type="number" 
                value={qty} 
                onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} 
              />
              <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
            </div>
            <button 
              className={`add-cart-large ${added ? 'added' : ''}`}
              onClick={handleAdd}
            >
              {added ? (lang === 'ar' ? (c.added_text_ar || 'تمت الإضافة') : (c.added_text_en || 'Added')) : (lang === 'ar' ? (c.add_to_cart_text_ar || 'أضف إلى السلة') : (c.add_to_cart_text_en || 'Add to Cart'))}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
