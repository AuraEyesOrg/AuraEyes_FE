/**
 * Comment Card Component
 * Card for displaying post comments with nested replies
 */

import { useState } from 'react';
import {
  Lightbulb,
  ThumbsUp,
  Heart,
  HelpCircle,
  PartyPopper,
} from 'lucide-react';
import type { PostComment as PostCommentType, ReactionType } from '../../types';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { getLocalizedSpecialty } from '../../utils/specialtyLocalization';

interface Props {
  comment: PostCommentType;
  isReply?: boolean;
}

const _reactionConfig: Record<
  ReactionType,
  { icon: React.ElementType; color: string }
> = {
  Insightful: { icon: Lightbulb, color: 'text-reaction-insightful' },
  Agree: { icon: ThumbsUp, color: 'text-reaction-agree' },
  Helpful: { icon: Heart, color: 'text-reaction-helpful' },
  Question: { icon: HelpCircle, color: 'text-reaction-question' },
  Celebrate: { icon: PartyPopper, color: 'text-reaction-celebrate' },
};

export function CommentCard({ comment, isReply = false }: Props) {
  const { t } = useSafeTranslation();
  const displaySpecialty = getLocalizedSpecialty(
    t,
    comment.author.specialty[0]
  );
  const [showReplies, setShowReplies] = useState(false);
  const [userReaction, setUserReaction] = useState<ReactionType | undefined>(
    comment.userReaction
  );

  return (
    <div className={`px-4 py-3 ${isReply ? 'ml-10' : ''}`}>
      <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1">
        <img
          src={comment.author.avatarUrl}
          alt={comment.author.fullName}
          className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full object-cover`}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1 text-[15px]">
            <span className="font-bold text-text-main truncate">
              {comment.author.fullName}
            </span>
            <span className="text-text-muted truncate">
              · {displaySpecialty}
            </span>
            <span className="text-text-muted shrink-0">
              · {t('ProfessionalNetwork.commentCard.time.recentFallback', '2h')}
            </span>
          </div>
          <p className="mt-1 text-[15px] text-text-main leading-normal">
            {comment.content}
          </p>

          {/* Comment Actions */}
          <div className="flex items-center gap-4 mt-2 text-[13px]">
            <button
              onClick={() =>
                setUserReaction(userReaction ? undefined : 'Insightful')
              }
              className={`font-medium hover-animation ${userReaction ? 'text-brand-primary' : 'text-text-muted hover:text-brand-primary'}`}
            >
              {userReaction
                ? t(
                    'ProfessionalNetwork.commentCard.actions.reacted',
                    'Reacted'
                  )
                : t(
                    'ProfessionalNetwork.commentCard.actions.react',
                    'React'
                  )}{' '}
              {comment.totalReactions > 0 && `(${comment.totalReactions})`}
            </button>
            <button className="font-medium text-text-muted hover:text-brand-primary hover-animation">
              {t('ProfessionalNetwork.commentCard.actions.reply', 'Reply')}
            </button>
            {comment.replyCount > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="font-medium text-brand-primary hover:underline"
              >
                {showReplies
                  ? t('ProfessionalNetwork.commentCard.actions.hide', 'Hide')
                  : t(
                      'ProfessionalNetwork.commentCard.actions.view',
                      'View'
                    )}{' '}
                {comment.replyCount === 1
                  ? t('ProfessionalNetwork.commentCard.replies.one', '1 reply')
                  : t(
                      'ProfessionalNetwork.commentCard.replies.many',
                      '{{count}} replies',
                      { count: comment.replyCount }
                    )}
              </button>
            )}
          </div>

          {/* Replies */}
          {showReplies && comment.replies && (
            <div className="mt-1 -mx-4 divide-y divide-light-border">
              {comment.replies.map((reply) => (
                <CommentCard key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
