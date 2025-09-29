// components/Header.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useModal } from './Modal';
import "../style/header.css"

const Header = ({ sidebarOpen, onSidebarToggle, pageTitle = "Dashboard" }) => {
    const [headerSearchActive, setHeaderSearchActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    
    const { confirm } = useModal();

    const performDashboardSearch = (term) => {
        // Implement dashboard search functionality
        console.log('Searching for:', term);
        // This would filter dashboard content based on search term
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        performDashboardSearch(value);
    };

    const toggleMobileSearch = () => {
        if (window.innerWidth <= 640) {
            setHeaderSearchActive(!headerSearchActive);
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
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [headerSearchActive]);

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
                            <i data-lucide="search"></i>
                        </button>
                        <input 
                            type="text" 
                            id="header-search-input"
                            className={`header-search-input ${headerSearchActive ? 'mobile-visible' : ''}`}
                            placeholder="Search dashboard..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
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
        </>
    );
};

export default Header;