import type { ComponentType } from 'react';
import {
  ArrowRightLeft,
  BarChart3,
  Building2,
  CalendarX,
  ClipboardCheck,
  FileCheck,
  FileText,
  Globe,
  KeyRound,
  Landmark,
  ScrollText,
  Settings,
  Stethoscope,
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
        id: 'organisations',
        label: 'Organisations',
        path: '/system-admin/organisations',
        icon: Building2,
        requiredPermission: Permissions.OrganisationsRead,
      },
      {
        id: 'ophthalmologists',
        label: 'Ophthalmologists',
        path: '/system-admin/ophthalmologists',
        icon: Stethoscope,
        requiredPermission: Permissions.OphthalmologistsRead,
      },
      {
        id: 'leave-requests',
        label: 'Leave Requests',
        path: '/system-admin/leave-requests',
        icon: CalendarX,
        requiredPermission: Permissions.SchedulesManage,
      },
      {
        id: 'employment-type-change-requests',
        label: 'Employment Type Changes',
        path: '/system-admin/employment-type-change-requests',
        icon: ArrowRightLeft,
        requiredPermission: Permissions.OphthalmologistsUpdate,
      },
      {
        id: 'patients',
        label: 'Patients',
        path: '/system-admin/patients',
        icon: Users,
        requiredPermission: Permissions.PatientsRead,
      },
      {
        id: 'verifications',
        label: 'Verifications',
        path: '/system-admin/verifications',
        icon: ClipboardCheck,
        requiredPermission: Permissions.OphthalmologistsUpdate,
      },
    ],
  },
  {
    id: 'contract-management',
    label: 'Contract Management',
    description: 'Manage contracts',
    icon: FileCheck,
    items: [
      {
        id: 'contract-templates',
        label: 'Contract Templates',
        path: '/system-admin/contract-templates',
        icon: ScrollText,
        requiredPermission: Permissions.ContractsRead,
      },
      {
        id: 'contracts',
        label: 'Contracts',
        path: '/system-admin/contracts',
        icon: FileCheck,
        requiredPermission: Permissions.ContractsRead,
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
      {
        id: 'withdrawal-requests',
        label: 'Withdrawal Requests',
        path: '/system-admin/withdrawal-requests',
        icon: Landmark,
        requiredPermission: Permissions.PayoutsRead,
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
