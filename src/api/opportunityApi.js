import { request } from './client';

export function getOpportunities() {
  return request('/api/opportunities');
}

export function applyToOpportunity(opportunityId, applicationDetails = {}) {
  return request('/api/applications', {
    method: 'POST',
    body: JSON.stringify({
      opportunityId,
      ...applicationDetails,
    }),
  });
}

export function getMyOpportunities() {
  return request('/api/opportunities/mine');
}

export function createOpportunity(opportunity) {
  return request('/api/opportunities', {
    method: 'POST',
    body: JSON.stringify(opportunity),
  });
}
