import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Spinner from '@/components/ui/spinner';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { API_ENDPOINTS } from '@/lib/endpoints';
import {
  checkGuestServiceHealth,
  type GuestServiceCheckTarget,
  type GuestServiceHealthStatus,
} from '../api/guest.api';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

interface ServiceDescriptor {
  name: string;
  description: string;
  icon: string;
  region: string;
  target: GuestServiceCheckTarget;
}

interface ServiceStatus extends ServiceDescriptor {
  status: GuestServiceHealthStatus | 'checking';
  responseTime?: number;
  lastChecked?: Date;
}

type OverallStatus = 'operational' | 'degraded' | 'outage' | 'checking';

const STATUS_REFRESH_INTERVAL_MS = 60_000;

const StatusPage = () => {
  const { t } = useTranslation();

  const serviceDescriptors = useMemo<ServiceDescriptor[]>(
    () => [
      {
        name: t('Status.services.aiCore.name'),
        description: t('Status.services.aiCore.description'),
        icon: 'memory',
        region: 'Global',
        target: {
          endpoint: API_ENDPOINTS.PUBLIC.HEALTH.ROOT,
          scope: 'root',
        },
      },
      {
        name: t('Status.services.imageApi.name'),
        description: t('Status.services.imageApi.description'),
        icon: 'cloud_upload',
        region: 'API Gateway',
        target: {
          endpoint: API_ENDPOINTS.PUBLIC.SYSTEM_SETTINGS,
          scope: 'api',
        },
      },
      {
        name: t('Status.services.providerPortal.name'),
        description: t('Status.services.providerPortal.description'),
        icon: 'medical_information',
        region: 'Public Search',
        target: {
          endpoint: API_ENDPOINTS.PUBLIC.PATIENT_SEARCH.OPHTHALMOLOGISTS,
          scope: 'api',
          params: {
            pageNumber: 1,
            pageSize: 1,
          },
        },
      },
      {
        name: t('Status.services.patientStore.name'),
        description: t('Status.services.patientStore.description'),
        icon: 'database',
        region: 'Knowledge Base',
        target: {
          endpoint: API_ENDPOINTS.PUBLIC.RESOURCES.EYE_HEALTH,
          scope: 'api',
          params: {
            pageNumber: 1,
            pageSize: 1,
          },
        },
      },
    ],
    [t]
  );

  const [services, setServices] = useState<ServiceStatus[]>(() =>
    serviceDescriptors.map((service) => ({
      ...service,
      status: 'checking',
    }))
  );
  const [lastFullCheck, setLastFullCheck] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setServices(
      serviceDescriptors.map((service) => ({
        ...service,
        status: 'checking',
      }))
    );
  }, [serviceDescriptors]);

  const checkAllServices = useCallback(async () => {
    setIsRefreshing(true);

    const checkedAt = new Date();
    const updatedServices = await Promise.all(
      serviceDescriptors.map(async (service) => {
        const result = await checkGuestServiceHealth(service.target);

        return {
          ...service,
          status: result.status,
          responseTime: result.responseTime,
          lastChecked: checkedAt,
        } satisfies ServiceStatus;
      })
    );

    setServices(updatedServices);
    setLastFullCheck(checkedAt);
    setIsRefreshing(false);
  }, [serviceDescriptors]);

  useEffect(() => {
    void checkAllServices();

    const interval = window.setInterval(() => {
      void checkAllServices();
    }, STATUS_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [checkAllServices]);

  const onlineCount = services.filter(
    (service) => service.status === 'online'
  ).length;
  const degradedCount = services.filter(
    (service) => service.status === 'degraded'
  ).length;
  const offlineCount = services.filter(
    (service) => service.status === 'offline'
  ).length;
  const checkedCount = services.filter(
    (service) => service.status !== 'checking'
  ).length;

  const averageResponseTime = useMemo(() => {
    const samples = services
      .map((service) => service.responseTime)
      .filter(
        (responseTime): responseTime is number =>
          typeof responseTime === 'number'
      );

    if (samples.length === 0) {
      return null;
    }

    return Math.round(
      samples.reduce((sum, sample) => sum + sample, 0) / samples.length
    );
  }, [services]);

  const overallStatus = useMemo<OverallStatus>(() => {
    if (checkedCount === 0) {
      return 'checking';
    }

    if (offlineCount === checkedCount) {
      return 'outage';
    }

    if (offlineCount > 0 || degradedCount > 0) {
      return 'degraded';
    }

    return 'operational';
  }, [checkedCount, degradedCount, offlineCount]);

  const getLastUpdatedText = () => {
    if (!lastFullCheck) {
      return t('Status.labels.checking');
    }

    const now = new Date();
    const diffMs = now.getTime() - lastFullCheck.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 5) {
      return t('Status.time.justNow');
    }

    if (diffSec < 60) {
      return t('Status.time.secondsAgo', { count: diffSec });
    }

    const diffMin = Math.floor(diffSec / 60);
    return t('Status.time.minutesAgo', { count: diffMin });
  };

  const getStatusBadge = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
            {t('Status.labels.operational')}
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
            {t('Status.labels.outage')}
          </span>
        );
      case 'degraded':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
            {t('Status.labels.degraded')}
          </span>
        );
      case 'checking':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-pulse"></span>
            {t('Status.labels.checking')}
          </span>
        );
    }
  };

  const getOverallStatusIcon = () => {
    switch (overallStatus) {
      case 'operational':
        return (
          <div className="relative z-10 mb-2 flex size-20 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
            <svg
              className="h-12 w-12"
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
          <div className="relative z-10 mb-2 flex size-20 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
            <svg
              className="h-12 w-12"
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
          <div className="relative z-10 mb-2 flex size-20 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg
              className="h-12 w-12"
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
      case 'checking':
      default:
        return (
          <div className="relative z-10 mb-2 flex size-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <Spinner size={48} />
          </div>
        );
    }
  };

  const getOverallStatusText = () => {
    switch (overallStatus) {
      case 'operational':
        return t('Status.overall.allOperational');
      case 'degraded':
        return t('Status.overall.partialOutage');
      case 'outage':
        return t('Status.overall.majorOutage');
      case 'checking':
      default:
        return t('Status.overall.checkingSystems');
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
      case 'checking':
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-medical-bg)]">
      <Header />

      <main className="flex w-full flex-grow flex-col items-center px-4 py-8 md:py-12">
        <div className="flex w-full max-w-5xl flex-col gap-12">
          <section className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-black tracking-tight text-[var(--color-brand-dark)] md:text-5xl">
                {t('Status.hero.title')}
              </h1>
              <p className="max-w-2xl text-lg text-[var(--color-text-muted)]">
                {t('Status.hero.description')}
              </p>
            </div>

            <div className="relative flex flex-col items-center justify-center gap-6 overflow-hidden rounded-2xl border border-[var(--color-medical-border)] bg-white p-8 text-center shadow-sm md:p-12">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-primary)]/5 blur-3xl"></div>

              {getOverallStatusIcon()}

              <div className="relative z-10 flex flex-col items-center gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-[var(--color-brand-dark)] md:text-4xl">
                  {getOverallStatusText()}
                </h2>
                <p className="flex items-center gap-2 font-medium text-[var(--color-text-muted)]">
                  {t('Status.hero.lastUpdated')}: {getLastUpdatedText()}
                  <button
                    onClick={() => {
                      void checkAllServices();
                    }}
                    disabled={isRefreshing}
                    className="rounded-full p-1 transition-colors hover:bg-gray-100 disabled:opacity-50"
                    title={t('Status.hero.refresh')}
                  >
                    <svg
                      className={`h-4 w-4 text-[var(--color-text-muted)] ${isRefreshing ? 'animate-spin' : ''}`}
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

              <div className="mt-4 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full w-full ${getStatusBarColor()} shadow-[0_0_10px_rgba(19,236,236,0.5)] transition-colors duration-300`}
                ></div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex h-full flex-col justify-between rounded-2xl border border-[var(--color-medical-border)] bg-white p-6 transition-all hover:border-[var(--color-brand-primary)]/30 hover:shadow-lg">
              <div className="mb-4 flex items-start justify-between">
                <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {t('Status.metrics.servicesOnline', {
                    defaultValue: 'Services online',
                  })}
                </p>
                <svg
                  className="h-6 w-6 text-[var(--color-brand-primary)]"
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
              <div>
                <p className="text-4xl font-black tracking-tight text-[var(--color-brand-dark)]">
                  {onlineCount}/{services.length}
                </p>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  {t('Status.metrics.servicesChecked', {
                    defaultValue: '{{checked}} services checked',
                    checked: checkedCount,
                  })}
                </p>
              </div>
            </div>

            <div className="flex h-full flex-col justify-between rounded-2xl border border-[var(--color-medical-border)] bg-white p-6 transition-all hover:border-[var(--color-brand-primary)]/30 hover:shadow-lg">
              <div className="mb-4 flex items-start justify-between">
                <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {t('Status.metrics.avgProcessing', {
                    defaultValue: 'Average response time',
                  })}
                </p>
                <svg
                  className="h-6 w-6 text-[var(--color-brand-primary)]"
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
                <p className="text-4xl font-black tracking-tight text-[var(--color-brand-dark)]">
                  {averageResponseTime === null
                    ? '--'
                    : `${averageResponseTime}ms`}
                </p>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  {t('Status.metrics.avgProcessingDetail', {
                    defaultValue: 'Calculated from the latest service checks.',
                  })}
                </p>
              </div>
            </div>

            <div className="flex h-full flex-col justify-between rounded-2xl border border-[var(--color-medical-border)] bg-white p-6 transition-all hover:border-[var(--color-brand-primary)]/30 hover:shadow-lg">
              <div className="mb-4 flex items-start justify-between">
                <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {t('Status.metrics.currentState', {
                    defaultValue: 'Current state',
                  })}
                </p>
                <svg
                  className="h-6 w-6 text-[var(--color-brand-primary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-black tracking-tight text-[var(--color-brand-dark)]">
                  {degradedCount > 0
                    ? t('Status.labels.degraded')
                    : offlineCount > 0
                      ? t('Status.labels.outage')
                      : t('Status.labels.operational')}
                </p>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  {t('Status.metrics.lastCheckText', {
                    defaultValue: 'Last full check: {{time}}',
                    time: getLastUpdatedText(),
                  })}
                </p>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-5">
            <h3 className="px-1 text-2xl font-bold text-[var(--color-brand-dark)]">
              {t('Status.componentStatus.title')}
            </h3>
            <div className="overflow-hidden rounded-2xl border border-[var(--color-medical-border)] bg-white">
              <div className="grid grid-cols-12 gap-4 border-b border-[var(--color-medical-border)] bg-gray-50 p-5 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                <div className="col-span-6 md:col-span-5">
                  {t('Status.componentStatus.serviceName')}
                </div>
                <div className="col-span-3 text-right md:col-span-5 md:text-left">
                  {t('Status.componentStatus.region')}
                </div>
                <div className="col-span-3 text-right">
                  {t('Status.componentStatus.status')}
                </div>
              </div>

              {services.map((service, index) => (
                <div
                  key={`${service.name}-${index}`}
                  className={`grid grid-cols-12 items-center gap-4 p-5 transition-colors hover:bg-gray-50 ${
                    index < services.length - 1
                      ? 'border-b border-[var(--color-medical-border)]'
                      : ''
                  }`}
                >
                  <div className="col-span-6 flex items-center gap-3 md:col-span-5">
                    <span className="text-[var(--color-text-muted)]">
                      {service.icon === 'memory' && (
                        <svg
                          className="h-5 w-5"
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
                          className="h-5 w-5"
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
                          className="h-5 w-5"
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
                          className="h-5 w-5"
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
                    <div>
                      <span className="font-semibold text-[var(--color-brand-dark)]">
                        {service.name}
                      </span>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {service.description}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-3 text-right text-sm text-[var(--color-text-muted)] md:col-span-5 md:text-left">
                    <span>{service.region}</span>
                    {typeof service.responseTime === 'number' ? (
                      <p className="text-xs">{service.responseTime}ms</p>
                    ) : null}
                  </div>
                  <div className="col-span-3 flex justify-end">
                    {getStatusBadge(service.status)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-6 pt-6">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-[var(--color-brand-dark)]">
                {t('Status.trust.title')}
              </h3>
              <div className="h-px flex-1 bg-[var(--color-medical-border)]"></div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="group relative flex flex-col gap-4 rounded-2xl border border-transparent bg-gray-50 p-8 transition-all hover:border-[var(--color-medical-border)] hover:shadow-lg">
                <div className="absolute left-0 top-0 h-1 w-full rounded-t-2xl bg-indigo-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <svg
                    className="h-6 w-6"
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
                  <h4 className="mb-2 text-lg font-bold text-[var(--color-brand-dark)]">
                    {t('Status.trust.cards.bias.title')}
                  </h4>
                  <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                    {t('Status.trust.cards.bias.description')}
                  </p>
                </div>
                <Link
                  to={resolvePathWithLocale('/ethics')}
                  className="mt-auto flex items-center gap-2 pt-4 text-xs font-bold uppercase tracking-wider text-indigo-600 hover:underline"
                >
                  {t('Status.trust.cards.bias.cta')}
                  <svg
                    className="h-4 w-4"
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

              <div className="group relative flex flex-col gap-4 rounded-2xl border border-transparent bg-gray-50 p-8 transition-all hover:border-[var(--color-medical-border)] hover:shadow-lg">
                <div className="absolute left-0 top-0 h-1 w-full rounded-t-2xl bg-[var(--color-brand-primary)] opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                  <svg
                    className="h-6 w-6"
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
                  <h4 className="mb-2 text-lg font-bold text-[var(--color-brand-dark)]">
                    {t('Status.trust.cards.privacy.title')}
                  </h4>
                  <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                    {t('Status.trust.cards.privacy.description')}
                  </p>
                </div>
                <Link
                  to={resolvePathWithLocale('/ethics')}
                  className="mt-auto flex items-center gap-2 pt-4 text-xs font-bold uppercase tracking-wider text-cyan-700 hover:underline"
                >
                  {t('Status.trust.cards.privacy.cta')}
                  <svg
                    className="h-4 w-4"
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

              <div className="group relative flex flex-col gap-4 rounded-2xl border border-transparent bg-gray-50 p-8 transition-all hover:border-[var(--color-medical-border)] hover:shadow-lg">
                <div className="absolute left-0 top-0 h-1 w-full rounded-t-2xl bg-emerald-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <svg
                    className="h-6 w-6"
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
                  <h4 className="mb-2 text-lg font-bold text-[var(--color-brand-dark)]">
                    {t('Status.trust.cards.validation.title')}
                  </h4>
                  <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                    {t('Status.trust.cards.validation.description')}
                  </p>
                </div>
                <Link
                  to={resolvePathWithLocale('/about')}
                  className="mt-auto flex items-center gap-2 pt-4 text-xs font-bold uppercase tracking-wider text-emerald-600 hover:underline"
                >
                  {t('Status.trust.cards.validation.cta')}
                  <svg
                    className="h-4 w-4"
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
