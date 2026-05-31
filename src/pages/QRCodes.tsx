import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../components/ui/button';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { QrCode, Copy, Check, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Link as LinkType } from '../types';
import { LinksSkeleton } from '../components/ui/skeleton';
import { useToast } from '../components/ui/toast';

function QRCard({ link, showToast }: { link: LinkType; showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fgColor, setFgColor] = useState('#000000');
  const [copied, setCopied] = useState(false);
  const shortUrl = `${window.location.origin}/${link.custom_slug || link.short_code}`;

  const downloadSVG = () => {
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${link.short_code}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('SVG downloaded!');
  };

  const downloadPNG = () => {
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const scale = 4;
    canvas.width = 160 * scale;
    canvas.height = 160 * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(scale, scale);

    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 160, 160);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const a = document.createElement('a');
      a.download = `qr-${link.short_code}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      showToast('PNG downloaded!');
    };
    img.src = url;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    showToast('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4 w-full">
        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
          <img src={`https://www.google.com/s2/favicons?domain=${new URL(link.original_url).hostname}&sz=64`} alt="" className="w-4 h-4 rounded-sm" onError={e => (e.currentTarget.style.display = 'none')} />
        </div>
        <div className="truncate w-full">
          <p className="font-semibold text-sm truncate dark:text-zinc-50">{link.title || link.short_code}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{link.original_url}</p>
        </div>
      </div>
      <div ref={containerRef} className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl mb-4 border border-zinc-100 dark:border-zinc-800">
        <QRCodeSVG value={shortUrl} size={160} fgColor={fgColor} bgColor="transparent" level="H" />
      </div>
      <div className="flex items-center gap-2 mb-4 w-full">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Color:</label>
        <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0" />
      </div>
      <div className="flex gap-2 w-full">
        <Button variant="outline" size="sm" className="flex-1 gap-1 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800" onClick={downloadSVG}>
          <Download className="w-4 h-4" /> SVG
        </Button>
        <Button variant="outline" size="sm" className="flex-1 gap-1 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800" onClick={downloadPNG}>
          <Download className="w-4 h-4" /> PNG
        </Button>
        <Button variant="outline" size="sm" className="flex-1 gap-1 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800" onClick={handleCopy}>
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  );
}

export default function QRCodes() {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    const fetchLinks = async () => {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          const { data, error } = await supabase.from('links').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
          if (error) {
            console.error('Error fetching links:', error.message);
            setLinks([]);
            return;
          }
          setLinks((data || []) as LinkType[]);
        } else {
          setLinks([]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchLinks();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {ToastComponent}
      <h1 className="text-2xl font-bold tracking-tight">QR Codes</h1>
      {isLoading ? (
        <LinksSkeleton />
      ) : links.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
            <QrCode className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold">No links yet</h3>
          <p className="text-zinc-500 text-sm mb-6">Create a link first to generate QR codes.</p>
          <Button asChild><Link to="/dashboard/links">Go to Links</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map(link => (
            <QRCard key={link.id} link={link} showToast={showToast} />
          ))}
        </div>
      )}
    </div>
  );
}
