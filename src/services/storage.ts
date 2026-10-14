import { Project, ProjectVersion, UserProfile, TemplateType, RegisteredAccount } from '../types';
import { STARTER_TEMPLATES } from './templates';

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user_alex',
    name: 'Alex Rivera',
    email: 'alex.rivera@novabuild.internal',
    provider: 'workspace',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
    role: 'Lead Architect',
  },
  {
    id: 'user_maya',
    name: 'Maya Chen',
    email: 'maya.chen@novabuild.internal',
    provider: 'workspace',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=128&q=80',
    role: 'Product Engineer',
  },
  {
    id: 'user_guest',
    name: 'Guest Developer',
    email: 'guest@novabuild.internal',
    provider: 'guest',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80',
    role: 'Explorer',
  },
];

const STORAGE_KEY_PREFIX = 'novabuild_projects_';
const CURRENT_USER_KEY = 'novabuild_active_user';
const REGISTERED_ACCOUNTS_KEY = 'novabuild_registered_accounts';

export function getRegisteredAccounts(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return [];
}

export function saveRegisteredAccount(account: RegisteredAccount): void {
  try {
    const existing = getRegisteredAccounts();
    const filtered = existing.filter((a) => a.id !== account.id && a.email !== account.email && (!account.phone || a.phone !== account.phone));
    localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify([account, ...filtered]));
  } catch (e) {
    console.error('Failed to save registered account:', e);
  }
}

export function getActiveUser(): UserProfile {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return DEFAULT_USERS[0];
}

export function setActiveUser(user: UserProfile): void {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (e) {
    // ignore
  }
}

export function logoutActiveUser(): UserProfile {
  const guestUser: UserProfile = {
    id: `guest_${Date.now()}`,
    name: 'Guest Developer',
    email: 'guest@novabuild.local',
    provider: 'guest',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80',
    role: 'Guest Developer',
  };
  setActiveUser(guestUser);
  return guestUser;
}

export function loadProjectsForUser(userId: string): Project[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read projects from storage, seeding defaults:', e);
  }

  // Seed initial project for new user from first template
  const initial = createProjectFromTemplate(userId, 'Modern Developer Portfolio', 'react-portfolio');
  const seededList = [initial];
  saveProjectsForUser(userId, seededList);
  return seededList;
}

export function saveProjectsForUser(userId: string, projects: Project[]): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects to localStorage:', e);
  }
}

export function createProjectFromTemplate(
  userId: string,
  name: string,
  templateId: string = 'react-portfolio'
): Project {
  const tpl = STARTER_TEMPLATES.find((t) => t.id === templateId) || STARTER_TEMPLATES[0];
  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const initialFiles = { ...tpl.files };
  const firstFilePath = Object.keys(initialFiles).find(f => f.includes('App') || f.includes('index.html')) || Object.keys(initialFiles)[0];

  const initialVersion: ProjectVersion = {
    id: `v_${Date.now()}_1`,
    versionNumber: 1,
    timestamp: Date.now(),
    summary: `Initialized from template "${tpl.name}"`,
    files: { ...initialFiles },
  };

  const project: Project = {
    id: projectId,
    name,
    description: tpl.description,
    template: tpl.id as TemplateType,
    files: initialFiles,
    activeFilePath: firstFilePath,
    openTabs: [firstFilePath],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    userId,
    versions: [initialVersion],
    messages: [
      {
        id: `msg_init_${Date.now()}`,
        role: 'assistant',
        content: `Welcome to NovaBuild AI. I have prepared the initial **${tpl.name}** workspace. You can preview it in the live panel, modify code in the editor, or instruct me in natural language to add features, adjust layout, or style components.`,
        timestamp: Date.now(),
        suggestedActions: [
          'Add a contact form modal with validation',
          'Make header navigation sticky with blur',
          'Add light/dark theme toggle',
          'Enhance typography and spacing'
        ]
      }
    ],
  };

  return project;
}

export function createVersionSnapshot(project: Project, summary: string): Project {
  const nextNum = (project.versions?.length || 0) + 1;
  const newVer: ProjectVersion = {
    id: `v_${Date.now()}_${nextNum}`,
    versionNumber: nextNum,
    timestamp: Date.now(),
    summary,
    files: { ...project.files },
  };

  return {
    ...project,
    updatedAt: Date.now(),
    versions: [...(project.versions || []), newVer],
  };
}

export function restoreProjectToVersion(project: Project, versionId: string): Project {
  const ver = project.versions.find((v) => v.id === versionId);
  if (!ver) return project;

  const restoredFiles = { ...ver.files };
  const activeFilePath = Object.keys(restoredFiles).includes(project.activeFilePath)
    ? project.activeFilePath
    : Object.keys(restoredFiles)[0];

  const updatedProject = {
    ...project,
    files: restoredFiles,
    activeFilePath,
    updatedAt: Date.now(),
  };

  return createVersionSnapshot(updatedProject, `Restored to version ${ver.versionNumber}: ${ver.summary}`);
}

export function deleteVersionSnapshot(project: Project, versionId: string): Project {
  if (!project.versions || project.versions.length <= 1) return project;
  const filtered = project.versions.filter((v) => v.id !== versionId);
  return {
    ...project,
    updatedAt: Date.now(),
    versions: filtered,
  };
}

export function cleanProjectHistory(project: Project): Project {
  if (!project.versions || project.versions.length <= 1) return project;
  // Keep the latest version snapshot and make it v1
  const latest = project.versions[project.versions.length - 1];
  const cleanedVer: ProjectVersion = {
    ...latest,
    id: `v_${Date.now()}_1`,
    versionNumber: 1,
    summary: `Cleaned checkpoint: ${latest.summary}`,
    timestamp: Date.now(),
  };
  return {
    ...project,
    updatedAt: Date.now(),
    versions: [cleanedVer],
  };
}

