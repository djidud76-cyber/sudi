import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { Home, Link as LinkIcon, BarChart2, QrCode, Settings, LogOut, Menu, X, Globe, FolderOpen, Tag, Zap, Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import type { Profile, Workspace } from '../../types';


const PAGE_NAMES: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/links': 'Links',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/qr-codes': 'QR Codes',
  '/dashboard/settings': 'Settings',
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentPage = PAGE_NAMES[location.pathname] || 'Dashboard';

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      let subscription: { unsubscribe?: () => void } | null = null;
      try {
        if (isSupabaseConfigured && supabase) {
          const client = supabase;
          // Prefer session check which is more reliable during history navigation
          const { data: { session } } = await client.auth.getSession();

          let user = session?.user ?? null;

          // If no session immediately available, wait briefly for auth state change
          if (!user) {
            const waitForAuth = new Promise(resolve => {
              const { data: sub } = client.auth.onAuthStateChange((_, sess) => {
                if (sess?.user) {
                  resolve(sess.user);
                }
              });
              subscription = sub as any;
              // Timeout: if no event within 1000ms, resolve null
              setTimeout(() => resolve(null), 1000);
            });
            // eslint-disable-next-line @typescript-eslint/await-thenable
            const maybeUser: any = await waitForAuth;
            user = maybeUser ?? null;
          }

          if (!user) {
            navigate('/login');
            return;
          }

          const { data: profileData, error: profileError } = await supabase
            .from('profiles').select('*').eq('id', user.id).single();
          if (profileError) console.error('Error fetching profile:', profileError.message);
          else if (profileData) setProfile(profileData);

          const { data: wsData, error: wsError } = await supabase
            .from('workspaces').select('*').eq('owner_id', user.id)
            .order('created_at', { ascending: true }).limit(1).single();

          if (wsError) {
            console.error('Error fetching workspace:', wsError.message);
            navigate('/onboarding');
            return;
          }
          if (wsData) setWorkspace(wsData);
          else { navigate('/onboarding'); return; }
        } else {
          setProfile(null);
          setWorkspace(null);
        }
      } finally {
        if (subscription && typeof subscription.unsubscribe === 'function') subscription.unsubscribe();
        setIsLoading(false);
      }
    };
    init();
  }, [navigate]);

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) await supabase.auth.signOut();
    navigate('/login');
  };

  const PLAN_LIMITS: Record<string, number> = { free: 25, pro: Infinity, enterprise: Infinity };
  const limit = workspace ? (PLAN_LIMITS[workspace.plan] ?? 25) : 25;
  const used = workspace?.links_used || 0;
  const usagePercent = limit === Infinity ? 0 : Math.min((used / limit) * 100, 100);

  const sidebarContent = (
    <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      {/* Workspace display */}
      <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
        <div className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg">
          <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">{workspace?.name?.charAt(0).toUpperCase() || 'W'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{workspace?.name || 'Workspace'}</p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 capitalize">{workspace?.plan || 'free'} plan</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Main */}
        <div>
          <NavLink to="/dashboard" end onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => cn('flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors', isActive ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800')}>
            <Home className="w-4 h-4" /> Overview
          </NavLink>
        </div>

        {/* Short Links section */}
        <div>
          <p className="px-3 text-[11px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-semibold mb-1">Short Links</p>
          {[
            { name: 'Links', href: '/dashboard/links', icon: LinkIcon },
            { name: 'Domains', href: '/dashboard/domains', icon: Globe },
            { name: 'QR Codes', href: '/dashboard/qr-codes', icon: QrCode },
          ].map(item => (
            <NavLink key={item.href} to={item.href} end
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
              )}>
              <item.icon className="w-4 h-4" />
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Insights section */}
        <div>
          <p className="px-3 text-[11px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-semibold mb-1">Insights</p>
          {[
            { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
            { name: 'Events', href: '/dashboard/events', icon: Zap },
          ].map(item => (
            <NavLink key={item.href} to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
              )}>
              <item.icon className="w-4 h-4" />
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Library section */}
        <div>
          <p className="px-3 text-[11px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-semibold mb-1">Library</p>
          {[
            { name: 'Folders', href: '/dashboard/folders', icon: FolderOpen },
            { name: 'Tags', href: '/dashboard/tags', icon: Tag },
          ].map(item => (
            <NavLink key={item.name} to={item.href} end
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
              )}>
              <item.icon className="w-4 h-4" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 p-2 space-y-1">
        {/* Usage meter */}
        {workspace && limit !== Infinity && (
          <div className="px-3 py-2 mb-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Links</span>
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{used} of {limit}</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full transition-all ${usagePercent > 80 ? 'bg-red-500' : 'bg-indigo-600 dark:bg-indigo-500'}`} style={{ width: `${usagePercent}%` }} />
            </div>
            {usagePercent > 80 && <p className="text-xs text-red-500 dark:text-red-400 mt-1">Approaching limit</p>}
            {workspace.plan === 'free' && <Link to="/dashboard/settings" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium mt-1.5 block">Upgrade plan →</Link>}
          </div>
        )}

        <NavLink to="/dashboard/settings" onClick={() => setSidebarOpen(false)}
          className={({ isActive }) => cn('flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors', isActive ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800')}>
          <Settings className="w-4 h-4" /> Settings
        </NavLink>

        <div className="flex items-center gap-2 px-3 pt-2 mt-1 border-t border-zinc-100 dark:border-zinc-800 flex-wrap">
          <Link to="/about" className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">About</Link>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <Link to="/privacy" className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">Privacy</Link>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <Link to="/terms" className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">Terms</Link>
        </div>

        <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2 mt-1 text-sm font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full transition-colors">
          <LogOut className="w-4 h-4" /> Sign out
        </button>

        {/* Profile at bottom */}
        {profile && (
          <div className="flex items-center gap-2.5 px-3 py-2 border-t border-zinc-100 dark:border-zinc-800 mt-1">
            <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-bold text-xs shrink-0 overflow-hidden">
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : (profile.email?.charAt(0).toUpperCase() || 'U')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 truncate">{profile.full_name || profile.email?.split('@')[0] || 'User'}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{profile.email || ''}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-white dark:text-black font-bold text-lg leading-none">d</span>
          </div>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden text-zinc-900 dark:text-zinc-100">
      {/* Desktop Sidebar */}
      <div className="w-56 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hidden md:flex flex-col">
        <div className="h-14 flex items-center px-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <span className="text-white dark:text-black font-bold text-base leading-none">s</span>
            </div>
            <span className="font-bold text-lg tracking-tight">Sudi</span>
          </Link>
        </div>
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50 dark:bg-black/80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-56 bg-white dark:bg-zinc-900 z-50 flex flex-col shadow-xl">
            <div className="h-14 flex items-center px-4 border-b border-zinc-100 dark:border-zinc-800 justify-between shrink-0">
              <span className="font-bold text-lg">Sudi</span>
              <button onClick={() => setSidebarOpen(false)} className="text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center text-sm text-zinc-500 dark:text-zinc-400">
              <span className="font-medium text-black dark:text-zinc-100">{workspace?.name || 'Workspace'}</span>
              <span className="mx-2 text-zinc-300 dark:text-zinc-600">/</span>
              <span className="text-zinc-500 dark:text-zinc-400 capitalize">{currentPage}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full">
              <button onClick={() => setTheme('light')} className={cn('p-1 rounded-full transition-colors', theme === 'light' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black dark:hover:text-white')}><Sun className="w-3.5 h-3.5" /></button>
              <button onClick={() => setTheme('system')} className={cn('p-1 rounded-full transition-colors', theme === 'system' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-black dark:hover:text-white')}><Monitor className="w-3.5 h-3.5" /></button>
              <button onClick={() => setTheme('dark')} className={cn('p-1 rounded-full transition-colors', theme === 'dark' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-black dark:hover:text-white')}><Moon className="w-3.5 h-3.5" /></button>
            </div>
            <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-bold text-xs overflow-hidden">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : (profile?.email?.charAt(0).toUpperCase() || 'U')}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}
