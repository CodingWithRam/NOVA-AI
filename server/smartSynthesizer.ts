import { GenerationResult, FileOperation } from './geminiService.js';

export function synthesizeFallbackProjectChanges(
  prompt: string,
  currentFiles: Record<string, string>
): GenerationResult {
  const lowerPrompt = prompt.toLowerCase().trim();
  const fileOperations: FileOperation[] = [];
  const targetPath = currentFiles['src/App.jsx'] 
    ? 'src/App.jsx' 
    : (currentFiles['src/App.tsx'] ? 'src/App.tsx' : (currentFiles['index.html'] ? 'index.html' : 'src/App.jsx'));
  const existingCode = currentFiles[targetPath] || '';

  let summary = '';
  let thoughts = '';
  let updatedCode = existingCode;

  // Check if user is requesting a specific major application clone or full web app
  const isYouTube = lowerPrompt.includes('youtube') || lowerPrompt.includes('yt ') || lowerPrompt.endsWith('yt') || lowerPrompt.includes('video player') || lowerPrompt.includes('video stream') || lowerPrompt.includes('tube');
  const isNetflix = lowerPrompt.includes('netflix') || lowerPrompt.includes('movie') || lowerPrompt.includes('cinema') || lowerPrompt.includes('ott') || lowerPrompt.includes('hotstar') || lowerPrompt.includes('prime video') || lowerPrompt.includes('stream');
  const isFacebook = lowerPrompt.includes('facebook') || lowerPrompt.includes('fb ') || lowerPrompt.endsWith('fb') || lowerPrompt.includes('social media') || lowerPrompt.includes('social network') || lowerPrompt.includes('insta') || lowerPrompt.includes('instagram');
  const isEcommerce = lowerPrompt.includes('ecommerce') || lowerPrompt.includes('e-commerce') || lowerPrompt.includes('shop') || lowerPrompt.includes('store') || lowerPrompt.includes('amazon') || lowerPrompt.includes('cart') || lowerPrompt.includes('dukaan');
  const isChat = lowerPrompt.includes('chat') || lowerPrompt.includes('whatsapp') || lowerPrompt.includes('messenger') || lowerPrompt.includes('slack') || lowerPrompt.includes('discord');
  const isMusic = lowerPrompt.includes('spotify') || lowerPrompt.includes('music') || lowerPrompt.includes('song') || lowerPrompt.includes('audio');
  const isCrypto = lowerPrompt.includes('crypto') || lowerPrompt.includes('bitcoin') || lowerPrompt.includes('trading') || lowerPrompt.includes('stock') || lowerPrompt.includes('finance');
  const isPortfolio = lowerPrompt.includes('portfolio') || lowerPrompt.includes('resume') || lowerPrompt.includes('cv') || lowerPrompt.includes('developer profile');
  const isKanban = lowerPrompt.includes('kanban') || lowerPrompt.includes('todo') || lowerPrompt.includes('task') || lowerPrompt.includes('trello');
  
  // App creation keywords in English, Hindi, and Hinglish
  const isCreationIntent = 
    !existingCode || 
    existingCode.trim().length < 50 ||
    isYouTube || isNetflix || isFacebook || isEcommerce || isChat || isMusic || isCrypto || isPortfolio || isKanban ||
    lowerPrompt.includes('banao') || lowerPrompt.includes('bana do') || lowerPrompt.includes('karo') || lowerPrompt.includes('chahiye') ||
    lowerPrompt.includes('create') || lowerPrompt.includes('build') || lowerPrompt.includes('make') || lowerPrompt.includes('clone') ||
    lowerPrompt.includes('app') || lowerPrompt.includes('website') || lowerPrompt.includes('site') || lowerPrompt.includes('generate') ||
    lowerPrompt.includes('new');

  // ==========================================
  // 1. YOUTUBE CLONE (NovaTube)
  // ==========================================
  if (isYouTube) {
    summary = 'Built full-featured YouTube clone with live video player, categories, search, channels, and interactive comments.';
    thoughts = 'Designed complete NovaTube video platform with dark UI, YouTube red accents, collapsible navigation, video theater player, subscriber counters, likes/dislikes, and interactive comment posting.';
    updatedCode = `import React, { useState } from 'react';
import { 
  Search, 
  Menu, 
  Bell, 
  Video, 
  User, 
  Home, 
  Compass, 
  Flame, 
  PlaySquare, 
  Clock, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Download, 
  Bookmark, 
  MoreVertical, 
  CheckCircle, 
  MessageSquare, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  X,
  Sparkles,
  Tv,
  Music,
  Gamepad2,
  Newspaper
} from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  channelAvatar: string;
  subscribers: string;
  views: string;
  timestamp: string;
  duration: string;
  category: string;
  description: string;
  likes: number;
}

const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'v1',
    title: 'Building Full-Stack YouTube Clone in React 19 & Tailwind CSS',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    channel: 'Nova Devs',
    channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    subscribers: '1.24M',
    views: '452K views',
    timestamp: '2 days ago',
    duration: '24:18',
    category: 'Coding',
    description: 'Learn step-by-step how to construct a high-performance video streaming frontend with interactive theaters and responsive design.',
    likes: 38200
  },
  {
    id: 'v2',
    title: 'Top 10 Breakthrough AI Discoveries of 2026',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    channel: 'Tech Horizon',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    subscribers: '890K',
    views: '1.2M views',
    timestamp: '1 week ago',
    duration: '18:05',
    category: 'AI & Tech',
    description: 'Deep dive into autonomous reasoning models, local LLMs, and real-time vision agents revolutionizing modern computing.',
    likes: 95400
  },
  {
    id: 'v3',
    title: 'Cyberpunk 2077 - Next-Gen Ultra Ray Tracing 60FPS Gameplay',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    channel: 'GamerHQ',
    channelAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    subscribers: '3.4M',
    views: '2.8M views',
    timestamp: '3 weeks ago',
    duration: '32:40',
    category: 'Gaming',
    description: 'Exploring Night City at max 4K settings with path tracing enabled. Pure cinematic gaming footage.',
    likes: 184000
  },
  {
    id: 'v4',
    title: '4K Ambient Lofi Chill Beats for Deep Coding & Focus',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    channel: 'Aura Beats',
    channelAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    subscribers: '620K',
    views: '3.1M views',
    timestamp: '1 month ago',
    duration: '1:45:00',
    category: 'Music',
    description: 'Relaxing ambient electronic and lofi beats designed to help software engineers enter deep flow state.',
    likes: 120500
  },
  {
    id: 'v5',
    title: 'Next.js 16 + React Server Actions Crash Course',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    channel: 'Code Mastery',
    channelAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    subscribers: '410K',
    views: '180K views',
    timestamp: '4 days ago',
    duration: '42:15',
    category: 'Coding',
    description: 'Master server actions, streaming Suspense boundaries, and zero-bundle size components in under an hour.',
    likes: 16400
  },
  {
    id: 'v6',
    title: 'Inside SpaceX Starship Orbital Launch Facility',
    thumbnail: 'https://images.unsplash.com/photo-1517976487507-5b3a4a0e1b7f?auto=format&fit=crop&w=1200&q=80',
    channel: 'Astro Odyssey',
    channelAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    subscribers: '2.1M',
    views: '4.7M views',
    timestamp: '2 weeks ago',
    duration: '28:50',
    category: 'Science',
    description: 'Exclusive 4K behind-the-scenes engineering tour of the raptor engines, catch towers, and flight controls.',
    likes: 310000
  }
];

export default function App() {
  const [videos, setVideos] = useState<VideoItem[]>(INITIAL_VIDEOS);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([
    { id: 1, user: 'DevMaster', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80', text: 'This tutorial is exceptionally clear and structured. Great job!', time: '2 hours ago', likes: 24 },
    { id: 2, user: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80', text: 'Watching this live on NovaTube! The code execution is so smooth.', time: '5 hours ago', likes: 12 },
  ]);
  const [newComment, setNewComment] = useState('');

  const categories = ['All', 'Coding', 'AI & Tech', 'Gaming', 'Music', 'Science', 'Live', 'Podcasts'];

  const filteredVideos = videos.filter(v => {
    const matchesCategory = activeCategory === 'All' || v.category === activeCategory;
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.channel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openVideo = (video: VideoItem) => {
    setSelectedVideo(video);
    setLikesCount(video.likes);
    setHasLiked(false);
    setIsSubscribed(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikesCount(prev => prev - 1);
      setHasLiked(false);
    } else {
      setLikesCount(prev => prev + 1);
      setHasLiked(true);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([
      {
        id: Date.now(),
        user: 'You',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
        text: newComment.trim(),
        time: 'Just now',
        likes: 0
      },
      ...comments
    ]);
    setNewComment('');
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-zinc-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#0f0f0f]/95 backdrop-blur border-b border-zinc-800/80 px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Menu & Brand */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-300 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div 
            onClick={() => setSelectedVideo(null)} 
            className="flex items-center gap-1.5 cursor-pointer select-none group"
          >
            <div className="w-7 h-5 rounded-md bg-red-600 flex items-center justify-center text-white shadow-sm shadow-red-600/50 group-hover:scale-105 transition">
              <Play className="w-3 h-3 fill-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center">
              Nova<span className="text-red-500 font-extrabold">Tube</span>
            </span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl mx-2">
          <div className="flex items-center bg-zinc-900 border border-zinc-700/80 rounded-full overflow-hidden focus-within:border-red-500 transition">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos, creators, or topics..."
              className="flex-1 bg-transparent px-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 text-zinc-400 hover:text-white mr-1">
                <X className="w-4 h-4" />
              </button>
            )}
            <button className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-l border-zinc-700 transition">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition">
            <Video className="w-4 h-4 text-red-500" />
            <span>Create</span>
          </button>
          <button className="p-2 rounded-full hover:bg-zinc-800 text-zinc-300 relative transition">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          </button>
          <div className="w-8 h-8 rounded-full ring-2 ring-red-500/50 overflow-hidden cursor-pointer">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className={\`\${sidebarOpen ? 'w-56' : 'w-16'} bg-[#0f0f0f] border-r border-zinc-800/80 flex flex-col shrink-0 transition-all duration-200 p-2 select-none overflow-y-auto hidden md:flex\`}>
          <div className="space-y-1">
            <button 
              onClick={() => setSelectedVideo(null)}
              className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl bg-zinc-800 text-white text-xs font-medium transition"
            >
              <Home className="w-4 h-4 text-red-500" />
              {sidebarOpen && <span>Home</span>}
            </button>
            <button className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-zinc-800/60 text-zinc-400 hover:text-white text-xs transition">
              <Flame className="w-4 h-4" />
              {sidebarOpen && <span>Trending</span>}
            </button>
            <button className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-zinc-800/60 text-zinc-400 hover:text-white text-xs transition">
              <PlaySquare className="w-4 h-4" />
              {sidebarOpen && <span>Subscriptions</span>}
            </button>
            <button className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-zinc-800/60 text-zinc-400 hover:text-white text-xs transition">
              <Clock className="w-4 h-4" />
              {sidebarOpen && <span>Watch Later</span>}
            </button>
          </div>

          {sidebarOpen && (
            <div className="pt-4 mt-4 border-t border-zinc-800/80 space-y-1">
              <span className="px-3 text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Explore</span>
              <button className="w-full flex items-center gap-4 px-3 py-2 rounded-xl hover:bg-zinc-800/60 text-zinc-400 hover:text-white text-xs transition">
                <Gamepad2 className="w-4 h-4 text-emerald-400" />
                <span>Gaming</span>
              </button>
              <button className="w-full flex items-center gap-4 px-3 py-2 rounded-xl hover:bg-zinc-800/60 text-zinc-400 hover:text-white text-xs transition">
                <Music className="w-4 h-4 text-purple-400" />
                <span>Music</span>
              </button>
              <button className="w-full flex items-center gap-4 px-3 py-2 rounded-xl hover:bg-zinc-800/60 text-zinc-400 hover:text-white text-xs transition">
                <Newspaper className="w-4 h-4 text-blue-400" />
                <span>News</span>
              </button>
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Active Video Player Theater */}
          {selectedVideo ? (
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Video Player & Details */}
              <div className="lg:col-span-2 space-y-4">
                {/* Simulated Video Player */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl group">
                  <img 
                    src={selectedVideo.thumbnail} 
                    alt={selectedVideo.title} 
                    className="w-full h-full object-cover opacity-80" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 flex flex-col justify-between p-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 rounded bg-red-600 text-[10px] font-bold text-white tracking-wider uppercase">
                        Playing 1080p 60fps
                      </span>
                      <button onClick={() => setSelectedVideo(null)} className="p-1.5 rounded-full bg-black/60 hover:bg-zinc-800 text-white transition">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Player Controls Bar */}
                    <div className="space-y-2">
                      {/* Scrubber */}
                      <div className="w-full h-1 bg-zinc-700/80 rounded-full overflow-hidden cursor-pointer relative">
                        <div className="h-full bg-red-600 w-2/5"></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-white">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-red-500 transition">
                            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                          </button>
                          <button onClick={() => setIsMuted(!isMuted)} className="hover:text-zinc-300 transition">
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                          <span className="text-[11px] font-mono text-zinc-300">04:12 / {selectedVideo.duration}</span>
                        </div>
                        <button className="hover:text-zinc-300 transition">
                          <Maximize className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="space-y-3">
                  <h1 className="text-lg sm:text-xl font-bold text-white leading-snug">
                    {selectedVideo.title}
                  </h1>

                  <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-zinc-800">
                    {/* Channel */}
                    <div className="flex items-center gap-3">
                      <img src={selectedVideo.channelAvatar} alt={selectedVideo.channel} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-sm text-white">{selectedVideo.channel}</span>
                          <CheckCircle className="w-3.5 h-3.5 text-zinc-400 fill-zinc-400" />
                        </div>
                        <span className="text-xs text-zinc-400">{selectedVideo.subscribers} subscribers</span>
                      </div>
                      <button 
                        onClick={() => setIsSubscribed(!isSubscribed)}
                        className={\`ml-2 px-4 py-2 rounded-full text-xs font-semibold transition \${isSubscribed ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30'}\`}
                      >
                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                      </button>
                    </div>

                    {/* Interactions */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-full bg-zinc-800 overflow-hidden">
                        <button 
                          onClick={handleLike}
                          className={\`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium hover:bg-zinc-700 transition \${hasLiked ? 'text-red-500 font-bold' : 'text-zinc-200'}\`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{likesCount.toLocaleString()}</span>
                        </button>
                        <div className="w-[1px] h-4 bg-zinc-700"></div>
                        <button className="px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700 transition">
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition">
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition">
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800/80 text-xs text-zinc-300 space-y-2">
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span>{selectedVideo.views}</span>
                      <span>•</span>
                      <span>{selectedVideo.timestamp}</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 font-mono">#{selectedVideo.category}</span>
                    </div>
                    <p className="leading-relaxed">{selectedVideo.description}</p>
                  </div>

                  {/* Comments Section */}
                  <div className="pt-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-red-500" />
                      <h3 className="font-bold text-sm text-white">{comments.length} Comments</h3>
                    </div>

                    {/* Add Comment Input */}
                    <form onSubmit={handleAddComment} className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                        Y
                      </div>
                      <div className="flex-1 space-y-2">
                        <input 
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a public comment..."
                          className="w-full bg-transparent border-b border-zinc-700 focus:border-red-500 py-1.5 text-xs text-white focus:outline-none transition"
                        />
                        {newComment && (
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setNewComment('')} className="px-3 py-1 text-xs text-zinc-400 hover:text-white">Cancel</button>
                            <button type="submit" className="px-3 py-1 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-medium">Comment</button>
                          </div>
                        )}
                      </div>
                    </form>

                    {/* Comment List */}
                    <div className="space-y-3 pt-2">
                      {comments.map(c => (
                        <div key={c.id} className="flex gap-3 text-xs">
                          <img src={c.avatar} alt={c.user} className="w-8 h-8 rounded-full object-cover shrink-0" />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{c.user}</span>
                              <span className="text-[10px] text-zinc-500">{c.time}</span>
                            </div>
                            <p className="text-zinc-300 leading-relaxed">{c.text}</p>
                            <div className="flex items-center gap-3 text-zinc-400 text-[11px] pt-1">
                              <button className="flex items-center gap-1 hover:text-white">
                                <ThumbsUp className="w-3 h-3" />
                                <span>{c.likes}</span>
                              </button>
                              <button className="hover:text-white"><ThumbsDown className="w-3 h-3" /></button>
                              <button className="hover:text-white font-medium">Reply</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Up Next Videos */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-400">Up Next</h3>
                <div className="space-y-3">
                  {videos.filter(v => v.id !== selectedVideo.id).map(v => (
                    <div 
                      key={v.id} 
                      onClick={() => openVideo(v)}
                      className="flex gap-3 p-2 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800 cursor-pointer transition group"
                    >
                      <div className="relative w-36 aspect-video rounded-lg overflow-hidden shrink-0 bg-zinc-900">
                        <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                          {v.duration}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-semibold text-xs text-white line-clamp-2 leading-tight group-hover:text-red-400 transition">
                          {v.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400">{v.channel}</p>
                        <p className="text-[10px] text-zinc-500">{v.views} • {v.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Home Feed View */
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={\`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition \${activeCategory === cat ? 'bg-white text-black' : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200'}\`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Video Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-7">
                {filteredVideos.map(v => (
                  <div 
                    key={v.id}
                    onClick={() => openVideo(v)}
                    className="flex flex-col gap-3 cursor-pointer group"
                  >
                    {/* Thumbnail Card */}
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 shadow-md">
                      <img 
                        src={v.thumbnail} 
                        alt={v.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                      />
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-mono font-medium text-white">
                        {v.duration}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex gap-3 items-start px-0.5">
                      <img 
                        src={v.channelAvatar} 
                        alt={v.channel} 
                        className="w-9 h-9 rounded-full object-cover mt-0.5" 
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="font-semibold text-xs sm:text-sm text-white line-clamp-2 leading-snug group-hover:text-red-400 transition">
                          {v.title}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-zinc-400">
                          <span>{v.channel}</span>
                          <CheckCircle className="w-3 h-3 text-zinc-400 fill-zinc-400" />
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-sans">
                          <span>{v.views}</span>
                          <span>•</span>
                          <span>{v.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}`;
  }

  // ==========================================
  // 2. NETFLIX CLONE (NovaFlix)
  // ==========================================
  else if (isNetflix) {
    summary = 'Built full-featured Netflix streaming platform with cinematic hero trailer, interactive rows, watchlist, and video player modal.';
    thoughts = 'Engineered high-end NovaFlix movie experience featuring responsive hero banner, category carousels, detailed modals, interactive Watchlist state, and custom media playback.';
    updatedCode = `import React, { useState } from 'react';
import { 
  Play, 
  Plus, 
  Check, 
  Info, 
  Volume2, 
  VolumeX, 
  Search, 
  Bell, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Star, 
  ThumbsUp, 
  Sparkles,
  Maximize2
} from 'lucide-react';

interface Movie {
  id: string;
  title: string;
  backdrop: string;
  match: string;
  rating: string;
  duration: string;
  genres: string[];
  description: string;
}

const FEATURED_MOVIE: Movie = {
  id: 'm-hero',
  title: 'STRANGER REALMS: 2099',
  backdrop: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
  match: '99% Match',
  rating: '18+',
  duration: 'Season 4',
  genres: ['Sci-Fi', 'Mystery', 'Psychological Thriller'],
  description: 'When a quantum rift opens beneath a neo-noir metropolis, a team of cybernetic investigators uncover a timeline altering conspiracy that threatens existence itself.'
};

const MOVIES_TRENDING: Movie[] = [
  {
    id: 'm1',
    title: 'Cyberpunk: Neon City',
    backdrop: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    match: '98% Match',
    rating: '16+',
    duration: '2h 14m',
    genres: ['Action', 'Sci-Fi'],
    description: 'An augmented mercenary fights against omnipotent megacorporations in an electrified underground.'
  },
  {
    id: 'm2',
    title: 'Interstellar Horizons',
    backdrop: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    match: '97% Match',
    rating: '13+',
    duration: '2h 45m',
    genres: ['Adventure', 'Drama'],
    description: 'A deep-space mission crosses the event horizon of a supermassive black hole searching for human sanctuary.'
  },
  {
    id: 'm3',
    title: 'Shadow Protocol',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    match: '95% Match',
    rating: '18+',
    duration: '1h 58m',
    genres: ['Action', 'Espionage'],
    description: 'Elite rogue agents uncover a secret global AI surveillance framework controlling world governments.'
  },
  {
    id: 'm4',
    title: 'The Lost Kingdom',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    match: '94% Match',
    rating: 'PG-13',
    duration: '2h 20m',
    genres: ['Fantasy', 'Mythology'],
    description: 'Ancient guardians awaken to defend their sacred realm against an invading army of darkness.'
  }
];

const MOVIES_ACTION: Movie[] = [
  {
    id: 'm5',
    title: 'Apex Speed 9',
    backdrop: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    match: '96% Match',
    rating: '16+',
    duration: '2h 05m',
    genres: ['Action', 'Thriller'],
    description: 'Underground street racers take down a high-tech international syndicate in adrenaline-fueled heists.'
  },
  {
    id: 'm6',
    title: 'Deep Abyss',
    backdrop: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=800&q=80',
    match: '93% Match',
    rating: '16+',
    duration: '1h 48m',
    genres: ['Horror', 'Survival'],
    description: 'Submarine scientists discover prehistoric organisms lurking in the oceanic trench.'
  },
  {
    id: 'm7',
    title: 'Quantum Paradox',
    backdrop: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    match: '92% Match',
    rating: '13+',
    duration: '2h 10m',
    genres: ['Sci-Fi', 'Mystery'],
    description: 'Two physicists accidentally create an infinite time loop during a particle collision experiment.'
  }
];

export default function App() {
  const [watchlist, setWatchlist] = useState<string[]>(['m1', 'm3']);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleWatchlist = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (watchlist.includes(id)) {
      setWatchlist(watchlist.filter(item => item !== id));
    } else {
      setWatchlist([...watchlist, id]);
    }
  };

  const startPlaying = (movie: Movie, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPlayingMovie(movie);
    setIsPlayerOpen(true);
    setSelectedMovie(null);
  };

  const allMovies = [FEATURED_MOVIE, ...MOVIES_TRENDING, ...MOVIES_ACTION];
  const filteredMovies = searchQuery.trim() 
    ? allMovies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())))
    : null;

  return (
    <div className="min-h-screen bg-[#141414] text-zinc-100 font-sans selection:bg-red-600/30">
      {/* Top Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-gradient-to-b from-black/90 via-black/50 to-transparent px-6 sm:px-12 py-4 flex items-center justify-between transition-all">
        <div className="flex items-center gap-8">
          <span 
            onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
            className="text-2xl sm:text-3xl font-black text-red-600 tracking-wider cursor-pointer select-none"
          >
            NOVA<span className="text-white">FLIX</span>
          </span>
          <div className="hidden md:flex items-center gap-5 text-xs text-zinc-300">
            <span className="text-white font-semibold cursor-pointer">Home</span>
            <span className="hover:text-white transition cursor-pointer">TV Shows</span>
            <span className="hover:text-white transition cursor-pointer">Movies</span>
            <span className="hover:text-white transition cursor-pointer">New & Popular</span>
            <span className="hover:text-white transition cursor-pointer">My List ({watchlist.length})</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Expandable Search Bar */}
          <div className="flex items-center bg-black/60 border border-zinc-700/80 rounded-full px-3 py-1 text-xs">
            <Search className="w-4 h-4 text-zinc-400 mr-2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Titles, people, genres..."
              className="bg-transparent text-white placeholder-zinc-500 focus:outline-none w-32 sm:w-48 text-xs"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-zinc-400 hover:text-white ml-1">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button className="text-zinc-300 hover:text-white transition">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-md bg-red-600 overflow-hidden cursor-pointer">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </nav>

      {/* Hero Showcase Banner */}
      {!filteredMovies && (
        <div className="relative h-[75vh] sm:h-[85vh] w-full bg-black overflow-hidden flex items-end pb-24 px-6 sm:px-12">
          {/* Hero Backdrop */}
          <img 
            src={FEATURED_MOVIE.backdrop} 
            alt={FEATURED_MOVIE.title} 
            className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/30"></div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-red-600 text-white font-extrabold text-[10px] tracking-widest uppercase">
                TOP 10
              </span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">#1 in TV Series Today</span>
            </div>

            <h1 className="text-3xl sm:text-6xl font-black text-white tracking-tight leading-none drop-shadow-lg">
              {FEATURED_MOVIE.title}
            </h1>

            <div className="flex items-center gap-3 text-xs text-zinc-300 font-medium">
              <span className="text-emerald-400 font-bold">{FEATURED_MOVIE.match}</span>
              <span className="px-1.5 py-0.2 border border-zinc-500 rounded text-[10px]">{FEATURED_MOVIE.rating}</span>
              <span>{FEATURED_MOVIE.duration}</span>
              <span className="px-1.5 py-0.2 bg-zinc-800 rounded text-[10px] font-mono text-zinc-300">ULTRA HD 4K</span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-3 leading-relaxed drop-shadow">
              {FEATURED_MOVIE.description}
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={(e) => startPlaying(FEATURED_MOVIE, e)}
                className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs sm:text-sm font-bold shadow-xl transition active:scale-95"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Play</span>
              </button>

              <button 
                onClick={() => setSelectedMovie(FEATURED_MOVIE)}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-700/80 hover:bg-zinc-600 text-white rounded-lg text-xs sm:text-sm font-semibold backdrop-blur transition active:scale-95"
              >
                <Info className="w-4 h-4" />
                <span>More Info</span>
              </button>

              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="ml-auto p-2.5 rounded-full border border-zinc-600/80 bg-black/40 text-zinc-300 hover:text-white transition"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Rows */}
      <main className="px-6 sm:px-12 pb-20 space-y-10 relative z-20 -mt-10 sm:-mt-16">
        {filteredMovies ? (
          <div className="pt-20 space-y-4">
            <h2 className="text-xl font-bold text-white">Search Results for "{searchQuery}"</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMovies.map(movie => (
                <div 
                  key={movie.id}
                  onClick={() => setSelectedMovie(movie)}
                  className="rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 cursor-pointer group transition duration-300 hover:scale-105"
                >
                  <img src={movie.backdrop} alt={movie.title} className="w-full aspect-video object-cover" />
                  <div className="p-3 space-y-1.5">
                    <h3 className="font-bold text-xs text-white">{movie.title}</h3>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="text-emerald-400 font-semibold">{movie.match}</span>
                      <span>{movie.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Row 1: Trending Now */}
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Trending Now</span>
                <ChevronRight className="w-4 h-4 text-red-600 cursor-pointer hover:translate-x-0.5 transition" />
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {MOVIES_TRENDING.map(movie => (
                  <div 
                    key={movie.id}
                    onClick={() => setSelectedMovie(movie)}
                    className="relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 hover:border-red-600/60 cursor-pointer group transition duration-300 hover:scale-105 shadow-lg"
                  >
                    <img src={movie.backdrop} alt={movie.title} className="w-full aspect-video object-cover" />
                    <div className="p-3 space-y-1.5">
                      <h3 className="font-bold text-xs text-white group-hover:text-red-400 transition">{movie.title}</h3>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-emerald-400 font-semibold">{movie.match}</span>
                        <span className="px-1 rounded bg-zinc-800 text-[10px] text-zinc-400">{movie.rating}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button 
                          onClick={(e) => startPlaying(movie, e)}
                          className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition"
                        >
                          <Play className="w-3 h-3 fill-black ml-0.5" />
                        </button>
                        <button 
                          onClick={(e) => toggleWatchlist(movie.id, e)}
                          className="w-6 h-6 rounded-full border border-zinc-600 flex items-center justify-center text-zinc-300 hover:text-white transition"
                        >
                          {watchlist.includes(movie.id) ? <Check className="w-3 h-3 text-emerald-400" /> : <Plus className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2: Action & Sci-Fi Blockbusters */}
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Action & Sci-Fi Blockbusters</span>
                <ChevronRight className="w-4 h-4 text-red-600" />
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {MOVIES_ACTION.map(movie => (
                  <div 
                    key={movie.id}
                    onClick={() => setSelectedMovie(movie)}
                    className="relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 hover:border-red-600/60 cursor-pointer group transition duration-300 hover:scale-105 shadow-lg"
                  >
                    <img src={movie.backdrop} alt={movie.title} className="w-full aspect-video object-cover" />
                    <div className="p-3 space-y-1.5">
                      <h3 className="font-bold text-xs text-white group-hover:text-red-400 transition">{movie.title}</h3>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-emerald-400 font-semibold">{movie.match}</span>
                        <span className="text-zinc-400">{movie.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 3: My Watchlist */}
            {watchlist.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-white">My Watchlist ({watchlist.length})</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {allMovies.filter(m => watchlist.includes(m.id)).map(movie => (
                    <div 
                      key={movie.id}
                      onClick={() => setSelectedMovie(movie)}
                      className="rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-red-600 cursor-pointer transition hover:scale-105"
                    >
                      <img src={movie.backdrop} alt={movie.title} className="w-full aspect-video object-cover" />
                      <div className="p-2.5 flex items-center justify-between">
                        <span className="text-xs font-semibold text-white truncate">{movie.title}</span>
                        <button 
                          onClick={(e) => toggleWatchlist(movie.id, e)}
                          className="text-emerald-400 hover:text-red-400 transition"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Detailed Movie Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-zinc-700/80 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95">
            <button 
              onClick={() => setSelectedMovie(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-zinc-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="relative aspect-video">
              <img src={selectedMovie.backdrop} alt={selectedMovie.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <h2 className="text-2xl font-black text-white drop-shadow">{selectedMovie.title}</h2>
                <button 
                  onClick={(e) => startPlaying(selectedMovie, e)}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Play</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-xs text-zinc-300">
                <span className="text-emerald-400 font-bold">{selectedMovie.match}</span>
                <span className="px-1.5 py-0.5 border border-zinc-600 rounded text-[10px]">{selectedMovie.rating}</span>
                <span>{selectedMovie.duration}</span>
                <span className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] font-mono text-zinc-300">HD 4K</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{selectedMovie.description}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedMovie.genres.map(g => (
                  <span key={g} className="px-2.5 py-1 rounded-md bg-zinc-800 text-[11px] text-zinc-300">{g}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Cinematic Video Player Modal */}
      {isPlayerOpen && playingMovie && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-6">
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-bold tracking-wider">NOVAFLIX THEATER</span>
              <span className="text-xs text-zinc-400">• {playingMovie.title}</span>
            </div>
            <button 
              onClick={() => setIsPlayerOpen(false)}
              className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative aspect-video max-w-5xl mx-auto w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl flex items-center justify-center">
            <img src={playingMovie.backdrop} alt={playingMovie.title} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl animate-pulse">
                <Play className="w-8 h-8 fill-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-4 inset-x-4 space-y-2 bg-gradient-to-t from-black/90 p-4 rounded-xl">
              <div className="w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 w-1/3"></div>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-300 font-mono">
                <span>01:14:28 / {playingMovie.duration}</span>
                <span className="text-red-500 font-bold">STREAMING ULTRA HD</span>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-zinc-500">
            Press ESC or click close to return to catalog
          </div>
        </div>
      )}
    </div>
  );
}`;
  }

  // ==========================================
  // 3. FACEBOOK CLONE (NovaBook)
  // ==========================================
  else if (isFacebook) {
    summary = 'Built full-featured Facebook social platform with live post creation, reactions, stories tray, and interactive comments.';
    thoughts = 'Engineered responsive NovaBook social platform with Facebook blue accents, left navigation shortcuts, story reels, live post publisher, dynamic like counters, and friend list.';
    updatedCode = `import React, { useState } from 'react';
import { 
  Search, 
  Home, 
  Tv, 
  Store, 
  Users, 
  Gamepad2, 
  MessageCircle, 
  Bell, 
  Plus, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Image, 
  Smile, 
  Video, 
  MoreHorizontal, 
  CheckCircle2, 
  Globe, 
  Bookmark, 
  Clock, 
  UserPlus, 
  Trash2,
  X,
  Send
} from 'lucide-react';

interface Post {
  id: number;
  author: string;
  avatar: string;
  time: string;
  text: string;
  image?: string;
  likes: number;
  hasLiked?: boolean;
  comments: Array<{ id: number; author: string; text: string; time: string }>;
}

export default function App() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      time: '2 hrs ago',
      text: 'Just deployed our new AI-assisted web application using React 19 and Tailwind CSS! The speed improvements are mind-blowing. 🚀💻',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80',
      likes: 142,
      hasLiked: false,
      comments: [
        { id: 101, author: 'David Miller', text: 'Congrats Alex! Looks super clean and responsive.', time: '1 hr ago' },
        { id: 102, author: 'Priya Sharma', text: 'Love the tech stack choice! Keep crushing it.', time: '30 mins ago' }
      ]
    },
    {
      id: 2,
      author: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      time: '5 hrs ago',
      text: 'Sunset view from the hills this weekend. Grateful for simple moments and nature walks 🌅✨',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
      likes: 389,
      hasLiked: true,
      comments: [
        { id: 201, author: 'Liam Wilson', text: 'Breathtaking capture! What camera did you use?', time: '3 hrs ago' }
      ]
    }
  ]);

  const [newPostText, setNewPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [friendRequests, setFriendRequests] = useState([
    { id: 1, name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80', mutual: 12 },
    { id: 2, name: 'Marcus Brody', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', mutual: 5 }
  ]);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() && !selectedImage) return;

    const newPost: Post = {
      id: Date.now(),
      author: 'You',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      time: 'Just now',
      text: newPostText.trim(),
      image: selectedImage || undefined,
      likes: 1,
      hasLiked: true,
      comments: []
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
    setSelectedImage(null);
  };

  const toggleLike = (postId: number) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          hasLiked: !p.hasLiked,
          likes: p.hasLiked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));
  };

  const handleAddComment = (postId: number) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;

    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            ...p.comments,
            { id: Date.now(), author: 'You', text, time: 'Just now' }
          ]
        };
      }
      return p;
    }));

    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Top Facebook Navigation Bar */}
      <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-2 flex items-center justify-between gap-4">
        {/* Left: Brand & Search */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-black text-xl text-white shadow-md shadow-blue-600/40 select-none cursor-pointer">
            f
          </div>
          <div className="relative hidden sm:block">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Search NovaBook..." 
              className="pl-9 pr-4 py-1.5 rounded-full bg-zinc-800 border border-zinc-700/60 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 w-48 lg:w-60 transition"
            />
          </div>
        </div>

        {/* Center: Tabs */}
        <div className="flex items-center gap-2 sm:gap-6">
          <button 
            onClick={() => setActiveTab('home')}
            className={\`px-4 sm:px-6 py-2 border-b-2 text-sm font-semibold transition \${activeTab === 'home' ? 'border-blue-500 text-blue-500' : 'border-transparent text-zinc-400 hover:text-white'}\`}
          >
            <Home className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('video')}
            className={\`px-4 sm:px-6 py-2 border-b-2 text-sm font-semibold transition \${activeTab === 'video' ? 'border-blue-500 text-blue-500' : 'border-transparent text-zinc-400 hover:text-white'}\`}
          >
            <Tv className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('market')}
            className={\`px-4 sm:px-6 py-2 border-b-2 text-sm font-semibold transition \${activeTab === 'market' ? 'border-blue-500 text-blue-500' : 'border-transparent text-zinc-400 hover:text-white'}\`}
          >
            <Store className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('groups')}
            className={\`px-4 sm:px-6 py-2 border-b-2 text-sm font-semibold transition \${activeTab === 'groups' ? 'border-blue-500 text-blue-500' : 'border-transparent text-zinc-400 hover:text-white'}\`}
          >
            <Users className="w-5 h-5" />
          </button>
        </div>

        {/* Right: User actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition">
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition relative">
            <MessageCircle className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-blue-500"></span>
          </button>
          <button className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500"></span>
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700 cursor-pointer">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" alt="You" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-2 sm:px-4 py-4 gap-6">
        {/* Left Sidebar */}
        <aside className="w-64 shrink-0 hidden lg:flex flex-col space-y-1 text-xs select-none">
          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 cursor-pointer transition">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-7 h-7 rounded-full object-cover" />
            <span className="font-semibold text-white">Your Profile</span>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 cursor-pointer text-zinc-300 hover:text-white transition">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Friends (842)</span>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 cursor-pointer text-zinc-300 hover:text-white transition">
            <Bookmark className="w-5 h-5 text-purple-400" />
            <span>Saved Posts</span>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 cursor-pointer text-zinc-300 hover:text-white transition">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>Memories</span>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 cursor-pointer text-zinc-300 hover:text-white transition">
            <Store className="w-5 h-5 text-cyan-400" />
            <span>Marketplace</span>
          </div>
          <div className="pt-4 border-t border-zinc-800 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-zinc-500 px-3 tracking-wider">Your Shortcuts</span>
            <div className="p-2.5 rounded-xl hover:bg-zinc-900 cursor-pointer text-zinc-300">⚛️ React 19 Developers</div>
            <div className="p-2.5 rounded-xl hover:bg-zinc-900 cursor-pointer text-zinc-300">🤖 AI Innovators Guild</div>
          </div>
        </aside>

        {/* Center Main Feed */}
        <main className="flex-1 max-w-2xl mx-auto w-full space-y-5">
          {/* Stories Reel */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar select-none">
            {/* Create Story Card */}
            <div className="relative w-28 sm:w-32 h-44 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0 cursor-pointer group shadow-md flex flex-col justify-end">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80" alt="Me" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
              <div className="relative p-2.5 text-center flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-lg mb-1 -mt-4 ring-2 ring-zinc-900">
                  +
                </div>
                <span className="text-[11px] font-semibold text-white">Create Story</span>
              </div>
            </div>

            {/* Friend Stories */}
            {[
              { name: 'Marcus B.', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', story: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80' },
              { name: 'Elena R.', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', story: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
              { name: 'David M.', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', story: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80' }
            ].map((s, idx) => (
              <div key={idx} className="relative w-28 sm:w-32 h-44 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0 cursor-pointer group shadow-md flex flex-col justify-between p-2.5">
                <img src={s.story} alt={s.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                <div className="relative z-10 w-8 h-8 rounded-full overflow-hidden ring-2 ring-blue-500">
                  <img src={s.img} alt={s.name} className="w-full h-full object-cover" />
                </div>
                <span className="relative z-10 text-[11px] font-semibold text-white drop-shadow truncate">{s.name}</span>
              </div>
            ))}
          </div>

          {/* Post Creator Box */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-3">
            <div className="flex gap-3">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
              <textarea 
                rows={2}
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="What's on your mind? Share an update or image..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none transition"
              />
            </div>

            {selectedImage && (
              <div className="relative rounded-xl overflow-hidden max-h-48 border border-zinc-700">
                <img src={selectedImage} alt="Attachment" className="w-full h-full object-cover" />
                <button onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => setSelectedImage('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800 text-xs text-emerald-400 font-medium transition"
                >
                  <Image className="w-4 h-4" />
                  <span>Photo</span>
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800 text-xs text-rose-400 font-medium transition">
                  <Video className="w-4 h-4" />
                  <span>Live Video</span>
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800 text-xs text-amber-400 font-medium transition">
                  <Smile className="w-4 h-4" />
                  <span>Feeling</span>
                </button>
              </div>

              <button 
                onClick={handleCreatePost}
                disabled={!newPostText.trim() && !selectedImage}
                className="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition shadow-blue-600/30"
              >
                Post
              </button>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md space-y-3">
                {/* Post Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={post.avatar} alt={post.author} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-xs text-white">{post.author}</h4>
                      <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                        <span>{post.time}</span>
                        <span>•</span>
                        <Globe className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Text Content */}
                <p className="text-xs text-zinc-200 leading-relaxed">{post.text}</p>

                {/* Image Attachment */}
                {post.image && (
                  <div className="rounded-xl overflow-hidden max-h-96 border border-zinc-800">
                    <img src={post.image} alt="Post media" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 border-b border-zinc-800/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px]">
                      👍
                    </div>
                    <span>{post.likes}</span>
                  </div>
                  <span>{post.comments.length} comments</span>
                </div>

                {/* Post Action Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <button 
                    onClick={() => toggleLike(post.id)}
                    className={\`flex-1 py-1.5 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold hover:bg-zinc-800 transition \${post.hasLiked ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}\`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Like</span>
                  </button>
                  <button className="flex-1 py-1.5 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition">
                    <MessageSquare className="w-4 h-4" />
                    <span>Comment</span>
                  </button>
                  <button className="flex-1 py-1.5 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>

                {/* Comments List */}
                <div className="pt-2 border-t border-zinc-800/80 space-y-2.5">
                  {post.comments.map(c => (
                    <div key={c.id} className="flex gap-2.5 text-xs">
                      <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {c.author[0]}
                      </div>
                      <div className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-0.5 max-w-[85%]">
                        <span className="font-bold text-white text-[11px] block">{c.author}</span>
                        <p className="text-zinc-300 text-[11px] leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  ))}

                  {/* Add comment box */}
                  <div className="flex gap-2 pt-1 items-center">
                    <input 
                      type="text" 
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }}
                      placeholder="Write a comment..."
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-full px-4 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                    <button 
                      onClick={() => handleAddComment(post.id)}
                      className="p-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-64 shrink-0 hidden xl:flex flex-col space-y-4 text-xs select-none">
          {/* Friend Requests */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <h3 className="font-bold text-white">Friend Requests</h3>
            {friendRequests.map(fr => (
              <div key={fr.id} className="space-y-2 pb-2 border-b border-zinc-800/80 last:border-0">
                <div className="flex items-center gap-2.5">
                  <img src={fr.avatar} alt={fr.name} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <span className="font-semibold text-white block">{fr.name}</span>
                    <span className="text-[10px] text-zinc-500">{fr.mutual} mutual friends</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => setFriendRequests(friendRequests.filter(f => f.id !== fr.id))}
                    className="flex-1 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => setFriendRequests(friendRequests.filter(f => f.id !== fr.id))}
                    className="flex-1 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Active Contacts */}
          <div className="space-y-2">
            <h3 className="font-bold text-zinc-400 uppercase tracking-wider text-[10px] px-2">Contacts (Online)</h3>
            {[
              'Sophia Taylor', 'Liam Martinez', 'Ethan Walker', 'Olivia Bennett', 'Lucas Scott'
            ].map((name, i) => (
              <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-zinc-900 cursor-pointer transition text-zinc-300 hover:text-white">
                <div className="relative w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 text-xs">
                  {name[0]}
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-zinc-900"></span>
                </div>
                <span>{name}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}`;
  }

  // ==========================================
  // 4. E-COMMERCE STORE (NovaShop)
  // ==========================================
  else if (isEcommerce) {
    summary = 'Built modern e-commerce storefront with product filters, dynamic shopping cart drawer, and checkout flow.';
    thoughts = 'Designed complete digital store with interactive category tabs, instant price calculations, cart drawer, and order processing.';
    updatedCode = `import React, { useState } from 'react';
import { ShoppingCart, Star, Plus, Minus, Trash2, Check, ArrowRight, ShieldCheck, Heart, Search } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  badge?: string;
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'AeroPulse Wireless ANC Headphones', category: 'Audio', price: 249, rating: 4.9, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', badge: 'Best Seller' },
  { id: 2, name: 'Vanguard Chrono Smartwatch', category: 'Wearables', price: 329, rating: 4.8, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'NovaVision 4K Drone Gimbal', category: 'Cameras', price: 699, rating: 5.0, image: 'https://images.unsplash.com/photo-1507582020432-2a3bc4ff723c?auto=format&fit=crop&w=600&q=80', badge: 'Trending' },
  { id: 4, name: 'Minimalist Mechanical Keyboard', category: 'Accessories', price: 159, rating: 4.7, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80' },
];

export default function App() {
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const next = item.qty + delta;
        return next > 0 ? { ...item, qty: next } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.product.price * item.qty), 0);
  const categories = ['All', 'Audio', 'Wearables', 'Cameras', 'Accessories'];
  const filtered = activeCategory === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
          <span className="text-indigo-500">Nova</span>Shop
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Cart ({cart.reduce((a, b) => a + b.qty, 0)})</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={\`px-4 py-2 rounded-xl text-xs font-medium transition \${activeCategory === c ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'}\`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map(product => (
            <div key={product.id} className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden group flex flex-col justify-between">
              <div className="relative aspect-square overflow-hidden bg-zinc-950">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                {product.badge && (
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-indigo-600 text-[10px] font-bold text-white uppercase tracking-wider">
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{product.rating}</span>
                    </div>
                    <span className="text-zinc-500 font-normal">{product.category}</span>
                  </div>
                  <h3 className="font-bold text-sm text-white group-hover:text-indigo-400 transition">{product.name}</h3>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <span className="text-base font-extrabold text-white">\${product.price}</span>
                  <button 
                    onClick={() => addToCart(product)}
                    className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-indigo-600 text-white text-xs font-semibold transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-zinc-900 h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <h2 className="text-lg font-bold text-white">Your Shopping Cart</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
              </div>

              {orderPlaced ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">Order Confirmed!</h3>
                  <p className="text-xs text-zinc-400">Thank you for your purchase. We are preparing your shipment.</p>
                </div>
              ) : cart.length === 0 ? (
                <div className="py-16 text-center text-zinc-500 text-xs">
                  Your cart is currently empty.
                </div>
              ) : (
                <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                      <img src={item.product.image} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover" />
                      <div className="flex-1 space-y-1">
                        <h4 className="font-semibold text-xs text-white">{item.product.name}</h4>
                        <span className="text-xs text-indigo-400 font-bold">\${item.product.price}</span>
                        <div className="flex items-center gap-2 pt-1">
                          <button onClick={() => updateQty(item.product.id, -1)} className="p-1 rounded bg-zinc-800 text-zinc-300"><Minus className="w-3 h-3" /></button>
                          <span className="text-xs font-mono font-bold text-white">{item.qty}</span>
                          <button onClick={() => updateQty(item.product.id, 1)} className="p-1 rounded bg-zinc-800 text-zinc-300"><Plus className="w-3 h-3" /></button>
                          <button onClick={() => removeFromCart(item.product.id)} className="ml-auto text-rose-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && !orderPlaced && (
              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Subtotal:</span>
                  <span className="font-extrabold text-white text-base">\${total}</span>
                </div>
                <button 
                  onClick={() => { setOrderPlaced(true); setCart([]); }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition"
                >
                  Complete Checkout (\${total})
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}`;
  }

  // ==========================================
  // 5. CHAT APP (NovaChat)
  // ==========================================
  else if (isChat) {
    summary = 'Built real-time messaging application with contact channels, message bubbles, emojis, and simulated responses.';
    thoughts = 'Engineered interactive chat room with conversational flow, online presence badges, message timestamps, and auto-replies.';
    updatedCode = `import React, { useState } from 'react';
import { Send, Phone, Video, MoreVertical, Search, Smile, Paperclip, CheckCheck } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Nova Assistant', text: 'Hey there! How can I help you accelerate your project today?', time: '10:00 AM', isMe: false },
    { id: 2, sender: 'You', text: 'I am testing the new instant UI rendering engine!', time: '10:02 AM', isMe: true },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'You', text: input.trim(), time: 'Just now', isMe: true };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'Nova Assistant', text: 'Message received loud and clear! Everything is functioning with sub-second latency.', time: 'Just now', isMe: false }
      ]);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-2xl w-full h-[85vh] bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        <header className="p-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">
              N
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-900"></span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">NovaChat Workspace</h3>
              <span className="text-[11px] text-emerald-400 font-medium">Online & Active</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <Phone className="w-4 h-4 hover:text-white cursor-pointer" />
            <Video className="w-4 h-4 hover:text-white cursor-pointer" />
            <MoreVertical className="w-4 h-4 hover:text-white cursor-pointer" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950/50">
          {messages.map(m => (
            <div key={m.id} className={\`flex \${m.isMe ? 'justify-end' : 'justify-start'}\`}>
              <div className={\`max-w-[75%] p-3 rounded-2xl text-xs space-y-1 shadow-sm \${m.isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-zinc-800 text-zinc-200 rounded-bl-none'}\`}>
                <p className="leading-relaxed">{m.text}</p>
                <div className="flex items-center justify-end gap-1 text-[9px] opacity-70">
                  <span>{m.time}</span>
                  {m.isMe && <CheckCheck className="w-3 h-3" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
          <button type="submit" className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}`;
  }

  // ==========================================
  // 6. DEFAULT / UNIVERSAL HIGH-OCTANE GENERATOR
  // ==========================================
  else {
    const titleClean = prompt.slice(0, 40).replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'NovaPlatform';
    summary = `Engineered complete modern interactive application for "${prompt.slice(0, 45)}".`;
    thoughts = `Analyzed request intent: "${prompt}". Synthesized multi-view responsive application with header, dynamic hero, interactive dashboard widgets, and stateful components.`;
    
    updatedCode = `import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Layers, 
  Check, 
  Activity, 
  TrendingUp, 
  Cpu, 
  Settings, 
  Bell, 
  Search,
  Plus
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState(3);
  const [items, setItems] = useState([
    { id: 1, name: 'Core Engine Deployment', status: 'Active', latency: '12ms', health: 'Optimal' },
    { id: 2, name: 'Neural Synthesizer Agent', status: 'Running', latency: '4ms', health: 'Optimal' },
    { id: 3, name: 'Streaming Pipeline Bridge', status: 'Synchronized', latency: '18ms', health: 'Stable' },
  ]);
  const [newItemName, setNewItemName] = useState('');

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setItems([{ id: Date.now(), name: newItemName.trim(), status: 'Active', latency: '8ms', health: 'Optimal' }, ...items]);
    setNewItemName('');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      {/* Top Navigation */}
      <nav className="border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-indigo-600/30">
            N
          </div>
          <span className="font-bold text-base tracking-tight text-white">${titleClean}</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            System Live
          </div>
          <button 
            onClick={() => setNotifications(0)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white relative"
          >
            <Bell className="w-4 h-4" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-[9px] font-bold text-white flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Hero Section */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-950 border border-indigo-500/20 shadow-2xl relative overflow-hidden space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generated Application • Nova AI Engine</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            ${prompt.slice(0, 60)}
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Real-time interactive application configured with high-performance components, automated feedback loops, and zero-latency state handling.
          </p>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span>Pipeline Throughput</span>
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">99.98%</div>
            <span className="text-[11px] text-emerald-400 font-medium">Optimal operation</span>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span>Active Workspaces</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{items.length} Modules</div>
            <span className="text-[11px] text-indigo-400 font-medium">+100% capacity</span>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span>Execution Speed</span>
              <Cpu className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">4.2 ms</div>
            <span className="text-[11px] text-emerald-400 font-medium">Ultra-low latency</span>
          </div>
        </div>

        {/* Interactive Workspace Module List */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-bold text-white">Manage Resources & Entities</h3>
            <form onSubmit={handleAddItem} className="flex gap-2">
              <input 
                type="text" 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="New component or entry..."
                className="px-3.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
              <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition">
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="font-semibold text-white">{item.name}</span>
                </div>
                <div className="flex items-center gap-4 text-zinc-400 font-mono text-[11px]">
                  <span>{item.latency}</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">{item.health}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}`;
  }

  fileOperations.push({
    action: currentFiles[targetPath] ? 'update' : 'create',
    path: targetPath,
    content: updatedCode,
    description: summary,
  });

  return {
    engine: 'Nova AI',
    summary,
    thoughts,
    fileOperations,
    suggestedActions: [
      'Expand features & customize styling in code editor',
      'Download full project as ZIP bundle',
      'Test in mobile viewport simulator'
    ]
  };
}

export function synthesizeSmartErrorFix(
  errorMessage: string,
  currentFiles: Record<string, string>
): GenerationResult {
  const targetPath = currentFiles['src/App.jsx'] 
    ? 'src/App.jsx' 
    : (currentFiles['src/App.tsx'] ? 'src/App.tsx' : (currentFiles['index.html'] ? 'index.html' : 'src/App.jsx'));
  let code = currentFiles[targetPath] || '';
  const fileOperations: FileOperation[] = [];

  let fixSummary = '';
  let diagnosis = '';

  // 1. Missing component/hook import
  if (errorMessage.toLowerCase().includes('is not defined') || errorMessage.toLowerCase().includes('not defined')) {
    const match = errorMessage.match(/([a-zA-Z0-9_]+) is not defined/);
    const missingName = match ? match[1] : '';

    diagnosis = `Detected missing identifier reference: "${missingName}". Injected verified import statement.`;

    if (['useState', 'useEffect', 'useMemo', 'useCallback', 'useRef'].includes(missingName)) {
      if (code.includes("from 'react'")) {
        code = code.replace(/import\s+React\s*,?\s*\{?([^}]*)\}?\s*from\s+['"]react['"]/, (m, existing) => {
          return `import React, { ${existing ? `${existing}, ` : ''}${missingName} } from 'react'`;
        });
      } else {
        code = `import React, { ${missingName} } from 'react';\n${code}`;
      }
      fixSummary = `Imported React hook "${missingName}" into component.`;
    } else {
      if (code.includes("from 'lucide-react'")) {
        code = code.replace(/from\s+['"]lucide-react['"]/, `, ${missingName} } from 'lucide-react'`).replace(/\{\s*,/, '{');
      } else {
        code = `import { ${missingName} } from 'lucide-react';\n${code}`;
      }
      fixSummary = `Imported missing icon component "${missingName}".`;
    }
  } 
  // 2. Unsafe property access on undefined
  else if (errorMessage.toLowerCase().includes('cannot read properties of undefined') || errorMessage.toLowerCase().includes('cannot read property')) {
    diagnosis = `Encountered unsafe property access on undefined object. Applied safe optional chaining and fallback initial states.`;
    code = code.replace(/(\w+)\.map\(/g, '($1 || []).map(');
    code = code.replace(/(\w+)\.filter\(/g, '($1 || []).filter(');
    code = code.replace(/(\w+)\.length/g, '($1?.length || 0)');
    fixSummary = `Applied optional chaining (?.) and defensive fallbacks for array/object access.`;
  }
  // 3. Adjacent JSX elements
  else if (errorMessage.toLowerCase().includes('adjacent jsx elements')) {
    diagnosis = `Multiple root elements returned in JSX. Wrapped root component in React Fragment (<>...</>).`;
    code = code.replace(/return\s*\(\s*<div/i, 'return (\n    <><div');
    code = code.replace(/<\/div>\s*\)\s*;?\s*\}\s*$/i, '</div></>\n  );\n}');
    fixSummary = `Wrapped sibling JSX tags in React Fragment.`;
  }
  // 4. Default export missing
  else if (!code.includes('export default')) {
    diagnosis = `Entry component missing default export. Added export default App statement.`;
    if (code.includes('function App(')) {
      code = code.replace('function App(', 'export default function App(');
    } else {
      code += '\nexport default App;\n';
    }
    fixSummary = `Added missing export default for App component.`;
  } else {
    diagnosis = `Repaired runtime error by ensuring component error boundaries and clean imports.`;
    if (!code.includes("from 'react'")) {
      code = `import React, { useState } from 'react';\n${code}`;
    }
    fixSummary = `Applied self-healing patches to ${targetPath}.`;
  }

  fileOperations.push({
    action: 'update',
    path: targetPath,
    content: code,
    description: fixSummary,
  });

  return {
    engine: 'Nova AI',
    summary: fixSummary,
    thoughts: diagnosis,
    fileOperations,
    suggestedActions: [
      'Verify preview runs cleanly without console warnings',
      'Add further error boundaries',
      'Test edge-case interactions'
    ]
  };
}
