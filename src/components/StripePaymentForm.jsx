import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'

export default function StripePaymentForm({ onPaymentSuccess, amount, currency, customer }) {
  const stripe = useStripe()
  const elements = useElements()
  const { lang } = useLanguage()
  const { content } = useContent()
  const featureCopy = content?.copy?.feature || {}
  const t = (key, en, ar) => lang === 'ar' ? (featureCopy[`${key}_ar`] || ar || en) : (featureCopy[`${key}_en`] || en || ar)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
      billing_details: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    })

    if (error) {
      setError(error.message)
      setProcessing(false)
    } else {
      onPaymentSuccess(paymentMethod.id)
    }
  }

  return (
    <div className="stripe-form-container">
      <CardElement options={{
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': { color: '#aab7c4' },
          },
          invalid: { color: '#9e2146' },
        },
      }} />
      {error && <div className="stripe-error">{error}</div>}
      <p className="stripe-hint">
        {t('stripe_secure_hint', 'Payment will be processed securely via Stripe', 'سيتم معالجة الدفع بأمان عبر Stripe')}
      </p>
      <button 
        type="button" 
        className="place-order-btn" 
        disabled={processing || !stripe}
        onClick={handleSubmit}
      >
        {processing ? t('processing', 'Processing...', 'جاري المعالجة...') : t('pay_now', 'Pay Now', 'ادفع الآن')}
      </button>
    </div>
  )
}
