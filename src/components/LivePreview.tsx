import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Laptop, 
  Tablet, 
  Smartphone, 
  RotateCw, 
  ExternalLink, 
  Terminal, 
  AlertCircle, 
  CheckCircle2, 
  Sun, 
  Moon,
  Sparkles
} from 'lucide-react';
import { ViewportSize } from '../types';

interface LivePreviewProps {
  files: Record<string, string>;
  activeProjectName: string;
  onAskAiToFix?: (errorMessage: string) => void;
}

interface LogEntry {
  id: string;
  level: 'info' | 'warn' | 'error' | 'log';
  message: string;
  timestamp: string;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  files,
  activeProjectName,
  onAskAiToFix,
}) => {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [debouncedFiles, setDebouncedFiles] = useState(files);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFiles(files);
    }, 250);
    return () => clearTimeout(handler);
  }, [files]);

  // Clear runtime error on reload
  const handleReload = () => {
    setRuntimeError(null);
    setReloadKey((prev) => prev + 1);
  };

  // Listen to postMessage from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.source === 'novabuild-preview-sandbox') {
        if (event.data.type === 'CONSOLE') {
          const entry: LogEntry = {
            id: `log_${Date.now()}_${Math.random()}`,
            level: event.data.level || 'log',
            message: Array.isArray(event.data.args) 
              ? event.data.args.map((a: any) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
              : String(event.data.args),
            timestamp: new Date().toLocaleTimeString(),
          };
          setLogs((prev) => [...prev.slice(-99), entry]);
        } else if (event.data.type === 'RUNTIME_ERROR') {
          setRuntimeError(event.data.message || 'An uncaught error occurred in preview runtime.');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Assemble isolated preview bundle document
  const previewHtml = useMemo(() => {
    const htmlFile = debouncedFiles['index.html'] || debouncedFiles['index.htm'] || '';
    const cssFile = debouncedFiles['src/index.css'] || debouncedFiles['src/App.css'] || debouncedFiles['styles.css'] || debouncedFiles['style.css'] || '';
    
    // Find main JS/JSX entry
    const reactEntry = debouncedFiles['src/App.jsx'] || debouncedFiles['src/App.tsx'] || debouncedFiles['src/main.jsx'] || debouncedFiles['src/main.tsx'] || debouncedFiles['App.jsx'] || debouncedFiles['App.js'];
    const vanillaJs = debouncedFiles['src/main.js'] || debouncedFiles['src/index.js'] || debouncedFiles['main.js'] || debouncedFiles['script.js'] || debouncedFiles['index.js'];

    // If it's a React project
    if (reactEntry) {
      // Clean import statements that Babel standalone in-browser doesn't resolve directly
      let cleanedReactCode = reactEntry
        .replace(/import\s+React\s*,\s*\{([^}]+)\}\s+from\s+['"]react['"];?/g, 'const { $1 } = React;')
        .replace(/import\s+React\s+from\s+['"]react['"];?/g, '')
        .replace(/import\s+\{([^}]+)\}\s+from\s+['"]react['"];?/g, 'const { $1 } = React;')
        .replace(/import\s+.*?from\s+['"].*?\.css['"];?/g, '')
        .replace(/import\s+.*?from\s+['"]lucide-react['"];?/g, '')
        .replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, 'function $1')
        .replace(/export\s+default\s+([A-Za-z0-9_]+);?/g, '')
        .replace(/export\s+/g, '');

      return `<!DOCTYPE html>
<html lang="en" class="${previewTheme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: { extend: {} }
    }
  </script>
  <style>
    ${cssFile}
    /* Safe font defaults */
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  </style>
  <!-- React & Babel Standalone for live client-side transpilation -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script>
    // Console interceptor
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;

    function sendToParent(level, args) {
      try {
        window.parent.postMessage({
          source: 'novabuild-preview-sandbox',
          type: 'CONSOLE',
          level: level,
          args: Array.from(args).map(a => {
            try { return typeof a === 'object' ? JSON.parse(JSON.stringify(a)) : a; } catch(e) { return String(a); }
          })
        }, '*');
      } catch (e) {}
    }

    console.log = function(...args) { sendToParent('log', args); origLog.apply(console, args); };
    console.warn = function(...args) { sendToParent('warn', args); origWarn.apply(console, args); };
    console.error = function(...args) { sendToParent('error', args); origError.apply(console, args); };

    window.onerror = function(msg, url, line, col, error) {
      window.parent.postMessage({
        source: 'novabuild-preview-sandbox',
        type: 'RUNTIME_ERROR',
        message: msg + (line ? ' (Line ' + line + ')' : '')
      }, '*');
    };

    window.addEventListener('unhandledrejection', function(event) {
      window.parent.postMessage({
        source: 'novabuild-preview-sandbox',
        type: 'RUNTIME_ERROR',
        message: event.reason?.message || 'Unhandled Promise Rejection'
      }, '*');
    });
  </script>
</head>
<body class="${previewTheme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900'} antialiased">
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

      ${cleanedReactCode}

      // Identify root component: App or Main
      const TargetComponent = typeof App !== 'undefined' ? App : (typeof Main !== 'undefined' ? Main : null);
      if (TargetComponent) {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<TargetComponent />);
      } else {
        document.getElementById('root').innerHTML = '<div style="padding:2rem;color:#f43f5e;font-family:sans-serif;">No App component found to render.</div>';
      }
    } catch (err) {
      console.error(err);
      window.parent.postMessage({
        source: 'novabuild-preview-sandbox',
        type: 'RUNTIME_ERROR',
        message: err.message
      }, '*');
    }
  </script>
</body>
</html>`;
    }

    // Vanilla HTML/JS project
    let fullHtml = htmlFile;
    if (!fullHtml) {
      fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="p-6">
  <h1 class="text-xl font-bold">NovaBuild Project</h1>
  <p class="text-zinc-500">Edit index.html or ask AI to design this application.</p>
</body>
</html>`;
    }

    // Inject interceptor script into HTML head
    const interceptScript = `
    <script>
      (function() {
        function send(level, args) {
          try {
            window.parent.postMessage({
              source: 'novabuild-preview-sandbox',
              type: 'CONSOLE',
              level: level,
              args: Array.from(args).map(a => String(a))
            }, '*');
          } catch(e) {}
        }
        console.log = function(...args) { send('log', args); };
        console.warn = function(...args) { send('warn', args); };
        console.error = function(...args) { send('error', args); };
        window.onerror = function(msg, u, l) {
          window.parent.postMessage({
            source: 'novabuild-preview-sandbox',
            type: 'RUNTIME_ERROR',
            message: msg + (l ? ' (Line ' + l + ')' : '')
          }, '*');
        };
      })();
    </script>
    `;

    let finalHtml = fullHtml;
    if (finalHtml.includes('</head>')) {
      finalHtml = finalHtml.replace('</head>', `${interceptScript}</head>`);
    } else {
      finalHtml = `${interceptScript}${finalHtml}`;
    }

    // Inject CSS if present
    if (cssFile && !finalHtml.includes(cssFile)) {
      finalHtml = finalHtml.replace('</head>', `<style>${cssFile}</style></head>`);
    }

    // Inject JS if present
    if (vanillaJs) {
      finalHtml = finalHtml.replace('</body>', `<script>${vanillaJs}</script></body>`);
    }

    return finalHtml;
  }, [files, previewTheme]);

  // Open preview in new isolated tab
  const handleOpenExternal = () => {
    try {
      const blob = new Blob([previewHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      console.error('Failed to open external preview window:', e);
    }
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return 'w-[375px] max-h-[740px]';
      case 'tablet':
        return 'w-[768px] max-h-[880px]';
      case 'desktop':
      default:
        return 'w-full h-full';
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-800 select-none">
      {/* Top Preview Controls Toolbar */}
      <div className="h-11 px-3 border-b border-zinc-800 flex items-center justify-between gap-2 bg-zinc-900/60 backdrop-blur">
        {/* Device Switcher */}
        <div className="flex items-center gap-0.5 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded transition ${
              viewport === 'desktop' ? 'bg-zinc-800 text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Desktop (100%)"
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded transition ${
              viewport === 'tablet' ? 'bg-zinc-800 text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Tablet (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded transition ${
              viewport === 'mobile' ? 'bg-zinc-800 text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Mobile (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mock URL / status bar */}
        <div className="flex-1 max-w-xs mx-2 hidden sm:flex items-center gap-2 px-3 py-1 bg-zinc-950/80 rounded-md border border-zinc-800/80 text-[11px] text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="truncate font-mono">https://preview.novabuild.internal</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {/* Theme toggle for preview */}
          <button
            onClick={() => setPreviewTheme(previewTheme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-800 transition"
            title={`Preview Theme: ${previewTheme}`}
          >
            {previewTheme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {/* Reload */}
          <button
            onClick={handleReload}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-800 transition"
            title="Reload Preview"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* External link */}
          <button
            onClick={handleOpenExternal}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-800 transition"
            title="Open in new window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* Console drawer toggle */}
          <button
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition border ${
              isConsoleOpen
                ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Toggle Console Log"
          >
            <Terminal className="w-3 h-3" />
            <span>Console</span>
            {logs.length > 0 && (
              <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-300">
                {logs.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 bg-zinc-950 flex flex-col items-center justify-center p-3 overflow-auto relative">
        {/* Runtime Error Banner if detected */}
        {runtimeError && (
          <div className="absolute top-4 left-4 right-4 z-20 p-4 rounded-xl bg-rose-950/90 border border-rose-800 backdrop-blur shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-200 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-100">Runtime Execution Error</p>
                <p className="font-mono text-[11px] text-rose-300 mt-0.5">{runtimeError}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onAskAiToFix && (
                <button
                  onClick={() => onAskAiToFix(runtimeError)}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium flex items-center gap-1.5 transition shadow"
                >
                  <Sparkles className="w-3 h-3" />
                  Ask AI to Fix
                </button>
              )}
              <button
                onClick={() => setRuntimeError(null)}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* The Sandboxed IFrame */}
        <div
          className={`transition-all duration-200 rounded-xl overflow-hidden shadow-2xl border border-zinc-800/80 bg-zinc-900 ${getViewportWidth()}`}
        >
          <iframe
            key={reloadKey}
            ref={iframeRef}
            title={`Preview of ${activeProjectName}`}
            srcDoc={previewHtml}
            // Strict sandboxing: allow scripts and forms, but restrict same-origin
            sandbox="allow-scripts allow-forms allow-modals allow-popups-to-escape-sandbox"
            className="w-full h-full min-h-[500px] border-0 bg-transparent"
          />
        </div>
      </div>

      {/* Embedded Terminal Console Drawer */}
      {isConsoleOpen && (
        <div className="h-44 border-t border-zinc-800 bg-zinc-950/95 flex flex-col z-10 font-mono text-xs">
          <div className="h-8 px-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
            <div className="flex items-center gap-2 text-zinc-400">
              <Terminal className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">Preview Console ({logs.length} logs)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLogs([])}
                className="text-[10px] text-zinc-400 hover:text-zinc-200 transition"
              >
                Clear
              </button>
              <button
                onClick={() => setIsConsoleOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 text-xs px-1"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {logs.length === 0 ? (
              <p className="text-zinc-600 italic text-[11px] p-2">Console log is clean. Runtime output will stream here.</p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`px-2 py-1 rounded text-[11px] flex items-start gap-2 ${
                    log.level === 'error'
                      ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500'
                      : log.level === 'warn'
                      ? 'bg-amber-950/40 text-amber-300 border-l-2 border-amber-500'
                      : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <span className="text-zinc-500 shrink-0 text-[10px]">{log.timestamp}</span>
                  <span className="break-all whitespace-pre-wrap">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
