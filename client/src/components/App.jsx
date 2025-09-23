import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Login from './auth/Login';
import SignupSelection from './auth/SignupSelection';
import SignupTeacher from './auth/SignupTeacher';
import SignupStudent from './auth/SignupStudent';
import VerifyAccount from './auth/VerifyAccount';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import DashboardHome from './dashboard/DashboardHome';
import SidebarNav from './components/SidebarNav';
import Header from './components/Header';
import '../style/auth.css';
import '../style/sidebar.css';
import '../style/header.css';
import '../style/dashboard.css';

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <Router>
            <div className="app">
                {/* SidebarNav is rendered here to be available across all authenticated routes */}
                <SidebarNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                
                {/* Header is rendered here to be available across all authenticated routes */}
                <Header 
                    sidebarOpen={sidebarOpen} 
                    onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
                    pageTitle="Dashboard"
                />

                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LoginWrapper />} />
                    <Route path="/signup-selection" element={<SignupSelectionWrapper />} />
                    <Route path="/signup-teacher" element={<SignupTeacherWrapper />} />
                    <Route path="/signup-student" element={<SignupStudentWrapper />} />
                    <Route path="/verify-account" element={<VerifyAccountWrapper />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    
                    {/* Protected Dashboard Routes */}
                    <Route path="/dashboard" element={<DashboardHome />} />
                    <Route path="/dashboard/analytics" element={<div>Analytics Page</div>} />
                    <Route path="/dashboard/grades" element={<div>Grades Page</div>} />
                    <Route path="/dashboard/invite-manager" element={<div>Invite Manager Page</div>} />
                    <Route path="/dashboard/lectures" element={<div>Lectures Page</div>} />
                    <Route path="/dashboard/subjects" element={<div>Subjects Page</div>} />
                    <Route path="/dashboard/user-management" element={<div>User Management Page</div>} />
                    <Route path="/dashboard/profile" element={<div>Profile Page</div>} />
                    <Route path="/dashboard/profile/edit" element={<div>Edit Profile Page</div>} />
                    <Route path="/dashboard/settings" element={<div>Settings Page</div>} />
                    <Route path="/dashboard/privacy" element={<div>Privacy Page</div>} />
                </Routes>
            </div>
        </Router>
    );
}

// Wrapper components
function LoginWrapper() {
    const navigate = useNavigate();
    return (
        <Login
            onSignupClick={() => navigate('/signup-selection')}
        />
    );
}

function SignupSelectionWrapper() {
    const navigate = useNavigate();
    return (
        <SignupSelection
            onTeacherSignup={() => navigate('/signup-teacher')}
            onStudentSignup={() => navigate('/signup-student')}
            onLoginClick={() => navigate('/')}
        />
    );
}

function SignupTeacherWrapper() {
    const navigate = useNavigate();
    return (
        <SignupTeacher
            onBackClick={() => navigate('/signup-selection')}
            onSuccess={() => {
                setTimeout(() => navigate('/dashboard'), 2000);
            }}
        />
    );
}

function SignupStudentWrapper() {
    const navigate = useNavigate();
    return (
        <SignupStudent
            onBackClick={() => navigate('/signup-selection')}
            onSuccess={() => {
                setTimeout(() => navigate('/dashboard'), 2000);
            }}
        />
    );
}

function VerifyAccountWrapper() {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        userType = 'student',
        email = '',
        phone = '',
        verificationCode = '',
        fromLogin = false
    } = location.state || {};

    return (
        <VerifyAccount
            userType={userType}
            email={email}
            phone={phone}
            verificationCode={verificationCode}
            fromLogin={fromLogin}
            onBackClick={() => navigate('/')}
            onSuccess={() => navigate('/dashboard')}
        />
    );
}

export default App;