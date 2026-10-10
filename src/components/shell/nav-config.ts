import {
  Ambulance,
  BarChart3,
  ClipboardList,
  CreditCard,
  Gauge,
  TrendingUp,
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
  { href: '/driver/earnings', label: 'Earnings', icon: TrendingUp },
  { href: '/driver/profile', label: 'Profile', icon: UserCircle },
]

export const adminNav: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: Gauge },
  { href: '/admin/dispatch', label: 'Dispatch', icon: Ambulance },
  { href: '/admin/resources', label: 'Resources', icon: Users },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
]
