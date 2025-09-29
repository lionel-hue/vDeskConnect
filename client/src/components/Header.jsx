// components/Header.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearch } from './SearchManager';
import Modal, { useModal } from './Modal';
import "../style/header.css"

const Header = ({ sidebarOpen, onSidebarToggle, pageTitle = "Dashboard" }) => {
    const [headerSearchActive, setHeaderSearchActive] = useState(false);
    const { searchTerm, setSearchTerm, setIsSearching } = useSearch();
    const navigate = useNavigate();
    const location = useLocation();
    
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

    const handleAdminAction = async (action) => {
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
                // Do nothing for 'name' selection
                break;
        }
    };

    // Close mobile search when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (headerSearchActive && window.innerWidth <= 640) {
                const searchContainer = document.querySelector(".header-search-container");
                if (searchContainer && !searchContainer.contains(event.target)) {
                    setHeaderSearchActive(false);
                    clearSearch();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [headerSearchActive]);

    // Clear search when navigating away from dashboard
    useEffect(() => {
        if (!location.pathname.includes('/dashboard')) {
            clearSearch();
        }
    }, [location.pathname]);

    return (
        <>
            <header className="header">
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
                    <span className="admin-label">Admin</span>
                    <select 
                        className="admin-select"
                        onChange={(e) => handleAdminAction(e.target.value)}
                        defaultValue="name"
                    >
                        <option value="name">Name</option>
                        <option value="change-password">Change Password</option>
                        <option value="logout">Logout</option>
                    </select>
                </div>
            </header>
            <div className="header-divider"></div>

            {/* Add the Modal component here */}
            <Modal modal={modal} setModal={setModal} />
        </>
    );
};

export default Header;