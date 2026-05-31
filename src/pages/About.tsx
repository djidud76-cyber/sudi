import { Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:underline text-sm font-medium mb-8 inline-block">← Back</button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
            <Info className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">About Sudi</h1>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 mb-12 shadow-sm">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">The Modern Link Infrastructure</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
            Sudi was built to provide an open-source, powerful, and beautifully designed alternative for link management. 
            Inspired by industry leaders like Dub.co, Sudi combines speed, detailed analytics, and advanced features like custom 
            domains and QR codes into a single, cohesive platform.
          </p>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Whether you're an indie hacker, a marketer, or a large enterprise, Sudi provides the tools you need to track 
            your clicks, understand your audience, and boost your conversion rates.
          </p>
        </div>

        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Developer</h2>
        
        <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-1">Lead Developer</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Passionate about building beautiful, high-performance web applications.
            </p>
          </div>
          <a href="https://x.com/Mustfa35429165" target="_blank" rel="noreferrer" className="flex items-center justify-center w-12 h-12 bg-black dark:bg-white rounded-full hover:scale-105 transition-transform">
            <span className="text-white dark:text-black font-bold text-xl">𝕏</span>
          </a>
        </div>

      </div>
    </div>
  );
}
