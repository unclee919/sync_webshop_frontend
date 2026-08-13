import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getItem, getProductReviews, getRecommendations, submitProductReview } from '../api/client'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import { useUltraExperience } from '../context/UltraExperienceContext'
import SEOHead from '../components/SEOHead'
import LoginModal from '../components/LoginModal'
import ImmersiveProductViewer from '../components/ImmersiveProductViewer'
import CompleteTheLook from '../components/CompleteTheLook'
import SpatialProductControls from '../components/SpatialProductControls'
import FitGuide from '../components/FitGuide'
import ProductStageSwitcher from '../components/ProductStageSwitcher'
import './Products.css'

export default function ProductDetail() {
  const { itemCode } = useParams()
  const { lang, isRtl } = useLanguage()
  const { content } = useContent()
  const { activateProductPalette, resetProductPalette, beginSharedTransition, prefetchProduct } = useUltraExperience()
  const { addItem } = useCart()
  const navigate = useNavigate()
  const isArabic = lang === 'ar'
  const c = content || {}
  const productSettings = c.product_settings || {}
  const reviewTitle = isArabic ? (productSettings.reviews_title_ar || 'آراء العملاء') : (productSettings.reviews_title_en || 'Customer reviews')
  const [item, setItem] = useState(null)
  const [reviews, setReviews] = useState(null)
  const [relatedItems, setRelatedItems] = useState([])
  const [error, setError] = useState(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [reviewNotice, setReviewNotice] = useState(null)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, reviewTitle: '', reviewText: '', displayName: '' })

  useEffect(() => {
    setItem(null)
    setReviews(null)
    setRelatedItems([])
    setError(null)
    setAdded(false)
    setReviewNotice(null)
    getItem(itemCode).then(setItem).catch((err) => setError(err.message))
    getRecommendations({ itemCode, limit: 4 }).then((result) => setRelatedItems(Array.isArray(result) ? result : [])).catch(() => setRelatedItems([]))
    if (productSettings.reviews_enabled !== 0) {
      getProductReviews({ itemCode }).then(setReviews).catch(() => setReviews(null))
    }
    if (productSettings.enable_recently_viewed !== 0) {
      try {
        const limit = Math.max(1, Number(productSettings.recently_viewed_limit) || 8)
        const previous = JSON.parse(localStorage.getItem('sync_webshop_recently_viewed') || '[]').filter((value) => value !== itemCode)
        localStorage.setItem('sync_webshop_recently_viewed', JSON.stringify([itemCode, ...previous].slice(0, limit)))
      } catch { /* local storage may be unavailable */ }
    }
  }, [itemCode, productSettings.enable_recently_viewed, productSettings.recently_viewed_limit, productSettings.reviews_enabled])

  useEffect(() => {
    if (!item) return undefined
    activateProductPalette(item)
    ;(item.recommendations || relatedItems || []).forEach((product) => prefetchProduct(product.item_code))
    return () => resetProductPalette()
  }, [item, relatedItems, activateProductPalette, resetProductPalette, prefetchProduct])

  if (error) return <div className={`products-page container ${isRtl ? 'rtl' : 'ltr'}`}><p className="error-box">{isArabic ? 'تعذر تحميل المنتج' : 'Could not load this item'}: {error}</p></div>
  if (!item) return <div className={`products-page container ${isRtl ? 'rtl' : 'ltr'}`}><p className="loading-state">{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</p></div>

  const availableQty = Number(item.stock?.available_qty || 0)
  const isInStock = item.stock?.in_stock || availableQty > 0
  const maxQty = availableQty > 0 ? Math.max(1, Math.floor(availableQty)) : 1
  const reviewStats = reviews?.stats || { average: item.rating || 0, count: item.review_count || 0 }

  function cartItem() { return { item_code: item.item_code, item_name: item.item_name, price: item.price, currency: item.currency, image: item.image } }
  function handleAdd() {
    if (!isInStock) return
    addItem(cartItem(), qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }
  function handleBuyNow() {
    if (!isInStock) return
    let customer = null
    try { customer = JSON.parse(localStorage.getItem('sync_webshop_customer') || 'null') } catch { customer = null }
    if (!customer?.status) { setShowLogin(true); return }
    addItem(cartItem(), qty)
    navigate('/checkout?express=1')
  }

  async function handleReviewSubmit(event) {
    event.preventDefault()
    setReviewSubmitting(true)
    setReviewNotice(null)
    try {
      const response = await submitProductReview({ itemCode: item.item_code, ...reviewForm })
      setReviewNotice(response.pending ? (isArabic ? 'تم إرسال تقييمك للمراجعة.' : 'Your review was submitted for approval.') : (isArabic ? 'شكراً لتقييمك.' : 'Thank you for your review.'))
      setReviewForm({ rating: 5, reviewTitle: '', reviewText: '', displayName: '' })
      if (!response.pending) setReviews((current) => current ? { ...current, stats: response.stats, reviews: [response.review, ...(current.reviews || [])] } : current)
    } catch (err) {
      setReviewNotice(err.message)
    } finally {
      setReviewSubmitting(false)
    }
  }

  return (
    <div className={`products-page container ${isRtl ? 'rtl' : 'ltr'}`}>
      <SEOHead title={item.item_name} description={item.description || item.item_name} image={item.image} type="product" />
      <div className="breadcrumb"><Link to="/">{isArabic ? 'الرئيسية' : 'Home'}</Link><span>/</span><Link to="/products">{isArabic ? 'المنتجات' : 'Products'}</Link><span>/</span><span>{item.item_name}</span></div>
      <div className="product-detail-layout">
        <div className="product-gallery"><ImmersiveProductViewer item={item} enabled={productSettings.enable_immersive_viewer !== 0} /><ProductStageSwitcher item={item} /><SpatialProductControls item={item} settings={productSettings} /><FitGuide item={item} settings={productSettings} /></div>
        <div className="product-info">
          <span className="product-cat">{item.item_group}</span>
          <h1>{item.item_name}</h1>
          <div className="product-rate-feedback"><div className="star-rating"><div className="stars-outer">★★★★★<div className="stars-inner" style={{ width: `${Number(reviewStats.average || 0) * 20}%` }}>★★★★★</div></div></div><span className="rating-count">({reviewStats.count || 0} {isArabic ? 'تقييم' : 'reviews'})</span></div>
          <div className="detail-price">{item.price != null ? <span className="current-price">{Number(item.price).toFixed(2)} {item.currency}</span> : <span className="price-empty">{isArabic ? 'السعر عند الطلب' : 'Price on request'}</span>}</div>
          <div className={`stock-message ${isInStock ? 'stock-ok' : 'stock-out'}`}>{isInStock ? `${isArabic ? 'متوفر' : 'In stock'}${availableQty ? ` · ${availableQty} ${isArabic ? 'متاح' : 'available'}` : ''}` : (isArabic ? 'غير متوفر حالياً' : 'Currently unavailable')}</div>
          {item.attributes?.length > 0 && <div className="variant-attributes"><h3>{isArabic ? 'المواصفات' : 'Available options'}</h3>{item.attributes.map((attribute) => <span className="variant-chip" key={`${attribute.attribute}-${attribute.value}`}>{attribute.attribute}: {attribute.value}</span>)}</div>}
          <div className="product-detail-description-wrapper"><div className="product-detail-description" dangerouslySetInnerHTML={{ __html: item.description || '' }} /></div>
          <ul className="product-meta"><li>{isArabic ? (c.item_code_label_ar || 'رمز المنتج:') : (c.item_code_label_en || 'Item Code:')} <span>{item.item_code}</span></li><li>{isArabic ? (c.category_label_ar || 'الفئة:') : (c.category_label_en || 'Category:')} <span>{item.item_group}</span></li>{item.stock_uom && <li>{isArabic ? (c.unit_label_ar || 'الوحدة:') : (c.unit_label_en || 'Unit:')} <span>{item.stock_uom}</span></li>}</ul>
          <div className="detail-actions"><div className="qty-input"><button className="qty-btn" onClick={() => setQty((value) => Math.max(1, value - 1))}>−</button><input type="number" min="1" max={maxQty} value={qty} onChange={(e) => setQty(Math.min(maxQty, Math.max(1, parseInt(e.target.value, 10) || 1)))} /><button className="qty-btn" onClick={() => setQty((value) => Math.min(maxQty, value + 1))}>+</button></div><button className={`add-cart-large ${added ? 'added' : ''}`} disabled={!isInStock} onClick={handleAdd}>{added ? (isArabic ? (c.added_text_ar || 'تمت الإضافة') : (c.added_text_en || 'Added')) : (isArabic ? (c.add_to_cart_text_ar || 'أضف إلى السلة') : (c.add_to_cart_text_en || 'Add to Cart'))}</button><button className="buy-now-button" disabled={!isInStock} onClick={handleBuyNow}>{isArabic ? 'اشترِ الآن' : 'Buy now'}</button></div>
        </div>
      </div>
      <CompleteTheLook item={item} products={item.recommendations || relatedItems} content={c} />
      <div className="mobile-sticky-buy"><div><strong>{Number(item.price || 0).toFixed(2)} {item.currency}</strong><span>{isInStock ? (isArabic ? 'متوفر الآن' : 'Available now') : (isArabic ? 'غير متوفر' : 'Unavailable')}</span></div><button type="button" disabled={!isInStock} onClick={handleAdd}>{added ? (isArabic ? 'تمت الإضافة' : 'Added') : (isArabic ? 'أضف إلى السلة' : 'Add to cart')}</button></div>
      {productSettings.reviews_enabled !== 0 && <section className="reviews-section">
        <div className="section-heading"><h2>{reviewTitle}</h2></div>
        <div className="reviews-summary"><strong>{Number(reviewStats.average || 0).toFixed(1)}</strong><span>★★★★★</span><small>{reviewStats.count || 0} {isArabic ? 'تقييم' : 'reviews'}</small></div>
        {reviews?.reviews?.length > 0 ? <div className="reviews-list">
          {reviews.reviews.map((review) => <article className="review-card" key={review.name}>
            <div><strong>{review.display_name || (isArabic ? 'عميل' : 'Customer')}</strong>{review.verified_purchase ? <small>{isArabic ? 'شراء موثق' : 'Verified purchase'}</small> : null}</div>
            <span className="review-stars">{'★'.repeat(Number(review.rating || 0))}{'☆'.repeat(Math.max(0, 5 - Number(review.rating || 0)))}</span>
            {review.review_title && <h3>{review.review_title}</h3>}
            <p>{review.review_text}</p>
          </article>)}
        </div> : <p className="dashboard-empty">{isArabic ? 'كن أول من يشارك رأيه.' : 'Be the first to review this product.'}</p>}
        <form className="review-form" onSubmit={handleReviewSubmit}>
          <h3>{isArabic ? 'شارك رأيك' : 'Share your review'}</h3>
          <label>{isArabic ? 'التقييم' : 'Rating'}<select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>{[5, 4, 3, 2, 1].map((value) => <option value={value} key={value}>{value} ★</option>)}</select></label>
          <label>{isArabic ? 'العنوان' : 'Title'}<input value={reviewForm.reviewTitle} onChange={(e) => setReviewForm({ ...reviewForm, reviewTitle: e.target.value })} /></label>
          <label>{isArabic ? 'التعليق' : 'Review'}<textarea required value={reviewForm.reviewText} onChange={(e) => setReviewForm({ ...reviewForm, reviewText: e.target.value })} /></label>
          <label>{isArabic ? 'الاسم الظاهر' : 'Display name'}<input value={reviewForm.displayName} onChange={(e) => setReviewForm({ ...reviewForm, displayName: e.target.value })} /></label>
          {reviewNotice && <p className="dashboard-notice">{reviewNotice}</p>}
          <button type="submit" disabled={reviewSubmitting}>{reviewSubmitting ? (isArabic ? 'جارٍ الإرسال...' : 'Submitting...') : (isArabic ? 'إرسال التقييم' : 'Submit review')}</button>
        </form>
      </section>}
      {(item.recommendations || relatedItems).length > 0 && <section className="related-products"><div className="section-heading"><h2>{isArabic ? (c.related_products_title_ar || 'قد يعجبك أيضاً') : (c.related_products_title_en || 'You may also like')}</h2></div><div className="product-grid">{(item.recommendations || relatedItems).map((product) => <Link className="product-card" data-magnetic="true" to={`/products/${encodeURIComponent(product.item_code)}`} key={product.item_code} onMouseEnter={() => prefetchProduct(product.item_code)} onFocus={() => prefetchProduct(product.item_code)} onClick={(event) => { activateProductPalette(product); beginSharedTransition(product, event.currentTarget.getBoundingClientRect()) }}><div className="product-card-image">{product.image ? <img src={product.image} alt={product.item_name} /> : <div className="no-image">{isArabic ? 'لا توجد صورة' : 'No image'}</div>}</div><div className="product-card-body"><h3>{product.item_name}</h3>{product.price != null && <p className="card-price">{Number(product.price).toFixed(2)} {product.currency}</p>}</div></Link>)}</div></section>}
      {showLogin && <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onSuccess={() => { setShowLogin(false); addItem(cartItem(), qty); navigate('/checkout?express=1') }} />}
    </div>
  )
}
