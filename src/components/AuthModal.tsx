import React, { useState } from 'react';
import { X, User, Check, ShieldCheck, LogIn, Users } from 'lucide-react';
import { UserProfile } from '../types';
import { DEFAULT_USERS } from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState('Senior Engineer');

  if (!isOpen) return null;

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const cleanSlug = customName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newUser: UserProfile = {
      id: `user_${cleanSlug}_${Date.now()}`,
      name: customName.trim(),
      email: `${cleanSlug}@novabuild.internal`,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80`,
      role: customRole,
    };
    onSelectUser(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Developer Workspace Profiles</h2>
              <p className="text-xs text-zinc-400">
                Switch user accounts for isolated project access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Accounts */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Select Active Profile
          </label>
          <div className="space-y-2">
            {DEFAULT_USERS.map((usr) => {
              const isActive = usr.id === currentUser.id;
              return (
                <div
                  key={usr.id}
                  onClick={() => {
                    onSelectUser(usr);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    isActive
                      ? 'bg-indigo-600/10 border-indigo-500/80 ring-1 ring-indigo-500/30'
                      : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={usr.avatar}
                      alt={usr.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-zinc-700"
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-white">{usr.name}</h4>
                      <p className="text-[11px] text-zinc-400">{usr.role} · {usr.email}</p>
                    </div>
                  </div>

                  {isActive && (
                    <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add new user profile */}
        <form onSubmit={handleCreateCustom} className="pt-2 border-t border-zinc-800 space-y-3">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Or Sign In As New Engineer
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Your Name"
              className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="Role"
              className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={!customName.trim()}
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 text-xs font-medium rounded-lg transition"
          >
            Create Profile & Switch
          </button>
        </form>
      </div>
    </div>
  );
};
