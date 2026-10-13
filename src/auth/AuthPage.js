import { useState } from 'react';
import { loginUser, registerUser } from '../api/authApi';
import { useAuth } from './AuthContext';

const initialRegistration = {
  fullName: '',
  email: '',
  password: '',
  role: 'ROLE_STUDENT',
};

const initialLogin = {
  email: '',
  password: '',
};

export default function AuthPage({ mode, onBack, onSwitchMode }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState(mode === 'register' ? initialRegistration : initialLogin);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'register') {
        await registerUser(formData);
        setMessage('Registration successful. You can now sign in.');
        setFormData(initialRegistration);
        return;
      }

      const result = await loginUser(formData);
      const auth = result.data;
      login({
        email: auth.email,
        fullName: auth.fullName,
        role: auth.role,
        token: auth.accessToken,
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLogin = mode === 'login';

  return (
    <main className="auth-page">
      <div className="container py-5">
        <button className="btn btn-link px-0 mb-3" type="button" onClick={onBack}>
          ← Back to home
        </button>

        <div className="auth-card mx-auto">
          <div className="auth-card__header">
            <span className="auth-card__badge">Career Bridge</span>
            <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
            <p>
              {isLogin
                ? 'Sign in to access your profile, opportunities, and applications.'
                : 'Join the platform as a student, industry partner, or academician.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {!isLogin && (
              <div className="mb-3">
                <label htmlFor="fullName" className="form-label">Full name</label>
                <input
                  id="fullName"
                  name="fullName"
                  className="form-control"
                  value={formData.fullName}
                  onChange={updateField}
                  required
                />
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                value={formData.email}
                onChange={updateField}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                value={formData.password}
                onChange={updateField}
                minLength="6"
                required
              />
            </div>

            {!isLogin && (
              <div className="mb-3">
                <label htmlFor="role" className="form-label">Role</label>
                <select
                  id="role"
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={updateField}
                >
                  <option value="ROLE_STUDENT">Student</option>
                  <option value="ROLE_FACULTY">Academician</option>
                  <option value="ROLE_INDUSTRY">Industry</option>
                </select>
              </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <button className="btn btn-primary w-100" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {onSwitchMode && (
            <p className="text-center mt-3 mb-0">
              {isLogin ? 'New here? ' : 'Already registered? '}
              <button className="btn btn-link p-0 align-baseline" type="button" onClick={onSwitchMode}>
                {isLogin ? 'Create an account' : 'Log in instead'}
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
