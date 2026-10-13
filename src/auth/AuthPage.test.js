import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthPage from './AuthPage';
import { AuthProvider } from './AuthContext';

describe('AuthPage', () => {
  test('submits login credentials', async () => {
    render(
      <AuthProvider>
        <AuthPage mode="login" onBack={() => {}} />
      </AuthProvider>,
    );

    await userEvent.type(screen.getByLabelText('Email address'), 'student@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByRole('button', { name: 'Please wait...' })).toBeDisabled();
  });
});
