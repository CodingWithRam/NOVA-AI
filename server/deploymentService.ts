export interface DeploymentRecord {
  id: string;
  projectName: string;
  html: string;
  createdAt: number;
}

// In-memory store for instant live deployments
const deploymentStore = new Map<string, DeploymentRecord>();

export function createLiveDeployment(projectName: string, files: Record<string, string>): DeploymentRecord {
  const cleanId = `live_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
  
  const htmlFile = files['index.html'] || files['index.htm'] || '';
  const cssFile = files['src/index.css'] || files['src/App.css'] || files['styles.css'] || files['style.css'] || '';
  const reactEntry = files['src/App.jsx'] || files['src/App.tsx'] || files['src/main.jsx'] || files['src/main.tsx'] || files['App.jsx'] || files['App.js'];
  const vanillaJs = files['src/main.js'] || files['src/index.js'] || files['main.js'] || files['script.js'] || files['index.js'];

  let finalHtml = '';

  if (reactEntry) {
    // Clean react imports for in-browser standalone execution
    const cleanedCode = reactEntry
      .replace(/import\s+React\s*,\s*\{([^}]+)\}\s+from\s+['"]react['"];?/g, 'const { $1 } = React;')
      .replace(/import\s+React\s+from\s+['"]react['"];?/g, '')
      .replace(/import\s+\{([^}]+)\}\s+from\s+['"]react['"];?/g, 'const { $1 } = React;')
      .replace(/import\s+.*?from\s+['"].*?\.css['"];?/g, '')
      .replace(/import\s+.*?from\s+['"]lucide-react['"];?/g, '')
      .replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, 'function $1')
      .replace(/export\s+default\s+([A-Za-z0-9_]+);?/g, '')
      .replace(/export\s+/g, '');

    finalHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName} — Live App</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: { extend: {} }
    }
  </script>
  <style>
    ${cssFile}
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  </style>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="bg-zinc-950 text-zinc-100 antialiased min-h-screen">
  <div id="root"></div>

  <script type="text/babel">
    try {
      // Universal Lucide icon fallbacks
      const defaultIcon = (props) => React.createElement('svg', {
        viewBox: '0 0 24 24',
        width: props?.size || 18,
        height: props?.size || 18,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        className: props?.className || '',
        ...props
      }, React.createElement('circle', { cx: 12, cy: 12, r: 8 }));

      const iconList = [
        'Sparkles','Sun','Moon','Play','Check','X','ChevronDown','ChevronUp','ChevronRight','ChevronLeft',
        'Search','Plus','Trash2','Trash','Edit','Edit2','Edit3','Copy','ExternalLink','Download','Rocket',
        'Globe','Zap','AlertCircle','CheckCircle2','Loader2','Undo2','Lightbulb','Bot','User','Terminal',
        'Laptop','Tablet','Smartphone','RotateCw','RotateCcw','Code2','FileCode','FileText','FileJson','Folder',
        'BarChart3','CheckSquare','Layout','Layers','History','Clock','ShieldCheck','Users','LogIn','LogOut',
        'ArrowRight','ArrowLeft','ArrowUpRight','Menu','Filter','Star','Heart','Share2','Eye','Settings'
      ];
      iconList.forEach(name => {
        if (typeof window[name] === 'undefined') {
          window[name] = defaultIcon;
        }
      });

      ${cleanedCode}

      const RootComp = typeof App !== 'undefined' ? App : (typeof Main !== 'undefined' ? Main : null);
      if (RootComp) {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<RootComp />);
      } else {
        document.getElementById('root').innerHTML = '<div style="padding:2rem;color:#f43f5e;">No App component found to render.</div>';
      }
    } catch (err) {
      document.getElementById('root').innerHTML = '<div style="padding:2rem;color:#f43f5e;">Runtime Error: ' + err.message + '</div>';
    }
  </script>
</body>
</html>`;
  } else {
    // Vanilla static project
    let base = htmlFile || `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="p-6"><h1>${projectName}</h1></body></html>`;
    if (cssFile && !base.includes(cssFile)) {
      base = base.replace('</head>', `<style>${cssFile}</style></head>`);
    }
    if (vanillaJs) {
      base = base.replace('</body>', `<script>${vanillaJs}</script></body>`);
    }
    finalHtml = base;
  }

  const record: DeploymentRecord = {
    id: cleanId,
    projectName,
    html: finalHtml,
    createdAt: Date.now(),
  };

  deploymentStore.set(cleanId, record);
  return record;
}

export function getLiveDeployment(id: string): DeploymentRecord | undefined {
  return deploymentStore.get(id);
}
