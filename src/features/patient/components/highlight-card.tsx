interface HighlightCardProps {
  title: string;
  value: string;
  badge?: string;
  tone?: 'primary' | 'accent' | 'danger' | 'neutral';
}

const toneStyles: Record<NonNullable<HighlightCardProps['tone']>, string> = {
  primary:
    'from-primary/20 via-primary/15 to-primary/5 border-primary/40 text-primary',
  accent:
    'from-accent/20 via-accent/10 to-accent/5 border-accent/40 text-accent',
  danger:
    'from-danger/20 via-danger/10 to-danger/5 border-danger/40 text-danger',
  neutral:
    'from-neutral/25 via-neutral/15 to-neutral/10 border-neutral/40 text-neutral',
};

export default function HighlightCard({
  title,
  value,
  badge,
  tone = 'primary',
}: HighlightCardProps) {
  return (
    <div
      className={`glass-panel flex flex-col gap-3 rounded-2xl border px-5 py-4 shadow-lg shadow-black/30 bg-gradient-to-br ${toneStyles[tone]}`}
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-neutral">
        <span>{title}</span>
        {badge ? (
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] text-white">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
