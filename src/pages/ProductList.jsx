import { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getCatalog, getCategories } from '../api/client'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import { useContent } from '../context/ContentContext'
import { useComparison } from '../context/ComparisonContext'
import SEOHead from '../components/SEOHead'
import QuickView from '../components/QuickView'
import './Products.css'

const PAGE_SIZE = 20

export default function ProductList() {
  const { lang, isRtl } = useLanguage()
  const { addItem } = useCart()
  const { content } = useContent()
  const { add: addToCompare, remove: removeFromCompare, isCompared } = useComparison()
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || undefined
  const page = Number(searchParams.get('page') || 1)
  const search = searchParams.get('search') || undefined
  
  const [catalog, setCatalog] = useState(null)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Faceted Filter state
  const [priceRange, setPriceRange] = useState({ min_price: 0, max_price: 1000 })
  const [minPrice, setMinPrice] = useState(undefined)
  const [maxPrice, setMaxPrice] = useState(undefined)
  const [draftMinPrice, setDraftMinPrice] = useState('')
  const [draftMaxPrice, setDraftMaxPrice] = useState('')
  const [filtersInitialized, setFiltersInitialized] = useState(false)
  const [selectedAttrs, setSelectedAttrs] = useState({})
  const [quickViewCode, setQuickViewCode] = useState(null)

  const isArabic = lang === 'ar'
  const t = (en, ar, fallback = '') => (isArabic ? (ar || en || fallback) : (en || ar || fallback))

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    
    async function fetchCatalog() {
      try {
        const catalogData = await getCatalog({ 
          itemGroup: category, 
          search, 
          page, 
          pageSize: PAGE_SIZE,
          minPrice: minPrice !== priceRange.min_price || maxPrice !== priceRange.max_price ? minPrice : undefined,
          maxPrice: minPrice !== priceRange.min_price || maxPrice !== priceRange.max_price ? maxPrice : undefined,
          attributes: Object.keys(selectedAttrs).length > 0 ? selectedAttrs : undefined
        })
        if (isMounted) {
          setCatalog(catalogData || { items: [], total_count: 0 })
          if (catalogData?.price_range) {
            setPriceRange(catalogData.price_range)
            if (!filtersInitialized) {
              setDraftMinPrice(String(catalogData.price_range.min_price ?? ''))
              setDraftMaxPrice(String(catalogData.price_range.max_price ?? ''))
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

    fetchCatalog()
    return () => { isMounted = false }
  }, [category, search, page, minPrice, maxPrice, selectedAttrs, filtersInitialized])

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error)
  }, [])

  const toggleAttribute = (attr, value) => {
    setSelectedAttrs(prev => {
      const next = { ...prev }
      if (!next[attr]) next[attr] = []
      if (next[attr].includes(value)) {
        next[attr] = next[attr].filter(v => v !== value)
        if (next[attr].length === 0) delete next[attr]
      } else {
        next[attr] = [...next[attr], value]
      }
      return next
    })
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('page', 1)
    setSearchParams(nextParams)
  }

  const showSidebar = content?.show_category_sidebar ?? true
  const sidebarWidth = content?.sidebar_width || 250
  const totalPages = catalog ? Math.ceil(catalog.total_count / PAGE_SIZE) : 1
  const renderCategoryOptions = (items = [], depth = 0) => items.map((cat) => <li key={cat.name} className={category === cat.name ? 'active' : ''}><button style={{ paddingInlineStart: `${0.55 + depth * 0.8}rem` }} onClick={() => { const n = new URLSearchParams(searchParams); n.set('category', cat.name); n.set('page', 1); setSearchParams(n) }}>{cat.label || cat.name}</button>{cat.children?.length > 0 && <ul className="category-list nested-category-list">{renderCategoryOptions(cat.children, depth + 1)}</ul>}</li>)

  return (
    <div className={`products-page container ${isRtl ? 'rtl' : 'ltr'}`}>
      <SEOHead title={category || t(content?.all_products_text_en, content?.all_products_text_ar, 'All Products')} />
      
      <div className="breadcrumb">
        <Link to="/">{t(content?.home_text_en, content?.home_text_ar, 'Home')}</Link>
        <span>/</span>
        <Link to="/products">{t(content?.all_products_text_en, content?.all_products_text_ar, 'Products')}</Link>
        {category && <><span>/</span><span>{category}</span></>}
      </div>
  
      <div className="products-layout">
        {showSidebar && (
          <aside className="products-sidebar" style={{ flex: `0 0 ${sidebarWidth}px` }}>
            <div className="sidebar-widget">
              <h3 className="widget-title">{t('Categories', 'الفئات')}</h3>
              <ul className="category-list">
                <li className={!category ? 'active' : ''}><button onClick={() => { const n = new URLSearchParams(searchParams); n.delete('category'); n.set('page', 1); setSearchParams(n) }}>{t(content?.all_categories_text_en, content?.all_categories_text_ar, 'All Categories')}</button></li>
                {renderCategoryOptions(categories)}
              </ul>
            </div>

            <div className="sidebar-widget">
              <h3 className="widget-title">{t(content?.price_filter_title_en, content?.price_filter_title_ar, 'Filter by price')}</h3>
              <div className="price-inputs">
                <div className="price-input-group"><label>{t('Min', 'من')}</label><input className="price-input" type="number" min="0" value={draftMinPrice} onChange={(e) => setDraftMinPrice(e.target.value)} /></div>
                <div className="price-input-group"><label>{t('Max', 'إلى')}</label><input className="price-input" type="number" min="0" value={draftMaxPrice} onChange={(e) => setDraftMaxPrice(e.target.value)} /></div>
              </div>
              <div className="price-filter-actions"><button type="button" className="price-filter-btn" onClick={() => { setMinPrice(draftMinPrice === '' ? undefined : Number(draftMinPrice)); setMaxPrice(draftMaxPrice === '' ? undefined : Number(draftMaxPrice)); setFiltersInitialized(true); const next = new URLSearchParams(searchParams); next.set('page', 1); setSearchParams(next) }}>{t(content?.apply_filter_text_en, content?.apply_filter_text_ar, 'Apply')}</button><button type="button" className="price-reset-btn" onClick={() => { setDraftMinPrice(String(priceRange.min_price ?? '')); setDraftMaxPrice(String(priceRange.max_price ?? '')); setMinPrice(undefined); setMaxPrice(undefined); setFiltersInitialized(true) }}>{t(content?.reset_filter_text_en, content?.reset_filter_text_ar, 'Reset')}</button></div>
            </div>

            {catalog?.available_attributes && Object.keys(catalog.available_attributes).length > 0 && (
              Object.entries(catalog.available_attributes).map(([attr, values]) => (
                <div className="sidebar-widget" key={attr}>
                  <h3 className="widget-title">{attr}</h3>
                  <div className="attribute-options">
                    {values.map(val => (
                      <label key={val} className="attr-checkbox">
                        <input type="checkbox" checked={selectedAttrs[attr]?.includes(val) || false} onChange={() => toggleAttribute(attr, val)} />
                        <span>{val}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            )}
          </aside>
        )}

        <main className="products-main">
          <div className="products-header">
            <h1 className="products-title">{category || t(content?.all_products_text_en, content?.all_products_text_ar, 'All Products')}</h1>
            <span className="products-count">{catalog?.total_count || 0} {t('items found', 'منتجات تم العثور عليها')}</span>
          </div>

          {loading ? <div className="loading-state-grid">{[...Array(6)].map((_, i) => <div key={i} className="shimmer shimmer-card" />)}</div> : (
            <div className="products-grid">
              {catalog?.items.map(item => (
                <article key={item.item_code} className="product-card-v2">
                  <div className="product-img-action-wrap">
                    <Link to={`/products/${encodeURIComponent(item.item_code)}`} className="product-img">
                      {item.image ? <img src={item.image} alt={item.item_name} /> : <div className="no-image-placeholder">{item.item_name?.slice(0, 1)}</div>}
                    </Link>
                    <div className="product-action-overlay">
                      <button type="button" className="action-btn" onClick={() => setQuickViewCode(item.item_code)} aria-label={t('Quick View', 'عرض سريع')}>👁</button><button type="button" className={`action-btn compare-action ${isCompared(item.item_code) ? 'active' : ''}`} onClick={() => isCompared(item.item_code) ? removeFromCompare(item.item_code) : addToCompare(item)} aria-label={t('Compare', 'مقارنة')}>⇄</button>
                    </div>
                  </div>
                  <div className="product-content-wrap">
                    <span className="product-cat">{item.item_group}</span>
                    <h2 className="product-title"><Link to={`/products/${encodeURIComponent(item.item_code)}`}>{item.item_name}</Link></h2>
                    <div className="product-card-bottom">
                      <div className="product-price">{item.price ? `${item.price.toFixed(2)} ${item.currency}` : t('On request', 'حسب الطلب')}</div>
                      <button className="add-btn" onClick={() => addItem(item)}>{t(content?.add_to_cart_text_en, content?.add_to_cart_text_ar, 'Add')}</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="pagination">
              {[...Array(totalPages)].map((_, i) => (
                <button key={i+1} className={`pagination-btn ${page === i+1 ? 'active' : ''}`} onClick={() => { const n = new URLSearchParams(searchParams); n.set('page', i+1); setSearchParams(n) }}>{i+1}</button>
              ))}
            </div>
          )}
        </main>
      </div>
      {quickViewCode && <QuickView itemCode={quickViewCode} onClose={() => setQuickViewCode(null)} />}
    </div>
  )
}
