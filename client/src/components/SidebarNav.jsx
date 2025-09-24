import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';


const SidebarNav = ({ isOpen, onClose }) => {
    const [searchActive, setSearchActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const sidebarRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Close sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Close sidebar on escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const openSearch = () => {
        setSearchActive(true);
    };

    const closeSearch = () => {
        setSearchActive(false);
        setSearchTerm('');
    };

    const filterSidebarItems = (term) => {
        // This would filter the sidebar items based on search term
        // Implementation would depend on your menu structure
        console.log('Search term:', term);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        filterSidebarItems(value);
    };

    const handleSelectChange = (e, section) => {
        const value = e.target.value;
        
        // Handle navigation based on the selected value
        switch (section) {
            case 'profile':
                handleProfileAction(value);
                break;
            case 'analytics':
                navigate('/dashboard/analytics');
                break;
            case 'dashboard':
                navigate('/dashboard');
                break;
            case 'grades':
                navigate('/dashboard/grades');
                break;
            case 'invite-manager':
                navigate('/dashboard/invite-manager');
                break;
            case 'lectures':
                navigate('/dashboard/lectures');
                break;
            case 'subjects':
                navigate('/dashboard/subjects');
                break;
            case 'user-management':
                navigate('/dashboard/user-management');
                break;
            default:
                console.log('Navigating to:', value);
        }

        // Close sidebar on mobile after selection
        if (window.innerWidth < 1024) {
            onClose();
        }
    };

    const handleProfileAction = (action) => {
        switch (action) {
            case 'edit-profile':
                navigate('/dashboard/profile/edit');
                break;
            case 'account-settings':
                navigate('/dashboard/settings');
                break;
            case 'privacy':
                navigate('/dashboard/privacy');
                break;
            default:
                navigate('/dashboard/profile');
        }
    };

    const handleAdminAction = (action) => {
        switch (action) {
            case 'change-password':
                console.log('Change password clicked');
                // Implement change password functionality
                break;
            case 'logout':
                if (confirm('Are you sure you want to logout?')) {
                    // Implement logout functionality
                    console.log('Logging out...');
                }
                break;
            default:
                console.log('Admin action:', action);
        }
    };

    return (
        <>
            {/* Overlay */}
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
            
            {/* Sidebar */}
            <div ref={sidebarRef} className={`sidebar ${isOpen ? 'active' : ''}`}>
                <div className="sidebar-header">
                    <button className="sidebar-menu-btn" onClick={onClose}>
                        <i data-lucide="menu"></i>
                    </button>
                    <div className="sidebar-title">vDeskconnect</div>
                    <button 
                        className="search-btn" 
                        onClick={searchActive ? closeSearch : openSearch}
                    >
                        <i data-lucide={searchActive ? "x" : "search"}></i>
                    </button>
                    <div className={`search-container ${searchActive ? '' : 'hidden'}`}>
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Search menu..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
                
                <div className="sidebar-divider"></div>
                
                <div className="sidebar-content">
                    {/* Profile Section */}
                    <div className="sidebar-item profile-section">
                        <div className="profile-container">
                            <div className="profile-image">
                                <i data-lucide="user"></i>
                            </div>
                            <select 
                                className="sidebar-select profile-select"
                                onChange={(e) => handleSelectChange(e, 'profile')}
                                defaultValue="profile"
                            >
                                <option value="profile">Profile</option>
                                <option value="edit-profile">Edit Profile</option>
                                <option value="account-settings">Account Settings</option>
                                <option value="privacy">Privacy Settings</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Analytics Section */}
                    <div className="sidebar-item">
                        <div className="sidebar-item-container">
                            <i data-lucide="bar-chart-3" className="sidebar-icon"></i>
                            <select 
                                className="sidebar-select"
                                onChange={(e) => handleSelectChange(e, 'analytics')}
                                defaultValue="analytics"
                            >
                                <option value="analytics">Analytics</option>
                                <option value="platform-usage">Platform Usage</option>
                                <option value="export-data">Export Data</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Dashboard Section */}
                    <div className="sidebar-item">
                        <div className="sidebar-item-container">
                            <i data-lucide="layout-dashboard" className="sidebar-icon"></i>
                            <select 
                                className="sidebar-select"
                                onChange={(e) => handleSelectChange(e, 'dashboard')}
                                defaultValue="dashboard"
                            >
                                <option value="dashboard">Dashboard</option>
                                <option value="overview">Overview</option>
                                <option value="activity">Activity</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Grades Section */}
                    <div className="sidebar-item">
                        <div className="sidebar-item-container">
                            <i data-lucide="graduation-cap" className="sidebar-icon"></i>
                            <select 
                                className="sidebar-select"
                                onChange={(e) => handleSelectChange(e, 'grades')}
                                defaultValue="grades"
                            >
                                <option value="grades">Grades</option>
                                <option value="grade-book">Grade Book</option>
                                <option value="grade-reports">Grade Reports</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Invite Manager Section */}
                    <div className="sidebar-item">
                        <div className="sidebar-item-container">
                            <i data-lucide="user-plus" className="sidebar-icon"></i>
                            <select 
                                className="sidebar-select"
                                onChange={(e) => handleSelectChange(e, 'invite-manager')}
                                defaultValue="invite-manager"
                            >
                                <option value="invite-manager">Invite Manager</option>
                                <option value="generate-codes">Generate Codes</option>
                                <option value="view-invites">View Invites</option>
                                <option value="usage-analytics">Usage Analytics</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Lectures Section */}
                    <div className="sidebar-item">
                        <div className="sidebar-item-container">
                            <i data-lucide="book-open" className="sidebar-icon"></i>
                            <select 
                                className="sidebar-select"
                                onChange={(e) => handleSelectChange(e, 'lectures')}
                                defaultValue="lectures"
                            >
                                <option value="lectures">Lectures</option>
                                <option value="create-lecture">Create Lecture</option>
                                <option value="manage-lectures">Manage Lectures</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Subjects Section */}
                    <div className="sidebar-item">
                        <div className="sidebar-item-container">
                            <i data-lucide="book" className="sidebar-icon"></i>
                            <select 
                                className="sidebar-select"
                                onChange={(e) => handleSelectChange(e, 'subjects')}
                                defaultValue="subjects"
                            >
                                <option value="subjects">Subjects</option>
                                <option value="manage-subjects">Manage Subjects</option>
                                <option value="subject-assignments">Subject Assignments</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* User Management Section */}
                    <div className="sidebar-item">
                        <div className="sidebar-item-container">
                            <i data-lucide="users" className="sidebar-icon"></i>
                            <select 
                                className="sidebar-select"
                                onChange={(e) => handleSelectChange(e, 'user-management')}
                                defaultValue="user-management"
                            >
                                <option value="user-management">User Management</option>
                                <option value="students">Students</option>
                                <option value="student-overview">- Overview</option>
                                <option value="student-progress">- Student Progress</option>
                                <option value="student-metrics">- Performance Metrics</option>
                                <option value="teachers">Teachers</option>
                                <option value="teacher-overview">- Overview</option>
                                <option value="teacher-activities">- Teacher's Activities</option>
                                <option value="teacher-metrics">- Performance Metrics</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SidebarNav;