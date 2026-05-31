import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Globe, Plus, AlertCircle, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/dialog';
import { useToast } from '../components/ui/toast';
import { Skeleton } from '../components/ui/skeleton';
import { Link } from 'react-router-dom';

interface Domain {
  id: string;
  domain: string;
  status: 'pending' | 'active' | 'error';
  created_at: string;
}

export default function Domains() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [domainName, setDomainName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [workspacePlan, setWorkspacePlan] = useState<string>('free');
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: wsData } = await supabase.from('workspaces').select('id, plan').eq('owner_id', user.id).limit(1).single();
        if (!wsData) return;
        setWorkspacePlan(wsData.plan);

        const { data, error } = await supabase
          .from('domains')
          .select('*')
          .eq('workspace_id', wsData.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching domains:', error.message);
          return;
        }

        setDomains(data as Domain[]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainName.trim()) return;
    setIsSaving(true);

    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: wsData } = await supabase.from('workspaces').select('id').eq('owner_id', user.id).limit(1).single();
        if (wsData) {
          const { data, error } = await supabase
            .from('domains')
            .insert({ workspace_id: wsData.id, domain: domainName.trim(), status: 'pending' })
            .select('*')
            .single();

          if (error) {
            showToast(error.message, 'error');
          } else if (data) {
            setDomains([data as Domain, ...domains]);
            setIsOpen(false);
            setDomainName('');
            showToast('Domain added successfully!');
          }
        }
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this custom domain? Links using it will fall back to the default domain.')) return;
    
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('domains').delete().eq('id', id);
      if (error) {
        showToast(error.message, 'error');
        return;
      }
    }
    setDomains(domains.filter(d => d.id !== id));
    showToast('Domain removed.', 'error');
  };

  const simulateVerify = async (id: string) => {
    // Mock DNS verification process
    setDomains(domains.map(d => d.id === id ? { ...d, status: 'active' } : d));
    showToast('DNS Verified! Domain is now active.');
    if (isSupabaseConfigured && supabase) {
      await supabase.from('domains').update({ status: 'active' }).eq('id', id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Plan Gate
  if (workspacePlan === 'free') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Custom Domains</h1>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
            <Globe className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Pro Feature</h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
            Custom domains allow you to brand your links with your own web address. Upgrade to the Pro plan to unlock this feature.
          </p>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Link to="/dashboard/settings">Upgrade to Pro</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {ToastComponent}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Domains</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your custom branded domains.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Domain</Button>
          </DialogTrigger>
          <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
            <DialogHeader>
              <DialogTitle>Add Custom Domain</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Domain Name</Label>
                <Input required value={domainName} onChange={e => setDomainName(e.target.value)} placeholder="link.yourcompany.com" className="dark:bg-zinc-950 dark:border-zinc-800" />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline" className="dark:border-zinc-700 dark:text-zinc-300">Cancel</Button></DialogClose>
                <Button type="submit" disabled={isSaving}>{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Domain'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {domains.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Globe className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">No domains yet</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">Add your first custom domain to start branding your links.</p>
          <Button onClick={() => setIsOpen(true)}>Add your first domain</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {domains.map(d => (
            <div key={d.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                    <Globe className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{d.domain}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {d.status === 'active' ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>
                      ) : d.status === 'pending' ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400"><AlertCircle className="w-3.5 h-3.5" /> Pending DNS</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400"><AlertCircle className="w-3.5 h-3.5" /> Error</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {d.status === 'pending' && (
                    <Button variant="outline" size="sm" onClick={() => simulateVerify(d.id)} className="dark:border-zinc-700 dark:text-zinc-300">
                      Verify DNS
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)} className="text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {d.status === 'pending' && (
                <div className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 p-6">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Please configure your DNS settings</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Add the following CNAME record to your domain registrar's DNS settings.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1"><p className="text-xs text-zinc-500 uppercase tracking-wide">Type</p><div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-sm font-mono text-zinc-700 dark:text-zinc-300">CNAME</div></div>
                    <div className="space-y-1"><p className="text-xs text-zinc-500 uppercase tracking-wide">Name</p><div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-sm font-mono text-zinc-700 dark:text-zinc-300">@</div></div>
                    <div className="space-y-1"><p className="text-xs text-zinc-500 uppercase tracking-wide">Value</p><div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-sm font-mono text-zinc-700 dark:text-zinc-300">cname.sudi.co</div></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
