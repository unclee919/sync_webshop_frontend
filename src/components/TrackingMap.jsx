import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import './TrackingMap.css'

export default function TrackingMap({ tracking }) {
  const { lang, isRtl } = useLanguage()
  const { content } = useContent()
  if (!tracking?.enabled) return null
  const isArabic = lang === 'ar'
  const hasCoordinates = Number.isFinite(Number(tracking.latitude)) && Number.isFinite(Number(tracking.longitude))
  const featureCopy = content?.copy?.feature || {}
  const uiCopy = content?.copy?.ui || {}
  const t = (en, ar, fallback = '') => (isArabic ? (ar || en || fallback) : (en || ar || fallback))
  const label = tracking.courier_status || t(featureCopy.tracking_map_on_way_en, featureCopy.tracking_map_on_way_ar, 'On the way')
  const stopsLabel = t(featureCopy.tracking_map_stops_remaining_en, featureCopy.tracking_map_stops_remaining_ar, '{count} stops remaining')
  return <section className={`tracking-map-card ${isRtl ? 'rtl' : 'ltr'}`}><div className="tracking-map-heading"><div><span className="section-kicker">{t(featureCopy.tracking_map_kicker_en, featureCopy.tracking_map_kicker_ar, 'Live delivery')}</span><h3>{t(content?.experience_settings?.live_tracking_title_en, content?.experience_settings?.live_tracking_title_ar, 'Your delivery, in view')}</h3></div>{tracking.courier_name && <span>{tracking.courier_name}</span>}</div><div className="tracking-map-visual" aria-label={t(uiCopy.view_details_en, uiCopy.view_details_ar, 'Delivery map')}>{hasCoordinates && <span className="tracking-map-pin" style={{ left: `${Math.min(92, Math.max(8, (Number(tracking.longitude) + 180) / 360 * 100))}%`, top: `${Math.min(84, Math.max(16, (90 - Number(tracking.latitude)) / 180 * 100))}%` }}>●</span>}<div className="tracking-map-route" /><span className="tracking-map-origin">{t(featureCopy.tracking_map_origin_label_en, featureCopy.tracking_map_origin_label_ar, 'Store')}</span><span className="tracking-map-destination">{t(featureCopy.tracking_map_destination_label_en, featureCopy.tracking_map_destination_label_ar, 'Destination')}</span></div><div className="tracking-map-meta"><strong>{label}</strong>{tracking.courier_zone && <span>{tracking.courier_zone}</span>}{tracking.stops_remaining != null && <span>{stopsLabel.replace('{count}', String(tracking.stops_remaining))}</span>}{tracking.tracking_url && <a href={tracking.tracking_url} target="_blank" rel="noreferrer">{t(featureCopy.tracking_map_cta_en, featureCopy.tracking_map_cta_ar, 'Open courier tracking')} ↗</a>}</div></section>
}
