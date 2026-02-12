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
      className="flex-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 cursor-pointer group text-left"
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${iconBg}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-slate-700 text-sm">{title}</h4>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>
      <div className="text-slate-300 group-hover:text-cyan-500 transition-colors flex-shrink-0">
        {actionIcon}
      </div>
    </button>
  );
};

export default SecondaryActionCard;
