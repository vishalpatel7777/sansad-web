import {
  LayoutDashboard,
  User,
  CalendarCheck,
  MessageSquare,
  HelpCircle,
  Star,
  ShieldCheck,
  Users,
  FileText,
  Plane,
  Image,
} from "lucide-react";

export const PERSON_SIDEBAR_ITEMS = [
  { label: "Dashboard", path: "dashboard", icon: LayoutDashboard },
  { label: "Profile", path: "profile", icon: User },
  // { label: "Attendance", path: "attendance", icon: CalendarCheck }, // temporarily disabled
  { label: "Debates", path: "debates", icon: MessageSquare },
  { label: "Questions", path: "questions", icon: HelpCircle },
  { label: "Special Mentions", path: "special-mentions", icon: Star },
  { label: "Member Assurances", path: "assurances", icon: ShieldCheck },
  { label: "Committee Membership", path: "committees", icon: Users },
  { label: "Private Member Bills", path: "private-bills", icon: FileText },
  { label: "Official Tours", path: "tours", icon: Plane },
  { label: "Gallery", path: "gallery", icon: Image },
];
