import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchByImage } from '../api/client'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import './VisualSearch.css'

export default function VisualSearch() {
  const { content } = useContent()
  const { lang, isRtl } = useLanguage()
  const inputRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState('')
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const settings = content?.experience_settings || {}
  const aiVision = content?.elite_settings?.ai_vision || {}
  if (aiVision.visual_search_enabled === 0 || (settings.visual_search_enabled !== 1 && settings.visual_search_enabled !== true)) return null
  const isArabic = lang === 'ar'
  const title = isArabic ? (settings.visual_search_title_ar || 'البحث بالصورة') : (settings.visual_search_title_en || 'Search by image')
  const hint = isArabic ? (settings.visual_search_hint_ar || 'ارفع صورة منتج للعثور على منتجات مشابهة') : (settings.visual_search_hint_en || 'Upload a product photo to find similar items')
  const t = (en, ar) => (isArabic ? ar : en)

  function chooseFile(file) {
    if (!file) return
    setError('')
    setResults([])
    const reader = new FileReader()
    reader.onload = async () => {
      const data = String(reader.result || '')
      setPreview(data)
      setOpen(true)
      setBusy(true)
      try {
        const response = await searchByImage({ imageData: data, filename: file.name })
        setResults(response?.items || [])
      } catch (err) {
        setError(err.message || t('Visual search is unavailable right now.', 'البحث بالصورة غير متاح حالياً.'))
      } finally { setBusy(false) }
    }
    reader.readAsDataURL(file)
  }

  return <>
    <button type="button" className="visual-search-trigger" aria-label={title} onClick={() => inputRef.current?.click()} title={title}>⌁</button>
    <input ref={inputRef} type="file" accept="image/*" hidden onChange={(event) => chooseFile(event.target.files?.[0])} />
    {open && <div className="visual-search-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
      <section className={`visual-search-dialog ${isRtl ? 'rtl' : 'ltr'}`} role="dialog" aria-modal="true" aria-label={title}>
        <button type="button" className="visual-search-close" onClick={() => setOpen(false)} aria-label={t('Close', 'إغلاق')}>×</button>
        <p className="eyebrow">{t('INTELLIGENT DISCOVERY', 'اكتشاف ذكي')}</p>
        <h2>{title}</h2>
        <p>{hint}</p>
        {preview && <img className="visual-search-preview" src={preview} alt={t('Selected product', 'المنتج المحدد')} />}
        {busy && <p className="visual-search-status" role="status">{t('Finding similar items…', 'جارٍ العثور على منتجات مشابهة…')}</p>}
        {error && <p className="visual-search-error" role="alert">{error}</p>}
        {!busy && results.length > 0 && <div className="visual-search-results">{results.map((item) => <Link key={item.item_code} to={`/products/${encodeURIComponent(item.item_code)}`} onClick={() => setOpen(false)} className="visual-search-result"><img src={item.image} alt="" loading="lazy" /><span><strong>{item.item_name}</strong><small>{item.price != null ? `${Number(item.price).toFixed(2)} ${item.currency || ''}` : t('View product', 'عرض المنتج')}</small></span></Link>)}</div>}
        {!busy && !error && preview && results.length === 0 && <p className="visual-search-status">{t('No close matches found. Try a clearer product photo.', 'لم نعثر على نتائج قريبة. جرّب صورة أوضح للمنتج.')}</p>}
      </section>
    </div>}
  </>
}
