import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import './DarkModeToggle.css'

export default function DarkModeToggle() {
  const { lang, isRtl } = useLanguage()
  const [isDark, setIsDark] = useState(localStorage.getItem('sync_webshop_theme_mode') === 'dark')

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('sync_webshop_theme_mode', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('sync_webshop_theme_mode', 'light')
    }
  }, [isDark])

  const toggle = () => setIsDark(!isDark)
  const isArabic = lang === 'ar'

  return (
    <div className={`dark-mode-float ${isRtl ? 'rtl' : 'ltr'}`}>
      <button type="button" className="dark-mode-toggle-btn" onClick={toggle} title={isArabic ? (isDark ? 'الوضع المضيء' : 'الوضع المظلم') : (isDark ? 'Light Mode' : 'Dark Mode')}>
        {isDark ? '☀️' : '🌙'}
      </button>
    </div>
  )
}
