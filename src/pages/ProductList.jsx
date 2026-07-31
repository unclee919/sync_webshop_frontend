import { useEffect, useState } from 'react'
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
          if (catalogData.price_range) {
            setPriceRange(catalogData.price_range)
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

    return () => { isMounted = false }
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
                {categories && categories.map((cat) => (
                  <li key={cat.name} className={category === cat.name ? 'active' : ''}>
                    <button onClick={() => handleCategoryClick(cat.name)}>
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {(content?.show_price_filter ?? true) && priceRange.max_price > 0 && (
              <div className="sidebar-widget">
                <h3 className="widget-title">{lang === 'ar' ? 'تصفية حسب السعر' : 'Filter by Price'}</h3>
                <div className="price-filter">
                  <div className="price-range-inputs">
                    <div className="price-input-group">
                      <label>{lang === 'ar' ? 'من' : 'Min'}</label>
                      <input
                        type="number"
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
                        value={maxPrice ?? priceRange.max_price}
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
                  <div key={item.item_code} className="product-card">
                    <Link to={`/products/${encodeURIComponent(item.item_code)}`} className="product-img-link">
                      {item.image ? (
                        <img src={item.image} alt={item.item_name} loading="lazy" />
                      ) : (
                        <div className="no-image">{lang === 'ar' ? 'لا توجد صورة' : 'No image'}</div>
                      )}
                    </Link>
                    <div className="product-content">
                      <span className="product-cat">{item.item_group}</span>
                      <h3 className="product-title">
                        <Link to={`/products/${encodeURIComponent(item.item_code)}`}>
                          {item.item_name}
                        </Link>
                      </h3>
                      <div className="product-card-bottom">
                        <div className="product-price">
                          <span className="current-price">
                            {item.price ? `${item.price.toFixed(2)} ${item.currency}` : (lang === 'ar' ? 'عند الطلب' : 'On Request')}
                          </span>
                        </div>
                        <button 
                          className="add-to-cart-btn"
                          onClick={() => addItem(item)}
                        >
                          {lang === 'ar' ? 'أضف' : 'Add'}
                        </button>
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
