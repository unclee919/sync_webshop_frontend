const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function callMethod(path, { method = 'GET', params, body, apiKey, apiSecret } = {}) {
  let url = `${API_BASE_URL}/api/method/${path}`
  if (params) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, typeof value === 'object' ? JSON.stringify(value) : value)
      }
    })
    const queryString = query.toString()
    if (queryString) url += `?${queryString}`
  }
  const headers = { Accept: 'application/json' }
  if (body) headers['Content-Type'] = 'application/json'
  if (apiKey && apiSecret) headers.Authorization = `token ${apiKey}:${apiSecret}`
  const response = await fetch(url, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const message = data?.message || data?.exception || `Request failed (${response.status})`
    throw new Error(message)
  }
  return data?.message
}

export function apiCall(path, body = {}) { return callMethod(path, { method: 'POST', body }) }

export function getTheme() { return callMethod('sync_webshop.api.theme.get_theme') }
export function getContent() { return callMethod('sync_webshop.api.content.get_content') }
export function getEliteSettings() { return callMethod('sync_webshop.api.elite.get_elite_settings') }
export function getStorefrontProfiles() { return callMethod('sync_webshop.api.elite.get_storefront_profiles') }
export function getLoyaltyTiers() { return callMethod('sync_webshop.api.elite.get_loyalty_tiers') }
export function getShopTheLook(itemCode, limit = 6) { return callMethod('sync_webshop.api.elite.get_shop_the_look', { params: { item_code: itemCode, limit } }) }
export function getRegionalPaymentOptions() { return callMethod('sync_webshop.api.elite.get_regional_payment_options') }
export function getMasterClassSettings() { return callMethod('sync_webshop.api.master_class.get_master_class_settings') }
export function getSocialFeed(limit = 12) { return callMethod('sync_webshop.api.master_class.get_social_feed', { params: { limit } }) }
export function getPersonalizedLanding(styleProfile, limit = 8) { return callMethod('sync_webshop.api.master_class.get_personalized_landing', { params: { style_profile: styleProfile, limit } }) }
export function createSubscription({ customerEmail, itemCode, interval }) { return callMethod('sync_webshop.api.master_class.create_subscription', { method: 'POST', body: { customer_email: customerEmail, item_code: itemCode, interval } }) }
export function getCustomerSubscriptions(customerEmail) { return callMethod('sync_webshop.api.master_class.get_customer_subscriptions', { params: { customer_email: customerEmail } }) }
export function prepareCourierWaybill(orderName) { return callMethod('sync_webshop.api.master_class.prepare_courier_waybill', { method: 'POST', body: { order_name: orderName } }) }
export function createRegionalPaymentSession({ gateway, amount, currency, orderReference }) { return callMethod('sync_webshop.api.elite.create_regional_payment_session', { method: 'POST', body: { gateway, amount, currency, order_reference: orderReference } }) }

export function getCatalog({ itemGroup, search, page = 1, pageSize = 20, minPrice, maxPrice, attributes, styleProfile } = {}) {
  return callMethod('sync_webshop.api.catalog.get_catalog', {
    params: { item_group: itemGroup, search, page, page_size: pageSize, min_price: minPrice, max_price: maxPrice, attributes, style_profile: styleProfile },
  })
}
export function getCategories() { return callMethod('sync_webshop.api.catalog.get_categories') }
export function getSearchSuggestions(search) { return callMethod('sync_webshop.api.catalog.get_search_suggestions', { params: { search } }) }
export function getItem(itemCode) { return callMethod('sync_webshop.api.catalog.get_item', { params: { item_code: itemCode } }) }
export function getStock(itemCode) { return callMethod('sync_webshop.api.catalog.get_stock', { params: { item_code: itemCode } }) }
export function getRecommendations({ itemCode, itemGroup, limit = 8 } = {}) {
  return callMethod('sync_webshop.api.catalog.get_recommendations', { params: { item_code: itemCode, item_group: itemGroup, limit } })
}
export function getProductReviews({ itemCode, page = 1, pageSize = 10 }) {
  return callMethod('sync_webshop.api.reviews.get_product_reviews', { params: { item_code: itemCode, page, page_size: pageSize } })
}
export function submitProductReview({ itemCode, rating, reviewTitle, reviewText, displayName, orderName, email, phone }) {
  return callMethod('sync_webshop.api.reviews.submit_review', {
    method: 'POST',
    body: { item_code: itemCode, rating, review_title: reviewTitle, review_text: reviewText, display_name: displayName, order_name: orderName, email, phone },
  })
}


export function getMyOrders({ email, phone } = {}) {
  return callMethod('sync_webshop.api.orders.list_my_orders', { params: { email, phone } })
}
export function getOrderStatus(orderName, { email, phone } = {}) {
  return callMethod('sync_webshop.api.orders.get_order_status', { params: { order_name: orderName, email, phone } })
}
export function getCustomerPortal({ email, phone } = {}) {
  return callMethod('sync_webshop.api.portal.get_customer_portal', { params: { email, phone } })
}
export function getDashboardSettings() { return callMethod('sync_webshop.api.portal.get_dashboard_settings') }
export function updateCustomerProfile({ profile, email, phone }) {
  return callMethod('sync_webshop.api.portal.update_customer_profile', {
    method: 'POST', body: { profile, email, phone },
  })
}
export function saveCustomerAddress({ address, addressName, email, phone }) {
  return callMethod('sync_webshop.api.portal.save_customer_address', {
    method: 'POST', body: { address, address_name: addressName, email, phone },
  })
}
export function deleteCustomerAddress({ addressName, email, phone }) {
  return callMethod('sync_webshop.api.portal.delete_customer_address', {
    method: 'POST', body: { address_name: addressName, email, phone },
  })
}
export function requestReturn({ orderName, itemCode, qty = 1, reason, email, phone }) {
  return callMethod('sync_webshop.api.portal.request_return', {
    method: 'POST',
    body: { order_name: orderName, item_code: itemCode, qty, reason, email, phone },
  })
}
export function getInvoice(invoiceName, { email, phone } = {}) {
  return callMethod('sync_webshop.api.portal.get_invoice', { params: { invoice_name: invoiceName, email, phone } })
}

export function getCheckoutSettings() { return callMethod('sync_webshop.api.checkout.get_checkout_settings') }
export function getTerritories() { return callMethod('sync_webshop.api.checkout.get_territories') }
export function validateCoupon(couponCode, totalAmount) {
  return callMethod('sync_webshop.api.checkout.validate_coupon', { params: { coupon_code: couponCode, total_amount: totalAmount } })
}
export function createOrder({ customer, items, payment_method, stripe_payment_intent, delivery_date, coupon_code, governorate, city, location, second_phone, gift_message, gift_wrap, fulfillment_method, pickup_warehouse, submit = false }) {
  return callMethod('sync_webshop.api.checkout.create_order', {
    method: 'POST', body: { customer, items, payment_method, stripe_payment_intent, delivery_date, coupon_code, governorate, city, location, second_phone, gift_message, gift_wrap, fulfillment_method, pickup_warehouse, submit },
  })
}
export function createPaymentIntent(amount, currency = 'gbp') {
  return callMethod('sync_webshop.api.payment.create_payment_intent', { method: 'POST', body: { amount, currency } })
}
export function getPaymobSettings() { return callMethod('sync_webshop.api.paymob.get_paymob_settings') }
export function createPaymobIntention({ amount, currency = 'EGP', customer, items, salesOrder, deliveryDate }) {
  return callMethod('sync_webshop.api.paymob.create_payment_intention', {
    method: 'POST',
    body: { amount, currency, customer, items, sales_order: salesOrder, delivery_date: deliveryDate },
  })
}

export function getAiChatSettings() { return callMethod('sync_webshop.api.ai_chat.get_ai_chat_settings') }
export function sendAiMessage({ message, history, email }) {
  return callMethod('sync_webshop.api.ai_chat.send_message', {
    method: 'POST', body: { message, history, email },
  })
}

export function getWishlist() { return callMethod('sync_webshop.api.user.get_wishlist') }
export function addToWishlist(itemCode) { return callMethod('sync_webshop.api.user.add_to_wishlist', { method: 'POST', body: { item_code: itemCode } }) }
export function removeFromWishlist(itemCode) { return callMethod('sync_webshop.api.user.remove_from_wishlist', { method: 'POST', body: { item_code: itemCode } }) }

export function searchByImage({ imageData, filename, query } = {}) {
  return callMethod('sync_webshop.api.visual_search.search_by_image', { method: 'POST', body: { image_data: imageData, filename, query } })
}
export function runEliteVisualSearch() { return callMethod('sync_webshop.api.elite.visual_search_match') }
export function syncEliteMarketplaces() { return callMethod('sync_webshop.api.elite.sync_marketplaces', { method: 'POST', body: {} }) }

export function getStyleQuiz() { return callMethod("sync_webshop.api.presence.get_style_quiz") }
export function getPresenceSettings() { return callMethod("sync_webshop.api.presence.get_presence_settings") }
export function requestQuote({ customer, items, note, company }) {
  return callMethod("sync_webshop.api.presence.request_quote", { method: "POST", body: { customer, items, note, company } })
}
