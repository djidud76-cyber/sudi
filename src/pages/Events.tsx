import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Zap, Monitor, Globe2, Link as LinkIcon, Search } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

interface Event {
  id: string;
  clicked_at: string;
  country: string | null;
  device: string | null;
  referrer: string | null;
  link: { short_code: string; title: string | null } | null;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch user's links
        const { data: links } = await supabase.from('links').select('id, short_code, title').eq('user_id', user.id);
        if (!links || links.length === 0) {
          setEvents([]);
          return;
        }

        const linkIds = links.map(l => l.id);

        const { data: clicks, error } = await supabase
          .from('link_clicks')
          .select('id, clicked_at, country, device, referrer, link_id')
          .in('link_id', linkIds)
          .order('clicked_at', { ascending: false })
          .limit(100);

        if (error) {
          console.error('Error fetching events:', error.message);
          return;
        }

        const formatted = (clicks || []).map(c => ({
          id: c.id,
          clicked_at: c.clicked_at,
          country: c.country,
          device: c.device,
          referrer: c.referrer,
          link: links.find(l => l.id === c.link_id) || null
        }));

        setEvents(formatted);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter(e => 
    e.link?.short_code.includes(search) || 
    (e.link?.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.country || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Events Log</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time stream of link clicks and interactions. (Last 100 events)
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by link, code or country..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">No events yet</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Share your links to start tracking interactions.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                  <th className="px-6 py-4 font-medium">Link</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Device</th>
                  <th className="px-6 py-4 font-medium">Referrer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredEvents.map(event => (
                  <tr key={event.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-900 dark:text-zinc-300">
                      {new Date(event.clicked_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-zinc-400" />
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {event.link?.title || event.link?.short_code}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                        <Globe2 className="w-4 h-4" />
                        {event.country || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 capitalize">
                        <Monitor className="w-4 h-4" />
                        {event.device || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                      {event.referrer || 'Direct'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
