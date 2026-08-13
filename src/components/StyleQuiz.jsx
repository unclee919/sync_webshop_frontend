import { useEffect, useState } from 'react'
import { getStyleQuiz } from '../api/client'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import './StyleQuiz.css'

export default function StyleQuiz() {
  const { content } = useContent()
  const { lang, isRtl } = useLanguage()
  const masterTier = content?.master_tier || {}
  const quizEnabled = masterTier.enabled !== 0 && masterTier.style_quiz_enabled !== 0
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(null)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  useEffect(() => { if (quizEnabled) getStyleQuiz().then(setData).catch(() => setData(null)) }, [quizEnabled])
  if (!quizEnabled || !data?.enabled || !data.questions?.length) return null
  const isArabic = lang === 'ar'
  const question = data.questions[step]
  const finish = () => {
    const tags = Object.values(answers).map((option) => option?.tag).filter(Boolean)
    const profile = { tags: [...new Set(tags)], completedAt: new Date().toISOString() }
    try { localStorage.setItem('sync_webshop_style_profile', JSON.stringify(profile)); window.dispatchEvent(new CustomEvent('sync-style-profile-updated', { detail: profile })) } catch {}
    setOpen(false); setStep(0); setAnswers({})
  }
  return <section className={`style-quiz-entry container ${isRtl ? 'rtl' : 'ltr'}`}><div className="style-quiz-card"><div><span className="section-kicker">{isArabic ? 'تجربة مخصصة' : 'A considered edit'}</span><h2>{isArabic ? (data.title_ar || content.style_quiz_title_ar) : (data.title_en || content.style_quiz_title_en)}</h2><p>{isArabic ? (data.intro_ar || content.style_quiz_intro_ar) : (data.intro_en || content.style_quiz_intro_en)}</p></div><button type="button" className="primary-button" onClick={() => setOpen(true)}>{isArabic ? 'ابدأ الاختبار' : 'Take the quiz'} <span aria-hidden="true">→</span></button></div>{open && <div className="style-quiz-backdrop" role="presentation" onClick={() => setOpen(false)}><div className="style-quiz-modal" role="dialog" aria-modal="true" aria-labelledby="style-quiz-title" onClick={(event) => event.stopPropagation()}><button type="button" className="style-quiz-close" onClick={() => setOpen(false)} aria-label={isArabic ? 'إغلاق' : 'Close'}>×</button><span className="section-kicker">{step + 1}/{data.questions.length}</span><h2 id="style-quiz-title">{isArabic ? (question.question_ar || question.question_en) : question.question_en}</h2><div className="style-quiz-options">{(question.options || []).map((option, index) => <button type="button" key={`${option.tag}-${index}`} className={answers[question.key]?.tag === option.tag ? 'selected' : ''} onClick={() => setAnswers((current) => ({ ...current, [question.key]: option }))}>{isArabic ? (option.label_ar || option.label_en) : (option.label_en || option.label_ar)}</button>)}</div><button type="button" className="primary-button" disabled={!answers[question.key]} onClick={() => step + 1 < data.questions.length ? setStep(step + 1) : finish()}>{step + 1 < data.questions.length ? (isArabic ? 'التالي' : 'Next') : (isArabic ? 'عرض اختياراتي' : 'Tune my edit')}</button></div></div>}</section>
}
