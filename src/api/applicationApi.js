import { request } from './client';

export function getMyApplications() {
  return request('/api/applications/my-applications');
}

export function getOpportunityApplications(opportunityId) {
  return request(`/api/applications/opportunity/${opportunityId}`);
}

export function updateApplicationStatus(applicationId, status) {
  return request(`/api/applications/${applicationId}/status?status=${encodeURIComponent(status)}`, {
    method: 'PUT',
  });
}
