import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getItem } from '../api/client'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import SEOHead from '../components/SEOHead'
import './Products.css'

export default function ProductDetail() {
  const { itemCode } = useParams()
  const { lang, isRtl } = useLanguage()
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
            <li>{lang === 'ar' ? 'رمز المنتج:' : 'Item Code:'} <span>{item.item_code}</span></li>
            <li>{lang === 'ar' ? 'الفئة:' : 'Category:'} <span>{item.item_group}</span></li>
            {item.stock_uom && <li>{lang === 'ar' ? 'الوحدة:' : 'Unit:'} <span>{item.stock_uom}</span></li>}
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
              {added ? (lang === 'ar' ? 'تمت الإضافة' : 'Added') : (lang === 'ar' ? 'أضف إلى السلة' : 'Add to Cart')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
