import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Shield,
  Bell,
  Key,
  Save,
  Edit3,
  CheckCircle,
} from 'lucide-react';
import PatientLayout from '../components/PatientLayout';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+84 123 456 789',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    address: '123 Nguyen Hue Street',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
    avatarUrl: '',
  });

  const [formData, setFormData] = useState(profile);

  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);
    // TODO: Call API to update profile
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  return (
    <PatientLayout userName={profile.fullName}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">My Profile</h1>
        <p className="text-[var(--text-secondary)]">
          Manage your personal information and account settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="medical-card">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full bg-brand flex items-center justify-center overflow-hidden shadow-brand">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {profile.fullName.charAt(0)}
                  </span>
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-brand rounded-full flex items-center justify-center text-white hover:brightness-110 transition-all shadow-lg">
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              {profile.fullName}
            </h2>
            <p className="text-[var(--text-secondary)] mb-4">{profile.email}</p>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-sm border border-green-100">
              <CheckCircle className="w-4 h-4" />
              <span>Email Verified</span>
            </div>
          </div>

          <hr className="my-6 border-[var(--border-color)]" />

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Total Screenings</span>
              <span className="text-[var(--text-primary)] font-medium">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Appointments</span>
              <span className="text-[var(--text-primary)] font-medium">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Member Since</span>
              <span className="text-[var(--text-primary)] font-medium">Jan 2026</span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="medical-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Personal Information
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg transition-colors border border-[var(--border-color)]"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                  />
                ) : (
                  <p className="text-[var(--text-primary)] font-medium">{profile.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className="text-[var(--text-primary)] font-medium">{profile.email}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                  />
                ) : (
                  <p className="text-[var(--text-primary)] font-medium">{profile.phone}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
                  <Calendar className="w-4 h-4" />
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                  />
                ) : (
                  <p className="text-[var(--text-primary)] font-medium">
                    {new Date(profile.dateOfBirth).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="text-sm text-[var(--text-secondary)] mb-2 block">
                  Gender
                </label>
                {isEditing ? (
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-[var(--text-primary)] font-medium capitalize">
                    {profile.gender}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                  />
                ) : (
                  <p className="text-[var(--text-primary)] font-medium">{profile.address}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="text-sm text-[var(--text-secondary)] mb-2 block">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                  />
                ) : (
                  <p className="text-[var(--text-primary)] font-medium">{profile.city}</p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="text-sm text-[var(--text-secondary)] mb-2 block">
                  Country
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                  />
                ) : (
                  <p className="text-[var(--text-primary)] font-medium">{profile.country}</p>
                )}
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="medical-card">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
              Security Settings
            </h2>

            <div className="space-y-4">
              {/* Change Password */}
              <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center">
                    <Key className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Password</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Last changed 30 days ago
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-brand-soft text-[var(--text-primary)] rounded-lg transition-colors border border-[var(--border-color)]">
                  Change
                </button>
              </div>

              {/* Two-Factor Auth */}
              <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">
                      Two-Factor Authentication
                    </p>
                    <p className="text-sm text-green-600">Enabled</p>
                  </div>
                </div>
                <Link 
                  to="/patient/security"
                  className="px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-brand-soft text-[var(--text-primary)] rounded-lg transition-colors border border-[var(--border-color)]"
                >
                  Manage
                </Link>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">
                      Notification Preferences
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Email & Push notifications
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-brand-soft text-[var(--text-primary)] rounded-lg transition-colors border border-[var(--border-color)]">
                  Configure
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
