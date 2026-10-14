import React, { useState } from 'react';
import { DownloadCloud, Smartphone, Laptop, Check, X, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  const handleClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  if (isInstalled) {
    return (
      <div 
        className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium"
        title="Running in Standalone App Mode"
      >
        <Check className="w-3.5 h-3.5" />
        <span>App Installed</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/40 hover:to-blue-600/40 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-medium transition shadow-sm"
        title="Install as Desktop or Mobile App (PWA)"
      >
        <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">App</span>
      </button>

      {/* Installation Guide Modal (for iOS or browsers requiring guidance) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl text-zinc-200 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <DownloadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Install NovaBuild AI App</h3>
                  <p className="text-xs text-zinc-400">Run standalone on your desktop or mobile home screen</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs">
                <p className="font-semibold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  Install on iPhone / iPad (iOS Safari):
                </p>
                <ol className="list-decimal list-inside space-y-2 text-zinc-300 leading-relaxed pl-1">
                  <li>
                    Tap the <strong className="text-white">Share</strong> button <Share2 className="w-3.5 h-3.5 inline mx-1 text-cyan-400" /> in the Safari navigation bar.
                  </li>
                  <li>
                    Scroll down in the share sheet and tap <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-cyan-400" />.
                  </li>
                  <li>
                    Tap <strong className="text-white">Add</strong> in the top-right corner to finish!
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs">
                <p className="font-semibold text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-cyan-400" />
                  Install on Chrome, Edge or Android:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-zinc-300 leading-relaxed pl-1">
                  <li>
                    Click the <strong className="text-white">Install Icon</strong> in your browser's address bar (URL bar).
                  </li>
                  <li>
                    Or open browser menu (three dots <strong className="text-white">⋮</strong>) &rarr; <strong className="text-white">"Install NovaBuild AI Studio"</strong> or <strong className="text-white">"Add to Home Screen"</strong>.
                  </li>
                  <li>
                    Enjoy offline launch, faster loading, and a native application window!
                  </li>
                </ol>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
