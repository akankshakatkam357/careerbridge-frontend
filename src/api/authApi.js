import { request } from './client';

export function registerUser(userData) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export function loginUser(credentials) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}
