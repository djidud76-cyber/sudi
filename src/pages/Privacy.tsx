import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium mb-8 inline-block">← Back</button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Privacy Policy</h1>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
          <p className="lead text-xl text-zinc-500 dark:text-zinc-400 mb-8">
            At Sudi, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.
          </p>

          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, create short links, or contact us for support. This may include:</p>
          <ul>
            <li>Name and email address</li>
            <li>Account credentials</li>
            <li>URLs you shorten using our service</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services. Specifically, we use it to:</p>
          <ul>
            <li>Create and manage your account</li>
            <li>Provide analytics on your shortened links</li>
            <li>Send you technical notices and support messages</li>
            <li>Protect against malicious activity</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
          <ul>
            <li>With your consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect the rights and safety of Sudi, our users, or the public</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

          <h2>5. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at support@sudi.com or via Twitter <a href="https://x.com/Mustfa35429165" target="_blank" rel="noreferrer">@Mustfa35429165</a>.</p>
        </div>
      </div>
    </div>
  );
}
