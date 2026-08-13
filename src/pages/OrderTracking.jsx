import { useState } from 'react'
import { getOrderStatus } from '../api/client'
import { useLanguage } from '../context/LanguageContext'
import './Cart.css'
import TrackingMap from '../components/TrackingMap'

export default function OrderTracking() {
  const { lang, isRtl } = useLanguage()
  const [orderName, setOrderName] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleTrack(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setOrder(null)
    try {
      const data = await getOrderStatus(orderName, { email })
      setOrder(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`tracking-page container ${isRtl ? 'rtl' : 'ltr'}`}>
      <h1 className="page-title">{lang === 'ar' ? 'تتبع الطلب' : 'Track My Order'}</h1>
      
      <div className="tracking-container">
        <form className="tracking-form" onSubmit={handleTrack}>
          <div className="form-group">
            <label>{lang === 'ar' ? 'رقم الطلب' : 'Order Number'}</label>
            <input 
              required 
              placeholder="SO-2026-00001"
              value={orderName} 
              onChange={e => setOrderName(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (lang === 'ar' ? 'جاري البحث...' : 'Searching...') : (lang === 'ar' ? 'تتبع' : 'Track')}
          </button>
        </form>

        {error && <div className="error-message mt-4">{error}</div>}

        {order && (
          <div className="order-status-card mt-8">
            <div className="status-header">
              <h3>{lang === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}: {order.name}</h3>
              <span className={`status-badge ${order.status.toLowerCase().replace(' ', '-')}`}>
                {order.status}
              </span>
            </div>
            
            <div className="status-grid">
              <div className="status-item">
                <label>{lang === 'ar' ? 'التاريخ' : 'Date'}</label>
                <div>{order.transaction_date}</div>
              </div>
              <div className="status-item">
                <label>{lang === 'ar' ? 'موعد التوصيل المتوقع' : 'Expected Delivery'}</label>
                <div>{order.delivery_date}</div>
              </div>
              <div className="status-item">
                <label>{lang === 'ar' ? 'رقم التتبع' : 'Tracking Number'}</label>
                <div className="tracking-number">{order.tracking_number || (lang === 'ar' ? 'غير متوفر بعد' : 'Not available yet')}</div>
              </div>
              <div className="status-item">
                <label>{lang === 'ar' ? 'حالة الدفع' : 'Payment Status'}</label>
                <div>{order.webshop_payment_status}</div>
              </div>
            </div>

            <TrackingMap tracking={order.tracking} />
            <div className="order-items-list mt-4">
              <h4>{lang === 'ar' ? 'المنتجات' : 'Items'}</h4>
              {order.items.map(item => (
                <div key={item.item_code} className="status-order-item">
                  <span>{item.item_name} x {item.qty}</span>
                </div>
              ))}
            </div>
            
            {order.delivery_notes && order.delivery_notes.length > 0 && (
              <div className="delivery-notes mt-4">
                <h4>{lang === 'ar' ? 'معلومات الشحن' : 'Shipping Updates'}</h4>
                {order.delivery_notes.map(dn => (
                  <div key={dn.name} className="dn-item">
                    <span>{dn.name} - {dn.status}</span>
                    {dn.tracking_number && <div className="mt-1">Tracking: <strong>{dn.tracking_number}</strong></div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
