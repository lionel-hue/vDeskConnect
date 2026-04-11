import { api } from '@/lib/api';

/**
 * Academic API Service Layer
 * Handles all API calls for Phase 1 (Sessions, Terms, CA Weeks, Grade Scales)
 * and Phase 2 (Grade Levels, Sections, Departments, Subjects, Mappings)
 */

export const academicApi = {
  // Sessions
  sessions: {
    getAll: () => api.get('/academic/sessions'),
    create: (data) => api.post('/academic/sessions', data),
    update: (id, data) => api.put(`/academic/sessions/${id}`, data),
    delete: (id) => api.delete(`/academic/sessions/${id}`),
    setActive: (id) => api.put(`/academic/sessions/${id}/set-active`),
  },

  // Terms
  terms: {
    getAll: (sessionId) => api.get(`/academic/terms/session/${sessionId}`),
    create: (data) => api.post('/academic/terms', data),
    bulkCreate: (data) => api.post('/academic/terms/bulk', data),
    update: (id, data) => api.put(`/academic/terms/${id}`, data),
    delete: (id) => api.delete(`/academic/terms/${id}`),
  },

  // CA Weeks
  caWeeks: {
    getAll: (termId, gradeLevelId, subjectId) =>
      api.get(`/academic/ca-weeks/term/${termId}/grade/${gradeLevelId}/subject/${subjectId}`),
    getSummary: (termId, gradeLevelId, subjectId) =>
      api.get(`/academic/ca-weeks/term/${termId}/grade/${gradeLevelId}/subject/${subjectId}/summary`),
    set: (data) => api.post('/academic/ca-weeks', data),
    delete: (termId, gradeLevelId, subjectId) => api.delete(`/academic/ca-weeks/term/${termId}/grade/${gradeLevelId}/subject/${subjectId}`),
  },

  // Grade Scales
  gradeScales: {
    getAll: () => api.get('/academic/grade-scales'),
    create: (data) => api.post('/academic/grade-scales', data),
    update: (id, data) => api.put(`/academic/grade-scales/${id}`, data),
    setDefault: (id) => api.put(`/academic/grade-scales/${id}/set-default`),
    delete: (id) => api.delete(`/academic/grade-scales/${id}`),
    getTemplates: () => api.get('/academic/grade-scales/templates'),
  },

  // ==================== PHASE 2 ====================

  // Grade Levels
  gradeLevels: {
    getAll: () => api.get('/academic/grade-levels'),
    create: (data) => api.post('/academic/grade-levels', data),
    update: (id, data) => api.put(`/academic/grade-levels/${id}`, data),
    delete: (id) => api.delete(`/academic/grade-levels/${id}`),
    bulkCreate: (data) => api.post('/academic/grade-levels/bulk', data),
  },

  // Sections
  sections: {
    getAll: (gradeLevelId) => api.get(`/academic/grade-levels/${gradeLevelId}/sections`),
    create: (data) => api.post('/academic/sections', data),
    update: (id, data) => api.put(`/academic/sections/${id}`, data),
    delete: (id) => api.delete(`/academic/sections/${id}`),
  },

  // Departments
  departments: {
    getAll: () => api.get('/academic/departments'),
    create: (data) => api.post('/academic/departments', data),
    update: (id, data) => api.put(`/academic/departments/${id}`, data),
    delete: (id) => api.delete(`/academic/departments/${id}`),
  },

  // Subjects
  subjects: {
    getAll: () => api.get('/academic/subjects'),
    create: (data) => api.post('/academic/subjects', data),
    update: (id, data) => api.put(`/academic/subjects/${id}`, data),
    delete: (id) => api.delete(`/academic/subjects/${id}`),
  },

  // Subject-to-Grade Mappings
  mappings: {
    getForGrade: (gradeLevelId) => api.get(`/academic/grade-levels/${gradeLevelId}/subjects`),
    assign: (data) => api.post('/academic/subject-mappings', data),
    bulkAssign: (data) => api.post('/academic/subject-mappings/bulk', data),
    remove: (id) => api.delete(`/academic/subject-mappings/${id}`),
  },

  // Teacher Assignments (Phase 4)
  gradeLevelDetail: (id) => api.get(`/academic/grade-levels/${id}`),
  teachers: {
    getAll: () => api.get('/academic/teachers'),
  },
  teacherAssignments: {
    assign: (data) => api.post('/academic/teacher-assignments', data),
    remove: (id) => api.delete(`/academic/teacher-assignments/${id}`),
  },
};

export default academicApi;
