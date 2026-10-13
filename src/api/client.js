// Empty base = same origin (CRA dev proxy / nginx in Docker both forward /api to the backend).
const raw = process.env.REACT_APP_API_BASE_URL || '';
export const API_BASE_URL = raw.replace(/\/+$/, '');

function getAuthHeaders() {
  const token = localStorage.getItem('skillbridge_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function request(path, options = {}) {
  const { headers, ...rest } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/api/auth/')) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    throw new Error(data?.message || 'Request failed. Please try again.');
  }

  return data;
}
