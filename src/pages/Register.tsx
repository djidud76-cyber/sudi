import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'github'|'google'|null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      setTimeout(() => navigate('/onboarding'), 800);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    if (!isSupabaseConfigured || !supabase) {
      navigate('/onboarding');
      return;
    }
    setOauthLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) { setError(error.message); setOauthLoading(null); }
  };

    if (success) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 text-zinc-900 dark:text-zinc-50">
          <div className="w-full max-w-sm text-center space-y-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">Check your email</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            We sent a confirmation link to <strong className="text-zinc-900 dark:text-zinc-100">{email}</strong>. Click it to activate your account.
          </p>
          <Link to="/login" className="block text-sm text-indigo-600 hover:underline font-medium">← Back to sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* Left panel — visible on large screens */}
      <div className="hidden lg:flex w-1/2 bg-black text-white flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-lg leading-none">d</span>
          </div>
          <span className="font-bold text-xl">Sudi</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold leading-snug mb-4">
            Shorten links.<br />Track every click.<br />Grow faster.
          </h2>
          <ul className="space-y-3 text-zinc-400 text-sm">
            {[
              'Create short links with custom slugs',
              'Real-time click analytics',
              'QR codes for every link',
              'Password protection & expiry dates',
            ].map(f => (
              <li key={f} className="flex items-center gap-2">
                <span className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-zinc-600 text-xs">© 2026 Sudi</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center lg:hidden">
            <Link to="/" className="mx-auto w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center mb-4 inline-flex hover:scale-105 transition-transform">
              <span className="text-white dark:text-black font-bold text-2xl leading-none">s</span>
            </Link>
          </div>
          <div className="lg:text-left text-center">
            <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">Free to start. No credit card required.</p>
          </div>

          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuth('github')}
              disabled={!!oauthLoading}
              className="flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {oauthLoading === 'github' ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              )}
              GitHub
            </button>
            <button
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading}
              className="flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {oauthLoading === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Google
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-200 dark:border-zinc-800" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-zinc-50 dark:bg-zinc-950 px-2 text-zinc-400 dark:text-zinc-500">or with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
            {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/50">{error}</div>}
            
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Alex Johnson" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@company.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password" type={showPass ? 'text' : 'password'} required
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min 8 characters" minLength={8}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create account'}
            </Button>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
              By creating an account, you agree to our <a href="#" className="underline hover:text-zinc-600 dark:hover:text-zinc-300">Terms</a> and <a href="#" className="underline hover:text-zinc-600 dark:hover:text-zinc-300">Privacy Policy</a>.
            </p>
          </form>

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="text-black dark:text-white font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
