import React, { useState, useEffect, useCallback } from 'react';
import { 
  Project, 
  ViewMode, 
  ChatMessage, 
  UserProfile, 
  FileChangeItem 
} from './types';
import { 
  getActiveUser, 
  setActiveUser, 
  loadProjectsForUser, 
  saveProjectsForUser, 
  createProjectFromTemplate, 
  createVersionSnapshot, 
  restoreProjectToVersion 
} from './services/storage';
import { 
  requestGeneration, 
  requestGenerationStream, 
  checkBackendHealth 
} from './services/api';
import { exportProjectAsZip } from './services/zipExport';
import { Header } from './components/Header';
import { ProjectSidebar } from './components/ProjectSidebar';
import { ChatPanel } from './components/ChatPanel';
import { FileTree } from './components/FileTree';
import { CodeEditor } from './components/CodeEditor';
import { LivePreview } from './components/LivePreview';
import { TemplateModal } from './components/TemplateModal';
import { DeployModal } from './components/DeployModal';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // User state
  const [user, setUser] = useState<UserProfile>(getActiveUser());
  
  // Projects state
  const [projects, setProjects] = useState<Project[]>(() => loadProjectsForUser(user.id));
  const [activeProjectId, setActiveProjectId] = useState<string>(() => projects[0]?.id || '');

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [streamThought, setStreamThought] = useState<string>('');
  const [lastPrompt, setLastPrompt] = useState<string>('');
  const [lastUseGoogleSearch, setLastUseGoogleSearch] = useState<boolean>(false);
  const [modifiedFiles, setModifiedFiles] = useState<string[]>([]);

  // Modals state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Active project helper
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Save projects whenever they update
  useEffect(() => {
    if (projects.length > 0 && user.id) {
      saveProjectsForUser(user.id, projects);
    }
  }, [projects, user.id]);

  // Update projects when switching user
  const handleSelectUser = (newUser: UserProfile) => {
    setActiveUser(newUser);
    setUser(newUser);
    const userProjects = loadProjectsForUser(newUser.id);
    setProjects(userProjects);
    if (userProjects.length > 0) {
      setActiveProjectId(userProjects[0].id);
    }
  };

  // Switch project
  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    setModifiedFiles([]);
  };

  // Create new project from template
  const handleCreateProjectFromTemplate = (templateId: string, projectName: string) => {
    const newProj = createProjectFromTemplate(user.id, projectName, templateId);
    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    setModifiedFiles([]);
  };

  // Delete project
  const handleDeleteProject = (id: string) => {
    if (projects.length <= 1) return;
    const remaining = projects.filter((p) => p.id !== id);
    setProjects(remaining);
    if (activeProjectId === id) {
      setActiveProjectId(remaining[0].id);
    }
  };

  // Duplicate project
  const handleDuplicateProject = (id: string) => {
    const target = projects.find((p) => p.id === id);
    if (!target) return;
    const dup: Project = {
      ...target,
      id: `proj_${Date.now()}_dup`,
      name: `${target.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      versions: target.versions.map((v) => ({ ...v })),
    };
    setProjects((prev) => [dup, ...prev]);
    setActiveProjectId(dup.id);
  };

  // Rename active project
  const handleRenameProject = (newName: string) => {
    if (!activeProject) return;
    const updated = { ...activeProject, name: newName, updatedAt: Date.now() };
    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updated : p)));
  };

  // File tree operations
  const handleSelectFile = (path: string) => {
    if (!activeProject) return;
    const openTabs = activeProject.openTabs.includes(path)
      ? activeProject.openTabs
      : [...activeProject.openTabs, path];

    const updated = { ...activeProject, activeFilePath: path, openTabs };
    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updated : p)));
  };

  const handleCloseTab = (path: string) => {
    if (!activeProject) return;
    const newTabs = activeProject.openTabs.filter((t) => t !== path);
    const newActive =
      activeProject.activeFilePath === path
        ? newTabs[newTabs.length - 1] || Object.keys(activeProject.files)[0]
        : activeProject.activeFilePath;

    const updated = { ...activeProject, openTabs: newTabs, activeFilePath: newActive };
    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updated : p)));
  };

  const handleCreateFile = (path: string) => {
    if (!activeProject || activeProject.files[path]) return;
    const newFiles = { ...activeProject.files, [path]: '' };
    const updated = {
      ...activeProject,
      files: newFiles,
      activeFilePath: path,
      openTabs: [...activeProject.openTabs, path],
      updatedAt: Date.now(),
    };
    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updated : p)));
  };

  const handleDeleteFile = (path: string) => {
    if (!activeProject) return;
    const fileKeys = Object.keys(activeProject.files);
    if (fileKeys.length <= 1) return;

    const newFiles = { ...activeProject.files };
    delete newFiles[path];

    const newTabs = activeProject.openTabs.filter((t) => t !== path);
    const nextPath = Object.keys(newFiles)[0];
    const newActive = activeProject.activeFilePath === path ? nextPath : activeProject.activeFilePath;

    const updated = {
      ...activeProject,
      files: newFiles,
      openTabs: newTabs.length > 0 ? newTabs : [newActive],
      activeFilePath: newActive,
      updatedAt: Date.now(),
    };
    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updated : p)));
  };

  const handleRenameFile = (oldPath: string, newPath: string) => {
    if (!activeProject || !oldPath || !newPath || oldPath === newPath) return;
    const content = activeProject.files[oldPath];
    const newFiles = { ...activeProject.files };
    delete newFiles[oldPath];
    newFiles[newPath] = content;

    const newTabs = activeProject.openTabs.map((t) => (t === oldPath ? newPath : t));
    const newActive = activeProject.activeFilePath === oldPath ? newPath : activeProject.activeFilePath;

    const updated = {
      ...activeProject,
      files: newFiles,
      openTabs: newTabs,
      activeFilePath: newActive,
      updatedAt: Date.now(),
    };
    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updated : p)));
  };

  const handleChangeFileContent = (path: string, newContent: string) => {
    if (!activeProject) return;
    const updated = {
      ...activeProject,
      files: { ...activeProject.files, [path]: newContent },
      updatedAt: Date.now(),
    };
    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updated : p)));
  };

  // Restore project version
  const handleRestoreVersion = (versionId: string) => {
    if (!activeProject) return;
    const restored = restoreProjectToVersion(activeProject, versionId);
    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? restored : p)));
    setModifiedFiles([]);
  };

  // Undo last turn
  const handleUndoLastTurn = () => {
    if (!activeProject || !activeProject.versions || activeProject.versions.length < 2) return;
    // The previous snapshot
    const prevVersion = activeProject.versions[activeProject.versions.length - 2];
    handleRestoreVersion(prevVersion.id);
  };

  // AI Prompt & Code Generation Flow
  const handleSendMessage = async (promptText: string, useGoogleSearch: boolean = false) => {
    if (!activeProject || isGenerating) return;

    setLastPrompt(promptText);
    setLastUseGoogleSearch(useGoogleSearch);
    setIsGenerating(true);
    setStreamThought(useGoogleSearch ? 'Searching Google & analyzing project context...' : 'Fast synthesis in progress...');

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: Date.now(),
    };

    const projectWithUserMsg: Project = {
      ...activeProject,
      messages: [...(activeProject.messages || []), userMsg],
    };

    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? projectWithUserMsg : p)));

    try {
      // First create snapshot of current state before applying turn
      const snapshotted = createVersionSnapshot(
        projectWithUserMsg,
        `Snapshot before: "${promptText.slice(0, 45)}..."`
      );

      // Call server generation
      let genResult: any = null;

      try {
        await requestGenerationStream(
          promptText,
          snapshotted,
          {
            onThought: (thought) => {
              setStreamThought(thought);
            },
            onComplete: (res) => {
              genResult = res;
            },
            onError: (err) => {
              console.warn('Stream notice:', err);
            },
          },
          useGoogleSearch
        );
      } catch (streamErr) {
        console.warn('Stream fallback to unary:', streamErr);
      }

      // If stream didn't yield result, call fast unary endpoint
      if (!genResult || !genResult.fileOperations) {
        genResult = await requestGeneration(promptText, snapshotted, useGoogleSearch);
      }

      // Apply file operations
      const newFiles = { ...snapshotted.files };
      const touchedList: string[] = [];
      const fileChangesSummary: FileChangeItem[] = [];

      for (const op of genResult.fileOperations || []) {
        touchedList.push(op.path);
        if (op.action === 'create' || op.action === 'update') {
          newFiles[op.path] = op.content || '';
          fileChangesSummary.push({
            action: op.action,
            path: op.path,
            description: op.description,
          });
        } else if (op.action === 'delete') {
          delete newFiles[op.path];
          fileChangesSummary.push({
            action: 'delete',
            path: op.path,
            description: op.description,
          });
        }
      }

      // Record assistant message
      const assistantMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: genResult.summary || 'Generated and updated project files.',
        timestamp: Date.now(),
        thoughts: genResult.thoughts,
        fileChanges: fileChangesSummary,
        groundingSources: genResult.groundingSources,
        suggestedActions: genResult.suggestedActions || [
          'Add light/dark theme switch',
          'Make responsive on mobile viewports',
          'Enhance typography & micro-interactions',
        ],
        status: 'completed',
      };

      // Set active file to first modified file if valid
      let nextActiveFile = snapshotted.activeFilePath;
      if (touchedList.length > 0 && newFiles[touchedList[0]]) {
        nextActiveFile = touchedList[0];
      }

      // Update open tabs to include touched file
      const updatedTabs = snapshotted.openTabs.includes(nextActiveFile)
        ? snapshotted.openTabs
        : [...snapshotted.openTabs, nextActiveFile];

      const postTurnProject: Project = {
        ...snapshotted,
        files: newFiles,
        activeFilePath: nextActiveFile,
        openTabs: updatedTabs,
        updatedAt: Date.now(),
        messages: [...(snapshotted.messages || []), assistantMsg],
      };

      // Create snapshot after modifications
      const finalProject = createVersionSnapshot(
        postTurnProject,
        genResult.summary || `Updated ${touchedList.length} files`
      );

      setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? finalProject : p)));
      setModifiedFiles(touchedList);
    } catch (err: any) {
      console.error('Error generating project files:', err);
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err?.message || 'Failed to generate project changes. Please verify that your Gemini API key is configured on the server.'}`,
        timestamp: Date.now(),
        status: 'error',
        error: err?.message,
      };

      const errorProject = {
        ...projectWithUserMsg,
        messages: [...(projectWithUserMsg.messages || []), errorMsg],
      };

      setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? errorProject : p)));
    } finally {
      setIsGenerating(false);
      setStreamThought('');
    }
  };

  const handleRetryMessage = () => {
    if (lastPrompt) {
      handleSendMessage(lastPrompt, lastUseGoogleSearch);
    }
  };

  const handleAskAiToFix = (errorMessage: string) => {
    handleSendMessage(`Fix this preview runtime error: ${errorMessage}`);
  };

  // Export ZIP
  const handleExportZip = () => {
    if (!activeProject) return;
    exportProjectAsZip(activeProject);
  };

  if (!activeProject) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Loading NovaBuild AI Workspace...
      </div>
    );
  }

  // Get previous version snapshot for diff comparison
  const previousVersionFiles =
    activeProject.versions && activeProject.versions.length >= 2
      ? activeProject.versions[activeProject.versions.length - 2].files
      : undefined;

  return (
    <div className="h-screen w-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden font-sans select-none">
      {/* Top Application Header */}
      <Header
        projectName={activeProject.name}
        onRenameProject={handleRenameProject}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onOpenVersionModal={() => setIsVersionModalOpen(true)}
        versionCount={activeProject.versions?.length || 1}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Project Sidebar */}
        {isSidebarOpen && (
          <ProjectSidebar
            projects={projects}
            activeProjectId={activeProject.id}
            onSelectProject={handleSelectProject}
            onNewProjectClick={() => setIsTemplateModalOpen(true)}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
            onRestoreVersion={handleRestoreVersion}
            onOpenDeployModal={() => setIsDeployModalOpen(true)}
            onExportZip={handleExportZip}
          />
        )}

        {/* Central Chat & Prompt Workspace Area */}
        <div className="w-full sm:w-[380px] lg:w-[440px] shrink-0 h-full border-r border-zinc-800 flex flex-col">
          <ChatPanel
            messages={activeProject.messages || []}
            isGenerating={isGenerating}
            streamThought={streamThought}
            onSendMessage={handleSendMessage}
            onRetryMessage={handleRetryMessage}
            onUndoLastTurn={handleUndoLastTurn}
            canUndo={Boolean(activeProject.versions && activeProject.versions.length >= 2)}
          />
        </div>

        {/* Right Code & Live Preview Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Tree Explorer (Shown in Split & Code modes) */}
          {viewMode !== 'preview' && (
            <FileTree
              files={activeProject.files}
              activeFilePath={activeProject.activeFilePath}
              onSelectFile={handleSelectFile}
              onCreateFile={handleCreateFile}
              onDeleteFile={handleDeleteFile}
              onRenameFile={handleRenameFile}
              modifiedFiles={modifiedFiles}
            />
          )}

          {/* Code Editor (Shown in Split & Code modes) */}
          {viewMode !== 'preview' && (
            <div className={`h-full flex flex-col ${viewMode === 'split' ? 'w-1/2' : 'flex-1'}`}>
              <CodeEditor
                files={activeProject.files}
                activeFilePath={activeProject.activeFilePath}
                openTabs={activeProject.openTabs}
                previousVersionFiles={previousVersionFiles}
                onSelectTab={handleSelectFile}
                onCloseTab={handleCloseTab}
                onChangeContent={handleChangeFileContent}
              />
            </div>
          )}

          {/* Safe Live Preview (Shown in Split & Preview modes) */}
          {viewMode !== 'code' && (
            <div className={`h-full flex flex-col ${viewMode === 'split' ? 'w-1/2' : 'flex-1'}`}>
              <LivePreview
                files={activeProject.files}
                activeProjectName={activeProject.name}
                onAskAiToFix={handleAskAiToFix}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleCreateProjectFromTemplate}
      />

      <DeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        project={activeProject}
        onExportZip={handleExportZip}
      />

      <VersionHistoryModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        project={activeProject}
        onRestoreVersion={handleRestoreVersion}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={user}
        onSelectUser={handleSelectUser}
      />
    </div>
  );
}
