import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  RotateCcw, 
  FileCode, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Undo2,
  Lightbulb,
  Globe,
  Zap,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { ChatMessage, FileChangeItem } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  streamThought?: string;
  onSendMessage: (prompt: string, useGoogleSearch?: boolean) => void;
  onRetryMessage: () => void;
  onUndoLastTurn: () => void;
  canUndo: boolean;
  onClearChat?: () => void;
}

const QUICK_PROMPTS = [
  '🛡️ Auto-Fix Errors (Internet Search)',
  'Add dark/light theme switch',
  'Make layout fully responsive',
  'Add search and filtering',
  'Add smooth hover animations',
];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isGenerating,
  streamThought,
  onSendMessage,
  onRetryMessage,
  onUndoLastTurn,
  canUndo,
  onClearChat,
}) => {
  const [input, setInput] = useState('');
  const [useGoogleSearch, setUseGoogleSearch] = useState(false);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating, streamThought]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const clean = input.trim();
    if (!clean || isGenerating) return;
    onSendMessage(clean, useGoogleSearch);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleThought = (id: string) => {
    setExpandedThoughts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 h-full bg-zinc-950 flex flex-col select-none border-r border-zinc-800/80">
      {/* Chat Header Toolbar with Clean Chat History */}
      <div className="h-10 px-4 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-semibold text-zinc-200">Nova AI Assistant</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
        </div>

        {onClearChat && messages.length > 0 && (
          <button
            onClick={onClearChat}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition"
            title="Clean chat conversation history"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clean Chat</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="max-w-sm space-y-1">
              <h3 className="text-base font-semibold text-white">Nova AI Workspace</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Describe an application or feature in natural language. Nova AI generates code, updates files, and maintains live preview.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role !== 'user' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl space-y-3 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-sm shadow-md'
                    : 'bg-zinc-900/80 border border-zinc-800 text-zinc-200 p-4 rounded-2xl rounded-tl-sm w-full'
                }`}
              >
                {/* Content */}
                <div className="leading-relaxed whitespace-pre-wrap select-text">
                  {msg.content}
                </div>

                {/* Google Search Grounding Sources */}
                {msg.groundingSources && msg.groundingSources.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Google Search Sources ({msg.groundingSources.length}):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.groundingSources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white transition group"
                        >
                          <span className="truncate max-w-[220px]">{src.title}</span>
                          <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-indigo-400 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Reasoning / Thoughts dropdown */}
                {msg.thoughts && (
                  <div className="pt-1">
                    <button
                      onClick={() => toggleThought(msg.id)}
                      className="text-[11px] font-medium text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>Architectural Reasoning</span>
                      {expandedThoughts[msg.id] ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                    {expandedThoughts[msg.id] && (
                      <div className="mt-2 p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed font-mono select-text">
                        {msg.thoughts}
                      </div>
                    )}
                  </div>
                )}

                {/* File Changes Summary */}
                {msg.fileChanges && msg.fileChanges.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                    <span className="text-[11px] font-semibold text-zinc-400">
                      Modified Files ({msg.fileChanges.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {msg.fileChanges.map((fc, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded bg-zinc-950/60 border border-zinc-800/60 text-[11px]"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="font-mono text-zinc-300 truncate">{fc.path}</span>
                          </div>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded capitalize ${
                              fc.action === 'create'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : fc.action === 'delete'
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-sky-500/10 text-sky-400'
                            }`}
                          >
                            {fc.action}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested follow-up actions */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                      <Lightbulb className="w-3 h-3 text-amber-400" />
                      <span>Suggested iterations:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => onSendMessage(suggestion, useGoogleSearch)}
                          className="px-2.5 py-1 rounded-md bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 text-[11px] transition text-left"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error status card */}
                {msg.status === 'error' && (
                  <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{msg.error || 'Request could not be completed.'}</span>
                    </div>
                    <button
                      onClick={onRetryMessage}
                      className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-[11px] flex items-center gap-1 shrink-0"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Retry
                    </button>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Live Generation Indicator */}
        {isGenerating && (
          <div className="flex gap-3 text-xs items-start">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-sm bg-zinc-900 border border-zinc-800 text-zinc-300 space-y-2 max-w-md shadow-lg">
              <div className="flex items-center gap-2 text-indigo-400 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>
                  {useGoogleSearch ? 'Searching Google & synthesizing code...' : 'Fast synthesis in progress...'}
                </span>
              </div>
              <p className="text-zinc-400 text-[11px] font-mono leading-relaxed">
                {streamThought || 'Analyzing project context and updating files...'}
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 border-t border-zinc-800/80 bg-zinc-950/90 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider shrink-0 font-medium">
          Ideas:
        </span>
        {QUICK_PROMPTS.map((qp, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(qp, useGoogleSearch)}
            disabled={isGenerating}
            className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] shrink-0 transition disabled:opacity-50"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Main Input Box */}
      <div className="p-3 sm:p-4 border-t border-zinc-800 bg-zinc-900/60 backdrop-blur">
        <form onSubmit={handleSubmit} className="relative flex flex-col gap-2">
          {/* Controls toolbar above textarea */}
          <div className="flex items-center justify-between text-xs px-1">
            {/* Google Search Toggle Button */}
            <button
              type="button"
              onClick={() => setUseGoogleSearch(!useGoogleSearch)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition border ${
                useGoogleSearch
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
              }`}
              title="Search Google for real-time web documentation, citations, and libraries"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Search on Google</span>
              {useGoogleSearch && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
            </button>

            {/* Fast Mode Indicator */}
            <div className="flex items-center gap-1 text-[11px] text-indigo-400 font-mono">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Turbo Flash (~2s)</span>
            </div>
          </div>

          <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500/30 transition shadow-inner">
            <textarea
              ref={textareaRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder={
                useGoogleSearch
                  ? "Search Google or prompt (e.g. 'Find latest Tailwind CSS v4 setup and apply it to App.jsx')..."
                  : "Describe what you want to build or change (e.g. 'Add a clean pricing calculator with 3 tiers')..."
              }
              className="w-full bg-transparent px-4 py-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none leading-relaxed select-text"
            />

            <div className="px-3 pb-2.5 flex items-center justify-between text-[11px] text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 font-mono text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Nova AI Turbo (Active)
                </span>
                {canUndo && (
                  <button
                    type="button"
                    onClick={onUndoLastTurn}
                    className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition"
                    title="Undo latest AI turn"
                  >
                    <Undo2 className="w-3 h-3" />
                    <span>Undo Turn</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-zinc-500 text-[10px]">
                  Press <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-300">Enter</kbd> to send
                </span>
                <button
                  type="submit"
                  disabled={!input.trim() || isGenerating}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  {isGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Generate</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
