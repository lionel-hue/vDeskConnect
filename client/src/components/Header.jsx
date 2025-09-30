// components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearch } from './SearchManager';
import Modal, { useModal } from './Modal';
import "../style/header.css"

const Header = ({ sidebarOpen, onSidebarToggle, pageTitle = "Dashboard" }) => {
    const [headerSearchActive, setHeaderSearchActive] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const { searchTerm, setSearchTerm, setIsSearching } = useSearch();
    const navigate = useNavigate();
    const location = useLocation();
    const profileDropdownRef = useRef(null);
    
    const { modal, setModal, confirm } = useModal();

    const performDashboardSearch = (term) => {
        setSearchTerm(term);
        setIsSearching(!!term.trim());
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        performDashboardSearch(value);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setIsSearching(false);
    };

    const toggleMobileSearch = () => {
        if (window.innerWidth <= 640) {
            setHeaderSearchActive(!headerSearchActive);
            if (headerSearchActive) {
                clearSearch();
            }
        } else {
            // On desktop, just focus the input
            const searchInput = document.getElementById("header-search-input");
            if (searchInput) searchInput.focus();
        }
    };

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    const handleProfileAction = async (action) => {
        setIsProfileDropdownOpen(false);
        
        switch (action) {
            case 'change-password':
                navigate('/dashboard/settings');
                break;
            case 'logout':
                const shouldLogout = await confirm('Are you sure you want to logout?', 'Confirm Logout');
                if (shouldLogout) {
                    // Implement logout logic
                    console.log('Logging out...');
                    navigate('/');
                }
                break;
            default:
                // Do nothing
                break;
        }
    };

    // Close mobile search when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (headerSearchActive && window.innerWidth <= 640) {
                const searchContainer = document.querySelector(".header .header-search-container");
                if (searchContainer && !searchContainer.contains(event.target)) {
                    setHeaderSearchActive(false);
                    clearSearch();
                }
            }
            
            // Close profile dropdown when clicking outside
            if (isProfileDropdownOpen && profileDropdownRef.current && 
                !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [headerSearchActive, isProfileDropdownOpen]);

    // Clear search when navigating away from dashboard
    useEffect(() => {
        if (!location.pathname.includes('/dashboard')) {
            clearSearch();
        }
    }, [location.pathname]);

    // Close dropdown on escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && isProfileDropdownOpen) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isProfileDropdownOpen]);

    return (
        <>
            <header className={`header ${headerSearchActive ? 'search-active' : ''}`}>
                <div className="header-left">
                    <button className="sidebar-menu-btn" onClick={onSidebarToggle}>
                        <i data-lucide="menu"></i>
                    </button>
                    <h1 className="header-title">{pageTitle}</h1>
                </div>
                <div className="header-center">
                    <div className="header-search-container">
                        <button 
                            className="header-search-btn" 
                            onClick={toggleMobileSearch}
                        >
                            <i data-lucide={headerSearchActive ? "x" : "search"}></i>
                        </button>
                        <input 
                            type="text" 
                            id="header-search-input"
                            className={`header-search-input ${headerSearchActive ? 'mobile-visible' : ''}`}
                            placeholder="Search dashboard..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        {searchTerm && (
                            <button 
                                className="header-clear-search"
                                onClick={clearSearch}
                            >
                                <i data-lucide="x-circle"></i>
                            </button>
                        )}
                    </div>
                </div>
                <div className="header-right">
                    {/* Profile Dropdown Container */}
                    <div className="profile-dropdown-container" ref={profileDropdownRef}>
                        <button 
                            className="profile-dropdown-trigger"
                            onClick={toggleProfileDropdown}
                            title="Profile Menu"
                        >
                            <i data-lucide="user" className="profile-icon"></i>
                            <span className="admin-label">Admin</span>
                            <i data-lucide="chevron-down" className="dropdown-chevron"></i>
                        </button>
                        
                        {/* Profile Dropdown Menu */}
                        {isProfileDropdownOpen && (
                            <div className="profile-dropdown-menu">
                                <div className="profile-dropdown-header">
                                    <div className="user-avatar">
                                        <i data-lucide="user"></i>
                                    </div>
                                    <div className="user-info">
                                        <div className="user-name">User Name</div>
                                        <div className="user-role">Admin</div>
                                    </div>
                                </div>
                                <div className="profile-dropdown-divider"></div>
                                <button 
                                    className="profile-dropdown-item"
                                    onClick={() => handleProfileAction('change-password')}
                                >
                                    <i data-lucide="key"></i>
                                    <span>Change Password</span>
                                </button>
                                <button 
                                    className="profile-dropdown-item logout-item"
                                    onClick={() => handleProfileAction('logout')}
                                >
                                    <i data-lucide="log-out"></i>
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <div className="header-divider"></div>

            {/* Add the Modal component here */}
            <Modal modal={modal} setModal={setModal} />
        </>
    );
};

export default Header;