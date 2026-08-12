import { useState } from 'react'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import './ThemeSwitcher.css'

const PRESET_THEMES = [
  {
    name: 'Oasis Market',
    layout_style: 'Oasis',
    colors: {
      primary: '#173F3A',
      secondary: '#6E9274',
      accent: '#D6A85E',
      background: '#F8F6F0',
      header_bg: '#FFFFFF',
      header_text: '#173F3A',
    }
  },
  {
    name: 'D Pono Luxe',
    layout_style: 'DPono',
    colors: {
      primary: '#111827',
      secondary: '#4F46E5',
      accent: '#F59E0B',
      background: '#F9FAFB',
      header_bg: '#FFFFFF',
      header_text: '#111827',
    }
  },
  {
    name: 'Modern Cedar',
    layout_style: 'Cedar',
    colors: {
      primary: '#1E3A2F',
      secondary: '#319795',
      accent: '#ECC94B',
      background: '#F7FAFC',
      header_bg: '#FFFFFF',
      header_text: '#1E3A2F',
    }
  },
  {
    name: 'Midnight Elegance',
    layout_style: 'Midnight',
    colors: {
      primary: '#F3F4F6',
      secondary: '#818CF8',
      accent: '#34D399',
      background: '#0F172A',
      header_bg: '#1E293B',
      header_text: '#F3F4F6',
    }
  }
]

export default function ThemeSwitcher() {
  const { content, refresh } = useContent()
  const { lang, isRtl } = useLanguage()
  const [open, setOpen] = useState(false)
  const isArabic = lang === 'ar'

  const applyPreset = (preset) => {
    const nextTheme = {
      ...content.theme,
      layout_style: preset.layout_style,
      colors: {
        ...content.theme.colors,
        ...preset.colors
      }
    }
    // Apply directly to root
    const root = document.documentElement.style
    Object.entries(preset.colors).forEach(([k, v]) => root.setProperty(`--${k.replaceAll('_', '-')}`, v))
    document.documentElement.dataset.layout = preset.layout_style.toLowerCase()
    localStorage.setItem('sync_webshop_preset_theme', JSON.stringify(preset))
    setOpen(false)
  }

  return (
    <div className={`theme-switcher-float ${isRtl ? 'rtl' : 'ltr'}`}>
      {open && (
        <div className="theme-switcher-popup">
          <div className="theme-switcher-header">
            <h4>{isArabic ? 'اختر مظهر المتجر' : 'Select Store Theme'}</h4>
            <button type="button" onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="theme-preset-list">
            {PRESET_THEMES.map((preset, idx) => (
              <button key={idx} type="button" className="theme-preset-btn" onClick={() => applyPreset(preset)}>
                <span className="preset-swatch" style={{ background: preset.colors.primary }} />
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <button type="button" className="theme-switcher-toggle" onClick={() => setOpen(!open)} title={isArabic ? 'تغيير المظهر' : 'Change Theme'}>
        🎨
      </button>
    </div>
  )
}
