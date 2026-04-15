import { useState } from 'react';

interface ForgotPasswordPageProps {
  onBack: () => void;
}

type Step = 'request' | 'reset' | 'success';

// One-time code stored in module scope (lives for the page session)
let _resetCode = '';
let _resetEmail = '';

export function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const inputCls =
    'w-full px-3 py-2 border border-border rounded-lg focus:outline-none ' +
    'focus:ring-2 focus:ring-ring bg-input-background text-foreground';

  // ── Step 1: request a reset code ─────────────────────────────────────────
  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) { setError('Please enter your email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.'); return;
    }

    // Generate a 6-digit code (in production this would be emailed)
    const code6 = String(Math.floor(100000 + Math.random() * 900000));
    _resetCode  = code6;
    _resetEmail = trimmed;
    setGeneratedCode(code6);
    setStep('reset');
  };

  // ── Step 2: verify code and set new password ──────────────────────────────
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) { setError('Please enter the verification code.'); return; }
    if (code.trim() !== _resetCode) { setError('Invalid code. Please try again.'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }

    // Update password in localStorage
    const usersRaw = localStorage.getItem('users');
    const users: { email: string; password?: string }[] = usersRaw
      ? JSON.parse(usersRaw)
      : [];
    const idx = users.findIndex(u => u.email === _resetEmail);
    if (idx !== -1) {
      users[idx].password = newPassword;
      localStorage.setItem('users', JSON.stringify(users));
    }

    _resetCode  = '';
    _resetEmail = '';
    setStep('success');
  };

  const handleResend = () => {
    setStep('request');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setGeneratedCode('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card p-8 rounded-lg shadow-lg w-full max-w-md border border-border">

        <h2 className="text-foreground text-2xl font-bold mb-1 text-center">
          {step === 'success' ? '✅ Password Reset' : 'Forgot Password'}
        </h2>

        {/* ── Step 1 ── */}
        {step === 'request' && (
          <form onSubmit={handleRequestReset} className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Enter the email associated with your account and we'll send you a reset code.
            </p>

            <div>
              <label className="block text-sm text-foreground mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputCls}
                placeholder="your@email.com"
              />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Send Reset Code
            </button>

            <p className="text-sm text-center text-muted-foreground">
              <button type="button" onClick={onBack} className="text-primary underline">
                ← Back to Login
              </button>
            </p>
          </form>
        )}

        {/* ── Step 2 ── */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              A reset code has been sent to{' '}
              <span className="text-foreground font-semibold">{email}</span>.
            </p>

            {/* Demo notice – remove when you have a real email service */}
            {generatedCode && (
              <div className="bg-accent/30 border border-border rounded-lg p-3 text-sm">
                <p className="text-muted-foreground font-medium mb-1">
                  📬 Demo mode — your code is:
                </p>
                <p className="text-foreground font-mono text-2xl font-bold tracking-widest text-center">
                  {generatedCode}
                </p>
                <p className="text-muted-foreground text-xs mt-1 text-center">
                  (In production this would be emailed to you)
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm text-foreground mb-1">Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className={inputCls}
                placeholder="6-digit code"
                maxLength={6}
                inputMode="numeric"
              />
            </div>

            <div>
              <label className="block text-sm text-foreground mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className={inputCls}
                placeholder="Min 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm text-foreground mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={inputCls}
                placeholder="Re-enter new password"
              />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Reset Password
            </button>

            <p className="text-sm text-center text-muted-foreground">
              Didn't get a code?{' '}
              <button type="button" onClick={handleResend} className="text-primary underline">
                Try again
              </button>
            </p>
          </form>
        )}

        {/* ── Step 3 ── */}
        {step === 'success' && (
          <div className="space-y-4 mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Your password has been reset. You can now log in with your new password.
            </p>
            <button
              onClick={onBack}
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
