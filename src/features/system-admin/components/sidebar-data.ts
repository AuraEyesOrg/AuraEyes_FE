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

export interface SidebarNavItem {
  id: string;
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
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
    description: 'Quản lý danh bạ người dùng',
    icon: Users,
    items: [
      {
        id: 'organisations',
        label: 'Organisations',
        path: '/system-admin/organisations',
        icon: Building2,
      },
      {
        id: 'ophthalmologists',
        label: 'Ophthalmologists',
        path: '/system-admin/ophthalmologists',
        icon: Stethoscope,
      },
      {
        id: 'leave-requests',
        label: 'Leave Requests',
        path: '/system-admin/leave-requests',
        icon: CalendarX,
      },
      {
        id: 'employment-type-change-requests',
        label: 'Employment Type Changes',
        path: '/system-admin/employment-type-change-requests',
        icon: ArrowRightLeft,
      },
      {
        id: 'patients',
        label: 'Patients',
        path: '/system-admin/patients',
        icon: Users,
      },
      {
        id: 'verifications',
        label: 'Verifications',
        path: '/system-admin/verifications',
        icon: ClipboardCheck,
      },
    ],
  },
  {
    id: 'contract-management',
    label: 'Contract Management',
    description: 'Quản lý hợp đồng',
    icon: FileCheck,
    items: [
      {
        id: 'contract-templates',
        label: 'Contract Templates',
        path: '/system-admin/contract-templates',
        icon: ScrollText,
      },
      {
        id: 'contracts',
        label: 'Contracts',
        path: '/system-admin/contracts',
        icon: FileCheck,
      },
    ],
  },
  {
    id: 'billing-finance',
    label: 'Billing & Finance',
    description: 'Tài chính & Thanh toán',
    icon: Wallet,
    items: [
      {
        id: 'transaction-ledger',
        label: 'Payment Transactions',
        path: '/system-admin/cashflow',
        icon: Wallet,
      },
      {
        id: 'withdrawal-requests',
        label: 'Withdrawal Requests',
        path: '/system-admin/withdrawal-requests',
        icon: Landmark,
      },
    ],
  },
  {
    id: 'system-administration',
    label: 'System Administration',
    description: 'Quản trị hệ thống',
    icon: Settings,
    items: [
      {
        id: 'permissions',
        label: 'Permissions',
        path: '/system-admin/permissions',
        icon: KeyRound,
      },
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        path: '/system-admin/audit-logs',
        icon: FileText,
      },
      {
        id: 'settings',
        label: 'Settings',
        path: '/system-admin/settings',
        icon: Settings,
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
