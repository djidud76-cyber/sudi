import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Tag as TagIcon, Trash2, Pencil, Save, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/toast';
import { Skeleton } from '../components/ui/skeleton';

interface TagData {
  name: string;
  count: number;
}

export default function Tags() {
  const [tags, setTags] = useState<TagData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch all links to aggregate tags
        const { data: links, error } = await supabase.from('links').select('tags').eq('user_id', user.id);
        if (error) {
          console.error('Error fetching tags:', error.message);
          return;
        }

        const tagMap: Record<string, number> = {};
        links?.forEach(link => {
          if (link.tags && Array.isArray(link.tags)) {
            link.tags.forEach((tag: string) => {
              tagMap[tag] = (tagMap[tag] || 0) + 1;
            });
          }
        });

        const formattedTags = Object.entries(tagMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        setTags(formattedTags);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSave = async (oldName: string) => {
    if (!newTagName.trim() || newTagName === oldName) {
      setEditingTag(null);
      return;
    }

    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch links containing the old tag
      const { data: links } = await supabase.from('links').select('id, tags').eq('user_id', user.id).contains('tags', [oldName]);
      
      if (links) {
        // 2. Update each link
        for (const link of links) {
          const updatedTags = link.tags.map((t: string) => t === oldName ? newTagName.trim() : t);
          await supabase.from('links').update({ tags: updatedTags }).eq('id', link.id);
        }
        showToast('Tag updated successfully!');
        fetchTags(); // Refresh
      }
    }
    setEditingTag(null);
  };

  const handleDelete = async (tagName: string) => {
    if (!confirm(`Are you sure you want to delete the tag "${tagName}"? It will be removed from all links.`)) return;

    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: links } = await supabase.from('links').select('id, tags').eq('user_id', user.id).contains('tags', [tagName]);
      
      if (links) {
        for (const link of links) {
          const updatedTags = link.tags.filter((t: string) => t !== tagName);
          await supabase.from('links').update({ tags: updatedTags }).eq('id', link.id);
        }
        showToast('Tag deleted successfully!');
        setTags(tags.filter(t => t.name !== tagName));
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {ToastComponent}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Tags</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage tags used across your links.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : tags.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <TagIcon className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">No tags yet</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Add tags when creating links to organize them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tags.map(tag => (
            <div key={tag.name} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
              {editingTag === tag.name ? (
                <div className="flex flex-col gap-3">
                  <Input 
                    value={newTagName} 
                    onChange={e => setNewTagName(e.target.value)} 
                    className="h-8 dark:bg-zinc-950 dark:border-zinc-800"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEditSave(tag.name)} className="h-8 flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                      <Save className="w-3.5 h-3.5 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingTag(null)} className="h-8 px-2 dark:border-zinc-700">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full justify-between gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md shrink-0">
                        <TagIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 truncate" title={tag.name}>{tag.name}</h3>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingTag(tag.name); setNewTagName(tag.name); }} className="p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(tag.name)} className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 px-3 py-1.5 rounded-lg w-fit">
                    {tag.count} link{tag.count !== 1 ? 's' : ''}
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
