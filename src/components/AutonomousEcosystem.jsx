import { useEffect, useState } from 'react'
import { getBranches, ragSupportQuery, redeemGiftCard } from '../api/client'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import './AutonomousEcosystem.css'

export default function AutonomousEcosystem() {
  const { content } = useContent()
  const { lang, isRtl } = useLanguage()
  const settings = content?.ecosystem_settings || {}
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState(null)
  const [branches, setBranches] = useState([])
  const [giftCode, setGiftCode] = useState('')
  const [giftResult, setGiftResult] = useState(null)
  const isArabic = lang === 'ar'
  const t = (en, ar) => isArabic ? (ar || en) : (en || ar)

  useEffect(() => {
    if (settings.omnichannel?.bopis_enabled) {
      getBranches().then(setBranches).catch(() => setBranches([]))
    }
  }, [settings.omnichannel?.bopis_enabled])

  const handleRag = async (e) => {
    e.preventDefault()
    if (!question.trim()) return
    try {
      const res = await ragSupportQuery(question.trim())
      setAnswer(res?.answer)
    } catch {
      setAnswer(t('Autonomous assistant is temporarily offline.', 'المساعد الذكي غير متصل مؤقتاً.'))
    }
  }

  const handleGift = async (e) => {
    e.preventDefault()
    if (!giftCode.trim()) return
    try {
      const res = await redeemGiftCard(giftCode.trim())
      setGiftResult(res)
    } catch (err) {
      setGiftResult({ valid: false, message: err.message })
    }
  }

  if (!settings.ai?.rag_support_enabled && !settings.omnichannel?.bopis_enabled && !settings.fintech?.gift_cards_enabled) return null

  return <section className={`autonomous-ecosystem ${isRtl ? 'rtl' : 'ltr'}`}>
    <div className="container ecosystem-grid">
      {settings.ai?.rag_support_enabled && <div className="ecosystem-card">
        <h3>{t('Autonomous RAG Support', 'الدعم الذكي المستقل')}</h3>
        <p>{t('Ask anything about our products, shipping, or policies.', 'اسأل عن منتجاتنا أو الشحن أو سياسات المتجر.')}</p>
        <form onSubmit={handleRag}>
          <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t('e.g., What is your return policy?', 'مثل: ما هي سياسة الإرجاع؟')} />
          <button type="submit">{t('Ask AI', 'اسأل الذكاء الاصطناعي')}</button>
        </form>
        {answer && <div className="ecosystem-result" role="region">{answer}</div>}
      </div>}

      {settings.omnichannel?.bopis_enabled && branches.length > 0 && <div className="ecosystem-card">
        <h3>{t('Store Pickup & BOPIS Locator', 'مواقع الفروع والاستلام الفوري')}</h3>
        <p>{t('Check real-time stock across our physical branches.', 'تحقق من توفر المنتجات في فروعنا مباشرة.')}</p>
        <div className="branch-list">
          {branches.map((b, i) => <div className="branch-row" key={i}><div><strong>{b.name}</strong><span>{b.city} · {b.address}</span></div><span className="branch-badge">{b.ready_in}</span></div>)}
        </div>
      </div>}

      {settings.fintech?.gift_cards_enabled && <div className="ecosystem-card">
        <h3>{t('Gift Card & Wallet Redemption', 'استرداد بطاقات الهدايا والمحفظة')}</h3>
        <p>{t('Redeem digital gift cards or check wallet balance.', 'استرد بطاقات الهدايا الرقمية أو تحقق من رصيد المحفظة.')}</p>
        <form onSubmit={handleGift}>
          <input value={giftCode} onChange={(e) => setGiftCode(e.target.value)} placeholder={t('Enter gift code (e.g., SYNC-ELITE-2026)', 'أدخل رمز الهدية')} />
          <button type="submit">{t('Redeem', 'استرداد')}</button>
        </form>
        {giftResult && <div className={`ecosystem-result ${giftResult.valid ? 'success' : 'error'}`}>{giftResult.message} {giftResult.valid && `(Balance: SAR ${giftResult.remaining_balance})`}</div>}
      </div>}
    </div>
  </section>
}
