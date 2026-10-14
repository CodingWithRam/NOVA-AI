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
  Rocket,
  Smartphone,
  Mail,
  Github,
  LogIn,
  MessageSquare,
  Download,
  Plus,
  ShieldCheck,
  Globe,
  Zap
} from 'lucide-react';
import { ViewMode, UserProfile } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  projectName: string;
  onRenameProject: (newName: string) => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isChatOpen?: boolean;
  onToggleChat?: () => void;
  user: UserProfile;
  onOpenAuthModal: () => void;
  onOpenDeployModal: () => void;
  onOpenVersionModal: () => void;
  onNewProjectClick?: () => void;
  onExportZip?: () => void;
  versionCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  projectName,
  onRenameProject,
  viewMode,
  onChangeViewMode,
  isSidebarOpen,
  onToggleSidebar,
  isChatOpen = true,
  onToggleChat,
  user,
  onOpenAuthModal,
  onOpenDeployModal,
  onOpenVersionModal,
  onNewProjectClick,
  onExportZip,
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
    <header className="h-14 border-b border-zinc-800 bg-zinc-950 px-3 sm:px-4 flex items-center justify-between gap-3 select-none shrink-0 z-30">
      {/* Brand & Sidebar Toggle */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition"
          title="Toggle Project Drawer (Ctrl+B)"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeft className="w-4 h-4" />
          )}
        </button>

        {/* Brand identity - Google AI Studio Build style */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1.5px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div className="hidden xs:block">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white font-sans">
                NovaBuild<span className="text-indigo-400">.AI</span>
              </span>
              <span className="text-[10px] font-medium font-mono px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Studio
              </span>
            </div>
          </div>
        </div>

        <div className="h-4 w-px bg-zinc-800 mx-1 hidden sm:block"></div>

        {/* Project Name & In-place Rename */}
        <div className="hidden md:flex items-center gap-2">
          {isEditingName ? (
            <form onSubmit={handleFinishRename} className="flex items-center gap-1">
              <input
                autoFocus
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleFinishRename}
                className="px-2 py-0.5 bg-zinc-900 border border-indigo-500 rounded text-xs text-white focus:outline-none"
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
              <span className="max-w-[150px] truncate">{projectName}</span>
              <Edit3 className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition" />
            </div>
          )}

          {/* AI Engine & Web Search Grounding badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-zinc-300 font-sans">Nova AI 2.5</span>
            <span className="text-zinc-600">·</span>
            <span className="text-indigo-400">Web Grounded</span>
          </div>
        </div>
      </div>

      {/* Center Layout Mode Switcher */}
      <div className="flex items-center gap-1 p-0.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs font-medium backdrop-blur">
        <button
          onClick={() => onChangeViewMode('preview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            viewMode === 'preview'
              ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700/50'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
          title="Live Preview Canvas (Ctrl+1)"
        >
          <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
          <span className="hidden sm:inline">Preview</span>
          <span className="text-[10px] text-zinc-500 font-mono hidden lg:inline">⌘1</span>
        </button>

        <button
          onClick={() => onChangeViewMode('split')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            viewMode === 'split'
              ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700/50'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
          title="Split View: AI + Code + Live Preview (Ctrl+2)"
        >
          <Columns className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Split</span>
          <span className="text-[10px] text-zinc-500 font-mono hidden lg:inline">⌘2</span>
        </button>

        <button
          onClick={() => onChangeViewMode('code')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            viewMode === 'code'
              ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700/50'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
          title="Code Editor & File Tree (Ctrl+3)"
        >
          <Code2 className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Code</span>
          <span className="text-[10px] text-zinc-500 font-mono hidden lg:inline">⌘3</span>
        </button>
      </div>

      {/* Right Actions: AI Chat toggle, Install App, Download, Versions, Deploy, Auth */}
      <div className="flex items-center gap-2">
        {/* Toggle AI Chat panel */}
        {onToggleChat && (
          <button
            onClick={onToggleChat}
            className={`p-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 ${
              isChatOpen 
                ? 'bg-indigo-950/70 border-indigo-700/60 text-indigo-300' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Toggle AI Chat Panel (Ctrl+J)"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-xs">AI Chat</span>
          </button>
        )}

        {/* Install Progressive Web App */}
        <PWAInstallButton />

        {/* Download Standalone ZIP */}
        {onExportZip && (
          <button
            onClick={onExportZip}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition"
            title="Download Project Source ZIP"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Download</span>
          </button>
        )}

        {/* Version History Button */}
        <button
          onClick={onOpenVersionModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition"
          title="View, save, clean and restore version history snapshots"
        >
          <History className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden lg:inline">History</span>
          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1 py-0.2 rounded">v{versionCount}</span>
        </button>

        {/* New Project Quick Button */}
        {onNewProjectClick && (
          <button
            onClick={onNewProjectClick}
            className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition"
            title="Create New App from Template"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>New App</span>
          </button>
        )}

        {/* Deploy button */}
        <button
          onClick={onOpenDeployModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold transition shadow-md shadow-indigo-600/30"
          title="Deploy live to production"
        >
          <Rocket className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Deploy</span>
        </button>

        {/* User profile / Auth button */}
        <button
          onClick={onOpenAuthModal}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition text-xs group"
          title="Account & Authentication (Mobile Phone OTP, Email, GitHub, Facebook)"
        >
          {user.provider === 'guest' ? (
            <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In / Register</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-zinc-700"
                />
                {user.provider === 'mobile' && (
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-1 ring-zinc-950 flex items-center justify-center text-[7px]" title="Mobile OTP Verified">📱</span>
                )}
                {user.provider === 'github' && (
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full ring-1 ring-zinc-950 flex items-center justify-center text-[7px]" title="GitHub Connected">🐙</span>
                )}
                {user.provider === 'facebook' && (
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full ring-1 ring-zinc-950 flex items-center justify-center text-[7px]" title="Facebook Connected">f</span>
                )}
                {user.provider === 'email' && (
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-1 ring-zinc-950 flex items-center justify-center text-[7px]" title="Email Account">✉️</span>
                )}
              </div>
              <div className="flex flex-col items-start text-left hidden sm:flex">
                <span className="text-zinc-200 font-medium max-w-[85px] truncate text-[11px] leading-tight">
                  {user.name}
                </span>
                <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono">
                  {user.provider || 'Dev'}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition" />
            </div>
          )}
        </button>
      </div>
    </header>
  );
};
