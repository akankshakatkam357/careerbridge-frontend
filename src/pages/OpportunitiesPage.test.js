import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OpportunitiesPage from './OpportunitiesPage';

jest.mock('../api/opportunityApi', () => ({
  getOpportunities: jest.fn(),
  applyToOpportunity: jest.fn(),
}));

import { getOpportunities, applyToOpportunity } from '../api/opportunityApi';

describe('OpportunitiesPage', () => {
  beforeEach(() => {
    getOpportunities.mockResolvedValue({
      data: [
        {
          id: 10,
          title: 'Software Engineer',
          companyName: 'Example Ltd',
          location: 'Remote',
          type: 'JOB',
          description: 'Build products.',
          domain: 'Technology',
          matchPercentage: 75,
          requiredSkills: [
            { name: 'Java', requiredProficiency: 4 },
            { name: 'Spring', requiredProficiency: 3 },
          ],
        },
      ],
    });
    applyToOpportunity.mockResolvedValue({ message: 'Application submitted successfully' });
  });

  test('shows skills and applies to an opportunity', async () => {
    render(<OpportunitiesPage onBack={() => {}} />);

    await waitFor(() => expect(getOpportunities).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole('heading', { name: 'Software Engineer' })).toBeInTheDocument();
    expect(screen.getByText('75% match')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Apply now' }));

    await waitFor(() => expect(applyToOpportunity).toHaveBeenCalledWith(10));
    expect(await screen.findByText('Application submitted successfully')).toBeInTheDocument();
  });
});
