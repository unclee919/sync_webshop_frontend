import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getCatalog, getCategories } from '../api/client'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import { useContent } from '../context/ContentContext'
import SEOHead from '../components/SEOHead'
import './Products.css'

const PAGE_SIZE = 20

export default function ProductList() {
  const { lang, isRtl } = useLanguage()
  const { addItem } = useCart()
  const { content } = useContent()
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || undefined
  const page = Number(searchParams.get('page') || 1)
  const search = searchParams.get('search') || undefined
  
  const [catalog, setCatalog] = useState(null)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Price filter state
  const [priceRange, setPriceRange] = useState({ min_price: 0, max_price: 1000 })
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(1000)
  const [priceFilterApplied, setPriceFilterApplied] = useState(false)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)
    
    async function fetchCatalog() {
      try {
        const catalogData = await getCatalog({ 
          itemGroup: category, 
          search, 
          page, 
          pageSize: PAGE_SIZE,
          minPrice: priceFilterApplied ? minPrice : undefined,
          maxPrice: priceFilterApplied ? maxPrice : undefined
        })
        if (isMounted) {
          if (catalogData) {
            setCatalog(catalogData)
            if (catalogData.price_range) {
              setPriceRange(catalogData.price_range)
              // Only update local min/max if filter NOT applied to avoid resetting user input
              if (!priceFilterApplied) {
                setMinPrice(catalogData.price_range.min_price)
                setMaxPrice(catalogData.price_range.max_price)
              }
            }
          } else {
            setCatalog({ items: [], total_count: 0 })
          }
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    fetchCatalog()
    return () => { isMounted = false }
  }, [category, search, page, priceFilterApplied]) // Removed minPrice/maxPrice from deps

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error)
  }, [])

  function goToPage(p) {
    const next = new URLSearchParams(searchParams)
    next.set('page', p)
    setSearchParams(next)
  }

  function handleCategoryClick(catName) {
    const next = new URLSearchParams(searchParams)
    if (catName) {
      next.set('category', catName)
    } else {
      next.delete('category')
    }
    next.set('page', 1)
    setSearchParams(next)
    setPriceFilterApplied(false)
  }

  function handlePriceFilter() {
    setPriceFilterApplied(true)
    const next = new URLSearchParams(searchParams)
    next.set('page', 1)
    setSearchParams(next)
  }

  function handleResetPriceFilter() {
    setPriceFilterApplied(false)
    setMinPrice(priceRange.min_price)
    setMaxPrice(priceRange.max_price)
    const next = new URLSearchParams(searchParams)
    next.set('page', 1)
    setSearchParams(next)
  }

  const totalPages = catalog ? Math.max(1, Math.ceil(catalog.total_count / PAGE_SIZE)) : 1
  const showSidebar = content?.show_category_sidebar ?? true
  const sidebarWidth = content?.sidebar_width || 250

  return (
    <div className={`products-page container ${isRtl ? 'rtl' : 'ltr'}`}>
      <SEOHead 
        title={category || (lang === 'ar' ? 'جميع المنتجات' : 'All Products')}
      />
      
      <div className="breadcrumb">
        <Link to="/">{lang === 'ar' ? 'الرئيسية' : 'Home'}</Link>
        <span>/</span>
        <span>{lang === 'ar' ? 'المنتجات' : 'Products'}</span>
        {category && (
          <>
            <span>/</span>
            <span>{category}</span>
          </>
        )}
      </div>

      <div className="products-layout">
        {showSidebar && (
          <aside className="products-sidebar" style={{ flex: `0 0 ${sidebarWidth}px` }}>
            <div className="sidebar-widget">
              <h3 className="widget-title">{lang === 'ar' ? 'الفئات' : 'Categories'}</h3>
              <ul className="category-list">
                <li className={!category ? 'active' : ''}>
                  <button onClick={() => handleCategoryClick(null)}>
                    {lang === 'ar' ? 'جميع المنتجات' : 'All Products'}
                  </button>
                </li>
                {categories.map(cat => (
                  <li key={cat.name} className={category === cat.name ? 'active' : ''}>
                    <button onClick={() => handleCategoryClick(cat.name)}>
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {priceRange && (
              <div className="sidebar-widget">
                <h3 className="widget-title">{lang === 'ar' ? 'تصفية حسب السعر' : 'Filter by Price'}</h3>
                <div className="price-filter-content">
                  <div className="price-inputs">
                    <div className="price-input-group">
                      <label>{lang === 'ar' ? 'من' : 'From'}</label>
                      <input 
                        type="number" 
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        className="price-input"
                      />
                    </div>
                    <span className="price-sep">—</span>
                    <div className="price-input-group">
                      <label>{lang === 'ar' ? 'إلى' : 'To'}</label>
                      <input 
                        type="number" 
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="price-input"
                      />
                    </div>
                  </div>
                  <div className="price-filter-actions">
                    <button className="price-filter-btn" onClick={handlePriceFilter}>
                      {lang === 'ar' ? 'تطبيق' : 'Apply'}
                    </button>
                    {priceFilterApplied && (
                      <button className="price-reset-btn" onClick={handleResetPriceFilter}>
                        {lang === 'ar' ? 'إعادة' : 'Reset'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}
        <main className="products-main">
          <div className="products-header">
            <h1 className="products-title">
              {category ? category : (lang === 'ar' ? 'جميع المنتجات' : 'All Products')}
            </h1>
            {catalog && (
              <span className="products-count">
                {lang === 'ar' ? `تم العثور على ${catalog.total_count} منتج` : `Found ${catalog.total_count} products`}
              </span>
            )}
          </div>
          {loading ? (
            <div className="loading-state">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
          ) : error ? (
            <div className="error-box">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>{lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}</button>
            </div>
          ) : catalog?.items.length === 0 ? (
            <div className="empty-state">
              <p>{lang === 'ar' ? 'لا توجد منتجات في هذه الفئة.' : 'No products found in this category.'}</p>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {catalog.items.map((item) => (
                  <div key={item.item_code} className="product-card-wrap">
                    <div className="product-card-v2">
                      <div className="product-img-action-wrap">
                        <div className="product-img">
                          <Link to={`/products/${encodeURIComponent(item.item_code)}`}>
                            {item.image ? (
                              <img className="default-img" src={item.image} alt={item.item_name} />
                            ) : (
                              <div className="no-image-placeholder">No Image</div>
                            )}
                          </Link>
                        </div>
                        <div className="product-badges">
                          {item.is_new && <span className="badge-new">{lang === 'ar' ? 'جديد' : 'New'}</span>}
                          {item.discount_percentage > 0 && (
                            <span className="badge-hot">-{item.discount_percentage}%</span>
                          )}
                        </div>
                      </div>
                      <div className="product-content-wrap">
                        <div className="product-category">
                          <Link to={`/products?category=${encodeURIComponent(item.item_group)}`}>{item.item_group}</Link>
                        </div>
                        <h2 className="product-title">
                          <Link to={`/products/${encodeURIComponent(item.item_code)}`}>{item.item_name}</Link>
                        </h2>
                        <div className="product-rate-feedback">
                          <div className="star-rating">
                            <div className="stars-outer">
                              <div className="stars-inner" style={{ width: `${(item.rating || 4.5) * 20}%` }}></div>
                            </div>
                          </div>
                          <span className="rating-count">({item.review_count || 0})</span>
                        </div>
                        <div className="product-card-bottom">
                          <div className="product-price">
                            <span>{item.price ? `${item.price.toFixed(2)} ${item.currency}` : (lang === 'ar' ? 'عند الطلب' : 'On Request')}</span>
                            {item.old_price > item.price && (
                              <span className="old-price">{item.old_price.toFixed(2)} {item.currency}</span>
                            )}
                          </div>
                          <div className="add-cart">
                            <button className="add-btn" onClick={() => addItem(item)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                              {lang === 'ar' ? 'أضف' : 'Add'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn" 
                    disabled={page <= 1} 
                    onClick={() => goToPage(page - 1)}
                  >
                    {isRtl ? 'السابق' : 'Prev'}
                  </button>
                  <div className="pagination-numbers">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        className={`pagination-number ${page === i + 1 ? 'active' : ''}`}
                        onClick={() => goToPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button 
                    className="pagination-btn" 
                    disabled={page >= totalPages} 
                    onClick={() => goToPage(page + 1)}
                  >
                    {isRtl ? 'التالي' : 'Next'}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
