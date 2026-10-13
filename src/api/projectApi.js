import { request } from './client';

export function getProjects() { return request('/api/projects'); }
export function getMyProjects() { return request('/api/projects/mine'); }
export function createProject(project) { return request('/api/projects', { method: 'POST', body: JSON.stringify(project) }); }
export function updateProject(id, project) { return request(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(project) }); }
export function deleteProject(id) { return request(`/api/projects/${id}`, { method: 'DELETE' }); }
