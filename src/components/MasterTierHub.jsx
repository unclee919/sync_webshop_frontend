import { useEffect, useState } from 'react'
import { getLoyaltySnapshot, getReferralHub, redeemLoyaltyPoints, claimReferralCode } from '../api/client'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import './MasterTierHub.css'

export default function MasterTierHub({ email, phone = '' }) {
  const { content } = useContent()
  const { lang, isRtl } = useLanguage()
  const settings = content?.master_tier || {}
  const isArabic = lang === 'ar'
  const [loyalty, setLoyalty] = useState(null)
  const [referral, setReferral] = useState(null)
  const [loading, setLoading] = useState(false)
  const [redeeming, setRedeeming] = useState(false)
  const [redeemPoints, setRedeemPoints] = useState('')
  const [claimCode, setClaimCode] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const t = (en, ar) => (isArabic ? ar : en)
  const enabled = settings.enabled !== 0
  const loyaltyEnabled = enabled && settings.loyalty_enabled !== 0
  const referralsEnabled = enabled && settings.referrals_enabled !== 0

  async function load() {
    if (!email || (!loyaltyEnabled && !referralsEnabled)) return
    setLoading(true)
    setError('')
    try {
      const [loyaltyData, referralData] = await Promise.all([
        loyaltyEnabled ? getLoyaltySnapshot({ email, phone }) : Promise.resolve(null),
        referralsEnabled ? getReferralHub({ email, phone }) : Promise.resolve(null),
      ])
      setLoyalty(loyaltyData)
      setReferral(referralData)
    } catch (err) {
      setError(err.message || t('The membership area is temporarily unavailable.', 'منطقة العضوية غير متاحة مؤقتاً.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [email, phone, loyaltyEnabled, referralsEnabled])

  async function redeem() {
    const points = Number(redeemPoints)
    if (!points || points <= 0) return
    setRedeeming(true)
    setError('')
    setNotice('')
    try {
      const data = await redeemLoyaltyPoints({ points, email, phone })
      setLoyalty(data)
      setRedeemPoints('')
      setNotice(t('Your points were converted into wallet credit.', 'تم تحويل نقاطك إلى رصيد في المحفظة.'))
    } catch (err) { setError(err.message || t('Points could not be redeemed.', 'تعذر استبدال النقاط.')) } finally { setRedeeming(false) }
  }

  async function claim() {
    if (!claimCode.trim()) return
    setError('')
    setNotice('')
    try {
      await claimReferralCode({ referralCode: claimCode.trim(), email, phone })
      setClaimCode('')
      await load()
      setNotice(t('Referral code claimed successfully.', 'تم تفعيل رمز الإحالة بنجاح.'))
    } catch (err) { setError(err.message || t('Referral code could not be claimed.', 'تعذر تفعيل رمز الإحالة.')) }
  }

  async function copyCode() {
    if (!referral?.code) return
    try {
      await navigator.clipboard.writeText(referral.code)
      setNotice(t('Referral code copied.', 'تم نسخ رمز الإحالة.'))
    } catch { setNotice(referral.code) }
  }

  if (!enabled || (!loyaltyEnabled && !referralsEnabled)) return null
  if (!email) return null

  return <section className={`master-tier-hub ${isRtl ? 'rtl' : 'ltr'}`} aria-labelledby="master-tier-title">
    <div className="master-tier-heading"><div><span className="eyebrow">{t('THE PRIVATE EDIT', 'النادي الخاص')}</span><h2 id="master-tier-title">{t('Your membership, thoughtfully designed.', 'عضويتك، مصممة بعناية.')}</h2><p>{t('Earn value with every considered purchase and unlock a more personal way to shop.', 'اكسب قيمة مع كل عملية شراء واستمتع بتجربة تسوق أكثر خصوصية.')}</p></div>{loading && <span className="master-tier-loading" role="status">{t('Refreshing…', 'جارٍ التحديث…')}</span>}</div>
    {error && <p className="master-tier-message error" role="alert">{error}</p>}
    {notice && <p className="master-tier-message" role="status">{notice}</p>}
    <div className="master-tier-grid">
      {loyaltyEnabled && loyalty && <article className="tier-card tier-card-primary"><div className="tier-card-top"><span>{t('Current tier', 'الفئة الحالية')}</span><span className="tier-badge" style={{ background: loyalty.tier?.badge_color || '#C5A059' }}>{loyalty.tier?.tier_name || t('Member', 'عضو')}</span></div><strong className="tier-points">{Number(loyalty.points || 0).toLocaleString()}</strong><span className="tier-label">{t('available points', 'نقطة متاحة')}</span><div className="tier-wallet"><span>{t('Wallet value', 'قيمة المحفظة')}</span><strong>{Number(loyalty.wallet_value || 0).toFixed(2)} {loyalty.currency || 'SAR'}</strong></div>{loyalty.tier?.perks_en || loyalty.tier?.perks_ar ? <p>{isArabic ? loyalty.tier.perks_ar : loyalty.tier.perks_en}</p> : null}</article>}
      {loyaltyEnabled && loyalty && <article className="tier-card tier-card-action"><span className="eyebrow">{t('POINTS TO WALLET', 'النقاط إلى المحفظة')}</span><h3>{t('Turn points into store credit.', 'حوّل نقاطك إلى رصيد للمتجر.')}</h3><p>{t(`Redeem from ${Number(settings.min_redeem_points || 100).toLocaleString()} points.`, `الحد الأدنى للاستبدال ${Number(settings.min_redeem_points || 100).toLocaleString()} نقطة.`)}</p><div className="tier-inline-form"><input type="number" min={Number(settings.min_redeem_points || 100)} max={Number(loyalty.points || 0)} value={redeemPoints} onChange={(event) => setRedeemPoints(event.target.value)} placeholder={t('Points', 'النقاط')} /><button type="button" className="primary-button" disabled={redeeming || !redeemPoints} onClick={redeem}>{redeeming ? '…' : t('Redeem', 'استبدال')}</button></div></article>}
      {referralsEnabled && referral && <article className="tier-card tier-card-referral"><span className="eyebrow">{t('REFERRAL CIRCLE', 'دائرة الإحالة')}</span><h3>{t('Share your private invitation.', 'شارك دعوتك الخاصة.')}</h3><p>{t(`${Number(referral.reward_points || settings.referral_reward_points || 50).toLocaleString()} points are awarded after a referred customer places their first order.`, `تحصل على ${Number(referral.reward_points || settings.referral_reward_points || 50).toLocaleString()} نقطة بعد إتمام العميل المُحال لطلبه الأول.`)}</p>{referral.code && <button type="button" className="referral-code" onClick={copyCode}><span>{referral.code}</span><small>{t('Copy', 'نسخ')}</small></button>}<div className="tier-inline-form"><input value={claimCode} onChange={(event) => setClaimCode(event.target.value.toUpperCase())} placeholder={t('Claim a code', 'أدخل رمزاً')} /><button type="button" className="secondary-button" disabled={!claimCode.trim()} onClick={claim}>{t('Claim', 'تفعيل')}</button></div></article>}
    </div>
    {referralsEnabled && referral?.referrals?.length > 0 && <div className="referral-history"><h3>{t('Referral history', 'سجل الإحالات')}</h3>{referral.referrals.map((item) => <div className="referral-history-row" key={item.name}><span>{item.referred_customer || t('Invitation pending', 'الدعوة قيد الانتظار')}</span><strong>{isArabic ? ({ Pending: 'قيد الانتظار', Qualified: 'مؤهل', Rewarded: 'تمت المكافأة', Cancelled: 'ملغاة' }[item.status] || item.status) : item.status}</strong></div>)}</div>}
  </section>
}
