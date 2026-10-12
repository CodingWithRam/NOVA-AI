import React, { useState } from 'react';
import { 
  FileCode, 
  FileJson, 
  FileText, 
  Folder, 
  Plus, 
  Trash2, 
  Search, 
  ChevronRight, 
  ChevronDown,
  Edit2
} from 'lucide-react';

interface FileTreeProps {
  files: Record<string, string>;
  activeFilePath: string;
  onSelectFile: (path: string) => void;
  onCreateFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
  onRenameFile: (oldPath: string, newPath: string) => void;
  modifiedFiles?: string[];
}

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  activeFilePath,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  modifiedFiles = [],
}) => {
  const [search, setSearch] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const filePaths = Object.keys(files).sort();

  const filteredPaths = filePaths.filter((path) =>
    path.toLowerCase().includes(search.toLowerCase())
  );

  const getFileIcon = (path: string) => {
    if (path.endsWith('.jsx') || path.endsWith('.tsx') || path.endsWith('.js') || path.endsWith('.ts')) {
      return <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />;
    }
    if (path.endsWith('.html') || path.endsWith('.htm')) {
      return <FileCode className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    if (path.endsWith('.css')) {
      return <FileText className="w-4 h-4 text-sky-400 shrink-0" />;
    }
    if (path.endsWith('.json')) {
      return <FileJson className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-zinc-400 shrink-0" />;
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setNewFileName('');
  };

  const handleFinishCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newFileName.trim();
    if (clean && !files[clean]) {
      onCreateFile(clean);
      setIsCreating(false);
      setNewFileName('');
    }
  };

  const handleStartRename = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPath(path);
    setRenameValue(path);
  };

  const handleFinishRename = (oldPath: string, e: React.FormEvent) => {
    e.preventDefault();
    const clean = renameValue.trim();
    if (clean && clean !== oldPath) {
      onRenameFile(oldPath, clean);
    }
    setEditingPath(null);
  };

  return (
    <div className="w-60 h-full border-r border-zinc-800 bg-zinc-950 flex flex-col select-none text-xs">
      {/* File Tree Header */}
      <div className="h-10 px-3 border-b border-zinc-800 flex items-center justify-between">
        <span className="font-semibold text-zinc-300 uppercase tracking-wider text-[10px]">
          Explorer ({filePaths.length})
        </span>
        <button
          onClick={handleStartCreate}
          className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition"
          title="New File"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter search bar */}
      <div className="p-2 border-b border-zinc-800/80">
        <div className="relative">
          <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-7 pr-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[11px] text-zinc-200 focus:outline-none focus:border-zinc-700"
          />
        </div>
      </div>

      {/* New file inline form */}
      {isCreating && (
        <form onSubmit={handleFinishCreate} className="p-2 border-b border-zinc-800 bg-zinc-900/50">
          <input
            autoFocus
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onBlur={() => setIsCreating(false)}
            placeholder="e.g. src/Button.jsx"
            className="w-full px-2 py-1 bg-zinc-800 border border-indigo-500 rounded text-xs text-white focus:outline-none"
          />
          <div className="flex justify-end gap-1 mt-1 text-[10px] text-zinc-400">
            <span>Press Enter to save</span>
          </div>
        </form>
      )}

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {filteredPaths.length === 0 ? (
          <div className="p-4 text-center text-zinc-500 text-[11px]">No files matching filter</div>
        ) : (
          filteredPaths.map((path) => {
            const isActive = activeFilePath === path;
            const isModified = modifiedFiles.includes(path);
            const isEditing = editingPath === path;

            if (isEditing) {
              return (
                <form
                  key={path}
                  onSubmit={(e) => handleFinishRename(path, e)}
                  className="px-2 py-1 bg-zinc-900 rounded border border-indigo-500"
                >
                  <input
                    autoFocus
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => setEditingPath(null)}
                    className="w-full bg-transparent text-xs text-white focus:outline-none"
                  />
                </form>
              );
            }

            return (
              <div
                key={path}
                onClick={() => onSelectFile(path)}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer transition ${
                  isActive
                    ? 'bg-zinc-800/90 text-white font-medium shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/70'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {getFileIcon(path)}
                  <span className="truncate">{path}</span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  {isModified && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"
                      title="Modified by AI"
                    ></span>
                  )}
                  <button
                    onClick={(e) => handleStartRename(path, e)}
                    className="p-1 text-zinc-400 hover:text-zinc-200 rounded"
                    title="Rename"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  {filePaths.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(path);
                      }}
                      className="p-1 text-zinc-400 hover:text-rose-400 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
