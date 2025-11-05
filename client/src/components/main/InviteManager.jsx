    // main/InviteManager.jsx
    import React, { useState, useEffect, useRef, useMemo } from 'react';
    import { useParams, useNavigate, useLocation } from 'react-router-dom';
    import { Chart, registerables } from 'chart.js';
    import Header from '../Header';
    import SidebarNav from '../SidebarNav';
    import Loader from '../Loader';
    import Modal, { useModal } from '../Modal';
    import { useSearch } from '../SearchManager';
    import { searchInviteManagerData, shouldShowElement } from '../../utils/searchUtils';
    import '../../style/invite-manager.css';

    Chart.register(...registerables);

    const InviteManager = () => {
        const [sidebarOpen, setSidebarOpen] = useState(false);
        const [isLoading, setIsLoading] = useState(false);
        const [isMobile, setIsMobile] = useState(false);
        const { section } = useParams();
        const navigate = useNavigate();
        const location = useLocation(); // ADDED: useLocation hook

        const { modal, setModal, alert, confirm, prompt } = useModal();
        const { searchTerm, isSearching, setSearchTerm, setIsSearching } = useSearch();

        // Mock data matching database schema
        const [invites, setInvites] = useState([
            {
                id: 1,
                code: 'TCH-A7K9M2',
                user_type: 'teacher',
                created_at: new Date('2024-01-15'),
                expires_at: new Date('2024-01-22'),
                used: true,
                used_by: 'John Smith',
                used_at: new Date('2024-01-16'),
                admin_id: 1
            },
            {
                id: 2,
                code: 'STD-B3N8P5',
                user_type: 'student',
                created_at: new Date('2024-01-18'),
                expires_at: new Date('2024-01-25'),
                used: false,
                used_by: null,
                used_at: null,
                admin_id: 1
            },
            {
                id: 3,
                code: 'TCH-C4Q7R1',
                user_type: 'teacher',
                created_at: new Date('2024-01-10'),
                expires_at: new Date('2024-01-17'),
                used: false,
                used_by: null,
                used_at: null,
                admin_id: 1
            },
            {
                id: 4,
                code: 'STD-D9W2E6',
                user_type: 'student',
                created_at: new Date('2024-01-20'),
                expires_at: new Date('2024-01-27'),
                used: true,
                used_by: 'Sarah Johnson',
                used_at: new Date('2024-01-21'),
                admin_id: 1
            },
            {
                id: 5,
                code: 'TCH-E5T8Y3',
                user_type: 'teacher',
                created_at: new Date('2024-01-12'),
                expires_at: new Date('2024-01-19'),
                used: false,
                used_by: null,
                used_at: null,
                admin_id: 1
            }
        ]);

        const [selectedInvite, setSelectedInvite] = useState(null);
        const [generatedCode, setGeneratedCode] = useState(null);
        const analyticsChartRef = useRef(null);
        const [userTypeFilter, setUserTypeFilter] = useState('all');
        const [usageFilter, setUsageFilter] = useState('all');
        const [expiryFilter, setExpiryFilter] = useState('all');
        const [searchInput, setSearchInput] = useState('');

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

        // FIXED: Enhanced scroll to section when URL parameter changes
        useEffect(() => {
            console.log('InviteManager section changed:', section);
            console.log('Current path:', location.pathname);

            const getCurrentSection = () => {
                const path = location.pathname;
                
                // Handle nested routes properly
                if (path === '/invite-manager' || path === '/invite-manager/') {
                    return 'generate-codes'; // default section
                }
                
                // Extract section from path like /invite-manager/generate-codes
                const pathParts = path.split('/').filter(part => part);
                console.log('InviteManager path parts:', pathParts);
                
                if (pathParts.length > 1) {
                    const sectionFromPath = pathParts[1];
                    console.log('Extracted section:', sectionFromPath);
                    
                    // Validate section exists
                    const validSections = ['generate-codes', 'view-invites', 'usage-analytics'];
                    if (validSections.includes(sectionFromPath)) {
                        return sectionFromPath;
                    }
                }
                
                return 'generate-codes'; // default fallback
            };

            const currentSection = getCurrentSection();
            console.log('Final current section for scrolling:', currentSection);

            const scrollToSection = () => {
                // Wait for DOM to be ready and all components rendered
                setTimeout(() => {
                    console.log('Attempting to scroll to section:', currentSection);
                    
                    // First try by ID
                    const element = document.getElementById(currentSection);
                    if (element) {
                        console.log('Found element by ID, scrolling...');
                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        return;
                    }
                    
                    // Then try by data-section attribute
                    const altElement = document.querySelector(`[data-section="${currentSection}"]`);
                    if (altElement) {
                        console.log('Found element by data-section, scrolling...');
                        altElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        return;
                    }
                    
                    // Fallback: scroll to top
                    console.log('Scrolling to top as fallback');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 800); // Increased timeout to ensure everything is loaded
            };

            scrollToSection();
        }, [section, location.pathname]); // ADDED: location.pathname dependency

        // Initialize icons and analytics chart
        useEffect(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            // Initialize chart on component mount
            createAnalyticsChart();

            return () => {
                // Cleanup chart on component unmount
                if (analyticsChartRef.current) {
                    analyticsChartRef.current.destroy();
                    analyticsChartRef.current = null;
                }
            };
        }, []);

        // Recreate chart when analytics section becomes visible
        useEffect(() => {
            if (shouldShowSection('usage-analytics')) {
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    createAnalyticsChart();
                }, 100);
            }
        }, [searchTerm]);

        // Search functionality
        const searchResults = useMemo(() => {
            return searchInviteManagerData(searchTerm, {
                invites,
                generatedCode,
                sections: ['generate-codes', 'view-invites', 'usage-analytics']
            });
        }, [searchTerm, invites, generatedCode]);

        // Filter invites based on filters
        const filteredInvites = useMemo(() => {
            let filtered = invites;

            // Search filter
            if (searchInput) {
                const searchTerm = searchInput.toLowerCase();
                filtered = filtered.filter(invite =>
                    invite.code.toLowerCase().includes(searchTerm) ||
                    (invite.used_by && invite.used_by.toLowerCase().includes(searchTerm)) ||
                    formatDate(invite.created_at).toLowerCase().includes(searchTerm) ||
                    formatDate(invite.expires_at).toLowerCase().includes(searchTerm)
                );
            }

            // User type filter
            if (userTypeFilter !== 'all') {
                filtered = filtered.filter(invite => invite.user_type === userTypeFilter);
            }

            // Usage filter
            if (usageFilter !== 'all') {
                const isUsed = usageFilter === 'used';
                filtered = filtered.filter(invite => invite.used === isUsed);
            }

            // Expiry filter
            if (expiryFilter !== 'all') {
                const now = new Date();
                if (expiryFilter === 'expired') {
                    filtered = filtered.filter(invite => invite.expires_at < now);
                } else {
                    filtered = filtered.filter(invite => invite.expires_at >= now);
                }
            }

            return filtered;
        }, [invites, searchInput, userTypeFilter, usageFilter, expiryFilter]);

        // Generate code function
        const generateCode = async (userType) => {
            setIsLoading(true);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const code = `${userType === 'teacher' ? 'TCH' : 'STD'}-${generateRandomCode()}`;
            const createdAt = new Date();
            const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

            const newInvite = {
                id: invites.length + 1,
                code: code,
                user_type: userType,
                created_at: createdAt,
                expires_at: expiresAt,
                used: false,
                used_by: null,
                used_at: null,
                admin_id: 1
            };

            setInvites(prev => [...prev, newInvite]);
            setGeneratedCode({
                code,
                userType,
                createdAt,
                expiresAt
            });

            setIsLoading(false);
            showToast(`${userType.charAt(0).toUpperCase() + userType.slice(1)} code generated successfully!`);
        };

        const generateRandomCode = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        };

        // Copy code function
        const copyCode = async () => {
            if (generatedCode) {
                try {
                    await navigator.clipboard.writeText(generatedCode.code);
                    showToast('Code copied to clipboard!');
                } catch (err) {
                    await alert('Failed to copy code', 'Error');
                }
            }
        };

        // Modal functions
        const openModal = (invite) => {
            setSelectedInvite(invite);
        };

        const closeModal = () => {
            setSelectedInvite(null);
        };

        const regenerateCode = async () => {
            if (!selectedInvite) return;

            const newCode = `${selectedInvite.user_type === 'teacher' ? 'TCH' : 'STD'}-${generateRandomCode()}`;

            setInvites(prev => prev.map(invite =>
                invite.id === selectedInvite.id
                    ? {
                        ...invite,
                        code: newCode,
                        created_at: new Date(),
                        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    }
                    : invite
            ));

            closeModal();
            showToast('Code regenerated successfully!');
        };

        const viewDetails = async () => {
            if (!selectedInvite) return;

            await alert(
                `Code: ${selectedInvite.code}\nUser Type: ${selectedInvite.user_type}\nCreated: ${formatDate(selectedInvite.created_at)}\nExpires: ${formatDate(selectedInvite.expires_at)}\nUsed: ${selectedInvite.used ? 'Yes' : 'No'}\nUsed By: ${selectedInvite.used_by || 'N/A'}`,
                'Invite Code Details'
            );
        };

        const sendReminder = async () => {
            await alert('Email reminder feature coming soon!', 'Feature Coming Soon');
        };

        const deleteCode = async () => {
            if (!selectedInvite) return;

            const shouldDelete = await confirm('Are you sure you want to delete this invite code?', 'Confirm Deletion');
            if (shouldDelete) {
                setInvites(prev => prev.filter(i => i.id !== selectedInvite.id));
                closeModal();
                showToast('Code deleted successfully!');
            }
        };

        // Analytics functions
        const createAnalyticsChart = () => {
            const ctx = document.getElementById('invite-manager-analytics-chart');
            if (!ctx) {
                console.log('Chart canvas not found');
                return;
            }

            // Clear existing chart if it exists
            if (analyticsChartRef.current) {
                analyticsChartRef.current.destroy();
                analyticsChartRef.current = null;
            }

            // Generate mock data for the last 7 days
            const labels = [];
            const teacherData = [];
            const studentData = [];

            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                teacherData.push(Math.floor(Math.random() * 10) + 1);
                studentData.push(Math.floor(Math.random() * 15) + 1);
            }

            try {
                const newChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Teacher Codes',
                                data: teacherData,
                                borderColor: '#8b5cf6',
                                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                borderWidth: 2,
                                tension: 0.4,
                                fill: true
                            },
                            {
                                label: 'Student Codes',
                                data: studentData,
                                borderColor: '#3b82f6',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                borderWidth: 2,
                                tension: 0.4,
                                fill: true
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    color: '#f8fafc',
                                    font: {
                                        size: 12
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    color: '#94a3b8',
                                    stepSize: 5
                                },
                                grid: {
                                    color: '#374151'
                                }
                            },
                            x: {
                                ticks: {
                                    color: '#94a3b8'
                                },
                                grid: {
                                    color: '#374151'
                                }
                            }
                        }
                    }
                });

                analyticsChartRef.current = newChart;
            } catch (error) {
                console.error('Error creating chart:', error);
            }
        };

        // Utility functions
        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        };

        const getExpiryStatus = (expiresAt) => {
            const now = new Date();
            const daysUntilExpiry = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

            if (daysUntilExpiry < 0) {
                return { class: 'expired', text: 'Expired' };
            } else if (daysUntilExpiry <= 2) {
                return { class: 'expiring-soon', text: 'Expiring Soon' };
            } else {
                return { class: 'valid', text: 'Valid' };
            }
        };

        const showToast = async (message) => {
            await alert(message, 'Success');
        };

        // Check if sections should be shown based on search
        const shouldShowSection = (sectionId) => {
            if (!searchTerm) return true;
            return searchResults.sections && searchResults.sections.includes(sectionId);
        };

        const shouldShowInviteElement = (element, type) => {
            if (!searchTerm) return true;
            return shouldShowElement(element, searchTerm, searchResults, type);
        };

        // Function to handle section navigation
        const navigateToSection = (sectionName) => {
            navigate(`/invite-manager/${sectionName}`);
        };

        return (
            <div className="invite-manager-layout">
                <SidebarNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="invite-manager-main">
                    <Header
                        sidebarOpen={sidebarOpen}
                        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
                        pageTitle="Invite Manager"
                    />

                    {isLoading && <Loader message="Processing your request..." />}

                    <Modal modal={modal} setModal={setModal} />

                    <main className="invite-manager-content">
                        {/* Search Results Indicator */}
                        {searchTerm && (
                            <div className="invite-manager-search-results-indicator">
                                <div className="invite-manager-search-results-info">
                                    <i data-lucide="search"></i>
                                    <span>Search results for "{searchTerm}"</span>
                                    <button
                                        className="invite-manager-clear-search-btn"
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

                        {/* Generate Codes Section */}
                        {shouldShowSection('generate-codes') && (
                            <section
                                id="generate-codes"
                                data-section="generate-codes" // ADDED: data-section attribute
                                className="invite-manager-section"
                            >
                                <h2 className="invite-manager-section-title">Generate Codes</h2>
                                <div className="invite-manager-card">
                                    <h3 className="invite-manager-card-title">Generate New Invite Code</h3>
                                    <div className="invite-manager-generate-buttons">
                                        <button
                                            className="invite-manager-generate-btn invite-manager-teacher-btn"
                                            onClick={() => generateCode('teacher')}
                                        >
                                            <i data-lucide="graduation-cap"></i>
                                            Generate Teacher Code
                                        </button>
                                        <button
                                            className="invite-manager-generate-btn invite-manager-student-btn"
                                            onClick={() => generateCode('student')}
                                        >
                                            <i data-lucide="users"></i>
                                            Generate Student Code
                                        </button>
                                    </div>

                                    {generatedCode && (
                                        <div className="invite-manager-code-display invite-manager-show">
                                            <div className="invite-manager-code-box">
                                                <span className="invite-manager-code-text">{generatedCode.code}</span>
                                                <button className="invite-manager-copy-btn" onClick={copyCode}>
                                                    <i data-lucide="copy"></i>
                                                    Copy Code
                                                </button>
                                            </div>
                                            <div className="invite-manager-code-details">
                                                <div className="invite-manager-code-detail">
                                                    <span className="invite-manager-code-detail-label">User Type</span>
                                                    <span className="invite-manager-code-detail-value">
                                                        {generatedCode.userType.charAt(0).toUpperCase() + generatedCode.userType.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="invite-manager-code-detail">
                                                    <span className="invite-manager-code-detail-label">Created</span>
                                                    <span className="invite-manager-code-detail-value">
                                                        {formatDate(generatedCode.createdAt)}
                                                    </span>
                                                </div>
                                                <div className="invite-manager-code-detail">
                                                    <span className="invite-manager-code-detail-label">Expires</span>
                                                    <span className="invite-manager-code-detail-value">
                                                        {formatDate(generatedCode.expiresAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* View Invites Section */}
                        {shouldShowSection('view-invites') && (
                            <section
                                id="view-invites"
                                data-section="view-invites" // ADDED: data-section attribute
                                className="invite-manager-section"
                            >
                                <h2 className="invite-manager-section-title">View Invites</h2>
                                <div className="invite-manager-card">
                                    <h3 className="invite-manager-card-title">All Invite Codes</h3>

                                    <div className="invite-manager-filters">
                                        <input
                                            type="text"
                                            className="invite-manager-search-input"
                                            placeholder="Search by name, code, or date..."
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                        />
                                        <div className="invite-manager-filter-group">
                                            <select
                                                className="invite-manager-filter-select"
                                                value={userTypeFilter}
                                                onChange={(e) => setUserTypeFilter(e.target.value)}
                                            >
                                                <option value="all">All Users</option>
                                                <option value="teacher">Teachers</option>
                                                <option value="student">Students</option>
                                            </select>
                                            <select
                                                className="invite-manager-filter-select"
                                                value={usageFilter}
                                                onChange={(e) => setUsageFilter(e.target.value)}
                                            >
                                                <option value="all">All Status</option>
                                                <option value="used">Used</option>
                                                <option value="unused">Not Used</option>
                                            </select>
                                            <select
                                                className="invite-manager-filter-select"
                                                value={expiryFilter}
                                                onChange={(e) => setExpiryFilter(e.target.value)}
                                            >
                                                <option value="all">All Expiry</option>
                                                <option value="expired">Expired</option>
                                                <option value="valid">Valid</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="invite-manager-table-container">
                                        <table className="invite-manager-invites-table">
                                            <thead>
                                                <tr>
                                                    <th>User</th>
                                                    <th>Name</th>
                                                    <th>Invite Code</th>
                                                    <th>User Type</th>
                                                    <th>Created</th>
                                                    <th>Expires</th>
                                                    <th>Used At</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredInvites.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="8" className="invite-manager-empty-state">
                                                            <i data-lucide="inbox"></i>
                                                            <p>No invites found</p>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredInvites.map(invite => {
                                                        const avatar = invite.used_by ?
                                                            invite.used_by.split(' ').map(n => n[0]).join('') : '?';
                                                        const expiryStatus = getExpiryStatus(invite.expires_at);

                                                        return (
                                                            <tr
                                                                key={invite.id}
                                                                onClick={() => openModal(invite)}
                                                                className="invite-manager-table-row"
                                                            >
                                                                <td>
                                                                    <div className="invite-manager-user-avatar">{avatar}</div>
                                                                </td>
                                                                <td>{invite.used_by || 'Not Used'}</td>
                                                                <td><strong>{invite.code}</strong></td>
                                                                <td>
                                                                    <span className={`invite-manager-badge invite-manager-${invite.user_type}`}>
                                                                        {invite.user_type}
                                                                    </span>
                                                                </td>
                                                                <td>{formatDate(invite.created_at)}</td>
                                                                <td>
                                                                    <span className={`invite-manager-badge invite-manager-${expiryStatus.class}`}>
                                                                        {formatDate(invite.expires_at)}
                                                                    </span>
                                                                </td>
                                                                <td>{invite.used_at ? formatDate(invite.used_at) : 'Not Used'}</td>
                                                                <td>
                                                                    <span className={`invite-manager-badge ${invite.used ? 'invite-manager-used' : 'invite-manager-unused'}`}>
                                                                        {invite.used ? 'Used' : 'Active'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Usage Analytics Section */}
                        {shouldShowSection('usage-analytics') && (
                            <section
                                id="usage-analytics"
                                data-section="usage-analytics" // ADDED: data-section attribute
                                className="invite-manager-section"
                            >
                                <h2 className="invite-manager-section-title">Usage Analytics</h2>
                                <div className="invite-manager-card">
                                    <h3 className="invite-manager-card-title">Usage Statistics</h3>

                                    <div className="invite-manager-stats-grid">
                                        <div className="invite-manager-stat-card">
                                            <div className="invite-manager-stat-label">Total Codes</div>
                                            <div className="invite-manager-stat-value">{invites.length}</div>
                                        </div>
                                        <div className="invite-manager-stat-card">
                                            <div className="invite-manager-stat-label">Active Codes</div>
                                            <div className="invite-manager-stat-value">
                                                {invites.filter(i => !i.used && i.expires_at >= new Date()).length}
                                            </div>
                                        </div>
                                        <div className="invite-manager-stat-card">
                                            <div className="invite-manager-stat-label">Usage Rate</div>
                                            <div className="invite-manager-stat-value">
                                                {invites.length > 0 ?
                                                    Math.round((invites.filter(i => i.used).length / invites.length) * 100) : 0
                                                }%
                                            </div>
                                        </div>
                                        <div className="invite-manager-stat-card">
                                            <div className="invite-manager-stat-label">Expired Codes</div>
                                            <div className="invite-manager-stat-value">
                                                {invites.filter(i => i.expires_at < new Date() && !i.used).length}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="invite-manager-chart-filters">
                                        <select className="invite-manager-filter-select" id="invite-manager-chart-timeframe">
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                        <select className="invite-manager-filter-select" id="invite-manager-chart-user-type">
                                            <option value="all">All Users</option>
                                            <option value="teacher">Teachers</option>
                                            <option value="student">Students</option>
                                        </select>
                                    </div>

                                    <div className="invite-manager-chart-container">
                                        <canvas id="invite-manager-analytics-chart"></canvas>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* No Results Message */}
                        {searchTerm && !shouldShowSection('generate-codes') && !shouldShowSection('view-invites') && !shouldShowSection('usage-analytics') && (
                            <div className="invite-manager-no-search-results">
                                <i data-lucide="search-x"></i>
                                <h3>No results found</h3>
                                <p>No invite manager items match your search for "<strong>{searchTerm}</strong>"</p>
                            </div>
                        )}
                    </main>
                </div>

                {/* Modal */}
                {selectedInvite && (
                    <div className="invite-manager-modal-overlay active" onClick={closeModal}>
                        <div className="invite-manager-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="invite-manager-modal-header">
                                <h3 className="invite-manager-modal-title">Manage Invite Code: {selectedInvite.code}</h3>
                                <button className="invite-manager-modal-close" onClick={closeModal}>
                                    <i data-lucide="x"></i>
                                </button>
                            </div>
                            <div className="invite-manager-modal-body">
                                <div className="invite-manager-modal-info">
                                    <div className="invite-manager-modal-info-item">
                                        <span className="invite-manager-modal-info-label">User Type:</span>
                                        <span className="invite-manager-modal-info-value">{selectedInvite.user_type}</span>
                                    </div>
                                    <div className="invite-manager-modal-info-item">
                                        <span className="invite-manager-modal-info-label">Status:</span>
                                        <span className={`invite-manager-modal-info-value ${selectedInvite.used ? 'invite-manager-used' : 'invite-manager-unused'}`}>
                                            {selectedInvite.used ? 'Used' : 'Active'}
                                        </span>
                                    </div>
                                    <div className="invite-manager-modal-info-item">
                                        <span className="invite-manager-modal-info-label">Expires:</span>
                                        <span className="invite-manager-modal-info-value">{formatDate(selectedInvite.expires_at)}</span>
                                    </div>
                                </div>
                                <div className="invite-manager-modal-actions">
                                    <button className="invite-manager-modal-btn" onClick={regenerateCode}>
                                        <i data-lucide="refresh-cw"></i>
                                        Regenerate Code
                                    </button>
                                    <button className="invite-manager-modal-btn" onClick={viewDetails}>
                                        <i data-lucide="eye"></i>
                                        View Full Details
                                    </button>
                                    <button className="invite-manager-modal-btn" onClick={sendReminder}>
                                        <i data-lucide="mail"></i>
                                        Send Reminder (Coming Soon)
                                    </button>
                                    <button className="invite-manager-modal-btn invite-manager-modal-btn-danger" onClick={deleteCode}>
                                        <i data-lucide="trash-2"></i>
                                        Delete Code
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    export default InviteManager;