'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Plus, Trash2, X, Edit2, CheckCircle, Sparkles,
  Filter, Calendar, Tag, Clock
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import MarkdownEditor from '@/components/MarkdownEditor';
import { academicApi } from '@/lib/academic-api';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastProvider';

export default function LessonNotesPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [lessonNotes, setLessonNotes] = useState([]);
  const [filters, setFilters] = useState({ grade_level_id: '', subject_id: '', term_id: '', status: '' });
  const [gradeLevels, setGradeLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]);
  const [schemes, setSchemes] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({
    scheme_id: '',
    grade_level_id: '',
    subject_id: '',
    term_id: '',
    week_number: '',
    topic: '',
    aspects: { objective: '', content: '', methodology: '', evaluation: '', materials: '' },
    contact_number: 40,
  });
  const [aiForm, setAiForm] = useState({ scheme_id: '', aspects: [], target_audience_size: 30 });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [notesRes, gradesRes, subjectsRes, termsRes, schemesRes] = await Promise.all([
        academicApi.lessonNotes.getAll(filters),
        academicApi.gradeLevels.getAll().catch(() => ({ grade_levels: [] })),
        api.get('/academic/subjects').catch(() => ({ subjects: [] })),
        api.get('/academic/terms').catch(() => ({ terms: [] })),
        academicApi.schemes.getAll().catch(() => ({ schemes: [] })),
      ]);
      setLessonNotes(notesRes.lesson_notes || []);
      setGradeLevels(gradesRes.grade_levels || []);
      setSubjects(subjectsRes.subjects || []);
      setTerms(termsRes.terms || []);
      setSchemes(schemesRes.schemes || []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    const token = api.getToken();
    if (!token) { router.push('/login'); return; }
    fetchData();
  }, [fetchData, router]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        ...noteForm,
        aspects: noteForm.aspects.objective || noteForm.aspects.content || noteForm.aspects.methodology || noteForm.aspects.evaluation || noteForm.aspects.materials
          ? noteForm.aspects
          : null,
      };

      if (editingNote) {
        await academicApi.lessonNotes.update(editingNote.id, data);
        toast.success('Lesson note updated successfully');
      } else {
        await academicApi.lessonNotes.create(data);
        toast.success('Lesson note created successfully');
      }

      setShowModal(false);
      setEditingNote(null);
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to save lesson note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setNoteForm({
      scheme_id: note.scheme_id || '',
      grade_level_id: note.grade_level_id || '',
      subject_id: note.subject_id || '',
      term_id: note.term_id || '',
      week_number: note.week_number || '',
      topic: note.topic || '',
      aspects: note.aspects || { objective: '', content: '', methodology: '', evaluation: '', materials: '' },
      contact_number: note.contact_number || 40,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this lesson note?')) return;
    try {
      await academicApi.lessonNotes.delete(id);
      toast.success('Lesson note deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete lesson note');
    }
  };

  const handlePublish = async (id) => {
    try {
      await academicApi.lessonNotes.publish(id);
      toast.success('Lesson note published');
      fetchData();
    } catch (err) {
      toast.error('Failed to publish lesson note');
    }
  };

  const handleAISubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await academicApi.aiLessonNote.generate({
        scheme_id: aiForm.scheme_id,
        aspects: aiForm.aspects,
        target_audience_size: aiForm.target_audience_size,
      });

      // Pre-fill the manual form with AI-generated content
      const aiNote = res.lesson_note;
      const scheme = schemes.find(s => s.id == aiForm.scheme_id);

      setNoteForm({
        scheme_id: aiForm.scheme_id,
        grade_level_id: scheme?.grade_level_id || '',
        subject_id: scheme?.subject_id || '',
        term_id: scheme?.term_id || '',
        week_number: aiNote.week_number,
        topic: aiNote.topic,
        aspects: aiNote.aspects,
        contact_number: aiNote.contact_number,
      });

      setShowAIModal(false);
      setShowModal(true);
      toast.success('AI generated lesson note! Review and edit before saving.');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to generate lesson note');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setNoteForm({
      scheme_id: '',
      grade_level_id: '',
      subject_id: '',
      term_id: '',
      week_number: '',
      topic: '',
      aspects: { objective: '', content: '', methodology: '', evaluation: '', materials: '' },
      contact_number: 40,
    });
  };

  const handleSchemeSelect = (schemeId) => {
    const scheme = schemes.find(s => s.id == schemeId);
    if (scheme) {
      setNoteForm({
        ...noteForm,
        scheme_id: schemeId,
        grade_level_id: scheme.grade_level_id,
        subject_id: scheme.subject_id,
        term_id: scheme.term_id,
        week_number: scheme.week_number,
        topic: scheme.topic,
      });
    }
  };

  // ==================== RENDER ====================
  return (
    <DashboardLayout title="Lesson Notes" subtitle="Create and manage your lesson notes">
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-text-primary">Lesson Notes</h1>
            <p className="text-sm text-text-secondary">Plan your lessons based on schemes of work</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowAIModal(true); setAiForm({ scheme_id: '', aspects: [], target_audience_size: 30 }); }}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600"
            >
              <Sparkles className="w-4 h-4" />
              AI Builder
            </button>
            <button
              onClick={() => { setShowModal(true); setEditingNote(null); resetForm(); }}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              <Plus className="w-4 h-4" />
              New Note
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card dark:bg-gray-800 rounded-card border border-border p-4 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-text-secondary" />
            <h2 className="text-sm font-semibold text-text-primary">Filters</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={filters.grade_level_id}
              onChange={e => handleFilterChange('grade_level_id', e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-sm text-text-primary"
            >
              <option value="">All Grades</option>
              {gradeLevels.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <select
              value={filters.subject_id}
              onChange={e => handleFilterChange('subject_id', e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-sm text-text-primary"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select
              value={filters.term_id}
              onChange={e => handleFilterChange('term_id', e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-sm text-text-primary"
            >
              <option value="">All Terms</option>
              {terms.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={e => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-sm text-text-primary"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Lesson Notes List */}
        {loading ? (
          <div className="text-center py-12 text-text-secondary">Loading lesson notes...</div>
        ) : lessonNotes.length === 0 ? (
          <div className="bg-card dark:bg-gray-800 rounded-card border border-border p-8 text-center">
            <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No lesson notes yet</h3>
            <p className="text-sm text-text-secondary mb-4">Create your first lesson note to get started</p>
            <button
              onClick={() => { setShowModal(true); setEditingNote(null); resetForm(); }}
              className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Create Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessonNotes.map(note => (
              <div key={note.id} className="bg-card dark:bg-gray-800 rounded-card border border-border p-4 md:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-semibold">Week {note.week_number}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        note.status === 'published' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>
                        {note.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-text-primary text-sm md:text-base truncate">{note.topic}</h3>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    {note.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(note.id)}
                        className="p-1 text-success hover:text-success/80"
                        title="Publish"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(note)}
                      className="p-1 text-info hover:text-info/80"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1 text-error hover:text-error/80"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-text-secondary">
                  {note.subject && <p className="flex items-center gap-1"><Tag className="w-3 h-3" />{note.subject.name}</p>}
                  {note.gradeLevel && <p className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{note.gradeLevel.name}</p>}
                  {note.term && <p className="flex items-center gap-1"><Calendar className="w-3 h-3" />{note.term.name}</p>}
                  {note.contact_number && <p className="flex items-center gap-1"><Clock className="w-3 h-3" />{note.contact_number} minutes</p>}
                </div>

                {note.aspects && note.aspects.objective && (
                  <p className="mt-3 text-xs text-text-muted line-clamp-2">
                    <strong>Objective:</strong> {note.aspects.objective.slice(0, 100)}...
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ==================== LESSON NOTE MODAL ==================== */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card dark:bg-gray-800 rounded-card border border-border p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold text-text-primary">
                  {editingNote ? 'Edit Lesson Note' : 'Create Lesson Note'}
                </h3>
                <button onClick={() => { setShowModal(false); setEditingNote(null); }} className="text-text-muted hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Scheme Selector */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">Link to Scheme of Work</label>
                  <select
                    value={noteForm.scheme_id}
                    onChange={e => handleSchemeSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-sm md:text-base text-text-primary"
                  >
                    <option value="">Select Scheme Entry (optional)</option>
                    {schemes.map(s => (
                      <option key={s.id} value={s.id}>Week {s.week_number} — {s.topic} — {s.subject?.name || ''}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">Grade Level *</label>
                    <select
                      value={noteForm.grade_level_id}
                      onChange={e => setNoteForm({ ...noteForm, grade_level_id: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-sm text-text-primary"
                      required
                    >
                      <option value="">Select Grade</option>
                      {gradeLevels.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">Subject *</label>
                    <select
                      value={noteForm.subject_id}
                      onChange={e => setNoteForm({ ...noteForm, subject_id: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-sm text-text-primary"
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">Term *</label>
                    <select
                      value={noteForm.term_id}
                      onChange={e => setNoteForm({ ...noteForm, term_id: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-sm text-text-primary"
                      required
                    >
                      <option value="">Select Term</option>
                      {terms.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={noteForm.contact_number}
                      onChange={e => setNoteForm({ ...noteForm, contact_number: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-sm text-text-primary"
                      min="1"
                      max="180"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">Topic *</label>
                  <input
                    type="text"
                    value={noteForm.topic}
                    onChange={e => setNoteForm({ ...noteForm, topic: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-sm md:text-base text-text-primary"
                    required
                  />
                </div>

                {/* Aspects (Collapsible with Markdown Support) */}
                <div className="space-y-3">
                  <details className="border border-border dark:border-gray-600 rounded-lg" open>
                    <summary className="px-3 py-2 cursor-pointer text-sm font-medium text-text-primary">Learning Objective *</summary>
                    <div className="p-3">
                      <MarkdownEditor
                        value={noteForm.aspects.objective}
                        onChange={value => setNoteForm({
                          ...noteForm,
                          aspects: { ...noteForm.aspects, objective: value }
                        })}
                        placeholder="What students should learn..."
                        rows={3}
                      />
                    </div>
                  </details>

                  <details className="border border-border dark:border-gray-600 rounded-lg" open>
                    <summary className="px-3 py-2 cursor-pointer text-sm font-medium text-text-primary">Content *</summary>
                    <div className="p-3">
                      <MarkdownEditor
                        value={noteForm.aspects.content}
                        onChange={value => setNoteForm({
                          ...noteForm,
                          aspects: { ...noteForm.aspects, content: value }
                        })}
                        placeholder="Detailed lesson content and explanations..."
                        rows={5}
                      />
                    </div>
                  </details>

                  <details className="border border-border dark:border-gray-600 rounded-lg">
                    <summary className="px-3 py-2 cursor-pointer text-sm font-medium text-text-primary">Methodology</summary>
                    <div className="p-3">
                      <MarkdownEditor
                        value={noteForm.aspects.methodology}
                        onChange={value => setNoteForm({
                          ...noteForm,
                          aspects: { ...noteForm.aspects, methodology: value }
                        })}
                        placeholder="Teaching methods: discussion, demonstration, group work..."
                        rows={3}
                      />
                    </div>
                  </details>

                  <details className="border border-border dark:border-gray-600 rounded-lg">
                    <summary className="px-3 py-2 cursor-pointer text-sm font-medium text-text-primary">Materials/Resources</summary>
                    <div className="p-3">
                      <MarkdownEditor
                        value={noteForm.aspects.materials}
                        onChange={value => setNoteForm({
                          ...noteForm,
                          aspects: { ...noteForm.aspects, materials: value }
                        })}
                        placeholder="Textbook, whiteboard, handouts, projector..."
                        rows={3}
                      />
                    </div>
                  </details>

                  <details className="border border-border dark:border-gray-600 rounded-lg">
                    <summary className="px-3 py-2 cursor-pointer text-sm font-medium text-text-primary">Evaluation</summary>
                    <div className="p-3">
                      <MarkdownEditor
                        value={noteForm.aspects.evaluation}
                        onChange={value => setNoteForm({
                          ...noteForm,
                          aspects: { ...noteForm.aspects, evaluation: value }
                        })}
                        placeholder="Assessment questions and criteria..."
                        rows={3}
                      />
                    </div>
                  </details>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingNote(null); }}
                    className="flex-1 px-4 py-2 text-sm md:text-base border border-border dark:border-gray-600 rounded-lg hover:bg-bg-main dark:hover:bg-gray-700 text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 text-sm md:text-base bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : (editingNote ? 'Update Note' : 'Create Note')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== AI BUILDER MODAL ==================== */}
        {showAIModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card dark:bg-gray-800 rounded-card border border-border p-4 md:p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold text-text-primary flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  AI Lesson Note Builder
                </h3>
                <button onClick={() => setShowAIModal(false)} className="text-text-muted hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAISubmit} className="space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">Select Scheme Entry *</label>
                  <select
                    value={aiForm.scheme_id}
                    onChange={e => setAiForm({ ...aiForm, scheme_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-sm text-text-primary"
                    required
                  >
                    <option value="">Select Scheme</option>
                    {schemes.map(s => (
                      <option key={s.id} value={s.id}>Week {s.week_number} — {s.topic}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">Target Audience Size</label>
                  <input
                    type="number"
                    value={aiForm.target_audience_size}
                    onChange={e => setAiForm({ ...aiForm, target_audience_size: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-sm text-text-primary"
                    min="1"
                    max="200"
                  />
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    <strong>Note:</strong> AI will generate a complete lesson note based on your scheme entry. You can review and edit it before saving.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAIModal(false)}
                    className="flex-1 px-4 py-2 text-sm md:text-base border border-border dark:border-gray-600 rounded-lg hover:bg-bg-main dark:hover:bg-gray-700 text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !aiForm.scheme_id}
                    className="flex-1 px-4 py-2 text-sm md:text-base bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
                  >
                    {submitting ? 'Generating...' : 'Generate with AI'}
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
