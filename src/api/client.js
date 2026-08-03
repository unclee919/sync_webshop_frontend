const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function callMethod(path, { method = 'GET', params, body, apiKey, apiSecret } = {}) {
  let url = `${API_BASE_URL}/api/method/${path}`
  
  if (params) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, value)
      }
    })
    const queryString = query.toString()
    if (queryString) url += `?${queryString}`
  }

  const headers = {
    'Accept': 'application/json',
  }
  
  if (body) {
    headers['Content-Type'] = 'application/json'
  }
  
  if (apiKey && apiSecret) {
    headers['Authorization'] = `token ${apiKey}:${apiSecret}`
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const message = data?.message || data?.exception || `Request failed (${response.status})`
      throw new Error(message)
    }

    return data?.message
  } catch (error) {
    console.error(`API Error (${path}):`, error)
    throw error
  }
}

export function getTheme() {
  return callMethod('sync_webshop.api.theme.get_theme')
}

export function getContent() {
  return callMethod('sync_webshop.api.content.get_content')
}

export function getCatalog({ itemGroup, search, page = 1, pageSize = 20, minPrice, maxPrice } = {}) {
  return callMethod('sync_webshop.api.catalog.get_catalog', {
    params: { item_group: itemGroup, search, page, page_size: pageSize, min_price: minPrice, max_price: maxPrice },
  })
}

export function getCategories() {
  return callMethod('sync_webshop.api.catalog.get_categories')
}

export function getSearchSuggestions(search) {
  return callMethod('sync_webshop.api.catalog.get_search_suggestions', {
    params: { search },
  })
}

export function getItem(itemCode) {
  return callMethod('sync_webshop.api.catalog.get_item', {
    params: { item_code: itemCode },
  })
}

export function getMyOrders({ email, phone } = {}) {
  return callMethod('sync_webshop.api.orders.list_my_orders', {
    params: { email, phone },
  })
}

export function getOrderStatus(orderName, { email, phone } = {}) {
  return callMethod('sync_webshop.api.orders.get_order_status', {
    params: { order_name: orderName, email, phone },
  })
}

export function getCheckoutSettings() {
  return callMethod('sync_webshop.api.checkout.get_checkout_settings')
}

export function createOrder({ customer, items, payment_method, stripe_payment_intent, delivery_date, submit = false }) {
  return callMethod('sync_webshop.api.checkout.create_order', {
    method: 'POST',
    body: { customer, items, payment_method, stripe_payment_intent, delivery_date, submit },
  })
}

export function createPaymentIntent(amount, currency = 'gbp') {
  return callMethod('sync_webshop.api.payment.create_payment_intent', {
    method: 'POST',
    body: { amount, currency },
  })
}
