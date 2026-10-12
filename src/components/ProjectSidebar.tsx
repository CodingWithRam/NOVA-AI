import React, { useState } from 'react';
import { 
  FolderGit2, 
  Plus, 
  Trash2, 
  Copy, 
  History, 
  Download, 
  Search, 
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
  Layers
} from 'lucide-react';
import { Project, ProjectVersion } from '../types';

interface ProjectSidebarProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onNewProjectClick: () => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (id: string) => void;
  onRestoreVersion: (versionId: string) => void;
  onOpenDeployModal: () => void;
  onExportZip: () => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onNewProjectClick,
  onDeleteProject,
  onDuplicateProject,
  onRestoreVersion,
  onOpenDeployModal,
  onExportZip,
}) => {
  const [search, setSearch] = useState('');
  const [showVersions, setShowVersions] = useState(false);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-64 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col text-xs select-none">
      {/* Sidebar Header */}
      <div className="h-12 px-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-zinc-200">
          <FolderGit2 className="w-4 h-4 text-indigo-400" />
          <span>Projects</span>
        </div>
        <button
          onClick={onNewProjectClick}
          className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-md font-medium flex items-center gap-1 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Project Search */}
      <div className="p-3 border-b border-zinc-800/80">
        <div className="relative">
          <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-7 pr-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[11px] text-zinc-200 focus:outline-none focus:border-zinc-700"
          />
        </div>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredProjects.map((p) => {
          const isActive = p.id === activeProjectId;
          return (
            <div
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition ${
                isActive
                  ? 'bg-zinc-800 text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <div className="truncate flex-1 mr-2">
                <div className="truncate text-xs">{p.name}</div>
                <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                  {Object.keys(p.files || {}).length} files · {p.versions?.length || 1} versions
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateProject(p.id);
                  }}
                  className="p-1 text-zinc-400 hover:text-zinc-200 rounded"
                  title="Duplicate project"
                >
                  <Copy className="w-3 h-3" />
                </button>
                {projects.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProject(p.id);
                    }}
                    className="p-1 text-zinc-400 hover:text-rose-400 rounded"
                    title="Delete project"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Project Version History Section */}
      {activeProject && (
        <div className="border-t border-zinc-800 bg-zinc-900/30 flex flex-col max-h-56">
          <div
            onClick={() => setShowVersions(!showVersions)}
            className="px-3 py-2 border-b border-zinc-800/80 flex items-center justify-between cursor-pointer hover:bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 transition"
          >
            <div className="flex items-center gap-1.5 font-medium text-[11px]">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>Version History ({activeProject.versions?.length || 1})</span>
            </div>
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform ${showVersions ? 'rotate-90' : ''}`}
            />
          </div>

          {showVersions && (
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 text-[11px]">
              {activeProject.versions && activeProject.versions.length > 0 ? (
                activeProject.versions
                  .slice()
                  .reverse()
                  .map((ver) => (
                    <div
                      key={ver.id}
                      className="p-2 rounded bg-zinc-950/80 border border-zinc-800 flex flex-col space-y-1"
                    >
                      <div className="flex items-center justify-between text-zinc-400">
                        <span className="font-semibold text-zinc-200">v{ver.versionNumber}</span>
                        <span className="text-[10px]">{new Date(ver.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {ver.summary}
                      </p>
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => onRestoreVersion(ver.id)}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          Restore
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-[10px] text-zinc-500 p-2">Initial snapshot created</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom Export & Deployment Actions */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900/50 space-y-2">
        <button
          onClick={onExportZip}
          className="w-full py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 transition"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span>Export Source ZIP</span>
        </button>

        <button
          onClick={onOpenDeployModal}
          className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Deploy Project</span>
        </button>
      </div>
    </aside>
  );
};
