import { useState, useEffect } from 'react';
import { Copy, Check, Plus, Link as LinkIcon, Trash2, Power, MousePointerClick, Search, Pencil } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Link as LinkType } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/dialog';
import { LinksSkeleton } from '../components/ui/skeleton';
import { useToast } from '../components/ui/toast';

interface LinkWithClicks extends LinkType {
  link_clicks: { count: number }[];
}

export default function LinksPage() {
  const [links, setLinks] = useState<LinkWithClicks[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);

  // Search and filter
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterFolder, setFilterFolder] = useState<string>('all');

  // Create modal
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    original_url: '',
    custom_slug: '',
    title: '',
    password: '',
    expires_at: '',
    tags: '',
    folder_id: '',
  });

  // Edit modal
  const [editLink, setEditLink] = useState<LinkWithClicks | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    original_url: '',
    custom_slug: '',
    title: '',
    password: '',
    expires_at: '',
    tags: '',
    folder_id: '',
  });

  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('links')
          .select('*, link_clicks(count)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching links:', error.message);
          setLinks([]);
          return;
        }

        setLinks((data || []) as LinkWithClicks[]);

        // Fetch folders
        const { data: wsData } = await supabase.from('workspaces').select('id').eq('owner_id', user.id).limit(1).single();
        if (wsData) {
          const { data: foldersData } = await supabase.from('folders').select('id, name').eq('workspace_id', wsData.id).order('name');
          if (foldersData) setFolders(foldersData);
        }
      } else {
        setLinks([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (code: string, id: string) => {
    const url = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this link? This cannot be undone.')) return;
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('links').delete().eq('id', id);
      if (error) {
        console.error('Error deleting link:', error.message);
        showToast('Failed to delete link.', 'error');
        return;
      }
    }
    setLinks(links.filter(l => l.id !== id));
    showToast('Link deleted.', 'error');
  };

  const handleToggle = async (link: LinkWithClicks) => {
    const newActive = !link.is_active;
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('links').update({ is_active: newActive }).eq('id', link.id);
      if (error) {
        console.error('Error toggling link:', error.message);
        showToast('Failed to update link.', 'error');
        return;
      }
    }
    setLinks(links.map(l => (l.id === link.id ? { ...l, is_active: newActive } : l)));
    showToast(newActive ? 'Link activated.' : 'Link deactivated.');
  };

  const validateUrl = (url: string): boolean => {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.original_url.trim()) {
      showToast('Please enter a destination URL', 'error');
      return;
    }

    if (!validateUrl(formData.original_url)) {
      showToast('Please enter a valid URL starting with http:// or https://', 'error');
      return;
    }

    if (formData.custom_slug && (formData.custom_slug.length < 2 || formData.custom_slug.length > 50)) {
      showToast('Custom slug must be between 2 and 50 characters', 'error');
      return;
    }

    if (formData.custom_slug && !/^[a-z0-9-]+$/i.test(formData.custom_slug)) {
      showToast('Custom slug can only contain letters, numbers, and hyphens', 'error');
      return;
    }

    setLoading(true);

    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast('Please sign in to create links', 'error');
        setLoading(false);
        return;
      }

      const { data: wsData } = await supabase.from('workspaces').select('id, plan, links_used').eq('owner_id', user.id).limit(1).single();

      if (wsData && wsData.plan === 'free' && wsData.links_used >= 25) {
        showToast('Free plan limit reached (25 links). Upgrade to Pro.', 'error');
        setLoading(false);
        return;
      }

      const short_code = Math.random().toString(36).substring(2, 8);
      const payload = {
        user_id: user.id,
        workspace_id: wsData ? wsData.id : null,
        original_url: formData.original_url.trim(),
        short_code,
        custom_slug: formData.custom_slug?.trim() || null,
        title: formData.title?.trim() || null,
        password: formData.password || null,
        expires_at: formData.expires_at || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        folder_id: formData.folder_id || null,
        is_active: true,
      };

      const { data, error } = await supabase.from('links').insert([payload]).select('*, link_clicks(count)').single();
      if (error) {
        console.error('Error creating link:', error.message);
        if (error.code === '23505') {
          showToast('This custom slug is already taken', 'error');
        } else {
          showToast(error.message || 'Failed to create link', 'error');
        }
      } else if (data) {
        setLinks([data as LinkWithClicks, ...links]);
        setIsOpen(false);
        setFormData({ original_url: '', custom_slug: '', title: '', password: '', expires_at: '', tags: '', folder_id: '' });
        showToast('Link created successfully!');
      }
    } else {
      showToast('Supabase is not configured', 'error');
    }
    setLoading(false);
  };

  const openEdit = (link: LinkWithClicks) => {
    setEditLink(link);
    setEditFormData({
      original_url: link.original_url,
      custom_slug: link.custom_slug || '',
      title: link.title || '',
      password: link.password || '',
      expires_at: link.expires_at || '',
      tags: link.tags ? link.tags.join(', ') : '',
      folder_id: (link as any).folder_id || '',
    });
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLink) return;

    if (!editFormData.original_url.trim()) {
      showToast('Please enter a destination URL', 'error');
      return;
    }

    if (!validateUrl(editFormData.original_url)) {
      showToast('Please enter a valid URL starting with http:// or https://', 'error');
      return;
    }

    if (editFormData.custom_slug && (editFormData.custom_slug.length < 2 || editFormData.custom_slug.length > 50)) {
      showToast('Custom slug must be between 2 and 50 characters', 'error');
      return;
    }

    if (editFormData.custom_slug && !/^[a-z0-9-]+$/i.test(editFormData.custom_slug)) {
      showToast('Custom slug can only contain letters, numbers, and hyphens', 'error');
      return;
    }

    setEditLoading(true);

    if (isSupabaseConfigured && supabase) {
      const payload = {
        original_url: editFormData.original_url.trim(),
        custom_slug: editFormData.custom_slug?.trim() || null,
        title: editFormData.title?.trim() || null,
        password: editFormData.password || null,
        expires_at: editFormData.expires_at || null,
        tags: editFormData.tags ? editFormData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        folder_id: editFormData.folder_id || null,
      };

      const { error } = await supabase.from('links').update(payload).eq('id', editLink.id);
      if (error) {
        console.error('Error updating link:', error.message);
        if (error.code === '23505') {
          showToast('This custom slug is already taken', 'error');
        } else {
          showToast(error.message || 'Failed to update link', 'error');
        }
      } else {
        setLinks(links.map(l => (l.id === editLink.id ? { ...l, ...payload } as LinkWithClicks : l)));
        setIsEditOpen(false);
        setEditLink(null);
        showToast('Link updated successfully!');
      }
    } else {
      showToast('Please configure Supabase to edit links.', 'error');
    }
    setEditLoading(false);
  };

  const filteredLinks = links.filter(link => {
    const matchSearch =
      !search ||
      link.short_code.toLowerCase().includes(search.toLowerCase()) ||
      (link.custom_slug || '').toLowerCase().includes(search.toLowerCase()) ||
      link.original_url.toLowerCase().includes(search.toLowerCase()) ||
      (link.title || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && link.is_active) ||
      (filterStatus === 'inactive' && !link.is_active);
    const matchFolder = filterFolder === 'all' || (link as any).folder_id === filterFolder;
    return matchSearch && matchStatus && matchFolder;
  });

  const linkFormFields = (data: typeof formData, setData: typeof setFormData) => (
    <>
      <div className="space-y-2">
        <Label className="dark:text-zinc-300">Destination URL</Label>
        <Input required value={data.original_url} onChange={e => setData({ ...data, original_url: e.target.value })} placeholder="https://example.com/very-long-url" className="dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="dark:text-zinc-300">Custom Slug (Optional)</Label>
          <Input value={data.custom_slug} onChange={e => setData({ ...data, custom_slug: e.target.value })} placeholder="my-campaign" className="dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100" />
        </div>
        <div className="space-y-2">
          <Label className="dark:text-zinc-300">Title (Optional)</Label>
          <Input value={data.title} onChange={e => setData({ ...data, title: e.target.value })} placeholder="Campaign Name" className="dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="dark:text-zinc-300">Password Protection (Optional)</Label>
        <Input type="password" value={data.password} onChange={e => setData({ ...data, password: e.target.value })} placeholder="Leave blank for public" className="dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100" />
      </div>
      <div className="space-y-2">
        <Label className="dark:text-zinc-300">Expiration Date (Optional)</Label>
        <Input type="datetime-local" value={data.expires_at} onChange={e => setData({ ...data, expires_at: e.target.value })} className="dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="dark:text-zinc-300">Tags (comma-separated, optional)</Label>
          <Input value={data.tags} onChange={e => setData({ ...data, tags: e.target.value })} placeholder="marketing, social, q4" className="dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100" />
        </div>
        <div className="space-y-2">
          <Label className="dark:text-zinc-300">Folder (Optional)</Label>
          <select
            value={data.folder_id}
            onChange={e => setData({ ...data, folder_id: e.target.value })}
            className="w-full border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm px-3 py-2 bg-white dark:bg-zinc-950 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">No Folder</option>
            {folders.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {ToastComponent}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold dark:text-zinc-50">Links</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{links.length} link{links.length !== 1 ? 's' : ''}</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Create link</Button>
          </DialogTrigger>
          <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800">
            <DialogHeader><DialogTitle className="dark:text-zinc-50">Create a new link</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              {linkFormFields(formData, setFormData as any)}
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline" className="dark:border-zinc-700 dark:text-zinc-300">Cancel</Button></DialogClose>
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create Link'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800">
          <DialogHeader><DialogTitle className="dark:text-zinc-50">Edit link</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-4">
            {linkFormFields(editFormData, setEditFormData as any)}
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" className="dark:border-zinc-700 dark:text-zinc-300">Cancel</Button></DialogClose>
              <Button type="submit" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save Changes'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Search + Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by short link or URL..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>
        <select
          value={filterFolder}
          onChange={e => setFilterFolder(e.target.value)}
          className="border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm px-3 py-2 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-600 dark:text-zinc-300 max-w-[150px] truncate"
        >
          <option value="all">All Folders</option>
          {folders.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
          className="border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm px-3 py-2 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-600 dark:text-zinc-300"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Links list */}
      {isLoading ? (
        <LinksSkeleton />
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          {filteredLinks.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                <LinkIcon className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold dark:text-zinc-100">{search || filterStatus !== 'all' ? 'No links match your filters' : 'No links yet'}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">{search || filterStatus !== 'all' ? 'Try adjusting your search or filter.' : 'Create your first link to get started.'}</p>
              {!search && filterStatus === 'all' && (
                <Button onClick={() => setIsOpen(true)}>Create your first link</Button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredLinks.map(link => {
                const isExpiringSoon = link.expires_at && new Date(link.expires_at).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 && new Date(link.expires_at).getTime() > Date.now();
                const clickCount = link.link_clicks?.[0]?.count ?? 0;

                return (
                  <li key={link.id} className="p-4 sm:p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between group gap-4">
                    <div className="flex items-center gap-4 truncate">
                      <div className="hidden sm:flex w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 items-center justify-center border border-zinc-200 dark:border-zinc-700 shrink-0">
                        <img src={`https://www.google.com/s2/favicons?domain=${new URL(link.original_url).hostname}&sz=64`} alt="" className="w-5 h-5 rounded-sm" onError={e => (e.currentTarget.style.display = 'none')} />
                      </div>
                      <div className="truncate flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <a href={`/${link.custom_slug || link.short_code}`} target="_blank" rel="noreferrer" className="font-semibold text-black dark:text-zinc-100 hover:underline">
                            {window.location.host}/{link.custom_slug || link.short_code}
                          </a>
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm ${link.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                            {link.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {isExpiringSoon && <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm">Expires soon</span>}
                        </div>
                        <div className="text-sm text-zinc-500 truncate flex items-center gap-2 mt-1">
                          {link.title && <span className="font-medium text-zinc-700">{link.title} — </span>}
                          <span className="truncate">{link.original_url}</span>
                          {link.tags && link.tags.length > 0 && (
                            <div className="items-center gap-1 ml-2 hidden md:flex">
                              {link.tags.map(tag => (
                                <span key={tag} className="bg-zinc-100 text-zinc-600 text-[10px] px-1.5 py-0.5 rounded-sm">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end w-full sm:w-auto">
                      <span className="flex items-center gap-1 bg-zinc-100 text-zinc-600 text-xs font-medium px-2.5 py-1 rounded-full">
                        <MousePointerClick className="w-3.5 h-3.5" />
                        {clickCount} clicks
                      </span>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={() => handleCopy(link.custom_slug || link.short_code, link.id)}>
                          {copiedId === link.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(link)}>
                          <Pencil className="w-4 h-4 text-zinc-400" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleToggle(link)} title={link.is_active ? 'Deactivate' : 'Activate'}>
                          <Power className={`w-4 h-4 ${link.is_active ? 'text-zinc-400' : 'text-amber-500'}`} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(link.id)} className="text-zinc-400 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
