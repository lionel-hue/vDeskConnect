'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Play, PlayCircle, Pause, CheckCircle, Lock, Unlock,
  ChevronDown, ChevronUp, ChevronRight, ChevronLeft, X,
  Eye, File, Download, Save, Clock, Loader, Edit2,
  FileText, Image, Globe, Video, ExternalLink, Plus, Trash2,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { academicApi } from '@/lib/academic-api';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastProvider';

const TYPE_LABELS = {
  async: 'Recorded (Async)',
  sync: 'Live (Sync)',
  hybrid: 'Hybrid',
};

export default function LecturePlayerPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [lecture, setLecture] = useState(null);
  const [resources, setResources] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState([]);
  const [sectionContents, setSectionContents] = useState([]);
  const [expandedResource, setExpandedResource] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDirector, setIsDirector] = useState(false);

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Parse content into sections (split by ## Heading)
  const parseContentSections = useCallback((content) => {
    if (!content) return [];
    const sections = content.split(/(?=##\s)/).filter(s => s.trim());
    return sections.map((section, index) => {
      const lines = section.trim().split('\n');
      const titleMatch = lines[0].match(/^##\s+(.+)/);
      const title = titleMatch ? titleMatch[1].trim() : `Section ${index + 1}`;
      const body = lines.slice(1).join('\n').trim();
      return { id: index, title, content: body };
    });
  }, []);

  const fetchLecture = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, lectureRes, resourcesRes] = await Promise.all([
        api.get('/user').catch(() => ({ user: null })),
        academicApi.lectures.getOne(params.id),
        academicApi.lectureResources.getAll(params.id).catch(() => ({ resources: [] })),
      ]);
      setUser(userRes.user);
      const isSchoolAdmin = userRes.user?.role === 'admin' || userRes.user?.role === 'director';
      setIsDirector(isSchoolAdmin);
      setLecture(lectureRes.lecture);
      setResources(resourcesRes.resources || []);
      setSectionContents(parseContentSections(lectureRes.lecture?.content));
    } catch (err) {
      toast.error('Failed to load lecture');
      router.push('/dashboard/lectures');
    } finally {
      setLoading(false);
    }
  }, [params.id, parseContentSections, router, toast]);

  useEffect(() => {
    const token = api.getToken();
    if (!token) { router.push('/login'); return; }
    fetchLecture();
  }, [fetchLecture]);

  // Calculate progress
  const progress = sectionContents.length > 0 
    ? Math.round((completedSections.length / sectionContents.length) * 100) 
    : 0;

  // Build full content from sections
  const buildFullContent = (sections) => {
    return sections.map(s => `## ${s.title}\n\n${s.content}`).join('\n\n\n');
  };

  // Save edited content
  const saveContent = async () => {
    setEditSaving(true);
    try {
      await academicApi.lectures.update(lecture.id, { content: editedContent });
      toast.success('Content saved!');
      setLecture({ ...lecture, content: editedContent });
      setSectionContents(parseContentSections(editedContent));
      setEditMode(false);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to save');
    } finally {
      setEditSaving(false);
    }
  };

  // Mark current section complete and move to next
  const markCompleteAndNext = () => {
    if (!completedSections.includes(currentSectionIndex)) {
      setCompletedSections([...completedSections, currentSectionIndex]);
    }
  };

  // Can only go to next if current is completed (except for director who can navigate freely)
  const canGoNext = isDirector || completedSections.includes(currentSectionIndex);
  const canGoPrev = true; // Can always go back

  // Get resources for current section
  const currentSectionResources = resources.filter(r => 
    r.order_index === currentSectionIndex || 
    (r.order_index === null && r.order_index !== 0)
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!lecture) return null;

  const currentSection = sectionContents[currentSectionIndex] || { title: 'No Content', content: '' };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
        {/* Sidebar - Timeline */}
        <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 bg-white dark:bg-gray-800 border-r border-border overflow-hidden flex flex-col`}>
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {sidebarOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <button
              onClick={() => router.push('/dashboard/lectures')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Progress */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-primary">Progress</span>
              <span className="text-sm text-text-muted">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-text-muted mt-2">
              {completedSections.length} of {sectionContents.length} complete
            </p>
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

              {sectionContents.map((section, index) => {
                const isCompleted = completedSections.includes(index);
                const isCurrent = currentSectionIndex === index;
                const isUnlocked = isDirector || index === 0 || completedSections.includes(index - 1);

                return (
                  <div key={section.id} className="relative mb-4">
                    {/* Timeline dot */}
                    <button
                      disabled={!isUnlocked}
                      onClick={() => isUnlocked && setCurrentSectionIndex(index)}
                      className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all ${
                        isCurrent 
                          ? 'bg-primary text-white ring-4 ring-primary/20 scale-110' 
                          : isCompleted
                            ? 'bg-success text-white'
                            : isUnlocked
                              ? 'bg-gray-200 dark:bg-gray-700 text-text-muted hover:bg-primary hover:text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : isUnlocked ? <Play className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    </button>

                    {/* Section info */}
                    <div className="ml-12">
                      <button
                        disabled={!isUnlocked}
                        onClick={() => isUnlocked && setCurrentSectionIndex(index)}
                        className={`text-left w-full ${!isUnlocked && 'opacity-50'}`}
                      >
                        <p className={`text-sm font-medium ${isCurrent ? 'text-primary' : 'text-text-primary'}`}>
                          {section.title}
                        </p>
                        <p className="text-xs text-text-muted">
                          {isCompleted ? '✓ Completed' : isUnlocked ? (isCurrent ? '→ Current' : 'Tap to view') : '🔒 Locked - complete previous'}
                        </p>
                      </button>
                    </div>
                  </div>
                );
              })}

              {sectionContents.length === 0 && (
                <p className="text-sm text-text-muted text-center py-8">No sections</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              <div>
                <h1 className="text-lg font-bold text-text-primary">{lecture.title}</h1>
                <p className="text-sm text-text-muted">{TYPE_LABELS[lecture.type]} • {lecture.subject_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">
                {currentSectionIndex + 1} / {sectionContents.length}
              </span>
              {editMode ? (
                <button
                  onClick={saveContent}
                  disabled={editSaving}
                  className="flex items-center gap-2 px-3 py-1.5 bg-success text-white rounded-lg"
                >
                  <Save className="w-4 h-4" /> {editSaving ? 'Saving...' : 'Save'}
                </button>
              ) : isDirector && (
                <button
                  onClick={() => {
                    setEditedContent(buildFullContent(sectionContents));
                    setEditMode(true);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6">
              {/* Section Title */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
                  {currentSection.title}
                  {!canGoNext && !isDirector && (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 bg-warning/10 text-warning rounded">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </h2>
                {editMode && (
                  <input
                    type="text"
                    value={sectionContents[currentSectionIndex]?.title || ''}
                    onChange={(e) => {
                      const newSections = [...sectionContents];
                      newSections[currentSectionIndex] = { ...newSections[currentSectionIndex], title: e.target.value };
                      setSectionContents(newSections);
                    }}
                    className="text-xl font-bold w-full px-2 py-1 border border-primary rounded"
                  />
                )}
              </div>

              {/* Section Content */}
              <div className="prose dark:prose-invert max-w-none mb-8">
                {editMode ? (
                  <textarea
                    rows={15}
                    value={sectionContents[currentSectionIndex]?.content || ''}
                    onChange={(e) => {
                      const newSections = [...sectionContents];
                      newSections[currentSectionIndex] = { ...newSections[currentSectionIndex], content: e.target.value };
                      setSectionContents(newSections);
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-white dark:bg-gray-700 text-text-primary font-mono text-sm"
                    placeholder="Write content here using Markdown..."
                  />
                ) : (
                  <div className="whitespace-pre-wrap text-text-primary leading-relaxed">
                    {currentSection.content}
                  </div>
                )}
              </div>

              {/* Section Resources */}
              {currentSectionResources.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Resources for this Section
                  </h3>
                  <div className="grid gap-3">
                    {currentSectionResources.map(resource => (
                      <div 
                        key={resource.id} 
                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          {resource.type === 'pdf' && <FileText className="w-5 h-5 text-error" />}
                          {resource.type === 'video' && <Video className="w-5 h-5 text-purple-600" />}
                          {resource.type === 'image' && <Image className="w-5 h-5 text-green-600" />}
                          {resource.type === 'link' && <Globe className="w-5 h-5 text-blue-600" />}
                          <div>
                            <p className="font-medium text-text-primary">{resource.title}</p>
                            <p className="text-sm text-text-muted capitalize">{resource.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {resource.is_downloadable && (
                            <span className="p-1 text-xs text-text-muted" title="Can Download">
                              <Download className="w-3 h-3" />
                            </span>
                          )}
                          {resource.is_savable && (
                            <span className="p-1 text-xs text-text-muted" title="Can Save">
                              <Save className="w-3 h-3" />
                            </span>
                          )}
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20"
                          >
                            <Eye className="w-4 h-4" /> View
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Resource Button for Director */}
              {isDirector && expandedResource === currentSectionIndex && (
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
                  <p className="text-sm text-text-muted mb-2">Quick add resource:</p>
                  <p className="text-xs text-text-muted">Use the lecture detail modal to add resources to sections.</p>
                </div>
              )}

              {/* Navigation & Complete */}
              <div className="flex items-center justify-between pt-6 border-t border-border">
                <button
                  onClick={prevSection}
                  disabled={!canGoPrev || currentSectionIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg disabled:opacity-50"
                >
                  <ChevronUp className="w-4 h-4" /> Previous
                </button>

                <div className="flex items-center gap-3">
                  {!completedSections.includes(currentSectionIndex) && !isDirector && (
                    <button
                      onClick={markCompleteAndNext}
                      className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-lg hover:bg-success/20"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark Complete & Next
                    </button>
                  )}
                  {completedSections.includes(currentSectionIndex) && (
                    <span className="flex items-center gap-2 text-success">
                      <CheckCircle className="w-4 h-4" /> Completed
                    </span>
                  )}
                  {isDirector && (
                    <span className="flex items-center gap-2 text-sm px-3 py-1 bg-primary/10 text-primary rounded-lg">
                      Director Mode
                    </span>
                  )}
                </div>

                <button
                  onClick={nextSection}
                  disabled={!canGoNext || currentSectionIndex === sectionContents.length - 1}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg disabled:opacity-50"
                >
                  Next <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* All Resources */}
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-lg font-semibold text-text-primary mb-4">All Lecture Resources</h3>
                {resources.length === 0 ? (
                  <p className="text-text-muted text-center py-8">No resources attached.</p>
                ) : (
                  <div className="grid gap-3">
                    {resources.map(resource => (
                      <div 
                        key={resource.id} 
                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          {resource.type === 'pdf' && <FileText className="w-5 h-5 text-error" />}
                          {resource.type === 'video' && <Video className="w-5 h-5 text-purple-600" />}
                          {resource.type === 'image' && <Image className="w-5 h-5 text-green-600" />}
                          {resource.type === 'link' && <Globe className="w-5 h-5 text-blue-600" />}
                          <div>
                            <p className="font-medium text-text-primary">{resource.title}</p>
                            <p className="text-sm text-text-muted">{resource.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {resource.is_downloadable && <Download className="w-4 h-4 text-text-muted" />}
                          {resource.is_savable && <Save className="w-4 h-4 text-text-muted" />}
                          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View</a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Floating Progress */}
          <div className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-200 dark:text-gray-700" />
                  <circle 
                    cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="none" 
                    strokeDasharray={125.6}
                    strokeDashoffset={125.6 - (125.6 * progress / 100)}
                    className="text-primary transition-all duration-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-text-primary">
                  {progress}%
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Progress</p>
                <p className="text-xs text-text-muted">{completedSections.length} / {sectionContents.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}