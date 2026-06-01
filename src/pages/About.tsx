import { Info, Zap, Shield, BarChart3, Twitter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:underline text-sm font-medium mb-8 inline-block group">
          ← Back
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 rounded-xl flex items-center justify-center border border-blue-200 dark:border-blue-800">
            <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">About Sudi</h1>
          <a href="https://x.com/Mustfa35429165" target="_blank" rel="noopener noreferrer" className="ml-4 inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white">
            <Twitter className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
            <span className="text-sm font-medium">Follow on X</span>
          </a>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 mb-12 shadow-sm">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">The Modern Link Management Platform</h2>
          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
            Sudi is a premium link management platform built for modern marketing teams and creators. We combine powerful features, stunning design, and intuitive user experience to help you track, analyze, and optimize every link you share.
          </p>
          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Whether you're an indie hacker, a growing startup, or an established enterprise, Sudi provides the tools you need to understand your audience, track conversions, and accelerate your growth.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Core Features</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Lightning Fast</h3>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Create, manage, and deploy short links instantly with our optimized platform.</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Real-time Analytics</h3>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Track clicks, locations, devices, and referrers in beautiful, actionable dashboards.</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Enterprise Security</h3>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Password protection, expiration dates, and custom domains for complete control.</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50">QR Codes</h3>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Auto-generate customizable QR codes for every link you create.</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-3">Built with Excellence</h2>
          <p className="text-indigo-800 dark:text-indigo-200 mb-4">
            Sudi is crafted with attention to detail, modern technologies, and a commitment to providing the best user experience. Every feature is designed to help you succeed in your marketing and growth efforts.
          </p>
          <p className="text-sm text-indigo-700 dark:text-indigo-300">
            © 2026 Sudi. All rights reserved. Built to help you turn clicks into revenue.
          </p>
        </div>
      </div>
    </div>
  );
}
