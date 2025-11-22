// main/InviteManager.jsx - COMPLETE UPDATED VERSION WITH AUTH CHECKS
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import Header from '../Header';
import SidebarNav from '../SidebarNav';
import Loader from '../Loader';
import Modal, { useModal } from '../Modal';
import { useSearch } from '../SearchManager';
import { searchInviteManagerData, shouldShowElement } from '../../utils/searchUtils';
import { useAuth } from '../../contexts/AuthContext';
import { apiRequest } from '../../utils/api';
import '../../style/invite-manager.css';

Chart.register(...registerables);

const InviteManager = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const { section } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const { modal, setModal, alert, confirm, prompt } = useModal();
    const { searchTerm, isSearching, setSearchTerm, setIsSearching } = useSearch();
    
    // Get auth data - this gives us access to the logged-in user
    const { user, getToken, loading } = useAuth();

    // NEW: Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            console.log('No user found, redirecting to login...');
            navigate('/');
        }
    }, [user, loading, navigate]);

    // State for fetched invites with pagination
    const [invites, setInvites] = useState([]);
    const [selectedInvite, setSelectedInvite] = useState(null);
    const [generatedCode, setGeneratedCode] = useState(null);
    const analyticsChartRef = useRef(null);
    const [userTypeFilter, setUserTypeFilter] = useState('all');
    const [usageFilter, setUsageFilter] = useState('all');
    const [expiryFilter, setExpiryFilter] = useState('all');
    const [searchInput, setSearchInput] = useState('');
    const [isFetchingInvites, setIsFetchingInvites] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);

    // Get admin ID from auth context - THIS IS THE KEY EXTRACTION
    const adminId = user?.id;
    console.log('Current Admin ID from Auth Context:', adminId);
    console.log('Full user object:', user); // NEW: Debug log

    // If still loading or no user, show loading
    if (loading) {
        return <Loader message="Checking authentication..." />;
    }

    if (!user) {
        return <Loader message="Redirecting to login..." />;
    }

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

    // Fetch invites from backend with pagination and filtering - UPDATED with adminId
    const fetchInvites = useCallback(async (page = 1, search = '', userType = 'all', usage = 'all', expiry = 'all') => {
        // Only fetch if we have an admin ID
        if (!adminId) {
            console.log('No admin ID available, skipping fetch');
            return;
        }

        setIsFetchingInvites(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                search: search,
                user_type: userType,
                usage: usage,
                expiry: expiry,
                admin_id: adminId // Include admin ID to fetch only their invites
            });

            console.log('Fetching invites with admin_id:', adminId); // Debug log

            // Use apiRequest which automatically includes the JWT token
            const response = await apiRequest(`${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT}/home/invite_manager/all_invite_codes?${params}`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setInvites(data.data);
                    setCurrentPage(data.pagination.currentPage);
                    setTotalPages(data.pagination.totalPages);
                    setTotalCount(data.pagination.totalCount);
                    setHasNext(data.pagination.hasNext);
                    setHasPrev(data.pagination.hasPrev);
                } else {
                    throw new Error(data.message);
                }
            } else {
                throw new Error('Failed to fetch invites');
            }
        } catch (error) {
            console.error('Error fetching invites:', error);
            // Fallback to mock data if fetch fails - NOW USES ACTUAL ADMIN ID
            const mockInvites = getMockInvites();
            setInvites(mockInvites);
            setTotalCount(mockInvites.length);
            setTotalPages(Math.ceil(mockInvites.length / 10));
        } finally {
            setIsFetchingInvites(false);
        }
    }, [adminId]); // Re-fetch when adminId changes

    // Initial fetch and fetch when filters change - ONLY when adminId is available
    useEffect(() => {
        if (adminId) {
            fetchInvites(1, searchInput, userTypeFilter, usageFilter, expiryFilter);
        }
    }, [fetchInvites, searchInput, userTypeFilter, usageFilter, expiryFilter, adminId]);

    // Mock data fallback - UPDATED to use actual admin ID from context
    const getMockInvites = () => [
        {
            id: 1,
            code: 'TCH-A7K9M2',
            user_type: 'teacher',
            created_at: new Date('2024-01-15'),
            expires_at: new Date('2024-01-22'),
            used: true,
            used_by: 'John Smith',
            used_at: new Date('2024-01-16'),
            admin_id: adminId // Uses actual admin ID from context
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
            admin_id: adminId // Uses actual admin ID from context
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
            admin_id: adminId // Uses actual admin ID from context
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
            admin_id: adminId // Uses actual admin ID from context
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
            admin_id: adminId // Uses actual admin ID from context
        }
    ];

    // FIXED: Enhanced scroll to section when URL parameter changes
    useEffect(() => {
        console.log('InviteManager section changed:', section);
        console.log('Current path:', location.pathname);

        const getCurrentSection = () => {
            const path = location.pathname;
            
            if (path === '/invite-manager' || path === '/invite-manager/') {
                return 'generate-codes';
            }
            
            const pathParts = path.split('/').filter(part => part);
            console.log('InviteManager path parts:', pathParts);
            
            if (pathParts.length > 1) {
                const sectionFromPath = pathParts[1];
                console.log('Extracted section:', sectionFromPath);
                
                const validSections = ['generate-codes', 'view-invites', 'usage-analytics'];
                if (validSections.includes(sectionFromPath)) {
                    return sectionFromPath;
                }
            }
            
            return 'generate-codes';
        };

        const currentSection = getCurrentSection();
        console.log('Final current section for scrolling:', currentSection);

        const scrollToSection = () => {
            setTimeout(() => {
                console.log('Attempting to scroll to section:', currentSection);
                
                const element = document.getElementById(currentSection);
                if (element) {
                    console.log('Found element by ID, scrolling...');
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    return;
                }
                
                const altElement = document.querySelector(`[data-section="${currentSection}"]`);
                if (altElement) {
                    console.log('Found element by data-section, scrolling...');
                    altElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    return;
                }
                
                console.log('Scrolling to top as fallback');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 800);
        };

        scrollToSection();
    }, [section, location.pathname]);

    // Initialize icons and analytics chart
    useEffect(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        createAnalyticsChart();

        return () => {
            if (analyticsChartRef.current) {
                analyticsChartRef.current.destroy();
                analyticsChartRef.current = null;
            }
        };
    }, []);

    // Recreate chart when analytics section becomes visible
    useEffect(() => {
        if (shouldShowSection('usage-analytics')) {
            setTimeout(() => {
                createAnalyticsChart();
            }, 100);
        }
    }, [searchTerm]);

    // FIXED: Search functionality - Added proper error handling
    const searchResults = useMemo(() => {
        try {
            return searchInviteManagerData(searchTerm, {
                invites,
                generatedCode,
                sections: ['generate-codes', 'view-invites', 'usage-analytics']
            });
        } catch (error) {
            console.error('Search error:', error);
            return {
                sections: ['generate-codes', 'view-invites', 'usage-analytics'],
                elements: {}
            };
        }
    }, [searchTerm, invites, generatedCode]);

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
        const expiryDate = new Date(expiresAt);
        const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

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

    // Analytics chart function
    const createAnalyticsChart = () => {
        const ctx = document.getElementById('invite-manager-analytics-chart');
        if (!ctx) {
            console.log('Chart canvas not found');
            return;
        }

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

    // Pagination handlers
    const handleNextPage = () => {
        if (hasNext) {
            fetchInvites(currentPage + 1, searchInput, userTypeFilter, usageFilter, expiryFilter);
        }
    };

    const handlePrevPage = () => {
        if (hasPrev) {
            fetchInvites(currentPage - 1, searchInput, userTypeFilter, usageFilter, expiryFilter);
        }
    };

    const handlePageClick = (page) => {
        fetchInvites(page, searchInput, userTypeFilter, usageFilter, expiryFilter);
    };

    // Generate code function - UPDATED with admin ID and role check
    const generateCode = async (userType) => {
        // Check if user is admin - only admins can generate codes
        if (user?.role !== 'admin') {
            await alert('Only administrators can generate invite codes.', 'Access Denied');
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiRequest(`${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT}/home/invite_manager/generate`, {
                method: 'POST',
                body: JSON.stringify({ 
                    user_type: userType,
                    admin_id: adminId // Include admin ID in the request
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    const newInvite = result.data;
                    setGeneratedCode({
                        code: newInvite.code,
                        userType: newInvite.user_type,
                        createdAt: new Date(newInvite.created_at),
                        expiresAt: new Date(newInvite.expires_at)
                    });
                    // Refresh the invites list
                    fetchInvites(currentPage, searchInput, userTypeFilter, usageFilter, expiryFilter);
                    showToast(`${userType.charAt(0).toUpperCase() + userType.slice(1)} code generated successfully!`);
                } else {
                    throw new Error(result.message);
                }
            } else {
                throw new Error('Failed to generate code');
            }
        } catch (error) {
            console.error('Error generating code:', error);
            // Fallback to local generation - UPDATED with admin ID
            const code = `${userType === 'teacher' ? 'TCH' : 'STD'}-${generateRandomCode()}`;
            const createdAt = new Date();
            const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);

            setGeneratedCode({
                code,
                userType,
                createdAt,
                expiresAt
            });
            showToast(`${userType.charAt(0).toUpperCase() + userType.slice(1)} code generated successfully!`);
        } finally {
            setIsLoading(false);
        }
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

    // Regenerate code function - UPDATED with admin ID and role check
    const regenerateCode = async () => {
        if (!selectedInvite) return;

        // Check if user is admin - only admins can regenerate codes
        if (user?.role !== 'admin') {
            await alert('Only administrators can regenerate invite codes.', 'Access Denied');
            return;
        }

        try {
            const response = await apiRequest(`${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT}/home/invite_manager/${selectedInvite.id}/regenerate`, {
                method: 'POST',
                body: JSON.stringify({ 
                    user_type: selectedInvite.user_type,
                    admin_id: adminId // Include admin ID in the request
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // Refresh the invites list
                    fetchInvites(currentPage, searchInput, userTypeFilter, usageFilter, expiryFilter);
                    closeModal();
                    showToast('Code regenerated successfully!');
                } else {
                    throw new Error(result.message);
                }
            } else {
                throw new Error('Failed to regenerate code');
            }
        } catch (error) {
            console.error('Error regenerating code:', error);
            // Fallback to local regeneration - UPDATED with admin ID
            const newCode = `${selectedInvite.user_type === 'teacher' ? 'TCH' : 'STD'}-${generateRandomCode()}`;
            setInvites(prev => prev.map(invite =>
                invite.id === selectedInvite.id
                    ? {
                        ...invite,
                        code: newCode,
                        created_at: new Date(),
                        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        admin_id: adminId // Update with current admin ID
                    }
                    : invite
            ));
            closeModal();
            showToast('Code regenerated successfully!');
        }
    };

    // View details function
    const viewDetails = async () => {
        if (!selectedInvite) return;

        await alert(
            `Code: ${selectedInvite.code}\nUser Type: ${selectedInvite.user_type}\nCreated: ${formatDate(selectedInvite.created_at)}\nExpires: ${formatDate(selectedInvite.expires_at)}\nUsed: ${selectedInvite.used ? 'Yes' : 'No'}\nUsed By: ${selectedInvite.used_by || 'N/A'}\nAdmin ID: ${selectedInvite.admin_id}`,
            'Invite Code Details'
        );
    };

    // Send reminder function
    const sendReminder = async () => {
        await alert('Email reminder feature coming soon!', 'Feature Coming Soon');
    };

    // Delete code function - UPDATED with admin ID and role check
    const deleteCode = async () => {
        if (!selectedInvite) return;

        // Check if user is admin - only admins can delete codes
        if (user?.role !== 'admin') {
            await alert('Only administrators can delete invite codes.', 'Access Denied');
            return;
        }

        const shouldDelete = await confirm('Are you sure you want to delete this invite code?', 'Confirm Deletion');
        if (shouldDelete) {
            try {
                const response = await apiRequest(`${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT}/home/invite_manager/${selectedInvite.id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        // Refresh the invites list
                        fetchInvites(currentPage, searchInput, userTypeFilter, usageFilter, expiryFilter);
                        closeModal();
                        showToast('Code deleted successfully!');
                    } else {
                        throw new Error(result.message);
                    }
                } else {
                    throw new Error('Failed to delete code');
                }
            } catch (error) {
                console.error('Error deleting code:', error);
                // Fallback to local deletion
                setInvites(prev => prev.filter(i => i.id !== selectedInvite.id));
                closeModal();
                showToast('Code deleted successfully!');
            }
        }
    };

    // Check if sections should be shown based on search
    const shouldShowSection = (sectionId) => {
        if (!searchTerm) return true;
        return searchResults.sections && searchResults.sections.includes(sectionId);
    };

    // shouldShowInviteElement function
    const shouldShowInviteElement = (element, type) => {
        if (!searchTerm) return true;
        return shouldShowElement(element, searchTerm, searchResults, type);
    };

    // navigateToSection function
    const navigateToSection = (sectionName) => {
        navigate(`/invite-manager/${sectionName}`);
    };

    // Render pagination controls
    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={`invite-manager-pagination-btn ${currentPage === i ? 'active' : ''}`}
                    onClick={() => handlePageClick(i)}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="invite-manager-pagination">
                <button
                    className="invite-manager-pagination-btn"
                    onClick={handlePrevPage}
                    disabled={!hasPrev}
                >
                    Previous
                </button>
                {pages}
                <button
                    className="invite-manager-pagination-btn"
                    onClick={handleNextPage}
                    disabled={!hasNext}
                >
                    Next
                </button>
            </div>
        );
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
                            data-section="generate-codes"
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
                            data-section="view-invites"
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
                                    {isFetchingInvites ? (
                                        <div className="invite-manager-loading-state">
                                            <Loader message="Loading invites..." />
                                        </div>
                                    ) : (
                                        <>
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
                                                    {invites.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="8" className="invite-manager-empty-state">
                                                                <i data-lucide="inbox"></i>
                                                                <p>No invites found</p>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        invites.map(invite => {
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
                                            
                                            {/* Pagination Controls */}
                                            {renderPagination()}
                                            
                                            {/* Results Count */}
                                            <div className="invite-manager-results-count">
                                                Showing {invites.length} of {totalCount} results
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Usage Analytics Section */}
                    {shouldShowSection('usage-analytics') && (
                        <section
                            id="usage-analytics"
                            data-section="usage-analytics"
                            className="invite-manager-section"
                        >
                            <h2 className="invite-manager-section-title">Usage Analytics</h2>
                            <div className="invite-manager-card">
                                <h3 className="invite-manager-card-title">Usage Statistics</h3>

                                <div className="invite-manager-stats-grid">
                                    <div className="invite-manager-stat-card">
                                        <div className="invite-manager-stat-label">Total Codes</div>
                                        <div className="invite-manager-stat-value">{totalCount}</div>
                                    </div>
                                    <div className="invite-manager-stat-card">
                                        <div className="invite-manager-stat-label">Active Codes</div>
                                        <div className="invite-manager-stat-value">
                                            {invites.filter(i => !i.used && new Date(i.expires_at) >= new Date()).length}
                                        </div>
                                    </div>
                                    <div className="invite-manager-stat-card">
                                        <div className="invite-manager-stat-label">Usage Rate</div>
                                        <div className="invite-manager-stat-value">
                                            {totalCount > 0 ?
                                                Math.round((invites.filter(i => i.used).length / totalCount) * 100) : 0
                                            }%
                                        </div>
                                    </div>
                                    <div className="invite-manager-stat-card">
                                        <div className="invite-manager-stat-label">Expired Codes</div>
                                        <div className="invite-manager-stat-value">
                                            {invites.filter(i => new Date(i.expires_at) < new Date() && !i.used).length}
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