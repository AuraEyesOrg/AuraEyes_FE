/**
 * Post Composer Component
 * Component for creating new posts
 */

import { useState } from 'react';
import {
  Image,
  FileText,
  FlaskConical,
  HelpCircle,
  Link2,
  X,
  Globe,
  Users,
  Building2,
} from 'lucide-react';
import type { PostType, PostVisibility } from '../../types';

// TODO: Replace with actual user from auth context
const currentUser = {
  id: 'current-user',
  fullName: 'Dr. Current User',
  avatarUrl:
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150',
};

const postTypes: { type: PostType; icon: React.ElementType; label: string }[] =
  [
    { type: 'article', icon: FileText, label: 'Article' },
    { type: 'case_study', icon: FlaskConical, label: 'Case Study' },
    { type: 'question', icon: HelpCircle, label: 'Question' },
  ];

const visibilityOptions: {
  value: PostVisibility;
  icon: React.ElementType;
  label: string;
}[] = [
  { value: 'public', icon: Globe, label: 'Public' },
  { value: 'connections_only', icon: Users, label: 'Connections only' },
  { value: 'organisation_only', icon: Building2, label: 'Organisation only' },
];

export function PostComposer() {
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState<PostType>('article');
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [isExpanded, setIsExpanded] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = () => {
    console.log({ content, selectedType, visibility, images });
    setContent('');
    setImages([]);
    setIsExpanded(false);
  };

  return (
    <div className="flex gap-x-3 px-4 py-3 border-b border-light-border">
      <img
        src={currentUser.avatarUrl}
        alt={currentUser.fullName}
        className="w-10 h-10 rounded-full object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <textarea
          placeholder="Share insights with your network..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          className={`w-full bg-transparent text-xl text-text-main placeholder:text-text-muted focus:outline-none resize-none hover-animation ${
            isExpanded ? 'min-h-[100px]' : 'min-h-[52px] py-3'
          }`}
        />

        {/* Images Preview */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-0.5 mt-3 rounded-2xl overflow-hidden border border-light-border">
            {images.map((img, index) => (
              <div key={index} className="relative">
                <img src={img} alt="" className="w-full h-32 object-cover" />
                <button
                  onClick={() =>
                    setImages((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-black/80 hover-animation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {isExpanded && (
          <>
            {/* Post Type Selection */}
            <div className="flex items-center gap-2 mt-3 pb-3 border-b border-light-border">
              <span className="text-[13px] text-text-muted">Type:</span>
              <div className="flex gap-1">
                {postTypes.map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium hover-animation ${
                      selectedType === type
                        ? 'bg-brand-primary text-white'
                        : 'bg-main-search-background text-text-muted hover:bg-brand-soft'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center -ml-2">
                <button
                  onClick={() =>
                    setImages((prev) => [
                      ...prev,
                      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
                    ])
                  }
                  className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-full hover-animation"
                  title="Add Image"
                >
                  <Image className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-full hover-animation"
                  title="Attach Document"
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-full hover-animation"
                  title="Add Link"
                >
                  <Link2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Visibility Dropdown */}
                <select
                  value={visibility}
                  onChange={(e) =>
                    setVisibility(e.target.value as PostVisibility)
                  }
                  className="bg-main-search-background border-0 rounded-full px-3 py-1.5 text-[13px] text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary hover-animation"
                >
                  {visibilityOptions.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleSubmit}
                  disabled={!content.trim()}
                  className="btn-primary py-2 px-5 text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
