import { useState } from 'react'
import { apiCall } from '../api/client'
import { useLanguage } from '../context/LanguageContext'
import './LoginModal.css'

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const { lang, isRtl } = useLanguage()
  const isArabic = lang === 'ar'
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !phone) {
      setError(isArabic ? 'الرجاء إدخال البريد الإلكتروني ورقم الهاتف' : 'Please enter email and phone number')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await apiCall('sync_webshop.api.auth.customer_login', {
        full_name: fullName || 'Customer',
        email,
        phone
      })
      if (res && res.status === 'success') {
        localStorage.setItem('sync_webshop_customer', JSON.stringify(res))
        window.dispatchEvent(new Event('customer-auth-changed'))
        onSuccess(res)
        onClose()
      } else {
        setError(res?.message || 'Login failed')
      }
    } catch (err) {
      setError(err.message || 'Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-modal-backdrop">
      <div className={`login-modal-card ${isRtl ? 'rtl' : 'ltr'}`}>
        <div className="login-modal-header">
          <h3>{isArabic ? 'تسجيل دخول العميل' : 'Customer Sign In'}</h3>
          <button type="button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="login-error">{error}</div>}
          <div className="form-group">
            <label>{isArabic ? 'الاسم الكامل' : 'Full Name'}</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder={isArabic ? 'أدخل اسمك الكامل' : 'Enter your full name'} />
          </div>
          <div className="form-group">
            <label>{isArabic ? 'البريد الإلكتروني *' : 'Email Address *'}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@example.com" />
          </div>
          <div className="form-group">
            <label>{isArabic ? 'رقم الهاتف المحمول *' : 'Mobile Phone *'}</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+966 50 000 0000" />
          </div>
          <button type="submit" className="primary-button login-submit-btn" disabled={loading}>
            {loading ? (isArabic ? 'جاري التحقق...' : 'Verifying...') : (isArabic ? 'متابعة الدخول' : 'Continue')}
          </button>
        </form>
      </div>
    </div>
  )
}
