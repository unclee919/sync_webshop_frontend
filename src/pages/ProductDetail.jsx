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
      <div className={`product-detail-page container ${isRtl ? 'rtl' : 'ltr'}`}>
        <p className="products-error">Couldn't load this item: {error}</p>
      </div>
    )
  }

  if (!item) {
    return (
      <div className={`product-detail-page container ${isRtl ? 'rtl' : 'ltr'}`}>
        <p className="products-empty">Loading...</p>
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

  // Build SEO description from item details
  const seoDescription = item.price 
    ? `${item.item_name} - ${item.price} ${item.currency}` 
    : item.item_name

  return (
    <div className={`product-detail-page container ${isRtl ? 'rtl' : 'ltr'}`}>
      <SEOHead 
        title={item.item_name}
        description={seoDescription}
        image={item.image}
        type="product"
      />
      <nav className="breadcrumb">
        <Link to="/">{lang === 'ar' ? 'الرئيسية' : 'Home'}</Link> / 
        <Link to="/products">{lang === 'ar' ? 'المنتجات' : 'Products'}</Link> / 
        <span>{item.item_name}</span>
      </nav>

      <div className="product-detail">
        <div className="product-detail-media">
          {item.image ? (
            <img src={item.image} alt={item.item_name} />
          ) : (
            <div className="no-image-large">{lang === 'ar' ? 'لا توجد صورة' : 'No image'}</div>
          )}
        </div>

        <div className="product-detail-info">
          <span className="product-detail-group">{item.item_group}</span>
          <h1 className="product-detail-name">{item.item_name}</h1>
          
          <div className="product-detail-price-row">
            {item.price != null ? (
              <div className="price-display">
                <span className="current-price">{item.price} {item.currency}</span>
                {item.stock_uom && <span className="uom"> / {item.stock_uom}</span>}
              </div>
            ) : (
              <span className="price-empty">{lang === 'ar' ? 'السعر عند الطلب' : 'Price on request'}</span>
            )}
          </div>

          <div className="product-detail-description-wrapper">
            <h3>{lang === 'ar' ? 'الوصف' : 'Description'}</h3>
            <div
              className="product-detail-description"
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
          </div>

          <div className="product-detail-actions">
            <div className="qty-stepper">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <input 
                type="number" 
                value={qty} 
                onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} 
              />
              <button onClick={() => setQty(q => q + 1)}>+</button>
            </div>
            <button 
              className={`add-to-cart-large ${added ? 'added' : ''}`}
              onClick={handleAdd}
            >
              {added ? (lang === 'ar' ? 'تمت الإضافة ✓' : 'Added ✓') : (lang === 'ar' ? 'أضف إلى السلة' : 'Add to Cart')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
