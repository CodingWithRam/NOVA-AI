import { TemplateType } from '../types';

export interface TemplateDefinition {
  id: TemplateType | string;
  name: string;
  description: string;
  category: string;
  framework: 'react' | 'vanilla';
  files: Record<string, string>;
  defaultPrompt: string;
}

export const STARTER_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'react-portfolio',
    name: 'Modern Developer Portfolio',
    description: 'Clean personal showcase with projects gallery, skill tags, live demos, and contact form.',
    category: 'Portfolio',
    framework: 'react',
    defaultPrompt: 'Create a modern developer portfolio with project showcases, skills matrix, and a contact form.',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Alex Rivera — Creative Engineer</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: { 500: '#6366f1', 600: '#4f46e5' }
          }
        }
      }
    }
  </script>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen antialiased">
  <div id="root"></div>
</body>
</html>`,
      'src/App.jsx': `import React, { useState } from 'react';

export default function App() {
  const [filter, setFilter] = useState('all');
  const [copied, setCopied] = useState(false);

  const projects = [
    {
      title: 'Aura Cloud Platform',
      category: 'cloud',
      desc: 'Distributed observability dashboard with real-time telemetry streaming.',
      tech: ['React', 'TypeScript', 'WebSockets', 'Tailwind'],
      stats: '1.2M queries/sec'
    },
    {
      title: 'Synthetix Neural Engine',
      category: 'ai',
      desc: 'Local-first multimodal inference workbench for real-time edge processing.',
      tech: ['Python', 'WASM', 'ONNX', 'Vite'],
      stats: '14ms latency'
    },
    {
      title: 'Krypton Design System',
      category: 'frontend',
      desc: 'Accessible component library with 60+ primitives and strict tokens.',
      tech: ['React', 'CSS Modules', 'Storybook', 'Figma'],
      stats: '4.8k GitHub stars'
    }
  ];

  const filtered = filter === 'all' ? projects : projects.filter(p => p.category === filter);

  const copyEmail = () => {
    navigator.clipboard?.writeText('alex@rivera.dev');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-20">
      {/* Hero */}
      <header className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Available for senior architectural roles & consulting
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white">
          Alex Rivera
        </h1>
        
        <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
          Full-stack engineer & systems architect building resilient developer platforms, real-time reactive interfaces, and generative AI systems.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button 
            onClick={copyEmail}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            {copied ? 'Email Copied!' : 'alex@rivera.dev'}
          </button>
          <a href="#projects" className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition">
            Explore Work
          </a>
        </div>
      </header>

      {/* Featured Projects */}
      <section id="projects" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Featured Architecture</h2>
            <p className="text-sm text-zinc-400">Selected client solutions and open-source packages</p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800 text-xs">
            {['all', 'cloud', 'ai', 'frontend'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={\`px-3 py-1.5 rounded-md font-medium capitalize transition \${filter === cat ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}\`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((proj, i) => (
            <article 
              key={i} 
              className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="uppercase tracking-wider font-semibold text-indigo-400">{proj.category}</span>
                  <span>{proj.stats}</span>
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition">
                  {proj.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {proj.desc}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/50">
                {proj.tech.map(t => (
                  <span key={t} className="text-xs text-zinc-400 font-mono">
                    #{t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Skills Matrix */}
      <section className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-6">
        <h2 className="text-xl font-semibold text-white">Core Competencies</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
          <div>
            <h3 className="font-medium text-indigo-400 mb-2">Frontend</h3>
            <p className="text-zinc-400 leading-relaxed">React, Next.js, TypeScript, Tailwind, WebGL, WebSockets</p>
          </div>
          <div>
            <h3 className="font-medium text-emerald-400 mb-2">Backend</h3>
            <p className="text-zinc-400 leading-relaxed">Node.js, Go, Express, PostgreSQL, Redis, GraphQL</p>
          </div>
          <div>
            <h3 className="font-medium text-amber-400 mb-2">AI & Agents</h3>
            <p className="text-zinc-400 leading-relaxed">Gemini SDK, Tool Calling, Vector Stores, RAG Pipelines</p>
          </div>
          <div>
            <h3 className="font-medium text-rose-400 mb-2">DevOps</h3>
            <p className="text-zinc-400 leading-relaxed">Docker, Kubernetes, GitHub Actions, Terraform, GCP</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-zinc-800 text-xs text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 Alex Rivera. Built with NovaBuild AI.</p>
        <p className="font-mono">Status: All systems operational</p>
      </footer>
    </div>
  );
}`,
      'src/index.css': `/* Custom Portfolio Styling */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}`
    }
  },
  {
    id: 'react-saas-dashboard',
    name: 'SaaS Analytics Dashboard',
    description: 'Executive overview with revenue stats, interactive time range selector, conversion metrics, and recent team activities.',
    category: 'Dashboard',
    framework: 'react',
    defaultPrompt: 'Create a comprehensive SaaS analytics dashboard with KPI cards, activity feed, and interactive filter controls.',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NovaMetrics — SaaS Analytics</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen antialiased">
  <div id="root"></div>
</body>
</html>`,
      'src/App.jsx': `import React, { useState } from 'react';

export default function App() {
  const [period, setPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Monthly Recurring Revenue', value: '$128,450', change: '+14.2%', trend: 'up' },
    { label: 'Active Enterprise Seats', value: '4,892', change: '+8.1%', trend: 'up' },
    { label: 'Average Churn Rate', value: '0.84%', change: '-0.12%', trend: 'down' },
    { label: 'API Uptime (30d)', value: '99.99%', change: 'Optimal', trend: 'neutral' }
  ];

  const recentTransactions = [
    { user: 'Acme Global Corp', plan: 'Enterprise (250 seats)', amount: '$12,500', time: '12m ago', status: 'Completed' },
    { user: 'Vertex Labs Inc', plan: 'Pro Tier', amount: '$499', time: '45m ago', status: 'Completed' },
    { user: 'Horizon Media', plan: 'Pro Tier', amount: '$499', time: '2h ago', status: 'Completed' },
    { user: 'Starlight Retail', plan: 'Custom Scale', amount: '$4,200', time: '4h ago', status: 'Processing' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between bg-zinc-900/40 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
            N
          </div>
          <div>
            <span className="font-semibold text-white tracking-tight">NovaMetrics</span>
            <span className="text-xs text-zinc-400 ml-2">Production Cluster #1</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-medium">
            {['7d', '30d', '90d', '1y'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={\`px-3 py-1 rounded \${period === p ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}\`}
              >
                {p}
              </button>
            ))}
          </div>

          <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition">
            Export Report
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <p className="text-xs font-medium text-zinc-400">{s.label}</p>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white">{s.value}</span>
                <span className={\`text-xs font-medium \${s.trend === 'up' ? 'text-emerald-400' : s.trend === 'down' ? 'text-indigo-400' : 'text-zinc-400'}\`}>
                  {s.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visualizer Bar */}
          <div className="lg:col-span-2 p-6 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Revenue Ingestion Velocity</h2>
                <p className="text-xs text-zinc-400">Comparing real-time telemetry over selected {period}</p>
              </div>
              <span className="text-xs text-emerald-400 font-medium">Live Sync Active</span>
            </div>

            {/* Simulated Chart Bars */}
            <div className="h-48 flex items-end gap-2 pt-8 px-2 border-b border-zinc-800">
              {[45, 62, 55, 78, 68, 85, 92, 88, 70, 95, 110, 105, 120, 135].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div 
                    style={{ height: \`\${(val / 140) * 100}%\` }} 
                    className="w-full bg-indigo-500/80 hover:bg-indigo-400 rounded-t transition-all cursor-pointer relative"
                  >
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-800 text-[10px] text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                      \${val}k
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
              <span>Day 1</span>
              <span>Day 7</span>
              <span>Day 14</span>
              <span>Day 21</span>
              <span>Day 30</span>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-semibold text-white mb-1">Live Ingestion Log</h2>
              <p className="text-xs text-zinc-400 mb-4">Latest high-value enterprise subscription events</p>

              <div className="space-y-3">
                {recentTransactions.map((tx, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-white">{tx.user}</p>
                      <p className="text-zinc-400 text-[11px]">{tx.plan}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-400">{tx.amount}</p>
                      <p className="text-zinc-400 text-[10px]">{tx.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition">
              View All 428 Logs
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}`,
      'src/index.css': `@import "tailwindcss";`
    }
  },
  {
    id: 'kanban-board',
    name: 'Interactive Kanban Workspace',
    description: 'Dynamic productivity board with columns, task creation, tag filters, and drag/click task state transitions.',
    category: 'Productivity',
    framework: 'react',
    defaultPrompt: 'Build an interactive Kanban board with drag-or-click column transitions, new card creator, and priority badges.',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NovaTasks — Kanban Flow</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen antialiased">
  <div id="root"></div>
</body>
</html>`,
      'src/App.jsx': `import React, { useState } from 'react';

export default function App() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Implement OAuth Token Refresh Flow', col: 'todo', priority: 'high', assignee: 'Alex' },
    { id: '2', title: 'Audit PostgreSQL Index Strategy for Hot Paths', col: 'in_progress', priority: 'medium', assignee: 'Sam' },
    { id: '3', title: 'Setup Sandboxed Preview Runtime', col: 'in_progress', priority: 'urgent', assignee: 'Jordan' },
    { id: '4', title: 'Tailwind CSS v4 Dark Mode Alignment', col: 'done', priority: 'low', assignee: 'Taylor' },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newCol, setNewCol] = useState('todo');
  const [newPriority, setNewPriority] = useState('medium');
  const [showModal, setShowModal] = useState(false);

  const columns = [
    { id: 'todo', title: 'To Do', count: tasks.filter(t => t.col === 'todo').length },
    { id: 'in_progress', title: 'In Progress', count: tasks.filter(t => t.col === 'in_progress').length },
    { id: 'done', title: 'Completed', count: tasks.filter(t => t.col === 'done').length }
  ];

  const moveTask = (id, nextCol) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, col: nextCol } : t));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        title: newTitle.trim(),
        col: newCol,
        priority: newPriority,
        assignee: 'You'
      }
    ]);
    setNewTitle('');
    setShowModal(false);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Sprint Execution Board</h1>
          <p className="text-xs text-zinc-400">Quarterly milestones & active development workstreams</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-600/20"
        >
          + New Task
        </button>
      </div>

      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-start">
        {columns.map(column => (
          <div key={column.id} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-zinc-200">{column.title}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                {column.count}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {tasks.filter(t => t.col === column.id).map(task => (
                <div 
                  key={task.id}
                  className="p-4 rounded-lg bg-zinc-800/60 border border-zinc-700/60 space-y-3 shadow-sm hover:border-zinc-600 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-white leading-snug">{task.title}</p>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="text-zinc-500 hover:text-rose-400 text-xs px-1"
                      title="Delete card"
                    >
                      ×
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className={\`capitalize text-[11px] font-medium \${
                      task.priority === 'urgent' ? 'text-rose-400' :
                      task.priority === 'high' ? 'text-amber-400' :
                      'text-zinc-400'
                    }\`}>
                      ● {task.priority}
                    </span>
                    <span className="text-zinc-400 text-[11px]">{task.assignee}</span>
                  </div>

                  {/* Move action buttons */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-700/40 text-[11px]">
                    {column.id !== 'todo' && (
                      <button 
                        onClick={() => moveTask(task.id, column.id === 'done' ? 'in_progress' : 'todo')}
                        className="text-zinc-400 hover:text-white transition"
                      >
                        ← Move Left
                      </button>
                    )}
                    <span className="flex-1"></span>
                    {column.id !== 'done' && (
                      <button 
                        onClick={() => moveTask(task.id, column.id === 'todo' ? 'in_progress' : 'done')}
                        className="text-indigo-400 hover:text-indigo-300 font-medium transition"
                      >
                        Advance →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal for adding tasks */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={addTask} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl max-w-md w-full space-y-4">
            <h2 className="text-lg font-semibold text-white">Create New Task Card</h2>
            
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Card Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Implement resilient data caching"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Column</label>
                <select 
                  value={newCol} 
                  onChange={e => setNewCol(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Completed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Priority</label>
                <select 
                  value={newPriority} 
                  onChange={e => setNewPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}`,
      'src/index.css': `@import "tailwindcss";`
    }
  },
  {
    id: 'blank',
    name: 'Blank Web Scratchpad',
    description: 'Minimal starter setup ready for your prompt instructions.',
    category: 'Minimal',
    framework: 'react',
    defaultPrompt: 'Build a responsive application from scratch.',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NovaBuild App</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen">
  <div id="root"></div>
</body>
</html>`,
      'src/App.jsx': `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-3xl font-bold text-white">NovaBuild AI Workspace</h1>
        <p className="text-zinc-400 text-sm">
          Describe the features, layout, or components you need in the prompt bar to generate your project.
        </p>
      </div>
    </div>
  );
}`,
      'src/index.css': `@import "tailwindcss";`
    }
  }
];
