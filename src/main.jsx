import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CartProvider } from './context/CartContext'
import { LanguageProvider } from './context/LanguageContext'
import { ContentProvider } from './context/ContentContext'
import { ComparisonProvider } from './context/ComparisonContext'
import { UltraExperienceProvider } from './context/UltraExperienceContext'
import './index.css'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {})
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <ContentProvider>
        <CartProvider>
          <ComparisonProvider>
            <BrowserRouter>
              <UltraExperienceProvider>
                <App />
              </UltraExperienceProvider>
            </BrowserRouter>
          </ComparisonProvider>
        </CartProvider>
      </ContentProvider>
    </LanguageProvider>
  </React.StrictMode>
)
