import { request } from './client';

export async function getMyPortfolio() {
  const response = await request('/api/portfolio/mine');
  return response.data || [];
}
export async function createPortfolioItem(item) {
  const response = await request('/api/portfolio', { method: 'POST', body: JSON.stringify(item) });
  return response.data;
}
export async function updatePortfolioItem(id, item) {
  const response = await request(`/api/portfolio/${id}`, { method: 'PUT', body: JSON.stringify(item) });
  return response.data;
}
export async function deletePortfolioItem(id) {
  return request(`/api/portfolio/${id}`, { method: 'DELETE' });
}
