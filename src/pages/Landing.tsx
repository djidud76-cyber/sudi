import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Link2, BarChart3, ArrowRight, Settings2, Check, Menu, X, Play, Loader2, Copy, Sun, Moon, Monitor } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

const miniChartData = [
  { name: 'Mon', v: 12 }, { name: 'Tue', v: 18 }, { name: 'Wed', v: 15 },
  { name: 'Thu', v: 25 }, { name: 'Fri', v: 30 }, { name: 'Sat', v: 28 }, { name: 'Sun', v: 35 },
];

const footerLinks = {
  Product: [
    { name: 'Short Links', path: '#' },
    { name: 'Analytics', path: '#' },
    { name: 'QR Codes', path: '#' },
    { name: 'Pricing', path: '#pricing' }
  ],
  Resources: [
    { name: 'Docs', path: '#' },
    { name: 'API', path: '#' },
    { name: 'Status', path: '#' },
    { name: 'Changelog', path: '#' }
  ],
  Company: [
    { name: 'About', path: '/about' },
    { name: 'Blog', path: '#' },
    { name: 'Careers', path: '#' },
    { name: 'GitHub', path: '#' }
  ],
  Legal: [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Cookie Policy', path: '#' }
  ],
};

export default function Landing() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [yearly, setYearly] = useState(false);
  const { theme, setTheme } = useTheme();

  const heroAnim = useScrollAnimation();
  const linksAnim = useScrollAnimation();
  const analyticsAnim = useScrollAnimation();
  const qrAnim = useScrollAnimation();
  const howAnim = useScrollAnimation();
  const pricingAnim = useScrollAnimation();
  const ctaAnim = useScrollAnimation();
  const demoAnim = useScrollAnimation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const anim = (a: { visible: boolean }) =>
    `transition-all duration-700 ${a.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 relative">
      {/* Global Fixed Parallax 3D Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center [perspective:1000px]">
        <div 
          className="absolute bottom-[-50%] w-[400%] h-[200%] opacity-30 dark:opacity-15"
          style={{
            backgroundImage: `
              linear-gradient(to right, #6366f1 1.5px, transparent 1.5px),
              linear-gradient(to bottom, #6366f1 1.5px, transparent 1.5px)
            `,
            backgroundSize: '80px 80px',
            transform: `rotateX(65deg) translateY(${scrollY * 0.6}px) translateZ(-200px)`,
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
          }}
        />
      </div>

      {/* ── NAVBAR ── */}
      <header className={`fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 transition-shadow ${scrolled ? 'shadow-sm dark:shadow-zinc-900/50' : ''}`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center"><span className="text-white dark:text-black font-bold text-lg leading-none tracking-tighter">s</span></div>
            <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">Sudi</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a href="#features" className="hover:text-black dark:hover:text-white transition-colors">Features</a>
            <a href="#analytics" className="hover:text-black dark:hover:text-white transition-colors">Analytics</a>
            <a href="#qrcodes" className="hover:text-black dark:hover:text-white transition-colors">QR Codes</a>
            <a href="#pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</a>
            <Link to="/about" className="hover:text-black dark:hover:text-white transition-colors">About</Link>
          </nav>
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full">
              <button onClick={() => setTheme('light')} className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}><Sun className="w-3.5 h-3.5" /></button>
              <button onClick={() => setTheme('system')} className={`p-1.5 rounded-full transition-colors ${theme === 'system' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}><Monitor className="w-3.5 h-3.5" /></button>
              <button onClick={() => setTheme('dark')} className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}><Moon className="w-3.5 h-3.5" /></button>
            </div>
            <Link to="/login" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">Log in</Link>
            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-full transition-colors">Get Started <span className="ml-1">→</span></Link>
          </div>
          <button className="md:hidden text-zinc-600 dark:text-zinc-400" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 px-4 py-4 space-y-3 relative z-10">
            <a href="#features" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white" onClick={() => setMobileMenu(false)}>Features</a>
            <a href="#analytics" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white" onClick={() => setMobileMenu(false)}>Analytics</a>
            <a href="#qrcodes" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white" onClick={() => setMobileMenu(false)}>QR Codes</a>
            <a href="#pricing" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white" onClick={() => setMobileMenu(false)}>Pricing</a>
            <Link to="/about" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white" onClick={() => setMobileMenu(false)}>About</Link>
            {/* Mobile Theme Toggle */}
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full w-fit">
              <button onClick={() => setTheme('light')} className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? 'bg-white text-black shadow-sm' : 'text-zinc-500'}`}><Sun className="w-3.5 h-3.5" /></button>
              <button onClick={() => setTheme('system')} className={`p-1.5 rounded-full transition-colors ${theme === 'system' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' : 'text-zinc-500'}`}><Monitor className="w-3.5 h-3.5" /></button>
              <button onClick={() => setTheme('dark')} className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500'}`}><Moon className="w-3.5 h-3.5" /></button>
            </div>
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <Link to="/login" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">Log in</Link>
              <Link to="/register" className="block bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-full text-center">Get Started →</Link>
            </div>
          </div>
        )}
      </header>

      <main className="pt-16 relative z-10">
        {/* ── HERO ── */}
        <section ref={heroAnim.ref} className={`relative px-4 py-20 md:py-32 text-center mx-auto min-h-[90vh] flex flex-col justify-center ${anim(heroAnim)} overflow-hidden`}>
          <div className="relative z-20 max-w-5xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8">✦ The modern link attribution platform</span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] text-zinc-900 dark:text-zinc-50">
            Turn clicks into<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient">revenue</span>
          </h1>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 mb-10 max-w-2xl mx-auto">The open-source link management infrastructure for modern marketing teams and creators.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-colors inline-flex items-center gap-2">Start for free <ArrowRight className="w-5 h-5" /></Link>
            <button className="border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-6 py-4 rounded-full text-lg font-medium transition-colors inline-flex items-center gap-2"><Play className="w-5 h-5" /> View demo</button>
          </div>

          {/* Mock Dashboard Card */}
          <div className="max-w-2xl mx-auto mt-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl dark:shadow-zinc-900/50 overflow-hidden relative">
            <div className="h-10 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-700 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-2">app.Sudi.com/dashboard</span>
            </div>
            {[
              { name: 'dub.sh/github', url: 'https://github.com/dubinc/dub', clicks: '2.4K', color: 'bg-zinc-900 dark:bg-zinc-100' },
              { name: 'dub.sh/launch', url: 'https://launch.Sudi.com/2026', clicks: '1.8K', color: 'bg-indigo-600' },
              { name: 'dub.sh/blog', url: 'https://blog.Sudi.com/ann...', clicks: '956', color: 'bg-purple-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-zinc-50 dark:border-zinc-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${item.color} rounded-full`} />
                  <div className="text-left">
                    <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{item.name}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate max-w-[200px]">{item.url}</p>
                  </div>
                </div>
                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium px-2.5 py-1 rounded-full">{item.clicks} clicks</span>
              </div>
            ))}
            <div className="absolute -bottom-4 -right-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg dark:shadow-zinc-900/50 p-3 flex items-center gap-2">
              <span className="text-emerald-500 font-bold text-sm">↑ 23%</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">this week</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-4">* Showing example data</p>
          </div>
        </section>

        {/* ── FEATURE: SHORT LINKS ── */}
        <section id="features" ref={linksAnim.ref} className={`py-24 px-4 max-w-6xl mx-auto ${anim(linksAnim)}`}>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-semibold">SHORT LINKS</span>
              <h2 className="text-3xl font-bold tracking-tight mt-3 text-zinc-900 dark:text-zinc-50">It starts with a link</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mt-4 leading-relaxed">Create branded short links with superpowers: custom slugs, QR codes, geo-targeting, A/B testing, expiry dates, and password protection.</p>
              <ul className="mt-6 space-y-3">
                {['Custom domains', 'Link expiration', 'Password protection', 'QR codes', 'Tags & folders'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"><Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />{f}</li>
                ))}
              </ul>
              <Link to="/register" className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium text-sm mt-6 hover:underline">Explore Links <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2">
                  <Link2 className="w-4 h-4 text-zinc-400 dark:text-zinc-500 ml-1" />
                  <span className="text-sm text-zinc-400 dark:text-zinc-500 flex-1 truncate">https://example.com/very-long-url...</span>
                  <span className="bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-md">Shorten</span>
                </div>
              </div>
              {[
                { name: 'dub.sh/summer-sale', url: 'https://shop.com/summer-collection-2026...', clicks: '142' },
                { name: 'dub.sh/product-launch', url: 'https://company.io/launch/new-product...', clicks: '89' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b border-zinc-50 dark:border-zinc-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-700 rounded-full border border-zinc-200 dark:border-zinc-600" />
                    <div>
                      <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{item.name}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate max-w-[180px]">{item.url}</p>
                    </div>
                  </div>
                  <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium px-2 py-1 rounded-full">{item.clicks} clicks</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURE: ANALYTICS ── */}
        <section id="analytics" ref={analyticsAnim.ref} className={`py-24 px-4 max-w-6xl mx-auto bg-zinc-50/50 dark:bg-zinc-900/30 ${anim(analyticsAnim)}`}>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 md:order-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Clicks this week</h3>
                <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-xs font-bold px-2 py-0.5 rounded-full">↑ 23%</span>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={miniChartData}>
                    <defs>
                      <linearGradient id="landingGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={2} fill="url(#landingGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div><p className="font-bold text-lg text-zinc-900 dark:text-zinc-100">1,234</p><p className="text-xs text-zinc-500 dark:text-zinc-400">clicks</p></div>
                <div><p className="font-bold text-lg text-zinc-900 dark:text-zinc-100">12</p><p className="text-xs text-zinc-500 dark:text-zinc-400">countries</p></div>
                <div><p className="font-bold text-lg text-zinc-900 dark:text-zinc-100">3</p><p className="text-xs text-zinc-500 dark:text-zinc-400">devices</p></div>
              </div>
            </div>
            <div className="md:order-2">
              <span className="text-xs uppercase tracking-widest text-purple-600 dark:text-purple-400 font-semibold">ANALYTICS</span>
              <h2 className="text-3xl font-bold tracking-tight mt-3 text-zinc-900 dark:text-zinc-50">Measure what matters</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mt-4 leading-relaxed">From first click to conversion — see clicks, device types, countries, and referrers in real-time with beautiful charts.</p>
              <ul className="mt-6 space-y-3">
                {['Real-time click tracking', 'Device & browser breakdown', 'Country & city data', 'Referrer sources', 'Custom date ranges'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"><Check className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />{f}</li>
                ))}
              </ul>
              <Link to="/register" className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium text-sm mt-6 hover:underline">Explore Analytics <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </section>

        {/* ── FEATURE: QR CODES ── */}
        <section id="qrcodes" ref={qrAnim.ref} className={`py-24 px-4 max-w-6xl mx-auto ${anim(qrAnim)}`}>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold">QR CODES</span>
              <h2 className="text-3xl font-bold tracking-tight mt-3 text-zinc-900 dark:text-zinc-50">Every link, a QR code</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mt-4 leading-relaxed">Automatically generate customizable QR codes for every link. Change colors, add your logo, and download in one click.</p>
              <ul className="mt-6 space-y-3">
                {['Auto-generated', 'Custom colors', 'Logo overlay', 'PNG download', 'Per-link customization'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />{f}</li>
                ))}
              </ul>
              <Link to="/register" className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-sm mt-6 hover:underline">Explore QR Codes <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-8 flex flex-col items-center">
              <QRCodeSVG value="https://dub.co" size={160} fgColor="#6366f1" bgColor="transparent" level="H" />
              <div className="flex items-center gap-3 mt-6">
                <div className="w-8 h-8 rounded-full bg-black border-2 border-zinc-200 dark:border-zinc-600 cursor-pointer" />
                <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-zinc-200 dark:border-zinc-600 cursor-pointer" />
                <div className="w-8 h-8 rounded-full bg-emerald-600 border-2 border-zinc-200 dark:border-zinc-600 cursor-pointer" />
              </div>
              <button className="mt-4 border border-zinc-200 dark:border-zinc-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-colors">Download PNG</button>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section ref={howAnim.ref} className={`py-24 px-4 max-w-6xl mx-auto ${anim(howAnim)}`}>
          <h2 className="text-3xl font-bold tracking-tight text-center mb-4 text-zinc-900 dark:text-zinc-50">Get started in 3 steps</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-center mb-12">It takes less than a minute to shorten your first link.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Link2, title: 'Paste your URL', desc: 'Enter any long URL into Sudi', delay: 'delay-0' },
              { icon: Settings2, title: 'Customize & shorten', desc: 'Add a custom slug, set expiry, or add a password', delay: 'delay-150' },
              { icon: BarChart3, title: 'Track & grow', desc: 'Watch real-time clicks, locations, and device data roll in', delay: 'delay-300' },
            ].map((step, i) => (
              <div key={i} className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center shadow-sm transition-all duration-700 ${step.delay} ${howAnim.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold mx-auto mb-4">{i + 1}</div>
                <step.icon className="w-8 h-8 text-zinc-700 dark:text-zinc-300 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2 text-zinc-900 dark:text-zinc-50">{step.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" ref={pricingAnim.ref} className={`py-24 px-4 bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-100 dark:border-zinc-800 ${anim(pricingAnim)}`}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-4 text-zinc-900 dark:text-zinc-50">Simple, transparent pricing</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-center mb-8">No hidden fees. Cancel anytime.</p>
            <div className="flex justify-center mb-12">
              <div className="bg-zinc-200 dark:bg-zinc-800 rounded-full p-1 inline-flex items-center">
                <button onClick={() => setYearly(false)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!yearly ? 'bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>Monthly</button>
                <button onClick={() => setYearly(true)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${yearly ? 'bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>Yearly <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">-20%</span></button>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Free */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Free</h3>
                <div className="mt-4 mb-6"><span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">$0</span><span className="text-zinc-500 dark:text-zinc-400">/month</span></div>
                <ul className="space-y-3 mb-8">
                  {['25 links', 'Basic analytics (7 days)', 'QR codes', '1 workspace'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"><Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />{f}</li>
                  ))}
                </ul>
                <Link to="/register" className="block w-full text-center border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 py-2.5 rounded-lg text-sm font-medium transition-colors">Get started free</Link>
              </div>
              {/* Pro */}
              <div className="bg-white dark:bg-zinc-900 border-2 border-indigo-600 dark:border-indigo-500 rounded-2xl p-8 shadow-sm relative">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Pro</h3>
                <div className="mt-4 mb-6"><span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">${yearly ? 7 : 9}</span><span className="text-zinc-500 dark:text-zinc-400">/month</span></div>
                <ul className="space-y-3 mb-8">
                  {['Unlimited links', 'Advanced analytics (90 days)', 'Custom domains', 'Password protection', 'Link expiration', 'Priority support'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"><Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />{f}</li>
                  ))}
                </ul>
                <Link to="/register" className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">Get started</Link>
                <p className="text-[10px] text-center text-zinc-400 dark:text-zinc-500 mt-3">All plans start with a 14-day free trial</p>
              </div>
              {/* Enterprise */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Enterprise</h3>
                <div className="mt-4 mb-6"><span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">Custom</span></div>
                <ul className="space-y-3 mb-8">
                  {['Unlimited everything', 'SSO / SAML', 'Dedicated support', 'SLA guarantee', 'Custom contracts'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"><Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />{f}</li>
                  ))}
                </ul>
                <a href="#" className="block w-full text-center border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 py-2.5 rounded-lg text-sm font-medium transition-colors">Contact sales</a>
              </div>
            </div>
          </div>
        </section>

        {/* ── INTERACTIVE DEMO ── */}
        <section ref={demoAnim.ref} className={`py-24 px-4 max-w-6xl mx-auto ${anim(demoAnim)}`}>
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-semibold">TRY IT NOW</span>
            <h2 className="text-3xl font-bold tracking-tight mt-3 text-zinc-900 dark:text-zinc-50">Shorten a link right now</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">No account needed. See how it works instantly.</p>
          </div>
          
          <DemoShortener />
        </section>

        {/* ── FINAL CTA ── */}
        <section ref={ctaAnim.ref} className={`bg-indigo-600/95 dark:bg-indigo-900/80 backdrop-blur-md text-white py-24 text-center border-t border-indigo-500/30 ${anim(ctaAnim)}`}>
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-4xl font-bold">Start shortening links today</h2>
            <p className="text-indigo-100 dark:text-indigo-200 mt-4 text-lg">Start with our Free plan. Upgrade anytime.</p>
            <Link to="/register" className="inline-block bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-zinc-100 transition-colors mt-8">Create free account →</Link>
            <p className="text-white/70 text-sm mt-4">Already have an account? <Link to="/login" className="underline text-white/90 hover:text-white">Sign in</Link></p>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-zinc-950 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="font-semibold text-sm mb-4">{category}</h4>
                <ul className="space-y-2">
                  {links.map(link => (
                    <li key={link.name}>
                      {link.path.startsWith('/') ? (
                        <Link to={link.path} className="text-zinc-400 hover:text-white text-sm transition-colors">{link.name}</Link>
                      ) : (
                        <a href={link.path} className="text-zinc-400 hover:text-white text-sm transition-colors">{link.name}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center"><span className="text-zinc-400 font-bold text-xs">d</span></div>
              <span className="text-zinc-500 text-sm">© 2026 Sudi. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://x.com/Mustfa35429165" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors text-sm font-medium">Twitter / X</a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm font-medium">GitHub</a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm font-medium">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DemoShortener() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidUrl = (s: string) => {
    try { new URL(s); return true; } catch { return false; }
  };

  const handleShorten = async () => {
    if (!isValidUrl(url)) { setError('Please enter a valid URL (include https://)'); return; }
    setError('');
    setLoading(true);
    
    // Generate a demo short code (client-side only, not saved to DB)
    await new Promise(r => setTimeout(r, 600));
    const code = Math.random().toString(36).substring(2, 8);
    setResult(`${window.location.origin}/${code}`);
    setLoading(false);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="url"
              value={url}
              onChange={e => { setUrl(e.target.value); setResult(null); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleShorten()}
              placeholder="https://your-very-long-url.com/..."
              className="w-full pl-10 pr-4 py-3 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleShorten}
            disabled={loading || !url}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Shorten'}
          </button>
        </div>
        
        {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2 ml-1">{error}</p>}
        
        {result && (
          <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-indigo-400 dark:text-indigo-500 font-medium mb-1">Demo short link (not saved)</p>
              <a href={result} className="text-indigo-700 dark:text-indigo-300 font-semibold text-sm hover:underline">{result}</a>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-indigo-600 text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors shrink-0"
            >
              {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>
        )}
        
        {result && (
          <div className="mt-3 text-center">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Want to save and track this link?{' '}
              <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Create a free account →</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
