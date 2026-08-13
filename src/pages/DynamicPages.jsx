import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAboutPage, getArticle, getArticles, getDynamicPageSettings, getPolicyPage, getQaItems } from '../api/client'
import { useLanguage } from '../context/LanguageContext'
import SEOHead from '../components/SEOHead'
import './DynamicPages.css'

function localized(lang, en, ar, fallback = '') {
  return lang === 'ar' ? (ar || en || fallback) : (en || ar || fallback)
}

function cleanHtml(value = '') {
  if (typeof document === 'undefined') return String(value || '')
  const template = document.createElement('template')
  template.innerHTML = String(value || '')
  template.content.querySelectorAll('script,style,iframe,object,embed,form,link,meta').forEach((node) => node.remove())
  template.content.querySelectorAll('*').forEach((node) => {
    Array.from(node.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase()
      const valueText = String(attribute.value || '').trim().toLowerCase()
      if (name.startsWith('on') || ((name === 'href' || name === 'src') && valueText.startsWith('javascript:'))) node.removeAttribute(attribute.name)
    })
  })
  return template.innerHTML
}

function RichText({ value, className = 'dynamic-rich-text' }) {
  if (!value) return null
  return <div className={className} dangerouslySetInnerHTML={{ __html: cleanHtml(value) }} />
}

function LoadingState({ label }) {
  return <div className="dynamic-state container" role="status"><span className="dynamic-spinner" /><p>{label}</p></div>
}

function ErrorState({ isArabic, onRetry }) {
  return <div className="dynamic-state container dynamic-error" role="alert"><h2>{isArabic ? 'تعذر تحميل الصفحة' : 'This page is taking a moment'}</h2><p>{isArabic ? 'يرجى المحاولة مرة أخرى.' : 'Please try again in a moment.'}</p>{onRetry && <button type="button" className="primary-button" onClick={onRetry}>{isArabic ? 'إعادة المحاولة' : 'Try again'}</button>}</div>
}

function DisabledState({ isArabic }) {
  return <div className="dynamic-state container"><h2>{isArabic ? 'هذه الصفحة غير متاحة حالياً' : 'This page is currently unavailable'}</h2><Link className="primary-button" to="/">{isArabic ? 'العودة إلى الرئيسية' : 'Return home'}</Link></div>
}

function DynamicHero({ kicker, title, subtitle, image, isArabic, compact = false }) {
  return <header className={`dynamic-hero ${compact ? 'dynamic-hero-compact' : ''} ${image ? 'has-image' : ''}`}>
    {image && <img src={image} alt="" loading="eager" />}
    <div className="dynamic-hero-wash" />
    <div className="container dynamic-hero-copy">
      <span className="dynamic-kicker">{kicker}</span>
      <h1>{title}</h1>
      {subtitle && <RichText value={subtitle} className="dynamic-hero-subtitle" />}
      <a className="dynamic-scroll-cue" href="#dynamic-content">{isArabic ? 'اكتشف المزيد ↓' : 'Discover more ↓'}</a>
    </div>
  </header>
}

function DynamicLayout({ children, settings, title, description, image, kicker, subtitle, isArabic, compact = false, type = 'website' }) {
  return <div className={`dynamic-page ${isArabic ? 'rtl' : 'ltr'}`}>
    <SEOHead title={title} description={description} image={image} type={type} />
    <DynamicHero kicker={kicker} title={title} subtitle={subtitle} image={image} isArabic={isArabic} compact={compact} />
    <main id="dynamic-content" className="container dynamic-content">{children}</main>
  </div>
}

function useDynamicFetch(fetcher, dependencies = []) {
  const [state, setState] = useState({ loading: true, error: false, data: null })
  const [reloadKey, setReloadKey] = useState(0)
  useEffect(() => {
    let active = true
    setState((current) => ({ ...current, loading: true, error: false }))
    fetcher().then((data) => { if (active) setState({ loading: false, error: false, data }) }).catch(() => { if (active) setState({ loading: false, error: true, data: null }) })
    return () => { active = false }
    // The reload key is intentionally part of this route-level fetch lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, reloadKey])
  return { ...state, retry: () => setReloadKey((key) => key + 1) }
}

export function AboutPage() {
  const { lang, isRtl } = useLanguage()
  const isArabic = lang === 'ar'
  const result = useDynamicFetch(() => Promise.all([getDynamicPageSettings(), getAboutPage()]), [])
  if (result.loading) return <LoadingState label={isArabic ? 'جارٍ تحميل قصتنا…' : 'Loading our story…'} />
  if (result.error) return <ErrorState isArabic={isArabic} onRetry={result.retry} />
  const [settings, page] = result.data || [{}, {}]
  if (!page?.enabled || !settings?.enabled) return <DisabledState isArabic={isArabic} />
  const title = localized(lang, page.title_en, page.title_ar, isArabic ? 'من نحن' : 'About us')
  const subtitle = localized(lang, page.subtitle_en, page.subtitle_ar)
  const description = localized(lang, settings.seo_description_en, settings.seo_description_ar, subtitle)
  return <DynamicLayout settings={settings} title={title} description={description} image={page.hero_image} kicker={isArabic ? 'قصتنا' : 'Our story'} subtitle={subtitle} isArabic={isArabic}>
    <motion.section className="dynamic-story-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <RichText value={localized(lang, page.content_en, page.content_ar, isArabic ? '<p>نص قصتنا قيد الإعداد.</p>' : '<p>Our story is being prepared.</p>')} />
    </motion.section>
  </DynamicLayout>
}

export function PolicyPage() {
  const { lang } = useLanguage()
  const isArabic = lang === 'ar'
  const result = useDynamicFetch(() => Promise.all([getDynamicPageSettings(), getPolicyPage()]), [])
  if (result.loading) return <LoadingState label={isArabic ? 'جارٍ تحميل السياسات…' : 'Loading our policy…'} />
  if (result.error) return <ErrorState isArabic={isArabic} onRetry={result.retry} />
  const [settings, page] = result.data || [{}, {}]
  if (!page?.enabled || !settings?.enabled) return <DisabledState isArabic={isArabic} />
  const title = localized(lang, page.title_en, page.title_ar, isArabic ? 'سياساتنا' : 'Our policy')
  const subtitle = localized(lang, page.subtitle_en, page.subtitle_ar)
  const description = localized(lang, settings.seo_description_en, settings.seo_description_ar, subtitle)
  const sections = [
    { key: 'shipping', title: localized(lang, page.shipping_title_en, page.shipping_title_ar, isArabic ? 'الشحن' : 'Shipping'), body: localized(lang, page.shipping_policy_en, page.shipping_policy_ar) },
    { key: 'returns', title: localized(lang, page.return_title_en, page.return_title_ar, isArabic ? 'الإرجاع والاستبدال' : 'Returns & Exchanges'), body: localized(lang, page.return_policy_en, page.return_policy_ar) },
    { key: 'privacy', title: localized(lang, page.privacy_title_en, page.privacy_title_ar, isArabic ? 'الخصوصية' : 'Privacy'), body: localized(lang, page.privacy_policy_en, page.privacy_policy_ar) },
  ]
  return <DynamicLayout title={title} description={description} kicker={isArabic ? 'التزاماتنا' : 'Our commitments'} subtitle={subtitle} isArabic={isArabic} compact>
    <div className="dynamic-section-grid">{sections.map((section, index) => <motion.section className="dynamic-panel" key={section.key} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}><span className="dynamic-panel-number">0{index + 1}</span><h2>{section.title}</h2><RichText value={section.body} /></motion.section>)}</div>
  </DynamicLayout>
}

export function ArticlesPage() {
  const { lang } = useLanguage()
  const isArabic = lang === 'ar'
  const result = useDynamicFetch(() => Promise.all([getDynamicPageSettings(), getArticles()]), [])
  if (result.loading) return <LoadingState label={isArabic ? 'جارٍ تحميل المقالات…' : 'Loading articles…'} />
  if (result.error) return <ErrorState isArabic={isArabic} onRetry={result.retry} />
  const [settings, articles] = result.data || [{}, []]
  if (!settings?.enabled || !settings?.articles_enabled) return <DisabledState isArabic={isArabic} />
  const title = localized(lang, settings.articles_label_en, settings.articles_label_ar, isArabic ? 'المقالات' : 'Articles')
  const description = localized(lang, settings.seo_description_en, settings.seo_description_ar)
  return <DynamicLayout title={title} description={description} kicker={isArabic ? 'مجلة المتجر' : 'The journal'} subtitle={description} isArabic={isArabic} compact>
    {Array.isArray(articles) && articles.length > 0 ? <div className="article-grid">{articles.map((article, index) => <motion.article className="article-card" key={article.name || article.route} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(index * 0.05, 0.3) }}>
      <Link to={`/articles/${encodeURIComponent(article.route)}`} className="article-card-image">{article.image ? <img src={article.image} alt={localized(lang, article.title_en, article.title_ar)} loading="lazy" /> : <span>{localized(lang, article.title_en, article.title_ar, 'S').slice(0, 1)}</span>}</Link>
      <div className="article-card-body"><span className="dynamic-kicker">{isArabic ? 'مقال' : 'Article'}</span><h2><Link to={`/articles/${encodeURIComponent(article.route)}`}>{localized(lang, article.title_en, article.title_ar)}</Link></h2><RichText value={localized(lang, article.excerpt_en, article.excerpt_ar, article.content_en || article.content_ar)} className="article-excerpt" /><Link className="dynamic-text-link" to={`/articles/${encodeURIComponent(article.route)}`}>{isArabic ? 'اقرأ المقال ←' : 'Read article →'}</Link></div>
    </motion.article>)}</div> : <div className="dynamic-empty"><h2>{isArabic ? 'لا توجد مقالات منشورة بعد' : 'No articles published yet'}</h2><p>{isArabic ? 'ستظهر المقالات المنشورة من لوحة التحكم هنا.' : 'Published articles from Desk will appear here.'}</p></div>}
  </DynamicLayout>
}

export function ArticleDetailPage() {
  const { route } = useParams()
  const { lang } = useLanguage()
  const isArabic = lang === 'ar'
  const result = useDynamicFetch(() => Promise.all([getDynamicPageSettings(), getArticle(route)]), [route])
  if (result.loading) return <LoadingState label={isArabic ? 'جارٍ تحميل المقال…' : 'Loading article…'} />
  if (result.error) return <ErrorState isArabic={isArabic} onRetry={result.retry} />
  const [settings, article] = result.data || [{}, null]
  if (!settings?.enabled || !settings?.articles_enabled || !article || article.enabled === 0) return <div className="dynamic-state container"><h2>{isArabic ? 'المقال غير موجود' : 'Article not found'}</h2><Link className="primary-button" to="/articles">{isArabic ? 'العودة إلى المقالات' : 'Back to articles'}</Link></div>
  const title = localized(lang, article.title_en, article.title_ar)
  const excerpt = localized(lang, article.excerpt_en, article.excerpt_ar, '')
  return <DynamicLayout title={title} description={excerpt || localized(lang, settings.seo_description_en, settings.seo_description_ar)} image={article.image} kicker={isArabic ? 'من المجلة' : 'From the journal'} subtitle={excerpt} isArabic={isArabic} type="article">
    <article className="article-detail-card"><RichText value={localized(lang, article.content_en, article.content_ar)} /><Link className="dynamic-text-link" to="/articles">{isArabic ? '← كل المقالات' : '← All articles'}</Link></article>
  </DynamicLayout>
}

export function QaPage() {
  const { lang } = useLanguage()
  const isArabic = lang === 'ar'
  const [query, setQuery] = useState('')
  const result = useDynamicFetch(() => Promise.all([getDynamicPageSettings(), getQaItems()]), [])
  const items = Array.isArray(result.data?.[1]) ? result.data[1] : []
  const filteredItems = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return items
    return items.filter((item) => [item.question_en, item.question_ar, item.answer_en, item.answer_ar, item.category].some((field) => String(field || '').toLowerCase().includes(value)))
  }, [items, query])
  if (result.loading) return <LoadingState label={isArabic ? 'جارٍ تحميل الأسئلة…' : 'Loading answers…'} />
  if (result.error) return <ErrorState isArabic={isArabic} onRetry={result.retry} />
  const [settings] = result.data || [{}, []]
  if (!settings?.enabled || !settings?.qa_enabled) return <DisabledState isArabic={isArabic} />
  const title = localized(lang, settings.qa_label_en, settings.qa_label_ar, isArabic ? 'الأسئلة والأجوبة' : 'Q&A')
  const description = localized(lang, settings.seo_description_en, settings.seo_description_ar)
  return <DynamicLayout title={title} description={description} kicker={isArabic ? 'مركز المساعدة' : 'Help centre'} subtitle={description} isArabic={isArabic} compact>
    <div className="qa-toolbar"><label htmlFor="qa-search">{isArabic ? 'ابحث في الإجابات' : 'Search answers'}</label><input id="qa-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isArabic ? 'اكتب سؤالك هنا' : 'Type a question or topic'} /></div>
    {filteredItems.length > 0 ? <div className="qa-list">{filteredItems.map((item, index) => <details className="qa-item" key={item.name || index}><summary><span>{localized(lang, item.question_en, item.question_ar)}</span><b aria-hidden="true">+</b></summary><div className="qa-answer"><span className="qa-category">{item.category}</span><RichText value={localized(lang, item.answer_en, item.answer_ar)} /></div></details>)}</div> : <div className="dynamic-empty"><h2>{isArabic ? 'لم نعثر على إجابة' : 'No matching answer'}</h2><p>{isArabic ? 'جرّب كلمة مختلفة.' : 'Try a different keyword.'}</p></div>}
  </DynamicLayout>
}
