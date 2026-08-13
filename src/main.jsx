import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CartProvider } from './context/CartContext'
import { LanguageProvider } from './context/LanguageContext'
import { ContentProvider } from './context/ContentContext'
import { ComparisonProvider } from './context/ComparisonContext'
import { UltraExperienceProvider } from './context/UltraExperienceContext'
import PwaController from './components/PwaController'
import './index.css'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <ContentProvider>
        <CartProvider>
          <ComparisonProvider>
            <BrowserRouter>
              <UltraExperienceProvider>
                <PwaController />
                <App />
              </UltraExperienceProvider>
            </BrowserRouter>
          </ComparisonProvider>
        </CartProvider>
      </ContentProvider>
    </LanguageProvider>
  </React.StrictMode>
)
