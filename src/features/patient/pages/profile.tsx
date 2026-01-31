import { useState } from 'react';
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
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-400">
          Manage your personal information and account settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-[#0d2137] rounded-2xl border border-[#1e3a5f] p-6">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
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
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors shadow-lg">
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-xl font-bold text-white mb-1">
              {profile.fullName}
            </h2>
            <p className="text-gray-400 mb-4">{profile.email}</p>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Email Verified</span>
            </div>
          </div>

          <hr className="my-6 border-[#1e3a5f]" />

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Screenings</span>
              <span className="text-white font-medium">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Appointments</span>
              <span className="text-white font-medium">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Member Since</span>
              <span className="text-white font-medium">Jan 2026</span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-[#0d2137] rounded-2xl border border-[#1e3a5f] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                Personal Information
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
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
                <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
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
                    className="w-full px-4 py-3 bg-[#1e3a5f]/50 border border-[#2d4a6f] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                ) : (
                  <p className="text-white font-medium">{profile.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className="text-white font-medium">{profile.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
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
                    className="w-full px-4 py-3 bg-[#1e3a5f]/50 border border-[#2d4a6f] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                ) : (
                  <p className="text-white font-medium">{profile.phone}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
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
                    className="w-full px-4 py-3 bg-[#1e3a5f]/50 border border-[#2d4a6f] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                ) : (
                  <p className="text-white font-medium">
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
                <label className="text-sm text-gray-400 mb-2 block">
                  Gender
                </label>
                {isEditing ? (
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#1e3a5f]/50 border border-[#2d4a6f] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-white font-medium capitalize">
                    {profile.gender}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
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
                    className="w-full px-4 py-3 bg-[#1e3a5f]/50 border border-[#2d4a6f] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                ) : (
                  <p className="text-white font-medium">{profile.address}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#1e3a5f]/50 border border-[#2d4a6f] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                ) : (
                  <p className="text-white font-medium">{profile.city}</p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Country
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#1e3a5f]/50 border border-[#2d4a6f] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                ) : (
                  <p className="text-white font-medium">{profile.country}</p>
                )}
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-[#0d2137] rounded-2xl border border-[#1e3a5f] p-6">
            <h2 className="text-lg font-semibold text-white mb-6">
              Security Settings
            </h2>

            <div className="space-y-4">
              {/* Change Password */}
              <div className="flex items-center justify-between p-4 bg-[#1e3a5f]/30 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Key className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Password</p>
                    <p className="text-sm text-gray-400">
                      Last changed 30 days ago
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white rounded-lg transition-colors">
                  Change
                </button>
              </div>

              {/* Two-Factor Auth */}
              <div className="flex items-center justify-between p-4 bg-[#1e3a5f]/30 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      Two-Factor Authentication
                    </p>
                    <p className="text-sm text-green-400">Enabled</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white rounded-lg transition-colors">
                  Manage
                </button>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-4 bg-[#1e3a5f]/30 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      Notification Preferences
                    </p>
                    <p className="text-sm text-gray-400">
                      Email & Push notifications
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white rounded-lg transition-colors">
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
