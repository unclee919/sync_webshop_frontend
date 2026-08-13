import { useEffect, useMemo, useState } from 'react'
import { getAiChatSettings, sendAiMessage } from '../api/client'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import './AiChatWidget.css'

export default function AiChatWidget() {
  const { lang, isRtl } = useLanguage()
  const { content } = useContent()
  const eliteNlp = content?.elite_settings?.ai_vision || {}
  const [settings, setSettings] = useState(null)
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const isArabic = lang === 'ar'
  const copy = useMemo(() => ({
    title: isArabic ? 'مساعد التسوق' : 'Shopping assistant',
    placeholder: isArabic ? 'اكتب سؤالك هنا...' : 'Ask about products, orders, or delivery...',
    send: isArabic ? 'إرسال' : 'Send',
    close: isArabic ? 'إغلاق' : 'Close',
    open: isArabic ? 'افتح المساعد' : 'Open assistant',
    unavailable: isArabic ? 'المساعد غير متاح حالياً.' : 'The assistant is currently unavailable.',
    fallback: isArabic ? 'تعذر الحصول على رد. حاول مرة أخرى.' : 'We could not get a response. Please try again.',
    privacy: isArabic ? 'لأمانك، لا ترسل كلمات المرور أو بيانات البطاقات أو رموز التحقق أو أي بيانات خاصة.' : 'For your safety, do not share passwords, card details, OTPs, API keys, or private information.',
  }), [isArabic])

  useEffect(() => {
    function handleOpenRequest() { setOpen(true) }
    window.addEventListener('sync:open-ai-chat', handleOpenRequest)
    return () => window.removeEventListener('sync:open-ai-chat', handleOpenRequest)
  }, [])

  useEffect(() => {
    getAiChatSettings().then((data) => {
      setSettings(data)
      const deskGreeting = lang === 'ar' ? eliteNlp.welcome_message_ar : eliteNlp.welcome_message_en
      if (deskGreeting || data?.greeting_message) setMessages([{ role: 'assistant', content: deskGreeting || data.greeting_message }])
    }).catch(() => setSettings({ enabled: false }))
  }, [lang, eliteNlp.welcome_message_en, eliteNlp.welcome_message_ar])

  async function submit(e) {
    e.preventDefault()
    const message = input.trim()
    if (!message || sending) return
    const next = [...messages, { role: 'user', content: message }]
    setMessages(next)
    setInput('')
    setSending(true)
    setError(null)
    try {
      const response = await sendAiMessage({ message, history: next })
      setMessages([...next, { role: 'assistant', content: response?.message || copy.fallback }])
    } catch (err) {
      setError(err.message || copy.fallback)
    } finally {
      setSending(false)
    }
  }

  if (!settings?.enabled || eliteNlp.nlp_enabled === 0 || eliteNlp.nlp_enabled === false) return null
  return (
    <div className={`ai-chat-root ${isRtl ? 'rtl' : 'ltr'}`} style={{ '--ai-primary': settings.primary_color || '#10b981' }}>
      {open && <section className="ai-chat-panel" aria-label={copy.title}>
        <header className="ai-chat-header"><div><strong>{copy.title}</strong><span>{isArabic ? 'متصل الآن' : 'Online now'}</span></div><button type="button" onClick={() => setOpen(false)} aria-label={copy.close}>×</button></header>
        <div className="ai-chat-messages" aria-live="polite">
          {messages.map((row, index) => <div className={`ai-chat-message ${row.role}`} key={`${row.role}-${index}`}>{row.content}</div>)}
          {sending && <div className="ai-chat-message assistant">{isArabic ? 'جارٍ التفكير...' : 'Thinking...'}</div>}
          {error && <div className="ai-chat-error">{error}</div>}
        </div>
        {settings.prevent_sensitive_data !== false && <p className="ai-chat-privacy">{copy.privacy}</p>}
        <form className="ai-chat-form" onSubmit={submit}><input value={input} onChange={(e) => setInput(e.target.value)} maxLength={settings.max_message_length || 2000} placeholder={copy.placeholder} disabled={sending} /><button type="submit" disabled={sending || !input.trim()}>{copy.send}</button></form>
      </section>}
      <button type="button" className="ai-chat-launcher" onClick={() => setOpen(!open)} aria-label={copy.open}><span className="ai-chat-launcher-icon">✦</span><span>{copy.title}</span></button>
    </div>
  )
}
