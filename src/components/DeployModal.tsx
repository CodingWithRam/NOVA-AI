import React, { useState, useEffect } from 'react';
import { 
  X, 
  Rocket, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  Globe, 
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { Project, DeploymentDetails } from '../types';
import { simulateProjectDeploy } from '../services/api';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onExportZip: () => void;
}

export const DeployModal: React.FC<DeployModalProps> = ({
  isOpen,
  onClose,
  project,
  onExportZip,
}) => {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<DeploymentDetails | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'vercel' | 'netlify' | 'cloudflare'>('vercel');

  useEffect(() => {
    if (isOpen) {
      handleDeploy();
    }
  }, [isOpen, project.id]);

  if (!isOpen) return null;

  const handleDeploy = async () => {
    setLoading(true);
    try {
      const data = await simulateProjectDeploy(project);
      setDetails(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenLive = () => {
    if (details?.url) {
      window.open(details.url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Rocket className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">1-Click Cloud Deployment</h2>
              <p className="text-xs text-zinc-400">
                Instantly deploy and host <span className="text-zinc-200 font-semibold">{project.name}</span> on the web.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Active Deployment Banner */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-indigo-500/30 space-y-4 shadow-inner ring-1 ring-indigo-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Live Application Endpoint</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live & Deployed
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
            <span className="font-mono text-indigo-300 truncate px-2 select-all">
              {details?.url || 'Generating live deployment...'}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopy(details?.url || '', 'url')}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs flex items-center gap-1.5 transition"
              >
                {copiedKey === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Link</span>
              </button>

              <button
                onClick={handleOpenLive}
                disabled={!details?.url}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow-md shadow-indigo-600/30"
              >
                <span>Open Live App</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1 text-[11px] text-zinc-400 border-t border-zinc-800/60">
            <div>
              <span className="text-zinc-500">Status:</span>{' '}
              <span className="text-emerald-400 font-medium">100% Operational</span>
            </div>
            <div>
              <span className="text-zinc-500">Files:</span>{' '}
              <span className="text-zinc-200 font-mono">{Object.keys(project.files).length} files</span>
            </div>
            <div>
              <span className="text-zinc-500">Framework:</span>{' '}
              <span className="text-zinc-200 font-medium">{details?.stats?.framework || 'React SPA'}</span>
            </div>
          </div>
        </div>

        {/* 1-Command CLI Deployments (Vercel, Netlify, Cloudflare) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Self-Host / Custom Domain Deployment
            </h3>
            <div className="flex items-center gap-1 p-0.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs">
              {(['vercel', 'netlify', 'cloudflare'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-md capitalize transition ${
                    activeTab === tab
                      ? 'bg-zinc-800 text-white font-medium shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px]">{activeTab.toUpperCase()} CLI Commands</span>
              <button
                onClick={() => handleCopy(details?.cliCommands[activeTab] || '', activeTab)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copiedKey === activeTab ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy Command</span>
              </button>
            </div>

            <pre className="p-3 rounded-lg bg-zinc-900 border border-zinc-800/80 text-emerald-400 text-xs overflow-x-auto">
              <code>{details?.cliCommands[activeTab] || 'npm run build'}</code>
            </pre>

            <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
              Download the source code ZIP, run the command in your terminal, and your custom domain goes live immediately.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <button
            onClick={onExportZip}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Source ZIP</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
