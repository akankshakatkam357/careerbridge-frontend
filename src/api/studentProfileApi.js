import { request } from './client';

export function getStudentProfile() {
  return request('/api/student/profile');
}

export function createStudentProfile(profileData) {
  const params = new URLSearchParams(profileData);
  return request(`/api/student/profile?${params.toString()}`, { method: 'POST' });
}

export function getStudentSkills() {
  return request('/api/student/skills');
}

export function addStudentSkill(skillData) {
  const params = new URLSearchParams(skillData);
  return request(`/api/student/skills?${params.toString()}`, { method: 'POST' });
}
