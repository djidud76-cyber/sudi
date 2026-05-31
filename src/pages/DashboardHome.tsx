import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link2, MousePointerClick, Activity, Copy, Check, ArrowRight, Plus, BarChart2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Link as LinkType } from '../types';
import { Button } from '../components/ui/button';
import { StatsSkeleton } from '../components/ui/skeleton';
import { Skeleton } from '../components/ui/skeleton';

export default function DashboardHome() {
  const [stats, setStats] = useState({ totalLinks: 0, totalClicks: 0, activeLinks: 0 });
  const [chartData, setChartData] = useState<{ name: string; clicks: number }[]>([]);
  const [recentLinks, setRecentLinks] = useState<LinkType[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data: links, error: linksError } = await supabase
            .from('links')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (linksError) {
            console.error('Error fetching links:', linksError.message);
            return;
          }

          if (!links || links.length === 0) {
            setStats({ totalLinks: 0, totalClicks: 0, activeLinks: 0 });
            setChartData([]);
            setRecentLinks([]);
            return;
          }

          setRecentLinks(links.slice(0, 5) as LinkType[]);

          const linkIds = links.map(l => l.id);
          let totalClicksCount = 0;
          let grouped: Record<string, number> = {};

          if (linkIds.length > 0) {
            const { count, error: countError } = await supabase
              .from('link_clicks')
              .select('id', { count: 'exact', head: true })
              .in('link_id', linkIds);

            if (countError) {
              console.error('Error counting clicks:', countError.message);
            } else {
              totalClicksCount = count || 0;
            }

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const { data: clicks, error: clicksError } = await supabase
              .from('link_clicks')
              .select('clicked_at')
              .in('link_id', linkIds)
              .gte('clicked_at', sevenDaysAgo.toISOString());

            if (clicksError) {
              console.error('Error fetching clicks:', clicksError.message);
            } else {
              grouped = (clicks || []).reduce((acc: Record<string, number>, click: { clicked_at: string }) => {
                const day = new Date(click.clicked_at).toLocaleDateString('en-US', { weekday: 'short' });
                acc[day] = (acc[day] || 0) + 1;
                return acc;
              }, {});
            }
          }

          setStats({
            totalLinks: links.length,
            totalClicks: totalClicksCount,
            activeLinks: links.filter(l => l.is_active).length,
          });

          setChartData(
            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
              name: day,
              clicks: grouped[day] || 0,
            }))
          );
        } else {
          // No Supabase — show real empty state
          setStats({ totalLinks: 0, totalClicks: 0, activeLinks: 0 });
          setChartData([]);
          setRecentLinks([]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/${code}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <Skeleton className="w-32 h-8" />
          <Skeleton className="w-32 h-10 rounded-lg" />
        </div>
        <StatsSkeleton />
        <Skeleton className="w-full h-80 rounded-2xl" />
        <Skeleton className="w-full h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Overview</h1>
        <Button onClick={() => navigate('/dashboard/links')} className="gap-2">
          <Plus className="w-4 h-4" /> Create link
        </Button>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl"><Link2 className="w-5 h-5 text-black dark:text-white" /></div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Links</p>
          </div>
          <p className="text-3xl font-bold text-black dark:text-white">{stats.totalLinks}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl"><MousePointerClick className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Clicks</p>
          </div>
          <p className="text-3xl font-bold text-black dark:text-white">{stats.totalClicks}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl"><Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Active Links</p>
          </div>
          <p className="text-3xl font-bold text-black dark:text-white">{stats.activeLinks}</p>
        </div>
      </section>

      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Clicks over time (Last 7 Days)</h2>
        </div>
        <div className="h-72">
          {chartData.length > 0 && chartData.some(d => d.clicks > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a1a1aa' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a1a1aa' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }} cursor={{ stroke: '#e4e4e7' }} />
                <Area type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-600">
              <BarChart2 className="w-10 h-10 opacity-30" />
              <p className="text-sm">No click data yet.</p>
              <p className="text-xs text-zinc-300 dark:text-zinc-700">Share your links to start tracking.</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Recent Links</h2>
          {recentLinks.length > 0 && (
            <Link to="/dashboard/links" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        {recentLinks.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Link2 className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">No links yet</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">Create your first link to get started.</p>
            <Button onClick={() => navigate('/dashboard/links')} className="gap-2">
              <Plus className="w-4 h-4" /> Create your first link
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentLinks.map(link => (
              <li key={link.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shrink-0">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${new URL(link.original_url).hostname}&sz=64`}
                      alt=""
                      className="w-4 h-4 rounded-sm"
                      onError={e => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-sm truncate text-zinc-900 dark:text-zinc-100">
                      {window.location.host}/{link.custom_slug || link.short_code}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{link.original_url}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(link.custom_slug || link.short_code, link.id)} className="shrink-0 ml-4">
                  {copiedId === link.id ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
