import { useEffect, useState, useCallback } from 'react'
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
  const [minPrice, setMinPrice] = useState(null)
  const [maxPrice, setMaxPrice] = useState(null)
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
          setCatalog(catalogData)
          // Set price range from API response
          if (catalogData.price_range) {
            setPriceRange(catalogData.price_range)
            // Initialize slider values only if not already set by user
            if (!priceFilterApplied) {
              setMinPrice(catalogData.price_range.min_price)
              setMaxPrice(catalogData.price_range.max_price)
            }
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

    async function fetchCategories() {
      try {
        const categoriesData = await getCategories()
        if (isMounted) {
          setCategories(categoriesData || [])
        }
      } catch (err) {
        console.error("ProductList: getCategories error", err)
      }
    }

    fetchCatalog()
    fetchCategories()

    const fallback = setTimeout(() => {
      if (isMounted) setLoading(false)
    }, 5000)

    return () => { 
      isMounted = false
      clearTimeout(fallback)
    }
  }, [category, search, page, priceFilterApplied, minPrice, maxPrice])

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
    // Reset price filter when changing category
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
  const showSidebar = content?.show_category_sidebar
  const sidebarWidth = content?.sidebar_width || 220

  return (
    <div className={`products-page container ${isRtl ? 'rtl' : 'ltr'}`}>
      <SEOHead 
        title={category || (lang === 'ar' ? 'جميع المنتجات' : 'All Products')}
      />
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
                {categories && categories.map((cat) => (
                  <li key={cat.name} className={category === cat.name ? 'active' : ''}>
                    <button onClick={() => handleCategoryClick(cat.name)}>
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {content?.show_price_filter && priceRange.max_price > 0 && (
              <div className="sidebar-widget">
                <h3 className="widget-title">{lang === 'ar' ? 'تصفية حسب السعر' : 'Filter by Price'}</h3>
                <div className="price-filter">
                  <div className="price-range-inputs">
                    <div className="price-input-group">
                      <label>{lang === 'ar' ? 'من' : 'Min'}</label>
                      <input
                        type="number"
                        min={priceRange.min_price}
                        max={priceRange.max_price}
                        value={minPrice ?? priceRange.min_price}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        className="price-input"
                      />
                    </div>
                    <span className="price-separator">—</span>
                    <div className="price-input-group">
                      <label>{lang === 'ar' ? 'إلى' : 'Max'}</label>
                      <input
                        type="number"
                        min={priceRange.min_price}
                        max={priceRange.max_price}
                        value={maxPrice ?? priceRange.max_price}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="price-input"
                      />
                    </div>
                  </div>
                  <div className="price-range-slider">
                    <input
                      type="range"
                      min={priceRange.min_price}
                      max={priceRange.max_price}
                      value={minPrice ?? priceRange.min_price}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      className="range-slider range-slider-min"
                    />
                    <input
                      type="range"
                      min={priceRange.min_price}
                      max={priceRange.max_price}
                      value={maxPrice ?? priceRange.max_price}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="range-slider range-slider-max"
                    />
                  </div>
                  <div className="price-filter-actions">
                    <button className="price-filter-btn" onClick={handlePriceFilter}>
                      {lang === 'ar' ? 'تطبيق' : 'Apply'}
                    </button>
                    {priceFilterApplied && (
                      <button className="price-reset-btn" onClick={handleResetPriceFilter}>
                        {lang === 'ar' ? 'إعادة تعيين' : 'Reset'}
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
                {catalog.total_count} {lang === 'ar' ? 'عناصر' : 'items'}
              </span>
            )}
          </div>

          {error && (
            <div className="products-error-box" style={{ padding: '1rem', background: '#fee', color: '#c00', borderRadius: '8px', marginBottom: '1rem' }}>
              <p className="products-error">Couldn't load products: {error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}

          {loading && <div className="loading-state">Loading...</div>}

          {!loading && !error && catalog && catalog.items.length === 0 && (
            <p className="products-empty">{lang === 'ar' ? 'لم يتم العثور على منتجات.' : 'No products found.'}</p>
          )}

          {!loading && !error && catalog && catalog.items.length > 0 && (
            <>
              <div className="products-grid">
                {catalog.items.map((item) => (
                  <div key={item.item_code} className="product-card">
                    <Link to={`/products/${encodeURIComponent(item.item_code)}`} className="product-card-link">
                      <div className="product-card-image">
                        {item.image ? (
                          <img src={item.image} alt={item.item_name} />
                        ) : (
                          <div className="no-image">{lang === 'ar' ? 'لا توجد صورة' : 'No image'}</div>
                        )}
                      </div>
                      <div className="product-card-info">
                        <span className="product-card-group">{item.item_group}</span>
                        <h3 className="product-card-name">{item.item_name}</h3>
                        <div className="product-card-price-row">
                          {item.price != null ? (
                            <span className="product-card-price">
                              {item.price} {item.currency}
                            </span>
                          ) : (
                            <span className="product-card-price-empty">
                              {lang === 'ar' ? 'السعر عند الطلب' : 'Price on request'}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => addItem(item)}
                    >
                      {lang === 'ar' ? 'أضف إلى السلة' : 'Add to Cart'}
                    </button>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="products-pagination">
                  <button disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                    {isRtl ? '← السابق' : '← Prev'}
                  </button>
                  <span className="page-info">
                    {lang === 'ar' ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
                  </span>
                  <button disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
                    {isRtl ? 'التالي →' : 'Next →'}
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
