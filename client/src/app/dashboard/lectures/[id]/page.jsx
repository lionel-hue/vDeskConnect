'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Play, PlayCircle, Pause, CheckCircle, Clock,
  BookOpen, Users, Video, FileText, Image, Globe, Link as LinkIcon,
  Download, Save, Lock, Unlock, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, X,
  Maximize2, Minimize2, Eye, File, Loader,
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
  const [lecture, setLecture] = useState(null);
  const [resources, setResources] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState([]);
  const [sectionContents, setSectionContents] = useState([]);
  const [expandedResource, setExpandedResource] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);

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
      const [lectureRes, resourcesRes] = await Promise.all([
        academicApi.lectures.getOne(params.id),
        academicApi.lectureResources.getAll(params.id).catch(() => ({ resources: [] })),
      ]);
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
  }, [fetchLecture, router]);

  // Calculate progress
  const progress = sectionContents.length > 0 
    ? Math.round((completedSections.length / sectionContents.length) * 100) 
    : 0;

  // Mark current section as completed
  const markSectionComplete = () => {
    if (!completedSections.includes(currentSectionIndex)) {
      setCompletedSections([...completedSections, currentSectionIndex]);
    }
    if (currentSectionIndex < sectionContents.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  // Go to next section
  const nextSection = () => {
    if (currentSectionIndex < sectionContents.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  // Go to previous section
  const prevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  // Check if section is unlocked
  const isSectionUnlocked = (index) => {
    if (index === 0) return true;
    return completedSections.includes(index - 1);
  };

  // Get resources for current section
  const currentSectionResources = resources.filter(r => 
    r.order_index === currentSectionIndex || !r.order_index
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
              {completedSections.length} of {sectionContents.length} sections completed
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
                const isUnlocked = isSectionUnlocked(index);

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
                        className={`text-left ${!isUnlocked && 'opacity-50'}`}
                      >
                        <p className={`text-sm font-medium ${isCurrent ? 'text-primary' : 'text-text-primary'}`}>
                          {section.title}
                        </p>
                        <p className="text-xs text-text-muted">
                          {isCompleted ? 'Completed' : isUnlocked ? (isCurrent ? 'Current' : 'Available') : 'Locked'}
                        </p>
                      </button>
                    </div>
                  </div>
                );
              })}

              {sectionContents.length === 0 && (
                <p className="text-sm text-text-muted text-center py-8">No sections available</p>
              )}
            </div>
          </div>

          {/* Toggle Sidebar */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute left-4 top-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-border"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
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
                Section {currentSectionIndex + 1} of {sectionContents.length}
              </span>
              <button
                onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
                disabled={currentSectionIndex === 0}
                className="p-2 border border-border rounded-lg disabled:opacity-50"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentSectionIndex(Math.min(sectionContents.length - 1, currentSectionIndex + 1))}
                disabled={currentSectionIndex === sectionContents.length - 1}
                className="p-2 border border-border rounded-lg disabled:opacity-50"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6">
              {/* Section Title */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  {currentSection.title}
                </h2>
                {!isSectionUnlocked(currentSectionIndex) && (
                  <div className="flex items-center gap-2 text-warning">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm">Complete previous sections to unlock</span>
                  </div>
                )}
              </div>

              {/* Section Content - Render as markdown preview */}
              <div className="prose dark:prose-invert max-w-none mb-8">
                <div className="whitespace-pre-wrap text-text-primary leading-relaxed">
                  {currentSection.content}
                </div>
              </div>

              {/* Section Resources */}
              {currentSectionResources.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Resources</h3>
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
                            <p className="text-sm text-text-muted">{resource.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {resource.is_downloadable && (
                            <button className="p-2 text-text-muted hover:text-primary" title="Download">
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          {resource.is_savable && (
                            <button className="p-2 text-text-muted hover:text-primary" title="Save to Library">
                              <Save className="w-4 h-4" />
                            </button>
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

              {/* Mark Complete & Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-border">
                <button
                  onClick={prevSection}
                  disabled={currentSectionIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg disabled:opacity-50"
                >
                  <ChevronUp className="w-4 h-4" /> Previous
                </button>

                <div className="flex items-center gap-3">
                  {!completedSections.includes(currentSectionIndex) && (
                    <button
                      onClick={() => {
                        setCompletedSections([...completedSections, currentSectionIndex]);
                        toast.success('Section marked complete!');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-lg hover:bg-success/20"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark Complete
                    </button>
                  )}
                  {completedSections.includes(currentSectionIndex) && (
                    <span className="flex items-center gap-2 text-success">
                      <CheckCircle className="w-4 h-4" /> Completed
                    </span>
                  )}
                </div>

                <button
                  onClick={nextSection}
                  disabled={currentSectionIndex === sectionContents.length - 1}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg disabled:opacity-50"
                >
                  Next <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* All Resources for this Lecture */}
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-lg font-semibold text-text-primary mb-4">All Lecture Resources</h3>
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
                        {resource.is_downloadable && (
                          <span className="p-1 text-xs text-text-muted" title="Downloadable">
                            <Download className="w-3 h-3" />
                          </span>
                        )}
                        {resource.is_savable && (
                          <span className="p-1 text-xs text-text-muted" title="Savable">
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
                  {resources.length === 0 && (
                    <p className="text-text-muted text-center py-8">No resources attached to this lecture.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Floating Progress Indicator */}
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
                <p className="text-xs text-text-muted">{completedSections.length} / {sectionContents.length} done</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}