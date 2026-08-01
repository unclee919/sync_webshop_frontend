import { useLanguage } from '../context/LanguageContext'
import './Features.css'

export default function Features() {
  const { lang, isRtl } = useLanguage()

  const features = [
    {
      title: lang === 'ar' ? 'تفاعلات دقيقة عند الإضافة للسلة' : 'Micro-interactions on Add to Cart',
      description: lang === 'ar' 
        ? 'عند إضافة منتج، يظهر تنبيه فوري (Toast) يؤكد العملية، مع تأثيرات حركية لزر الإضافة.'
        : 'When adding a product, an instant toast notification appears, along with animation effects on the button.',
      icon: '🛒'
    },
    {
      title: lang === 'ar' ? 'نظام تقييم المنتجات' : 'Product Rating System',
      description: lang === 'ar'
        ? 'يمكن الآن التحكم في تقييمات المنتجات مباشرة من لوحة تحكم ERPNext دون الحاجة لكود.'
        : 'Product ratings can now be controlled directly from the ERPNext dashboard without any code.',
      icon: '⭐'
    },
    {
      title: lang === 'ar' ? 'شريط رأس نحيف وعصري' : 'Slim & Modern Header',
      description: lang === 'ar'
        ? 'تم تصغير شريط الرأس العلوي لتوفير مساحة أكبر للمحتوى وتجربة تصفح أفضل.'
        : 'The top bar has been minimized to provide more space for content and a better browsing experience.',
      icon: '📏'
    },
    {
      title: lang === 'ar' ? 'تحريك تلقائي للصور' : 'Automatic Hero Slider',
      description: lang === 'ar'
        ? 'تتنقل صور الواجهة الرئيسية تلقائياً كل 5 ثوانٍ لجذب انتباه الزوار.'
        : 'Hero section images navigate automatically every 5 seconds to capture visitor attention.',
      icon: '🖼️'
    }
  ]

  return (
    <div className={`features-page container ${isRtl ? 'rtl' : 'ltr'}`}>
      <h1 className="page-title">{lang === 'ar' ? 'تحديثات تجربة المستخدم' : 'UX Updates'}</h1>
      <div className="features-grid">
        {features.map((f, i) => (
          <div key={i} className="feature-card">
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
