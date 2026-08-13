import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import FloatingButtons from './components/FloatingButtons'
import AiChatWidget from './components/AiChatWidget'
import DarkModeToggle from './components/DarkModeToggle'
import MiniCart from './components/MiniCart'
import SocialProof from './components/SocialProof'
import ComparisonTray from './components/ComparisonTray'
import SEOHead from './components/SEOHead'
import Landing from './pages/Landing'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Dashboard from './pages/Dashboard'
import OrderTracking from './pages/OrderTracking'
import Features from './pages/Features'
import Wishlist from './pages/Wishlist'
import SiteInfo from './pages/SiteInfo'
import './App.css'

export default function App() {
  const [miniCartOpen, setMiniCartOpen] = useState(false)
  return <div className="app-wrapper"><SEOHead /><Header onOpenCart={() => setMiniCartOpen(true)} /><main className="main-content page-transition"><Routes><Route path="/" element={<Landing />} /><Route path="/products" element={<ProductList />} /><Route path="/products/:itemCode" element={<ProductDetail />} /><Route path="/wishlist" element={<Wishlist />} /><Route path="/contact-us" element={<SiteInfo />} /><Route path="/cart" element={<Cart />} /><Route path="/checkout" element={<Checkout />} /><Route path="/dashboard" element={<Dashboard />} /><Route path="/track" element={<OrderTracking />} /><Route path="/features" element={<Features />} /></Routes></main><Footer /><FloatingButtons /><AiChatWidget /><DarkModeToggle /><MiniCart open={miniCartOpen} onClose={() => setMiniCartOpen(false)} /><SocialProof /><ComparisonTray /></div>
}
