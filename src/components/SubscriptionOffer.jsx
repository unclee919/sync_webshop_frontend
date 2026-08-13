import { useState } from 'react'
import { createSubscription } from '../api/client'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'

export default function SubscriptionOffer({ item }) {
  const { content } = useContent()
  const { lang } = useLanguage()
  const isArabic = lang === 'ar'
  const settings = content?.master_settings?.subscriptions || {}
  const intervals = Array.isArray(settings.intervals) ? settings.intervals : []
  const [email, setEmail] = useState('')
  const [interval, setInterval] = useState(intervals[0] || '')
  const [notice, setNotice] = useState(null)
  const [saving, setSaving] = useState(false)
  if (!settings.enabled || intervals.length === 0) return null

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setNotice(null)
    try {
      const result = await createSubscription({ customerEmail: email, itemCode: item.item_code, interval })
      setNotice(isArabic ? `تم إنشاء الاشتراك. الخصم ${Number(result.discount_percent || 0).toFixed(0)}٪.` : `Subscription created. ${Number(result.discount_percent || 0).toFixed(0)}% discount applied.`)
      setEmail('')
    } catch (error) {
      setNotice(error.message || (isArabic ? 'تعذر إنشاء الاشتراك.' : 'Could not create subscription.'))
    } finally {
      setSaving(false)
    }
  }

  return <section className="subscription-offer" aria-labelledby="subscription-offer-title"><div><span className="section-kicker">{isArabic ? 'اشترك ووفر' : 'Subscribe & Save'}</span><h3 id="subscription-offer-title">{isArabic ? `وفر ${Number(settings.discount_percent || 0).toFixed(0)}٪ مع التوصيل الدوري` : `Save ${Number(settings.discount_percent || 0).toFixed(0)}% with recurring delivery`}</h3></div><form onSubmit={submit}><label><span>{isArabic ? 'البريد الإلكتروني' : 'Email'}</span><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'you@example.com'} /></label><label><span>{isArabic ? 'الجدول' : 'Delivery schedule'}</span><select required value={interval} onChange={(event) => setInterval(event.target.value)}>{intervals.map((value) => <option value={value} key={value}>{value}</option>)}</select></label><button type="submit" disabled={saving}>{saving ? (isArabic ? 'جارٍ الحفظ...' : 'Saving...') : (isArabic ? 'تفعيل الاشتراك' : 'Start subscription')}</button></form>{notice && <p className="form-hint" role="status">{notice}</p>}</section>
}
