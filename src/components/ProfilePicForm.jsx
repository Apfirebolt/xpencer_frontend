'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function ProfilePicForm({ user }) {
  const { updateProfilePic, loading, error } = useAuthStore();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [feedback, setFeedback] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setFeedback('');
    const result = await updateProfilePic(selectedFile);
    if (result.success) {
      setFeedback('Profile picture updated successfully!');
      setSelectedFile(null);
    }
  };

  const currentAvatar = previewUrl || user?.profilePic?.url || null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="space-y-1">
        <h3 className="text-lg font-bold font-heading">Profile Picture</h3>
        <p className="text-xs text-dark/60 dark:text-light/60">Upload a new avatar image to personalize your account.</p>
      </div>

      {error && <div className="text-xs text-rose-600 bg-rose-500/10 p-3 rounded-xl font-medium">{error}</div>}
      {feedback && <div className="text-xs text-emerald-600 bg-emerald-500/10 p-3 rounded-xl font-medium">{feedback}</div>}

      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/10 border-2 border-primary/20 flex items-center justify-center relative shrink-0">
          {currentAvatar ? (
            <img src={currentAvatar} alt="Profile Avatar" className="w-full h-full object-cover" />
          ) : (
            <PhotoIcon className="h-10 w-10 text-primary opacity-60" />
          )}
        </div>

        <div className="space-y-3 w-full">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-xs text-dark/60 dark:text-light/60 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
          />
          <p className="text-[11px] text-dark/40 dark:text-light/40">JPG, PNG or GIF (Max 5MB)</p>
        </div>
      </div>

      {selectedFile && (
        <button
          type="submit"
          disabled={loading}
          className="py-3 px-6 text-sm font-bold text-white bg-primary hover:bg-secondary rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
        >
          <ArrowUpTrayIcon className="h-4 w-4" />
          <span>{loading ? "Uploading..." : "Upload Avatar"}</span>
        </button>
      )}
    </form>
  );
}