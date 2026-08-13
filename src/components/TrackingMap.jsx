import { useLanguage } from '../context/LanguageContext'
import './TrackingMap.css'

export default function TrackingMap({ tracking }) {
  const { lang, isRtl } = useLanguage()
  if (!tracking?.enabled) return null
  const isArabic = lang === 'ar'
  const hasCoordinates = Number.isFinite(Number(tracking.latitude)) && Number.isFinite(Number(tracking.longitude))
  const label = isArabic ? (tracking.courier_status || 'قيد التوصيل') : (tracking.courier_status || 'On the way')
  return <section className={`tracking-map-card ${isRtl ? 'rtl' : 'ltr'}`}><div className="tracking-map-heading"><div><span className="section-kicker">{isArabic ? 'تتبع حي' : 'Live delivery'}</span><h3>{isArabic ? 'شاهد مسار توصيلك' : 'Your delivery, in view'}</h3></div>{tracking.courier_name && <span>{tracking.courier_name}</span>}</div><div className="tracking-map-visual" aria-label={isArabic ? 'خريطة التوصيل' : 'Delivery map'}>{hasCoordinates && <span className="tracking-map-pin" style={{ left: `${Math.min(92, Math.max(8, (Number(tracking.longitude) + 180) / 360 * 100))}%`, top: `${Math.min(84, Math.max(16, (90 - Number(tracking.latitude)) / 180 * 100))}%` }}>●</span>}<div className="tracking-map-route" /><span className="tracking-map-origin">{isArabic ? 'المتجر' : 'Store'}</span><span className="tracking-map-destination">{isArabic ? 'وجهتك' : 'You'}</span></div><div className="tracking-map-meta"><strong>{label}</strong>{tracking.courier_zone && <span>{tracking.courier_zone}</span>}{tracking.stops_remaining != null && <span>{isArabic ? `${tracking.stops_remaining} محطات متبقية` : `${tracking.stops_remaining} stops remaining`}</span>}{tracking.tracking_url && <a href={tracking.tracking_url} target="_blank" rel="noreferrer">{isArabic ? 'فتح تتبع شركة الشحن' : 'Open courier tracking'} ↗</a>}</div></section>
}
