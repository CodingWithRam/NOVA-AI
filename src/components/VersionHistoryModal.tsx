import React, { useState } from 'react';
import { 
  X, 
  History, 
  RotateCcw, 
  FileCode, 
  Clock, 
  Plus, 
  Trash2, 
  Download, 
  Check, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { Project, ProjectVersion } from '../types';
import { exportProjectAsZip } from '../services/zipExport';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onRestoreVersion: (versionId: string) => void;
  onSaveSnapshot: (summary: string) => void;
  onDeleteVersion: (versionId: string) => void;
  onCleanHistory: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  project,
  onRestoreVersion,
  onSaveSnapshot,
  onDeleteVersion,
  onCleanHistory,
}) => {
  const [newSnapshotNote, setNewSnapshotNote] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [showCleanConfirm, setShowCleanConfirm] = useState(false);
  const [downloadingVerId, setDownloadingVerId] = useState<string | null>(null);

  if (!isOpen) return null;

  const versions = project.versions || [];

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    const note = newSnapshotNote.trim() || `Manual checkpoint (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
    onSaveSnapshot(note);
    setNewSnapshotNote('');
    setShowSaveInput(false);
  };

  const handleDownloadSnapshot = async (ver: ProjectVersion) => {
    try {
      setDownloadingVerId(ver.id);
      const snapshotProject: Project = {
        ...project,
        name: `${project.name}-v${ver.versionNumber}`,
        files: { ...ver.files },
      };
      await exportProjectAsZip(snapshotProject);
    } catch (err) {
      console.error('Failed to export snapshot:', err);
    } finally {
      setDownloadingVerId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Version History & Snapshots</h2>
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[11px] font-mono border border-zinc-700">
                  {versions.length} {versions.length === 1 ? 'version' : 'versions'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Safe checkpoints for <span className="text-zinc-200 font-medium">{project.name}</span> with instant restore & ZIP download
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar: Save New Snapshot & Clean History */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950/70 border border-zinc-800/80 p-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            {!showSaveInput ? (
              <button
                onClick={() => setShowSaveInput(true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save New Snapshot</span>
              </button>
            ) : (
              <form onSubmit={handleCreateSnapshot} className="flex items-center gap-1.5">
                <input
                  type="text"
                  autoFocus
                  placeholder="Snapshot label (e.g. Added mobile navbar)..."
                  value={newSnapshotNote}
                  onChange={(e) => setNewSnapshotNote(e.target.value)}
                  className="px-3 py-1.5 bg-zinc-900 border border-indigo-500 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none w-56 sm:w-72"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaveInput(false)}
                  className="px-2 py-1.5 text-zinc-400 hover:text-zinc-200 text-xs"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>

          <div className="flex items-center gap-2">
            {versions.length > 1 && !showCleanConfirm && (
              <button
                onClick={() => setShowCleanConfirm(true)}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-rose-300 font-medium text-xs flex items-center gap-1.5 transition"
                title="Keep only current state and remove old intermediate snapshots"
              >
                <Trash2 className="w-3.5 h-3.5 text-zinc-500 hover:text-rose-400" />
                <span>Clean History</span>
              </button>
            )}

            {showCleanConfirm && (
              <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-800/60 px-2 py-1 rounded-lg text-xs">
                <span className="text-rose-300 text-[11px]">Keep latest only?</span>
                <button
                  onClick={() => {
                    onCleanHistory();
                    setShowCleanConfirm(false);
                  }}
                  className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-[11px]"
                >
                  Yes, Clean
                </button>
                <button
                  onClick={() => setShowCleanConfirm(false)}
                  className="px-1.5 py-0.5 text-zinc-400 hover:text-zinc-200 text-[11px]"
                >
                  No
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Timeline list */}
        <div className="max-h-96 overflow-y-auto space-y-2.5 pr-1">
          {versions.slice().reverse().map((ver, idx) => {
            const isLatest = idx === 0;
            return (
              <div
                key={ver.id}
                className={`p-3.5 rounded-xl border flex flex-col space-y-2.5 transition ${
                  isLatest
                    ? 'bg-indigo-600/10 border-indigo-500/40 ring-1 ring-indigo-500/20'
                    : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      Version {ver.versionNumber}
                    </span>
                    {isLatest ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Active State
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                        Snapshot
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>{new Date(ver.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {ver.summary}
                </p>

                <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                  <div className="flex items-center gap-2 text-[11px]">
                    <FileCode className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="font-mono">{Object.keys(ver.files).length} files</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-zinc-500 truncate max-w-[200px]">
                      {Object.keys(ver.files).slice(0, 3).join(', ')}
                      {Object.keys(ver.files).length > 3 ? '...' : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Download ZIP of this specific version snapshot */}
                    <button
                      onClick={() => handleDownloadSnapshot(ver)}
                      disabled={downloadingVerId === ver.id}
                      className="px-2.5 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs flex items-center gap-1 transition"
                      title="Download source code ZIP for this version snapshot"
                    >
                      <Download className="w-3 h-3 text-zinc-400" />
                      <span>{downloadingVerId === ver.id ? 'Zipping...' : 'ZIP'}</span>
                    </button>

                    {/* Restore button */}
                    {!isLatest && (
                      <button
                        onClick={() => {
                          onRestoreVersion(ver.id);
                          onClose();
                        }}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-sm"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore</span>
                      </button>
                    )}

                    {/* Delete snapshot button (only if not the only version) */}
                    {versions.length > 1 && !isLatest && (
                      <button
                        onClick={() => onDeleteVersion(ver.id)}
                        className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded transition"
                        title="Delete snapshot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs text-zinc-500">
          <p>All snapshot versions are securely saved in your local storage workspace.</p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
