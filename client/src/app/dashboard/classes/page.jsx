'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  School, Users, BookOpen, UserRound, Plus, Trash2, X, Edit2,
  GraduationCap, Layers, Tag, ChevronLeft, CheckCircle
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { academicApi } from '@/lib/academic-api';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastProvider';

export default function ClassesPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [gradeLevels, setGradeLevels] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [gradeDetail, setGradeDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('overview');

  // Teacher assignment state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ teacher_id: '', subject_id: '', section_id: '' });
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await academicApi.gradeLevels.getAll();
      setGradeLevels(res.grade_levels || []);
    } catch (err) {
      toast.error('Failed to load grade levels');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchGradeDetail = useCallback(async (id) => {
    setDetailLoading(true);
    try {
      const [detailRes, teachersRes, subjectsRes] = await Promise.all([
        academicApi.gradeLevelDetail(id),
        academicApi.teachers.getAll().catch(() => ({ teachers: [] })),
        api.get('/academic/subjects').catch(() => ({ subjects: [] })),
      ]);
      setGradeDetail(detailRes);
      setTeachers(teachersRes.teachers || []);
      setSubjects(subjectsRes.subjects || []);
      setSections(detailRes.sections || []);
      setSelectedGrade(id);
      setActiveDetailTab('overview');
    } catch (err) {
      toast.error('Failed to load grade details');
    } finally {
      setDetailLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const token = api.getToken();
    if (!token) { router.push('/login'); return; }
    fetchData();
  }, [fetchData, router]);

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    setAssignLoading(true);
    try {
      await academicApi.teacherAssignments.assign({
        ...assignForm,
        grade_level_id: selectedGrade,
      });
      toast.success('Teacher assigned successfully');
      setShowAssignModal(false);
      setAssignForm({ teacher_id: '', subject_id: '', section_id: '' });
      fetchGradeDetail(selectedGrade);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to assign teacher');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveTeacher = async (id) => {
    if (!confirm('Remove this teacher assignment?')) return;
    try {
      await academicApi.teacherAssignments.remove(id);
      toast.success('Teacher assignment removed');
      fetchGradeDetail(selectedGrade);
    } catch (err) {
      toast.error('Failed to remove assignment');
    }
  };

  // ==================== RENDER ====================
  return (
    <DashboardLayout title="Classes" subtitle="Manage your classes and grade levels">
      <div className="space-y-4 md:space-y-6">
        {/* Back button when viewing detail */}
        {selectedGrade && (
          <button
            onClick={() => { setSelectedGrade(null); setGradeDetail(null); }}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm md:text-base"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            Back to Classes
          </button>
        )}

        {loading ? (
          <div className="text-center py-12 text-text-secondary">Loading classes...</div>
        ) : selectedGrade && gradeDetail ? (
          // ==================== GRADE LEVEL DETAIL VIEW ====================
          <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="bg-card dark:bg-gray-800 rounded-card border border-border p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-text-primary">{gradeDetail.grade_level.name}</h1>
                  <p className="text-sm text-text-secondary mt-1">
                    {gradeDetail.grade_level.short_name} • {gradeDetail.grade_level.cycle || 'No cycle'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs md:text-sm rounded-full">
                    {gradeDetail.grade_level.students_count} Students
                  </span>
                  <span className="px-3 py-1 bg-success/10 text-success text-xs md:text-sm rounded-full">
                    {gradeDetail.grade_level.teachers_count} Teachers
                  </span>
                  <span className="px-3 py-1 bg-warning/10 text-warning text-xs md:text-sm rounded-full">
                    {gradeDetail.grade_level.subjects_count} Subjects
                  </span>
                </div>
              </div>
            </div>

            {/* Detail Tabs */}
            <div className="flex gap-1 md:gap-2 border-b border-border overflow-x-auto scrollbar-hide pb-1">
              {[
                { id: 'overview', label: 'Overview', icon: School },
                { id: 'sections', label: 'Sections', icon: Layers },
                { id: 'subjects', label: 'Subjects', icon: Tag },
                { id: 'students', label: 'Students', icon: GraduationCap },
                { id: 'teachers', label: 'Teachers', icon: UserRound },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDetailTab(tab.id)}
                  className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 md:py-3 rounded-t-lg transition-all whitespace-nowrap flex-shrink-0 text-xs md:text-sm ${
                    activeDetailTab === tab.id
                      ? 'bg-card border-b-2 border-primary text-primary font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5 dark:hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.label.slice(0, 4)}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {detailLoading ? (
              <div className="text-center py-8 text-text-secondary">Loading details...</div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeDetailTab === 'overview' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div className="bg-card dark:bg-gray-800 rounded-card border border-border p-4 md:p-6 text-center">
                      <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2" />
                      <div className="text-2xl md:text-3xl font-bold text-text-primary">{gradeDetail.grade_level.students_count}</div>
                      <div className="text-xs md:text-sm text-text-secondary">Students</div>
                    </div>
                    <div className="bg-card dark:bg-gray-800 rounded-card border border-border p-4 md:p-6 text-center">
                      <Layers className="w-6 h-6 md:w-8 md:h-8 text-success mx-auto mb-2" />
                      <div className="text-2xl md:text-3xl font-bold text-text-primary">{gradeDetail.grade_level.sections_count}</div>
                      <div className="text-xs md:text-sm text-text-secondary">Sections</div>
                    </div>
                    <div className="bg-card dark:bg-gray-800 rounded-card border border-border p-4 md:p-6 text-center">
                      <Tag className="w-6 h-6 md:w-8 md:h-8 text-warning mx-auto mb-2" />
                      <div className="text-2xl md:text-3xl font-bold text-text-primary">{gradeDetail.grade_level.subjects_count}</div>
                      <div className="text-xs md:text-sm text-text-secondary">Subjects</div>
                    </div>
                    <div className="bg-card dark:bg-gray-800 rounded-card border border-border p-4 md:p-6 text-center">
                      <UserRound className="w-6 h-6 md:w-8 md:h-8 text-info mx-auto mb-2" />
                      <div className="text-2xl md:text-3xl font-bold text-text-primary">{gradeDetail.grade_level.teachers_count}</div>
                      <div className="text-xs md:text-sm text-text-secondary">Teachers</div>
                    </div>
                  </div>
                )}

                {/* Sections Tab */}
                {activeDetailTab === 'sections' && (
                  <div className="bg-card dark:bg-gray-800 rounded-card border border-border p-4 md:p-6">
                    <h2 className="text-base md:text-lg font-semibold text-text-primary mb-4">Sections</h2>
                    {gradeDetail.sections.length === 0 ? (
                      <p className="text-text-secondary text-center py-8 text-sm">No sections created yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {gradeDetail.sections.map(sec => (
                          <div key={sec.id} className="p-3 md:p-4 border border-border dark:border-gray-600 rounded-lg">
                            <h3 className="font-semibold text-text-primary text-sm md:text-base">{sec.name}</h3>
                            <p className="text-xs text-text-muted mt-1">Room: {sec.room_number || 'N/A'} • Capacity: {sec.capacity || 'N/A'}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Subjects Tab */}
                {activeDetailTab === 'subjects' && (
                  <div className="bg-card dark:bg-gray-800 rounded-card border border-border p-4 md:p-6">
                    <h2 className="text-base md:text-lg font-semibold text-text-primary mb-4">Subjects</h2>
                    {gradeDetail.subjects.length === 0 ? (
                      <p className="text-text-secondary text-center py-8 text-sm">No subjects assigned yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {gradeDetail.subjects.map(sub => (
                          <div key={sub.id} className="p-3 md:p-4 border border-border dark:border-gray-600 rounded-lg">
                            <h3 className="font-semibold text-text-primary text-sm md:text-base">{sub.subject_name}</h3>
                            <p className="text-xs text-text-muted">{sub.subject_code}</p>
                            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                              sub.is_compulsory ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                            }`}>{sub.is_compulsory ? 'Compulsory' : 'Elective'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Students Tab */}
                {activeDetailTab === 'students' && (
                  <div className="bg-card dark:bg-gray-800 rounded-card border border-border p-4 md:p-6">
                    <h2 className="text-base md:text-lg font-semibold text-text-primary mb-4">Students</h2>
                    {gradeDetail.students.length === 0 ? (
                      <p className="text-text-secondary text-center py-8 text-sm">No students enrolled in this grade.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm md:text-base">
                          <thead>
                            <tr className="border-b border-border dark:border-gray-600">
                              <th className="text-left py-2 md:py-3 px-2 text-text-secondary font-medium">Name</th>
                              <th className="text-left py-2 md:py-3 px-2 text-text-secondary font-medium hidden md:table-cell">Admission #</th>
                              <th className="text-left py-2 md:py-3 px-2 text-text-secondary font-medium hidden sm:table-cell">Email</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gradeDetail.students.map(student => (
                              <tr key={student.id} className="border-b border-border dark:border-gray-600/50">
                                <td className="py-2 md:py-3 px-2 text-text-primary">{student.first_name} {student.last_name}</td>
                                <td className="py-2 md:py-3 px-2 text-text-secondary hidden md:table-cell">{student.admission_number}</td>
                                <td className="py-2 md:py-3 px-2 text-text-secondary hidden sm:table-cell">{student.email}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Teachers Tab */}
                {activeDetailTab === 'teachers' && (
                  <div className="bg-card dark:bg-gray-800 rounded-card border border-border p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base md:text-lg font-semibold text-text-primary">Teachers</h2>
                      <button
                        onClick={() => setShowAssignModal(true)}
                        className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 text-xs md:text-sm bg-primary text-white rounded-lg hover:bg-primary-dark"
                      >
                        <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        Assign Teacher
                      </button>
                    </div>
                    {gradeDetail.teachers.length === 0 ? (
                      <p className="text-text-secondary text-center py-8 text-sm">No teachers assigned yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {gradeDetail.teachers.map(teacher => (
                          <div key={teacher.teacher_id} className="p-3 md:p-4 border border-border dark:border-gray-600 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-text-primary text-sm md:text-base">{teacher.name}</h3>
                                <p className="text-xs text-text-muted">{teacher.email}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {teacher.subjects.map((sub, i) => (
                                    <span key={i} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{sub}</span>
                                  ))}
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveTeacher(teacher.teacher_id)}
                                className="text-error hover:text-error/80 flex-shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          // ==================== GRADE LEVELS GRID VIEW ====================
          <div>
            <div className="bg-card dark:bg-gray-800 rounded-card border border-border p-4 md:p-6">
              <h2 className="text-base md:text-lg font-semibold text-text-primary mb-4">All Classes</h2>
              {gradeLevels.length === 0 ? (
                <p className="text-text-secondary text-center py-8 text-sm md:text-base">No grade levels created yet. Go to Academic → Grades to create them.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {gradeLevels.map(gl => (
                    <button
                      key={gl.id}
                      onClick={() => fetchGradeDetail(gl.id)}
                      className="text-left p-4 md:p-6 border border-border dark:border-gray-600 rounded-lg hover:border-primary dark:hover:border-primary transition-colors bg-bg-main dark:bg-gray-750"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <School className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary text-base md:text-lg">{gl.name}</h3>
                          <p className="text-xs text-text-muted">{gl.short_name}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {gl.students_count} Students
                        </div>
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <Layers className="w-3.5 h-3.5" />
                          {gl.sections_count} Sections
                        </div>
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <Tag className="w-3.5 h-3.5" />
                          {gl.subjects_count} Subjects
                        </div>
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <UserRound className="w-3.5 h-3.5" />
                          {gl.teachers_count} Teachers
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TEACHER ASSIGNMENT MODAL ==================== */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card dark:bg-gray-800 rounded-card border border-border p-4 md:p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold text-text-primary">Assign Teacher</h3>
                <button onClick={() => setShowAssignModal(false)} className="text-text-muted hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAssignTeacher} className="space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">Teacher *</label>
                  <select
                    value={assignForm.teacher_id}
                    onChange={e => setAssignForm({ ...assignForm, teacher_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-sm md:text-base text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">Subject *</label>
                  <select
                    value={assignForm.subject_id}
                    onChange={e => setAssignForm({ ...assignForm, subject_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-sm md:text-base text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">Section (Optional)</label>
                  <select
                    value={assignForm.section_id}
                    onChange={e => setAssignForm({ ...assignForm, section_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-border dark:border-gray-600 rounded-lg text-sm md:text-base text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">All Sections</option>
                    {sections.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 px-4 py-2 text-sm md:text-base border border-border dark:border-gray-600 rounded-lg hover:bg-bg-main dark:hover:bg-gray-700 text-text-primary">Cancel</button>
                  <button type="submit" disabled={assignLoading} className="flex-1 px-4 py-2 text-sm md:text-base bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50">{assignLoading ? 'Assigning...' : 'Assign Teacher'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
