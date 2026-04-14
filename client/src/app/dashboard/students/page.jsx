'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Plus, Search, Edit2, Ban, Trash2, X, RefreshCw,
  ChevronLeft, ChevronRight, Mail, Phone, MapPin, Calendar,
  GraduationCap, Hash, AlertTriangle, Check, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastProvider';
import PasswordStrengthMeter from '@/components/ui/PasswordStrengthMeter';

export default function StudentsPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { type: 'ban'|'delete', student }
  const [actionLoading, setActionLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', admission_number: '',
    gender: '', date_of_birth: '', phone: '', address: '',
    guardian_name: '', guardian_phone: '', guardian_email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [actionReason, setActionReason] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const DEFAULT_PASSWORD = 'Secret123!';

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/students?search=${encodeURIComponent(search)}&page=${page}&per_page=20`);
      setStudents(res.data || []);
      setTotal(res.total || 0);
      setLastPage(res.last_page || 1);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [search, page, toast]);

  useEffect(() => {
    const token = api.getToken();
    if (!token) { router.push('/login'); return; }
    fetchStudents();
  }, [fetchStudents, router]);

  const resetForm = () => {
    setForm({ first_name: '', last_name: '', email: '', admission_number: '',
      gender: '', date_of_birth: '', phone: '', address: '',
      guardian_name: '', guardian_phone: '', guardian_email: '',
      password: DEFAULT_PASSWORD });
    setFormErrors({});
    setEditingStudent(null);
  };

  const openAddModal = () => { resetForm(); setShowModal(true); };
  const openEditModal = (s) => {
    setEditingStudent(s);
    setForm({
      first_name: s.first_name || '', last_name: s.last_name || '',
      email: s.email || '', admission_number: s.admission_number || '',
      gender: s.gender || '', date_of_birth: s.date_of_birth || '',
      phone: s.phone || '', address: s.address || '',
      guardian_name: s.guardian_name || '', guardian_phone: s.guardian_phone || '',
      guardian_email: s.guardian_email || '',
      password: '' // Leave empty when editing - only fill if they want to change
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingStudent ? `/students/${editingStudent.id}` : '/students';
      const method = editingStudent ? 'put' : 'post';
      await api[method](url, form);
      toast.success(editingStudent ? 'Student updated' : 'Student created');
      setShowModal(false);
      resetForm();
      fetchStudents();
    } catch (err) {
      if (err.data?.errors) setFormErrors(err.data.errors);
      else toast.error(err.data?.message || 'Operation failed');
    } finally { setSubmitting(false); }
  };

  const handleAction = async () => {
    if (!actionReason.trim()) { toast.error('Please provide a reason'); return; }
    setActionLoading(true);
    try {
      const s = actionModal.student;
      if (actionModal.type === 'ban') {
        await api.post(`/students/${s.id}/ban`, { reason: actionReason });
        toast.success('Student banned');
      } else {
        await api.delete(`/students/${s.id}`, { body: { reason: actionReason } });
        toast.success('Student deleted');
      }
      setActionModal(null);
      setActionReason('');
      fetchStudents();
    } catch (err) {
      toast.error(err.data?.message || 'Operation failed');
    } finally { setActionLoading(false); }
  };

  const fullName = (s) => `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email;

  const generateAdmissionNumber = () => {
    const year = new Date().getFullYear();
    const seq = Math.floor(Math.random() * 9000 + 1000);
    return `STU-${year}-${seq}`;
  };

  return (
    <DashboardLayout title="Students" subtitle="Manage your students" role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{total} Students</h2>
            <p className="text-sm text-text-secondary">Manage student records and enrollments</p>
          </div>
          <button onClick={openAddModal} className="glass-button inline-flex items-center gap-2 px-4 py-2.5 text-sm">
            <Plus size={16} /> Add Student
          </button>
        </div>

        {/* Search */}
        <div className="glass-input flex items-center gap-2 rounded-btn px-4 py-3">
          <Search size={18} className="text-text-muted flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, or admission number..."
            className="bg-transparent outline-none text-sm text-text-primary placeholder-text-muted w-full"
          />
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center">
              <GraduationCap size={40} className="text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">No students found</p>
              <button onClick={openAddModal} className="mt-4 glass-button text-sm px-4 py-2">
                <Plus size={14} className="inline mr-1" /> Add First Student
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Student</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider hidden md:table-cell">Admission #</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider hidden lg:table-cell">Guardian</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((s) => (
                    <tr key={s.id} className="glass-row">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                            {(s.first_name?.[0] || s.email?.[0] || 'S').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">{fullName(s)}</p>
                            <p className="text-xs text-text-muted truncate">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-xs font-mono bg-bg-main px-2 py-1 rounded text-text-secondary">
                          {s.admission_number || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <p className="text-sm text-text-secondary truncate max-w-[150px]">{s.guardian_name || '—'}</p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {s.banned ? (
                          <span className="inline-flex items-center gap-1 text-error text-xs"><Ban size={12} /> Banned</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-success text-xs"><Check size={12} /> Active</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setViewingStudent(s)} className="p-2 rounded-lg hover:bg-info/10 text-text-muted hover:text-info transition-all" title="View">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => openEditModal(s)} className="p-2 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-all" title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => setActionModal({ type: 'ban', student: s })} className="p-2 rounded-lg hover:bg-warning/10 text-text-muted hover:text-warning transition-all" title="Ban">
                            <Ban size={16} />
                          </button>
                          <button onClick={() => setActionModal({ type: 'delete', student: s })} className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-all" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                Page {page} of {lastPage}
              </p>
              <div className="flex items-center gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="glass-button px-3 py-2 disabled:opacity-40" title="Previous">
                  <ChevronLeft size={16} />
                </button>
                <button disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}
                  className="glass-button px-3 py-2 disabled:opacity-40" title="Next">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="glass-modal max-w-2xl w-full animate-scale-in flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
              <h3 className="text-lg font-bold text-text-primary">
                {editingStudent ? 'Edit Student' : 'Add Student'}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">First Name *</label>
                  <input type="text" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})}
                    className={`form-input ${formErrors.first_name ? 'border-error' : ''}`} placeholder="John" required />
                  {formErrors.first_name && <p className="text-error text-xs mt-1">{formErrors.first_name[0]}</p>}
                </div>
                <div>
                  <label className="form-label">Last Name *</label>
                  <input type="text" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})}
                    className={`form-input ${formErrors.last_name ? 'border-error' : ''}`} placeholder="Doe" required />
                  {formErrors.last_name && <p className="text-error text-xs mt-1">{formErrors.last_name[0]}</p>}
                </div>
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className={`form-input ${formErrors.email ? 'border-error' : ''}`} placeholder="john@school.edu" required />
                {formErrors.email && <p className="text-error text-xs mt-1">{formErrors.email[0]}</p>}
              </div>
              <div>
                <label className="form-label">Admission Number *</label>
                <div className="flex gap-2">
                  <input type="text" value={form.admission_number} onChange={e => setForm({...form, admission_number: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')})}
                    className={`form-input flex-1 ${formErrors.admission_number ? 'border-error' : ''}`} placeholder="STU-2026-001" required />
                  <button type="button" onClick={() => setForm({...form, admission_number: generateAdmissionNumber()})}
                    className="px-3 py-2.5 rounded-btn bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium whitespace-nowrap flex items-center gap-1.5 flex-shrink-0"
                    title="Auto-generate admission number">
                    <Hash size={14} /> Auto
                  </button>
                </div>
                {formErrors.admission_number && <p className="text-error text-xs mt-1">{formErrors.admission_number[0]}</p>}
              </div>
              <div>
                <label className="form-label">Password {!editingStudent && <span className="text-text-muted font-normal">(Default: {DEFAULT_PASSWORD})</span>}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    className={`form-input pr-10 ${formErrors.password ? 'border-error' : ''}`}
                    placeholder={editingStudent ? 'Leave blank to keep current' : DEFAULT_PASSWORD}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formErrors.password && <p className="text-error text-xs mt-1">{formErrors.password[0]}</p>}
                {!editingStudent && form.password && <PasswordStrengthMeter password={form.password} />}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Gender</label>
                  <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="form-input">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Date of Birth</label>
                  <input type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} className="form-input" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Phone</label>
                  <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="form-input" placeholder="+234..." />
                </div>
                <div>
                  <label className="form-label">Address</label>
                  <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="form-input" />
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-sm font-semibold text-text-primary mb-3">Guardian Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Guardian Name</label>
                    <input type="text" value={form.guardian_name} onChange={e => setForm({...form, guardian_name: e.target.value})} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Guardian Phone</label>
                    <input type="text" value={form.guardian_phone} onChange={e => setForm({...form, guardian_phone: e.target.value})} className="form-input" />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="form-label">Guardian Email</label>
                  <input type="email" value={form.guardian_email} onChange={e => setForm({...form, guardian_email: e.target.value})} className="form-input" />
                </div>
              </div>
            </form>
            <div className="flex gap-3 p-5 border-t border-border flex-shrink-0">
              <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                className="flex-1 px-4 py-2.5 rounded-btn border border-border text-sm font-medium text-text-secondary hover:bg-bg-main transition-colors">
                Cancel
              </button>
              <button type="submit" onClick={handleSubmit} disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-btn glass-button disabled:opacity-50">
                {submitting ? <span className="flex items-center justify-center gap-2"><RefreshCw size={14} className="animate-spin" /> Saving...</span> : editingStudent ? 'Update Student' : 'Create Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban/Delete Confirmation Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setActionModal(null)}>
          <div className="glass-modal max-w-md w-full animate-scale-in p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${actionModal.type === 'delete' ? 'bg-error/20' : 'bg-warning/20'}`}>
                {actionModal.type === 'delete' ? <AlertTriangle size={20} className="text-error" /> : <Ban size={20} className="text-warning" />}
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                {actionModal.type === 'delete' ? 'Delete' : 'Ban'} Student
              </h3>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Are you sure you want to <strong>{actionModal.type}</strong> <strong>{fullName(actionModal.student)}</strong>?
              {actionModal.type === 'delete' && ' This action cannot be undone.'}
            </p>
            <label className="form-label">Reason *</label>
            <textarea value={actionReason} onChange={e => setActionReason(e.target.value)} rows={3}
              className="form-input mb-4" placeholder="Provide a reason..." required />
            <div className="flex gap-3">
              <button onClick={() => setActionModal(null)} disabled={actionLoading}
                className="flex-1 px-4 py-2.5 rounded-btn border border-border text-sm font-medium text-text-secondary hover:bg-bg-main transition-colors">
                Cancel
              </button>
              <button onClick={handleAction} disabled={actionLoading}
                className={`flex-1 px-4 py-2.5 rounded-btn text-sm font-medium text-white transition-all ${
                  actionModal.type === 'delete' ? 'bg-error hover:bg-error/80' : 'bg-warning hover:bg-warning/80'
                } disabled:opacity-50`}>
                {actionLoading ? <span className="flex items-center justify-center gap-2"><RefreshCw size={14} className="animate-spin" /> Processing...</span> : `Confirm ${actionModal.type === 'delete' ? 'Delete' : 'Ban'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
