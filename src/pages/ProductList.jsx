import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getCatalog } from '../api/client'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import './Products.css'

const PAGE_SIZE = 20

export default function ProductList() {
  const { lang, isRtl } = useLanguage()
  const { addItem } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || undefined
  const page = Number(searchParams.get('page') || 1)
  const search = searchParams.get('search') || undefined
  
  const [catalog, setCatalog] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getCatalog({ itemGroup: category, search, page, pageSize: PAGE_SIZE })
      .then((data) => {
        setCatalog(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [category, search, page])

  function goToPage(p) {
    const next = new URLSearchParams(searchParams)
    next.set('page', p)
    setSearchParams(next)
  }

  if (error) {
    return (
      <div className="products-page container">
        <p className="products-error">Couldn't load products: {error}</p>
      </div>
    )
  }

  const totalPages = catalog ? Math.max(1, Math.ceil(catalog.total_count / PAGE_SIZE)) : 1

  return (
    <div className={`products-page container ${isRtl ? 'rtl' : 'ltr'}`}>
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

      {loading && <div className="loading-state">Loading...</div>}

      {!loading && catalog && catalog.items.length === 0 && (
        <p className="products-empty">{lang === 'ar' ? 'لم يتم العثور على منتجات.' : 'No products found.'}</p>
      )}

      {!loading && catalog && catalog.items.length > 0 && (
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
    </div>
  )
}
