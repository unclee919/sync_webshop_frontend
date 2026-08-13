import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import { trackEvent } from '../utils/analytics'
import './SpatialProductControls.css'

function Icon({ children }) { return <span className="spatial-control-icon" aria-hidden="true">{children}</span> }

export default function SpatialProductControls({ item, settings = {} }) {
  const { lang, isRtl } = useLanguage()
  const { content } = useContent()
  const isArabic = lang === 'ar'
  const [mode, setMode] = useState(null)
  const [activeLayer, setActiveLayer] = useState(0)
  const t = (en, ar) => isArabic ? (ar || en) : (en || ar)
  const iosModel = item?.ar_ios_model_url || item?.usdz_url || settings.ar_ios_model_url
  const androidModel = item?.ar_android_model_url || item?.glb_url || settings.ar_android_model_url
  const modelUrl = item?.three_d_model_url || item?.model_3d_url || settings.three_d_model_url || androidModel
  const luxury = content?.luxury_tier || {}
  const suiteEnabled = luxury.enabled !== 0
  const hasAr = suiteEnabled && luxury.webxr_ar_enabled !== 0 && settings.ar_enabled !== 0 && Boolean(iosModel || androidModel)
  const has3d = suiteEnabled && Boolean(modelUrl)
  const exploderEnabled = suiteEnabled && luxury.exploder_3d_enabled !== 0 && settings.exploded_view_enabled !== 0
  const layers = useMemo(() => {
    const attributes = Array.isArray(item?.attributes) ? item.attributes : []
    const fromAttributes = attributes.slice(0, 4).map((attribute, index) => ({
      label: attribute.value || attribute.attribute || `${t('Detail', 'تفصيل')} ${index + 1}`,
      description: `${attribute.attribute || t('Material detail', 'تفاصيل الخامة')}: ${attribute.value || t('Crafted detail', 'تفاصيل مصنوعة')}`,
      offset: index + 1,
    }))
    return fromAttributes.length ? fromAttributes : [
      { label: t('Material', 'الخامة'), description: t('Selected materials and tactile finish.', 'خامات مختارة ولمسة ملمسية راقية.'), offset: 1 },
      { label: t('Construction', 'التصميم'), description: t('Considered proportions for everyday use.', 'نسب مدروسة للاستخدام اليومي.'), offset: 2 },
      { label: t('Finish', 'التشطيب'), description: t('A final detail that catches the light.', 'تفصيل نهائي يلتقط الضوء.'), offset: 3 },
    ]
  }, [item?.attributes, isArabic])

  const launchAr = () => {
    trackEvent('spatial_studio_ar_launch', { has_model: Boolean(iosModel || androidModel), item_group: item?.item_group || 'unknown' })
    const url = isArabic ? (androidModel || iosModel) : (iosModel || androidModel)
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className={`spatial-product-controls ${isRtl ? 'rtl' : 'ltr'}`} aria-label={t('Spatial product tools', 'أدوات المنتج التفاعلية')}>
      <div className="spatial-tools-intro">
        <span className="spatial-kicker">{t('Spatial studio', 'استوديو مكاني')}</span>
        <h2>{t('See the details from every angle.', 'شاهد التفاصيل من كل زاوية.')}</h2>
        <p>{t('Explore in space, inspect the construction, and make the choice with confidence.', 'استكشف في المساحة، وافحص التصميم، واتخذ قرارك بثقة.')}</p>
      </div>
      <div className="spatial-tool-grid">
        <button type="button" className={`spatial-tool-card ${hasAr ? '' : 'is-disabled'}`} onClick={launchAr} disabled={!hasAr} data-magnetic="true">
          <Icon>⌾</Icon><span><strong>{t('View in your space', 'اعرضه في مساحتك')}</strong><small>{hasAr ? t('Open AR preview', 'فتح المعاينة بالواقع المعزز') : t('Add an AR model in Desk', 'أضف نموذج AR من Desk')}</small></span><b>↗</b>
        </button>
        <button type="button" className={`spatial-tool-card ${has3d ? '' : 'is-disabled'}`} onClick={() => { if (has3d) { trackEvent('spatial_studio_3d_open', { item_group: item?.item_group || 'unknown' }); setMode('3d') } }} disabled={!has3d} data-magnetic="true">
          <Icon>◉</Icon><span><strong>{t('3D studio view', 'عرض الاستوديو ثلاثي الأبعاد')}</strong><small>{has3d ? t('Rotate and inspect the model', 'دوّر النموذج وافحصه') : t('Configure a 3D model in Desk', 'اضبط نموذجاً ثلاثي الأبعاد من Desk')}</small></span><b>↗</b>
        </button>
        {exploderEnabled && <button type="button" className="spatial-tool-card" onClick={() => { trackEvent('spatial_studio_exploded_open', { item_group: item?.item_group || 'unknown' }); setMode('exploded') }} data-magnetic="true">
          <Icon>✧</Icon><span><strong>{t(settings.exploded_view_title_en || 'Inspect the details', settings.exploded_view_title_ar || 'استكشف التفاصيل')}</strong><small>{t('Pull the story apart', 'افصل التفاصيل لاستكشافها')}</small></span><b>↗</b>
        </button>}
      </div>

      <AnimatePresence>
        {mode && <motion.div className="spatial-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMode(null)}>
          <motion.div className="spatial-modal elite-glass" initial={{ opacity: 0, y: 18, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }} onClick={(event) => event.stopPropagation()}>
            <button type="button" className="spatial-modal-close" onClick={() => setMode(null)} aria-label={t('Close', 'إغلاق')}>×</button>
            {mode === '3d' ? <>
              <span className="spatial-kicker">3D studio</span><h3>{item?.item_name}</h3>
              <div className="spatial-model-stage"><img src={item?.image} alt="" /><div className="spatial-orbit-ring" /><a href={modelUrl} target="_blank" rel="noreferrer" className="primary-button">{t('Open 3D model', 'فتح النموذج ثلاثي الأبعاد')} ↗</a></div>
            </> : <>
              <span className="spatial-kicker">{t('Exploded view', 'منظور التفاصيل')}</span><h3>{t(settings.exploded_view_title_en || 'Inspect the details', settings.exploded_view_title_ar || 'استكشف التفاصيل')}</h3>
              <div className="exploded-stage"><div className="exploded-product-core"><img src={item?.image} alt={item?.item_name} /></div>{layers.map((layer, index) => <motion.button key={layer.label} type="button" className={`exploded-layer layer-${index + 1} ${activeLayer === index ? 'active' : ''}`} animate={{ x: activeLayer === index ? (isRtl ? -10 : 10) : 0, scale: activeLayer === index ? 1.04 : 1 }} onClick={() => { setActiveLayer(index); trackEvent('spatial_studio_exploded_layer', { layer_index: index + 1, item_group: item?.item_group || 'unknown' }) }}><span>{index + 1}</span>{layer.label}</motion.button>)}</div>
              <div className="exploded-caption"><strong>{layers[activeLayer]?.label}</strong><p>{layers[activeLayer]?.description}</p></div>
            </>}
          </motion.div>
        </motion.div>}
      </AnimatePresence>
    </section>
  )
}
