import { useState, useRef, useCallback, useEffect } from 'react';
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
  Upload,
  Image as ImageIcon,
  X,
  Clipboard,
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
    avatarUrl:
      'https://tse4.mm.bing.net/th/id/OIP.2CZ8dHVST2-MS2FKuIh_TwHaFj?rs=1&pid=ImgDetMain&o=7&rm=3',
  });

  const [formData, setFormData] = useState(profile);

  // Avatar upload state
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Validate and process image file
  const processImageFile = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select an image file'));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Image must be less than 5MB'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  // Handle file selection from input
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await processImageFile(file);
        setPreviewUrl(dataUrl);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to load image');
      }
    },
    [processImageFile]
  );

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await processImageFile(file);
        setPreviewUrl(dataUrl);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to load image');
      }
    },
    [processImageFile]
  );

  // Handle paste from clipboard
  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      if (!showAvatarUpload) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;
          try {
            const dataUrl = await processImageFile(file);
            setPreviewUrl(dataUrl);
          } catch (error) {
            alert(
              error instanceof Error ? error.message : 'Failed to load image'
            );
          }
          break;
        }
      }
    },
    [showAvatarUpload, processImageFile]
  );

  // Add paste event listener
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  // Handle avatar save
  const handleAvatarSave = async () => {
    if (!previewUrl) return;
    setIsUploading(true);
    try {
      // TODO: Upload to server and get URL back
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate upload
      setProfile((prev) => ({ ...prev, avatarUrl: previewUrl }));
      setFormData((prev) => ({ ...prev, avatarUrl: previewUrl }));
      setShowAvatarUpload(false);
      setPreviewUrl(null);
    } catch {
      alert('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  // Cancel avatar upload
  const handleAvatarCancel = () => {
    setShowAvatarUpload(false);
    setPreviewUrl(null);
    setIsDragging(false);
  };

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
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          My Profile
        </h1>
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
              <button
                onClick={() => setShowAvatarUpload(true)}
                className="absolute bottom-0 right-0 w-10 h-10 bg-brand rounded-full flex items-center justify-center text-white hover:brightness-110 transition-all shadow-lg"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar Upload Modal */}
            {showAvatarUpload && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-[var(--bg-primary)] rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl border border-[var(--border-color)]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                      Update Profile Photo
                    </h3>
                    <button
                      onClick={handleAvatarCancel}
                      className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-[var(--text-secondary)]" />
                    </button>
                  </div>

                  {/* Drop Zone */}
                  <div
                    ref={dropZoneRef}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                      isDragging
                        ? 'border-brand bg-brand-soft/20 scale-[1.02]'
                        : 'border-[var(--border-color)] hover:border-brand/50 hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    {previewUrl ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-brand shadow-lg">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Click or drop another image to change
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                            isDragging
                              ? 'bg-brand text-white'
                              : 'bg-brand-soft text-brand'
                          }`}
                        >
                          {isDragging ? (
                            <Upload className="w-8 h-8 animate-bounce" />
                          ) : (
                            <ImageIcon className="w-8 h-8" />
                          )}
                        </div>
                        <div>
                          <p className="text-[var(--text-primary)] font-medium mb-1">
                            {isDragging
                              ? 'Drop your image here'
                              : 'Drag & drop your photo'}
                          </p>
                          <p className="text-sm text-[var(--text-secondary)]">
                            or click to browse files
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Paste hint */}
                  <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <Clipboard className="w-4 h-4 text-brand" />
                    <span className="text-sm text-[var(--text-secondary)]">
                      You can also{' '}
                      <span className="text-brand font-medium">Ctrl+V</span> to
                      paste an image
                    </span>
                  </div>

                  {/* File requirements */}
                  <p className="text-xs text-[var(--text-muted)] text-center mt-3">
                    Supported formats: JPG, PNG, GIF, WebP • Max size: 5MB
                  </p>

                  {/* Actions */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleAvatarCancel}
                      className="flex-1 px-4 py-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-xl transition-colors border border-[var(--border-color)]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAvatarSave}
                      disabled={!previewUrl || isUploading}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Photo
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

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
              <span className="text-[var(--text-secondary)]">
                Total Screenings
              </span>
              <span className="text-[var(--text-primary)] font-medium">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Appointments</span>
              <span className="text-[var(--text-primary)] font-medium">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Member Since</span>
              <span className="text-[var(--text-primary)] font-medium">
                Jan 2026
              </span>
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
                  <p className="text-[var(--text-primary)] font-medium">
                    {profile.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className="text-[var(--text-primary)] font-medium">
                  {profile.email}
                </p>
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
                  <p className="text-[var(--text-primary)] font-medium">
                    {profile.phone}
                  </p>
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
                  <p className="text-[var(--text-primary)] font-medium">
                    {profile.address}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="text-sm text-[var(--text-secondary)] mb-2 block">
                  City
                </label>
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
                  <p className="text-[var(--text-primary)] font-medium">
                    {profile.city}
                  </p>
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
                  <p className="text-[var(--text-primary)] font-medium">
                    {profile.country}
                  </p>
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
                    <p className="text-[var(--text-primary)] font-medium">
                      Password
                    </p>
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
