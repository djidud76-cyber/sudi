import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium mb-8 inline-block group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/50 dark:to-blue-900/50 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Terms of Service</h1>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-indigo-600 dark:prose-a:text-indigo-400 space-y-6">
          <p className="lead text-lg text-zinc-600 dark:text-zinc-300 mb-8 italic border-l-4 border-indigo-500 pl-4">
            Please read these terms carefully before using Sudi. By using our service, you agree to be bound by these terms. If you do not agree, please do not use the service.
          </p>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-zinc-50">1. Acceptance of Terms</h2>
            <p className="text-zinc-600 dark:text-zinc-300">By accessing or using Sudi, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this service.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-zinc-50">2. Use License & Acceptable Use</h2>
            <p className="text-zinc-600 dark:text-zinc-300 mb-4">You may use Sudi to shorten links for personal or commercial purposes, provided that you do not use the service for any unlawful purpose or in violation of any applicable regulations. Prohibited uses include:</p>
            <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-300 ml-2">
              <li>Spamming or sending unsolicited messages</li>
              <li>Distributing malware, viruses, or other harmful code</li>
              <li>Linking to illegal, abusive, or explicitly adult content</li>
              <li>Phishing, fraud, or deceptive practices</li>
              <li>Circumventing security or access controls</li>
              <li>Harassment or threatening behavior</li>
            </ul>
            <p className="text-zinc-600 dark:text-zinc-300 mt-4">We reserve the right to disable any links or terminate accounts that violate these rules without notice or refund.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-zinc-50">3. Disclaimer of Warranties</h2>
            <p className="text-zinc-600 dark:text-zinc-300">Sudi is provided on an "AS IS" and "AS AVAILABLE" basis. Sudi makes no representations or warranties of any kind, express or implied, regarding the service. Sudi disclaims all warranties, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement of rights.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-zinc-50">4. Limitation of Liability</h2>
            <p className="text-zinc-600 dark:text-zinc-300">In no event shall Sudi or its suppliers be liable for any indirect, incidental, consequential, or special damages arising out of the use or inability to use the service, including but not limited to damages for loss of data, profit, or business interruption, even if Sudi has been advised of the possibility of such damages.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-zinc-50">5. Intellectual Property Rights</h2>
            <p className="text-zinc-600 dark:text-zinc-300">The Sudi platform, including all content, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio) is owned by Sudi, its licensors, or other providers of such material and is protected by copyright, trademark, and other intellectual property laws.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-zinc-50">6. User Accounts & Passwords</h2>
            <p className="text-zinc-600 dark:text-zinc-300">If you create an account on Sudi, you are responsible for maintaining the confidentiality of your password and for all activities that occur under your account. You agree to notify Sudi immediately of any unauthorized use of your account.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-zinc-50">7. Modifications & Termination</h2>
            <p className="text-zinc-600 dark:text-zinc-300">Sudi may modify, suspend, or discontinue the service at any time. Sudi may also modify these terms at any time without notice. By continuing to use the service, you agree to be bound by the then-current version of these terms.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-zinc-50">8. Governing Law</h2>
            <p className="text-zinc-600 dark:text-zinc-300">These terms and conditions are governed by and construed in accordance with applicable laws, and you irrevocably submit to the exclusive jurisdiction of the competent courts.</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-8">
            <p className="text-sm text-blue-900 dark:text-blue-100"><strong>Questions?</strong> If you have any questions about these terms, please contact us through our website.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
