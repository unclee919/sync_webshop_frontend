import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../theme/ThemeProvider'
import { useContent } from '../context/ContentContext'
import { getSearchSuggestions } from '../api/client'
import './Header.css'

export default function Header() {
  const { items } = useCart()
  const { lang, isRtl, toggleLang } = useLanguage()
  const theme = useTheme()
  const { content } = useContent()
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const navigate = useNavigate()
  const suggestionRef = useRef(null)

  const count = items.reduce((n, i) => n + i.qty, 0)

  useEffect(() => {
    if (search.length >= 2) {
      const timer = setTimeout(() => {
        getSearchSuggestions(search)
          .then(setSuggestions)
          .catch(() => setSuggestions([]))
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setSuggestions([])
    }
  }, [search])

  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 50) {
        setIsCompact(true)
      } else {
        setIsCompact(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      setShowSuggestions(false)
      navigate(`/products?search=${encodeURIComponent(search.trim())}`)
    }
  }

  const handleSuggestionClick = (itemCode) => {
    setSearch('')
    setShowSuggestions(false)
    navigate(`/products/${encodeURIComponent(itemCode)}`)
  }

  const headerMaxWidth = theme?.dimensions?.header_max_width ? `${theme.dimensions.header_max_width}px` : '1200px';

  return (
    <div className={`site-header-wrapper ${isRtl ? 'rtl' : 'ltr'} ${isCompact ? 'compact' : ''}`} style={{ '--header-max-width': headerMaxWidth }}>
      {/* Top Bar */}
      {content?.show_top_bar && !isCompact && (
        <div className="top-bar">
          <div className="container top-bar-inner" style={{ maxWidth: headerMaxWidth }}>
            <div className="top-bar-left">
              {content.phone_number && <span>📞 {content.phone_number}</span>}
              {content.email_address && <span>✉️ {content.email_address}</span>}
            </div>
            <div className="top-bar-center">
              {lang === 'ar' ? content.top_bar_message_ar : content.top_bar_message_en}
            </div>
            <div className="top-bar-right">
              <Link to="/dashboard">{lang === 'ar' ? 'تتبع الطلب' : 'Track Order'}</Link>
              <button onClick={toggleLang} className="lang-toggle">
                {lang === 'ar' ? 'English' : 'العربية'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="main-header">
        <div className="container header-inner" style={{ maxWidth: headerMaxWidth }}>
          <Link to="/" className="logo">
            {theme?.logo ? (
              <img src={theme.logo} alt={content?.site_name} />
            ) : (
              <span className="site-name">{content?.site_name || 'Sync Webshop'}</span>
            )}
          </Link>

          <div className="search-container" ref={suggestionRef}>
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder={lang === 'ar' ? 'البحث عن العناصر...' : 'Search for items...'}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              <button type="submit" className="search-btn">🔍</button>
            </form>
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions">
                {suggestions.map((item) => (
                  <div 
                    key={item.item_code} 
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(item.item_code)}
                  >
                    {item.image && <img src={item.image} alt="" className="suggestion-img" />}
                    <span className="suggestion-name">{item.item_name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="header-actions">
            <Link to="/dashboard" className="action-item">
              <span className="icon">👤</span>
              <span className="label">{lang === 'ar' ? 'الحساب' : 'Account'}</span>
            </Link>
            <Link to="/cart" className="action-item cart-item">
              <span className="icon">🛒</span>
              <span className="label">{lang === 'ar' ? 'السلة' : 'Cart'}</span>
              {count > 0 && <span className="cart-count">{count}</span>}
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="nav-bar">
        <div className="container nav-inner" style={{ maxWidth: headerMaxWidth }}>
          <div className="all-categories">
            <Link to="/products">
              {lang === 'ar' ? 'تصفح جميع الفئات' : 'Browse All Categories'}
            </Link>
          </div>
          <div className="nav-links">
            <Link to="/">{lang === 'ar' ? 'الصفحة الرئيسية' : 'Home'}</Link>
            {content?.nav_links && content.nav_links.map((link, i) => (
              <Link key={i} to={link.link_url}>
                {lang === 'ar' ? (link.label_ar || link.label_en) : link.label_en}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
