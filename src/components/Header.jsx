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
  const [showAnnouncement, setShowAnnouncement] = useState(true)
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

  const handleSuggestionClick = (suggestion) => {
    setSearch('')
    setShowSuggestions(false)
    if (suggestion.type === 'category') {
      navigate(`/products?category=${encodeURIComponent(suggestion.id)}`)
    } else {
      navigate(`/products/${encodeURIComponent(suggestion.id)}`)
    }
  }

  const headerMaxWidth = theme?.dimensions?.header_max_width ? `${theme.dimensions.header_max_width}px` : '1200px';

  return (
    <div className={`site-header-wrapper ${isRtl ? 'rtl' : 'ltr'} ${isCompact ? 'compact' : ''}`} style={{ '--header-max-width': headerMaxWidth }}>
      {/* Announcement Bar */}
      {content?.announcement?.enabled && showAnnouncement && (
        <div 
          className="announcement-bar" 
          style={{ 
            backgroundColor: content.announcement.background_color || '#3bb77e',
            color: content.announcement.text_color || '#ffffff'
          }}
        >
          <div className="container announcement-inner">
            {content.announcement.link_url ? (
              <Link to={content.announcement.link_url}>
                {lang === 'ar' ? content.announcement.message_ar : content.announcement.message_en}
              </Link>
            ) : (
              <span>{lang === 'ar' ? content.announcement.message_ar : content.announcement.message_en}</span>
            )}
            {content.announcement.show_close_button && (
              <button className="close-announcement" onClick={() => setShowAnnouncement(false)}>×</button>
            )}
          </div>
        </div>
      )}

      {/* Top Bar */}
      {content?.show_top_bar && !isCompact && (
        <div className="top-bar">
          <div className="container top-bar-inner" style={{ maxWidth: headerMaxWidth }}>
            <div className="top-bar-left">
              <Link to="/contact-us">{lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}</Link>
              <span className="separator">|</span>
              <Link to="/track">{lang === 'ar' ? 'تتبع الطلب' : 'Track Order'}</Link>
            </div>
            <div className="top-bar-center">
              {lang === 'ar' ? content.top_bar_message_ar : content.top_bar_message_en}
            </div>
            <div className="top-bar-right">
              <div className="contact-info">
                {content.phone_number && <span>{content.phone_number}</span>}
              </div>
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
                {suggestions.map((s, idx) => (
                  <div 
                    key={idx} 
                    className={`suggestion-item ${s.type}-suggestion`}
                    onClick={() => handleSuggestionClick(s)}
                  >
                    <div className="suggestion-icon-box">
                      {s.image ? (
                        <img src={s.image} alt="" className="suggestion-img" />
                      ) : (
                        <span className="suggestion-icon-placeholder">
                          {s.type === 'category' ? '📁' : '📦'}
                        </span>
                      )}
                    </div>
                    <div className="suggestion-info">
                      <span className="suggestion-name">{s.name}</span>
                      <span className="suggestion-type">
                        {s.type === 'category' 
                          ? (lang === 'ar' ? 'فئة' : 'Category') 
                          : (lang === 'ar' ? 'منتج' : 'Product')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="header-actions">
            {content?.enable_wishlist && (
              <Link to="/wishlist" className="action-item">
                <div className="icon-wrapper">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  <span className="badge">0</span>
                </div>
                <span className="label">{lang === 'ar' ? 'قائمة الأمنيات' : 'Wishlist'}</span>
              </Link>
            )}
            <Link to="/cart" className="action-item cart-item">
              <div className="icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                {count > 0 && <span className="badge">{count}</span>}
              </div>
              <span className="label">{lang === 'ar' ? 'السلة' : 'Cart'}</span>
            </Link>
            <Link to="/dashboard" className="action-item">
              <div className="icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <span className="label">{lang === 'ar' ? 'الحساب' : 'Account'}</span>
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
