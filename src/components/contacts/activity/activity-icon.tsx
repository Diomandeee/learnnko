import { MessageSquare, Mail, Star, AlertCircle, Edit, Trash } from "lucide-react";

const iconMap = {
  NOTE_ADDED: MessageSquare,
  EMAIL_SENT: Mail,
  STATUS_CHANGE: Star,
  CONTACT_CREATED: Edit,
  CONTACT_UPDATED: Edit,
  CONTACT_DELETED: Trash,
  DEFAULT: AlertCircle,
};

interface ActivityIconProps {
  type: keyof typeof iconMap | string;
  className?: string;
}

export function ActivityIcon({ type, className }: ActivityIconProps) {
  const Icon = iconMap[type as keyof typeof iconMap] || iconMap.DEFAULT;
  return <Icon className={className || "h-5 w-5 text-gray-400"} />;
}
