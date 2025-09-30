// main/Dashboard.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
    const studentsChartRef = useRef(null);
    const lecturesChartRef = useRef(null);
    const attendanceChartRef = useRef(null);
    
    const { modal, setModal, alert, confirm, prompt } = useModal();
    const { searchTerm, isSearching, setSearchTerm, setIsSearching } = useSearch();

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
                searchTerms: ['students', 'boys', 'girls', 'gender'],
                chartData: { boys: 687, girls: 560 }
            },
            { 
                title: 'Lectures', 
                searchTerms: ['lectures', 'completed', 'pending'],
                chartData: { completed: 89, pending: 67 }
            },
            { 
                title: 'Teacher List', 
                searchTerms: ['teacher list', 'teachers'],
                tableData: [
                    { name: 'John Smith', grade: 'JSS1', subject: 'Mathematics', email: 'john@school.com' },
                    { name: 'Sarah Johnson', grade: 'JSS2', subject: 'English', email: 'sarah@school.com' },
                    { name: 'Mike Wilson', grade: 'SSS1', subject: 'Chemistry', email: 'mike@school.com' }
                ]
            },
            { 
                title: 'Attendance', 
                searchTerms: ['attendance', 'present', 'absent'],
                chartData: { present: [85, 92, 78, 88, 95], absent: [15, 8, 22, 12, 5] }
            }
        ],
        activities: [
            { content: 'Teacher X has started a lecture with the SS2 students.', time: '2 mins ago' },
            { content: 'Teacher A has gone offline.', time: '10 mins ago' },
            { content: 'JSS1 students assignment is due for submission!', time: '1 hour ago' },
            { content: 'New student registrations for SSS3 completed.', time: '3 hours ago' },
            { content: 'Low attendance alert for JSS2 today.', time: '5 hours ago' }
        ],
        teachers: [
            { name: 'John Smith', grade: 'JSS1', subject: 'Mathematics', email: 'john@school.com' },
            { name: 'Sarah Johnson', grade: 'JSS2', subject: 'English', email: 'sarah@school.com' },
            { name: 'Mike Wilson', grade: 'SSS1', subject: 'Chemistry', email: 'mike@school.com' }
        ]
    }), []);

    const searchResults = useMemo(() => 
        searchDashboardData(searchTerm, dashboardData),
        [searchTerm, dashboardData]
    );

    const hasSearchResults = useMemo(() => {
        return searchResults.stats.length > 0 || 
               searchResults.overviewCards.length > 0 || 
               searchResults.activities.length > 0 || 
               searchResults.teachers.length > 0;
    }, [searchResults]);

    useEffect(() => {
        initializeCharts();

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        return () => {
            if (studentsChartRef.current) studentsChartRef.current.destroy();
            if (lecturesChartRef.current) lecturesChartRef.current.destroy();
            if (attendanceChartRef.current) attendanceChartRef.current.destroy();
        };
    }, []);

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
        if (ctx) {
            attendanceChartRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    datasets: [{
                        label: 'Total Present',
                        data: [85, 92, 78, 88, 95],
                        backgroundColor: '#10b981',
                        borderRadius: 4
                    }, {
                        label: 'Total Absent',
                        data: [15, 8, 22, 12, 5],
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
            });
        }
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

    const shouldShow = (element, type) => {
        return shouldShowElement(element, searchTerm, searchResults, type);
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
                    {isSearching && (
                        <div className="search-results-indicator">
                            <div className="search-results-info">
                                <i data-lucide="search"></i>
                                <span>
                                    {searchTerm ? `Search results for "${searchTerm}"` : 'Showing all results'}
                                </span>
                                {searchTerm && (
                                    <button 
                                        className="clear-search-btn"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setIsSearching(false);
                                        }}
                                    >
                                        <i data-lucide="x"></i>
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="stats-container">
                        {dashboardData.stats.map((stat, index) => (
                            <div 
                                key={index}
                                className={`stat-card ${shouldShow(stat, 'stat-card') ? '' : 'search-hidden'}`}
                                data-search-terms={stat.searchTerms ? stat.searchTerms.join(' ') : ''}
                            >
                                <div className="stat-icon">
                                    <i data-lucide={
                                        index === 0 ? "users" :
                                        index === 1 ? "graduation-cap" :
                                        index === 2 ? "book-open" :
                                        index === 3 ? "shield-check" : "users-2"
                                    }></i>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="stat-content">
                                    <div className="stat-label">{stat.label}</div>
                                    <div className="stat-number">{stat.number}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="content-divider"></div>

                    {/* Overview Section */}
                    <div className="overview-section">
                        <h2 className="section-title">Overview</h2>
                        <div className="overview-grid">
                            {/* Students Chart Card */}
                            <div 
                                className={`overview-card ${shouldShow({ title: 'Students' }, 'overview-card') ? '' : 'search-hidden'}`}
                                data-search-terms="students boys girls gender"
                            >
                                <div className="card-header">
                                    <h3 className="card-title">Students</h3>
                                    <div className="card-filters">
                                        <select className="filter-select" id="student-grade-filter">
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
                                <div className="pie-chart-container">
                                    <div className="chart-wrapper">
                                        <canvas id="studentsChart"></canvas>
                                        <div className="chart-center-text">1,247</div>
                                    </div>
                                    <div className="chart-legend">
                                        <div className="legend-item">
                                            <div className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></div>
                                            <span className="legend-label">Boys</span>
                                            <span className="legend-value">687</span>
                                        </div>
                                        <div className="legend-item">
                                            <div className="legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
                                            <span className="legend-label">Girls</span>
                                            <span className="legend-value">560</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lectures Chart Card */}
                            <div 
                                className={`overview-card ${shouldShow({ title: 'Lectures' }, 'overview-card') ? '' : 'search-hidden'}`}
                                data-search-terms="lectures completed pending"
                            >
                                <div className="card-header">
                                    <h3 className="card-title">Lectures</h3>
                                    <div className="card-filters">
                                        <select className="filter-select" id="lecture-grade-filter">
                                            <option value="jss1">JSS1</option>
                                            <option value="all">All</option>
                                            <option value="jss2">JSS2</option>
                                            <option value="jss3">JSS3</option>
                                            <option value="sss1">SSS1</option>
                                            <option value="sss2">SSS2</option>
                                            <option value="sss3">SSS3</option>
                                        </select>
                                        <select className="filter-select" id="lecture-subject-filter">
                                            <option value="all">All</option>
                                            <option value="mathematics">Mathematics</option>
                                            <option value="english">English</option>
                                            <option value="chemistry">Chemistry</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pie-chart-container">
                                    <div className="chart-wrapper">
                                        <canvas id="lecturesChart"></canvas>
                                        <div className="chart-center-text">156</div>
                                    </div>
                                    <div className="chart-legend">
                                        <div className="legend-item">
                                            <div className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></div>
                                            <span className="legend-label">Completed</span>
                                            <span className="legend-value">89</span>
                                        </div>
                                        <div className="legend-item">
                                            <div className="legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
                                            <span className="legend-label">Pending</span>
                                            <span className="legend-value">67</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Teacher List Card */}
                            <div 
                                className={`overview-card ${shouldShow({ title: 'Teacher List' }, 'overview-card') ? '' : 'search-hidden'}`}
                                data-search-terms="teacher list teachers"
                            >
                                <div className="card-header">
                                    <h3 className="card-title">Teacher List</h3>
                                    <div className="card-filters">
                                        <select className="filter-select" id="teacher-grade-filter">
                                            <option value="all">All</option>
                                            <option value="jss1">JSS1</option>
                                            <option value="jss2">JSS2</option>
                                            <option value="jss3">JSS3</option>
                                            <option value="sss1">SSS1</option>
                                            <option value="sss2">SSS2</option>
                                            <option value="sss3">SSS3</option>
                                        </select>
                                        <select className="filter-select" id="teacher-subject-filter">
                                            <option value="all">All</option>
                                            <option value="mathematics">Mathematics</option>
                                            <option value="english">English</option>
                                            <option value="chemistry">Chemistry</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="table-container">
                                    <table className="teacher-table">
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
                                                    className={shouldShow(teacher, 'teacher-row') ? '' : 'search-hidden'}
                                                >
                                                    <td>{teacher.name}</td>
                                                    <td>{teacher.grade}</td>
                                                    <td>{teacher.subject}</td>
                                                    <td>{teacher.email}</td>
                                                    <td>
                                                        <button 
                                                            className="action-btn" 
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
                                className={`overview-card ${shouldShow({ title: 'Attendance' }, 'overview-card') ? '' : 'search-hidden'}`}
                                data-search-terms="attendance present absent"
                            >
                                <div className="card-header">
                                    <h3 className="card-title">Attendance</h3>
                                    <div className="card-filters">
                                        <select className="filter-select" id="attendance-type-filter">
                                            <option value="teachers">Teachers</option>
                                            <option value="all">All</option>
                                            <option value="students">Students</option>
                                        </select>
                                        <select className="filter-select" id="attendance-period-filter">
                                            <option value="today">Today</option>
                                            <option value="week">This Week</option>
                                            <option value="month">This Month</option>
                                            <option value="term">This Term</option>
                                            <option value="session">This Session</option>
                                        </select>
                                        <select className="filter-select" id="attendance-grade-filter">
                                            <option value="jss1">JSS1</option>
                                            <option value="all">All</option>
                                            <option value="jss2">JSS2</option>
                                            <option value="jss3">JSS3</option>
                                            <option value="sss1">SSS1</option>
                                            <option value="sss2">SSS2</option>
                                            <option value="sss3">SSS3</option>
                                        </select>
                                        <select className="filter-select" id="attendance-chart-filter">
                                            <option value="bar">Bar Chart</option>
                                            <option value="pie">Pie Chart</option>
                                            <option value="line">Line Graph</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="chart-container">
                                    <div className="chart-keys">
                                        <div className="chart-key">
                                            <div className="key-color" style={{ backgroundColor: '#10b981' }}></div>
                                            <span className="key-label">Total Present</span>
                                        </div>
                                        <div className="chart-key">
                                            <div className="key-color" style={{ backgroundColor: '#ef4444' }}></div>
                                            <span className="key-label">Total Absent</span>
                                        </div>
                                    </div>
                                    <div className="chart-canvas">
                                        <canvas id="attendanceChart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Section */}
                    <div className="activity-section">
                        <div className="content-divider"></div>
                        <h2 className="section-title">Activity</h2>
                        <div className="activity-list">
                            {dashboardData.activities.map((activity, index) => (
                                <div 
                                    key={index}
                                    className={`activity-item ${shouldShow(activity, 'activity-item') ? '' : 'search-hidden'}`}
                                >
                                    <div className="activity-icon">
                                        <i data-lucide={
                                            index === 0 ? "book-open" :
                                            index === 1 ? "user-minus" :
                                            index === 2 ? "file-text" :
                                            index === 3 ? "check-circle" : "alert-triangle"
                                        }></i>
                                    </div>
                                    <div className="activity-content">
                                        <p>{activity.content}</p>
                                        <span className="activity-time">{activity.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* No Results Message */}
                    {isSearching && searchTerm && !hasSearchResults && (
                        <div className="no-search-results">
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