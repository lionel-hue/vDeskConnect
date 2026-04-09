'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Upload,
  Eye,
  Check,
  X,
  Image,
  Layers,
  Zap,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { api } from '@/lib/api';

// Illustration keys that the system expects
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
  { key: 'superadmin_dashboard_hero', section: 'admin', label: 'Super Admin Dashboard' },
  { key: 'dashboard_empty', section: 'dashboard', label: 'Empty Dashboard State' },
  { key: 'no_results', section: 'dashboard', label: 'No Results State' },
  { key: 'error_404', section: 'errors', label: '404 Error Page' },
];

const MOCK_PACKS = [
  {
    id: 1,
    name: 'Fresh Start 2026',
    count: 15,
    isActive: true,
    createdAt: '2026-01-15',
    createdBy: 'Super Admin',
  },
  {
    id: 2,
    name: 'Spring Refresh',
    count: 12,
    isActive: false,
    createdAt: '2026-03-01',
    createdBy: 'Super Admin',
  },
];

export default function IllustrationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [illustrations, setIllustrations] = useState({});
  const [packs, setPacks] = useState(MOCK_PACKS);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [packName, setPackName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

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
        // Fetch active illustrations
        return api.get('/ui/illustrations');
      })
      .then((data) => {
        if (data) {
          const keyed = {};
          data.forEach((ill) => { keyed[ill.key] = ill; });
          setIllustrations(keyed);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [router]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
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

      await api.post('/ui/illustrations/packs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPacks([
        {
          id: packs.length + 1,
          name: packName,
          count: selectedFiles.length,
          isActive: false,
          createdAt: new Date().toISOString().split('T')[0],
          createdBy: 'Super Admin',
        },
        ...packs,
      ]);

      setPackName('');
      setSelectedFiles([]);
      setShowUploadModal(false);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleActivatePack = async (packId) => {
    try {
      // API call to activate pack
      setPacks(packs.map((p) => ({
        ...p,
        isActive: p.id === packId,
      })));
    } catch (err) {
      console.error('Activation failed:', err);
    }
  };

  const handleDeletePack = async (packId) => {
    if (!confirm('Delete this illustration pack? This cannot be undone.')) return;
    try {
      setPacks(packs.filter((p) => p.id !== packId));
    } catch (err) {
      console.error('Delete failed:', err);
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
                illustrations for different sections (auth pages, dashboards, error pages, empty states).
                Activate a pack to instantly apply all its illustrations across the app.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-bg-card rounded-card shadow-soft p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Layers size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{packs.length}</p>
                <p className="text-sm text-text-secondary">Total Packs</p>
              </div>
            </div>
          </div>
          <div className="bg-bg-card rounded-card shadow-soft p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {packs.reduce((acc, p) => acc + p.count, 0)}
                </p>
                <p className="text-sm text-text-secondary">Total Illustrations</p>
              </div>
            </div>
          </div>
          <div className="bg-bg-card rounded-card shadow-soft p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
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
        <div className="bg-bg-card rounded-card shadow-soft">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h3 className="font-semibold text-text-primary">Illustration Slots</h3>
              <p className="text-xs text-text-secondary mt-1">
                These are the illustration keys used throughout the platform
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-btn bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all duration-250 hover:scale-105"
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
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ILLUSTRATION_KEYS.map((item) => {
                  const isActive = !!illustrations[item.key];
                  return (
                    <tr key={item.key} className="hover:bg-bg-main/50 transition-colors">
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
                            <Check size={14} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-text-muted text-xs">
                            <X size={14} /> Default
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {isActive ? (
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                            <Image size={20} className="text-primary" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-border rounded-lg flex items-center justify-center mx-auto">
                            <Image size={16} className="text-text-muted" />
                          </div>
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
        <div className="bg-bg-card rounded-card shadow-soft">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold text-text-primary">Uploaded Packs</h3>
            <p className="text-xs text-text-secondary mt-1">
              Manage your uploaded illustration packs
            </p>
          </div>
          <div className="divide-y divide-border">
            {packs.map((pack) => (
              <div key={pack.id} className="flex items-center justify-between px-5 py-4 hover:bg-bg-main/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    pack.isActive ? 'bg-success/10' : 'bg-primary/10'
                  }`}>
                    <Package size={20} className={pack.isActive ? 'text-success' : 'text-primary'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text-primary">{pack.name}</p>
                      {pack.isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                          <Check size={10} /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {pack.count} illustrations • Uploaded {pack.createdAt} by {pack.createdBy}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!pack.isActive && (
                    <button
                      onClick={() => handleActivatePack(pack.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Zap size={14} /> Activate
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePack(pack.id)}
                    className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-all"
                    title="Delete pack"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
            <div className="bg-bg-card rounded-card shadow-elevated max-w-lg w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-text-primary">Upload Illustration Pack</h3>
                <button onClick={() => setShowUploadModal(false)} className="text-text-muted hover:text-text-primary transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
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
                  <div className="border-2 border-dashed border-border rounded-card p-8 text-center hover:border-primary/40 transition-colors">
                    <Upload size={32} className="text-text-muted mx-auto mb-3" />
                    <p className="text-sm text-text-secondary mb-1">
                      Drag & drop illustration files here
                    </p>
                    <p className="text-xs text-text-muted mb-3">
                      SVG, PNG, or WebP • Max 5MB each
                    </p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-btn bg-primary text-white text-sm font-medium cursor-pointer hover:bg-primary-dark transition-colors">
                      <Plus size={16} />
                      Select Files
                      <input
                        type="file"
                        multiple
                        accept=".svg,.png,.webp"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {selectedFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                          <Image size={14} className="text-primary" />
                          <span>{file.name}</span>
                          <span className="text-text-muted">({(file.size / 1024).toFixed(1)} KB)</span>
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

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
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
