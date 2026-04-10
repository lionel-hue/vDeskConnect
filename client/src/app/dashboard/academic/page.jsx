'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings, CalendarDays, BookOpen, Scale, Plus, Trash2, CheckCircle,
  AlertTriangle, X, Save, Star, Copy
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { academicApi } from '@/lib/academic-api';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastProvider';

const TABS = {
  SESSIONS: 'sessions',
  TERMS: 'terms',
  CA_WEEKS: 'ca_weeks',
  GRADE_SCALES: 'grade_scales',
};

export default function AcademicPage() {
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(TABS.SESSIONS);
  const [loading, setLoading] = useState(true);

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionForm, setSessionForm] = useState({ name: '', start_date: '', end_date: '' });
  const [sessionLoading, setSessionLoading] = useState(false);

  // Terms state
  const [terms, setTerms] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [showTermModal, setShowTermModal] = useState(false);
  const [showBulkTermModal, setShowBulkTermModal] = useState(false);
  const [termForm, setTermForm] = useState({ name: '', start_date: '', end_date: '', order: 1, weeks_count: 12 });
  const [bulkTermForm, setBulkTermForm] = useState({ terms_count: 3, weeks_per_term: 12, term_prefix: 'Term', start_date: '' });
  const [termLoading, setTermLoading] = useState(false);

  // CA Weeks state
  const [caWeeks, setCaWeeks] = useState([]);
  const [caWeekForm, setCaWeekForm] = useState({
    term_id: '', grade_level_id: '', subject_id: '', weeks_count: 12,
    test_weeks: [], exam_week: 12
  });
  const [caWeekLoading, setCaWeekLoading] = useState(false);
  const [gradeLevels, setGradeLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Grade Scales state
  const [gradeScales, setGradeScales] = useState([]);
  const [showScaleModal, setShowScaleModal] = useState(false);
  const [scaleForm, setScaleForm] = useState({ name: '', scale: {}, is_default: false });
  const [scaleLoading, setScaleLoading] = useState(false);
  const [editingScaleId, setEditingScaleId] = useState(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sessionsRes, gradeScalesRes] = await Promise.all([
        academicApi.sessions.getAll(),
        academicApi.gradeScales.getAll(),
      ]);
      setSessions(sessionsRes.sessions || []);
      setGradeScales(gradeScalesRes.grade_scales || []);

      // Fetch grade levels and subjects for CA weeks
      const [gradesRes, subjectsRes] = await Promise.all([
        api.get('/academic/grade-levels').catch(() => ({ grade_levels: [] })),
        api.get('/academic/subjects').catch(() => ({ subjects: [] })),
      ]);
      setGradeLevels(gradesRes.grade_levels || []);
      setSubjects(subjectsRes.subjects || []);

      // If there's an active session, fetch its terms
      const activeSession = sessionsRes.sessions?.find(s => s.active);
      if (activeSession) {
        setSelectedSessionId(activeSession.id);
        const termsRes = await academicApi.terms.getAll(activeSession.id);
        setTerms(termsRes.terms || []);
      }
    } catch (err) {
      console.error('Failed to fetch academic data:', err);
      toast.error('Failed to load academic data');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const token = api.getToken();
    if (!token) { router.push('/login'); return; }
    fetchData();
  }, [fetchData, router]);

  // ==================== SESSION HANDLERS ====================
  const handleCreateSession = async (e) => {
    e.preventDefault();
    setSessionLoading(true);
    try {
      const res = await academicApi.sessions.create(sessionForm);
      toast.success(res.message);
      setShowSessionModal(false);
      setSessionForm({ name: '', start_date: '', end_date: '' });
      fetchData();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to create session');
    } finally {
      setSessionLoading(false);
    }
  };

  const handleSetActiveSession = async (id) => {
    try {
      const res = await academicApi.sessions.setActive(id);
      toast.success(res.message);
      fetchData();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to set active session');
    }
  };

  // ==================== TERM HANDLERS ====================
  const handleFetchTerms = async (sessionId) => {
    try {
      const res = await academicApi.terms.getAll(sessionId);
      setTerms(res.terms || []);
      setSelectedSessionId(sessionId);
    } catch (err) {
      toast.error('Failed to load terms');
    }
  };

  const handleCreateTerm = async (e) => {
    e.preventDefault();
    setTermLoading(true);
    try {
      const res = await academicApi.terms.create({ ...termForm, session_id: selectedSessionId });
      toast.success(res.message);
      setShowTermModal(false);
      setTermForm({ name: '', start_date: '', end_date: '', order: 1, weeks_count: 12 });
      handleFetchTerms(selectedSessionId);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to create term');
    } finally {
      setTermLoading(false);
    }
  };

  const handleBulkCreateTerms = async (e) => {
    e.preventDefault();
    setTermLoading(true);
    try {
      const res = await academicApi.terms.bulkCreate({ ...bulkTermForm, session_id: selectedSessionId });
      toast.success(res.message);
      setShowBulkTermModal(false);
      handleFetchTerms(selectedSessionId);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to create terms');
    } finally {
      setTermLoading(false);
    }
  };

  const handleDeleteTerm = async (id) => {
    if (!confirm('Delete this term?')) return;
    try {
      await academicApi.terms.delete(id);
      toast.success('Term deleted');
      handleFetchTerms(selectedSessionId);
    } catch (err) {
      toast.error('Failed to delete term');
    }
  };

  // ==================== CA WEEK HANDLERS ====================
  const toggleTestWeek = (week) => {
    setCaWeekForm(prev => ({
      ...prev,
      test_weeks: prev.test_weeks.includes(week)
        ? prev.test_weeks.filter(w => w !== week)
        : [...prev.test_weeks, week]
    }));
  };

  const handleSetCaWeeks = async (e) => {
    e.preventDefault();
    setCaWeekLoading(true);
    try {
      const res = await academicApi.caWeeks.set(caWeekForm);
      toast.success(res.message);
      setCaWeekForm({ ...caWeekForm, test_weeks: [], exam_week: caWeekForm.weeks_count });
    } catch (err) {
      toast.error(err.data?.message || 'Failed to set CA weeks');
    } finally {
      setCaWeekLoading(false);
    }
  };

  // ==================== GRADE SCALE HANDLERS ====================
  const addGradeRow = () => {
    setScaleForm(prev => ({
      ...prev,
      scale: { ...prev.scale, ['']: { min: 0, max: 100, remark: '' } }
    }));
  };

  const updateGradeRow = (letter, field, value) => {
    setScaleForm(prev => {
      const newScale = { ...prev.scale };
      if (newScale[letter]) {
        newScale[letter] = { ...newScale[letter], [field]: value };
      }
      return { ...prev, scale: newScale };
    });
  };

  const removeGradeRow = (letter) => {
    setScaleForm(prev => {
      const newScale = { ...prev.scale };
      delete newScale[letter];
      return { ...prev, scale: newScale };
    });
  };

  const handleCreateGradeScale = async (e) => {
    e.preventDefault();
    setScaleLoading(true);
    try {
      const payload = editingScaleId
        ? { ...scaleForm }
        : scaleForm;
      
      const res = editingScaleId
        ? await academicApi.gradeScales.update(editingScaleId, payload)
        : await academicApi.gradeScales.create(payload);
      
      toast.success(res.message);
      setShowScaleModal(false);
      setScaleForm({ name: '', scale: {}, is_default: false });
      setEditingScaleId(null);
      fetchData();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to save grade scale');
    } finally {
      setScaleLoading(false);
    }
  };

  const handleSetDefaultScale = async (id) => {
    try {
      const res = await academicApi.gradeScales.setDefault(id);
      toast.success(res.message);
      fetchData();
    } catch (err) {
      toast.error('Failed to set default scale');
    }
  };

  const handleDeleteScale = async (id) => {
    if (!confirm('Delete this grade scale?')) return;
    try {
      await academicApi.gradeScales.delete(id);
      toast.success('Grade scale deleted');
      fetchData();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to delete grade scale');
    }
  };

  // ==================== RENDER ====================
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-primary-dark">Academic Settings</h1>
            <p className="text-sm text-text-secondary">Configure sessions, terms, continuous assessment, and grading scales</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {[
            { id: TABS.SESSIONS, label: 'Sessions', icon: CalendarDays },
            { id: TABS.TERMS, label: 'Terms', icon: CalendarDays },
            { id: TABS.CA_WEEKS, label: 'CA Configuration', icon: BookOpen },
            { id: TABS.GRADE_SCALES, label: 'Grade Scales', icon: Scale },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-card border-b-2 border-primary text-primary font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5 dark:hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="text-center py-12 text-text-secondary">Loading...</div>
        ) : (
          <>
            {/* ==================== SESSIONS TAB ==================== */}
            {activeTab === TABS.SESSIONS && (
              <div className="space-y-6">
                {/* Warning */}
                <div className="flex items-start gap-2 p-4 bg-error/5 border border-error/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-error">
                    Create one session per academic year. The last created session will be considered the current academic session.
                  </p>
                </div>

                {/* Create Session Card */}
                <div className="bg-white rounded-card border border-border p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-text-primary mb-4">Create Session</h2>
                  <form onSubmit={handleCreateSession} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Session Name *</label>
                        <input
                          type="text"
                          placeholder="2025 - 2026"
                          value={sessionForm.name}
                          onChange={e => setSessionForm({ ...sessionForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Start Date *</label>
                        <input
                          type="date"
                          value={sessionForm.start_date}
                          onChange={e => setSessionForm({ ...sessionForm, start_date: e.target.value })}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">End Date *</label>
                        <input
                          type="date"
                          value={sessionForm.end_date}
                          onChange={e => setSessionForm({ ...sessionForm, end_date: e.target.value })}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={sessionLoading}
                      className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {sessionLoading ? 'Creating...' : 'Create Session'}
                    </button>
                  </form>
                </div>

                {/* Existing Sessions */}
                <div className="bg-white rounded-card border border-border p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-text-primary mb-4">Academic Sessions</h2>
                  {sessions.length === 0 ? (
                    <p className="text-text-secondary text-center py-8">No sessions created yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map(session => (
                        <div
                          key={session.id}
                          className={`p-4 rounded-lg border-2 ${
                            session.active ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-text-primary">{session.name}</h3>
                              <p className="text-sm text-text-secondary">
                                {session.start_date} → {session.end_date}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                session.active ? 'bg-success/10 text-success' : 'bg-text-muted/10 text-text-muted'
                              }`}>
                                {session.active ? 'Active' : 'Inactive'}
                              </span>
                              <span className="text-sm text-text-secondary">{session.terms_count} terms</span>
                              {!session.active && (
                                <button
                                  onClick={() => handleSetActiveSession(session.id)}
                                  className="px-3 py-1 text-sm text-primary border border-primary rounded-lg hover:bg-primary/5"
                                >
                                  Set Active
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================== TERMS TAB ==================== */}
            {activeTab === TABS.TERMS && (
              <div className="space-y-6">
                {/* Session Selector */}
                <div className="bg-white rounded-card border border-border p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-text-primary mb-4">Select Session</h2>
                  <select
                    value={selectedSessionId || ''}
                    onChange={e => handleFetchTerms(e.target.value)}
                    className="w-full md:w-1/2 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">-- Select Session --</option>
                    {sessions.map(s => (
                      <option key={s.id} value={s.id}>{s.name} {s.active ? '(Active)' : ''}</option>
                    ))}
                  </select>
                </div>

                {selectedSessionId && (
                  <>
                    {/* Bulk Create Card */}
                    <div className="bg-white rounded-card border border-border p-6 shadow-sm">
                      <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Create Terms</h2>
                      <p className="text-sm text-text-secondary mb-4">
                        Automatically create all terms for this session at once.
                      </p>
                      <button
                        onClick={() => setShowBulkTermModal(true)}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                      >
                        <Copy className="w-4 h-4" />
                        Bulk Create Terms
                      </button>
                    </div>

                    {/* Existing Terms */}
                    <div className="bg-white rounded-card border border-border p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-text-primary">Terms</h2>
                        <button
                          onClick={() => setShowTermModal(true)}
                          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark"
                        >
                          <Plus className="w-4 h-4" />
                          Add Term
                        </button>
                      </div>

                      {terms.length === 0 ? (
                        <p className="text-text-secondary text-center py-8">No terms created yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {terms.map(term => (
                            <div key={term.id} className="p-4 border border-border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-text-primary">{term.name}</h3>
                                <button
                                  onClick={() => handleDeleteTerm(term.id)}
                                  className="text-error hover:text-error/80"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-sm text-text-secondary">
                                {term.start_date} → {term.end_date}
                              </p>
                              <p className="text-xs text-text-muted mt-1">{term.weeks_count} weeks</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ==================== CA WEEKS TAB ==================== */}
            {activeTab === TABS.CA_WEEKS && (
              <div className="space-y-6">
                <div className="bg-white rounded-card border border-border p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-text-primary mb-2">Continuous Assessment Configuration</h2>
                  <p className="text-sm text-text-secondary mb-6">
                    Configure which weeks have tests (CA) and which week is the final exam for each grade and subject.
                  </p>

                  <form onSubmit={handleSetCaWeeks} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Term *</label>
                        <select
                          value={caWeekForm.term_id}
                          onChange={e => setCaWeekForm({ ...caWeekForm, term_id: e.target.value })}
                          className="w-full px-3 py-2 border border-border rounded-lg"
                          required
                        >
                          <option value="">Select Term</option>
                          {terms.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Grade Level *</label>
                        <select
                          value={caWeekForm.grade_level_id}
                          onChange={e => setCaWeekForm({ ...caWeekForm, grade_level_id: e.target.value })}
                          className="w-full px-3 py-2 border border-border rounded-lg"
                          required
                        >
                          <option value="">Select Grade</option>
                          {gradeLevels.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Subject *</label>
                        <select
                          value={caWeekForm.subject_id}
                          onChange={e => setCaWeekForm({ ...caWeekForm, subject_id: e.target.value })}
                          className="w-full px-3 py-2 border border-border rounded-lg"
                          required
                        >
                          <option value="">Select Subject</option>
                          {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Total Weeks *</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={caWeekForm.weeks_count}
                          onChange={e => setCaWeekForm({ ...caWeekForm, weeks_count: parseInt(e.target.value), exam_week: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-border rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    {/* Week Grid */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-3">
                        Configure Weeks (Toggle tests, select exam week)
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {Array.from({ length: caWeekForm.weeks_count }, (_, i) => i + 1).map(week => (
                          <div key={week} className="space-y-2">
                            <div className="text-center text-sm font-semibold text-text-primary">Week {week}</div>
                            <button
                              type="button"
                              onClick={() => toggleTestWeek(week)}
                              className={`w-full py-2 rounded-lg text-sm border-2 transition-all ${
                                caWeekForm.test_weeks.includes(week)
                                  ? 'bg-warning/20 border-warning text-warning font-semibold'
                                  : 'border-border text-text-muted hover:border-warning/50'
                              }`}
                            >
                              {caWeekForm.test_weeks.includes(week) ? '✓ Test' : 'Test'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setCaWeekForm({ ...caWeekForm, exam_week: week })}
                              className={`w-full py-2 rounded-lg text-sm border-2 transition-all ${
                                caWeekForm.exam_week === week
                                  ? 'bg-error/20 border-error text-error font-semibold'
                                  : 'border-border text-text-muted hover:border-error/50'
                              }`}
                            >
                              {caWeekForm.exam_week === week ? '✓ Exam' : 'Exam'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <p className="text-sm text-text-primary">
                        <strong>Summary:</strong> Tests at weeks {caWeekForm.test_weeks.length > 0 ? caWeekForm.test_weeks.join(', ') : 'None'} | Exam at week {caWeekForm.exam_week}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={caWeekLoading || caWeekForm.test_weeks.length === 0}
                      className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {caWeekLoading ? 'Saving...' : 'Save CA Configuration'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ==================== GRADE SCALES TAB ==================== */}
            {activeTab === TABS.GRADE_SCALES && (
              <div className="space-y-6">
                {/* Existing Scales */}
                <div className="bg-white rounded-card border border-border p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text-primary">Grade Scales</h2>
                    <button
                      onClick={() => {
                        setScaleForm({ name: '', scale: {}, is_default: false });
                        setEditingScaleId(null);
                        setShowScaleModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark"
                    >
                      <Plus className="w-4 h-4" />
                      Create Scale
                    </button>
                  </div>

                  {gradeScales.length === 0 ? (
                    <p className="text-text-secondary text-center py-8">No grade scales created yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {gradeScales.map(scale => (
                        <div
                          key={scale.id}
                          className={`p-4 border-2 rounded-lg ${
                            scale.is_default ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-text-primary">{scale.name}</h3>
                              {scale.is_default && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">
                                  <Star className="w-3 h-3" /> Default
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {!scale.is_default && (
                                <button
                                  onClick={() => handleSetDefaultScale(scale.id)}
                                  className="text-sm text-primary hover:underline"
                                >
                                  Set Default
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setScaleForm({ ...scale, scale: typeof scale.scale === 'string' ? JSON.parse(scale.scale) : scale.scale });
                                  setEditingScaleId(scale.id);
                                  setShowScaleModal(true);
                                }}
                                className="text-sm text-text-secondary hover:text-text-primary"
                              >
                                Edit
                              </button>
                              {!scale.is_default && (
                                <button
                                  onClick={() => handleDeleteScale(scale.id)}
                                  className="text-error hover:text-error/80"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                            {Object.entries(typeof scale.scale === 'string' ? JSON.parse(scale.scale) : scale.scale).map(([letter, range]) => (
                              <div key={letter} className="text-center p-2 bg-bg-main rounded">
                                <div className="font-bold text-primary">{letter}</div>
                                <div className="text-xs text-text-secondary">{range.min}-{range.max}%</div>
                                <div className="text-xs text-text-muted">{range.remark}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ==================== MODALS ==================== */}

        {/* Bulk Term Modal */}
        {showBulkTermModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-card border border-border p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Bulk Create Terms</h3>
                <button onClick={() => setShowBulkTermModal(false)} className="text-text-muted hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleBulkCreateTerms} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Number of Terms *</label>
                  <select
                    value={bulkTermForm.terms_count}
                    onChange={e => setBulkTermForm({ ...bulkTermForm, terms_count: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                    required
                  >
                    <option value="1">1 Term</option>
                    <option value="2">2 Terms</option>
                    <option value="3">3 Terms</option>
                    <option value="4">4 Terms</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Weeks Per Term *</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={bulkTermForm.weeks_per_term}
                    onChange={e => setBulkTermForm({ ...bulkTermForm, weeks_per_term: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Term Prefix *</label>
                  <input
                    type="text"
                    placeholder="Term"
                    value={bulkTermForm.term_prefix}
                    onChange={e => setBulkTermForm({ ...bulkTermForm, term_prefix: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={bulkTermForm.start_date}
                    onChange={e => setBulkTermForm({ ...bulkTermForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBulkTermModal(false)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-bg-main"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={termLoading}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                  >
                    {termLoading ? 'Creating...' : 'Create Terms'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Single Term Modal */}
        {showTermModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-card border border-border p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Add Term</h3>
                <button onClick={() => setShowTermModal(false)} className="text-text-muted hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateTerm} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Term Name *</label>
                  <input
                    type="text"
                    placeholder="Term 1"
                    value={termForm.name}
                    onChange={e => setTermForm({ ...termForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={termForm.start_date}
                      onChange={e => setTermForm({ ...termForm, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">End Date *</label>
                    <input
                      type="date"
                      value={termForm.end_date}
                      onChange={e => setTermForm({ ...termForm, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Order *</label>
                    <input
                      type="number"
                      min="1"
                      value={termForm.order}
                      onChange={e => setTermForm({ ...termForm, order: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Weeks Count *</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={termForm.weeks_count}
                      onChange={e => setTermForm({ ...termForm, weeks_count: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-border rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowTermModal(false)} className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-bg-main">Cancel</button>
                  <button type="submit" disabled={termLoading} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50">
                    {termLoading ? 'Creating...' : 'Create Term'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Grade Scale Modal */}
        {showScaleModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-card border border-border p-6 w-full max-w-2xl my-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">{editingScaleId ? 'Edit' : 'Create'} Grade Scale</h3>
                <button onClick={() => { setShowScaleModal(false); setEditingScaleId(null); }} className="text-text-muted hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateGradeScale} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Scale Name *</label>
                  <input
                    type="text"
                    placeholder="Nigerian WAEC"
                    value={scaleForm.name}
                    onChange={e => setScaleForm({ ...scaleForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Grade Rows</label>
                  <p className="text-xs text-text-muted mb-3">Add grade letters (A, B, C...) with their score ranges.</p>
                  
                  {/* Quick Add Templates */}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setScaleForm({
                        ...scaleForm,
                        scale: {
                          A: { min: 70, max: 100, remark: 'Excellent' },
                          B: { min: 60, max: 69, remark: 'Good' },
                          C: { min: 50, max: 59, remark: 'Average' },
                          D: { min: 40, max: 49, remark: 'Below Average' },
                          F: { min: 0, max: 39, remark: 'Fail' },
                        }
                      })}
                      className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20"
                    >
                      Load Standard Template
                    </button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(scaleForm.scale).map(([letter, range]) => (
                      <div key={letter} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="A"
                          value={letter}
                          onChange={e => {
                            const newScale = { ...scaleForm.scale };
                            delete newScale[letter];
                            newScale[e.target.value] = range;
                            setScaleForm({ ...scaleForm, scale: newScale });
                          }}
                          className="w-16 px-2 py-2 border border-border rounded-lg text-center font-bold"
                        />
                        <input
                          type="number"
                          placeholder="Min"
                          value={range.min}
                          onChange={e => updateGradeRow(letter, 'min', parseInt(e.target.value))}
                          className="w-20 px-2 py-2 border border-border rounded-lg"
                        />
                        <span className="text-text-muted">-</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={range.max}
                          onChange={e => updateGradeRow(letter, 'max', parseInt(e.target.value))}
                          className="w-20 px-2 py-2 border border-border rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Remark"
                          value={range.remark}
                          onChange={e => updateGradeRow(letter, 'remark', e.target.value)}
                          className="flex-1 px-2 py-2 border border-border rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeGradeRow(letter)}
                          className="text-error hover:text-error/80"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const letter = prompt('Enter grade letter (e.g., A, B+, F9):');
                      if (letter && !scaleForm.scale[letter]) {
                        setScaleForm({
                          ...scaleForm,
                          scale: { ...scaleForm.scale, [letter]: { min: 0, max: 100, remark: '' } }
                        });
                      }
                    }}
                    className="mt-2 flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Plus className="w-4 h-4" /> Add Grade Row
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={scaleForm.is_default}
                    onChange={e => setScaleForm({ ...scaleForm, is_default: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_default" className="text-sm text-text-secondary">Set as default grading scale</label>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => { setShowScaleModal(false); setEditingScaleId(null); }} className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-bg-main">Cancel</button>
                  <button type="submit" disabled={scaleLoading || Object.keys(scaleForm.scale).length === 0} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50">
                    {scaleLoading ? 'Saving...' : 'Save Scale'}
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
