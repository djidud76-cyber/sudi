import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { FolderOpen, Plus, Trash2, Pencil } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { useToast } from '../components/ui/toast';
import { Skeleton } from '../components/ui/skeleton';

interface Folder {
  id: string;
  name: string;
  links_count?: number;
  created_at: string;
}

export default function Folders() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const [editFolder, setEditFolder] = useState<Folder | null>(null);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: wsData } = await supabase.from('workspaces').select('id').eq('owner_id', user.id).limit(1).single();
        if (!wsData) return;

        const { data: foldersData, error } = await supabase
          .from('folders')
          .select('*, links(count)')
          .eq('workspace_id', wsData.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching folders:', error.message);
          return;
        }

        const formatted = foldersData?.map(f => ({
          ...f,
          links_count: f.links?.[0]?.count || 0
        })) || [];

        setFolders(formatted);
      } else {
        setFolders([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    setIsSaving(true);

    if (isSupabaseConfigured && supabase) {
      if (editFolder) {
        const { error } = await supabase.from('folders').update({ name: folderName.trim() }).eq('id', editFolder.id);
        if (error) {
          showToast(error.message, 'error');
        } else {
          setFolders(folders.map(f => f.id === editFolder.id ? { ...f, name: folderName.trim() } : f));
          setIsOpen(false);
          setEditFolder(null);
          showToast('Folder updated!');
        }
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: wsData } = await supabase.from('workspaces').select('id').eq('owner_id', user.id).limit(1).single();
          if (wsData) {
            const { data, error } = await supabase
              .from('folders')
              .insert({ workspace_id: wsData.id, name: folderName.trim() })
              .select('*, links(count)')
              .single();

            if (error) {
              showToast(error.message, 'error');
            } else if (data) {
              setFolders([{ ...data, links_count: 0 }, ...folders]);
              setIsOpen(false);
              setFolderName('');
              showToast('Folder created!');
            }
          }
        }
      }
    } else {
      showToast('Please configure Supabase.', 'error');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this folder? All links inside will be moved to the root.')) return;
    
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('folders').delete().eq('id', id);
      if (error) {
        showToast(error.message, 'error');
        return;
      }
    }
    setFolders(folders.filter(f => f.id !== id));
    showToast('Folder deleted.', 'error');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {ToastComponent}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Folders</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Organize your links into folders.
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Create Folder</Button>
      </div>

      <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if(!v) { setEditFolder(null); setFolderName(''); } }}>
        <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-zinc-50">{editFolder ? 'Edit Folder' : 'Create Folder'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="dark:text-zinc-300">Folder Name</Label>
              <Input required value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="Marketing Campaigns" className="dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="dark:border-zinc-700 dark:text-zinc-300">Cancel</Button>
              <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Folder'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : folders.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">No folders yet</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">Create your first folder to organize your links.</p>
          <Button onClick={() => setIsOpen(true)}>Create a folder</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {folders.map(folder => (
            <div key={folder.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                  <FolderOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => {
                    setEditFolder(folder);
                    setFolderName(folder.name);
                    setIsOpen(true);
                  }} className="h-8 w-8 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(folder.id)} className="h-8 w-8 text-zinc-400 hover:text-red-600 dark:hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50 mb-1">{folder.name}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{folder.links_count} link{folder.links_count !== 1 ? 's' : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
