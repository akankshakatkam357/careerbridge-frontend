import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('authentication flow', () => {
  test('opens the login page and displays its form', async () => {
    render(<App />);

    const loginButtons = screen.getAllByRole('button', { name: 'Login' });
    await userEvent.click(loginButtons[0]);

    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  test('opens the registration page', async () => {
    render(<App />);

    const registerButtons = screen.getAllByRole('button', { name: 'Register' });
    await userEvent.click(registerButtons[0]);

    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
  });
});
