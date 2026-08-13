import { lazy, Suspense, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
const FloatingButtons = lazy(() => import('./components/FloatingButtons'))
const AiChatWidget = lazy(() => import('./components/AiChatWidget'))
const DarkModeToggle = lazy(() => import('./components/DarkModeToggle'))
const MiniCart = lazy(() => import('./components/MiniCart'))
const SocialProof = lazy(() => import('./components/SocialProof'))
const ComparisonTray = lazy(() => import('./components/ComparisonTray'))
const MobileQuickActions = lazy(() => import('./components/MobileQuickActions'))
const SharedTransitionOverlay = lazy(() => import('./components/SharedTransitionOverlay'))
const MagneticCursor = lazy(() => import('./components/MagneticCursor'))
const ExpressCheckoutBar = lazy(() => import('./components/ExpressCheckoutBar'))
import SEOHead from './components/SEOHead'
const Landing = lazy(() => import('./pages/Landing'))
const ProductList = lazy(() => import('./pages/ProductList'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const OrderTracking = lazy(() => import('./pages/OrderTracking'))
const Features = lazy(() => import('./pages/Features'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const SiteInfo = lazy(() => import('./pages/SiteInfo'))
const CollectionStoryteller = lazy(() => import('./pages/CollectionStoryteller'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const PolicyPage = lazy(() => import('./pages/PolicyPage'))
const ArticlesPage = lazy(() => import('./pages/ArticlesPage'))
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'))
const QaPage = lazy(() => import('./pages/QaPage'))
import './App.css'

export default function App() {
  const [miniCartOpen, setMiniCartOpen] = useState(false)
  return <div className="app-wrapper"><SEOHead /><Header onOpenCart={() => setMiniCartOpen(true)} /><main className="main-content page-transition"><Suspense fallback={<div className="container route-loading" role="status">Loading…</div>}><Routes><Route path="/" element={<Landing />} /><Route path="/products" element={<ProductList />} /><Route path="/products/:itemCode" element={<ProductDetail />} /><Route path="/wishlist" element={<Wishlist />} /><Route path="/contact-us" element={<SiteInfo />} /><Route path="/cart" element={<Cart />} /><Route path="/checkout" element={<Checkout />} /><Route path="/dashboard" element={<Dashboard />} /><Route path="/track" element={<OrderTracking />} /><Route path="/features" element={<Features />} /><Route path="/collections/:slug" element={<CollectionStoryteller />} /><Route path="/about-us" element={<AboutPage />} /><Route path="/our-policy" element={<PolicyPage />} /><Route path="/articles" element={<ArticlesPage />} /><Route path="/articles/:route" element={<ArticleDetailPage />} /><Route path="/qa" element={<QaPage />} /></Routes></Suspense></main><Footer /><Suspense fallback={null}><FloatingButtons /><AiChatWidget /><DarkModeToggle /><MiniCart open={miniCartOpen} onClose={() => setMiniCartOpen(false)} /><SocialProof /><ComparisonTray /><MobileQuickActions onOpenCart={() => setMiniCartOpen(true)} /><SharedTransitionOverlay /><MagneticCursor /><ExpressCheckoutBar /></Suspense></div>
}
