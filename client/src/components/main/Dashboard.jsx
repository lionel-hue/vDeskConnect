// main/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import Header from '../Header';
import SidebarNav from '../SidebarNav';
import Loader from '../Loader';
import Modal, { useModal } from '../Modal';
import '../../style/dashboard.css';

Chart.register(...registerables);

const Dashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const studentsChartRef = useRef(null);
    const lecturesChartRef = useRef(null);
    const attendanceChartRef = useRef(null);
    
    const { modal, setModal, alert, confirm, prompt } = useModal();
    
    useEffect(() => {
        // Initialize charts
        initializeCharts();

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        return () => {
            // Cleanup charts
            if (studentsChartRef.current) {
                studentsChartRef.current.destroy();
            }
            if (lecturesChartRef.current) {
                lecturesChartRef.current.destroy();
            }
            if (attendanceChartRef.current) {
                attendanceChartRef.current.destroy();
            }
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
                    plugins: {
                        legend: { display: false }
                    }
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
                    plugins: {
                        legend: { display: false }
                    }
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
                    
                    // Simulate API call
                    setTimeout(() => {
                        setIsLoading(false);
                        alert(`Selected: ${actions[actionIndex].name} for ${teacherName}`, 'Action Confirmed');
                    }, 1500);
                } else {
                    await alert('Please select a valid action number (1-5)', 'Invalid Selection');
                }
            }
        } catch (error) {
            // User cancelled the prompt
            console.log('Action selection cancelled');
        }
    };

    const handleRemoveTeacher = async (teacherName) => {
        const shouldRemove = await confirm(
            `Are you sure you want to remove ${teacherName}? This action cannot be undone.`,
            'Remove Teacher'
        );

        if (shouldRemove) {
            setIsLoading(true);
            
            // Simulate removal process
            setTimeout(() => {
                setIsLoading(false);
                alert(`${teacherName} has been successfully removed.`, 'Teacher Removed');
            }, 2000);
        }
    };

    return (
        <div className="dashboard dashboard-page">
            {/* NOW Dashboard includes Header and SidebarNav */}
            <SidebarNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Header
                sidebarOpen={sidebarOpen}
                onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
                pageTitle="Dashboard"
            />

            {/* Loader */}
            {isLoading && <Loader message="Processing your request..." />}

            {/* Modal */}
            <Modal modal={modal} setModal={setModal} />

            {/* Your existing dashboard content */}
            <main className="dashboard-content">
                {/* Stats Cards */}
                <div className="stats-container">
                    <div className="stat-card" data-search-terms="students total students no of students">
                        <div className="stat-icon">
                            <i data-lucide="users"></i>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-content">
                            <div className="stat-label">No of Students</div>
                            <div className="stat-number">1,247</div>
                        </div>
                    </div>

                    <div className="stat-card" data-search-terms="teachers total teachers no of teachers">
                        <div className="stat-icon">
                            <i data-lucide="graduation-cap"></i>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-content">
                            <div className="stat-label">No of Teachers</div>
                            <div className="stat-number">89</div>
                        </div>
                    </div>

                    <div className="stat-card" data-search-terms="classes total classes no of classes">
                        <div className="stat-icon">
                            <i data-lucide="book-open"></i>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-content">
                            <div className="stat-label">No of Classes</div>
                            <div className="stat-number">156</div>
                        </div>
                    </div>

                    <div className="stat-card" data-search-terms="admins total admins no of admins">
                        <div className="stat-icon">
                            <i data-lucide="shield-check"></i>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-content">
                            <div className="stat-label">No of Admins</div>
                            <div className="stat-number">5</div>
                        </div>
                    </div>

                    <div className="stat-card" data-search-terms="population total population">
                        <div className="stat-icon">
                            <i data-lucide="users-2"></i>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-content">
                            <div className="stat-label">Total Population</div>
                            <div className="stat-number">1,497</div>
                        </div>
                    </div>
                </div>

                <div className="content-divider"></div>

                {/* Overview Section */}
                <div className="overview-section">
                    <h2 className="section-title">Overview</h2>
                    <div className="overview-grid">

                        {/* Students Chart Card */}
                        <div className="overview-card" data-search-terms="students boys girls gender">
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
                                    <canvas id="studentsChart" width="200" height="200"></canvas>
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
                        <div className="overview-card" data-search-terms="lectures completed pending">
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
                                    <canvas id="lecturesChart" width="200" height="200"></canvas>
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
                        <div className="overview-card" data-search-terms="teacher list teachers">
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
                                    <tr>
                                        <td>John Smith</td>
                                        <td>JSS1</td>
                                        <td>Mathematics</td>
                                        <td>john@school.com</td>
                                        <td>
                                            <button 
                                                className="action-btn" 
                                                onClick={() => showTeacherActions('John Smith')}
                                            >
                                                <i data-lucide="more-vertical"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Sarah Johnson</td>
                                        <td>JSS2</td>
                                        <td>English</td>
                                        <td>sarah@school.com</td>
                                        <td>
                                            <button 
                                                className="action-btn" 
                                                onClick={() => showTeacherActions('Sarah Johnson')}
                                            >
                                                <i data-lucide="more-vertical"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Mike Wilson</td>
                                        <td>SSS1</td>
                                        <td>Chemistry</td>
                                        <td>mike@school.com</td>
                                        <td>
                                            <button 
                                                className="action-btn" 
                                                onClick={() => showTeacherActions('Mike Wilson')}
                                            >
                                                <i data-lucide="more-vertical"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Attendance Chart Card */}
                        <div className="overview-card" data-search-terms="attendance present absent">
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
                                    <canvas id="attendanceChart" width="400" height="200"></canvas>
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
                        <div className="activity-item">
                            <div className="activity-icon">
                                <i data-lucide="book-open"></i>
                            </div>
                            <div className="activity-content">
                                <p><strong>Teacher X</strong> has started a lecture with the <strong>SS2 students</strong>.</p>
                                <span className="activity-time">2 mins ago</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon">
                                <i data-lucide="user-minus"></i>
                            </div>
                            <div className="activity-content">
                                <p><strong>Teacher A</strong> has gone offline.</p>
                                <span className="activity-time">10 mins ago</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon">
                                <i data-lucide="file-text"></i>
                            </div>
                            <div className="activity-content">
                                <p><strong>JSS1 students' assignment</strong> is due for submission!</p>
                                <span className="activity-time">1 hour ago</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon">
                                <i data-lucide="check-circle"></i>
                            </div>
                            <div className="activity-content">
                                <p><strong>New student registrations</strong> for SSS3 completed.</p>
                                <span className="activity-time">3 hours ago</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon">
                                <i data-lucide="alert-triangle"></i>
                            </div>
                            <div className="activity-content">
                                <p><strong>Low attendance alert</strong> for JSS2 today.</p>
                                <span className="activity-time">5 hours ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;