import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudentProfilePage from './StudentProfilePage';

jest.mock('../api/studentProfileApi', () => ({
  getStudentProfile: jest.fn(),
  getStudentSkills: jest.fn(),
  createStudentProfile: jest.fn(),
  addStudentSkill: jest.fn(),
}));

import {
  createStudentProfile,
  getStudentProfile,
  getStudentSkills,
} from '../api/studentProfileApi';

describe('StudentProfilePage', () => {
  beforeEach(() => {
    getStudentProfile.mockRejectedValue(new Error('Student profile not found'));
    getStudentSkills.mockResolvedValue({ data: [] });
    createStudentProfile.mockResolvedValue({
      data: { id: 1, studentId: 1, department: 'Computer Science', program: 'B.Tech' },
      message: 'Student profile created',
    });
  });

  test('creates a student profile', async () => {
    render(<StudentProfilePage onBack={() => {}} />);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Create your profile' })).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText('Department'), 'Computer Science');
    await userEvent.type(screen.getByLabelText('Program'), 'B.Tech');
    await userEvent.click(screen.getByRole('button', { name: 'Create profile' }));

    await waitFor(() => expect(createStudentProfile).toHaveBeenCalledWith({
      department: 'Computer Science',
      program: 'B.Tech',
    }));
    expect(screen.getByRole('button', { name: 'Create profile' })).toBeInTheDocument();
  });
});
