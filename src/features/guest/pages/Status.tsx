import React, { useEffect, useState, useCallback } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from '@/components/ui/spinner';

interface ServiceStatus {
  name: string;
  endpoint: string;
  status: 'online' | 'offline' | 'degraded' | 'checking';
  responseTime?: number;
  lastChecked?: Date;
  description: string;
  icon: string;
  region: string;
}

const StatusPage = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'AI Core Analysis Engine',
      endpoint: '/health/ai',
      status: 'checking',
      description: 'AI-powered retinal analysis',
      icon: 'memory',
      region: 'Global (Multi-region)',
    },
    {
      name: 'Image Ingestion API',
      endpoint: '/health',
      status: 'checking',
      description: 'Image upload and processing',
      icon: 'cloud_upload',
      region: 'Vietnam (Southeast Asia)',
    },
    {
      name: 'Provider Portal',
      endpoint: '/auth/health',
      status: 'checking',
      description: 'Authentication and user management',
      icon: 'medical_information',
      region: 'Vietnam (Southeast Asia)',
    },
    {
      name: 'Patient Data Store',
      endpoint: '/health/database',
      status: 'checking',
      description: 'Encrypted database storage',
      icon: 'database',
      region: 'Encrypted (At Rest)',
    },
  ]);

  const [lastFullCheck, setLastFullCheck] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [overallStatus, setOverallStatus] = useState<
    'operational' | 'degraded' | 'outage' | 'checking'
  >('checking');

  const checkService = async (
    service: ServiceStatus
  ): Promise<ServiceStatus> => {
    const baseUrl = import.meta.env.VITE_API_END_POINT as string;
    const startTime = performance.now();

    try {
      const response = await axios.get(`${baseUrl}${service.endpoint}`, {
        timeout: 10000,
        validateStatus: (status) => status < 500,
      });

      const responseTime = Math.round(performance.now() - startTime);

      if (response.status === 200) {
        return {
          ...service,
          status: 'online',
          responseTime,
          lastChecked: new Date(),
        };
      } else if (response.status >= 400 && response.status < 500) {
        return {
          ...service,
          status: 'degraded',
          responseTime,
          lastChecked: new Date(),
        };
      } else {
        return {
          ...service,
          status: 'offline',
          responseTime,
          lastChecked: new Date(),
        };
      }
    } catch {
      return {
        ...service,
        status: 'offline',
        responseTime: undefined,
        lastChecked: new Date(),
      };
    }
  };

  const checkAllServices = useCallback(async () => {
    setIsRefreshing(true);
    setOverallStatus('checking');

    const updatedServices = await Promise.all(
      services.map((service) => checkService(service))
    );

    setServices(updatedServices);
    setLastFullCheck(new Date());
    setIsRefreshing(false);

    // Determine overall status
    const onlineCount = updatedServices.filter(
      (s) => s.status === 'online'
    ).length;
    const offlineCount = updatedServices.filter(
      (s) => s.status === 'offline'
    ).length;

    if (offlineCount === updatedServices.length) {
      setOverallStatus('outage');
    } else if (
      offlineCount > 0 ||
      updatedServices.some((s) => s.status === 'degraded')
    ) {
      setOverallStatus('degraded');
    } else if (onlineCount === updatedServices.length) {
      setOverallStatus('operational');
    }
  }, [services]);

  useEffect(() => {
    checkAllServices();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      checkAllServices();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getLastUpdatedText = () => {
    if (!lastFullCheck) return 'Checking...';
    const now = new Date();
    const diffMs = now.getTime() - lastFullCheck.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 5) return 'Just now';
    if (diffSec < 60) return `${diffSec} seconds ago`;
    const diffMin = Math.floor(diffSec / 60);
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Operational
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Outage
          </span>
        );
      case 'degraded':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
            Degraded
          </span>
        );
      case 'checking':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse"></span>
            Checking...
          </span>
        );
    }
  };

  const getOverallStatusIcon = () => {
    switch (overallStatus) {
      case 'operational':
        return (
          <div className="relative z-10 flex items-center justify-center size-20 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] mb-2">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      case 'degraded':
        return (
          <div className="relative z-10 flex items-center justify-center size-20 rounded-full bg-yellow-100 text-yellow-600 mb-2">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        );
      case 'outage':
        return (
          <div className="relative z-10 flex items-center justify-center size-20 rounded-full bg-red-100 text-red-600 mb-2">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="relative z-10 flex items-center justify-center size-20 rounded-full bg-gray-100 text-gray-400 mb-2">
            <Spinner size={48} />
          </div>
        );
    }
  };

  const getOverallStatusText = () => {
    switch (overallStatus) {
      case 'operational':
        return 'All Systems Operational';
      case 'degraded':
        return 'Partial System Outage';
      case 'outage':
        return 'Major System Outage';
      default:
        return 'Checking Systems...';
    }
  };

  const getStatusBarColor = () => {
    switch (overallStatus) {
      case 'operational':
        return 'bg-[var(--color-brand-primary)]';
      case 'degraded':
        return 'bg-yellow-500';
      case 'outage':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-medical)]">
      <Header />

      <main className="flex-grow flex flex-col items-center w-full px-4 py-8 md:py-12">
        <div className="w-full max-w-5xl flex flex-col gap-12">
          {/* Page Heading & Status Hero */}
          <section className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--color-brand-dark)]">
                System Status
              </h1>
              <p className="text-[var(--color-text-muted)] text-lg max-w-2xl">
                Real-time operational transparency for patients, providers, and
                partners.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-white border border-[var(--color-border)] p-8 md:p-12 flex flex-col items-center justify-center text-center gap-6 shadow-sm">
              {/* Pulse Effect Background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--color-brand-primary)]/5 rounded-full blur-3xl pointer-events-none"></div>

              {getOverallStatusIcon()}

              <div className="relative z-10 flex flex-col items-center gap-2">
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-brand-dark)] tracking-tight">
                  {getOverallStatusText()}
                </h2>
                <p className="text-[var(--color-text-muted)] font-medium flex items-center gap-2">
                  Last updated: {getLastUpdatedText()}
                  <button
                    onClick={checkAllServices}
                    disabled={isRefreshing}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                    title="Refresh status"
                  >
                    <svg
                      className={`w-4 h-4 text-[var(--color-text-muted)] ${isRefreshing ? 'animate-spin' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </p>
              </div>

              {/* Status Bar Indicator */}
              <div className="w-full max-w-md h-1.5 bg-gray-100 rounded-full overflow-hidden mt-4">
                <div
                  className={`h-full ${getStatusBarColor()} w-full shadow-[0_0_10px_rgba(19,236,236,0.5)] transition-colors duration-300`}
                ></div>
              </div>
            </div>
          </section>

          {/* Metrics Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col justify-between p-6 rounded-2xl bg-white border border-[var(--color-border)] h-full hover:shadow-lg hover:border-[var(--color-brand-primary)]/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Total Screenings
                </p>
                <svg
                  className="w-6 h-6 text-[var(--color-brand-primary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-4xl font-black text-[var(--color-brand-dark)] tracking-tight">
                  1,420,592
                </p>
                <div className="mt-2 flex items-center gap-1 text-sm text-green-600 font-medium">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  <span>+12% this month</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between p-6 rounded-2xl bg-white border border-[var(--color-border)] h-full hover:shadow-lg hover:border-[var(--color-brand-primary)]/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  AI Model Version
                </p>
                <svg
                  className="w-6 h-6 text-[var(--color-brand-primary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-black text-[var(--color-brand-dark)] tracking-tight">
                  v4.2.1
                </p>
                <p className="text-sm font-bold text-[var(--color-brand-primary)] mt-1">
                  FDA Cleared Class II
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between p-6 rounded-2xl bg-white border border-[var(--color-border)] h-full hover:shadow-lg hover:border-[var(--color-brand-primary)]/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Avg. Processing
                </p>
                <svg
                  className="w-6 h-6 text-[var(--color-brand-primary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-4xl font-black text-[var(--color-brand-dark)] tracking-tight">
                  &lt; 1.4s
                </p>
                <p className="text-sm text-[var(--color-text-muted)] mt-2">
                  Per high-res retinal scan
                </p>
              </div>
            </div>
          </section>

          {/* Component Status List */}
          <section className="flex flex-col gap-5">
            <h3 className="text-2xl font-bold text-[var(--color-brand-dark)] px-1">
              Component Status
            </h3>
            <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden bg-white">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-4 p-5 bg-gray-50 border-b border-[var(--color-border)] text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                <div className="col-span-6 md:col-span-5">Service Name</div>
                <div className="col-span-3 md:col-span-5 text-right md:text-left">
                  Region
                </div>
                <div className="col-span-3 md:col-span-2 text-right">
                  Status
                </div>
              </div>

              {/* Service Rows */}
              {services.map((service, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-12 gap-4 p-5 items-center hover:bg-gray-50 transition-colors ${
                    index < services.length - 1
                      ? 'border-b border-[var(--color-border)]'
                      : ''
                  }`}
                >
                  <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                    <span className="text-[var(--color-text-muted)]">
                      {service.icon === 'memory' && (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                          />
                        </svg>
                      )}
                      {service.icon === 'cloud_upload' && (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      )}
                      {service.icon === 'medical_information' && (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      )}
                      {service.icon === 'database' && (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="font-semibold text-[var(--color-brand-dark)]">
                      {service.name}
                    </span>
                  </div>
                  <div className="col-span-3 md:col-span-5 text-right md:text-left text-sm text-[var(--color-text-muted)]">
                    {service.region}
                  </div>
                  <div className="col-span-3 md:col-span-2 flex justify-end">
                    {getStatusBadge(service.status)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Trust & Ethics Section */}
          <section className="flex flex-col gap-6 pt-6">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-[var(--color-brand-dark)]">
                Trust & Ethics Center
              </h3>
              <div className="h-px flex-1 bg-[var(--color-border)]"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 - Bias Monitoring */}
              <div className="group relative flex flex-col gap-4 p-8 rounded-2xl bg-gray-50 border border-transparent hover:border-[var(--color-border)] hover:shadow-lg transition-all">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="size-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    Bias Monitoring
                  </h4>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    Continuous automated auditing across diverse demographic
                    datasets to ensure equitable diagnostic accuracy for all
                    patient groups.
                  </p>
                </div>
                <Link
                  to="/ethics"
                  className="mt-auto pt-4 flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider hover:underline"
                >
                  Read Protocol
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              </div>

              {/* Card 2 - Data Privacy */}
              <div className="group relative flex flex-col gap-4 p-8 rounded-2xl bg-gray-50 border border-transparent hover:border-[var(--color-border)] hover:shadow-lg transition-all">
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-brand-primary)] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="size-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    Data Privacy & Compliance
                  </h4>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    Fully HIPAA & GDPR compliant architecture. Zero-knowledge
                    encryption ensures patient data remains private and
                    accessible only to authorized providers.
                  </p>
                </div>
                <Link
                  to="/ethics"
                  className="mt-auto pt-4 flex items-center gap-2 text-cyan-700 text-xs font-bold uppercase tracking-wider hover:underline"
                >
                  View Certifications
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              </div>

              {/* Card 3 - Clinical Validation */}
              <div className="group relative flex flex-col gap-4 p-8 rounded-2xl bg-gray-50 border border-transparent hover:border-[var(--color-border)] hover:shadow-lg transition-all">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="size-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    Clinical Validation
                  </h4>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    Verified 99.2% sensitivity in multi-center clinical trials.
                    Peer-reviewed results published in top-tier medical
                    journals.
                  </p>
                </div>
                <Link
                  to="/about"
                  className="mt-auto pt-4 flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider hover:underline"
                >
                  Download Whitepaper
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </section>

          <div className="h-12"></div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StatusPage;
