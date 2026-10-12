import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Search, 
  GitCompare, 
  Code2, 
  Maximize2,
  FileCode
} from 'lucide-react';

interface CodeEditorProps {
  files: Record<string, string>;
  activeFilePath: string;
  openTabs: string[];
  previousVersionFiles?: Record<string, string>;
  onSelectTab: (path: string) => void;
  onCloseTab: (path: string) => void;
  onChangeContent: (path: string, newContent: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  files,
  activeFilePath,
  openTabs,
  previousVersionFiles = {},
  onSelectTab,
  onCloseTab,
  onChangeContent,
}) => {
  const [copied, setCopied] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDiffMode, setIsDiffMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentContent = files[activeFilePath] || '';
  const previousContent = previousVersionFiles[activeFilePath] || '';

  const lines = currentContent.split('\n');

  // Copy code handler
  const handleCopy = () => {
    navigator.clipboard?.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Tab key in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newContent =
        currentContent.substring(0, start) + '  ' + currentContent.substring(end);
      onChangeContent(activeFilePath, newContent);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Simple line diff calculation for diff mode
  const diffLines = React.useMemo(() => {
    if (!isDiffMode || !previousContent) return [];
    const prevLines = previousContent.split('\n');
    const currLines = currentContent.split('\n');

    const result: Array<{ type: 'same' | 'added' | 'removed'; text: string; lineNo?: number }> = [];
    let p = 0;
    let c = 0;

    while (p < prevLines.length || c < currLines.length) {
      if (p < prevLines.length && c < currLines.length) {
        if (prevLines[p] === currLines[c]) {
          result.push({ type: 'same', text: currLines[c], lineNo: c + 1 });
          p++;
          c++;
        } else {
          result.push({ type: 'removed', text: prevLines[p] });
          result.push({ type: 'added', text: currLines[c], lineNo: c + 1 });
          p++;
          c++;
        }
      } else if (p < prevLines.length) {
        result.push({ type: 'removed', text: prevLines[p] });
        p++;
      } else if (c < currLines.length) {
        result.push({ type: 'added', text: currLines[c], lineNo: c + 1 });
        c++;
      }
    }
    return result;
  }, [isDiffMode, previousContent, currentContent]);

  return (
    <div className="flex-1 h-full bg-zinc-950 flex flex-col font-mono text-xs select-none">
      {/* Tabs Header */}
      <div className="h-10 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between px-2 overflow-x-auto">
        <div className="flex items-center gap-1 overflow-x-auto">
          {openTabs.map((path) => {
            const isActive = path === activeFilePath;
            const fileName = path.split('/').pop() || path;
            return (
              <div
                key={path}
                onClick={() => onSelectTab(path)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-md text-xs cursor-pointer border-b-2 transition ${
                  isActive
                    ? 'bg-zinc-900 text-white border-indigo-500 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-900/40'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                <span className="truncate max-w-[120px]">{fileName}</span>
                {openTabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(path);
                    }}
                    className="p-0.5 text-zinc-500 hover:text-zinc-200 rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Editor Actions Toolbar */}
        <div className="flex items-center gap-1 text-zinc-400 shrink-0 ml-2">
          {previousContent && (
            <button
              onClick={() => setIsDiffMode(!isDiffMode)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition ${
                isDiffMode
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'hover:bg-zinc-800 hover:text-zinc-200'
              }`}
              title="Toggle Diff against previous turn"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>{isDiffMode ? 'Exit Diff' : 'View Diff'}</span>
            </button>
          )}

          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-1.5 hover:text-zinc-200 hover:bg-zinc-800 rounded transition"
            title="Find in file"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 hover:text-zinc-200 hover:bg-zinc-800 rounded transition flex items-center gap-1"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Find Bar */}
      {showSearch && (
        <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in file..."
              className="w-full bg-zinc-800 px-2 py-1 rounded text-zinc-100 border border-zinc-700 text-xs focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowSearch(false)}
            className="text-zinc-400 hover:text-zinc-200 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {isDiffMode ? (
          /* Diff Mode View */
          <div className="flex-1 overflow-auto p-4 space-y-0.5 select-text">
            <div className="text-[11px] text-zinc-400 pb-2 border-b border-zinc-800 mb-2 font-sans flex items-center justify-between">
              <span>Diff compare: latest generated code vs previous turn snapshot</span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400">+ Added Lines</span>
                <span className="text-rose-400">- Removed Lines</span>
              </div>
            </div>
            {diffLines.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-start text-xs leading-relaxed px-2 py-0.5 rounded ${
                  item.type === 'added'
                    ? 'bg-emerald-950/40 text-emerald-200'
                    : item.type === 'removed'
                    ? 'bg-rose-950/40 text-rose-300'
                    : 'text-zinc-400'
                }`}
              >
                <span className="w-10 text-right pr-4 text-zinc-600 select-none text-[11px]">
                  {item.lineNo || ''}
                </span>
                <span className="w-4 select-none text-zinc-500 font-bold">
                  {item.type === 'added' ? '+' : item.type === 'removed' ? '-' : ' '}
                </span>
                <span className="flex-1 whitespace-pre-wrap break-all">{item.text}</span>
              </div>
            ))}
          </div>
        ) : (
          /* Live Monospace Code Editor */
          <div className="flex-1 flex overflow-hidden">
            {/* Line Numbers */}
            <div className="w-12 py-3 bg-zinc-950/80 border-r border-zinc-800/60 text-right pr-3 select-none text-zinc-600 font-mono text-xs">
              {lines.map((_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code Input */}
            <textarea
              ref={textareaRef}
              value={currentContent}
              onChange={(e) => onChangeContent(activeFilePath, e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="flex-1 bg-transparent p-3 text-zinc-200 font-mono text-xs leading-6 resize-none focus:outline-none select-text overflow-auto"
            />
          </div>
        )}
      </div>

      {/* Editor Footer Status Bar */}
      <div className="h-6 px-4 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-sans">
        <div className="flex items-center gap-3">
          <span>{activeFilePath}</span>
          <span>{lines.length} lines</span>
          <span>{currentContent.length} chars</span>
        </div>
        <div className="flex items-center gap-3">
          <span>UTF-8</span>
          <span>Spaces: 2</span>
          <span>NovaBuild Live Sync</span>
        </div>
      </div>
    </div>
  );
};
