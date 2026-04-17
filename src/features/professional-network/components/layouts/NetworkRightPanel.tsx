/**
 * Network Right Panel Component
 * Right aside panel with search, trends, and suggestions
 *
 * EXACT Width (matching Twitter): w-[350px] on lg+
 * Hidden on screens < lg (1024px)
 */

import { Link, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { ProfessionalCardMini } from '../professional/ProfessionalCardMini';
import { mockOphthalmologists, mockGroups, trendingTopics } from '../../data';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

const trendingTagLabelConfig: Record<
  string,
  { labelKey: string; labelFallback: string }
> = {
  'AI Screening': {
    labelKey: 'ProfessionalNetwork.rightPanel.trending.tags.aiScreening',
    labelFallback: 'AI Screening',
  },
  'Diabetic Retinopathy': {
    labelKey:
      'ProfessionalNetwork.rightPanel.trending.tags.diabeticRetinopathy',
    labelFallback: 'Diabetic Retinopathy',
  },
  'Glaucoma Guidelines 2026': {
    labelKey:
      'ProfessionalNetwork.rightPanel.trending.tags.glaucomaGuidelines2026',
    labelFallback: 'Glaucoma Guidelines 2026',
  },
  'SMILE Surgery': {
    labelKey: 'ProfessionalNetwork.rightPanel.trending.tags.smileSurgery',
    labelFallback: 'SMILE Surgery',
  },
  'Pediatric Vision': {
    labelKey: 'ProfessionalNetwork.rightPanel.trending.tags.pediatricVision',
    labelFallback: 'Pediatric Vision',
  },
};

export function NetworkRightPanel() {
  const location = useLocation();
  const { t } = useSafeTranslation();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const toLocalizedPath = (pathname: string) =>
    withLocalePathname(locale, pathname);

  // Get suggested connections (skip first 2, take next 3)
  const suggestedConnections = mockOphthalmologists.slice(2, 5);
  // Get user's groups (members only)
  const myGroups = mockGroups.filter((g) => g.isMember);

  return (
    <aside className="network-right-panel">
      {/* Search - Twitter style: sticky, rounded-full */}
      <div className="sticky top-0 z-10 bg-main-background py-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-muted" />
          <input
            type="text"
            placeholder={t(
              'ProfessionalNetwork.rightPanel.searchPlaceholder',
              'Search professionals, posts...'
            )}
            className="w-full pl-12 pr-4 py-3 bg-main-search-background rounded-full 
                       text-[15px] placeholder:text-text-muted hover-animation
                       focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
          />
        </div>
      </div>

      {/* Trending Topics */}
      <section className="hover-animation rounded-2xl bg-main-sidebar-background overflow-hidden">
        <h2 className="font-extrabold text-xl text-text-main px-4 py-3">
          {t(
            'ProfessionalNetwork.rightPanel.sections.trendingTopics',
            'Trending Topics'
          )}
        </h2>
        <div>
          {trendingTopics.map((topic, index) => {
            const labelConfig = trendingTagLabelConfig[topic.tag];
            const displayTag = labelConfig
              ? t(labelConfig.labelKey, labelConfig.labelFallback)
              : topic.tag;

            return (
              <Link
                key={topic.tag}
                to={toLocalizedPath(
                  `/network/discover?tag=${encodeURIComponent(topic.tag)}`
                )}
                className="hover-animation accent-tab hover-card relative 
                         flex flex-col gap-0.5 px-4 py-3"
              >
                <p className="text-[13px] text-text-muted">
                  {t(
                    'ProfessionalNetwork.rightPanel.trending.rankLabel',
                    '#{{rank}} - Trending',
                    { rank: index + 1 }
                  )}
                </p>
                <p className="font-bold text-[15px] text-text-main">
                  {displayTag}
                </p>
                <p className="text-[13px] text-text-muted">
                  {t(
                    'ProfessionalNetwork.rightPanel.trending.postsCount',
                    '{{count}} posts',
                    { count: topic.posts }
                  )}
                </p>
              </Link>
            );
          })}
        </div>
        <Link
          to={toLocalizedPath('/network/discover')}
          className="custom-button accent-tab hover-card block w-full rounded-2xl
                     rounded-t-none text-center text-brand-primary px-4 py-3"
        >
          {t('ProfessionalNetwork.common.showMore', 'Show more')}
        </Link>
      </section>

      {/* Suggested Connections - Who to follow */}
      <section className="hover-animation rounded-2xl bg-main-sidebar-background overflow-hidden">
        <h2 className="font-bold text-xl text-text-main px-4 py-3">
          {t(
            'ProfessionalNetwork.rightPanel.sections.whoToFollow',
            'Who to follow'
          )}
        </h2>
        <div>
          {suggestedConnections.map((professional) => (
            <div
              key={professional.id}
              className="hover-card hover-animation px-4 py-3"
            >
              <ProfessionalCardMini professional={professional} />
            </div>
          ))}
        </div>
        <Link
          to={toLocalizedPath('/network/discover')}
          className="custom-button accent-tab hover-card block w-full rounded-2xl
                     rounded-t-none text-center text-brand-primary px-4 py-3"
        >
          {t('ProfessionalNetwork.common.showMore', 'Show more')}
        </Link>
      </section>

      {/* Active Groups - Your Groups */}
      <section className="hover-animation rounded-2xl bg-main-sidebar-background overflow-hidden">
        <h2 className="font-bold text-xl text-text-main px-4 py-3">
          {t(
            'ProfessionalNetwork.rightPanel.sections.yourGroups',
            'Your Groups'
          )}
        </h2>
        <div>
          {myGroups.slice(0, 3).map((group) => (
            <Link
              key={group.id}
              to={toLocalizedPath('/network/discover')}
              className="flex items-center gap-3 px-4 py-3 hover-card hover-animation"
            >
              <img
                src={group.avatarUrl}
                alt={group.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[15px] text-text-main truncate">
                  {group.name}
                </p>
                <p className="text-[13px] text-text-muted">
                  {t(
                    'ProfessionalNetwork.rightPanel.groups.membersCount',
                    '{{count}} members',
                    { count: group.memberCount.toLocaleString() }
                  )}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <Link
          to={toLocalizedPath('/network/discover')}
          className="custom-button accent-tab hover-card block w-full rounded-2xl
                     rounded-t-none text-center text-brand-primary px-4 py-3"
        >
          {t('ProfessionalNetwork.common.showMore', 'Show more')}
        </Link>
      </section>

      {/* Footer */}
      <nav className="px-4 text-[13px] text-text-muted flex flex-wrap gap-x-3 gap-y-1">
        <Link to={toLocalizedPath('/ethics')} className="custom-underline">
          {t('ProfessionalNetwork.footer.terms', 'Terms')}
        </Link>
        <Link to={toLocalizedPath('/ethics')} className="custom-underline">
          {t('ProfessionalNetwork.footer.privacy', 'Privacy')}
        </Link>
        <Link to={toLocalizedPath('/contact')} className="custom-underline">
          {t('ProfessionalNetwork.footer.help', 'Help')}
        </Link>
        <span>
          {t('ProfessionalNetwork.footer.copyright', '© {{year}} Aura', {
            year: new Date().getFullYear(),
          })}
        </span>
      </nav>
    </aside>
  );
}
