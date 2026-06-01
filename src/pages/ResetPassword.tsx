import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setError('Supabase is not configured.');
        setLoading(false);
        return;
      }

      const callbackUrl = window.location.href;
      const hasAuthParams = callbackUrl.includes('access_token') || callbackUrl.includes('refresh_token') || callbackUrl.includes('type=') || callbackUrl.includes('token=');

      if (hasAuthParams) {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }
        if (data?.session) {
          setSessionActive(true);
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      setSessionActive(Boolean(session));
      setLoading(false);
    };

    initialize();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured.');
      setSubmitting(false);
      return;
    }

    if (!password) {
      setError('Please enter a new password.');
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm text-center">
          <Loader2 className="mx-auto w-6 h-6 text-zinc-500 animate-spin" />
          <p className="text-zinc-500 mt-4">Checking your recovery session...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm text-center">
          <CheckCircle className="mx-auto w-12 h-12 text-emerald-500" />
          <h2 className="text-2xl font-bold">Password updated</h2>
          <p className="text-zinc-500 mt-2 text-sm">Your password has been updated successfully.</p>
          <div className="mt-6">
            <Button asChild>
              <Link to="/login">Return to sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center">
          <Link to="/" className="mx-auto w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6 cursor-pointer inline-flex hover:scale-105 transition-transform">
            <span className="text-white font-bold text-2xl leading-none tracking-tighter">d</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Set a new password</h2>
          <p className="text-zinc-500 mt-2 text-sm">Create a new password to complete password recovery.</p>
        </div>

        <div className="bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm">
          {error && (
            <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm">
              {error}
            </div>
          )}

          {!sessionActive ? (
            <div className="space-y-4 text-center">
              <AlertTriangle className="mx-auto w-12 h-12 text-amber-500" />
              <p className="text-zinc-500">We could not detect an active recovery session. Please request a new reset link.</p>
              <div className="mt-4">
                <Button asChild>
                  <Link to="/forgot-password">Request reset link</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                />
                <p className="text-xs text-zinc-500">Must be at least 8 characters long.</p>
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update password'}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-zinc-500 mt-4">
            <Link to="/login" className="font-medium text-black hover:underline">← Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
