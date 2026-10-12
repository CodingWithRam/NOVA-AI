import React, { useState } from 'react';
import { 
  Sparkles, 
  Columns, 
  Code2, 
  Play, 
  PanelLeftClose, 
  PanelLeft, 
  Check, 
  Edit3, 
  User, 
  ChevronDown,
  Layers,
  History,
  Rocket
} from 'lucide-react';
import { ViewMode, UserProfile } from '../types';

interface HeaderProps {
  projectName: string;
  onRenameProject: (newName: string) => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  user: UserProfile;
  onOpenAuthModal: () => void;
  onOpenDeployModal: () => void;
  onOpenVersionModal: () => void;
  versionCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  projectName,
  onRenameProject,
  viewMode,
  onChangeViewMode,
  isSidebarOpen,
  onToggleSidebar,
  user,
  onOpenAuthModal,
  onOpenDeployModal,
  onOpenVersionModal,
  versionCount,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(projectName);

  const handleFinishRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onRenameProject(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between gap-4 select-none shrink-0 z-30">
      {/* Brand & Sidebar Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-md transition"
          title="Toggle Sidebar"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeft className="w-4 h-4" />
          )}
        </button>

        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white font-sans">
                NovaBuild<span className="text-indigo-400 font-medium">.AI</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Studio
              </span>
            </div>
          </div>
        </div>

        <div className="h-4 w-px bg-zinc-800 mx-1 hidden sm:block"></div>

        {/* Project Name & In-place Rename */}
        <div className="hidden sm:flex items-center gap-2">
          {isEditingName ? (
            <form onSubmit={handleFinishRename} className="flex items-center gap-1">
              <input
                autoFocus
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleFinishRename}
                className="px-2 py-1 bg-zinc-900 border border-indigo-500 rounded text-xs text-white focus:outline-none"
              />
            </form>
          ) : (
            <div
              onClick={() => {
                setTempName(projectName);
                setIsEditingName(true);
              }}
              className="group flex items-center gap-1.5 text-xs text-zinc-300 font-medium cursor-pointer hover:text-white px-2 py-1 rounded hover:bg-zinc-900 transition"
              title="Click to rename project"
            >
              <span>{projectName}</span>
              <Edit3 className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition" />
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Saved</span>
          </div>
        </div>
      </div>

      {/* Center Layout Mode Switcher */}
      <div className="flex items-center gap-1 p-0.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-medium">
        <button
          onClick={() => onChangeViewMode('split')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
            viewMode === 'split'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Split View (Code + Live Preview)"
        >
          <Columns className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">Split</span>
        </button>

        <button
          onClick={() => onChangeViewMode('code')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
            viewMode === 'code'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Code Editor Only"
        >
          <Code2 className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden md:inline">Code</span>
        </button>

        <button
          onClick={() => onChangeViewMode('preview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
            viewMode === 'preview'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Live Preview Only"
        >
          <Play className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline">Preview</span>
        </button>
      </div>

      {/* Right Actions: Deploy, History, User */}
      <div className="flex items-center gap-2">
        {/* Version History Button */}
        <button
          onClick={onOpenVersionModal}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition"
          title="View and restore versions"
        >
          <History className="w-3.5 h-3.5 text-zinc-400" />
          <span>v{versionCount}</span>
        </button>

        {/* Deploy button */}
        <button
          onClick={onOpenDeployModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-lg shadow-indigo-600/20"
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>Deploy</span>
        </button>

        {/* User profile dropdown button */}
        <button
          onClick={onOpenAuthModal}
          className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition text-xs"
          title="Switch User Profile"
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-5 h-5 rounded-full object-cover ring-1 ring-zinc-700"
          />
          <span className="text-zinc-200 hidden lg:inline max-w-[90px] truncate">{user.name}</span>
          <ChevronDown className="w-3 h-3 text-zinc-500" />
        </button>
      </div>
    </header>
  );
};
