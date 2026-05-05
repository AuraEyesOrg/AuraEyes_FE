/**
 * Saved Page
 * Page for viewing saved/bookmarked posts
 */

import { FileText, Bookmark } from 'lucide-react';
import { PostCard } from '../components/post/PostCard';
import { PostSkeleton } from '../components/post/PostSkeleton';
import { useSavedPosts } from '../hooks/useNetworkPosts';
import { useToggleSavePost } from '../hooks/useToggleSavePost';
import useAuthStore from '@/store/auth-store';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

function SavedPage() {
  const { t } = useSafeTranslation();
  const { user: currentUser } = useAuthStore();
  const currentUserId = currentUser?.id || '';
  const { data, isLoading, isError } = useSavedPosts();
  const toggleSave = useToggleSavePost();

  const savedPosts = data?.items ?? [];

  const handleSave = (postId: string) => {
    toggleSave.mutate(postId);
  };

  return (
    <>
      {/* Sticky Header */}
      <header className="hover-animation sticky top-0 z-10 bg-main-background/60 backdrop-blur-md border-b border-light-border">
        <div className="flex items-center justify-between px-4 h-[53px]">
          <h2 className="text-xl font-bold text-text-main">
            {t('ProfessionalNetwork.saved.title', 'Bookmarks')}
          </h2>
        </div>
      </header>

      {/* All Saved Section */}
      <div className="divide-y divide-light-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-soft rounded-full flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <h3 className="font-bold text-[15px] text-text-main">
              {t('ProfessionalNetwork.saved.sections.allSaved', 'All Saved')}
            </h3>
            <p className="text-[13px] text-text-muted">
              {isLoading
                ? '...'
                : t(
                    'ProfessionalNetwork.saved.count.posts',
                    '{{count}} posts',
                    { count: savedPosts.length }
                  )}
            </p>
          </div>
        </div>
      </div>

      {/* Saved Posts Header */}
      <div className="px-4 py-3 border-b border-light-border">
        <h3 className="font-bold text-[15px] text-text-main">
          {t(
            'ProfessionalNetwork.saved.sections.allSavedPosts',
            'All Saved Posts'
          )}
        </h3>
      </div>

      {/* Saved Posts */}
      <div className="divide-y divide-light-border">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
        ) : isError ? (
          <div className="text-center py-12 px-4">
            <p className="text-red-500">
              {t(
                'ProfessionalNetwork.saved.states.loadError',
                'Failed to load saved posts'
              )}
            </p>
          </div>
        ) : savedPosts.length > 0 ? (
          savedPosts.map((item) => (
            <PostCard
              key={item.id}
              post={item.post}
              currentUserId={currentUserId}
              onSave={handleSave}
            />
          ))
        ) : (
          <div className="text-center py-12 px-4">
            <Bookmark className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted">
              {t(
                'ProfessionalNetwork.saved.states.empty',
                'No saved posts yet'
              )}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default SavedPage;
