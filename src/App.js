import { useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import AuthPage from './auth/AuthPage';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

function AppContent() {
  const { user, logout } = useAuth();
  const [authMode, setAuthMode] = useState(null);

  if (user) {
    return <Dashboard onLogout={logout} />;
  }

  if (authMode) {
    return <AuthPage
        key={authMode}
        mode={authMode}
        onBack={() => setAuthMode(null)}
        onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
      />;
  }

  return <Home onLogin={() => setAuthMode('login')} onRegister={() => setAuthMode('register')} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
