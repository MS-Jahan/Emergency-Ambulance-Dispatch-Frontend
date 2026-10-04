import {
  Ambulance,
  ClipboardList,
  CreditCard,
  Gauge,
  Hospital,
  ScrollText,
  UserCircle,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const patientNav: NavItem[] = [
  { href: '/dashboard', label: 'My requests', icon: ClipboardList },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/profile', label: 'Profile', icon: UserCircle },
]

export const driverNav: NavItem[] = [
  { href: '/driver', label: 'Duty', icon: Gauge },
  { href: '/driver/history', label: 'History', icon: ClipboardList },
]

export const adminNav: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: Gauge },
  { href: '/admin/dispatch', label: 'Dispatch', icon: Ambulance },
  { href: '/admin/ambulances', label: 'Ambulances', icon: Ambulance },
  { href: '/admin/hospitals', label: 'Hospitals', icon: Hospital },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/audit', label: 'Audit logs', icon: ScrollText },
]
