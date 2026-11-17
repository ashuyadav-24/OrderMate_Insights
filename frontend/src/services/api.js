const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('ordermate_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getHostelsConfig: async () => {
    const res = await fetch(`${API_BASE}/auth/hostels`);
    return res.json();
  },

  // Orders
  createOrder: async (orderData) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    return res.json();
  },

  getActiveOrders: async (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/orders/active?${searchParams}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getOrderById: async (id) => {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  updateOrderStatus: async (id, status) => {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  completeOrder: async (id, completionData) => {
    const res = await fetch(`${API_BASE}/orders/${id}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(completionData)
    });
    return res.json();
  },

  getMyOrders: async () => {
    const res = await fetch(`${API_BASE}/orders/user/my-orders`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Requests
  sendJoinRequest: async (orderId, data) => {
    const res = await fetch(`${API_BASE}/requests/${orderId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  respondToRequest: async (requestId, action) => {
    const res = await fetch(`${API_BASE}/requests/${requestId}/respond`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action })
    });
    return res.json();
  },

  withdrawRequest: async (requestId) => {
    const res = await fetch(`${API_BASE}/requests/${requestId}/withdraw`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Chats
  getOrderChat: async (orderId) => {
    const res = await fetch(`${API_BASE}/chats/${orderId}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  sendMessage: async (orderId, content) => {
    const res = await fetch(`${API_BASE}/chats/${orderId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    return res.json();
  },

  // Savings
  getMySavings: async () => {
    const res = await fetch(`${API_BASE}/savings/my-summary`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Analyzer (Source A: Live Application Orders)
  getAnalyzerMetrics: async (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/analyzer/metrics?${searchParams}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Fieldwork CSV (Source B: Assignment data.csv)
  getFieldworkAnalysis: async () => {
    const res = await fetch(`${API_BASE}/csv/fieldwork-analysis`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Recommendations
  getRecommendations: async () => {
    const res = await fetch(`${API_BASE}/recommendations`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  markNotificationAsRead: async (id) => {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  markAllNotificationsRead: async () => {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return res.json();
  }
};
