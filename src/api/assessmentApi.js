import { request } from './client';

export function getAssessmentQuestions(skill) {
  return request(`/api/assessments/questions?skill=${encodeURIComponent(skill)}`);
}

export function submitAssessment(skill, answers) {
  return request('/api/assessments/submit', {
    method: 'POST',
    body: JSON.stringify({ skill, answers }),
  });
}

export function getMyAssessmentResults() {
  return request('/api/assessments/my-results');
}
