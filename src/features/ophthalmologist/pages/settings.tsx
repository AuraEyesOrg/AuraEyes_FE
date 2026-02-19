import { useState } from 'react';
import {
  Mail,
  Phone,
  Calendar,
  FileText,
  Shield,
  Bell,
  Moon,
  Sun,
  Smartphone,
  Award,
  Stethoscope,
  Building2,
  MapPin,
  ChevronRight,
  Edit3,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Lock,
  Globe,
} from 'lucide-react';
import { DoctorSidebar, DoctorHeader } from '../components';
import type { Doctor } from '../types/ophthalmologist.types';
import { useTheme } from '@/contexts/ThemeContext';

interface Certificate {
  id: string;
  name: string;
  type: 'license' | 'degree' | 'certification';
  issuedBy: string;
  issuedDate: string;
  expiryDate?: string;
  status: 'verified' | 'pending' | 'expired';
  fileUrl?: string;
}

interface OphthalmologistProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  yearsOfExperience: number;
  specialty: string;
  hospital: string;
  department: string;
  address: string;
  isVerified: boolean;
  verifiedAt?: string;
  certificates: Certificate[];
  createdAt: string;
}

// Mock data
const mockProfile: OphthalmologistProfile = {
  id: 'D001',
  fullName: 'Dr. Alistair Chen',
  email: 'dr.alistair@auraeyes.com',
  phone: '+84 123 456 7890',
  bio: 'Board-certified ophthalmologist specializing in retinal diseases and AI-assisted diagnostics. Over 15 years of experience in treating diabetic retinopathy, macular degeneration, and other retinal conditions.',
  yearsOfExperience: 15,
  specialty: 'Retina Specialist',
  hospital: 'AURA Vision Center',
  department: 'Retina Department',
  address: '123 Medical Plaza, District 1, Ho Chi Minh City',
  isVerified: true,
  verifiedAt: '2025-06-15',
  certificates: [
    {
      id: 'cert-1',
      name: 'Medical License',
      type: 'license',
      issuedBy: 'Vietnam Ministry of Health',
      issuedDate: '2015-03-20',
      expiryDate: '2027-03-20',
      status: 'verified',
    },
    {
      id: 'cert-2',
      name: 'Doctor of Medicine (MD)',
      type: 'degree',
      issuedBy: 'Ho Chi Minh City University of Medicine',
      issuedDate: '2010-06-15',
      status: 'verified',
    },
    {
      id: 'cert-3',
      name: 'Retina Fellowship',
      type: 'certification',
      issuedBy: 'American Academy of Ophthalmology',
      issuedDate: '2018-09-01',
      status: 'verified',
    },
  ],
  createdAt: '2025-01-15',
};

const mockDoctor: Doctor = {
  id: 'D001',
  name: 'Dr. Alistair',
  specialty: 'Retina Specialist',
  hospital: 'AURA Vision Center',
  department: 'Retina Dept',
  avatar: null,
};

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [profile] = useState<OphthalmologistProfile>(mockProfile);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);

  const getStatusBadge = (status: 'verified' | 'pending' | 'expired') => {
    switch (status) {
      case 'verified':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" /> Verified
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'expired':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" /> Expired
          </span>
        );
    }
  };

  const getCertificateIcon = (type: 'license' | 'degree' | 'certification') => {
    switch (type) {
      case 'license':
        return Shield;
      case 'degree':
        return Award;
      case 'certification':
        return FileText;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a1929]">
      <DoctorSidebar doctor={mockDoctor} pendingCount={12} />

      <div className="ml-52">
        <DoctorHeader doctor={mockDoctor} pageName="Settings" />

        <main className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your profile, credentials, and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile & Credentials */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information Card */}
              <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#1e3a5f]">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Profile Information
                  </h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors">
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>

                <div className="p-6">
                  {/* Avatar & Verification Status */}
                  <div className="flex items-start gap-6 mb-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-linear-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white font-bold text-2xl">
                        {profile.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-[#1e3a5f] border border-gray-200 dark:border-[#2d4a6f] rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#2d4a6f] transition-colors">
                        <Upload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {profile.fullName}
                        </h3>
                        {profile.isVerified && (
                          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" /> Verified
                            Practitioner
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">
                        {profile.specialty} • {profile.yearsOfExperience} years
                        experience
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Member since{' '}
                        {new Date(profile.createdAt).toLocaleDateString(
                          'en-US',
                          { month: 'long', year: 'numeric' }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Profile Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Email Address
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Phone Number
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Years of Experience
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile.yearsOfExperience} years
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                      <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <Stethoscope className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Specialty
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile.specialty}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Hospital / Clinic
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile.hospital}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Address
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Bio / Description
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {profile.bio}
                    </p>
                  </div>
                </div>
              </div>

              {/* Medical Credentials Card */}
              <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#1e3a5f]">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Medical Credentials
                  </h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-cyan-500 text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg text-sm font-medium transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload Certificate
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {profile.certificates.map((cert) => {
                    const CertIcon = getCertificateIcon(cert.type);
                    return (
                      <div
                        key={cert.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e3a5f] transition-colors group"
                      >
                        <div className="w-12 h-12 bg-white dark:bg-[#0a1f44] border border-gray-200 dark:border-[#2d4a6f] rounded-lg flex items-center justify-center shrink-0">
                          <CertIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {cert.name}
                            </h4>
                            {getStatusBadge(cert.status)}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Issued by {cert.issuedBy}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                            <span>
                              Issued:{' '}
                              {new Date(cert.issuedDate).toLocaleDateString()}
                            </span>
                            {cert.expiryDate && (
                              <span>
                                Expires:{' '}
                                {new Date(cert.expiryDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-200 dark:hover:bg-[#2d4a6f] rounded-lg transition-all">
                          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column - Quick Settings */}
            <div className="space-y-6">
              {/* Account Settings */}
              <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-[#1e3a5f]">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Account Settings
                  </h2>
                </div>

                <div className="p-4 space-y-2">
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Security
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Password & 2FA
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Language
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          English (US)
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                  </button>
                </div>
              </div>

              {/* Appearance */}
              <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-[#1e3a5f]">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Appearance
                  </h2>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        {theme === 'dark' ? (
                          <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <Sun className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Dark Mode
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {theme === 'dark' ? 'Currently on' : 'Currently off'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        theme === 'dark' ? 'bg-cyan-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          theme === 'dark' ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-[#1e3a5f]">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h2>
                </div>

                <div className="p-4 space-y-4">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Email
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Receive via email
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        emailNotifications ? 'bg-cyan-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          emailNotifications ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Push Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Push
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Browser notifications
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPushNotifications(!pushNotifications)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        pushNotifications ? 'bg-cyan-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          pushNotifications ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Appointment Reminders */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                        <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Reminders
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Appointment alerts
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setAppointmentReminders(!appointmentReminders)
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        appointmentReminders ? 'bg-cyan-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          appointmentReminders ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-red-200 dark:border-red-900/30 overflow-hidden">
                <div className="p-6 border-b border-red-200 dark:border-red-900/30">
                  <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                    Danger Zone
                  </h2>
                </div>

                <div className="p-4">
                  <button className="w-full p-4 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-sm font-medium transition-colors text-left">
                    <p className="font-medium">Deactivate Account</p>
                    <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                      Temporarily disable your account
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
