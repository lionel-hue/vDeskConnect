// main/Dashboard.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import Header from '../Header';
import SidebarNav from '../SidebarNav';
import Loader from '../Loader';
import Modal, { useModal } from '../Modal';
import { useSearch } from '../SearchManager';
import { searchDashboardData, shouldShowElement } from '../../utils/searchUtils';
import '../../style/dashboard.css';

Chart.register(...registerables);

const Dashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [attendanceChartType, setAttendanceChartType] = useState('bar');
    const [isMobile, setIsMobile] = useState(false);
    const { section } = useParams();
    const studentsChartRef = useRef(null);
    const lecturesChartRef = useRef(null);
    const attendanceChartRef = useRef(null);
    
    const { modal, setModal, alert, confirm, prompt } = useModal();
    const { searchTerm, isSearching, setSearchTerm, setIsSearching } = useSearch();

    // Scroll to section when URL parameter changes
    useEffect(() => {
        if (section) {
            setTimeout(() => {
                const element = document.getElementById(section);
                if (element) {
                    element.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 300);
        }
    }, [section]);

    // Mock dashboard data
    const dashboardData = useMemo(() => ({
        stats: [
            { label: 'No of Students', number: 1247, searchTerms: ['students', 'total students', 'no of students'] },
            { label: 'No of Teachers', number: 89, searchTerms: ['teachers', 'total teachers', 'no of teachers'] },
            { label: 'No of Classes', number: 156, searchTerms: ['classes', 'total classes', 'no of classes'] },
            { label: 'No of Admins', number: 5, searchTerms: ['admins', 'total admins', 'no of admins'] },
            { label: 'Total Population', number: 1497, searchTerms: ['population', 'total population'] }
        ],
        overviewCards: [
            { 
                title: 'Students', 
                searchTerms: ['students', 'boys', 'girls', 'gender', 'overview'],
                chartData: { boys: 687, girls: 560 }
            },
            { 
                title: 'Lectures', 
                searchTerms: ['lectures', 'completed', 'pending', 'overview'],
                chartData: { completed: 89, pending: 67 }
            },
            { 
                title: 'Teacher List', 
                searchTerms: ['teacher list', 'teachers', 'overview'],
                tableData: [
                    { name: 'John Smith', grade: 'JSS1', subject: 'Mathematics', email: 'john@school.com' },
                    { name: 'Sarah Johnson', grade: 'JSS2', subject: 'English', email: 'sarah@school.com' },
                    { name: 'Mike Wilson', grade: 'SSS1', subject: 'Chemistry', email: 'mike@school.com' }
                ]
            },
            { 
                title: 'Attendance', 
                searchTerms: ['attendance', 'present', 'absent', 'overview'],
                chartData: { present: [85, 92, 78, 88, 95], absent: [15, 8, 22, 12, 5] }
            }
        ],
        activities: [
            { 
                content: 'Teacher X has started a lecture with the SS2 students.', 
                time: '2 mins ago',
                searchTerms: ['teacher', 'lecture', 'ss2', 'activity']
            },
            { 
                content: 'Teacher A has gone offline.', 
                time: '10 mins ago',
                searchTerms: ['teacher', 'offline', 'activity']
            },
            { 
                content: 'JSS1 students assignment is due for submission!', 
                time: '1 hour ago',
                searchTerms: ['jss1', 'assignment', 'submission', 'activity']
            },
            { 
                content: 'New student registrations for SSS3 completed.', 
                time: '3 hours ago',
                searchTerms: ['student', 'registrations', 'sss3', 'activity']
            },
            { 
                content: 'Low attendance alert for JSS2 today.', 
                time: '5 hours ago',
                searchTerms: ['attendance', 'alert', 'jss2', 'activity']
            }
        ],
        teachers: [
            { name: 'John Smith', grade: 'JSS1', subject: 'Mathematics', email: 'john@school.com' },
            { name: 'Sarah Johnson', grade: 'JSS2', subject: 'English', email: 'sarah@school.com' },
            { name: 'Mike Wilson', grade: 'SSS1', subject: 'Chemistry', email: 'mike@school.com' }
        ]
    }), []);

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    // Filter search results based on mobile state
    const searchResults = useMemo(() => {
        const results = searchDashboardData(searchTerm, dashboardData);
        
        if (isMobile) {
            return {
                ...results,
                overviewCards: [],
                stats: results.stats.filter(stat => 
                    !stat.searchTerms?.some(term => 
                        term.toLowerCase().includes('overview')
                    )
                ),
                activities: results.activities.filter(activity =>
                    !activity.searchTerms?.some(term => 
                        term.toLowerCase().includes('overview')
                    )
                )
            };
        }
        
        return results;
    }, [searchTerm, dashboardData, isMobile]);

    // SIMPLE approach: Check if we have ANY visible elements in each section
    const hasVisibleStats = useMemo(() => 
        searchResults.stats.length > 0 || !searchTerm,
        [searchResults.stats, searchTerm]
    );

    const hasVisibleOverview = useMemo(() => 
        !isMobile && (searchResults.overviewCards.length > 0 || !searchTerm),
        [searchResults.overviewCards, searchTerm, isMobile]
    );

    const hasVisibleActivity = useMemo(() => 
        searchResults.activities.length > 0 || !searchTerm,
        [searchResults.activities, searchTerm]
    );

    // Enhanced shouldShow function that considers mobile state
    const shouldShow = (element, type) => {
        if (isMobile && type === 'overview-card') {
            return false;
        }
        
        return shouldShowElement(element, searchTerm, searchResults, type);
    };

    useEffect(() => {
        if (!isMobile) {
            initializeCharts();
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        return () => {
            if (studentsChartRef.current) studentsChartRef.current.destroy();
            if (lecturesChartRef.current) lecturesChartRef.current.destroy();
            if (attendanceChartRef.current) attendanceChartRef.current.destroy();
        };
    }, [isMobile]);

    // Add useEffect to recreate attendance chart when type changes
    useEffect(() => {
        if (!isMobile) {
            createAttendanceChart();
        }
    }, [attendanceChartType, isMobile]);

    const initializeCharts = () => {
        createStudentsChart();
        createLecturesChart();
        createAttendanceChart();
    };

    const createStudentsChart = () => {
        const ctx = document.getElementById('studentsChart');
        if (ctx) {
            studentsChartRef.current = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Boys', 'Girls'],
                    datasets: [{
                        data: [687, 560],
                        backgroundColor: ['#8b5cf6', '#3b82f6'],
                        borderWidth: 0,
                        cutout: '70%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            });
        }
    };

    const createLecturesChart = () => {
        const ctx = document.getElementById('lecturesChart');
        if (ctx) {
            lecturesChartRef.current = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'Pending'],
                    datasets: [{
                        data: [89, 67],
                        backgroundColor: ['#8b5cf6', '#3b82f6'],
                        borderWidth: 0,
                        cutout: '70%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            });
        }
    };

    const createAttendanceChart = () => {
        const ctx = document.getElementById('attendanceChart');
        if (!ctx) return;

        if (attendanceChartRef.current) {
            attendanceChartRef.current.destroy();
        }

        const labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const presentData = [85, 92, 78, 88, 95];
        const absentData = [15, 8, 22, 12, 5];

        let chartConfig;

        switch (attendanceChartType) {
            case 'pie':
                const totalPresent = presentData.reduce((a, b) => a + b, 0);
                const totalAbsent = absentData.reduce((a, b) => a + b, 0);
                
                chartConfig = {
                    type: 'pie',
                    data: {
                        labels: ['Total Present', 'Total Absent'],
                        datasets: [{
                            data: [totalPresent, totalAbsent],
                            backgroundColor: ['#10b981', '#ef4444'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { 
                            legend: { 
                                display: true,
                                position: 'bottom',
                                labels: {
                                    color: '#94a3b8',
                                    padding: 20
                                }
                            } 
                        }
                    }
                };
                break;

            case 'line':
                chartConfig = {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Total Present',
                            data: presentData,
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderColor: '#10b981',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true
                        }, {
                            label: 'Total Absent',
                            data: absentData,
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderColor: '#ef4444',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
                                ticks: { stepSize: 25, color: '#94a3b8' },
                                grid: { color: '#374151' }
                            },
                            x: {
                                ticks: { color: '#94a3b8' },
                                grid: { color: '#374151' }
                            }
                        }
                    }
                };
                break;

            case 'bar':
            default:
                chartConfig = {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Total Present',
                            data: presentData,
                            backgroundColor: '#10b981',
                            borderRadius: 4
                        }, {
                            label: 'Total Absent',
                            data: absentData,
                            backgroundColor: '#ef4444',
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
                                ticks: { stepSize: 25, color: '#94a3b8' },
                                grid: { color: '#374151' }
                            },
                            x: {
                                ticks: { color: '#94a3b8' },
                                grid: { color: '#374151' }
                            }
                        }
                    }
                };
                break;
        }

        attendanceChartRef.current = new Chart(ctx, chartConfig);
    };

    const handleAttendanceChartTypeChange = (e) => {
        setAttendanceChartType(e.target.value);
    };

    const showTeacherActions = async (teacherName) => {
        const actions = [
            { id: 1, name: 'View Profile' },
            { id: 2, name: 'Edit Details' },
            { id: 3, name: 'View Classes' },
            { id: 4, name: 'Send Message' },
            { id: 5, name: 'Remove Teacher' }
        ];

        const actionText = actions.map((a, i) => `${i + 1}. ${a.name}`).join('\n');
        
        try {
            const selectedAction = await prompt(
                `Choose action for ${teacherName}:\n${actionText}`,
                '',
                'Teacher Actions'
            );

            if (selectedAction && selectedAction.trim() !== '') {
                const actionIndex = parseInt(selectedAction) - 1;
                if (actionIndex >= 0 && actionIndex < actions.length) {
                    setIsLoading(true);
                    setTimeout(() => {
                        setIsLoading(false);
                        alert(`Selected: ${actions[actionIndex].name} for ${teacherName}`, 'Action Confirmed');
                    }, 1500);
                } else {
                    await alert('Please select a valid action number (1-5)', 'Invalid Selection');
                }
            }
        } catch (error) {
            console.log('Action selection cancelled');
        }
    };

    return (
        <div className="dashboard-layout">
            <SidebarNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="dashboard-main">
                <Header
                    sidebarOpen={sidebarOpen}
                    onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
                    pageTitle="Dashboard"
                />

                {isLoading && <Loader message="Processing your request..." />}

                <Modal modal={modal} setModal={setModal} />

                <main className="dashboard-content">
                    {/* Search Results Indicator */}
                    {searchTerm && (
                        <div className="dashboard-search-results-indicator">
                            <div className="dashboard-search-results-info">
                                <i data-lucide="search"></i>
                                <span>Search results for "{searchTerm}"</span>
                                <button 
                                    className="dashboard-clear-search-btn"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setIsSearching(false);
                                    }}
                                >
                                    <i data-lucide="x"></i>
                                    Clear
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Stats Section */}
                    <div className="dashboard-stats-container">
                        {dashboardData.stats.map((stat, index) => (
                            <div 
                                key={index}
                                className={`dashboard-stat-card ${shouldShow(stat, 'stat-card') ? '' : 'dashboard-search-hidden'}`}
                            >
                                <div className="dashboard-stat-icon">
                                    <i data-lucide={
                                        index === 0 ? "users" :
                                        index === 1 ? "graduation-cap" :
                                        index === 2 ? "book-open" :
                                        index === 3 ? "shield-check" : "users-2"
                                    }></i>
                                </div>
                                <div className="dashboard-stat-divider"></div>
                                <div className="dashboard-stat-content">
                                    <div className="dashboard-stat-label">{stat.label}</div>
                                    <div className="dashboard-stat-number">{stat.number}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    {(hasVisibleStats && (hasVisibleOverview || hasVisibleActivity)) && (
                        <div className="dashboard-content-divider"></div>
                    )}

                    {/* Overview Section */}
                    {!isMobile && (
                        <section id="overview" className="dashboard-overview-section">
                            <h2 className="dashboard-section-title">Overview</h2>
                            <div className="dashboard-overview-grid">
                                {/* Students Chart Card */}
                                <div 
                                    className={`dashboard-overview-card ${shouldShow({ title: 'Students' }, 'overview-card') ? '' : 'dashboard-search-hidden'}`}
                                >
                                    <div className="dashboard-card-header">
                                        <h3 className="dashboard-card-title">Students</h3>
                                        <div className="dashboard-card-filters">
                                            <select className="dashboard-filter-select" id="student-grade-filter">
                                                <option value="all">All</option>
                                                <option value="jss1">JSS1</option>
                                                <option value="jss2">JSS2</option>
                                                <option value="jss3">JSS3</option>
                                                <option value="sss1">SSS1</option>
                                                <option value="sss2">SSS2</option>
                                                <option value="sss3">SSS3</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="dashboard-pie-chart-container">
                                        <div className="dashboard-chart-wrapper">
                                            <canvas id="studentsChart"></canvas>
                                            <div className="dashboard-chart-center-text">1,247</div>
                                        </div>
                                        <div className="dashboard-chart-legend">
                                            <div className="dashboard-legend-item">
                                                <div className="dashboard-legend-color" style={{ backgroundColor: '#8b5cf6' }}></div>
                                                <span className="dashboard-legend-label">Boys</span>
                                                <span className="dashboard-legend-value">687</span>
                                            </div>
                                            <div className="dashboard-legend-item">
                                                <div className="dashboard-legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
                                                <span className="dashboard-legend-label">Girls</span>
                                                <span className="dashboard-legend-value">560</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Lectures Chart Card */}
                                <div 
                                    className={`dashboard-overview-card ${shouldShow({ title: 'Lectures' }, 'overview-card') ? '' : 'dashboard-search-hidden'}`}
                                >
                                    <div className="dashboard-card-header">
                                        <h3 className="dashboard-card-title">Lectures</h3>
                                        <div className="dashboard-card-filters">
                                            <select className="dashboard-filter-select" id="lecture-grade-filter">
                                                <option value="jss1">JSS1</option>
                                                <option value="all">All</option>
                                                <option value="jss2">JSS2</option>
                                                <option value="jss3">JSS3</option>
                                                <option value="sss1">SSS1</option>
                                                <option value="sss2">SSS2</option>
                                                <option value="sss3">SSS3</option>
                                            </select>
                                            <select className="dashboard-filter-select" id="lecture-subject-filter">
                                                <option value="all">All</option>
                                                <option value="mathematics">Mathematics</option>
                                                <option value="english">English</option>
                                                <option value="chemistry">Chemistry</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="dashboard-pie-chart-container">
                                        <div className="dashboard-chart-wrapper">
                                            <canvas id="lecturesChart"></canvas>
                                            <div className="dashboard-chart-center-text">156</div>
                                        </div>
                                        <div className="dashboard-chart-legend">
                                            <div className="dashboard-legend-item">
                                                <div className="dashboard-legend-color" style={{ backgroundColor: '#8b5cf6' }}></div>
                                                <span className="dashboard-legend-label">Completed</span>
                                                <span className="dashboard-legend-value">89</span>
                                            </div>
                                            <div className="dashboard-legend-item">
                                                <div className="dashboard-legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
                                                <span className="dashboard-legend-label">Pending</span>
                                                <span className="dashboard-legend-value">67</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Teacher List Card */}
                                <div 
                                    className={`dashboard-overview-card ${shouldShow({ title: 'Teacher List' }, 'overview-card') ? '' : 'dashboard-search-hidden'}`}
                                >
                                    <div className="dashboard-card-header">
                                        <h3 className="dashboard-card-title">Teacher List</h3>
                                        <div className="dashboard-card-filters">
                                            <select className="dashboard-filter-select" id="teacher-grade-filter">
                                                <option value="all">All</option>
                                                <option value="jss1">JSS1</option>
                                                <option value="jss2">JSS2</option>
                                                <option value="jss3">JSS3</option>
                                                <option value="sss1">SSS1</option>
                                                <option value="sss2">SSS2</option>
                                                <option value="sss3">SSS3</option>
                                            </select>
                                            <select className="dashboard-filter-select" id="teacher-subject-filter">
                                                <option value="all">All</option>
                                                <option value="mathematics">Mathematics</option>
                                                <option value="english">English</option>
                                                <option value="chemistry">Chemistry</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="dashboard-table-container">
                                        <table className="dashboard-teacher-table">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Grade</th>
                                                    <th>Subject</th>
                                                    <th>Email</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dashboardData.teachers.map((teacher, index) => (
                                                    <tr 
                                                        key={index}
                                                        className={shouldShow(teacher, 'teacher-row') ? '' : 'dashboard-search-hidden'}
                                                    >
                                                        <td>{teacher.name}</td>
                                                        <td>{teacher.grade}</td>
                                                        <td>{teacher.subject}</td>
                                                        <td>{teacher.email}</td>
                                                        <td>
                                                            <button 
                                                                className="dashboard-action-btn" 
                                                                onClick={() => showTeacherActions(teacher.name)}
                                                            >
                                                                <i data-lucide="more-vertical"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Attendance Chart Card */}
                                <div 
                                    className={`dashboard-overview-card ${shouldShow({ title: 'Attendance' }, 'overview-card') ? '' : 'dashboard-search-hidden'}`}
                                >
                                    <div className="dashboard-card-header">
                                        <h3 className="dashboard-card-title">Attendance</h3>
                                        <div className="dashboard-card-filters">
                                            <select className="dashboard-filter-select" id="attendance-type-filter">
                                                <option value="teachers">Teachers</option>
                                                <option value="all">All</option>
                                                <option value="students">Students</option>
                                            </select>
                                            <select className="dashboard-filter-select" id="attendance-period-filter">
                                                <option value="today">Today</option>
                                                <option value="week">This Week</option>
                                                <option value="month">This Month</option>
                                                <option value="term">This Term</option>
                                                <option value="session">This Session</option>
                                            </select>
                                            <select className="dashboard-filter-select" id="attendance-grade-filter">
                                                <option value="jss1">JSS1</option>
                                                <option value="all">All</option>
                                                <option value="jss2">JSS2</option>
                                                <option value="jss3">JSS3</option>
                                                <option value="sss1">SSS1</option>
                                                <option value="sss2">SSS2</option>
                                                <option value="sss3">SSS3</option>
                                            </select>
                                            <select 
                                                className="dashboard-filter-select" 
                                                id="attendance-chart-filter"
                                                value={attendanceChartType}
                                                onChange={handleAttendanceChartTypeChange}
                                            >
                                                <option value="bar">Bar Chart</option>
                                                <option value="pie">Pie Chart</option>
                                                <option value="line">Line Graph</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="dashboard-chart-container">
                                        <div className="dashboard-chart-keys">
                                            <div className="dashboard-chart-key">
                                                <div className="dashboard-key-color" style={{ backgroundColor: '#10b981' }}></div>
                                                <span className="dashboard-key-label">Total Present</span>
                                            </div>
                                            <div className="dashboard-chart-key">
                                                <div className="dashboard-key-color" style={{ backgroundColor: '#ef4444' }}></div>
                                                <span className="dashboard-key-label">Total Absent</span>
                                            </div>
                                        </div>
                                        <div className="dashboard-chart-canvas">
                                            <canvas id="attendanceChart"></canvas>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Activity Section */}
                    <section id="activity" className="dashboard-activity-section">
                        {(hasVisibleStats && (hasVisibleOverview || hasVisibleActivity)) && (
                            <div className="dashboard-content-divider"></div>
                        )}
                        <h2 className="dashboard-section-title">Activity</h2>
                        <div className="dashboard-activity-list">
                            {dashboardData.activities.map((activity, index) => (
                                <div 
                                    key={index}
                                    className={`dashboard-activity-item ${shouldShow(activity, 'activity-item') ? '' : 'dashboard-search-hidden'}`}
                                >
                                    <div className="dashboard-activity-icon">
                                        <i data-lucide={
                                            index === 0 ? "book-open" :
                                            index === 1 ? "user-minus" :
                                            index === 2 ? "file-text" :
                                            index === 3 ? "check-circle" : "alert-triangle"
                                        }></i>
                                    </div>
                                    <div className="dashboard-activity-content">
                                        <p>{activity.content}</p>
                                        <span className="dashboard-activity-time">{activity.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* No Results Message */}
                    {searchTerm && !hasVisibleStats && !hasVisibleOverview && !hasVisibleActivity && (
                        <div className="dashboard-no-search-results">
                            <i data-lucide="search-x"></i>
                            <h3>No results found</h3>
                            <p>No dashboard items match your search for "<strong>{searchTerm}</strong>"</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;