import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AuthCallback() {
  const [status, setStatus] = useState('Completing authentication...');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      if (!supabase) {
        setError('Supabase is not configured.');
        return;
      }

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setError(error.message);
        setStatus('Authentication callback failed.');
        return;
      }

      if (data?.session) {
        setStatus('Authentication successful. Redirecting to dashboard...');
        setTimeout(() => navigate('/dashboard'), 1200);
        return;
      }

      setStatus('Unable to restore session. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1800);
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md space-y-6 bg-white border border-zinc-200 rounded-3xl p-10 shadow-sm text-center">
        {error ? (
          <div className="space-y-4">
            <AlertTriangle className="mx-auto w-12 h-12 text-red-500" />
            <h1 className="text-2xl font-bold">Authentication Failed</h1>
            <p className="text-zinc-500">{error}</p>
            <div className="flex justify-center gap-3">
              <Button asChild>
                <Link to="/login">Return to sign in</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <CheckCircle className="mx-auto w-12 h-12 text-emerald-500" />
            <h1 className="text-2xl font-bold">Authentication in progress</h1>
            <p className="text-zinc-500">{status}</p>
            <div className="flex justify-center">
              <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
