import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('login flow against the backend response shape', () => {
  afterEach(() => {
    delete global.fetch;
    localStorage.clear();
  });

  function mockLogin(role) {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: 'Login successful',
        data: {
          accessToken: 'jwt-token',
          tokenType: 'Bearer',
          email: 'user@example.com',
          fullName: 'Test User',
          role,
        },
      }),
    });
  }

  async function signIn() {
    render(<App />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Login' })[0]);
    await userEvent.type(screen.getByLabelText('Email address'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret1');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  }

  test('student sees student cards and the token is stored', async () => {
    mockLogin('ROLE_STUDENT');
    await signIn();

    expect(await screen.findByText('Welcome, Test User')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Student profile/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /My applications/ })).toBeInTheDocument();
    expect(localStorage.getItem('skillbridge_token')).toBe('jwt-token');
  });

  test('industry user sees posting tools instead of the student profile', async () => {
    mockLogin('ROLE_INDUSTRY');
    await signIn();

    expect(await screen.findByRole('button', { name: /Post & manage opportunities/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Student profile/ })).not.toBeInTheDocument();
  });

  test('admin role is not offered on the registration form', async () => {
    render(<App />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Register' })[0]);

    expect(screen.queryByRole('option', { name: 'Administrator' })).not.toBeInTheDocument();
  });
});
