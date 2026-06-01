import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Loader as Loader2, X, Clock, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface LinkData {
  id: string;
  original_url: string;
  password: string | null;
  expires_at: string | null;
  is_active: boolean;
}

const getBrowser = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  return 'Other';
};

const getOS = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('like Mac OS')) return 'iOS';
  return 'Other';
};

const getDevice = (): string => {
  const ua = navigator.userAgent;
  if (/iPad|Android/.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone|iPod/.test(ua)) return 'mobile';
  return 'desktop';
};

export default function Redirect() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [state, setState] = useState<'loading'|'password'|'expired'|'notfound'|'redirecting'>('loading');
  const [link, setLink] = useState<LinkData | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const lookup = async () => {
      if (!shortCode) { setState('notfound'); return; }
      if (!isSupabaseConfigured || !supabase) {
        window.location.href = 'https://dub.co'; return;
      }

      try {
        const { data, error } = await supabase
          .from('links')
          .select('id, original_url, password, expires_at, is_active')
          .or(`short_code.eq.${shortCode},custom_slug.eq.${shortCode}`)
          .single();

        // Handle query errors (e.g., no rows found, multiple rows)
        if (error) {
          setState('notfound');
          return;
        }

        if (!data || !data.is_active) { setState('notfound'); return; }
        if (data.expires_at && new Date(data.expires_at) < new Date()) { setState('expired'); return; }
        
        setLink(data as LinkData);
        
        if (data.password) { setState('password'); return; }
        
        await supabase.from('link_clicks').insert({
          link_id: data.id,
          device: getDevice(),
          browser: getBrowser(),
          os: getOS(),
          referrer: document.referrer || 'Direct',
        });
        
        setState('redirecting');
        setTimeout(() => { window.location.href = data.original_url; }, 500);
      } catch (err) {
        // Catch any unexpected errors and show not found
        console.error('Error in link lookup:', err);
        setState('notfound');
      }
    };
    lookup();
  }, [shortCode]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link) return;
    if (password !== link.password) { setError('Incorrect password. Try again.'); return; }
    if (supabase) {
      await supabase.from('link_clicks').insert({
        link_id: link.id,
        device: getDevice(),
        browser: getBrowser(),
        os: getOS(),
        referrer: document.referrer || 'Direct',
      });
    }
    window.location.href = link.original_url;
  };

  if (state === 'loading' || state === 'redirecting') return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
        <p className="text-zinc-500">{state === 'redirecting' ? 'Redirecting...' : 'Loading...'}</p>
      </div>
    </div>
  );

  if (state === 'notfound') return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Link not found</h1>
        <p className="text-zinc-500 mb-6">This link doesn't exist or has been deactivated.</p>
        <a href="/" className="text-indigo-600 hover:underline font-medium">← Go to Sudi</a>
      </div>
    </div>
  );

  if (state === 'expired') return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Link expired</h1>
        <p className="text-zinc-500 mb-6">This link has reached its expiration date.</p>
        <a href="/" className="text-indigo-600 hover:underline font-medium">← Go to Sudi</a>
      </div>
    </div>
  );

  if (state === 'password') return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-2xl shadow-sm p-8 animate-in zoom-in-95 duration-300">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-amber-500" />
          </div>
          <h1 className="text-xl font-bold">Password protected</h1>
          <p className="text-zinc-500 text-sm mt-1">Enter the password to access this link.</p>
        </div>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">{error}</p>}
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" autoFocus className="text-center tracking-widest" />
          <Button type="submit" className="w-full">Continue →</Button>
        </form>
      </div>
    </div>
  );

  return null;
}
