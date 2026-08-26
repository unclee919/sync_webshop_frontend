import { useState } from 'react'
import { apiCall } from '../api/client'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import './LoginModal.css'

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const { lang, isRtl } = useLanguage()
  const { content } = useContent()
  const featureCopy = content?.copy?.feature || {}
  const uiCopy = content?.copy?.ui || {}
  const isArabic = lang === 'ar'
  const t = (key, en, ar) => isArabic ? (featureCopy[`${key}_ar`] || ar || en) : (featureCopy[`${key}_en`] || en || ar)
  const tUi = (key, en, ar) => isArabic ? (uiCopy[`${key}_ar`] || ar || en) : (uiCopy[`${key}_en`] || en || ar)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !phone) {
      setError(t('login_validation', 'Please enter email and phone number', 'الرجاء إدخال البريد الإلكتروني ورقم الهاتف'))
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
        setError(res?.message || t('login_failed', 'Login failed', 'فشل تسجيل الدخول'))
      }
    } catch (err) {
      setError(err.message || t('connection_error', 'Connection error', 'خطأ في الاتصال'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-modal-backdrop">
      <div className={`login-modal-card ${isRtl ? 'rtl' : 'ltr'}`}>
        <div className="login-modal-header">
          <h3>{t('customer_sign_in', 'Customer Sign In', 'تسجيل دخول العميل')}</h3>
          <button type="button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="login-error">{error}</div>}
          <div className="form-group">
            <label>{tUi('full_name', 'Full Name', 'الاسم الكامل')}</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder={tUi('full_name_placeholder', 'Enter your full name', 'أدخل اسمك الكامل')} />
          </div>
          <div className="form-group">
            <label>{`${tUi('email', 'Email Address', 'البريد الإلكتروني')} *`}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@example.com" />
          </div>
          <div className="form-group">
            <label>{`${t('mobile_phone', 'Mobile Phone', 'رقم الهاتف المحمول')} *`}</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+966 50 000 0000" />
          </div>
          <button type="submit" className="primary-button login-submit-btn" disabled={loading}>
            {loading ? (t('verifying', 'Verifying...', 'جاري التحقق...')) : (t('continue', 'Continue', 'متابعة الدخول'))}
          </button>
        </form>
      </div>
    </div>
  )
}
