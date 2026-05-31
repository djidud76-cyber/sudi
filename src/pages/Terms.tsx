import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium mb-8 inline-block">← Back</button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Terms of Service</h1>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
          <p className="lead text-xl text-zinc-500 dark:text-zinc-400 mb-8">
            Please read these terms carefully before using Sudi. By using our service, you agree to be bound by these terms.
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using Sudi, you agree to these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this site.</p>

          <h2>2. Use License</h2>
          <p>You may use Sudi to shorten links for personal or commercial purposes, provided that you do not use the service for:</p>
          <ul>
            <li>Spamming or sending unsolicited messages</li>
            <li>Distributing malware, viruses, or other harmful code</li>
            <li>Linking to illegal, abusive, or explicitly adult content</li>
            <li>Phishing or fraudulent activities</li>
          </ul>
          <p>We reserve the right to disable any links or terminate accounts that violate these rules without notice.</p>

          <h2>3. Disclaimer</h2>
          <p>The materials on Sudi's website are provided on an 'as is' basis. Sudi makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

          <h2>4. Limitations</h2>
          <p>In no event shall Sudi or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Sudi's website.</p>

          <h2>5. Revisions</h2>
          <p>Sudi may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.</p>
        </div>
      </div>
    </div>
  );
}
