import { useState } from 'react';
import type { User } from '../types';
import { DarkModeToggle } from './DarkModeToggle';
import { ScreenWrapper } from './ScreenWrapper';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

type View = 'auth' | 'verify' | 'forgot' | 'reset-success';

// ───────────────────────── TEMP STORAGE (demo only) ─────────────────────────
let tempVerificationCode = '';
let tempPendingUser: { email: string; name: string; password: string } | null = null;

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [view, setView] = useState<View>('auth');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // ───────────────────────── AUTH (LOGIN / SIGNUP) ─────────────────────────
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all fields');
      return;
    }

    const users: any[] = JSON.parse(localStorage.getItem('users') || '[]');

    // ─── LOGIN ─────────────────────────
    if (isLogin) {
      const user = users.find(u => u.email === email);

      if (!user) {
        setError('Invalid email or password');
        return;
      }

      localStorage.setItem('user_data', JSON.stringify(user));
      onLogin(user);
      return;
    }

    // ─── SIGNUP (send to verify step) ─────────────────────────
    const existing = users.find(u => u.email === email);
    if (existing) {
      setError('User already exists');
      return;
    }

    // generate verification code
    tempVerificationCode = String(Math.floor(100000 + Math.random() * 900000));

    tempPendingUser = {
      email,
      name,
      password,
    };

    setCode('');
    setView('verify');
  };

  // ───────────────────────── VERIFY EMAIL ─────────────────────────
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code !== tempVerificationCode) {
      setError('Invalid verification code');
      return;
    }

    if (!tempPendingUser) return;

    const users: any[] = JSON.parse(localStorage.getItem('users') || '[]');

    const newUser: User = {
      id: Date.now().toString(),
      email: tempPendingUser.email,
      name: tempPendingUser.name,
      meals: [],
    };

    users.push(newUser);

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('user_data', JSON.stringify(newUser));

    tempPendingUser = null;
    tempVerificationCode = '';

    onLogin(newUser);
  };

  // ───────────────────────── FORGOT PASSWORD ─────────────────────────
  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users: any[] = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === resetEmail);

    if (!user) {
      setError('No account found with that email');
      return;
    }

    setView('reset-success');
  };

  // ───────────────────────── RESET PASSWORD ─────────────────────────
  const handleResetPassword = () => {
    setError('');

    const users: any[] = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = users.findIndex(u => u.email === resetEmail);

    if (idx !== -1) {
      users[idx].password = newPassword;
      localStorage.setItem('users', JSON.stringify(users));
    }

    setView('auth');
    setIsLogin(true);
    setResetEmail('');
    setNewPassword('');
  };

  // ───────────────────────── UI: VERIFY ─────────────────────────
  if (view === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-card p-8 rounded-lg shadow-lg w-full max-w-md border border-border">

          <h2 className="text-center text-foreground mb-2">
            Verify Your Email
          </h2>

          <p className="text-sm text-muted-foreground text-center mb-4">
            Enter the 6-digit code below (demo mode)
          </p>

          <div className="bg-accent/20 p-3 rounded text-center mb-4 font-mono text-xl">
            {tempVerificationCode}
          </div>

          <form onSubmit={handleVerify} className="space-y-3">
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Enter code"
              className="w-full px-3 py-2 border rounded"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button className="w-full bg-primary text-white py-2 rounded">
              Verify & Create Account
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ───────────────────────── UI: FORGOT PASSWORD ─────────────────────────
  if (view === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-card p-8 rounded-lg shadow-lg w-full max-w-md border border-border">

          <h2 className="text-center text-foreground mb-4">
            Forgot Password
          </h2>

          <form onSubmit={handleForgot} className="space-y-3">
            <input
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-3 py-2 border rounded"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button className="w-full bg-primary text-white py-2 rounded">
              Check Account
            </button>
          </form>

          <button
            className="text-sm mt-4 text-primary underline"
            onClick={() => setView('auth')}
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  // ───────────────────────── UI: RESET SUCCESS ─────────────────────────
  if (view === 'reset-success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-card p-8 rounded-lg shadow-lg w-full max-w-md border border-border">

          <h2 className="text-center text-foreground mb-4">
            Reset Password
          </h2>

          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="New password"
            className="w-full px-3 py-2 border rounded mb-3"
          />

          <button
            onClick={handleResetPassword}
            className="w-full bg-primary text-white py-2 rounded"
          >
            Update Password
          </button>
        </div>
      </div>
    );
  }

  // ───────────────────────── UI: AUTH ─────────────────────────
  return (
  <ScreenWrapper>
    <div className="min-h-screen flex items-center justify-center relative">

      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>

      <div className="bg-card p-8 rounded-lg shadow-lg w-full max-w-md border border-border">

        <h1 className="text-center text-foreground mb-1">
          What Do I Want to Eat?
        </h1>

        <p className="text-center text-muted-foreground mb-6">
          Never be indecisive about meals again
        </p>

        <form onSubmit={handleAuth} className="space-y-4">

          {!isLogin && (
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Name"
              className="w-full px-3 py-2 border rounded"
            />
          )}

          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-3 py-2 border rounded"
          />

          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2 border rounded"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button className="w-full bg-primary text-white py-2 rounded">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-4 text-sm">
          {isLogin ? (
            <>
              No account?{' '}
              <button
                onClick={() => setIsLogin(false)}
                className="text-primary underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Have an account?{' '}
              <button
                onClick={() => setIsLogin(true)}
                className="text-primary underline"
              >
                Login
              </button>
            </>
          )}
        </div>

        {isLogin && (
          <button
            onClick={() => setView('forgot')}
            className="text-sm text-primary underline mt-3 w-full"
          >
            Forgot password?
          </button>
        )}
      </div>
    </div>
  </ScreenWrapper>
  );
}