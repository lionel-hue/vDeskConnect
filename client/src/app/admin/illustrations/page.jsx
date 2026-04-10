'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Upload,
  Image,
  Layers,
  Zap,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle,
  X,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { api } from '@/lib/api';
import { useIllustrations } from '@/contexts/IllustrationProvider';

// Illustration keys the system expects
const ILLUSTRATION_KEYS = [
  { key: 'login_hero', section: 'auth', label: 'Login Page Hero' },
  { key: 'signup_school', section: 'auth', label: 'Signup - School Info' },
  { key: 'signup_admin', section: 'auth', label: 'Signup - Admin Details' },
  { key: 'signup_verify', section: 'auth', label: 'Signup - Email Verify' },
  { key: 'signup_password', section: 'auth', label: 'Signup - Set Password' },
  { key: 'email_verification', section: 'auth', label: 'Email Verification Page' },
  { key: 'forgot_password', section: 'auth', label: 'Forgot Password' },
  { key: 'password_reset_sent', section: 'auth', label: 'Reset Link Sent' },
  { key: 'set_new_password', section: 'auth', label: 'Set New Password' },
  { key: 'password_reset_success', section: 'auth', label: 'Password Reset Success' },
  { key: 'welcome_hero', section: 'landing', label: 'Landing Page Hero' },
  { key: 'welcome_hero_background', section: 'landing', label: 'Welcome Page Background (Glassmorphic)' },
  { key: 'superadmin_dashboard_hero', section: 'admin', label: 'Super Admin Dashboard' },
  { key: 'dashboard_empty', section: 'dashboard', label: 'Empty Dashboard State' },
  { key: 'no_results', section: 'dashboard', label: 'No Results State' },
  { key: 'error_404', section: 'errors', label: '404 Error Page' },
];

export default function IllustrationsPage() {
  const router = useRouter();
  const { refresh: refreshIllustrations } = useIllustrations();
  const [loading, setLoading] = useState(true);
  const [activeIllustrations, setActiveIllustrations] = useState({});
  const [packs, setPacks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [packName, setPackName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch data on mount
  const fetchData = async () => {
    try {
      // Fetch active illustrations
      const ills = await api.get('/ui/illustrations');
      const keyed = {};
      ills.forEach((ill) => { keyed[ill.key] = ill; });
      setActiveIllustrations(keyed);

      // Fetch packs
      const packsData = await api.get('/ui/illustrations/packs');
      setPacks(packsData || []);
    } catch (err) {
      console.error('Failed to fetch illustrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    api.get('/user')
      .then((data) => {
        if (data.user?.role !== 'super_admin') {
          router.push('/dashboard');
          return;
        }
        fetchData();
      })
      .catch(() => {
        api.logout();
        router.push('/login');
      });
  }, [router]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      const validExtensions = ['.svg', '.png', '.jpg', '.jpeg', '.webp'];
      const hasValidType = validTypes.includes(file.type);
      const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return (hasValidType || hasValidExtension) && isValidSize;
    });
    setSelectedFiles(validFiles);
  };

  const handleUpload = async () => {
    if (!packName.trim() || selectedFiles.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('pack_name', packName);
      selectedFiles.forEach((file) => {
        formData.append('illustrations[]', file);
      });

      const response = await api.post('/ui/illustrations/packs', formData);
      
      console.log('Upload successful:', response);

      setPackName('');
      setSelectedFiles([]);
      setShowUploadModal(false);
      await fetchData(); // Refresh local list
      refreshIllustrations(); // Refresh global context for other pages
    } catch (err) {
      console.error('Upload failed:', err);
      const errorMessage = err?.data?.message || 'Upload failed. Please check your files and try again.';
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleActivatePack = async (packNameToActivate) => {
    setActionLoading(packNameToActivate);
    try {
      const response = await api.put(`/ui/illustrations/packs/${encodeURIComponent(packNameToActivate)}/activate`);
      console.log('Activation successful:', response);
      await fetchData();
      refreshIllustrations(); // Refresh global context
    } catch (err) {
      console.error('Activation failed:', err);
      const errorMessage = err?.data?.message || 'Failed to activate pack. Please try again.';
      alert(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePack = async (packNameToDelete) => {
    if (!confirm(`Delete illustration pack "${packNameToDelete}"? This cannot be undone.`)) return;
    setActionLoading(packNameToDelete);
    try {
      await api.delete(`/ui/illustrations/packs/${encodeURIComponent(packNameToDelete)}`);
      await fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout
      title="UI Illustrations"
      subtitle="Manage illustration packs for the entire platform"
      role="super_admin"
    >
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-gradient-to-br from-primary/10 to-primary-light/10 border border-primary/20 rounded-hero p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Living UI Illustration System</h3>
              <p className="text-sm text-text-secondary mt-1">
                Upload illustration packs to refresh the look of the entire platform. Each pack contains
                illustrations for different sections (auth pages, dashboards, error pages).
                Activate a pack to instantly apply all its illustrations across the app.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-stat">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center backdrop-blur-lg border border-white/10">
                <Layers size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{packs.length}</p>
                <p className="text-sm text-text-secondary">Total Packs</p>
              </div>
            </div>
          </div>
          <div className="glass-stat">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center backdrop-blur-lg border border-white/10">
                <CheckCircle size={20} className="text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{Object.keys(activeIllustrations).length}</p>
                <p className="text-sm text-text-secondary">Active Illustrations</p>
              </div>
            </div>
          </div>
          <div className="glass-stat">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center backdrop-blur-lg border border-white/10">
                <Zap size={20} className="text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{ILLUSTRATION_KEYS.length}</p>
                <p className="text-sm text-text-secondary">Required Slots</p>
              </div>
            </div>
          </div>
        </div>

        {/* Illustration Keys Reference */}
        <div className="glass-card">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h3 className="font-semibold text-text-primary">Illustration Slots</h3>
              <p className="text-xs text-text-secondary mt-1">
                These are the illustration keys used throughout the platform
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-btn glass-button text-sm"
            >
              <Upload size={16} />
              Upload New Pack
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Key</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Section</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Label</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ILLUSTRATION_KEYS.map((item) => {
                  const isActive = !!activeIllustrations[item.key];
                  return (
                    <tr key={item.key} className="glass-row">
                      <td className="px-5 py-3">
                        <code className="text-xs bg-bg-main px-2 py-1 rounded text-primary font-mono">
                          {item.key}
                        </code>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-bg-main text-text-secondary capitalize">
                          {item.section}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-text-primary">{item.label}</td>
                      <td className="px-5 py-3 text-center">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-success text-xs">
                            <CheckCircle size={14} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-text-muted text-xs">
                            <X size={14} /> Default
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Uploaded Packs */}
        <div className="glass-card">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold text-text-primary">Uploaded Packs</h3>
            <p className="text-xs text-text-secondary mt-1">
              Manage your uploaded illustration packs
            </p>
          </div>
          {packs.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={40} className="text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">No illustration packs uploaded yet.</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-btn glass-button text-sm"
              >
                <Upload size={16} /> Upload Your First Pack
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {packs.map((pack) => (
                <div key={pack.pack_name} className="flex items-center justify-between px-5 py-4 glass-row">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      pack.is_active ? 'bg-success/10' : 'bg-primary/10'
                    }`}>
                      <Package size={20} className={pack.is_active ? 'text-success' : 'text-primary'} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text-primary">{pack.pack_name}</p>
                        {pack.is_active && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                            <CheckCircle size={10} /> Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {pack.total_illustrations} illustrations • Uploaded {new Date(pack.created_at).toLocaleDateString()}
                        {pack.active_count > 0 && ` • ${pack.active_count} active`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!pack.is_active && (
                      <button
                        onClick={() => handleActivatePack(pack.pack_name)}
                        disabled={actionLoading === pack.pack_name}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === pack.pack_name ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Zap size={14} />
                        )}
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePack(pack.pack_name)}
                      disabled={actionLoading === pack.pack_name}
                      className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-all disabled:opacity-50"
                      title="Delete pack"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
            <div
              className="glass-modal max-w-lg w-full animate-scale-in flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header - fixed */}
              <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
                <h3 className="text-lg font-bold text-text-primary">Upload Illustration Pack</h3>
                <button onClick={() => setShowUploadModal(false)} className="text-text-muted hover:text-text-primary transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body - scrollable */}
              <div className="p-5 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="form-label">Pack Name</label>
                  <input
                    type="text"
                    value={packName}
                    onChange={(e) => setPackName(e.target.value)}
                    placeholder="e.g., Summer 2026 Refresh"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Illustration Files</label>
                  <div className="border-2 border-dashed border-border rounded-card p-6 text-center hover:border-primary/40 transition-colors">
                    <Upload size={28} className="text-text-muted mx-auto mb-2" />
                    <p className="text-sm text-text-secondary mb-1">
                      Drag & drop illustration files here
                    </p>
                    <p className="text-xs text-text-muted mb-3">
                      SVG, PNG, JPG, or WebP • Max 5MB each
                    </p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-btn bg-primary text-white text-sm font-medium cursor-pointer hover:bg-primary-dark transition-colors">
                      <Plus size={16} />
                      Select Files
                      <input
                        type="file"
                        multiple
                        accept="image/svg+xml,image/png,image/jpeg,image/jpg,image/webp,.svg,.png,.jpg,.jpeg,.webp"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                      {selectedFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                          <Image size={14} className="text-primary flex-shrink-0" />
                          <span className="truncate">{file.name}</span>
                          <span className="text-text-muted flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-info/10 border border-info/20 rounded-btn p-3">
                  <p className="text-info text-xs">
                    <strong>Tip:</strong> Name your files using the illustration keys (e.g., login_hero.svg, signup_school.png).
                    The system will automatically map them to the correct slots.
                  </p>
                </div>
              </div>

              {/* Modal Footer - fixed */}
              <div className="flex gap-3 p-5 border-t border-border flex-shrink-0 bg-bg-card">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setPackName('');
                    setSelectedFiles([]);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-btn border border-border text-sm font-medium text-text-secondary hover:bg-bg-main transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !packName.trim() || selectedFiles.length === 0}
                  className="flex-1 px-4 py-2.5 rounded-btn bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw size={16} className="animate-spin" /> Uploading...
                    </span>
                  ) : (
                    'Upload Pack'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
