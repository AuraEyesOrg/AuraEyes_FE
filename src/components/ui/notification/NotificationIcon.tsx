import {
  Bell,
  Eye,
  Stethoscope,
  FileText,
  MessageCircle,
  Calendar,
  Wallet,
  Users,
  RefreshCw,
  Pill,
} from 'lucide-react';

interface NotificationIconProps {
  name: string;
  size?: number;
  className?: string;
}

export function NotificationIcon({
  name,
  size = 20,
  className,
}: NotificationIconProps) {
  switch (name) {
    case 'eye':
      return <Eye size={size} className={className} />;
    case 'stethoscope':
      return <Stethoscope size={size} className={className} />;
    case 'file-text':
      return <FileText size={size} className={className} />;
    case 'message-circle':
      return <MessageCircle size={size} className={className} />;
    case 'calendar':
      return <Calendar size={size} className={className} />;
    case 'wallet':
      return <Wallet size={size} className={className} />;
    case 'users':
      return <Users size={size} className={className} />;
    case 'refresh-cw':
      return <RefreshCw size={size} className={className} />;
    case 'pill':
      return <Pill size={size} className={className} />;
    default:
      return <Bell size={size} className={className} />;
  }
}
