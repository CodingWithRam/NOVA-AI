export type TemplateType = 'react' | 'vanilla' | 'blank';

export interface ProjectVersion {
  id: string;
  versionNumber: number;
  timestamp: number;
  summary: string;
  files: Record<string, string>;
}

export interface FileChangeItem {
  action: 'create' | 'update' | 'delete';
  path: string;
  description?: string;
  addedLines?: number;
  removedLines?: number;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  thoughts?: string;
  fileChanges?: FileChangeItem[];
  suggestedActions?: string[];
  groundingSources?: GroundingSource[];
  status?: 'sending' | 'streaming' | 'completed' | 'error';
  error?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  template: TemplateType;
  files: Record<string, string>;
  activeFilePath: string;
  openTabs: string[];
  createdAt: number;
  updatedAt: number;
  userId: string;
  versions: ProjectVersion[];
  messages: ChatMessage[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export type ViewportSize = 'desktop' | 'tablet' | 'mobile';
export type ViewMode = 'split' | 'code' | 'preview';

export interface DeploymentDetails {
  deploymentId: string;
  domain: string;
  url: string;
  status: 'ready' | 'building' | 'failed';
  stats: {
    fileCount: number;
    totalBytes: number;
    framework: string;
    hasIndexHtml: boolean;
    hasPackageJson: boolean;
  };
  cliCommands: {
    vercel: string;
    netlify: string;
    cloudflare: string;
  };
  timestamp: number;
}
