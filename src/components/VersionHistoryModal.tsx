import React from 'react';
import { X, History, RotateCcw, Check, FileCode, Clock } from 'lucide-react';
import { Project, ProjectVersion } from '../types';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onRestoreVersion: (versionId: string) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  project,
  onRestoreVersion,
}) => {
  if (!isOpen) return null;

  const versions = project.versions || [];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Version History & Snapshots</h2>
              <p className="text-xs text-zinc-400">
                Restore previous iterations of <span className="text-zinc-200">{project.name}</span>
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

        {/* Timeline list */}
        <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
          {versions.slice().reverse().map((ver, idx) => {
            const isLatest = idx === 0;
            return (
              <div
                key={ver.id}
                className={`p-4 rounded-xl border flex flex-col space-y-2 transition ${
                  isLatest
                    ? 'bg-indigo-600/10 border-indigo-500/40 ring-1 ring-indigo-500/20'
                    : 'bg-zinc-950 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      Version {ver.versionNumber}
                    </span>
                    {isLatest && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        Current Active State
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(ver.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {ver.summary}
                </p>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <FileCode className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{Object.keys(ver.files).length} snapshot files</span>
                  </div>

                  {!isLatest && (
                    <button
                      onClick={() => {
                        onRestoreVersion(ver.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-medium text-xs flex items-center gap-1.5 transition"
                    >
                      <RotateCcw className="w-3 h-3 text-indigo-400" />
                      <span>Restore to this version</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
