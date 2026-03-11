interface SecondaryActionCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  actionIcon: React.ReactNode;
  onClick?: () => void;
}

const SecondaryActionCard = ({
  icon,
  iconBg,
  title,
  subtitle,
  actionIcon,
  onClick,
}: SecondaryActionCardProps) => {
  return (
    <button
      onClick={onClick}
      className="flex-1 action-card p-5 flex items-center gap-4 cursor-pointer group text-left"
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${iconBg}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-heading text-sm">{title}</h4>
        <p className="text-xs text-caption mt-0.5">{subtitle}</p>
      </div>
      <div className="text-subtle group-hover:text-primary transition-colors flex-shrink-0">
        {actionIcon}
      </div>
    </button>
  );
};

export default SecondaryActionCard;
