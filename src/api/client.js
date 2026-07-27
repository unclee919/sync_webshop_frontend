const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  // Fails loud at startup rather than silently hitting the wrong server -
  // easy to miss a missing .env file on a fresh deployment otherwise.
  throw new Error(
    'VITE_API_BASE_URL is not set. Copy .env.example to .env and set it to this ' +
      "deployment's ERPNext server URL."
  )
}

async function callMethod(path, { method = 'GET', params, body, apiKey, apiSecret } = {}) {
  let url = `${API_BASE_URL}/api/method/${path}`

  if (params) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
    )
    if ([...query].length) url += `?${query.toString()}`
  }

  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (apiKey && apiSecret) {
    headers['Authorization'] = `token ${apiKey}:${apiSecret}`
  }

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

  // Frappe wraps whitelisted method return values in { message: ... }
  return data?.message
}

export function getTheme() {
  return callMethod('sync_webshop.api.theme.get_theme')
}

export function getContent() {
  return callMethod('sync_webshop.api.content.get_content')
}

export function getCatalog({ itemGroup, search, page = 1, pageSize = 20 } = {}) {
  return callMethod('sync_webshop.api.catalog.get_catalog', {
    params: { item_group: itemGroup, search, page, page_size: pageSize },
  })
}

export function getItem(itemCode) {
  return callMethod('sync_webshop.api.catalog.get_item', {
    params: { item_code: itemCode },
  })
}

/**
 * Creates a Sales Order. Guest-accessible - no API key, no secret, nothing
 * to rotate. Calls ERPNext's checkout endpoint directly since there's no
 * credential left to protect from the browser.
 */
export function getMyOrders({ email, phone } = {}) {
  return callMethod('sync_webshop.api.orders.list_my_orders', {
    params: { email, phone },
  })
}

export function createOrder({ customer, items, submit = false }) {
  return callMethod('sync_webshop.api.checkout.create_order', {
    method: 'POST',
    body: { customer, items, submit },
  })
}
