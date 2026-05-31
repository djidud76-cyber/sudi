import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2, Building2, User } from 'lucide-react';

type WorkspaceType = 'personal' | 'team';

export default function Onboarding() {
  const [step, setStep] = useState<1|2>(1);
  const [wsType, setWsType] = useState<WorkspaceType>('personal');
  const [wsName, setWsName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsName.trim()) { setError('Workspace name is required'); return; }
    setLoading(true);
    setError('');

    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      const { error: wsError } = await supabase.from('workspaces').insert({
        name: wsName.trim(),
        slug: wsName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        type: wsType,
        owner_id: user.id,
      });

      if (wsError) {
        setError(wsError.message);
        setLoading(false);
        return;
      }
    }

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-zinc-200'}`} />
          <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-zinc-200'}`} />
        </div>

        {step === 1 && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm space-y-6">
            <div>
              <h1 className="text-2xl font-bold">What best describes you?</h1>
              <p className="text-zinc-500 text-sm mt-1">This helps us set up your workspace.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setWsType('personal')}
                className={`p-5 border-2 rounded-xl text-left transition-all ${wsType === 'personal' ? 'border-indigo-600 bg-indigo-50' : 'border-zinc-200 hover:border-zinc-300'}`}
              >
                <User className={`w-6 h-6 mb-3 ${wsType === 'personal' ? 'text-indigo-600' : 'text-zinc-500'}`} />
                <p className="font-semibold text-sm">Personal</p>
                <p className="text-zinc-500 text-xs mt-1">For personal projects and side projects</p>
              </button>
              <button
                onClick={() => setWsType('team')}
                className={`p-5 border-2 rounded-xl text-left transition-all ${wsType === 'team' ? 'border-indigo-600 bg-indigo-50' : 'border-zinc-200 hover:border-zinc-300'}`}
              >
                <Building2 className={`w-6 h-6 mb-3 ${wsType === 'team' ? 'text-indigo-600' : 'text-zinc-500'}`} />
                <p className="font-semibold text-sm">Team</p>
                <p className="text-zinc-500 text-xs mt-1">For companies and teams working together</p>
              </button>
            </div>
            <Button className="w-full" onClick={() => setStep(2)}>Continue →</Button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
            <button onClick={() => setStep(1)} className="text-zinc-400 hover:text-zinc-600 text-sm mb-6 flex items-center gap-1">← Back</button>
            <h1 className="text-2xl font-bold mb-1">Name your workspace</h1>
            <p className="text-zinc-500 text-sm mb-6">
              {wsType === 'personal' ? 'This is where your personal links will live.' : 'Your team will collaborate under this workspace.'}
            </p>
            <form onSubmit={handleCreate} className="space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
              <div className="space-y-1.5">
                <Label>Workspace name</Label>
                <Input
                  autoFocus
                  value={wsName}
                  onChange={e => { setWsName(e.target.value); setError(''); }}
                  placeholder={wsType === 'personal' ? 'My Links' : 'Acme Inc.'}
                  required
                />
                {wsName && (
                  <p className="text-xs text-zinc-400">
                    Your workspace URL: <span className="font-mono text-zinc-600">Sudi.app/{wsName.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}</span>
                  </p>
                )}
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create workspace →'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
