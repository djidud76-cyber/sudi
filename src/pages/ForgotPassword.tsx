import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 
    setError('');
    
    if (!isSupabaseConfigured || !supabase) {
      setTimeout(() => { setSent(true); setLoading(false); }, 800); 
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center">
          <Link to="/" className="mx-auto w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6 cursor-pointer inline-flex hover:scale-105 transition-transform">
            <span className="text-white font-bold text-2xl leading-none tracking-tighter">d</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Reset your password</h2>
          <p className="text-zinc-500 mt-2 text-sm">Enter your email and we'll send you a reset link.</p>
        </div>
        
        {sent ? (
          <div className="bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="font-semibold text-lg">Check your email</p>
            <p className="text-zinc-500 text-sm">We sent a password reset link to <strong className="text-zinc-900">{email}</strong></p>
            <div className="pt-2">
              <Link to="/login" className="text-indigo-600 hover:underline text-sm font-medium">← Back to sign in</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm">
            {error && <p className="text-red-500 text-sm font-medium bg-red-50 py-2 px-3 rounded-lg border border-red-100">{error}</p>}
            <div className="space-y-2">
              <Label>Email address</Label>
              <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send reset link'}
            </Button>
          </form>
        )}
        
        <p className="text-center text-sm text-zinc-500">
          <Link to="/login" className="text-black font-medium hover:underline">← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
