import JSZip from 'jszip';
import { Project } from '../types';

export async function exportProjectAsZip(project: Project): Promise<void> {
  const zip = new JSZip();

  // Add all project files
  for (const [filePath, content] of Object.entries(project.files)) {
    zip.file(filePath, content);
  }

  // Add package.json if not present
  if (!project.files['package.json']) {
    const pkgContent = JSON.stringify({
      name: (project.name || 'novabuild-app').toLowerCase().replace(/[^a-z0-9]/g, '-'),
      private: true,
      version: '0.1.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        react: '^18.3.1',
        'react-dom': '^18.3.1',
        'lucide-react': '^0.468.0'
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.3.4',
        vite: '^6.0.0',
        tailwindcss: '^3.4.17'
      }
    }, null, 2);
    zip.file('package.json', pkgContent);
  }

  // Add vite.config.js if not present
  if (!project.files['vite.config.js'] && !project.files['vite.config.ts']) {
    zip.file('vite.config.js', `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`);
  }

  // Add README if not present
  if (!project.files['README.md']) {
    const readmeContent = `# ${project.name}

Generated with **NovaBuild AI** on ${new Date().toLocaleDateString()}.

## Description
${project.description || 'Modern full-stack web application.'}

## Project Files
${Object.keys(project.files).map(f => `- \`${f}\``).join('\n')}

## Quick Start
1. For static HTML/JS projects:
   Open \`index.html\` directly in any modern browser.

2. For Vite / React projects:
\`\`\`bash
npm install
npm run dev
\`\`\`

---
*Created with NovaBuild AI Studio*
`;
    zip.file('README.md', readmeContent);
  }

  // Generate the zip blob
  const blob = await zip.generateAsync({ type: 'blob' });

  // Trigger download
  const cleanName = (project.name || 'novabuild-project')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${cleanName}-source.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
