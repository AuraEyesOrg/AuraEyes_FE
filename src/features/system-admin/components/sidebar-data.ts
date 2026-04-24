/*
Original backup:

import type { ComponentType } from 'react';
import {
  BarChart3,
  CalendarDays,
  CalendarX,
  FileText,
  Globe,
  KeyRound,
  Settings,
  Users,
  Wallet,
} from 'lucide-react';
import { Permissions } from '@/constants/permissions';

export interface SidebarNavItem {
  id: string;
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  requiredPermission?: string;
}

export interface SidebarNavGroup {
  id: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  items: SidebarNavItem[];
}

export const dashboardNavItem: SidebarNavItem = {
  id: 'dashboard',
  label: 'Dashboard',
  path: '/system-admin/dashboard',
  icon: BarChart3,
};

export const sidebarNavGroups: SidebarNavGroup[] = [
  {
    id: 'user-directory',
    label: 'User Directory',
    description: 'Manage user directory',
    icon: Users,
    items: [
      {
        id: 'staff-management',
        label: 'Staff Management',
        path: '/system-admin/staff-management',
        icon: Users,
        requiredPermission: Permissions.UsersRead,
      },
      {
        id: 'leave-requests',
        label: 'Leave Requests',
        path: '/system-admin/leave-requests',
        icon: CalendarX,
        requiredPermission: Permissions.SchedulesManage,
      },
      {
        id: 'patients',
        label: 'Patients',
        path: '/system-admin/patients',
        icon: Users,
        requiredPermission: Permissions.PatientsRead,
      },
    ],
  },
  {
    id: 'billing-finance',
    label: 'Billing & Finance',
    description: 'Financial & Billing management',
    icon: Wallet,
    items: [
      {
        id: 'transaction-ledger',
        label: 'Payment Transactions',
        path: '/system-admin/cashflow',
        icon: Wallet,
        requiredPermission: Permissions.CashflowRead,
      },
    ],
  },
  {
    id: 'clinic-operations',
    label: 'Clinic Operations',
    description: 'Manage clinic operations',
    icon: CalendarDays,
    items: [
      {
        id: 'scheduling',
        label: 'Scheduling',
        path: '/system-admin/scheduling',
        icon: CalendarDays,
        requiredPermission: Permissions.SchedulesManage,
      },
    ],
  },
  {
    id: 'system-administration',
    label: 'System Administration',
    description: 'System administration tools',
    icon: Settings,
    items: [
      {
        id: 'permissions',
        label: 'Permissions',
        path: '/system-admin/permissions',
        icon: KeyRound,
        requiredPermission: Permissions.PermissionsRead,
      },
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        path: '/system-admin/audit-logs',
        icon: FileText,
        requiredPermission: Permissions.AuditLogsRead,
      },
      {
        id: 'settings',
        label: 'Settings',
        path: '/system-admin/settings',
        icon: Settings,
        requiredPermission: Permissions.SettingsRead,
      },
      {
        id: 'aura-network',
        label: 'Aura Network',
        path: '/network',
        icon: Globe,
      },
    ],
  },
];
*/

import type { ComponentType } from 'react';
import {
  BarChart3,
  CalendarDays,
  CalendarX,
  FileText,
  Globe,
  KeyRound,
  Settings,
  Users,
  Wallet,
} from 'lucide-react';
import { Permissions } from '@/constants/permissions';

export interface SidebarNavItem {
  id: string;
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  requiredPermission?: string;
}

export const dashboardNavItem: SidebarNavItem = {
  id: 'dashboard',
  label: 'Dashboard',
  path: '/system-admin/dashboard',
  icon: BarChart3,
};

export const sidebarNavItems: SidebarNavItem[] = [
  {
    id: 'staff-management',
    label: 'Staff Management',
    path: '/system-admin/staff-management',
    icon: Users,
    requiredPermission: Permissions.UsersRead,
  },
  {
    id: 'leave-requests',
    label: 'Leave Requests',
    path: '/system-admin/leave-requests',
    icon: CalendarX,
    requiredPermission: Permissions.SchedulesManage,
  },
  {
    id: 'patients',
    label: 'Patients',
    path: '/system-admin/patients',
    icon: Users,
    requiredPermission: Permissions.PatientsRead,
  },
  {
    id: 'transaction-ledger',
    label: 'Payment Transactions',
    path: '/system-admin/cashflow',
    icon: Wallet,
    requiredPermission: Permissions.CashflowRead,
  },
  {
    id: 'scheduling',
    label: 'Scheduling',
    path: '/system-admin/scheduling',
    icon: CalendarDays,
    requiredPermission: Permissions.SchedulesManage,
  },
  {
    id: 'permissions',
    label: 'Permissions',
    path: '/system-admin/permissions',
    icon: KeyRound,
    requiredPermission: Permissions.PermissionsRead,
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    path: '/system-admin/audit-logs',
    icon: FileText,
    requiredPermission: Permissions.AuditLogsRead,
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/system-admin/settings',
    icon: Settings,
    requiredPermission: Permissions.SettingsRead,
  },
  {
    id: 'aura-network',
    label: 'Aura Network',
    path: '/network',
    icon: Globe,
  },
];
