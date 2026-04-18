'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Video, Plus, Trash2, Edit2, X, Play, CheckCircle, Calendar,
  Clock, BookOpen, Users, Link as LinkIcon, FileText, Search,
  Filter, ChevronLeft, ChevronRight, ExternalLink, AlertCircle, Eye,
  File, Download, Save, Clock3, Image, Globe,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { academicApi } from '@/lib/academic-api';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastProvider';

const STATUS_COLORS = {
  scheduled: 'bg-info/10 text-info',
  in_progress: 'bg-warning/10 text-warning',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-error/10 text-error',
};

const STATUS_LABELS = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const TYPE_COLORS = {
  sync: 'bg-primary/10 text-primary',
  async: 'bg-purple-10 text-purple-600',
  hybrid: 'bg-warning/10 text-warning',
};

const TYPE_LABELS = {
  sync: 'Live (Sync)',
  async: 'Recorded (Async)',
  hybrid: 'Hybrid',
};

export default function LecturesPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [lectures, setLectures] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', type: '', grade_level_id: '', subject_id: '', term_id: '' });
  const [gradeLevels, setGradeLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, per_page: 20, total: 0 });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [lectureForm, setLectureForm] = useState({
    title: '', description: '', content: '', teacher_id: '', grade_level_id: '', subject_id: '',
    section_id: '', scheduled_at: '', duration_minutes: 40, type: 'async',
    is_online: false, meeting_link: '', async_available_after: '', is_published: false,
  });
  const [formLoading, setFormLoading] = useState(false);

  // View modal
  const [viewingLecture, setViewingLecture] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [lectureResources, setLectureResources] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Add resource modal
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    title: '', type: 'pdf', url: '', description: '',
    is_downloadable: false, is_savable: false, available_from: '', order_index: 0,
  });

  const fetchLectures = useCallback(async () => {
    setLoading(true);
    try {
      const res = await academicApi.lectures.getAll({ ...filters, page: pagination.page, per_page: pagination.per_page });
      setLectures(res.data || []);
      setPagination(prev => ({ ...prev, total: res.total }));
    } catch (err) {
      toast.error('Failed to load lectures');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.per_page, toast]);

  const fetchMeta = useCallback(async () => {
    try {
      const [gradesRes, subjectsRes, teachersRes] = await Promise.all([
        academicApi.gradeLevels.getAll().catch(() => ({ grade_levels: [] })),
        api.get('/academic/subjects').catch(() => ({ subjects: [] })),
        api.get('/teachers').catch(() => ({ data: [] })),
      ]);
      setGradeLevels(gradesRes.grade_levels || []);
      setSubjects(subjectsRes.subjects || []);
      setTeachers(teachersRes.data || []);
    } catch (err) {
      console.error('Failed to load meta:', err);
    }
  }, []);

  useEffect(() => {
    const token = api.getToken();
    if (!token) { router.push('/login'); return; }
    fetchMeta();
  }, [fetchMeta, router]);

  useEffect(() => {
    const token = api.getToken();
    if (!token) return;
    fetchLectures();
  }, [fetchLectures]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingLecture) {
        await academicApi.lectures.update(editingLecture.id, lectureForm);
        toast.success('Lecture updated successfully');
      } else {
        await academicApi.lectures.create(lectureForm);
        toast.success('Lecture created successfully');
      }
      setShowModal(false);
      setEditingLecture(null);
      setLectureForm({
        title: '', description: '', content: '', teacher_id: '', grade_level_id: '', subject_id: '',
        section_id: '', scheduled_at: '', duration_minutes: 40, type: 'async',
        is_online: false, meeting_link: '', async_available_after: '', is_published: false,
      });
      fetchLectures();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to save lecture');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (lecture) => {
    setEditingLecture(lecture);
    setLectureForm({
      title: lecture.title || '',
      description: lecture.description || '',
      content: lecture.content || '',
      teacher_id: lecture.teacher_id || '',
      grade_level_id: lecture.grade_level_id || '',
      subject_id: lecture.subject_id || '',
      section_id: lecture.section_id || '',
      scheduled_at: lecture.scheduled_at ? lecture.scheduled_at.slice(0, 16) : '',
      duration_minutes: lecture.duration_minutes || 40,
      type: lecture.type || 'async',
      is_online: lecture.is_online || false,
      meeting_link: lecture.meeting_link || '',
      async_available_after: lecture.async_available_after ? lecture.async_available_after.slice(0, 16) : '',
      is_published: lecture.is_published || false,
    });
    setShowModal(true);
  };

  const openViewModal = async (lecture) => {
    setViewLoading(true);
    setActiveTab('overview');
    try {
      const [lectureRes, resourcesRes] = await Promise.all([
        academicApi.lectures.getOne(lecture.id),
        academicApi.lectureResources.getAll(lecture.id).catch(() => ({ resources: [] })),
      ]);
      setViewingLecture(lectureRes.lecture || lecture);
      setLectureResources(resourcesRes.resources || []);
    } catch (err) {
      toast.error('Failed to load lecture details');
      setViewingLecture(lecture);
    } finally {
      setViewLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this lecture?')) return;
    try {
      await academicApi.lectures.delete(id);
      toast.success('Lecture deleted');
      fetchLectures();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to delete');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      if (status === 'in_progress') {
        await academicApi.lectures.start(id);
      } else if (status === 'completed') {
        await academicApi.lectures.complete(id);
      } else if (status === 'cancelled') {
        await academicApi.lectures.cancel(id);
      }
      toast.success('Status updated');
      fetchLectures();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to update status');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const filteredGradeLevels = gradeLevels.filter(g => g.id == lectureForm.grade_level_id);
  const filteredSubjects = subjects.filter(s => s.id == lectureForm.subject_id);

  const totalPages = Math.ceil(pagination.total / pagination.per_page);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-text-primary">Lectures</h1>
            <p className="text-sm text-text-secondary">Manage teaching sessions</p>
          </div>
          <button
            onClick={() => { setEditingLecture(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            <Plus className="w-4 h-4" /> Create Lecture
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 bg-card dark:bg-gray-800 p-4 rounded-lg border border-border">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search lectures..."
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-white dark:bg-gray-700 text-text-primary"
            />
          </div>
          <select
            value={filters.status}
            onChange={e => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-white dark:bg-gray-700 text-text-primary"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filters.type}
            onChange={e => handleFilterChange('type', e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-white dark:bg-gray-700 text-text-primary"
          >
            <option value="">All Types</option>
            <option value="sync">Live (Sync)</option>
            <option value="async">Recorded (Async)</option>
            <option value="hybrid">Hybrid</option>
          </select>
          <select
            value={filters.grade_level_id}
            onChange={e => handleFilterChange('grade_level_id', e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-white dark:bg-gray-700 text-text-primary"
          >
            <option value="">All Grades</option>
            {gradeLevels.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <select
            value={filters.subject_id}
            onChange={e => handleFilterChange('subject_id', e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-white dark:bg-gray-700 text-text-primary"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Lecture List */}
        {loading ? (
          <div className="text-center py-8 text-text-secondary">Loading...</div>
        ) : lectures.length === 0 ? (
          <div className="text-center py-8 bg-card dark:bg-gray-800 rounded-lg border border-border">
            <Video className="w-12 h-12 mx-auto text-text-muted mb-2" />
            <p className="text-text-secondary">No lectures found</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Create First Lecture
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {lectures.map(lecture => (
              <div key={lecture.id} className="bg-card dark:bg-gray-800 p-4 rounded-lg border border-border">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-text-primary">{lecture.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${TYPE_COLORS[lecture.type] || TYPE_COLORS.async}`}>
                        {TYPE_LABELS[lecture.type] || 'Recorded (Async)'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[lecture.status] || STATUS_COLORS.scheduled}`}>
                        {STATUS_LABELS[lecture.status] || 'Scheduled'}
                      </span>
                      {lecture.is_published && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-success/10 text-success">Published</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-text-secondary">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {lecture.subject_name || lecture.subject?.name || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {lecture.grade_level_name || lecture.grade_level?.name || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(lecture.scheduled_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {lecture.duration_minutes} min
                      </span>
                    </div>
                    <p className="text-sm text-text-muted mt-2 line-clamp-2">{lecture.description}</p>
                    {lecture.meeting_link && (
                      <a
                        href={lecture.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-1"
                      >
                        <LinkIcon className="w-3 h-3" /> Join Meeting
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {lecture.status === 'scheduled' && (
                      <button
                        onClick={() => handleStatusChange(lecture.id, 'in_progress')}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-warning/10 text-warning rounded-lg hover:bg-warning/20"
                      >
                        <Play className="w-3.5 h-3.5" /> Start
                      </button>
                    )}
                    {lecture.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusChange(lecture.id, 'completed')}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-success/10 text-success rounded-lg hover:bg-success/20"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Complete
                      </button>
                    )}
                    {lecture.status !== 'completed' && lecture.status !== 'cancelled' && (
                      <button
                        onClick={() => handleStatusChange(lecture.id, 'cancelled')}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-error/10 text-error rounded-lg hover:bg-error/20"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() => openViewModal(lecture)}
                      className="p-2 text-text-muted hover:text-text-primary"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {(lecture.type === 'async' || lecture.type === 'hybrid') && !lecture.is_published && (
                      <button
                        onClick={async () => {
                          try {
                            await academicApi.lectures.publish(lecture.id);
                            toast.success('Lecture published');
                            fetchLectures();
                          } catch (err) {
                            toast.error(err.data?.message || 'Failed to publish');
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-success/10 text-success rounded-lg hover:bg-success/20"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(lecture)}
                      className="p-2 text-text-muted hover:text-text-primary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(lecture.id)}
                      className="p-2 text-error hover:text-error/80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">
              Showing {(pagination.page - 1) * pagination.per_page + 1} to {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 border border-border rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm">Page {pagination.page} of {totalPages}</span>
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page >= totalPages}
                className="p-2 border border-border rounded-lg disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-text-primary">
                  {editingLecture ? 'Edit Lecture' : 'Create Lecture'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={lectureForm.title}
                    onChange={e => setLectureForm({ ...lectureForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-white dark:bg-gray-700 text-text-primary"
                    placeholder="e.g., Introduction to Algebra"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Teacher *</label>
                    <select
                      required
                      value={lectureForm.teacher_id}
                      onChange={e => setLectureForm({ ...lectureForm, teacher_id: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-white dark:bg-gray-700 text-text-primary"
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.first_name} {t.last_name} ({t.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Grade Level *</label>
                    <select
                      required
                      value={lectureForm.grade_level_id}
                      onChange={e => setLectureForm({ ...lectureForm, grade_level_id: e.target.value, subject_id: '' })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-white dark:bg-gray-700 text-text-primary"
                    >
                      <option value="">Select Grade</option>
                      {gradeLevels.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Subject *</label>
                  <select
                    required
                    value={lectureForm.subject_id}
                    onChange={e => setLectureForm({ ...lectureForm, subject_id: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-white dark:bg-gray-700 text-text-primary"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Scheduled Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={lectureForm.scheduled_at}
                      onChange={e => setLectureForm({ ...lectureForm, scheduled_at: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-white dark:bg-gray-700 text-text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      min="5"
                      max="180"
                      value={lectureForm.duration_minutes}
                      onChange={e => setLectureForm({ ...lectureForm, duration_minutes: parseInt(e.target.value) || 40 })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-white dark:bg-gray-700 text-text-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={lectureForm.description}
                    onChange={e => setLectureForm({ ...lectureForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-white dark:bg-gray-700 text-text-primary"
                    placeholder="Brief description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Lecture Type *</label>
                  <select
                    required
                    value={lectureForm.type}
                    onChange={e => setLectureForm({ ...lectureForm, type: e.target.value, is_online: e.target.value === 'sync' || e.target.value === 'hybrid' })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-white dark:bg-gray-700 text-text-primary"
                  >
                    <option value="async">Recorded (Async) - Pre-recorded content</option>
                    <option value="sync">Live (Sync) - Video conference</option>
                    <option value="hybrid">Hybrid - Both live & async</option>
                  </select>
                </div>

                {(lectureForm.type === 'sync' || lectureForm.type === 'hybrid') && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Meeting Link</label>
                    <input
                      type="url"
                      value={lectureForm.meeting_link}
                      onChange={e => setLectureForm({ ...lectureForm, meeting_link: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-white dark:bg-gray-700 text-text-primary"
                      placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                    />
                  </div>
                )}

                {(lectureForm.type === 'async' || lectureForm.type === 'hybrid') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Content (Markdown)</label>
                      <textarea
                        rows={6}
                        value={lectureForm.content}
                        onChange={e => setLectureForm({ ...lectureForm, content: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-white dark:bg-gray-700 text-text-primary font-mono text-sm"
                        placeholder="# Lecture Content&#10;&#10;## Introduction&#10;Write your lesson content here using Markdown...&#10;&#10;## Main Topic&#10;..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Async Available After (optional)</label>
                      <input
                        type="datetime-local"
                        value={lectureForm.async_available_after}
                        onChange={e => setLectureForm({ ...lectureForm, async_available_after: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-white dark:bg-gray-700 text-text-primary"
                      />
                      <p className="text-xs text-text-muted mt-1">Leave empty to make available immediately</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={lectureForm.is_published}
                          onChange={e => setLectureForm({ ...lectureForm, is_published: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-text-primary">Publish immediately</span>
                      </label>
                    </div>
                  </>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                  >
                    {formLoading ? 'Saving...' : editingLecture ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}