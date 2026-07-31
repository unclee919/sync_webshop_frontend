import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../theme/ThemeProvider'
import { useContent } from '../context/ContentContext'
import './Header.css'

export default function Header() {
  const { items } = useCart()
  const { lang, isRtl, toggleLang } = useLanguage()
  const theme = useTheme()
  const { content } = useContent()
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const count = items.reduce((n, i) => n + i.qty, 0)

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`)
    }
  }

  if (!content) return null

  return (
    <div className={`site-header-wrapper ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Top Bar */}
      {content.show_top_bar && (
        <div className="top-bar">
          <div className="container top-bar-inner">
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
        <div className="container header-inner">
          <Link to="/" className="logo">
            {theme.logo ? (
              <img src={theme.logo} alt={content.site_name} />
            ) : (
              <span className="site-name">{content.site_name}</span>
            )}
          </Link>

          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder={lang === 'ar' ? 'البحث عن العناصر...' : 'Search for items...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="search-btn">🔍</button>
          </form>

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
        <div className="container nav-inner">
          <div className="all-categories">
            <Link to="/products">
              {lang === 'ar' ? 'تصفح جميع الفئات' : 'Browse All Categories'}
            </Link>
          </div>
          <div className="nav-links">
            <Link to="/">{lang === 'ar' ? 'الصفحة الرئيسية' : 'Home'}</Link>
            {content.nav_links && content.nav_links.map((link, i) => (
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
