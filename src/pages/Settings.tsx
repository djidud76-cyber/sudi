import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Loader2, LogOut, Check, Sun, Moon, Monitor, Bell, BellOff, Key, Copy, RefreshCw, Eye, EyeOff, Shield, CreditCard, Sparkles } from 'lucide-react';
import type { Workspace } from '../types';
import { useToast } from '../components/ui/toast';
import { Skeleton } from '../components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../components/ui/dialog';
import { useTheme } from '../contexts/ThemeContext';

// ─── Plan Definitions ───
const PLANS = [
  {
    id: 'free' as const,
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'For individuals just getting started.',
    features: [
      '25 links',
      'Basic analytics (7 days)',
      'QR codes',
      '1 workspace',
      'Community support',
    ],
    limits: { links: 25, domains: 0, analytics_days: 7 },
    color: 'zinc',
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: { monthly: 9, yearly: 7 },
    description: 'For creators and growing businesses.',
    popular: true,
    features: [
      'Unlimited links',
      'Advanced analytics (90 days)',
      'Custom domains',
      'Password protection',
      'Link expiration',
      'Tags & folders',
      'Priority support',
      'API access',
    ],
    limits: { links: Infinity, domains: 5, analytics_days: 90 },
    color: 'indigo',
  },
  {
    id: 'enterprise' as const,
    name: 'Enterprise',
    price: { monthly: 49, yearly: 39 },
    description: 'For large teams with advanced needs.',
    features: [
      'Unlimited everything',
      'Advanced analytics (365 days)',
      'Unlimited custom domains',
      'SSO / SAML',
      'Dedicated support',
      'SLA guarantee',
      'Custom contracts',
      'Audit logs',
      'Team management',
    ],
    limits: { links: Infinity, domains: Infinity, analytics_days: 365 },
    color: 'zinc',
  },
];

export default function Settings() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [wsName, setWsName] = useState('');
  const [wsNameLoading, setWsNameLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Theme
  const { theme, setTheme } = useTheme();

  // Billing
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'enterprise'>('pro');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Notifications
  const [notifClickAlerts, setNotifClickAlerts] = useState(true);
  const [notifWeeklyReport, setNotifWeeklyReport] = useState(true);
  const [notifLinkExpiry, setNotifLinkExpiry] = useState(false);
  const [notifUsageLimit, setNotifUsageLimit] = useState(true);

  // API
  const [apiKey] = useState('sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError.message);
          } else if (profileData) {
            setName(profileData.full_name || '');
            setEmail(profileData.email || '');
          }

          const { data: wsData, error: wsError } = await supabase
            .from('workspaces')
            .select('*')
            .eq('owner_id', user.id)
            .single();

          if (wsError) {
            console.error('Error fetching workspace:', wsError.message);
          } else if (wsData) {
            setWorkspace(wsData);
            setWsName(wsData.name);
          }
        } else {
          setName('Demo User');
          setEmail('demo@sudi.com');
          setWorkspace({
            id: 'demo',
            name: 'My Workspace',
            slug: 'my-workspace',
            type: 'personal',
            owner_id: 'demo',
            plan: 'free',
            links_used: 12,
            created_at: new Date().toISOString(),
          });
          setWsName('My Workspace');
        }
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('profiles').update({ full_name: name }).eq('id', user.id);
        if (error) {
          console.error('Error updating profile:', error.message);
          showToast(error.message, 'error');
        } else {
          showToast('Profile updated successfully!');
        }
      }
    } else {
      showToast('Profile updated successfully!');
    }
    setLoading(false);
  };

  const handleSaveWsName = async () => {
    if (!wsName.trim()) return;
    setWsNameLoading(true);
    if (isSupabaseConfigured && supabase && workspace) {
      const { error } = await supabase.from('workspaces').update({ name: wsName.trim() }).eq('id', workspace.id);
      if (error) {
        console.error('Error updating workspace:', error.message);
        showToast(error.message, 'error');
      } else {
        setWorkspace({ ...workspace, name: wsName.trim() });
        showToast('Workspace name updated!');
      }
    } else {
      if (workspace) setWorkspace({ ...workspace, name: wsName.trim() });
      showToast('Workspace name updated!');
    }
    setWsNameLoading(false);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you absolutely sure? This will permanently delete your account, all your links, and all analytics data. This action CANNOT be undone.'
    );
    if (!confirmed) return;

    const doubleConfirm = window.prompt('Type "DELETE" to confirm:');
    if (doubleConfirm !== 'DELETE') return;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.rpc('delete_user_account');
      if (!error) {
        await supabase.auth.signOut();
        window.location.href = '/';
      } else {
        console.error('Error deleting account:', error.message);
        showToast('Error: ' + error.message, 'error');
      }
    } else {
      showToast('Cannot delete account: Supabase is not configured.', 'error');
    }
  };

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;
    setIsUpgrading(true);

    // Simulate a brief loading state
    await new Promise(r => setTimeout(r, 600));
    
    setIsUpgrading(false);
    setIsUpgradeOpen(false);
    showToast('Subscriptions are currently disabled. Please check back later.', 'error');
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
    showToast('API key copied to clipboard!');
  };

  const currentPlan = PLANS.find(p => p.id === (workspace?.plan || 'free'))!;
  const currentPlanPrice = billingCycle === 'yearly' ? currentPlan.price.yearly : currentPlan.price.monthly;

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-3xl animate-in fade-in duration-500">
        <Skeleton className="w-32 h-8" />
        <Skeleton className="w-full h-64 rounded-2xl" />
        <Skeleton className="w-full h-48 rounded-2xl" />
        <Skeleton className="w-full h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
      {ToastComponent}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Settings</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage your workspace, account, and preferences.</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* PROFILE SECTION */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
              {name?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{name || 'Your Account'}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{email}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950">
          <form onSubmit={handleSave} className="max-w-md space-y-4">
            <div className="space-y-2">
              <Label className="dark:text-zinc-300">Full Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100" />
            </div>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
          </form>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* APPEARANCE SECTION */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-1">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Appearance</h2>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Choose your preferred theme for the interface.</p>
          
          <div className="grid grid-cols-3 gap-4 max-w-lg">
            {/* Light */}
            <button
              onClick={() => setTheme('light')}
              className={`relative group rounded-xl border-2 p-1 transition-all ${
                theme === 'light'
                  ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-900/30'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              {/* Preview */}
              <div className="rounded-lg overflow-hidden bg-white border border-zinc-100 aspect-[4/3]">
                <div className="h-2 bg-zinc-100 flex items-center px-1 gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-red-300" />
                  <div className="w-1 h-1 rounded-full bg-yellow-300" />
                  <div className="w-1 h-1 rounded-full bg-green-300" />
                </div>
                <div className="p-1.5 space-y-1">
                  <div className="h-1 bg-zinc-200 rounded w-3/4" />
                  <div className="h-1 bg-zinc-100 rounded w-full" />
                  <div className="h-1 bg-zinc-100 rounded w-2/3" />
                  <div className="h-2 bg-indigo-100 rounded w-full mt-1" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-2 mb-1">
                <Sun className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Light</span>
              </div>
              {theme === 'light' && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>

            {/* Dark */}
            <button
              onClick={() => setTheme('dark')}
              className={`relative group rounded-xl border-2 p-1 transition-all ${
                theme === 'dark'
                  ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-900/30'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              <div className="rounded-lg overflow-hidden bg-zinc-900 border border-zinc-700 aspect-[4/3]">
                <div className="h-2 bg-zinc-800 flex items-center px-1 gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-red-400" />
                  <div className="w-1 h-1 rounded-full bg-yellow-400" />
                  <div className="w-1 h-1 rounded-full bg-green-400" />
                </div>
                <div className="p-1.5 space-y-1">
                  <div className="h-1 bg-zinc-700 rounded w-3/4" />
                  <div className="h-1 bg-zinc-800 rounded w-full" />
                  <div className="h-1 bg-zinc-800 rounded w-2/3" />
                  <div className="h-2 bg-indigo-900/50 rounded w-full mt-1" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-2 mb-1">
                <Moon className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Dark</span>
              </div>
              {theme === 'dark' && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>

            {/* System */}
            <button
              onClick={() => setTheme('system')}
              className={`relative group rounded-xl border-2 p-1 transition-all ${
                theme === 'system'
                  ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-900/30'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              <div className="rounded-lg overflow-hidden aspect-[4/3] flex">
                {/* Left half - light */}
                <div className="w-1/2 bg-white border-r border-zinc-200">
                  <div className="h-2 bg-zinc-100 flex items-center px-0.5 gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-red-300" />
                  </div>
                  <div className="p-1 space-y-0.5">
                    <div className="h-1 bg-zinc-200 rounded w-full" />
                    <div className="h-1 bg-zinc-100 rounded w-3/4" />
                    <div className="h-1 bg-zinc-100 rounded w-1/2" />
                  </div>
                </div>
                {/* Right half - dark */}
                <div className="w-1/2 bg-zinc-900">
                  <div className="h-2 bg-zinc-800 flex items-center justify-end px-0.5 gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-green-400" />
                  </div>
                  <div className="p-1 space-y-0.5">
                    <div className="h-1 bg-zinc-700 rounded w-full" />
                    <div className="h-1 bg-zinc-800 rounded w-3/4" />
                    <div className="h-1 bg-zinc-800 rounded w-1/2" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-2 mb-1">
                <Monitor className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">System</span>
              </div>
              {theme === 'system' && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* WORKSPACE SECTION */}
      {/* ══════════════════════════════════════════════════════════ */}
      {workspace && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-1 text-zinc-900 dark:text-zinc-50">Workspace</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Manage your workspace details and limits.</p>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveWsName(); }} className="max-w-md space-y-4">
              <div className="space-y-2">
                <Label className="dark:text-zinc-300">Workspace Name</Label>
                <Input value={wsName} onChange={e => setWsName(e.target.value)} placeholder="My Workspace" className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100" />
              </div>
              <Button type="submit" disabled={wsNameLoading}>{wsNameLoading ? 'Saving...' : 'Save Changes'}</Button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* BILLING & PLANS SECTION */}
      {/* ══════════════════════════════════════════════════════════ */}
      {workspace && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-1">
              <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Billing & Plans</h2>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
              You are currently on the <strong className="capitalize text-zinc-900 dark:text-zinc-100">{workspace.plan}</strong> plan
              {currentPlanPrice > 0 && <> · <span className="text-indigo-600 dark:text-indigo-400 font-semibold">${currentPlanPrice}/{billingCycle === 'yearly' ? 'mo' : 'mo'}</span></>}
            </p>

            {/* Billing cycle toggle */}
            <div className="flex mb-6 mt-4">
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full p-1 inline-flex items-center">
                <button onClick={() => setBillingCycle('monthly')} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${billingCycle === 'monthly' ? 'bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>Monthly</button>
                <button onClick={() => setBillingCycle('yearly')} className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${billingCycle === 'yearly' ? 'bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>Yearly <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold px-1 py-0.5 rounded-full">-20%</span></button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((plan) => {
                const isCurrent = workspace.plan === plan.id;
                const price = billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly;
                const isPopular = plan.popular;

                return (
                  <div
                    key={plan.id}
                    className={`relative p-5 rounded-xl border-2 transition-all ${
                      isCurrent
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10'
                        : isPopular
                        ? 'border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-950'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950'
                    }`}
                  >
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-3">
                      {isCurrent && (
                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Current</span>
                      )}
                      {isPopular && !isCurrent && (
                        <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Popular</span>
                      )}
                    </div>

                    <p className="font-bold text-base text-zinc-900 dark:text-zinc-50">{plan.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 mb-3">{plan.description}</p>
                    
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                        {price === 0 ? 'Free' : `$${price}`}
                      </span>
                      {price > 0 && <span className="text-sm text-zinc-500 dark:text-zinc-400">/mo</span>}
                    </div>

                    <ul className="space-y-2 mb-5">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                          <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />{f}
                        </li>
                      ))}
                    </ul>

                    {!isCurrent && (
                      <button
                        onClick={() => { setSelectedPlan(plan.id); setIsUpgradeOpen(true); }}
                        className={`w-full text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                          isPopular
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : plan.id === 'enterprise'
                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {plan.id === 'enterprise' ? 'Contact Sales' : (
                          PLANS.findIndex(p => p.id === plan.id) > PLANS.findIndex(p => p.id === workspace.plan) ? 'Upgrade' : 'Downgrade'
                        )}
                      </button>
                    )}
                    {isCurrent && (
                      <div className="w-full text-center text-sm font-medium px-4 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                        Active Plan
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* NOTIFICATIONS SECTION */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-1">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Notifications</h2>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Configure how and when you receive notifications.</p>

          <div className="space-y-4 max-w-lg">
            {[
              { label: 'Click alerts', desc: 'Get notified when a link reaches milestones (100, 500, 1K clicks)', value: notifClickAlerts, setter: setNotifClickAlerts, icon: Bell },
              { label: 'Weekly report', desc: 'Receive a weekly summary of all your links performance', value: notifWeeklyReport, setter: setNotifWeeklyReport, icon: Bell },
              { label: 'Link expiry reminders', desc: 'Get reminded before a link expires', value: notifLinkExpiry, setter: setNotifLinkExpiry, icon: BellOff },
              { label: 'Usage limit warnings', desc: 'Alert when approaching your plan limits', value: notifUsageLimit, setter: setNotifUsageLimit, icon: Shield },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.label}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => item.setter(!item.value)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ml-4 ${
                    item.value ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      item.value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* API SECTION */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-1">
            <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">API Access</h2>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Use your API key to programmatically manage links and access analytics.</p>

          <div className="max-w-lg space-y-4">
            <div className="space-y-2">
              <Label className="dark:text-zinc-300">API Key</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    value={showApiKey ? apiKey : '•'.repeat(32)}
                    readOnly
                    className="pr-10 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={handleCopyApiKey}
                  className="flex items-center gap-1.5 px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
                >
                  {apiKeyCopied ? <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => showToast('API key regenerated! (Demo mode)', 'error')}
                className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate key
              </button>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Quick Start</p>
              <pre className="text-xs text-zinc-600 dark:text-zinc-400 overflow-x-auto">
                <code>{`curl -X POST https://api.sudi.com/v1/links \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`}</code>
              </pre>
            </div>

            {workspace?.plan === 'free' && (
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">⚡ API access is limited on the Free plan</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Upgrade to Pro for full API access with higher rate limits.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* UPGRADE DIALOG */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Dialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
        <DialogContent className="sm:max-w-md dark:bg-zinc-900 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="dark:text-zinc-50">
              {selectedPlan === 'enterprise' ? 'Contact Sales' : 'Complete Your Upgrade'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {(() => {
              const plan = PLANS.find(p => p.id === selectedPlan)!;
              const price = billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly;
              return (
                <>
                  <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold capitalize text-lg text-zinc-900 dark:text-zinc-50">{plan.name} Plan</span>
                      <span className="font-bold text-lg text-zinc-900 dark:text-zinc-50">
                        {price === 0 ? 'Free' : `$${price}`}
                        {price > 0 && <span className="text-sm text-zinc-500 font-normal">/mo</span>}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">{plan.description}</p>
                    <ul className="space-y-2">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                          <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />{f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <form onSubmit={handleUpgrade} className="space-y-4">
                    {selectedPlan !== 'free' && (
                      <div className="space-y-2">
                        <Label className="dark:text-zinc-300">Card Information (Simulated)</Label>
                        <Input required placeholder="1234 5678 9000 0000" disabled className="dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-500" />
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">This is a mock checkout. No payment is required.</p>
                      </div>
                    )}
                    <DialogFooter className="mt-6">
                      <DialogClose asChild><Button type="button" variant="outline" className="dark:border-zinc-700 dark:text-zinc-300">Cancel</Button></DialogClose>
                      <Button type="submit" disabled={isUpgrading}>
                        {isUpgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                          selectedPlan === 'enterprise' ? 'Request Access' : 'Confirm Upgrade'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* DANGER ZONE */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
            <p className="text-red-500/80 dark:text-red-400/80 text-sm mt-1">Log out or permanently delete your account.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleLogout} className="gap-2 dark:border-zinc-700 dark:text-zinc-300">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
