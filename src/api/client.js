import axios from 'axios'

const API_BASE_URL = window.location.origin

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

let cachedToken = null;

export async function getToken() {
  if (cachedToken) return cachedToken;
  try {
    const response = await axios.get(API_BASE_URL + '/api/method/sync_webshop.api.utils.get_token', { withCredentials: true });
    cachedToken = response.data.message;
    return cachedToken;
  } catch (e) {
    return null;
  }
}

export async function callMethod(method, { params = {}, body = {}, method: httpMethod = 'GET', credentials = true } = {}) {
  try {
    const config = {
      url: '/api/method/' + method,
      method: httpMethod,
      params: httpMethod === 'GET' ? { ...params, ...body } : params,
      data: httpMethod !== 'GET' ? body : undefined,
      withCredentials: credentials,
    };

    if (httpMethod !== 'GET') {
      const token = await getToken();
      if (token) {
        config.headers = { ...config.headers, 'X-Frappe-CSRF-Token': token };
      }
    }

    const response = await client(config);
    return response.data.message;
  } catch (error) {
    // If we get a 400/403 on a POST request, maybe the token expired
    if ((error.response?.status === 400 || error.response?.status === 403) && httpMethod !== 'GET') {
      cachedToken = null;
      const token = await getToken();
      if (token) {
        const retryConfig = {
          url: '/api/method/' + method,
          method: httpMethod,
          params: httpMethod === 'GET' ? { ...params, ...body } : params,
          data: httpMethod !== 'GET' ? body : undefined,
          withCredentials: credentials,
          headers: { 'X-Frappe-CSRF-Token': token }
        };
        const retryResponse = await client(retryConfig);
        return retryResponse.data.message;
      }
    }
    const message = error.response?.data?.message || error.response?.data?.exception || error.message;
    throw new Error(message);
  }
}

// Catalog & Products
export const getProducts = (params) => callMethod('sync_webshop.api.catalog.get_catalog', { body: params, method: 'POST' });
export const getCatalog = (params) => callMethod('sync_webshop.api.catalog.get_catalog', { body: params, method: 'POST' });
export const getProduct = (itemCode) => callMethod('sync_webshop.api.catalog.get_item', { params: { item_code: itemCode } });
export const getItem = (itemCode) => callMethod('sync_webshop.api.catalog.get_item', { params: { item_code: itemCode } });
export const getCategories = () => callMethod('sync_webshop.api.catalog.get_categories');
export const getSearchSuggestions = (search) => callMethod('sync_webshop.api.catalog.get_search_suggestions', { params: { search } });
export const getRecommendations = (params) => callMethod('sync_webshop.api.catalog.get_recommendations', { params });
export const getFlashSaleItems = () => callMethod('sync_webshop.api.catalog.get_flash_sale_items');
export const getPredictiveSearch = (q) => callMethod('sync_webshop.api.catalog.get_predictive_search', { params: { q } });
export const searchByImage = (image) => callMethod('sync_webshop.api.catalog.search_by_image', { body: { image }, method: 'POST' });

// Checkout & Orders
export const getCheckoutSettings = () => callMethod('sync_webshop.api.checkout.get_checkout_settings');
export const getTerritories = () => callMethod('sync_webshop.api.checkout.get_territories');
export const validateCoupon = (couponCode, totalAmount) => callMethod('sync_webshop.api.checkout.validate_coupon', { params: { coupon_code: couponCode, total_amount: totalAmount } });
// We use credentials for order creation to support logged-in users, but now with a proper CSRF token.
export const createOrder = (data) => callMethod('sync_webshop.api.checkout.create_order', { body: data, method: 'POST' });
export const getOrderStatus = (orderId) => callMethod('sync_webshop.api.checkout.get_order_status', { params: { order_id: orderId } });
export const bulkQuickOrder = (items) => callMethod('sync_webshop.api.checkout.bulk_quick_order', { body: { items }, method: 'POST' });
export const requestQuote = (data) => callMethod('sync_webshop.api.checkout.request_quote', { body: data, method: 'POST' });

// Payment
export const createPaymobIntention = (data) => callMethod('sync_webshop.api.paymob.create_paymob_intention', { body: data, method: 'POST' });
export const redeemGiftCard = (code) => callMethod('sync_webshop.api.payment.redeem_gift_card', { body: { code }, method: 'POST' });

// Content & Pages
export const getContent = () => callMethod('sync_webshop.api.content.get_content');
export const getAboutPage = () => callMethod('sync_webshop.api.dynamic_pages.get_about_page');
export const getPolicyPage = () => callMethod('sync_webshop.api.dynamic_pages.get_policy_page');
export const getArticles = () => callMethod('sync_webshop.api.dynamic_pages.get_articles');
export const getArticle = (name) => callMethod('sync_webshop.api.dynamic_pages.get_article', { params: { name } });
export const getQaItems = () => callMethod('sync_webshop.api.dynamic_pages.get_qa_items');
export const getBranches = () => callMethod('sync_webshop.api.dynamic_pages.get_branches');

// AI & Interactions
export const getAiChatSettings = () => callMethod('sync_webshop.api.ai_chat.get_ai_chat_settings');
export const getAiChatResponse = (message, history) => callMethod('sync_webshop.api.ai_chat.get_ai_chat_response', { body: { message, history }, method: 'POST' });
export const sendAiMessage = (message, history) => callMethod('sync_webshop.api.ai_chat.get_ai_chat_response', { body: { message, history }, method: 'POST' });
export const sendVoiceAction = (audio) => callMethod('sync_webshop.api.ai_chat.send_voice_action', { body: { audio }, method: 'POST' });
export const ragSupportQuery = (q) => callMethod('sync_webshop.api.ai_chat.rag_support_query', { params: { q } });

// Elite & Tiers
export const getStorefrontProfiles = () => callMethod('sync_webshop.api.elite.get_storefront_profiles');
export const getEliteSettings = () => callMethod('sync_webshop.api.elite.get_elite_settings');
export const getMasterClassSettings = () => callMethod('sync_webshop.api.master_class.get_master_class_settings');
export const getDynamicPageSettings = () => callMethod('sync_webshop.api.dynamic_pages.get_dynamic_page_settings');
export const getEnterpriseSettings = () => callMethod('sync_webshop.api.enterprise.get_enterprise_settings');
export const getEcosystemSettings = () => callMethod('sync_webshop.api.ecosystem.get_ecosystem_settings');
export const getMasterTierSettings = () => callMethod('sync_webshop.api.master_tier.get_master_tier_settings');
export const getLuxurySettings = () => callMethod('sync_webshop.api.luxury_tier.get_luxury_settings');
export const getLiveSessions = () => callMethod('sync_webshop.api.luxury_tier.get_live_sessions');
export const getSocialPulse = () => callMethod('sync_webshop.api.luxury_tier.get_social_pulse');
export const getCommunityWall = () => callMethod('sync_webshop.api.luxury_tier.get_community_wall');
export const getLiveShopping = () => callMethod('sync_webshop.api.luxury_tier.get_live_shopping');
export const getLookbookHotspots = () => callMethod('sync_webshop.api.luxury_tier.get_lookbook_hotspots');
export const getShopTheLook = () => callMethod('sync_webshop.api.luxury_tier.get_shop_the_look');
export const getStyleQuiz = () => callMethod('sync_webshop.api.luxury_tier.get_style_quiz');

// Reviews
export const submitReview = (data) => callMethod('sync_webshop.api.reviews.submit_review', { body: data, method: 'POST' });
export const submitProductReview = (data) => callMethod('sync_webshop.api.reviews.submit_review', { body: data, method: 'POST' });
export const getReviews = (itemCode) => callMethod('sync_webshop.api.reviews.get_reviews', { params: { item_code: itemCode } });
export const getProductReviews = (itemCode) => callMethod('sync_webshop.api.reviews.get_reviews', { params: { item_code: itemCode } });

// Portal & Customer
export const login = (email, password) => callMethod('sync_webshop.api.portal.login', { body: { email, password }, method: 'POST' });
export const signup = (data) => callMethod('sync_webshop.api.portal.signup', { body: data, method: 'POST' });
export const getCustomerPortal = () => callMethod('sync_webshop.api.portal.get_customer_portal');
export const getDashboardSettings = () => callMethod('sync_webshop.api.portal.get_dashboard_settings');
export const updateCustomerProfile = (data) => callMethod('sync_webshop.api.portal.update_profile', { body: data, method: 'POST' });
export const saveCustomerAddress = (data) => callMethod('sync_webshop.api.portal.save_address', { body: data, method: 'POST' });
export const deleteCustomerAddress = (name) => callMethod('sync_webshop.api.portal.delete_address', { body: { name }, method: 'POST' });
export const getInvoice = (name) => callMethod('sync_webshop.api.portal.get_invoice', { params: { name } });
export const requestReturn = (data) => callMethod('sync_webshop.api.portal.request_return', { body: data, method: 'POST' });
export const getLoyaltySnapshot = () => callMethod('sync_webshop.api.portal.get_loyalty_snapshot');
export const redeemLoyaltyPoints = (points) => callMethod('sync_webshop.api.portal.redeem_loyalty_points', { body: { points }, method: 'POST' });
export const getReferralHub = () => callMethod('sync_webshop.api.portal.get_referral_hub');
export const claimReferralCode = (code) => callMethod('sync_webshop.api.portal.claim_referral_code', { body: { code }, method: 'POST' });
export const createSubscription = (data) => callMethod('sync_webshop.api.portal.create_subscription', { body: data, method: 'POST' });

// SEO
export const getProductSeo = (itemCode) => callMethod('sync_webshop.api.seo.get_product_seo', { params: { item_code: itemCode } });

// Generic
export const apiCall = (method, data) => callMethod(method, { body: data, method: 'POST' });