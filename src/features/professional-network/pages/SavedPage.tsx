/**
 * Saved Page
 * Page for viewing saved/bookmarked posts
 */

import { useState } from 'react';
import {
  Plus,
  Folder,
  Lock,
  Globe,
  FileText,
  MoreHorizontal,
  Bookmark,
} from 'lucide-react';
import { PostCard } from '../components/post/PostCard';
import type { ProfessionalPost, SavedCollection } from '../types';

// TODO: Replace with actual API calls
const mockCollections: SavedCollection[] = [];
const mockSavedPosts: ProfessionalPost[] = [];

function SavedPage() {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null
  );

  return (
    <>
      {/* Sticky Header */}
      <header className="hover-animation sticky top-0 z-10 bg-white/60 backdrop-blur-md border-b border-light-border">
        <div className="flex items-center justify-between px-4 h-[53px]">
          <h2 className="text-xl font-bold text-text-main">Bookmarks</h2>
          <button className="btn-primary text-[13px] py-1.5 px-4 flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>
      </header>

      {/* Collections */}
      <div className="divide-y divide-light-border">
        <button
          onClick={() => setSelectedCollection(null)}
          className={`w-full px-4 py-3 flex items-center gap-3 text-left hover-card hover-animation ${
            selectedCollection === null ? 'bg-brand-primary/5' : ''
          }`}
        >
          <div className="w-10 h-10 bg-brand-soft rounded-full flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-brand-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[15px] text-text-main">All Saved</h3>
            <p className="text-[13px] text-text-muted">
              {mockSavedPosts.length} posts
            </p>
          </div>
        </button>

        {mockCollections.map((collection) => (
          <button
            key={collection.id}
            onClick={() => setSelectedCollection(collection.id)}
            className={`w-full px-4 py-3 flex items-center gap-3 text-left hover-card hover-animation ${
              selectedCollection === collection.id ? 'bg-brand-primary/5' : ''
            }`}
          >
            <div className="w-10 h-10 bg-main-search-background rounded-full flex items-center justify-center shrink-0">
              <Folder className="w-5 h-5 text-text-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[15px] text-text-main truncate">
                  {collection.name}
                </h3>
                {collection.isPrivate ? (
                  <Lock className="w-3.5 h-3.5 text-text-muted shrink-0" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-text-muted shrink-0" />
                )}
              </div>
              <p className="text-[13px] text-text-muted truncate">
                {collection.postCount} posts
                {collection.description && ` · ${collection.description}`}
              </p>
            </div>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-text-muted hover:bg-gray-100 rounded-full hover-animation shrink-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </button>
        ))}
      </div>

      {/* Saved Posts Header */}
      <div className="px-4 py-3 border-b border-light-border">
        <h3 className="font-bold text-[15px] text-text-main">
          {selectedCollection
            ? mockCollections.find((c) => c.id === selectedCollection)?.name
            : 'All Saved Posts'}
        </h3>
      </div>

      {/* Saved Posts */}
      <div className="divide-y divide-light-border">
        {mockSavedPosts.length > 0 ? (
          mockSavedPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="text-center py-12 px-4">
            <Bookmark className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted">No saved posts yet</p>
          </div>
        )}
      </div>
    </>
  );
}

export default SavedPage;
