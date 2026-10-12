import React, { useState } from 'react';
import { X, Sparkles, Layout, BarChart3, CheckSquare, Layers, ArrowRight } from 'lucide-react';
import { STARTER_TEMPLATES } from '../services/templates';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string, projectName: string) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedId, setSelectedId] = useState(STARTER_TEMPLATES[0].id);
  const [name, setName] = useState('My Next App');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSelectTemplate(selectedId as string, name.trim());
    onClose();
  };

  const getTemplateIcon = (id: string) => {
    switch (id) {
      case 'react-saas-dashboard':
        return <BarChart3 className="w-5 h-5 text-indigo-400" />;
      case 'kanban-board':
        return <CheckSquare className="w-5 h-5 text-emerald-400" />;
      case 'react-portfolio':
      default:
        return <Layout className="w-5 h-5 text-violet-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Create New Project
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select an initial starter architectural template or start blank.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">Project Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme SaaS Platform"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-300">Choose Starter Architecture</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {STARTER_TEMPLATES.map((tpl) => {
                const isSelected = selectedId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      setSelectedId(tpl.id);
                      if (name === 'My Next App' || !name) {
                        setName(tpl.name);
                      }
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'bg-indigo-600/10 border-indigo-500/80 ring-1 ring-indigo-500/30'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        {getTemplateIcon(tpl.id as string)}
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {tpl.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-white">{tpl.name}</h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
                        {tpl.description}
                      </p>
                    </div>

                    <div className="pt-2 text-[10px] text-zinc-500 flex items-center justify-between border-t border-zinc-800/60">
                      <span>{Object.keys(tpl.files).length} files</span>
                      <span className="capitalize">{tpl.framework}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
            >
              <span>Initialize Project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
