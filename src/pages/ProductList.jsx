import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getCatalog } from '../api/client'
import './Products.css'

const PAGE_SIZE = 20

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || undefined
  const page = Number(searchParams.get('page') || 1)

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [catalog, setCatalog] = useState(null)
  const [error, setError] = useState(null)

  const search = searchParams.get('search') || undefined

  useEffect(() => {
    setCatalog(null)
    getCatalog({ itemGroup: category, search, page, pageSize: PAGE_SIZE })
      .then(setCatalog)
      .catch((err) => setError(err.message))
  }, [category, search, page])

  function handleSearchSubmit(e) {
    e.preventDefault()
    const next = new URLSearchParams(searchParams)
    if (searchInput) next.set('search', searchInput)
    else next.delete('search')
    next.delete('page')
    setSearchParams(next)
  }

  function goToPage(p) {
    const next = new URLSearchParams(searchParams)
    next.set('page', p)
    setSearchParams(next)
  }

  if (error) {
    return (
      <div className="products-page">
        <p className="products-error">Couldn't load products: {error}</p>
      </div>
    )
  }

  const totalPages = catalog ? Math.max(1, Math.ceil(catalog.total_count / PAGE_SIZE)) : 1

  return (
    <div className="products-page">
      <div className="products-header">
        <h1 className="products-title">
          {category ? category : 'All products'}
        </h1>
        {catalog && (
          <span className="products-count">{catalog.total_count} items</span>
        )}
      </div>

      <form className="products-search" onSubmit={handleSearchSubmit}>
        <input
          type="search"
          placeholder="Search products..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          dir="auto"
        />
      </form>

      {!catalog && <p className="products-empty">Loading...</p>}

      {catalog && catalog.items.length === 0 && (
        <p className="products-empty">No products found.</p>
      )}

      {catalog && catalog.items.length > 0 && (
        <>
          <div className="products-grid">
            {catalog.items.map((item) => (
              <Link
                key={item.item_code}
                to={`/products/${encodeURIComponent(item.item_code)}`}
                className="product-card"
              >
                <div className="product-card-image">
                  {item.image ? (
                    <img src={item.image} alt="" />
                  ) : (
                    <span className="product-card-image-empty">No image</span>
                  )}
                </div>
                <span className="product-card-group">{item.item_group}</span>
                <p className="product-card-name" dir="auto">
                  {item.item_name}
                </p>
                {item.price != null ? (
                  <span className="product-card-price">
                    {item.price} {item.currency}
                  </span>
                ) : (
                  <span className="product-card-price-empty">Price on request</span>
                )}
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="products-pagination">
              <button disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                ← Prev
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
