import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useLanguage } from '../context/LanguageContext'

export default function StripePaymentForm({ onPaymentSuccess, amount, currency, customer }) {
  const stripe = useStripe()
  const elements = useElements()
  const { lang } = useLanguage()
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
        {lang === 'ar' 
          ? 'سيتم معالجة الدفع بأمان عبر Stripe' 
          : 'Payment will be processed securely via Stripe'}
      </p>
      <button 
        type="button" 
        className="place-order-btn" 
        disabled={processing || !stripe}
        onClick={handleSubmit}
      >
        {processing 
          ? (lang === 'ar' ? 'جاري المعالجة...' : 'Processing...') 
          : (lang === 'ar' ? 'ادفع الآن' : 'Pay Now')}
      </button>
    </div>
  )
}
