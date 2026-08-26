import { createContext, useContext, useEffect, useState } from 'react'
import { getContent, getEliteSettings, getStorefrontProfiles, getMasterClassSettings, getEnterpriseSettings, getEcosystemSettings, getDynamicPageSettings, getMasterTierSettings, getLuxurySettings, getLiveSessions, getSocialPulse, getCommunityWall } from '../api/client'

const ContentContext = createContext(null)

const FONT_STACKS = {
  Poppins: "'Poppins', sans-serif",
  Cairo: "'Cairo', sans-serif",
  Inter: "'Inter', sans-serif",
  Roboto: "'Roboto', sans-serif",
  'Open Sans': "'Open Sans', sans-serif",
}

export const DEFAULT_CONTENT = {
  site_name: 'Sync Webshop',
  copy: {
    footer: {
      footer_eyebrow_en: 'The considered edit', footer_eyebrow_ar: 'اختيارات مدروسة', footer_contact_heading_en: 'Need help?', footer_contact_heading_ar: 'هل تحتاج إلى مساعدة؟',
      footer_phone_label_en: 'Phone', footer_phone_label_ar: 'الهاتف', footer_email_label_en: 'Email us', footer_email_label_ar: 'راسلنا', footer_address_label_en: 'Visit the studio', footer_address_label_ar: 'زيارة المتجر',
      footer_social_eyebrow_en: 'Stay in the loop', footer_social_eyebrow_ar: 'ابقَ على اطلاع', footer_social_heading_en: 'Follow along', footer_social_heading_ar: 'تابعنا', footer_social_aria_label_en: 'Social media links', footer_social_aria_label_ar: 'روابط التواصل الاجتماعي',
      footer_social_empty_en: 'Social links can be managed from Frappe Desk.', footer_social_empty_ar: 'يمكن إدارة روابط التواصل الاجتماعي من لوحة Frappe.', footer_design_credit_en: 'Designed for a better shopping experience.', footer_design_credit_ar: 'مصمم لتجربة تسوق أفضل.',
      footer_links_aria_label_en: 'Footer links and social media', footer_links_aria_label_ar: 'روابط التذييل والتواصل الاجتماعي', footer_navigation_aria_label_en: 'Footer navigation', footer_navigation_aria_label_ar: 'التنقل في التذييل', footer_explore_title_en: 'Explore', footer_explore_title_ar: 'استكشف', footer_customer_care_title_en: 'Customer care', footer_customer_care_title_ar: 'خدمة العملاء', footer_information_title_en: 'Information', footer_information_title_ar: 'معلومات', footer_visit_social_text_en: 'Visit us on', footer_visit_social_text_ar: 'زرنا على',
    },
    ui: {
      language_switch_en: 'العربية', language_switch_ar: 'English', explore_collection_en: 'Explore collection', explore_collection_ar: 'استكشف المجموعة', best_match_en: 'Best match', best_match_ar: 'أفضل تطابق', search_result_category_en: 'Category', search_result_category_ar: 'الفئة', search_result_product_en: 'Product', search_result_product_ar: 'المنتج',
      no_image_en: 'No image', no_image_ar: 'لا توجد صورة', on_request_en: 'On request', on_request_ar: 'السعر عند الطلب', unavailable_en: 'Unavailable', unavailable_ar: 'غير متوفر', view_product_en: 'View product', view_product_ar: 'عرض المنتج', view_details_en: 'View full details', view_details_ar: 'عرض التفاصيل الكاملة', all_rights_reserved_en: 'All rights reserved.', all_rights_reserved_ar: 'جميع الحقوق محفوظة.', support_en: 'Support', support_ar: 'الدعم', close_en: 'Close', close_ar: 'إغلاق', selected_product_en: 'Selected product', selected_product_ar: 'المنتج المحدد', cart_title_en: 'Your cart', cart_title_ar: 'سلة التسوق', cart_empty_en: 'Your cart is empty.', cart_empty_ar: 'سلتك فارغة حالياً.', browse_products_en: 'Browse products', browse_products_ar: 'تصفح المنتجات', checkout_en: 'Checkout', checkout_ar: 'إتمام الطلب', view_cart_en: 'View cart', view_cart_ar: 'عرض السلة', free_shipping_unlocked_en: 'You unlocked free shipping.', free_shipping_unlocked_ar: 'تهانينا! حصلت على الشحن المجاني.', free_shipping_away_en: 'away from free shipping', free_shipping_away_ar: 'متبقي', cart_item_en: 'items', cart_item_ar: 'منتج', close_cart_en: 'Close cart', close_cart_ar: 'إغلاق السلة', free_shipping_progress_en: 'Free shipping progress', free_shipping_progress_ar: 'تقدم الشحن المجاني', decrease_quantity_en: 'Decrease quantity', decrease_quantity_ar: 'تقليل الكمية', increase_quantity_en: 'Increase quantity', increase_quantity_ar: 'زيادة الكمية', remove_en: 'Remove', remove_ar: 'حذف', subtotal_en: 'Subtotal', subtotal_ar: 'الإجمالي', compare_products_en: 'Compare products', compare_products_ar: 'مقارنة المنتجات', compare_items_en: 'items', compare_items_ar: 'منتجات', compare_now_en: 'Compare now', compare_now_ar: 'قارن الآن', clear_en: 'Clear', clear_ar: 'مسح', comparison_kicker_en: 'A smarter choice', comparison_kicker_ar: 'قرار أذكى', comparison_title_en: 'Compare your picks', comparison_title_ar: 'قارن اختياراتك', rating_en: 'Rating', rating_ar: 'التقييم', availability_en: 'Availability', availability_ar: 'التوفر', available_en: 'Available', available_ar: 'متوفر', close_quick_actions_en: 'Close quick actions', close_quick_actions_ar: 'إغلاق الإجراءات السريعة', quick_actions_en: 'Quick actions', quick_actions_ar: 'إجراءات سريعة', search_en: 'Search', search_ar: 'بحث', saved_en: 'Saved', saved_ar: 'المفضلة', bag_en: 'Bag', bag_ar: 'السلة', ai_help_en: 'AI help', ai_help_ar: 'مساعدة ذكية', whatsapp_en: 'WhatsApp', whatsapp_ar: 'واتساب', light_en: 'Light', light_ar: 'مضيء', dark_en: 'Dark', dark_ar: 'داكن', top_en: 'Top', top_ar: 'أعلى', open_quick_actions_en: 'Open quick actions', open_quick_actions_ar: 'فتح الإجراءات السريعة', menu_en: 'Menu', menu_ar: 'القائمة', checkout_title_en: 'Checkout', checkout_title_ar: 'إتمام الطلب', shipping_information_en: 'Shipping Information', shipping_information_ar: 'معلومات الشحن', full_name_en: 'Full Name', full_name_ar: 'الاسم الكامل', email_en: 'Email', email_ar: 'البريد الإلكتروني', primary_phone_en: 'Primary Phone', primary_phone_ar: 'رقم الهاتف الأساسي', second_phone_en: 'Second Phone Number', second_phone_ar: 'رقم هاتف ثانٍ', governorate_en: 'Governorate', governorate_ar: 'المحافظة', select_governorate_en: 'Select governorate', select_governorate_ar: 'اختر المحافظة', city_en: 'City', city_ar: 'المدينة', select_city_en: 'Select city', select_city_ar: 'اختر المدينة', detailed_address_en: 'Detailed Address', detailed_address_ar: 'العنوان بالتفصيل', optional_location_en: 'Optional Location', optional_location_ar: 'موقع اختياري', location_placeholder_en: 'Map link or nearby landmark', location_placeholder_ar: 'رابط الخريطة أو علامة مميزة', coupon_code_en: 'Coupon Code', coupon_code_ar: 'كود الخصم', apply_en: 'Apply', apply_ar: 'تطبيق', invalid_coupon_en: 'Invalid coupon code', invalid_coupon_ar: 'كود غير صالح', coupon_applied_en: 'Coupon applied successfully', coupon_applied_ar: 'تم تطبيق الكود بنجاح', make_it_gift_en: 'Make it a gift', make_it_gift_ar: 'اجعلها هدية', add_gift_wrapping_en: 'Add gift wrapping', add_gift_wrapping_ar: 'إضافة تغليف هدايا', personal_note_en: 'Add a personal note', personal_note_ar: 'أضف ملاحظة شخصية', fulfillment_en: 'Fulfillment', fulfillment_ar: 'التنفيذ', delivery_en: 'Delivery', delivery_ar: 'توصيل', store_pickup_en: 'Store pickup', store_pickup_ar: 'الاستلام من المتجر', select_warehouse_en: 'Select warehouse', select_warehouse_ar: 'اختر المستودع', delivery_date_en: 'Delivery Date', delivery_date_ar: 'تاريخ التوصيل', preferred_delivery_date_en: 'Select your preferred delivery date', preferred_delivery_date_ar: 'اختر موعد التوصيل المفضل لديك', payment_method_en: 'Payment Method', payment_method_ar: 'طريقة الدفع', paymob_secure_hint_en: 'Pay securely through Paymob', paymob_secure_hint_ar: 'ادفع بأمان عبر Paymob', processing_en: 'Processing...', processing_ar: 'جاري المعالجة...', continue_payment_en: 'Continue to Payment', continue_payment_ar: 'المتابعة إلى الدفع', confirm_order_en: 'Confirm Order', confirm_order_ar: 'تأكيد الطلب', order_summary_en: 'Order Summary', order_summary_ar: 'ملخص الطلب', discount_en: 'Discount', discount_ar: 'الخصم', shipping_en: 'Shipping', shipping_ar: 'الشحن', free_en: 'Free', free_ar: 'مجاني', total_en: 'Total', total_ar: 'الإجمالي', retry_en: 'Retry', retry_ar: 'إعادة المحاولة', loading_en: 'Loading...', loading_ar: 'جارٍ التحميل...', full_name_placeholder_en: 'Enter your full name', full_name_placeholder_ar: 'أدخل اسمك الكامل', required_fields_en: 'Please complete all required fields', required_fields_ar: 'يرجى إكمال جميع الحقول المطلوبة', valid_fields_en: 'Please ensure all entered data is valid', valid_fields_ar: 'يرجى التأكد من صحة البيانات المدخلة', payment_start_error_en: 'Unable to start the online payment.', payment_start_error_ar: 'تعذر بدء عملية الدفع الإلكتروني.',
    },
    feature: {
      complete_look_kicker_en: 'Styled together', complete_look_kicker_ar: 'منسقة معاً', complete_look_subtitle_en: 'Curated pieces that work beautifully together.', complete_look_subtitle_ar: 'اختيارات متناسقة لتشكيل مجموعة متكاملة.', complete_look_total_label_en: 'Set total', complete_look_total_label_ar: 'إجمالي المجموعة', add_set_to_bag_en: 'Add the set to bag', add_set_to_bag_ar: 'أضف المجموعة إلى السلة', fit_guide_empty_state_en: 'Add two measurements to see your recommendation.', fit_guide_empty_state_ar: 'أضف قياسين لرؤية الاقتراح.', fit_guide_kicker_en: 'Fit studio', fit_guide_kicker_ar: 'استوديو المقاس', fit_guide_subtitle_en: 'A private, on-device guide', fit_guide_subtitle_ar: 'دليل خاص يعمل على جهازك', fit_guide_privacy_en: 'Enter approximate measurements. They stay in this browser and are never submitted.', fit_guide_privacy_ar: 'أدخل قياسات تقريبية. تبقى على هذا المتصفح ولا يتم إرسالها.', fit_guide_height_label_en: 'Height (cm)', fit_guide_height_label_ar: 'الطول (سم)', fit_guide_chest_label_en: 'Chest (cm)', fit_guide_chest_label_ar: 'الصدر (سم)', fit_guide_waist_label_en: 'Waist (cm)', fit_guide_waist_label_ar: 'الخصر (سم)', fit_guide_recommendation_label_en: 'Your recommendation', fit_guide_recommendation_label_ar: 'اقتراحك', fit_guide_relaxed_note_en: 'Relaxed and generous through the body.', fit_guide_relaxed_note_ar: 'قصة مريحة وواسعة حول الجسم.', fit_guide_balanced_note_en: 'A balanced fit with room to move.', fit_guide_balanced_note_ar: 'قصة متوازنة تمنحك حرية الحركة.', fit_guide_everyday_note_en: 'The considered everyday fit.', fit_guide_everyday_note_ar: 'المقاس المتوازن للاستخدام اليومي.', fit_guide_refined_note_en: 'A closer, refined silhouette.', fit_guide_refined_note_ar: 'قصة أقرب بصياغة راقية.',
      visual_search_kicker_en: 'Search by image', visual_search_kicker_ar: 'البحث بالصورة', visual_search_loading_en: 'Finding similar products…', visual_search_loading_ar: 'جارٍ البحث عن منتجات مشابهة…', visual_search_no_results_en: 'Visual search is not available right now.', visual_search_no_results_ar: 'البحث بالصورة غير متاح حالياً.', visual_search_no_matches_en: 'No close matches found. Try a clearer product photo.', visual_search_no_matches_ar: 'لم نعثر على نتائج قريبة. جرّب صورة أوضح للمنتج.', tracking_map_kicker_en: 'Live delivery', tracking_map_kicker_ar: 'تتبع حي', tracking_map_origin_label_en: 'Store', tracking_map_origin_label_ar: 'المتجر', tracking_map_destination_label_en: 'Destination', tracking_map_destination_label_ar: 'وجهتك', tracking_map_cta_en: 'Open courier tracking', tracking_map_cta_ar: 'فتح تتبع شركة الشحن', tracking_map_on_way_en: 'On the way', tracking_map_on_way_ar: 'قيد التوصيل', tracking_map_stops_remaining_en: '{count} stops remaining', tracking_map_stops_remaining_ar: '{count} محطات متبقية',
      ai_chat_title_en: 'Shopping assistant', ai_chat_title_ar: 'مساعد التسوق', ai_chat_open_en: 'Open assistant', ai_chat_open_ar: 'افتح المساعد', ai_chat_privacy_en: 'For your safety, do not share passwords, card details, OTPs, API keys, or private information.', ai_chat_privacy_ar: 'لأمانك، لا ترسل كلمات المرور أو بيانات البطاقات أو رموز التحقق أو أي بيانات خاصة.', ai_chat_placeholder_en: 'Ask about products, orders, or delivery…', ai_chat_placeholder_ar: 'اكتب سؤالك هنا...', ai_chat_send_en: 'Send', ai_chat_send_ar: 'إرسال', ai_chat_close_en: 'Close', ai_chat_close_ar: 'إغلاق', ai_chat_online_en: 'Online now', ai_chat_online_ar: 'متصل الآن', ai_chat_thinking_en: 'Thinking…', ai_chat_thinking_ar: 'جارٍ التفكير...', ai_chat_unavailable_en: 'The assistant is temporarily unavailable.', ai_chat_unavailable_ar: 'المساعد غير متاح حالياً.', ai_chat_error_en: 'Unable to get a response. Please try again.', ai_chat_error_ar: 'تعذر الحصول على رد. حاول مرة أخرى.', style_quiz_kicker_en: 'A considered edit', style_quiz_kicker_ar: 'تجربة مخصصة', style_quiz_cta_en: 'Take the quiz', style_quiz_cta_ar: 'ابدأ الاختبار', style_quiz_close_en: 'Close', style_quiz_close_ar: 'إغلاق', style_quiz_next_en: 'Next', style_quiz_next_ar: 'التالي', style_quiz_finish_en: 'Tune my edit', style_quiz_finish_ar: 'عرض اختياراتي', account_title_en: 'My account', account_title_ar: 'حسابي', account_subtitle_en: 'Track orders, invoices, loyalty points, profile details, and returns in one place.', account_subtitle_ar: 'تابع طلباتك وفواتيرك ونقاطك وطلبات الإرجاع من مكان واحد.', account_email_placeholder_en: 'Enter the email used at checkout', account_email_placeholder_ar: 'أدخل البريد الإلكتروني المستخدم عند الدفع', open_dashboard_en: 'Open my dashboard', open_dashboard_ar: 'عرض لوحة حسابي', no_orders_en: 'No orders found for that email.', no_orders_ar: 'لا توجد طلبات لهذا البريد الإلكتروني.', orders_en: 'Orders', orders_ar: 'الطلبات', invoices_en: 'Invoices', invoices_ar: 'الفواتير', return_requests_en: 'Return requests', return_requests_ar: 'طلبات الإرجاع', account_summary_en: 'Account summary', account_summary_ar: 'ملخص الحساب', loyalty_points_en: 'Loyalty points', loyalty_points_ar: 'نقاط الولاء', my_profile_en: 'My profile', my_profile_ar: 'بياناتي', save_changes_en: 'Save changes', save_changes_ar: 'حفظ التغييرات', edit_profile_en: 'Edit profile', edit_profile_ar: 'تعديل البيانات', download_pdf_en: 'Download PDF', download_pdf_ar: 'تحميل PDF', request_return_en: 'Request return', request_return_ar: 'طلب إرجاع', cancel_en: 'Cancel', cancel_ar: 'إلغاء', submit_request_en: 'Submit request', submit_request_ar: 'إرسال الطلب', return_reason_en: 'Reason for return', return_reason_ar: 'سبب الإرجاع', quantity_en: 'Quantity', quantity_ar: 'الكمية', return_success_en: 'Return request submitted successfully.', return_success_ar: 'تم إرسال طلب الإرجاع.', profile_saved_en: 'Profile updated successfully.', profile_saved_ar: 'تم تحديث البيانات.', address_saved_en: 'Address saved successfully.', address_saved_ar: 'تم حفظ العنوان.', address_deleted_en: 'Address deleted successfully.', address_deleted_ar: 'تم حذف العنوان.', total_spend_en: 'Total spend', total_spend_ar: 'إجمالي الإنفاق', average_order_en: 'Average order', average_order_ar: 'متوسط الطلب', completed_orders_en: 'Completed orders', completed_orders_ar: 'طلبات مكتملة', saved_addresses_en: 'Saved addresses', saved_addresses_ar: 'عناويني', add_address_en: 'Add address', add_address_ar: 'إضافة عنوان', edit_address_en: 'Edit address', edit_address_ar: 'تعديل العنوان', delete_address_en: 'Delete', delete_address_ar: 'حذف', delete_address_confirm_en: 'Delete this address?', delete_address_confirm_ar: 'هل تريد حذف هذا العنوان؟', address_line_en: 'Address line', address_line_ar: 'العنوان', country_en: 'Country', country_ar: 'الدولة', postcode_en: 'Postcode', postcode_ar: 'الرمز البريدي', no_saved_addresses_en: 'No saved addresses yet.', no_saved_addresses_ar: 'لا توجد عناوين محفوظة.', no_invoices_en: 'No invoices available.', no_invoices_ar: 'لا توجد فواتير.', no_returns_en: 'No return requests yet.', no_returns_ar: 'لا توجد طلبات إرجاع.', item_added_to_bag_en: 'Item added to your bag.', item_added_to_bag_ar: 'تمت إضافة المنتج إلى السلة.', reorder_en: 'Reorder', reorder_ar: 'إعادة الطلب', membership_title_en: 'Your membership', membership_title_ar: 'عضويتك', new_member_en: 'New member', new_member_ar: 'عضو جديد', member_discount_en: 'member discount', member_discount_ar: 'خصم للأعضاء', quote_status_prefix_en: 'Quote request', quote_status_prefix_ar: 'طلب عرض السعر', quote_title_en: 'Request a tailored quote', quote_title_ar: 'اطلب عرض سعر مخصص', quote_kicker_en: 'Concierge service', quote_kicker_ar: 'خدمة مخصصة', quote_body_en: 'Tell us what you need and our team will prepare a considered proposal.', quote_body_ar: 'أخبرنا بما تحتاجه وسنعد لك عرضاً مناسباً.', quote_name_en: 'Name', quote_name_ar: 'الاسم', quote_email_en: 'Email', quote_email_ar: 'البريد الإلكتروني', quote_phone_en: 'Phone', quote_phone_ar: 'الهاتف', quote_company_en: 'Company or project', quote_company_ar: 'الشركة أو المشروع', quote_notes_en: 'Notes', quote_notes_ar: 'ملاحظات', quote_sending_en: 'Sending...', quote_sending_ar: 'جارٍ الإرسال...', quote_send_en: 'Send request', quote_send_ar: 'إرسال الطلب', login_validation_en: 'Please enter email and phone number', login_validation_ar: 'الرجاء إدخال البريد الإلكتروني ورقم الهاتف', login_failed_en: 'Login failed', login_failed_ar: 'فشل تسجيل الدخول', connection_error_en: 'Connection error', connection_error_ar: 'خطأ في الاتصال', customer_sign_in_en: 'Customer Sign In', customer_sign_in_ar: 'تسجيل دخول العميل', mobile_phone_en: 'Mobile Phone', mobile_phone_ar: 'رقم الهاتف المحمول', verifying_en: 'Verifying...', verifying_ar: 'جاري التحقق...', continue_en: 'Continue', continue_ar: 'متابعة الدخول', stripe_secure_hint_en: 'Payment will be processed securely via Stripe', stripe_secure_hint_ar: 'سيتم معالجة الدفع بأمان عبر Stripe', pay_now_en: 'Pay Now', pay_now_ar: 'ادفع الآن'
    },
  },
  storefront_brands: [],
  master_settings: { landing: { enabled: 0 }, subscriptions: { enabled: 0, discount_percent: 0, intervals: [] }, courier: { provider: 'Manual', auto_waybill: 0 }, returns: { allowed_days: 14 }, currencies: { auto_detect: 1, supported: [], rates: {} }, social_feed: [] },
  social_feed_items: [],
  enterprise_settings: { ai: { auto_translate_enabled: 0, intelligent_merchandising: 0, voice_actions_enabled: 0 }, b2b: { enabled: 0, volume_pricing_enabled: 0, corporate_credit_enabled: 0, quick_order_enabled: 0 }, live_shopping: { enabled: 0 }, flash_sales: { enabled: 0, scarcity_threshold: 5, discount_percent: 0 }, recovery: { enabled: 0, delay_hours: 2, coupon_discount: 0 }, fraud_shield: { enabled: 0, max_order_amount: 5000 }, infrastructure: { edge_cache_enabled: 0, auto_healing_enabled: 0 } },
  ecosystem_settings: { ai: { rag_support_enabled: 0, demand_forecaster_enabled: 0, marketing_hub_enabled: 0 }, marketplace: { multi_vendor_enabled: 0, commission_percent: 15, affiliate_enabled: 0 }, fintech: { gift_cards_enabled: 0, subscription_box_enabled: 0 }, omnichannel: { bopis_enabled: 0, kiosk_mode_enabled: 0 } },
  dynamic_pages: { enabled: 1, about_enabled: 1, about_show_in_nav: 1, about_label_en: 'About us', about_label_ar: 'من نحن', policy_enabled: 1, policy_show_in_nav: 1, policy_label_en: 'Our policy', policy_label_ar: 'سياساتنا', articles_enabled: 1, articles_show_in_nav: 1, articles_label_en: 'Articles', articles_label_ar: 'المقالات', qa_enabled: 1, qa_show_in_nav: 1, qa_label_en: 'Q&A', qa_label_ar: 'الأسئلة والأجوبة', seo_description_en: '', seo_description_ar: '' },
  master_tier: { enabled: 1, style_quiz_enabled: 1, ghost_search_enabled: 1, loyalty_enabled: 1, referrals_enabled: 1, hotspots_enabled: 1, abandoned_cart_enabled: 1, ai_seo_enabled: 1, points_per_currency: 1, wallet_value_per_point: 0.1, min_redeem_points: 100, referral_reward_points: 50 },
  luxury_tier: { enabled: 1, magnetic_cursor_enabled: 1, cinematic_transitions_enabled: 1, circadian_theme_enabled: 1, predictive_prefetch_enabled: 1, webxr_ar_enabled: 1, exploder_3d_enabled: 1, live_sessions: [], social_pulse: [], community_wall: [] },
  business_profile: { vertical: 'General Retail', vertical_label_en: 'Thoughtfully selected', vertical_label_ar: 'مختارات بعناية', intro_en: 'Everyday essentials, thoughtfully selected.', intro_ar: 'احتياجاتك اليومية، مختارة بعناية.', unit_label_en: 'item', unit_label_ar: 'منتج' },
  elite_settings: { ai_vision: { visual_search_enabled: 1, auto_tagging_enabled: 1, nlp_enabled: 1 }, marketplaces: { amazon_sa_enabled: 0, noon_enabled: 0, sync_interval_minutes: 30 }, regional_payments: { tabby_enabled: 1, tamara_enabled: 1, mada_enabled: 1, apple_pay_enabled: 1 }, pwa: { pwa_enabled: 1, app_short_name: 'Sync Webshop', theme_color: '#173F3A', offline_message_en: 'You are currently offline.', offline_message_ar: 'أنت غير متصل بالإنترنت حالياً.' } },
  site_name_en: 'Sync Webshop',
  site_name_ar: 'متجر سينك',
  tagline_en: 'Everyday essentials, thoughtfully selected.',
  tagline_ar: 'احتياجاتك اليومية، مختارة بعناية.',
  phone_number: '',
  email_address: '',
  show_top_bar: 1,
  show_category_sidebar: 1,
  show_price_filter: 1,
  show_whatsapp_button: 0,
  show_back_to_top: 1,
  enable_wishlist: 1,
  nav_links: [],
  banners: [],
  featured_categories: [],
  landing_sections: [],
  testimonials: [],
  trust_badges: [],
  stories: [],
  editorial_collections: [],
  stories_enabled: 1,
  stories_title_en: 'The edit, in moments',
  stories_title_ar: 'مختارات في لحظات',
  mega_menu_enabled: 1,
  mega_menu_title_en: 'Browse categories',
  mega_menu_title_ar: 'تصفح الأقسام',
  mega_menu_max_categories: 12,
  mega_menu_featured_image: null,
  mega_menu_featured_title_en: '',
  mega_menu_featured_title_ar: '',
  mega_menu_featured_url: '',
  mobile_quick_actions_enabled: 1,
  complete_the_look_enabled: 1,
  complete_the_look_title_en: 'Complete the look',
  complete_the_look_title_ar: 'أكمل الإطلالة',
  social_links: [],
  announcement: { enabled: 0 },
  footer_settings: { enabled: 1, columns: [] },
  product_settings: { show_related_products: 1, show_sidebar: 1, enable_immersive_viewer: 1, enable_video_hover: 1, complete_the_look_enabled: 1, complete_the_look_title_en: 'Complete the look', complete_the_look_title_ar: 'أكمل الإطلالة', ar_enabled: 1, ar_ios_model_url: '', ar_android_model_url: '', three_d_model_url: '', exploded_view_enabled: 1, exploded_view_title_en: 'Inspect the details', exploded_view_title_ar: 'استكشف التفاصيل', fit_guide_enabled: 1, fit_guide_title_en: 'Find your best fit', fit_guide_title_ar: 'اعثر على المقاس المناسب', material_studio_enabled: 1, quote_requests_enabled: 0, quote_request_min_qty: 10 },
  ultra_settings: { adaptive_palette_enabled: 1, circadian_theme_enabled: 1, shared_transitions_enabled: 1, magnetic_cursor_enabled: 1, predictive_prefetch_enabled: 1, palette_transition_ms: 520, circadian_evening_start: 18, circadian_morning_start: 7 },
  experience_settings: { sensory_ui_enabled: 1, cinematic_transitions_enabled: 1, lookbook_hotspots_enabled: 1, curated_for_you_enabled: 1, curated_for_you_title_en: 'Curated for you', curated_for_you_title_ar: 'مختارات لك', express_checkout_enabled: 1, express_checkout_title_en: 'A faster way to checkout', express_checkout_title_ar: 'طريقة أسرع لإتمام الطلب', express_checkout_subtitle_en: 'Use your saved details and continue in one fluid step.', express_checkout_subtitle_ar: 'استخدم بياناتك المحفوظة وأكمل طلبك بخطوة سلسة.', express_checkout_cta_en: 'Checkout faster', express_checkout_cta_ar: 'إتمام أسرع', gifting_enabled: 1, gifting_title_en: 'Make it a gift', gifting_title_ar: 'اجعلها هدية', gifting_message_placeholder_en: 'Add a personal note', gifting_message_placeholder_ar: 'أضف رسالة شخصية', gifting_wrap_label_en: 'Add gift wrapping', gifting_wrap_label_ar: 'إضافة تغليف هدايا', visual_search_enabled: 0, visual_search_ai_enabled: 0, visual_search_title_en: 'Search by image', visual_search_title_ar: 'البحث بالصورة', visual_search_hint_en: 'Upload a product photo to find similar items', visual_search_hint_ar: 'ارفع صورة منتج للعثور على منتجات مشابهة', performance_adaptive_media_enabled: 1, performance_lazy_spatial_enabled: 1, pickup_enabled: 0, pickup_title_en: 'Store pickup', pickup_title_ar: 'الاستلام من المتجر', pickup_note_en: 'Choose an available warehouse and collect your order there.', pickup_note_ar: 'اختر مستودعاً متاحاً لاستلام طلبك منه.', membership_enabled: 1, membership_title_en: 'Your membership', membership_title_ar: 'عضويتك', presence_material_studio_enabled: 1, presence_material_studio_title_en: 'Make it yours', presence_material_studio_title_ar: 'صممه بطريقتك', style_quiz_enabled: 0, style_quiz_title_en: 'Find your point of view', style_quiz_title_ar: 'اكتشف ذوقك', style_quiz_intro_en: 'Answer a few questions and we will tune the edit to you.', style_quiz_intro_ar: 'أجب عن بعض الأسئلة لنضبط الاختيارات بما يناسبك.', quote_requests_enabled: 0, quote_request_title_en: 'Request a tailored quote', quote_request_title_ar: 'اطلب عرض سعر مخصص', quote_request_threshold: 10, live_tracking_map_enabled: 0, live_tracking_title_en: 'Your delivery, in view', live_tracking_title_ar: 'شاهد مسار توصيلك', social_proof_enabled: 0, social_proof_viewer_enabled: 0, social_proof_viewer_template_en: '{count} people are viewing this now', social_proof_viewer_template_ar: '{count} أشخاص يشاهدون هذا الآن' },
  theme: {
    layout_style: 'Cedar',
    colors: {
      primary: '#173F3A',
      secondary: '#2D8B72',
      accent: '#E6B85C',
      danger: '#C95757',
      background: '#F8FAF7',
      top_bar_bg: '#173F3A',
      top_bar_text: '#F8FAF7',
      header_bg: '#FFFFFF',
      header_text: '#173F3A',
      nav_bg: '#FFFFFF',
      nav_text: '#173F3A',
      footer_bg: '#173F3A',
      footer_text: '#F8FAF7',
    },
    fonts: { heading: 'Poppins', body: 'Inter' },
    spacing: { container_width: '1240px', border_radius: '18px', border_radius_sm: '10px', border_radius_lg: '28px', section_gap: '5rem', card_gap: '1.25rem' },
    dimensions: {
      header_max_width: 1240,
      header_height: 84,
      logo_height: 46,
      hero_height: 500,
      search_bar_max_width: 560,
      search_bar_height: 48,
      nav_bar_height: 54,
    },
  },
}

function mergeContent(data) {
  const source = data || {}
  return {
    ...DEFAULT_CONTENT,
    ...source,
    theme: {
      ...DEFAULT_CONTENT.theme,
      ...(source.theme || {}),
      colors: { ...DEFAULT_CONTENT.theme.colors, ...(source.theme?.colors || {}) },
      fonts: { ...DEFAULT_CONTENT.theme.fonts, ...(source.theme?.fonts || {}) },
      spacing: { ...DEFAULT_CONTENT.theme.spacing, ...(source.theme?.spacing || {}) },
      dimensions: { ...DEFAULT_CONTENT.theme.dimensions, ...(source.theme?.dimensions || {}) },
    },
    copy: {
      ...DEFAULT_CONTENT.copy,
      ...(source.copy || {}),
      footer: { ...DEFAULT_CONTENT.copy.footer, ...(source.copy?.footer || {}) },
      ui: { ...DEFAULT_CONTENT.copy.ui, ...(source.copy?.ui || {}) },
      feature: { ...DEFAULT_CONTENT.copy.feature, ...(source.copy?.feature || {}) },
    },
    product_settings: { ...DEFAULT_CONTENT.product_settings, ...(source.product_settings || {}) },
    ultra_settings: { ...DEFAULT_CONTENT.ultra_settings, ...(source.ultra_settings || {}) },
    experience_settings: { ...DEFAULT_CONTENT.experience_settings, ...(source.experience_settings || {}) },
    business_profile: { ...DEFAULT_CONTENT.business_profile, ...(source.business_profile || {}) },
    storefront_brands: Array.isArray(source.storefront_brands) ? source.storefront_brands : DEFAULT_CONTENT.storefront_brands,
    master_settings: { ...DEFAULT_CONTENT.master_settings, ...(source.master_settings || {}), landing: { ...DEFAULT_CONTENT.master_settings.landing, ...(source.master_settings?.landing || {}) }, subscriptions: { ...DEFAULT_CONTENT.master_settings.subscriptions, ...(source.master_settings?.subscriptions || {}) }, courier: { ...DEFAULT_CONTENT.master_settings.courier, ...(source.master_settings?.courier || {}) }, returns: { ...DEFAULT_CONTENT.master_settings.returns, ...(source.master_settings?.returns || {}) }, currencies: { ...DEFAULT_CONTENT.master_settings.currencies, ...(source.master_settings?.currencies || {}) } },
    social_feed_items: Array.isArray(source.social_feed_items) ? source.social_feed_items : DEFAULT_CONTENT.social_feed_items,
    enterprise_settings: { ...DEFAULT_CONTENT.enterprise_settings, ...(source.enterprise_settings || {}), ai: { ...DEFAULT_CONTENT.enterprise_settings.ai, ...(source.enterprise_settings?.ai || {}) }, b2b: { ...DEFAULT_CONTENT.enterprise_settings.b2b, ...(source.enterprise_settings?.b2b || {}) }, live_shopping: { ...DEFAULT_CONTENT.enterprise_settings.live_shopping, ...(source.enterprise_settings?.live_shopping || {}) }, flash_sales: { ...DEFAULT_CONTENT.enterprise_settings.flash_sales, ...(source.enterprise_settings?.flash_sales || {}) }, recovery: { ...DEFAULT_CONTENT.enterprise_settings.recovery, ...(source.enterprise_settings?.recovery || {}) }, fraud_shield: { ...DEFAULT_CONTENT.enterprise_settings.fraud_shield, ...(source.enterprise_settings?.fraud_shield || {}) }, infrastructure: { ...DEFAULT_CONTENT.enterprise_settings.infrastructure, ...(source.enterprise_settings?.infrastructure || {}) } },
    ecosystem_settings: { ...DEFAULT_CONTENT.ecosystem_settings, ...(source.ecosystem_settings || {}), ai: { ...DEFAULT_CONTENT.ecosystem_settings.ai, ...(source.ecosystem_settings?.ai || {}) }, marketplace: { ...DEFAULT_CONTENT.ecosystem_settings.marketplace, ...(source.ecosystem_settings?.marketplace || {}) }, fintech: { ...DEFAULT_CONTENT.ecosystem_settings.fintech, ...(source.ecosystem_settings?.fintech || {}) }, omnichannel: { ...DEFAULT_CONTENT.ecosystem_settings.omnichannel, ...(source.ecosystem_settings?.omnichannel || {}) } },
    dynamic_pages: { ...DEFAULT_CONTENT.dynamic_pages, ...(source.dynamic_pages || {}) },
    master_tier: { ...DEFAULT_CONTENT.master_tier, ...(source.master_tier || {}) },
    luxury_tier: { ...DEFAULT_CONTENT.luxury_tier, ...(source.luxury_tier || {}), live_sessions: Array.isArray(source.luxury_tier?.live_sessions) ? source.luxury_tier.live_sessions : DEFAULT_CONTENT.luxury_tier.live_sessions, social_pulse: Array.isArray(source.luxury_tier?.social_pulse) ? source.luxury_tier.social_pulse : DEFAULT_CONTENT.luxury_tier.social_pulse, community_wall: Array.isArray(source.luxury_tier?.community_wall) ? source.luxury_tier.community_wall : DEFAULT_CONTENT.luxury_tier.community_wall },
    elite_settings: {
      ...DEFAULT_CONTENT.elite_settings,
      ...(source.elite_settings || {}),
      ai_vision: { ...DEFAULT_CONTENT.elite_settings.ai_vision, ...(source.elite_settings?.ai_vision || {}) },
      marketplaces: { ...DEFAULT_CONTENT.elite_settings.marketplaces, ...(source.elite_settings?.marketplaces || {}) },
      regional_payments: { ...DEFAULT_CONTENT.elite_settings.regional_payments, ...(source.elite_settings?.regional_payments || {}) },
      pwa: { ...DEFAULT_CONTENT.elite_settings.pwa, ...(source.elite_settings?.pwa || {}) },
    },
  }
}

function applyThemeToDocument(theme) {
  if (!theme) return
  const root = document.documentElement.style
  const colors = theme.colors || {}
  const fonts = theme.fonts || {}
  const spacing = theme.spacing || {}
  const dimensions = theme.dimensions || {}

  Object.entries(colors).forEach(([key, value]) => root.setProperty(`--${key.replaceAll('_', '-')}`, String(value)))
  root.setProperty('--border-radius-sm', String(spacing.border_radius_sm || '10px'))
  root.setProperty('--border-radius-md', String(spacing.border_radius || '18px'))
  root.setProperty('--border-radius-lg', String(spacing.border_radius_lg || '28px'))
  root.setProperty('--section-gap', String(spacing.section_gap || '5rem'))
  root.setProperty('--card-gap', String(spacing.card_gap || '1.25rem'))
  root.setProperty('--container-max-width', String(spacing.container_width || '1240px'))
  root.setProperty('--header-max-width', `${dimensions.header_max_width || 1240}px`)
  root.setProperty('--header-height', `${dimensions.header_height || 84}px`)
  root.setProperty('--logo-height', `${dimensions.logo_height || 46}px`)
  root.setProperty('--search-bar-max-width', `${dimensions.search_bar_max_width || 560}px`)
  root.setProperty('--search-bar-height', `${dimensions.search_bar_height || 48}px`)
  root.setProperty('--nav-bar-height', `${dimensions.nav_bar_height || 54}px`)
  root.setProperty('--hero-height', `${dimensions.hero_height || 500}px`)
  root.setProperty('--font-heading', FONT_STACKS[fonts.heading] || FONT_STACKS.Poppins)
  root.setProperty('--font-body', FONT_STACKS[fonts.body] || FONT_STACKS.Inter)
  document.documentElement.dataset.layout = String(theme.layout_style || 'Cedar').toLowerCase()
}

export function ContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadContent = async () => {
    try {
      setLoading(true)
      const bootstrap = typeof window !== 'undefined' && window.__syncContentPromise ? window.__syncContentPromise : getContent()
      const data = await bootstrap
      const baseContent = mergeContent(data)
      setContent(baseContent)
      applyThemeToDocument(baseContent.theme)
      setError(null)
      setLoading(false)

      const enrich = async () => {
        const [eliteSettings, storefrontProfiles, masterSettings, enterpriseSettings, ecosystemSettings, dynamicPages, masterTier, luxurySettings, liveSessions, socialPulse, communityWall] = await Promise.all([
          getEliteSettings().catch(() => null),
          getStorefrontProfiles().catch(() => []),
          getMasterClassSettings().catch(() => null),
          getEnterpriseSettings().catch(() => null),
          getEcosystemSettings().catch(() => null),
          getDynamicPageSettings().catch(() => null),
          getMasterTierSettings().catch(() => null),
          getLuxurySettings().catch(() => null),
          getLiveSessions().catch(() => []),
          getSocialPulse().catch(() => []),
          getCommunityWall().catch(() => []),
        ])
        const nextContent = mergeContent({ ...data, elite_settings: eliteSettings || data?.elite_settings, storefront_brands: storefrontProfiles || data?.storefront_brands, master_settings: masterSettings || data?.master_settings, social_feed_items: masterSettings?.social_feed || data?.social_feed_items, enterprise_settings: enterpriseSettings || data?.enterprise_settings, ecosystem_settings: ecosystemSettings || data?.ecosystem_settings, dynamic_pages: dynamicPages || data?.dynamic_pages, master_tier: masterTier || data?.master_tier, luxury_tier: { ...(luxurySettings || data?.luxury_tier), live_sessions: liveSessions || [], social_pulse: socialPulse || [], community_wall: communityWall || [] } })
        setContent(nextContent)
        applyThemeToDocument(nextContent.theme)
      }
      const scheduleEnrichment = () => enrich().catch(() => {})
      if (typeof window !== 'undefined') window.setTimeout(scheduleEnrichment, 5000)
    } catch (err) {
      console.error('Failed to fetch content:', err)
      setError(err.message)
      applyThemeToDocument(DEFAULT_CONTENT.theme)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContent()
  }, [])

  const value = {
    content,
    loading,
    error,
    theme: content.theme || {},
    refresh: loadContent,
  }

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used inside ContentProvider')
  return ctx
}
