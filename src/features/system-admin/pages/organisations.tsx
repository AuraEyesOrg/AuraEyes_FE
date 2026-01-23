/**
 * Organization & Device Management Page
 * System Admin view for managing clinics/organizations and their devices
 */

import { useEffect, useState, useCallback } from 'react';
import {
  Building2,
  Wifi,
  Wrench,
  Search,
  Download,
  Plus,
  MoreVertical,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import DataTable, { type TableColumn } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import {
  organisationService,
  deviceService,
} from '../services/organisation.service';
import type { Organisation, Device } from '../types/system-admin.types';

type TabType = 'clinics' | 'devices';

// Mock data for demonstration
const getMockOrganisations = (): Organisation[] => [
  {
    id: '#CL042',
    name: 'Metro Vascular Center',
    type: 'clinic',
    location: 'New York, NY',
    country: 'USA',
    status: 'active',
    devicesCount: 3,
    usersCount: 12,
    createdAt: 'Oct 12, 2023',
    contactEmail: 'contact@metrovc.com',
  },
  {
    id: '#CL043',
    name: 'Bayside Eye Institute',
    type: 'hospital',
    location: 'San Francisco, CA',
    country: 'USA',
    status: 'active',
    devicesCount: 5,
    usersCount: 24,
    createdAt: 'Nov 02, 2023',
    contactEmail: 'info@baysideeye.com',
  },
  {
    id: '#CL044',
    name: 'Oakwood Medical',
    type: 'clinic',
    location: 'Austin, TX',
    country: 'USA',
    status: 'active',
    devicesCount: 2,
    usersCount: 8,
    createdAt: 'Dec 10, 2023',
    contactEmail: 'hello@oakwoodmed.com',
  },
  {
    id: '#CL045',
    name: 'Downtown Health Center',
    type: 'imaging_center',
    location: 'Chicago, IL',
    country: 'USA',
    status: 'inactive',
    devicesCount: 4,
    usersCount: 15,
    createdAt: 'Jan 05, 2024',
    contactEmail: 'support@dthc.com',
  },
];

const getMockDevices = (): Device[] => [
  {
    id: '#DEV001',
    name: 'Retinal Camera A1',
    model: 'AURA-RC-5000',
    serialNumber: 'RC5K-2024-0001',
    organisationId: '#CL042',
    organisationName: 'Metro Vascular Center',
    status: 'active',
    screeningsPerformed: 1245,
    lastCalibrated: '2024-01-15',
    firmwareVersion: 'v2.4.1',
  },
  {
    id: '#DEV002',
    name: 'Retinal Camera B2',
    model: 'AURA-RC-5000',
    serialNumber: 'RC5K-2024-0002',
    organisationId: '#CL043',
    organisationName: 'Bayside Eye Institute',
    status: 'maintenance',
    screeningsPerformed: 892,
    lastCalibrated: '2023-12-20',
    firmwareVersion: 'v2.3.8',
  },
  {
    id: '#DEV003',
    name: 'Retinal Camera C3',
    model: 'AURA-RC-3000',
    serialNumber: 'RC3K-2023-0015',
    organisationId: '#CL044',
    organisationName: 'Oakwood Medical',
    status: 'active',
    screeningsPerformed: 567,
    lastCalibrated: '2024-01-10',
    firmwareVersion: 'v2.4.0',
  },
];

export default function OrganisationsPage() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('clinics');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [orgsData, devicesData] = await Promise.all([
        organisationService.getOrganisations().catch(() => null),
        deviceService.getDevices().catch(() => null),
      ]);

      // Use mock data if API not available
      setOrganisations(orgsData?.data || getMockOrganisations());
      setDevices(devicesData?.data || getMockDevices());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate stats
  const activeOrgs = organisations.filter((o) => o.status === 'active').length;
  const onlineDevices = devices.filter((d) => d.status === 'active').length;
  const calibrationNeeded = devices.filter(
    (d) => d.status === 'maintenance'
  ).length;

  // Filter data based on search
  const filteredOrganisations = organisations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.organisationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const organisationColumns: TableColumn<Organisation>[] = [
    { header: 'ID', accessor: 'id', width: '100px' },
    {
      header: 'Clinic Details',
      accessor: 'name',
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {row.name}
          </span>
          <span className="text-xs text-slate-500">Added {row.createdAt}</span>
        </div>
      ),
    },
    { header: 'Location', accessor: 'location' },
    {
      header: 'Devices',
      accessor: 'devicesCount',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
          {value as number}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => {
        const statusMap: Record<string, 'success' | 'warning' | 'error'> = {
          active: 'success',
          inactive: 'error',
          suspended: 'warning',
        };
        return (
          <StatusBadge
            status={statusMap[value as string] || 'info'}
            label={
              (value as string).charAt(0).toUpperCase() +
              (value as string).slice(1)
            }
          />
        );
      },
    },
    {
      header: 'Actions',
      accessor: () => null,
      render: () => (
        <button className="text-slate-500 hover:text-primary transition-colors p-1">
          <MoreVertical className="w-5 h-5" />
        </button>
      ),
    },
  ];

  const deviceColumns: TableColumn<Device>[] = [
    { header: 'ID', accessor: 'id', width: '100px' },
    {
      header: 'Device Info',
      accessor: 'name',
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {row.name}
          </span>
          <span className="text-xs text-slate-500">{row.model}</span>
        </div>
      ),
    },
    { header: 'Organization', accessor: 'organisationName' },
    {
      header: 'Screenings',
      accessor: 'screeningsPerformed',
      render: (value) => (value as number).toLocaleString(),
    },
    { header: 'Last Calibrated', accessor: 'lastCalibrated' },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => {
        const statusMap: Record<
          string,
          'success' | 'warning' | 'error' | 'processing'
        > = {
          active: 'success',
          inactive: 'error',
          maintenance: 'warning',
          error: 'error',
        };
        const labelMap: Record<string, string> = {
          active: 'Online',
          inactive: 'Offline',
          maintenance: 'Calibration Needed',
          error: 'Error',
        };
        return (
          <StatusBadge
            status={statusMap[value as string] || 'info'}
            label={labelMap[value as string] || (value as string)}
          />
        );
      },
    },
    {
      header: 'Actions',
      accessor: () => null,
      render: () => (
        <button className="text-slate-500 hover:text-primary transition-colors p-1">
          <MoreVertical className="w-5 h-5" />
        </button>
      ),
    },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar currentPath="/system-admin/organisations" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="Clinic & Device Inventory"
          description="Manage registered clinics, monitor retinal camera status, and calibration logs"
          actions={
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-all">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:opacity-90 text-slate-900 font-bold text-sm transition-all shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" />
                Register Clinic
              </button>
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-10 py-6 max-w-[1600px] mx-auto w-full space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Active Clinics"
                value={activeOrgs}
                icon={Building2}
                change={2}
                trend="up"
                description="+2 this month"
                variant="success"
              />
              <StatsCard
                title="Devices Online"
                value={`${onlineDevices} / ${devices.length}`}
                icon={Wifi}
                description="Total devices registered"
                variant="primary"
              />
              <StatsCard
                title="Calibration Required"
                value={calibrationNeeded}
                icon={Wrench}
                description="Action needed"
                variant="warning"
              />
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-800">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab('clinics')}
                  className={`relative flex items-center gap-2 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'clinics'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Registered Clinics
                </button>
                <button
                  onClick={() => setActiveTab('devices')}
                  className={`relative flex items-center gap-2 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'devices'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Wifi className="w-4 h-4" />
                  Device Inventory
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {devices.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 min-w-[280px] max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab === 'clinics' ? 'clinics' : 'devices'}...`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Data Table */}
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {activeTab === 'clinics' ? (
                <DataTable<Organisation>
                  columns={organisationColumns}
                  data={filteredOrganisations}
                  keyExtractor={(row) => row.id}
                  isLoading={loading}
                  emptyMessage="No clinics found"
                />
              ) : (
                <DataTable<Device>
                  columns={deviceColumns}
                  data={filteredDevices}
                  keyExtractor={(row) => row.id}
                  isLoading={loading}
                  emptyMessage="No devices found"
                />
              )}
            </div>

            {/* Pagination placeholder */}
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>
                Showing{' '}
                {activeTab === 'clinics'
                  ? filteredOrganisations.length
                  : filteredDevices.length}{' '}
                results
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
          </div>
        </main>
      </div>
    </div>
  );
}
