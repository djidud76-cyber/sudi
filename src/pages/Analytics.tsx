import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { MousePointerClick, Link2, BarChart2, Globe, ExternalLink } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { StatsSkeleton, ChartSkeleton } from '../components/ui/skeleton';

export default function Analytics() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [timeData, setTimeData] = useState<{ name: string; clicks: number }[]>([]);
  const [topLinks, setTopLinks] = useState<{ name: string; clicks: number }[]>([]);
  const [devices, setDevices] = useState<{ name: string; value: number; color: string }[]>([]);
  const [countries, setCountries] = useState<{ name: string; value: number }[]>([]);
  const [referrers, setReferrers] = useState<{ name: string; value: number }[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [uniqueLinks, setUniqueLinks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const daysAgo = range === '7d' ? 7 : range === '30d' ? 30 : 90;
        const since = new Date();
        since.setDate(since.getDate() - daysAgo);

        if (isSupabaseConfigured && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data: userLinks, error: linksError } = await supabase
            .from('links')
            .select('id, short_code, title')
            .eq('user_id', user.id);

          if (linksError) {
            console.error('Error fetching links:', linksError.message);
            return;
          }

          const linkIds = userLinks?.map(l => l.id) || [];
          if (!linkIds.length) {
            setTotalClicks(0);
            setUniqueLinks(0);
            setTimeData([]);
            setTopLinks([]);
            setDevices([]);
            setCountries([]);
            setReferrers([]);
            return;
          }

          const { data: clicks, error: clicksError } = await supabase
            .from('link_clicks')
            .select('clicked_at, device, country, referrer, link_id')
            .in('link_id', linkIds)
            .gte('clicked_at', since.toISOString());

          if (clicksError) {
            console.error('Error fetching clicks:', clicksError.message);
            return;
          }

          if (!clicks || clicks.length === 0) {
            setTotalClicks(0);
            setUniqueLinks(0);
            setTimeData([]);
            setTopLinks([]);
            setDevices([]);
            setCountries([]);
            setReferrers([]);
            return;
          }

          setTotalClicks(clicks.length);
          setUniqueLinks(new Set(clicks.map(c => c.link_id)).size);

          // Group by day
          const dayGroups: Record<string, number> = {};
          clicks.forEach(c => {
            const day = new Date(c.clicked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dayGroups[day] = (dayGroups[day] || 0) + 1;
          });
          setTimeData(Object.entries(dayGroups).map(([name, clicks]) => ({ name, clicks })));

          // Top links
          const linkCounts: Record<string, number> = {};
          clicks.forEach(c => { linkCounts[c.link_id] = (linkCounts[c.link_id] || 0) + 1; });
          setTopLinks(
            Object.entries(linkCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([id, count]) => ({
                name: userLinks?.find(l => l.id === id)?.short_code || id.slice(0, 8),
                clicks: count,
              }))
          );

          // Devices
          const deviceCounts: Record<string, number> = {};
          clicks.forEach(c => { deviceCounts[c.device || 'unknown'] = (deviceCounts[c.device || 'unknown'] || 0) + 1; });
          const deviceColors: Record<string, string> = { mobile: '#6366f1', desktop: '#a855f7', tablet: '#eab308', unknown: '#a1a1aa' };
          setDevices(
            Object.entries(deviceCounts).map(([name, value]) => ({
              name,
              value,
              color: deviceColors[name] || '#a1a1aa',
            }))
          );

          // Countries
          const countryCounts: Record<string, number> = {};
          clicks.forEach(c => { countryCounts[c.country || 'Unknown'] = (countryCounts[c.country || 'Unknown'] || 0) + 1; });
          setCountries(
            Object.entries(countryCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([name, value]) => ({ name, value }))
          );

          // Referrers
          const referrerCounts: Record<string, number> = {};
          clicks.forEach(c => { referrerCounts[c.referrer || 'Direct'] = (referrerCounts[c.referrer || 'Direct'] || 0) + 1; });
          setReferrers(
            Object.entries(referrerCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([name, value]) => ({ name, value }))
          );
        } else {
          // No Supabase — show real empty state
          setTotalClicks(0);
          setUniqueLinks(0);
          setTimeData([]);
          setTopLinks([]);
          setDevices([]);
          setCountries([]);
          setReferrers([]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [range]);



  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <StatsSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Analytics</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Detailed insights into your link performance.</p>
        </div>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as '7d' | '30d' | '90d')}
          className="h-10 px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold tracking-tight mb-6 text-zinc-900 dark:text-zinc-50">Clicks Overview</h2>
          <div className="h-80">
            {timeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClicksAnalytics" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a1a1aa' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a1a1aa' }} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }} cursor={{ stroke: '#e4e4e7' }} />
                  <Area type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorClicksAnalytics)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-600">
                <BarChart2 className="w-10 h-10 opacity-30" />
                <p className="text-sm">No data available for this period.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-50 rounded-xl"><MousePointerClick className="w-5 h-5 text-indigo-600" /></div>
              <p className="text-sm font-medium text-zinc-500">Total Clicks</p>
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{totalClicks}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl"><Link2 className="w-5 h-5 text-emerald-600" /></div>
              <p className="text-sm font-medium text-zinc-500">Unique Links</p>
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{uniqueLinks}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold tracking-tight mb-6 text-zinc-900 dark:text-zinc-50">Top Links</h2>
          <div className="h-64">
            {topLinks.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topLinks} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#52525b' }} />
                  <RechartsTooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7' }} />
                  <Bar dataKey="clicks" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-600">
                <Link2 className="w-10 h-10 opacity-30" />
                <p className="text-sm">No link data yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold tracking-tight mb-6 text-zinc-900 dark:text-zinc-50">Devices</h2>
          <div className="h-64 flex items-center">
            {devices.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={devices} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {devices.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 w-1/3">
                  {devices.map(device => (
                    <div key={device.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: device.color }} />
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 capitalize">{device.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full flex flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-600">
                <BarChart2 className="w-10 h-10 opacity-30" />
                <p className="text-sm">No device data yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold tracking-tight mb-6 text-zinc-900 dark:text-zinc-50">Top Countries</h2>
          {countries.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-600 py-8">
              <Globe className="w-10 h-10 opacity-30" />
              <p className="text-sm">No location data yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {countries.map(({ name, value }) => (
                <li key={name} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-24 truncate text-zinc-700 dark:text-zinc-300">{name}</span>
                  <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${(value / (countries[0]?.value || 1)) * 100}%` }} />
                  </div>
                  <span className="text-xs text-zinc-500 w-10 text-right">{value}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold tracking-tight mb-6 text-zinc-900 dark:text-zinc-50">Top Referrers</h2>
          {referrers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-600 py-8">
              <ExternalLink className="w-10 h-10 opacity-30" />
              <p className="text-sm">No referrer data yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {referrers.map(({ name, value }) => (
                <li key={name} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-24 truncate">{name}</span>
                  <div className="flex-1 bg-zinc-100 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(value / (referrers[0]?.value || 1)) * 100}%` }} />
                  </div>
                  <span className="text-xs text-zinc-500 w-10 text-right">{value}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
