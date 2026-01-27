/**
 * Audit Logs & Compliance Page
 * System Admin view for tracking system activities and compliance reports
 */

import { useEffect, useState, useCallback } from 'react';
import {
  FileText,
  Shield,
  AlertCircle,
  CheckCircle,
  Search,
  Download,
  Filter,
  Calendar,
  Activity,
  Eye,
  Settings,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import DataTable, { type TableColumn } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { auditService } from '../services/audit.service';
import type { AuditLogEntry } from '../types/system-admin.types';

// Mock data for demonstration
const getMockAuditLogs = (): AuditLogEntry[] => [
  {
    id: '#LOG001',
    timestamp: '2024-01-23 10:30:45',
    userId: '#USR001',
    userName: 'Dr. Alex Chen',
    action: 'login',
    resource: 'System',
    details: 'Successful login from IP 192.168.1.100',
    ipAddress: '192.168.1.100',
    severity: 'info',
  },
  {
    id: '#LOG002',
    timestamp: '2024-01-23 10:28:12',
    userId: '#USR003',
    userName: 'Dr. Michael Lee',
    action: 'view',
    resource: 'Patient Record #P2045',
    details: 'Viewed screening results for patient',
    ipAddress: '192.168.1.105',
    severity: 'info',
  },
  {
    id: '#LOG003',
    timestamp: '2024-01-23 10:15:30',
    userId: '#USR002',
    userName: 'Dr. Sarah Johnson',
    action: 'update',
    resource: 'Organisation #CL042',
    details: 'Updated organisation settings',
    ipAddress: '192.168.1.102',
    severity: 'info',
  },
  {
    id: '#LOG004',
    timestamp: '2024-01-23 09:45:00',
    userId: '#USR001',
    userName: 'Dr. Alex Chen',
    action: 'create',
    resource: 'User Account #USR006',
    details: 'Created new user account',
    ipAddress: '192.168.1.100',
    severity: 'info',
  },
  {
    id: '#LOG005',
    timestamp: '2024-01-23 09:30:20',
    userId: 'SYSTEM',
    userName: 'System',
    action: 'alert',
    resource: 'AI Model',
    details: 'Fairness drift detected in demographic group Age > 75',
    ipAddress: 'N/A',
    severity: 'warning',
  },
  {
    id: '#LOG006',
    timestamp: '2024-01-23 09:00:00',
    userId: '#USR005',
    userName: 'James Wilson',
    action: 'login_failed',
    resource: 'System',
    details: 'Failed login attempt - account locked after 5 attempts',
    ipAddress: '192.168.1.200',
    severity: 'error',
  },
  {
    id: '#LOG007',
    timestamp: '2024-01-22 17:30:00',
    userId: '#USR001',
    userName: 'Dr. Alex Chen',
    action: 'delete',
    resource: 'Device #DEV003',
    details: 'Removed inactive device from organisation',
    ipAddress: '192.168.1.100',
    severity: 'warning',
  },
  {
    id: '#LOG008',
    timestamp: '2024-01-22 16:45:15',
    userId: '#USR002',
    userName: 'Dr. Sarah Johnson',
    action: 'logout',
    resource: 'System',
    details: 'User logged out',
    ipAddress: '192.168.1.102',
    severity: 'info',
  },
];

const getMockComplianceStats = () => ({
  totalLogs: 15420,
  complianceScore: 98.5,
  criticalAlerts: 3,
  resolvedIssues: 127,
});

const actionIcons: Record<string, typeof LogIn> = {
  login: LogIn,
  logout: LogOut,
  view: Eye,
  create: Plus,
  update: Edit,
  delete: Trash2,
  settings: Settings,
  alert: AlertCircle,
  login_failed: AlertCircle,
};

const actionLabels: Record<string, string> = {
  login: 'Login',
  logout: 'Logout',
  view: 'View',
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  settings: 'Settings Change',
  alert: 'System Alert',
  login_failed: 'Failed Login',
};

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalLogs: 0,
    complianceScore: 0,
    criticalAlerts: 0,
    resolvedIssues: 0,
  });

  // Load data
  const loadData = useCallback(async () => {
    try {
      const logsData = await auditService.getAuditLogs().catch(() => null);
      setAuditLogs(logsData?.data || getMockAuditLogs());
      setStats(getMockComplianceStats());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter data
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity =
      severityFilter === 'all' || log.severity === severityFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesSeverity && matchesAction;
  });

  // Export logs handler
  const handleExport = async () => {
    try {
      await auditService.exportAuditLogs('csv');
      // In real implementation, this would trigger a file download
      console.log('Exporting audit logs...');
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  const logColumns: TableColumn<AuditLogEntry>[] = [
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      width: '160px',
      render: (value) => (
        <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
          {value as string}
        </span>
      ),
    },
    {
      header: 'User',
      accessor: 'userName',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center text-white font-bold text-xs">
            {row.userName === 'System' ? (
              <Settings className="w-4 h-4" />
            ) : (
              row.userName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {row.userName}
            </span>
            {row.userId !== 'SYSTEM' && (
              <span className="text-xs text-slate-500">{row.userId}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (value) => {
        const ActionIcon = actionIcons[value as string] || Activity;
        return (
          <div className="flex items-center gap-2">
            <ActionIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {actionLabels[value as string] || (value as string)}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Resource',
      accessor: 'resource',
      render: (value) => (
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {value as string}
        </span>
      ),
    },
    {
      header: 'Details',
      accessor: 'details',
      render: (value) => (
        <span className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
          {value as string}
        </span>
      ),
    },
    {
      header: 'Severity',
      accessor: 'severity',
      render: (value) => {
        const severityMap: Record<
          string,
          'success' | 'warning' | 'error' | 'info'
        > = {
          info: 'info',
          warning: 'warning',
          error: 'error',
          critical: 'error',
        };
        return (
          <StatusBadge
            status={severityMap[value as string] || 'info'}
            label={
              (value as string).charAt(0).toUpperCase() +
              (value as string).slice(1)
            }
          />
        );
      },
    },
    {
      header: 'IP Address',
      accessor: 'ipAddress',
      render: (value) => (
        <span className="text-sm font-mono text-slate-500">
          {value as string}
        </span>
      ),
    },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar currentPath="/system-admin/audit-logs" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Audit Logs & Compliance"
          description="Track system activities, security events, and compliance status"
          actions={
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-all"
              >
                <Download className="w-4 h-4" />
                Export Logs
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:opacity-90 text-slate-900 font-bold text-sm transition-all shadow-lg shadow-primary/20">
                <FileText className="w-4 h-4" />
                Generate Report
              </button>
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-10 py-6 max-w-[1600px] mx-auto w-full space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
                title="Total Log Entries"
                value={stats.totalLogs.toLocaleString()}
                icon={FileText}
                description="Last 30 days"
                variant="primary"
              />
              <StatsCard
                title="Compliance Score"
                value={`${stats.complianceScore}%`}
                icon={Shield}
                trend="up"
                change={2.3}
                description="Above target"
                variant="success"
              />
              <StatsCard
                title="Critical Alerts"
                value={stats.criticalAlerts}
                icon={AlertCircle}
                description="Require attention"
                variant="danger"
              />
              <StatsCard
                title="Resolved Issues"
                value={stats.resolvedIssues}
                icon={CheckCircle}
                trend="up"
                change={15}
                description="This month"
                variant="success"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[280px] max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search logs by user, resource, or details..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                />
              </div>

              {/* Severity Filter */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Severity:
                </span>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium text-slate-900 dark:text-white focus:ring-0 cursor-pointer py-0 pl-1 pr-6"
                >
                  <option value="all">All</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>

              {/* Action Filter */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Activity className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Action:
                </span>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium text-slate-900 dark:text-white focus:ring-0 cursor-pointer py-0 pl-1 pr-6"
                >
                  <option value="all">All Actions</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="view">View</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="alert">Alerts</option>
                </select>
              </div>

              {/* Date Range (placeholder) */}
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-all">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Date Range</span>
              </button>
            </div>

            {/* Audit Logs Table */}
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <DataTable<AuditLogEntry>
                columns={logColumns}
                data={filteredLogs}
                keyExtractor={(row) => row.id}
                isLoading={loading}
                emptyMessage="No audit logs found"
              />
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>
                Showing {filteredLogs.length} of {auditLogs.length} log entries
              </span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Previous
                </button>
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Next
                </button>
              </div>
            </div>

            {/* Compliance Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Security Events */}
              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Recent Security Events
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {auditLogs
                    .filter(
                      (log) =>
                        log.severity === 'warning' || log.severity === 'error'
                    )
                    .slice(0, 4)
                    .map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            log.severity === 'error'
                              ? 'bg-red-100 dark:bg-red-900/30'
                              : 'bg-amber-100 dark:bg-amber-900/30'
                          }`}
                        >
                          <AlertCircle
                            className={`w-4 h-4 ${
                              log.severity === 'error'
                                ? 'text-red-600'
                                : 'text-amber-600'
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {log.details}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {log.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  {auditLogs.filter(
                    (log) =>
                      log.severity === 'warning' || log.severity === 'error'
                  ).length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">
                      No security events
                    </p>
                  )}
                </div>
              </div>

              {/* Compliance Checklist */}
              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Compliance Checklist
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { label: 'Data Encryption', status: 'passed' },
                    { label: 'Access Control Policies', status: 'passed' },
                    { label: 'Audit Trail Retention', status: 'passed' },
                    {
                      label: 'User Authentication Standards',
                      status: 'passed',
                    },
                    { label: 'Privacy Policy Compliance', status: 'review' },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                    >
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {item.label}
                      </span>
                      <StatusBadge
                        status={
                          item.status === 'passed' ? 'success' : 'warning'
                        }
                        label={item.status === 'passed' ? 'Passed' : 'Review'}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
